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
      <div className="text-center text-gray-600 py-10 text-lg rounded-2xl bg-white shadow-xl">
        🚫 No inquiries found
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

const PaginationControls = ({ currentPage, totalPages, goToPage, getPageNumbers }) => {
    return (
        <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-md border border-gray-100">
            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition duration-150 ease-in-out shadow-sm"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-sm text-gray-600 hidden sm:inline">Page</span>
                {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                        <span key={index} className="px-2 py-1 text-sm text-gray-500">...</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out ${
                                page === currentPage
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                                    : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}
                <span className="text-sm text-gray-600 hidden sm:inline">of {totalPages}</span>
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
};

  return (
    <div className="space-y-8 bg-white p-8 rounded-3xl shadow-xl animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Rows <span className="text-blue-600">({data.length})</span>
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
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          getPageNumbers={getPageNumbers}
        />
      )}
      
      {/* Table for large screens */}
      <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-2xl shadow-lg">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white sticky top-0 z-10">
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
                    Quotation Date
                  </th>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-right">
                    Quotation Value (Before Discount)
                  </th>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-right">
                    Quotation Value (After Discount)
                  </th>
                  <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-left">
                    Quotation Ageing
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
                Registration Date
              </th>
              <th className="px-4 py-3 text-sm font-medium whitespace-nowrap text-right">
                Registration Value
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
                } hover:bg-gray-100 transition-colors duration-200 ease-in-out`}
              >
                {queryType === "inqDate" && (
                  <>
                    <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.inqNo ?? "-"}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.inqDate
                        ? new Date(inq.inqDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </>
                )}
                {queryType !== "regisDate" && (
                  <>
                    <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.quotNo ?? "-"}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.quotDate
                        ? new Date(inq.quotDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 whitespace-nowrap text-right">
                      {Math.round(inq.quotValBeforeDis) ?? "-"}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 whitespace-nowrap text-right">
                      {Math.round(inq.quotValAfterDis) ?? "-"}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.quotAgeing ?? "-"}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.percOfDis ?? "-"}
                    </td>
                  </>
                )}
                <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 whitespace-nowrap text-left">
                  {inq.regisNo ?? "-"}
                </td>
                <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 whitespace-nowrap text-left">
                  {inq.regisDate
                    ? new Date(inq.regisDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 whitespace-nowrap text-right">
                  {Math.round(inq.regisVal) ?? "-"}
                </td>
                <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 whitespace-nowrap text-left">
                  {inq.bdName ?? "-"}
                </td>
                <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700 whitespace-nowrap text-left">
                  {inq.clientName ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards for mobile/tablet screens */}
      <div className="lg:hidden space-y-4">
        {paginatedData.map((inq, idx) => (
          <div
            key={`${inq.inqNo}-${idx}`}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-200"
          >
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div className="font-semibold text-gray-900">Inquiry No</div>
              <div className="text-gray-700">{inq.inqNo ?? "-"}</div>
              
              <div className="font-semibold text-gray-900">Inquiry Date</div>
              <div className="text-gray-700">
                {inq.inqDate ? new Date(inq.inqDate).toLocaleDateString() : "-"}
              </div>

              <div className="font-semibold text-gray-900">Quotation No</div>
              <div className="text-gray-700">{inq.quotNo ?? "-"}</div>

              <div className="font-semibold text-gray-900">Quotation Date</div>
              <div className="text-gray-700">
                {inq.quotDate ? new Date(inq.quotDate).toLocaleDateString() : "-"}
              </div>

              <div className="font-semibold text-gray-900">Quotation Value (After Discount)</div>
              <div className="text-gray-700">{Math.round(inq.quotValAfterDis) ?? "-"}</div>

              <div className="font-semibold text-gray-900">Registration No</div>
              <div className="text-gray-700">{inq.regisNo ?? "-"}</div>
              
              <div className="font-semibold text-gray-900">Registration Date</div>
              <div className="text-gray-700">
                {inq.regisDate ? new Date(inq.regisDate).toLocaleDateString() : "-"}
              </div>
              
              <div className="font-semibold text-gray-900">Registration Value</div>
              <div className="text-gray-700">{Math.round(inq.regisVal) ?? "-"}</div>
              
              <div className="font-semibold text-gray-900">BD Name</div>
              <div className="text-gray-700">{inq.bdName ?? "-"}</div>

              <div className="font-semibold text-gray-900">Client Name</div>
              <div className="text-gray-700">{inq.clientName ?? "-"}</div>
            </div>
          </div>
        ))}
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