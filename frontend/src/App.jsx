import React, { useState, useEffect, Suspense, useCallback } from "react";
import Filters from "./components/Filters";
import InquiryList from "./components/InquiryList";
import InquiryOverview from "./components/InquiryOverview";
import SideMenus from "./components/SideMenus";
import BdProjection from "./components/BdProjection";
import LabAnalysis from "./components/LabAnalysis"; 
const GraphicalAnalysis = React.lazy(() =>
  import("./components/GraphicalAnalysis")
);
import SubInquiryList from "./components/SubInquiryList";
import { BarChart3, List, AlertTriangle, RefreshCcw } from "lucide-react";
import useInquiries from "./hooks/useInquiries";
import useProjections from "./hooks/useProjections";
import useLabAnalysis from "./hooks/useLabAnalysis"; 
import { startOfMonth, endOfMonth, format } from "date-fns";


export default function App() {
  const [view, setView] = useState("list");
  const [subView, setSubView] = useState(null);
  const [queryType, setQueryType] = useState("inqDate");
  const [showGraph, setShowGraph] = useState(false);
  const [error, setError] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

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
    labNames: [],
    excludeVerticals: false,
    excludeBds: false,
    excludeClients: false,
    excludeLabs: false,
    sortOrder: "newest",
    dateField: "inqDate",
    labStatusFilter: null, 
  };

  const [filters, setFilters] = useState({
    dateField: defaultFilters.dateField,
    fromDate: defaultFilters.range.start,
    toDate: defaultFilters.range.end,
    sortOrder: defaultFilters.sortOrder,
    labStatusFilter: defaultFilters.labStatusFilter,
  });

  const { inquiries, loading, fetchInquiries } = useInquiries(defaultFilters);

  const { projections, loading: projectionsLoading } = useProjections(
    queryType === "bdProjection" ? filters : null
  );
  
  // 🟢 UPDATE HOOK TO GET totalCount
  const { 
    sampleSummaries,
    labSummaries,
    sampleOverview,
    loading: labAnalysisLoading, 
    totalCount 
  } = useLabAnalysis(
    queryType === "labAnalysis" ? filters : null
  );


  const safeFetch = useCallback(
    async (fetchParams) => {
      setError(null);
      
      if (fetchParams.dateField === "labAnalysis") {
         return; 
      }
      
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
    // Only call safeFetch for non-labAnalysis views. LabAnalysis fetch is driven by the useLabAnalysis hook.
    if (queryType !== 'labAnalysis') {
        safeFetch(filters);
    }
  }, [filters, safeFetch, queryType]);

  useEffect(() => {
    if (view === "graph") {
      const timer = setTimeout(() => setShowGraph(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowGraph(false);
    }
  }, [view]);

  const onFiltersChange = (newFilterState) => {
    
    // 1. Destructure LabAnalysis-specific fields. Pagination fields (pageNumber, pageSize) are discarded.
    const { 
      reviewsBy, 
      labStatusFilter, 
      pageNumber, // Discarded as per user request
      pageSize,   // Discarded as per user request
      ...restOfNewFilterState 
    } = newFilterState;
    
    // 2. Initialize newFilters with current state as base
    let newFilters = { ...filters };
    
    // 3. Merge all non-pagination filter changes. No page number or size logic is included.
    newFilters = {
        ...newFilters,
        ...restOfNewFilterState,
    };
    
    // 4. Handle labAnalysis specific filters (which are stripped in restOfNewFilterState)
    if (queryType === 'labAnalysis') {
        newFilters.labStatusFilter = labStatusFilter !== undefined ? labStatusFilter : newFilters.labStatusFilter;
        newFilters.reviewsBy = reviewsBy !== undefined ? reviewsBy : newFilters.reviewsBy;
    }

    // 5. Common field updates (sortOrder, dateField)
    newFilters.dateField = queryType;
    newFilters.sortOrder = newFilterState.sortOrder || filters.sortOrder;
    
    // 6. Date Range Logic 
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
        console.warn("⛔ Invalid date range, skipping filter update");
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

    // 7. Handle non-labAnalysis specific filters (verticals, bds, clients)
    if (queryType !== 'labAnalysis') {
        newFilters.bdNames = newFilterState.bdNames || [];
        newFilters.clientNames = newFilterState.clientNames || [];
        newFilters.verticals = newFilterState.verticals || [];
        newFilters.excludeVerticals = newFilterState.excludeVerticals;
        newFilters.excludeBds = newFilterState.excludeBds;
        newFilters.excludeClients = newFilterState.excludeClients;
        // 🔽 REMOVED OLD STATUS CLEARING
        newFilters.labStatusFilter = null; 
        newFilters.reviewsBy = null;
    } else {
        newFilters.labNames = newFilterState.labNames,
        newFilters.excludeLabs = newFilterState.excludeLabs,
        newFilters.bdNames = [];
        newFilters.clientNames = [];
        newFilters.verticals = [];
        newFilters.excludeVerticals = false;
        newFilters.excludeBds = false;
        newFilters.excludeClients = false;
    }


    console.log("app.jsx", newFilters)
    // 8. Final State Update
    setFilters(newFilters);
  };

  const onDateFieldChange = async (dateField) => {
    setView("list");
    setSubView(null);

    let updatedFilters = { 
        ...filters, 
        dateField,
        // pageNumber: 1 and pageSize no longer managed here
    };
    if (dateField === 'labAnalysis') {
        updatedFilters = {
            ...updatedFilters,
            verticals: [],
            bdNames: [],
            clientNames: [],
            excludeVerticals: false,
            excludeBds: false,
            excludeClients: false,
            // 🔽 ENSURE LAB STATUS IS RESET ON LAB VIEW CHANGE
            labStatusFilter: null,
            reviewsBy: null,
        };
    }
    
    setQueryType(dateField);
    setFilters(updatedFilters);
  };

  const handleResetAll = () => {
    setError(null);
    setFilters({
      fromDate: defaultFilters.range.start,
      toDate: defaultFilters.range.end,
      sortOrder: defaultFilters.sortOrder,
      // 🔽 UPDATED: Use new status filter state
      labStatusFilter: defaultFilters.labStatusFilter, 
      reviewsBy: null,
      // Pagination state is no longer reset here
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
    const sourceData = queryType === 'labAnalysis' ? sampleSummaries : data; 

    if (!sourceData || sourceData.length === 0) return [];
    
    return [...sourceData].sort((a, b) => {
      const dateKey = queryType === 'labAnalysis' ? 'RegDate' : dateField; 
      
      // Use case-insensitive access to handle API inconsistencies
      const dateA = new Date(a[dateKey] || a[dateKey.toLowerCase()] || a[dateKey.toUpperCase()]);
      const dateB = new Date(b[dateKey] || b[dateKey.toLowerCase()] || b[dateKey.toUpperCase()]);

      if (isNaN(dateA) || isNaN(dateB)) return 0;
      
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB; // FIX: Should be dateB - dateA in both cases
    });
  };

  const sortedInquiries = getSortedInquiries(
    inquiries,
    filters.dateField,
    filters.sortOrder
  );
  
  const totalLoading = loading || projectionsLoading || labAnalysisLoading;


  return (
    <div className="flex h-screen bg-gray-100">
      <SideMenus
        activeView={queryType}
        onViewChange={onDateFieldChange}
        isMinimized={isMinimized}
        onToggleMinimize={handleToggleMinimize}
      />

      {/* The main content area starts here */}
      <main
        className={`flex-1 overflow-y-auto relative transition-all duration-300 ${
          isMinimized ? "ml-25" : "ml-56"
        }`}
      >
        {/* Global Loader */}
        {totalLoading && (
          <div
            className={`fixed top-0 right-0 bottom-0 ${
              isMinimized ? "left-20" : "left-56"
            } bg-white/60 flex items-center justify-center z-40 transition-all duration-300`}
          >
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        {error && !totalLoading && (
          <div
            className={`fixed top-4 right-4 z-40 flex justify-center transition-all duration-300 ${
              isMinimized ? "left-20" : "left-56"
            }`}
          >
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
              disabled={totalLoading}
              queryType={queryType}
            />
          </div>

          <div>
            {/* If a sub-view is active AND we are not in special full-page views (BD/Lab Analysis), show the sub-view */}
            {subView && queryType !== "bdProjection" && queryType !== "labAnalysis" ? (
              <div className="max-w-7xl mx-auto px-2 relative">
                <SubInquiryList
                  {...filterSubData()}
                  queryType={subView}
                  onBack={handleBack}
                  loading={loading}
                />
              </div>
            ) : queryType === "labAnalysis" ? (
              <div className="max-w-7xl mx-auto px-2 relative">
                {/* 🟢 PASS FILTERS, SETFILTERS, AND totalCount */}
                <LabAnalysis 
                    data={sampleSummaries} 
                    labSummaryData={labSummaries}
                    sampleOverview={sampleOverview}
                    filters={filters}
                    setFilters={onFiltersChange}
                    totalCount={totalCount}
                />
              </div>
            ) : (
              // 2. STANDARD / BD PROJECTION VIEWS
              <>
                {/* Inquiry Overview (Hidden for Lab Analysis) */}
                <div className="max-w-7xl mx-auto mb-8 px-2 relative">
                  {queryType !== "bdProjection" && queryType !== "labAnalysis" && (
                    <InquiryOverview
                      data={sortedInquiries} 
                      queryType={queryType}
                      onCardClick={handleCardClick}
                      loading={loading}
                    />
                  )}
                </div>

                {/* View Toggle (Hidden for Lab Analysis) */}
                <div className="flex justify-center my-8">
                  {queryType !== "bdProjection" && queryType !== "labAnalysis" && (
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

                {/* Main Content Area (List/Graph/Projection) */}
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
                    <div className="block">
                      <Suspense
                        fallback={
                          <div className="flex justify-center py-10">\n                            <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full"></div>
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