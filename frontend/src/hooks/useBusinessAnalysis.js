import { useState, useEffect, useCallback, useMemo } from 'react';
import { getBdBusinessSummary, getMtoMBusinessComparison } from '../services/api';

const useBusinessAnalysis = (filters = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoize API payload to avoid unnecessary re-fetches
  const apiFilters = useMemo(() => {
    // Determine the API to use based on the mode
    const isComparisonMode = filters.timeRangeType === 'comparison';

    if (isComparisonMode) {
        return {
            timeRangeType: 'comparison',
            fromDate1: filters.fromDate1 || null,
            toDate1: filters.toDate1 || null,
            fromDate2: filters.fromDate2 || null,
            toDate2: filters.toDate2 || null,
        };
    }
    
    // For 'relative' or 'month' mode
    const isMultiMonth = filters.fromDate !== filters.toDate; 

    return {
      timeRangeType: filters.timeRangeType,
      fromDate: filters.fromDate || null,
      toDate: filters.toDate || null,
      breakdownType: isMultiMonth ? 'monthly' : 'summary',
      dateField: 'inqDate',
    };
  }, [
      filters.timeRangeType, 
      filters.fromDate, 
      filters.toDate,
      filters.fromDate1, 
      filters.toDate1, 
      filters.fromDate2, 
      filters.toDate2
  ]);

  const fetchData = useCallback(async () => {
    const isComparisonMode = apiFilters.timeRangeType === 'comparison';

    if (
        (isComparisonMode && (!apiFilters.fromDate1 || !apiFilters.toDate1 || !apiFilters.fromDate2 || !apiFilters.toDate2)) ||
        (!isComparisonMode && (!apiFilters.fromDate || !apiFilters.toDate))
    ) {
      console.warn("Skipping API call: missing valid from/to date for current mode.");
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log('📄 Fetching BD summary with filters:', apiFilters);

    try {
      let result;
      if (isComparisonMode) {
          // Comparison API call using the four dates
          const { timeRangeType, ...comparisonDates } = apiFilters;
          result = await getMtoMBusinessComparison(comparisonDates);
      } else {
          // Existing summary API call
          const { timeRangeType, ...summaryFilters } = apiFilters;
          result = await getBdBusinessSummary(summaryFilters); 
      }
      
      // Ensure data is always an array
      setData(Array.isArray(result) ? result : (result ? [result] : [])); 
      
      console.log('✅ Data fetched successfully. Mode:', apiFilters.timeRangeType);
    } catch (err) {
      console.error('❌ Error fetching business analysis summary data:', err);
      setError(new Error(err.message || 'Failed to fetch data from API.'));
    } finally {
      setIsLoading(false);
    }
  }, [apiFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error };
};

export default useBusinessAnalysis;