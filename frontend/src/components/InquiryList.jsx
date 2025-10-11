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
} from "lucide-react";

export default function InquiryList({ data = [], queryType }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  if (!data.length) {
    return (
      <div className="text-center text-gray-600 py-20 text-xl font-medium rounded-2xl bg-white shadow-xl">
        <span className="mr-2">❌</span> No inquiries found.
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

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
        "Quote Before Discount": Math.round(inq.quotValBeforeDis) ?? "-",
        "Quote After Discount": Math.round(inq.quotValAfterDis) ?? "-",
        "Quote Ageing": inq.quotAgeing ?? "-",
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
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    saveAs(
      new Blob([csvOutput], { type: "text/csv;charset=utf-8;" }),
      "inquiries.csv"
    );
  };

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
      inq.percOfDis ?? "-",
      inq.regisNo ?? "-",
      inq.regisDate ? new Date(inq.regisDate).toLocaleDateString() : "-",
      Math.round(inq.regisVal) ?? "-",
      inq.bdName ?? "-",
      inq.clientName ?? "-",
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

  const PaginationControls = ({
    currentPage,
    totalPages,
    goToPage,
    getPageNumbers,
  }) => (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md border border-gray-100">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition duration-150 ease-in-out shadow-sm"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 my-2 sm:my-0">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-1 rounded-lg transition-colors duration-150 ${
                page === currentPage
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {page}
            </button>
          )
        )}
        <span className="text-gray-500">of {totalPages}</span>
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition duration-150 ease-in-out shadow-sm"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 p-8 rounded-3xl shadow-2xl space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="block text-sm font-medium text-gray-500 mt-1">
          Total Rows: {data.length}
        </span>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all"
          >
            <FileDown className="w-5 h-5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Pagination Top */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          getPageNumbers={getPageNumbers}
        />
      )}

      {/* Main Table */}
      <div className="bg-white p-6 my-4 rounded-2xl shadow-lg border border-gray-200 overflow-x-auto">
        <table className="min-w-[1300px] table-auto border-collapse">
          <thead className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <tr>
              {queryType === "inqDate" && (
                <>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Inquiry No
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Inquiry
                    <br />
                    Date
                  </th>
                </>
              )}
              {queryType !== "regisDate" && (
                <>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Quotation No
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Quotation
                    <br />
                    Date
                  </th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">
                    Quotation Value
                    <br />
                    (Before Discount)
                  </th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">
                    Quotation Value
                    <br />
                    (After Discount)
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Quotation
                    <br />
                    Ageing
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Discount (%)
                  </th>
                </>
              )}
              <th className="px-4 py-3 text-left whitespace-nowrap">
                Registration No
              </th>
              <th className="px-4 py-3 text-left whitespace-nowrap">
                Registration
                <br />
                Date
              </th>
              <th className="px-4 py-3 text-right whitespace-nowrap">
                Registration
                <br />
                Value
              </th>
              <th className="px-4 py-3 text-left whitespace-nowrap">BD Name</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">
                Client Name
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {paginatedData.map((inq, idx) => (
              <tr
                key={`${inq.inqNo}-${idx}`}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                {queryType === "inqDate" && (
                  <>
                    <td className="px-4 py-3">{inq.inqNo ?? "-"}</td>
                    <td className="px-4 py-3">
                      {inq.inqDate
                        ? new Date(inq.inqDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </>
                )}
                {queryType !== "regisDate" && (
                  <>
                    <td className="px-4 py-3">{inq.quotNo ?? "-"}</td>
                    <td className="px-4 py-3">
                      {inq.quotDate
                        ? new Date(inq.quotDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {Math.round(inq.quotValBeforeDis) ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {Math.round(inq.quotValAfterDis) ?? "-"}
                    </td>
                    <td className="px-4 py-3">{inq.quotAgeing ?? "-"}</td>
                    <td className="px-4 py-3">{inq.percOfDis ?? "-"}</td>
                  </>
                )}
                <td className="px-4 py-3">{inq.regisNo ?? "-"}</td>
                <td className="px-4 py-3">
                  {inq.regisDate
                    ? new Date(inq.regisDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="font-semibold text-black px-4 py-3 text-right">
                  {Math.round(inq.regisVal) ?? "-"}
                </td>
                <td className="px-4 py-3">{inq.bdName ?? "-"}</td>
                <td className="px-4 py-3">{inq.clientName ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          getPageNumbers={getPageNumbers}
        />
      )}
    </div>
  );
}
