import React, { useState, useEffect, Suspense } from "react";
import Filters from "./components/Filters";
import InquiryList from "./components/InquiryList";
import InquiryOverview from "./components/InquiryOverview";
import SideMenus from "./components/SideMenus";
import BdProjection from "./components/BdProjection";
const GraphicalAnalysis = React.lazy(() =>
  import("./components/GraphicalAnalysis")
);
import SubInquiryList from "./components/SubInquiryList";
import { BarChart3, List, AlertTriangle, RefreshCcw } from "lucide-react";
import useFilters from "./hooks/useFilters";

export default function App() {
  const [view, setView] = useState("list");
  const [subView, setSubView] = useState(null);
  const [queryType, setQueryType] = useState("inqDate");
  const [showGraph, setShowGraph] = useState(false);
  const [error, setError] = useState(null);
  const [projections, setProjections] = useState([]);

  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 20);

  const defaultFilters = {
    filterType: "range",
    range: {
      start: today.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    },
    month: (today.getMonth() + 1).toString(),
    year: today.getFullYear().toString(),
    verticals: [],
    bdNames: [],
    clientNames: [],
    excludeVerticals: false,
    excludeBds: false,
    excludeClients: false,
    sortOrder: "newest",
    dateField: "inqDate",
  };

  const [filters, setFilters] = useState({
  dateField: defaultFilters.dateField,
  fromDate: defaultFilters.range.start,
  toDate: defaultFilters.range.end,
  sortOrder: defaultFilters.sortOrder,
});

  const { inquiries, loading, fetchInquiries, setInquiries } =
    useFilters(defaultFilters);

  const safeFetch = async (fetchParams) => {
    setError(null);
    try {
      await fetchInquiries(fetchParams);
    } catch (e) {
      setError("Failed to fetch data. Please try again.");
      console.error("Fetch error:", e);
    }
  };

useEffect(() => {
  if (queryType !== "bdProjection" && Object.keys(filters).length) {
    safeFetch(filters);
  }
}, [queryType, filters]);

  useEffect(() => {
    if (view === "graph") {
      const timer = setTimeout(() => setShowGraph(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowGraph(false);
    }
  }, [view]);

  const onFiltersChange = ({
    filterType,
    range,
    month,
    year,
    verticals,
    bdNames,
    clientNames,
    excludeVerticals,
    excludeBds,
    excludeClients,
    sortOrder,
  }) => {
    let newFilters = {};
    newFilters.dateField = queryType;
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
        newFilters.fromDate = range.start;
        newFilters.toDate = range.end;
      } else {
        console.warn("⛔ Invalid date range, skipping fetch");
        return;
      }
    } else if (filterType === "month" && year) {
      newFilters.year = Number(year);
      if (month) newFilters.month = Number(month);
    }
    if (bdNames?.length) newFilters.bdNames = bdNames;
    if (clientNames?.length) newFilters.clientNames = clientNames;
    if (verticals?.length) newFilters.verticals = verticals;
    newFilters.excludeVerticals = excludeVerticals;
    newFilters.excludeBds = excludeBds;
    newFilters.excludeClients = excludeClients;
    newFilters.sortOrder = sortOrder;

    setFilters(newFilters);
    safeFetch(newFilters).then(() => {
      if (sortOrder) {
        setInquiries((prev) =>
          [...prev].sort((a, b) =>
            sortOrder === "newest"
              ? new Date(b[queryType]) - new Date(a[queryType])
              : new Date(a[queryType]) - new Date(b[queryType])
          )
        );
      }
    });
    console.log("updatedFilters", filters);
  };

  const onDateFieldChange = async (dateField) => {
    const updatedFilters = { ...filters, dateField };
    setQueryType(dateField);
    setFilters(updatedFilters);
    console.log("updatedFilters", updatedFilters);

    try {
      await safeFetch(updatedFilters);
      if (updatedFilters.sortOrder) {
        setInquiries((prev) =>
          [...prev].sort((a, b) => {
            const aDate = new Date(a[dateField] || 0);
            const bDate = new Date(b[dateField] || 0);
            return updatedFilters.sortOrder === "newest"
              ? bDate - aDate
              : aDate - bDate;
          })
        );
      }
    } catch (err) {
      console.error("fetch failed", err);
    }
  };

  const handleResetAll = () => {
    setError(null);
    fetchInquiries({
      fromDate: defaultFilters.range.start,
      toDate: defaultFilters.range.end,
      dateField: queryType,
    });
  };

  const handleCardClick = (type) => setSubView(type);
  const handleBack = () => setSubView(null);

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
    <div className="flex h-screen bg-gray-100">
      <SideMenus activeView={queryType} onViewChange={onDateFieldChange} />

      <main className="flex-1 overflow-y-auto relative">
        {loading && (
          <div className="fixed top-0 right-0 bottom-0 left-60 bg-white/60 flex items-center justify-center z-50">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        {error && !loading && (
          <div className="fixed top-4 left-60 right-4 z-50 flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 max-w-xl">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <span className="flex-1">{error}</span>
              <button
                onClick={handleResetAll}
                className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="py-4 px-4">
          <div className="max-w-6xl mx-auto mb-6">
            <Filters
              data={inquiries}
              onChange={onFiltersChange}
              onResetAll={handleResetAll}
              disabled={loading}
              queryType={queryType}
            />
          </div>

          <div>
            {subView ? (
              <div className="max-w-7xl mx-auto px-2 relative">
                <SubInquiryList
                  {...filterSubData()}
                  queryType={subView}
                  onBack={handleBack}
                  loading={loading}
                />
              </div>
            ) : (
              <>
                <div className="max-w-7xl mx-auto mb-8 px-2 relative">
                  {queryType !== "bdProjection" && (
                    <InquiryOverview
                      data={inquiries}
                      queryType={queryType}
                      onCardClick={handleCardClick}
                      loading={loading}
                    />
                  )}
                </div>

                <div className="flex justify-center my-8">
                  {queryType !== "bdProjection" && (
                    <div className="relative flex items-center bg-white rounded-full p-2 shadow-lg border border-gray-200 transition-all duration-300">
                      <div
                        className={`absolute top-1 bottom-1 w-[48%] rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 shadow-md transition-all duration-500 ease-in-out ${
                          view === "list" ? "left-[4px]" : "left-[50.5%]"
                        }`}
                      ></div>
                      <button
                        onClick={() => setView("list")}
                        className={`relative flex items-center justify-center gap-2 px-6 py-1.5 w-1/2 z-10 transition-colors duration-300 text-sm sm:text-base ${
                          view === "list" ? "text-white" : "text-gray-700"
                        } font-medium`}
                      >
                        <List className="w-4 h-4" />
                        <span>List View</span>
                      </button>
                      <button
                        onClick={() => setView("graph")}
                        className={`relative flex items-center justify-center gap-2 px-6 py-1.5 w-1/2 z-10 transition-colors duration-300 text-sm sm:text-base whitespace-nowrap ${
                          view === "graph" ? "text-white" : "text-gray-700"
                        } font-medium`}
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Graphical View</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="max-w-7xl mx-auto px-2 relative">
                  {queryType === "bdProjection" ? (
                    <BdProjection filters={filters} inquiries={inquiries} />
                  ) : view === "list" ? (
                    <InquiryList
                      data={inquiries}
                      queryType={queryType}
                      loading={loading}
                    />
                  ) : (
                    <div className={view !== "graph" ? "hidden" : "block"}>
                      <Suspense
                        fallback={
                          <div className="flex justify-center py-10">
                            <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full"></div>
                          </div>
                        }
                      >
                        <GraphicalAnalysis
                          data={inquiries}
                          queryType={queryType}
                        />
                      </Suspense>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
