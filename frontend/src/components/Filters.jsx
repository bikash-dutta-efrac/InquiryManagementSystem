import { useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronDown,
  Calendar,
  Users,
  User,
  X,
} from "lucide-react";

export default function Filters({ data = [], onChange, onResetAll, disabled }) {
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);

  const defaultRange = {
    start: lastMonth.toISOString().split("T")[0],
    end: today.toISOString().split("T")[0],
  };
  const defaultMonth = (today.getMonth() + 1).toString();
  const defaultYear = today.getFullYear().toString();

  const [filterType, setFilterType] = useState("month");
  const [range, setRange] = useState(defaultRange);
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [bdNames, setBdNames] = useState([]);
  const [clientNames, setClientNames] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const [dateField, setDateField] = useState("inqDate");

  // --- Filtering preview ---
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
          d.getMonth() + 1 === Number(month) &&
          d.getFullYear() === Number(year)
        );
      });
    }

    if (bdNames.length > 0) {
      list = list.filter((inq) => bdNames.includes(inq.bdName));
    }

    if (clientNames.length > 0) {
      list = list.filter((inq) => clientNames.includes(inq.clientName));
    }

    return list;
  }, [data, filterType, range, month, year, bdNames, clientNames, dateField]);

  const bdSuggestions = useMemo(
    () => [...new Set(data.map((inq) => inq.bdName).filter(Boolean))],
    [data]
  );

  const clientSuggestions = useMemo(
    () => [...new Set(filteredData.map((inq) => inq.clientName).filter(Boolean))],
    [filteredData]
  );

  const emit = (next = {}) => {
    const payload = {
      filterType,
      range,
      month,
      year,
      bdNames,
      clientNames,
      sortOrder,
      dateField,
      ...next,
    };
    onChange?.(payload);
  };

  const handleSort = (order) => {
    setSortOrder(order);
    setSortOpen(false);
    emit({ sortOrder: order });
  };

  return (
    <fieldset
      disabled={disabled}
      className={`relative bg-white shadow-xl rounded-2xl p-6 mb-8 border border-gray-200 transition ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Tabs Row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Filter Type Tabs */}
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          {["range", "month"].map((ft) => (
            <button
              key={ft}
              onClick={() => {
                setFilterType(ft);
                emit({ filterType: ft });
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition shadow ${
                filterType === ft
                  ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {ft === "range" ? "Date Range" : "Month & Year"}
            </button>
          ))}
        </div>

        {/* Date Field Tabs */}
        <div className="flex gap-2 ml-4 bg-gray-100 rounded-xl p-1">
          {[
            { key: "inqDate", label: "Inquiry" },
            { key: "quotDate", label: "Quotation" },
            { key: "regisDate", label: "Registration" },
          ].map((df) => (
            <button
              key={df.key}
              onClick={() => {
                setDateField(df.key);
                emit({ dateField: df.key });
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition shadow ${
                dateField === df.key
                  ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {df.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative ml-auto">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow text-gray-700 hover:bg-gray-100 transition"
          >
            {sortOrder === "newest" ? (
              <ArrowDownWideNarrow className="w-5 h-5" />
            ) : (
              <ArrowUpWideNarrow className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {sortOpen && (
            <div className="absolute mt-2 right-0 bg-white border shadow-lg rounded-xl w-40 overflow-hidden z-20">
              <button
                onClick={() => handleSort("newest")}
                className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-blue-50 ${
                  sortOrder === "newest" ? "bg-blue-100 font-medium" : ""
                }`}
              >
                <ArrowDownWideNarrow className="w-4 h-4" /> Newest First
              </button>
              <button
                onClick={() => handleSort("oldest")}
                className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-blue-50 ${
                  sortOrder === "oldest" ? "bg-blue-100 font-medium" : ""
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
            setBdNames([]);
            setClientNames([]);
            setSortOrder("newest");
            setDateField("inqDate");
            onResetAll?.();
            emit({
              range: defaultRange,
              month: defaultMonth,
              year: defaultYear,
              bdNames: [],
              clientNames: [],
              sortOrder: "newest",
              dateField: "inqDate",
            });
          }}
          className="text-sm px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-700 transition"
        >
          Reset Filters
        </button>
      </div>

      {/* Filter Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        {filterType === "range" && (
          <>
            <div className="flex flex-col bg-white border rounded-xl shadow p-3">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Start Date
              </label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <input
                  type="date"
                  value={range.start}
                  onChange={(e) => {
                    const next = { ...range, start: e.target.value };
                    setRange(next);
                    emit({ range: next });
                  }}
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>
            </div>

            <div className="flex flex-col bg-white border rounded-xl shadow p-3">
              <label className="text-xs font-medium text-gray-600 mb-1">
                End Date
              </label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <input
                  type="date"
                  value={range.end}
                  onChange={(e) => {
                    const next = { ...range, end: e.target.value };
                    setRange(next);
                    emit({ range: next });
                  }}
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>
            </div>
          </>
        )}

        {/* Month & Year */}
        {filterType === "month" && (
          <>
            <div className="flex flex-col bg-white border rounded-xl shadow p-3">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Month
              </label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                <select
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value);
                    emit({ month: e.target.value });
                  }}
                  className="bg-transparent outline-none text-sm w-full"
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

            <div className="flex flex-col bg-white border rounded-xl shadow p-3">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Year
              </label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
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
                  className="bg-transparent outline-none text-sm w-full"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </>
        )}

        {/* BD Names */}
        <div className="flex flex-col bg-white border rounded-xl shadow p-3">
          <label className="text-xs font-medium text-gray-600 mb-1">
            BD Names
          </label>
          <div className="flex flex-wrap gap-2">
            {bdNames.map((name) => (
              <span
                key={name}
                className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-md text-xs"
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
              className="flex-1 bg-transparent text-sm outline-none"
            >
              <option value="">Select BD</option>
              {bdSuggestions.map((bd) => (
                <option key={bd} value={bd}>
                  {bd}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Client Names */}
        <div className="flex flex-col bg-white border rounded-xl shadow p-3">
          <label className="text-xs font-medium text-gray-600 mb-1">
            Client Names
          </label>
          <div className="flex flex-wrap gap-2">
            {clientNames.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-md text-xs"
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
              className="flex-1 bg-transparent text-sm outline-none"
            >
              <option value="">Select Client</option>
              {clientSuggestions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </fieldset>
  );
}


