import { useState, useEffect } from "react";
// Assuming api.js is located at "../services/api"
import { getAllBdProjection } from "../services/api"; 

/**
 * Helper function to calculate the ISO date range (fromDate, toDate) 
 * for a given month string (YYYY-MM).
 */
const calculateMonthDateRange = (monthValue) => {
    const [year, month] = monthValue.split("-").map(Number);
    
    // fromDate: 1st day of the selected month at 00:00:00.000
    const fromDate = new Date(year, month - 1, 1, 0, 0, 0, 0); 
    
    // toDate: Last day of the selected month at 23:59:59.999
    const toDate = new Date(year, month, 0, 23, 59, 59, 999); 
    
    return { 
        fromDate: fromDate.toISOString(), 
        toDate: toDate.toISOString() 
    };
};


/**
 * Custom hook to fetch BD Projection data for a specific month and list of BD codes.
 * @param {string} selectedMonth - The month string in "YYYY-MM" format.
 * @param {string[]} codecdList - A list of BD codes to filter by.
 * @returns {{projections: Array<Object>, isLoadingProjections: boolean, setProjections: Function}}
 */
export const useBdProjection = (selectedMonth, codecdList) => {
    const [projections, setProjections] = useState([]);
    const [isLoadingProjections, setIsLoadingProjections] = useState(false);

    useEffect(() => {
        const fetchProjections = async () => {
            // Check if the list of codes is valid before making the API call
            if (!codecdList || codecdList.length === 0) {
                setProjections([]);
                return;
            }

            setIsLoadingProjections(true);
            try {
                const { fromDate, toDate } = calculateMonthDateRange(selectedMonth);

                const payload = {
                    codecd: codecdList[0],
                    fromDate,
                    toDate,
                };

                const data = await getAllBdProjection(payload);

                const normalizedData = (data || []).map(p => ({
                    id: p.id,
                    CODECD: p.codecd,
                    CUSTACCCODE: p.custacccode,
                    ProjDate: p.projDate, 
                    ProjVal: p.projVal, 
                    BDName: p.bdName,
                    ClientName: p.clientName,
                    REMARKS: p.remarks,
                }));

                setProjections(normalizedData);
            } catch (e) {
                console.error("Failed to fetch BD projections", e);
                setProjections([]);
            } finally {
                setIsLoadingProjections(false);
            }
        };

        if (selectedMonth) {
            fetchProjections();
        }
    }, [selectedMonth, codecdList]); // Dependency array to re-run on month or code list change

    return { projections, isLoadingProjections, setProjections };
}

// NOTE: Please save this code as `useBdProjection.js`