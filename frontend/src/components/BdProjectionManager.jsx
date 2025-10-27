import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  getClientNames,
  createBdProjection,
  getAllBdProjection,
  getAllBdTargets,
} from "../services/api";

const DEMO_PROJECTIONS = [];

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
    });
  }
  return options;
};

const MONTH_OPTIONS = generateMonthOptions();

const getStatus = (achieved, projected) => {
  if (projected === 0) {
    return {
      text: "Not Projected",
      badgeColor: "bg-blue-200 text-blue-600 border-blue-400",
      progressColor: "bg-blue-500",
      progress: achieved > 0 ? 100 : 0, // Show 100% if achieved > 0 but not projected
      icon: <AlertCircle className="w-3 h-3" />,
      isAchieved: achieved > 0,
      isPartial: false,
    };
  }

  const progress = Math.min((achieved / projected) * 100, 100);

  if (achieved === 0) {
    return {
      text: "Not Achieved",
      badgeColor: "bg-red-100 text-red-700 border-red-300",
      progressColor: "bg-red-500",
      progress: 0,
      icon: <XCircle className="w-3 h-3" />,
      isAchieved: false,
      isPartial: false,
    };
  } else if (achieved >= projected) {
    return {
      text: "Achieved",
      badgeColor: "bg-green-100 text-green-700 border-green-300",
      progressColor: "bg-green-500",
      progress,
      icon: <CheckCircle2 className="w-3 h-3" />,
      isAchieved: true,
      isPartial: false,
    };
  } else {
    return {
      text: "Partial Achieved",
      badgeColor: "bg-yellow-100 text-yellow-700 border-yellow-300",
      progressColor: "bg-yellow-500",
      progress,
      icon: <Activity className="w-3 h-3" />,
      isAchieved: false,
      isPartial: true,
    };
  }
};

const Dropdown = ({
  options,
  selected,
  onSelect,
  label,
  icon: Icon,
  placeholder,
}) => {
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
        <span className="flex items-center gap-2.5 font-medium">
          <Icon className="w-4 h-4 text-blue-600" />
          <span className={selectedOption ? "text-gray-700" : "text-gray-400"}>
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

const AddProjectionModal = ({ isOpen, onClose, onAdd, clients }) => {
  const [formData, setFormData] = useState({
    CUSTACCCODE: "",
    PROJVAL: "",
    REMARKS: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.CUSTACCCODE || !formData.PROJVAL) {
      alert("Please select a client and enter a projection value.");
      return;
    }

    setIsLoading(true);

    try {
      const apiPayload = {
        codecd: "004",
        custacccode: formData.CUSTACCCODE,
        projval: parseInt(formData.PROJVAL),
        remarks: formData.REMARKS || "",
      };

      await createBdProjection(apiPayload);

      const client = clients.find(
        (c) => c.custacccode === formData.CUSTACCCODE
      );
      const tempProjection = {
        CUSTACCCODE: formData.CUSTACCCODE,
        PROJVAL: formData.PROJVAL,
        REMARKS: formData.REMARKS,
        CODECD: apiPayload.codecd,
        ProjDate: `${new Date()}`,
        ClientName: client?.clientName || "",
      };

      onAdd(tempProjection);

      setFormData({ CUSTACCCODE: "", PROJVAL: "", REMARKS: "" });
      onClose();
    } catch (error) {
      console.error("Failed to add projection:", error);
      alert(
        `Failed to add projection. Please try again. Error: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const normalizedClients = clients.map((c) => ({
    value: c.custacccode,
    label: c.clientName,
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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
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
              <h2 className="text-xl font-bold text-white">
                Add New Projection
              </h2>
              <p className="text-blue-100 text-sm">
                Enter projection details for the month
              </p>
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

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Dropdown
            options={normalizedClients}
            selected={formData.CUSTACCCODE}
            onSelect={(value) =>
              setFormData({ ...formData, CUSTACCCODE: value })
            }
            label="Select Client"
            icon={Building2}
            placeholder="Choose a client"
          />

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Projection Value (₹)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
              <input
                type="number"
                value={formData.PROJVAL}
                onChange={(e) =>
                  setFormData({ ...formData, PROJVAL: e.target.value })
                }
                placeholder="Enter projection value"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Remarks (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-blue-600" />
              <textarea
                value={formData.REMARKS}
                onChange={(e) =>
                  setFormData({ ...formData, REMARKS: e.target.value })
                }
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm resize-none transition-all duration-200"
              />
            </div>
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

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  borderColor,
  bgColor,
  iconColor,
  textColor,
  isLoading = false,
  loader: Loader,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
    className={`bg-white p-6 rounded-xl shadow-lg border-t-4 ${borderColor} transform transition-all duration-300`}
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
      className={`text-3xl mt-6 font-extrabold ${textColor} flex items-center gap-1`}
    >
      {isLoading && Loader ? (
        <Loader className={`w-6 h-6 animate-spin ${iconColor}`} />
      ) : (
        value
      )}
    </p>
  </motion.div>
);

const TargetAchievementCard = ({ totalTarget, totalAchieved, isLoading }) => {
  let percentage = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0;

  if (percentage === 0 && totalAchieved >= 0) percentage = 100;
  const status = getStatus(totalAchieved, totalTarget);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-100 p-6 overflow-hidden relative"
    >
      {/* Background Pattern */}
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
              <h3 className="text-lg font-bold text-gray-800">
                Target Achievement
              </h3>
              <p className="text-sm text-gray-500">
                Achievement against official target
              </p>
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase opacity-90">
                Target
              </span>
            </div>
            <p className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `₹${formatAmount(totalTarget)}`
              )}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase opacity-90">
                Achieved
              </span>
            </div>
            <p className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `₹${formatAmount(totalAchieved)}`
              )}
            </p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Achievement Progress
            </span>
            <span className="text-lg font-bold text-gray-800">
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${status.progressColor} relative overflow-hidden`}
            >
              {/* Animated shimmer effect */}
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

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-blue-100 grid grid-cols-2 gap-4"
        >
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Remaining</p>
            <p className="text-lg font-bold text-orange-600">
              ₹{formatAmount(Math.max(0, totalTarget - totalAchieved))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <div className="flex items-center justify-center gap-1">
              <Zap
                className={`w-4 h-4 ${
                  status.isAchieved
                    ? "text-green-500"
                    : status.isPartial
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              />
              <p
                className={`text-lg font-bold ${
                  status.isAchieved
                    ? "text-green-600"
                    : status.isPartial
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {status.isAchieved
                  ? "On Track"
                  : status.isPartial
                  ? "In Progress"
                  : "Behind"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ProjectionAchievementCard = ({
  totalProjected,
  totalAchieved,
  isLoading,
}) => {
  const effectiveProjected = Math.max(1, totalProjected);
  const percentage = (totalAchieved / effectiveProjected) * 100;

  const status = getStatus(totalAchieved, totalProjected);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border border-purple-100 p-6 overflow-hidden relative"
    >
      {/* Background Pattern */}
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
              <h3 className="text-lg font-bold text-gray-800">
                Projection Achievement
              </h3>
              <p className="text-sm text-gray-500">
                Achievement against projected value
              </p>
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase opacity-90">
                Projected
              </span>
            </div>
            <p className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `₹${formatAmount(totalProjected)}`
              )}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase opacity-90">
                Achieved
              </span>
            </div>
            <p className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `₹${formatAmount(totalAchieved)}`
              )}
            </p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Execution Progress
            </span>
            <span className="text-lg font-bold text-gray-800">
              {totalProjected === 0 && totalAchieved > 0
                ? "N/A"
                : `${Math.min(percentage, 100).toFixed(1)}%`}
            </span>
          </div>
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${status.progressColor} relative overflow-hidden`}
            >
              {/* Animated shimmer effect */}
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

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-purple-100 grid grid-cols-2 gap-4"
        >
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Left to Execute</p>
            <p className="text-lg font-bold text-red-600">
              ₹{formatAmount(Math.max(0, totalProjected - totalAchieved))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Execution Status</p>
            <div className="flex items-center justify-center gap-1">
              <Activity
                className={`w-4 h-4 ${
                  status.isAchieved
                    ? "text-green-500"
                    : status.isPartial
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              />
              <p
                className={`text-lg font-bold ${
                  status.isAchieved
                    ? "text-green-600"
                    : status.isPartial
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {status.isAchieved
                  ? "Completed"
                  : status.isPartial
                  ? "In Execution"
                  : "Stalled"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
// --- END NEW COMPONENT ---

const ProjectionCard = ({ projection, onEdit, onDelete }) => (
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
            <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate whitespace-nowrap overflow-hidden">
              {projection.ClientName}
            </h3>

            <p className="text-[11px] text-gray-500">
              Date: {formatDate(projection.ProjDate)}
            </p>
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
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(projection.id)}
            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <span className="text-xs font-medium text-gray-600">
            Projected Value
          </span>
          <span className="text-lg font-bold text-green-700 flex items-center gap-1">
            ₹{formatAmount(projection.ProjVal)}
          </span>
        </div>
        {projection.REMARKS && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-1">Remarks:</p>
            <p className="text-sm text-gray-700">{projection.REMARKS}</p>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

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

  const chartData = data.map((item) => ({
    name: item.clientName,
    Achieved: item.achievedValue,
    Remaining: Math.max(0, item.projectedValue - item.achievedValue),
  }));

  const COLORS = ["#10b981", "#ef4444"];

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
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={30}
          fontSize={0}
          stroke="#6b7280"
        />
        <YAxis
          tickFormatter={(value) => `₹${formatAmount(value)}`}
          fontSize={isModal ? 14 : 12}
          stroke="#6b7280"
        />
        <Tooltip
          formatter={(value) => `₹${formatAmount(value)}`}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          }}
        />
        {!isModal && <Legend wrapperStyle={{ paddingTop: "20px" }} />}
        <Bar
          dataKey="Achieved"
          stackId="a"
          fill="url(#colorAchieved)"
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="Remaining"
          stackId="a"
          fill="url(#colorRemaining)"
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
              Client Projection Analysis
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Visual comparison of Projected vs. Achieved values by Client
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFullScreen(true)}
            className="p-2.5 rounded-xl text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg transition-all duration-200"
            aria-label="Maximize chart"
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
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullScreen(false)}
                className="absolute top-4 right-4 p-2.5 rounded-xl text-white bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-lg transition-all duration-200 z-50"
                aria-label="Minimize chart"
              >
                <Minimize size={24} />
              </motion.button>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  Client Projection Analysis - Full View
                </h2>
                <p className="text-gray-500 mt-2">
                  Detailed comparison across all clients
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

const TableView = ({ data }) => {
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
          {/* Header */}
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white">
              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide">
                Client Name
              </th>
              <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide">
                Projected Value
              </th>
              <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide">
                Achieved Value
              </th>
              <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide">
                Remaining Value
              </th>
              <th className="px-14 py-4 text-center text-xs font-bold uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide">
                Achievement %
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100">
            {data.map((item, index) => {
              const status = getStatus(item.achievedValue, item.projectedValue);
              // Calculate remaining value, ensuring it's not negative
              const remainingValue = Math.max(
                0,
                item.projectedValue - item.achievedValue
              );

              return (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`transition-all duration-200 hover:bg-blue-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {/* Client Name */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-sm">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {item.clientName}
                      </span>
                    </div>
                  </td>

                  {/* Projected Value */}
                  <td className="px-4 py-4 text-sm text-right font-medium text-gray-700">
                    ₹{formatAmount(item.projectedValue)}
                  </td>

                  {/* Achieved Value */}
                  <td className="px-4 py-4 text-sm text-right font-medium text-gray-700">
                    ₹{formatAmount(item.achievedValue)}
                  </td>

                  {/* NEW COLUMN: Remaining Value */}
                  <td className="px-4 py-4 text-sm text-right font-bold">
                    <span
                      className={
                        remainingValue > 0
                          ? "text-orange-600"
                          : "text-green-700"
                      }
                    >
                      ₹{formatAmount(remainingValue)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm border-2 ${status.badgeColor}`}
                    >
                      {status.icon}
                      {status.text}
                    </span>
                  </td>

                  {/* Achievement % */}
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="relative w-25 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${status.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.05 }}
                          style={{ width: `${status.progress}%` }}
                          className={`h-full ${status.progressColor} transition-all duration-500 ease-in-out relative overflow-hidden`}
                        >
                          <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />
                        </motion.div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                        {status.progress.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - Updated to grid-cols-3 to show Remaining Value */}
      <div className="lg:hidden block p-4 space-y-4 bg-gray-50">
        {data.map((item, index) => {
          const status = getStatus(item.achievedValue, item.projectedValue);
          const remainingValue = Math.max(
            0,
            item.projectedValue - item.achievedValue
          ); // Calculate remaining value
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-800">
                  {item.clientName}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border-2 ${status.badgeColor}`}
                >
                  {status.icon}
                  {status.text}
                </span>
              </div>

              {/* STATS: Projected, Achieved, Remaining */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-700 flex flex-col items-start">
                  <span className="text-xs font-semibold uppercase flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Proj.
                  </span>
                  <p className="mt-1 text-base font-bold text-blue-800">
                    ₹{formatAmount(item.projectedValue)}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-teal-50 text-teal-700 flex flex-col items-start">
                  <span className="text-xs font-semibold uppercase flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Ach.
                  </span>
                  <p className="mt-1 text-base font-bold text-teal-800">
                    ₹{formatAmount(item.achievedValue)}
                  </p>
                </div>

                {/* NEW CARD: Remaining Value */}
                <div className="p-3 rounded-lg bg-orange-50 text-orange-700 flex flex-col items-start">
                  <span className="text-xs font-semibold uppercase flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Rem.
                  </span>
                  <p className="mt-1 text-base font-bold text-orange-800">
                    ₹{formatAmount(remainingValue)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">
                  Achievement
                </span>
                <div className="relative w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${status.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    style={{ width: `${status.progress}%` }}
                    className={`h-full ${status.progressColor} transition-all duration-500 ease-in-out`}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-800 w-10 text-right">
                  {status.progress.toFixed(1)}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default function BDProjectionManager({ onMonthChange, inquiriesData }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projections, setProjections] = useState(DEMO_PROJECTIONS);
  const [clientOptions, setClientOptions] = useState([]);
  const [isLoadingProjections, setIsLoadingProjections] = useState(false);
  const [targets, setTargets] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonView, setComparisonView] = useState("table");
  const [currentBd, setCurrentBd] = useState("Joydip Banerjee");

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

    return {
      fromDate: formatDate(fromDate),
      toDate: formatDate(toDate),
    };
  };

  useEffect(() => {
    const { fromDate, toDate } = calculateMonthDateRange(selectedMonth);
    if (onMonthChange) {
      onMonthChange({
        fromDate,
        toDate,
        bdNames: [currentBd],
        dateField: "regisDate",
      });
    }
  }, []);

  const fetchProjections = async (monthValue) => {
    setIsLoadingProjections(true);
    try {
      const { fromDate, toDate } = calculateMonthDateRange(monthValue);

      const payload = {
        CODECDs: ["004"],
        fromDate: new Date(fromDate).toISOString(),
        toDate: new Date(toDate).toISOString(),
      };

      const data = await getAllBdProjection(payload);

      const normalizedData = data.map((p) => ({
        id: p.id,
        CODECD: p.codecd,
        CUSTACCCODE: p.custacccode,
        ProjDate: p.projDate,
        ProjVal: p.projVal,
        BDName: p.bdName,
        ClientName: p.clientName,
        REMARKS: p.remarks,
      }));

      setProjections(normalizedData);

      if (onMonthChange) {
        onMonthChange({
          fromDate,
          toDate,
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
      const { fromDate, toDate } = calculateMonthDateRange(monthValue);
      const payload = {
        CODECDs: ["004"],
        fromDate: new Date(fromDate).toISOString(),
        toDate: new Date(toDate).toISOString(),
      };
      const data = await getAllBdTargets(payload);

      console.log(data);
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

  // FIX: Modify clientComparisonData to include ALL clients with registration data,
  // not just projected ones, to be displayed in the table/graph.
  const clientComparisonData = useMemo(() => {
    const dataMap = {};

    // Helper function to get or create a client entry
    const getClientEntry = (clientName) => {
      if (!dataMap[clientName]) {
        dataMap[clientName] = {
          clientName,
          projectedValue: 0, // Default to 0
          achievedValue: 0, // Default to 0
        };
      }
      return dataMap[clientName];
    };

    // 1. Populate dataMap with projections
    projections.forEach((proj) => {
      const clientName = proj.ClientName || "Unknown (Projected)";
      // Fix 1 (from previous step): Use parseFloat for robust number conversion
      getClientEntry(clientName).projectedValue +=
        parseFloat(proj.ProjVal) || 0;
    });

    // 2. Aggregate ACHIEVED value for ALL clients in inquiriesData
    // This ensures all clients with achieved value are included in the table/graph
    inquiriesData.forEach((inq) => {
      if (inq.regisVal && inq.clientName) {
        const clientName = inq.clientName;
        getClientEntry(clientName).achievedValue +=
          parseFloat(inq.regisVal) || 0;
      }
    });

    return Object.values(dataMap).sort(
      (a, b) => b.projectedValue - a.projectedValue // Sort by projected value, or 0 if only achieved
    );
  }, [projections, inquiriesData]);

  // FIX: Recalculate overallStats, ensuring totalAchievedFiltered strictly counts
  // achieved value ONLY for clients that have a projection, regardless of what the table shows.
  const overallStats = useMemo(() => {
    // 1. Identify the set of client names that have been projected
    const projectedClientNames = new Set(
      projections.map((p) => p.ClientName).filter((name) => name)
    );

    // Total Projected (Sum of all Projections)
    const totalProjected = projections.reduce(
      (sum, proj) => sum + (parseFloat(proj.ProjVal) || 0),
      0
    );

    // Total Achieved (UNFILTERED - all registrations, for Target Achievement Card)
    const totalAchievedUnfiltered = inquiriesData.reduce(
      (sum, inq) => sum + (parseFloat(inq.regisVal) || 0),
      0
    );

    // Total Achieved (FILTERED - only for projected clients, for Projection Achievement Card)
    const totalAchievedFiltered = inquiriesData.reduce((sum, inq) => {
      if (
        inq.regisVal &&
        inq.clientName &&
        projectedClientNames.has(inq.clientName)
      ) {
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
  }, [projections, inquiriesData, clientComparisonData]); // Added projections as a dependency

  const filteredProjections = useMemo(() => projections, [projections]);

  const monthStats = useMemo(() => {
    const total = filteredProjections.reduce(
      (sum, proj) => sum + parseFloat(proj.ProjVal || 0),
      0
    );
    const clients = filteredProjections.length;
    return { total, clients };
  }, [filteredProjections]);

  const targetStats = useMemo(() => {
    const totalTarget = targets.reduce(
      (sum, t) => sum + parseFloat(t.TargetVal || 0),
      0
    );
    return { totalTarget };
  }, [targets]);

  const handleAddProjection = (newProjection) => {
    const client = clientOptions.find(
      (c) => c.custacccode === newProjection.CUSTACCCODE
    );
    const projection = {
      id: Math.max(...projections.map((p) => p.id), 0) + 1,
      CODECD: newProjection.CODECD,
      CUSTACCCODE: newProjection.CUSTACCCODE,
      ProjDate: newProjection.ProjDate,
      ProjVal: newProjection.PROJVAL.toString(),
      BDName: "Joydip Banerjee",
      ClientName: client?.clientName || newProjection.ClientName || "",
      REMARKS: newProjection.REMARKS || null,
    };

    const projDate = new Date(projection.ProjDate);
    const projMonth = `${projDate.getFullYear()}-${String(
      projDate.getMonth() + 1
    ).padStart(2, "0")}`;
    if (projMonth === selectedMonth) {
      setProjections([...projections, projection]);
    }
  };

  const handleDeleteProjection = (id) => {
    alert("Delete functionality will be implemented in backend integration");
  };

  const handleEditProjection = (projection) => {
    alert("Edit functionality will be implemented in backend integration");
  };

  const handleMonthChange = (monthValue) => {
    setSelectedMonth(monthValue);
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const options = await getClientNames();
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
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
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
                <Target className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  BD Projection Management
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Track and manage monthly business projections with real-time
                  analytics
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Switcher */}
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
              className={`
                px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 
                flex items-center gap-2.5 relative overflow-hidden
                ${
                  !showComparison
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }
              `}
            >
              {!showComparison && (
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
              <TrendingUp className="w-5 h-5" />
              <span className="relative z-10">Projection Creation</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowComparison(true)}
              className={`
                px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300
                flex items-center gap-2.5 relative overflow-hidden
                ${
                  showComparison
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }
              `}
            >
              {showComparison && (
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
              {/* Projection Management Stats */}
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

              {/* Month Selector and Add Button */}
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
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <Plus className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Add Projection</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Projections List */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md"
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Monthly Projections ({filteredProjections.length})
                  </h2>
                </div>

                {isLoadingProjections ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-lg border border-gray-200"
                  >
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                    <span className="text-xl font-medium text-gray-600">
                      Fetching Projections...
                    </span>
                  </motion.div>
                ) : filteredProjections.length === 0 ? (
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
                    <span className="text-xl font-medium text-gray-600">
                      No Projections Found
                    </span>
                    <span className="text-sm text-gray-400 mt-2 max-w-md text-center">
                      No projections added for this month yet. Click Add
                      Projection to create one.
                    </span>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjections.map((projection, index) => (
                      <motion.div
                        key={projection.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ProjectionCard
                          projection={projection}
                          onEdit={handleEditProjection}
                          onDelete={handleDeleteProjection}
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
              {/* Comparison View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Target Achievement Card: Uses UNFILTERED total achieved */}
                <TargetAchievementCard
                  totalTarget={targetStats.totalTarget}
                  totalAchieved={overallStats.totalAchievedUnfiltered}
                  isLoading={isLoadingProjections}
                />

                {/* Projection Achievement Card: Uses FILTERED total achieved */}
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
                      className={`
                        px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 
                        flex items-center gap-2.5 relative overflow-hidden
                        ${
                          comparisonView === "table"
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        }
                      `}
                    >
                      {comparisonView === "table" && (
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
                      <span className="relative z-10">Table</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setComparisonView("graph")}
                      className={`
                        px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                        flex items-center gap-2.5 relative overflow-hidden
                        ${
                          comparisonView === "graph"
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        }
                      `}
                    >
                      {comparisonView === "graph" && (
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
                  <span className="text-xl font-medium text-gray-600">
                    Loading Comparison Data...
                  </span>
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
                  <span className="text-xl font-medium text-gray-600">
                    No Comparison Data Available
                  </span>
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
                      <TableView data={clientComparisonData} />
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
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
