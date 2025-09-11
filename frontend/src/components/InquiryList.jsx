import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileSpreadsheet,
  FileDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function InquiryList({ data = [], queryType }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showTable, setShowTable] = useState(true);
  const itemsPerPage = 20;

  // ✅ Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  if (!data.length) {
    return (
      <div className="text-center text-gray-600 py-10 text-lg">
        🚫 No inquiries found
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // ✅ Export to CSV
  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((inq) => ({
        InquiryNo: inq.inqNo ?? "-",
        InquiryDate: inq.inqDate
          ? new Date(inq.inqDate).toLocaleDateString()
          : "-",
        QuoteNo: inq.quotNo ?? "-",
        QuoteDate: inq.quotDate
          ? new Date(inq.quotDate).toLocaleDateString()
          : "-",
        "Quota Before Discount": Math.round(inq.quotaValBeforeDis) ?? "-",
        "Quota After Discount": Math.round(inq.quotaValAfterDis) ?? "-",
        "Quote Ageing": inq.quoteAgeing ?? "-",
        "% Discount": inq.percOfDis ?? "-",
        RegisNo: inq.regisNo ?? "-",
        RegisDate: inq.regisDate
          ? new Date(inq.regisDate).toLocaleDateString()
          : "-",
        RegisVal: Math.round(inq.regisVal) ?? "-",
        BD: inq.bdName ?? "-",
        Client: inq.clientName ?? "-",
        Status: inq.regisNo ? "Registered" : "Not Registered",
      }))
    );

    // Convert sheet to CSV
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

    // Save as .csv
    saveAs(
      new Blob([csvOutput], { type: "text/csv;charset=utf-8;" }),
      "inquiries.csv"
    );
  };

  // ✅ Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.setFontSize(14);
    doc.text("Customer Inquiries", 40, 30);

    const tableColumn = [
      "Inquiry No",
      "Inquiry Date",
      "Quotation No",
      "Quotation Date",
      "Quotation Value (Before Discount)",
      "Quotation Value (After Discount)",
      "Quotation Ageing",
      "Quotation Status",
      "Discount (%)",
      "Reg. No",
      "Reg. Date",
      "Reg. Val",
      "BD Name",
      "Client Name",
    ];
    const tableRows = data.map((inq) => [
      inq.inqNo ?? "-",
      inq.inqDate ? new Date(inq.inqDate).toLocaleDateString() : "-",
      inq.quotNo ?? "-",
      inq.quotDate ? new Date(inq.quotDate).toLocaleDateString() : "-",
      Math.round(inq.quotValBeforeDis) ?? "-",
      Math.round(inq.quotValAfterDis) ?? "-",
      inq.quotAgeing ?? "-",
      inq.quotStatus ?? "-",
      inq.percOfDis ?? "-",
      inq.regisNo ?? "-",
      inq.regisDate ? new Date(inq.regisDate).toLocaleDateString() : "-",
      Math.round(inq.regisVal) ?? "-",
      inq.bdName ?? "-",
      inq.clientName ?? "-",
      inq.regisNo ? "Registered" : "Not Registered",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      styles: { fontSize: 8 },
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save("inquiries.pdf");
  };

  // ✅ Reusable Pagination Component
  const Pagination = () =>
    totalPages > 1 && (
      <div className="flex justify-center items-center gap-2 my-6 flex-wrap">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        {getPageNumbers().map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={`px-3 py-1 rounded-md transition ${
              num === currentPage
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* 📂 Expand Button */}
      <div className="flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-inner">
        <h2 className="text-lg font-semibold text-gray-800">
          Inquiry List ({data.length})
        </h2>
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow hover:opacity-90 transition"
        >
          {showTable ? (
            <>
              <ChevronUp className="w-5 h-5" /> Hide Table
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" /> Show Table
            </>
          )}
        </button>
      </div>

      {/* 📑 Collapsible Table */}
      {showTable && (
        <div className="space-y-6 animate-fadeIn">
          {/* Export buttons */}
          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition"
            >
              <FileDown className="w-5 h-5" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>

          {/* 🔝 Top Pagination */}
          <Pagination />

          <div className="overflow-x-auto bg-white border rounded-lg shadow-lg">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                <tr>
                  {/* Inquiry Columns */}
                  {queryType === "inqDate" && (
                    <>
                      <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                        Inquiry No
                      </th>
                      <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                        Inquiry Date
                      </th>
                    </>
                  )}

                  {/* Quotation Columns */}
                  {queryType !== "regisDate" && (
                    <>
                      <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                        Quotation No
                      </th>
                      <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                        Quotation Date
                      </th>
                      <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                        Quotation Value
                        <br />
                        (Before Discount)
                      </th>
                      <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                        Quotation Value
                        <br />
                        (After Discount)
                      </th>
                      <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                        Quotation Status
                      </th>
                      <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                        Quotation
                        <br />
                        Ageing
                      </th>
                      <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                        Discount
                        <br />
                        (%)
                      </th>
                    </>
                  )}

                  {/* Registration + Always Visible */}
                  <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                    Registration No
                  </th>
                  <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                    Registration
                    <br />
                    Date
                  </th>
                  <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                    Registration
                    <br />
                    Value
                  </th>
                  <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                    BD Name
                  </th>
                  <th className="border text-sm px-3 py-2 whitespace-nowrap w-auto">
                    Client Name
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((inq, idx) => (
                  <tr
                    key={`${inq.inqNo}-${idx}`}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition`}
                  >
                    {/* Inquiry Columns */}
                    {queryType === "inqDate" && (
                      <>
                        <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                          {inq.inqNo ?? "-"}
                        </td>
                        <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                          {inq.inqDate
                            ? new Date(inq.inqDate).toLocaleDateString()
                            : "-"}
                        </td>
                      </>
                    )}

                    {/* Quotation Columns */}
                    {queryType !== "regisDate" && (
                      <>
                        <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                          {inq.quotNo ?? "-"}
                        </td>
                        <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                          {inq.quotDate
                            ? new Date(inq.quotDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                          {Math.round(inq.quotValBeforeDis) ?? "-"}
                        </td>
                        <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                          {Math.round(inq.quotValAfterDis) ?? "-"}
                        </td>
                        <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                          {inq.quotStatus ?? "-"}
                        </td>
                        <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                          {inq.quotAgeing ?? "-"}
                        </td>
                        <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                          {inq.percOfDis ?? "-"}
                        </td>
                      </>
                    )}

                    {/* Registration + Always Visible */}
                    <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                      {inq.regisNo ?? "-"}
                    </td>
                    <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                      {inq.regisDate
                        ? new Date(inq.regisDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                      {Math.round(inq.regisVal) ?? "-"}
                    </td>
                    <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                      {inq.bdName ?? "-"}
                    </td>
                    <td className="border text-sm px-3 py-2 whitespace-nowrap text-left w-auto">
                      {inq.clientName ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🔻 Bottom Pagination */}
          <Pagination />
        </div>
      )}
    </div>
  );
}
