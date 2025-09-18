import { useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronDown,
  Calendar,
  Users,
  User,
  ZapIcon,
  X,
  RefreshCcw,
  Search,
} from "lucide-react";
import { getBdNames, getClientNames, getVerticals } from "../services/api.js";

// Pass the 'isExcluded' prop to CustomSelect
const CustomSelect = ({ options, selected, onToggle, onSearchChange, searchTerm, label, icon, isExcluded = false }) => {
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
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="w-full flex justify-between items-center bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-left hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-gray-500">{label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
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
                            ? 'font-bold text-red-600'
                            : 'font-bold text-blue-600'
                          : 'text-gray-800'
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
              <li className="py-2 px-4 text-sm text-gray-500 text-center">No options found</li>
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


export default function Filters({ data = [], onChange, onResetAll, disabled }) {
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
  const [sortOrder, setSortOrder] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [dateField, setDateField] = useState("inqDate");

  // exclude toggles
  const [excludeVerticals, setExcludeVerticals] = useState(false);
  const [excludeBds, setExcludeBds] = useState(false);
  const [excludeClients, setExcludeClients] = useState(false);

  // Search terms for custom selects
  const [verticalSearchTerm, setVerticalSearchTerm] = useState('');
  const [bdSearchTerm, setBdSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  // Options fetched from API
  const [verticalOptions, setVerticalOptions] = useState([]);
  const [bdOptions, setBdOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const filteredData = useMemo(() => {
    let list = [...data];

    if (filterType === "range" && range.start && range.end) {
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);
      list = list.filter(
        (inq) =>
          new Date(inq[dateField]) >= startDate &&
          new Date(inq[dateField]) <= endDate
      );
    }

    if (filterType === "month" && month && year) {
      list = list.filter((inq) => {
        const d = new Date(inq[dateField]);
        return (
          d.getMonth() + 1 === Number(month) && d.getFullYear() === Number(year)
        );
      });
    }

    if (bdNames.length > 0) {
      list = list.filter((inq) =>
        excludeBds
          ? !bdNames.includes(inq.bdName)
          : bdNames.includes(inq.bdName)
      );
    }

    if (clientNames.length > 0) {
      list = list.filter((inq) =>
        excludeClients
          ? !clientNames.includes(inq.clientName)
          : clientNames.includes(inq.clientName)
      );
    }

    if (verticals.length > 0) {
      list = list.filter((inq) =>
        excludeVerticals
          ? !verticals.includes(inq.vertical)
          : verticals.includes(inq.vertical)
      );
    }

    return list;
  }, [
    data,
    filterType,
    range,
    month,
    year,
    bdNames,
    clientNames,
    verticals,
    dateField,
    excludeBds,
    excludeClients,
    excludeVerticals,
  ]);

  const buildSearchRequest = (nextState = {}) => {
    const base = {
      dateField: nextState.dateField ?? dateField,
      bdNames: nextState.bdNames ?? bdNames,
      clientNames: nextState.clientNames ?? clientNames,
      verticals: nextState.verticals ?? verticals,
      excludeBds: nextState.excludeBds ?? excludeBds,
      excludeClients: nextState.excludeClients ?? excludeClients,
      excludeVerticals: nextState.excludeVerticals ?? excludeVerticals,
    };

    const nextFilterType = nextState.filterType ?? filterType;
    if (nextFilterType === "range") {
      const nextRange = nextState.range ?? range;
      if (nextRange.start && nextRange.end) {
        return { ...base, fromDate: nextRange.start, toDate: nextRange.end };
      }
    }

    if (nextFilterType === "month") {
      const nextMonth = nextState.month ?? month;
      const nextYear = nextState.year ?? year;
      const req = { ...base, year: Number(nextYear) };
      if (nextMonth) req.month = Number(nextMonth);
      return req;
    }

    return base;
  };

  // emit helper -> notify parent of current filter state
  const emit = (next = {}) => {
    const payload = {
      filterType,
      range,
      month,
      year,
      verticals,
      bdNames,
      clientNames,
      sortOrder,
      dateField,
      excludeVerticals,
      excludeBds,
      excludeClients,
      ...next,
    };
    onChange?.(payload);
  };

  const handleSort = (order) => {
    setSortOrder(order);
    setSortOpen(false);
    emit({ sortOrder: order });
  };

  // Fetch verticals
  useEffect(() => {
    let cancelled = false;
    const fetchVerticals = async () => {
      setLoadingOptions(true);
      try {
        const body = buildSearchRequest();
        const options = await getVerticals(body);
        if (!cancelled) {
          setVerticalOptions(Array.isArray(options) ? options : []);
        }
      } catch (e) {
        console.error("Failed to fetch verticals: ", e);
        if (!cancelled) setVerticalOptions([]);
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    };
    fetchVerticals();
    return () => {
      cancelled = true;
    };
  }, [
    filterType,
    range.start,
    range.end,
    month,
    year,
    dateField,
    bdNames,
    clientNames,
    excludeBds,
    excludeClients,
    excludeVerticals,
  ]);

  // Fetch BD names
  useEffect(() => {
    let cancelled = false;
    const fetchBDs = async () => {
      setLoadingOptions(true);
      try {
        const body = buildSearchRequest();
        const options = await getBdNames(body);
        if (!cancelled) {
          setBdOptions(Array.isArray(options) ? options : []);
        }
      } catch (e) {
        console.error("Failed to fetch BD names", e);
        if (!cancelled) setBdOptions([]);
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    };
    fetchBDs();
    return () => {
      cancelled = true;
    };
  }, [
    filterType,
    range.start,
    range.end,
    month,
    year,
    dateField,
    clientNames,
    verticals,
    excludeBds,
    excludeClients,
    excludeVerticals,
  ]);

  // Fetch Client names
  useEffect(() => {
    let cancelled = false;
    const fetchClients = async () => {
      setLoadingOptions(true);
      try {
        const body = buildSearchRequest();
        const options = await getClientNames(body);
        if (!cancelled) {
          setClientOptions(Array.isArray(options) ? options : []);
        }
      } catch (e) {
        console.error("Failed to fetch Client names", e);
        if (!cancelled) setClientOptions([]);
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    };
    fetchClients();
    return () => {
      cancelled = true;
    };
  }, [
    filterType,
    range.start,
    range.end,
    month,
    year,
    dateField,
    bdNames,
    verticals,
    excludeBds,
    excludeClients,
    excludeVerticals,
  ]);
  
  // Filtered options for custom select dropdowns
  const filteredVerticalOptions = verticalOptions.filter(v =>
    v.toLowerCase().includes(verticalSearchTerm.toLowerCase())
  );
  const filteredBdOptions = bdOptions.filter(bd =>
    bd.toLowerCase().includes(bdSearchTerm.toLowerCase())
  );
  const filteredClientOptions = clientOptions.filter(c =>
    c.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  return (
    <>
      <style>{style}</style>
      <fieldset
        disabled={disabled}
        className={`relative bg-gray-50 shadow-2xl rounded-3xl p-6 mb-8 border border-gray-200 transition-all duration-300 font-inter ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* Tabs Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Filter Type Tabs */}
          <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-inner border border-gray-200">
            {["range", "month"].map((ft) => (
              <button
                key={ft}
                onClick={() => {
                  setFilterType(ft);
                  emit({ filterType: ft });
                }}
                className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-100 ${
                  filterType === ft
                    ? "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white shadow-gradient-blue animate-tab-pulse"
                    : "bg-white text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
              >
                {ft === "range" ? "Date Range" : "Month & Year"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Date Field Tabs */}
            

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                {sortOrder === "newest" ? (
                  <ArrowDownWideNarrow className="w-5 h-5 text-blue-500" />
                ) : (
                  <ArrowUpWideNarrow className="w-5 h-5 text-blue-500" />
                )}
                <span className="text-sm font-medium">
                  {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
              </button>

              {sortOpen && (
                <div className="absolute mt-2 right-0 bg-white border border-gray-200 shadow-xl rounded-xl w-40 overflow-hidden z-20 animate-fade-in-up">
                  <button
                    onClick={() => handleSort("newest")}
                    className={`flex items-center gap-2 px-4 py-2 w-full text-left transition-colors duration-150 ${
                      sortOrder === "newest" ? "bg-blue-50 font-semibold text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ArrowDownWideNarrow className="w-4 h-4" /> Newest First
                  </button>
                  <button
                    onClick={() => handleSort("oldest")}
                    className={`flex items-center gap-2 px-4 py-2 w-full text-left transition-colors duration-150 ${
                      sortOrder === "oldest" ? "bg-blue-50 font-semibold text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <ArrowUpWideNarrow className="w-4 h-4" /> Oldest First
                  </button>
                </div>
              )}
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setRange(defaultRange);
                setMonth(defaultMonth);
                setYear(defaultYear);
                setVerticals([]);
                setBdNames([]);
                setClientNames([]);
                setSortOrder("newest");
                setDateField("inqDate");
                setExcludeVerticals(false);
                setExcludeBds(false);
                setExcludeClients(false);
                onResetAll?.();
                emit({
                  range: defaultRange,
                  month: defaultMonth,
                  year: defaultYear,
                  bdNames: [],
                  clientNames: [],
                  verticals: [],
                  sortOrder: "newest",
                  dateField: "inqDate",
                  excludeVerticals: false,
                  excludeBds: false,
                  excludeClients: false,
                });
              }}
              className="flex items-center gap-2 text-sm px-4 py-2 bg-gray-800 text-white rounded-xl shadow-lg hover:bg-gray-700 transition-colors duration-200 transform hover:scale-105"
            >
              <RefreshCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Filter Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range */}
          {filterType === "range" && (
            <>
              <div className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
                <label className="text-xs font-semibold text-gray-500 mb-2">
                  Start Date
                </label>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="date"
                    value={range.start}
                    onChange={(e) => {
                      const next = { ...range, start: e.target.value };
                      setRange(next);
                      emit({ range: next });
                    }}
                    className="bg-transparent outline-none text-sm w-full text-gray-800 font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
                <label className="text-xs font-semibold text-gray-500 mb-2">
                  End Date
                </label>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="date"
                    value={range.end}
                    onChange={(e) => {
                      const next = { ...range, end: e.target.value };
                      setRange(next);
                      emit({ range: next });
                    }}
                    className="bg-transparent outline-none text-sm w-full text-gray-800 font-medium"
                  />
                </div>
              </div>
            </>
          )}

          {/* Month & Year */}
          {filterType === "month" && (
            <>
              <div className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
                <label className="text-xs font-semibold text-gray-500 mb-2">Month</label>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
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
                        {new Date(0, i).toLocaleString("default", { month: "long" })}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 ml-auto pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
                <label className="text-xs font-semibold text-gray-500 mb-2">Year</label>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
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
              </div>
            </>
          )}

          {/* Verticals */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                <ZapIcon className="w-4 h-4 text-gray-400" />
                <span>Verticals</span>
                {loadingOptions && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
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
              label={`${verticals.length === 0 ? "Select Verticals" : `${verticals.length} selecected`}`}
              icon={<ZapIcon className="w-4 h-4 text-gray-400" />} 
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

          {/* BD Names */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>BD Names</span>
                {loadingOptions && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
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
              label={`${bdNames.length === 0 ? "Select BDs" : `${bdNames.length} selecected`}`}
              icon={<Users className="w-4 h-4 text-gray-400" />}
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

          {/* Client Names */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>Client Names</span>
                {loadingOptions && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
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
              label={`${clientNames.length === 0 ? "Select Clients" : `${clientNames.length} selecected`}`}
              icon={<User className="w-4 h-4 text-gray-400" />}
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



