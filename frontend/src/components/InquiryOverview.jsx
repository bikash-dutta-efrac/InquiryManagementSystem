import { useState, useEffect, useRef } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Wallet,
  ClipboardList,
  ThumbsUp,
} from "lucide-react";

function KpiCard1({ title, value, sub, chip, icon, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition min-h-[160px] max-h-[160px]">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-95`}
      />
      <div className="relative p-5 text-white flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider bg-black/30 px-2 py-1 rounded-full">
            {chip}
          </span>
          <div className="p-2 bg-black/20 rounded-xl">{icon}</div>
        </div>
        <div>
          <h4 className="mt-3 text-sm opacity-90">{title}</h4>
          <div className="text-2xl font-extrabold tracking-tight drop-shadow-sm">
            {value}
          </div>
          {<div className="mt-2 text-xs opacity-90">{sub}</div>}
        </div>
      </div>
      <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/10 group-hover:bg-white/20 transition" />
    </div>
  );
}

function KpiCard2({ summary }) {
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
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-900 via-blue-900 to-indigo-900 rounded-2xl" />

      <div className="relative p-6">
        <h2 className="text-center text-xl font-bold text-white mb-5 drop-shadow">
          Vertical Summary
        </h2>

        <div className="relative">
          {/* Left fade */}
          <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-cyan-900 via-cyan-900/20 to-transparent pointer-events-none z-10" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-indigo-900 via-indigo-900/20 to-transparent pointer-events-none z-10" />

          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="overflow-x-auto overflow-y-visible scroll-smooth pl-4 pr-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-900/30"
            style={{ height: "140px" }} // adjust as needed
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
                  className="relative min-w-[140px] max-w-[160px] text-center
                             bg-white/10 rounded-lg p-3
                             shadow-md transform hover:scale-105 hover:shadow-xl hover:z-20
                             transition duration-300"
                  style={{ backdropFilter: "blur(6px)" }}
                >
                  <h3 className="text-sm font-semibold text-white mb-2">
                    {item.vertical}
                  </h3>

                  <div className="text-xs text-gray-100 space-y-0.5">
                    <p>
                      Registrations:{" "}
                      <span className="font-semibold text-white">
                        {item.totalRegistrations ?? 0}
                      </span>
                    </p>
                    <p>
                      Regis Val:{" "}
                      <span className="font-semibold text-white">
                        {Math.round(item.totalRegisVal ?? 0).toLocaleString()}
                      </span>
                    </p>
                    <p>
                      Approved:{" "}
                      <span className="font-semibold text-white">
                        {item.approved ?? 0}
                      </span>
                    </p>
                    <p>
                      Unapproved:{" "}
                      <span className="font-semibold text-white">
                        {item.unapproved ?? 0}
                      </span>
                    </p>
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

  const avgQuotationValue =
    totalQuotations > 0 ? totalQuotationValue / totalQuotations : 0;

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
        };
      }

      acc[v].totalRegistrations += 1;
      acc[v].totalRegisVal += Number(item.regisVal || 0);
      if (item.quotStatus === "Approved") acc[v].approved += 1;
      if (item.quotStatus === "Unapproved") acc[v].unapproved += 1;

      return acc;
    }, []);
    setSummaryByVertical(summary);
  }, {});


  return (
    <div className="space-y-8">
      {/* Top KPI Cards (grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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

        {queryType !== "regisDate" && (
          <div
            onClick={() => onCardClick("quotations")}
            className="cursor-pointer"
          >
            <KpiCard1
              title="Total Quotations"
              value={quotations}
              sub={
                <div className="space-y-1">
                  <div>
                    Avg Value: ₹{" "}
                    {avgQuotationValue.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
              }
              icon={<ClipboardList className="w-5 h-5" />}
              gradient="from-cyan-600 via-sky-700 to-blue-700"
              chip="Quotations"
            />
          </div>
        )}

        {queryType !== "regisDate" && (
          <div
            onClick={() => onCardClick("approved")}
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
        )}

        {queryType !== "regisDate" && (
          <div
            onClick={() => onCardClick("unapproved")}
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
        )}

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
            value={`₹ ${Math.round(totalRegisteredValue)}`}
            icon={<Wallet className="w-5 h-5" />}
            gradient="from-purple-600 via-fuchsia-700 to-pink-700"
            chip="Registration"
          />
        </div>
      </div>

      <KpiCard2 summary={summaryByVertical} />
    </div>
  );
}
