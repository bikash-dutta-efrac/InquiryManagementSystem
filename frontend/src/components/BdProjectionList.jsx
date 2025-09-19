import React from "react";
import { TrendingUp, TrendingDown, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

const formatAmount = (num) => {
  if (num === null) return "N/A";
  return `₹ ${Number(num).toLocaleString("en-IN")}`;
};

const getStatus = (achieved, projected) => {
  if (projected === 0) {
    return {
      text: "No Target",
      badgeColor: "bg-gray-100 text-gray-600",
      progressColor: "bg-gray-400",
      progress: 0,
      icon: <MinusCircle className="w-4 h-4" />,
      isAchieved: false,
    };
  }

  const achievementPercentage = (achieved / projected) * 100;

  if (achieved >= projected) {
    return {
      text: "Achieved",
      badgeColor: "bg-green-100 text-green-600",
      progressColor: "bg-green-500",
      progress: 100,
      icon: <CheckCircle2 className="w-4 h-4" />,
      isAchieved: true,
    };
  } else if (achieved > 0) {
    return {
      text: "Partially Achieved",
      badgeColor: "bg-yellow-100 text-yellow-600",
      progressColor: "bg-yellow-500",
      progress: achievementPercentage,
      icon: <TrendingDown className="w-4 h-4" />,
      isAchieved: false,
    };
  } else {
    return {
      text: "Not Achieved",
      badgeColor: "bg-red-100 text-red-600",
      progressColor: "bg-red-500",
      progress: achievementPercentage,
      icon: <XCircle className="w-4 h-4" />,
      isAchieved: false,
    };
  }
};

export default function BdProjectionList({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-600 py-10 text-lg rounded-2xl bg-white shadow-xl">
        🚫 No data available for projection tables
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      {/* Main Table */}
      <div className="hidden lg:block">
        <table className="w-full table-auto border-collapse">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                BD Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Month
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Projected Value
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Achieved Value
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Progress
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {data.map((item, index) => {
              const status = getStatus(item.achievedValue, item.projectedValue);
              return (
                <tr
                  key={index}
                  className={`hover:bg-gray-100 transition-colors duration-200 ease-in-out ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700">
                    {item.bdName}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700">
                    {item.month}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700">
                    {formatAmount(item.projectedValue)}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-700">
                    {formatAmount(item.achievedValue)}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${status.badgeColor}`}
                    >
                      {status.icon}
                      {status.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="relative w-full h-2.5 bg-gray-200 rounded-full">
                        <div
                          style={{
                            width: `${status.progress}%`,
                          }}
                          className={`h-full rounded-full ${status.progressColor} transition-all duration-500 ease-in-out`}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 w-10 text-right">
                        {status.progress.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards for mobile/tablet */}
      <div className="lg:hidden space-y-4 p-4">
        {data.map((item, index) => {
          const status = getStatus(item.achievedValue, item.projectedValue);
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 border border-gray-200"
            >
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="col-span-1 font-semibold text-gray-900">
                  BD Name
                </div>
                <div className="col-span-1 text-gray-700">
                  {item.bdName}
                </div>

                <div className="col-span-1 font-semibold text-gray-900">
                  Month
                </div>
                <div className="col-span-1 text-gray-700">{item.month}</div>

                <div className="col-span-1 font-semibold text-gray-900">
                  Projected Value
                </div>
                <div className="col-span-1 text-gray-700 font-medium">
                  {formatAmount(item.projectedValue)}
                </div>

                <div className="col-span-1 font-semibold text-gray-900">
                  Achieved Value
                </div>
                <div className="col-span-1 text-gray-700 font-medium">
                  {formatAmount(item.achievedValue)}
                </div>

                <div className="col-span-1 font-semibold text-gray-900">
                  Status
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${status.badgeColor}`}
                  >
                    {status.icon}
                    {status.text}
                  </span>
                </div>

                <div className="col-span-2 mt-2">
                  <div className="font-semibold text-gray-900 mb-2">
                    Progress
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full h-2.5 bg-gray-200 rounded-full">
                      <div
                        style={{
                          width: `${status.progress}%`,
                        }}
                        className={`h-full rounded-full ${status.progressColor} transition-all duration-500 ease-in-out`}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 w-10 text-right">
                      {status.progress.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}