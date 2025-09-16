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
  const itemsPerPage = 20;

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  if (!data.length) {
    return (
      <div className="text-center text-gray-600 py-10 text-lg rounded-2xl bg-white shadow-xl">
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

  const Pagination = () =>
    totalPages > 1 && (
      <div className="flex justify-center items-center gap-2 my-6 flex-wrap">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition-all shadow-sm hover:shadow"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        {getPageNumbers().map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={`px-4 py-2 rounded-full transition-all shadow-sm hover:shadow ${
              num === currentPage
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition-all shadow-sm hover:shadow"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );

  return (
    <div className="space-y-8 bg-white p-8 rounded-3xl shadow-xl animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Inquiry List <span className="text-blue-600">({data.length})</span>
        </h2>
        <div className="flex justify-end gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <FileDown className="w-5 h-5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>
      <Pagination />
      <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-lg">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-linear-to-r from-blue-500 via-cyan-500 to-teal-500 text-white sticky top-0 z-10">
            <tr>
              {queryType === "inqDate" && (
                <>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
                    Inquiry No
                  </th>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
                    Inquiry Date
                  </th>
                </>
              )}
              {queryType !== "regisDate" && (
                <>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
                    Quotation No
                  </th>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
                    Quotation<br/>Date
                  </th>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
                    Quotation Value<br/>(Before Discount)
                  </th>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
                    Quotation Value<br/>(After Discount)
                  </th>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
                    Quotation<br/>Ageing
                  </th>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
                    Discount (%)
                  </th>
                </>
              )}
              <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
                Registration No
              </th>
              <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
                Registration<br/>Date
              </th>
              <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
                Registration<br/>Value
              </th>
              <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
                BD Name
              </th>
              <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
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
                } border-t border-gray-200 transition-all duration-200 ease-in-out hover:bg-blue-50 hover:shadow-md`}
              >
                {queryType === "inqDate" && (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.inqNo ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.inqDate
                        ? new Date(inq.inqDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </>
                )}
                {queryType !== "regisDate" && (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.quotNo ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.quotDate
                        ? new Date(inq.quotDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                      {Math.round(inq.quotValBeforeDis) ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                      {Math.round(inq.quotValAfterDis) ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.quotAgeing ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.percOfDis ?? "-"}
                    </td>
                  </>
                )}
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                  {inq.regisNo ?? "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                  {inq.regisDate
                    ? new Date(inq.regisDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                  {Math.round(inq.regisVal) ?? "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                  {inq.bdName ?? "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                  {inq.clientName ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination />
    </div>
  );
}