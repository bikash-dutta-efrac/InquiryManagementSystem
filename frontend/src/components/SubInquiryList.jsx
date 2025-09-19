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
    <div className="bg-white rounded-3xl shadow-xl p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {title} <span className="text-blue-600">({data.length})</span>
        </h2>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* Pagination Top */}
      <Pagination />

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-lg">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white">
            <tr>
              {queryType === "inquiries" && (
                <>
                  <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-left">
                    Inquiry No
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-left">
                    Inquiry Date
                  </th>
                </>
              )}
              {queryType !== "registrations" && (
                <>
                  <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-left">
                    Quotation No
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-left">
                    Quotation Date
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-right">
                    Quotation Value (Before Discount)
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-right">
                    Quotation Value (After Discount)
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-left">
                    Quotation Status
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-left">
                    Quotation Ageing
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-left">
                    Discount (%)
                  </th>
                </>
              )}
              <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-left">
                Registration No
              </th>
              <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-left">
                Registration Date
              </th>
              <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-right">
                Registration Value
              </th>
              <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-left">
                BD Name
              </th>
              <th className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-left">
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
                } border-t border-gray-200 transition-all duration-200 ease-in-out hover:bg-gray-100`}
              >
                {queryType === "inquiries" && (
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
                {queryType !== "registrations" && (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.quotNo ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.quotDate
                        ? new Date(inq.quotDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-right">
                      {inq.quotValBeforeDis ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-right">
                      {inq.quotValAfterDis ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-left">
                      {inq.quotStatus ?? "-"}
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
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-right">
                  {inq.regisVal ?? "-"}
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

      {/* Pagination Bottom */}
      <Pagination />
    </div>
  );
}