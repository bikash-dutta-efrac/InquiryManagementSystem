import { useMemo, useState, useEffect } from "react";
import {
  FlaskConical, // Replacement for HiBeaker
  Clock, // Replacement for HiClock
  CheckCircle, // Replacement for HiCheckCircle
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { HiCheck, HiClock } from "react-icons/hi2";
import { MdCheckCircle, MdPending } from "react-icons/md";
import { IoTime } from "react-icons/io5";

// Helper functions (formatAmount, formatDate, getDayBeforeMonthStart, getPreviousDate, colorMap) remain the same
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
  // Corrected regex for JavaScript context
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
    const timeOptions =
      includeTime && parts.length > 3
        ? { hour: "2-digit", minute: "2-digit", hour12: true }
        : {};

    const formattedDate = date.toLocaleDateString("en-GB", dateOptions);
    const formattedTime =
      includeTime && parts.length > 3
        ? " " + date.toLocaleTimeString("en-US", timeOptions)
        : "";

    return formattedDate + formattedTime;
  } catch (e) {
    return dateString;
  }
};

function getDayBeforeMonthStart(year, month) {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 1);

  const yyyy = firstDayOfMonth.getFullYear();
  const mm = String(firstDayOfMonth.getMonth() + 1).padStart(2, "0");
  const dd = String(firstDayOfMonth.getDate()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy}`;
}

function getPreviousDate(d) {
  // Regex must be defined correctly outside of JSX
  const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!m) {
    return `Error: Invalid format. Use dd/mm/yyyy.`;
  }

  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);

  const dateObj = new Date(year, month - 1, day);

  if (
    dateObj.getDate() !== day ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getFullYear() !== year
  ) {
    return `Error: Invalid date value.`;
  }

  const prevDateObj = new Date(dateObj.getTime() - 86400000);

  const pd = prevDateObj.getDate().toString().padStart(2, "0");
  const pm = (prevDateObj.getMonth() + 1).toString().padStart(2, "0");
  const py = prevDateObj.getFullYear();

  return `${pd}/${pm}/${py}`;
}

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
      className={`bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 ${colorClasses.border} `}
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

const getStatusBadge = (item) => {
  if (item.status === "Released") {
    return {
      text: "Released",
      badgeColor: "bg-green-500 text-white text-[11px]",
      icon: <MdCheckCircle className="w-4 h-4" />, // Updated icon
    };
  }

  if (item.status === "PartialReleased") {
    return {
      text: "Partial Released",
      badgeColor: "bg-amber-500 text-white text-[11px]",
      icon: <MdPending className="w-4 h-4" />, // Updated icon
    };
  }

  return {
    text:
      item.status === "Pending"
        ? "Pending"
        : item.status.charAt(0) + item.status.slice(1).toLowerCase(),
    badgeColor: "bg-red-500 text-white text-[11px]",
    icon: <IoTime className="w-4 h-4" />, // Updated icon
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

const LabAnalysisTable = ({ data }) => {
  return (
    <div className="bg-white my-4 rounded-2xl shadow-lg border border-gray-200">
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
                <tr
                  key={registrationNo + index}
                  className="hover:bg-gray-50 transition-colors"
                >
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

                <div>
                  <span className="block text-gray-500 text-xs font-semibold">
                    Sample:
                  </span>
                  <p className="text-gray-800 font-semibold">{sampleName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                  <div className="flex flex-col">
                    <span className="text-gray-500">Reg. Date:</span>
                    <span className="text-gray-900 font-semibold">
                      {regDateTime}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-gray-500">Reg. Value:</span>
                    <span className="text-gray-700 font-semibold">{value}</span>
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
      All: {
        name: "All",
        status: "All",
        active: "bg-blue-600 text-white shadow-xs ring-2 ring-blue-300",
        inactive:
          "bg-blue-100 text-blue-600 border border-blue-200 hover:bg-blue-50",
      },
      Released: {
        name: "Released",
        status: "Released",
        active: "bg-green-600 text-white shadow-xs ring-2 ring-green-300",
        inactive:
          "bg-green-100 text-green-600 border border-green-200 hover:bg-green-50",
      },
      Pending: {
        name: "Pending",
        status: "Pending",
        active: "bg-red-600 text-white shadow-xs ring-2 ring-red-300",
        inactive:
          "bg-red-100 text-red-600 border border-red-200 hover:bg-red-50",
      },
      PartialReleased: {
        name: "Partial Released",
        status: "PartialReleased",
        active: "bg-amber-600 text-white shadow-xs ring-2 ring-amber-300",
        inactive:
          "bg-amber-100 text-amber-600 border border-amber-200 hover:bg-amber-50",
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
      {
        count: statusCounts["PartialReleased"] || 0,
        ...chipColors["PartialReleased"],
      },
    ];

    return chipData.filter((chip) => chip.count > 0 || chip.status === "All");
  }, [data]);

  return (
    <div className="flex flex-wrap gap-3 p-1 rounded-xl">
      {statuses.map((chip) => (
        <button
          key={chip.status}
          onClick={() => setFilter(chip.status)}
          className={`
            px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-300 ease-in-out 
            transform hover:scale-[1.03] focus:outline-none focus:ring-2
            ${
              currentFilter === chip.status
                ? `${chip.active} ring-opacity-50`
                : `${chip.inactive} focus:ring-2 focus:ring-opacity-50 focus:ring-gray-300`
            }
          `}
        >
          {chip.name}{" "}
          <span className="font-bold ml-1">{formatAmount(chip.count)}</span>
        </button>
      ))}
    </div>
  );
};

// --- THIS IS THE UPDATED COMPONENT ---
const LabSummaryKpiCard = ({ summaryData }) => {
  const items = summaryData || [];

  // Helper function to calculate percentages safely
  const calculatePercentage = (part, total) => {
    const partNum = part ?? 0;
    const totalNum = total ?? 0;
    if (totalNum === 0 || partNum === 0) {
      return "0%";
    }
    return `${((partNum / totalNum) * 100).toFixed(0)}%`;
  };

  if (!items.length) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-1xl overflow-hidden border-4 border-indigo-200">
      {/* Header - Bold Blue/Indigo Gradient */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-4">
        <h3 className="text-xl font-extrabold text-white tracking-wide">
          Lab Summary Overview
        </h3>
        <p className="text-sm text-blue-200">
          Broken down by lab details and status
        </p>
      </div>

      {/* Desktop View - Table-like Structure */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-full">
          {/* Column Headers - Row 1 */}
          <div className="grid grid-cols-12 gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-extrabold border-b-2 border-blue-500">
            <div className="col-span-2 text-xs font-bold uppercase tracking-wider">
              Lab Name
            </div>
            <div className="col-span-1 text-center text-xs font-bold uppercase tracking-wider">
              Total
            </div>
            {/* Column 3: Released Count (1) */}
            <div className="col-span-1 text-center text-xs font-bold uppercase tracking-wider text-cyan-300">
              Released
            </div>
            {/* NEW Column 4: Pending Count (1) - Added after Released */}
            <div className="col-span-1 text-center text-xs font-bold uppercase tracking-wider text-orange-300">
              Pending
            </div>
            {/* Column 5: Released TAT Status (3) */}
            <div className="col-span-3 text-center text-xs font-bold uppercase tracking-wider border-l-2 border-blue-500 pl-2">
              Released TAT Status
            </div>
            {/* Column 6: Pending TAT Status (2) */}
            <div className="col-span-2 text-center text-xs font-bold uppercase tracking-wider border-l-2 border-blue-500 pl-2">
              Pending TAT Status
            </div>
            {/* Column 7: Values (2) */}
            <div className="col-span-2 text-center text-xs font-bold uppercase tracking-wider border-l-2 border-blue-500 pl-2 text-sky-300">
              Values
            </div>
          </div>

          {/* Subheaders for nested columns - Row 2 */}
          <div className="grid grid-cols-12 gap-3 px-6 py-2 bg-blue-50/50 border-b border-blue-100 text-[10px] font-semibold text-blue-900 uppercase">
            <div className="col-span-2"></div>
            <div className="col-span-1 text-center">Samples</div>
            <div className="col-span-1 text-center text-cyan-700">
              Count & %
            </div>
            <div className="col-span-1 text-center text-orange-700">
              Count & %
            </div>
            <div className="col-span-1 text-center text-blue-700">Before</div>
            <div className="col-span-1 text-center text-blue-700">On</div>
            <div className="col-span-1 text-center text-amber-700">After</div>
            <div className="col-span-1 text-center text-orange-700">Before</div>
            <div className="col-span-1 text-center text-red-700">Beyond</div>
            <div className="col-span-1 text-center text-blue-700">Total</div>
            <div className="col-span-1 text-center text-sky-700">Pending</div>
          </div>

          {/* Data Rows */}
          {items.map((item, idx) => {
            // --- Percentage Calculations ---
            const releasedTotalPct = calculatePercentage(
              item.released,
              item.samples
            );
            const pendingTotalPct = calculatePercentage(
              item.pendings,
              item.samples
            );
            const releasedBeforePct = calculatePercentage(
              item.releasedBeforeTat,
              item.released
            );
            const releasedOnPct = calculatePercentage(
              item.releasedOnTat,
              item.released
            );
            const releasedAfterPct = calculatePercentage(
              item.releasedAfterTat,
              item.released
            );
            const pendingBeforePct = calculatePercentage(
              item.pendingBeforeTat,
              item.pendings
            );
            const pendingBeyondPct = calculatePercentage(
              item.pendingBeyondTat,
              item.pendings
            );

            return (
              <div
                key={idx}
                className={`group grid grid-cols-12 gap-3 px-6 py-4 border-b border-blue-100/70 hover:bg-blue-600 transition-all duration-200 ${
                  idx % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                }`}
              >
                {/* Lab Name (2) */}
                <div className="col-span-2 flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 mr-2 group-hover:bg-white"></div>
                  <span className="font-bold text-gray-900 text-sm group-hover:text-white">
                    {item.lab ?? "N/A"}
                  </span>
                </div>

                {/* Total Samples (1) */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className="px-3 py-1 text-indigo-700 font-bold text-sm group-hover:text-white">
                    {formatAmount(item.samples ?? 0)}
                  </span>
                </div>

                {/* Released Count (1) - ATTRACTIVE STACK */}
                <div className="col-span-1 flex flex-col items-center justify-center text-center">
                  <span className="px-2 py-1 text-cyan-800 font-bold text-sm group-hover:text-white">
                    {formatAmount(item.released ?? 0)}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 mt-0.5 group-hover:text-white/90">
                    {releasedTotalPct}
                  </span>
                </div>

                {/* Pending Count (1) - ATTRACTIVE STACK */}
                <div className="col-span-1 flex flex-col items-center justify-center text-center">
                  <span className="px-2 py-1 text-orange-800 font-bold text-sm group-hover:text-white">
                    {formatAmount(item.pendings ?? 0)}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 mt-0.5 group-hover:text-white/90">
                    {pendingTotalPct}
                  </span>
                </div>

                {/* Released TAT Status (3 total: 1+1+1) - ATTRACTIVE STACK */}
                <div className="col-span-1 flex flex-col items-center justify-center text-center border-l border-blue-100 pl-2">
                  <span className="px-2 py-1 text-blue-700 font-bold text-[13px] group-hover:text-white">
                    {formatAmount(item.releasedBeforeTat ?? 0)}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 mt-0.5 group-hover:text-white/90">
                    {releasedBeforePct}
                  </span>
                </div>
                <div className="col-span-1 flex flex-col items-center justify-center text-center">
                  <span className="px-2 py-1 text-blue-700 font-bold text-[13px] group-hover:text-white">
                    {formatAmount(item.releasedOnTat ?? 0)}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 mt-0.5 group-hover:text-white/90">
                    {releasedOnPct}
                  </span>
                </div>
                <div className="col-span-1 flex flex-col items-center justify-center text-center">
                  <span className="px-2 py-1 text-amber-800 font-bold text-[13px] group-hover:text-white">
                    {formatAmount(item.releasedAfterTat ?? 0)}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 mt-0.5 group-hover:text-white/90">
                    {releasedAfterPct}
                  </span>
                </div>

                {/* Pending TAT Status (2 total: 1+1) - ATTRACTIVE STACK */}
                <div className="col-span-1 flex flex-col items-center justify-center text-center border-l border-blue-100 pl-2">
                  <span className="px-2 py-1 text-orange-800 font-bold text-[13px] group-hover:text-white">
                    {formatAmount(item.pendingBeforeTat ?? 0)}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 mt-0.5 group-hover:text-white/90">
                    {pendingBeforePct}
                  </span>
                </div>
                <div className="col-span-1 flex flex-col items-center justify-center text-center">
                  <span className="px-2 py-1 text-red-800 font-bold text-[13px] group-hover:text-white">
                    {formatAmount(item.pendingBeyondTat ?? 0)}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 mt-0.5 group-hover:text-white/90">
                    {pendingBeyondPct}
                  </span>
                </div>

                {/* Values (2 total: 1+1) */}
                <div className="col-span-1 flex items-center justify-center border-l border-blue-100 pl-2">
                  <span className="px-2 py-1 text-blue-700 font-bold text-sm group-hover:text-white">
                    ₹{formatAmount(item.totalRegValue ?? 0)}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <span className="px-2 py-1 text-sky-800 font-bold text-sm group-hover:text-white">
                    ₹{formatAmount(item.pendingRegValue ?? 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View - Card Style */}
      <div className="lg:hidden p-4 space-y-4">
        {items.map((item, idx) => {
          // --- Percentage Calculations (repeated for mobile map) ---
          const releasedTotalPct = calculatePercentage(
            item.released,
            item.samples
          );
          const pendingTotalPct = calculatePercentage(
            item.pendings,
            item.samples
          );
          const releasedBeforePct = calculatePercentage(
            item.releasedBeforeTat,
            item.released
          );
          const releasedOnPct = calculatePercentage(
            item.releasedOnTat,
            item.released
          );
          const releasedAfterPct = calculatePercentage(
            item.releasedAfterTat,
            item.released
          );
          const pendingBeforePct = calculatePercentage(
            item.pendingBeforeTat,
            item.pendings
          );
          const pendingBeyondPct = calculatePercentage(
            item.pendingBeyondTat,
            item.pendings
          );

          return (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg border-l-4 border-indigo-500 p-5 hover:shadow-xl transition-all duration-200"
            >
              {/* Lab Name Header */}
              <div className="flex items-center mb-4 pb-3 border-b-2 border-indigo-200">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mr-2"></div>
                <h4 className="font-bold text-lg text-gray-900">
                  {item.lab ?? "N/A"}
                </h4>
              </div>

              {/* Samples Section */}
              <div className="space-y-3 mb-4">
                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                  <div className="text-xs font-bold text-indigo-700 uppercase mb-2">
                    Samples Overview
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Total Samples</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-bold">
                      {formatAmount(item.samples ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
                  <div className="text-xs font-bold text-cyan-700 uppercase mb-2">
                    Released Samples
                  </div>
                  <div className="space-y-2">
                    {/* ATTRACTIVE MOBILE STACK */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-cyan-600" />
                        Total Released
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-cyan-800 text-base">
                          {formatAmount(item.released ?? 0)}
                        </span>
                        <span className="block text-xs font-semibold text-cyan-700">
                          {releasedTotalPct} of Total
                        </span>
                      </div>
                    </div>
                    {/* END ATTRACTIVE MOBILE STACK */}
                    <div className="pl-5 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Before TAT (On Time)
                        </span>
                        <span className="flex items-baseline font-semibold">
                          <span className="text-blue-700 w-12 text-right">
                            {formatAmount(item.releasedBeforeTat ?? 0)}
                          </span>
                          <span className="text-gray-500 w-10 text-right text-xs font-medium">
                            {releasedBeforePct}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">On TAT</span>
                        <span className="flex items-baseline font-semibold">
                          <span className="text-blue-700 w-12 text-right">
                            {formatAmount(item.releasedOnTat ?? 0)}
                          </span>
                          <span className="text-gray-500 w-10 text-right text-xs font-medium">
                            {releasedOnPct}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          After TAT (Delayed)
                        </span>
                        <span className="flex items-baseline font-semibold">
                          <span className="text-amber-700 w-12 text-right">
                            {formatAmount(item.releasedAfterTat ?? 0)}
                          </span>
                          <span className="text-gray-500 w-10 text-right text-xs font-medium">
                            {releasedAfterPct}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <div className="text-xs font-bold text-orange-700 uppercase mb-2">
                    Pending Samples
                  </div>
                  <div className="space-y-2">
                    {/* ATTRACTIVE MOBILE STACK */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <Clock className="w-4 h-4 text-orange-600" />
                        Total Pending
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-orange-800 text-base">
                          {formatAmount(item.pendings ?? 0)}
                        </span>
                        <span className="block text-xs font-semibold text-orange-700">
                          {pendingTotalPct} of Total
                        </span>
                      </div>
                    </div>
                    {/* END ATTRACTIVE MOBILE STACK */}
                    <div className="pl-5 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Pending Before TAT
                        </span>
                        <span className="flex items-baseline font-semibold">
                          <span className="text-orange-700 w-12 text-right">
                            {formatAmount(item.pendingBeforeTat ?? 0)}
                          </span>
                          <span className="text-gray-500 w-10 text-right text-xs font-medium">
                            {pendingBeforePct}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Pending Beyond TAT
                        </span>
                        <span className="flex items-baseline font-semibold">
                          <span className="text-red-700 w-12 text-right">
                            {formatAmount(item.pendingBeyondTat ?? 0)}
                          </span>
                          <span className="text-gray-500 w-10 text-right text-xs font-medium">
                            {pendingBeyondPct}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
                  <div className="text-xs font-bold text-sky-700 uppercase mb-2">
                    Financial Values
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Value</span>
                      <span className="font-bold text-blue-700">
                        ₹{formatAmount(item.totalRegValue ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Pending Value</span>
                      <span className="font-bold text-sky-700">
                        ₹{formatAmount(item.pendingRegValue ?? 0)}
                      </span>
                    </div>
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
// --- END OF UPDATED COMPONENT ---

export default function LabAnalysis({
  data = [],
  labSummaryData = [],
  sampleOverview = null,
  filters = null,
}) {
  const finalSummary = labSummaryData;
  const rawData = data;

  // Set default values for sampleOverview and filters to prevent potential null/undefined errors
  const safeSampleOverview = sampleOverview || {
    totalSamples: 0,
    totalReleased: 0,
    totalPending: 0,
    totalOpeningPending: 0,
  };
  const safeFilters = filters || {
    fromDate: null,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const itemsPerPage = 20;

  const filteredData = useMemo(() => {
    if (statusFilter === "All") {
      return rawData;
    }
    return rawData.filter((item) => item.status === statusFilter);
  }, [rawData, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rawData, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
        <span className="mr-2">✖</span> No lab analysis data found for the
        selected filters.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-3xl shadow-2xl mb-8">
      <div className="relative p-6">
        <div className="absolute top-0 left-0">
          <div className="relative group">
            <div className="relative flex items-center justify-center px-8 py-2 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white text-medium font-extrabold tracking-wider rounded-br-4xl rounded-tl-3xl shadow-xl border-2 border-sky-400/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span>Lab Analysis</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-sky-100/40 to-blue-100/40 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-100/30 to-sky-100/30 rounded-full blur-lg animate-pulse delay-150"></div>

        <div className="grid p-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-10">
          <LabAnalysisSummaryCard
            title="Samples"
            value={safeSampleOverview.totalSamples}
            color="blue"
            icon={<FlaskConical className="w-5 h-5" />}
          />

          <LabAnalysisSummaryCard
            title="Released Samples"
            value={`${formatAmount(safeSampleOverview.totalReleased)}`}
            color="green"
            icon={<CheckCircle2 className="w-5 h-5" />}
          />

          <LabAnalysisSummaryCard
            title="Pending Samples"
            value={formatAmount(safeSampleOverview.totalPending) || 0}
            color="red"
            icon={<Clock className="w-5 h-5" />}
          />

          <LabAnalysisSummaryCard
            title={
              <>
                Pending till <br />
                {safeFilters.fromDate !== null
                  ? formatDate(
                      getPreviousDate(
                        safeFilters.fromDate.split("-").reverse().join("/")
                      )
                    )
                  : formatDate(
                      getDayBeforeMonthStart(
                        safeFilters.year,
                        safeFilters.month
                      )
                    )}
              </>
            }
            value={safeSampleOverview.totalOpeningPending}
            color="teal"
            icon={<Clock className="w-5 h-5" />}
          />
        </div>

        <LabSummaryKpiCard summaryData={finalSummary} />
      </div>
      <div className="bg-gray-50 p-8 rounded-3xl shadow-2xl">
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200 mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 ml-1">
            Filter by Status
          </h3>
          <StatusFilterChips
            currentFilter={statusFilter}
            setFilter={setStatusFilter}
            data={rawData}
          />
        </div>
        {/* --- END UPDATED SECTION --- */}

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
          <div className="text-center text-gray-600 py-10 my-4 text-xl font-medium rounded-2xl bg-white shadow-xl border border-gray-200">
            {filteredData.length > 0
              ? "No logs found on this page."
              : rawData.length > 0
              ? `No logs match the selected filter "${statusFilter}".`
              : "No log data available."}
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
