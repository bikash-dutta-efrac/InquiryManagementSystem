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

            //Inquiry driven

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


            //var query = @"
            //    SELECT 
            //        i.QUOTEQNO AS InqNo,
            //        i.QUOTNO AS QuotNo,
            //        r1.TRN2REFNO AS RegisNo,
            //        MIN(i.QUOTENQDATE) AS InqDate,
            //        MIN(i.QuotDate) AS QuotDate,
            //        MIN(i.QUOTAMT) AS QuotValBeforeDis,
            //        MIN(i.QUOTAMT - ISNULL(i.QUOTDISCOUNTAXAMT,0)) AS QuotValAfterDis,
            //        CASE 
            //            WHEN MAX(r1.TRN2REFNO) IS NOT NULL THEN 'Approved'
            //            ELSE 'Unapproved'
            //        END AS QuotStatus,
            //        CAST(
            //            CASE 
            //                WHEN MIN(i.QUOTAMT) IS NULL OR MIN(i.QUOTAMT) = 0 THEN NULL
            //                ELSE (MIN(ISNULL(i.QUOTDISCOUNTAXAMT,0)) * 100.0) / MIN(i.QUOTAMT)
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
            //      AND (@BDName IS NULL OR bd.CODEDESC = @BDName)
            //      AND (@ClientName IS NULL OR c.CUSTNAME LIKE '%' + @ClientName + '%')
            //      AND (
            //          (@DateField = 'inqDate' AND (@FromDate IS NULL OR i.QUOTENQDATE >= @FromDate) AND (@ToDate IS NULL OR i.QUOTENQDATE <= @ToDate))
            //          OR (@DateField = 'quotDate' AND (@FromDate IS NULL OR i.QuotDate >= @FromDate) AND (@ToDate IS NULL OR i.QuotDate <= @ToDate))
            //          OR (@DateField = 'regisDate' AND (@FromDate IS NULL OR r2.TRN1DATE >= @FromDate) AND (@ToDate IS NULL OR r2.TRN1DATE <= @ToDate))
            //      )
            //      AND (@Year IS NULL OR (
            //          (@DateField = 'inqDate' AND YEAR(i.QUOTENQDATE) = @Year)
            //          OR (@DateField = 'quotDate' AND YEAR(i.QuotDate) = @Year)
            //          OR (@DateField = 'regisDate' AND YEAR(r2.TRN1DATE) = @Year)
            //      ))
            //      AND (@Month IS NULL OR (
            //          (@DateField = 'inqDate' AND MONTH(i.QUOTENQDATE) = @Month)
            //          OR (@DateField = 'quotDate' AND MONTH(i.QuotDate) = @Month)
            //          OR (@DateField = 'regisDate' AND MONTH(r2.TRN1DATE) = @Month)
            //      ))
            //    GROUP BY 
            //        i.QUOTEQNO, 
            //        i.QUOTNO, 
            //        r1.TRN2REFNO;
            //";

            //var query = @"
            //SELECT 
            //    i.QUOTEQNO AS InqNo,
            //    i.QUOTNO AS QuotNo,
            //    r1.TRN2REFNO AS RegisNo,
            //    MIN(i.QUOTENQDATE) AS InqDate,
            //    MIN(i.QuotDate) AS QuotDate,
            //    MIN(i.QUOTAMT) AS QuotValBeforeDis,
            //    MIN(i.QUOTAMT - ISNULL(i.QUOTDISCOUNTAXAMT,0)) AS QuotValAfterDis,
            //    CASE 
            //        WHEN MAX(r1.TRN2REFNO) IS NOT NULL THEN 'Approved'
            //        ELSE 'Unapproved'
            //    END AS QuotStatus,
            //    CAST(
            //        CASE 
            //            WHEN MIN(i.QUOTAMT) IS NULL OR MIN(i.QUOTAMT) = 0 THEN NULL
            //            ELSE (MIN(ISNULL(i.QUOTDISCOUNTAXAMT,0)) * 100.0) / MIN(i.QUOTAMT)
            //        END 
            //    AS DECIMAL(10,2)) AS PercOfDis,
            //    MIN(r2.TRN1DATE) AS RegisDate,
            //    --SUM(CAST(NULLIF(r1.TRN2TESTRATE, '') AS DECIMAL(18,2))) AS RegisVal,
            //    SUM(CAST(NULLIF(r1.TRN2TESTRATE, '') AS DECIMAL(18,2))) 
            //        * ( (MIN(i.QUOTAMT) - MIN(ISNULL(i.QUOTDISCOUNTAXAMT,0))) / NULLIF(MIN(i.QUOTAMT),0) ) AS RegisVal,
            //    MIN(i.QUOT_SALESPERSONCD) AS CodeCD,
            //    MIN(bd.CODEDESC) AS BDName,
            //    MIN(i.QUOTPARTYCD) AS ClientId,
            //    MIN(c.CUSTNAME) AS ClientName,
            //    MAX(
            //        CASE 
            //            WHEN r1.TRN2REFNO IS NOT NULL THEN NULL   -- Registered → no ageing
            //            WHEN i.QuotDate IS NULL THEN NULL         -- No quotation date → no ageing
            //            ELSE DATEDIFF(DAY, i.QuotDate, GETDATE()) -- Unregistered → ageing
            //        END
            //    ) AS QuotAgeing
            //FROM OQUOTMST i
            //INNER JOIN OCUSTMST c 
            //    ON i.QUOTPARTYCD = c.CUSTACCCODE
            //INNER JOIN OCODEMST bd 
            //    ON bd.CODECD = i.QUOT_SALESPERSONCD
            //LEFT JOIN TRN205 r1 
            //    ON r1.TRN2QOTNO = i.QUOTNO
            //LEFT JOIN TRN105 r2 
            //    ON r2.TRN1REFNO = r1.TRN2REFNO
            //WHERE bd.CODETYPE = 'SP'
            //  AND (@BDName IS NULL OR bd.CODEDESC = @BDName)
            //  AND (@ClientName IS NULL OR c.CUSTNAME LIKE '%' + @ClientName + '%')
            //  AND (
            //      (@DateField = 'inqDate' AND (@FromDate IS NULL OR i.QUOTENQDATE >= @FromDate) AND (@ToDate IS NULL OR i.QUOTENQDATE <= @ToDate))
            //      OR (@DateField = 'quotDate' AND (@FromDate IS NULL OR i.QuotDate >= @FromDate) AND (@ToDate IS NULL OR i.QuotDate <= @ToDate))
            //      OR (@DateField = 'regisDate' AND (@FromDate IS NULL OR r2.TRN1DATE >= @FromDate) AND (@ToDate IS NULL OR r2.TRN1DATE <= @ToDate))
            //  )
            //  AND (@Year IS NULL OR (
            //      (@DateField = 'inqDate' AND YEAR(i.QUOTENQDATE) = @Year)
            //      OR (@DateField = 'quotDate' AND YEAR(i.QuotDate) = @Year)
            //      OR (@DateField = 'regisDate' AND YEAR(r2.TRN1DATE) = @Year)
            //  ))
            //  AND (@Month IS NULL OR (
            //      (@DateField = 'inqDate' AND MONTH(i.QUOTENQDATE) = @Month)
            //      OR (@DateField = 'quotDate' AND MONTH(i.QuotDate) = @Month)
            //      OR (@DateField = 'regisDate' AND MONTH(r2.TRN1DATE) = @Month)
            //  ))
            //GROUP BY 
            //    i.QUOTEQNO, 
            //    i.QUOTNO, 
            //    r1.TRN2REFNO;
            //";

            //            var query = @"
            //;WITH LatestQuot AS (
            //    SELECT 
            //        i.QUOTEQNO,
            //        MAX(i.QuotDate) AS MaxQuotDate
            //    FROM OQUOTMST i
            //    GROUP BY i.QUOTEQNO
            //),
            //LatestQuotNo AS (
            //    SELECT 
            //        i.QUOTEQNO,
            //        MAX(i.QUOTNO) AS MaxQuotNo
            //    FROM OQUOTMST i
            //    INNER JOIN LatestQuot lq
            //        ON i.QUOTEQNO = lq.QUOTEQNO
            //       AND i.QuotDate = lq.MaxQuotDate
            //    GROUP BY i.QUOTEQNO
            //)
            //SELECT 
            //    i.QUOTEQNO AS InqNo,
            //    i.QUOTNO AS QuotNo,
            //    r1.TRN2REFNO AS RegisNo,
            //    MIN(i.QUOTENQDATE) AS InqDate,
            //    MIN(i.QuotDate) AS QuotDate,
            //    MIN(i.QUOTAMT) AS QuotValBeforeDis,
            //    MIN(i.QUOTAMT - ISNULL(i.QUOTDISCOUNTAXAMT,0)) AS QuotValAfterDis,
            //    CASE 
            //        WHEN MAX(r1.TRN2REFNO) IS NOT NULL THEN 'Approved'
            //        ELSE 'Unapproved'
            //    END AS QuotStatus,
            //    CAST(
            //        CASE 
            //            WHEN MIN(i.QUOTAMT) IS NULL OR MIN(i.QUOTAMT) = 0 THEN NULL
            //            ELSE (MIN(ISNULL(i.QUOTDISCOUNTAXAMT,0)) * 100.0) / MIN(i.QUOTAMT)
            //        END 
            //    AS DECIMAL(10,2)) AS PercOfDis,
            //    MIN(r2.TRN1DATE) AS RegisDate,
            //    SUM(CAST(NULLIF(r1.TRN2TESTRATE, '') AS DECIMAL(18,2))) 
            //        * ( (MIN(i.QUOTAMT) - MIN(ISNULL(i.QUOTDISCOUNTAXAMT,0))) / NULLIF(MIN(i.QUOTAMT),0) ) AS RegisVal,
            //    MIN(i.QUOT_SALESPERSONCD) AS CodeCD,
            //    MIN(bd.CODEDESC) AS BDName,
            //    MIN(i.QUOTPARTYCD) AS ClientId,
            //    MIN(c.CUSTNAME) AS ClientName,
            //    MAX(
            //        CASE 
            //            WHEN r1.TRN2REFNO IS NOT NULL THEN NULL   -- Registered → no ageing
            //            WHEN i.QuotDate IS NULL THEN NULL         -- No quotation date → no ageing
            //            ELSE DATEDIFF(DAY, i.QuotDate, GETDATE()) -- Unregistered → ageing
            //        END
            //    ) AS QuotAgeing
            //FROM OQUOTMST i
            //INNER JOIN LatestQuotNo lqn
            //    ON i.QUOTEQNO = lqn.QUOTEQNO
            //   AND i.QUOTNO   = lqn.MaxQuotNo   -- ✅ keep only rows for latest QuotNo per inquiry
            //INNER JOIN OCUSTMST c 
            //    ON i.QUOTPARTYCD = c.CUSTACCCODE
            //INNER JOIN OCODEMST bd 
            //    ON bd.CODECD = i.QUOT_SALESPERSONCD
            //LEFT JOIN TRN205 r1 
            //    ON r1.TRN2QOTNO = i.QUOTNO
            //LEFT JOIN TRN105 r2 
            //    ON r2.TRN1REFNO = r1.TRN2REFNO
            //WHERE bd.CODETYPE = 'SP'
            //  AND (@BDName IS NULL OR bd.CODEDESC = @BDName)
            //  AND (@ClientName IS NULL OR c.CUSTNAME LIKE '%' + @ClientName + '%')
            //  AND (
            //      (@DateField = 'inqDate' AND (@FromDate IS NULL OR i.QUOTENQDATE >= @FromDate) AND (@ToDate IS NULL OR i.QUOTENQDATE <= @ToDate))
            //      OR (@DateField = 'quotDate' AND (@FromDate IS NULL OR i.QuotDate >= @FromDate) AND (@ToDate IS NULL OR i.QuotDate <= @ToDate))
            //      OR (@DateField = 'regisDate' AND (@FromDate IS NULL OR r2.TRN1DATE >= @FromDate) AND (@ToDate IS NULL OR r2.TRN1DATE <= @ToDate))
            //  )
            //  AND (@Year IS NULL OR (
            //      (@DateField = 'inqDate' AND YEAR(i.QUOTENQDATE) = @Year)
            //      OR (@DateField = 'quotDate' AND YEAR(i.QuotDate) = @Year)
            //      OR (@DateField = 'regisDate' AND YEAR(r2.TRN1DATE) = @Year)
            //  ))
            //  AND (@Month IS NULL OR (
            //      (@DateField = 'inqDate' AND MONTH(i.QUOTENQDATE) = @Month)
            //      OR (@DateField = 'quotDate' AND MONTH(i.QuotDate) = @Month)
            //      OR (@DateField = 'regisDate' AND MONTH(r2.TRN1DATE) = @Month)
            //  ))
            //GROUP BY 
            //    i.QUOTEQNO, 
            //    i.QUOTNO, 
            //    r1.TRN2REFNO;


            //";

            //Quotation driven

            //            var query = @"
            //WITH Quotations AS (
            //    SELECT 
            //        i.QUOTNO AS QuotNo,
            //        i.QUOTEQNO AS InqNo,
            //        i.QUOTENQDATE AS InqDate,
            //        i.QuotDate,
            //        i.QUOTAMT AS QuotValBeforeDis,
            //        i.QUOTAMT - ISNULL(i.QUOTDISCOUNTAXAMT,0) AS QuotValAfterDis,
            //        i.QUOTDISCOUNTAXAMT,
            //        i.QUOTSEMPLECHARGE,
            //        i.USDTO_INRMISC_CHARGE,
            //        i.QUOT_SALESPERSONCD AS CodeCD,
            //        bd.CODEDESC AS BDName,
            //        i.QUOTPARTYCD AS ClientId,
            //        c.CUSTNAME AS ClientName
            //    FROM OQUOTMST i
            //    INNER JOIN OCUSTMST c 
            //        ON i.QUOTPARTYCD = c.CUSTACCCODE
            //    INNER JOIN OCODEMST bd 
            //        ON bd.CODECD = i.QUOT_SALESPERSONCD
            //    WHERE bd.CODETYPE = 'SP'
            //      AND (@BDName IS NULL OR bd.CODEDESC = @BDName)
            //      AND (@ClientName IS NULL OR c.CUSTNAME LIKE '%' + @ClientName + '%')
            //),
            //Registrations AS (
            //    SELECT 
            //        r1.TRN2QOTNO AS QuotNo,
            //        r1.TRN2REFNO AS RegisNo,
            //        SUM(CAST(NULLIF(r1.TRN2TESTRATE, '') AS DECIMAL(18,2))) AS TotalRate
            //    FROM TRN205 r1
            //    GROUP BY r1.TRN2QOTNO, r1.TRN2REFNO
            //)
            //SELECT 
            //    q.InqNo,
            //    q.QuotNo,
            //    r.RegisNo,
            //    q.InqDate,
            //    q.QuotDate,
            //    q.QuotValBeforeDis,
            //    q.QuotValAfterDis,
            //    CASE 
            //        WHEN r.RegisNo IS NOT NULL THEN 'Approved'
            //        ELSE 'Unapproved'
            //    END AS QuotStatus,
            //    CAST(
            //        CASE 
            //            WHEN q.QuotValBeforeDis IS NULL OR q.QuotValBeforeDis = 0 THEN NULL
            //            ELSE (ISNULL(q.QUOTDISCOUNTAXAMT,0) * 100.0) / q.QuotValBeforeDis
            //        END 
            //    AS DECIMAL(10,2)) AS PercOfDis,
            //    r2.TRN1DATE AS RegisDate,
            //    CASE 
            //        WHEN r2.TRN1CANCEL = 'Y' THEN 0
            //        ELSE (r.TotalRate * ( q.QuotValAfterDis / NULLIF(q.QuotValBeforeDis,0) ))
            //             + ISNULL(q.QUOTSEMPLECHARGE,0)
            //             + ISNULL(q.USDTO_INRMISC_CHARGE,0)
            //    END AS RegisVal,
            //    q.CodeCD,
            //    q.BDName,
            //    q.ClientId,
            //    q.ClientName,
            //    CASE 
            //        WHEN r.RegisNo IS NOT NULL THEN NULL   
            //        WHEN q.QuotDate IS NULL THEN NULL         
            //        ELSE DATEDIFF(DAY, q.QuotDate, GETDATE()) 
            //    END AS QuotAgeing
            //FROM Quotations q
            //LEFT JOIN Registrations r 
            //    ON r.QuotNo = q.QuotNo
            //LEFT JOIN TRN105 r2 
            //    ON r2.TRN1REFNO = r.RegisNo
            //WHERE
            //    (
            //        @DateField = 'inqDate'
            //        AND (@FromDate IS NULL OR q.InqDate >= @FromDate)
            //        AND (@ToDate IS NULL OR q.InqDate <= @ToDate)
            //        AND (@Year IS NULL OR YEAR(q.InqDate) = @Year)
            //        AND (@Month IS NULL OR MONTH(q.InqDate) = @Month)
            //    )
            //    OR (
            //        @DateField = 'quotDate'
            //        AND (@FromDate IS NULL OR q.QuotDate >= @FromDate)
            //        AND (@ToDate IS NULL OR q.QuotDate <= @ToDate)
            //        AND (@Year IS NULL OR YEAR(q.QuotDate) = @Year)
            //        AND (@Month IS NULL OR MONTH(q.QuotDate) = @Month)
            //    )
            //    OR (
            //        @DateField = 'regisDate'
            //        AND (@FromDate IS NULL OR r2.TRN1DATE >= @FromDate)
            //        AND (@ToDate IS NULL OR r2.TRN1DATE <= @ToDate)
            //        AND (@Year IS NULL OR YEAR(r2.TRN1DATE) = @Year)
            //        AND (@Month IS NULL OR MONTH(r2.TRN1DATE) = @Month)
            //    )
            //ORDER BY q.QuotNo, r2.TRN1DATE;
            //";

            //var query = @"
            //    SELECT 
            //        i.QUOTNO AS QuotNo,
            //        i.QUOTEQNO AS InqNo, -- inquiry reference, now secondary
            //        r1.TRN2REFNO AS RegisNo,
            //        MIN(i.QuotDate) AS QuotDate,
            //        MIN(i.QUOTENQDATE) AS InqDate,
            //        MIN(i.QUOTAMT) AS QuotValBeforeDis,
            //        MIN(i.QUOTAMT - ISNULL(i.QUOTDISCOUNTAXAMT,0)) AS QuotValAfterDis,
            //        CASE 
            //            WHEN MAX(r1.TRN2REFNO) IS NOT NULL THEN 'Approved'
            //            ELSE 'Unapproved'
            //        END AS QuotStatus,
            //        CAST(
            //            CASE 
            //                WHEN MIN(i.QUOTAMT) IS NULL OR MIN(i.QUOTAMT) = 0 THEN NULL
            //                ELSE (MIN(ISNULL(i.QUOTDISCOUNTAXAMT,0)) * 100.0) / MIN(i.QUOTAMT)
            //            END 
            //        AS DECIMAL(10,2)) AS PercOfDis,
            //        MIN(r2.TRN1DATE) AS RegisDate,
            //        CASE 
            //            WHEN MAX(r2.TRN1CANCEL) = 'Y' THEN 0
            //            ELSE 
            //                (
            //                    SUM(CAST(NULLIF(r1.TRN2TESTRATE, '') AS DECIMAL(18,2))) 
            //                    * ( (MIN(i.QUOTAMT) - MIN(ISNULL(i.QUOTDISCOUNTAXAMT,0))) / NULLIF(MIN(i.QUOTAMT),0) )
            //                )
            //                + MIN(ISNULL(i.QUOTSEMPLECHARGE,0))
            //                + MIN(ISNULL(i.QUOTMISC,0))
            //                + MIN(ISNULL(i.QUOTHCC,0))
            //        END AS RegisVal,
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
            //      AND (@BDName IS NULL OR bd.CODEDESC = @BDName)
            //      AND (@ClientName IS NULL OR c.CUSTNAME LIKE '%' + @ClientName + '%')
            //      AND (
            //          (@DateField = 'inqDate' AND (@FromDate IS NULL OR i.QUOTENQDATE >= @FromDate) AND (@ToDate IS NULL OR i.QUOTENQDATE <= @ToDate))
            //          OR (@DateField = 'quotDate' AND (@FromDate IS NULL OR i.QuotDate >= @FromDate) AND (@ToDate IS NULL OR i.QuotDate <= @ToDate))
            //          OR (@DateField = 'regisDate' AND (@FromDate IS NULL OR r2.TRN1DATE >= @FromDate) AND (@ToDate IS NULL OR r2.TRN1DATE <= @ToDate))
            //      )
            //      AND (@Year IS NULL OR (
            //          (@DateField = 'inqDate' AND YEAR(i.QUOTENQDATE) = @Year)
            //          OR (@DateField = 'quotDate' AND YEAR(i.QuotDate) = @Year)
            //          OR (@DateField = 'regisDate' AND YEAR(r2.TRN1DATE) = @Year)
            //      ))
            //      AND (@Month IS NULL OR (
            //          (@DateField = 'inqDate' AND MONTH(i.QUOTENQDATE) = @Month)
            //          OR (@DateField = 'quotDate' AND MONTH(i.QuotDate) = @Month)
            //          OR (@DateField = 'regisDate' AND MONTH(r2.TRN1DATE) = @Month)
            //      ))
            //    GROUP BY 
            //        i.QUOTNO, 
            //        i.QUOTEQNO, 
            //        r1.TRN2REFNO;
            //";

            //            var query = @"
            //;WITH QuotationsWithReg AS
            //(
            //    SELECT 
            //        i.QUOTNO,
            //        i.QUOTEQNO,
            //        r1.TRN2REFNO,
            //        i.QuotDate,
            //        i.QUOTENQDATE,
            //        i.QUOTAMT,
            //        i.QUOTDISCOUNTAXAMT,
            //        i.QUOT_SALESPERSONCD,
            //        bd.CODEDESC AS BDName,       -- BDName carried here
            //        i.QUOTPARTYCD,
            //        c.CUSTNAME AS ClientName,    -- ClientName carried here
            //        i.QUOTSEMPLECHARGE,
            //        i.QUOTMISC,
            //        i.QUOTHCC,
            //        r1.TRN2TESTRATE,
            //        r2.TRN1DATE,
            //        r2.TRN1CANCEL,
            //        ROW_NUMBER() OVER (PARTITION BY i.QUOTNO ORDER BY r2.TRN1DATE, r1.TRN2REFNO) AS RegRank
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
            //      AND (@BDName IS NULL OR bd.CODEDESC = @BDName)
            //      AND (@ClientName IS NULL OR c.CUSTNAME LIKE '%' + @ClientName + '%')
            //      AND (
            //          (@DateField = 'inqDate' AND (@FromDate IS NULL OR i.QUOTENQDATE >= @FromDate) AND (@ToDate IS NULL OR i.QUOTENQDATE <= @ToDate))
            //          OR (@DateField = 'quotDate' AND (@FromDate IS NULL OR i.QuotDate >= @FromDate) AND (@ToDate IS NULL OR i.QuotDate <= @ToDate))
            //          OR (@DateField = 'regisDate' AND (@FromDate IS NULL OR r2.TRN1DATE >= @FromDate) AND (@ToDate IS NULL OR r2.TRN1DATE <= @ToDate))
            //      )
            //      AND (@Year IS NULL OR (
            //          (@DateField = 'inqDate' AND YEAR(i.QUOTENQDATE) = @Year)
            //          OR (@DateField = 'quotDate' AND YEAR(i.QuotDate) = @Year)
            //          OR (@DateField = 'regisDate' AND YEAR(r2.TRN1DATE) = @Year)
            //      ))
            //      AND (@Month IS NULL OR (
            //          (@DateField = 'inqDate' AND MONTH(i.QUOTENQDATE) = @Month)
            //          OR (@DateField = 'quotDate' AND MONTH(i.QuotDate) = @Month)
            //          OR (@DateField = 'regisDate' AND MONTH(r2.TRN1DATE) = @Month)
            //      ))
            //)
            //SELECT 
            //    q.QUOTNO AS QuotNo,
            //    q.QUOTEQNO AS InqNo,
            //    q.TRN2REFNO AS RegisNo,
            //    MIN(q.QuotDate) AS QuotDate,
            //    MIN(q.QUOTENQDATE) AS InqDate,
            //    MIN(q.QUOTAMT) AS QuotValBeforeDis,
            //    MIN(q.QUOTAMT - ISNULL(q.QUOTDISCOUNTAXAMT,0)) AS QuotValAfterDis,
            //    CASE 
            //        WHEN MAX(q.TRN2REFNO) IS NOT NULL THEN 'Approved'
            //        ELSE 'Unapproved'
            //    END AS QuotStatus,
            //    CAST(
            //        CASE 
            //            WHEN MIN(q.QUOTAMT) IS NULL OR MIN(q.QUOTAMT) = 0 THEN NULL
            //            ELSE (MIN(ISNULL(q.QUOTDISCOUNTAXAMT,0)) * 100.0) / MIN(q.QUOTAMT)
            //        END 
            //    AS DECIMAL(10,2)) AS PercOfDis,
            //    MIN(q.TRN1DATE) AS RegisDate,
            //    CASE 
            //        WHEN MAX(q.TRN1CANCEL) = 'Y' THEN 0
            //        ELSE 
            //            (
            //                SUM(CAST(NULLIF(q.TRN2TESTRATE, '') AS DECIMAL(18,2))) 
            //                * ( (MIN(q.QUOTAMT) - MIN(ISNULL(q.QUOTDISCOUNTAXAMT,0))) / NULLIF(MIN(q.QUOTAMT),0) )
            //            )
            //            + CASE WHEN MIN(q.RegRank) = 1 
            //                   THEN MIN(ISNULL(q.QUOTSEMPLECHARGE,0)) 
            //                        + MIN(ISNULL(q.QUOTMISC,0)) 
            //                        + MIN(ISNULL(q.QUOTHCC,0)) 
            //                   ELSE 0 END
            //    END AS RegisVal,
            //    MIN(q.QUOT_SALESPERSONCD) AS CodeCD,
            //    MIN(q.BDName) AS BDName,
            //    MIN(q.QUOTPARTYCD) AS ClientId,
            //    MIN(q.ClientName) AS ClientName,
            //    MAX(
            //        CASE 
            //            WHEN q.TRN2REFNO IS NOT NULL THEN NULL   -- Registered → no ageing
            //            WHEN q.QuotDate IS NULL THEN NULL        -- No quotation date → no ageing
            //            ELSE DATEDIFF(DAY, q.QuotDate, GETDATE()) -- Unregistered → ageing
            //        END
            //    ) AS QuotAgeing
            //FROM QuotationsWithReg q
            //GROUP BY 
            //    q.QUOTNO, 
            //    q.QUOTEQNO, 
            //    q.TRN2REFNO;

            //";

            var query = @"
;WITH QuotationsWithReg AS
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
        i.QUOTUSD,         -- ✅ currency flag
        i.USDRATE,         -- ✅ conversion rate
        r1.TRN2TESTRATE,
        r2.TRN1DATE,
        r2.TRN1CANCEL,
        ROW_NUMBER() OVER (PARTITION BY i.QUOTNO ORDER BY r2.TRN1DATE, r1.TRN2REFNO) AS RegRank
    FROM OQUOTMST i
    INNER JOIN OCUSTMST c 
        ON i.QUOTPARTYCD = c.CUSTACCCODE
    INNER JOIN OCODEMST bd 
        ON bd.CODECD = i.QUOT_SALESPERSONCD
    LEFT JOIN TRN205 r1 
        ON r1.TRN2QOTNO = i.QUOTNO
    LEFT JOIN TRN105 r2 
        ON r2.TRN1REFNO = r1.TRN2REFNO
    WHERE bd.CODETYPE = 'SP'
      AND (@BDName IS NULL OR bd.CODEDESC = @BDName)
      AND (@ClientName IS NULL OR c.CUSTNAME LIKE '%' + @ClientName + '%')
      AND (
          (@DateField = 'inqDate' AND (@FromDate IS NULL OR i.QUOTENQDATE >= @FromDate) AND (@ToDate IS NULL OR i.QUOTENQDATE <= @ToDate))
          OR (@DateField = 'quotDate' AND (@FromDate IS NULL OR i.QuotDate >= @FromDate) AND (@ToDate IS NULL OR i.QuotDate <= @ToDate))
          OR (@DateField = 'regisDate' AND (@FromDate IS NULL OR r2.TRN1DATE >= @FromDate) AND (@ToDate IS NULL OR r2.TRN1DATE <= @ToDate))
      )
      AND (@Year IS NULL OR (
          (@DateField = 'inqDate' AND YEAR(i.QUOTENQDATE) = @Year)
          OR (@DateField = 'quotDate' AND YEAR(i.QuotDate) = @Year)
          OR (@DateField = 'regisDate' AND YEAR(r2.TRN1DATE) = @Year)
      ))
      AND (@Month IS NULL OR (
          (@DateField = 'inqDate' AND MONTH(i.QUOTENQDATE) = @Month)
          OR (@DateField = 'quotDate' AND MONTH(i.QuotDate) = @Month)
          OR (@DateField = 'regisDate' AND MONTH(r2.TRN1DATE) = @Month)
      ))
)
SELECT 
    q.QUOTNO AS QuotNo,
    q.QUOTEQNO AS InqNo,
    q.TRN2REFNO AS RegisNo,
    MIN(q.QuotDate) AS QuotDate,
    MIN(q.QUOTENQDATE) AS InqDate,

    -- ✅ QuotValBeforeDis (USD conversion if needed)
    CASE WHEN MAX(q.QUOTUSD) = 'Y'
         THEN MIN(q.QUOTAMT) * MAX(q.USDRATE)
         ELSE MIN(q.QUOTAMT) END AS QuotValBeforeDis,

    -- ✅ QuotValAfterDis (USD conversion if needed)
    CASE WHEN MAX(q.QUOTUSD) = 'Y'
         THEN (MIN(q.QUOTAMT - ISNULL(q.QUOTDISCOUNTAXAMT,0))) * MAX(q.USDRATE)
         ELSE MIN(q.QUOTAMT - ISNULL(q.QUOTDISCOUNTAXAMT,0)) END AS QuotValAfterDis,

    CASE 
        WHEN MAX(q.TRN2REFNO) IS NOT NULL THEN 'Approved'
        ELSE 'Unapproved'
    END AS QuotStatus,

    CAST(
        CASE 
            WHEN MIN(q.QUOTAMT) IS NULL OR MIN(q.QUOTAMT) = 0 THEN NULL
            ELSE (MIN(ISNULL(q.QUOTDISCOUNTAXAMT,0)) * 100.0) / MIN(q.QUOTAMT)
        END 
    AS DECIMAL(10,2)) AS PercOfDis,

    MIN(q.TRN1DATE) AS RegisDate,

    -- ✅ RegisVal (USD conversion if needed)
    CASE 
        WHEN MAX(q.TRN1CANCEL) = 'Y' THEN 0
        ELSE 
            CASE WHEN MAX(q.QUOTUSD) = 'Y' 
                 THEN (
                        (
                            SUM(CAST(NULLIF(q.TRN2TESTRATE, '') AS DECIMAL(18,2))) 
                            * ( (MIN(q.QUOTAMT) - MIN(ISNULL(q.QUOTDISCOUNTAXAMT,0))) / NULLIF(MIN(q.QUOTAMT),0) )
                        )
                        + CASE WHEN MIN(q.RegRank) = 1 
                               THEN MIN(ISNULL(q.QUOTSEMPLECHARGE,0)) 
                                    + MIN(ISNULL(q.QUOTMISC,0)) 
                                    + MIN(ISNULL(q.QUOTHCC,0)) 
                               ELSE 0 END
                      ) * MAX(q.USDRATE)   -- USD applied
                 ELSE (
                        (
                            SUM(CAST(NULLIF(q.TRN2TESTRATE, '') AS DECIMAL(18,2))) 
                            * ( (MIN(q.QUOTAMT) - MIN(ISNULL(q.QUOTDISCOUNTAXAMT,0))) / NULLIF(MIN(q.QUOTAMT),0) )
                        )
                        + CASE WHEN MIN(q.RegRank) = 1 
                               THEN MIN(ISNULL(q.QUOTSEMPLECHARGE,0)) 
                                    + MIN(ISNULL(q.QUOTMISC,0)) 
                                    + MIN(ISNULL(q.QUOTHCC,0)) 
                               ELSE 0 END
                      ) 
            END
    END AS RegisVal,

    MIN(q.QUOT_SALESPERSONCD) AS CodeCD,
    MIN(q.BDName) AS BDName,
    MIN(q.QUOTPARTYCD) AS ClientId,
    MIN(q.ClientName) AS ClientName,

    MAX(
        CASE 
            WHEN q.TRN2REFNO IS NOT NULL THEN NULL
            WHEN q.QuotDate IS NULL THEN NULL
            ELSE DATEDIFF(DAY, q.QuotDate, GETDATE())
        END
    ) AS QuotAgeing
FROM QuotationsWithReg q
GROUP BY 
    q.QUOTNO, 
    q.QUOTEQNO, 
    q.TRN2REFNO;

";

            return await connection.QueryAsync<Inquiry>(query, new
            {
                FromDate = fromDate,
                ToDate = toDate,
                Year = year,
                Month = month,
                BDName = bdName,
                ClientName = clientName,
                DateField = dateField
            });
        }
    }
}
