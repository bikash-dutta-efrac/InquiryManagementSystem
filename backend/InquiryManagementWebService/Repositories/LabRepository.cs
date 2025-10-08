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

        public async Task<IEnumerable<Lab>> GetLabParameters(LabRequest request)
        {
            var pageNumber = request.PageNumber > 0 ? request.PageNumber : 1;
            var pageSize = request.PageSize > 0 ? request.PageSize : 50;

            var reviewsBy = request.ReviewsBy?.Any() == true ? string.Join(",", request.ReviewsBy) : null;

            var query = @"
                ;WITH Data AS (
    SELECT 
        R1.TRN1DATE AS RegDate,
        R1.TRN1REFNO AS RegNo,
        R2.TRN2REGREFNO AS SubRegNo,
        OC.CODEDESC AS LabName,
        OH.HEADDESC AS Parameter,
        R2.TRN2HODReview AS HodReview,
        CASE 
            WHEN R2.TRN2Review = 'Y' AND R2.TRN2AuthYN = 'Y' THEN 'Y'
            ELSE 'N'
        END AS QaReview,
        R2.TRN2MDateofReport AS MailDate
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
                AND R1.TRN1DATE < DATEADD(MONTH, 1, DATEFROMPARTS(@Year, @Month, 1)))
            OR (@FromDate IS NOT NULL AND @ToDate IS NOT NULL 
                AND R1.TRN1DATE BETWEEN @FromDate AND @ToDate)
            OR (@Month IS NULL AND @Year IS NULL AND @FromDate IS NULL AND @ToDate IS NULL)
        )
        AND (
            @Labs IS NULL 
            OR (
                (@ExcludeLabs = 0 AND OC.CODEDESC IN (SELECT Value FROM dbo.SplitStrings(@Labs, ',')))
                OR (@ExcludeLabs = 1 AND OC.CODEDESC NOT IN (SELECT Value FROM dbo.SplitStrings(@Labs, ',')))
            )
        )
)
SELECT *
FROM Data D
WHERE
    (
        @ReviewsBy IS NULL
        OR
        (
            -- Pending
            (CHARINDEX('pending', @ReviewsBy) > 0
                AND (D.HodReview <> 'Y' OR D.HodReview IS NULL)
                AND (D.QaReview <> 'Y' OR D.LabName <> 'Drugs' OR D.HodReview IS NULL)
                AND D.MailDate IS NULL
            )
            OR
            -- Verified by HOD
            (CHARINDEX('byHodReview', @ReviewsBy) > 0
                AND D.HodReview = 'Y'
                AND (D.QaReview <> 'Y' OR D.LabName <> 'Drugs' OR D.HodReview IS NULL)
                AND D.MailDate IS NULL
            )
            OR
            -- Verified by QA
            (CHARINDEX('byQaReview', @ReviewsBy) > 0
                AND D.QaReview = 'Y'
                AND D.LabName = 'Drugs'
                AND D.MailDate IS NULL
            )
            OR
            -- Verified by Mail
            (CHARINDEX('byMailReview', @ReviewsBy) > 0
                AND D.MailDate IS NOT NULL
            )
        )
    )
ORDER BY 
    D.RegDate DESC, 
    D.RegNo ASC
OFFSET (CASE WHEN @PageNumber > 0 THEN @PageNumber - 1 ELSE 0 END) * @PageSize ROWS
FETCH NEXT @PageSize ROWS ONLY;

            ";

            using (var connection = new SqlConnection(_connectionString))
            {

                int? commandTimeout = 60;
                var labs = request.Labs?.Any() == true ? string.Join(",", request.Labs) : null;

                return await connection.QueryAsync<Lab>(query, new
                {
                    FromDate = request.FromDate,
                    ToDate = request.ToDate,
                    Month = request.Month,
                    Year = request.Year,
                    ReviewsBy = reviewsBy,
                    Labs = labs,
                    ExcludeLabs = request.ExcludeLabs ? 1 : 0,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                }, commandTimeout: commandTimeout);
            }
        }

        public async Task<IEnumerable<LabSummary>> GetLabSummary(LabRequest request)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var query = @"
                    WITH Data AS (
                        SELECT
                            R1.TRN1DATE AS RegDate,
                            R1.TRN1REFNO AS RegNo,
                            R2.TRN2REGREFNO AS SubRegNo,
                            OC.CODEDESC AS LabName,
                            OH.HEADDESC AS Parameter,
                            R2.TRN2HODReview AS HodReview,
                            CASE
                                WHEN R2.TRN2Review = 'Y' AND R2.TRN2AuthYN = 'Y' THEN 'Y'
                                ELSE 'N'
                            END AS QaReview,
                            R2.TRN2MDateofReport AS MailDate
                        FROM TRN105 R1
                        LEFT JOIN TRN205 R2
                            ON R1.TRN1REFNO = R2.TRN2REFNO
                        LEFT JOIN OHEADMST OH
                            ON R2.TRN2HEADER = OH.HEADCD
                        LEFT JOIN OCODEMST OC
                            ON OH.HEADDEPARTMENT = OC.CODECD
                        WHERE OC.CODETYPE = 'DM'
                            AND (
                                (@Month IS NOT NULL AND @Year IS NOT NULL
                                    AND MONTH(R1.TRN1DATE) = @Month
                                    AND YEAR(R1.TRN1DATE) = @Year)
                                OR (@FromDate IS NOT NULL AND @ToDate IS NOT NULL
                                    AND R1.TRN1DATE BETWEEN @FromDate AND @ToDate)
                                OR (@Month IS NULL AND @Year IS NULL AND @FromDate IS NULL AND @ToDate IS NULL)
                            )
                            AND (
                                @Labs IS NULL 
                                OR (
                                    (@ExcludeLabs = 0 AND OC.CODEDESC IN (SELECT Value FROM dbo.SplitStrings(@Labs, ',')))
                                    OR (@ExcludeLabs = 1 AND OC.CODEDESC NOT IN (SELECT Value FROM dbo.SplitStrings(@Labs, ',')))
                                )
                            )
                    )
                    SELECT
                        D.LabName,
                        COUNT(DISTINCT D.RegNo) AS TotalRegistrations,
                        COUNT(DISTINCT D.SubRegNo) AS TotalSubRegistrations,
                        COUNT(*) AS TotalParameters,
                        SUM(CASE WHEN D.MailDate IS NOT NULL THEN 1 ELSE 0 END) AS TotalMailReviewed,
                        SUM(CASE 
                                WHEN D.MailDate IS NULL
                                AND D.QaReview = 'Y' 
                                AND D.LabName = 'Drugs' THEN 1 
                                ELSE 0 
                            END) AS TotalQaReviewed,
                        SUM(CASE
                                WHEN D.MailDate IS NOT NULL THEN 0 
                                WHEN D.QaReview = 'Y' AND D.LabName = 'Drugs' THEN 0 
                                WHEN D.HodReview = 'Y' THEN 1 
                                ELSE 0
                            END) AS TotalHodReviewed

                    FROM Data D
                    GROUP BY
                        D.LabName
                    ORDER BY
                        D.LabName;
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

        public async Task<IEnumerable<string>> GetLabsAsync(LabRequest request)
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
