import { useEffect, useState } from "react";
import { getLabSummaries, getSampleSummaries } from "../services/api.js";

export default function useLabAnalysis(filters) {
  const [sampleSummaries, setSampleSummaries] = useState([]);
  const [labSummaries, setLabSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0); 

    //console.log("in useLab hooks", filters)

  useEffect(() => {
    const isFilterSet = filters && Object.keys(filters).length > 0;
    
    // Check for essential filters like fromDate/toDate being present
    // We assume App.jsx sets a default range when view switches to 'labAnalysis'.
    const hasDateFilters = (filters?.fromDate && filters?.toDate) || (filters?.month && filters?.year); 

    if (!isFilterSet || !hasDateFilters) {
      setSampleSummaries([]);
      setLabSummaries([]);
      setTotalCount(0); 
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        // Fetch both the detailed data and the summary data concurrently
        const [sampleSummaryResponse, labSummaryResponse] = await Promise.all([
          getSampleSummaries(filters), // For the detailed table (paginated data)
          getLabSummaries(filters),   // For the horizontal KPI summary cards (aggregate data)
        ]);

        if (isMounted) {
          
          const detailedData = sampleSummaryResponse?.data || sampleSummaryResponse;
          const summaryData = labSummaryResponse?.data || labSummaryResponse;
          
          const count = sampleSummaryResponse?.totalCount ?? (Array.isArray(detailedData) ? detailedData.length : 0);
          
          setSampleSummaries(Array.isArray(detailedData) ? detailedData : []);
          setLabSummaries(Array.isArray(summaryData) ? summaryData : []);
          setTotalCount(count); 
        }
      } catch (err) {
        if (isMounted) {
          console.error("❌ Failed to fetch lab analysis data:", err);
          setSampleSummaries([]);
          setLabSummaries([]);
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
    sampleSummaries,
    labSummaries,
    loading,
    totalCount,
  };
}