// import React, { useState, useEffect, Suspense } from "react";
// import Filters from "./components/Filters";
// import InquiryList from "./components/InquiryList";
// import InquiryOverview from "./components/InquiryOverview";
// import SideMenus from "./components/SideMenus";
// const GraphicalAnalysis = React.lazy(() =>
//   import("./components/GraphicalAnalysis")
// );
// import SubInquiryList from "./components/SubInquiryList";
// import { BarChart3, List } from "lucide-react";
// import useFilters from "./hooks/useFilters";

// export default function App() {
//   const [view, setView] = useState("list");
//   const [subView, setSubView] = useState(null);
//   const [queryType, setQueryType] = useState("inqDate");
//   const [showGraph, setShowGraph] = useState(false);

//   const today = new Date();
//   const minDate = new Date();
//   minDate.setFullYear(today.getFullYear() - 20);

//   const defaultFilters = {
//     filterType: "range",
//     range: {
//       start: today.toISOString().split("T")[0],
//       end: today.toISOString().split("T")[0],
//     },
//     month: (today.getMonth() + 1).toString(),
//     year: today.getFullYear().toString(),
//     verticals: [],
//     bdNames: [],
//     clientNames: [],
//     excludeVerticals: false,
//     excludeBDs: false,
//     excludeClients: false,
//     sortOrder: "newest",
//     dateField: "inqDate",
//   };

//   const { inquiries, loading, fetchInquiries, setInquiries } =
//     useFilters(defaultFilters);

//   useEffect(() => {
//     fetchInquiries({
//       fromDate: defaultFilters.range.start,
//       toDate: defaultFilters.range.end,
//       dateField: queryType,
//     });
//   }, [queryType]);

//   useEffect(() => {
//     if (view === "graph") {
//       const timer = setTimeout(() => setShowGraph(true), 200);
//       return () => clearTimeout(timer);
//     } else {
//       setShowGraph(false);
//     }
//   }, [view]);

//   const onFiltersChange = ({
//     filterType,
//     range,
//     month,
//     year,
//     verticals,
//     bdNames,
//     clientNames,
//     excludeVerticals,
//     excludeBds,
//     excludeClients,
//     sortOrder,
//   }) => {
//     let filters = {};
//     filters.dateField = queryType;
//     if (filterType === "range" && range?.start && range?.end) {
//       const startDate = new Date(range.start);
//       const endDate = new Date(range.end);
//       if (
//         startDate >= minDate &&
//         startDate <= today &&
//         endDate >= minDate &&
//         endDate <= today &&
//         startDate <= endDate
//       ) {
//         filters.fromDate = range.start;
//         filters.toDate = range.end;
//       } else {
//         console.warn("⛔ Invalid date range, skipping fetch");
//         return;
//       }
//     } else if (filterType === "month" && year) {
//       filters.year = Number(year);
//       if (month) filters.month = Number(month);
//     }
//     if (bdNames?.length) filters.bdNames = bdNames;
//     if (clientNames?.length) filters.clientNames = clientNames;
//     if (verticals?.length) filters.verticals = verticals;
//     filters.excludeVerticals = excludeVerticals;
//     filters.excludeBds = excludeBds;
//     filters.excludeClients = excludeClients;
//     fetchInquiries(filters).then(() => {
//       if (sortOrder) {
//         setInquiries((prev) =>
//           [...prev].sort((a, b) =>
//             sortOrder === "newest"
//               ? new Date(b[queryType]) - new Date(a[queryType])
//               : new Date(a[queryType]) - new Date(b[queryType])
//           )
//         );
//       }
//     });
//   };

//   const handleResetAll = () =>
//     fetchInquiries({
//       fromDate: defaultFilters.range.start,
//       toDate: defaultFilters.range.end,
//       dateField: queryType,
//     });

//   const handleCardClick = (type) => setSubView(type);
//   const handleBack = () => setSubView(null);

//   const filterSubData = () => {
//     switch (subView) {
//       case "inquiries":
//         return { title: "All Inquiries", data: inquiries };
//       case "quotations":
//         return {
//           title: "All Quotations",
//           data: inquiries.filter((d) => d.quotNo),
//         };
//       case "approved":
//         return {
//           title: "Approved Quotations",
//           data: inquiries.filter((d) => d.quotNo && d.regisNo),
//         };
//       case "unapproved":
//         return {
//           title: "Unapproved Quotations",
//           data: inquiries.filter((d) => d.quotNo && !d.regisNo),
//         };
//       case "registrations":
//         return {
//           title: "All Registrations",
//           data: inquiries.filter((d) => d.regisNo),
//         };
//       default:
//         return { title: "", data: [] };
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       <SideMenus
//         activeView={queryType}
//         onViewChange={(newView) => setQueryType(newView)}
//       />
//       <main className="flex-1 overflow-y-auto">
//         <div className="py-4 px-4">
//           <div className="max-w-6xl mx-auto mb-6">
//             <Filters
//               data={inquiries}
//               onChange={onFiltersChange}
//               onResetAll={handleResetAll}
//               disabled={loading}
//               queryType={queryType}
//             />
//           </div>
//           <div>
//             {loading ? (
//               <div className="flex flex-col items-center justify-center py-20">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 <p className="mt-4 text-gray-700 font-medium">
//                   Loading data...
//                 </p>
//               </div>
//             ) : subView ? (
//               <div className="max-w-7xl mx-auto px-2">
//                 <SubInquiryList
//                   {...filterSubData()}
//                   queryType={subView}
//                   onBack={handleBack}
//                 />
//               </div>
//             ) : (
//               <>
//                 <div className="max-w-7xl mx-auto mb-8 px-2">
//                   <InquiryOverview
//                     data={inquiries}
//                     queryType={queryType}
//                     onCardClick={handleCardClick}
//                   />
//                 </div>

//                 {/* Correctly placed toggle component */}
//                 <div className="flex justify-center my-8">
//                   <div className="relative flex items-center bg-white rounded-full p-2 shadow-2xl transition-all duration-300">
//                     <div
//                       className={`absolute top-1 bottom-1 w-[50%] rounded-full bg-linear-to-r from-blue-500 via-cyan-500 to-teal-500 transition-all duration-500 ease-in-out ${
//                         view === "list" ? "left-[4px]" : "left-[50%]"
//                       }`}
//                     ></div>
//                     <button
//                       onClick={() => setView("list")}
//                       className={`relative flex items-center justify-center gap-2 px-10 py-3 w-1/2 z-10 transition-colors duration-300 ${
//                         view === "list" ? "text-white" : "text-gray-800"
//                       } font-semibold`}
//                     >
//                       <List className="w-5 h-5" />
//                       <span className="hidden sm:inline">List View</span>
//                     </button>
//                     <button
//                       onClick={() => setView("graph")}
//                       className={`relative flex items-center justify-center gap-2 px-10 py-3 w-1/2 z-10 transition-colors duration-300 ${
//                         view === "graph" ? "text-white" : "text-gray-800"
//                       } font-semibold`}
//                     >
//                       <BarChart3 className="w-5 h-5" />
//                       <span className="hidden sm:inline">Graphical View</span>
//                     </button>
//                   </div>
//                 </div>

//                 <div className="max-w-7xl mx-auto px-2">
//                   <div className={view !== "list" ? "hidden" : "block"}>
//                     <InquiryList data={inquiries} queryType={queryType} />
//                   </div>
//                   <div className={view !== "graph" ? "hidden" : "block"}>
//                     <Suspense
//                       fallback={
//                         <div className="flex justify-center py-10">
//                           <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full"></div>
//                         </div>
//                       }
//                     >
//                       <GraphicalAnalysis
//                         data={inquiries}
//                         queryType={queryType}
//                       />
//                     </Suspense>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

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
  const [filters, setFilters] = useState(null);
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
    excludeBDs: false,
    excludeClients: false,
    sortOrder: "newest",
    dateField: "inqDate",
  };

  const { inquiries, loading: inquiriesLoading, fetchInquiries, setInquiries } = useFilters(defaultFilters);
  const { inquiries: projections, loading: projectionsLoading, fetchInquiries: fetchProjections } = useFilters(defaultFilters);

  const safeFetch = async (params, isProjection = false) => {
    try {
      setError(null);
      if (isProjection) {
        await fetchProjections(params);
      } else {
        await fetchInquiries(params);
      }
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      setError("Failed to load data. Please try again.");
    }
  };

  useEffect(() => {
    if (queryType === 'bdProjection') {
      safeFetch({ ...defaultFilters, dateField: 'projDate' }, true);
    } else {
      safeFetch({ ...defaultFilters, dateField: queryType });
    }
  }, [queryType]);

  useEffect(() => {
    if (view === "graph") {
      const timer = setTimeout(() => setShowGraph(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowGraph(false);
    }
  }, [view]);

  const onFiltersChange = async ({
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
    let newFilters = {
      filterType, range, month, year, verticals, bdNames, clientNames, excludeVerticals, excludeBds, excludeClients, sortOrder,
    };
    setFilters(newFilters);

    const dateField = queryType === 'bdProjection' ? 'projDate' : queryType;
    const fetchParams = {
      dateField,
      ...newFilters,
      excludeBDs: newFilters.excludeBds,
    };

    if (queryType === 'bdProjection') {
      safeFetch(fetchParams, true);
    } else {
      await safeFetch(fetchParams);
      if (sortOrder) {
        setInquiries((prev) =>
          [...prev].sort((a, b) =>
            sortOrder === "newest"
              ? new Date(b[queryType]) - new Date(a[queryType])
              : new Date(a[queryType]) - new Date(b[queryType])
          )
        );
      }
    }
  };

  const onDateFieldChange = async (dateField) => {
    setQueryType(dateField);
    const dateFieldToFetch = dateField === 'bdProjection' ? 'projDate' : dateField;
    const filtersToFetch = filters ? { ...filters, dateField: dateFieldToFetch } : { ...defaultFilters, dateField: dateFieldToFetch };
    if (dateField === 'bdProjection') {
      safeFetch(filtersToFetch, true);
    } else {
      safeFetch(filtersToFetch);
    }
  };

  const handleResetAll = () => {
    const defaultFetchFilters = {
      fromDate: defaultFilters.range.start,
      toDate: defaultFilters.range.end,
      dateField: queryType,
    };
    setFilters(null);
    if (queryType === 'bdProjection') {
      safeFetch({ ...defaultFilters, dateField: 'projDate' }, true);
    } else {
      safeFetch(defaultFilters);
    }
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

  const currentLoading = queryType === 'bdProjection' ? projectionsLoading : inquiriesLoading;
  const currentData = queryType === 'bdProjection' ? projections : inquiries;

  return (
    <div className="flex h-screen bg-gray-100">
      <SideMenus activeView={queryType} onViewChange={onDateFieldChange} />

      <main className="flex-1 overflow-y-auto relative">
        {currentLoading && (
          <div className="fixed top-0 right-0 bottom-0 left-60 bg-white/60 flex items-center justify-center z-50">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        {error && !currentLoading && (
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
              data={currentData}
              onChange={onFiltersChange}
              onResetAll={handleResetAll}
              disabled={currentLoading}
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
                  loading={currentLoading}
                />
              </div>
            ) : (
              <>
                <div className="max-w-7xl mx-auto mb-8 px-2 relative">
                  {queryType !== 'bdProjection' && (
                    <InquiryOverview
                      data={inquiries}
                      queryType={queryType}
                      onCardClick={handleCardClick}
                      loading={currentLoading}
                    />
                  )}
                </div>

                <div className="flex justify-center my-8">
                  {queryType !== 'bdProjection' && (
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
                  {queryType === 'bdProjection' ? (
                    <BdProjection inquiries={inquiries} projections={projections} />
                  ) : view === "list" ? (
                    <InquiryList
                      data={inquiries}
                      queryType={queryType}
                      loading={currentLoading}
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