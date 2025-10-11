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

// Helper to format date/time strings from "MM/DD/YYYY HH:mm:ss"
const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return "-";
  try {
    // The format is "MM/DD/YYYY HH:mm:ss"
    const [datePart, timePart] = dateString.split(" ");
    const [month, day, year] = datePart.split("/");
    const isoDateString = `${year}-${month}-${day}T${timePart || "00:00:00"}`;

    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return dateString; // Return original if parsing fails

    const dateOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };

    let options = dateOptions;
    if (includeTime) {
      options = { ...dateOptions, ...timeOptions };
    }

    return date.toLocaleString("en-IN", options).replace(/, /g, " ");
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

// Simplified getStatusBadge logic to use the explicit 'status' field
const getStatusBadge = (item) => {
  const status =
    item.status?.toUpperCase() || (item.mailingDate ? "RELEASED" : "PENDING");

  if (status === "RELEASED") {
    return {
      text: "Released",
      badgeColor: "bg-green-100 text-green-700",
      icon: <HiCheckCircle className="w-4 h-4" />,
    };
  }

  // Fallback for "PENDING" or any other status
  return {
    text:
      status === "PENDING"
        ? "Pending"
        : status.charAt(0) + status.slice(1).toLowerCase(),
    badgeColor: "bg-red-100 text-red-700",
    icon: <HiClock className="w-4 h-4" />,
  };
};

// PaginationControls component (Copied from InquiryList.jsx)
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

// Lab Analysis Table remains mostly the same, accepts paginated data
const LabAnalysisTable = ({ data }) => {
  return (
    <div className="bg-white p-6 my-4 rounded-2xl shadow-lg border border-gray-200 overflow-x-auto">
      <div className="min-w-full">
        {/* Header Row for larger screens - 7 columns */}
        <div className="hidden lg:grid grid-cols-[2fr_2.5fr_1fr_1fr_1fr_1fr_1fr_1.5fr] gap-4 py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 min-w-[1000px]">
          <div className="col-span-1">Registration No.</div>
          <div className="col-span-1">Sample Name / Lab</div>
          <div className="col-span-1">Registration Date</div>
          <div className="col-span-1">TAT Date</div>
          <div className="col-span-1">Mailing Date</div>
          <div className="col-span-1">Completion Date</div>
          <div className="col-span-1 text-right">Registration Value</div>
          <div className="col-span-1">Status</div>
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-gray-100">
          {data.map((item, index) => {
            const registrationNo = item.registrationNo || "-";
            const sampleName = item.sampleName || "-";
            const labName = item.lab || "-";

            // New date/time fields
            const regDateTime = formatDate(item.registrationDateTime, true);
            const labTatDate = formatDate(item.labTatDate);
            const mailingDate = formatDate(item.mailingDate);
            const completionDateTime = formatDate(item.completionDateTime);
            const value = `₹${formatAmount(item.distributedRegisVal)}`;
            const statusBadge = getStatusBadge(item);

            return (
              <div
                key={registrationNo + index}
                className="py-5 px-6 hover:bg-gray-50 transition-colors duration-200"
              >
                {/* Card layout for small and medium screens (lg:hidden) */}
                <div className="lg:hidden grid grid-cols-1 gap-6 p-6 mb-4 rounded-2xl shadow-lg bg-white border border-gray-100">
                  {/* Header Section: Reg. No and Status */}
                  <div className="flex items-start justify-between border-b pb-4 border-gray-200">
                    <h3 className="text-base font-extrabold text-gray-900 line-clamp-2 pr-2">
                      {registrationNo}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusBadge.badgeColor} flex-shrink-0`}
                    >
                      {statusBadge.icon}
                      {statusBadge.text}
                    </span>
                  </div>

                  {/* Sample & Lab */}
                  <div className="text-sm font-medium text-gray-700 break-words">
                    <span className="font-semibold text-gray-500 block">
                      Sample:
                    </span>
                    <p className="font-bold text-gray-800">{sampleName}</p>
                    <span className="font-semibold text-gray-500 block mt-2">
                      Lab:
                    </span>
                    <p className="font-bold text-blue-700">{labName}</p>
                  </div>

                  {/* Date & Value Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                    <div className="flex flex-col">
                      <span className="text-gray-500">Reg. Date:</span>
                      <span className="text-gray-900 font-semibold">
                        {regDateTime}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">TAT Date:</span>
                      <span className="text-gray-600 font-semibold">
                        {labTatDate}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Completion Date:</span>
                      <span className="text-gray-600 font-semibold">
                        {completionDateTime.split(" ")[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-right">
                        Reg. Value:
                      </span>
                      <span className="text-gray-700 font-semibold text-right">
                        {value}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid layout for large screens */}
                <div className="hidden lg:grid grid-cols-[2fr_2.5fr_1fr_1fr_1fr_1fr_1fr_1.5fr] gap-4 items-center">
                  {/* Reg. No */}
                  <div className="col-span-1 text-xs font-semibold text-gray-900 break-words pr-2">
                    {registrationNo}
                  </div>
                  {/* Sample Name / Lab */}
                  <div className="col-span-1 text-sm text-gray-700 break-words pr-2">
                    <p className="font-semibold text-xs text-gray-800 line-clamp-2">
                      {sampleName}
                    </p>
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      {labName}
                    </p>
                  </div>
                  {/* Reg. Date */}
                  <div className="col-span-1 text-xs text-gray-700 whitespace-nowrap">
                    {regDateTime.split(" ")[0]}
                  </div>
                  {/* TAT Date */}
                  <div className="col-span-1 text-xs text-gray-600 font-medium whitespace-nowrap">
                    {labTatDate}
                  </div>
                  <div className="col-span-1 text-xs text-gray-700 whitespace-nowrap">
                    {completionDateTime.split(" ")[0]}
                  </div>
                  {/* Mailing Date */}
                  <div className="col-span-1 text-xs text-gray-600 font-medium whitespace-nowrap">
                    {mailingDate}
                  </div>
                  {/* Value */}
                  <div className="col-span-1 text-sm text-gray-700 font-bold break-words text-right">
                    {value}
                  </div>
                  {/* Status */}
                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.badgeColor}`}
                    >
                      {statusBadge.icon}
                      {statusBadge.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
    beforeTat: <HiCheckCircle className="w-3 h-3 text-green-500" />,
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
          {/* Flex wrapper for the cards */}
          <div className="flex flex-nowrap gap-4" role="list">
            {" "}
            {/* Reduced gap */}
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
                {/* Card Title */}
                <div className="flex items-center mb-3 border-b pb-2 border-gray-100">
                  <h3 className="font-bold text-base text-gray-900 line-clamp-2">
                    {" "}
                    {/* Reduced font size */}
                    {item.lab ?? "N/A"}
                  </h3>
                </div>

                {/* --- Group 1: Samples Overview (Reduced spacing/font) --- */}
                <div className="space-y-2 text-xs text-gray-700">
                  <h4 className="text-[10px] font-bold uppercase text-indigo-500 pb-1 border-b border-indigo-100">
                    Samples Status
                  </h4>
                  {/* Total Samples */}
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span className="flex items-center gap-2">
                      <span className="text-indigo-500">
                        {IconMapping.samples}
                      </span>
                      Total Samples
                    </span>
                    <span>{formatAmount(item.samples ?? 0)}</span>
                  </div>
                  {/* Released */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-green-600">
                      <span className="text-green-500">
                        {IconMapping.released}
                      </span>
                      Released
                    </span>
                    <span className="font-semibold">
                      {formatAmount(item.released ?? 0)}
                    </span>
                  </div>
                  {/* Pending */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-red-600">
                      <span className="text-red-500">
                        {IconMapping.pending}
                      </span>
                      Pending
                    </span>
                    <span className="font-semibold">
                      {formatAmount(item.pendings ?? 0)}
                    </span>
                  </div>
                </div>

                {/* --- Group 2: TAT Breakdown --- */}
                <div className="mt-3 pt-2 space-y-2 text-xs text-gray-700 border-t border-gray-200">
                  <h4 className="text-[10px] font-bold uppercase text-blue-500 pb-1 border-b border-blue-100">
                    TAT Breakdown
                  </h4>
                  {/* Released Before TAT */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      {IconMapping.beforeTat}
                      Released Before TAT
                    </span>
                    <span className="font-medium text-green-700">
                      {formatAmount(item.releasedBeforeTat ?? 0)}
                    </span>
                  </div>
                  {/* Released On TAT */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      {IconMapping.onTat}
                      Released On TAT
                    </span>
                    <span className="font-medium text-blue-700">
                      {formatAmount(item.releasedOnTat ?? 0)}
                    </span>
                  </div>
                  {/* Released After TAT */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      {IconMapping.afterTat}
                      Released After TAT
                    </span>
                    <span className="font-medium text-orange-700">
                      {formatAmount(item.releasedAfterTat ?? 0)}
                    </span>
                  </div>
                  {/* Pending Beyond TAT */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-red-600">
                      {IconMapping.beyondTat}
                      Pending Beyond TAT
                    </span>
                    <span className="font-medium text-red-700">
                      {formatAmount(item.pendingBeyondTat ?? 0)}
                    </span>
                  </div>
                </div>

                {/* --- Group 3: Value & Billing --- */}
                <div className="mt-3 pt-2 space-y-2 text-xs text-gray-700 border-t border-gray-200">
                  <h4 className="text-[10px] font-bold uppercase text-blue-500 pb-1 border-b border-blue-100">
                    Value & Billing
                  </h4>
                  {/* Total Reg Value */}
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span className="flex items-center gap-2">
                      <span className="text-blue-500">
                        {IconMapping.totalValue}
                      </span>
                      Total Value
                    </span>
                    <span>₹{formatAmount(item.totalRegValue ?? 0)}</span>
                  </div>
                  {/* Pending Reg Value */}
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
                  {/* Pending Billed */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="text-blue-500">
                        {IconMapping.billed}
                      </span>
                      Pending Billed
                    </span>
                    <span className="font-medium">
                      {formatAmount(item.pendingBilled ?? 0)}
                    </span>
                  </div>
                  {/* Pending Invoiced */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="text-yellow-500">
                        {IconMapping.invoiced}
                      </span>
                      Pending Invoiced
                    </span>
                    <span className="font-medium">
                      {formatAmount(item.pendingInvoiced ?? 0)}
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
  // Removed: filters, setFilters props
}) {
  const finalSummary = labSummaryData;
  const rawData = data;

  // --- Client-side Pagination Logic (from InquiryList.jsx) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    // Reset to page 1 when new data is received (e.g., filter change in parent)
    setCurrentPage(1);
  }, [rawData]);

  const totalPages = Math.ceil(rawData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = rawData.slice(startIndex, startIndex + itemsPerPage);

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
  // -----------------------------------------------------------------

  const aggregateSummary = useMemo(() => {
    // Aggregation logic
    const totalSamples = finalSummary.reduce(
      (sum, item) => sum + (item.samples || 0),
      0
    );
    const totalReleased = finalSummary.reduce(
      (sum, item) => sum + (item.released || 0),
      0
    );
    const totalPending = finalSummary.reduce(
      (sum, item) => sum + (item.pendings || 0),
      0
    );
    const pendingBeyondTat = finalSummary.reduce(
      (sum, item) => sum + (item.pendingBeyondTat || 0),
      0
    );
    const pendingValue = finalSummary.reduce(
      (sum, item) => sum + (item.pendingRegValue || 0),
      0
    );

    return {
      totalSamples: totalSamples,
      totalReleased: totalReleased,
      totalPending: totalPending,
      pendingBeyondTat: pendingBeyondTat,
      pendingValue: pendingValue,
    };
  }, [finalSummary]);

  const finalKpiSummary =
    finalSummary.length > 0
      ? aggregateSummary
      : {
          totalSamples: 0,
          totalPending: 0,
          totalReleased: 0,
          pendingBeyondTat: 0,
          pendingValue: 0,
        };

  // Check for no data found
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 my-8">
          {/* Card 1: Total Samples */}
          <LabAnalysisSummaryCard
            title="Samples"
            value={formatAmount(finalKpiSummary.totalSamples)}
            color="blue"
            icon={<HiBeaker className="w-5 h-5" />}
          />

          {/* Card 2: Total Value */}
          <LabAnalysisSummaryCard
            title="Released Samples"
            value={`₹${formatAmount(finalKpiSummary.totalReleased)}`}
            color="green"
            icon={<HiCheckCircle className="w-5 h-5" />}
          />

          {/* Card 3: Pending Samples */}
          <LabAnalysisSummaryCard
            title="Pending Samples"
            value={formatAmount(finalKpiSummary.totalPending) || 0}
            color="red"
            icon={<HiClock className="w-5 h-5" />}
          />

          <LabAnalysisSummaryCard
            title="Pending Value"
            value={formatAmount(finalKpiSummary.pendingValue) || 0}
            color="orange"
            icon={<MdPaid className="w-5 h-5" />}
          />

          {/* Card 5: Pending Beyond TAT */}
          <LabAnalysisSummaryCard
            title="Pending Beyond TAT"
            value={formatAmount(finalKpiSummary.pendingBeyondTat)}
            color="teal"
            icon={<MdHourglassFull className="w-5 h-5" />}
          />
        </div>

        <LabSummaryKpiCard summaryData={finalSummary} />
      </div>
      <div className="bg-gray-50 p-8 rounded-3xl shadow-2xl">
        {/* Total Rows Display */}
        <div className="flex justify-between items-center pb-4">
          <span className="block text-sm font-medium text-gray-500 mt-1">
            Total Logs: {rawData.length}
          </span>
        </div>

        {/* --- Pagination TOP --- */}
        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            getPageNumbers={getPageNumbers}
          />
        )}

        {/* 3. Main Content: Table - uses paginatedData */}
        {paginatedData.length > 0 ? (
          <LabAnalysisTable data={paginatedData} />
        ) : (
          // This case handles when the rawData is loaded but the current page is empty (e.g., if total pages > 0 but the last page is clicked)
          rawData.length > 0 && (
            <div className="text-center text-gray-600 py-10 my-4 text-xl font-medium rounded-2xl bg-white shadow-xl border border-gray-200">
              No logs found on this page.
            </div>
          )
        )}

        {/* --- Pagination BOTTOM --- */}
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
