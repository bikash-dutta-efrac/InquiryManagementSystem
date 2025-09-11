import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export default function SubInquiryList({ title, data = [], onBack, queryType }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 30;

  useEffect(() => {
    setCurrentPage(1); // reset to first page when dataset changes
  }, [data]);

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        🚫 No records found
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);

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
    <div className="bg-white rounded-xl shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {title} ({data.length})
        </h2>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Pagination Top */}
      <Pagination />

      {/* Table */}
      <div className="overflow-x-auto bg-white border rounded-lg shadow-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
            <tr>
              {queryType === "inquiries" && (
                <>
                  <th className="border text-sm px-3 py-2">Inquiry No</th>
                  <th className="border text-sm px-3 py-2">Inquiry Date</th>
                </>
              )}
              {queryType !== "registrations" && (
                <>
                  <th className="border text-sm px-3 py-2">Quotation No</th>
                  <th className="border text-sm px-3 py-2">Quotation Date</th>
                  <th className="border text-sm px-3 py-2">Quotation Value (Before Discount)</th>
                  <th className="border text-sm px-3 py-2">Quotation Value (After Discount)</th>
                  <th className="border text-sm px-3 py-2">Quotation Status</th>
                  <th className="border text-sm px-3 py-2">Quotation Ageing</th>
                  <th className="border text-sm px-3 py-2">Discount (%)</th>
                </>
              )}
              <th className="border text-sm px-3 py-2">Registration No</th>
              <th className="border text-sm px-3 py-2">Registration Date</th>
              <th className="border text-sm px-3 py-2">Registration Value</th>
              <th className="border text-sm px-3 py-2">BD Name</th>
              <th className="border text-sm px-3 py-2">Client Name</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((inq, idx) => (
              <tr
                key={`${inq.inqNo}-${idx}`}
                className={`text-center ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50 transition`}
              >
                {queryType === "inquiries" && (
                  <>
                    <td className="border text-sm px-3 py-2 text-left">{inq.inqNo ?? "-"}</td>
                    <td className="border text-sm px-3 py-2 text-left">
                      {inq.inqDate ? new Date(inq.inqDate).toLocaleDateString() : "-"}
                    </td>
                  </>
                )}
                {queryType !== "registrations" && (
                  <>
                    <td className="border text-sm px-3 py-2 text-left">{inq.quotNo ?? "-"}</td>
                    <td className="border text-sm px-3 py-2 text-left">
                      {inq.quotDate ? new Date(inq.quotDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="border text-sm px-3 py-2 text-left">{inq.quotValBeforeDis ?? "-"}</td>
                    <td className="border text-sm px-3 py-2 text-left">{inq.quotValAfterDis ?? "-"}</td>
                    <td className="border text-sm px-3 py-2 text-left">{inq.quotStatus ?? "-"}</td>
                    <td className="border text-sm px-3 py-2 text-left">{inq.quotAgeing ?? "-"}</td>
                    <td className="border text-sm px-3 py-2 text-left">{inq.percOfDis ?? "-"}</td>
                  </>
                )}
                <td className="border text-sm px-3 py-2 text-left">{inq.regisNo ?? "-"}</td>
                <td className="border text-sm px-3 py-2 text-left">
                  {inq.regisDate ? new Date(inq.regisDate).toLocaleDateString() : "-"}
                </td>
                <td className="border text-sm px-3 py-2 text-left">{inq.regisVal ?? "-"}</td>
                <td className="border text-sm px-3 py-2 text-left">{inq.bdName ?? "-"}</td>
                <td className="border text-sm px-3 py-2 text-left">{inq.clientName ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bottom */}
      <Pagination />
    </div>
  );
}

