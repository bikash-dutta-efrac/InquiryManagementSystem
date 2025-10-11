import { useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronDown,
  Calendar,
  Briefcase,
  Building2,
  Telescope,
  ListChecks,
  X,
  RefreshCcw,
  Search,
  FlaskConical,
} from "lucide-react";
import {
  getBdNames,
  getClientNames,
  getVerticals,
  getLabNames,
} from "../services/api.js";

// Mapping from UI status names to SQL parameter keys - REMOVED

const CustomSelect = ({
  options,
  selected,
  onToggle,
  onSearchChange,
  searchTerm,
  label,
  icon,
  isExcluded = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleToggle = (option) => {
    onToggle(option);
  };

  const isSelected = (option) => selected.includes(option);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        // 🚨 ADDED HEIGHT FOR ALIGNMENT: h-[54px] to align with date/month inputs
        className="w-full flex justify-between items-center bg-white border border-gray-200 rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-shadow cursor-pointer h-[54px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-gray-500">{label}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg animate-fade-in-down max-h-64 overflow-y-auto">
          <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="relative">
              <input
                type="text"
                className="w-full p-2 pl-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <ul className="py-1">
            {options.length > 0 ? (
              options.map((option) => (
                <li
                  key={option}
                  className="py-2 px-4 cursor-pointer text-sm font-medium hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleToggle(option)}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        isSelected(option)
                          ? isExcluded
                            ? "font-bold text-red-600"
                            : "font-bold text-blue-600"
                          : "text-gray-800"
                      }
                    >
                      {option}
                    </span>
                    {isSelected(option) && (
                      <X className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="py-2 px-4 text-sm text-gray-500 text-center">
                No options found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const ExcludeToggle = ({ enabled, onChange }) => {
  const handleClick = () => {
    const nextVal = !enabled;
    onChange(nextVal);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={enabled}
      className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-500 transform-gpu ${
        enabled ? "bg-red-500" : "bg-blue-500"
      } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        enabled ? "focus:ring-red-500" : "focus:ring-blue-500"
      }`}
    >
      <span className="sr-only">Toggle include/exclude</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
      <span
        className={`absolute right-2 text-white text-[10px] font-bold transition-opacity duration-300 ${
          enabled ? "opacity-100" : "opacity-0"
        }`}
      >
        EX
      </span>
      <span
        className={`absolute left-2 text-white text-[10px] font-bold transition-opacity duration-300 ${
          enabled ? "opacity-0" : "opacity-100"
        }`}
      >
        IN
      </span>
    </button>
  );
};

export default function Filters({
  data = [],
  onChange,
  onResetAll,
  disabled,
  queryType,
}) {
  const today = new Date();

  const defaultRange = {
    start: today.toISOString().split("T")[0],
    end: today.toISOString().split("T")[0],
  };
  const defaultMonth = (today.getMonth() + 1).toString();
  const defaultYear = today.getFullYear().toString();

  const [filterType, setFilterType] = useState("range");
  const [range, setRange] = useState(defaultRange);
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [verticals, setVerticals] = useState([]);
  const [bdNames, setBdNames] = useState([]);
  const [clientNames, setClientNames] = useState([]);
  const [labStatusFilter, setLabStatusFilter] = useState(null); 
  const [sortOrder, setSortOrder] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [dateField, setDateField] = useState("inqDate");
  const [labNames, setLabNames] = useState([]);

  // exclude toggles
  const [excludeVerticals, setExcludeVerticals] = useState(false);
  const [excludeBds, setExcludeBds] = useState(false);
  const [excludeClients, setExcludeClients] = useState(false);
  const [excludeLabs, setExcludeLabs] = useState(false);

  // Search terms
  const [verticalSearchTerm, setVerticalSearchTerm] = useState("");
  const [bdSearchTerm, setBdSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [labSearchTerm, setLabSearchTerm] = useState("");

  // Options
  const [verticalOptions, setVerticalOptions] = useState([]);
  const [bdOptions, setBdOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [labOptions, setLabOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const statusOptions = ["All", "Pending", "Released"]; 

  // Flag for conditional rendering
  const isLabAnalysisView = queryType === "labAnalysis";

  // -------------------------------------------------------------
  // HELPER: Maps the UI status name to the SQL reviewsBy string
  // -------------------------------------------------------------
  const mapStatusToReviewsBy = (statusName) => {
    switch (statusName) {
      case "Pending":
        return "pending";
      case "Released":
        return "released";
      case "All":
      default:
        return null;
    }
  };


  const buildSearchRequest = (nextState = {}) => {
    const nextLabStatusFilter = nextState.labStatusFilter ?? labStatusFilter; 

    const base = {
      dateField: nextState.dateField ?? dateField,
      bdNames: isLabAnalysisView ? [] : nextState.bdNames ?? bdNames,
      clientNames: isLabAnalysisView
        ? []
        : nextState.clientNames ?? clientNames,
      verticals: isLabAnalysisView ? [] : nextState.verticals ?? verticals,
      labNames: !isLabAnalysisView ? [] : nextState.labNames ?? labNames,
      excludeBds: isLabAnalysisView
        ? false
        : nextState.excludeBds ?? excludeBds,
      excludeClients: isLabAnalysisView
        ? false
        : nextState.excludeClients ?? excludeClients,
      excludeVerticals: isLabAnalysisView
        ? false
        : nextState.excludeVerticals ?? excludeVerticals,
      excludeLabs: !isLabAnalysisView
        ? false
        : nextState.excludeLabs ?? excludeLabs,

      reviewsBy: isLabAnalysisView ? mapStatusToReviewsBy(nextLabStatusFilter) : null,
    };

    const nextFilterType = nextState.filterType ?? filterType;
    if (nextFilterType === "range") {
      const nextRange = nextState.range ?? range;
      if (nextRange.start && nextRange.end) {
        return {
          ...base,
          filterType: "range",
          fromDate: nextRange.start,
          toDate: nextRange.end,
        };
      }
    }

    if (nextFilterType === "month") {
      const nextMonth = nextState.month ?? month;
      const nextYear = nextState.year ?? year;
      const req = { ...base, filterType: "month", year: Number(nextYear) };
      if (nextMonth) req.month = Number(nextMonth);
      return req;
    }

    return base;
  };

  // emit helper -> notify parent
  const emit = (next = {}) => {
    const nextLabStatusFilter = next.labStatusFilter ?? labStatusFilter;
    const isLab = next.queryType === "labAnalysis" || isLabAnalysisView;

    const payload = {
      filterType,
      range,
      month,
      year,
      verticals: isLab ? [] : verticals,
      bdNames: isLab ? [] : bdNames,
      clientNames: isLab ? [] : clientNames,
      labNames: isLab ? labNames : [],
      labStatusFilter: nextLabStatusFilter,
      sortOrder,
      dateField,
      excludeVerticals: isLab ? false : excludeVerticals,
      excludeBds: isLab ? false : excludeBds,
      excludeClients: isLab ? false : excludeClients,
      excludeLabs: isLab ? excludeLabs : false,
      reviewsBy: isLab ? mapStatusToReviewsBy(nextLabStatusFilter) : null,
      ...next,
    };
    onChange?.(payload);
  };

  const handleSort = (order) => {
    setSortOrder(order);
    setSortOpen(false);
    emit({ sortOrder: order });
  };

  // Reset logic
  const handleReset = () => {
    setFilterType("range");
    setRange(defaultRange);
    setMonth(defaultMonth);
    setYear(defaultYear);
    setVerticals([]);
    setBdNames([]);
    setClientNames([]);
    setLabStatusFilter(null); 
    setSortOrder("newest");
    setDateField("inqDate");
    setExcludeVerticals(false);
    setExcludeBds(false);
    setExcludeClients(false);
    setLabNames([]);
    onResetAll?.();
    emit({
      filterType: "range",
      range: defaultRange,
      month: defaultMonth,
      year: defaultYear,
      bdNames: [],
      clientNames: [],
      verticals: [],
      labStatusFilter: null, 
      sortOrder: "newest",
      dateField: "inqDate",
      excludeVerticals: false,
      excludeBds: false,
      excludeClients: false,
      labNames: [],
    });
  };

  // 🔹 Debounced fetch utility
  const useDebouncedEffect = (effect, deps, delay) => {
    useEffect(() => {
      const handler = setTimeout(() => effect(), delay);
      return () => clearTimeout(handler);
    }, [...deps, delay]);
  };

  // The dependency list for fetching options.
  const optionsDeps = [
    filterType,
    range.start,
    range.end,
    month,
    year,
    dateField,
    excludeBds,
    excludeClients,
    excludeVerticals,
    excludeLabs,
    isLabAnalysisView,
    labStatusFilter, 
  ];

  // Fetch verticals (Conditionally disabled for Lab Analysis view)
  useDebouncedEffect(
    () => {
      if (isLabAnalysisView) {
        setVerticalOptions([]);
        return;
      }
      const controller = new AbortController();
      const fetchVerticals = async () => {
        setLoadingOptions(true);
        try {
          const body = buildSearchRequest();
          const options = await getVerticals(body, {
            signal: controller.signal,
          });
          setVerticalOptions(Array.isArray(options) ? options : []);
        } catch (e) {
          if (e.name !== "AbortError")
            console.error("Failed to fetch verticals: ", e);
          setVerticalOptions([]);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchVerticals();
      return () => controller.abort();
    },
    optionsDeps,
    400
  );

  // Fetch BD names (Conditionally disabled for Lab Analysis view)
  useDebouncedEffect(
    () => {
      if (isLabAnalysisView) {
        setBdOptions([]);
        return;
      }
      const controller = new AbortController();
      const fetchBDs = async () => {
        setLoadingOptions(true);
        try {
          const body = buildSearchRequest();
          const options = await getBdNames(body, { signal: controller.signal });
          setBdOptions(Array.isArray(options) ? options : []);
        } catch (e) {
          if (e.name !== "AbortError")
            console.error("Failed to fetch BD names", e);
          setBdOptions([]);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchBDs();
      return () => controller.abort();
    },
    optionsDeps,
    400
  );

  // Fetch Client names (Conditionally disabled for Lab Analysis view)
  useDebouncedEffect(
    () => {
      if (isLabAnalysisView) {
        setClientOptions([]);
        return;
      }
      const controller = new AbortController();
      const fetchClients = async () => {
        setLoadingOptions(true);
        try {
          const body = buildSearchRequest();
          const options = await getClientNames(body, {
            signal: controller.signal,
          });
          setClientOptions(Array.isArray(options) ? options : []);
        } catch (e) {
          if (e.name !== "AbortError")
            console.error("Failed to fetch Client names", e);
          setClientOptions([]);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchClients();
      return () => controller.abort();
    },
    optionsDeps,
    400
  );

  // Fetch Lab names (Conditionally enabled for Lab Analysis view)
  useDebouncedEffect(
    () => {
      if (!isLabAnalysisView) {
        setLabOptions([]);
        return;
      }
      const controller = new AbortController();
      const fetchLabNames = async () => {
        setLoadingOptions(true);
        try {
          const body = buildSearchRequest();
          const options = await getLabNames(body, {
            signal: controller.signal,
          });
          setLabOptions(Array.isArray(options) ? options : []);
        } catch (e) {
          if (e.name !== "AbortError")
            console.error("Failed to fetch lab names: ", e);
          setLabOptions([]);
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchLabNames();
      return () => controller.abort();
    },
    optionsDeps,
    400
  );

  // Filtered options for custom selects
  const filteredVerticalOptions = verticalOptions.filter((v) =>
    v.toLowerCase().includes(verticalSearchTerm.toLowerCase())
  );
  const filteredBdOptions = bdOptions.filter((bd) =>
    bd.toLowerCase().includes(bdSearchTerm.toLowerCase())
  );
  const filteredClientOptions = clientOptions.filter((c) =>
    c.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );
  const filteredLabOptions = labOptions.filter((c) =>
    c.toLowerCase().includes(labSearchTerm.toLowerCase())
  );
  
  return (
    <>
      <style>{style}</style>
      <fieldset
        disabled={disabled}
        className={`relative transition-all duration-300 font-inter space-y-4 mb-8 ${ 
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        
        {/* ========================================================= */}
        {/* CARD 1 (TOP ROW): Time Range, Sort, and Reset */}
        {/* ========================================================= */}
        <div className="bg-gray-50 shadow-2xl rounded-3xl p-6 border border-gray-200">
          
          {/* Main flex container for Card 1: Toggles/Inputs on Left, Actions on Right */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Left side: Toggles and Inputs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                {/* Filter Type Tabs (Date Range / Month & Year) - Always visible */}
                <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-inner border border-gray-200 flex-shrink-0">
                    {["range", "month"].map((ft) => (
                    <button
                        key={ft}
                        onClick={() => {
                        setFilterType(ft);
                        emit({ filterType: ft });
                        }}
                        className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-100 ${
                        filterType === ft
                            ? "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white shadow-gradient-blue animate-tab-pulse"
                            : "bg-white text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                        }`}
                    >
                        {ft === "range" ? "Date Range" : "Month & Year"}
                    </button>
                    ))}
                </div>

                {/* Date/Month/Year Selectors - Horizontal alignment */}
                <div className={`flex gap-4 w-full ${filterType === 'range' ? 'max-w-xs' : 'max-w-sm'}`}>
                    {/* Date Range */}
                    {filterType === "range" && (
                        <>
                            <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm p-3 hover:shadow-md transition-shadow">
                                <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                <input
                                type="date"
                                value={range.start}
                                onChange={(e) => {
                                    const next = { ...range, start: e.target.value };
                                    setRange(next);
                                    emit({ range: next });
                                }}
                                className="bg-transparent outline-none text-sm w-full text-gray-800 font-medium"
                                placeholder="Start Date"
                                />
                            </div>

                            <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm p-3 hover:shadow-md transition-shadow">
                                <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                <input
                                type="date"
                                value={range.end}
                                onChange={(e) => {
                                    const next = { ...range, end: e.target.value };
                                    setRange(next);
                                    emit({ range: next });
                                }}
                                className="bg-transparent outline-none text-sm w-full text-gray-800 font-medium"
                                placeholder="End Date"
                                />
                            </div>
                        </>
                    )}

                    {/* Month & Year */}
                    {filterType === "month" && (
                        <>
                            <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm p-3 hover:shadow-md transition-shadow">
                                <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                <select
                                value={month}
                                onChange={(e) => {
                                    setMonth(e.target.value);
                                    emit({ month: e.target.value });
                                }}
                                className="bg-transparent outline-none text-sm w-full text-gray-800 font-medium appearance-none"
                                >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString("default", {
                                        month: "long",
                                    })}
                                    </option>
                                ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-500 ml-auto pointer-events-none" />
                            </div>

                            <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm p-3 hover:shadow-md transition-shadow">
                                <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                <input
                                type="number"
                                placeholder="Year"
                                value={year}
                                onChange={(e) => {
                                    const currentYear = new Date().getFullYear();
                                    const val = e.target.value;
                                    if (val <= currentYear) {
                                    setYear(val);
                                    emit({ year: val });
                                    }
                                }}
                                className="bg-transparent outline-none text-sm w-full text-gray-800 font-medium"
                                max={new Date().getFullYear()}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>


            {/* Right side: Sort and Reset Buttons */}
            <div className="flex items-center gap-4 flex-shrink-0">
                {/* Sort Dropdown - ONLY visible when NOT in Lab Analysis view */}
                {!isLabAnalysisView && (
                <div className="relative">
                    <button
                    onClick={() => setSortOpen(!sortOpen)}
                    // 🚨 ALIGNMENT FIX: Used h-10 (40px) to match the other inputs/buttons
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-2xl shadow-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 h-[54px]"
                    >
                    {sortOrder === "newest" ? (
                        <ArrowDownWideNarrow className="w-5 h-5 text-blue-500" />
                    ) : (
                        <ArrowUpWideNarrow className="w-5 h-5 text-blue-500" />
                    )}
                    <span className="text-sm font-medium">
                        {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        sortOpen ? "rotate-180" : ""
                        }`}
                    />
                    </button>

                    {sortOpen && (
                    <div className="absolute mt-2 right-0 bg-white border border-gray-200 shadow-xl rounded-xl w-40 overflow-hidden z-20 animate-fade-in-up">
                        <button
                        onClick={() => handleSort("newest")}
                        className={`flex items-center gap-2 px-4 py-2 w-full text-left transition-colors duration-150 ${
                            sortOrder === "newest"
                            ? "bg-blue-50 font-semibold text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        >
                        <ArrowDownWideNarrow className="w-4 h-4" /> Newest First
                        </button>
                        <button
                        onClick={() => handleSort("oldest")}
                        className={`flex items-center gap-2 px-4 py-2 w-full text-left transition-colors duration-150 ${
                            sortOrder === "oldest"
                            ? "bg-blue-50 font-semibold text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        >
                        <ArrowUpWideNarrow className="w-4 h-4" /> Oldest First
                        </button>
                    </div>
                    )}
                </div>
                )}

                {/* Reset */}
                <button
                    onClick={handleReset}
                    // 🚨 ALIGNMENT FIX: Used h-10 (40px) to match the other inputs/buttons
                    className="flex items-center gap-2 text-sm px-4 py-2 bg-gray-800 text-white rounded-2xl shadow-lg hover:bg-gray-700 transition-colors duration-200 transform hover:scale-105 h-[54px]"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Reset
                </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 2 (BOTTOM ROW): Specific Filters (Verticals/BDs/Clients OR Labs/Status) */}
        {/* ========================================================= */}
        <div className="bg-gray-50 shadow-2xl rounded-3xl p-6 border border-gray-200">
          <div
            // 🚨 UPDATED GRID: Use `grid-cols-3` for general view and `grid-cols-4` for lab view 
            // to evenly distribute filters across the full width.
            className={`grid grid-cols-1 md:grid-cols-2 ${
              isLabAnalysisView ? "lg:grid-cols-4" : "lg:grid-cols-3"
            } gap-4`}
          >

            {/* Labs and Status Filter - Only for Lab Analysis View */}
            {isLabAnalysisView && (
              <>
                {/* Labs (Col 1/4) - Full Width */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                      <span>Labs</span>
                      {loadingOptions && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </span>
                    <ExcludeToggle
                      enabled={excludeLabs}
                      onChange={(val) => {
                        setExcludeLabs(val);
                        emit({ excludeLabs: val });
                      }}
                    />
                  </div>
                  <CustomSelect
                    label={`${
                      labNames.length === 0
                        ? "Select Labs"
                        : `${labNames.length} selected`
                    }`}
                    icon={<FlaskConical className="w-4 h-4 text-gray-400" />}
                    options={filteredLabOptions}
                    selected={labNames}
                    onToggle={(option) => {
                      const updated = labNames.includes(option)
                        ? labNames.filter((n) => n !== option)
                        : [...labNames, option];
                      setLabNames(updated);
                      emit({ labNames: updated });
                    }}
                    searchTerm={labSearchTerm}
                    onSearchChange={setLabSearchTerm}
                    isExcluded={excludeLabs}
                  />
                </div>

                {/* Single-Select Status Filter (Col 2/4) - Full Width */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2 h-6">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-gray-400" />
                      <span>Status Filter</span>
                    </span>
                  </div>
                  {/* 🚨 ALIGNMENT FIX: Used h-[54px] to match CustomSelect height */}
                  <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-inner border border-gray-200 h-[54px]">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setLabStatusFilter(mapStatusToReviewsBy(status));
                          emit({ labStatusFilter: mapStatusToReviewsBy(status) });
                        }}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-100 ${
                          labStatusFilter === mapStatusToReviewsBy(status)
                            ? "bg-blue-500 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Empty columns to fill remaining width (Col 3/4, Col 4/4) */}
                <div className="lg:col-span-2 hidden lg:block"></div> 
              </>
            )}

            {/* Verticals, BD Names, Client Names - ONLY for Non-Lab Analysis View */}
            {!isLabAnalysisView && (
              <>
                {/* Verticals (Col 1/3) - Full Width */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                      <span>Verticals</span>
                      {loadingOptions && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </span>
                    <ExcludeToggle
                      enabled={excludeVerticals}
                      onChange={(val) => {
                        setExcludeVerticals(val);
                        emit({ excludeVerticals: val });
                      }}
                    />
                  </div>
                  <CustomSelect
                    label={`${
                      verticals.length === 0
                        ? "Select Verticals"
                        : `${verticals.length} selected`
                    }`}
                    icon={<Telescope className="w-4 h-4 text-gray-400" />}
                    options={filteredVerticalOptions}
                    selected={verticals}
                    onToggle={(option) => {
                      const updated = verticals.includes(option)
                        ? verticals.filter((n) => n !== option)
                        : [...verticals, option];
                      setVerticals(updated);
                      emit({ verticals: updated });
                    }}
                    searchTerm={verticalSearchTerm}
                    onSearchChange={setVerticalSearchTerm}
                    isExcluded={excludeVerticals}
                  />
                </div>

                {/* BD Names (Col 2/3) - Full Width */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                      <span>BD Names</span>
                      {loadingOptions && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </span>
                    <ExcludeToggle
                      enabled={excludeBds}
                      onChange={(val) => {
                        setExcludeBds(val);
                        emit({ excludeBds: val });
                      }}
                    />
                  </div>
                  <CustomSelect
                    label={`${
                      bdNames.length === 0
                        ? "Select BDs"
                        : `${bdNames.length} selected`
                    }`}
                    icon={<Briefcase className="w-4 h-4 text-gray-400" />}
                    options={filteredBdOptions}
                    selected={bdNames}
                    onToggle={(option) => {
                      const updated = bdNames.includes(option)
                        ? bdNames.filter((n) => n !== option)
                        : [...bdNames, option];
                      setBdNames(updated);
                      emit({ bdNames: updated });
                    }}
                    searchTerm={bdSearchTerm}
                    onSearchChange={setBdSearchTerm}
                    isExcluded={excludeBds}
                  />
                </div>

                {/* Client Names (Col 3/3) - Full Width */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                      <span>Client Names</span>
                      {loadingOptions && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </span>
                    <ExcludeToggle
                      enabled={excludeClients}
                      onChange={(val) => {
                        setExcludeClients(val);
                        emit({ excludeClients: val });
                      }}
                    />
                  </div>
                  <CustomSelect
                    label={`${
                      clientNames.length === 0
                        ? "Select Clients"
                        : `${clientNames.length} selected`
                    }`}
                    icon={<Building2 className="w-4 h-4 text-gray-400" />}
                    options={filteredClientOptions}
                    selected={clientNames}
                    onToggle={(option) => {
                      const updated = clientNames.includes(option)
                        ? clientNames.filter((n) => n !== option)
                        : [...clientNames, option];
                      setClientNames(updated);
                      emit({ clientNames: updated });
                    }}
                    searchTerm={clientSearchTerm}
                    onSearchChange={setClientSearchTerm}
                    isExcluded={excludeClients}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </fieldset>
    </>
  );
}

// CSS for animations and custom styles
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  .animate-tab-pulse {
    animation: tab-pulse 0.6s cubic-bezier(0.4, 0, 0.6, 1);
  }

  @keyframes tab-pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
      box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.1);
    }
  }

  .shadow-gradient-blue {
    box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.3);
  }
`;