import { useEffect, useState, useCallback } from "react";
import { getInquiries, getBdNames, getClientNames } from "../services/api.js";

export default function useFilters(defaultFilters) {
  const [inquiries, setInquiries] = useState([]);
  const [bdNames, setBdNames] = useState([]);
  const [clientNames, setClientNames] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch inquiries
  const fetchData = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      let data = await getInquiries(filters);

      // Default sort for inquiries
      if (filters.dateField === "inqDate") {
        data = [...data].sort(
          (a, b) => new Date(b.inqDate) - new Date(a.inqDate)
        );
      }

      setInquiries(data);
    } catch (err) {
      console.error("❌ Failed to fetch inquiries:", err);
      setInquiries([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBdNames = useCallback(async (filters = {}) => {
    try {
      const data = await getBdNames(filters);
      setBdNames(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to fetch BD Names:", err);
      setBdNames([]);
    }
  }, []);

  // Fetch Client names
  const fetchClientNames = useCallback(async (filters = {}) => {
    try {
      const data = await getClientNames(filters);
      setClientNames(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to fetch Client Names:", err);
      setClientNames([]);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (defaultFilters) {
      const filters = {
        fromDate: defaultFilters.range?.start || null,
        toDate: defaultFilters.range?.end || null,
        month: defaultFilters.month || null,
        year: defaultFilters.year || null,
        dateField: defaultFilters.dateField || "inqDate",
      };

      fetchData(filters);
      fetchBdNames({ ...defaultFilters, dateField: "inqDate" });
      fetchClientNames({ ...defaultFilters, dateField: "inqDate" });
    }
  }, []); // run once on mount

  return {
    inquiries,
    bdNames,
    clientNames,
    loading,
    fetchInquiries: fetchData,
    fetchBdNames,
    fetchClientNames,
    setInquiries,
  };
}
