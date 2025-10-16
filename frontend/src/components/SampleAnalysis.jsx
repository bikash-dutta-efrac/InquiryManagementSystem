import React, { useState, useCallback, useMemo } from "react";
import {
  Search,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle,
  TestTube2, 
  FlaskConical,
  ClipboardList,
  DollarSign
} from "lucide-react";
import {
  HiBeaker,
  HiCheckCircle,
  HiClipboardDocument,
  HiClock,
  HiCurrencyRupee,
} from "react-icons/hi2";
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
    badge: "bg-blue-100 text-blue-700",
  },
  green: {
    border: "border-t-4 border-green-500",
    bg: "bg-green-100",
    icon: "text-green-600",
    badge: "bg-green-500 text-white",
  },
  red: {
    border: "border-t-4 border-red-500",
    bg: "bg-red-100",
    icon: "text-red-600",
    badge: "bg-red-500 text-white",
  },
  orange: {
    border: "border-t-4 border-orange-500",
    bg: "bg-orange-100",
    icon: "text-orange-600",
    badge: "bg-orange-500 text-white",
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
        return 'Pending from Lab End';
    } 
    if (completionDt && !mailingDt) {
        return 'Pending from QA End';
    } 

    if (mailingDt && currentStatus !== "Report Delivered") {
        return 'Report not Released';
    } 
    if (currentStatus === "Report Delivered") {
        return 'Report Delivered';
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
  const { registrationNo, sampleName, registrationDate } = data[0]; 

  const totalRegValue = data.reduce(
      (sum, item) => sum + (parseFloat(item.distributedRegisVal) || 0),
      0
  );

  const details = [
    {
      label: "Registration No",
      value: registrationNo.replace(/\s+-\s*$/, ''),
      icon: HiClipboardDocument,
      color: "text-blue-600",
      // Increased width: 2/6 = ~33%
      widthClass: "lg:col-span-2",
    },
    {
      label: "Sample Name",
      value: sampleName,
      icon: TestTube2,
      color: "text-teal-600",
      // Increased width: 2/6 = ~33%
      widthClass: "lg:col-span-2",
      textClass: "line-clamp-2", // Truncate to 2 lines
    },
    {
      label: "Reg. Date", 
      value: formatDate(registrationDate),
      icon: HiClock,
      color: "text-cyan-600",
      // Reduced width: 1/6 = ~16.7%
      widthClass: "lg:col-span-1",
    },
    {
      label: "Total Reg. Value", 
      value: `₹${formatAmount(totalRegValue)}`, 
      icon: HiCurrencyRupee, 
      color: "text-pink-600",
      // Reduced width: 1/6 = ~16.7%
      widthClass: "lg:col-span-1",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl mt-6 border border-gray-100">
      {/* Updated grid to use a responsive 6-column system for better width control */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
        {details.map((item, index) => (
          <div
            key={index}
            // Apply width class for large screens (lg:col-span-X)
            className={`flex items-center space-x-3 p-3 bg-gray-50 rounded-xl shadow-inner ${item.widthClass}`}
          >
            <item.icon className={`w-6 h-6 ${item.color} flex-shrink-0`} />
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-gray-500">{item.label}</p>
              <p 
                className={`text-sm font-bold text-gray-800 break-words ${item.textClass || ''}`}
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

const SampleAnalysisTable = React.memo(({ data }) => {
  
  const getStatusBadge = (item) => {
    const calculatedStatus = getCalculatedStatus(item);
    const text = calculatedStatus;

    const isDelivered = text === 'Report Delivered';
    const isPendingQA = text === 'Pending from QA End';
    const isPendingLab = text === 'Pending from Lab End';
    const isNotReleased = text === 'Report not Released';

    const color = isDelivered
        ? colorMap.green.badge
        : (isPendingQA || isNotReleased)
        ? colorMap.orange.badge 
        : isPendingLab
        ? colorMap.red.badge
        : colorMap.gray.badge;

    const icon = isDelivered ? (
      <HiCheckCircle className="w-4 h-4" />
    ) : (isPendingQA || isNotReleased) ? (
      <AlertTriangle className="w-4 h-4" /> 
    ) : (
      <HiClock className="w-4 h-4" /> 
    );

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${color}`}
      >
        {icon}
        {text}
      </span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Parameter Breakdown
      </h3>

      <div className="overflow-x-auto rounded-xl shadow-inner hidden lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600/90 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider rounded-tl-xl">
                Parameter
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                Lab
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">
                Completion Date & Time
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider rounded-tr-xl">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900 w-1/4">
                  {item.parameter}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                  {item.lab}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  {item.analysisCompletionDateTime
                    ? formatDate(item.analysisCompletionDateTime, true)
                    : "---"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(item)} 
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl shadow-lg border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <h4 className="text-base font-bold text-gray-900 pr-4">
                {item.parameter}
              </h4>
              {getStatusBadge(item)} 
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <DetailItem label="Lab" value={item.lab} color="text-blue-600" />
              <DetailItem
                label="Value"
                value={`₹${parseFloat(item.distributedRegisVal).toFixed(2)}`}
                color="text-gray-800"
              />
              <DetailItem
                label="Completion"
                value={
                  item.analysisCompletionDateTime
                    ? formatDate(item.analysisCompletionDateTime, true)
                    : "---"
                }
                color="text-gray-600"
              />
              <DetailItem
                label="HOD Review"
                value={item.status === "Report Delivered" ? "YES" : "NO"}
                color={
                  item.status === "Report Delivered" ? "text-green-600" : "text-red-600"
                }
              />
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-10 text-gray-500 font-medium">
          No parameter data found for this registration number.
        </div>
      )}
    </div>
  );
});

const DetailItem = ({ label, value, color }) => (
  <div className="flex flex-col">
    <span className="text-xs font-medium text-gray-500">{label}</span>
    <span className={`font-semibold ${color}`}>{value}</span>
  </div>
);

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
  // --- NEW STATE: to control the brief initial loading animation ---
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

    const calculatedData = data.map(item => ({
        ...item,
        calculatedStatus: getCalculatedStatus(item)
    }));
    
    const released = calculatedData.filter((item) => item.calculatedStatus === "Report Delivered");
    const pendingItems = calculatedData.filter((item) => item.calculatedStatus !== "Report Delivered");

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

  // --- NEW useEffect: Simulate initial loading time, then switch to the search prompt ---
  React.useEffect(() => {
    // If you need to search on load with a default value, call handleSearch() here.
    // Since we want the attractive initial screen, we just hide the loader after a delay.
    const timer = setTimeout(() => {
        if (!initialSearchDone) {
            setShowInitialLoader(false);
        }
    }, 1000); // Show initial loader for 1 second

    return () => clearTimeout(timer);
  }, [initialSearchDone]);


  return (
    <div className="bg-gray-50 min-h-screen rounded-3xl shadow-2xl font-inter">
      <div className="relative p-6">
        <div className="absolute top-0 left-0">
          <div className="relative group">
            <div className="relative flex items-center justify-center px-8 py-2 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white text-medium font-extrabold tracking-wider rounded-br-4xl shadow-xl border-2 border-sky-400/30 backdrop-blur-sm">
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
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8 pt-6 sm:pt-8">
        {sampleDetails && !loading && <SampleDetailsCard data={data} />}

        <div className="mt-8 min-h-[300px]">
          {/* --- UPDATED LOADING VIEW --- */}
          {loading && (
            <div className="flex flex-col justify-center items-center py-20 bg-white rounded-2xl shadow-xl border border-gray-200">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
              <span className="text-xl font-bold text-gray-700">
                Analyzing Sample Data...
              </span>
              <span className="text-sm font-medium text-gray-500 mt-1">
                Please wait while we fetch the parameter breakdown.
              </span>
            </div>
          )}
          {/* --------------------------- */}


          {error && initialSearchDone && !loading && (
            <div className="p-8 bg-red-50 border border-red-300 rounded-2xl flex items-center justify-center space-x-3 shadow-md">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <p className="text-lg font-medium text-red-800">{error}</p>
            </div>
          )}

          {data && data.length > 0 && !loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
              <SummaryCard
                title="Total Parameters"
                value={summaryData.totalParameters}
                color="blue"
                icon={<HiBeaker className="w-5 h-5" />}
              />
              <SummaryCard
                title="Report Delivered" 
                value={summaryData.released}
                color="green"
                icon={<HiCheckCircle className="w-5 h-5" />}
              />
              <SummaryCard
                title="Pending"
                value={summaryData.pending}
                color="red"
                icon={<HiClock className="w-5 h-5" />}
              />
              <SummaryCard
                title="Pending Value"
                value={`₹${formatAmount(summaryData.pendingRegValue)}`}
                color="teal"
                icon={<HiCurrencyRupee className="w-5 h-5" />}
              />
            </div>
          )}

          {data && data.length > 0 && !loading && (
            <SampleAnalysisTable data={data} />
          )}

          {/* --- UPDATED INITIAL VIEW CONDITION --- */}
          {/* Show InitialStateView only when not loading, no search has been done, and there's no data/error */}
          {!loading && !initialSearchDone && !data && !error && (
            <InitialStateView showInitialLoader={showInitialLoader} />
          )}
        </div>
      </div>
    </div>
  );
}