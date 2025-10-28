import React, { useState, useMemo, useCallback } from "react";
import {
  Briefcase,
  ChevronDown,
  Telescope,
  Calendar,
  Search,
  RefreshCcw,
  Building2,
  BarChart3,
  Clock,
  XCircle,
  Filter,
  TrendingUp,
  LineChart,
  GitCompare,
  ArrowUp,
  ArrowDown,
  ChevronRight,
} from "lucide-react";
import { MdPerson } from "react-icons/md";
import { IoLayersSharp, IoPeople } from "react-icons/io5";
import { HiBuildingOffice, HiCurrencyRupee } from "react-icons/hi2";
import useBusinessAnalysis from "../hooks/useBusinessAnalysis";

const RELATIVE_TIME_OPTIONS = [
  { value: "0", label: "This Month" },
  { value: "1", label: "Last 1 Month" },
  { value: "2", label: "Last 2 Months" },
  { value: "3", label: "Last 3 Months" },
  { value: "4", label: "Last 4 Months" },
  { value: "5", label: "Last 5 Months" },
  { value: "6", label: "Last 6 Months" },
];

const generateMonthOptions = () => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const options = [];
  const now = new Date();
  const limitDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  let iteratorDate = new Date(now.getFullYear(), now.getMonth(), 1);
  while (iteratorDate.getTime() > limitDate.getTime()) {
    options.push(
      `${monthNames[iteratorDate.getMonth()]} ${iteratorDate.getFullYear()}`
    );
    iteratorDate.setMonth(iteratorDate.getMonth() - 1);
  }
  return options;
};
const MONTH_OPTIONS = generateMonthOptions();

const generateMonthLabels = (type, value, value2 = null) => {
  const labels = [];
  const now = new Date();
  let count = 0;

  if (type === "relative") {
    const monthsBack = parseInt(value);
    count = monthsBack + 1;
  } else if (type === "month") {
    return [value];
  } else if (type === "comparison") {
    // Determine the chronological order of the two selected months
    const [monthName1, yearStr1] = value.split(" ");
    const date1 = new Date(`${monthName1} 1, ${yearStr1}`);
    const label1 = value;

    const [monthName2, yearStr2] = value2.split(" ");
    const date2 = new Date(`${monthName2} 1, ${yearStr2}`);
    const label2 = value2;

    if (date1 < date2) {
      return [label1, label2].filter(Boolean); // [Past, Latest]
    } else {
      return [label2, label1].filter(Boolean); // [Past, Latest]
    }
  } else {
    return [];
  }

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    labels.push(`${month} ${year}`);
  }
  return labels.reverse(); // Changed to reverse here to ensure older month is first in monthLabels for consistent reversal in groupAndMapMonthlyData
};

function formatAmount(num) {
  if (num === null || num === undefined) return "0";
  const number = parseFloat(num);
  if (isNaN(number)) return "0";
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
    if (number >= si[i].value) break;
  }
  return (number / si[i].value).toFixed(2).replace(rx, "$1") + si[i].symbol;
}

function computeDateRange(type, value, value2 = null) {
  const now = new Date();

  if (type === "comparison") {
    // Comparison Mode: Month 1 vs Month 2
    // Use local Date parsing for chronological sorting and to get year/month index
    const [monthName1, yearStr1] = value.split(" ");
    const date1 = new Date(`${monthName1} 1, ${yearStr1}`);

    const [monthName2, yearStr2] = value2.split(" ");
    const date2 = new Date(`${monthName2} 1, ${yearStr2}`);

    // Determine past and latest dates for correct chronological order
    const pastDate = date1.getTime() < date2.getTime() ? date1 : date2;
    const latestDate = date1.getTime() < date2.getTime() ? date2 : date1;

    const pastYear = pastDate.getFullYear();
    const pastMonthIndex = pastDate.getMonth();
    const latestYear = latestDate.getFullYear();
    const latestMonthIndex = latestDate.getMonth();

    // All date constructions below use Date.UTC(...)
    return {
      // fromDate1/toDate1 is always the PAST month
      // Start of month (1st day at 00:00:00.000Z)
      fromDate1: new Date(Date.UTC(pastYear, pastMonthIndex, 1)).toISOString(),
      // End of month (last day at 23:59:59.999Z - The 0 day of the next month)
      toDate1: new Date(
        Date.UTC(pastYear, pastMonthIndex + 1, 0, 23, 59, 59, 999)
      ).toISOString(),
      // fromDate2/toDate2 is always the LATEST month
      // Start of month (1st day at 00:00:00.000Z)
      fromDate2: new Date(Date.UTC(latestYear, latestMonthIndex, 1)).toISOString(),
      // End of month (last day at 23:59:59.999Z)
      toDate2: new Date(
        Date.UTC(latestYear, latestMonthIndex + 1, 0, 23, 59, 59, 999)
      ).toISOString(),
    };
  }

  // Handle RELATIVE and SPECIFIC MONTH modes (single range return)
  let fromDate, toDate;
  const nowYear = now.getFullYear();
  const nowMonthIndex = now.getMonth();
  const nowDay = now.getDate();

  if (type === "relative") {
    // Relative Mode (e.g., Last X Months)
    const monthsBack = parseInt(value);

    // toDate is always the current day at 23:59:59.999Z UTC
    toDate = new Date(
      Date.UTC(nowYear, nowMonthIndex, nowDay, 23, 59, 59, 999)
    );

    // fromDate is the 1st of the starting month at 00:00:00.000Z UTC
    const startMonthIndex = nowMonthIndex - monthsBack;
    fromDate = new Date(Date.UTC(nowYear, startMonthIndex, 1));
  } else {
    // Specific Month Mode
    // Parse the selected month string (e.g., "October 2025")
    const [monthName, yearStr] = value.split(" ");
    // Create a temporary local date object to reliably get the month index and year
    const localDate = new Date(`${monthName} 1, ${yearStr}`);
    const monthIndex = localDate.getMonth();
    const year = localDate.getFullYear();

    // fromDate is the 1st of the selected month at 00:00:00.000Z UTC
    fromDate = new Date(Date.UTC(year, monthIndex, 1));

    // toDate is the last day of the selected month at 23:59:59.999Z UTC
    toDate = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
  }

  // Return the single range for 'relative' and 'month' modes
  return { fromDate: fromDate.toISOString(), toDate: toDate.toISOString() };
}

const parseSummaryString = (summaryString) => {
  let str = summaryString ? summaryString.replace(/"/g, "") : "";
  if (!str || str.length === 0) return {};

  const pairs = str.split(",").map((s) => s.trim());

  return pairs.reduce((acc, pair) => {
    const colonIndex = pair.lastIndexOf(":");
    if (colonIndex > 0) {
      const name = pair.substring(0, colonIndex).trim();
      const detailsStr = pair.substring(colonIndex + 1).trim();

      const match = detailsStr.match(/(\d+)\s*regs\s*\/\s*([\d,.]+)/);

      if (name && match) {
        const count = parseInt(match[1]);
        const value = parseFloat(match[2].replace(/,/g, ""));

        if (!isNaN(count) && !isNaN(value)) {
          acc[name] = { count, value };
        }
      }
    }
    return acc;
  }, {});
};

const groupAndMapMonthlyData = (
  rawData,
  timeRangeType,
  timeRangeValue,
  timeRangeValue2 = null
) => {
  if (!rawData || rawData.length === 0) return [];

  const monthLabels = generateMonthLabels(
    timeRangeType,
    timeRangeValue,
    timeRangeValue2
  );

  const groupedData = rawData.reduce((acc, currentItem) => {
    const {
      bdName,
      totalRegistrations,
      totalRegisValue,
      uniqueVerticals,
      uniqueClients,
      verticalSummary,
      clientSummary,
    } = currentItem;

    if (!acc[bdName]) {
      acc[bdName] = {
        bdName: bdName,
        totalRegistrations: 0,
        totalRegisValue: 0,
        uniqueVerticals: new Set(),
        uniqueClients: new Set(),
        monthlyData: [],
      };
    }

    const bdEntry = acc[bdName];

    // In comparison mode, totalRegistrations and totalRegisValue from rawData are for a single month (the date is implicit in the rawData array structure).
    // We only sum for non-comparison views.
    if (timeRangeType !== "comparison") {
      bdEntry.totalRegistrations += totalRegistrations;
      bdEntry.totalRegisValue += totalRegisValue;
    }

    bdEntry.monthlyData.push({
      registrations: totalRegistrations,
      value: totalRegisValue,
      verticals: parseSummaryString(verticalSummary),
      clients: parseSummaryString(clientSummary),
    });

    return acc;
  }, {});

  const finalData = Object.values(groupedData).map((bdEntry) => {
    // Data in monthlyData is chronological (index 0 = Past, index 1 = Latest for comparison mode)
    // monthLabels are also [Past, Latest] for comparison mode
    const monthlySummary = [...bdEntry.monthlyData]
      .slice(0, monthLabels.length) // Only take as many data points as labels
      .map((data, index) => ({
        month: monthLabels[index], // Assign month label (Past, Latest, or chronological)
        ...data,
      }));

    // If in comparison mode, the totalRegistrations and totalRegisValue are calculated across the two months
    let totalRegisValue = bdEntry.totalRegisValue;
    let totalRegistrations = bdEntry.totalRegistrations;

    if (timeRangeType === "comparison" && monthlySummary.length === 2) {
      // Since monthlySummary is [Past, Latest], we sum both for the "Total" cards
      totalRegistrations =
        monthlySummary[0].registrations + monthlySummary[1].registrations;
      totalRegisValue = monthlySummary[0].value + monthlySummary[1].value;
    }

    const allVerticals = new Set();
    const allClients = new Set();
    monthlySummary.forEach((month) => {
      Object.keys(month.verticals).forEach((v) => allVerticals.add(v));
      Object.keys(month.clients).forEach((c) => allClients.add(c));
    });

    const detailedVerticalSummary = Array.from(allVerticals)
      .sort()
      .map((name) => ({
        name,
        monthlyValues: monthlySummary.map((month) => {
          const data = month.verticals[name] || { count: 0, value: 0 };
          return {
            month: month.month,
            count: data.count,
            value: data.value,
          };
        }),
      }));

    const detailedClientSummary = Array.from(allClients)
      .sort()
      .map((name) => ({
        name,
        monthlyValues: monthlySummary.map((month) => {
          const data = month.clients[name] || { count: 0, value: 0 };
          return {
            month: month.month,
            count: data.count,
            value: data.value,
          };
        }),
      }));

    return {
      bdName: bdEntry.bdName,
      totalRegistrations: totalRegistrations,
      totalRegisValue: totalRegisValue,
      uniqueVerticals: detailedVerticalSummary.length,
      uniqueClients: detailedClientSummary.length,
      monthlySummary: monthlySummary,
      detailedVerticalSummary: detailedVerticalSummary,
      detailedClientSummary: detailedClientSummary,
    };
  });

  return finalData;
};

// Utility function to calculate percentage change
const calculatePercentageChange = (value2, value1) => {
  if (value1 === 0) {
    // If past value is 0, treat any positive latest value as a huge increase (1000% arbitrarily high)
    // Or 0% if latest is also 0.
    return value2 > 0 ? 1000 : 0;
  }
  return ((value2 - value1) / value1) * 100;
};

// UI Components

// Replaces ComparisonChip with inline display logic
const ComparisonDisplay = ({ percentageChange, size = "default" }) => {
  if (percentageChange === null || percentageChange === undefined) return null;

  const isPositive = percentageChange > 0;
  const isNegative = percentageChange < 0;

  // Handle large numbers or display 0%
  var formattedChange =
    Math.abs(percentageChange) >= 1000
      ? "100"
      : Math.abs(percentageChange).toFixed(1);


  // Set classes based on size
  const iconSizeClass = size === "small" ? "w-3 h-3" : "w-3.5 h-3.5";
  const textSizeClass =
    size === "small"
      ? "text-[10px] font-medium"
      : "text-[11px] font-semibold";

  if (percentageChange === 0) {
    return (
      <span
        className={`text-gray-500 ${textSizeClass} flex items-center gap-0.5`}
      >
        <ArrowUp className={iconSizeClass} />
        0.0%
      </span>
    );
  }

  let colorClass = isPositive ? "text-green-600" : "text-red-600";
  let Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <span
      className={`flex items-center gap-0.5 ${colorClass} ${textSizeClass} whitespace-nowrap`}
    >
      <Icon className={iconSizeClass} />
      {formattedChange}%
    </span>
  );
};

const TimeRangeTabSelector = ({ selectedType, onSelect }) => {
  const tabs = [
    { type: "relative", label: "X Month Range", icon: Clock },
    { type: "month", label: "Specific Month", icon: Calendar },
    { type: "comparison", label: "Month Comparison", icon: GitCompare },
  ];

  return (
    <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200 w-full">
      {tabs.map(({ type, label, icon: Icon }) => {
        const isSelected = selectedType === type;
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`
                            flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5
                            ${
                              isSelected
                                ? "bg-blue-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-200"
                            }
                        `}
          >
            <Icon
              className={`w-3.5 h-3.5
                            ${isSelected ? "text-white" : "text-blue-500"}`}
            />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

const ExcludeToggle = ({
  enabled,
  onChange,
  leftText = "IN",
  rightText = "EX",
}) => {
  const handleClick = () => {
    const nextVal = !enabled;
    onChange(nextVal);
  };

  const gradientClass = enabled
    ? "bg-gradient-to-r from-red-500 to-red-600"
    : "bg-gradient-to-r from-blue-500 to-cyan-600";
  const focusRing = enabled ? "focus:ring-red-500" : "focus:ring-blue-500";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={enabled}
      className={`relative inline-flex items-center h-6 w-12 rounded-full transition-all duration-300 transform-gpu ${gradientClass} focus:outline-none shadow-md hover:shadow-lg ${focusRing}`}
    >
      <span className="sr-only">
        Toggle {leftText}/{rightText}
      </span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
          enabled ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
};

const SingleSelectDropdown = ({
  options,
  selected,
  onSelect,
  label,
  icon: Icon,
  type,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isRelative = type === "relative";
  const selectedOption = isRelative
    ? options.find((opt) => opt.value === selected)
    : { label: selected, value: selected };

  const displayValue = selectedOption
    ? selectedOption.label
    : `Select ${label}`;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className="w-full bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 text-left cursor-pointer hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm font-medium flex items-center justify-between group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 text-blue-600 group-hover:text-blue-700`} />
          <span className="text-gray-700">{displayValue}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full rounded-xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden border border-gray-100">
          <ul className="max-h-60 overflow-y-auto custom-scrollbar-dropdown">
            {options.map((option) => {
              const value = isRelative ? option.value : option;
              const label = isRelative ? option.label : option;
              const isSelected = selected === value;

              return (
                <li
                  key={value}
                  className={`px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? "bg-blue-50 text-blue-800 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => {
                    onSelect(value);
                    setIsOpen(false);
                  }}
                >
                  {label}
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

const MultiSelectDropdown = ({
  options,
  selected,
  onToggle,
  label,
  icon: Icon,
  isExcluded,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = React.useRef(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const count = selected.length;

  let displayValue = "";
  let modeText = isExcluded ? "Excluding" : "Including";

  if (count === 0) {
    displayValue = isExcluded
      ? `Excluding 0 ${label}`
      : `Including All ${label}`;
  } else {
    displayValue = `${modeText} ${count} ${label}`;
  }

  const modeColor = isExcluded ? "text-red-600" : "text-blue-600";
  const modeHoverColor = isExcluded
    ? "group-hover:text-red-700"
    : "group-hover:text-blue-700";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className={`w-full bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 text-left cursor-pointer hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm font-medium flex items-center justify-between group
                    ${
                      isExcluded ? "focus:ring-red-500" : "focus:ring-blue-500"
                    }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${modeColor} ${modeHoverColor}`} />
          <span className="text-gray-700">{displayValue}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full rounded-xl bg-white shadow-xl ring-1 ring-gray-200  overflow-hidden border border-gray-100">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${label}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto custom-scrollbar-dropdown">
            <li
              className={`px-4 py-2.5 cursor-pointer text-sm font-semibold border-b border-gray-100
                                ${
                                  isExcluded
                                    ? "hover:bg-red-50 text-red-700"
                                    : "hover:bg-blue-50 text-blue-700"
                                }`}
              onClick={() => onToggle([])}
            >
              Deselect All
            </li>

            {filteredOptions.map((option) => (
              <li
                key={option}
                className={`px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                  selected.includes(option)
                    ? isExcluded
                      ? "bg-red-50 text-red-800 font-medium"
                      : "bg-blue-50 text-blue-800 font-medium"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
                onClick={() => onToggle(option)}
              >
                {option}
                {selected.includes(option) && (
                  <svg
                    className={`w-4 h-4 ${
                      isExcluded ? "text-red-600" : "text-blue-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                )}
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-500 italic text-center">
                No matches found.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const FilterPanel = ({ filters, setFilters, bdNameOptions }) => {
  const {
    timeRangeType,
    timeRangeValue,
    timeRangeValue2,
    selectedBDs,
    excludeBDs,
  } = filters;

  const handleBDToggle = (bdNameOrList) => {
    let updatedBDs;
    if (Array.isArray(bdNameOrList)) {
      updatedBDs = bdNameOrList;
    } else {
      updatedBDs = selectedBDs.includes(bdNameOrList)
        ? selectedBDs.filter((name) => name !== bdNameOrList)
        : [...selectedBDs, bdNameOrList];
    }
    setFilters((prev) => ({ ...prev, selectedBDs: updatedBDs }));
  };

  const handleExcludeToggle = (isExcluded) => {
    setFilters((prev) => ({
      ...prev,
      excludeBDs: isExcluded,
    }));
  };

  const handleTimeRangeTypeToggle = (newType) => {
    const newValue =
      newType === "relative"
        ? RELATIVE_TIME_OPTIONS[0].value
        : MONTH_OPTIONS[0];

    setFilters((prev) => ({
      ...prev,
      timeRangeType: newType,
      timeRangeValue: newValue,
      timeRangeValue2: newType === "comparison" ? MONTH_OPTIONS[1] : null,
    }));
  };

  const handleTimeRangeValueSelect = (value) => {
    setFilters((prev) => ({ ...prev, timeRangeValue: value }));
  };

  const handleTimeRangeValue2Select = (value) => {
    setFilters((prev) => ({ ...prev, timeRangeValue2: value }));
  };

  const handleClearFilters = useCallback(() => {
    setFilters({
      timeRangeType: "relative",
      timeRangeValue: RELATIVE_TIME_OPTIONS[0].value,
      timeRangeValue2: null,
      selectedBDs: [],
      excludeBDs: false,
    });
  }, [setFilters]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
          <Filter className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Live Analysis Filters
          </h2>
          <p className="text-xs text-gray-500">
            Filter parameters automatically update the results
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-6 grid grid-cols-1 gap-4">
          <TimeRangeTabSelector
            selectedType={timeRangeType}
            onSelect={handleTimeRangeTypeToggle}
          />

          {timeRangeType === "comparison" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Month 1
                </label>
                <SingleSelectDropdown
                  options={MONTH_OPTIONS}
                  selected={timeRangeValue}
                  onSelect={handleTimeRangeValueSelect}
                  label="Month 1"
                  icon={Calendar}
                  type="month"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                  Month 2
                </label>
                <SingleSelectDropdown
                  options={MONTH_OPTIONS}
                  selected={timeRangeValue2}
                  onSelect={handleTimeRangeValue2Select}
                  label="Month 2"
                  icon={Calendar}
                  type="month"
                />
              </div>
            </div>
          ) : (
            <SingleSelectDropdown
              options={
                timeRangeType === "relative"
                  ? RELATIVE_TIME_OPTIONS
                  : MONTH_OPTIONS
              }
              selected={timeRangeValue}
              onSelect={handleTimeRangeValueSelect}
              label={timeRangeType === "relative" ? "Range" : "Month"}
              icon={timeRangeType === "relative" ? Clock : Calendar}
              type={timeRangeType}
            />
          )}
        </div>

        <div className="lg:col-span-4 ml-8">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600 block">
              BD Selection
            </label>
            <ExcludeToggle
              enabled={excludeBDs}
              onChange={handleExcludeToggle}
            />
          </div>
          <MultiSelectDropdown
            options={bdNameOptions}
            selected={selectedBDs}
            onToggle={handleBDToggle}
            label="BD Persons"
            icon={Telescope}
            isExcluded={excludeBDs}
          />
        </div>

        <div className="lg:col-span-2 flex justify-end">
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 text-sm px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  color,
  className = "",
  chips = [],
  comparisonChange = null, // New prop for comparison change
}) => {
  const colorClasses = {
    blue: {
      border: "border-t-4 border-blue-500",
      bg: "bg-blue-100",
      icon: "text-blue-600",
      text: "text-blue-700"
    },
    green: {
      border: "border-t-4 border-green-500",
      bg: "bg-green-100",
      icon: "text-green-600",
      text: "text-green-700"
    },
    orange: {
      border: "border-t-4 border-orange-500",
      bg: "bg-orange-100",
      icon: "text-orange-600",
      text: "text-orange-700"
    },
    red: {
      border: "border-t-4 border-red-500",
      bg: "bg-red-100",
      icon: "text-red-600",
      text: "text-red-700"
    },
    cyan: {
      border: "border-t-4 border-cyan-500",
      bg: "bg-cyan-100",
      icon: "text-cyan-600",
      text: "text-cyan-700"
    },
    teal: {
      border: "border-t-4 border-teal-500",
      bg: "bg-teal-100",
      icon: "text-teal-600",
      text: "text-teal-700"
    },
  };

  const classes = colorClasses[color] || colorClasses.blue;
  const MAX_CHIPS = 6;

  return (
    <div
      className={`bg-white py-4 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${classes.border} ${className} h-full flex flex-col`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium uppercase text-gray-500">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${classes.bg} ${classes.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-end">
        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2 my-2 max-h-[70px] overflow-hidden">
            {chips.slice(0, MAX_CHIPS).map((chip, index) => (
              <span
                key={index}
                className={`${classes.bg} ${classes.icon} text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm`}
              >
                {chip}
              </span>
            ))}
          </div>
        ) : value !== null && value !== undefined ? (
          <div className="flex flex-col justify-end">
            <p className={`text-3xl font-extrabold ${classes.text}`}>{value}</p>
            <div className="mt-1">
              <ComparisonDisplay
                percentageChange={comparisonChange}
                size="default"
              />
            </div>
          </div>
        ) : (
          <p className="text-2xl font-bold italic text-gray-500 my-1">N/A</p>
        )}
      </div>
    </div>
  );
};

const VerticalClientBreakdownTable = ({
  title,
  detailedSummary,
  monthHeaders,
  icon: Icon,
  colorClass,
  isComparison,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!detailedSummary || detailedSummary.length === 0) {
    return (
      <div className="relative bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-100 h-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 rounded-2xl"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${colorClass.iconBg} shadow-md`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <h3 className={`text-base font-bold ${colorClass.header}`}>
              {title}
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-3 rounded-full bg-gray-100 mb-3">
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">
              No data breakdown available for this range.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const monthlyTotals = monthHeaders.map((month) => {
    return detailedSummary.reduce(
      (acc, item) => {
        const monthlyData = item.monthlyValues.find((m) => m.month === month);
        acc.count += monthlyData?.count || 0;
        acc.value += monthlyData?.value || 0;
        return acc;
      },
      { count: 0, value: 0 }
    );
  });

  const grandTotalCount = monthlyTotals.reduce(
    (sum, val) => sum + val.count,
    0
  );
  const grandTotalValue = monthlyTotals.reduce(
    (sum, val) => sum + val.value,
    0
  );

  const showMonthOverMonthChange = !isComparison && monthHeaders.length > 1;

  return (
    <div className="relative bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-gray-100 h-full overflow-hidden">
      <div className="relative">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${colorClass.iconBg} shadow-lg ring-2 ring-white/50`}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${colorClass.header}`}>
                {title}
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Monthly breakdown
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
              <span className="text-[11px] font-bold text-gray-700">
                {detailedSummary.length}{" "}
                {title.includes("Vertical") ? "Verticals" : "Clients"}
              </span>
            </div>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                            ${
                              isExpanded
                                ? `${colorClass.iconBg} text-white rotate-90 shadow-md`
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
            >
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        <CollapsibleDetails isExpanded={isExpanded}>
          <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200/80 shadow-xl bg-white/60 backdrop-blur-md">
            <table className="min-w-full table-fixed">
              <thead className={`${colorClass.iconBg} sticky top-0 z-10`}>
                <tr>
                  <th
                    className={`px-3 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20 w-[180px] sticky left-0 ${colorClass.iconBg} backdrop-blur-md`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-0.5 h-3 bg-white/60 rounded-full"></div>
                      <span className="drop-shadow-sm">
                        {title.replace(" Monthly Contribution", "")}
                      </span>
                    </div>
                  </th>
                  {monthHeaders.map((month, index) => (
                    <th
                      key={index}
                      className="px-3 py-2.5 text-center text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20 relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative drop-shadow-sm">{month}</span>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold text-white uppercase tracking-wide relative">
                    <div className="absolute inset-0 bg-white/20"></div>
                    <span className="relative flex items-center justify-center gap-1 drop-shadow-sm">
                      <TrendingUp className="w-3 h-3" />
                      Total
                    </span>
                  </th>

                  {/* Removed the dedicated 'Change' column when isComparison is true */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {detailedSummary.map((item, itemIndex) => {
                  const rowMonthlyValues = item.monthlyValues;
                  const rowTotal = rowMonthlyValues.reduce(
                    (acc, m) => {
                      acc.count += m.count;
                      acc.value += m.value;
                      return acc;
                    },
                    { count: 0, value: 0 }
                  );

                  const hasData = rowTotal.count > 0 || rowTotal.value > 0;
                  const isEvenRow = itemIndex % 2 === 0;

                  return (
                    <tr
                      key={itemIndex}
                      className={`group transition-all duration-150 ${
                        isEvenRow ? "bg-white/90" : "bg-gray-50/50"
                      } hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-indigo-50/70 hover:shadow-md`}
                    >
                      <td className="px-3 py-2.5 text-left text-xs font-semibold text-gray-800 border-r border-gray-100 sticky left-0 bg-white/95 group-hover:bg-gradient-to-r group-hover:from-blue-50/90 group-hover:to-indigo-50/70 backdrop-blur-sm transition-all w-[180px] whitespace-normal">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-0.5 h-4 ${colorClass.iconBg} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                          ></div>
                          <span className="group-hover:translate-x-0.5 transition-transform">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      {monthHeaders.map((month, monthIndex) => {
                        const monthlyData = rowMonthlyValues.find(
                          (m) => m.month === month
                        );
                        const value = monthlyData?.value || 0;
                        const count = monthlyData?.count || 0;
                        const hasMonthData = count > 0 || value > 0;

                        // --- Change Comparison Logic ---
                        let regChangeToDisplay = null;
                        let valueChangeToDisplay = null;

                        const isLatestMonthInComparison =
                          isComparison && monthIndex === 1;

                        if (showMonthOverMonthChange && monthIndex > 0) {
                          // Scenario 1: X Month Range (MoM comparison)
                          const prevMonthData = rowMonthlyValues[monthIndex - 1];
                          const prevCount = prevMonthData?.count || 0;
                          const prevValue = prevMonthData?.value || 0;

                          regChangeToDisplay = calculatePercentageChange(
                            count,
                            prevCount
                          );
                          valueChangeToDisplay = calculatePercentageChange(
                            value,
                            prevValue
                          );
                        } else if (isLatestMonthInComparison) {
                          const pastMonthData = rowMonthlyValues[0];
                          const pastCount = pastMonthData?.count || 0;
                          const pastValue = pastMonthData?.value || 0;

                          regChangeToDisplay = calculatePercentageChange(
                            count,
                            pastCount
                          );
                          valueChangeToDisplay = calculatePercentageChange(
                            value,
                            pastValue
                          );
                        }

                        return (
                          <td
                            key={monthIndex}
                            className={`px-2 py-2.5 text-center text-xs border-r border-gray-100 whitespace-nowrap transition-all duration-150 ${
                              hasMonthData
                                ? "bg-gradient-to-br from-emerald-50/40 to-teal-50/40 hover:from-emerald-100/60 hover:to-teal-100/60"
                                : "text-gray-300"
                            }`}
                          >
                            {hasMonthData ? (
                              <div className="flex flex-col items-center gap-1">
                                {/* Value with change display */}
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-gray-900 text-sm font-bold">
                                    {formatAmount(value)}
                                  </span>
                                  {(showMonthOverMonthChange && monthIndex > 0) ||
                                  isLatestMonthInComparison ? (
                                    <ComparisonDisplay
                                      percentageChange={valueChangeToDisplay}
                                      size="small"
                                    />
                                  ) : null}
                                </div>
                                {/* Count (Regs) with change display */}
                                <div className="flex items-center justify-center gap-1">
                                  <span className={`text-[11px] ${colorClass.textColor} font-medium`}>
                                    {count} reg{count !== 1 ? "s" : ""}
                                  </span>
                                  {(showMonthOverMonthChange && monthIndex > 0) ||
                                  isLatestMonthInComparison ? (
                                    <ComparisonDisplay
                                      percentageChange={regChangeToDisplay}
                                      size="small" // Use small size
                                    />
                                  ) : null}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-300 text-sm">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-2 py-2.5 text-center text-xs border-r border-gray-100 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 hover:from-blue-100/80 hover:to-indigo-100/80 whitespace-nowrap backdrop-blur-sm transition-all">
                        {hasData ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-blue-900 text-sm font-bold">
                              {formatAmount(rowTotal.value)}
                            </span>
                            <span className="text-[10px] text-blue-600 font-semibold">
                              {rowTotal.count} reg
                              {rowTotal.count !== 1 ? "s" : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </td>

                      {/* Removed the dedicated comparison cell */}
                    </tr>
                  );
                })}

                <tr className="bg-gradient-to-r from-blue-100/80 via-indigo-100/80 to-blue-100/80 border-t-2 border-blue-200">
                  <td className="px-3 py-3 text-left text-xs font-bold text-blue-900 border-r border-blue-200 sticky left-0 bg-gradient-to-r from-blue-100/95 to-indigo-100/95 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Monthly Total</span>
                    </div>
                  </td>
                  {monthlyTotals.map((total, index) => {
                    // --- Change Comparison Logic for Totals ---
                    let regChangeToDisplay = null;
                    let valueChangeToDisplay = null;

                    const isLatestMonthInComparison = isComparison && index === 1;

                    if (showMonthOverMonthChange && index > 0) {
                      // Scenario 1: X Month Range (MoM comparison)
                      const prevTotal = monthlyTotals[index - 1];
                      regChangeToDisplay = calculatePercentageChange(
                        total.count,
                        prevTotal.count
                      );
                      valueChangeToDisplay = calculatePercentageChange(
                        total.value,
                        prevTotal.value
                      );
                    } else if (isLatestMonthInComparison) {
                      // Scenario 2: Month Comparison (Month 2 vs Month 1 comparison)
                      const pastTotal = monthlyTotals[0];
                      regChangeToDisplay = calculatePercentageChange(
                        total.count,
                        pastTotal.count
                      );
                      valueChangeToDisplay = calculatePercentageChange(
                        total.value,
                        pastTotal.value
                      );
                    }
                    // ---------------------------------

                    return (
                      <td
                        key={index}
                        className="px-2 py-3 text-center text-xs border-r border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 whitespace-nowrap backdrop-blur-sm"
                      >
                        {total.value > 0 ? (
                          <div className="flex flex-col items-center gap-1">
                            {/* Value with change display */}
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-gray-900 text-sm font-extrabold">
                                {formatAmount(total.value)}
                              </span>
                              {(showMonthOverMonthChange && index > 0) ||
                              isLatestMonthInComparison ? (
                                <ComparisonDisplay
                                  percentageChange={valueChangeToDisplay}
                                  size="small" // Use small size
                                />
                              ) : null}
                            </div>
                            {/* Count (Regs) with change display */}
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-[10px] text-blue-600 font-bold">
                                {total.count} reg
                                {total.count !== 1 ? "s" : ""}
                              </span>
                              {(showMonthOverMonthChange && index > 0) ||
                              isLatestMonthInComparison ? (
                                <ComparisonDisplay
                                  percentageChange={regChangeToDisplay}
                                  size="small" // Use small size
                                />
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-3 text-center text-xs  whitespace-nowrap backdrop-blur-sm border-l-2 border-blue-300">
                    {grandTotalValue > 0 ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-blue-900" />
                          <span className="text-blue-950 text-base font-black">
                            {formatAmount(grandTotalValue)}
                          </span>
                        </div>
                        <span className={`text-[11px] text-blue-800 font-extrabold`}>
                          {grandTotalCount} reg
                          {grandTotalCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>

                  {/* Removed the dedicated comparison cell */}
                </tr>
              </tbody>
            </table>
          </div>
        </CollapsibleDetails>
      </div>
    </div>
  );
};
const CollapsibleDetails = ({ isExpanded, children }) => (
  <div
    className={`
      transition-all duration-500 ease-in-out
      overflow-hidden 
      ${isExpanded ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"}
    `}
  >
    <div>{children}</div>
  </div>
);

const BdRow = ({ bdData, monthHeaders, isComparison }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const verticalColor = {
    header: "text-sky-700",
    iconBg: "bg-sky-500",
    textColor: "text-sky-700",
  };
  const clientColor = {
    header: "text-cyan-700",
    iconBg: "bg-cyan-500",
    textColor: "text-cyan-700",
  };

  let regChange = null;
  let valueChange = null;

  if (isComparison && bdData.monthlySummary.length === 2) {
    const month1Reg = bdData.monthlySummary[0].registrations; // Past Month
    const month2Reg = bdData.monthlySummary[1].registrations; // Latest Month
    const month1Value = bdData.monthlySummary[0].value;
    const month2Value = bdData.monthlySummary[1].value;

    regChange = calculatePercentageChange(month2Reg, month1Reg);
    valueChange = calculatePercentageChange(month2Value, month1Value);
  }

  return (
    <React.Fragment>
      <tr
        className="group transition-all duration-300 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <MdPerson className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors duration-300">
              {bdData.bdName}
            </span>
          </div>
        </td>
        <td className="px-4 py-4 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-blue-700 text-sm font-bold">
              <IoLayersSharp className="w-4 h-4" />
              {bdData.totalRegistrations}
            </span>
            {isComparison && (
              <div>
                <ComparisonDisplay percentageChange={regChange} />
              </div>
            )}
          </div>
        </td>
        <td className="px-4 py-4 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-green-700 text-sm font-bold">
              <HiCurrencyRupee className="w-4 h-4" />
              {formatAmount(bdData.totalRegisValue)}
            </span>
            {isComparison && (
              <div>
                <ComparisonDisplay percentageChange={valueChange} />
              </div>
            )}
          </div>
        </td>
        <td className="px-4 py-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-cyan-700 text-sm font-bold">
            <Telescope className="w-4 h-4" />
            {bdData.uniqueVerticals}
          </span>
        </td>
        <td className="px-4 py-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-orange-700 text-sm font-bold">
            <Building2 className="w-4 h-4" />
            {bdData.uniqueClients}
          </span>
        </td>
        <td className="px-4 py-4 text-center w-16">
          <div
            className={`inline-flex items-center justify-center w-8 h-8 p-2 rounded-lg transition-all duration-300
            ${
              isExpanded
                ? "bg-blue-600 text-white rotate-90"
                : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </div>
        </td>
      </tr>

      <tr>
        <td colSpan="6" className="p-0">
          <CollapsibleDetails isExpanded={isExpanded}>
            <div className="bg-gray-50 border-t border-blue-200">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LineChart className="w-4 h-4 text-white/80" />
                    <span className="text-sm font-medium text-white">
                      Monthly Performance Breakdown
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-xs font-medium text-white">
                    {bdData.totalRegistrations} registrations over{" "}
                    {bdData.monthlySummary.length} months
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  <VerticalClientBreakdownTable
                    title="Vertical Monthly Contribution"
                    detailedSummary={bdData.detailedVerticalSummary}
                    monthHeaders={monthHeaders}
                    icon={Telescope}
                    colorClass={verticalColor}
                    isComparison={isComparison}
                  />
                  <VerticalClientBreakdownTable
                    title="Client Monthly Contribution"
                    detailedSummary={bdData.detailedClientSummary}
                    monthHeaders={monthHeaders}
                    icon={HiBuildingOffice}
                    colorClass={clientColor}
                    isComparison={isComparison}
                  />
                </div>
              </div>
            </div>
          </CollapsibleDetails>
        </td>
      </tr>
    </React.Fragment>
  );
};

const BdMobileRow = ({ bdData, monthHeaders, isComparison }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const verticalColor = {
    header: "text-teal-700",
    iconBg: "bg-teal-500",
    textColor: "text-teal-500",
  };
  const clientColor = {
    header: "text-emerald-700",
    iconBg: "bg-emerald-500",
    textColor: "text-emerald-500",
  };

  let regChange = null;
  let valueChange = null;

  if (isComparison && bdData.monthlySummary.length === 2) {
    const month1Reg = bdData.monthlySummary[0].registrations;
    const month2Reg = bdData.monthlySummary[1].registrations;
    const month1Value = bdData.monthlySummary[0].value;
    const month2Value = bdData.monthlySummary[1].value;

    regChange = calculatePercentageChange(month2Reg, month1Reg);
    valueChange = calculatePercentageChange(month2Value, month1Value);
  }

  return (
    <div
      key={bdData.bdName}
      className="rounded-xl shadow-lg border border-gray-200 bg-white overflow-hidden"
    >
      <div
        className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
            <Telescope className="w-5 h-5 text-white" />
          </div>
          <h4 className="text-base font-medium text-white">{bdData.bdName}</h4>
        </div>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                      ${
                        isExpanded
                          ? "bg-white text-blue-600 rotate-180"
                          : "bg-white/20 backdrop-blur-sm text-white"
                      }`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-gray-200">
        <div className="bg-white p-4 text-center flex flex-col items-center">
          <p className="text-xs font-medium text-gray-500 mb-1">
            Registrations
          </p>
          <p className="text-xl font-semibold text-blue-600">
            {bdData.totalRegistrations}
          </p>
          {isComparison && (
            <div className="mt-1">
              <ComparisonDisplay percentageChange={regChange} />
            </div>
          )}
        </div>

        <div className="bg-white p-4 text-center flex flex-col items-center">
          <p className="text-xs font-medium text-gray-500 mb-1">
            Registered Value
          </p>
          <p className="text-lg font-semibold text-green-600">
            ₹{formatAmount(bdData.totalRegisValue)}
          </p>
          {isComparison && (
            <div className="mt-1">
              <ComparisonDisplay percentageChange={valueChange} />
            </div>
          )}
        </div>

        <div className="bg-white p-4 text-center">
          <p className="text-xs font-medium text-gray-500 mb-1">Verticals</p>
          <p className="text-xl font-semibold text-cyan-600">
            {bdData.uniqueVerticals}
          </p>
        </div>

        <div className="col-span-3 bg-white p-4 text-center border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-1">Clients</p>
          <p className="text-xl font-semibold text-orange-600">
            {bdData.uniqueClients}
          </p>
        </div>
      </div>

      <CollapsibleDetails isExpanded={isExpanded}>
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h5 className="text-sm font-medium text-gray-700">
              Monthly Performance Breakdown
            </h5>
          </div>

          <VerticalClientBreakdownTable
            title="Vertical Monthly Contribution"
            detailedSummary={bdData.detailedVerticalSummary}
            monthHeaders={monthHeaders}
            icon={Telescope}
            colorClass={verticalColor}
            isComparison={isComparison}
          />
          <VerticalClientBreakdownTable
            title="Client Monthly Contribution"
            detailedSummary={bdData.detailedClientSummary}
            monthHeaders={monthHeaders}
            icon={HiBuildingOffice}
            colorClass={clientColor}
            isComparison={isComparison}
          />
        </div>
      </CollapsibleDetails>
    </div>
  );
};

const BdSummaryTable = ({ data, monthHeaders, isComparison }) => {
  return (
    <div className="mt-8">
      <div className="overflow-hidden rounded-xl shadow-lg hidden lg:block border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-cyan-600">
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-white/90">
                    BD Person
                  </span>
                </th>
                <th className="px-4 py-4 text-center">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-white/90">
                    Registrations
                  </span>
                </th>
                <th className="px-4 py-4 text-center">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-white/90">
                    Registered Value
                  </span>
                </th>
                <th className="px-4 py-4 text-center">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-white/90">
                    Verticals
                  </span>
                </th>
                <th className="px-4 py-4 text-center">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-white/90">
                    Clients
                  </span>
                </th>
                <th className="px-4 py-4 text-center w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((bdData) => (
                <BdRow
                  key={bdData.bdName}
                  bdData={bdData}
                  monthHeaders={monthHeaders}
                  isComparison={isComparison}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:hidden space-y-4">
        {data.map((bdData) => (
          <BdMobileRow
            key={bdData.bdName}
            bdData={bdData}
            monthHeaders={monthHeaders}
            isComparison={isComparison}
          />
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-10 text-gray-500 font-medium">
          <NoDataFoundView />
        </div>
      )}
    </div>
  );
};

const NoDataFoundView = () => (
  <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-lg border border-gray-200">
    <div className="flex flex-col items-center">
      <div className="relative mb-6 w-20 h-20">
        <Search className="w-16 h-16 text-gray-300 absolute top-0 left-0" />
        <XCircle className="w-8 h-8 text-red-500 absolute bottom-0 right-0 p-1 bg-white rounded-full border-2 border-white" />
      </div>
      <span className="text-xl font-medium text-gray-600">No Data Found</span>
      <span className="text-sm text-gray-400 mt-2 max-w-md text-center">
        We couldn't find any data matching your filters. Try adjusting your date
        range or BD manager selection.
      </span>
    </div>
  </div>
);

const LoadingView = () => (
  <div className="flex flex-col justify-center items-center py-20 bg-white rounded-2xl shadow-xl border border-gray-100">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
    <span className="text-lg font-medium text-gray-700">
      Fetching Business Analysis Data...
    </span>
    <span className="text-sm text-gray-400 mt-1">
      Please wait while we process the metrics.
    </span>
  </div>
);

export default function BusinessAnalysis() {
  const [filters, setFilters] = useState({
    timeRangeType: "relative",
    timeRangeValue: RELATIVE_TIME_OPTIONS[0].value,
    timeRangeValue2: null,
    selectedBDs: [],
    excludeBDs: false,
  });

  const isComparisonMode = filters.timeRangeType === "comparison";

  const dateRangeApiFilters = useMemo(() => {
    if (filters.timeRangeType === "comparison") {
      const { fromDate1, toDate1, fromDate2, toDate2 } = computeDateRange(
        filters.timeRangeType,
        filters.timeRangeValue,
        filters.timeRangeValue2
      );
      return {
        timeRangeType: "comparison",
        fromDate1,
        toDate1,
        fromDate2,
        toDate2,
      };
    } else {
      const { fromDate, toDate } = computeDateRange(
        filters.timeRangeType,
        filters.timeRangeValue
      );
      return {
        timeRangeType: filters.timeRangeType,
        fromDate,
        toDate,
      };
    }
  }, [filters.timeRangeType, filters.timeRangeValue, filters.timeRangeValue2]);

  const {
    data: rawData,
    isLoading,
    error,
  } = useBusinessAnalysis(dateRangeApiFilters);

  const monthHeaders = useMemo(
    () =>
      generateMonthLabels(
        filters.timeRangeType,
        filters.timeRangeValue,
        filters.timeRangeValue2
      ),
    [filters.timeRangeType, filters.timeRangeValue, filters.timeRangeValue2]
  );

  const allBdData = useMemo(() => {
    return groupAndMapMonthlyData(
      rawData || [],
      filters.timeRangeType,
      filters.timeRangeValue,
      filters.timeRangeValue2
    );
  }, [
    rawData,
    filters.timeRangeType,
    filters.timeRangeValue,
    filters.timeRangeValue2,
  ]);

  const availableBdNames = useMemo(() => {
    return Array.from(new Set(allBdData.map((bd) => bd.bdName))).sort();
  }, [allBdData]);

  const filteredBdData = useMemo(() => {
    const { selectedBDs, excludeBDs } = filters;

    if (selectedBDs.length === 0) {
      return allBdData;
    }

    const selectedSet = new Set(selectedBDs);

    return allBdData.filter((bd) => {
      const isSelected = selectedSet.has(bd.bdName);

      if (excludeBDs) {
        return !isSelected;
      } else {
        return isSelected;
      }
    });
  }, [allBdData, filters.selectedBDs, filters.excludeBDs]);

  const analysisSummary = useMemo(() => {
    if (!filteredBdData || filteredBdData.length === 0)
      return {
        totalRegisValue: 0,
        totalRegistrations: 0,
        uniqueBDs: 0,
        uniqueVerticals: [],
        regChange: null,
        valueChange: null,
        bdChange: null,
      };

    const totalRegisValue = filteredBdData.reduce(
      (sum, i) => sum + i.totalRegisValue,
      0
    );
    const totalRegistrations = filteredBdData.reduce(
      (sum, i) => sum + i.totalRegistrations,
      0
    );
    const uniqueBDs = filteredBdData.length;

    const allUniqueVerticalNames = filteredBdData.flatMap((bd) =>
      bd.detailedVerticalSummary.map((v) => v.name)
    );
    const uniqueVerticalsForChips = Array.from(new Set(allUniqueVerticalNames))
      .sort()
      .slice(0, 8);

    let regChange = null;
    let valueChange = null;
    let bdChange = null;

    if (isComparisonMode) {
      // monthlySummary is guaranteed to be [Past, Latest] due to computeDateRange and generateMonthLabels
      const month1Reg = filteredBdData.reduce(
        (sum, bd) => sum + (bd.monthlySummary[0]?.registrations || 0),
        0
      );
      const month2Reg = filteredBdData.reduce(
        (sum, bd) => sum + (bd.monthlySummary[1]?.registrations || 0),
        0
      );
      const month1Value = filteredBdData.reduce(
        (sum, bd) => sum + (bd.monthlySummary[0]?.value || 0),
        0
      );
      const month2Value = filteredBdData.reduce(
        (sum, bd) => sum + (bd.monthlySummary[1]?.value || 0),
        0
      );

      // Unique BDs is already correct (it's the count of BDs in the filter/data)
      const month1BDs = new Set(
        filteredBdData
          .filter(
            (bd) =>
              bd.monthlySummary[0]?.registrations > 0 ||
              bd.monthlySummary[0]?.value > 0
          )
          .map((bd) => bd.bdName)
      ).size;
      const month2BDs = new Set(
        filteredBdData
          .filter(
            (bd) =>
              bd.monthlySummary[1]?.registrations > 0 ||
              bd.monthlySummary[1]?.value > 0
          )
          .map((bd) => bd.bdName)
      ).size;

      regChange = calculatePercentageChange(month2Reg, month1Reg);
      valueChange = calculatePercentageChange(month2Value, month1Value);
      bdChange = calculatePercentageChange(month2BDs, month1BDs); // Change in active BDs
    }

    return {
      totalRegisValue,
      totalRegistrations,
      uniqueBDs,
      uniqueVerticals: uniqueVerticalsForChips,
      regChange,
      valueChange,
      bdChange,
    };
  }, [filteredBdData, isComparisonMode]);

  return (
    <div className="font-sans min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl shadow-xl mb-8 bg-white border border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-95"></div>
          <div className="relative p-6 sm:p-8 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm shadow-lg">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Business Development Analysis Dashboard
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Comprehensive BD performance metrics and insights
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            bdNameOptions={availableBdNames}
          />
        </div>

        {isLoading ? (
          <LoadingView />
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-medium">
            Failed to fetch data.
          </div>
        ) : filteredBdData.length === 0 ? (
          <NoDataFoundView />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SummaryCard
                title="BD Persons"
                value={analysisSummary.uniqueBDs}
                icon={IoPeople}
                color="blue"
              />
              <SummaryCard
                title="Registrations"
                value={analysisSummary.totalRegistrations}
                icon={IoLayersSharp}
                color="green"
                comparisonChange={analysisSummary.regChange}
              />
              <SummaryCard
                title="Assoc. Verticals"
                value={null}
                icon={Telescope}
                color="cyan"
                chips={analysisSummary.uniqueVerticals}
              />
              <SummaryCard
                title="Registered Value"
                value={`₹${formatAmount(analysisSummary.totalRegisValue)}`}
                icon={HiCurrencyRupee}
                color="red"
                comparisonChange={analysisSummary.valueChange}
              />
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                BD Person Performance Breakdown
              </h2>
            </div>

            <BdSummaryTable
              data={filteredBdData}
              monthHeaders={monthHeaders}
              isComparison={isComparisonMode}
            />
          </>
        )}
      </div>
    </div>
  );
}