import { useState, useEffect, useRef } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Wallet,
  ClipboardList,
  ThumbsUp,
  TrendingUp,
  Expand,
} from "lucide-react";
import { LineChart } from "@mui/x-charts";
import { motion, AnimatePresence } from "framer-motion";

function formatAmount(num) {
  if (num < 100) return num;
  if (num < 100000) {
    let k = num / 1000;
    let str = k.toFixed(2);
    if (str.length > 5) {
      str = Math.round(k).toString();
    }
    if (str.length > 5) {
      str = str.slice(0, 5);
    }
    return `${str}K`;
  } else {
    let lakhs = num / 100000;
    let str = lakhs.toFixed(2);
    if (str.length > 5) {
      str = Math.round(lakhs).toString();
    }
    if (str.length > 5) {
      str = str.slice(0, 5);
    }
    return `${str}L`;
  }
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

function KpiCard2({ summary, type, gradientFrom, gradientTo }) {
  const items = Object.values(summary || {}).sort((a, b) =>
    String(a.vertical).localeCompare(String(b.vertical))
  );

  const scrollRef = useRef(null);
  const [centerItems, setCenterItems] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      setCenterItems(container.scrollWidth <= container.clientWidth);
    }
  }, [items]);

  if (!items.length) return null;

  return (
    <div className="relative rounded-2xl border border-white/30 bg-white/10 shadow-xl">
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl`}
      />

      <div>
        {type === "vertical" && (
          <h2 className="text-center text-xl font-bold text-white mt-4 drop-shadow">
            Vertical Summary
          </h2>
        )}
        {type === "bd" && (
          <h2 className="text-center text-xl font-bold text-white mt-4 drop-shadow">
            BD Summary
          </h2>
        )}
        {type === "client" && (
          <h2 className="text-center text-xl font-bold text-white mt-4 drop-shadow">
            Client Summary
          </h2>
        )}
        <div className="relative">
          {/* Left fade */}
          <div
            className={`absolute rounded-l-2xl h-full w-8 bg-gradient-to-r ${gradientFrom} to-transparent pointer-events-none z-10`}
          />
          {/* Right fade */}
          <div
            className={`absolute rounded-r-2xl h-full w-8 bg-gradient-to-l ${gradientTo} to-transparent pointer-events-none z-10`}
          />

          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="overflow-x-auto overflow-y-visible scroll-smooth p-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-900/30"
            style={{
              height:
                type === "vertical"
                  ? "220px"
                  : type === "bd"
                  ? "230px"
                  : type === "client"
                  ? "240px"
                  : "auto",
            }}
          >
            {/* Inner flex container vertically centered */}
            <div
              className={`relative flex flex-nowrap gap-4 ${
                centerItems ? "justify-center" : "justify-start"
              }`}
              style={{
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="relative min-w-[140px] max-w-[160px] h-auto text-center
                             bg-white/10 rounded-lg p-3
                             shadow-md transform hover:scale-105 hover:shadow-xl hover:z-20
                             transition duration-300"
                  style={{ backdropFilter: "blur(6px)" }}
                >
                  {type === "vertical" && (
                    <h3 className="text-sm font-semibold text-white mb-2">
                      {item.vertical}
                    </h3>
                  )}
                  {type === "bd" && (
                    <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">
                      {item.bdName}
                    </h3>
                  )}
                  {type === "client" && (
                    <h3 className="text-xs font-semibold text-white mb-2 line-clamp-2">
                      {item.client}
                    </h3>
                  )}
                  <div className="text-xs text-gray-100 space-y-0.5 text-justify">
                    <p>
                      Registrations:{" "}
                      <span className="font-semibold text-white">
                        {item.totalRegistrations ?? 0}
                      </span>
                    </p>
                    <p>
                      Reg Value:{" "}
                      <span className="font-semibold text-white">
                        {formatAmount(item.totalRegisVal ?? 0).toLocaleString()}
                      </span>
                    </p>
                    <p>
                      Approved:{" "}
                      <span className="font-semibold text-white">
                        {item.approved ?? 0}
                      </span>
                    </p>
                    <p>
                      Not Approved:{" "}
                      <span className="font-semibold text-white">
                        {item.unapproved ?? 0}
                      </span>
                    </p>
                    {type !== "vertical" && (
                      <p>
                        Assoc. Verticals:{" "}
                        <span className="font-semibold text-white">
                          {item.assocVerticals.size ?? 0}
                        </span>
                      </p>
                    )}
                    {type !== "bd" && (
                      <p>
                        Assoc. Bds:{" "}
                        <span className="font-semibold text-white">
                          {item.assocBds.size ?? 0}
                        </span>
                      </p>
                    )}
                    {type !== "client" && (
                      <p>
                        Assoc. Clients:{" "}
                        <span className="font-semibold text-white">
                          {item.assocClients.size ?? 0}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
          totalRegisVal: 0,
          approved: 0,
          unapproved: 0,
          assocClients: new Set(),
          assocBds: new Set(),
        };
      }

      acc[v].totalRegistrations += 1;
      acc[v].totalRegisVal += Number(item.regisVal || 0);
      if (item.quotStatus === "Approved") acc[v].approved += 1;
      if (item.quotStatus === "Not Approved") acc[v].unapproved += 1;
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
          totalRegisVal: 0,
          approved: 0,
          unapproved: 0,
          assocClients: new Set(),
          assocVerticals: new Set(),
        };
      }

      acc[v].totalRegistrations += 1;
      acc[v].totalRegisVal += Number(item.regisVal || 0);
      if (item.quotStatus === "Approved") acc[v].approved += 1;
      if (item.quotStatus === "Not Approved") acc[v].unapproved += 1;
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
          totalRegisVal: 0,
          approved: 0,
          unapproved: 0,
          assocVerticals: new Set(),
          assocBds: new Set(),
        };
      }

      acc[v].totalRegistrations += 1;
      acc[v].totalRegisVal += Number(item.regisVal || 0);
      if (item.quotStatus === "Approved") acc[v].approved += 1;
      if (item.quotStatus === "Not Approved") acc[v].unapproved += 1;
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
    <div className="space-y-8">
      {/* KPI Cards (non-regisDate view) */}
      {queryType !== "regisDate" && (
        <div
          className={`grid gap-4 sm:gap-6 items-stretch
          grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
          ${queryType === "inqDate" ? "lg:grid-cols-6" : "lg:grid-cols-5"}`}
        >
          {queryType === "inqDate" && (
            <div
              onClick={() => onCardClick("inquiries")}
              className="cursor-pointer"
            >
              <KpiCard1
                title="Total Inquiries"
                value={totalInquiries}
                icon={<FileText className="w-5 h-5" />}
                gradient="from-blue-600 via-blue-700 to-indigo-700"
                chip="Inquiries"
              />
            </div>
          )}

          <div
            onClick={() => onCardClick("quotations")}
            className="cursor-pointer"
          >
            <KpiCard1
              title="Total Quotations"
              value={quotations}
              icon={<ClipboardList className="w-5 h-5" />}
              gradient="from-cyan-600 via-sky-700 to-blue-700"
              chip="Quotations"
            />
          </div>

          <div
            onClick={() => onCardClick("registrations")}
            className="cursor-pointer"
          >
            <KpiCard1
              title="Approved Quotations"
              value={registeredFromQuot}
              icon={<CheckCircle className="w-5 h-5" />}
              gradient="from-green-600 via-emerald-700 to-teal-700"
              chip="Quotations"
            />
          </div>

          <div
            onClick={() => onCardClick("registrations")}
            className="cursor-pointer"
          >
            <KpiCard1
              title="Unapproved Quotations"
              value={totalQuotations - registeredFromQuot}
              icon={<XCircle className="w-5 h-5" />}
              gradient="from-red-600 via-rose-700 to-pink-700"
              chip="Quotations"
            />
          </div>

          <div
            onClick={() => onCardClick("registrations")}
            className="cursor-pointer"
          >
            <KpiCard1
              title="Total Registrations"
              value={data.length}
              icon={<ThumbsUp className="w-5 h-5" />}
              gradient="from-amber-600 via-yellow-700 to-orange-700"
              chip="Registration"
            />
          </div>

          <div
            onClick={() => onCardClick("registrations")}
            className="cursor-pointer"
          >
            <KpiCard1
              title="Total Registered Value"
              value={`₹ ${formatAmount(totalRegisteredValue)}`}
              icon={<Wallet className="w-5 h-5" />}
              gradient="from-purple-600 via-fuchsia-700 to-pink-700"
              chip="Registration"
            />
          </div>
        </div>
      )}

      {/* KPI Cards + Chart (regisDate view) */}
      {queryType === "regisDate" && (
        <div className="grid gap-6 items-stretch lg:grid-cols-[250px_250px_1fr]">
          {/* KPI Card 1 */}
          <div
            onClick={() => onCardClick("registrations")}
            className="cursor-pointer"
          >
            <KpiCard1
              title="Total Registrations"
              value={data.length}
              icon={<ThumbsUp className="w-5 h-5" />}
              gradient="from-amber-600 via-yellow-700 to-orange-700"
              chip="Registration"
            />
          </div>

          {/* KPI Card 2 */}
          <div
            onClick={() => onCardClick("registrations")}
            className="cursor-pointer"
          >
            <KpiCard1
              title="Total Registered Value"
              value={`₹ ${formatAmount(totalRegisteredValue)}`}
              icon={<Wallet className="w-5 h-5" />}
              gradient="from-purple-600 via-fuchsia-700 to-pink-700"
              chip="Registration"
            />
          </div>

          {/* Chart */}
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

      {/* Summaries */}
      <KpiCard2
        summary={summaryByBd}
        type={"bd"}
        gradientFrom={"from-blue-900"}
        gradientTo={"to-indigo-900"}
      />
      <KpiCard2
        summary={summaryByClient}
        type={"client"}
        gradientFrom={"from-emerald-600"}
        gradientTo={"to-emerald-900"}
      />
      <KpiCard2
        summary={summaryByVertical}
        type={"vertical"}
        gradientFrom={"from-slate-900"}
        gradientTo={"to-slate-700"}
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
                width={undefined} // fills parent div
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
