import React, { useState, useEffect, Suspense, useCallback } from "react";
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
import useInquiries from "./hooks/useInquiries";
import useProjections from "./hooks/useProjections";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default function App() {
  const [view, setView] = useState("list");
  const [subView, setSubView] = useState(null);
  const [queryType, setQueryType] = useState("inqDate");
  const [showGraph, setShowGraph] = useState(false);
  const [error, setError] = useState(null);

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

  const { inquiries, loading, fetchInquiries } = useInquiries(defaultFilters);

  const { projections, loading: projectionsLoading } = useProjections(
    queryType === "bdProjection" ? filters : null
  );

  const safeFetch = useCallback(
    async (fetchParams) => {
      setError(null);
      try {
        if (fetchParams.dateField !== "bdProjection") {
          await fetchInquiries(fetchParams);
        } else {
          await fetchInquiries({ ...fetchParams, dateField: "regisDate" });
        }
      } catch (e) {
        setError("Failed to fetch data. Please try again.");
        console.error("Fetch error:", e);
      }
    },
    [fetchInquiries]
  );

  useEffect(() => {
    safeFetch(filters);
  }, [filters, safeFetch]);

  useEffect(() => {
    if (view === "graph") {
      const timer = setTimeout(() => setShowGraph(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowGraph(false);
    }
  }, [view]);

  const onFiltersChange = (newFilterState) => {
    let newFilters = { ...newFilterState, dateField: queryType };

    if (newFilterState.filterType === "range") {
      let startDate = new Date(newFilterState.range?.start);
      let endDate = new Date(newFilterState.range?.end);

      if (
        startDate >= minDate &&
        startDate <= today &&
        endDate >= minDate &&
        endDate <= today &&
        startDate <= endDate
      ) {
        if (queryType === "bdProjection") {
          startDate = startOfMonth(startDate);
          endDate = endOfMonth(endDate);
        }
        newFilters.fromDate = format(startDate, "yyyy-MM-dd");
        newFilters.toDate = format(endDate, "yyyy-MM-dd");
      } else {
        console.warn("⛔ Invalid date range, skipping fetch");
        return;
      }
      newFilters.month = null;
      newFilters.year = null;
    } else if (newFilterState.filterType === "month" && newFilterState.year) {
      newFilters.year = Number(newFilterState.year);
      if (newFilterState.month) newFilters.month = Number(newFilterState.month);
      newFilters.fromDate = null;
      newFilters.toDate = null;
    }

    newFilters.bdNames = newFilterState.bdNames || [];
    newFilters.clientNames = newFilterState.clientNames || [];
    newFilters.verticals = newFilterState.verticals || [];
    newFilters.excludeVerticals = newFilterState.excludeVerticals;
    newFilters.excludeBds = newFilterState.excludeBds;
    newFilters.excludeClients = newFilterState.excludeClients;
    newFilters.sortOrder = newFilterState.sortOrder;

    setFilters(newFilters);

    console.log(newFilters);
  };

  const onDateFieldChange = async (dateField) => {
    const updatedFilters = { ...filters, dateField };
    setQueryType(dateField);
    setFilters(updatedFilters);
  };

  const handleResetAll = () => {
    setError(null);
    setQueryType("inqDate");
    setFilters({
      dateField: "inqDate",
      fromDate: defaultFilters.range.start,
      toDate: defaultFilters.range.end,
      sortOrder: defaultFilters.sortOrder,
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

  const getSortedInquiries = (data, dateField, sortOrder) => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => {
      const dateA = new Date(a[dateField]);
      const dateB = new Date(b[dateField]);
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  };

  const sortedInquiries = getSortedInquiries(
    inquiries,
    filters.dateField,
    filters.sortOrder
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <SideMenus activeView={queryType} onViewChange={onDateFieldChange} />

      <main className="flex-1 overflow-y-auto relative">
        {(loading || projectionsLoading) && (
          <div className="fixed top-0 right-0 bottom-0 left-60 bg-white/60 flex items-center justify-center z-50">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        {error && !loading && !projectionsLoading && (
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
              disabled={loading || projectionsLoading}
              queryType={queryType}
            />
          </div>

          <div>
            {subView && queryType !== "bdProjection" ? (
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
                      data={sortedInquiries} // ✅ use sorted data
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
                    <BdProjection
                      inquiries={inquiries}
                      projections={projections}
                    />
                  ) : view === "list" ? (
                    <InquiryList
                      data={sortedInquiries}
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
                          data={sortedInquiries}
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
