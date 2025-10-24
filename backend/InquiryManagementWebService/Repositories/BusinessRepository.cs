using Dapper;
using InquiryManagementWebService.Models;
using Microsoft.Data.SqlClient;

namespace InquiryManagementWebService.Repositories
{

    public class BusinessRepository : IBusinessRepository
    {
        private readonly string _connectionString;


        public BusinessRepository(IConfiguration configuration)
        {
            _connectionString = configuration["Connnectionstrings:MyConnection"];

        }

        public async Task<IEnumerable<BdBusinessSummary>> GetBdBusinessOverviewAsync(BdBusinessSummaryRequest request)
        {
            var query = @"
WITH QuotationsWithReg AS
(
    SELECT 
        i.QUOTNO,
        i.QUOTEQNO,
        r1.TRN2REFNO,
        i.QuotDate,
        i.QUOTENQDATE,
        i.QUOTAMT,
        i.QUOTDISCOUNTAXAMT,
        i.QUOT_SALESPERSONCD,
        bd.CODEDESC AS BDName,
        i.QUOTPARTYCD,
        c.CUSTNAME AS ClientName,
        i.QUOTSEMPLECHARGE,
        i.QUOTMISC,
        i.QUOTHCC,
        i.QUOTUSD,         
        i.USDRATE,         
        r1.TRN2TESTRATE,
        r2.TRN1DATE,
        r2.TRN1CANCEL,
        SUBSTRING(i.QUOTNO, 11, 3) AS Vertical,
        ROW_NUMBER() OVER (PARTITION BY i.QUOTNO ORDER BY r2.TRN1DATE, r1.TRN2REFNO) AS RegRank
    FROM OQUOTMST i
    INNER JOIN OCUSTMST c 
        ON i.QUOTPARTYCD = c.CUSTACCCODE
    INNER JOIN OCODEMST bd 
        ON bd.CODECD = i.QUOT_SALESPERSONCD AND bd.CODETYPE = 'SP'
    LEFT JOIN TRN205 r1 
        ON r1.TRN2QOTNO = i.QUOTNO
    LEFT JOIN TRN105 r2 
        ON r2.TRN1REFNO = r1.TRN2REFNO
    WHERE r1.TRN2REFNO IS NOT NULL
      AND r2.TRN1DATE IS NOT NULL
      AND (r2.TRN1CANCEL <> 'Y' OR r2.TRN1CANCEL IS NULL)
      AND (@FromDate IS NULL OR r2.TRN1DATE >= @FromDate)
      AND (@ToDate IS NULL OR r2.TRN1DATE <= @ToDate)
),
RegLevel AS
(
    SELECT 
        q.QUOTNO,
        q.QUOTEQNO,
        q.TRN2REFNO,
        MIN(q.QuotDate) AS QuotDate,
        MIN(q.QUOTENQDATE) AS InqDate,
        MIN(q.QUOTAMT) AS MinQuotAmt,
        MIN(ISNULL(q.QUOTDISCOUNTAXAMT,0)) AS MinQuotDisc,
        MIN(q.QUOT_SALESPERSONCD) AS QUOT_SALESPERSONCD,
        MIN(q.BDName) AS BDName,
        MIN(q.QUOTPARTYCD) AS QUOTPARTYCD,
        MIN(q.ClientName) AS ClientName,
        MIN(q.QUOTSEMPLECHARGE) AS QUOTSEMPLECHARGE,
        MIN(q.QUOTMISC) AS QUOTMISC,
        MIN(q.QUOTHCC) AS QUOTHCC,
        MAX(q.QUOTUSD) AS QUOTUSD,
        MAX(q.USDRATE) AS USDRATE,
        MAX(q.TRN1DATE) AS RegisDate,
        MAX(q.TRN1CANCEL) AS TRN1CANCEL,
        SUBSTRING(MIN(q.QUOTNO),11,3) AS Vertical,
        MIN(q.RegRank) AS MinRegRank,
        SUM(CAST(NULLIF(q.TRN2TESTRATE,'') AS DECIMAL(18,2))) AS SumTestRate,
        YEAR(MAX(q.TRN1DATE)) AS RegYear,
        MONTH(MAX(q.TRN1DATE)) AS RegMonth
    FROM QuotationsWithReg q
    GROUP BY q.QUOTNO, q.QUOTEQNO, q.TRN2REFNO
),
LatestRegPerRef AS
(
    SELECT
        rl.*,
        ROW_NUMBER() OVER (PARTITION BY rl.TRN2REFNO ORDER BY rl.RegisDate DESC) AS rn
    FROM RegLevel rl
),
DistinctRegs AS
(
    SELECT *
    FROM LatestRegPerRef
    WHERE rn = 1
),
RegsWithVal AS
(
    SELECT
        d.*,
        CASE 
            WHEN d.TRN1CANCEL = 'Y' THEN 0
            ELSE
                (
                    d.SumTestRate * ((d.MinQuotAmt - d.MinQuotDisc) / NULLIF(d.MinQuotAmt,0))
                    + CASE WHEN d.MinRegRank = 1 THEN ISNULL(d.QUOTSEMPLECHARGE,0) + ISNULL(d.QUOTMISC,0) + ISNULL(d.QUOTHCC,0) ELSE 0 END
                ) * CASE WHEN d.QUOTUSD = 'Y' THEN d.USDRATE ELSE 1 END
        END AS RegisVal
    FROM DistinctRegs d
),
VerticalAgg AS
(
    SELECT
        QUOT_SALESPERSONCD,
        RegYear,
        RegMonth,
        Vertical,
        COUNT(*) AS VerticalRegCount,
        SUM(RegisVal) AS VerticalRegVal
    FROM RegsWithVal
    GROUP BY QUOT_SALESPERSONCD, RegYear, RegMonth, Vertical
),
ClientAgg AS
(
    SELECT
        QUOT_SALESPERSONCD,
        RegYear,
        RegMonth,
        ClientName,
        COUNT(*) AS ClientRegCount,
        SUM(RegisVal) AS ClientRegVal
    FROM RegsWithVal
    GROUP BY QUOT_SALESPERSONCD, RegYear, RegMonth, ClientName
),
VerticalSummary AS
(
    SELECT 
        QUOT_SALESPERSONCD,
        RegYear,
        RegMonth,
        STRING_AGG(CONCAT(Vertical, ': ', VerticalRegCount, ' regs / ', FORMAT(CAST(VerticalRegVal AS DECIMAL(18,2)),'0')), ', ')
            WITHIN GROUP (ORDER BY Vertical) AS VerticalSummary
    FROM VerticalAgg
    GROUP BY QUOT_SALESPERSONCD, RegYear, RegMonth
),
ClientSummary AS
(
    SELECT 
        QUOT_SALESPERSONCD,
        RegYear,
        RegMonth,
        STRING_AGG(CONCAT(ClientName, ': ', ClientRegCount, ' regs / ', FORMAT(CAST(ClientRegVal AS DECIMAL(18,2)),'0')), ', ')
            WITHIN GROUP (ORDER BY ClientName) AS ClientSummary
    FROM ClientAgg
    GROUP BY QUOT_SALESPERSONCD, RegYear, RegMonth
),
FinalAgg AS
(
    SELECT
        QUOT_SALESPERSONCD,
        BDName,
        RegYear,
        RegMonth,
        COUNT(*) AS TotalRegistrations,
        SUM(RegisVal) AS TotalRegisValue,
        COUNT(DISTINCT Vertical) AS UniqueVerticals,
        COUNT(DISTINCT ClientName) AS UniqueClients
    FROM RegsWithVal
    GROUP BY QUOT_SALESPERSONCD, BDName, RegYear, RegMonth
)
SELECT
    f.BDName,
    CONCAT(f.RegYear,'-',RIGHT('0'+CAST(f.RegMonth AS VARCHAR(2)),2)) AS YearMonth,
    f.TotalRegistrations,
    f.TotalRegisValue,
    f.UniqueVerticals,
    f.UniqueClients,
    vs.VerticalSummary,
    cs.ClientSummary
FROM FinalAgg f
LEFT JOIN VerticalSummary vs
    ON f.QUOT_SALESPERSONCD = vs.QUOT_SALESPERSONCD
    AND f.RegYear = vs.RegYear
    AND f.RegMonth = vs.RegMonth
LEFT JOIN ClientSummary cs
    ON f.QUOT_SALESPERSONCD = cs.QUOT_SALESPERSONCD
    AND f.RegYear = cs.RegYear
    AND f.RegMonth = cs.RegMonth
ORDER BY f.BDName, YearMonth;

";

            using (var connection = new SqlConnection(_connectionString))
            {


                return await connection.QueryAsync<BdBusinessSummary>(query, new
                {
                    FromDate = request.FromDate,
                    ToDate = request.ToDate,
                });
            }
        }


        public async Task<IEnumerable<BdBusinessSummary>> GetMtoMBusinessComparisonAsync(MtoMComparisonRequest request)
        {
            var req1 = new BdBusinessSummaryRequest();
            var req2= new BdBusinessSummaryRequest();
            req1.FromDate = request.FromDate1;
            req1.ToDate = request.ToDate1;
            req2.FromDate = request.FromDate2;
            req2.ToDate = request.ToDate2;


            var month1Data = await GetBdBusinessOverviewAsync(req1);
            var month2Data = await GetBdBusinessOverviewAsync(req2);

            return month1Data.Concat(month2Data);
        }
    }
}
