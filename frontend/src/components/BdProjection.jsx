import React, { useState, useEffect } from "react";
import { getProjections } from "../services/api.js";
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  Target,
  User,
  Zap,
} from "lucide-react";

export default function BdProjection({ inquiries, filters }) {
  const [projections, setProjections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectionsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProjections(filters);
        setProjections(data);
      } catch (e) {
        setError("Failed to load projections data.");
        console.error("Failed to fetch projections:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectionsData();
  }, [filters]);

  const bdData = projections.reduce((acc, proj) => {
    if (!acc[proj.bdName]) {
      acc[proj.bdName] = {
        totalTarget: 0,
        totalProjection: 0,
        achieved: 0,
      };
    }
    acc[proj.bdName].totalTarget += parseFloat(proj.targetVal) || 0;
    acc[proj.bdName].totalProjection += parseFloat(proj.projVal) || 0;
    return acc;
  }, {});

  const bdInquiryData = inquiries.reduce((acc, inquiry) => {
    if (!acc[inquiry.bdName]) {
      acc[inquiry.bdName] = 0;
    }
    acc[inquiry.bdName] += parseFloat(inquiry.projVal) || 0;
    return acc;
  }, {});

  const monthlyInquiryData = inquiries.reduce((acc, inquiry) => {
    if (inquiry.regDate) {
      const date = new Date(inquiry.regDate);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += parseFloat(inquiry.projVal) || 0;
    }
    return acc;
  }, {});

  const calculatedBdData = Object.keys(bdData).map((bdName) => {
    const { totalTarget, totalProjection } = bdData[bdName];
    const achieved = bdInquiryData[bdName] || 0;
    const isAchieved = achieved >= totalTarget;
    const percentageLeft =
      totalTarget > 0 ? ((totalTarget - achieved) / totalTarget) * 100 : 0;
    const percentageAchieved = totalTarget > 0 ? (achieved / totalTarget) * 100 : 0;

    return {
      bdName,
      totalTarget,
      totalProjection,
      achieved,
      isAchieved,
      percentageLeft,
      percentageAchieved,
    };
  }).sort((a, b) => b.percentageAchieved - a.percentageAchieved);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl shadow-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide text-center">
        BD Projection Performance
      </h1>
      <p className="text-center text-gray-600 max-w-2xl mx-auto">
        This table provides a comprehensive overview of each BD's performance against their set targets and projections.
      </p>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>BD Name</span>
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-end space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Target</span>
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-end space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Achieved</span>
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-end space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Projection</span>
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span>Status</span>
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span>% Left</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calculatedBdData.length > 0 ? (
              calculatedBdData.map((bd) => (
                <tr key={bd.bdName} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bd.bdName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {bd.totalTarget.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {bd.achieved.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {bd.totalProjection.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bd.isAchieved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {bd.isAchieved ? (
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-1" />
                      )}
                      {bd.isAchieved ? "Achieved" : "Not Achieved"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {bd.isAchieved ? (
                      <span className="text-green-600 font-bold">0.00%</span>
                    ) : (
                      <span className="text-red-600 font-bold">
                        {Math.max(0, bd.percentageLeft).toFixed(2)}%
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                  No projection data available for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Monthly Registration Value
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Total registration value aggregated monthly from the inquiries data.
        </p>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.keys(monthlyInquiryData).length > 0 ? (
              Object.keys(monthlyInquiryData).map((month) => (
                <tr key={month} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {monthlyInquiryData[month].toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-6 py-10 text-center text-gray-500">
                  No monthly registration data available for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
