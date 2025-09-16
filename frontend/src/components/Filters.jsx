import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronDown,
  Calendar,
  Users,
  User,
  ZapIcon,
  X,
} from "lucide-react";
import { getBDNames, getClientNames, getVerticals } from "../services/api.js";

export default function Filters({
  data = [],
  onChange,
  onResetAll,
  disabled,
  queryType, // New prop to receive the active view from App
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
  const [sortOrder, setSortOrder] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  // dateField is no longer needed as local state, it's a prop now

  const [excludeVerticals, setExcludeVerticals] = useState(false);
  const [excludeBds, setExcludeBds] = useState(false);
  const [excludeClients, setExcludeClients] = useState(false);

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
          new Date(inq[queryType]) >= startDate &&
          new Date(inq[queryType]) <= endDate
      );
    }

    if (filterType === "month" && month && year) {
      list = list.filter((inq) => {
        const d = new Date(inq[queryType]);
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
    queryType,
    excludeBds,
    excludeClients,
    excludeVerticals,
  ]);

  const buildSearchRequest = () => {
    const base = { dateField: queryType }; // Use prop instead of state

    if (filterType === "range" && range.start && range.end) {
      return { ...base, fromDate: range.start, toDate: range.end };
    }

    if (filterType === "month" && year) {
      const req = { ...base, year: Number(year) };
      if (month) req.month = Number(month);
      return req;
    }

    return base;
  };

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
      dateField: queryType,
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

  const ExcludeToggle = ({ name, enabled, onChange }) => {
    const handleClick = () => {
      onChange(!enabled);
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={enabled}
        className={`ml-auto text-[10px] px-1 py-0.5 rounded-full border transition flex items-center gap-2 ${
          enabled
            ? "bg-red-500 text-white border-red-500"
            : "bg-blue-500 text-white border-blue-500"
        }`}
      >
        <span className="px-1">{enabled ? "Exclude" : "Include"}</span>
      </button>
    );
  };

  useEffect(() => {
    let cancelled = false;
    const fetchVerticals = async () => {
      setLoadingOptions(true);
      try {
        const body = {
          ...buildSearchRequest(),
          bdNames,
          clientNames,
          excludeBds,
          excludeClients,
          excludeVerticals,
        };
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
    queryType,
    bdNames,
    clientNames,
    excludeBds,
    excludeClients,
    excludeVerticals,
  ]);

  useEffect(() => {
    let cancelled = false;
    const fetchBDs = async () => {
      setLoadingOptions(true);
      try {
        const body = {
          ...buildSearchRequest(),
          clientNames,
          verticals,
          excludeBds,
          excludeClients,
          excludeVerticals,
        };
        const options = await getBDNames(body);
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
    queryType,
    clientNames,
    verticals,
    excludeBds,
    excludeClients,
    excludeVerticals,
  ]);

  useEffect(() => {
    let cancelled = false;
    const fetchClients = async () => {
      setLoadingOptions(true);
      try {
        const body = {
          ...buildSearchRequest(),
          bdNames,
          verticals,
          excludeBds,
          excludeClients,
          excludeVerticals,
        };
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
    queryType,
    bdNames,
    verticals,
    excludeBds,
    excludeClients,
    excludeVerticals,
  ]);

  return (
    <fieldset
      disabled={disabled}
      className={`relative rounded-3xl p-6 mb-8 border border-slate-200 transition bg-gradient-to-br from-white via-white to-blue-50 ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100/70 shadow-inner">
          {["range", "month"].map((ft) => (
            <button
              key={ft}
              onClick={() => {
                setFilterType(ft);
                emit({ filterType: ft });
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                filterType === ft
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-300"
                  : "bg-transparent text-gray-600 hover:bg-white/50"
              }`}
            >
              {ft === "range" ? "Date Range" : "Month & Year"}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            {sortOrder === "newest" ? (
              <ArrowDownWideNarrow className="w-5 h-5 text-gray-500" />
            ) : (
              <ArrowUpWideNarrow className="w-5 h-5 text-gray-500" />
            )}
            <span className="text-sm font-medium">
              {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {sortOpen && (
            <div className="absolute mt-2 right-0 bg-white border border-gray-200 shadow-xl rounded-xl w-40 overflow-hidden z-20 animate-fade-in-up">
              <button
                onClick={() => handleSort("newest")}
                className={`flex items-center gap-2 px-4 py-2 w-full text-left transition-colors duration-200 ${
                  sortOrder === "newest"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <ArrowDownWideNarrow className="w-4 h-4" /> Newest First
              </button>
              <button
                onClick={() => handleSort("oldest")}
                className={`flex items-center gap-2 px-4 py-2 w-full text-left transition-colors duration-200 ${
                  sortOrder === "oldest"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <ArrowUpWideNarrow className="w-4 h-4" /> Oldest First
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setRange(defaultRange);
            setMonth(defaultMonth);
            setYear(defaultYear);
            setVerticals([]);
            setBdNames([]);
            setClientNames([]);
            setSortOrder("newest");
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
              excludeVerticals: false,
              excludeBds: false,
              excludeClients: false,
            });
          }}
          className="text-sm px-4 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-700 transition-colors duration-200"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {filterType === "range" && (
          <>
            <div className="flex flex-col bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-3">
              <label className="text-xs font-medium text-gray-500 mb-1">
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
                  className="bg-transparent outline-none text-sm w-full font-medium text-gray-800"
                />
              </div>
            </div>

            <div className="flex flex-col bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-3">
              <label className="text-xs font-medium text-gray-500 mb-1">
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
                  className="bg-transparent outline-none text-sm w-full font-medium text-gray-800"
                />
              </div>
            </div>
          </>
        )}

        {filterType === "month" && (
          <>
            <div className="flex flex-col bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-3">
              <label className="text-xs font-medium text-gray-500 mb-1">Month</label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <select
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value);
                    emit({ month: e.target.value });
                  }}
                  className="bg-transparent outline-none text-sm w-full font-medium text-gray-800"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-3">
              <label className="text-xs font-medium text-gray-500 mb-1">Year</label>
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
                  className="bg-transparent outline-none text-sm w-full font-medium text-gray-800"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-3">
          <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-2">
            <ZapIcon className="w-4 h-4" />
            <span className="text-gray-800 font-semibold">Verticals</span>
            {loadingOptions && (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            )}
            <ExcludeToggle
              enabled={excludeVerticals}
              onChange={(val) => {
                setExcludeVerticals(val);
                emit({ excludeVerticals: val });
              }}
            />
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {verticals.map((name) => (
              <span
                key={name}
                className={`text-[11px] px-2 py-0.5 rounded-full border font-medium transition flex items-center gap-2 ${
                  excludeVerticals
                    ? "bg-red-100 text-red-700 border-red-700 hover:bg-red-50"
                    : "bg-blue-100 text-blue-700 border-blue-700 hover:bg-blue-50"
                }`}
              >
                {name}
                <button
                  onClick={() => {
                    const updated = verticals.filter((n) => n !== name);
                    setVerticals(updated);
                    emit({ verticals: updated });
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="relative flex-1">
              <select
                onChange={(e) => {
                  const value = e.target.value;
                  if (value && !verticals.includes(value)) {
                    const updated = [...verticals, value];
                    setVerticals(updated);
                    emit({ verticals: updated });
                  }
                  e.target.value = "";
                }}
                className="appearance-none bg-transparent text-sm outline-none w-full pr-6 cursor-pointer text-gray-600"
              >
                <option value="">Select Verticals</option>
                {verticalOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-3">
          <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-gray-800 font-semibold">BD Names</span>
            {loadingOptions && (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            )}
            <ExcludeToggle
              enabled={excludeBds}
              onChange={(val) => {
                setExcludeBds(val);
                emit({ excludeBds: val });
              }}
            />
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {bdNames.map((name) => (
              <span
                key={name}
                className={`text-[11px] px-2 py-0.5 rounded-full border font-medium transition flex items-center gap-2 ${
                  excludeBds
                    ? "bg-red-100 text-red-700 border-red-700 hover:bg-red-50"
                    : "bg-blue-100 text-blue-700 border-blue-700 hover:bg-blue-50"
                }`}
              >
                {name}
                <button
                  onClick={() => {
                    const updated = bdNames.filter((n) => n !== name);
                    setBdNames(updated);
                    emit({ bdNames: updated });
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="relative flex-1">
              <select
                onChange={(e) => {
                  const value = e.target.value;
                  if (value && !bdNames.includes(value)) {
                    const updated = [...bdNames, value];
                    setBdNames(updated);
                    emit({ bdNames: updated });
                  }
                  e.target.value = "";
                }}
                className="appearance-none bg-transparent text-sm outline-none w-full pr-6 cursor-pointer text-gray-600"
              >
                <option value="">Select BD</option>
                {bdOptions.map((bd) => (
                  <option key={bd} value={bd}>
                    {bd}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-3">
          <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="text-gray-800 font-semibold">Client Names</span>
            {loadingOptions && (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            )}
            <ExcludeToggle
              enabled={excludeClients}
              onChange={(val) => {
                setExcludeClients(val);
                emit({ excludeClients: val });
              }}
            />
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {clientNames.map((c) => (
              <span
                key={c}
                className={`text-[11px] px-2 py-0.5 rounded-full border font-medium transition flex items-center gap-2 ${
                  excludeClients
                    ? "bg-red-100 text-red-700 border-red-700 hover:bg-red-50"
                    : "bg-blue-100 text-blue-700 border-blue-700 hover:bg-blue-50"
                }`}
              >
                {c}
                <button
                  onClick={() => {
                    const updated = clientNames.filter((n) => n !== c);
                    setClientNames(updated);
                    emit({ clientNames: updated });
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="relative flex-1">
              <select
                onChange={(e) => {
                  const value = e.target.value;
                  if (value && !clientNames.includes(value)) {
                    const updated = [...clientNames, value];
                    setClientNames(updated);
                    emit({ clientNames: updated });
                  }
                  e.target.value = "";
                }}
                className="appearance-none bg-transparent text-sm outline-none w-full pr-6 cursor-pointer text-gray-600"
              >
                <option value="">Select Client</option>
                {clientOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  );
}