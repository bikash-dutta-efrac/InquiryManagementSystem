using Dapper;
using InquiryManagementWebService.Models;
using Microsoft.Data.SqlClient;

namespace InquiryManagementWebService.Repositories
{
    public class InquiryRepository : IInquiryRepository
    {
        private readonly string _connectionString;
        public InquiryRepository(IConfiguration configuration)
        {
            _connectionString = configuration["Connnectionstrings:MyConnection"];
        }

        public async Task<IEnumerable<Inquiry>> GetAsync(
            DateTime? fromDate,
            DateTime? toDate,
            int? year,
            int? month,
            string? bdName,
            string? clientName,
            string? dateField
        )
        {
            using var connection = new SqlConnection(_connectionString);

            //var query = @"
            //    SELECT 
            //        i.QUOTEQNO AS InqNo,
            //        i.QUOTNO AS QuotNo,
            //        r1.TRN2REFNO AS RegisNo,
            //        MIN(i.QUOTENQDATE) AS InqDate,
            //        MIN(i.QuotDate) AS QuotDate,
            //        MIN(i.QUOTAMT) AS QuotValBeforeDis,
            //        MIN(i.QUOTAMT - i.QUOTDISCOUNTAXAMT) AS QuotValAfterDis,
            //        CASE 
            //            WHEN MAX(r1.TRN2REFNO) IS NOT NULL THEN 'Approved'
            //            ELSE 'Unapproved'
            //        END AS QuotStatus,
            //        CAST(
            //            CASE 
            //                WHEN MIN(i.QUOTAMT) IS NULL OR MIN(i.QUOTAMT) = 0 THEN NULL
            //                ELSE (MIN(i.QUOTDISCOUNTAXAMT) * 100.0) / MIN(i.QUOTAMT)
            //            END 
            //        AS DECIMAL(10,2)) AS PercOfDis,
            //        MIN(r2.TRN1DATE) AS RegisDate,
            //        SUM(CAST(NULLIF(r1.TRN2TESTRATE, '') AS DECIMAL(18,2))) AS RegisVal,
            //        MIN(i.QUOT_SALESPERSONCD) AS CodeCD,
            //        MIN(bd.CODEDESC) AS BDName,
            //        MIN(i.QUOTPARTYCD) AS ClientId,
            //        MIN(c.CUSTNAME) AS ClientName,
            //        MAX(
            //            CASE 
            //                WHEN r1.TRN2REFNO IS NOT NULL THEN NULL   -- Registered → no ageing
            //                WHEN i.QuotDate IS NULL THEN NULL         -- No quotation date → no ageing
            //                ELSE DATEDIFF(DAY, i.QuotDate, GETDATE()) -- Unregistered → ageing
            //            END
            //        ) AS QuotAgeing
            //    FROM OQUOTMST i
            //    INNER JOIN OCUSTMST c 
            //        ON i.QUOTPARTYCD = c.CUSTACCCODE
            //    INNER JOIN OCODEMST bd 
            //        ON bd.CODECD = i.QUOT_SALESPERSONCD
            //    LEFT JOIN TRN205 r1 
            //        ON r1.TRN2QOTNO = i.QUOTNO
            //    LEFT JOIN TRN105 r2 
            //        ON r2.TRN1REFNO = r1.TRN2REFNO
            //    WHERE bd.CODETYPE = 'SP'
            //      AND (@FromDate IS NULL OR i.QUOTENQDATE >= @FromDate)
            //      AND (@ToDate IS NULL OR i.QUOTENQDATE <= @ToDate)
            //      AND (@Year IS NULL OR YEAR(i.QUOTENQDATE) = @Year)
            //      AND (@Month IS NULL OR MONTH(i.QUOTENQDATE) = @Month)
            //      AND (@BDName IS NULL OR bd.CODEDESC = @BDName)
            //      AND (@ClientName IS NULL OR c.CUSTNAME LIKE '%' + @ClientName + '%')
            //    GROUP BY 
            //        i.QUOTEQNO, 
            //        i.QUOTNO, 
            //        r1.TRN2REFNO;
            //";

            //var query = @"
            //    ;WITH LatestQuot AS (
            //        SELECT 
            //            i.QUOTEQNO AS InqNo,
            //            i.QUOTNO AS QuotNo,
            //            i.QUOTENQDATE AS InqDate,
            //            i.QuotDate,
            //            i.QUOTAMT,
            //            i.QUOTDISCOUNTAXAMT,
            //            i.QUOT_SALESPERSONCD,
            //            i.QUOTPARTYCD,
            //            ROW_NUMBER() OVER (PARTITION BY i.QUOTEQNO ORDER BY i.QuotDate DESC, i.QUOTNO DESC) AS rn
            //        FROM OQUOTMST i
            //    )
            //    SELECT 
            //        q.InqNo,
            //        q.QuotNo,
            //        r1.TRN2REFNO AS RegisNo,
            //        q.InqDate,
            //        q.QuotDate,
            //        q.QUOTAMT AS QuotValBeforeDis,
            //        q.QUOTAMT - q.QUOTDISCOUNTAXAMT AS QuotValAfterDis,
            //        CASE 
            //            WHEN r1.TRN2REFNO IS NOT NULL THEN 'Approved'
            //            ELSE 'Unapproved'
            //        END AS QuotStatus,
            //        CAST(
            //            CASE 
            //                WHEN q.QUOTAMT IS NULL OR q.QUOTAMT = 0 THEN NULL
            //                ELSE (q.QUOTDISCOUNTAXAMT * 100.0) / q.QUOTAMT
            //            END 
            //        AS DECIMAL(10,2)) AS PercOfDis,
            //        r2.TRN1DATE AS RegisDate,
            //        SUM(CAST(NULLIF(r1.TRN2TESTRATE, '') AS DECIMAL(18,2))) AS RegisVal,
            //        q.QUOT_SALESPERSONCD AS CodeCD,
            //        bd.CODEDESC AS BDName,
            //        q.QUOTPARTYCD AS ClientId,
            //        c.CUSTNAME AS ClientName,
            //        CASE 
            //            WHEN r1.TRN2REFNO IS NULL AND q.QuotDate IS NOT NULL
            //            THEN DATEDIFF(DAY, q.QuotDate, GETDATE())
            //            ELSE NULL
            //        END AS QuotAgeing
            //    FROM LatestQuot q
            //    INNER JOIN OCUSTMST c 
            //        ON q.QUOTPARTYCD = c.CUSTACCCODE
            //    INNER JOIN OCODEMST bd 
            //        ON bd.CODECD = q.QUOT_SALESPERSONCD
            //    LEFT JOIN TRN205 r1 
            //        ON r1.TRN2QOTNO = q.QuotNo
            //    LEFT JOIN TRN105 r2 
            //        ON r2.TRN1REFNO = r1.TRN2REFNO
            //    WHERE q.rn = 1   -- ✅ Only latest quotation per inquiry
            //      AND bd.CODETYPE = 'SP'
            //      AND (@FromDate IS NULL OR q.InqDate >= @FromDate)
            //      AND (@ToDate IS NULL OR q.InqDate <= @ToDate)
            //      AND (@Year IS NULL OR YEAR(q.InqDate) = @Year)
            //      AND (@Month IS NULL OR MONTH(q.InqDate) = @Month)
            //      AND (@BDName IS NULL OR bd.CODEDESC = @BDName)
            //      AND (@ClientName IS NULL OR c.CUSTNAME LIKE '%' + @ClientName + '%')
            //    GROUP BY 
            //        q.InqNo, 
            //        q.QuotNo, 
            //        r1.TRN2REFNO, 
            //        q.InqDate, 
            //        q.QuotDate, 
            //        q.QUOTAMT, 
            //        q.QUOTDISCOUNTAXAMT,
            //        r2.TRN1DATE,
            //        q.QUOT_SALESPERSONCD,
            //        bd.CODEDESC,
            //        q.QUOTPARTYCD,
            //        c.CUSTNAME;
            //";

            var query = @"
                ;WITH LatestQuot AS (
                    SELECT 
                        i.QUOTEQNO AS InqNo,
                        i.QUOTNO AS QuotNo,
                        i.QUOTENQDATE AS InqDate,
                        i.QuotDate,
                        i.QUOTAMT,
                        i.QUOTDISCOUNTAXAMT,
                        i.QUOT_SALESPERSONCD,
                        i.QUOTPARTYCD,
                        ROW_NUMBER() OVER (PARTITION BY i.QUOTEQNO ORDER BY i.QuotDate DESC, i.QUOTNO DESC) AS rn
                    FROM OQUOTMST i
                )
                SELECT 
                    q.InqNo,
                    q.QuotNo,
                    r1.TRN2REFNO AS RegisNo,
                    q.InqDate,
                    q.QuotDate,
                    q.QUOTAMT AS QuotValBeforeDis,
                    q.QUOTAMT - ISNULL(q.QUOTDISCOUNTAXAMT,0) AS QuotValAfterDis,
                    CASE 
                        WHEN r1.TRN2REFNO IS NOT NULL THEN 'Approved'
                        ELSE 'Unapproved'
                    END AS QuotStatus,
                    CAST(
                        CASE 
                            WHEN q.QUOTAMT IS NULL OR q.QUOTAMT = 0 THEN NULL
                            ELSE (ISNULL(q.QUOTDISCOUNTAXAMT,0) * 100.0) / q.QUOTAMT
                        END 
                    AS DECIMAL(10,2)) AS PercOfDis,
                    r2.TRN1DATE AS RegisDate,
                    SUM(CAST(NULLIF(r1.TRN2TESTRATE, '') AS DECIMAL(18,2))) AS RegisVal,
                    q.QUOT_SALESPERSONCD AS CodeCD,
                    bd.CODEDESC AS BDName,
                    q.QUOTPARTYCD AS ClientId,
                    c.CUSTNAME AS ClientName,
                    CASE 
                        WHEN r1.TRN2REFNO IS NULL AND q.QuotDate IS NOT NULL
                        THEN DATEDIFF(DAY, q.QuotDate, GETDATE())
                        ELSE NULL
                    END AS QuotAgeing
                FROM LatestQuot q
                INNER JOIN OCUSTMST c 
                    ON q.QUOTPARTYCD = c.CUSTACCCODE
                INNER JOIN OCODEMST bd 
                    ON bd.CODECD = q.QUOT_SALESPERSONCD
                LEFT JOIN TRN205 r1 
                    ON r1.TRN2QOTNO = q.QuotNo
                LEFT JOIN TRN105 r2 
                    ON r2.TRN1REFNO = r1.TRN2REFNO
                WHERE q.rn = 1   -- ✅ Only latest quotation per inquiry
                  AND bd.CODETYPE = 'SP'
                  AND (
                      (@DateField = 'inqDate' AND (@FromDate IS NULL OR q.InqDate >= @FromDate) AND (@ToDate IS NULL OR q.InqDate <= @ToDate))
                      OR (@DateField = 'quotDate' AND (@FromDate IS NULL OR q.QuotDate >= @FromDate) AND (@ToDate IS NULL OR q.QuotDate <= @ToDate))
                      OR (@DateField = 'regisDate' AND (@FromDate IS NULL OR r2.TRN1DATE >= @FromDate) AND (@ToDate IS NULL OR r2.TRN1DATE <= @ToDate))
                  )
                  AND (@Year IS NULL OR (
                      (@DateField = 'inqDate' AND YEAR(q.InqDate) = @Year)
                      OR (@DateField = 'quotDate' AND YEAR(q.QuotDate) = @Year)
                      OR (@DateField = 'regisDate' AND YEAR(r2.TRN1DATE) = @Year)
                  ))
                  AND (@Month IS NULL OR (
                      (@DateField = 'inqDate' AND MONTH(q.InqDate) = @Month)
                      OR (@DateField = 'quotDate' AND MONTH(q.QuotDate) = @Month)
                      OR (@DateField = 'regisDate' AND MONTH(r2.TRN1DATE) = @Month)
                  ))
                  AND (@BDName IS NULL OR bd.CODEDESC = @BDName)
                  AND (@ClientName IS NULL OR c.CUSTNAME LIKE '%' + @ClientName + '%')
                GROUP BY 
                    q.InqNo, 
                    q.QuotNo, 
                    r1.TRN2REFNO, 
                    q.InqDate, 
                    q.QuotDate, 
                    q.QUOTAMT, 
                    q.QUOTDISCOUNTAXAMT,
                    r2.TRN1DATE,
                    q.QUOT_SALESPERSONCD,
                    bd.CODEDESC,
                    q.QUOTPARTYCD,
                    c.CUSTNAME;
            ";

            return await connection.QueryAsync<Inquiry>(query, new
            {
                FromDate = fromDate,
                ToDate = toDate,
                Year = year,
                Month = month,
                BDName = bdName,
                ClientName = clientName,
                dateField = dateField
            });
        }
    }
}
