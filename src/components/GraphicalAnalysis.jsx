import React, { useEffect, useMemo, useRef, useState } from "react";
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

// -------- util helpers --------
const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));

function useContainerWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(960);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr?.width) setW(cr.width);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export default function GraphicalAnalysis({ data = [] }) {
  const [wrapRef, width] = useContainerWidth();
  const [expandedChart, setExpandedChart] = useState(null);

  const {
    totalInquiries,
    totalQuotations,
    registeredCount,
    notRegisteredCount,
    registeredFromQuot,
    monthsSorted,
    monthCounts,
    monthValuesAfter,
    monthQuotCounts,
    bdCats,
    bdInqVals,
    bdQuotVals,
    bdRegVals,
    clientCats,
    clientVals,
  } = useMemo(() => {
    const distinctInquiries = new Set(data.map((d) => d.inqNo).filter(Boolean));
    const distinctQuotations = new Set(
      data.map((d) => d.quotNo).filter(Boolean)
    );

    const totalInquiries = distinctInquiries.size;
    const totalQuotations = distinctQuotations.size;

    const registeredCount = data.filter((d) => d.regisNo).length;
    const notRegisteredCount = data.length - registeredCount;

    const registeredFromQuot = new Set(
      data.filter((d) => d.quotNo && d.regisNo).map((d) => d.quotNo)
    ).size;

    // --- Monthly ---
    const monthMap = {};
    const monthValMap = {};
    const monthQuotMap = {};
    data.forEach((d) => {
      const dt = new Date(d.inqDate);
      if (!Number.isFinite(dt.getTime())) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
      monthValMap[key] =
        (monthValMap[key] || 0) + toNumber(d.quotValAfterDis);

      if (d.quotNo) {
        monthQuotMap[key] = (monthQuotMap[key] || 0) + 1;
      }
    });
    const monthsSorted = Object.keys(monthMap).sort();
    const monthCounts = monthsSorted.map((m) => monthMap[m]);
    const monthValuesAfter = monthsSorted.map((m) => monthValMap[m]);
    const monthQuotCounts = monthsSorted.map((m) => monthQuotMap[m] || 0);

    // --- BD aggregation ---
    const bdInqMap = {};
    const bdQuotMap = {};
    const bdRegMap = {};
    const bdInqSet = {};
    const bdQuotSet = {};
    const bdRegSet = {};

    data.forEach((d) => {
      const bd = d.bdName || "—";
      if (!bdInqSet[bd]) bdInqSet[bd] = new Set();
      if (!bdQuotSet[bd]) bdQuotSet[bd] = new Set();
      if (!bdRegSet[bd]) bdRegSet[bd] = new Set();

      if (d.inqNo) bdInqSet[bd].add(d.inqNo);
      if (d.quotNo) bdQuotSet[bd].add(d.quotNo);
      if (d.regisNo) bdRegSet[bd].add(d.regisNo);
    });

    Object.keys(bdInqSet).forEach((bd) => {
      bdInqMap[bd] = bdInqSet[bd].size;
      bdQuotMap[bd] = bdQuotSet[bd].size;
      bdRegMap[bd] = bdRegSet[bd].size;
    });

    const bdSorted = Object.entries(bdInqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const bdCats = bdSorted.map(([k]) => k);
    const bdInqVals = bdCats.map((k) => bdInqMap[k] || 0);
    const bdQuotVals = bdCats.map((k) => bdQuotMap[k] || 0);
    const bdRegVals = bdCats.map((k) => bdRegMap[k] || 0);

    const clientValuesMap = {};
    data.forEach((d) => {
      const c = d.clientName || "—";
      clientValuesMap[c] =
        (clientValuesMap[c] || 0) + toNumber(d.quotValAfterDis);
    });
    const clientSorted = Object.entries(clientValuesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const clientCats = clientSorted.map(([k]) => k);
    const clientVals = clientSorted.map(([, v]) => v);

    return {
      totalInquiries,
      totalQuotations,
      registeredCount,
      notRegisteredCount,
      registeredFromQuot,
      monthsSorted,
      monthCounts,
      monthValuesAfter,
      monthQuotCounts,
      bdCats,
      bdInqVals,
      bdQuotVals,
      bdRegVals,
      clientCats,
      clientVals,
    };
  }, [data]);

  if (!data.length) {
    return (
      <div className="text-center text-gray-500 py-10 text-lg">
        🚫 No data available for graphs
      </div>
    );
  }

  const colW = Math.max(280, Math.floor(width / 2) - 40);
  const smallH = 220;

  return (
    <div ref={wrapRef} className="space-y-8">
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Registered vs Not Registered"
          icon={<PieIcon className="w-4 h-4" />}
          gradient="from-blue-600 to-indigo-700"
          onExpand={() => setExpandedChart("pie")}
        >
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
            width={colW}
            height={smallH}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: "#fff",
                fontSize: 11,
              },
            }}
          />
        </ChartCard>

        <ChartCard
          title="BD Details (Top 6)"
          icon={<BarChart3 className="w-4 h-4" />}
          gradient="from-emerald-600 to-teal-700"
          onExpand={() => setExpandedChart("bd")}
        >
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: bdCats,
                tickLabelStyle: { angle: -20, fontSize: 10 },
              },
            ]}
            series={[
              { data: bdInqVals, label: "Inquiries", color: "#2563eb" },
              { data: bdQuotVals, label: "Quotations", color: "#f59e0b" },
              { data: bdRegVals, label: "Registrations", color: "#22c55e" },
            ]}
            width={colW}
            height={smallH}
          />
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Monthly Trend"
          icon={<TrendingUp className="w-4 h-4" />}
          gradient="from-purple-600 to-fuchsia-700"
          onExpand={() => setExpandedChart("month")}
        >
          <LineChart
            xAxis={[
              {
                scaleType: "point",
                data: monthsSorted,
                tickLabelStyle: { angle: -20, fontSize: 10 },
              },
            ]}
            series={[
              { data: monthCounts, label: "Inquiries", color: "#1d4ed8" },
              {
                data: monthQuotCounts,
                label: "Quotations",
                color: "#16a34a",
              },
              {
                data: monthValuesAfter,
                label: "Quotation Value (After)",
                color: "#9333ea",
                yAxisKey: "rightAxis",
              },
            ]}
            rightAxis={[{ id: "rightAxis" }]}
            tooltip={{
              valueFormatter: (v, { seriesId }) =>
                seriesId === "Quotation Value (After)" ? fmtINR(v) : v,
            }}
            width={colW}
            height={smallH}
          />
        </ChartCard>

        <ChartCard
          title="Top Clients by Quotation"
          icon={<BarChart3 className="w-4 h-4" />}
          gradient="from-amber-600 to-orange-700"
          onExpand={() => setExpandedChart("clients")}
        >
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: clientCats,
                tickLabelStyle: { angle: -20, fontSize: 10 },
              },
            ]}
            series={[{ data: clientVals, color: "#ea580c" }]}
            width={colW}
            height={smallH}
          />
        </ChartCard>
      </div>

      {/* Row 3: Quotation Execution */}
      <ChartCard
        title="Quotation Execution"
        icon={<TrendingUp className="w-4 h-4" />}
        gradient="from-cyan-600 to-sky-700"
        onExpand={() => setExpandedChart("execution")}
      >
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
          width={colW}
          height={smallH}
        />
      </ChartCard>

      {/* Expanded Modal */}
      <ExpandModal
        type={expandedChart}
        onClose={() => setExpandedChart(null)}
        {...{
          totalInquiries,
          registeredCount,
          notRegisteredCount,
          bdCats,
          bdInqVals,
          bdQuotVals,
          bdRegVals,
          monthsSorted,
          monthCounts,
          monthValuesAfter,
          monthQuotCounts,
          clientCats,
          clientVals,
          totalQuotations,
          registeredFromQuot,
        }}
      />
    </div>
  );
}

function ExpandModal({
  type,
  onClose,
  totalInquiries,
  registeredCount,
  notRegisteredCount,
  bdCats,
  bdInqVals,
  bdQuotVals,
  bdRegVals,
  monthsSorted,
  monthCounts,
  monthValuesAfter,
  monthQuotCounts,
  clientCats,
  clientVals,
  totalQuotations,
  registeredFromQuot,
}) {
  const gradients = {
    pie: "from-blue-600 to-indigo-700",
    bd: "from-emerald-600 to-teal-700",
    month: "from-purple-600 to-fuchsia-700",
    clients: "from-amber-600 to-orange-700",
    execution: "from-cyan-600 to-sky-700",
  };

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl relative flex flex-col overflow-hidden"
            style={{ maxHeight: "90vh" }}
            initial={{ scale: 0.9, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 40 }}
          >
            {/* Gradient header */}
            <div
              className={`flex justify-between items-center px-6 py-4 bg-gradient-to-r ${gradients[type]} text-white sticky top-0 z-10`}
            >
              <h2 className="text-lg font-semibold">
                {type === "pie" && "Registered vs Not Registered"}
                {type === "bd" &&
                  "Inquiries / Quotations / Registrations by BD"}
                {type === "month" && "Monthly Trend"}
                {type === "clients" && "Top Clients"}
                {type === "execution" && "Quotation Execution"}
              </h2>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto px-6 py-4 space-y-6">
              {type === "month" && (
                <>
                  <LineChart
                    xAxis={[
                      {
                        scaleType: "point",
                        data: monthsSorted,
                        tickLabelStyle: { angle: -20 },
                      },
                    ]}
                    series={[
                      {
                        data: monthCounts,
                        label: "Inquiries",
                        color: "#1d4ed8",
                        type: "bar",
                      },
                      {
                        data: monthQuotCounts,
                        label: "Quotations",
                        color: "#16a34a",
                        type: "line",
                      },
                      {
                        data: monthValuesAfter,
                        label: "Quotation Value (After)",
                        color: "#9333ea",
                        yAxisKey: "rightAxis",
                        type: "line",
                      },
                    ]}
                    rightAxis={[{ id: "rightAxis" }]}
                    tooltip={{
                      valueFormatter: (v, { seriesId }) =>
                        seriesId === "Quotation Value (After)" ? fmtINR(v) : v,
                    }}
                    width={850}
                    height={380}
                  />
                  <ul className="space-y-2 text-gray-700">
                    {monthsSorted.map((m, i) => (
                      <li key={m}>
                        📅 <strong>{m}</strong>: {monthCounts[i]} inquiries,{" "}
                        {monthQuotCounts[i]} quotations,{" "}
                        {fmtINR(monthValuesAfter[i])} quotation value
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* other charts unchanged */}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
