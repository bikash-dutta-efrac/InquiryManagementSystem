import { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  Expand,
  BarChart3,
  Building2,
  Users,
  Briefcase,
  ChevronRight,
  Telescope,
  Activity,
  CheckCircle2,
  XCircle,
  DollarSign,
  FileText,
  X,
  AlertCircle,
  User,
} from "lucide-react";
import { LineChart } from "@mui/x-charts";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoBarChartSharp,
  IoChatbubbleSharp,
  IoDocument,
  IoInformation,
  IoInformationCircle,
  IoPeopleSharp,
} from "react-icons/io5";
import {
  MdAssignment,
  MdCheckCircle,
  MdCancel,
  MdWallet,
  MdQueryBuilder,
  MdDetails,
} from "react-icons/md";

function formatAmount(num) {
  if (num === null || num === undefined) return 0;
  const number = parseFloat(num);
  if (number < 1000) return number.toFixed(0);
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
    if (number >= si[i].value) {
      break;
    }
  }
  return (number / si[i].value).toFixed(2).replace(rx, "$1") + si[i].symbol;
}

const SummaryCard = ({ title, value, icon: Icon, color, onClick }) => {
  const colorClasses = {
    blue: {
      border: "border-blue-500",
      bg: "bg-blue-50",
      icon: "text-blue-600",
      text: "text-blue-700",
      iconBg: "bg-blue-100",
    },
    yellow: {
      border: "border-yellow-500",
      bg: "bg-yellow-50",
      icon: "text-yellow-600",
      text: "text-yellow-700",
      iconBg: "bg-yellow-100",
    },
    green: {
      border: "border-green-500",
      bg: "bg-green-50",
      icon: "text-green-600",
      text: "text-green-700",
      iconBg: "bg-green-100",
    },
    red: {
      border: "border-red-500",
      bg: "bg-red-50",
      icon: "text-red-600",
      text: "text-red-700",
      iconBg: "bg-red-100",
    },
    lime: {
      border: "border-lime-500",
      bg: "bg-lime-50",
      icon: "text-lime-600",
      text: "text-lime-700",
      iconBg: "bg-lime-100",
    },
    cyan: {
      border: "border-cyan-500",
      bg: "bg-cyan-50",
      icon: "text-cyan-600",
      text: "text-cyan-700",
      iconBg: "bg-cyan-100",
    },
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg border-t-4 ${classes.border} transform transition-all duration-300 cursor-pointer group overflow-hidden relative`}
    >
      <div
        className={`absolute inset-0 ${classes.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
      <div className="relative p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase text-gray-600 tracking-wide">
            {title}
          </span>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className={`p-2.5 rounded-xl ${classes.iconBg} shadow-sm`}
          >
            <Icon className={`w-5 h-5 ${classes.icon}`} />
          </motion.div>
        </div>
        <p
          className={`text-3xl font-extrabold ${classes.text} group-hover:scale-105 transition-transform`}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
};

const CollapsibleSection = ({
  title,
  icon: Icon,
  children,
  defaultExpanded = true,
  colorClass,
  itemCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-between p-6 cursor-pointer bg-gradient-to-r ${colorClass} transition-all duration-300 hover:shadow-lg`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shadow-md"
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-white/90 mt-0.5">
              {itemCount > 0 ? `${itemCount} items • ` : ""}Click to{" "}
              {isExpanded ? "collapse" : "expand"}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          className="p-2 rounded-lg bg-white/20 backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {itemCount === 0 ? (
              <div className="p-12 text-center bg-gradient-to-br from-gray-50 to-blue-50">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block p-4 rounded-full bg-gray-100 mb-4"
                >
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </motion.div>
                <p className="text-base font-semibold text-gray-600 mb-1">
                  No Data Available
                </p>
                <p className="text-sm text-gray-400">
                  No {title.toLowerCase()} found for the selected period
                </p>
              </div>
            ) : (
              <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                {children}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DetailCard = ({ item, type, index }) => {
  const getTitle = () => {
    if (type === "vertical") return item.vertical || "-";
    if (type === "bd") return item.bdName || "-";
    if (type === "client") return item.client || "-";
    return "-";
  };

  const colorMap = {
    vertical: {
      border: "border-orange-500",
      accent: "text-orange-600",
      bg: "bg-gradient-to-br from-orange-50 to-amber-50",
      shadow: "shadow-orange-100",
    },
    bd: {
      border: "border-blue-500",
      accent: "text-blue-600",
      bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
      shadow: "shadow-blue-100",
    },
    client: {
      border: "border-green-500",
      accent: "text-green-600",
      bg: "bg-gradient-to-br from-green-50 to-emerald-50",
      shadow: "shadow-green-100",
    },
  };

  const colors = colorMap[type] || colorMap.vertical;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -3, boxShadow: "0 12px 20px -5px rgb(0 0 0 / 0.15)" }}
      className={`flex-shrink-0 w-[200px] ${colors.bg} rounded-xl shadow-md hover:${colors.shadow} border-t-4 ${colors.border} p-4 transition-all duration-300 group`}
    >
      <div className="mb-3">
        <h4
          className={`text-sm font-bold ${colors.accent} group-hover:scale-105 transition-transform line-clamp-2 min-h-[40px]`}
        >
          {getTitle()}
        </h4>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-gray-600">
            <IoDocument className="w-3.5 h-3.5 text-gray-400" />
            <span>Quotations</span>
          </span>
          <span className="font-bold text-gray-900">
            {item.totalQuotations?.size ?? 0}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-gray-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span>Approved</span>
          </span>
          <span className="font-bold text-green-600">{item.approved ?? 0}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-gray-600">
            <XCircle className="w-3.5 h-3.5 text-red-500" />
            <span>Not Approved</span>
          </span>
          <span className="font-bold text-red-600">
            {Number(item.totalQuotations?.size ?? 0) -
              Number(item.approved ?? 0) || 0}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-gray-600">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <span>Registrations</span>
          </span>
          <span className="font-bold text-indigo-600">
            {item.totalRegistrations ?? 0}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/50">
          <span className="flex items-center gap-1.5 text-gray-600">
            <DollarSign className="w-3.5 h-3.5 text-purple-500" />
            <span>Reg Value</span>
          </span>
          <span className="font-bold text-purple-600">
            ₹{formatAmount(item.totalRegisVal ?? 0)}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-1">
        {type !== "vertical" && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Telescope className="w-3 h-3 text-gray-400" />
            <span>
              <span className="font-semibold text-gray-800">
                {item.assocVerticals?.size ?? 0}
              </span>{" "}
              Vertical(s)
            </span>
          </div>
        )}
        {type !== "bd" && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Users className="w-3 h-3 text-gray-400" />
            <span>
              <span className="font-semibold text-gray-800">
                {item.assocBds?.size ?? 0}
              </span>{" "}
              BD(s)
            </span>
          </div>
        )}
        {type !== "client" && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Building2 className="w-3 h-3 text-gray-400" />
            <span>
              <span className="font-semibold text-gray-800">
                {item.assocClients?.size ?? 0}
              </span>{" "}
              Client(s)
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ChartSection = ({ dailyDates, dailyRegisValues, onExpand }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-xl border border-cyan-100 p-6 overflow-hidden relative"
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
              <TrendingUp className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Daily Registration Trend
              </h3>
              <p className="text-sm text-gray-500">
                Visual analysis of daily performance
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExpand}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Expand className="w-4 h-4" />
            <span className="text-sm font-medium">Expand</span>
          </motion.button>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-inner">
          <LineChart
            xAxis={[
              {
                scaleType: "point",
                data: dailyDates,
                tickLabelStyle: { angle: 0, fontSize: 10 },
              },
            ]}
            series={[
              {
                data: dailyRegisValues.map((val) => parseFloat(val.toFixed(2))),
                label: "Registered Value",
                color: "#0ea5e9",
                valueFormatter: (val) => `₹ ${formatAmount(val)}`,
              },
            ]}
            height={300}
          />
        </div>
      </div>
    </motion.div>
  );
};

const ExpandedChartModal = ({ dailyDates, dailyRegisValues, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="p-2 rounded-lg bg-white/20 backdrop-blur-sm"
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Daily Registration Trend - Full View
                </h2>
                <p className="text-cyan-100 text-sm">
                  Detailed analysis across all days
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

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
              <LineChart
                xAxis={[
                  {
                    scaleType: "point",
                    data: dailyDates,
                    tickLabelStyle: { angle: -45, fontSize: 12 },
                  },
                ]}
                series={[
                  {
                    data: dailyRegisValues.map((val) =>
                      parseFloat(val.toFixed(2))
                    ),
                    label: "Registered Value",
                    color: "#0ea5e9",
                    valueFormatter: (val) => `₹ ${formatAmount(val)}`,
                  },
                ]}
                height={500}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function InquiryOverview({ username, designation, data = [], queryType, onCardClick }) {
  const [summaryByVertical, setSummaryByVertical] = useState([]);
  const [summaryByBd, setSummaryByBd] = useState([]);
  const [summaryByClient, setSummaryByClient] = useState([]);
  const [expandedChart, setExpandedChart] = useState(false);

  const dedupeBy = (arr, key) => [
    ...new Map(arr.map((x) => [x[key], x])).values(),
  ];

  const totalInquiries = new Set(data.map((d) => d.inqNo).filter(Boolean)).size;
  const totalQuotations = new Set(data.map((d) => d.quotNo).filter(Boolean))
    .size;

  const totalRegisteredValue = dedupeBy(
    data.filter((d) => d.regisNo),
    "regisNo"
  ).reduce((sum, d) => sum + (parseFloat(d.regisVal) || 0), 0);

  const distinctQuotations = dedupeBy(data, "quotNo");
  const quotations = distinctQuotations.length;
  const registeredFromQuot = new Set(
    data.filter((d) => d.quotNo && d.regisNo).map((d) => d.quotNo)
  ).size;

  useEffect(() => {
    const summary = data.reduce((acc, item) => {
      const v = item.vertical || "Unknown";

      if (!acc[v]) {
        acc[v] = {
          vertical: v,
          totalRegistrations: 0,
          totalQuotations: new Set(),
          approved: 0,
          totalRegisVal: 0,
          assocClients: new Set(),
          assocBds: new Set(),
        };
      }

      acc[v].totalRegistrations += 1;
      acc[v].totalRegisVal += Number(item.regisVal || 0);
      if (!acc[v].totalQuotations.has(item.quotNo)) {
        acc[v].totalQuotations.add(item.quotNo);
        if (item.quotStatus === "Approved") acc[v].approved += 1;
      }
      acc[v].assocBds.add(item.bdName);
      acc[v].assocClients.add(item.clientName);

      return acc;
    }, {});

    setSummaryByVertical(
      Object.values(summary).sort((a, b) => b.totalRegisVal - a.totalRegisVal)
    );
  }, [data]);

  useEffect(() => {
    const summary = data.reduce((acc, item) => {
      const v = item.bdName || "Unknown";

      if (!acc[v]) {
        acc[v] = {
          bdName: v,
          totalRegistrations: 0,
          totalQuotations: new Set(),
          approved: 0,
          totalRegisVal: 0,
          assocClients: new Set(),
          assocVerticals: new Set(),
        };
      }

      acc[v].totalRegistrations += 1;
      acc[v].totalRegisVal += Number(item.regisVal || 0);
      if (!acc[v].totalQuotations.has(item.quotNo)) {
        acc[v].totalQuotations.add(item.quotNo);
        if (item.quotStatus === "Approved") acc[v].approved += 1;
      }
      acc[v].assocVerticals.add(item.vertical);
      acc[v].assocClients.add(item.clientName);

      return acc;
    }, {});

    setSummaryByBd(
      Object.values(summary).sort((a, b) => b.totalRegisVal - a.totalRegisVal)
    );
  }, [data]);

  useEffect(() => {
    const summary = data.reduce((acc, item) => {
      const v = item.clientName || "Unknown";

      if (!acc[v]) {
        acc[v] = {
          client: v,
          totalRegistrations: 0,
          totalQuotations: new Set(),
          approved: 0,
          totalRegisVal: 0,
          assocVerticals: new Set(),
          assocBds: new Set(),
        };
      }

      acc[v].totalRegistrations += 1;
      acc[v].totalRegisVal += Number(item.regisVal || 0);
      if (!acc[v].totalQuotations.has(item.quotNo)) {
        acc[v].totalQuotations.add(item.quotNo);
        if (item.quotStatus === "Approved") acc[v].approved += 1;
      }
      acc[v].assocVerticals.add(item.vertical);
      acc[v].assocBds.add(item.bdName);

      return acc;
    }, {});

    setSummaryByClient(
      Object.values(summary).sort((a, b) => b.totalRegisVal - a.totalRegisVal)
    );
  }, [data]);

  const regCountMap = {};
  const regValMap = {};

  data.forEach((d) => {
    if (queryType === "regisDate" && d.regisDate) {
      const key = new Date(d.regisDate).toLocaleDateString("en-CA");
      regCountMap[key] = (regCountMap[key] || 0) + 1;
      regValMap[key] = (regValMap[key] || 0) + (parseFloat(d.regisVal) || 0);
    }
  });

  const dailyDates = Array.from(new Set([...Object.keys(regCountMap)])).sort();
  const dailyRegisValues = dailyDates.map((d) => regValMap[d] || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl shadow-2xl mb-8 bg-white border border-gray-200"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 opacity-95"></div>
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
                <MdDetails className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-2xl font-bold text-white tracking-tight">
                {queryType === "inqDate"
                  ? "Inquiry Overview"
                  : queryType === "quotDate"
                  ? "Quotation Overview"
                  : "Registration Overview"}
              </h1>
              <p className="text-cyan-100 text-sm mt-1">
                Comprehensive analysis of {queryType === "inqDate"
                  ? "inquiries"
                  : queryType === "quotDate"
                  ? "quotations"
                  : "registrations"}
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

        {/* KPI Cards */}
        {queryType !== "regisDate" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
            {queryType === "inqDate" && (
              <SummaryCard
                title="Total Inquiries"
                value={totalInquiries}
                icon={IoChatbubbleSharp}
                color="blue"
                onClick={() => onCardClick("inquiries")}
              />
            )}
            <SummaryCard
              title="Quotations"
              value={quotations}
              icon={IoDocument}
              color="yellow"
              onClick={() => onCardClick("quotations")}
            />
            <SummaryCard
              title="Approved"
              value={registeredFromQuot}
              icon={MdCheckCircle}
              color="green"
              onClick={() => onCardClick("quotations")}
            />
            <SummaryCard
              title="Not Approved"
              value={totalQuotations - registeredFromQuot}
              icon={MdCancel}
              color="red"
              onClick={() => onCardClick("quotations")}
            />
            <SummaryCard
              title="Registrations"
              value={data.length}
              icon={MdAssignment}
              color="lime"
              onClick={() => onCardClick("registrations")}
            />
            <SummaryCard
              title="Reg Value"
              value={`₹${formatAmount(totalRegisteredValue)}`}
              icon={MdWallet}
              color="cyan"
              onClick={() => onCardClick("registrations")}
            />
          </div>
        )}

        {/* Registration Date View */}
        {queryType === "regisDate" && (
          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SummaryCard
                title="Total Registrations"
                value={data.length}
                icon={MdAssignment}
                color="lime"
                onClick={() => onCardClick("registrations")}
              />
              <SummaryCard
                title="Registered Value"
                value={`₹${formatAmount(totalRegisteredValue)}`}
                icon={MdWallet}
                color="cyan"
                onClick={() => onCardClick("registrations")}
              />
            </div>
            <ChartSection
              dailyDates={dailyDates}
              dailyRegisValues={dailyRegisValues}
              onExpand={() => setExpandedChart(true)}
            />
          </div>
        )}

        {/* BD Summary */}
        <div className="mb-8">
          <CollapsibleSection
            title="BD Person Summary"
            icon={Users}
            colorClass="from-blue-500 via-cyan-500 to-teal-500"
          >
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-min">
                {summaryByBd.map((item, idx) => (
                  <DetailCard key={idx} item={item} type="bd" index={idx} />
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Client Summary */}
        <div className="mb-8">
          <CollapsibleSection
            title="Client Summary"
            icon={Building2}
            colorClass="from-lime-500 via-green-500 to-emerald-500"
          >
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-min">
                {summaryByClient.map((item, idx) => (
                  <DetailCard key={idx} item={item} type="client" index={idx} />
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Vertical Summary */}
        <div className="mb-8">
          <CollapsibleSection
            title="Vertical Summary"
            icon={Telescope}
            colorClass="from-red-500 via-orange-500 to-yellow-500"
          >
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-min">
                {summaryByVertical.map((item, idx) => (
                  <DetailCard
                    key={idx}
                    item={item}
                    type="vertical"
                    index={idx}
                  />
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Empty State */}
        {data.length === 0 && (
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
              <FileText className="w-12 h-12 text-gray-400" />
            </motion.div>
            <span className="text-xl font-medium text-gray-600">
              No Data Available
            </span>
            <span className="text-sm text-gray-400 mt-2 max-w-md text-center">
              No inquiries, quotations, or registrations found for the selected
              period.
            </span>
          </motion.div>
        )}
      </div>

      {/* Expanded Chart Modal */}
      {expandedChart && (
        <ExpandedChartModal
          dailyDates={dailyDates}
          dailyRegisValues={dailyRegisValues}
          onClose={() => setExpandedChart(false)}
        />
      )}
    </div>
  );
}
