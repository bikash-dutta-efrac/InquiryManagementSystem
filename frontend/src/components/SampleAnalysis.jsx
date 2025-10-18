import React, { useState, useCallback, useMemo } from "react";
import {
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  Search,
  TestTube2,
} from "lucide-react";

import {
  IoSearch,
  IoDocumentText,
  IoCalendarSharp,
  IoCheckmarkCircle,
  IoTime,
  IoWarning,
  IoChevronDown,
  IoLayersSharp,
} from "react-icons/io5";
import {
  FaFlask,
  FaMoneyBillWave,
  FaMicroscope,
  FaSpinner,
  FaChartLine,
  FaTag,
  FaFlaskVial,
} from "react-icons/fa6";
import {
  MdCalendarToday,
  MdCheckCircle,
  MdCurrencyRupee,
  MdPending,
  MdPendingActions,
} from "react-icons/md";
import { HiBeaker, HiCalendar, HiCurrencyRupee } from "react-icons/hi2";
import { getSampleDetailsByRegNo } from "../services/api";

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

const colorMap = {
  blue: {
    border: "border-t-4 border-blue-500",
    bg: "bg-blue-100",
    icon: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  green: {
    border: "border-t-4 border-green-500",
    bg: "bg-green-100",
    icon: "text-green-600",
    badge: "bg-green-500 text-white", // Status badge for 'Report Delivered'
  },
  red: {
    border: "border-t-4 border-red-500",
    bg: "bg-red-100",
    icon: "text-red-600",
    badge: "bg-red-500 text-white", // Status badge for 'Pending from Lab End'
  },
  orange: {
    border: "border-t-4 border-orange-500",
    bg: "bg-orange-100",
    icon: "text-orange-600",
    badge: "bg-orange-500 text-white", // Status badge for 'Pending from QA End'
  },
  teal: {
    border: "border-t-4 border-teal-500",
    bg: "bg-teal-100",
    icon: "text-teal-600",
    badge: "bg-teal-100 text-teal-700",
  },
  gray: {
    border: "border-t-4 border-gray-500",
    bg: "bg-gray-100",
    icon: "text-gray-600",
    badge: "bg-gray-100 text-gray-700",
  },
};

const getCalculatedStatus = (item) => {
  const completionDt = item.analysisCompletionDateTime;
  const mailingDt = item.mailingDate;
  const currentStatus = item.status;

  if (!completionDt) {
    return "Pending from Lab End";
  }
  if (completionDt && !mailingDt) {
    return "Pending from QA End";
  }
  if (currentStatus === "Report Delivered") {
    return "Report Delivered";
  }

  // Fallback for released status that isn't explicitly 'Report Delivered' (if data inconsistencies occur)
  if (mailingDt) {
    return "Report Released";
  }

  return currentStatus || "PENDING";
};

const SummaryCard = ({ title, value, color = "gray", icon }) => {
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

const SampleDetailsCard = ({ data }) => {
  if (!data || data.length === 0) return null;

  const { registrationNo, sampleName, registrationDate } = data[0];

  const totalRegValue = data.reduce(
    (sum, item) => sum + (parseFloat(item.distributedRegisVal) || 0),
    0
  );

  const details = [
    {
      label: "Registration No",
      value: registrationNo.replace(/\s+-\s*$/, ""),
      icon: IoDocumentText, // Attractive Io5 Icon
      color: "text-blue-600",
      widthClass: "lg:col-span-2",
    },
    {
      label: "Sample Name",
      value: sampleName,
      icon: FaFlask, // Attractive FA Icon
      color: "text-teal-600",
      widthClass: "lg:col-span-2",
      textClass: "line-clamp-2",
    },
    {
      label: "Reg. Date",
      value: formatDate(registrationDate),
      icon: HiCalendar, // Attractive Io5 Icon
      color: "text-cyan-600",
      widthClass: "lg:col-span-1",
    },
    {
      label: "Total Reg. Value",
      value: `₹${formatAmount(totalRegValue)}`,
      icon: HiCurrencyRupee, // Attractive FA Icon
      color: "text-pink-600",
      widthClass: "lg:col-span-1",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl mt-6 border border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
        {details.map((item, index) => (
          <div
            key={index}
            className={`flex items-center space-x-3 p-3 bg-gray-50 rounded-xl shadow-inner ${item.widthClass}`}
          >
            <item.icon className={`w-6 h-6 ${item.color} flex-shrink-0`} />
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-gray-500">{item.label}</p>
              <p
                className={`text-sm font-bold text-gray-800 break-words ${
                  item.textClass || ""
                }`}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, color }) => (
  <div className="flex flex-col mb-2">
    <span className="text-xs font-medium text-gray-500">{label}</span>
    <span className={`font-semibold ${color}`}>{value}</span>
  </div>
);

const getStatusBadge = (item) => {
  const calculatedStatus = getCalculatedStatus(item);
  const text = calculatedStatus;

  const isDelivered = text === "Report Delivered";
  const isPendingQA = text === "Pending from QA End";
  const isPendingLab = text === "Pending from Lab End";
  const isNotReleased = text === "Report not Released";

  const color = isDelivered
    ? colorMap.green.badge
    : isPendingQA || isNotReleased
    ? colorMap.orange.badge
    : isPendingLab
    ? colorMap.red.badge
    : colorMap.gray.badge;

  const icon = isDelivered ? (
    <MdCheckCircle className="w-3 h-3" />
  ) : isPendingQA || isNotReleased ? (
    <MdPending className="w-3 h-3" />
  ) : (
    <IoTime className="w-3 h-3" />
  );

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${color}`}
    >
      {icon}
      {text}
    </span>
  );
};

const CollapsibleDetails = ({ isExpanded, children }) => (
  <div
    className={`
      transition-all duration-500 ease-in-out
      overflow-hidden 
      ${isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
    `}
  >
    <div>{children}</div>
  </div>
);

const SampleAnalysisTable = React.memo(({ data }) => {
  const [expandedLabs, setExpandedLabs] = useState({});

  const toggleExpansion = (labName) => {
    setExpandedLabs((prev) => ({
      ...prev,
      [labName]: !prev[labName],
    }));
  };

  // MODIFIED: Added calculation for labRegValue
  const groupedData = useMemo(() => {
    return data.reduce((acc, item) => {
      const labName = item.lab || "N/A";
      if (!acc[labName]) {
        acc[labName] = {
          total: 0,
          released: 0,
          pending: 0,
          labRegValue: 0, // ADDED: Initialize lab registered value
          parameters: [],
        };
      }

      acc[labName].total += 1;
      // ADDED: Accumulate registered value for the lab
      acc[labName].labRegValue += parseFloat(item.distributedRegisVal) || 0; 

      const isReleased = getCalculatedStatus(item) === "Report Delivered";
      if (isReleased) {
        acc[labName].released += 1;
      } else {
        acc[labName].pending += 1;
      }
      acc[labName].parameters.push(item);
      return acc;
    }, {});
  }, [data]);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl shadow-xl hidden lg:block border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-700 text-white shadow-lg">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider rounded-tl-xl w-3/6">
                Lab Name
              </th>
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider w-1/12">
                Parameters
              </th>
              {/* ADDED COLUMN: Reg. Value for the Lab */}
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider w-1/12">
                Registration Value
              </th>
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider w-1/12">
                Report Delivered
              </th>
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider w-1/12">
                Pending
              </th>
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider w-1/12 rounded-tr-xl"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {Object.entries(groupedData).map(([labName, labData]) => (
              <React.Fragment key={labName}>
                {/* Row for Lab Summary */}
                <tr
                  className="bg-white hover:bg-blue-50 transition-colors group border-t border-gray-100 cursor-pointer"
                  onClick={() => toggleExpansion(labName)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    <span className="flex items-center text-blue-600 font-semibold">
                      <FaFlaskVial className="w-4 h-4 inline mr-3 text-blue-500 flex-shrink-0" />{" "}
                      {labName}
                    </span>
                  </td>

                  {/* Total Parameters */}
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-indigo-700">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      <IoLayersSharp className="w-3 h-3 mr-1" />
                      {labData.total}
                    </span>
                  </td>
                  
                  {/* ADDED: Lab Value Column */}
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-pink-700">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">
                        <HiCurrencyRupee className="w-3 h-3 mr-1" />
                        {`₹${formatAmount(labData.labRegValue)}`}
                    </span>
                  </td>

                  {/* Released Column */}
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                    <span className="text-xs font-bold text-green-700 flex items-center justify-center">
                      <IoCheckmarkCircle className="w-4 h-4 mr-1 flex-shrink-0 text-green-500" />
                      {labData.released}
                    </span>
                  </td>

                  {/* Pending Column */}
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                    <span className="text-xs font-bold text-red-700 flex items-center justify-center">
                      <IoTime className="w-4 h-4 mr-1 flex-shrink-0 text-red-500" />
                      {labData.pending}
                    </span>
                  </td>

                  {/* Details/Expand Button Column */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 
                                    ${
                                      expandedLabs[labName]
                                        ? "bg-blue-600 text-white rotate-180 shadow-md"
                                        : "bg-gray-100 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-600"
                                    }`}
                      aria-expanded={!!expandedLabs[labName]}
                      aria-label={`Toggle details for ${labName}`}
                    >
                      <IoChevronDown
                        className={`w-4 h-4 font-bold transition-transform duration-300`}
                      />
                    </div>
                  </td>
                </tr>

                {/* Parameter Detail Row (Conditionally Rendered) - Added Animation Container */}
                <tr className="transition-all duration-500 ease-in-out">
                  {/* colSpan is 6 */}
                  <td colSpan="6"> 
                    <CollapsibleDetails isExpanded={expandedLabs[labName]}>
                      <div className="border-b-4 border-blue-300/80 shadow-inner">
                        {/* Column spans are 4/4/4 */}
                        <div className="py-3 px-6 text-xs text-blue-800 font-bold uppercase grid grid-cols-12 bg-blue-100/70 border-b border-blue-200">
                          <span className="col-span-4 text-left">
                            Parameter Name
                          </span>
                          <span className="col-span-4 text-center">
                            Completion Time
                          </span>
                          <span className="col-span-4 text-center">
                            Current Status
                          </span>
                        </div>
                        <div className="space-y-1 p-3">
                          {labData.parameters.map((item, paramIndex) => (
                            // grid-cols-12 layout is 4/4/4
                            <div
                              key={paramIndex}
                              className="grid grid-cols-12 text-sm py-3 px-3 bg-white border border-blue-100/50 rounded-lg shadow-sm transition-all duration-150 hover:bg-blue-50"
                            >
                              {/* Parameter Name (col-span-4) */}
                              <div className="font-medium text-gray-800 col-span-4 flex items-center">
                                <HiBeaker className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" />
                                <span className="truncate">
                                  {item.parameter}
                                </span>
                              </div>
                              {/* Completion Time (col-span-4) */}
                              <div className="text-center text-gray-600 col-span-4 flex items-center justify-center text-sm">
                                {item.analysisCompletionDateTime && (
                                  <IoTime className="w-3 h-3 mr-1 flex-shrink-0" />
                                )}
                                <span className="truncate">
                                  {item.analysisCompletionDateTime
                                    ? formatDate(
                                        item.analysisCompletionDateTime,
                                        true
                                      )
                                    : "---"}
                                </span>
                              </div>
                              {/* Status (col-span-4) */}
                              <div className="text-center col-span-4 flex items-center justify-center">
                                {getStatusBadge(item)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleDetails>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* -------------------------------------- */}
      {/* Mobile/Small Screen View (Collapsible Divs) - Enhanced Styles */}
      {/* -------------------------------------- */}
      <div className="lg:hidden space-y-4">
        {Object.entries(groupedData).map(([labName, labData]) => (
          <div
            key={labName}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            {/* Lab Summary Header (Clickable) */}
            <div
              className="p-4 bg-blue-50 cursor-pointer flex justify-between items-center transition-colors hover:bg-blue-100 border-b border-blue-200"
              onClick={() => toggleExpansion(labName)}
            >
              <h4 className="text-base font-bold text-blue-800 flex items-center">
                <FaFlaskVial className="w-5 h-5 inline mr-2 text-blue-500" />
                {labName}
              </h4>
              {/* Attractive, icon-only mobile expand button */}
              <div
                className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center 
                                    ${
                                      expandedLabs[labName]
                                        ? "bg-blue-600 text-white rotate-180 shadow-md"
                                        : "bg-gray-200 text-gray-700 hover:bg-blue-200 hover:text-blue-700"
                                    }`}
                aria-expanded={!!expandedLabs[labName]}
              >
                <IoChevronDown
                  className={`w-4 h-4 transform transition-transform duration-300`}
                />
              </div>
            </div>

            {/* Summary Metrics uses grid-cols-4 */}
            <div className="grid grid-cols-4 divide-x divide-gray-200 border-t border-gray-200 bg-gray-50 text-center">
              <div className="p-3">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Total
                </p>
                <p className="font-bold text-blue-700 text-lg">
                  {labData.total}
                </p>
              </div>
              
              {/* Lab Value Metric for Mobile */}
              <div className="p-3">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Reg. Value
                </p>
                <p className="font-bold text-pink-600 text-lg">
                  {`₹${formatAmount(labData.labRegValue)}`}
                </p>
              </div>

              <div className="p-3">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Report Delivered
                </p>
                <p className="font-bold text-green-600 text-lg">
                  {labData.released}
                </p>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Pending
                </p>
                <p className="font-bold text-red-600 text-lg">
                  {labData.pending}
                </p>
              </div>
            </div>

            {/* Parameter Details (Conditionally Rendered) */}
            <CollapsibleDetails isExpanded={expandedLabs[labName]}>
              <div className="p-4 space-y-3 border-t-2 border-blue-200">
                <p className="text-sm font-bold text-gray-700 uppercase flex items-center">
                  <FaChartLine className="w-4 h-4 mr-1 text-blue-400" />{" "}
                  Parameter Breakdown
                </p>
                {labData.parameters.map((item, paramIndex) => (
                  <div
                    key={paramIndex}
                    className="bg-white p-3 rounded-lg shadow-md border border-blue-100 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-sm font-semibold text-gray-900 flex items-center pr-2">
                        <FaMicroscope className="w-4 h-4 text-teal-500 mr-1" />
                        {item.parameter}
                      </h5>
                      {getStatusBadge(item)}
                    </div>
                    {/* Only Completion Time DetailItem remains */}
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-100">
                      <DetailItem
                        label="Completion Time"
                        value={
                          item.analysisCompletionDateTime
                            ? formatDate(item.analysisCompletionDateTime, true)
                            : "---"
                        }
                        color="text-gray-600"
                      />
                      {/* Removed Reg. Value DetailItem */}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleDetails>
          </div>
        ))}
      </div>

      {data.length === 0 && initialSearchDone && !loading && (
        <div className="text-center py-10 text-gray-500 font-medium">
          No analysis data found for this registration number.
        </div>
      )}
      {data.length === 0 && !initialSearchDone && !loading && (
        <div className="text-center py-10 text-gray-500 font-medium">
          Enter a Registration Number to view details.
        </div>
      )}
    </div>
  );
});

// --- NEW COMPONENT: Attractive Initial View ---
const InitialStateView = ({ showInitialLoader }) => (
    <div className="flex flex-col justify-center items-center py-20 bg-white rounded-2xl shadow-xl border border-gray-200">
        {showInitialLoader ? (
            <div className="flex flex-col items-center">
                <div className="relative mb-6 w-20 h-20">
                    <FlaskConical className="w-16 h-16 text-blue-500 absolute animate-ping opacity-75" />
                    <TestTube2 className="w-16 h-16 text-indigo-600 absolute top-0 left-0" />
                </div>
                <span className="text-xl font-bold text-indigo-700 mt-2">
                    Initializing Sample Portal...
                </span>
                <span className="text-sm font-medium text-gray-500">
                    Preparing for your first search.
                </span>
            </div>
        ) : (
            <div className="flex flex-col items-center">
                <div className="relative mb-6 w-20 h-20">
                    <Search className="w-16 h-16 text-gray-400 absolute top-0 left-0" />
                    <ClipboardList className="w-8 h-8 text-blue-500 absolute bottom-0 right-0 p-1 bg-white rounded-full border-2 border-white" />
                </div>
                <span className="text-xl font-medium text-gray-600">
                    Enter a Registration Number to begin analysis.
                </span>
                <span className="text-sm text-gray-400 mt-1">
                    Please use the search bar above to fetch sample details.
                </span>
            </div>
        )}
    </div>
);
// ---------------------------------------------

export default function SampleAnalysis() {
  const [regNo, setRegNo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialSearchDone, setInitialSearchDone] = useState(false);
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  const sampleDetails = data && data.length > 0 ? data[0] : null;

  const summaryData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalParameters: 0,
        pending: 0,
        released: 0,
        pendingRegValue: 0,
      };
    }

    const calculatedData = data.map((item) => ({
      ...item,
      calculatedStatus: getCalculatedStatus(item),
    }));

    const released = calculatedData.filter(
      (item) => item.calculatedStatus === "Report Delivered"
    );
    const pendingItems = calculatedData.filter(
      (item) => item.calculatedStatus !== "Report Delivered"
    );

    const pendingRegValue = pendingItems.reduce(
      (sum, item) => sum + (parseFloat(item.distributedRegisVal) || 0),
      0
    );

    return {
      totalParameters: data.length,
      pending: pendingItems.length,
      released: released.length,
      pendingRegValue: pendingRegValue,
    };
  }, [data]);

  const handleSearch = useCallback(async () => {
    const trimmedRegNo = regNo?.trim(); 
    
    // This is set on explicit user action
    setInitialSearchDone(true); 
    setShowInitialLoader(false); // Stop the initial loader once user interacts

    if (!trimmedRegNo) {
      setError("Please enter a Registration Number.");
      setData(null);
      return;
    }

    if (trimmedRegNo.length < 16) {
        setError("Registration Number must be at least 16 characters long.");
        setData(null);
        return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await getSampleDetailsByRegNo(trimmedRegNo);

      if (!result || result.length === 0) {
        setError(`No analysis data found for Registration No: ${trimmedRegNo}`);
        setData([]);
      } else {
        setData(result);
      }
    } catch (e) {
      console.error("API Error:", e);
      setError("An error occurred while fetching data. Please try again.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [regNo]);

  // Initial data fetch simulation for the preset value
  React.useEffect(() => {
    // Only run if the initial search hasn't been done yet
    if (regNo && !initialSearchDone) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Simulate initial loading time, then switch to the search prompt if no search was run
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!initialSearchDone) {
        setShowInitialLoader(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [initialSearchDone]);

  return (
    <div className="bg-gray-50 rounded-3xl shadow-2xl font-inter">
      <div className="relative p-6">
        <div className="absolute top-0 left-0">
          <div className="relative group">
            <div className="relative flex items-center justify-center px-8 py-2 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white text-medium font-extrabold tracking-wider rounded-br-4xl rounded-tl-3xl shadow-xl border-2 border-sky-400/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span>Sample Analysis</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-sky-100/40 to-blue-100/40 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-100/30 to-sky-100/30 rounded-full blur-lg animate-pulse delay-150"></div>

        <div className="absolute top-6 right-8 z-20 w-full max-w-xs sm:max-w-md">
          <div
            className="flex items-center p-1 rounded-full bg-white 
                       shadow-2xl shadow-blue-400/30 transition-all duration-300 
                       transform hover:scale-[1.01] border-2 border-blue-200/50 
                       focus-within:border-blue-400 focus-within:shadow-indigo-300/60"
          >
            <input
              type="text"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter Registration No"
              className="flex-grow p-2 pl-5 text-sm bg-transparent rounded-full focus:outline-none 
                         placeholder-gray-400 font-semibold text-gray-700
                         focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-shrink-0 w-10 h-10 rounded-full 
                         bg-gradient-to-br from-indigo-600 to-sky-500 text-white 
                         shadow-lg shadow-indigo-500/50
                         transition duration-300 ease-in-out flex items-center justify-center 
                         disabled:opacity-60 disabled:shadow-none
                         transform hover:scale-[1.05] active:scale-90"
              aria-label="Search"
            >
              {loading ? (
                <FaSpinner className="w-5 h-5 animate-spin" /> // Attractive FA Spinner
              ) : (
                <IoSearch className="w-5 h-5" /> // Attractive Io5 Search
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8 pt-6 sm:pt-8">
        {sampleDetails && !loading && <SampleDetailsCard data={data} />}

        <div className="mt-8 min-h-[300px]">
          {/* --- LOADING VIEW --- */}
          {loading && (
            <div className="flex flex-col justify-center items-center py-20 bg-white rounded-2xl shadow-xl border border-gray-200">
              <FaSpinner className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
              <span className="text-xl font-bold text-gray-700">
                Analyzing Sample Data...
              </span>
              <span className="text-sm font-medium text-gray-500 mt-1">
                Please wait while we fetch the sample breakdown.
              </span>
            </div>
          )}
          {/* --------------------------- */}

          {error && initialSearchDone && !loading && (
            <div className="p-8 bg-red-50 border border-red-300 rounded-2xl flex items-center justify-center space-x-3 shadow-md">
              <IoWarning className="w-6 h-6 text-red-600" />
              <p className="text-lg font-medium text-red-800">{error}</p>
            </div>
          )}

          {data && data.length > 0 && !loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
              <SummaryCard
                title="Total Parameters"
                value={summaryData.totalParameters}
                color="blue"
                icon={<FaFlaskVial className="w-5 h-5" />} // Attractive FA6 Icon
              />
              <SummaryCard
                title="Report Delivered"
                value={summaryData.released}
                color="green"
                icon={<CheckCircle2 className="w-5 h-5" />} // Attractive Io5 Icon (Done Circle)
              />
              <SummaryCard
                title="Pending"
                value={summaryData.pending}
                color="red"
                icon={<MdPendingActions className="w-5 h-5" />} // Attractive MD Icon (Pending)
              />
              <SummaryCard
                title="Pending Value"
                value={`₹${formatAmount(summaryData.pendingRegValue)}`}
                color="teal"
                icon={<HiCurrencyRupee className="w-5 h-5" />} // Attractive FA Icon (Money)
              />
            </div>
          )}

          {data && data.length > 0 && !loading && (
            <SampleAnalysisTable data={data} />
          )}

          {/* --- INITIAL VIEW CONDITION --- */}
          {!loading && !initialSearchDone && !data && !error && (
            <InitialStateView showInitialLoader={showInitialLoader} />
          )}
        </div>
      </div>
    </div>
  );
}