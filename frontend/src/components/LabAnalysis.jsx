import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Mail,
  Activity,
  UserCheck,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Clock2,
} from "lucide-react";

function formatAmount(num) {
  if (num < 1000) return num;
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e5, symbol: "L" },
    { value: 1e7, symbol: "Cr" },
    { value: 1e9, symbol: "B" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(2).replace(rx, "$1") + si[i].symbol;
}

const LabAnalysisSummaryCard = ({ title, value, color, icon }) => {
  const borderColor = `border-t-4 border-${color}-500`;
  const bgColor = `bg-${color}-100`;
  const iconColor = `text-${color}-600`;

  return (
    <div
      className={`bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 ${borderColor}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase text-gray-500">
          {title}
        </span>
        <div className={`p-2 mx-2 rounded-full ${bgColor} ${iconColor}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

const getStatusBadge = (item) => {
    const hodReview = item.hodReview?.toUpperCase() === 'Y';
    const qaReview = item.qaReview?.toUpperCase() === 'Y';
    const mailDate = item.mailDate;

    if (mailDate) {
        return {
            text: "Reviewed by Mail",
            badgeColor: "bg-yellow-100 text-yellow-700",
            icon: <Mail className="w-4 h-4" />,
        };
    }

    if (qaReview && item.labName === 'Drugs') {
        return {
            text: "Reviewed by QA",
            badgeColor: "bg-blue-100 text-blue-700",
            icon: <FlaskConical className="w-4 h-4" />,
        };
    }

    if (hodReview) {
        return {
            text: "Reviewed by HO",
            badgeColor: "bg-green-100 text-green-700",
            icon: <CheckCircle2 className="w-4 h-4" />,
        };
    }
    
    return {
        text: "Pending",
        badgeColor: "bg-red-100 text-red-700",
        icon: <XCircle className="w-4 h-4" />,
    };
};


// --- Pagination Component ---
const PaginationControls = ({
  pageNumber,
  pageSize,
  currentDataLength, 
  setFilters,
}) => {
  // Ensure pageNumber and pageSize are treated as numbers and default to 1 and 50 if needed
  const currentPage = Number(pageNumber) || 1;
  const size = Number(pageSize) || 50;
    
  // LOGIC: Next is disabled if the current page returned less than max size
  const isLastPage = currentDataLength < size; 

  const handlePageChange = (newPage) => {
    if (newPage > 0) {
      // ✅ Call setFilters with the filter object, as App.jsx's onFiltersChange 
      // expects a new filter state object, not a state-updater function.
      setFilters({ pageNumber: newPage });
    }
  };

  // Use the safe `currentPage` and `size` variables
  // Check if currentDataLength is positive before calculating start/end
  const startItem = currentDataLength > 0 ? (currentPage - 1) * size + 1 : 0;
  const endItem = startItem + currentDataLength - 1;
  
  // We cannot display total pages, so we show the current range and an indicator for the next page
  const totalDisplay = isLastPage 
    ? "End of results" 
    : `Page ${currentPage}`;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md border border-gray-100 my-4">
      <div className="text-sm text-gray-600 mb-2 sm:mb-0">
        {currentDataLength > 0 ? (
          <>
            Showing results{" "}
            <span className="font-semibold text-gray-900">{String(startItem)}</span> to{" "}
            <span className="font-semibold text-gray-900">{String(endItem)}</span>
          </>
        ) : (
          "No results found on this page."
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          // Disable if pageNumber is 1
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="sr-only">Previous Page</span>
        </button>
        <div className="text-sm font-medium text-gray-700">
            <span className="font-bold">{totalDisplay}</span>
        </div>
        <button
          // Disable if current page fetched less than pageSize (50)
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isLastPage}
          className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out shadow-sm"
        >
          <ChevronRight className="w-5 h-5" />
          <span className="sr-only">Next Page</span>
        </button>
      </div>
    </div>
  );
};

// --- Lab Analysis Table Component ---
const LabAnalysisTable = ({ data }) => {
  return (
    // Add overflow-x-auto to the container to enable horizontal scrolling
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 overflow-x-auto">
      <div className="min-w-full">
        {/* Header Row for larger screens - adapted to 6 columns */}
        <div className="hidden lg:grid grid-cols-[100px_2fr_1fr_2fr_1fr_1.5fr] gap-4 py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
          <div className="col-span-1">Reg. Date</div>
          {/* Combine RegNo and SubRegNo into a wider column */}
          <div className="col-span-1">Reg. No. / Sub. Reg. No.</div>
          <div className="col-span-1">Lab</div>
          <div className="col-span-1">Parameter</div>
          {/* Updated columns based on response data */}
          <div className="col-span-1">Mail Date</div>
          <div className="col-span-1">Review Status</div>
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-gray-100">
          {data.map((item, index) => {
            const regDate = new Date(item.regDate).toLocaleDateString();
            const regNo = item.regNo || "-";
            const subRegNo = item.subRegNo || "";
            const labName = item.labName || "-";
            const parameter = item.parameter || "-";
            const mailDate = item.mailDate ? new Date(item.mailDate).toLocaleDateString() : "-";
            const statusBadge = getStatusBadge(item);

            return (
              <div
                key={regNo + index} // Use RegNo and index as key
                className="py-5 px-6 hover:bg-gray-50 transition-colors duration-200"
              >
                {/* Card layout for small and medium screens (lg:hidden) */}
                <div className="lg:hidden grid grid-cols-1 gap-6 p-6 mb-4 rounded-2xl shadow-lg bg-white border border-gray-100">
                  {/* Header Section: Reg. No and Reg. Date */}
                  <div className="flex items-center justify-between border-b pb-4 border-gray-200">
                    <h3 className="text-xl font-extrabold text-gray-900 line-clamp-2">
                        {regNo}
                    </h3>
                    <span className="text-sm font-medium text-gray-500 flex-shrink-0 ml-4">
                      {regDate}
                    </span>
                  </div>
                  
                  {/* Sub Reg No */}
                  {subRegNo && (
                    <div className="text-sm font-medium text-gray-700 break-words">
                        <span className="font-semibold text-gray-500">Sub Reg. No:</span> {subRegNo}
                    </div>
                  )}

                  {/* Key Metrics Section: Lab and Parameter */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-start p-4 bg-blue-50 rounded-lg">
                      <span className="text-xs font-semibold uppercase text-blue-700">
                        Lab
                      </span>
                      <p className="mt-1 text-base font-bold text-blue-800 line-clamp-2">
                        {labName}
                      </p>
                    </div>
                    <div className="flex flex-col items-start p-4 bg-teal-50 rounded-lg">
                      <span className="text-xs font-semibold uppercase text-teal-700">
                        Parameter
                      </span>
                      <p className="mt-1 text-base font-bold text-teal-800 line-clamp-2">
                        {parameter}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        Review Status
                      </span>
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${statusBadge.badgeColor}`}
                      >
                        {statusBadge.icon}
                        {statusBadge.text}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">
                          Mail Date
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {mailDate}
                        </span>
                    </div>
                  </div>
                </div>

                {/* Grid layout for large screens (hidden lg:grid) */}
                {/* Use grid-cols-[...] for fixed/flexible widths and allow text wrapping */}
                <div className="hidden lg:grid grid-cols-[100px_2fr_1fr_2fr_1fr_1.5fr] gap-4 items-center min-w-[900px]">
                  <div className="col-span-1 text-sm text-gray-700 whitespace-nowrap">
                    {regDate}
                  </div>
                  {/* RegNo and SubRegNo in the wide column */}
                  <div className="col-span-1 text-xs font-semibold text-gray-900 break-words pr-2">
                    <p className="font-bold">{regNo}</p>
                    <p className="text-gray-500 text-[11px]">{subRegNo}</p>
                  </div>
                  <div className="col-span-1 text-sm text-gray-700 break-words">
                    {labName}
                  </div>
                  <div className="col-span-1 text-sm text-gray-700 break-words">
                    {parameter}
                  </div>
                  {/* Mail Date */}
                  <div className="col-span-1 text-sm text-gray-700 font-medium break-words">
                    {mailDate}
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.badgeColor}`}
                    >
                      {statusBadge.icon}
                      {statusBadge.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Lab Summary Card Component (based on KpiCard2 structure) ---
const LabSummaryKpiCard = ({ summaryData }) => {
    // The summaryData is the user's 'my data' array
    const items = summaryData || [];
    const scrollRef = useRef(null);

    // Basic icons for the lab summary metrics (using lucide-react)
    const IconMapping = {
        registrations: <ClipboardList className="w-4 h-4" />,
        parameters: <Activity className="w-4 h-4" />,
        pending: <Clock2 className="w-4 h-4" />,
        mailReviewed: <Mail className="w-4 h-4" />,
        qaReviewed: <FlaskConical className="w-4 h-4" />,
        hodReviewed: <UserCheck className="w-4 h-4" />,
    };

    if (!items.length) return null;

    // A fixed color for the border-top of the lab cards
    const cardBorderColor = "#0384fcff"; // Orange shade (similar to KpiCard2's vertical color)

    return (
        <div className="relative flex rounded-2xl shadow-2xl bg-white border border-gray-100/50 group mb-12">
            {/* Sidebar with vertical text */}
            <div
                className={`flex items-center justify-center p-4 rounded-l-2xl bg-linear-to-b from-cyan-700 via-blue-500 to-indigo-600`}
                style={{ writingMode: "vertical-rl" }}
            >
                <h3 className="font-semibold text-m text-white" style={{transform: "rotate(180deg)"}}>Lab Summary</h3>
            </div>

            {/* Main content area */}
            <div className="flex-grow-1 min-w-0 bg-white rounded-r-2xl">
                {/* Scroll container with padding */}
                <div
                    ref={scrollRef}
                    className="overflow-x-auto overflow-y-hidden scroll-smooth px-6 py-4"
                    style={{ WebkitOverflowScrolling: "touch" }}
                >
                    {/* Flex wrapper for the cards */}
                    <div className="flex flex-nowrap gap-4" role="list">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className="relative flex-shrink-0 min-w-[200px] max-w-[200px] h-auto p-4 rounded-xl border border-gray-200
                                    shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out
                                    transform hover:-translate-y-0.5 bg-white flex flex-col justify-between
                                    border-t-4"
                                style={{
                                    borderColor: cardBorderColor,
                                }}
                                role="listitem"
                                tabIndex={0}
                            >
                                {/* Card Title */}
                                <div className="flex items-center mb-3 border-b pb-2 border-gray-100">
                                    <h3 className="font-bold text-gray-900 line-clamp-2 text-md">
                                        {item.labName ?? "N/A"}
                                    </h3>
                                </div>

                                {/* Details Section */}
                                <div className="space-y-2 text-xs text-gray-700">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                                            <span className="text-indigo-500">
                                                {IconMapping.registrations}
                                            </span>
                                            <span>Registrations</span>
                                        </span>
                                        <span className="font-bold text-lg text-indigo-700">
                                            {formatAmount(item.totalRegistrations ?? 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <span className="text-green-500">
                                                {IconMapping.parameters}
                                            </span>
                                            <span>Parameters</span>
                                        </span>
                                        <span className="font-semibold text-green-700">
                                            {formatAmount(item.totalParameters ?? 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <span className="text-gray-400">
                                                {IconMapping.pending}
                                            </span>
                                            <span>Pending</span>
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            {formatAmount((item.totalParameters - item.totalHodReviewed - item.totalMailReviewed - item.totalQaReviewed) ?? 0)}
                                        </span>
                                    </div>
                                </div>

                                {/* Review Status - Separated for clarity */}
                                <div className="mt-4 pt-2 border-t border-gray-200 space-y-2 text-xs text-gray-600">
                                    <h4 className='text-sm font-bold text-gray-500 mb-1'>Reviewed By</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <span className="text-yellow-500">
                                                {IconMapping.mailReviewed}
                                            </span>
                                            <span>Mail</span>
                                        </span>
                                        <span className="font-semibold text-yellow-600">
                                            {formatAmount(item.totalMailReviewed ?? 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <span className="text-blue-500">
                                                {IconMapping.qaReviewed}
                                            </span>
                                            <span>QA</span>
                                        </span>
                                        <span className="font-semibold text-blue-600">
                                            {formatAmount(item.totalQaReviewed ?? 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <span className="text-teal-500">
                                                {IconMapping.hodReviewed}
                                            </span>
                                            <span>HO</span>
                                        </span>
                                        <span className="font-semibold text-teal-600">
                                            {formatAmount(item.totalHodReviewed ?? 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function LabAnalysis({
  data = [],
  labSummaryData = [],
  filters,
  setFilters,
  // We infer the loading state from the absence of data, but it's cleaner to get it from App.jsx's totalLoading state.
  // We'll update this component to receive a `loading` prop for a cleaner approach.
}) {
    
    // Instead of local state/cache, we'll derive fetching status from the props
    // A fetch is considered *in progress* if both data arrays are empty,
    // AND the App component's loading state is true (which is not passed, but let's assume it should be).
    // Given the current structure, we have to rely on the data props.
    // If the data is empty on initial load/fetch, we'll see the "No data found" message quickly.
    
    // For now, we'll define a simple isFetching based on prop values, assuming App.jsx handles the primary loading indicator.
    // If you need a more explicit loader here for *just* the LabAnalysis content, you should pass a 'loading' prop from App.jsx.
    // Since we are removing the internal caching/fetching state, we'll rely on the parent's global loader for now.
    // The "No data found" check should be sufficient.
    
    const finalSummary = labSummaryData;
    const finalData = data;
    
    // The 'loading' state is now an issue because we removed the internal logic.
    // I will *temporarily* re-add a simple loading check that *assumes* the parent
    // passed in `null` or `[]` during a fetch, but for a real-world app, you should
    // pass `loading` from `App.jsx`.
    // Let's create a *mock* loading state based on the current data state.
    const isFetching = finalData.length === 0 && finalSummary.length === 0 && filters.pageNumber === 1;

  // --- Summary Logic (Unchanged) ---
  const aggregateSummary = useMemo(() => {
    
    const totalParameters = finalSummary.reduce(
      (sum, item) => sum + (item.totalParameters || 0),
      0
    );
    const byHod = finalSummary.reduce(
      (sum, item) => sum + (item.totalHodReviewed || 0),
      0
    );
    const byQa = finalSummary.reduce(
      (sum, item) => sum + (item.totalQaReviewed || 0),
      0
    );
    const byMail = finalSummary.reduce(
      (sum, item) => sum + (item.totalMailReviewed || 0),
      0
    );

    const totalPending = totalParameters - (byHod + byMail + byQa);

    return {
      totalPending: totalPending, 
      totalQuantity: totalParameters,
      byHod,
      byQa,
      byMail
    };
  }, [finalSummary]);

  const finalKpiSummary =
    finalSummary.length > 0
      ? aggregateSummary
      : { totalPending: 0, totalQuantity: 0, byHod: 0, byQa: 0, byMail: 0 };
      
  const showPagination = filters && setFilters; 

  if (finalData.length === 0 && finalSummary.length === 0 && !isFetching) {
    return (
      <div className="text-center text-gray-600 py-20 text-xl font-medium rounded-2xl bg-white shadow-xl">
        <span className="mr-2">❌</span> No lab analysis data found for the selected filters.
      </div>
    );
  }

  return (
    <div>
      {/* Lab Summary Card - uses labSummaryData prop directly */}
      <LabSummaryKpiCard summaryData={finalSummary} />
      <div className="bg-gray-50 p-8 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
            Lab Analysis Report
            <span className="block text-lg font-medium text-gray-500 mt-1">
              Summary and Detailed Log
            </span>
          </h2>
        </div>
        
        {/* Loader check - use the one in App.jsx or pass a 'loading' prop */}
        {/* Using a placeholder loader check here based on filters to avoid passing new props */}
        {finalData.length === 0 && finalSummary.length === 0 && filters.pageNumber !== 1 ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
            <p className="ml-3 text-lg text-gray-600">Loading analysis data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              <LabAnalysisSummaryCard
                title="Parameters"
                value={formatAmount(finalKpiSummary.totalQuantity)}
                color="teal"
                icon={<Activity className="w-5 h-5" />}
              />

              <LabAnalysisSummaryCard
                title="Pending"
                value={formatAmount(finalKpiSummary.totalPending) || 0}
                color="red"
                icon={<Clock2 className="w-5 h-5" />}
              />

              {/* Verified by HO Card */}
              <LabAnalysisSummaryCard
                title="Reviewed by HOD"
                value={formatAmount(finalKpiSummary.byHod)}
                color="green"
                icon={<CheckCircle2 className="w-5 h-5" />}
              />

              {/* Verified by QA Card */}
              <LabAnalysisSummaryCard
                title="Reviewed by QA"
                value={formatAmount(finalKpiSummary.byQa)}
                color="blue"
                icon={<FlaskConical className="w-5 h-5" />}
              />

              {/* Verified by Email Card */}
              <LabAnalysisSummaryCard
                title="Reviewed by Email"
                value={formatAmount(finalKpiSummary.byMail)}
                color="yellow"
                icon={<Mail className="w-5 h-5" />}
              />
            </div>

            {/* --- Pagination TOP --- */}
            {showPagination && (
              <PaginationControls
                pageNumber={filters.pageNumber}
                pageSize={filters.pageSize}
                currentDataLength={finalData.length}
                setFilters={setFilters}
              />
            )}

            {/* 3. Main Content: Table */}
            {finalData.length > 0 && <LabAnalysisTable data={finalData} />}

            {/* Only show this if summary is loaded but table data is empty (e.g., last page) */}
            {finalData.length === 0 && finalSummary.length > 0 && (
              <div className="text-center text-gray-600 py-10 text-xl font-medium rounded-2xl bg-white shadow-xl border border-gray-200">
                Detailed log (table) is unavailable for this page or filter
                combination.
              </div>
            )}

            {/* --- Pagination BOTTOM --- */}
            {showPagination && (
              <PaginationControls
                pageNumber={filters.pageNumber}
                pageSize={filters.pageSize}
                currentDataLength={finalData.length}
                setFilters={setFilters}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}