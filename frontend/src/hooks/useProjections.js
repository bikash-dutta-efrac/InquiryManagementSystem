import { useEffect, useState } from "react";
import { getProjections } from "../services/api.js";

export default function useProjections(filters) {
  const [projections, setProjections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filters || Object.keys(filters).length === 0) {
      setProjections([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        const data = await getProjections(filters);
        if (isMounted) {
          setProjections(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("❌ Failed to fetch projections:", err);
          setProjections([]);
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
    projections,
    loading,
    setProjections,
  };
}