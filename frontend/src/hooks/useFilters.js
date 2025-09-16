import { useEffect, useState, useCallback } from "react";
import { getInquiries, getProjections, getBDNames, getClientNames } from "../services/api.js";

export default function useFilters(defaultFilters) {
  const [inquiries, setInquiries] = useState([]);
  const [bdNames, setBdNames] = useState([]);
  const [clientNames, setClientNames] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data based on dateField
  const fetchData = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      let data;
      if (filters.dateField === 'projDate') {
        data = await getProjections(filters);
      } else {
        data = await getInquiries(filters);
      }

      // Default sort for inquiries
      if (filters.dateField === 'inqDate') {
        data = [...data].sort((a, b) => new Date(b.inqDate) - new Date(a.inqDate));
      }

      setInquiries(data);
    } catch (err) {
      console.error(`Failed to fetch data for ${filters.dateField}:`, err);
      setInquiries([]);
      throw err; // Propagate error for the caller to handle
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

  // ⭐ IMPORTANT FIX: This useEffect now runs only once on mount.
  // The 'defaultFilters' object passed from App.jsx is recreated on every render,
  // causing the useEffect to re-run and trigger the error.
  // By using an empty dependency array, we ensure the initial fetch logic
  // runs once and avoids the unstable dependency.
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
      fetchBDNames({ ...defaultFilters, dateField: 'inqDate' });
      fetchClientNames({ ...defaultFilters, dateField: 'inqDate' });
    }
  }, []); // Empty dependency array ensures it only runs once

  return {
    inquiries,
    bdNames,
    clientNames,
    loading,
    fetchInquiries: fetchData,
    fetchBDNames,
    fetchClientNames,
    setInquiries,
  };
}