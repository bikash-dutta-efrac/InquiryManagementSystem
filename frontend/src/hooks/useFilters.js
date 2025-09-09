import { useEffect, useState, useCallback } from "react";
import { getInquiries, getBDNames, getClientNames } from "../services/api.js";

export default function useInquiries(defaultFilters) {
  const [inquiries, setInquiries] = useState([]);
  const [bdNames, setBdNames] = useState([]);
  const [clientNames, setClientNames] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch inquiries with applied filters
  const fetchInquiries = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getInquiries(filters);

      // Default sort by inqDate descending
      const sorted = [...data].sort(
        (a, b) => new Date(b.inqDate) - new Date(a.inqDate)
      );

      setInquiries(sorted);
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch BD names (based on current date filter)
  const fetchBDNames = useCallback(async (filters = {}) => {
    try {
      const data = await getBDNames(filters);
      setBdNames(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch BD Names:", err);
      setBdNames([]);
    }
  }, []);

  // Fetch Client names (depends on BD selection + date filter)
  const fetchClientNames = useCallback(async (filters = {}) => {
    try {
      const data = await getClientNames(filters);
      setClientNames(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch Client Names:", err);
      setClientNames([]);
    }
  }, []);

  // Initial fetch with defaults
  useEffect(() => {
    if (defaultFilters) {
      const filters = {
        fromDate: defaultFilters.range?.start || null,
        toDate: defaultFilters.range?.end || null,
        month: defaultFilters.month || null,
        year: defaultFilters.year || null,
        bdNames: defaultFilters.bdNames || [],
        clientNames: defaultFilters.clientNames || [],
        dateField: defaultFilters.dateField || "inqDate",
      };

      fetchInquiries(filters);
      fetchBDNames(filters);
      fetchClientNames(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    inquiries,
    bdNames,
    clientNames,
    loading,
    fetchInquiries,
    fetchBDNames,
    fetchClientNames,
    setInquiries,
  };
}

