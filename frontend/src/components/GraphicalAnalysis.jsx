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
} from "lucide-react";
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

// ------------- Main Component -------------
export default function GraphicalAnalysis({ data = [], queryType }) {
  const [wrapRef, containerWidth] = useContainerWidth();
  const [expandedChart, setExpandedChart] = useState(null);

  const {
    // totalInquiries,
    totalQuotations,
    registeredCount,
    notRegisteredCount,
    registeredFromQuot,
    bdCats,
    bdRegistrations,
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
    // ---------- Total Counts ----------
    const totalInquiries = new Set(data.map((d) => d.inqNo).filter(Boolean))
      .size;
    const totalQuotations = new Set(data.map((d) => d.quotNo).filter(Boolean))
      .size;
    const registeredCount = data.filter((d) => d.regisNo).length;
    const notRegisteredCount = data.length - registeredCount;
    const registeredFromQuot = new Set(
      data.filter((d) => d.quotNo && d.regisNo).map((d) => d.quotNo)
    ).size;

    // ---------- Daily Trend ----------
    const quotMap = new Map();
    const regMap = new Map();
    const inqMap = new Map();

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
    } else if (queryType === "inqDate") {
      dailyDates = Array.from(inqMap.keys()).sort();
    }

    const dailyQuotations = dailyDates.map((d) => quotMap.get(d) || 0);
    const dailyRegistrations = dailyDates.map((d) => regMap.get(d) || 0);

    // ---------- BD Aggregation ----------
    const bdAgg = {};
    data.forEach((d) => {
      const bd = d.bdName || "—";
      if (!bdAgg[bd]) {
        bdAgg[bd] = {
          totalValue: 0,
        };
      }
      if (d.regisNo) {
        bdAgg[bd].totalValue += Number(d.regisVal) || 0;
      }
    });

    const bdTop = Object.entries(bdAgg)
      .map(([bd, { totalValue }]) => ({
        bd,
        totalValue,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

    const bdCats = bdTop.map((d) => d.bd);
    const bdTotalValues = bdTop.map((d) => d.totalValue);

    // ---------- Vertical Aggregation ----------
    const verticalAgg = {};
    data.forEach((d) => {
      const vertical = d.vertical || "Unknown";
      if (!verticalAgg[vertical])
        verticalAgg[vertical] = {
          totalValue: 0,
        };
      if (d.regisNo) {
        verticalAgg[vertical].totalValue += Number(d.regisVal || 0);
      }
    });

    const verticalTop = Object.entries(verticalAgg)
      .map(([v, { totalValue }]) => ({
        vertical: v,
        totalValue: totalValue,
      }))
      .sort((a, b) => b.totalValue - a.totalValue);

    const verticalCats = verticalTop.map((d) => d.vertical);
    const verticalTotalValues = verticalTop.map((d) => d.totalValue);

    // ---------- Client Aggregation ----------
    const clientAgg = {};
    data.forEach((d) => {
      const client = d.clientName || "Unknown";
      if (!clientAgg[client])
        clientAgg[client] = {
          totalValue: 0,
        };
      if (d.regisNo) {
        clientAgg[client].totalValue += Number(d.regisVal || 0);
      }
    });

    const clientTop = Object.entries(clientAgg)
      .map(([c, { totalValue }]) => ({
        client: c,
        totalValue: totalValue,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);

    const clientCats = clientTop.map((d) => d.client);
    const clientTotalValues = clientTop.map((d) => d.totalValue);

    console.log(clientAgg);
    console.log(clientTop);
    console.log(clientCats);

    // ---------- Daily Business Trend (RegVal by BD) ----------
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
      // totalInquiries,
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
  }, [data]);

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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6"
    >
      {/* Existing Charts */}
      {queryType !== "regisDate" && (
        <ChartCard
          title="Registered vs Not Registered"
          icon={<PieIcon className="w-4 h-4" />}
          gradient="from-blue-600 to-indigo-700"
          onExpand={() => setExpandedChart("pie")}
        >
          <div className="overflow-x-auto">
            <PieChart
              series={[
                {
                  innerRadius: 50,
                  outerRadius: 90,
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
                  fontSize: 11,
                },
              }}
            />
          </div>
        </ChartCard>
      )}

      <ChartCard
        title="BD Comparison"
        icon={<BarChart3 className="w-4 h-4" />}
        gradient="from-emerald-600 to-teal-700"
        onExpand={() => setExpandedChart("bd")}
      >
        <div className="overflow-x-auto">
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: bdCats,
                tickLabelStyle: { angle: -20, fontSize: 10 },
              },
            ]}
            series={[
              {
                data: bdTotalValues,
                label: "Total Value",
                color: "#059773ff",
                valueFormatter: (val) => `₹ ${formatAmount(val)}`,
              },
            ]}
            width={colWidth}
            height={smallHeight}
          />
        </div>
      </ChartCard>

      <ChartCard
        title="Vertical Comparison"
        icon={<BarChart3 className="w-4 h-4" />}
        gradient="from-pink-600 to-rose-700"
        onExpand={() => setExpandedChart("vertical")}
      >
        <div className="overflow-x-auto">
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: verticalCats,
                tickLabelStyle: { angle: 0, fontSize: 10 },
              },
            ]}
            series={[
              {
                data: verticalTotalValues,
                label: "Total Value",
                color: "#ff0162ff",
                valueFormatter: (val) => `₹ ${formatAmount(val)}`,
              },
            ]}
            width={colWidth}
            height={smallHeight}
          />
        </div>
      </ChartCard>

      <ChartCard
        title="Client Comparison"
        icon={<BarChart3 className="w-4 h-4" />}
        gradient="from-amber-600 to-orange-700"
        onExpand={() => setExpandedChart("clients")}
      >
        <div className="overflow-x-auto">
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: clientCats,
                tickLabelStyle: { angle: -20, fontSize: 10 },
              },
            ]}
            series={[
              {
                data: clientTotalValues,
                label: "Total Value",
                color: "#ea580c",
                valueFormatter: (val) => `₹ ${formatAmount(val)}`,
              },
            ]}
            width={colWidth}
            height={smallHeight}
          />
        </div>
      </ChartCard>

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
                tickLabelStyle: { angle: 0, fontSize: 10 },
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
                tickLabelStyle: { angle: 0, fontSize: 10 },
              },
            ]}
            series={(data = dailyBusinessSeriesByBd)}
            width={colWidth}
            height={smallHeight}
            slotProps={{
              legend: { hidden: true },
            }}
          />
        </div>
      </ChartCard>

      <ChartCard
        title="Daily Business Trend (Vertcal-wise)"
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
                tickLabelStyle: { angle: 0, fontSize: 10 },
              },
            ]}
            series={(data = dailyBusinessSeriesByVertical)}
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
            series={(data = dailyBusinessSeriesByClient)}
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
        onClose={() => setExpandedChart(null)}
        {...{
          registeredCount,
          notRegisteredCount,
          bdCats,
          bdRegistrations,
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
function ChartCard({ title, icon, children, gradient, onExpand }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow hover:shadow-lg transition relative">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-white bg-gradient-to-r ${gradient}`}
      >
        <span className="bg-white/20 rounded-md p-1">{icon}</span>
        <h3 className="font-semibold">{title}</h3>
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

  // Sizes
  const pieHeight = window.innerWidth < 640 ? 300 : 450;
  const chartHeight = window.innerWidth < 640 ? 260 : 360;
  const executionHeight = window.innerWidth < 640 ? 220 : 320;

  return (
    <AnimatePresence>
      {type && (
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
            <div
              className={`flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r ${gradients[type]} text-white sticky top-0 z-10`}
            >
              <h2 className="text-base sm:text-lg font-semibold">
                {type === "pie" && "Registered vs Not Registered"}
                {type === "bd" && "BD Comparison (Best 10)"}
                {type === "vertical" && "Vertical Comparison"}
                {type === "month" && "Quotation vs Registration Trend"}
                {type === "clients" && "Client Comparison (Best 10)"}
                {type === "execution" && "Quotation Execution"}
                {type === "businessBd" && "Daily Business Trend (BD-wise)"}
                {type === "businessVertical" &&
                  "Daily Business Trend (Vertical-wise)"}
                {type === "businessClient" &&
                  "Daily Business Trend (Client-wise)"}
              </h2>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Scrollable Chart Section */}
            <div className="overflow-y-auto px-3 sm:px-6 py-4 space-y-6">
              <div className="overflow-x-auto">
                {/* Pie Chart */}
                {type === "pie" && (
                  <PieChart
                    series={[
                      {
                        innerRadius: 50,
                        outerRadius: 90,
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
                    width={Math.max(600, window.innerWidth - 80)}
                    height={pieHeight}
                    sx={{
                      [`& .${pieArcLabelClasses.root}`]: {
                        fill: "#fff",
                        fontSize: 12,
                      },
                    }}
                  />
                )}

                {/* BD Chart */}
                {type === "bd" && (
                  <BarChart
                    xAxis={[
                      {
                        scaleType: "band",
                        data: bdCats,
                        tickLabelStyle: { angle: -20, fontSize: 10 },
                      },
                    ]}
                    series={[
                      {
                        data: bdTotalValues,
                        label: "Total Value",
                        color: "#059773ff",
                        valueFormatter: (val) => `₹ ${formatAmount(val)}`,
                      },
                    ]}
                    width={Math.max(600, window.innerWidth - 80)}
                    height={chartHeight}
                  />
                )}

                {/* Vertical Chart */}
                {type === "vertical" && (
                  <BarChart
                    xAxis={[
                      {
                        scaleType: "band",
                        data: verticalCats,
                        tickLabelStyle: { angle: 0, fontSize: 11 },
                      },
                    ]}
                    series={[
                      {
                        data: verticalTotalValues,
                        label: "Total Value",
                        color: "#ff0162ff",
                        valueFormatter: (val) => `₹ ${formatAmount(val)}`,
                      },
                    ]}
                    width={Math.max(600, window.innerWidth - 80)}
                    height={chartHeight}
                  />
                )}

                {/* Month Chart */}
                {type === "month" && (
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
                    width={Math.max(600, window.innerWidth - 80)}
                    height={chartHeight}
                  />
                )}

                {/* Clients Chart */}
                {type === "clients" && (
                  <BarChart
                    xAxis={[
                      {
                        scaleType: "band",
                        data: clientCats,
                        tickLabelStyle: { angle: -20, fontSize: 11 },
                      },
                    ]}
                    series={[
                      {
                        data: clientTotalValues,
                        label: "Total Value",
                        color: "#ea580c",
                        valueFormatter: (val) => `₹ ${formatAmount(val)}`,
                      },
                    ]}
                    width={Math.max(600, window.innerWidth - 80)}
                    height={chartHeight}
                  />
                )}

                {/* Execution Chart */}
                {type === "execution" && (
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
                    width={Math.max(500, window.innerWidth - 80)}
                    height={executionHeight}
                  />
                )}

                {/* Daily Business Trend */}
                {type === "businessBd" && (
                  <LineChart
                    xAxis={[
                      {
                        scaleType: "point",
                        data: dailyBusinessDates,
                        tickLabelStyle: { angle: 0, fontSize: 10 },
                      },
                    ]}
                    series={dailyBusinessSeriesByBd}
                    width={Math.max(600, window.innerWidth - 80)}
                    height={chartHeight}
                    slotProps={{ legend: { hidden: true } }}
                  />
                )}

                {type === "businessVertical" && (
                  <LineChart
                    xAxis={[
                      {
                        scaleType: "point",
                        data: dailyBusinessDates,
                        tickLabelStyle: { angle: 0, fontSize: 10 },
                      },
                    ]}
                    series={dailyBusinessSeriesByVertical}
                    width={Math.max(600, window.innerWidth - 80)}
                    height={chartHeight}
                  />
                )}

                {type === "businessClient" && (
                  <LineChart
                    xAxis={[
                      {
                        scaleType: "point",
                        data: dailyBusinessDates,
                        tickLabelStyle: { angle: 0, fontSize: 10 },
                      },
                    ]}
                    series={dailyBusinessSeriesByClient}
                    width={Math.max(600, window.innerWidth - 80)}
                    height={chartHeight}
                    slotProps={{ legend: { hidden: true } }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
