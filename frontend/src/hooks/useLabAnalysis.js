import { useEffect, useState } from "react";
import { getLabSummary, getLabParameters } from "../services/api.js";

export default function useLabAnalysis(filters) {
  const [labParameters, setLabParameters] = useState([]);
  const [labSummaryData, setLabSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0); 

    //console.log("in useLab hooks", filters)

  useEffect(() => {
    const isFilterSet = filters && Object.keys(filters).length > 0;
    
    // Check for essential filters like fromDate/toDate being present
    // We assume App.jsx sets a default range when view switches to 'labAnalysis'.
    const hasDateFilters = (filters?.fromDate && filters?.toDate) || (filters?.month && filters?.year); 

    if (!isFilterSet || !hasDateFilters) {
      setLabParameters([]);
      setLabSummaryData([]);
      setTotalCount(0); 
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        // Fetch both the detailed data and the summary data concurrently
        const [parametersResponse, summaryResponse] = await Promise.all([
          getLabParameters(filters), // For the detailed table (paginated data)
          getLabSummary(filters),   // For the horizontal KPI summary cards (aggregate data)
        ]);

        if (isMounted) {
          
          // 🟢 CRITICAL FIX: Safely extract data array from API response
          const detailedData = parametersResponse?.data || parametersResponse;
          const summaryData = summaryResponse?.data || summaryResponse; // <--- This extracts the summary data
          
          // Safely determine total count from the parameters endpoint
          const count = parametersResponse?.totalCount ?? (Array.isArray(detailedData) ? detailedData.length : 0);
          
          setLabParameters(Array.isArray(detailedData) ? detailedData : []);
          setLabSummaryData(Array.isArray(summaryData) ? summaryData : []); // <--- Update state with extracted data
          setTotalCount(count); 
        }
      } catch (err) {
        if (isMounted) {
          console.error("❌ Failed to fetch lab analysis data:", err);
          setLabParameters([]);
          setLabSummaryData([]);
          setTotalCount(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  return {
    labParameters,
    labAnalysis: labSummaryData,
    loading,
    totalCount, 
  };
}