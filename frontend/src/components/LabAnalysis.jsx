import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  FlaskConical,
  DollarSign,
  CheckCircle2,
  XCircle,
  Mail,
  List,
  Activity, // Used for Total Parameters
  UserCheck, // Used for Verified by HOD/QA/Mail
  ClipboardList, // Used for Registrations/Sub-Registrations
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Utility function copied from BdProjection.jsx for consistent number formatting
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

// Reusable card component based on the BdProjection design
const LabAnalysisSummaryCard = ({ title, value, color, icon }) => {
  const borderColor = `border-t-4 border-${color}-500`;
  const bgColor = `bg-${color}-100`;
  const iconColor = `text-${color}-600`;

  return (
    <div
      className={`bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 ${borderColor}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold uppercase text-gray-500">
          {title}
        </span>
        <div className={`p-2 rounded-full ${bgColor} ${iconColor}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

// Helper function to extract and format review status
const getStatusBadge = (item) => {
    // Check review flags in the order HOD > QA > Mail
    const hodReview = item.hodReview?.toUpperCase() === 'Y';
    const qaReview = item.qaReview?.toUpperCase() === 'Y';
    const mailDate = item.mailDate; // Assuming presence of mailDate means 'Verified by Mail'

    if (hodReview) {
        return {
            text: "Verified by HOD",
            badgeColor: "bg-green-100 text-green-700",
            icon: <CheckCircle2 className="w-4 h-4" />,
        };
    }
    if (qaReview) {
        return {
            text: "Verified by QA",
            badgeColor: "bg-blue-100 text-blue-700",
            icon: <FlaskConical className="w-4 h-4" />,
        };
    }
    if (mailDate) { // If mailDate is present, assume verified by mail
        return {
            text: "Verified by Mail",
            badgeColor: "bg-yellow-100 text-yellow-700",
            icon: <Mail className="w-4 h-4" />,
        };
    }

    return {
        text: "Pending",
        badgeColor: "bg-red-100 text-red-700",
        icon: <XCircle className="w-4 h-4" />,
    };
};

// Function to format the date string to be more readable
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        // Only take the date part if it includes time (e.g., "YYYY-MM-DDT00:00:00")
        return dateString.split('T')[0];
    } catch (e) {
        return dateString; // Fallback
    }
}


// --- Pagination Component ---
const PaginationControls = ({
  pageNumber,
  pageSize,
  totalCount,
  setFilters,
}) => {
  // 泙 FIX: Use Math.max(1, ...) to ensure totalPages is 1 if totalCount is 0, preventing NaN
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount > 0 ? (pageNumber - 1) * pageSize + 1 : 0;
  const endItem = Math.min(pageNumber * pageSize, totalCount);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setFilters((prev) => ({ ...prev, pageNumber: newPage }));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md border border-gray-100 my-4">
      <div className="text-sm text-gray-600 mb-2 sm:mb-0">
        {totalCount > 0 ? (
          <>
            Showing{" "}
            <span className="font-semibold text-gray-900">{startItem}</span> to{" "}
            <span className="font-semibold text-gray-900">{endItem}</span> of{" "}
            <span className="font-semibold text-gray-900">
              {formatAmount(totalCount)}
            </span>{" "}
            results
          </>
        ) : (
          "No results found"
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          // 泙 FIX: Disable if pageNumber is 1 OR if totalCount is 0
          onClick={() => handlePageChange(pageNumber - 1)}
          disabled={pageNumber === 1 || totalCount === 0}
          className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-sm font-medium text-gray-700">
          Page <span className="font-bold">{pageNumber}</span> of{" "}
          <span className="font-bold">{totalPages}</span>
        </div>
        <button
          // 泙 FIX: Disable if pageNumber is the last page OR if totalCount is 0
          onClick={() => handlePageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages || totalCount === 0}
          className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out shadow-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// --- Lab Analysis Table Component ---
const LabAnalysisTable = ({ data }) => {
  return (
    // 🔴 FIX: Add overflow-x-auto to the container to enable horizontal scrolling
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 overflow-x-auto">
      <div className="min-w-full">
        {/* Header Row for larger screens - adapted to 6 columns */}
        <div className="hidden lg:grid grid-cols-[120px_2fr_1fr_1.5fr_1fr_1fr] gap-4 py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
          <div className="col-span-1">Reg. Date</div>
          {/* 🔴 FIX: Combine RegNo and SubRegNo into a wider column */}
          <div className="col-span-1">Reg. No. / Sub. Reg. No.</div>
          <div className="col-span-1">Lab</div>
          <div className="col-span-1">Parameter</div>
          {/* 🔴 FIX: Updated columns based on response data */}
          <div className="col-span-1">Mail Date</div>
          <div className="col-span-1">Review Status</div>
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-gray-100">
          {data.map((item, index) => {
            // 🔴 FIX: Use exact keys from the response object
            const regDate = formatDate(item.regDate);
            const regNo = item.regNo || "N/A";
            const subRegNo = item.subRegNo || ""; // subRegNo can be empty
            const labName = item.labName || "N/A";
            const parameter = item.parameter || "N/A";
            const mailDate = formatDate(item.mailDate);
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
                {/* 🔴 FIX: Use grid-cols-[...] for fixed/flexible widths and allow text wrapping */}
                <div className="hidden lg:grid grid-cols-[120px_2fr_1fr_1.5fr_1fr_1fr] gap-4 items-center min-w-[900px]">
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
        subRegistrations: <List className="w-4 h-4" />,
        parameters: <Activity className="w-4 h-4" />,
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
                                    <h3 className="font-extrabold text-gray-900 line-clamp-2 text-md">
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
                                            <span className="text-gray-400">
                                                {IconMapping.subRegistrations}
                                            </span>
                                            <span>Sub-Registrations</span>
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            {formatAmount(item.totalSubRegistrations ?? 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <span className="text-green-500">
                                                {IconMapping.parameters}
                                            </span>
                                            <span>Total Parameters</span>
                                        </span>
                                        <span className="font-semibold text-green-700">
                                            {formatAmount(item.totalParameters ?? 0)}
                                        </span>
                                    </div>
                                </div>

                                {/* Review Status - Separated for clarity */}
                                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                                    <h4 className='text-sm font-bold text-gray-500 mb-1'>Review Counts:</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <span className="text-yellow-500">
                                                {IconMapping.mailReviewed}
                                            </span>
                                            <span>By Mail</span>
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
                                            <span>By QA</span>
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
                                            <span>By HOD</span>
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
  totalCount,
}) {
  console.log(data, labSummaryData);

  // --- Summary Logic for the new Lab Summary Cards (using labSummaryData) ---
  // Calculate overall totals from the aggregate data for the fixed cards
  const aggregateSummary = useMemo(() => {
    // Summing up all relevant metrics from the aggregate data
    const totalRegistrations = labSummaryData.reduce(
      (sum, item) => sum + (item.totalRegistrations || 0),
      0
    );
    const totalParameters = labSummaryData.reduce(
      (sum, item) => sum + (item.totalParameters || 0),
      0
    );
    const verifiedHo = labSummaryData.reduce(
      (sum, item) => sum + (item.totalHodReviewed || 0),
      0
    );
    const byQa = labSummaryData.reduce(
      (sum, item) => sum + (item.totalQaReviewed || 0),
      0
    );

    return {
      totalAnalyses: totalRegistrations, // Using Total Registrations for Total Analyses KPI
      totalQuantity: totalParameters,
      verifiedHo,
      byQa,
    };
  }, [labSummaryData]);

  const finalSummary =
    labSummaryData.length > 0
      ? aggregateSummary
      : { totalAnalyses: 0, totalQuantity: 0, verifiedHo: 0, byQa: 0 };

  if (data.length === 0 && labSummaryData.length === 0) {
    return (
      <div className="text-center text-gray-600 py-20 text-xl font-medium rounded-2xl bg-white shadow-xl">
        {/* 🔴 FIX: Added a space to the emoji */}
        <span className="mr-2">❌</span> No lab analysis data found for the selected filters.
      </div>
    );
  }

  // Extract pagination values
  const { pageNumber, pageSize } = filters || {}; // Handle case where filters is null/undefined

  // 泙 Use totalCount from props to determine pagination visibility
  const showPagination = totalCount > 0 && filters && setFilters; // Ensure filters and setter are available

  return (
    <div>
      <LabSummaryKpiCard summaryData={labSummaryData} />
      <div className="bg-gray-50 p-8 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
            Lab Analysis Report
            <span className="block text-lg font-medium text-gray-500 mt-1">
              Summary and Detailed Log
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Analyses Card (using Registrations) */}
          <LabAnalysisSummaryCard
            title="Total Analyses"
            value={formatAmount(finalSummary.totalAnalyses)}
            color="blue"
            icon={<FlaskConical className="w-6 h-6" />}
          />

          {/* Total Parameters/Quantity Card */}
          <LabAnalysisSummaryCard
            title="Total Parameters"
            value={formatAmount(finalSummary.totalQuantity)}
            color="teal"
            icon={<Activity className="w-6 h-6" />}
          />

          {/* Verified by HO Card */}
          <LabAnalysisSummaryCard
            title="Verified by HOD"
            value={formatAmount(finalSummary.verifiedHo)}
            color="green"
            icon={<CheckCircle2 className="w-6 h-6" />}
          />

          {/* Verified by QA Card */}
          <LabAnalysisSummaryCard
            title="Verified by QA"
            value={formatAmount(finalSummary.byQa)}
            color="red"
            icon={<FlaskConical className="w-6 h-6" />}
          />
        </div>

        {/* --- Pagination TOP --- */}
        {showPagination && (
          <PaginationControls
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalCount={totalCount}
            setFilters={setFilters}
          />
        )}

        {/* 3. Main Content: Table */}
        {data.length > 0 && <LabAnalysisTable data={data} />}

        {data.length === 0 && labSummaryData.length > 0 && (
          <div className="text-center text-gray-600 py-10 text-xl font-medium rounded-2xl bg-white shadow-xl border border-gray-200">
            Detailed log (table) is unavailable for this page or filter
            combination.
          </div>
        )}

        {/* --- Pagination BOTTOM --- */}
        {showPagination && (
          <PaginationControls
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalCount={totalCount}
            setFilters={setFilters}
          />
        )}
      </div>
    </div>
  );
}