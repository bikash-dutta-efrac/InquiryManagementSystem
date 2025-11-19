using Dapper;
using InquiryManagementWebService.Models;
using Microsoft.Data.SqlClient;

namespace InquiryManagementWebService.Repositories
{
    public class QuotationRepositiry : IQuotationRepositiry
    {

        private readonly string _connectionString;
        public QuotationRepositiry(IConfiguration configuration)
        {
            _connectionString = configuration["Connnectionstrings:MyConnection"];
        }


        public async Task<IEnumerable<Quotation>> GetPendingQuotationAsync(QuotationRequest request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
;WITH QuotationsWithReg AS
(
    SELECT 
        i.QUOTNO,
        r1.TRN2REFNO,
        i.QuotDate,
        i.QUOTAMT,
        i.QUOTDISCOUNTAXAMT,
        i.QUOT_SALESPERSONCD,
        bd.CODEDESC AS BDName,
        i.QUOTPARTYCD,
		i.QUOT_CLOSE_YN,
        c.CUSTNAME AS ClientName,
        SUBSTRING(i.QUOTNO, 11, 3) AS Vertical
    FROM OQUOTMST i
    INNER JOIN OCUSTMST c 
        ON i.QUOTPARTYCD = c.CUSTACCCODE
    INNER JOIN OCODEMST bd 
        ON bd.CODECD = i.QUOT_SALESPERSONCD
    LEFT JOIN TRN205 r1 
        ON r1.TRN2QOTNO = i.QUOTNO
    WHERE bd.CODETYPE = 'SP'
)
SELECT
    q.QUOTNO AS QuotNo,
    q.QuotDate,
    q.QUOTAMT AS QuotValBeforeDis,
    (q.QUOTAMT - ISNULL(q.QUOTDISCOUNTAXAMT,0)) AS QuotValAfterDis,
    q.QUOT_SALESPERSONCD AS BdCode,
    q.BDName,
    q.QUOTPARTYCD AS ClientCode,
    q.ClientName,
    q.Vertical,
    CAST(
        CASE 
            WHEN q.QUOTAMT IS NULL OR q.QUOTAMT = 0 THEN NULL
            ELSE (ISNULL(q.QUOTDISCOUNTAXAMT,0) * 100.0) / q.QUOTAMT
        END 
    AS DECIMAL(10,2)) AS PercOfDis,
    CASE 
        WHEN q.QUOT_CLOSE_YN IS NULL THEN 'Active'
        ELSE 'Inactive'
    END 
     AS Status,
    DATEDIFF(DAY, q.QuotDate, GETDATE()) AS QuotAgeing

FROM QuotationsWithReg q
WHERE
    q.TRN2REFNO IS NULL
    AND (@FromDate IS NULL OR q.QuotDate >= @FromDate)
    AND (@ToDate   IS NULL OR q.QuotDate <= @ToDate)
    AND (@QuotNo IS NULL OR q.QUOTNO = @QuotNo)
    AND (
        @AgeFilter IS NULL
        OR (@AgeFilter = '30'  AND DATEDIFF(DAY, q.QuotDate, GETDATE()) BETWEEN 0 AND 30)
        OR (@AgeFilter = '60'  AND DATEDIFF(DAY, q.QuotDate, GETDATE()) BETWEEN 0 AND 60)
        OR (@AgeFilter = '90'  AND DATEDIFF(DAY, q.QuotDate, GETDATE()) BETWEEN 0 AND 90)
        OR (@AgeFilter = '90+' 
            AND DATEDIFF(DAY, q.QuotDate, GETDATE()) > 90
            AND q.QuotDate >= '2025-04-01'
        )
    )
	AND (
    @CODECDList IS NULL
    OR q.QUOT_SALESPERSONCD IN (SELECT Value FROM dbo.SplitStrings(@CODECDList, ','))
)

ORDER BY q.QuotDate DESC;
";

                var codecdList = (request.BdCodes != null && request.BdCodes.Any())
                    ? string.Join(",", request.BdCodes)
                    : null;


                return await connection.QueryAsync<Quotation>(query, new
                {
                    FromDate = request.FromDate,
                    ToDate = request.ToDate,
                    AgeFilter = request.AgeFilter,
                    QuotNo = request.QuotNo,
                    CODECDList = codecdList,
                });
            }
        }


        public async Task<bool> UpdateQuotationAsync(UpdateQuotationRequest request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    UPDATE OQUOTMST
                    SET QUOT_CLOSE_YN = @CloseYn
                    WHERE QUOTNO = @QuotNo;
                ";

                var rowsAffected = await connection.ExecuteAsync(query, new
                {
                    QuotNo = request.QuotNo,
                    CloseYn = (object?)request.CloseYn ?? DBNull.Value
                });

                return rowsAffected > 0;
            }
        }


    }

}
