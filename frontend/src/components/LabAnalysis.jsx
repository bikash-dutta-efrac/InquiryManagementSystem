import { useMemo, useRef, useState, useEffect } from "react";
import {
  HiBeaker,
  HiClock,
  HiCheckCircle,
  HiBuildingLibrary,
  HiCurrencyRupee,
} from "react-icons/hi2";
import { MdHourglassFull, MdAccessTimeFilled, MdPaid } from "react-icons/md";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaMoneyBillWave } from "react-icons/fa";

function formatAmount(num) {
  if (num === null || num === undefined) return 0;
  const number = parseFloat(num);
  if (number < 1000) return number.toFixed(0);
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e5, symbol: "L" },
    { value: 1e7, symbol: "Cr" },
    { value: 1e9, symbol: "B" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (number >= si[i].value) {
      break;
    }
  }
  return (number / si[i].value).toFixed(2).replace(rx, "$1") + si[i].symbol;
}

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return "N/A";
  try {
    const parts = dateString.split(/[\/ :]/);
    
    if (parts.length < 3) return dateString;
    
    const date = new Date(
      parts[2],
      parts[1] - 1,
      parts[0],
      parts[3] || 0,
      parts[4] || 0,
      parts[5] || 0
    );

    if (isNaN(date.getTime())) {
      return dateString;
    }

    const dateOptions = { day: "2-digit", month: "short", year: "numeric" };
    const timeOptions = includeTime && parts.length > 3
      ? { hour: "2-digit", minute: "2-digit", hour12: true }
      : {};
      
    const formattedDate = date.toLocaleDateString("en-GB", dateOptions);
    const formattedTime = (includeTime && parts.length > 3) 
        ? " " + date.toLocaleTimeString("en-US", timeOptions) 
        : "";

    return formattedDate + formattedTime;

  } catch (e) {
    return dateString;
  }
};

const colorMap = {
  blue: {
    border: "border-t-4 border-blue-500",
    bg: "bg-blue-100",
    icon: "text-blue-600",
  },
  green: {
    border: "border-t-4 border-green-500",
    bg: "bg-green-100",
    icon: "text-green-600",
  },
  red: {
    border: "border-t-4 border-red-500",
    bg: "bg-red-100",
    icon: "text-red-600",
  },
  orange: {
    border: "border-t-4 border-orange-500",
    bg: "bg-orange-100",
    icon: "text-orange-600",
  },
  teal: {
    border: "border-t-4 border-teal-500",
    bg: "bg-teal-100",
    icon: "text-teal-600",
  },
  gray: {
    border: "border-t-4 border-gray-500",
    bg: "bg-gray-100",
    icon: "text-gray-600",
  },
};

const LabAnalysisSummaryCard = ({ title, value, color = "gray", icon }) => {
  const colorClasses = colorMap[color] || colorMap.gray;

  return (
    <div
      className={`bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 ${colorClasses.border}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase text-gray-500">
          {title}
        </span>
        <div
          className={`p-2 mx-2 rounded-full ${colorClasses.bg} ${colorClasses.icon}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

// Updated getStatusBadge for "Partial Released" color change (using amber/orange)
const getStatusBadge = (item) => {

  if (item.status === "Released") {
    return {
      text: "Released",
      badgeColor: "bg-green-500 text-white text-[11px]",
      icon: <HiCheckCircle className="w-4 h-4" />,
    };
  }

  if (item.status === "PartialReleased") {
    // Changed color to amber for Partial Released
    return {
      text: "Partial Released",
      badgeColor: "bg-amber-500 text-white text-[11px]",
      icon: <HiClock className="w-4 h-4" />,
    };
  }

  return {
    text:
      item.status === "Pending"
        ? "Pending"
        : item.status.charAt(0) + item.status.slice(1).toLowerCase(),
    badgeColor: "bg-red-500 text-white text-[11px]",
    icon: <HiClock className="w-4 h-4" />,
  };
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

// Lab Analysis Table now uses the SampleAnalysis table structure and styling
const LabAnalysisTable = ({ data }) => {
  return (
    <div className="bg-white p-6 my-4 rounded-2xl shadow-lg border border-gray-200">
      
      {/* Desktop Table View */}
      <div className="overflow-x-auto rounded-xl shadow-inner hidden lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600/90 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider rounded-tl-xl w-1/5">
                Registration No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-2/5">
                Sample Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider w-1/5">
                Registration Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider w-1/10">
                Registration Value
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider rounded-tr-xl w-1/10">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((item, index) => {
              const registrationNo = item.registrationNo || "-";
              const sampleName = item.sampleName || "-";
              const regDateTime = formatDate(item.registrationDate);
              const value = `₹${formatAmount(item.regisVal)}`;
              const statusBadge = getStatusBadge(item);

              return (
                <tr key={registrationNo + index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-normal text-sm font-semibold text-gray-900">
                    {registrationNo}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-800">
                    {sampleName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-500">
                    {regDateTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 font-bold">
                    {value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${statusBadge.badgeColor}`}
                    >
                      {statusBadge.icon}
                      {statusBadge.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile layout - Keeping the original LabAnalysis card-style mobile view but with updated badge styling */}
      <div className="lg:hidden divide-y divide-gray-100">
        {data.map((item, index) => {
          const registrationNo = item.registrationNo || "-";
          const sampleName = item.sampleName || "-";
          const regDateTime = formatDate(item.registrationDate);
          const value = `₹${formatAmount(item.regisVal)}`;
          const statusBadge = getStatusBadge(item);

          return (
            <div
              key={registrationNo + index}
              className="py-5 px-6 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="grid grid-cols-1 gap-4 p-4 mb-4 rounded-xl shadow-lg bg-white border border-gray-100">
                {/* Header Section */}
                <div className="flex items-start justify-between border-b pb-3 border-gray-200">
                  <h3 className="text-base font-extrabold text-gray-900 line-clamp-2 pr-2">
                    {registrationNo}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${statusBadge.badgeColor}`}
                  >
                    {statusBadge.icon}
                    {statusBadge.text}
                  </span>
                </div>

                {/* Sample Name */}
                <div>
                  <span className="block text-gray-500 text-xs font-semibold">
                    Sample:
                  </span>
                  <p className="text-gray-800 font-semibold">{sampleName}</p>
                </div>

                {/* Registration Date & Value */}
                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                  <div className="flex flex-col">
                    <span className="text-gray-500">Reg. Date:</span>
                    <span className="text-gray-900 font-semibold">
                      {regDateTime}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-gray-500">Reg. Value:</span>
                    <span className="text-gray-700 font-semibold">
                      {value}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatusFilterChips = ({ currentFilter, setFilter, data }) => {
  const statuses = useMemo(() => {
    const chipColors = {
        "All": { 
          name: "All", status: "All", 
          active: "bg-blue-600 text-white shadow-xs ring-2 ring-blue-300", 
          inactive: "bg-blue-100 text-blue-600 border border-blue-200 hover:bg-blue-50" 
        },
        "Released": { 
          name: "Released", status: "Released", 
          active: "bg-green-600 text-white shadow-xs ring-2 ring-green-300", 
          inactive: "bg-green-100 text-green-600 border border-green-200 hover:bg-green-50" 
        },
        "Pending": { 
          name: "Pending", status: "Pending", 
          active: "bg-red-600 text-white shadow-xs ring-2 ring-red-300", 
          inactive: "bg-red-100 text-red-600 border border-red-200 hover:bg-red-50" 
        },
        "PartialReleased": { 
          name: "Partial Released", status: "PartialReleased", 
          active: "bg-amber-600 text-white shadow-xs ring-2 ring-amber-300", 
          inactive: "bg-amber-100 text-amber-600 border border-amber-200 hover:bg-amber-50" 
        },
    };

    const statusCounts = data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    const chipData = [
      { count: data.length, ...chipColors["All"] },
      { count: statusCounts["Released"] || 0, ...chipColors["Released"] },
      { count: statusCounts["Pending"] || 0, ...chipColors["Pending"] },
      { count: statusCounts["PartialReleased"] || 0, ...chipColors["PartialReleased"] },
    ];
    
    // Only show chips with data, except 'All'
    return chipData.filter(chip => chip.count > 0 || chip.status === "All"); 
  }, [data]);

  return (
    <div className="flex flex-wrap gap-3 mb-6 p-1 rounded-xl">
      {statuses.map((chip) => (
        <button
          key={chip.status}
          onClick={() => setFilter(chip.status)}
          className={`
            px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-300 ease-in-out 
            transform hover:scale-[1.03] focus:outline-none focus:ring-2
            ${currentFilter === chip.status
              ? `${chip.active} ring-opacity-50`
              : `${chip.inactive} focus:ring-2 focus:ring-opacity-50 focus:ring-gray-300`
            }
          `}
        >
          {chip.name} <span className="font-bold ml-1">{formatAmount(chip.count)}</span>
        </button>
      ))}
    </div>
  );
};


const LabSummaryKpiCard = ({ summaryData }) => {
  const items = summaryData || [];
  const scrollRef = useRef(null);

  const IconMapping = {
    samples: <HiBeaker className="w-4 h-4" />,
    released: <HiCheckCircle className="w-4 h-4" />,
    pending: <HiClock className="w-4 h-4" />,
    beforeTat: <HiCheckCircle className="w-3 h-3 text-green-600" />,
    onTat: <MdAccessTimeFilled className="w-3 h-3 text-blue-500" />,
    afterTat: <MdAccessTimeFilled className="w-3 h-3 text-orange-500" />,
    beyondTat: <MdHourglassFull className="w-3 h-3" />,
    totalValue: <HiBuildingLibrary className="w-4 h-4" />,
    pendingValue: <HiCurrencyRupee className="w-4 h-4" />,
    invoiced: <MdPaid className="w-3 h-3" />,
    billed: <FaMoneyBillWave className="w-3 h-3" />,
  };

  if (!items.length) return null;

  const cardBorderColor = "#0384fcff";

  return (
    <div className="relative flex rounded-2xl shadow-xl bg-white border border-gray-100/50 group mb-2">
      <div
        className={`flex items-center justify-center p-4 rounded-l-2xl bg-linear-to-b from-cyan-700 via-blue-500 to-indigo-600`}
        style={{ writingMode: "vertical-rl" }}
      >
        <h3
          className="font-semibold text-m text-white"
          style={{ transform: "rotate(180deg)" }}
        >
          Lab Summary
        </h3>
      </div>

      <div className="flex-grow-1 min-w-0 bg-white rounded-r-2xl">
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden scroll-smooth px-4 py-3" // Reduced horizontal padding
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex flex-nowrap gap-4" role="list">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="relative flex-shrink-0 
                                    min-w-[220px] max-w-[220px] h-auto p-3 
                                    rounded-xl border border-gray-200
                                    shadow-md hover:shadow-lg transition-all duration-300 ease-in-out
                                    transform hover:-translate-y-0.5 bg-white flex flex-col justify-between
                                    border-t-4"
                style={{
                  borderColor: cardBorderColor,
                }}
                role="listitem"
                tabIndex={0}
              >
                <div className="flex items-center mb-3">
                  <h3 className="font-bold text-base text-gray-900 line-clamp-2">
                    {item.lab ?? "N/A"}
                  </h3>
                </div>

                <div className="space-y-2 text-xs text-gray-700">
                  <h4 className="text-[10px] font-bold uppercase text-indigo-500 pb-1 border-b border-indigo-100">
                    Samples Status
                  </h4>
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span className="flex items-center gap-2">
                      <span className="text-indigo-500">
                        {IconMapping.samples}
                      </span>
                      Total Samples
                    </span>
                    <span>{formatAmount(item.samples ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-indigo-100">
                    <span className="flex items-center gap-2 text-green-600">
                      <span className="text-green-500">
                        {IconMapping.released}
                      </span>
                      Released
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatAmount(item.released ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] ml-1">
                    <span className="flex items-center gap-1.5">
                      Released Before TAT
                    </span>
                    <span className="font-medium">
                      {formatAmount(item.releasedBeforeTat ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] ml-1">
                    <span className="flex items-center gap-1.5">
                      Released On TAT
                    </span>
                    <span className="font-medium">
                      {formatAmount(item.releasedOnTat ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] ml-1">
                    <span className="flex items-center gap-1.5">
                      Released After TAT
                    </span>
                    <span className="font-medium">
                      {formatAmount(item.releasedAfterTat ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-indigo-100">
                    <span className="flex items-center gap-2 text-red-600">
                      <span className="text-red-500">
                        {IconMapping.pending}
                      </span>
                      Pending
                    </span>
                    <span className="font-semibold text-red-500">
                      {formatAmount(item.pendings ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] ml-1">
                    <span className="flex items-center gap-1.5">
                      Pending Before TAT
                    </span>
                    <span className="font-medium">
                      {formatAmount(item.pendingBeforeTat ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] ml-1">
                    <span className="flex items-center gap-1.5">
                      Pending Beyond TAT
                    </span>
                    <span className="font-medium">
                      {formatAmount(item.pendingBeyondTat ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 space-y-2 text-xs text-gray-700 border-t border-gray-200">
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span className="flex items-center gap-2">
                      <span className="text-blue-500">
                        {IconMapping.totalValue}
                      </span>
                      Total Value
                    </span>
                    <span>₹{formatAmount(item.totalRegValue ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-red-600">
                      <span className="text-red-500">
                        {IconMapping.pendingValue}
                      </span>
                      Pending Value
                    </span>
                    <span className="font-semibold">
                      ₹{formatAmount(item.pendingRegValue ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LabAnalysis({
  data = [],
  labSummaryData = [],
  sampleOverview = null,
}) {
  const finalSummary = labSummaryData;
  const rawData = data;

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All"); // State for filtering
  const itemsPerPage = 20;

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (statusFilter === "All") {
      return rawData;
    }
    // Filter logic
    return rawData.filter((item) => item.status === statusFilter);
  }, [rawData, statusFilter]);


  useEffect(() => {
    // Reset page to 1 when rawData or filter changes
    setCurrentPage(1);
  }, [rawData, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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
  

  if (!rawData.length && !finalSummary.length) {
    return (
      <div className="text-center text-gray-600 py-20 text-xl font-medium rounded-2xl bg-white shadow-xl">
        <span className="mr-2">❌</span> No lab analysis data found for the
        selected filters.
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-50 p-8 rounded-3xl shadow-2xl mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
            Lab Analysis Report
            <span className="block text-lg font-medium text-gray-500 mt-1">
              Summary and Detailed Log
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
          <LabAnalysisSummaryCard
            title="Samples"
            value={sampleOverview.totalSamples}
            color="blue"
            icon={<HiBeaker className="w-5 h-5" />}
          />

          <LabAnalysisSummaryCard
            title="Released Samples"
            value={`${formatAmount(sampleOverview.totalReleased)}`}
            color="green"
            icon={<HiCheckCircle className="w-5 h-5" />}
          />

          <LabAnalysisSummaryCard
            title="Pending Samples"
            value={formatAmount(sampleOverview.totalPending) || 0}
            color="red"
            icon={<HiClock className="w-5 h-5" />}
          />

          <LabAnalysisSummaryCard
            title="Pending Value"
            value={`₹${formatAmount(sampleOverview.totalPendingRegVal)}` || 0}
            color="orange"
            icon={<HiCurrencyRupee className="w-5 h-5" />}
          />

        </div>

        <LabSummaryKpiCard summaryData={finalSummary} />
      </div>
      <div className="bg-gray-50 p-8 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-center pb-4">
          <span className="block text-sm font-medium text-gray-500 mt-1">
            Total Logs: {filteredData.length}
          </span>
        </div>

        {/* Status Filter Chips (Updated) */}
        <StatusFilterChips
          currentFilter={statusFilter}
          setFilter={setStatusFilter}
          data={rawData} // Pass rawData to calculate total counts
        />

        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            getPageNumbers={getPageNumbers}
          />
        )}

        {paginatedData.length > 0 ? (
          <LabAnalysisTable data={paginatedData} />
        ) : (
          filteredData.length > 0 && (
            <div className="text-center text-gray-600 py-10 my-4 text-xl font-medium rounded-2xl bg-white shadow-xl border border-gray-200">
              No logs found on this page.
            </div>
          )
        )}
        
        {/* Render a specific message if no data matches the filter */}
        {filteredData.length === 0 && rawData.length > 0 && (
            <div className="text-center text-gray-600 py-10 my-4 text-xl font-medium rounded-2xl bg-white shadow-xl border border-gray-200">
              No logs match the selected filter **"{statusFilter}"**.
            </div>
        )}

        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            getPageNumbers={getPageNumbers}
          />
        )}
      </div>
    </div>
  );
}