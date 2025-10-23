import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Briefcase,
  ChevronDown,
  Layers3,
  Users,
  Telescope,
  Scale,
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
  ChevronRight, 
} from "lucide-react";
import { MdPerson } from "react-icons/md";
import { IoLayersSharp, IoPeople } from "react-icons/io5";
import { HiBuildingOffice, HiCurrencyRupee } from "react-icons/hi2";
// NOTE: Assuming this custom hook is implemented elsewhere in your project
import useBusinessAnalysis from "../hooks/useBusinessAnalysis"; 
import { FaPerson } from "react-icons/fa6";
import { selectorChartsIsVoronoiEnabled } from "@mui/x-charts/internals";

// === MODIFICATION 1: Update RELATIVE_TIME_OPTIONS ===
const RELATIVE_TIME_OPTIONS = [
  { value: "0", label: "This Month" }, // New: 1st of month to today
  { value: "1", label: "Last 1 Month" }, // Last full month + this month till today (2 months)
  { value: "2", label: "Last 2 Months" },
  { value: "3", label: "Last 3 Months" },
  { value: "4", label: "Last 4 Months" },
  { value: "5", label: "Last 5 Months" },
  { value: "6", label: "Last 6 Months" }, // Maximum limit
];
// ===================================================

const generateMonthOptions = () => {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    const options = [];
    const now = new Date();
    // This generates options going back 1 year from the current month
    const limitDate = new Date(now.getFullYear() - 1, now.getMonth(), 1); 
    let iteratorDate = new Date(now.getFullYear(), now.getMonth(), 1);
    while (iteratorDate.getTime() > limitDate.getTime()) {
        options.push(`${monthNames[iteratorDate.getMonth()]} ${iteratorDate.getFullYear()}`);
        iteratorDate.setMonth(iteratorDate.getMonth() - 1);
    }
    return options;
};
const MONTH_OPTIONS = generateMonthOptions();


// === MODIFICATION 3: Update generateMonthLabels ===
// Utility function to generate month labels for the header columns
const generateMonthLabels = (type, value) => {
    const labels = [];
    const now = new Date();
    let count = 0;

    if (type === 'relative') {
        const monthsBack = parseInt(value);
        // Value 0 ("This Month") = 1 label (current month)
        // Value X ("Last X Months") = X previous months + 1 current month (total X+1 labels)
        count = monthsBack + 1; 
    } else if (type === 'month') {
        // FIX: If the type is 'month', just return the selected month label in an array
        return [value]; 
    } else {
        return [];
    }

    // Generate labels starting from the current month backwards
    for (let i = 0; i < count; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        labels.push(`${month} ${year}`);
    }
    return labels; // Returns in reverse chronological order (e.g., [Oct 2025, Sep 2025, Aug 2025])
};
// ===================================================



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

// === MODIFICATION 2: Update computeDateRange ===
function computeDateRange(type, value) {
  const now = new Date();
  let fromDate, toDate;
  
  // toDate is always the end of the current day (today) for relative ranges, or the end of the selected month
  toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); 

  if (type === "relative") {
    const monthsBack = parseInt(value); // This is X in "Last X Months"
    
    if (monthsBack === 0) {
      // "This Month": Start from the 1st of the current month
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1); 
    } else {
      // "Last X Months": Start from the 1st day of the month 'X' months ago. 
      // This includes X full previous months and the current month till today (total X+1 months in range).
      fromDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    }
    
  } else {
    // Specific Month logic (remains the same: full month)
    const [monthName, yearStr] = value.split(" ");
    const monthIndex = new Date(`${monthName} 1, ${yearStr}`).getMonth();
    const year = parseInt(yearStr);
    fromDate = new Date(year, monthIndex, 1);
    toDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  }
  
  return { fromDate: fromDate.toISOString(), toDate: toDate.toISOString() };
}
// ===================================================

/**
 * Parses the summary string (e.g., "Food: 3 regs / 52000, Pharma: 5 regs / 48000") 
 * into a key-value map containing both 'count' (registrations) and 'value'.
 * * Returns: { [name: string]: { count: number, value: number } }
 */
const parseSummaryString = (summaryString) => {
    let str = summaryString ? summaryString.replace(/"/g, '') : '';
    if (!str || str.length === 0) return {};
    
    // Split by comma and trim whitespace
    const pairs = str.split(',').map(s => s.trim());
    
    return pairs.reduce((acc, pair) => {
        // Find the index of the colon, which separates the name from the details
        const colonIndex = pair.lastIndexOf(':');
        if (colonIndex > 0) {
            const name = pair.substring(0, colonIndex).trim();
            const detailsStr = pair.substring(colonIndex + 1).trim();

            // Expected format: "X regs / YYYY"
            const match = detailsStr.match(/(\d+)\s*regs\s*\/\s*([\d,.]+)/);
            
            if (name && match) {
                // match[1] is the count, match[2] is the value
                const count = parseInt(match[1]);
                // Clean the value (remove commas and parse float)
                const value = parseFloat(match[2].replace(/,/g, ''));

                if (!isNaN(count) && !isNaN(value)) {
                    acc[name] = { count, value }; // Store both count and value
                }
            }
        }
        return acc;
    }, {});
};


/**
 * CORE DATA TRANSFORMATION: Groups monthly rows by BD and prepares monthly breakdowns.
 * This function is updated to incorporate the detailed vertical/client summaries with both count and value.
 */
const groupAndMapMonthlyData = (rawData, timeRangeType, timeRangeValue) => {
    if (!rawData || rawData.length === 0) return [];
    
    // Generate the month labels (e.g., ['Oct 2025', 'Sep 2025']) based on filter
    const monthLabels = generateMonthLabels(timeRangeType, timeRangeValue);

    const groupedData = rawData.reduce((acc, currentItem) => {
        const { 
            bdName, 
            totalRegistrations, 
            totalRegisValue, 
            uniqueVerticals, 
            uniqueClients,
            verticalSummary, 
            clientSummary    
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

        // Tally up the overall totals
        bdEntry.totalRegistrations += totalRegistrations;
        bdEntry.totalRegisValue += totalRegisValue;
        // NOTE: uniqueVerticals and uniqueClients from the rawData here are monthly maximums and are now ignored
        // We will calculate the true unique count from the detailed breakdown below.

        // Store the detailed monthly data entries
        bdEntry.monthlyData.push({
            registrations: totalRegistrations,
            value: totalRegisValue,
            verticals: parseSummaryString(verticalSummary), // Now contains {name: {count, value}}
            clients: parseSummaryString(clientSummary),       // Now contains {name: {count, value}}
        });

        return acc;
    }, {});

    // Finalize the structure and assign month labels
    const finalData = Object.values(groupedData).map(bdEntry => {
        // REMOVED INCORRECT MATH.MAX LOGIC:
        // const uniqueVerticals = Math.max(...Array.from(bdEntry.uniqueVerticals).filter(v => typeof v === 'number'), 0);
        // const uniqueClients = Math.max(...Array.from(bdEntry.uniqueClients).filter(v => typeof v === 'number'), 0);
        
        // --- FIX: Reverse monthlyData to align with the LATEST-to-OLD order of monthLabels (headers) ---
        // Assuming raw data comes in OLD-to-LATEST order, we reverse it here to match the LATEST-to-OLD month headers.
        const reversedMonthlyData = [...bdEntry.monthlyData].reverse();

        // Map monthly data to include month labels (data is now in reverse chronological order)
        const monthlySummary = monthLabels.slice(0, reversedMonthlyData.length).map((label, index) => ({
            month: label,
            ...reversedMonthlyData[index], // Use the reversed data
        }));

        // --- Prepare Detailed Breakdown Data for the Horizontal Tables ---
        const allVerticals = new Set();
        const allClients = new Set();
        monthlySummary.forEach(month => {
            Object.keys(month.verticals).forEach(v => allVerticals.add(v));
            Object.keys(month.clients).forEach(c => allClients.add(c));
        });

        const detailedVerticalSummary = Array.from(allVerticals).sort().map(name => ({
            name,
            monthlyValues: monthlySummary.map(month => {
                const data = month.verticals[name] || { count: 0, value: 0 };
                return {
                    month: month.month,
                    count: data.count, // Store count
                    value: data.value, // Store value
                };
            })
        }));

        const detailedClientSummary = Array.from(allClients).sort().map(name => ({
            name,
            monthlyValues: monthlySummary.map(month => {
                const data = month.clients[name] || { count: 0, value: 0 };
                return {
                    month: month.month,
                    count: data.count, // Store count
                    value: data.value, // Store value
                };
            })
        }));

        return {
            bdName: bdEntry.bdName,
            totalRegistrations: bdEntry.totalRegistrations,
            totalRegisValue: bdEntry.totalRegisValue,
            // FIX 1: Use the count of unique entities found in the detailed breakdown
            uniqueVerticals: detailedVerticalSummary.length, 
            uniqueClients: detailedClientSummary.length,     
            monthlySummary: monthlySummary, 
            detailedVerticalSummary: detailedVerticalSummary, 
            detailedClientSummary: detailedClientSummary,     
        };
    });

    return finalData;
};


// --------------------------------------------------------------------------------
// Shared UI Components
// --------------------------------------------------------------------------------

const TimeRangeTabSelector = ({ selectedType, onSelect }) => {
    const tabs = [
        { type: 'relative', label: 'X Month Range', icon: Clock },
        { type: 'month', label: 'Specific Month', icon: Calendar },
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
                            flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                            ${
                                isSelected 
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-200'
                            }
                        `}
                    >
                        <Icon className={`w-4 h-4
                            ${
                                isSelected 
                                    ? 'text-white'
                                    : 'text-blue-500'
                            }`} />
                        <span>{label}</span>
                    </button>
                );
            })}
        </div>
    );
};


const ExcludeToggle = ({ enabled, onChange, leftText = 'IN', rightText = 'EX' }) => {
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
      <span className="sr-only">Toggle {leftText}/{rightText}</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
          enabled ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}; 

const SingleSelectDropdown = ({ options, selected, onSelect, label, icon: Icon, type }) => {
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

    const isRelative = type === 'relative';
    const selectedOption = isRelative 
        ? options.find(opt => opt.value === selected) 
        : { label: selected, value: selected };

    const displayValue = selectedOption ? selectedOption.label : `Select ${label}`;

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
                <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
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
                                            ? 'bg-blue-50 text-blue-800 font-medium' 
                                            : 'hover:bg-gray-50 text-gray-700'
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
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
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


const MultiSelectDropdown = ({ options, selected, onToggle, label, icon: Icon, isExcluded }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = React.useRef(null);

    const filteredOptions = options.filter(option =>
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
    
    let displayValue = '';
    let modeText = isExcluded ? 'Excluding' : 'Including';

    if (count === 0) {
        displayValue = isExcluded ? `Excluding 0 ${label}` : `Including All ${label}`;
    } else {
        displayValue = `${modeText} ${count} ${label}`;
    }

    const modeColor = isExcluded ? 'text-red-600' : 'text-blue-600';
    const modeHoverColor = isExcluded ? 'group-hover:text-red-700' : 'group-hover:text-blue-700';

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                className={`w-full bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 text-left cursor-pointer hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm font-medium flex items-center justify-between group
                    ${isExcluded ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${modeColor} ${modeHoverColor}`} />
                    <span className="text-gray-700">{displayValue}</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
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
                                ${isExcluded ? 'hover:bg-red-50 text-red-700' : 'hover:bg-blue-50 text-blue-700'}`}
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
                                            ? 'bg-red-50 text-red-800 font-medium' 
                                            : 'bg-blue-50 text-blue-800 font-medium'
                                        : 'hover:bg-gray-50 text-gray-700'
                                }`}
                                onClick={() => onToggle(option)}
                            >
                                {option}
                                {selected.includes(option) && (
                                    <svg 
                                        className={`w-4 h-4 ${isExcluded ? 'text-red-600' : 'text-blue-600'}`} 
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                )}
                            </li>
                        ))}
                        {filteredOptions.length === 0 && (
                            <li className="px-4 py-3 text-sm text-gray-500 italic text-center">No matches found.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};


const FilterPanel = ({ filters, setFilters, bdNameOptions }) => {
    
    const { timeRangeType, timeRangeValue, selectedBDs, excludeBDs } = filters;

    const handleBDToggle = (bdNameOrList) => {
        let updatedBDs;
        if (Array.isArray(bdNameOrList)) {
            updatedBDs = bdNameOrList;
        } else {
            updatedBDs = selectedBDs.includes(bdNameOrList)
                ? selectedBDs.filter(name => name !== bdNameOrList)
                : [...selectedBDs, bdNameOrList];
        }
        setFilters(prev => ({ ...prev, selectedBDs: updatedBDs }));
    };

    const handleExcludeToggle = (isExcluded) => {
        setFilters(prev => ({ 
            ...prev, 
            excludeBDs: isExcluded, 
        })); 
    };
    
    const handleTimeRangeTypeToggle = (newType) => {
        const newValue = newType === 'relative' 
            ? RELATIVE_TIME_OPTIONS[0].value
            : MONTH_OPTIONS[0];

        setFilters(prev => ({ 
            ...prev, 
            timeRangeType: newType,
            timeRangeValue: newValue,
        }));
    };
    
    const handleTimeRangeValueSelect = (value) => {
        setFilters(prev => ({ ...prev, timeRangeValue: value }));
    };

    const handleClearFilters = useCallback(() => {
        setFilters({
            timeRangeType: "relative",
            timeRangeValue: RELATIVE_TIME_OPTIONS[0].value,
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
                    <h2 className="text-lg font-bold text-gray-900">Live Analysis Filters</h2>
                    <p className="text-xs text-gray-500">Filter parameters automatically update the results</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                
                <div className="lg:col-span-4 grid grid-cols-1 gap-4">
                    <TimeRangeTabSelector 
                        selectedType={timeRangeType}
                        onSelect={handleTimeRangeTypeToggle}
                    />
                    
                    <SingleSelectDropdown
                        options={timeRangeType === 'relative' ? RELATIVE_TIME_OPTIONS : MONTH_OPTIONS}
                        selected={timeRangeValue}
                        onSelect={handleTimeRangeValueSelect}
                        label={timeRangeType === 'relative' ? 'Range' : 'Month'}
                        icon={timeRangeType === 'relative' ? Clock : Calendar}
                        type={timeRangeType}
                    />
                </div>

                <div className="lg:col-span-5 ml-8">
                    <div className="flex items-center justify-between mb-2"> 
                        <label className="text-xs font-medium text-gray-600 block">BD Selection</label>
                        <ExcludeToggle enabled={excludeBDs} onChange={handleExcludeToggle} />
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

                <div className="lg:col-span-3 flex justify-end"> 
                    <button
                        onClick={handleClearFilters}
                        className="p-2.5 bg-gray-100 text-gray-600 rounded-xl shadow-sm hover:bg-gray-200 hover:shadow-md transition-all duration-200"
                        aria-label="Clear Filters"
                        title="Clear Filters"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};


const SummaryCard = ({ title, value, icon: Icon, color, className = '', chips = [] }) => {
    const colorClasses = {
      blue: { border: "border-t-4 border-blue-500", bg: "bg-blue-100", icon: "text-blue-600" },
      green: { border: "border-t-4 border-green-500", bg: "bg-green-100", icon: "text-green-600" },
      orange: { border: "border-t-4 border-orange-500", bg: "bg-orange-100", icon: "text-orange-600" },
      red: { border: "border-t-4 border-red-500", bg: "bg-red-100", icon: "text-red-600" },
      cyan: { border: "border-t-4 border-cyan-500", bg: "bg-cyan-100", icon: "text-cyan-600" },
      teal: { border: "border-t-4 border-teal-500", bg: "bg-teal-100", icon: "text-teal-600" } // Corrected typo from `cyan` to `teal` in the provided code structure, though one of the `cyan` was redundant.
    };
    
    const classes = colorClasses[color] || colorClasses.blue;
    const MAX_CHIPS = 8;
  
    return (
      <div className={`bg-white py-4 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${classes.border} ${className} h-full flex flex-col`}>
        
        <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium uppercase text-gray-500">{title}</span>
            <div className={`p-2 rounded-lg ${classes.bg} ${classes.icon}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        
        <div className="flex-grow flex flex-col justify-end">
            {chips.length > 0 ? (
                <div className="flex flex-wrap gap-2 my-2 max-h-[70px] overflow-hidden"> 
                    {chips.slice(0, MAX_CHIPS).map((chip, index) => (
                        <span key={index} className={`${classes.bg} ${classes.icon} text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap shadow-sm`}>
                            {chip}
                        </span>
                    ))}
                    {chips.length > MAX_CHIPS && (
                        <span className="text-xs font-medium text-gray-500 mt-1 ml-1">
                            +{chips.length - MAX_CHIPS} more
                        </span>
                    )}
                </div>
            ) : (
                value !== null && value !== undefined ? (
                    <p className="text-3xl font-bold text-gray-800 my-2">
                        {value}
                    </p>
                ) : (
                    <p className="text-2xl font-bold italic text-gray-500 my-1">N/A</p>
                )
            )}
        </div>
      </div>
    );
};

const VerticalClientBreakdownTable = ({ title, detailedSummary, monthHeaders, icon: Icon, colorClass }) => {
    
    // Add state for expansion, start expanded by default
    const [isExpanded, setIsExpanded] = useState(true);

    if (!detailedSummary || detailedSummary.length === 0) {
        return (
            <div className="relative bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-100 h-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 rounded-2xl"></div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${colorClass.iconBg} shadow-md`}>
                            <Icon className="w-4 h-4 text-white"/>
                        </div>
                        <h3 className={`text-base font-bold ${colorClass.header}`}>
                            {title}
                        </h3>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="p-3 rounded-full bg-gray-100 mb-3">
                            <BarChart3 className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500">No data breakdown available for this range.</p>
                    </div>
                </div>
            </div>
        );
    }
    
    // Calculate column totals (total count and total value for each month)
    const monthlyTotals = monthHeaders.map((month) => {
        return detailedSummary.reduce((acc, item) => {
            const monthlyData = item.monthlyValues.find(m => m.month === month);
            acc.count += (monthlyData?.count || 0);
            acc.value += (monthlyData?.value || 0);
            return acc;
        }, { count: 0, value: 0 });
    });

    // Calculate Grand Totals
    const grandTotalCount = monthlyTotals.reduce((sum, val) => sum + val.count, 0);
    const grandTotalValue = monthlyTotals.reduce((sum, val) => sum + val.value, 0);

    return (
        <div className="relative bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-gray-100 h-full overflow-hidden">
            
            <div className="relative">
                {/* Compact Header with Toggle Logic */}
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${colorClass.iconBg} shadow-lg ring-2 ring-white/50`}>
                            <Icon className="w-4 h-4 text-white"/>
                        </div>
                        <div>
                            <h3 className={`text-base font-bold ${colorClass.header}`}>
                                {title}
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-0.5">Monthly breakdown</p>
                        </div>
                    </div>
                    {/* Expand/Collapse Summary and Button */}
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
                            <span className="text-[11px] font-bold text-gray-700">
                                {detailedSummary.length} {title.includes('Vertical') ? 'Verticals' : 'Clients'}
                            </span>
                        </div>
                        <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                            ${
                                isExpanded
                                    ? `${colorClass.iconBg} text-white -rotate-90 shadow-md` // Themed color when expanded
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            <ChevronDown className="w-4 h-4"/>
                        </div>
                    </div>
                </div>
                
                {/* Wrapped Table Content */}
                <CollapsibleDetails isExpanded={isExpanded}>
                    {/* Modern Table with Glass Effect */}
                    <div className="overflow-x-auto mt-5 rounded-xl border border-gray-200/80 shadow-xl bg-white/60 backdrop-blur-md">
                        <table className="min-w-full">
                            {/* Sleek Header */}
                            <thead className={`${colorClass.iconBg} sticky top-0 z-10`}>
                                <tr>
                                    <th className={`px-3 py-2.5 text-left text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20 w-[180px] sticky left-0 ${colorClass.iconBg} backdrop-blur-md`}>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-0.5 h-3 bg-white/60 rounded-full"></div>
                                            <span className="drop-shadow-sm">{title.replace(' Monthly Contribution', '')}</span>
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {detailedSummary.map((item, itemIndex) => {
                                    const rowTotal = item.monthlyValues.reduce((acc, m) => {
                                        acc.count += m.count;
                                        acc.value += m.value;
                                        return acc;
                                    }, { count: 0, value: 0 });

                                    const hasData = rowTotal.count > 0 || rowTotal.value > 0;
                                    const isEvenRow = itemIndex % 2 === 0;

                                    return (
                                        <tr 
                                            key={itemIndex} 
                                            className={`group transition-all duration-150 ${
                                                isEvenRow ? 'bg-white/90' : 'bg-gray-50/50'
                                            } hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-indigo-50/70 hover:shadow-md`}
                                        >
                                            {/* Name Cell with Subtle Animation */}
                                            <td className="px-3 py-2.5 text-left text-xs font-semibold text-gray-800 border-r border-gray-100 sticky left-0 bg-white/95 group-hover:bg-gradient-to-r group-hover:from-blue-50/90 group-hover:to-indigo-50/70 backdrop-blur-sm transition-all">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-0.5 h-4 ${colorClass.iconBg} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                                    <span className="truncate group-hover:translate-x-0.5 transition-transform">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Data Cells with Micro Interactions */}
                                            {monthHeaders.map((month, monthIndex) => {
                                                const monthlyData = item.monthlyValues.find(m => m.month === month);
                                                const value = monthlyData?.value || 0;
                                                const count = monthlyData?.count || 0;
                                                const hasMonthData = count > 0 || value > 0;
                                                
                                                return (
                                                    <td 
                                                        key={monthIndex} 
                                                        className={`px-2 py-2.5 text-center text-xs border-r border-gray-100 whitespace-nowrap transition-all duration-150 ${
                                                            hasMonthData 
                                                                ? 'bg-gradient-to-br from-emerald-50/40 to-teal-50/40 hover:from-emerald-100/60 hover:to-teal-100/60' 
                                                                : 'text-gray-300'
                                                        }`}
                                                    >
                                                        {hasMonthData ? (
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-gray-900 text-sm font-bold">
                                                                    {formatAmount(value)}
                                                                </span>
                                                                <span className="text-[10px] text-emerald-600 font-medium">
                                                                    {count} reg{count !== 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-300 text-sm">—</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            {/* Row Total with Accent */}
                                            <td className="px-2 py-2.5 text-center text-xs border-r border-gray-100 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 hover:from-blue-100/80 hover:to-indigo-100/80 whitespace-nowrap backdrop-blur-sm transition-all">
                                                {hasData ? (
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="text-blue-900 text-sm font-bold">
                                                            {formatAmount(rowTotal.value)}
                                                        </span>
                                                        <span className="text-[10px] text-blue-600 font-semibold">
                                                            {rowTotal.count} reg{rowTotal.count !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300 text-sm">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                
                                {/* Premium Footer with Glow Effect */}
                                <tr className="bg-gradient-to-r from-blue-100/80 via-indigo-100/80 to-blue-100/80 border-t-2 border-blue-200">
                                    <td className="px-3 py-3 text-left text-xs font-bold text-blue-900 border-r border-blue-200 sticky left-0 bg-gradient-to-r from-blue-100/95 to-indigo-100/95 backdrop-blur-sm">
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                                            <span>Monthly Total</span>
                                        </div>
                                    </td>
                                    {monthlyTotals.map((total, index) => (
                                        <td 
                                            key={index} 
                                            className="px-2 py-3 text-center text-xs border-r border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 whitespace-nowrap backdrop-blur-sm"
                                        >
                                            {total.value > 0 ? (
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-gray-900 text-sm font-extrabold">
                                                        {formatAmount(total.value)}
                                                    </span>
                                                    <span className="text-[10px] text-blue-600 font-bold">
                                                        {total.count} reg{total.count !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-sm">—</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-2 py-3 text-center text-xs  whitespace-nowrap backdrop-blur-sm border-l-2 border-blue-300">
                                        {grandTotalValue > 0 ? (
                                            <div className="flex flex-col items-center gap-0.5">
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3 text-blue-900" />
                                                    <span className="text-blue-950 text-base font-black">
                                                        {formatAmount(grandTotalValue)}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-blue-800 font-extrabold">
                                                    {grandTotalCount} reg{grandTotalCount !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-300 text-sm">—</span>
                                        )}
                                    </td>
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
      ${isExpanded ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"} // FIX: Increased max-height
    `}
  >
    <div>{children}</div>
  </div>
);


const BdRow = ({ bdData, monthHeaders }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const verticalColor = { header: 'text-sky-700', iconBg: 'bg-sky-500', textColor: 'text-sky-500' };
  const clientColor = { header: 'text-cyan-700', iconBg: 'bg-cyan-500', textColor: 'text-cyan-500' };

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium shadow-sm">
            <IoLayersSharp className="w-3.5 h-3.5" />
            {bdData.totalRegistrations}
          </span>
        </td>
        <td className="px-4 py-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium shadow-sm">
            <HiCurrencyRupee className="w-3.5 h-3.5" />
            {formatAmount(bdData.totalRegisValue)}
          </span>
        </td>
        <td className="px-4 py-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-100 text-cyan-700 text-xs font-medium shadow-sm">
            <Telescope className="w-3.5 h-3.5" />
            {bdData.uniqueVerticals} {/* Corrected value from transformation */}
          </span>
        </td>
        <td className="px-4 py-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 text-xs font-medium shadow-sm">
            <Building2 className="w-3.5 h-3.5" />
            {bdData.uniqueClients} {/* Corrected value from transformation */}
          </span>
        </td>
        <td className="px-4 py-4 text-center w-16">
          <div
            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300
            ${
              isExpanded
                ? "bg-blue-600 text-white rotate-180"
                : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
            }`}
          >
            <ChevronDown className="w-4 h-4" />
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
                    {bdData.totalRegistrations} registrations over {bdData.monthlySummary.length} months
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Vertical Breakdown Table (Rows for Verticals) */}
                  <VerticalClientBreakdownTable
                    title="Vertical Monthly Contribution"
                    detailedSummary={bdData.detailedVerticalSummary}
                    monthHeaders={monthHeaders}
                    icon={Telescope}
                    colorClass={verticalColor}
                  />
                  {/* Client Breakdown Table (Rows for Clients) */}
                  <VerticalClientBreakdownTable
                    title="Client Monthly Contribution"
                    detailedSummary={bdData.detailedClientSummary}
                    monthHeaders={monthHeaders}
                    icon={HiBuildingOffice}
                    colorClass={clientColor}
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

const BdMobileRow = ({ bdData, monthHeaders }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const verticalColor = { header: 'text-teal-700', iconBg: 'bg-teal-500', textColor: 'text-teal-500' };
    const clientColor = { header: 'text-emerald-700', iconBg: 'bg-emerald-500', textColor: 'text-emerald-500' };

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
                        <Telescope className="w-5 h-5 text-white"/>
                    </div>
                    <h4 className="text-base font-medium text-white">
                        {bdData.bdName}
                    </h4>
                </div>
                <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                      ${
                        isExpanded
                            ? "bg-white text-blue-600 rotate-180"
                            : "bg-white/20 backdrop-blur-sm text-white"
                    }`}
                >
                    <ChevronDown className="w-4 h-4"/>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-px bg-gray-200">
                <div className="bg-white p-4 text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                        Registrations
                    </p>
                    <p className="text-xl font-semibold text-blue-600">
                        {bdData.totalRegistrations}
                    </p>
                </div>

                <div className="bg-white p-4 text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                        Registered Value
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                        ₹{formatAmount(bdData.totalRegisValue)}
                    </p>
                </div>

                <div className="bg-white p-4 text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                        Verticals
                    </p>
                    <p className="text-xl font-semibold text-cyan-600">
                        {bdData.uniqueVerticals} {/* Corrected value from transformation */}
                    </p>
                </div>

                <div className="col-span-3 bg-white p-4 text-center border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                        Clients
                    </p>
                    <p className="text-xl font-semibold text-orange-600">
                        {bdData.uniqueClients} {/* Corrected value from transformation */}
                    </p>
                </div>
            </div>

            <CollapsibleDetails isExpanded={isExpanded}>
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-600"/>
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
                    />
                    <VerticalClientBreakdownTable
                        title="Client Monthly Contribution"
                        detailedSummary={bdData.detailedClientSummary}
                        monthHeaders={monthHeaders}
                        icon={HiBuildingOffice}
                        colorClass={clientColor}
                    />
                </div>
            </CollapsibleDetails>
        </div>
    );
};


const BdSummaryTable = ({ data, monthHeaders }) => {
    return (
        <div className="mt-8">
          {/* Desktop Table */}
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
                    <BdRow key={bdData.bdName} bdData={bdData} monthHeaders={monthHeaders} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden space-y-4">
            {data.map((bdData) => (
              <BdMobileRow key={bdData.bdName} bdData={bdData} monthHeaders={monthHeaders} />
            ))}
          </div>

          {data.length === 0 && (
            <div className="text-center py-10 text-gray-500 font-medium">
              <NoDataFoundView/>
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
      <span className="text-xl font-medium text-gray-600">
        No Data Found
      </span>
      <span className="text-sm text-gray-400 mt-2 max-w-md text-center">
        We couldn’t find any data matching your filters. Try adjusting your date range or BD manager selection.
      </span>
    </div>
  </div>
);

// FIX 2: Updated Loading View Component
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


// --------------------------------------------------------------------------------
// Main Component
// --------------------------------------------------------------------------------
export default function BusinessAnalysis() {
  const [filters, setFilters] = useState({
    timeRangeType: "relative",
    timeRangeValue: RELATIVE_TIME_OPTIONS[0].value,
    selectedBDs: [],
    excludeBDs: false,
  });

  const { fromDate, toDate } = useMemo(
    () => computeDateRange(filters.timeRangeType, filters.timeRangeValue),
    [filters.timeRangeType, filters.timeRangeValue]
  );
  
  // 💥 MODIFICATION: Only include date range in API call filters 💥
  // This ensures the hook is NOT re-triggered when BD selection changes.
  const dateRangeApiFilters = useMemo(
    () => ({
      fromDate,
      toDate,
      // bdNames and excludeBds are intentionally removed from here
      // to prevent a full reload when only BD filters change.
    }),
    [fromDate, toDate]
  );

  // Hook call now only depends on date range filters
  const { data: rawData, isLoading, error } = useBusinessAnalysis(dateRangeApiFilters);
  
  // 1. Generate the month headers once based on the time filter
  const monthHeaders = useMemo(() => 
    generateMonthLabels(filters.timeRangeType, filters.timeRangeValue),
    [filters.timeRangeType, filters.timeRangeValue]
  );

  // 2. Group the raw data by BD name and prepare breakdown data
  const allBdData = useMemo(() => {
    return groupAndMapMonthlyData(rawData || [], filters.timeRangeType, filters.timeRangeValue);
  }, [rawData, filters.timeRangeType, filters.timeRangeValue]);

  const availableBdNames = useMemo(() => {
    return Array.from(new Set(allBdData.map(bd => bd.bdName))).sort();
  }, [allBdData]);
  
  // 3. Filter the grouped data based on BD selection (Client-Side Filter)
  // This logic runs *after* data is fetched/processed and does not cause a reload.
  const filteredBdData = useMemo(() => {
    const { selectedBDs, excludeBDs } = filters;

    if (selectedBDs.length === 0) {
      // If no BDs are selected, return all data. 
      return allBdData;
    }

    const selectedSet = new Set(selectedBDs);

    return allBdData.filter(bd => {
      const isSelected = selectedSet.has(bd.bdName);

      if (excludeBDs) {
        // Exclude Mode: Keep the BD if their name is NOT in the selected list.
        return !isSelected;
      } else {
        // Include Mode: Keep the BD if their name IS in the selected list.
        return isSelected;
      }
    });

  }, [allBdData, filters.selectedBDs, filters.excludeBDs]);

  const analysisSummary = useMemo(() => {
    if (!filteredBdData || filteredBdData.length === 0)
      return { totalRegisValue: 0, totalRegistrations: 0, uniqueBDs: 0, uniqueVerticals: [] };

    const totalRegisValue = filteredBdData.reduce((sum, i) => sum + i.totalRegisValue, 0);
    const totalRegistrations = filteredBdData.reduce((sum, i) => sum + i.totalRegistrations, 0);
    const uniqueBDs = filteredBdData.length;
    
    // For the summary card, we collect all unique Vertical names from the processed breakdown
    const allUniqueVerticalNames = filteredBdData.flatMap(bd => 
      bd.detailedVerticalSummary.map(v => v.name)
    );
    const uniqueVerticalsForChips = Array.from(new Set(allUniqueVerticalNames)).sort().slice(0, 8);
    
    return { totalRegisValue, totalRegistrations, uniqueBDs, uniqueVerticals: uniqueVerticalsForChips };
  }, [filteredBdData]);
  

  return (
    <div className="font-sans min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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

        {/* Filters */}
        <div className="mb-8">
          <FilterPanel 
            filters={filters} 
            setFilters={setFilters} 
            bdNameOptions={availableBdNames} 
          />
        </div>

        {/* Data View */}
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
              <SummaryCard title="BD Persons" value={analysisSummary.uniqueBDs} icon={IoPeople} color="blue" />
              <SummaryCard title="Registrations" value={analysisSummary.totalRegistrations} icon={IoLayersSharp} color="green" />
              <SummaryCard title="Assoc. Verticals" value={null} icon={Telescope} color="cyan" chips={analysisSummary.uniqueVerticals} />
              <SummaryCard title="Registered Value" value={`₹${formatAmount(analysisSummary.totalRegisValue)}`} icon={HiCurrencyRupee} color="red" />
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
                BD Person Performance Breakdown
              </h2>
            </div>

            <BdSummaryTable data={filteredBdData} monthHeaders={monthHeaders} /> 
          </>
        )}
      </div>
    </div>
  );
}