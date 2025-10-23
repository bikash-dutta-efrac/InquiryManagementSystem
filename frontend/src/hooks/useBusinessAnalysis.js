import { useState, useEffect, useCallback, useMemo } from 'react';
import { getBdBusinessSummary } from '../services/api'; 

const useBusinessAnalysis = (filters = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Memoize API payload to avoid unnecessary re-fetches
  const apiFilters = useMemo(() => ({
    fromDate: filters.fromDate || null,
    toDate: filters.toDate || null,
    bdNames: filters.bdNames || [],
    excludeBds: filters.excludeBds || false,
    dateField: 'inqDate',
  }), [filters.fromDate, filters.toDate, filters.bdNames, filters.excludeBds]);

  const fetchData = useCallback(async () => {
    if (!apiFilters.fromDate || !apiFilters.toDate) {
      console.warn("Skipping API call: missing valid from/to date.");
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log('🔄 Fetching BD summary with filters:', apiFilters);

    try {
      const result = await getBdBusinessSummary(apiFilters);
      setData(result || []);
      console.log('✅ Data fetched successfully:', result);
    } catch (err) {
      console.error('❌ Error fetching business analysis summary data:', err);
      setError(new Error(err.message || 'Failed to fetch data from API.'));
    } finally {
      setIsLoading(false);
    }
  }, [apiFilters]);

  // ✅ Trigger fetch only when filters actually change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};

export default useBusinessAnalysis;
