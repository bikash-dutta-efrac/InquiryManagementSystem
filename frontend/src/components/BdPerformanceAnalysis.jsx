import { useState, useMemo, useEffect } from "react";
import {
  Target,
  Calendar,
  TrendingUp,
  Building2,
  ChevronDown,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  BarChart3,
  List,
  Maximize,
  Minimize,
  AlertCircle,
  Activity,
  Users,
  Check,
  ChevronRight,
  RefreshCcw,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
  IndianRupee,
  User,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { MdCurrencyRupee, MdPerson } from "react-icons/md";

import {
  getBdNames,
  getAllBdProjection,
  getAllBdTargets,
  createBdProjection,
  updateBdProjection,
  deleteBdProjection,
  createBdTarget,
  updateBdTarget,
  deleteBdTarget,
} from "../services/api";

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
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
      label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  }
  return options;
};

const MONTH_OPTIONS = generateMonthOptions();

const getCurrentWeek = () => {
  const now = new Date();
  const dayOfMonth = now.getDate();
  if (dayOfMonth <= 7) return 1;
  if (dayOfMonth <= 14) return 2;
  if (dayOfMonth <= 21) return 3;
  if (dayOfMonth <= 28) return 4;
  return 5;
};

const isCurrentMonth = (month, year) => {
  const now = new Date();
  return now.getMonth() + 1 === month && now.getFullYear() === year;
};

const isPastMonth = (month, year) => {
  const now = new Date();
  const currentDate = new Date(now.getFullYear(), now.getMonth());
  const checkDate = new Date(year, month - 1);
  return checkDate < currentDate;
};

const getStatus = (achieved, target, isClientContext = false) => {
  let progress;
  let text;
  let badgeColor;
  let progressColor;
  let icon;

  if (target === 0) {
    if (achieved > 0) {
      progress = 100;
      text = isClientContext ? "Not Projected" : "No Target";
      badgeColor = "bg-blue-100 text-blue-700 border-blue-300";
      progressColor = "bg-blue-500";
      icon = <AlertCircle className="w-3 h-3" />;
    } else {
      progress = 0;
      text = isClientContext ? "Not Projected" : "No Target";
      badgeColor = "bg-gray-100 text-gray-700 border-gray-300";
      progressColor = "bg-white";
      icon = <AlertCircle className="w-3 h-3" />;
    }
  } else {
    progress = Math.min((achieved / target) * 100, 100);

    if (achieved >= target) {
      text = "Achieved";
      badgeColor = "bg-green-100 text-green-700 border-green-300";
      progressColor = "bg-green-500";
      icon = <CheckCircle2 className="w-3 h-3" />;
    } else if (achieved > 0) {
      text = "Partial Achieved";
      badgeColor = "bg-yellow-100 text-yellow-700 border-yellow-300";
      progressColor = "bg-yellow-500";
      icon = <Activity className="w-3 h-3" />;
    } else {
      text = "Not Achieved";
      badgeColor = "bg-red-100 text-red-700 border-red-300";
      progressColor = "bg-red-500";
      progress = 0;
      icon = <XCircle className="w-3 h-3" />;
    }
  }

  return { text, badgeColor, progressColor, progress, icon };
};

const ExcludeToggle = ({ enabled, onChange }) => {
  const gradientClass = enabled
    ? "bg-gradient-to-r from-red-500 to-red-600"
    : "bg-gradient-to-r from-blue-500 to-cyan-600";

  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex items-center h-6 w-12 rounded-full transition-all duration-300 ${gradientClass} focus:outline-none shadow-md hover:shadow-lg`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
          enabled ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
};

const Dropdown = ({
  options,
  selected,
  onSelect,
  label,
  icon: Icon,
  placeholder,
  multiple = false,
  onDeselectAll,
  onSelectAll,
  isExcluded,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((o) =>
    o?.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".dropdown-container")) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (value) => {
    if (multiple) {
      const newSelected = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      onSelect(newSelected);
    } else {
      onSelect(value);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const displayValue = multiple
    ? selected.length > 0
      ? `${isExcluded ? "Excluding" : "Including"} ${selected.length} ${label}`
      : `${isExcluded ? "Excluding All" : "Including All"} ${label}`
    : options.find((o) => o.value === selected)?.label || placeholder;

  const modeColor = isExcluded ? "text-red-600" : "text-blue-600";
  const modeHoverColor = isExcluded
    ? "group-hover:text-red-700"
    : "group-hover:text-blue-700";

  return (
    <div className="relative w-full dropdown-container">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 text-left hover:shadow-md flex justify-between items-center transition-all duration-200 group ${
          isExcluded && multiple ? "focus:ring-red-500" : "focus:ring-blue-500"
        }`}
      >
        <span className="flex items-center gap-2.5 text-sm">
          <Icon
            className={`w-4 h-4 ${
              multiple ? `${modeColor} ${modeHoverColor}` : "text-blue-600"
            }`}
          />
          <span
            className={
              (selected && selected.length > 0) || (!multiple && selected)
                ? "text-gray-700"
                : "text-gray-500"
            }
          >
            {displayValue}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-20 mt-2 w-full rounded-xl bg-white shadow-xl border border-gray-100"
          >
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                />
              </div>
            </div>
            <ul className="max-h-60 overflow-y-auto">
              {multiple && onSelectAll && (
                <li
                  onClick={() => {
                    onSelectAll();
                    setSearchTerm("");
                  }}
                  className="px-4 py-2.5 text-sm cursor-pointer font-semibold border-b border-gray-100 transition-colors duration-150 hover:bg-red-50 text-black"
                >
                  Select All
                </li>
              )}
              {multiple && onDeselectAll && (
                <li
                  onClick={() => {
                    onDeselectAll();
                    setSearchTerm("");
                  }}
                  className="px-4 py-2.5 text-sm cursor-pointer font-semibold border-b border-gray-100 transition-colors duration-150 hover:bg-blue-50 text-black"
                >
                  Deselect All
                </li>
              )}
              {filteredOptions.map((o) => {
                const isSelected = multiple
                  ? selected.includes(o.value)
                  : selected === o.value;
                return (
                  <li
                    key={o.value}
                    onClick={() => handleSelect(o.value)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150 ${
                      isSelected
                        ? isExcluded && multiple
                          ? "bg-red-50 text-red-800 font-medium"
                          : "bg-blue-50 text-blue-800 font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{o.label}</span>
                      {isSelected && (
                        <Check
                          className={`w-4 h-4 ${
                            isExcluded && multiple
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
              {!filteredOptions.length && (
                <li className="px-4 py-3 text-sm text-gray-500 italic text-center">
                  No matches found.
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ManagementModal = ({
  isOpen,
  onClose,
  action,
  refreshData,
  month,
  bdOptions,
}) => {
  const [formData, setFormData] = useState({
    week1Val: "",
    week1Remarks: "",
    week2Val: "",
    week2Remarks: "",
    week3Val: "",
    week3Remarks: "",
    week4Val: "",
    week4Remarks: "",
    week5Val: "",
    week5Remarks: "",
  });
  const [targetValue, setTargetValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isTarget = action.type.includes("TARGET");
  const isAdd = action.type.includes("ADD");
  const isEdit = action.type.includes("EDIT");
  const isDelete = action.type.includes("DELETE");
  const isProjection = action.type.includes("PROJECTION");

  const monthOption = MONTH_OPTIONS.find((opt) => opt.value === month);
  const currentWeek = getCurrentWeek();
  const isCurrentMonthSelected = isCurrentMonth(
    monthOption?.month,
    monthOption?.year
  );

  const getWeekState = (weekNum) => {
    if (!isCurrentMonthSelected) {
      return { valueDisabled: false, remarksDisabled: false, state: "future" };
    }

    if (weekNum < currentWeek) {
      return { valueDisabled: true, remarksDisabled: true, state: "past" };
    } else if (weekNum === currentWeek) {
      return { valueDisabled: true, remarksDisabled: false, state: "current" };
    } else {
      return { valueDisabled: false, remarksDisabled: false, state: "future" };
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (isTarget) {
        setTargetValue(isEdit ? action.data?.value || "" : "");
      } else if (isProjection) {
        if (
          isEdit &&
          action.data?.projections &&
          action.data.projections.length > 0
        ) {
          const proj = action.data.projections[0];
          setFormData({
            week1Val: proj.projValWeek1 || "",
            week1Remarks: proj.remarksWeek1 || "",
            week2Val: proj.projValWeek2 || "",
            week2Remarks: proj.remarksWeek2 || "",
            week3Val: proj.projValWeek3 || "",
            week3Remarks: proj.remarksWeek3 || "",
            week4Val: proj.projValWeek4 || "",
            week4Remarks: proj.remarksWeek4 || "",
            week5Val: proj.projValWeek5 || "",
            week5Remarks: proj.remarksWeek5 || "",
          });
        } else {
          setFormData({
            week1Val: "",
            week1Remarks: "",
            week2Val: "",
            week2Remarks: "",
            week3Val: "",
            week3Remarks: "",
            week4Val: "",
            week4Remarks: "",
            week5Val: "",
            week5Remarks: "",
          });
        }
      }
      setError(null);
    }
  }, [isOpen, action, isTarget, isProjection, isEdit]);

  const modalTitle = isTarget
    ? `${isAdd ? "Add" : isEdit ? "Edit" : "Delete"} BD Target`
    : `${isAdd ? "Add" : isEdit ? "Edit" : "Delete"} Client Projection`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isDelete) {
      if (isTarget) {
        const numericValue = parseFloat(targetValue);
        if (!targetValue || isNaN(numericValue) || numericValue <= 0) {
          setError("Please enter a valid target value greater than 0.");
          return;
        }
      } else if (isProjection) {
        const week1 = parseFloat(formData.week1Val) || 0;
        const week2 = parseFloat(formData.week2Val) || 0;
        const week3 = parseFloat(formData.week3Val) || 0;
        const week4 = parseFloat(formData.week4Val) || 0;
        const week5 = parseFloat(formData.week5Val) || 0;

        if (
          week1 === 0 &&
          week2 === 0 &&
          week3 === 0 &&
          week4 === 0 &&
          week5 === 0
        ) {
          setError("Please enter at least one week projection value.");
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      let apiCall;

      if (isTarget) {
        const targetBody = {
          bdCode: action.data.bdCode,
          targetVal: Number(targetValue),
          remarks: "",
        };

        if (isAdd) {
          apiCall = createBdTarget(targetBody);
        } else if (isEdit) {
          apiCall = updateBdTarget(action.data.id, targetBody);
        } else if (isDelete) {
          apiCall = deleteBdTarget(action.data.id);
        }
      } else if (isProjection) {
        const projectionBody = {
          bdCode: action.data.bdCode,
          clientCode: action.data.clientCode,
          projValWeek1: parseFloat(formData.week1Val) || null,
          projDateWeek1: formData.week1Val ? new Date().toISOString() : null,
          remarksWeek1: formData.week1Remarks || null,
          revisedValWeek1: null,
          reviseDateWeek1: null,
          projValWeek2: parseFloat(formData.week2Val) || null,
          projDateWeek2: formData.week2Val ? new Date().toISOString() : null,
          remarksWeek2: formData.week2Remarks || null,
          revisedValWeek2: null,
          reviseDateWeek2: null,
          projValWeek3: parseFloat(formData.week3Val) || null,
          projDateWeek3: formData.week3Val ? new Date().toISOString() : null,
          remarksWeek3: formData.week3Remarks || null,
          revisedValWeek3: null,
          reviseDateWeek3: null,
          projValWeek4: parseFloat(formData.week4Val) || null,
          projDateWeek4: formData.week4Val ? new Date().toISOString() : null,
          remarksWeek4: formData.week4Remarks || null,
          revisedValWeek4: null,
          reviseDateWeek4: null,
          projValWeek5: parseFloat(formData.week5Val) || null,
          projDateWeek5: formData.week5Val ? new Date().toISOString() : null,
          remarksWeek5: formData.week5Remarks || null,
          revisedValWeek5: null,
          reviseDateWeek5: null,
        };

        if (isAdd) {
          apiCall = createBdProjection(projectionBody);
        } else if (isEdit) {
          const projectionId = action.data.projections?.[0]?.id;
          if (!projectionId)
            throw new Error("Projection ID not found for editing.");
          apiCall = updateBdProjection(projectionId, projectionBody);
        } else if (isDelete) {
          const projectionId = action.data.projections?.[0]?.id;
          if (!projectionId)
            throw new Error("Projection ID not found for deletion.");
          apiCall = deleteBdProjection(projectionId);
        }
      }

      if (apiCall) await apiCall;
      await refreshData();
      onClose();
    } catch (err) {
      console.error("API Error:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 p-6 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-2 rounded-lg bg-white/20 backdrop-blur-sm"
              >
                <IndianRupee className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">{modalTitle}</h2>
                <p className="text-blue-100 text-sm">
                  {action.data.bdName}{" "}
                  {isProjection && `• ${action.data.clientName}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isDelete ? (
            <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-red-800 font-semibold mb-1">
                    Confirm Deletion
                  </p>
                  <p className="text-sm text-red-600">
                    Are you sure you want to delete this{" "}
                    {isTarget ? "target" : "projection"}? This action cannot be
                    undone.
                  </p>
                </div>
              </div>
            </div>
          ) : isTarget ? (
            <form
              id="management-form"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Target Value (₹)
                </label>
                <div className="relative">
                  <MdCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input
                    type="number"
                    step="0.01"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-semibold"
                    placeholder="e.g., 500000"
                  />
                </div>
              </div>
            </form>
          ) : (
            <form
              id="management-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5].map((week) => {
                  const weekState = getWeekState(week);
                  const isPast = weekState.state === "past";
                  const isCurrent = weekState.state === "current";

                  return (
                    <div
                      key={week}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isPast
                          ? "bg-gray-50 border-gray-200 opacity-60"
                          : isCurrent
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar
                          className={`w-4 h-4 ${
                            isPast
                              ? "text-gray-400"
                              : isCurrent
                              ? "text-blue-600"
                              : "text-gray-600"
                          }`}
                        />
                        <h3
                          className={`text-sm font-bold ${
                            isPast
                              ? "text-gray-400"
                              : isCurrent
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          Week {week}
                          {isCurrent && (
                            <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                              Current - Value Locked
                            </span>
                          )}
                          {isPast && (
                            <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                              Past - Locked
                            </span>
                          )}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1.5">
                            Projection Value (₹)
                            {isCurrent && (
                              <span className="ml-1 text-blue-600">
                                (Locked)
                              </span>
                            )}
                          </label>
                          <div className="relative">
                            <IndianRupee
                              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                                weekState.valueDisabled
                                  ? "text-gray-400"
                                  : "text-blue-600"
                              }`}
                            />
                            <input
                              type="number"
                              disabled={weekState.valueDisabled}
                              value={formData[`week${week}Val`]}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  [`week${week}Val`]: e.target.value,
                                })
                              }
                              placeholder={
                                weekState.valueDisabled
                                  ? isCurrent
                                    ? "Current week locked"
                                    : "Past week locked"
                                  : "Enter value"
                              }
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1.5">
                            Remarks{" "}
                            {isCurrent && (
                              <span className="text-blue-600">(Editable)</span>
                            )}
                          </label>
                          <textarea
                            disabled={weekState.remarksDisabled}
                            value={formData[`week${week}Remarks`]}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [`week${week}Remarks`]: e.target.value,
                              })
                            }
                            placeholder={
                              weekState.remarksDisabled
                                ? "Past week locked"
                                : "Add notes..."
                            }
                            rows={2}
                            className={`w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
                              isCurrent
                                ? "focus:ring-blue-500 border-blue-300"
                                : "focus:ring-blue-500"
                            } focus:border-transparent bg-white text-sm resize-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </form>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200 mb-4"
            >
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={isDelete ? handleSubmit : undefined}
              type={isDelete ? "button" : "submit"}
              form={isDelete ? undefined : "management-form"}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden ${
                isDelete
                  ? "bg-gradient-to-r from-red-500 to-pink-600 hover:shadow-lg"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg"
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {!isLoading && (
                <motion.div
                  className="absolute inset-0 bg-white opacity-0 hover:opacity-20"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span className="relative z-10">
                {isDelete ? "Confirm Delete" : isAdd ? "Add" : "Save Changes"}
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  borderColor,
  bgColor,
  iconColor,
  textColor,
  isLoading,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
    className={`bg-white p-6 rounded-xl shadow-lg border-t-4 ${borderColor} transform transition-all duration-300 flex flex-col justify-between h-full`}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium uppercase text-gray-500">
        {title}
      </span>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 10 }}
        className={`p-2 rounded-lg ${bgColor}`}
      >
        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
      </motion.div>
    </div>

    <p
      className={`text-3xl font-extrabold ${textColor} flex items-center gap-1`}
    >
      {isLoading ? (
        <Loader2 className={`w-5 h-5 animate-spin ${iconColor}`} />
      ) : (
        value
      )}
    </p>
  </motion.div>
);

const BDPerformanceSummaryCard = ({
  achieved,
  notAchieved,
  progress,
  isLoading,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.2 }}
    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
    className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-yellow-500 transform transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium uppercase text-gray-500">
        Performance
      </span>
      <Trophy className="w-5 h-5 text-yellow-500" />
    </div>

    <div className="flex justify-between items-end mb-1">
      <div>
        <p className="text-[10px] text-gray-500">Achieved</p>
        <p className="text-2xl font-extrabold text-green-600">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-green-600" />
          ) : (
            achieved
          )}
        </p>
      </div>

      <div className="text-right">
        <p className="text-[10px] text-gray-500">Not Achieved</p>
        <p className="text-2xl font-extrabold text-red-600">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
          ) : (
            notAchieved
          )}
        </p>
      </div>
    </div>

    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">Progress</span>
        <span className="text-xs font-bold text-gray-700">
          {progress.toFixed(0)}%
        </span>
      </div>
      <div className="relative h-2 bg-red-500 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-green-500"
        />
      </div>
    </div>
  </motion.div>
);

const BDTargetManager = ({ bd, onManage, isActive }) => {
  const hasTarget = bd.totalTarget > 0;

  const handleEdit = (e) => {
    e.stopPropagation();
    onManage({
      type: "EDIT_TARGET",
      data: {
        id: bd.targetId,
        value: bd.totalTarget,
        bdName: bd.bdName,
        bdCode: bd.bdCode,
      },
    });
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    onManage({
      type: "ADD_TARGET",
      data: {
        bdName: bd.bdName,
        bdCode: bd.bdCode,
      },
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onManage({
      type: "DELETE_TARGET",
      data: {
        id: bd.targetId,
        bdName: bd.bdName,
        bdCode: bd.bdCode,
      },
    });
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isActive ? "0%" : "100%" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute top-0 right-0 h-full flex items-center pr-4 gap-2 z-20"
    >
      {hasTarget ? (
        <>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEdit}
            className="p-2.5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all"
            title="Edit Target"
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="p-2.5 rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all"
            title="Delete Target"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </>
      ) : (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleAdd}
          className="p-2.5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
          title="Add Target"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
};

const ClientProjectionManager = ({ client, onManage, bdInfo, isActive }) => {
  const hasProjection = client.projected > 0;

  const handleEdit = (e) => {
    e.stopPropagation();
    onManage({
      type: "EDIT_PROJECTION",
      data: {
        projections: client.projections,
        bdName: bdInfo.bdName,
        bdCode: bdInfo.bdCode,
        clientCode: client.clientCode,
        clientName: client.clientName,
        value: client.projected,
      },
    });
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    onManage({
      type: "ADD_PROJECTION",
      data: {
        bdName: bdInfo.bdName,
        bdCode: bdInfo.bdCode,
        clientCode: client.clientCode,
        clientName: client.clientName,
      },
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onManage({
      type: "DELETE_PROJECTION",
      data: {
        projections: client.projections,
        bdName: bdInfo.bdName,
        bdCode: bdInfo.bdCode,
        clientCode: client.clientCode,
        clientName: client.clientName,
      },
    });
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isActive ? "0%" : "100%" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute top-0 right-0 h-full flex items-center pr-3 gap-2 z-30"
    >
      {hasProjection ? (
        <>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEdit}
            className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-md hover:shadow-lg transition-all"
            title="Edit Projection"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="p-2 rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-md hover:shadow-lg transition-all"
            title="Delete Projection"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </>
      ) : (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleAdd}
          className="p-2 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md hover:shadow-lg transition-all"
          title="Add Projection"
        >
          <Plus className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </motion.div>
  );
};

const BDPerformanceTableCard = ({
  bd,
  isLoading,
  clients,
  onTargetManage,
  onProjectionManage,
  activeBdActionbdCode,
  setActiveBdActionbdCode,
  activeClient,
  setActiveClient,
  inquiriesData,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isIconHidden, setIsIconHidden] = useState(false);
  const status = getStatus(bd.totalAchieved, bd.totalTarget);

  const progressBarBg =
    status.text === "Not Achieved" && bd.totalTarget > 0
      ? "bg-red-200"
      : status.text === "No Target"
      ? "bg-blue-200"
      : "bg-gray-200";

  const SHIFT_CLASS = "-translate-x-10";

  const isThisBdActionActive = activeBdActionbdCode === bd.bdCode;

  const handleHeaderClick = () => {
    setIsExpanded((s) => !s);
    setIsIconHidden((prev) => !prev);
    setActiveBdActionbdCode(isThisBdActionActive ? null : bd.bdCode);
  };

  const getWeekFromDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const dayOfMonth = date.getDate();

    if (dayOfMonth <= 7) return 1;
    if (dayOfMonth <= 14) return 2;
    if (dayOfMonth <= 21) return 3;
    if (dayOfMonth <= 28) return 4;
    return 5;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 relative"
    >
      <div
        className="p-6 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 relative overflow-hidden"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center justify-between transition-transform duration-300">
          <div className="flex items-center gap-4 flex-shrink-0 w-1/12">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.3 }}
              className="p-2 rounded-lg bg-gray-100"
            >
              <ChevronRight className="w-5 h-5 text-blue-500" />
            </motion.div>

            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  x: isIconHidden ? -30 : 0,
                  opacity: isIconHidden ? 0 : 1,
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md"
              >
                <MdPerson className="w-4 h-4 text-white" />
              </motion.div>
            </div>
          </div>

          <div
            className={`flex items-center gap-10 w-11/12 ml-4 transition-transform duration-500 ${
              isIconHidden ? "-translate-x-10" : ""
            }`}
          >
            <div>
              <h3 className="text-base font-bold text-gray-800 w-44">
                {bd.bdName}
              </h3>
              <p className="text-xs text-gray-500">
                {bd.clientCount} Clients · {bd.projectionCount} Projections
              </p>
            </div>

            <div className="text-center mw-20">
              <p className="text-xs text-gray-500 mb-1">Target</p>
              <p className="text-base font-bold text-purple-600">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  `₹${formatAmount(bd.totalTarget)}`
                )}
              </p>
            </div>

            <div className="text-center w-20">
              <p className="text-xs text-gray-500 mb-1">Projected</p>
              <p className="text-base font-bold text-blue-600">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  `₹${formatAmount(bd.totalProjected)}`
                )}
              </p>
            </div>

            <div className="text-center w-20">
              <p className="text-xs text-gray-500 mb-1">Achieved</p>
              <p className="text-base font-bold text-green-600">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  `₹${formatAmount(bd.totalAchieved)}`
                )}
              </p>
            </div>

            <div className="w-32 flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">vs Target</span>
                <span className="text-xs font-bold text-gray-700">
                  {status.progress.toFixed(0)}%
                </span>
              </div>
              <div
                className={`relative h-2 ${progressBarBg} rounded-full overflow-hidden`}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(status.progress, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${status.progressColor}`}
                />
              </div>
            </div>

            <div className="w-28 flex justify-center flex-shrink-0 relative">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${status.badgeColor}`}
              >
                {status.icon}
                {status.text}
              </span>

              <motion.div
                animate={{
                  x: isIconHidden ? 0 : 100,
                  opacity: isIconHidden ? 1 : 0,
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute right-[-120px] top-1/2 -translate-y-1/2 flex items-center gap-2"
              >
                <BDTargetManager
                  bd={bd}
                  onManage={onTargetManage}
                  isActive={isThisBdActionActive}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 bg-gradient-to-br from-slate-50 to-blue-50"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-sm font-bold text-gray-700">
                  Client-wise Performance Analysis
                </h4>
              </div>

              {clients.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No client data available for this BD
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-xl bg-white/80 backdrop-blur-md mb-6 relative">
                  <table className="min-w-full border-collapse w-full">
                    <thead className="bg-gradient-to-r from-cyan-500 to-blue-600">
                      <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20 w-[20%]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-0.5 h-3 bg-white/60 rounded-full"></div>
                            <span className="drop-shadow-sm">Client</span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20 w-[15%]">
                          Projected
                        </th>
                        <th className="px-4 py-3 text-center text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20 w-[15%]">
                          Achieved
                        </th>
                        <th className="px-4 py-3 text-center text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20 w-[30%]">
                          Progress
                        </th>
                        <th className="px-4 py-3 text-center text-[10px] font-bold text-white uppercase tracking-wide w-[20%]">
                          Status
                        </th>
                        <th className="px-4 py-3 w-[5%]"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {clients.map((client, index) => {
                        const clientStatus = getStatus(
                          client.achieved,
                          client.projected,
                          true
                        );
                        const isEvenRow = index % 2 === 0;
                        const clientProgressBarBg =
                          clientStatus.text === "Not Achieved" &&
                          client.projected > 0
                            ? "bg-red-200"
                            : clientStatus.text === "Not Projected"
                            ? "bg-blue-200"
                            : "bg-gray-200";

                        const active =
                          activeClient &&
                          activeClient.bdbdCode === bd.bdCode &&
                          activeClient.index === index;

                        // Calculate weekly achievements for this client
                        const weeklyAchievements = {
                          1: 0,
                          2: 0,
                          3: 0,
                          4: 0,
                          5: 0,
                        };
                        if (inquiriesData && client.clientCode) {
                          inquiriesData
                            .filter(
                              (inq) => inq.clientCode === client.clientCode
                            )
                            .forEach((inq) => {
                              const week = getWeekFromDate(inq.regisDate);
                              if (week && inq.regisVal) {
                                weeklyAchievements[week] +=
                                  parseFloat(inq.regisVal) || 0;
                              }
                            });
                        }

                        // Get weekly projections
                        const weeklyData =
                          client.projections && client.projections.length > 0
                            ? [
                                {
                                  week: 1,
                                  value: client.projections[0].projValWeek1,
                                  remarks: client.projections[0].remarksWeek1,
                                  achieved: weeklyAchievements[1],
                                },
                                {
                                  week: 2,
                                  value: client.projections[0].projValWeek2,
                                  remarks: client.projections[0].remarksWeek2,
                                  achieved: weeklyAchievements[2],
                                },
                                {
                                  week: 3,
                                  value: client.projections[0].projValWeek3,
                                  remarks: client.projections[0].remarksWeek3,
                                  achieved: weeklyAchievements[3],
                                },
                                {
                                  week: 4,
                                  value: client.projections[0].projValWeek4,
                                  remarks: client.projections[0].remarksWeek4,
                                  achieved: weeklyAchievements[4],
                                },
                                {
                                  week: 5,
                                  value: client.projections[0].projValWeek5,
                                  remarks: client.projections[0].remarksWeek5,
                                  achieved: weeklyAchievements[5],
                                },
                              ]
                            : [];

                        return (
                          <>
                            <motion.tr
                              key={client.clientName + index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (active) {
                                  setActiveClient(null);
                                } else {
                                  setActiveClient({
                                    bdbdCode: bd.bdCode,
                                    index,
                                  });
                                }
                              }}
                              className={`group transition-all duration-150 relative cursor-pointer ${
                                isEvenRow ? "bg-white/90" : "bg-gray-50/50"
                              } hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-indigo-50/70`}
                            >
                              <td className="px-4 py-3 text-left w-[30%]">
                                <div className="flex items-center gap-2">
                                  <motion.div
                                    animate={{ rotate: active ? 90 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-1.5 rounded-lg bg-gray-100"
                                  >
                                    <ChevronRight className="w-3 h-3 text-blue-500" />
                                  </motion.div>
                                  <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 text-gray-900">
                                      <span className="font-medium text-sm truncate group-hover:text-blue-900">
                                        {client.clientName}
                                      </span>
                                    </div>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-700 transition-all duration-200">
                                      {client.clientCode}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td
                                className={`px-4 py-3 text-center w-[10%] transition-transform duration-300 ${
                                  active ? SHIFT_CLASS : ""
                                }`}
                              >
                                <span className="text-sm text-blue-600 font-semibold">
                                  ₹{formatAmount(client.projected)}
                                </span>
                              </td>

                              <td
                                className={`px-4 py-3 text-center w-[10%] transition-transform duration-300 ${
                                  active ? SHIFT_CLASS : ""
                                }`}
                              >
                                <span className="text-sm text-green-600 font-semibold">
                                  ₹{formatAmount(client.achieved)}
                                </span>
                              </td>

                              <td
                                className={`px-4 py-3 w-[30%] transition-transform duration-300 ${
                                  active ? SHIFT_CLASS : ""
                                }`}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <div
                                    className={`relative w-24 h-1.5 ${clientProgressBarBg} rounded-full overflow-hidden`}
                                  >
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${clientStatus.progress}%`,
                                      }}
                                      transition={{
                                        duration: 1,
                                        delay: index * 0.05,
                                      }}
                                      className={`h-full ${clientStatus.progressColor}`}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                                    {clientStatus.progress.toFixed(0)}%
                                  </span>
                                </div>
                              </td>

                              <td
                                className={`px-2 py-2 text-center w-[20%] transition-transform duration-300 ${
                                  active ? SHIFT_CLASS : ""
                                }`}
                              >
                                <span
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${clientStatus.badgeColor}`}
                                >
                                  {clientStatus.icon}
                                  {clientStatus.text}
                                </span>
                              </td>

                              <td className="px-2 py-2 w-[5%] text-center relative">
                                <ClientProjectionManager
                                  client={client}
                                  onManage={onProjectionManage}
                                  bdInfo={{
                                    bdName: bd.bdName,
                                    bdCode: bd.bdCode,
                                  }}
                                  isActive={active}
                                />
                              </td>
                            </motion.tr>

                            {/* Weekly breakdown expanded view */}
                            <AnimatePresence>
                              {active && (
                                <motion.tr
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="bg-gradient-to-br from-slate-50 to-blue-50"
                                >
                                  <td colSpan="6" className="px-4 py-4">
                                    <div className="pl-8">
                                      {client.projections &&
                                      client.projections.length > 0 ? (
                                        <div>
                                          <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
                                                <Calendar className="w-4 h-4 text-white" />
                                              </div>
                                              <h4 className="text-sm font-bold text-gray-700">
                                                Weekly Projection & Achievement
                                                Analysis
                                              </h4>
                                            </div>
                                          </div>

                                          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white">
                                            <table className="min-w-full border-collapse">
                                              <thead className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600">
                                                <tr>
                                                  <th className="px-4 py-2 text-left text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20">
                                                    Week
                                                  </th>
                                                  <th className="px-4 py-2 text-center text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20">
                                                    Projected
                                                  </th>
                                                  <th className="px-4 py-2 text-center text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20">
                                                    Achieved
                                                  </th>
                                                  <th className="px-4 py-2 text-center text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20">
                                                    Progress
                                                  </th>
                                                  <th className="px-4 py-2 text-left text-[10px] font-bold text-white uppercase tracking-wide">
                                                    Remarks
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-gray-100">
                                                {weeklyData.map(
                                                  (week, wIndex) => {
                                                    const hasValue =
                                                      week.value &&
                                                      week.value > 0;
                                                    const weekStatus =
                                                      getStatus(
                                                        week.achieved,
                                                        week.value,
                                                        true
                                                      );
                                                    const weekProgress =
                                                      week.value > 0
                                                        ? Math.min(
                                                            (week.achieved /
                                                              week.value) *
                                                              100,
                                                            100
                                                          )
                                                        : 0;

                                                    return (
                                                      <tr
                                                        key={week.week}
                                                        className={`${
                                                          wIndex % 2 === 0
                                                            ? "bg-white"
                                                            : "bg-gray-50"
                                                        } ${
                                                          !hasValue
                                                            ? "opacity-40"
                                                            : ""
                                                        }`}
                                                      >
                                                        <td className="px-4 py-2 text-left border-r border-gray-100">
                                                          <div className="flex items-center gap-2">
                                                            <Calendar className="w-3 h-3 text-blue-500" />
                                                            <span className="text-xs font-semibold text-gray-700">
                                                              Week {week.week}
                                                            </span>
                                                          </div>
                                                        </td>
                                                        <td className="px-4 py-2 text-center border-r border-gray-100">
                                                          <span
                                                            className={`text-sm font-bold ${
                                                              hasValue
                                                                ? "text-blue-700"
                                                                : "text-gray-400"
                                                            }`}
                                                          >
                                                            {hasValue
                                                              ? `₹${formatAmount(
                                                                  week.value
                                                                )}`
                                                              : "Not Set"}
                                                          </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-center border-r border-gray-100">
                                                          <span
                                                            className={`text-sm font-bold ${
                                                              week.achieved > 0
                                                                ? "text-green-700"
                                                                : "text-gray-400"
                                                            }`}
                                                          >
                                                            ₹
                                                            {formatAmount(
                                                              week.achieved
                                                            )}
                                                          </span>
                                                        </td>
                                                        <td className="px-4 py-2 border-r border-gray-100">
                                                          {hasValue ? (
                                                            <div className="flex items-center justify-center gap-2">
                                                              <div className="relative w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                <motion.div
                                                                  initial={{
                                                                    width: 0,
                                                                  }}
                                                                  animate={{
                                                                    width: `${weekProgress}%`,
                                                                  }}
                                                                  transition={{
                                                                    duration: 1,
                                                                    delay:
                                                                      wIndex *
                                                                      0.1,
                                                                  }}
                                                                  className={`h-full ${weekStatus.progressColor}`}
                                                                />
                                                              </div>
                                                              <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                                                                {weekProgress.toFixed(
                                                                  0
                                                                )}
                                                                %
                                                              </span>
                                                            </div>
                                                          ) : (
                                                            <span className="text-xs text-gray-400 text-center block">
                                                              -
                                                            </span>
                                                          )}
                                                        </td>
                                                        <td className="px-4 py-2 text-left">
                                                          <span className="text-xs text-gray-600">
                                                            {week.remarks ||
                                                              "-"}
                                                          </span>
                                                        </td>
                                                      </tr>
                                                    );
                                                  }
                                                )}
                                              </tbody>
                                              <tfoot className="bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-100 border-t-2 border-blue-200">
                                                <tr>
                                                  <td className="px-4 py-2 text-left font-bold text-blue-900 text-xs border-r border-blue-200">
                                                    <div className="flex items-center gap-2">
                                                      <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                                                      <span>Total</span>
                                                    </div>
                                                  </td>
                                                  <td className="px-4 py-2 text-center border-r border-blue-200">
                                                    <span className="text-sm font-extrabold text-blue-900">
                                                      ₹
                                                      {formatAmount(
                                                        client.projected
                                                      )}
                                                    </span>
                                                  </td>
                                                  <td className="px-4 py-2 text-center border-r border-blue-200">
                                                    <span className="text-sm font-extrabold text-green-900">
                                                      ₹
                                                      {formatAmount(
                                                        client.achieved
                                                      )}
                                                    </span>
                                                  </td>
                                                  <td className="px-4 py-2 border-r border-blue-200">
                                                    <div className="flex items-center justify-center gap-2">
                                                      <div className="relative w-20 h-1.5 bg-white rounded-full overflow-hidden">
                                                        <motion.div
                                                          initial={{ width: 0 }}
                                                          animate={{
                                                            width: `${clientStatus.progress}%`,
                                                          }}
                                                          transition={{
                                                            duration: 1,
                                                            ease: "easeOut",
                                                          }}
                                                          className={`h-full ${clientStatus.progressColor}`}
                                                        />
                                                      </div>
                                                      <span className="text-xs font-bold text-gray-700">
                                                        {clientStatus.progress.toFixed(
                                                          0
                                                        )}
                                                        %
                                                      </span>
                                                    </div>
                                                  </td>
                                                  <td className="px-4 py-2 text-center">
                                                    <span
                                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${clientStatus.badgeColor}`}
                                                    >
                                                      {clientStatus.icon}
                                                      {clientStatus.text}
                                                    </span>
                                                  </td>
                                                </tr>
                                              </tfoot>
                                            </table>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-center py-8 text-gray-500 text-sm bg-white rounded-xl border border-gray-200">
                                          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                          No projection data available for this
                                          client
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </motion.tr>
                              )}
                            </AnimatePresence>
                          </>
                        );
                      })}

                      {/* BD Total Row */}
                      <tr className="bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-100 border-t-2 border-blue-200 w-full">
                        <td className="px-4 py-3 text-left font-bold text-blue-900 w-[20%]">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-xs">Projected/Achieved</span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center w-[15%]">
                          <span className="text-[10px] text-blue-800 font-medium block">
                            Total Projected
                          </span>
                          <span className="text-sm text-blue-900 font-extrabold">
                            ₹{formatAmount(bd.totalProjected)}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center w-[15%]">
                          <span className="text-[10px] text-green-800 font-medium block">
                            Total Achieved
                            <br />
                            (Among Proj.)
                          </span>
                          <span className="text-sm text-green-900 font-extrabold">
                            ₹
                            {formatAmount(bd.totalAchievedFromProjectedClients)}
                          </span>
                        </td>

                        <td className="px-4 py-3 w-[30%]">
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="flex items-center justify-between w-32 mb-0.5">
                              <span className="text-xs text-gray-500">
                                vs Projection
                              </span>
                              <span className="text-xs font-bold text-gray-700">
                                {getStatus(
                                  bd.totalAchievedFromProjectedClients,
                                  bd.totalProjected,
                                  true
                                ).progress.toFixed(0)}
                                %
                              </span>
                            </div>
                            <div
                              className={`relative h-1.5 w-32 rounded-full overflow-hidden bg-white`}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${getStatus(
                                    bd.totalAchievedFromProjectedClients,
                                    bd.totalProjected,
                                    true
                                  ).progress.toFixed(0)}%`,
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${
                                  getStatus(
                                    bd.totalAchievedFromProjectedClients,
                                    bd.totalProjected,
                                    true
                                  ).progressColor
                                }`}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center w-[20%]">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                              getStatus(
                                bd.totalAchievedFromProjectedClients,
                                bd.totalProjected,
                                true
                              ).badgeColor
                            }`}
                          >
                            {
                              getStatus(
                                bd.totalAchievedFromProjectedClients,
                                bd.totalProjected,
                                true
                              ).icon
                            }
                            {
                              getStatus(
                                bd.totalAchievedFromProjectedClients,
                                bd.totalProjected,
                                true
                              ).text
                            }
                          </span>
                        </td>

                        <td className="px-2 py-2 w-[5%]"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const GraphView = ({ data, bdNames }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-600 py-10 text-lg rounded-2xl bg-white shadow-xl"
      >
        🚫 No data available for graphs
      </motion.div>
    );
  }

  const chartData = bdNames.map((bd) => {
    let bdProjected = 0;
    let bdAchieved = 0;

    data.forEach((client) => {
      if (client.bdData && client.bdData[bd.bdCode]) {
        bdProjected += client.bdData[bd.bdCode].projected || 0;
        bdAchieved += client.bdData[bd.bdCode].achieved || 0;
      }
    });

    return {
      name: bd.bdName,
      Projected: bdProjected,
      Achieved: bdAchieved,
    };
  });

  const filteredChartData = chartData.filter(
    (d) => d.Projected > 0 || d.Achieved > 0
  );

  if (filteredChartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-600 py-10 text-lg rounded-2xl bg-white shadow-xl"
      >
        📊 No projection or achievement data for the selected BDs.
      </motion.div>
    );
  }

  const Chart = ({ isModal }) => (
    <ResponsiveContainer width="100%" height={isModal ? 600 : 400}>
      <BarChart
        data={filteredChartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="colorAchieved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          fontSize={12}
          stroke="#6b7280"
        />
        <YAxis
          tickFormatter={(value) => `₹${formatAmount(value)}`}
          fontSize={12}
          stroke="#6b7280"
        />
        <Tooltip
          formatter={(value, name) => [`₹${formatAmount(value)}`, name]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          }}
          labelStyle={{ fontWeight: "bold", color: "#374151" }}
        />
        {!isModal && <Legend wrapperStyle={{ paddingTop: "20px" }} />}
        <Bar
          dataKey="Projected"
          fill="url(#colorProjected)"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          dataKey="Achieved"
          fill="url(#colorAchieved)"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl transition-all duration-300 p-8 border border-blue-100"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              BD Performance Comparison
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Visual comparison of Projected vs. Achieved values by BD
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFullScreen(true)}
            className="p-2.5 rounded-xl text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg transition-all duration-200"
          >
            <Maximize size={20} />
          </motion.button>
        </div>
        <div
          className="w-full bg-white rounded-2xl p-6 shadow-inner"
          style={{ height: "400px" }}
        >
          <Chart isModal={false} />
        </div>
      </motion.div>

      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-gray-900 bg-opacity-95 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-7xl mx-auto h-[90vh] w-full overflow-y-auto"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullScreen(false)}
                className="absolute top-4 right-4 p-2.5 rounded-xl text-white bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-lg transition-all duration-200 z-50"
              >
                <Minimize size={24} />
              </motion.button>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  BD Performance Comparison - Full View
                </h2>
                <p className="text-gray-500 mt-2">
                  Detailed comparison across all BDs
                </p>
              </div>
              <Chart isModal={true} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function BdPerformanceAnalysis({
  onMonthChange,
  username,
  designation,
  inquiriesData = [],
}) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const defaultDate = new Date();
    return `${defaultDate.getFullYear()}-${String(
      defaultDate.getMonth() + 1
    ).padStart(2, "0")}`;
  });
  const [selectedBDs, setSelectedBDs] = useState([]);
  const [excludeBDs, setExcludeBDs] = useState(false);
  const [bdOptions, setBdOptions] = useState([]);
  const [projections, setProjections] = useState([]);
  const [targets, setTargets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("cards");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState({ type: null, data: {} });

  const [activeBdActionbdCode, setActiveBdActionbdCode] = useState(null);
  const [activeClient, setActiveClient] = useState(null);

  // === Handlers ===
  const handleMonthChange = (monthValue) => {
    setSelectedMonth(monthValue);
  };

  const handleBDChange = (bdCodes) => {
    setSelectedBDs(bdCodes);
  };

  const handleDeselectAll = () => setSelectedBDs([]);
  const handleSelectAll = () => setSelectedBDs(bdOptions.map((bd) => bd.value));

  const handleClearFilters = () => {
    setSelectedMonth(() => {
      const defaultDate = new Date("2025-10-01");
      return `${defaultDate.getFullYear()}-${String(
        defaultDate.getMonth() + 1
      ).padStart(2, "0")}`;
    });
    setSelectedBDs(bdOptions.map((bd) => bd.bdCode));
    setExcludeBDs(false);
  };

  const handleManage = (action) => {
    setModalAction(action);
    setIsModalOpen(true);
  };

  // === Helpers ===
  const calculateMonthDateRange = (monthValue) => {
    const [y, m] = monthValue.split("-").map(Number);
    const fromDate = new Date(Date.UTC(y, m - 1, 1));
    const toDate = new Date(Date.UTC(y, m, 0));
    const formatDate = (date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    return { fromDate: formatDate(fromDate), toDate: formatDate(toDate) };
  };

  const fetchProjectionsAndTargets = async (monthValue, bdCodes) => {
    if (!bdCodes || bdCodes.length === 0) {
      setProjections([]);
      setTargets([]);
      return;
    }
    setIsLoading(true);
    try {
      // --- START FIX: Use projMonth and projYear for payload ---
      const [projYear, projMonth] = monthValue.split("-");
      const payload = { bdCodeList: bdCodes, projMonth, projYear };
      // --- END FIX ---

      const [projectionsData, targetsData] = await Promise.all([
        getAllBdProjection(payload),
        getAllBdTargets(payload),
      ]);
      setProjections(
        projectionsData.map((p) => ({
          id: p.id,
          bdCode: String(p.bdCode),
          clientCode: p.clientCode,
          clientName: p.clientName,
          ProjDate: p.projDate,
          BDName: p.bdName,
          remarks: p.remarks,
          projValWeek1: parseFloat(p.projValWeek1) || 0,
          projValWeek2: parseFloat(p.projValWeek2) || 0,
          projValWeek3: parseFloat(p.projValWeek3) || 0,
          projValWeek4: parseFloat(p.projValWeek4) || 0,
          projValWeek5: parseFloat(p.projValWeek5) || 0,
        }))
      );
      setTargets(
        targetsData.map((t) => ({
          ...t,
          bdCode: String(t.bdCode),
          TargetVal: parseFloat(t.targetVal) || 0,
          id: t.id,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch projections/targets:", error);
      setProjections([]);
      setTargets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    const effectiveBdCodes = excludeBDs
      ? bdOptions
          .filter((bd) => !selectedBDs.includes(bd.bdCode))
          .map((bd) => bd.bdCode)
      : selectedBDs;
    await fetchProjectionsAndTargets(selectedMonth, effectiveBdCodes);
  };

  useEffect(() => {
    const fetchBDs = async () => {
      setIsLoading(true);
      try {
        const { fromDate, toDate } = calculateMonthDateRange(selectedMonth);
        const bds = await getBdNames({ fromDate, toDate });
        const normalized = bds.map((bd) => ({
          value: String(bd.bdCode),
          label: bd.bdName,
          bdCode: String(bd.bdCode),
          bdName: bd.bdName,
        }));
        setBdOptions(normalized);
        if (normalized.length > 0 && selectedBDs.length === 0) {
          setSelectedBDs(normalized.map((bd) => bd.bdCode));
        } else if (normalized.length > 0 && selectedBDs.length > 0) {
          setSelectedBDs(
            selectedBDs.filter((bdCode) =>
              normalized.some((bd) => bd.bdCode === bdCode)
            )
          );
        } else {
          setSelectedBDs([]);
        }
      } catch (error) {
        console.error("Failed to fetch BD names:", error);
        setBdOptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBDs();
  }, [selectedMonth]);

  useEffect(() => {
    const effectiveBdCodes = excludeBDs
      ? bdOptions
          .filter((bd) => !selectedBDs.includes(bd.bdCode))
          .map((bd) => bd.bdCode)
      : selectedBDs;
    if (bdOptions.length > 0 && effectiveBdCodes.length === 0) {
      setIsLoading(false);
      setProjections([]);
      setTargets([]);
    } else if (bdOptions.length > 0) {
      fetchProjectionsAndTargets(selectedMonth, effectiveBdCodes);
    }
  }, [selectedMonth, selectedBDs, excludeBDs, bdOptions]);

  useEffect(() => {
    const effectiveBdObjects = bdOptions.filter((bd) =>
      excludeBDs
        ? !selectedBDs.includes(bd.bdCode)
        : selectedBDs.includes(bd.bdCode)
    );
    if (effectiveBdObjects.length > 0 && onMonthChange) {
      const { fromDate, toDate } = calculateMonthDateRange(selectedMonth);
      const bdNames = effectiveBdObjects.map((bd) => bd.bdName);
      const bdCodes = effectiveBdObjects.map((bd) => bd.bdCode);
      onMonthChange({
        fromDate,
        toDate,
        bdNames,
        bdCodes,
        dateField: "regisDate",
      });
    } else if (onMonthChange) {
      const { fromDate, toDate } = calculateMonthDateRange(selectedMonth);
      onMonthChange({
        fromDate,
        toDate,
        bdNames: [],
        bdCodes: [],
        dateField: "regisDate",
      });
    }
  }, [selectedMonth, selectedBDs, excludeBDs, bdOptions.length, onMonthChange]);

  const bdPerformanceData = useMemo(() => {
    const effectiveBdCodes = excludeBDs
      ? bdOptions
          .filter((bd) => !selectedBDs.includes(bd.bdCode))
          .map((bd) => bd.bdCode)
      : selectedBDs;
    const selectedBdData = bdOptions.filter((bd) =>
      effectiveBdCodes.includes(bd.bdCode)
    );

    return selectedBdData.map((bd) => {
      const bdProjections = projections.filter(
        (p) => String(p.bdCode) === bd.bdCode
      );
      const bdTarget = targets.find((t) => String(t.bdCode) === bd.bdCode);
      const bdInquiries = inquiriesData.filter((i) => i.bdName === bd.bdName);

      // --- START FIX: totalProjected scope fix ---
      const totalProjected = bdProjections.reduce((sum, proj) => {
        return sum + 
          (parseFloat(proj.projValWeek1) || 0) +
          (parseFloat(proj.projValWeek2) || 0) +
          (parseFloat(proj.projValWeek3) || 0) +
          (parseFloat(proj.projValWeek4) || 0) +
          (parseFloat(proj.projValWeek5) || 0);
      }, 0);
      // --- END FIX ---

      const totalAchieved = bdInquiries.reduce(
        (s, i) => s + (parseFloat(i.regisVal) || 0),
        0
      );

      // --- START FIX: totalTarget field fix ---
      const totalTarget = bdTarget ? bdTarget.TargetVal : 0;
      // --- END FIX ---
      const targetId = bdTarget ? bdTarget.id : null;

      const uniqueClientCodes = new Set([
        ...bdProjections.map((p) => p.clientCode),
        ...bdInquiries.map((i) => i.clientCode),
      ]);

      const clientDetails = Array.from(uniqueClientCodes)
        .map((code) => {
          const clientProjections = bdProjections.filter(
            (p) => p.clientCode === code
          );
          const clientInquiries = bdInquiries.filter(
            (i) => i.clientCode === code
          );

          const clientName =
            clientProjections[0]?.clientName ||
            clientInquiries[0]?.clientName ||
            "Unknown Client";

          const projected = clientProjections.reduce((sum, proj) => {
            return (
              sum +
              (parseFloat(proj.projValWeek1) || 0) +
              (parseFloat(proj.projValWeek2) || 0) +
              (parseFloat(proj.projValWeek3) || 0) +
              (parseFloat(proj.projValWeek4) || 0) +
              (parseFloat(proj.projValWeek5) || 0)
            );
          }, 0);

          const achieved = clientInquiries.reduce(
            (sum, i) => sum + (parseFloat(i.regisVal) || 0),
            0
          );

          return {
            clientName,
            clientCode: code,
            projected,
            achieved,
            projections: clientProjections,
          };
        })
        .filter((c) => c.projected > 0 || c.achieved > 0)
        .sort((a, b) => a.clientName.localeCompare(b.clientName));

      const totalAchievedFromProjectedClients = clientDetails
        .filter((c) => c.projected > 0)
        .reduce((s, c) => s + c.achieved, 0);

      return {
        bdName: bd.bdName,
        bdCode: bd.bdCode,
        totalProjected,
        totalAchieved,
        totalTarget,
        targetId,
        clientCount: clientDetails.length,
        projectionCount: bdProjections.length,
        clients: clientDetails,
        totalAchievedFromProjectedClients,
      };
    });
  }, [projections, targets, inquiriesData, bdOptions, selectedBDs, excludeBDs]);

  const overallStats = useMemo(() => {
    const totalProjected = bdPerformanceData.reduce(
      (s, b) => s + b.totalProjected,
      0
    );
    const totalAchieved = bdPerformanceData.reduce(
      (s, b) => s + b.totalAchieved,
      0
    );
    const totalTarget = bdPerformanceData.reduce(
      (s, b) => s + b.totalTarget,
      0
    );
    return {
      totalProjected,
      totalAchieved,
      totalTarget,
      activeBDs: bdPerformanceData.length,
    };
  }, [bdPerformanceData]);

  const bdAchievementSummary = useMemo(() => {
    let achievedCount = 0;
    let notAchievedCount = 0;

    const bdsWithTarget = bdPerformanceData.filter((bd) => bd.totalTarget > 0);

    bdsWithTarget.forEach((bd) => {
      const { text } = getStatus(bd.totalAchieved, bd.totalTarget);

      if (text === "Achieved") {
        achievedCount += 1;
      } else if (text === "Partial Achieved" || text === "Not Achieved") {
        notAchievedCount += 1;
      }
    });

    const totalBdsWithTarget = achievedCount + notAchievedCount;
    const progressPercentage =
      totalBdsWithTarget > 0 ? (achievedCount / totalBdsWithTarget) * 100 : 0;

    return {
      achievedCount,
      notAchievedCount,
      totalBdsWithTarget,
      progressPercentage: Math.min(progressPercentage, 100),
    };
  }, [bdPerformanceData]);

  const selectedBdObjects = bdOptions.filter((bd) =>
    excludeBDs
      ? !selectedBDs.includes(bd.bdCode)
      : selectedBDs.includes(bd.bdCode)
  );

  const clientComparisonData = useMemo(() => {
    const dataMap = {};

    bdPerformanceData.forEach((bd) => {
      bd.clients.forEach((client) => {
        if (!dataMap[client.clientCode]) {
          dataMap[client.clientCode] = {
            clientName: client.clientName,
            clientCode: client.clientCode,
            bdData: {},
          };
        }
        dataMap[client.clientCode].bdData[bd.bdCode] = {
          projected: client.projected,
          achieved: client.achieved,
        };
      });
    });

    return Object.values(dataMap);
  }, [bdPerformanceData]);

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl shadow-2xl mb-8 bg-white border border-gray-200"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 opacity-95"></div>
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
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
                <Trophy className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  BD Performance Analysis
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Compare and analyze BD performance across clients with weekly
                  projections
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right flex-shrink-0">
              <div className="text-white">
                <p className="text-lg font-semibold leading-snug">{username}</p>
                <p className="text-blue-200 text-xs font-medium leading-snug">
                  {designation}
                </p>
              </div>
              <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8"
        >
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-4">
              <label className="text-xs font-medium mb-2 text-gray-600 block">
                  Select Month
                </label>
              <Dropdown
                options={MONTH_OPTIONS}
                selected={selectedMonth}
                onSelect={handleMonthChange}
                label="Select Month"
                icon={Calendar}
                placeholder="Choose month"
              />
            </div>
            <div className="lg:col-span-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600 block">
                  Select BDs
                </label>
                <ExcludeToggle enabled={excludeBDs} onChange={setExcludeBDs} />
              </div>
              <Dropdown
                options={bdOptions}
                selected={selectedBDs}
                onSelect={handleBDChange}
                icon={Users}
                label="BDs"
                placeholder="Choose BDs"
                multiple={true}
                onDeselectAll={handleDeselectAll}
                onSelectAll={handleSelectAll}
                isExcluded={excludeBDs}
              />
            </div>
            <div className="lg:col-span-2 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearFilters}
                className="flex items-center gap-2 text-sm px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RefreshCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Target"
            value={`₹${formatAmount(overallStats.totalTarget)}`}
            icon={Target}
            borderColor="border-blue-500"
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
            textColor="text-blue-700"
            isLoading={isLoading}
          />
          <SummaryCard
            title="Total Achieved"
            value={`₹${formatAmount(overallStats.totalAchieved)}`}
            icon={CheckCircle2}
            borderColor="border-green-500"
            bgColor="bg-green-100"
            iconColor="text-green-600"
            textColor="text-green-700"
            isLoading={isLoading}
          />
          <SummaryCard
            title="Active BDs"
            value={selectedBdObjects.length}
            icon={Users}
            borderColor="border-teal-500"
            bgColor="bg-teal-100"
            iconColor="text-teal-600"
            textColor="text-teal-700"
            isLoading={isLoading}
          />
          <BDPerformanceSummaryCard
            achieved={bdAchievementSummary.achievedCount}
            notAchieved={bdAchievementSummary.notAchievedCount}
            progress={bdAchievementSummary.progressPercentage}
            isLoading={isLoading}
          />
        </div>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-2xl shadow-xl"
          >
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          </motion.div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md"
                >
                  <Users className="w-5 h-5 text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-gray-900">
                  BD Performance Overview ({selectedBdObjects.length})
                </h2>
              </div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex rounded-2xl border-2 border-blue-200 bg-white p-1.5 shadow-xl"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView("cards")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 relative overflow-hidden ${
                    view === "cards"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {view === "cards" && (
                    <motion.div
                      className="absolute inset-0 bg-white opacity-20"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  )}
                  <List className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Table View</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView("graph")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 relative overflow-hidden ${
                    view === "graph"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {view === "graph" && (
                    <motion.div
                      className="absolute inset-0 bg-white opacity-20"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  )}
                  <BarChart3 className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Graph View</span>
                </motion.button>
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              {view === "cards" ? (
                <motion.div
                  key="cards"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {bdPerformanceData.map((bd) => (
                    <BDPerformanceTableCard
                      key={bd.bdCode}
                      bd={bd}
                      isLoading={isLoading}
                      clients={bd.clients}
                      onTargetManage={handleManage}
                      onProjectionManage={handleManage}
                      activeBdActionbdCode={activeBdActionbdCode}
                      setActiveBdActionbdCode={(bdCode) => {
                        if (bdCode === null) {
                          setActiveBdActionbdCode(null);
                        } else {
                          setActiveBdActionbdCode(bdCode);
                          if (
                            activeClient &&
                            activeClient.bdbdCode !== bdCode
                          ) {
                            setActiveClient(null);
                          }
                        }
                      }}
                      activeClient={activeClient}
                      setActiveClient={(val) => {
                        setActiveClient(val);
                      }}
                      inquiriesData={inquiriesData}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="graph"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GraphView
                    data={clientComparisonData}
                    bdNames={selectedBdObjects}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ManagementModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            action={modalAction}
            refreshData={refreshData}
            month={selectedMonth}
            bdOptions={bdOptions}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
