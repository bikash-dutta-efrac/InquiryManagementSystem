import React, { useState, useEffect, Suspense, useCallback } from "react";
import Filters from "./components/Filters";
import InquiryList from "./components/InquiryList";
import InquiryOverview from "./components/InquiryOverview";
import SideMenus from "./components/SideMenus";
import BdProjection from "./components/BdProjection";
import LabAnalysis from "./components/LabAnalysis"; 
import SampleAnalysis from "./components/SampleAnalysis";
import SubInquiryList from "./components/SubInquiryList";
import BusinessAnalysis from "./components/BusinessAnalysis";
import BDProjectionManager from "./components/BdProjectionManager";
import BdPerformanceAnalysis from "./components/BdPerformanceAnalysis";

import { BarChart3, List, AlertTriangle, RefreshCcw } from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";

import useInquiries from "./hooks/useInquiries";
import useProjections from "./hooks/useProjections";
import useLabAnalysis from "./hooks/useLabAnalysis"; 

const GraphicalAnalysis = React.lazy(() =>
  import("./components/GraphicalAnalysis")
);

export default function App() {
  // ---------------- State ----------------
  const [view, setView] = useState("list");
  const [subView, setSubView] = useState(null);
  const [queryType, setQueryType] = useState("inqDate");
  const [showGraph, setShowGraph] = useState(false);
  const [error, setError] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [bdProjectionInquiries, setBdProjectionInquiries] = useState([]);
  const [bdPerformanceInquiries, setBdPerformanceInquiries] = useState([]);

  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 20);

  const defaultFromDate = today.toISOString().split("T")[0];
  const defaultToDate = today.toISOString().split("T")[0];

  const defaultFilters = {
    filterType: "range",
    range: { start: defaultFromDate, end: defaultToDate },
    month: null,
    year: null,
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
  };

  const [filters, setFilters] = useState({
    filterType: defaultFilters.filterType,
    fromDate: defaultFilters.range.start,
    toDate: defaultFilters.range.end,
    sortOrder: defaultFilters.sortOrder,
    reviewsBy: null,
  });

  // ---------------- Hooks ----------------
  const { inquiries, loading, fetchInquiries } = useInquiries(defaultFilters);

  const { 
    sampleSummaries,
    labSummaries,
    sampleOverview,
    loading: labAnalysisLoading, 
    totalCount 
  } = useLabAnalysis(queryType === "labAnalysis" ? filters : null);

  const totalLoading = loading || labAnalysisLoading;

  // ---------------- Handlers ----------------
  const handleToggleMinimize = () => setIsMinimized((prev) => !prev);

  const handleCardClick = (type) => setSubView(type);
  
  const handleBack = () => setSubView(null);

  const handleResetAll = () => {
    setError(null);
    setFilters({
      filterType: defaultFilters.filterType, 
      fromDate: defaultFilters.range.start,
      toDate: defaultFilters.range.end,
      sortOrder: defaultFilters.sortOrder,
      reviewsBy: null,
    });
  };

  const onDateFieldChange = async (dateField) => {
    setView("list");
    setSubView(null);

    let updatedFilters = { ...filters, dateField };
    if (dateField === "labAnalysis" || dateField === "sampleAnalysis") {
      updatedFilters = {
        ...updatedFilters,
        verticals: [],
        bdNames: [],
        clientNames: [],
        excludeVerticals: false,
        excludeBds: false,
        excludeClients: false,
        labStatusFilter: null,
        reviewsBy: null,
      };
    }

    setQueryType(dateField);
    setFilters(updatedFilters);
  };

  const safeFetch = useCallback(
    async (fetchParams) => {
      setError(null);
      if (fetchParams.dateField === "labAnalysis" || fetchParams.dateField === "sampleAnalysis") return;

      try {
        if (fetchParams.dateField !== "bdProjection" && fetchParams.dateField !== "bdPerformanceAnalysis") {
          await fetchInquiries(fetchParams);
        } else {
          await fetchInquiries({ ...fetchParams, dateField: "regisDate" });
        }
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Failed to fetch data. Please try again.");
      }
    },
    [fetchInquiries]
  );

  const handleBdProjectionMonthChange = useCallback(
    async (monthData) => {
      try {
        const { fromDate, toDate, bdNames, dateField } = monthData;

        const fetchParams = {
          dateField: dateField,
          fromDate,
          toDate,
          bdNames: bdNames || [],
          verticals: [],
          clientNames: [],
          excludeVerticals: false,
          excludeBds: false,
          excludeClients: false,
          sortOrder: "newest",
        };

        console.log("BD Projection Fetch Params:", fetchParams);
        await fetchInquiries(fetchParams);

      } catch (e) {
        console.error("❌ Failed to fetch BD projection inquiries:", e);
        setBdProjectionInquiries([]);
      }
    },
    [fetchInquiries]
  );

  const handleBdPerformanceMonthChange = useCallback(
    async (monthData) => {
      try {
        const { fromDate, toDate, bdNames, dateField } = monthData;

        const fetchParams = {
          dateField: dateField,
          fromDate,
          toDate,
          bdNames: bdNames || [],
          verticals: [],
          clientNames: [],
          excludeVerticals: false,
          excludeBds: false,
          excludeClients: false,
          sortOrder: "newest",
        };

        console.log("BD Performance Fetch Params:", fetchParams);
        await fetchInquiries(fetchParams);

      } catch (e) {
        console.error("❌ Failed to fetch BD performance inquiries:", e);
        setBdPerformanceInquiries([]);
      }
    },
    [fetchInquiries]
  );

  // Update bdProjectionInquiries when inquiries change for bdProjection
  useEffect(() => {
    if (queryType === "bdProjection" && inquiries?.length >= 0) {
      setBdProjectionInquiries(inquiries);
    }
  }, [inquiries, queryType]);

  // Update bdPerformanceInquiries when inquiries change for bdPerformanceAnalysis
  useEffect(() => {
    if (queryType === "bdPerformanceAnalysis" && inquiries?.length >= 0) {
      setBdPerformanceInquiries(inquiries);
    }
  }, [inquiries, queryType]);

  const onFiltersChange = (newFilterState) => {
    const { reviewsBy, labStatusFilter, pageNumber, pageSize, ...rest } = newFilterState;

    let newFilters = { ...filters, ...rest };
    newFilters.dateField = queryType;
    newFilters.sortOrder = newFilterState.sortOrder || filters.sortOrder;

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
        if (queryType === "bdProjection" || queryType === "bdPerformanceAnalysis") {
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
    } else if (newFilterState.filterType === "all") {
      newFilters.fromDate = new Date(2025, 3, 1).toISOString().split("T")[0];
      newFilters.toDate = defaultFilters.range.end;
      newFilters.month = null;
      newFilters.year = null;
    }

    if (queryType === "labAnalysis") {
      newFilters.labNames = newFilterState.labNames;
      newFilters.excludeLabs = newFilterState.excludeLabs;
      newFilters.bdNames = [];
      newFilters.clientNames = [];
      newFilters.verticals = [];
      newFilters.excludeVerticals = false;
      newFilters.excludeBds = false;
      newFilters.excludeClients = false;
    } else if (queryType === "sampleAnalysis") {
      newFilters.bdNames = [];
      newFilters.clientNames = [];
      newFilters.verticals = [];
      newFilters.labNames = [];
      newFilters.excludeVerticals = false;
      newFilters.excludeBds = false;
      newFilters.excludeClients = false;
      newFilters.excludeLabs = false;
    } else {
      newFilters.bdNames = newFilterState.bdNames || [];
      newFilters.clientNames = newFilterState.clientNames || [];
      newFilters.verticals = newFilterState.verticals || [];
      newFilters.excludeVerticals = newFilterState.excludeVerticals;
      newFilters.excludeBds = newFilterState.excludeBds;
      newFilters.excludeClients = newFilterState.excludeClients;
      newFilters.labNames = [];
      newFilters.excludeLabs = false;
    }

    setFilters(newFilters);
  };

  // ---------------- Derived Data ----------------
  const filterSubData = () => {
    switch (subView) {
      case "inquiries":
        return { title: "All Inquiries", data: inquiries };
      case "quotations":
        return { title: "All Quotations", data: inquiries.filter(d => d.quotNo) };
      case "approved":
        return { title: "Approved Quotations", data: inquiries.filter(d => d.quotNo && d.regisNo) };
      case "unapproved":
        return { title: "Unapproved Quotations", data: inquiries.filter(d => d.quotNo && !d.regisNo) };
      case "registrations":
        return { title: "All Registrations", data: inquiries.filter(d => d.regisNo) };
      default:
        return { title: "", data: [] };
    }
  };

  const getSortedInquiries = (data, dateField, sortOrder) => {
    const sourceData = queryType === "labAnalysis" ? sampleSummaries : data;
    if (!sourceData || sourceData.length === 0) return [];

    return [...sourceData].sort((a, b) => {
      const dateKey = queryType === "labAnalysis" ? "RegDate" : dateField;
      if (!dateKey) return 0;

      const dateA = new Date(a[dateKey] || a[dateKey.toLowerCase()] || a[dateKey.toUpperCase()]);
      const dateB = new Date(b[dateKey] || b[dateKey.toLowerCase()] || b[dateKey.toUpperCase()]);

      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  };

  const sortedInquiries = getSortedInquiries(inquiries, filters.dateField, filters.sortOrder);

  // ---------------- Effects ----------------
  useEffect(() => {
    if (
      queryType !== "labAnalysis" && 
      queryType !== "sampleAnalysis" && 
      queryType !== "bdProjection" && 
      queryType !== "bdPerformanceAnalysis" &&
      queryType !== "businessAnalysis"
    ) {
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

  // ---------------- Render ----------------
  return (
    <div className="flex h-screen bg-gray-100">
      <SideMenus
        activeView={queryType}
        onViewChange={onDateFieldChange}
        isMinimized={isMinimized}
        onToggleMinimize={handleToggleMinimize}
      />

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

        {/* Error Message */}
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
          {/* Filters */}
          <div className="max-w-6xl mx-auto mb-6">
            {queryType !== "sampleAnalysis" && 
             queryType !== "bdProjection" && 
             queryType !== "bdPerformanceAnalysis" && 
             queryType !== "businessAnalysis" && (
              <Filters
                onChange={onFiltersChange}
                onResetAll={handleResetAll}
                disabled={totalLoading}
                queryType={queryType}
              />
            )}
          </div>

          {/* Main Content */}
          <div>
            {/* Sub-views for standard inquiry types */}
            {subView && 
             queryType !== "bdProjection" && 
             queryType !== "bdPerformanceAnalysis" && 
             queryType !== "labAnalysis" ? (
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
                <LabAnalysis 
                  data={sampleSummaries} 
                  labSummaryData={labSummaries}
                  sampleOverview={sampleOverview}
                  filters={filters}
                  setFilters={onFiltersChange}
                  totalCount={totalCount}
                />
              </div>
            ) : queryType === "sampleAnalysis" ? (
              <div className="max-w-7xl mx-auto px-2 -mt-4 relative">
                <SampleAnalysis /> 
              </div>
            ) : queryType === "businessAnalysis" ? (
              <div className="max-w-7xl mx-auto px-2 -mt-4 relative">
                <BusinessAnalysis /> 
              </div>
            ) : queryType === "bdProjection" ? (
              <div className="max-w-7xl mx-auto px-2 -mt-4 relative">
                <BDProjectionManager 
                  onMonthChange={handleBdProjectionMonthChange}
                  inquiriesData={bdProjectionInquiries}
                /> 
              </div>
            ) : queryType === "bdPerformanceAnalysis" ? (
              <div className="max-w-7xl mx-auto px-2 -mt-4 relative">
                <BdPerformanceAnalysis 
                  onMonthChange={handleBdPerformanceMonthChange}
                  inquiriesData={bdPerformanceInquiries}
                /> 
              </div>
            ) : (
              <>
                {/* Overview */}
                <div className="max-w-7xl mx-auto mb-8 px-2 relative">
                  <InquiryOverview
                    data={sortedInquiries} 
                    queryType={queryType}
                    onCardClick={handleCardClick}
                    loading={loading}
                  />
                </div>

                {/* View Toggle */}
                <div className="flex justify-center my-8">
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
                </div>

                {/* Inquiry List / Graph */}
                <div className="max-w-7xl mx-auto px-2 -mt-4 relative">
                  {view === "list" ? (
                    <InquiryList
                      data={sortedInquiries}
                      queryType={queryType}
                      loading={loading}
                    />
                  ) : (
                    <div className="block">
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