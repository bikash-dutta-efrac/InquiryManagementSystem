import { useEffect, useMemo, useRef, useState } from "react";
import {
  PieChart,
  BarChart,
  LineChart,
  pieArcLabelClasses,
} from "@mui/x-charts";
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Expand,
  Maximize,
  Minimize,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper function to format large numbers
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

// Custom hook to get container width for responsive charts
function useContainerWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(960);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr?.width) setWidth(cr.width);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}

const bdColors = [
  "#014D40",
  "#025C4D",
  "#046D59",
  "#058567",
  "#069C76",
  "#06B387",
  "#1ACFA0",
  "#38DFC0",
  "#64E5D0",
  "#9FF3E0",
];

const verticalColors = [
  "#4A0F2D",
  "#5C1540",
  "#701A52",
  "#842064",
  "#972676",
  "#AD2E8A",
  "#C33A9F",
  "#DA4EB4",
  "#F062C7",
  "#F7A0DC",
];

const clientColors = [
  "#5A280B",
  "#78350F",
  "#7C3E0A",
  "#9C4B0F",
  "#B45309",
  "#AD6304",
  "#D97706",
  "#CC7D08",
  "#F59E0B",
  "#FCD34D",
];

// Helper function to create pie chart data from categories and values
function createPieData(categories, values, colors) {
  return categories.map((cat, index) => ({
    id: index,
    value: values[index],
    label: cat,
    color: colors[index] || "#ccc",
  }));
}

// ------------- Main Component -------------
export default function GraphicalAnalysis({ data = [], queryType }) {
  const [wrapRef, containerWidth] = useContainerWidth();
  const [expandedChart, setExpandedChart] = useState(null);
  const [chartType, setChartType] = useState({
    bd: "bar",
    vertical: "bar",
    clients: "bar",
  });

  const handleToggle = (chartName, type) => {
    setChartType((prev) => ({ ...prev, [chartName]: type }));
  };

  const {
    totalQuotations,
    registeredCount,
    notRegisteredCount,
    registeredFromQuot,
    bdCats,
    bdTotalValues,
    verticalCats,
    verticalTotalValues,
    clientCats,
    clientTotalValues,
    dailyDates,
    dailyQuotations,
    dailyRegistrations,
    dailyBusinessDates,
    dailyBusinessSeriesByBd,
    dailyBusinessSeriesByClient,
    dailyBusinessSeriesByVertical,
  } = useMemo(() => {
    // ---------- Data Aggregation Logic (Same as before) ----------
    const totalQuotations = new Set(data.map((d) => d.quotNo).filter(Boolean))
      .size;
    const registeredCount = data.filter((d) => d.regisNo).length;
    const notRegisteredCount = data.length - registeredCount;
    const registeredFromQuot = new Set(
      data.filter((d) => d.quotNo && d.regisNo).map((d) => d.quotNo)
    ).size;

    const inqMap = new Map();
    const quotMap = new Map();
    const regMap = new Map();

    data.forEach((d) => {
      if (d.quotDate) {
        const key = new Date(d.quotDate).toISOString().slice(0, 10);
        quotMap.set(key, (quotMap.get(key) || 0) + 1);
      }
      if (d.regisDate) {
        const key = new Date(d.regisDate).toISOString().slice(0, 10);
        regMap.set(key, (regMap.get(key) || 0) + 1);
      }
      if (d.inqDate) {
        const key = new Date(d.inqDate).toISOString().slice(0, 10);
        inqMap.set(key, (inqMap.get(key) || 0) + 1);
      }
    });

    let dailyDates = [];
    if (queryType === "regisDate") {
      dailyDates = Array.from(regMap.keys()).sort();
    } else if (queryType === "quotDate") {
      dailyDates = Array.from(quotMap.keys()).sort();
    } else {
      dailyDates = Array.from(inqMap.keys()).sort();
    }
    const dailyQuotations = dailyDates.map((d) => quotMap.get(d) || 0);
    const dailyRegistrations = dailyDates.map((d) => regMap.get(d) || 0);

    const bdAgg = {};
    data.forEach((d) => {
      const bd = d.bdName || "—";
      if (!bdAgg[bd]) bdAgg[bd] = { totalValue: 0 };
      if (d.regisNo) bdAgg[bd].totalValue += Number(d.regisVal) || 0;
    });
    const bdTop = Object.entries(bdAgg)
      .map(([bd, { totalValue }]) => ({ bd, totalValue }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);
    const bdCats = bdTop.map((d) => d.bd);
    const bdTotalValues = bdTop.map((d) => d.totalValue);

    const verticalAgg = {};
    data.forEach((d) => {
      const vertical = d.vertical || "Unknown";
      if (!verticalAgg[vertical]) verticalAgg[vertical] = { totalValue: 0 };
      if (d.regisNo)
        verticalAgg[vertical].totalValue += Number(d.regisVal || 0);
    });
    const verticalTop = Object.entries(verticalAgg)
      .map(([v, { totalValue }]) => ({ vertical: v, totalValue }))
      .sort((a, b) => b.totalValue - a.totalValue);
    const verticalCats = verticalTop.map((d) => d.vertical);
    const verticalTotalValues = verticalTop.map((d) => d.totalValue);

    const clientAgg = {};
    data.forEach((d) => {
      const client = d.clientName || "Unknown";
      if (!clientAgg[client]) clientAgg[client] = { totalValue: 0 };
      if (d.regisNo) clientAgg[client].totalValue += Number(d.regisVal || 0);
    });
    const clientTop = Object.entries(clientAgg)
      .map(([c, { totalValue }]) => ({ client: c, totalValue }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);
    const clientCats = clientTop.map((d) => d.client);
    const clientTotalValues = clientTop.map((d) => d.totalValue);

    const bdDailyMap = {};
    const verticalDailyMap = {};
    const clientDailyMap = {};
    const allDates = new Set();

    data.forEach((d) => {
      if (d.regisNo) {
        const date = new Date(d.regisDate).toISOString().slice(0, 10);
        allDates.add(date);
        const bd = d.bdName;
        const client = d.clientName;
        const vertical = d.vertical;
        if (!bdDailyMap[bd]) bdDailyMap[bd] = {};
        bdDailyMap[bd][date] =
          (bdDailyMap[bd][date] || 0) + (Number(d.regisVal) || 0);
        if (!clientDailyMap[client]) clientDailyMap[client] = {};
        clientDailyMap[client][date] =
          (clientDailyMap[client][date] || 0) + (Number(d.regisVal) || 0);
        if (!verticalDailyMap[vertical]) verticalDailyMap[vertical] = {};
        verticalDailyMap[vertical][date] =
          (verticalDailyMap[vertical][date] || 0) + (Number(d.regisVal) || 0);
      }
    });

    const dailyBusinessDates = Array.from(allDates).sort();
    const dailyBusinessSeriesByBd = Object.entries(bdDailyMap).map(
      ([bd, vals]) => ({
        label: bd,
        data: dailyBusinessDates.map((d) => vals[d] || 0),
        valueFormatter: (val) => `₹ ${formatAmount(val)}`,
      })
    );
    const dailyBusinessSeriesByClient = Object.entries(clientDailyMap).map(
      ([client, vals]) => ({
        label: client,
        data: dailyBusinessDates.map((d) => vals[d] || 0),
        valueFormatter: (val) => `₹ ${formatAmount(val)}`,
      })
    );
    const dailyBusinessSeriesByVertical = Object.entries(verticalDailyMap).map(
      ([vertical, vals]) => ({
        label: vertical,
        data: dailyBusinessDates.map((d) => vals[d] || 0),
        valueFormatter: (val) => `₹ ${formatAmount(val)}`,
      })
    );

    return {
      totalQuotations,
      registeredCount,
      notRegisteredCount,
      registeredFromQuot,
      bdCats,
      bdTotalValues,
      verticalCats,
      verticalTotalValues,
      clientCats,
      clientTotalValues,
      dailyDates,
      dailyQuotations,
      dailyRegistrations,
      dailyBusinessDates,
      dailyBusinessSeriesByBd,
      dailyBusinessSeriesByClient,
      dailyBusinessSeriesByVertical,
    };
  }, [data, queryType]);

  const bdPieData = useMemo(
    () => createPieData(bdCats, bdTotalValues, bdColors),
    [bdCats, bdTotalValues]
  );
  const verticalPieData = useMemo(
    () => createPieData(verticalCats, verticalTotalValues, verticalColors),
    [verticalCats, verticalTotalValues]
  );
  const clientPieData = useMemo(
    () => createPieData(clientCats, clientTotalValues, clientColors),
    [clientCats, clientTotalValues]
  );

  if (!data.length)
    return (
      <div className="text-center text-gray-500 py-10 text-lg">
        🚫 No data available for graphs
      </div>
    );

  const colWidth = Math.max(280, Math.floor(containerWidth / 2) - 40);
  const smallHeight = 220;

  return (
    <div
      ref={wrapRef}
      className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-center" // Added items-center for vertical alignment
    >
      {/* Existing Charts */}
      {queryType !== "regisDate" && (
        <ChartCard
          title="Registered vs Not Registered"
          icon={<PieIcon className="w-4 h-4" />}
          gradient="from-blue-600 to-indigo-700"
          onExpand={() => setExpandedChart("pie")}
        >
          {/* Centering the chart with a flexbox container */}
          <div>
            <PieChart
              series={[
                {
                  innerRadius: 60,
                  outerRadius: 100,
                  arcLabel: (item) => `${item.value}`,
                  data: [
                    {
                      id: 0,
                      value: registeredCount,
                      label: "Registered",
                      color: "#22c55e",
                    },
                    {
                      id: 1,
                      value: notRegisteredCount,
                      label: "Not Registered",
                      color: "#ef4444",
                    },
                  ],
                },
              ]}
              width={colWidth}
              height={smallHeight}
              sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                  fill: "#fff",
                  fontSize: 14, // Increased font size for better readability
                },
              }}
            />
          </div>
        </ChartCard>
      )}

      {/* BD Comparison with Toggle and Animation */}
      {bdCats.length !== 1 && (
        <ChartCard
          title="BD Comparison"
          icon={<BarChart3 className="w-4 h-4" />}
          gradient="from-emerald-600 to-teal-700"
          onExpand={() => setExpandedChart("bd")}
          chartType={chartType.bd}
          onToggle={(type) => handleToggle("bd", type)}
        >
          <AnimatePresence mode="wait">
            {chartType.bd === "pie" ? (
              <motion.div
                key="bd-pie"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <PieChart
                    series={[
                      {
                        innerRadius: 60,
                        outerRadius: 100,
                        arcLabel: (item) => `${formatAmount(item.value)}`,
                        data: bdPieData,
                      },
                    ]}
                    width={colWidth}
                    height={smallHeight}
                    sx={{
                      [`& .${pieArcLabelClasses.root}`]: {
                        fill: "#fff",
                        fontSize: 6, // Increased font size
                      },
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="bd-bar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <BarChart
                  xAxis={[
                    {
                      scaleType: "band",
                      data: bdCats,
                      tickLabelStyle: { angle: -20, fontSize: 0 },
                      colorMap: {
                        type: "ordinal",
                        values: bdCats,
                        colors: bdColors,
                      },
                    },
                  ]}
                  series={[
                    {
                      data: bdTotalValues,
                      valueFormatter: (val) => `₹ ${formatAmount(val)}`,
                    },
                  ]}
                  width={colWidth}
                  height={smallHeight}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </ChartCard>
      )}

      {/* Vertical Comparison with Toggle and Animation */}
      {verticalCats.length !== 1 && (
        <ChartCard
          title="Vertical Comparison"
          icon={<BarChart3 className="w-4 h-4" />}
          gradient="from-pink-600 to-rose-700"
          onExpand={() => setExpandedChart("vertical")}
          chartType={chartType.vertical}
          onToggle={(type) => handleToggle("vertical", type)}
        >
          <AnimatePresence mode="wait">
            {chartType.vertical === "pie" ? (
              <motion.div
                key="vertical-pie"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <PieChart
                    series={[
                      {
                        innerRadius: 60,
                        outerRadius: 100,
                        arcLabel: (item) => `${formatAmount(item.value)}`,
                        data: verticalPieData,
                      },
                    ]}
                    width={colWidth}
                    height={smallHeight}
                    sx={{
                      [`& .${pieArcLabelClasses.root}`]: {
                        fill: "#fff",
                        fontSize: 12, // Increased font size
                      },
                    }}
                    tooltip={{
                      formatter: (item) => `₹ ${formatAmount(item.value)}`,
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="vertical-bar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <BarChart
                  xAxis={[
                    {
                      scaleType: "band",
                      data: verticalCats,
                      tickLabelStyle: { angle: 0, fontSize: 10 },
                      colorMap: {
                        type: "ordinal",
                        values: verticalCats,
                        colors: verticalColors,
                      },
                    },
                  ]}
                  series={[
                    {
                      data: verticalTotalValues,
                      valueFormatter: (val) => `₹ ${formatAmount(val)}`,
                    },
                  ]}
                  width={colWidth}
                  height={smallHeight}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </ChartCard>
      )}

      {/* Client Comparison with Toggle and Animation */}
      {clientCats.length !== 1 && (
        <ChartCard
          title="Client Comparison"
          icon={<BarChart3 className="w-4 h-4" />}
          gradient="from-amber-600 to-orange-700"
          onExpand={() => setExpandedChart("clients")}
          chartType={chartType.clients}
          onToggle={(type) => handleToggle("clients", type)}
        >
          <AnimatePresence mode="wait">
            {chartType.clients === "pie" ? (
              <motion.div
                key="clients-pie"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <PieChart
                    series={[
                      {
                        innerRadius: 60, // Increased radius
                        outerRadius: 100, // Increased radius
                        arcLabel: (item) => `${formatAmount(item.value)}`,
                        data: clientPieData,
                      },
                    ]}
                    width={colWidth}
                    height={smallHeight}
                    sx={{
                      [`& .${pieArcLabelClasses.root}`]: {
                        fill: "#fff",
                        fontSize: 12, // Increased font size
                      },
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="clients-bar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <BarChart
                  xAxis={[
                    {
                      scaleType: "band",
                      data: clientCats,
                      tickLabelStyle: { angle: -20, fontSize: 0 },
                      colorMap: {
                        type: "ordinal",
                        values: clientCats,
                        colors: clientColors,
                      },
                    },
                  ]}
                  series={[
                    {
                      data: clientTotalValues,
                      valueFormatter: (val) => `₹ ${formatAmount(val)}`,
                    },
                  ]}
                  width={colWidth}
                  height={smallHeight}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </ChartCard>
      )}

      {/* Other Charts (unchanged) */}
      <ChartCard
        title="Quotation vs Registration Trend"
        icon={<TrendingUp className="w-4 h-4" />}
        gradient="bg-gradient-to-r from-blue-700 to-green-400"
        onExpand={() => setExpandedChart("month")}
      >
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
              { data: dailyQuotations, label: "Quotations", color: "#1d4ed8" },
              {
                data: dailyRegistrations,
                label: "Registrations",
                color: "#16a34a",
              },
            ]}
            width={colWidth}
            height={smallHeight}
          />
        </div>
      </ChartCard>

      {queryType !== "regisDate" && (
        <ChartCard
          title="Quotation Execution"
          icon={<TrendingUp className="w-4 h-4" />}
          gradient="from-cyan-600 to-sky-700"
          onExpand={() => setExpandedChart("execution")}
        >
          <div className="overflow-x-auto">
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: ["Total Quotations", "Registered Quotations"],
                },
              ]}
              series={[
                {
                  data: [totalQuotations, registeredFromQuot],
                  color: "#2563eb",
                },
              ]}
              width={colWidth}
              height={smallHeight}
            />
          </div>
        </ChartCard>
      )}

      {/* New Daily Business Trend */}
      <ChartCard
        title="Daily Business Trend (BD-wise)"
        icon={<TrendingUp className="w-4 h-4" />}
        gradient="from-indigo-600 to-violet-700"
        onExpand={() => setExpandedChart("businessBd")}
      >
        <div className="overflow-x-auto">
          <LineChart
            xAxis={[
              {
                scaleType: "point",
                data: dailyBusinessDates,
                tickLabelStyle: { angle: 0, fontSize: 0 },
              },
            ]}
            series={dailyBusinessSeriesByBd}
            width={colWidth}
            height={smallHeight}
            slotProps={{
              legend: { hidden: true },
            }}
          />
        </div>
      </ChartCard>

      <ChartCard
        title="Daily Business Trend (Vertical-wise)"
        icon={<TrendingUp className="w-4 h-4" />}
        gradient="bg-gradient-to-r from-red-500 to-orange-500"
        onExpand={() => setExpandedChart("businessVertical")}
      >
        <div className="overflow-x-auto">
          <LineChart
            xAxis={[
              {
                scaleType: "point",
                data: dailyBusinessDates,
                tickLabelStyle: { angle: 0, fontSize: 0 },
              },
            ]}
            series={dailyBusinessSeriesByVertical}
            width={colWidth}
            height={smallHeight}
            slotProps={{
              legend: { hidden: true },
            }}
          />
        </div>
      </ChartCard>

      <ChartCard
        title="Daily Business Trend (Client-wise)"
        icon={<TrendingUp className="w-4 h-4" />}
        gradient="bg-gradient-to-r from-cyan-500 to-blue-500"
        onExpand={() => setExpandedChart("businessClient")}
      >
        <div className="overflow-x-auto">
          <LineChart
            xAxis={[
              {
                scaleType: "point",
                data: dailyBusinessDates,
                tickLabelStyle: { angle: 0, fontSize: 10 },
              },
            ]}
            series={dailyBusinessSeriesByClient}
            width={colWidth}
            height={smallHeight}
            slotProps={{
              legend: { hidden: true },
            }}
          />
        </div>
      </ChartCard>

      {/* Expanded Modal */}
      <ExpandModal
        type={expandedChart}
        chartType={chartType}
        onClose={() => setExpandedChart(null)}
        {...{
          registeredCount,
          notRegisteredCount,
          bdCats,
          bdTotalValues,
          verticalCats,
          verticalTotalValues,
          clientCats,
          clientTotalValues,
          totalQuotations,
          registeredFromQuot,
          dailyDates,
          dailyQuotations,
          dailyRegistrations,
          dailyBusinessDates,
          dailyBusinessSeriesByBd,
          dailyBusinessSeriesByClient,
          dailyBusinessSeriesByVertical,
        }}
      />
    </div>
  );
}

// ----------------- Chart Card -----------------
function ChartCard({
  title,
  icon,
  children,
  gradient,
  onExpand,
  chartType,
  onToggle,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow hover:shadow-lg transition relative">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-white bg-gradient-to-r ${gradient}`}
      >
        <span className="bg-white/20 rounded-md p-1">{icon}</span>
        <h3 className="font-semibold">{title}</h3>
        {onToggle && (
          <div className="ml-auto flex items-center bg-white/20 rounded-full p-1">
            <button
              onClick={() => onToggle("pie")}
              className={`p-1 rounded-full transition ${
                chartType === "pie" ? "bg-white text-black" : "text-white"
              }`}
            >
              <PieIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggle("bar")}
              className={`p-1 rounded-full transition ${
                chartType === "bar" ? "bg-white text-black" : "text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="p-4">{children}</div>
      <button
        onClick={onExpand}
        className="absolute bottom-3 left-3 flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 shadow"
      >
        <Expand className="w-3 h-3" /> Expand
      </button>
    </div>
  );
}

function ExpandModal({
  type,
  chartType,
  onClose,
  registeredCount,
  notRegisteredCount,
  bdCats,
  bdTotalValues,
  verticalCats,
  verticalTotalValues,
  clientCats,
  clientTotalValues,
  totalQuotations,
  registeredFromQuot,
  dailyDates,
  dailyQuotations,
  dailyRegistrations,
  dailyBusinessDates,
  dailyBusinessSeriesByBd,
  dailyBusinessSeriesByClient,
  dailyBusinessSeriesByVertical,
}) {
  const [modalChartType, setModalChartType] = useState("pie");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if(type === "bd") setModalChartType(chartType.bd);
    else if (type === "vertical") setModalChartType(chartType.vertical);
    else if (type === "clients") setModalChartType(chartType.clients);
    else setModalChartType("pie");
  }, [type]);


  const gradients = {
    pie: "from-blue-600 to-indigo-700",
    bd: "from-emerald-600 to-teal-700",
    vertical: "from-pink-600 to-rose-700",
    month: "bg-gradient-to-r from-blue-700 to-green-400",
    clients: "from-amber-600 to-orange-700",
    execution: "from-cyan-600 to-sky-700",
    businessBd: "from-indigo-600 to-violet-700",
    businessVertical: "bg-gradient-to-r from-red-500 to-orange-500",
    businessClient: "bg-gradient-to-r from-cyan-500 to-blue-500",
  };

  const bdPieData = useMemo(
    () => createPieData(bdCats, bdTotalValues, bdColors),
    [bdCats, bdTotalValues]
  );
  const verticalPieData = useMemo(
    () => createPieData(verticalCats, verticalTotalValues, verticalColors),
    [verticalCats, verticalTotalValues]
  );
  const clientPieData = useMemo(
    () => createPieData(clientCats, clientTotalValues, clientColors),
    [clientCats, clientTotalValues]
  );

  const ModalHeader = ({ title, showToggle, onToggle }) => (
    <div
      className={`flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r ${
        gradients[type]
      } text-white sticky top-0 z-10 transition-all duration-300 ${
        isFullScreen ? "hidden" : ""
      }`}
    >
      <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
      {showToggle && (
        <div className="ml-auto flex items-center bg-white/20 rounded-full p-1">
          <button
            onClick={() => onToggle("pie")}
            className={`p-1 rounded-full transition ${
              modalChartType === "pie" ? "bg-white text-black" : "text-white"
            }`}
          >
            <PieIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggle("bar")}
            className={`p-1 rounded-full transition ${
              modalChartType === "bar" ? "bg-white text-black" : "text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="bg-white/20 hover:bg-white/30 rounded-full p-2"
          title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
        >
          {isFullScreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onClose}
          className="bg-white/20 hover:bg-white/30 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm"
        >
          ✕ Close
        </button>
      </div>
    </div>
  );

  // Dynamic width and height based on full screen state
  const dynamicWidth = isFullScreen ? window.innerWidth : 850;
  const dynamicHeight = isFullScreen ? window.innerHeight : 380;

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-6 ${
            isFullScreen ? "p-0" : ""
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            className={`bg-white rounded-2xl shadow-2xl relative flex flex-col overflow-hidden transition-all duration-300 ${
              isFullScreen ? "w-full h-full rounded-none" : "w-full max-w-6xl"
            }`}
            style={{ maxHeight: isFullScreen ? "100vh" : "95vh" }}
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
          >
            {/* Header */}
            {type === "pie" && (
              <ModalHeader
                title="Registered vs Not Registered"
                onClose={onClose}
                showToggle={false}
              />
            )}
            {type === "bd" && (
              <ModalHeader
                title="BD Comparison (Best 10)"
                onClose={onClose}
                showToggle={true}
                onToggle={setModalChartType}
              />
            )}
            {type === "vertical" && (
              <ModalHeader
                title="Vertical Comparison"
                onClose={onClose}
                showToggle={true}
                onToggle={setModalChartType}
              />
            )}
            {type === "clients" && (
              <ModalHeader
                title="Client Comparison (Best 10)"
                onClose={onClose}
                showToggle={true}
                onToggle={setModalChartType}
              />
            )}
            {type === "month" && (
              <ModalHeader
                title="Quotation vs Registration Trend"
                onClose={onClose}
                showToggle={false}
              />
            )}
            {type === "execution" && (
              <ModalHeader
                title="Quotation Execution"
                onClose={onClose}
                showToggle={false}
              />
            )}
            {type === "businessBd" && (
              <ModalHeader
                title="Daily Business Trend (BD-wise)"
                onClose={onClose}
                showToggle={false}
              />
            )}
            {type === "businessVertical" && (
              <ModalHeader
                title="Daily Business Trend (Vertical-wise)"
                onClose={onClose}
                showToggle={false}
              />
            )}
            {type === "businessClient" && (
              <ModalHeader
                title="Daily Business Trend (Client-wise)"
                onClose={onClose}
                showToggle={false}
              />
            )}

            {isFullScreen && (
              <button
                onClick={() => setIsFullScreen(false)}
                className="absolute top-4 right-4 z-20 text-white bg-black/30 hover:bg-black/50 rounded-full p-2"
                title="Exit Full Screen"
              >
                <Minimize className="w-6 h-6" />
              </button>
            )}

            {/* Scrollable Chart Section */}
            <div
              className={`overflow-y-auto px-3 sm:px-6 py-4 space-y-6 flex-grow flex items-center justify-center transition-all duration-300 ${
                isFullScreen ? "p-0" : ""
              }`}
            >
              <div className="overflow-x-auto w-full">
                {/* Pie Chart */}
                {type === "pie" && (
                  <div className="flex justify-center items-center">
                    <PieChart
                      series={[
                        {
                          innerRadius: isFullScreen ? 100 : 80,
                            outerRadius: isFullScreen ? 240 : 150,
                          arcLabel: (item) => `${item.value}`,
                          data: [
                            {
                              id: 0,
                              value: registeredCount,
                              label: "Registered",
                              color: "#22c55e",
                            },
                            {
                              id: 1,
                              value: notRegisteredCount,
                              label: "Not Registered",
                              color: "#ef4444",
                            },
                          ],
                        },
                      ]}
                      width={dynamicWidth}
                      height={dynamicHeight}
                      sx={{
                        [`& .${pieArcLabelClasses.root}`]: {
                          fill: "#fff",
                          fontSize: 14,
                        },
                      }}
                      slotProps={{
                        legend: {
                          position: { vertical: "middle", horizontal: "left" },
                          direction: "column",
                        },
                      }}
                    />
                  </div>
                )}
                {/* BD Chart */}
                {type === "bd" && (
                  <div className="w-full h-full flex justify-center items-center">
                    {modalChartType === "pie" ? (
                      <PieChart
                        series={[
                          {
                            innerRadius: isFullScreen ? 100 : 80,
                            outerRadius: isFullScreen ? 240 : 150,
                            arcLabel: (item) => `${formatAmount(item.value)}`,
                            data: bdPieData,
                          },
                        ]}
                        width={dynamicWidth}
                        height={dynamicHeight}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: "#fff",
                            fontSize: 12,
                          },
                        }}
                        slotProps={{
                        legend: {
                          position: { vertical: "middle", horizontal: "left" },
                          direction: "column",
                        },
                      }}
                      />
                    ) : (
                      <BarChart
                        xAxis={[
                          {
                            scaleType: "band",
                            data: bdCats,
                            tickLabelStyle: { angle: -20, fontSize: 10 },
                            colorMap: {
                              type: "ordinal",
                              values: bdCats,
                              colors: bdColors,
                            },
                          },
                        ]}
                        series={[
                          {
                            data: bdTotalValues,
                            valueFormatter: (val) => `₹ ${formatAmount(val)}`,
                          },
                        ]}
                        width={dynamicWidth}
                        height={dynamicHeight}
                      />
                    )}
                  </div>
                )}
                {/* Vertical Chart */}
                {type === "vertical" && (
                  <div className="w-full h-full flex justify-center items-center">
                    {modalChartType === "pie" ? (
                      <PieChart
                        series={[
                          {
                            innerRadius: isFullScreen ? 100 : 80,
                            outerRadius: isFullScreen ? 240 : 150,
                            arcLabel: (item) => `${formatAmount(item.value)}`,
                            data: verticalPieData,
                          },
                        ]}
                        width={dynamicWidth}
                        height={dynamicHeight}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: "#fff",
                            fontSize: 12,
                          },
                        }}
                        slotProps={{
                          legend: {
                            position: {
                              vertical: "middle",
                              horizontal: "left",
                            },
                            direction: "column",
                          },
                        }}
                      />
                    ) : (
                      <BarChart
                        xAxis={[
                          {
                            scaleType: "band",
                            data: verticalCats,
                            tickLabelStyle: { angle: 0, fontSize: 10 },
                            colorMap: {
                              type: "ordinal",
                              values: verticalCats,
                              colors: verticalColors,
                            },
                          },
                        ]}
                        series={[
                          {
                            data: verticalTotalValues,
                            valueFormatter: (val) => `₹ ${formatAmount(val)}`,
                          },
                        ]}
                        width={dynamicWidth}
                        height={dynamicHeight}
                      />
                    )}
                  </div>
                )}
                {/* Client Chart */}
                {type === "clients" && (
                  <div className="w-full h-full flex justify-center items-center">
                    {modalChartType === "pie" ? (
                      <PieChart
                        series={[
                          {
                            innerRadius: isFullScreen ? 100 : 80,
                            outerRadius: isFullScreen ? 240 : 150,
                            arcLabel: (item) => `${formatAmount(item.value)}`,
                            data: clientPieData,
                          },
                        ]}
                        width={dynamicWidth}
                        height={dynamicHeight}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: "#fff",
                            fontSize: 12,
                          },
                        }}
                        slotProps={{
                          legend: {
                            position: {
                              vertical: "middle",
                              horizontal: "middle",
                            },
                            direction: "row",
                          },
                        }}
                      />
                    ) : (
                      <BarChart
                        xAxis={[
                          {
                            scaleType: "band",
                            data: clientCats,
                            tickLabelStyle: { angle: -20, fontSize: 10 },
                            colorMap: {
                              type: "ordinal",
                              values: clientCats,
                              colors: clientColors,
                            },
                          },
                        ]}
                        series={[
                          {
                            data: clientTotalValues,
                            valueFormatter: (val) => `₹ ${formatAmount(val)}`,
                          },
                        ]}
                        width={dynamicWidth}
                        height={dynamicHeight}
                      />
                    )}
                  </div>
                )}

                {type === "month" && (
                  <div className="w-full h-full">
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
                          data: dailyQuotations,
                          label: "Quotations",
                          color: "#1d4ed8",
                        },
                        {
                          data: dailyRegistrations,
                          label: "Registrations",
                          color: "#16a34a",
                        },
                      ]}
                      width={dynamicWidth}
                      height={dynamicHeight}
                    />
                  </div>
                )}
                {type === "execution" && (
                  <div className="w-full h-full">
                    <BarChart
                      xAxis={[
                        {
                          scaleType: "band",
                          data: ["Total Quotations", "Registered Quotations"],
                        },
                      ]}
                      series={[
                        {
                          data: [totalQuotations, registeredFromQuot],
                          color: "#2563eb",
                        },
                      ]}
                      width={dynamicWidth}
                      height={dynamicHeight}
                    />
                  </div>
                )}
                {type === "businessBd" && (
                  <div className="w-full h-full">
                    <LineChart
                      xAxis={[
                        {
                          scaleType: "point",
                          data: dailyBusinessDates,
                          tickLabelStyle: { angle: 0, fontSize: 10 },
                        },
                      ]}
                      series={dailyBusinessSeriesByBd}
                      width={dynamicWidth}
                      height={dynamicHeight}
                      slotProps={{
                        legend: { hidden: isFullScreen },
                      }}
                    />
                  </div>
                )}
                {type === "businessVertical" && (
                  <div className="w-full h-full">
                    <LineChart
                      xAxis={[
                        {
                          scaleType: "point",
                          data: dailyBusinessDates,
                          tickLabelStyle: { angle: 0, fontSize: 10 },
                        },
                      ]}
                      series={dailyBusinessSeriesByVertical}
                      width={dynamicWidth}
                      height={dynamicHeight}
                      slotProps={{
                        legend: { hidden: isFullScreen },
                      }}
                    />
                  </div>
                )}
                {type === "businessClient" && (
                  <div className="w-full h-full">
                    <LineChart
                      xAxis={[
                        {
                          scaleType: "point",
                          data: dailyBusinessDates,
                          tickLabelStyle: { angle: 0, fontSize: 10 },
                        },
                      ]}
                      series={dailyBusinessSeriesByClient}
                      width={dynamicWidth}
                      height={dynamicHeight}
                      slotProps={{
                        legend: { hidden: isFullScreen },
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
