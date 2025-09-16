import React from 'react';
import { TrendingUp, TrendingDown, MinusCircle } from 'lucide-react';

const formatAmount = (num) => {
  if (num === null) return "N/A";
  return `₹ ${Number(num).toLocaleString("en-IN")}`;
};

const getStatus = (achieved, projected) => {
  if (projected === 0) {
    return <span className="flex items-center text-gray-500"><MinusCircle className="w-4 h-4 mr-1" /> No Projection</span>;
  }
  if (achieved >= projected) {
    return <span className="flex items-center text-green-600 font-semibold"><TrendingUp className="w-4 h-4 mr-1" /> Achieved</span>;
  } else if (achieved > 0) {
    return <span className="flex items-center text-yellow-600"><TrendingDown className="w-4 h-4 mr-1" /> Partially Achieved</span>;
  } else {
    return <span className="flex items-center text-gray-500"><MinusCircle className="w-4 h-4 mr-1" /> Not Achieved</span>;
  }
};

const aggregateData = (inquiries, projections) => {
  const aggregated = {};

  // Aggregate projected values by BD and month
  projections.forEach(proj => {
    const projDate = new Date(proj.projDate);
    const month = projDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const bdName = proj.bdName;
    const key = `${bdName}-${month}`;

    if (!aggregated[key]) {
      aggregated[key] = {
        bdName,
        month,
        projectedValue: 0,
        achievedValue: 0,
      };
    }
    aggregated[key].projectedValue += Number(proj.projVal) || 0;
  });

  // Aggregate achieved values (registrations) by BD and month
  inquiries.forEach(inq => {
    if (inq.regisDate && inq.regisVal && inq.bdName) {
      const regisDate = new Date(inq.regisDate);
      const month = regisDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const bdName = inq.bdName;
      const key = `${bdName}-${month}`;

      if (aggregated[key]) {
        aggregated[key].achievedValue += Number(inq.regisVal) || 0;
      }
    }
  });

  return Object.values(aggregated);
};

export default function BdProjection({ inquiries, projections }) {
  const aggregatedData = aggregateData(inquiries, projections);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">BD Projection Analysis</h2>
      {!aggregatedData.length ? (
        <div className="text-center text-gray-600 py-10 text-lg">
          🚫 No projection or registration data found for the selected period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border-b text-left text-sm font-semibold text-gray-600">BD Name</th>
                <th className="px-4 py-3 border-b text-left text-sm font-semibold text-gray-600">Month</th>
                <th className="px-4 py-3 border-b text-left text-sm font-semibold text-gray-600">Projected Value</th>
                <th className="px-4 py-3 border-b text-left text-sm font-semibold text-gray-600">Achieved Value</th>
                <th className="px-4 py-3 border-b text-left text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{item.bdName}</td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">{item.month}</td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {formatAmount(item.projectedValue)}
                  </td>
                  <td className="px-4 py-3 border-b text-sm text-gray-700">
                    {formatAmount(item.achievedValue)}
                  </td>
                  <td className="px-4 py-3 border-b text-sm">
                    {getStatus(item.achievedValue, item.projectedValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}