import { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  Expand,
} from "lucide-react";
import { LineChart } from "@mui/x-charts";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaLink,
} from "react-icons/fa";
import {
  IoBarChartSharp,
  IoChatbubbleSharp,
  IoDocument,
  IoPeopleSharp,
} from "react-icons/io5";
import {
  MdAssignment,
  MdCheckCircle,
  MdCancel,
  MdWallet,
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


function KpiCard1({ title, value, chip, icon, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition h-[140px]">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-95`}
      />
      <div className="relative p-4 text-white flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider bg-black/30 px-2 py-1 rounded-full">
            {chip}
          </span>
          <div className="p-2 bg-black/20 rounded-xl">{icon}</div>
        </div>
        <div>
          <h4 className="mt-2 text-sm opacity-90">{title}</h4>
          <div className="text-2xl font-extrabold tracking-tight drop-shadow-sm">
            {value}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/10 group-hover:bg-white/20 transition" />
    </div>
  );
}

function KpiCard2({ summary, type, gradient }) {
  const items = Object.values(summary || {}).sort((a, b) =>
    String(a.vertical ?? "").localeCompare(String(b.vertical ?? ""))
  );

  const scrollRef = useRef(null);
  const [centerItems, setCenterItems] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      setCenterItems(el.scrollWidth <= el.clientWidth);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [items]);

  if (!items.length) return null;

  const getTitle = () => {
    if (type === "vertical") return "Vertical Summary";
    if (type === "bd") return "BD Summary";
    if (type === "client") return "Client Summary";
    return "Summary";
  };

  const IconMapping = {
    registrations: <IoPeopleSharp />,
    regValue: <IoBarChartSharp />,
    approved: <FaCheckCircle />,
    notApproved: <FaTimesCircle />,
    assocVerticals: <FaLink />,
    assocBds: <FaLink />,
    assocClients: <FaLink />,
    parameters: <FaLink />,
  };

  return (
    <div className="relative flex rounded-2xl shadow-2xl bg-white border border-gray-100/50 group my-6">
      {/* Sidebar with vertical text */}
      <div
        className={`flex items-center justify-center p-4 rounded-r-2xl bg-gradient-to-b ${gradient}`}
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        <h3 className="font-semibold text-m text-white">{getTitle()}</h3>
      </div>

      {/* Main content area */}
      <div className="flex-grow-1 min-w-0 bg-white rounded-r-2xl">
        {/* Scroll container with padding */}
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden scroll-smooth px-6 py-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Flex wrapper for the cards */}
          <div className="flex flex-nowrap gap-4" role="list">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="relative flex-shrink-0 min-w-[180px] max-w-[180px] h-auto p-4 rounded-xl border border-gray-200
                  shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out
                  transform hover:-translate-y-0.5 bg-white flex flex-col justify-between
                  border-t-4"
                style={{
                  borderColor:
                    type === "bd"
                      ? "#00aeff"
                      : type === "client"
                      ? "#02b96d"
                      : "#fd8f00",
                }}
                role="listitem"
                tabIndex={0}
              >
                {/* <div
                  className={`absolute h-full w-1 rounded-l-xl border-width: 10px border-color: ${
                    type === "bd"
                      ? "#00aeff"
                      : type === "client"
                      ? "#02b96d"
                      : "#fd8f00"
                  }`}
                /> */}

                {/* Card Title */}
                <div className="flex items-center mb-2">
                  <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm">
                    {type === "vertical" && (item.vertical ?? "-")}
                    {type === "bd" && (item.bdName ?? "-")}
                    {type === "client" && (item.client ?? "-")}
                  </h3>
                </div>

                {/* Details Section */}
                <div className="space-y-1 text-xs text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="text-gray-400">
                        {IconMapping.registrations}
                      </span>
                      <span>Quotations</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {item.totalQuotations?.size ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="text-green-500">
                        {IconMapping.approved}
                      </span>
                      <span>Approved</span>
                    </span>
                    <span className="font-semibold text-green-600">
                      {item.approved ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="text-red-500">
                        {IconMapping.notApproved}
                      </span>
                      <span>Not Approved</span>
                    </span>
                    <span className="font-semibold text-red-600">
                      {Number(item.totalQuotations?.size ?? 0) -
                        Number(item.approved ?? 0) || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="text-gray-400">
                        {IconMapping.registrations}
                      </span>
                      <span>Registrations</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {item.totalRegistrations ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="text-indigo-500">
                        {IconMapping.regValue}
                      </span>
                      <span>Reg Value</span>
                    </span>
                    <span className="font-semibold text-indigo-600">
                      {formatAmount(item.totalRegisVal ?? 0)}
                    </span>
                  </div>
                </div>

                {/* Associated links / counts */}
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600">
                  {type !== "vertical" && type !== "lab" && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">
                        {IconMapping.assocVerticals}
                      </span>
                      <p className="line-clamp-1">
                        <span className="font-semibold">
                          {item.assocVerticals?.size ?? 0}
                        </span>{" "}
                        Vertical(s)
                      </p>
                    </div>
                  )}
                  {type !== "bd" && type !== "lab" && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">
                        {IconMapping.assocBds}
                      </span>
                      <p className="line-clamp-1">
                        <span className="font-semibold">
                          {item.assocBds?.size ?? 0}
                        </span>{" "}
                        BD(s)
                      </p>
                    </div>
                  )}
                  {type !== "client" && type !== "lab" && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">
                        {IconMapping.assocClients}
                      </span>
                      <p className="line-clamp-1">
                        <span className="font-semibold">
                          {item.assocClients?.size ?? 0}
                        </span>{" "}
                        Client(s)
                      </p>
                    </div>
                  )}
                  {type === "lab" && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">
                        {IconMapping.parameters}
                      </span>
                      <p className="line-clamp-1">
                        <span className="font-semibold">
                          {item.parameters?.size ?? 0}
                        </span>{" "}
                        Parameter(s)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const KpiColorMap = {
  blue: {
    borderColor: "border-blue-500",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  yellow: {
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  green: {
    borderColor: "border-green-500",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  red: {
    borderColor: "border-red-500",
    bgColor: "bg-red-100",
    iconColor: "text-red-600",
  },
  lime: {
    borderColor: "border-lime-500",
    bgColor: "bg-lime-100",
    iconColor: "text-lime-600",
  },
  cyan: {
    borderColor: "border-cyan-500",
    bgColor: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
};

const KpiCard3 = ({ title, value, color, icon }) => {
  const classes = KpiColorMap[color] || {};

  const finalBorderClass = `border-t-4 ${classes.borderColor}`;

  return (
    <div
      className={`bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 ${finalBorderClass}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase text-gray-500">
          {title}
        </span>
        <div
          className={`p-2 mx-2 rounded-full ${classes.bgColor} ${classes.iconColor}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

export default function InquiryOverview({ data = [], queryType, onCardClick }) {
  const [summaryByVertical, setSummaryByVertical] = useState({});
  const [summaryByBd, setSummaryByBd] = useState({});
  const [summaryByClient, setSummaryByClient] = useState({});
  const [expandedChart, setExpandedChart] = useState(null);

  const chartRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(600);

  useEffect(() => {
    function handleResize() {
      if (chartRef.current) {
        setChartWidth(chartRef.current.offsetWidth - 40);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const totalQuotationValue = dedupeBy(data, "quotNo").reduce(
    (sum, d) => sum + (parseFloat(d.quotValAfterDis) || 0),
    0
  );

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

    const sortedSummary = Object.values(summary).sort(
      (a, b) => b.totalRegisVal - a.totalRegisVal
    );

    setSummaryByVertical(sortedSummary);
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

    const sortedSummary = Object.values(summary).sort(
      (a, b) => b.totalRegisVal - a.totalRegisVal
    );

    setSummaryByBd(sortedSummary);
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

    const sortedSummary = Object.values(summary).sort(
      (a, b) => b.totalRegisVal - a.totalRegisVal
    );

    setSummaryByClient(sortedSummary);
  }, [data]);

  // Maps to store counts and total registration values
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

  // const dailyRegistrations = dailyDates.map((d) => regCountMap[d] || 0);
  const dailyRegisValues = dailyDates.map((d) => regValMap[d] || 0);

  return (
    <div className="bg-gray-50 p-8 rounded-3xl shadow-2xl mb-4">
      <div className="mb-8">
        {queryType !== "regisDate" && (
          <div
            className={`grid gap-4 sm:gap-4 items-stretch
          grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
          ${queryType === "inqDate" ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}
          >
            {queryType === "inqDate" && (
              <div
                onClick={() => onCardClick("inquiries")}
                className="cursor-pointer"
              >
                <KpiCard3
                  title="Total Inquiries"
                  value={totalInquiries}
                  icon={<IoChatbubbleSharp className="w-5 h-5" />}
                  color="blue"
                />
              </div>
            )}

            <div
              onClick={() => onCardClick("quotations")}
              className="cursor-pointer"
            >
              <KpiCard3
                title="Total Quotations"
                value={quotations}
                icon={<IoDocument className="w-5 h-5" />}
                color="yellow"
              />
            </div>

            <div
              onClick={() => onCardClick("quotations")}
              className="cursor-pointer"
            >
              <KpiCard3
                title="Approved Quotations"
                value={registeredFromQuot}
                icon={<MdCheckCircle className="w-5 h-5" />}
                color="green"
              />
            </div>

            <div
              onClick={() => onCardClick("quotations")}
              className="cursor-pointer"
            >
              <KpiCard3
                title="Not Approved Quotations"
                value={totalQuotations - registeredFromQuot}
                icon={<MdCancel className="w-5 h-5" />}
                color="red"
              />
            </div>

            <div
              onClick={() => onCardClick("registrations")}
              className="cursor-pointer"
            >
              <KpiCard3
                title="Total Registrations"
                value={data.length}
                icon={<MdAssignment className="w-5 h-5" />}
                color="lime"
              />
            </div>

            <div
              onClick={() => onCardClick("registrations")}
              className="cursor-pointer"
            >
              <KpiCard3
                title="Total Registered Value"
                value={`₹ ${formatAmount(totalRegisteredValue)}`}
                icon={<MdWallet className="w-5 h-5" />}
                color="cyan"
              />
            </div>
          </div>
        )}

        {/* KPI Cards + Chart (regisDate view) */}
        {queryType === "regisDate" && (
          <div className="grid gap-4 items-stretch lg:grid-cols-[250px_250px_1fr]">
            {/* KPI Card 1 */}
            <div
              onClick={() => onCardClick("registrations")}
              className="cursor-pointer"
            >
              <KpiCard3
                title="Total Registrations"
                value={data.length}
                icon={<MdAssignment className="w-5 h-5" />}
                color="lime"
              />
            </div>

            <div
              onClick={() => onCardClick("registrations")}
              className="cursor-pointer"
            >
              <KpiCard3
                title="Total Registered Value"
                value={`₹ ${formatAmount(totalRegisteredValue)}`}
                icon={<MdWallet className="w-5 h-5" />}
                color="cyan"
              />
            </div>

            <div ref={chartRef} className="w-full h-full">
              <ChartCard
                title="Daily Trend"
                icon={<TrendingUp className="w-3 h-3" color="white" />}
                gradient="from-purple-600 to-fuchsia-700"
                onExpand={() => setExpandedChart("daily")}
              >
                <LineChart
                  xAxis={[
                    {
                      scaleType: "point",
                      data: dailyDates,
                      tickLabelStyle: { angle: 0, fontSize: 0 },
                    },
                  ]}
                  series={[
                    {
                      data: dailyRegisValues.map((val) =>
                        parseFloat(val.toFixed(2))
                      ),
                      label: "Registered Value",
                      color: "#8b5cf6",
                      valueFormatter: (val) => `₹ ${formatAmount(val)}`,
                    },
                  ]}
                  showLegend={false}
                  width={undefined}
                  height={120}
                />
              </ChartCard>
            </div>
          </div>
        )}
      </div>

      <KpiCard2
        summary={summaryByBd}
        type={"bd"}
        gradient={"bg-linear-to-r from-blue-500 via-cyan-500 to-teal-500"}
      />
      <KpiCard2
        summary={summaryByClient}
        type={"client"}
        gradient={"bg-linear-to-r from-lime-500 via-green-500 to-emerald-500"}
      />
      <KpiCard2
        summary={summaryByVertical}
        type={"vertical"}
        gradient={"bg-linear-to-r from-red-500 via-orange-500 to-yellow-500"}
      />

      {/* Expanded Modal */}
      {expandedChart && (
        <ExpandModal
          title="Daily Registration Trend"
          onClose={() => setExpandedChart(null)}
          dailyDates={dailyDates}
          dailyRegisValues={dailyRegisValues}
        />
      )}
    </div>
  );
}

function ChartCard({ title, icon, children, gradient, onExpand }) {
  return (
    <div className="flex h-[140px] rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow hover:shadow-lg transition relative overflow-hidden">
      {/* Sidebar Header (rotated) */}
      <div
        className={`flex items-center justify-center p-2 bg-gradient-to-b ${gradient}`}
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        <span className="bg-white/20 rounded-md p-1 mb-2">{icon}</span>
        <h3 className="font-semibold text-sm text-white">{title}</h3>
      </div>

      {/* Chart Content */}
      <div className="flex-1 p-1 flex items-center justify-center">
        <div className="w-full h-full">{children}</div>
      </div>

      {/* Expand button (optional) */}
      {onExpand && (
        <button
          onClick={onExpand}
          className="absolute bottom-3 right-3 flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 shadow"
        >
          <Expand className="w-3 h-3" /> Expand
        </button>
      )}
    </div>
  );
}

function ExpandModal({ title, onClose, dailyDates, dailyRegisValues }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl relative flex flex-col overflow-hidden"
          style={{ maxHeight: "95vh" }}
          initial={{ scale: 0.95, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 30 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-fuchsia-700 text-white sticky top-0 z-10">
            <h2 className="text-base sm:text-lg font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm"
            >
              ✕ Close
            </button>
          </div>

          {/* Chart Content */}
          <div className="overflow-y-auto px-3 sm:px-6 py-4">
            <div className="overflow-x-auto">
              <LineChart
                xAxis={[
                  {
                    scaleType: "point",
                    data: dailyDates,
                    tickLabelStyle: { angle: 0, fontSize: 0 },
                  },
                ]}
                series={[
                  {
                    data: dailyRegisValues.map((val) =>
                      parseFloat(val.toFixed(2))
                    ),
                    label: "Registered Value",
                    color: "#8b5cf6",
                    valueFormatter: (val) => `₹ ${formatAmount(val)}`,
                  },
                ]}
                width={undefined}
                height={
                  window.innerWidth < 640
                    ? 260 // phone
                    : window.innerWidth < 1024
                    ? 350 // tablet
                    : 450 // desktop
                }
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
