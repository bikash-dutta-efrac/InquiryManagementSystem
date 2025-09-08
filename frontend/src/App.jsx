import { useEffect, useState } from "react";
import Filters from "./components/Filters";
import InquiryList from "./components/InquiryList";
import InquiryOverview from "./components/InquiryOverview";
import GraphicalAnalysis from "./components/GraphicalAnalysis";
import SubInquiryList from "./components/SubInquiryList";
import { BarChart3, List } from "lucide-react";

export default function App() {
  const [inquiries, setInquiries] = useState([]);
  const [view, setView] = useState("list");
  const [loading, setLoading] = useState(false);
  const [subView, setSubView] = useState(null);

  // ✅ Calculate defaults
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);

  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 20);

  const defaultFilters = {
    filterType: "range",
    range: {
      start: lastMonth.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    },
    month: (today.getMonth() + 1).toString(),
    year: today.getFullYear().toString(),
    bdNames: [],
    clientNames: [],
    sortOrder: "newest",
    dateField: "inqDate", // NEW default filter by Inquiry Date
  };

  // 🔄 Fetch inquiries from API
  const fetchInquiries = async (filters = {}) => {
    setLoading(true);

    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
      )
    ).toString();

    // const res = await fetch(`http://localhost:5075/api/inquiries?${params}`);
    const res = await fetch(`http://192.168.3.183:5075/api/inquiries?${params}`);
    const data = await res.json();

    const sorted = [...data].sort(
      (a, b) => new Date(b.inqDate) - new Date(a.inqDate)
    );

    setInquiries(sorted);
    setLoading(false);
  };

  // ✅ Load *last month → today* on mount
  useEffect(() => {
    fetchInquiries({
      fromDate: defaultFilters.range.start,
      toDate: defaultFilters.range.end,
      dateField: defaultFilters.dateField,
    });
  }, []);

  // 🔍 Handle filter change
  const handleFilterChange = ({
    filterType,
    range,
    month,
    year,
    bdNames,
    clientNames,
    sortOrder,
    dateField,
  }) => {
    let filters = {};

    // ✅ Pass selected dateField
    if (dateField) {
      filters.dateField = dateField;
    }

    if (filterType === "range" && range?.start && range?.end) {
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);

      if (
        startDate >= minDate &&
        startDate <= today &&
        endDate >= minDate &&
        endDate <= today &&
        startDate <= endDate
      ) {
        filters.fromDate = range.start;
        filters.toDate = range.end;
      } else {
        console.warn("⛔ Invalid date range, skipping fetch");
        return;
      }
    } else if (filterType === "month" && year) {
      filters.year = year;
      if (month) filters.month = month;
    }

    if (bdNames?.length === 1) {
      filters.bdName = bdNames[0];
    }
    if (clientNames?.length === 1) {
      filters.clientName = clientNames[0];
    }

    fetchInquiries(filters).then(() => {
      if (sortOrder) {
        setInquiries((prev) =>
          [...prev].sort((a, b) =>
            sortOrder === "newest"
              ? new Date(b[dateField || "inqDate"]) -
                new Date(a[dateField || "inqDate"])
              : new Date(a[dateField || "inqDate"]) -
                new Date(b[dateField || "inqDate"])
          )
        );
      }
    });
  };

  const handleResetAll = () =>
    fetchInquiries({
      fromDate: defaultFilters.range.start,
      toDate: defaultFilters.range.end,
      dateField: defaultFilters.dateField,
    });

  // 🔗 Handle card clicks (overview → sub list)
  const handleCardClick = (type) => {
    setSubView(type);
  };

  const handleBack = () => setSubView(null);

  // 🗂️ Filter sub-view data
  const filterSubData = () => {
    switch (subView) {
      case "inquiries":
        return { title: "All Inquiries", data: inquiries };
      case "quotations":
        return {
          title: "All Quotations",
          data: inquiries.filter((d) => d.quotNo),
        };
      case "approved":
        return {
          title: "Approved Quotations",
          data: inquiries.filter((d) => d.quotNo && d.regisNo),
        };
      case "unapproved":
        return {
          title: "Unapproved Quotations",
          data: inquiries.filter((d) => d.quotNo && !d.regisNo),
        };
      case "registrations":
        return {
          title: "All Registrations",
          data: inquiries.filter((d) => d.regisNo),
        };
      default:
        return { title: "", data: [] };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      <header className="bg-blue-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Customer Inquiries</h1>

          <div className="flex items-center">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-l-full transition 
                ${
                  view === "list"
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
            >
              <List className="w-5 h-5" />
              <span className="hidden sm:inline">List</span>
            </button>

            <button
              onClick={() => setView("graph")}
              className={`flex items-center gap-2 px-4 py-2 rounded-r-full transition 
                ${
                  view === "graph"
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline">Graph</span>
            </button>
          </div>
        </div>
      </header>

      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto mb-6">
          <Filters
            data={inquiries}
            onChange={handleFilterChange}
            onResetAll={handleResetAll}
            disabled={loading}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-700 font-medium">
              Loading inquiries...
            </p>
          </div>
        ) : subView ? (
          <div className="max-w-7xl mx-auto px-2">
            <SubInquiryList {...filterSubData()} onBack={handleBack} />
          </div>
        ) : (
          <>
            <div className="max-w-7xl mx-auto mb-8 px-2">
              <InquiryOverview data={inquiries} onCardClick={handleCardClick} />
            </div>

            <div className="max-w-7xl mx-auto px-2">
              {view === "list" ? (
                <InquiryList data={inquiries} />
              ) : (
                <GraphicalAnalysis data={inquiries} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
