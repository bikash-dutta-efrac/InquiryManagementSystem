import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export default function SubInquiryList({
  title,
  data = [],
  onBack,
  queryType,
}) {
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

  const PaginationControls = ({
    currentPage,
    totalPages,
    goToPage,
    getPageNumbers,
  }) => {
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
              <span key={index} className="px-2 py-1 text-sm text-gray-500">
                ...
              </span>
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
          <span className="text-sm text-gray-600 hidden sm:inline">
            of {totalPages}
          </span>
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
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          getPageNumbers={getPageNumbers}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 mt-6 rounded-2xl shadow-lg">
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
