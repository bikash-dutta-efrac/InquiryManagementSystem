using Dapper;
using InquiryManagementWebService.Models;
using Microsoft.Data.SqlClient;

namespace InquiryManagementWebService.Repositories
{
    public class LabRepository : ILabRepository
    {
        private readonly string _connectionString;
        public LabRepository(IConfiguration configuration)
        {
            _connectionString = configuration["Connnectionstrings:MyConnection"];
        }

        public async Task<IEnumerable<SampleSummary>> GetSampleSummary(SampleSummaryRequest request)
        {

            var query = @"
;WITH RegisBase AS
(
    SELECT 
        r1.TRN2REFNO AS RegisNo,
        CASE 
            WHEN MAX(r2.TRN1CANCEL) = 'Y' THEN 0
            ELSE 
                CASE WHEN MAX(i.QUOTUSD) = 'Y' 
                     THEN (
                            (
                                SUM(CAST(NULLIF(r1.TRN2TESTRATE, '') AS DECIMAL(18,2))) 
                                * ( (MIN(i.QUOTAMT) - MIN(ISNULL(i.QUOTDISCOUNTAXAMT,0))) / NULLIF(MIN(i.QUOTAMT),0) )
                            )
                            + MIN(ISNULL(i.QUOTSEMPLECHARGE,0)) 
                            + MIN(ISNULL(i.QUOTMISC,0)) 
                            + MIN(ISNULL(i.QUOTHCC,0))
                          ) * MAX(i.USDRATE)  
                     ELSE (
                            (
                                SUM(CAST(NULLIF(r1.TRN2TESTRATE, '') AS DECIMAL(18,2))) 
                                * ( (MIN(i.QUOTAMT) - MIN(ISNULL(i.QUOTDISCOUNTAXAMT,0))) / NULLIF(MIN(i.QUOTAMT),0) )
                            )
                            + MIN(ISNULL(i.QUOTSEMPLECHARGE,0)) 
                            + MIN(ISNULL(i.QUOTMISC,0)) 
                            + MIN(ISNULL(i.QUOTHCC,0))
                          )
                END
        END AS RegisVal
    FROM OQUOTMST i
    INNER JOIN TRN205 r1 ON r1.TRN2QOTNO = i.QUOTNO
    LEFT JOIN TRN105 r2  ON r2.TRN1REFNO = r1.TRN2REFNO
    GROUP BY r1.TRN2REFNO
),
SampleData AS
(
    SELECT DISTINCT
        BILLNO,
        CONVERT(NVARCHAR(10), BILLAUTHDATE, 103) AS InvoiceDate,
        T2.TRN2REFNO AS RegistrationNo,
        T2.TRN2PRODALIAS AS SampleName,
        REPLACE(OCM1.codedesc, ' ', '') AS Lab,
        FORMAT(
            DATEADD(SECOND, DATEDIFF(SECOND, 0, t05.TRN1TIME), t05.TRN1DATE), 
            'dd/MM/yyyy HH:mm:ss'
        ) AS RegistrationDateTime,
        CONVERT(NVARCHAR(10), T2.Trn2Pardate, 103) AS LabTatDate,
        T2.Trn2Pardate AS TatDate,
        CONVERT(NVARCHAR(10),T2.TRN2MdateofReport,103) As MailingDate,
        CASE 
            WHEN T2.TRN2COMPLETIONDT IS NOT NULL THEN 
                FORMAT(T2.TRN2COMPLETIONDT, 'dd/MM/yyyy HH:mm:ss')
            ELSE 
                ''
        END AS AnalysisCompletionDateTime,
        T2.TRN2COMPLETIONDT,
        T2.TRN2HODReview AS HodReview
    FROM TRN205 AS T2
        INNER JOIN oheadmst AS HM 
            ON HM.headPlantCd = T2.TRN2PLANTCD 
            AND HM.headcd = T2.TRN2HEADER
        LEFT JOIN OCODEMST AS OCM2 
            ON OCM2.CODEPLANTCD = T2.TRN2PLANTCD 
            AND OCM2.CODECD = T2.TRN2_PLATFORM 
            AND OCM2.CODETYPE = 'PM'
        INNER JOIN OCODEMST AS OCM 
            ON OCM.CODEPLANTCD = T2.TRN2PLANTCD 
            AND OCM.CODECD = T2.TRN2GROUPCD 
            AND OCM.CODETYPE = 'GM'
        INNER JOIN OCODEMST AS OCM1 
            ON OCM1.CODEPLANTCD = T2.TRN2PLANTCD 
            AND OCM1.CODECD = T2.TRN2DEPARTCD 
            AND OCM1.CODETYPE = 'DM'
        INNER JOIN TRN105 AS t05 
            ON t05.TRN1PLANTCD = T2.TRN2PLANTCD 
            AND t05.TRN1REFNO = T2.TRN2REFNO
        LEFT JOIN billmst 
            ON BILLARNO = TRN2REFNO 
            AND TRN1PLANTCD = BILLPLANTCD
    WHERE 
        t05.TRN1PLANTCD = 'P001'
        AND (
                (t05.TRN1Date >= @FromDate AND t05.TRN1Date <= @ToDate)
                OR
                (@Month IS NOT NULL AND @Year IS NOT NULL 
                 AND MONTH(t05.TRN1Date) = @Month 
                 AND YEAR(t05.TRN1Date) = @Year)
            )
        AND (
            @Labs IS NULL 
            OR (
                (@ExcludeLabs = 0 AND REPLACE(OCM1.codedesc, ' ', '') IN (SELECT Value FROM dbo.SplitStrings(@Labs, ',')))
                OR
                (@ExcludeLabs = 1 AND REPLACE(OCM1.codedesc, ' ', '') NOT IN (SELECT Value FROM dbo.SplitStrings(@Labs, ',')))
            )
        )

    UNION ALL

    SELECT DISTINCT
        b.BLMNBILLNO AS BILLNO,
        CONVERT(NVARCHAR(10), BLMNDATE, 103) AS InvoiceDate,
        TRN4REFNO AS RegistrationNo,
        TRN4REMARKS AS SampleName,
        'Training' AS Lab,
        FORMAT(CONVERT(DATETIME, t.TRN4DATE), 'dd/MM/yyyy HH:mm:ss') AS RegistrationDateTime,
        '' AS LabTatDate,
        NULL AS TatDate,
        '' AS MailingDate,
        '' AS AnalysisCompletionDateTime,
        NULL AS TRN2COMPLETIONDT,
        NULL AS HodReview
    FROM BILLMAIN b
        INNER JOIN TRN4STUDEND t 
            ON b.blmncustcd = t.TRN4PARTYCD
    WHERE 
        trn4plantcd = 'P001'
        AND (
                (t.TRN4Date >= @FromDate AND t.TRN4Date <= @ToDate)
                OR
                (@Month IS NOT NULL AND @Year IS NOT NULL 
                 AND MONTH(t.TRN4Date) = @Month 
                 AND YEAR(t.TRN4Date) = @Year)
            )
        AND (
            @Labs IS NULL 
            OR (
                (@ExcludeLabs = 0 AND 'Training' IN (SELECT Value FROM dbo.SplitStrings(@Labs, ',')))
                OR
                (@ExcludeLabs = 1 AND 'Training' NOT IN (SELECT Value FROM dbo.SplitStrings(@Labs, ',')))
            )
        )
)
, FinalData AS
(
    SELECT 
        s.*,
        CAST(
            r.RegisVal / NULLIF(COUNT(*) OVER (PARTITION BY s.RegistrationNo), 0) 
            AS DECIMAL(18,2)
        ) AS DistributedRegisVal,
        CASE 
            WHEN s.TRN2COMPLETIONDT IS NOT NULL AND s.HodReview = 'Y' THEN 'Released'
            ELSE 'Pending'
        END AS Status
    FROM SampleData s
    LEFT JOIN RegisBase r 
        ON s.RegistrationNo = r.RegisNo
)
SELECT *
FROM FinalData
WHERE 
    @StatusFilter IS NULL 
    OR Status = @StatusFilter
ORDER BY RegistrationNo, SampleName;

            ";

            using (var connection = new SqlConnection(_connectionString))
            {

                int? commandTimeout = 60;

                var labs = request.Labs?.Any() == true ? string.Join(",", request.Labs) : null;

                return await connection.QueryAsync<SampleSummary>(query, new
                {
                    FromDate = request.FromDate,
                    ToDate = request.ToDate,
                    Month = request.Month,
                    Year = request.Year,
                    StatusFilter = request.StatusFilter,
                    Labs = labs,
                    ExcludeLabs = request.ExcludeLabs ? 1 : 0
                }, commandTimeout: commandTimeout);
            }
        }

        public async Task<IEnumerable<LabSummary>> GetLabSummary(SampleSummaryRequest request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
;WITH RegisBase AS
(
    SELECT 
        r1.TRN2REFNO AS RegisNo,
        CASE 
            WHEN MAX(r2.TRN1CANCEL) = 'Y' THEN 0
            ELSE 
                CASE WHEN MAX(i.QUOTUSD) = 'Y' 
                     THEN (
                            (
                                SUM(CAST(NULLIF(r1.TRN2TESTRATE, '') AS DECIMAL(18,2))) 
                                * ( (MIN(i.QUOTAMT) - MIN(ISNULL(i.QUOTDISCOUNTAXAMT,0))) / NULLIF(MIN(i.QUOTAMT),0) )
                            )
                            + MIN(ISNULL(i.QUOTSEMPLECHARGE,0)) 
                            + MIN(ISNULL(i.QUOTMISC,0)) 
                            + MIN(ISNULL(i.QUOTHCC,0))
                          ) * MAX(i.USDRATE)  
                     ELSE (
                            (
                                SUM(CAST(NULLIF(r1.TRN2TESTRATE, '') AS DECIMAL(18,2))) 
                                * ( (MIN(i.QUOTAMT) - MIN(ISNULL(i.QUOTDISCOUNTAXAMT,0))) / NULLIF(MIN(i.QUOTAMT),0) )
                            )
                            + MIN(ISNULL(i.QUOTSEMPLECHARGE,0)) 
                            + MIN(ISNULL(i.QUOTMISC,0)) 
                            + MIN(ISNULL(i.QUOTHCC,0))
                          )
                END
        END AS RegisVal
    FROM OQUOTMST i
    INNER JOIN TRN205 r1 ON r1.TRN2QOTNO = i.QUOTNO
    LEFT JOIN TRN105 r2  ON r2.TRN1REFNO = r1.TRN2REFNO
    GROUP BY r1.TRN2REFNO
),
CombinedData AS
(
    SELECT DISTINCT
        BILLNO,
        CONVERT(NVARCHAR(10), BILLAUTHDATE, 103) AS InvoiceDate,
        T2.TRN2REFNO AS RegistrationNo,
        T2.TRN2PRODALIAS AS SampleName,
        REPLACE(OCM1.codedesc, ' ', '') AS Lab,
        FORMAT(
            DATEADD(SECOND, DATEDIFF(SECOND, 0, t05.TRN1TIME), t05.TRN1DATE), 
            'dd/MM/yyyy HH:mm:ss'
        ) AS RegistrationDateTime,
        CONVERT(NVARCHAR(10), T2.Trn2Pardate, 103) AS LabTatDate,
        T2.Trn2Pardate AS TatDate,
        CASE 
            WHEN T2.TRN2COMPLETIONDT IS NOT NULL THEN 
                FORMAT(T2.TRN2COMPLETIONDT, 'dd/MM/yyyy HH:mm:ss')
            ELSE 
                ''
        END AS AnalysisCompletionDateTime,
        T2.TRN2COMPLETIONDT,
        T2.TRN2HODReview AS HodReview
    FROM TRN205 AS T2
        INNER JOIN oheadmst AS HM 
            ON HM.headPlantCd = T2.TRN2PLANTCD 
            AND HM.headcd = T2.TRN2HEADER
        LEFT JOIN OCODEMST AS OCM2 
            ON OCM2.CODEPLANTCD = T2.TRN2PLANTCD 
            AND OCM2.CODECD = T2.TRN2_PLATFORM 
            AND OCM2.CODETYPE = 'PM'
        INNER JOIN OCODEMST AS OCM 
            ON OCM.CODEPLANTCD = T2.TRN2PLANTCD 
            AND OCM.CODECD = T2.TRN2GROUPCD 
            AND OCM.CODETYPE = 'GM'
        INNER JOIN OCODEMST AS OCM1 
            ON OCM1.CODEPLANTCD = T2.TRN2PLANTCD 
            AND OCM1.CODECD = T2.TRN2DEPARTCD 
            AND OCM1.CODETYPE = 'DM'
        INNER JOIN TRN105 AS t05 
            ON t05.TRN1PLANTCD = T2.TRN2PLANTCD 
            AND t05.TRN1REFNO = T2.TRN2REFNO
        LEFT JOIN billmst 
            ON BILLARNO = TRN2REFNO 
            AND TRN1PLANTCD = BILLPLANTCD
    WHERE 
        t05.TRN1PLANTCD = 'P001'
        AND (
                (t05.TRN1Date >= @FromDate AND t05.TRN1Date <= @ToDate)
                OR
                (@Month IS NOT NULL AND @Year IS NOT NULL 
                 AND MONTH(t05.TRN1Date) = @Month 
                 AND YEAR(t05.TRN1Date) = @Year)
            )
        AND (
            @Labs IS NULL 
            OR (
                (@ExcludeLabs = 0 AND REPLACE(OCM1.codedesc, ' ', '') IN (SELECT Value FROM dbo.SplitStrings(@Labs, ',')))
                OR
                (@ExcludeLabs = 1 AND REPLACE(OCM1.codedesc, ' ', '') NOT IN (SELECT Value FROM dbo.SplitStrings(@Labs, ',')))
            )
        )

    UNION ALL

    SELECT DISTINCT
        b.BLMNBILLNO AS BILLNO,
        CONVERT(NVARCHAR(10), BLMNDATE, 103) AS InvoiceDate,
        TRN4REFNO AS RegistrationNo,
        TRN4REMARKS AS SampleName,
        'Training' AS Lab,
        FORMAT(CONVERT(DATETIME, t.TRN4DATE), 'dd/MM/yyyy HH:mm:ss') AS RegistrationDateTime,
        '' AS LabTatDate,
        NULL AS TatDate,
        '' AS AnalysisCompletionDateTime,
        NULL AS TRN2COMPLETIONDT,
        NULL AS HodReview
    FROM BILLMAIN b
        INNER JOIN TRN4STUDEND t 
            ON b.blmncustcd = t.TRN4PARTYCD
    WHERE 
        trn4plantcd = 'P001'
        AND (
                (t.TRN4Date >= @FromDate AND t.TRN4Date <= @ToDate)
                OR
                (@Month IS NOT NULL AND @Year IS NOT NULL 
                 AND MONTH(t.TRN4Date) = @Month 
                 AND YEAR(t.TRN4Date) = @Year)
            )
        AND (
            @Labs IS NULL 
            OR (
                (@ExcludeLabs = 0 AND 'Training' IN (SELECT Value FROM dbo.SplitStrings(@Labs, ',')))
                OR
                (@ExcludeLabs = 1 AND 'Training' NOT IN (SELECT Value FROM dbo.SplitStrings(@Labs, ',')))
            )
        )
)
SELECT
    c.Lab,
    COUNT(*) AS Samples,
    SUM(CASE 
            WHEN c.TRN2COMPLETIONDT IS NULL OR ISNULL(c.HodReview, '') <> 'Y' 
            THEN 1 ELSE 0 END
       ) AS Pendings,
    SUM(CASE 
            WHEN c.TRN2COMPLETIONDT IS NOT NULL AND c.HodReview = 'Y' 
            THEN 1 ELSE 0 END
       ) AS Released,
    SUM(CASE 
            WHEN c.TRN2COMPLETIONDT IS NOT NULL 
                 AND c.HodReview = 'Y' 
                 AND c.TRN2COMPLETIONDT < c.TatDate 
            THEN 1 ELSE 0 END
       ) AS ReleasedBeforeTat,
    SUM(CASE 
            WHEN c.TRN2COMPLETIONDT IS NOT NULL 
                 AND c.HodReview = 'Y' 
                 AND CONVERT(DATETIME, c.TRN2COMPLETIONDT, 120) = CONVERT(DATETIME, c.TatDate, 120)
            THEN 1 ELSE 0 END
       ) AS ReleasedOnTat,
    SUM(CASE 
            WHEN c.TRN2COMPLETIONDT IS NOT NULL 
                 AND c.HodReview = 'Y' 
                 AND c.TRN2COMPLETIONDT > c.TatDate 
            THEN 1 ELSE 0 END
       ) AS ReleasedAfterTat,
    SUM(CASE 
            WHEN (c.TRN2COMPLETIONDT IS NULL OR ISNULL(c.HodReview, '') <> 'Y')
                 AND c.TatDate IS NOT NULL
                 AND GETDATE() > c.TatDate
            THEN 1 ELSE 0 END
       ) AS PendingBeyondTat,
    SUM(CASE 
            WHEN (c.TRN2COMPLETIONDT IS NULL OR ISNULL(c.HodReview, '') <> 'Y')
                 AND c.BILLNO IS NOT NULL
            THEN 1 ELSE 0 END
       ) AS PendingInvoiced,
    SUM(CASE 
            WHEN (c.TRN2COMPLETIONDT IS NULL OR ISNULL(c.HodReview, '') <> 'Y')
                 AND c.BILLNO IS NULL
            THEN 1 ELSE 0 END
       ) AS PendingBilled,

    SUM(CASE 
            WHEN (c.TRN2COMPLETIONDT IS NULL OR ISNULL(c.HodReview, '') <> 'Y')
            THEN ISNULL(r.RegisVal, 0)
            ELSE 0
        END
    ) AS PendingRegValue,

    SUM(ISNULL(r.RegisVal, 0)) AS TotalRegValue

FROM CombinedData c
LEFT JOIN RegisBase r 
    ON c.RegistrationNo = r.RegisNo
GROUP BY c.Lab
ORDER BY c.Lab;
";

                var labs = request.Labs?.Any() == true ? string.Join(",", request.Labs) : null;

                return await connection.QueryAsync<LabSummary>(query, new
                {
                    FromDate = request.FromDate,
                    ToDate = request.ToDate,
                    Month = request.Month,
                    Year = request.Year,
                    Labs = labs,
                    ExcludeLabs = request.ExcludeLabs ? 1 : 0
                });
            }
        }

        public async Task<IEnumerable<string>> GetLabsAsync(SampleSummaryRequest request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    SELECT DISTINCT 
                        OC.CODEDESC AS LabName
                    FROM TRN105 R1
                    LEFT JOIN TRN205 R2 
                        ON R1.TRN1REFNO = R2.TRN2REFNO
                    LEFT JOIN OHEADMST OH 
                        ON R2.TRN2HEADER = OH.HEADCD
                    LEFT JOIN OCODEMST OC 
                        ON OH.HEADDEPARTMENT = OC.CODECD
                    WHERE 
                        OC.CODETYPE = 'DM'
                        AND (
                            (@Month IS NOT NULL AND @Year IS NOT NULL 
                                AND R1.TRN1DATE >= DATEFROMPARTS(@Year, @Month, 1)
                                AND R1.TRN1DATE < DATEADD(month, 1, DATEFROMPARTS(@Year, @Month, 1)))
                            OR (@FromDate IS NOT NULL AND @ToDate IS NOT NULL 
                                AND R1.TRN1DATE BETWEEN @FromDate AND @ToDate)
                            OR (@Month IS NULL AND @Year IS NULL AND @FromDate IS NULL AND @ToDate IS NULL)
                        )
                    ORDER BY 
                        OC.CODEDESC;
                ";


                return await connection.QueryAsync<string>(query, new
                {
                    FromDate = request.FromDate,
                    ToDate = request.ToDate,
                    Year = request.Year,
                    Month = request.Month,
                });
            }
        }
    }
}
