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
  ArrowUp,
  ArrowDown,
  RefreshCcw,
  Filter,
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

import {
  getBdNames,
  getAllBdProjection,
  getAllBdTargets,
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
    });
  }
  return options;
};

const MONTH_OPTIONS = generateMonthOptions();


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
      text = isClientContext ? "No Projected" : "No Target";
      badgeColor = "bg-gray-100 text-gray-700 border-gray-300";
      progressColor = "bg-green-500";
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

const Dropdown = ({ options, selected, onSelect, label, icon: Icon, placeholder, multiple = false, onDeselectAll, isExcluded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredOptions = options.filter((o) =>
    o?.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.dropdown-container')) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (value) => {
    if (multiple) {
      const newSelected = selected.includes(value)
        ? selected.filter(v => v !== value)
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
      ? `${isExcluded ? 'Excluding' : 'Including'} ${selected.length} ${label}`
      : `${isExcluded ? 'Excluding All' : 'Including All'} ${label}` 
    : options.find((o) => o.value === selected)?.label || placeholder;

  const modeColor = isExcluded ? "text-red-600" : "text-blue-600";
  const modeHoverColor = isExcluded ? "group-hover:text-red-700" : "group-hover:text-blue-700";

  return (
    <div className="relative w-full dropdown-container">
      <label className="text-xs font-medium text-gray-600 block mb-1.5">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 text-left hover:shadow-md flex justify-between items-center transition-all duration-200 group ${
          isExcluded && multiple ? 'focus:ring-red-500' : 'focus:ring-blue-500'
        }`}
      >
        <span className="flex items-center gap-2.5 text-sm">
          <Icon className={`w-4 h-4 ${multiple ? `${modeColor} ${modeHoverColor}` : 'text-blue-600'}`} />
          <span className={selected.length > 0 || selected ? "text-gray-700" : "text-gray-500"}>
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
              {multiple && onDeselectAll && (
                <li
                  onClick={() => {
                    onDeselectAll();
                    setSearchTerm("");
                  }}
                  className={`px-4 py-2.5 text-sm cursor-pointer font-semibold border-b border-gray-100 transition-colors duration-150 ${
                    isExcluded ? "hover:bg-red-50 text-red-700" : "hover:bg-blue-50 text-blue-700"
                  }`}
                >
                  Deselect All
                </li>
              )}
              {filteredOptions.map((o) => {
                const isSelected = multiple ? selected.includes(o.value) : selected === o.value;
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
                      {isSelected && <Check className={`w-4 h-4 ${isExcluded && multiple ? 'text-red-600' : 'text-blue-600'}`} />}
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

const SummaryCard = ({ title, value, icon: Icon, borderColor, bgColor, iconColor, textColor, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
    className={`bg-white p-6 rounded-xl shadow-lg border-t-4 ${borderColor} transform transition-all duration-300`}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium uppercase text-gray-500">{title}</span>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 10 }}
        className={`p-2 rounded-lg ${bgColor}`}
      >
        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
      </motion.div>
    </div>
    <p className={`text-3xl mt-6 font-extrabold ${textColor} flex items-center gap-1`}>
      {isLoading ? <Loader2 className={`w-6 h-6 animate-spin ${iconColor}`} /> : value}
    </p>
  </motion.div>
);

const BDPerformanceTableCard = ({ bd, isLoading, clients }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = getStatus(bd.totalAchieved, bd.totalTarget);

  // Logic: Change progress bar background to red when status is 'Not Achieved'
  const progressBarBg = (status.text === 'Not Achieved' && bd.totalTarget > 0)
      ? 'bg-red-200'
      : (status.text === 'No Target' || status.text === 'Achieved (No Target)')
      ? 'bg-blue-200' // Blue background for No Target case
      : 'bg-gray-200'; // Default background

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Main BD Row */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          {/* BD Name & Icon (w-4/12 width) */}
          <div className="flex items-center gap-4 flex-grow-0 flex-shrink-0 w-3/12">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.3 }}
              className="p-2 rounded-lg bg-blue-50"
            >
              <ChevronRight className="w-5 h-5 text-blue-600" />
            </motion.div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
                {/* MODIFIED: BD icon size made smaller (w-4 h-4 -> w-3 h-3) */}
                <Users className="w-3 h-3 text-white" />
              </div>
              <div>
                {/* MODIFIED: BD Name size made smaller (text-lg -> text-base) */}
                <h3 className="text-base font-bold text-gray-800">{bd.bdName}</h3>
                <p className="text-xs text-gray-500">{bd.clientCount} Clients · {bd.projectionCount} Projections</p>
              </div>
            </div>
          </div>

          {/* Stats Grid - MODIFIED: Gap increased (gap-8 -> gap-10) and fixed widths applied */}
          <div className="flex items-center gap-10 w-9/12">
            {/* Target Column (w-24) */}
            <div className="text-center w-24">
              <p className="text-xs text-gray-500 mb-1">Target</p>
              <p className="text-base font-bold text-purple-600">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `₹${formatAmount(bd.totalTarget)}`}
              </p>
            </div>
            
            {/* Projected Column (w-24) */}
            <div className="text-center w-24">
              <p className="text-xs text-gray-500 mb-1">Projected</p>
              <p className="text-base font-bold text-blue-600">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `₹${formatAmount(bd.totalProjected)}`}
              </p>
            </div>
            
            {/* Achieved Column (w-24) */}
            <div className="text-center w-24">
              <p className="text-xs text-gray-500 mb-1">Achieved</p>
              <p className="text-base font-bold text-green-600">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `₹${formatAmount(bd.totalAchieved)}`}
              </p>
            </div>

            {/* Progress Bar (w-48) */}
            <div className="w-48 flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">vs Target</span>
                <span className="text-xs font-bold text-gray-700">{status.progress.toFixed(0)}%</span>
              </div>
              {/* MODIFIED: Dynamic background for progress bar */}
              <div className={`relative h-2 ${progressBarBg} rounded-full overflow-hidden`}> 
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(status.progress, 100)}%`}}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${status.progressColor}`}
                />
              </div>
            </div>

            {/* Status Badge (w-28) */}
            <div className="w-28 justify-center flex-shrink-0">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${status.badgeColor}  `}>
              {status.icon}
              {status.text}
            </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Client Details */}
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
                <>
                  <div className="overflow-hidden rounded-xl border border-gray-200 shadow-xl bg-white/80 backdrop-blur-md mb-6">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-cyan-500 to-blue-600">
                        <tr>
                          {/* MODIFIED: Set specific widths for client table columns */}
                          <th className="px-4 py-3 text-left text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20 w-4/12">
                            <div className="flex items-center gap-1.5">
                              <div className="w-0.5 h-3 bg-white/60 rounded-full"></div>
                              <span className="drop-shadow-sm">Client</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-center text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20 w-2/12">
                            <span className="drop-shadow-sm">Projected</span>
                          </th>
                          <th className="px-4 py-3 text-center text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20 w-2/12">
                            <span className="drop-shadow-sm">Achieved</span>
                          </th>
                          <th className="px-4 py-3 text-center text-[10px] font-bold text-white uppercase tracking-wide border-r border-white/20 w-2/12">
                            <span className="drop-shadow-sm">Progress</span>
                          </th>
                          <th className="px-4 py-3 text-center text-[10px] font-bold text-white uppercase tracking-wide w-2/12">
                            <span className="drop-shadow-sm">Status</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {clients.map((client, index) => {
                          // MODIFIED: Pass true for isClientContext
                          const clientStatus = getStatus(client.achieved, client.projected, true);
                          const isEvenRow = index % 2 === 0;
                          
                          // Logic: Change progress bar background to red when status is 'Not Achieved'
                          const clientProgressBarBg = (clientStatus.text === 'Not Achieved' && client.projected > 0)
                              ? 'bg-red-200'
                              : (clientStatus.text === 'Not Projected' || clientStatus.text === 'Achieved (No Proj)')
                              ? 'bg-blue-200' // Blue background for Not Projected case
                              : 'bg-gray-200'; // Default background

                          return (
                            <motion.tr
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`group transition-all duration-150 ${
                                isEvenRow ? "bg-white/90" : "bg-gray-50/50"
                              } hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-indigo-50/70`}
                            >
                              <td className="px-4 py-3 text-left w-4/12">
                                <div className="flex items-center gap-2">
                                  <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  <span className="text-sm font-medium text-gray-800 group-hover:translate-x-0.5 transition-transform">
                                    {client.clientName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center w-2/12">
                                <span className="text-sm text-blue-600 font-semibold">
                                  ₹{formatAmount(client.projected)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center w-2/12">
                                <span className="text-sm text-green-600 font-semibold">
                                  ₹{formatAmount(client.achieved)}
                                </span>
                              </td>
                              <td className="px-4 py-3 w-2/12">
                                <div className="flex items-center justify-center gap-2">
                                  <div className={`relative w-24 h-1.5 ${clientProgressBarBg} rounded-full overflow-hidden`}>
                                    <motion.div
                                      initial={{ width: 0 }}
                                      // Progress is now safe from Infinity due to getStatus logic
                                      animate={{ width: `${clientStatus.progress}%` }} 
                                      transition={{ duration: 1, delay: index * 0.05 }}
                                      className={`h-full ${clientStatus.progressColor}`}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                                    {clientStatus.progress.toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center w-2/12">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${clientStatus.badgeColor}`}>
                                  {clientStatus.icon}
                                  {clientStatus.text}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })}
                        
                        {/* BD Total Row - Simplified and Aligned */}
                        <tr className="bg-gradient-to-r from-blue-100/80 via-indigo-100/80 to-blue-100/80 border-t-2 border-blue-200">
                          <td className="px-4 py-3 text-left font-bold text-blue-900 w-4/12">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-xs">BD Total</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center w-2/12">
                            <span className="text-sm text-blue-900 font-extrabold">
                              ₹{formatAmount(bd.totalProjected)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center w-2/12">
                            <span className="text-sm text-green-900 font-extrabold">
                              ₹{formatAmount(bd.totalAchieved)}
                            </span>
                          </td>
                          <td className="px-4 py-3 w-2/12">
                            <div className="flex items-center justify-center gap-2">
                              <div className="relative w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ 
                                    width: `${
                                        bd.totalProjected === 0 && bd.totalAchieved > 0 
                                            ? 100 
                                            : Math.min((bd.totalAchieved / bd.totalProjected) * 100, 100)
                                    }%` 
                                  }}
                                  transition={{ duration: 1 }}
                                  className={`h-full ${getStatus(bd.totalAchieved, bd.totalProjected, true).progressColor}`}
                                />
                              </div>
                              <span className="text-xs font-extrabold text-blue-900 w-10 text-right">
                                {
                                    bd.totalProjected === 0 && bd.totalAchieved > 0
                                        ? 100
                                        : ((bd.totalAchieved / bd.totalProjected) * 100).toFixed(0)
                                }%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center w-2/12"> 
                        
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${getStatus(bd.totalAchieved, bd.totalProjected).badgeColor}`}>
                                  {getStatus(bd.totalAchieved, bd.totalProjected).icon}
                                  {getStatus(bd.totalAchieved, bd.totalProjected, true).text}
                                </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
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
    // Collect totals across all clients for this BD
    let bdProjected = 0;
    let bdAchieved = 0;
    
    data.forEach(client => {
      if (client.bdData[bd.codecd]) {
        bdProjected += client.bdData[bd.codecd].projected || 0;
        bdAchieved += client.bdData[bd.codecd].achieved || 0;
      }
    });

    return {
      name: bd.bdName,
      Projected: bdProjected,
      Achieved: bdAchieved,
    };
  });

  // Filter out BDs with zero projected and achieved values for cleaner graph
  const filteredChartData = chartData.filter(d => d.Projected > 0 || d.Achieved > 0);

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
      <BarChart data={filteredChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} stroke="#6b7280" />
        <YAxis tickFormatter={(value) => `₹${formatAmount(value)}`} fontSize={12} stroke="#6b7280" />
        <Tooltip
          formatter={(value, name) => [`₹${formatAmount(value)}`, name]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          }}
          labelStyle={{ fontWeight: 'bold', color: '#374151' }}
        />
        {!isModal && <Legend wrapperStyle={{ paddingTop: "20px" }} />}
        <Bar dataKey="Projected" fill="url(#colorProjected)" radius={[8, 8, 0, 0]} />
        <Bar dataKey="Achieved" fill="url(#colorAchieved)" radius={[8, 8, 0, 0]} />
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
                <p className="text-gray-500 mt-2">Detailed comparison across all BDs</p>
              </div>
              <Chart isModal={true} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function BdPerformanceAnalysis({ onMonthChange, inquiriesData = [] }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();

    const defaultDate = new Date('2025-10-01');
    const targetDate = defaultDate < now ? now : defaultDate;

    return `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedBDs, setSelectedBDs] = useState([]);
  const [excludeBDs, setExcludeBDs] = useState(false);
  const [bdOptions, setBdOptions] = useState([]);
  const [projections, setProjections] = useState([]);
  const [targets, setTargets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState("cards");

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

  const fetchProjectionsAndTargets = async (monthValue, bdCodes) => {
    if (!bdCodes || bdCodes.length === 0) {
      setProjections([]);
      setTargets([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const { fromDate, toDate } = calculateMonthDateRange(monthValue);
      
      const payload = {
        CODECDs: bdCodes,
        fromDate: fromDate,
        toDate: toDate,
      };

      const [projectionsData, targetsData] = await Promise.all([
        getAllBdProjection(payload),
        getAllBdTargets(payload),
      ]);

      setProjections(projectionsData.map((p) => ({
        id: p.id,
        CODECD: String(p.codecd),
        CUSTACCCODE: p.custacccode,
        ProjDate: p.projDate,
        ProjVal: parseFloat(p.projVal) || 0,
        BDName: p.bdName,
        ClientName: p.clientName,
        REMARKS: p.remarks,
      })));

      setTargets(targetsData.map((t) => ({
        ...t,
        codecd: String(t.codecd),
        TargetVal: parseFloat(t.targetVal) || 0,
      })));
    } catch (error) {
      console.error("Failed to fetch projections/targets:", error);
      setProjections([]);
      setTargets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchBDs = async () => {
      try {
        const { fromDate, toDate } = calculateMonthDateRange(selectedMonth);
        const bds = await getBdNames({ fromDate, toDate });
        const normalized = bds.map((bd) => ({
          value: String(bd.codecd),
          label: bd.bdName,
          codecd: String(bd.codecd),
          bdName: bd.bdName,
        }));
        setBdOptions(normalized);
        
        if (normalized.length > 0 && selectedBDs.length === 0) {
          const allBdCodes = normalized.map(bd => bd.codecd);
          setSelectedBDs(allBdCodes);
        } else if (normalized.length > 0 && selectedBDs.length > 0) {
          const validSelectedBDs = selectedBDs.filter(codecd => normalized.some(bd => bd.codecd === codecd));
          setSelectedBDs(validSelectedBDs);
        } else if (normalized.length === 0) {
          setSelectedBDs([]);
        }

      } catch (error) {
        console.error("Failed to fetch BD names:", error);
        setBdOptions([]);
      }
    };
    fetchBDs();
  }, [selectedMonth]);

  useEffect(() => {
    const effectiveBdCodes = excludeBDs
      ? bdOptions.filter(bd => !selectedBDs.includes(bd.codecd)).map(bd => bd.codecd)
      : selectedBDs;
    
    fetchProjectionsAndTargets(selectedMonth, effectiveBdCodes);
  }, [selectedMonth, selectedBDs, excludeBDs, bdOptions.length]);

  useEffect(() => {
    const effectiveBdObjects = bdOptions.filter(bd => {
        if (excludeBDs) {
            return !selectedBDs.includes(bd.codecd);
        }
        return selectedBDs.includes(bd.codecd);
    });
    
    if (effectiveBdObjects.length > 0 && onMonthChange) {
      const { fromDate, toDate } = calculateMonthDateRange(selectedMonth);
      const bdNames = effectiveBdObjects.map(bd => bd.bdName);
      const bdCodes = effectiveBdObjects.map(bd => bd.codecd);

      onMonthChange({
        fromDate: fromDate,
        toDate: toDate,
        bdNames: bdNames,
        CODECDs: bdCodes,
        dateField: "regisDate",
      });
    } else if (onMonthChange) {
        const { fromDate, toDate } = calculateMonthDateRange(selectedMonth);
        onMonthChange({
            fromDate: fromDate,
            toDate: toDate,
            bdNames: [],
            CODECDs: [],
            dateField: "regisDate",
        });
    }
  }, [selectedMonth, selectedBDs, excludeBDs, bdOptions.length, onMonthChange]);

  const bdPerformanceData = useMemo(() => {
    const effectiveBdCodes = excludeBDs
      ? bdOptions.filter(bd => !selectedBDs.includes(bd.codecd)).map(bd => bd.codecd)
      : selectedBDs;

    const selectedBdData = bdOptions.filter(bd => effectiveBdCodes.includes(bd.codecd));
    
    return selectedBdData.map((bd) => {
      const bdProjections = projections.filter((p) => String(p.CODECD) === bd.codecd);
      const bdTarget = targets.find((t) => String(t.codecd) === bd.codecd);
      const bdInquiries = inquiriesData.filter((i) => i.bdName === bd.bdName); 

      const totalProjected = bdProjections.reduce((sum, p) => sum + p.ProjVal, 0);
      const totalAchieved = bdInquiries.reduce((sum, i) => sum + (parseFloat(i.regisVal) || 0), 0); 
      const totalTarget = bdTarget ? bdTarget.TargetVal : 0;

      const uniqueClientsInProjections = new Set(bdProjections.map((p) => p.ClientName));
      const uniqueClientsInInquiries = new Set(bdInquiries.map((i) => i.clientName));
      const combinedClients = new Set([...uniqueClientsInProjections, ...uniqueClientsInInquiries]);

      const clientDetails = Array.from(combinedClients).map(clientName => {
        const clientProjections = bdProjections.filter(p => p.ClientName === clientName);
        const clientInquiries = bdInquiries.filter(i => i.clientName === clientName);
        
        const projected = clientProjections.reduce((sum, p) => sum + p.ProjVal, 0);
        const achieved = clientInquiries.reduce((sum, i) => sum + (parseFloat(i.regisVal) || 0), 0);
        
        return {
          clientName,
          projected,
          achieved
        };
      }).filter(c => c.projected > 0 || c.achieved > 0);

      return {
        bdName: bd.bdName,
        codecd: bd.codecd,
        totalProjected,
        totalAchieved,
        totalTarget,
        clientCount: combinedClients.size,
        projectionCount: bdProjections.length,
        clients: clientDetails
      };
    });
  }, [projections, targets, inquiriesData, bdOptions, selectedBDs, excludeBDs]);

  const clientComparisonData = useMemo(() => {
    const effectiveBdCodes = excludeBDs
      ? bdOptions.filter(bd => !selectedBDs.includes(bd.codecd)).map(bd => bd.codecd)
      : selectedBDs;

    const clientMap = {};

    projections.forEach((proj) => {
      if (!effectiveBdCodes.includes(String(proj.CODECD))) return; 
      
      const clientName = proj.ClientName || "Unknown";
      const bdCode = String(proj.CODECD);
      
      if (!clientMap[clientName]) {
        clientMap[clientName] = { clientName, bdData: {} };
      }
      
      if (!clientMap[clientName].bdData[bdCode]) {
        clientMap[clientName].bdData[bdCode] = { projected: 0, achieved: 0 };
      }
      
      clientMap[clientName].bdData[bdCode].projected += proj.ProjVal;
    });

    inquiriesData.forEach((inq) => {
      if (inq.regisVal && inq.clientName && inq.bdName) {
        const clientName = inq.clientName;
        const bdInfo = bdOptions.find(bd => bd.bdName === inq.bdName);
        
        if (bdInfo && effectiveBdCodes.includes(bdInfo.codecd)) { 
          const bdCode = bdInfo.codecd;

          if (!clientMap[clientName]) {
            clientMap[clientName] = { clientName, bdData: {} };
          }
          
          if (!clientMap[clientName].bdData[bdCode]) {
            clientMap[clientName].bdData[bdCode] = { projected: 0, achieved: 0 };
          }
          
          clientMap[clientName].bdData[bdCode].achieved += parseFloat(inq.regisVal) || 0;
        }
      }
    });

    const filteredClients = Object.values(clientMap).filter(client => {
      return effectiveBdCodes.some(codecd => {
        const data = client.bdData[codecd];
        return data && (data.projected > 0 || data.achieved > 0);
      });
    });

    return filteredClients;
  }, [projections, inquiriesData, bdOptions, selectedBDs, excludeBDs]);

  const overallStats = useMemo(() => {
    const totalProjected = bdPerformanceData.reduce((sum, bd) => sum + bd.totalProjected, 0);
    const totalAchieved = bdPerformanceData.reduce((sum, bd) => sum + bd.totalAchieved, 0);
    const totalTarget = bdPerformanceData.reduce((sum, bd) => sum + bd.totalTarget, 0);
    const activeBDs = bdPerformanceData.length;

    return { totalProjected, totalAchieved, totalTarget, activeBDs };
  }, [bdPerformanceData]);

  const handleMonthChange = (monthValue) => {
    setSelectedMonth(monthValue);
  };

  const handleBDChange = (bdCodes) => {
    setSelectedBDs(bdCodes);
  };

  const handleDeselectAll = () => {
    setSelectedBDs([]);
  };

  const handleClearFilters = () => {
    setSelectedMonth(() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });
    setSelectedBDs(bdOptions.map(bd => bd.codecd));
    setExcludeBDs(false);
  };

  const selectedBdObjects = bdOptions.filter(bd => {
    if (excludeBDs) {
      return !selectedBDs.includes(bd.codecd);
    }
    return selectedBDs.includes(bd.codecd);
  });

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
                <Trophy className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  BD Performance Analysis
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Compare and analyze BD performance across clients month-wise
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
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
                  BD Selection
                </label>
                <ExcludeToggle
                  enabled={excludeBDs}
                  onChange={setExcludeBDs}
                />
              </div>
              <Dropdown
                options={bdOptions}
                selected={selectedBDs}
                onSelect={handleBDChange}
                icon={Users}
                placeholder="Choose BDs"
                multiple={true}
                onDeselectAll={handleDeselectAll}
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

        {/* Overall Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Projected"
            value={`₹${formatAmount(overallStats.totalProjected)}`}
            icon={TrendingUp}
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
            title="Total Target"
            value={`₹${formatAmount(overallStats.totalTarget)}`}
            icon={Target}
            borderColor="border-purple-500"
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
            textColor="text-purple-700"
            isLoading={isLoading}
          />
          <SummaryCard
            title="Active BDs"
            value={overallStats.activeBDs}
            icon={Users}
            borderColor="border-teal-500"
            bgColor="bg-teal-100"
            iconColor="text-teal-600"
            textColor="text-teal-700"
            isLoading={isLoading}
          />
        </div>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-lg border border-gray-200"
          >
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
            <span className="text-xl font-medium text-gray-600">Loading Performance Data...</span>
          </motion.div>
        ) : selectedBdObjects.length === 0 ? (
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
              <Users className="w-12 h-12 text-gray-400" />
            </motion.div>
            <span className="text-xl font-medium text-gray-600">No BDs Selected</span>
            <span className="text-sm text-gray-400 mt-2 max-w-md text-center">
              Please select at least one BD to view performance analysis.
            </span>
          </motion.div>
        ) : (
          <>
            {/* View Toggle */}
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
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
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
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  <BarChart3 className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Graph View</span>
                </motion.button>
              </motion.div>
            </div>

            {/* Content */}
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
                      key={bd.codecd}
                      bd={bd}
                      isLoading={isLoading}
                      clients={bd.clients}
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
                  <GraphView data={clientComparisonData} bdNames={selectedBdObjects} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}