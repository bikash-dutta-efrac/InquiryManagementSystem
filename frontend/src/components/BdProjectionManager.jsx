import { useState, useMemo, useEffect, useRef } from "react";
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Building2,
  X,
  Check,
  ChevronDown,
  FileText,
  Edit2,
  Trash2,
  Search,
  DollarSign,
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  BarChart3,
  List,
  Maximize,
  Minimize,
  GitCompare,
  AlertCircle,
  Activity,
  Zap,
  MapPin,
  User,
  IndianRupeeIcon,
  BriefcaseBusiness,
  ChevronRight,
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
import { MdLocationCity, MdPerson } from "react-icons/md";

import {
  createBdProjection,
  getAllBdProjection,
  getAllBdTargets,
  getAssociateClients,
  updateBdProjection,
} from "../services/api";


let BdName = "John Doe";
let BdCode = "BD001";
let Designation = "Business Developer";

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

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    const options = { day: "numeric", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options).replace(/, /g, ", ");
  } catch {
    return "Invalid Date";
  }
}

const generateMonthOptions = () => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
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

const Dropdown = ({ options, selected, onSelect, label, icon: Icon, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const filteredOptions = options.filter((o) =>
    o?.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const selectedOption = options.find((o) => o.value === selected);
  const displayValue = selectedOption ? selectedOption.label : placeholder;
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="text-xs font-medium text-gray-600 block mb-1.5">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 text-left hover:shadow-md flex justify-between items-center transition-all duration-200"
      >
        <span className="flex items-center gap-2.5 text-sm">
          <Icon className="w-4 h-4 text-blue-600" />
          <span className={selectedOption ? "text-gray-700 font-medium" : "text-gray-500 font-medium"}>
            {displayValue}
          </span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
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
            <ul className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredOptions.map((o) => (
                <li
                  key={o.value}
                  onClick={() => {
                    onSelect(o.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150 ${
                    selected === o.value
                      ? "bg-blue-50 text-blue-800 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {o.label}
                  {selected === o.value && (
                    <Check className="w-4 h-4 text-blue-600 float-right" />
                  )}
                </li>
              ))}
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

const UpdateProjectionModal = ({ isOpen, onClose, onUpdate, projection, selectedMonth }) => {
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projection && isOpen) {
      setFormData({
        week1Val: projection.projValWeek1 || "",
        week1Remarks: projection.remarksWeek1 || "",
        week2Val: projection.projValWeek2 || "",
        week2Remarks: projection.remarksWeek2 || "",
        week3Val: projection.projValWeek3 || "",
        week3Remarks: projection.remarksWeek3 || "",
        week4Val: projection.projValWeek4 || "",
        week4Remarks: projection.remarksWeek4 || "",
        week5Val: projection.projValWeek5 || "",
        week5Remarks: projection.remarksWeek5 || "",
      });
    }
  }, [projection, isOpen]);

  const monthOption = MONTH_OPTIONS.find(opt => opt.value === selectedMonth);
  const currentWeek = getCurrentWeek();
  const isCurrentMonthSelected = isCurrentMonth(monthOption?.month, monthOption?.year);

  const getWeekState = (weekNum) => {
    if (!isCurrentMonthSelected) {
      return { valueDisabled: false, remarksDisabled: false, state: 'future' };
    }
    
    if (weekNum < currentWeek) {
      return { valueDisabled: true, remarksDisabled: true, state: 'past' };
    } else if (weekNum === currentWeek) {
      return { valueDisabled: true, remarksDisabled: false, state: 'current' };
    } else {
      return { valueDisabled: false, remarksDisabled: false, state: 'future' };
    }
  };

  const handleSubmit = async () => {
    if (!projection) return;

    setIsLoading(true);

    try {
      const apiPayload = {
        bdCode: projection.bdCode,
        clientCode: projection.clientCode,
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

      await updateBdProjection(projection.id, apiPayload);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to update projection:", error);
      alert(`Failed to update projection. Please try again. Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !projection) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.5 }}
              className="p-2 rounded-lg bg-white/20 backdrop-blur-sm"
            >
              <Edit2 className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Update Projection</h2>
              <p className="text-blue-100 text-sm">{projection.clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <Building2 className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Client</p>
              <p className="text-base font-bold text-gray-900">{projection.clientName}</p>
              <p className="text-xs text-gray-500">{projection.clientCode}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5].map((week) => {
              const weekState = getWeekState(week);
              const isPast = weekState.state === 'past';
              const isCurrent = weekState.state === 'current';
              
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
                    <Calendar className={`w-4 h-4 ${isPast ? "text-gray-400" : isCurrent ? "text-blue-600" : "text-gray-600"}`} />
                    <h3 className={`text-sm font-bold ${isPast ? "text-gray-400" : isCurrent ? "text-blue-700" : "text-gray-700"}`}>
                      Week {week}
                      {isCurrent && <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">Current - Value Locked</span>}
                      {isPast && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Past - Locked</span>}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1.5">
                        Projection Value (₹)
                        {isCurrent && <span className="ml-1 text-blue-600">(Locked)</span>}
                      </label>
                      <div className="relative">
                        <IndianRupeeIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${weekState.valueDisabled ? 'text-gray-400' : 'text-blue-600'}`} />
                        <input
                          type="number"
                          disabled={weekState.valueDisabled}
                          value={formData[`week${week}Val`]}
                          onChange={(e) => setFormData({ ...formData, [`week${week}Val`]: e.target.value })}
                          placeholder={weekState.valueDisabled ? (isCurrent ? "Current week locked" : "Past week locked") : "Enter value"}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1.5">
                        Remarks {isCurrent && <span className="text-blue-600">(Editable)</span>}
                      </label>
                      <textarea
                        disabled={weekState.remarksDisabled}
                        value={formData[`week${week}Remarks`]}
                        onChange={(e) => setFormData({ ...formData, [`week${week}Remarks`]: e.target.value })}
                        placeholder={weekState.remarksDisabled ? "Past week locked" : "Add notes..."}
                        rows={2}
                        className={`w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
                          isCurrent ? 'focus:ring-blue-500 border-blue-300' : 'focus:ring-blue-500'
                        } focus:border-transparent bg-white text-sm resize-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Updating..." : "Update Projection"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ClientsDropdown = ({ options, selected, onSelect, label, icon: Icon, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const normalizedOptions = options.map((o) => ({
    ...o,
    value: o.value || o.clientCode || o.id,
  }));

  const filteredOptions = normalizedOptions.filter(
    (o) =>
      o?.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o?.clientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedOption = normalizedOptions.find((o) => o.value === selected);
  const displayValue = selectedOption ? selectedOption.clientName : placeholder;

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="mb-2">
        <label className="text-xs font-medium text-gray-600 block mb-1.5">
          {label}
        </label>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-blue-200 rounded-xl shadow-sm px-4 py-3.5 text-left hover:border-blue-400 hover:shadow-lg flex justify-between items-center transition-all duration-300 group"
      >
        <div className="flex items-center gap-2.5 text-sm">
          {Icon && <Icon className="h-4 w-4 text-blue-600" />}
          <span className={selectedOption ? "text-gray-700 font-medium" : "text-gray-500"}>
            {displayValue}
          </span>
        </div>
        <ChevronDown className={`h-5 w-5 text-blue-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-blue-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
              <input
                type="text"
                placeholder="Search by name, code or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border-2 border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100 custom-scrollbar">
            {filteredOptions.map((o) => {
              return (
                <div
                  key={o.value}
                  onClick={() => {
                    onSelect(o.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className="mx-2 my-2 p-4 rounded-xl cursor-pointer transition-all duration-200 border bg-white border-transparent hover:border-blue-400 hover:shadow-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:scale-[1.01] group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                        <div className="flex items-center gap-2 text-gray-900">
                          <BriefcaseBusiness className="h-4 w-4 flex-shrink-0 text-blue-500 group-hover:text-blue-700" />
                          <span className="font-bold text-sm truncate group-hover:text-blue-900">
                            {o.clientName}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-700 transition-all duration-200">
                          {o.clientCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-xs text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 group-hover:text-blue-600" />
                          <span className="flex-1 inline-block max-w-[300px] truncate group-hover:text-gray-800">
                            {o.address}
                            {o.unit !== null && o.unit !== "-" && `, ${o.unit}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MdLocationCity className="h-3.5 w-3.5 flex-shrink-0 text-blue-500 group-hover:text-blue-600" />
                          <span className="font-medium group-hover:text-gray-800">
                            {o.city} - {o.pin}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {!filteredOptions.length && (
              <div className="px-4 py-12 text-center">
                <div className="text-gray-400 mb-2">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  No clients found
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Try a different search term
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AddProjectionModal = ({ isOpen, onClose, onAdd, clients, selectedMonth, existingProjections }) => {
  const [formData, setFormData] = useState({
    clientCode: "",
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
  const [isLoading, setIsLoading] = useState(false);

  const monthOption = MONTH_OPTIONS.find(opt => opt.value === selectedMonth);
  const currentWeek = getCurrentWeek();
  const isCurrentMonthSelected = isCurrentMonth(monthOption?.month, monthOption?.year);

  const getWeekDisabledState = (weekNum) => {
    if (!isCurrentMonthSelected) return false;
    return weekNum < currentWeek;
  };

  const existingClientCodes = new Set((existingProjections || []).map(p => p.clientCode));
  const availableClients = clients.filter(c => !existingClientCodes.has(c.clientCode));

  const handleSubmit = async () => {
    if (!formData.clientCode) {
      alert("Please select a client.");
      return;
    }

    const week1Val = parseFloat(formData.week1Val) || 0;
    const week2Val = parseFloat(formData.week2Val) || 0;
    const week3Val = parseFloat(formData.week3Val) || 0;
    const week4Val = parseFloat(formData.week4Val) || 0;
    const week5Val = parseFloat(formData.week5Val) || 0;

    if (week1Val === 0 && week2Val === 0 && week3Val === 0 && week4Val === 0 && week5Val === 0) {
      alert("Please enter at least one week projection value.");
      return;
    }

    setIsLoading(true);

    try {
      const apiPayload = {
        bdCode: BdCode,
        clientCode: formData.clientCode,
        projValWeek1: week1Val || null,
        projDateWeek1: week1Val > 0 ? new Date().toISOString() : null,
        remarksWeek1: formData.week1Remarks || null,
        revisedValWeek1: null,
        reviseDateWeek1: null,
        projValWeek2: week2Val || null,
        projDateWeek2: week2Val > 0 ? new Date().toISOString() : null,
        remarksWeek2: formData.week2Remarks || null,
        revisedValWeek2: null,
        reviseDateWeek2: null,
        projValWeek3: week3Val || null,
        projDateWeek3: week3Val > 0 ? new Date().toISOString() : null,
        remarksWeek3: formData.week3Remarks || null,
        revisedValWeek3: null,
        reviseDateWeek3: null,
        projValWeek4: week4Val || null,
        projDateWeek4: week4Val > 0 ? new Date().toISOString() : null,
        remarksWeek4: formData.week4Remarks || null,
        revisedValWeek4: null,
        reviseDateWeek4: null,
        projValWeek5: week5Val || null,
        projDateWeek5: week5Val > 0 ? new Date().toISOString() : null,
        remarksWeek5: formData.week5Remarks || null,
        revisedValWeek5: null,
        reviseDateWeek5: null,
      };

      await createBdProjection(apiPayload);
      onAdd();
      setFormData({
        clientCode: "",
        week1Val: "", week1Remarks: "",
        week2Val: "", week2Remarks: "",
        week3Val: "", week3Remarks: "",
        week4Val: "", week4Remarks: "",
        week5Val: "", week5Remarks: "",
      });
      onClose();
    } catch (error) {
      console.error("Failed to add projection:", error);
      alert(`Failed to add projection. Please try again. Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const normalizedClients = availableClients.map((c) => ({
    clientCode: c.clientCode,
    clientName: c.clientName,
    address: c.address,
    unit: c.unit,
    pin: c.pin,
    city: c.city,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.5 }}
              className="p-2 rounded-lg bg-white/20 backdrop-blur-sm"
            >
              <Plus className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">Add New Projection</h2>
              <p className="text-blue-100 text-sm">Enter weekly projection details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
          <ClientsDropdown
            options={normalizedClients}
            selected={formData.clientCode}
            onSelect={(value) => setFormData({ ...formData, clientCode: value })}
            label="Select Client"
            icon={Building2}
            placeholder="Choose a client"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5].map((week) => {
              const isDisabled = getWeekDisabledState(week);
              const isCurrent = isCurrentMonthSelected && week === currentWeek;
              return (
                <div
                  key={week}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isDisabled
                      ? "bg-gray-50 border-gray-200 opacity-60"
                      : isCurrent
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className={`w-4 h-4 ${isDisabled ? "text-gray-400" : isCurrent ? "text-blue-600" : "text-gray-600"}`} />
                    <h3 className={`text-sm font-bold ${isDisabled ? "text-gray-400" : isCurrent ? "text-blue-700" : "text-gray-700"}`}>
                      Week {week}
                      {isCurrent && <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">Current</span>}
                      {isDisabled && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Past</span>}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1.5">
                        Projection Value (₹)
                      </label>
                      <div className="relative">
                        <IndianRupeeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                        <input
                          type="number"
                          disabled={isDisabled}
                          value={formData[`week${week}Val`]}
                          onChange={(e) => setFormData({ ...formData, [`week${week}Val`]: e.target.value })}
                          placeholder={isDisabled ? "Not editable" : "Enter value"}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1.5">
                        Remarks (Optional)
                      </label>
                      <textarea
                        disabled={isDisabled}
                        value={formData[`week${week}Remarks`]}
                        onChange={(e) => setFormData({ ...formData, [`week${week}Remarks`]: e.target.value })}
                        placeholder={isDisabled ? "Not editable" : "Add notes..."}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm resize-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Adding..." : "Add Projection"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SummaryCard = ({ title, value, icon: Icon, borderColor, bgColor, iconColor, textColor, isLoading = false, loader: Loader }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
    className={`bg-white p-6 rounded-xl shadow-lg border-t-4 ${borderColor} transform transition-all duration-300`}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium uppercase text-gray-500">{title}</span>
      <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className={`p-2 rounded-lg ${bgColor}`}>
        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
      </motion.div>
    </div>
    <p className={`text-3xl mt-6 font-extrabold ${textColor} flex items-center gap-1`}>
      {isLoading && Loader ? <Loader className={`w-6 h-6 animate-spin ${iconColor}`} /> : value}
    </p>
  </motion.div>
);

const TargetAchievementCard = ({ totalTarget, totalAchieved, isLoading }) => {
  const status = getStatus(totalAchieved, totalTarget, false);
  let percentage = status.progress;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-100 p-6 overflow-hidden relative"
    >
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #0ea5e9 0, #0ea5e9 1px, transparent 0, transparent 50%)`,
            backgroundSize: "5px 5px",
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg"
            >
              <Target className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Target Achievement</h3>
              <p className="text-sm text-gray-500">Achievement against official target</p>
            </div>
          </div>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border-2 ${status.badgeColor}`}
          >
            {status.icon}
            {status.text}
          </motion.span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase opacity-90">Target</span>
            </div>
            <p className="text-2xl font-bold">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `₹${formatAmount(totalTarget)}`}
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase opacity-90">Achieved</span>
            </div>
            <p className="text-2xl font-bold">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `₹${formatAmount(totalAchieved)}`}
            </p>
          </motion.div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Achievement Progress</span>
            <span className="text-lg font-bold text-gray-800">{percentage.toFixed(1)}%</span>
          </div>
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${status.progressColor} relative overflow-hidden`}
            >
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>₹0</span>
            <span>₹{formatAmount(totalTarget)}</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-blue-100 grid grid-cols-2 gap-4"
        >
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Remaining</p>
            <p className="text-lg font-bold text-orange-600">₹{formatAmount(Math.max(0, totalTarget - totalAchieved))}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <div className="flex items-center justify-center gap-1">
              <Zap className={`w-4 h-4 ${status.text === "Achieved" ? "text-green-500" : status.text === "Partial Achieved" ? "text-yellow-500" : "text-red-500"}`} />
              <p className={`text-lg font-bold ${status.text === "Achieved" ? "text-green-600" : status.text === "Partial Achieved" ? "text-yellow-600" : "text-red-600"}`}>
                {status.text === "Achieved" ? "On Track" : status.text === "Partial Achieved" ? "In Progress" : "Behind"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ProjectionAchievementCard = ({ totalProjected, totalAchieved, isLoading }) => {
  const status = getStatus(totalAchieved, totalProjected);
  let percentage = status.progress;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border border-purple-100 p-6 overflow-hidden relative"
    >
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #8b5cf6 0, #8b5cf6 1px, transparent 0, transparent 50%)`,
            backgroundSize: "5px 5px",
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ x: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-lg"
            >
              <GitCompare className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Projection Achievement</h3>
              <p className="text-sm text-gray-500">Achievement against projected value</p>
            </div>
          </div>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border-2 ${status.badgeColor}`}
          >
            {status.icon}
            {status.text}
          </motion.span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase opacity-90">Projected</span>
            </div>
            <p className="text-2xl font-bold">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `₹${formatAmount(totalProjected)}`}
            </p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase opacity-90">Achieved</span>
            </div>
            <p className="text-2xl font-bold">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `₹${formatAmount(totalAchieved)}`}
            </p>
          </motion.div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Execution Progress</span>
            <span className="text-lg font-bold text-gray-800">
              {totalProjected === 0 && totalAchieved > 0 ? "N/A" : `${Math.min(percentage, 100).toFixed(1)}%`}
            </span>
          </div>
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${status.text === "Not Achieved" ? 100 : Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${status.progressColor} relative overflow-hidden`}
            >
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>₹0</span>
            <span>₹{formatAmount(totalProjected)}</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-purple-100 grid grid-cols-2 gap-4"
        >
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Left to Execute</p>
            <p className="text-lg font-bold text-red-600">₹{formatAmount(Math.max(0, totalProjected - totalAchieved))}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Execution Status</p>
            <div className="flex items-center justify-center gap-1">
              <Activity className={`w-4 h-4 ${status.text === "Achieved" ? "text-green-500" : status.text === "Partial Achieved" ? "text-yellow-500" : "text-red-500"}`} />
              <p className={`text-lg font-bold ${status.text === "Achieved" ? "text-green-600" : status.text === "Partial Achieved" ? "text-yellow-600" : "text-red-600"}`}>
                {status.text === "Achieved" ? "Completed" : status.text === "Partial Achieved" ? "In Execution" : "Stalled"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ProjectionCard = ({ projection, onEdit }) => {
  const weeklyData = [
    { week: 1, value: projection.projValWeek1, remarks: projection.remarksWeek1, revised: projection.revisedValWeek1 },
    { week: 2, value: projection.projValWeek2, remarks: projection.remarksWeek2, revised: projection.revisedValWeek2 },
    { week: 3, value: projection.projValWeek3, remarks: projection.remarksWeek3, revised: projection.revisedValWeek3 },
    { week: 4, value: projection.projValWeek4, remarks: projection.remarksWeek4, revised: projection.revisedValWeek4 },
    { week: 5, value: projection.projValWeek5, remarks: projection.remarksWeek5, revised: projection.revisedValWeek5 },
  ].filter(w => w.value !== null && w.value !== undefined && w.value > 0);

  const totalProjection = weeklyData.reduce((sum, w) => sum + (parseFloat(w.value) || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md"
            >
              <Building2 className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-sm max-w-[200px] font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate whitespace-nowrap overflow-hidden">
                {projection.clientName}
              </h3>
              <p className="text-[11px] text-gray-500">{projection.clientCode}</p>
            </div>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(projection)}
              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <span className="text-xs font-medium text-gray-600">Total Projection</span>
            <span className="text-lg font-bold text-green-700 flex items-center gap-1">
              ₹{formatAmount(totalProjection)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-700 mb-2">Weekly Breakdown:</h4>
          {weeklyData.map((w) => (
            <div key={w.week} className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-blue-700">Week {w.week}</span>
                <span className="text-sm font-bold text-blue-900">₹{formatAmount(w.value)}</span>
              </div>
              {w.remarks && (
                <p className="text-xs text-gray-600 mt-1">{w.remarks}</p>
              )}
              {w.revised && w.revised !== w.value && (
                <p className="text-xs text-orange-600 mt-1 font-medium">
                  Revised: ₹{formatAmount(w.revised)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const ClientTableRow = ({ clientData, projection, isExpanded, onToggle, onEdit, inquiriesData }) => {
  const status = getStatus(clientData.achieved, clientData.projected);
  
  const weeklyData = projection ? [
    { week: 1, value: projection.projValWeek1, remarks: projection.remarksWeek1 },
    { week: 2, value: projection.projValWeek2, remarks: projection.remarksWeek2 },
    { week: 3, value: projection.projValWeek3, remarks: projection.remarksWeek3 },
    { week: 4, value: projection.projValWeek4, remarks: projection.remarksWeek4 },
    { week: 5, value: projection.projValWeek5, remarks: projection.remarksWeek5 },
  ] : [];

  // Calculate weekly achievements from inquiries data
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

  const weeklyAchievements = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  };

  if (inquiriesData && clientData.clientCode) {
    inquiriesData
      .filter(inq => inq.clientCode === clientData.clientCode)
      .forEach(inq => {
        const week = getWeekFromDate(inq.regisDate);
        if (week && inq.regisVal) {
          weeklyAchievements[week] += parseFloat(inq.regisVal) || 0;
        }
      });
  }

  // Enhance weekly data with achievements
  const enhancedWeeklyData = weeklyData.map(week => ({
    ...week,
    achieved: weeklyAchievements[week.week] || 0,
    progress: week.value > 0 ? Math.min((weeklyAchievements[week.week] / week.value) * 100, 100) : 0
  }));

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onToggle}
        className="group transition-all duration-150 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-indigo-50/70 bg-white"
      >
        <td className="px-4 py-4 text-left">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.3 }}
              className="p-2 rounded-lg bg-gray-100"
            >
              <ChevronRight className="w-4 h-4 text-blue-500" />
            </motion.div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-gray-900">
                <span className="font-medium text-sm truncate group-hover:text-blue-900">
                  {clientData.clientName}
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-700 transition-all duration-200">
                {clientData.clientCode}
              </span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-sm text-blue-600 font-semibold">
            ₹{formatAmount(clientData.projected)}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-sm text-green-600 font-semibold">
            ₹{formatAmount(clientData.achieved)}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <div className="relative w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${status.progress}%` }}
                transition={{ duration: 1 }}
                className={`h-full ${status.progressColor}`}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 w-10 text-right">
              {status.progress.toFixed(0)}%
            </span>
          </div>
        </td>
        <td className="px-2 py-2 text-center">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${status.badgeColor}`}>
            {status.icon}
            {status.text}
          </span>
        </td>
      </motion.tr>

      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-br from-slate-50 to-blue-50"
          >
            <td colSpan="5" className="px-4 py-4">
              <div className="pl-8">
                {projection ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-700">Weekly Projection & Achievement Analysis</h4>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(projection);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all duration-200"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit Projection
                      </motion.button>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white">
                      <table className="min-w-full border-collapse">
                        <thead className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600">
                          <tr>
                            <th className="px-4 py-2 text-left text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20">Week</th>
                            <th className="px-4 py-2 text-center text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20">Projected</th>
                            <th className="px-4 py-2 text-center text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20">Achieved</th>
                            <th className="px-4 py-2 text-center text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20">Progress</th>
                            <th className="px-4 py-2 text-left text-[10px] font-bold text-white uppercase tracking-wide">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {enhancedWeeklyData.map((week, index) => {
                            const hasValue = week.value && week.value > 0;
                            const weekStatus = getStatus(week.achieved, week.value, true);
                            
                            return (
                              <tr key={week.week} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${!hasValue ? 'opacity-40' : ''}`}>
                                <td className="px-4 py-2 text-left border-r border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-blue-500" />
                                    <span className="text-xs font-semibold text-gray-700">Week {week.week}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-center border-r border-gray-100">
                                  <span className={`text-sm font-bold ${hasValue ? 'text-blue-700' : 'text-gray-400'}`}>
                                    {hasValue ? `₹${formatAmount(week.value)}` : 'Not Set'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-center border-r border-gray-100">
                                  <span className={`text-sm font-bold ${week.achieved > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                                    ₹{formatAmount(week.achieved)}
                                  </span>
                                </td>
                                <td className="px-4 py-2 border-r border-gray-100">
                                  {hasValue ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="relative w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${week.progress}%` }}
                                          transition={{ duration: 1, delay: index * 0.1 }}
                                          className={`h-full ${weekStatus.progressColor}`}
                                        />
                                      </div>
                                      <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                                        {week.progress.toFixed(0)}%
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400 text-center block">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-left">
                                  <span className="text-xs text-gray-600">
                                    {week.remarks || '-'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
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
                                ₹{formatAmount(clientData.projected)}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center border-r border-blue-200">
                              <span className="text-sm font-extrabold text-green-900">
                                ₹{formatAmount(clientData.achieved)}
                              </span>
                            </td>
                            <td className="px-4 py-2 border-r border-blue-200">
                              <div className="flex items-center justify-center gap-2">
                                <div className="relative w-20 h-1.5 bg-white rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${status.progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full ${status.progressColor}`}
                                  />
                                </div>
                                <span className="text-xs font-bold text-gray-700">
                                  {status.progress.toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${status.badgeColor}`}>
                                {status.icon}
                                {status.text}
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
                    No projection data available for this client
                  </div>
                )}
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
};

const TableView = ({ data, projections, onEdit, inquiriesData }) => {
  const [expandedClient, setExpandedClient] = useState(null);

  if (!data.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-600 py-20 text-xl font-medium"
      >
        🚫 No data found for the selected period.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-white"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white">
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide">Client Name</th>
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide">Projected Value</th>
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide">Achieved Value</th>
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide">Progress</th>
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, index) => {
              const projection = projections.find(p => p.clientCode === item.clientCode);
              const isExpanded = expandedClient === item.clientCode;
              
              return (
                <ClientTableRow
                  key={item.clientCode}
                  clientData={item}
                  projection={projection}
                  isExpanded={isExpanded}
                  onToggle={() => setExpandedClient(isExpanded ? null : item.clientCode)}
                  onEdit={onEdit}
                  inquiriesData={inquiriesData}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const GraphView = ({ data }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-600 py-10 text-lg rounded-2xl bg-white shadow-xl"
      >
        🚫 No data available for projection graphs
      </motion.div>
    );
  }

  const chartData = data.map((item) => {
    const remaining = item.projectedValue - item.achievedValue;
    const achievedUpToProjection = Math.min(item.achievedValue, item.projectedValue);
    const overAchievedAmount = Math.max(0, item.achievedValue - item.projectedValue);

    return {
      name: item.clientName,
      Achieved: achievedUpToProjection,
      Remaining: Math.max(0, remaining),
      NotProjected: overAchievedAmount,
    };
  });

  const Chart = ({ isModal }) => (
    <ResponsiveContainer width="100%" height={isModal ? 600 : 400}>
      <BarChart data={chartData}>
        <defs>
          <linearGradient id="colorAchieved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="colorNotProjected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={30} fontSize={0} stroke="#6b7280" />
        <YAxis tickFormatter={(value) => `₹${formatAmount(value)}`} fontSize={isModal ? 14 : 12} stroke="#6b7280" />
        <Tooltip
          formatter={(value) => `₹${formatAmount(value)}`}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          }}
        />
        {!isModal && <Legend wrapperStyle={{ paddingTop: "20px" }} />}
        <Bar dataKey="Achieved" stackId="a" fill="url(#colorAchieved)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Remaining" stackId="a" fill="url(#colorRemaining)" radius={[8, 8, 0, 0]} />
        <Bar dataKey="NotProjected" stackId="a" name="Over-Achieved" fill="url(#colorNotProjected)" radius={[8, 8, 0, 0]} />
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
              Client Projection Analysis
            </h2>
            <p className="text-sm text-gray-500 mt-1">Visual comparison of Projected vs. Achieved values by Client</p>
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
        <div className="w-full bg-white rounded-2xl p-6 shadow-inner" style={{ height: "400px" }}>
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
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
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
                  Client Projection Analysis - Full View
                </h2>
                <p className="text-gray-500 mt-2">Detailed comparison across all clients</p>
              </div>
              <Chart isModal={true} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function BDProjectionManager({ bdCode, username, designation, onMonthChange, inquiriesData }) {
  BdCode = bdCode || "BD001";
  BdName = username || "John Doe";
  Designation = designation || "Business Developer";

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projections, setProjections] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [isLoadingProjections, setIsLoadingProjections] = useState(false);
  const [targets, setTargets] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonView, setComparisonView] = useState("table");
  const [currentBd, setCurrentBd] = useState(BdName);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProjection, setSelectedProjection] = useState(null);

  const selectedMonthOption = MONTH_OPTIONS.find(opt => opt.value === selectedMonth);
  const canAddProjection = selectedMonthOption && !isPastMonth(selectedMonthOption.month, selectedMonthOption.year);

  const fetchProjections = async (monthValue) => {
    setIsLoadingProjections(true);
    try {
      const monthOption = MONTH_OPTIONS.find(opt => opt.value === monthValue);
      if (!monthOption) return;

      const payload = {
        bdCodeList: [BdCode],
        projMonth: monthOption.month,
        projYear: monthOption.year,
      };

      const data = await getAllBdProjection(payload);

      const normalizedData = (data || []).map((p) => ({
        id: p.id,
        bdCode: p.bdCode,
        clientCode: p.clientCode,
        projMonth: p.projMonth,
        projYear: p.projYear,
        bdName: p.bdName,
        clientName: p.clientName,
        projValWeek1: p.projValWeek1,
        projDateWeek1: p.projDateWeek1,
        remarksWeek1: p.remarksWeek1,
        revisedValWeek1: p.revisedValWeek1,
        reviseDateWeek1: p.reviseDateWeek1,
        projValWeek2: p.projValWeek2,
        projDateWeek2: p.projDateWeek2,
        remarksWeek2: p.remarksWeek2,
        revisedValWeek2: p.revisedValWeek2,
        reviseDateWeek2: p.reviseDateWeek2,
        projValWeek3: p.projValWeek3,
        projDateWeek3: p.projDateWeek3,
        remarksWeek3: p.remarksWeek3,
        revisedValWeek3: p.revisedValWeek3,
        reviseDateWeek3: p.reviseDateWeek3,
        projValWeek4: p.projValWeek4,
        projDateWeek4: p.projDateWeek4,
        remarksWeek4: p.remarksWeek4,
        revisedValWeek4: p.revisedValWeek4,
        reviseDateWeek4: p.reviseDateWeek4,
        projValWeek5: p.projValWeek5,
        projDateWeek5: p.projDateWeek5,
        remarksWeek5: p.remarksWeek5,
        revisedValWeek5: p.revisedValWeek5,
        reviseDateWeek5: p.reviseDateWeek5,
      }));

      setProjections(normalizedData);

      if (onMonthChange) {
        const year = monthOption.year;
        const month = monthOption.month;
        const fromDate = new Date(Date.UTC(year, month - 1, 1));
        const toDate = new Date(Date.UTC(year, month, 0));
        
        const formatDate = (date) => {
          const y = date.getUTCFullYear();
          const m = String(date.getUTCMonth() + 1).padStart(2, "0");
          const d = String(date.getUTCDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        };

        onMonthChange({
          fromDate: formatDate(fromDate),
          toDate: formatDate(toDate),
          bdNames: [currentBd],
          dateField: "regisDate",
        });
      }
    } catch (e) {
      console.error("Failed to fetch BD projections", e);
      setProjections([]);
    } finally {
      setIsLoadingProjections(false);
    }
  };

  const fetchTargets = async (monthValue) => {
    try {
      const monthOption = MONTH_OPTIONS.find(opt => opt.value === monthValue);
      if (!monthOption) return;

      const year = monthOption.year;
      const month = monthOption.month;
      const fromDate = new Date(Date.UTC(year, month - 1, 1));
      const toDate = new Date(Date.UTC(year, month, 0));

      const payload = {
        bdCodeList: [BdCode],
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      };
      
      const data = await getAllBdTargets(payload);
      const normalized = (data || []).map((t) => ({
        ...t,
        TargetVal: parseFloat(t.targetVal),
      }));

      setTargets(normalized);
    } catch (e) {
      console.error("Failed to fetch BD targets", e);
      setTargets([]);
    }
  };

  const clientComparisonData = useMemo(() => {
    const dataMap = {};

    const getClientEntry = (clientCode, clientName) => {
      if (!dataMap[clientCode]) {
        dataMap[clientCode] = {
          clientCode,
          clientName: clientName || "Unknown",
          projectedValue: 0,
          achievedValue: 0,
          projected: 0,
          achieved: 0,
        };
      }
      return dataMap[clientCode];
    };

    projections.forEach((proj) => {
      const clientCode = proj.clientCode;
      const clientName = proj.clientName || "Unknown";
      if (clientCode) {
        const totalProj = 
          (parseFloat(proj.projValWeek1) || 0) +
          (parseFloat(proj.projValWeek2) || 0) +
          (parseFloat(proj.projValWeek3) || 0) +
          (parseFloat(proj.projValWeek4) || 0) +
          (parseFloat(proj.projValWeek5) || 0);
        
        const entry = getClientEntry(clientCode, clientName);
        entry.projectedValue += totalProj;
        entry.projected += totalProj;
      }
    });

    (inquiriesData || []).forEach((inq) => {
      if (inq.regisVal && inq.clientCode) {
        const clientCode = inq.clientCode;
        const clientName = inq.clientName || "Unknown";
        const entry = getClientEntry(clientCode, clientName);
        const val = parseFloat(inq.regisVal) || 0;
        entry.achievedValue += val;
        entry.achieved += val;
      }
    });

    return Object.values(dataMap).sort((a, b) => a.clientName.localeCompare(b.clientName));
  }, [projections, inquiriesData]);

  const overallStats = useMemo(() => {
    const projectedClientCodes = new Set(
      projections.map((p) => p.clientCode).filter((code) => code)
    );

    const totalProjected = projections.reduce((sum, proj) => {
      return sum + 
        (parseFloat(proj.projValWeek1) || 0) +
        (parseFloat(proj.projValWeek2) || 0) +
        (parseFloat(proj.projValWeek3) || 0) +
        (parseFloat(proj.projValWeek4) || 0) +
        (parseFloat(proj.projValWeek5) || 0);
    }, 0);

    const totalAchievedUnfiltered = (inquiriesData || []).reduce(
      (sum, inq) => sum + (parseFloat(inq.regisVal) || 0),
      0
    );

    const totalAchievedFiltered = (inquiriesData || []).reduce((sum, inq) => {
      if (inq.regisVal && inq.clientCode && projectedClientCodes.has(inq.clientCode)) {
        return sum + (parseFloat(inq.regisVal) || 0);
      }
      return sum;
    }, 0);

    const clients = clientComparisonData.length;

    return {
      totalProjected,
      totalAchievedUnfiltered,
      totalAchievedFiltered,
      clients,
    };
  }, [projections, inquiriesData, clientComparisonData]);

  const monthStats = useMemo(() => {
    const clients = projections.length;
    return { clients };
  }, [projections]);

  const targetStats = useMemo(() => {
    const totalTarget = targets.reduce(
      (sum, t) => sum + parseFloat(t.TargetVal || 0),
      0
    );
    return { totalTarget };
  }, [targets]);

  const handleAddProjection = () => {
    fetchProjections(selectedMonth);
  };

  const handleUpdateProjection = () => {
    fetchProjections(selectedMonth);
  };

  const handleEditProjection = (projection) => {
    setSelectedProjection(projection);
    setIsUpdateModalOpen(true);
  };

  const handleMonthChange = (monthValue) => {
    setSelectedMonth(monthValue);
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const options = await getAssociateClients(BdCode);
        setClientOptions(Array.isArray(options) ? options : []);
      } catch (e) {
        console.error("Failed to fetch Client names", e);
        setClientOptions([]);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    fetchProjections(selectedMonth);
    fetchTargets(selectedMonth);
  }, [selectedMonth]);

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(147, 197, 253, 0.8);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(96, 165, 250, 0.9);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(147, 197, 253, 0.8) transparent;
        }
      `}</style>
      
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
                <Target className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">BD Projection Management</h1>
                <p className="text-blue-100 text-sm mt-1">Track and manage weekly business projections with real-time analytics</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right flex-shrink-0">
              <div className="text-white">
                <p className="text-lg font-semibold leading-snug">{username}</p>
                <p className="text-blue-200 text-xs font-medium leading-snug">{designation}</p>
              </div>
              <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex rounded-2xl border-2 border-blue-200 bg-white p-1.5 shadow-xl"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowComparison(false)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 relative overflow-hidden ${
                !showComparison
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {!showComparison && (
                <motion.div
                  className="absolute inset-0 bg-white opacity-20"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              )}
              <TrendingUp className="w-5 h-5" />
              <span className="relative z-10">Projection Creation</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowComparison(true)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 relative overflow-hidden ${
                showComparison
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {showComparison && (
                <motion.div
                  className="absolute inset-0 bg-white opacity-20"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              )}
              <GitCompare className="w-5 h-5" />
              <span className="relative z-10">Performance Analysis</span>
            </motion.button>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {!showComparison ? (
            <motion.div
              key="projection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <SummaryCard
                  title="Total Projected"
                  value={`₹${formatAmount(overallStats.totalProjected)}`}
                  icon={TrendingUp}
                  borderColor="border-blue-500"
                  bgColor="bg-blue-100"
                  iconColor="text-blue-600"
                  textColor="text-blue-700"
                  isLoading={isLoadingProjections}
                  loader={Loader2}
                />
                <SummaryCard
                  title="Projected Clients"
                  value={monthStats.clients}
                  icon={Building2}
                  borderColor="border-emerald-500"
                  bgColor="bg-emerald-100"
                  iconColor="text-emerald-600"
                  textColor="text-emerald-700"
                  isLoading={isLoadingProjections}
                  loader={Loader2}
                />
                <SummaryCard
                  title="Target Value"
                  value={`₹${formatAmount(targetStats.totalTarget)}`}
                  icon={Target}
                  borderColor="border-teal-500"
                  bgColor="bg-teal-100"
                  iconColor="text-teal-600"
                  textColor="text-teal-700"
                  isLoading={isLoadingProjections}
                  loader={Loader2}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 justify-between">
                  <div className="w-full sm:w-64">
                    <Dropdown
                      options={MONTH_OPTIONS}
                      selected={selectedMonth}
                      onSelect={handleMonthChange}
                      label="Select Month"
                      icon={Calendar}
                      placeholder="Choose month"
                    />
                  </div>
                  {canAddProjection && (
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsModalOpen(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium relative overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                      <Plus className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Add Projection</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md"
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-gray-900">Monthly Projections ({projections.length})</h2>
                </div>

                {isLoadingProjections ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-lg border border-gray-200"
                  >
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                    <span className="text-xl font-medium text-gray-600">Fetching Projections...</span>
                  </motion.div>
                ) : projections.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-lg border border-gray-200"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-4 rounded-full bg-gray-100 mb-4"
                    >
                      <Target className="w-12 h-12 text-gray-400" />
                    </motion.div>
                    <span className="text-xl font-medium text-gray-600">No Projections Found</span>
                    <span className="text-sm text-gray-400 mt-2 max-w-md text-center">
                      No projections added for this month yet. Click Add Projection to create one.
                    </span>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projections.map((projection, index) => (
                      <motion.div
                        key={projection.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ProjectionCard 
                          projection={projection} 
                          onEdit={handleEditProjection}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <TargetAchievementCard
                  totalTarget={targetStats.totalTarget}
                  totalAchieved={overallStats.totalAchievedUnfiltered}
                  isLoading={isLoadingProjections}
                />
                <ProjectionAchievementCard
                  totalProjected={overallStats.totalProjected}
                  totalAchieved={overallStats.totalAchievedFiltered}
                  isLoading={isLoadingProjections}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 justify-between">
                  <div className="w-full sm:w-64">
                    <Dropdown
                      options={MONTH_OPTIONS}
                      selected={selectedMonth}
                      onSelect={handleMonthChange}
                      label="Select Month for Comparison"
                      icon={Calendar}
                      placeholder="Choose month"
                    />
                  </div>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex rounded-2xl border-2 border-blue-200 bg-white p-1.5 shadow-xl"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setComparisonView("table")}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 relative overflow-hidden ${
                        comparisonView === "table"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {comparisonView === "table" && (
                        <motion.div
                          className="absolute inset-0 bg-white opacity-20"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                      <List className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Table</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setComparisonView("graph")}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 relative overflow-hidden ${
                        comparisonView === "graph"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {comparisonView === "graph" && (
                        <motion.div
                          className="absolute inset-0 bg-white opacity-20"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                      <BarChart3 className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Graph</span>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>

              {isLoadingProjections ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-lg border border-gray-200"
                >
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                  <span className="text-xl font-medium text-gray-600">Loading Comparison Data...</span>
                </motion.div>
              ) : clientComparisonData.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-lg border border-gray-200"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-4 rounded-full bg-gray-100 mb-4"
                  >
                    <Trophy className="w-12 h-12 text-gray-400" />
                  </motion.div>
                  <span className="text-xl font-medium text-gray-600">No Comparison Data Available</span>
                  <span className="text-sm text-gray-400 mt-2 max-w-md text-center">
                    No projections or registrations found for this month.
                  </span>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {comparisonView === "table" ? (
                    <motion.div
                      key="table"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableView 
                        data={clientComparisonData} 
                        projections={projections}
                        onEdit={handleEditProjection}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="graph"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <GraphView data={clientComparisonData} />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isModalOpen && (
            <AddProjectionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onAdd={handleAddProjection}
              clients={clientOptions}
              selectedMonth={selectedMonth}
              existingProjections={projections}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isUpdateModalOpen && (
            <UpdateProjectionModal
              isOpen={isUpdateModalOpen}
              onClose={() => {
                setIsUpdateModalOpen(false);
                setSelectedProjection(null);
              }}
              onUpdate={handleUpdateProjection}
              projection={selectedProjection}
              selectedMonth={selectedMonth}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}