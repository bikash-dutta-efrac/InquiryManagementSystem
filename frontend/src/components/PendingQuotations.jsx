import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  FileText,
  Calendar,
  Search,
  RefreshCcw,
  Filter,
  Clock,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  CheckCircle,
  XCircle,
  ChevronDown,
  User,
  AlertCircle,
  Power,
  PowerOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HiCurrencyRupee } from "react-icons/hi2";

import { getBdNames, getPendingQuotations, updateQuotationStatus } from "../services/api";

function formatAmount(num) {
  if (num === null || num === undefined) return "₹0";
  const number = parseFloat(num);
  if (isNaN(number)) return "₹0";
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e5, symbol: "L" },
    { value: 1e7, symbol: "Cr" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (number >= si[i].value) break;
  }
  return "₹" + (number / si[i].value).toFixed(2).replace(rx, "$1") + si[i].symbol;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const AGE_FILTER_OPTIONS = [
  { value: "30", label: "Last 30 Days" },
  { value: "60", label: "Last 60 Days" },
  { value: "90", label: "Last 90 Days" },
  { value: "90+", label: "Last 90+ Days" },
];

// Components
const ExcludeToggle = ({ enabled, onChange, disabled = false }) => {
  const handleClick = () => {
    if (!disabled) {
      const nextVal = !enabled;
      onChange(nextVal);
    }
  };

  const gradientClass = enabled
    ? "bg-gradient-to-r from-red-500 to-red-600"
    : "bg-gradient-to-r from-blue-500 to-cyan-600";
  const focusRing = enabled ? "focus:ring-red-500" : "focus:ring-blue-500";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={enabled}
      className={`relative inline-flex ${
        disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-md"
      } items-center h-6 w-12 rounded-full transition-all duration-300 transform-gpu ${gradientClass} focus:outline-none shadow-md hover:shadow-lg ${focusRing}`}
    >
      <span className="sr-only">Toggle Include/Exclude</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
          enabled ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
};

const SingleSelectDropdown = ({ options, selected, onSelect, label, icon: Icon }) => {
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

  const selectedOption = options.find((opt) => opt.value === selected);
  const displayValue = selectedOption ? selectedOption.label : `Select ${label}`;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className="w-full bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 text-left cursor-pointer hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm font-medium flex items-center justify-between group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
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
          <ul className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selected === option.value;
              return (
                <li
                  key={option.value}
                  className={`px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? "bg-blue-50 text-blue-800 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
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

const MultiSelectDropdown = ({ options, selected, onToggle, label, icon: Icon, isExcluded, onSelectAll, onDeselectAll, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = React.useRef(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
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
    displayValue = isExcluded ? `Excluding 0 ${label}` : `Including All ${label}`;
  } else {
    displayValue = `${modeText} ${count} ${label}`;
  }

  const modeColor = isExcluded ? "text-red-600" : "text-blue-600";
  const modeHoverColor = isExcluded ? "group-hover:text-red-700" : "group-hover:text-blue-700";

  const handleItemToggle = (value) => {
    const updatedSelection = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onToggle(updatedSelection);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className={`w-full bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm font-medium flex items-center justify-between group
          ${isExcluded ? "focus:ring-red-500" : "focus:ring-blue-500"}
          ${disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-md"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${modeColor} ${modeHoverColor}`} />
          <span className="text-gray-700">{displayValue}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          } ${disabled ? "opacity-0" : ""}`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-2 w-full rounded-xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden border border-gray-100">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${label}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {onSelectAll && (
              <li
                className="px-4 py-2.5 cursor-pointer text-sm font-semibold border-b border-gray-100 hover:bg-red-50 text-black"
                onClick={() => {
                  onSelectAll();
                  setSearchTerm("");
                }}
              >
                Select All
              </li>
            )}
            {onDeselectAll && (
              <li
                className="px-4 py-2.5 cursor-pointer text-sm font-semibold border-b border-gray-100 hover:bg-blue-50 text-black"
                onClick={() => {
                  onDeselectAll();
                  setSearchTerm("");
                }}
              >
                Deselect All
              </li>
            )}

            {filteredOptions.map((option) => (
              <li
                key={option.value}
                className={`px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                  selected.includes(option.value)
                    ? isExcluded
                      ? "bg-red-50 text-red-800 font-medium"
                      : "bg-blue-50 text-blue-800 font-medium"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
                onClick={() => handleItemToggle(option.value)}
              >
                {option.label}
                {selected.includes(option.value) && (
                  <svg
                    className={`w-4 h-4 ${isExcluded ? "text-red-600" : "text-blue-600"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
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

const DateRangePicker = ({ fromDate, toDate, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1.5">From Date</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => onChange({ fromDate: e.target.value, toDate })}
          className="w-full bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-gray-700"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1.5">To Date</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => onChange({ fromDate, toDate: e.target.value })}
          className="w-full bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-gray-700"
        />
      </div>
    </div>
  );
};

const FilterPanel = ({ filters, setFilters, bdOptions, onSearch, isBdFilterLocked, onClear }) => {
  const [searchInput, setSearchInput] = useState("");
  const { filterType, fromDate, toDate, ageFilter, selectedBDs, excludeBDs } = filters;

  const handleBDToggle = (bdCodesList) => {
    // Update BDs and clear Quotation search
    setFilters((prev) => ({ ...prev, selectedBDs: bdCodesList, quotNo: "" }));
    setSearchInput("");
  };

  const handleExcludeToggle = (isExcluded) => {
    // Update Exclude status and clear Quotation search
    setFilters((prev) => ({ ...prev, excludeBDs: isExcluded, quotNo: "" }));
    setSearchInput("");
  };

  const handleFilterTypeChange = (type) => {
    // Change Type and clear Quotation search
    setFilters((prev) => ({
      ...prev,
      filterType: type,
      ageFilter: type === "age" ? "30" : prev.ageFilter,
      quotNo: "",
    }));
    setSearchInput("");
  };

  const handleClearFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    setFilters({
      filterType: "date",
      fromDate: today,
      toDate: today,
      ageFilter: "all",
      selectedBDs: bdOptions.map((bd) => bd.value), // Default to all selected BDs on clear
      excludeBDs: false,
      quotNo: "",
    });
    setSearchInput("");
    if(onClear) onClear();
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectAll = () => {
    if (!isBdFilterLocked) {
      setFilters((prev) => ({
        ...prev,
        selectedBDs: bdOptions.map((bd) => bd.value),
        quotNo: "", // Clear search
      }));
      setSearchInput("");
    }
  };

  const handleDeselectAll = () => {
    if (!isBdFilterLocked) {
      setFilters((prev) => ({ 
        ...prev, 
        selectedBDs: [],
        quotNo: "", // Clear search
      }));
      setSearchInput("");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
          <Filter className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Quotation Filters</h2>
          <p className="text-xs text-gray-500">Filter and search pending quotations</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <label className="text-xs font-medium text-gray-600 block mb-1.5">
          Search by Quotation Number
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter quotation number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-medium text-sm"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filter Type Tabs */}
      <div className="mb-4">
        <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200">
          <button
            onClick={() => handleFilterTypeChange("date")}
            className={`flex-1 py-2 px-4 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
              filterType === "date"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${filterType === "date" ? "text-white" : "text-blue-500"}`} />
            <span>Date Range</span>
          </button>
          <button
            onClick={() => handleFilterTypeChange("age")}
            className={`flex-1 py-2 px-4 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
              filterType === "age"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${filterType === "age" ? "text-white" : "text-blue-500"}`} />
            <span>Span Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        {/* Date/Age Filter */}
        <div className="lg:col-span-5">
          {filterType === "date" ? (
            <DateRangePicker
              fromDate={fromDate}
              toDate={toDate}
              onChange={({ fromDate, toDate }) => {
                // Update Dates and clear Quotation search
                setFilters((prev) => ({ ...prev, fromDate, toDate, quotNo: "" }));
                setSearchInput("");
              }}
            />
          ) : (
            <SingleSelectDropdown
              options={AGE_FILTER_OPTIONS}
              selected={ageFilter}
              onSelect={(value) => {
                  // Update Age and clear Quotation search
                  setFilters((prev) => ({ ...prev, ageFilter: value, quotNo: "" }));
                  setSearchInput("");
              }}
              label="Span Filter"
              icon={Clock}
            />
          )}
        </div>

        {/* BD Selection */}
        <div className="lg:col-span-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600 block">BD Selection</label>
            <ExcludeToggle 
              enabled={excludeBDs} 
              onChange={handleExcludeToggle} 
              disabled={isBdFilterLocked} // Disabled if locked
            />
          </div>
          <MultiSelectDropdown
            options={bdOptions}
            selected={selectedBDs}
            onToggle={handleBDToggle}
            label="BDs"
            icon={Users}
            isExcluded={excludeBDs}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            disabled={isBdFilterLocked} // Disabled if locked
          />
        </div>

        {/* Reset Button */}
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

const SummaryCard = ({ title, value, icon: Icon, color, subtext }) => {
  const colorClasses = {
    blue: {
      border: "border-t-4 border-blue-500",
      bg: "bg-blue-100",
      icon: "text-blue-600",
      text: "text-blue-700",
    },
    green: {
      border: "border-t-4 border-green-500",
      bg: "bg-green-100",
      icon: "text-green-600",
      text: "text-green-700",
    },
    orange: {
      border: "border-t-4 border-orange-500",
      bg: "bg-orange-100",
      icon: "text-orange-600",
      text: "text-orange-700",
    },
    red: {
      border: "border-t-4 border-red-500",
      bg: "bg-red-100",
      icon: "text-red-600",
      text: "text-red-700",
    },
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white py-4 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${classes.border}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium uppercase text-gray-500">{title}</span>
        <div className={`p-2 rounded-lg ${classes.bg} ${classes.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className={`text-3xl font-extrabold ${classes.text}`}>{value}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </motion.div>
  );
};

const StatusToggle = ({ status, quotNo, onToggle, isUpdating }) => {
  const isActive = status === "Active";
  // If status is 'Active', we send 'Y' to make it 'Inactive'.
  // If status is 'Inactive', we send null (or undefined by not passing) to make it 'Active' (as requested).
  const closeYnToSend = isActive ? "Y" : null; 

  return (
    <button
      onClick={() => onToggle(quotNo, closeYnToSend)}
      disabled={isUpdating}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 min-w-[90px] justify-center ${
        isActive
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-red-100 text-red-700 hover:bg-red-200"
      } ${isUpdating ? "opacity-75 cursor-not-allowed" : "hover:shadow-md"}`}
    >
      {isUpdating ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Updating...</span>
        </>
      ) : (
        <>
          {isActive ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
          <span>{isActive ? "Active" : "Inactive"}</span>
        </>
      )}
    </button>
  );
};

const PaginationControls = ({
  currentPage,
  totalPages,
  goToPage,
  getPageNumbers,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md border border-gray-100"
  >
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
  </motion.div>
);

const QuotationsTable = ({ data, onStatusToggle, updatingQuots, currentPage, itemsPerPage }) => {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <div className="relative mb-6 w-20 h-20">
          <FileText className="w-16 h-16 text-gray-300 absolute top-0 left-0" />
          <XCircle className="w-8 h-8 text-red-500 absolute bottom-0 right-0 p-1 bg-white rounded-full border-2 border-white" />
        </div>
        <span className="text-xl font-medium text-gray-600">No Quotations Found</span>
        <span className="text-sm text-gray-400 mt-2 max-w-md text-center">
          No pending quotations match your current filters.
        </span>
      </motion.div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600">
                <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-white">
                  Quotation No
                </th>
                <th className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wide text-white">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-white">
                  BD Person
                </th>
                <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-white">
                  Client
                </th>
                <th className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wide text-white">
                  Vertical
                </th>
                <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wide text-white">
                  Value
                </th>
                <th className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wide text-white">
                  Age (Days)
                </th>
                <th className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wide text-white">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {data.map((quot, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index;
                  return (
                    <motion.tr
                      key={quot.quotNo}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:shadow-md ${
                        globalIndex % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-900">{quot.quotNo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <span className="text-sm text-gray-700 font-medium">{formatDate(quot.quotDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{quot.bdName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-700">{quot.clientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 border border-cyan-200">
                          {quot.vertical}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-green-700 flex items-center gap-1">
                            {formatAmount(quot.quotValAfterDis).replace('₹', '')}
                          </span>
                          {quot.percOfDis > 0 && (
                            <span className="text-[10px] text-amber-600 font-medium mt-0.5 bg-amber-50 py-0.5 rounded-full">
                              {quot.percOfDis}% disc.
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                            quot.quotAgeing > 90
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : quot.quotAgeing > 60
                              ? "bg-orange-100 text-orange-700 border border-orange-200"
                              : quot.quotAgeing > 30
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {quot.quotAgeing}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusToggle
                          status={quot.status}
                          quotNo={quot.quotNo}
                          onToggle={onStatusToggle}
                          isUpdating={updatingQuots.has(quot.quotNo)}
                        />
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        <AnimatePresence mode="popLayout">
          {data.map((quot, index) => (
            <motion.div
              key={quot.quotNo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-4 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-white">{quot.quotNo}</h4>
                  </div>
                  <StatusToggle
                    status={quot.status}
                    quotNo={quot.quotNo}
                    onToggle={onStatusToggle}
                    isUpdating={updatingQuots.has(quot.quotNo)}
                  />
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase">Date</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDate(quot.quotDate)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase">BD Person</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {quot.bdName.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{quot.bdName}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase">Client</span>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[180px] truncate">
                      {quot.clientName}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase">Vertical</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 border border-cyan-200">
                    {quot.vertical}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase">Value</span>
                  <div className="flex flex-col items-end">
                    <span className="text-base font-bold text-green-700 flex items-center gap-1">
                      <HiCurrencyRupee className="w-4 h-4" />
                      {formatAmount(quot.quotValAfterDis).replace('₹', '')}
                    </span>
                    {quot.percOfDis > 0 && (
                      <span className="text-xs text-amber-600 font-medium mt-1 bg-amber-50 px-2 py-0.5 rounded-full">
                        {quot.percOfDis}% Discount
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500 uppercase">Age</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      quot.quotAgeing > 90
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : quot.quotAgeing > 60
                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : quot.quotAgeing > 30
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : "bg-green-100 text-green-700 border border-green-200"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {quot.quotAgeing} days
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

const LoadingView = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col justify-center items-center py-20 bg-white rounded-2xl shadow-xl border border-gray-100"
  >
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
    </div>
    <span className="text-lg font-medium text-gray-700">Loading Quotations...</span>
    <span className="text-sm text-gray-400 mt-1">Please wait while we fetch the data.</span>
  </motion.div>
);

const UnauthorizedView = ({ quotNo }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-lg border border-red-200 bg-red-50"
  >
    <div className="relative mb-6 w-20 h-20">
      <Lock className="w-16 h-16 text-red-400 absolute top-0 left-0" />
      <AlertCircle className="w-8 h-8 text-red-700 absolute bottom-0 right-0 p-1 bg-red-50 rounded-full border-2 border-red-50" />
    </div>
    <span className="text-xl font-bold text-red-700">Access Denied</span>
    <span className="text-lg font-medium text-red-600 mt-2">
      Quotation No: <span className="font-mono bg-red-100 px-2 py-1 rounded">{quotNo}</span>
    </span>
    <span className="text-sm text-red-500 mt-3 max-w-lg text-center">
      You are not authorized to view the details for this specific quotation. It may belong to a Business Development personnel outside your assigned area.
    </span>
    <span className="text-xs text-red-400 mt-2">
      Please clear the search or contact your manager if this is incorrect.
    </span>
  </motion.div>
);

// Main Component
export default function PendingQuotations({ username, designation, bdCode }) {

  console.log(username, bdCode)

  const [filters, setFilters] = useState({
    filterType: "date",
    fromDate: new Date().toISOString().split("T")[0],
    toDate: new Date().toISOString().split("T")[0],
    ageFilter: "all",
    selectedBDs: [],
    excludeBDs: false,
    quotNo: "",
  });

  const [quotations, setQuotations] = useState([]);
  const [bdOptions, setBdOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingBDs, setIsFetchingBDs] = useState(true);
  const [updatingQuots, setUpdatingQuots] = useState(new Set());
  const [isUnauthorized, setIsUnauthorized] = useState(false); // New State for Unauthorized view
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Determine if the BD filter controls should be locked
  const isBdFilterLocked = useMemo(() => !!bdCode, [bdCode]);
  const [displayedUsername, setDisplayedUsername] = useState(username);

  // Fetch BD names on component mount
  useEffect(() => {
    const fetchBDs = async () => {
      setIsFetchingBDs(true);
      try {
        const today = new Date();
        const year = today.getFullYear();
        const fromDateStr = `${year}-01-01`;
        const toDateStr = today.toISOString().split("T")[0];

        const bds = await getBdNames({ fromDate: fromDateStr, toDate: toDateStr });
        
        const normalized = bds.map((bd) => ({
          value: String(bd.bdCode),
          label: bd.bdName,
          bdCode: String(bd.bdCode),
          bdName: bd.bdName,
        }));
        setBdOptions(normalized);
        
        // Initial filter setup: either lock to bdCode or select all
        if (bdCode) {
            const bd = normalized.find(opt => opt.value === String(bdCode));
            if (bd) {
                setDisplayedUsername(bd.label);
                setFilters(prev => ({
                    ...prev,
                    selectedBDs: [String(bdCode)],
                    excludeBDs: false,
                }));
            }
        } else if (normalized.length > 0) {
          setFilters((prev) => ({
            ...prev,
            selectedBDs: normalized.map((bd) => bd.value),
          }));
        }
      } catch (error) {
        console.error("Failed to fetch BD names:", error);
        setBdOptions([]);
      } finally {
        setIsFetchingBDs(false);
      }
    };
    fetchBDs();
  }, [bdCode, username]); // Include bdCode and username for initial setup logic

  // Fetch quotations
  const fetchQuotations = useCallback(async () => {
    setIsLoading(true);
    // Reset unauthorized state on new fetch
    setIsUnauthorized(false);

    try {
      const requestBody = {};

      if (filters.quotNo) {
        requestBody.quotNo = filters.quotNo;
      } else {
        if (filters.filterType === "date") {
          requestBody.fromDate = new Date(filters.fromDate).toISOString();
          requestBody.toDate = new Date(filters.toDate + "T23:59:59").toISOString();
        }

        if (filters.filterType === "age" && filters.ageFilter !== "all") {
          requestBody.ageFilter = filters.ageFilter;
        }

        // Determine effective BD codes based on filters and bdCode lock
        let effectiveBdCodes;
        
        if (isBdFilterLocked) {
            // If locked, only include the passed bdCode
            effectiveBdCodes = bdCode ? [String(bdCode)] : [];
        } else {
            // If not locked, use the filter panel's selection
            effectiveBdCodes = filters.excludeBDs
                ? bdOptions
                    .filter((bd) => !filters.selectedBDs.includes(bd.value))
                    .map((bd) => bd.value)
                : filters.selectedBDs;
        }

        if (effectiveBdCodes.length > 0) {
          requestBody.bdCodes = effectiveBdCodes;
        }
      }

      const data = await getPendingQuotations(requestBody);

      // AUTH CHECK: If searching by quotNo and user is a restricted BD (isBdFilterLocked)
      if (filters.quotNo && isBdFilterLocked && data.length > 0) {
          // Find the name of the currently logged in BD based on the bdCode prop
          const currentBdOption = bdOptions.find(opt => opt.value === String(bdCode));
          const authorizedName = currentBdOption ? currentBdOption.label : username;
          
          // Get the name of the person who owns the quotation
          const quotOwner = data[0].bdName;

          // Compare safely (case insensitive)
          if (quotOwner && authorizedName && quotOwner.trim().toLowerCase() !== authorizedName.trim().toLowerCase()) {
              setIsUnauthorized(true);
              setQuotations([]);
              setIsLoading(false);
              return;
          }
      }

      setQuotations(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setQuotations([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, bdOptions, isBdFilterLocked, bdCode, username]);

  useEffect(() => {
    // Only fetch quotations once BD options have been loaded/initialized
    if (!isFetchingBDs) {
      fetchQuotations();
    }
  }, [fetchQuotations, isFetchingBDs]);

  const handleStatusToggle = async (quotNo, closeYn) => {
    setUpdatingQuots((prev) => new Set(prev).add(quotNo));
    try {
      // API call to update the status
      // If closeYn is 'Y', it becomes Inactive. If it's null, it becomes Active.
      await updateQuotationStatus(quotNo, closeYn);
      
      const newStatus = closeYn === "Y" ? "Inactive" : "Active";

      setQuotations((prev) =>
        prev.map((quot) =>
          quot.quotNo === quotNo
            ? { ...quot, status: newStatus }
            : quot
        )
      );
    } catch (error) {
      console.error("Failed to update quotation status:", error);
    } finally {
      setUpdatingQuots((prev) => {
        const newSet = new Set(prev);
        newSet.delete(quotNo);
        return newSet;
      });
    }
  };

  // Handle search
  const handleSearch = (quotNo) => {
    // When searching by quotNo, keep BD filters as is or locked, but reset date/age filters
    setFilters((prev) => ({
      ...prev,
      quotNo,
      filterType: "date",
      fromDate: new Date().toISOString().split("T")[0],
      toDate: new Date().toISOString().split("T")[0],
      ageFilter: "all",
      // BD filters remain set by bdCode or the user's last selection
    }));
  };
  
  const handleClearFilters = () => {
      setIsUnauthorized(false);
  }

  // Pagination logic
  const totalPages = Math.ceil(quotations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = quotations.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalQuots = quotations.length;
    const activeQuots = quotations.filter((q) => q.status === "Active").length;
    const totalValue = quotations.reduce((sum, q) => sum + q.quotValAfterDis, 0);
    const avgAge = totalQuots > 0
      ? Math.round(quotations.reduce((sum, q) => sum + q.quotAgeing, 0) / totalQuots)
      : 0;

    return { totalQuots, activeQuots, totalValue, avgAge };
  }, [quotations]);

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl shadow-2xl mb-8 bg-white border border-gray-200"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 opacity-95"></div>
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
          <div className="relative p-6 sm:p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-3 rounded-xl bg-white/10 backdrop-blur-sm shadow-lg"
              >
                <FileText className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Pending Quotations
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Manage and track pending quotation status
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right flex-shrink-0">
              <div className="text-white">
                <p className="text-lg font-semibold leading-snug">{displayedUsername}</p>
                <p className="text-blue-200 text-xs font-medium leading-snug">{designation}</p>
              </div>
              <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            bdOptions={bdOptions}
            onSearch={handleSearch}
            isBdFilterLocked={isBdFilterLocked} // Pass the lock status
            onClear={handleClearFilters}
          />
        </motion.div>

        {isLoading || isFetchingBDs ? (
          <LoadingView />
        ) : isUnauthorized ? (
          // Show Unauthorized View if check fails
          <UnauthorizedView quotNo={filters.quotNo} />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SummaryCard
                title="Total Quotations"
                value={summary.totalQuots}
                icon={FileText}
                color="blue"
                subtext="All pending quotations"
              />
              <SummaryCard
                title="Active Quotations"
                value={summary.activeQuots}
                icon={CheckCircle}
                color="green"
                subtext={`${summary.totalQuots - summary.activeQuots} inactive`}
              />
              <SummaryCard
                title="Total Value"
                value={formatAmount(summary.totalValue)}
                icon={HiCurrencyRupee}
                color="red"
                subtext="Combined quotation value"
              />
              <SummaryCard
                title="Average Age"
                value={`${summary.avgAge} days`}
                icon={Clock}
                color="orange"
                subtext="Average quotation age"
              />
            </div>

            {/* Table Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Quotation Details
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({quotations.length} total)
                </span>
              </h2>
            </motion.div>

            {/* Pagination - Top */}
            {totalPages > 1 && (
              <div className="mb-6">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  goToPage={goToPage}
                  getPageNumbers={getPageNumbers}
                />
              </div>
            )}

            {/* Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <QuotationsTable
                data={paginatedData}
                onStatusToggle={handleStatusToggle}
                updatingQuots={updatingQuots}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
              />
            </motion.div>

            {/* Pagination - Bottom */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  goToPage={goToPage}
                  getPageNumbers={getPageNumbers}
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}