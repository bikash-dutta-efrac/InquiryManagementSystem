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

// ------------- Helpers -------------
const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));

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
    totalInquiries,
    totalQuotations,
    registeredCount,
    notRegisteredCount,
    registeredFromQuot,
    bdCats,
    bdInquiries,
    bdQuotations,
    bdRegistrations,
    bdTotalValues,
    verticalCats,
    verticalInquiries,
    verticalQuotations,
    verticalRegistrations,
    verticalRegValues,
    clientCats,
    clientValues,
    dailyDates,
    dailyQuotations,
    dailyRegistrations,
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
    // Maps to store counts
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

    // Determine dailyDates based on queryType
    let dailyDates = [];
    if (queryType === "regisDate") {
      dailyDates = Array.from(regMap.keys()).sort();
    } else if (queryType === "quotDate") {
      dailyDates = Array.from(quotMap.keys()).sort();
    } else if (queryType === "inqDate") {
      dailyDates = Array.from(inqMap.keys()).sort();
    }

    // Build counts aligned with dailyDates
    const dailyQuotations = dailyDates.map((d) => quotMap.get(d) || 0);
    const dailyRegistrations = dailyDates.map((d) => regMap.get(d) || 0);

    // ---------- BD Aggregation ----------
    const bdAgg = {};
    data.forEach((d) => {
      const bd = d.bdName || "—";
      if (!bdAgg[bd]) {
        bdAgg[bd] = {
          inquiries: new Set(),
          quotations: new Set(),
          registrations: new Set(),
          totalValue: 0,
        };
      }
      if (d.inqNo) bdAgg[bd].inquiries.add(d.inqNo);
      if (d.quotNo) bdAgg[bd].quotations.add(d.quotNo);
      if (d.regisNo) {
        bdAgg[bd].registrations.add(d.regisNo);
        bdAgg[bd].totalValue += Number(d.regisVal) || 0;
      }
    });

    // ---------- Top BDs by Registration Value ----------
    const bdTop = Object.entries(bdAgg)
      .map(([bd, { inquiries, quotations, registrations, totalValue }]) => ({
        bd,
        inquiries: inquiries.size,
        quotations: quotations.size,
        registrations: registrations.size,
        totalValue,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 6);

    // ---------- Chart Data ----------
    const bdCats = bdTop.map((d) => d.bd);
    const bdInquiries = bdTop.map((d) => d.inquiries);
    const bdQuotations = bdTop.map((d) => d.quotations);
    const bdRegistrations = bdTop.map((d) => d.registrations);
    const bdTotalValues = bdTop.map((d) => d.totalValue / 100000);

    // ---------- Vertical-wise Aggregation ----------
    const verticalAgg = {};
    data.forEach((d) => {
      const vertical = d.vertical || "Unknown";
      if (!verticalAgg[vertical])
        verticalAgg[vertical] = {
          inquiries: new Set(),
          quotations: new Set(),
          registrations: new Set(),
          totalRegVal: 0,
        };
      if (d.inqNo) verticalAgg[vertical].inquiries.add(d.inqNo);
      if (d.quotNo) verticalAgg[vertical].quotations.add(d.quotNo);
      if (d.regisNo) {
        verticalAgg[vertical].registrations.add(d.regisNo);
        verticalAgg[vertical].totalRegVal += Number(d.regisVal || 0);
      }
    });

    const verticalTop = Object.entries(verticalAgg)
      .map(([v, { inquiries, quotations, registrations, totalRegVal }]) => ({
        vertical: v,
        inquiries: inquiries.size,
        quotations: quotations.size,
        registrations: registrations.size,
        totalRegVal: totalRegVal / 100000, // in Lakhs
      }))
      .sort((a, b) => b.inquiries - a.inquiries);

    const verticalCats = verticalTop.map((d) => d.vertical);
    const verticalInquiries = verticalTop.map((d) => d.inquiries);
    const verticalQuotations = verticalTop.map((d) => d.quotations);
    const verticalRegistrations = verticalTop.map((d) => d.registrations);
    const verticalRegValues = verticalTop.map((d) => d.totalRegVal);

    // ---------- Client Aggregation ----------
    const clientAgg = {};
    data.forEach((d) => {
      const client = d.clientName || "—";
      clientAgg[client] =
        (clientAgg[client] || 0) + toNumber(d.quotValAfterDis);
    });
    const clientTop = Object.entries(clientAgg)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const clientCats = clientTop.map(([k]) => k);
    const clientValues = clientTop.map(([, v]) => v);

    return {
      totalInquiries,
      totalQuotations,
      registeredCount,
      notRegisteredCount,
      registeredFromQuot,
      bdCats,
      bdInquiries,
      bdQuotations,
      bdRegistrations,
      bdTotalValues,
      verticalCats,
      verticalInquiries,
      verticalQuotations,
      verticalRegistrations,
      verticalRegValues,
      clientCats,
      clientValues,
      dailyDates,
      dailyQuotations,
      dailyRegistrations,
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
      className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {queryType !== "regisDate" && (
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
            width={colWidth}
            height={smallHeight}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: "#fff",
                fontSize: 11,
              },
            }}
          />
        </ChartCard>
      )}

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
            { data: bdInquiries, label: "Inquiries", color: "#2563eb" },
            { data: bdQuotations, label: "Quotations", color: "#f59e0b" },
            {
              data: bdRegistrations,
              label: "Registrations",
              color: "#22c55e",
            },
            {
              data: bdTotalValues,
              label: "Total Value (Lakhs)",
              color: "#8b5cf6",
            },
          ]}
          width={colWidth}
          height={smallHeight}
        />
      </ChartCard>

      <ChartCard
        title="Vertical-wise Analytics"
        icon={<BarChart3 className="w-4 h-4" />}
        gradient="from-pink-600 to-rose-700"
        onExpand={() => setExpandedChart("vertical")}
      >
        <BarChart
          xAxis={[
            {
              scaleType: "band",
              data: verticalCats,
              tickLabelStyle: { angle: -20, fontSize: 10 },
            },
          ]}
          series={[
            { data: verticalInquiries, label: "Inquiries", color: "#2563eb" },
            {
              data: verticalQuotations,
              label: "Quotations",
              color: "#f59e0b",
            },
            {
              data: verticalRegistrations,
              label: "Registrations",
              color: "#22c55e",
            },
            {
              data: verticalRegValues,
              label: "Total RegVal (Lakhs)",
              color: "#8b5cf6",
            },
          ]}
          width={colWidth}
          height={smallHeight}
        />
      </ChartCard>

      <ChartCard
        title="Quotation vs Registration Trend"
        icon={<TrendingUp className="w-4 h-4" />}
        gradient="from-purple-600 to-fuchsia-700"
        onExpand={() => setExpandedChart("month")}
      >
        <LineChart
          xAxis={[
            {
              scaleType: "point",
              data: dailyDates,
              tickLabelStyle: { angle: -20, fontSize: 10 },
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
          series={[
            {
              data: clientValues,
              label: "Quotation Value",
              color: "#ea580c",
            },
          ]}
          width={colWidth}
          height={smallHeight}
        />
      </ChartCard>

      {queryType !== "regisDate" && (
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
            width={colWidth}
            height={smallHeight}
          />
        </ChartCard>
      )}

      {/* Expanded Modal */}
      <ExpandModal
        type={expandedChart}
        onClose={() => setExpandedChart(null)}
        {...{
          totalInquiries,
          registeredCount,
          notRegisteredCount,
          bdCats,
          bdInquiries,
          bdQuotations,
          bdRegistrations,
          bdTotalValues,
          verticalCats,
          verticalInquiries,
          verticalQuotations,
          verticalRegistrations,
          verticalRegValues,
          clientCats,
          clientValues,
          totalQuotations,
          registeredFromQuot,
          dailyDates,
          dailyQuotations,
          dailyRegistrations,
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

// ----------------- Expanded Modal -----------------
function ExpandModal({
  type,
  onClose,
  totalInquiries,
  registeredCount,
  notRegisteredCount,
  bdCats,
  bdInquiries,
  bdQuotations,
  bdRegistrations,
  bdTotalValues,
  verticalCats,
  verticalInquiries,
  verticalQuotations,
  verticalRegistrations,
  verticalRegValues,
  clientCats,
  clientValues,
  totalQuotations,
  registeredFromQuot,
  dailyDates,
  dailyQuotations,
  dailyRegistrations,
}) {
  const gradients = {
    pie: "from-blue-600 to-indigo-700",
    bd: "from-emerald-600 to-teal-700",
    vertical: "from-pink-600 to-rose-700",
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
            {/* Header */}
            <div
              className={`flex justify-between items-center px-6 py-4 bg-gradient-to-r ${gradients[type]} text-white sticky top-0 z-10`}
            >
              <h2 className="text-lg font-semibold">
                {type === "pie" && "Registered vs Not Registered"}
                {type === "bd" &&
                  "Top BD: Inquiries / Quotations / Registrations / Total Value"}
                {type === "vertical" && "Vertical-wise Analytics"}
                {type === "month" && "Quotation vs Registration Trend"}
                {type === "clients" && "Top Clients by Quotation"}
                {type === "execution" && "Quotation Execution"}
              </h2>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 text-sm"
              >
                ✕ Close
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-6">
              {/* Pie */}
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
                  width={850}
                  height={450}
                  sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                      fill: "#fff",
                      fontSize: 12,
                    },
                  }}
                />
              )}

              {/* BD */}
              {type === "bd" && (
                <BarChart
                  xAxis={[
                    {
                      scaleType: "band",
                      data: bdCats,
                      tickLabelStyle: { angle: -20, fontSize: 11 },
                    },
                  ]}
                  series={[
                    { data: bdInquiries, label: "Inquiries", color: "#2563eb" },
                    {
                      data: bdQuotations,
                      label: "Quotations",
                      color: "#f59e0b",
                    },
                    {
                      data: bdRegistrations,
                      label: "Registrations",
                      color: "#22c55e",
                    },
                    {
                      data: bdTotalValues,
                      label: "Total Value (Lakhs)",
                      color: "#8b5cf6",
                    },
                  ]}
                  width={850}
                  height={450}
                />
              )}

              {/* Vertical */}
              {type === "vertical" && (
                <BarChart
                  xAxis={[
                    {
                      scaleType: "band",
                      data: verticalCats,
                      tickLabelStyle: { angle: -20, fontSize: 11 },
                    },
                  ]}
                  series={[
                    {
                      data: verticalInquiries,
                      label: "Inquiries",
                      color: "#2563eb",
                    },
                    {
                      data: verticalQuotations,
                      label: "Quotations",
                      color: "#f59e0b",
                    },
                    {
                      data: verticalRegistrations,
                      label: "Registrations",
                      color: "#22c55e",
                    },
                    {
                      data: verticalRegValues,
                      label: "Total RegVal (Lakhs)",
                      color: "#8b5cf6",
                    },
                  ]}
                  width={850}
                  height={450}
                />
              )}

              {/* Month */}
              {type === "month" && (
                <LineChart
                  xAxis={[
                    {
                      scaleType: "point",
                      data: dailyDates,
                      tickLabelStyle: { angle: -20, fontSize: 11 },
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
                  width={850}
                  height={450}
                />
              )}

              {/* Clients */}
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
                      data: clientValues,
                      label: "Quotation Value",
                      color: "#ea580c",
                    },
                  ]}
                  width={850}
                  height={450}
                />
              )}

              {/* Execution */}
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
                  width={850}
                  height={450}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
