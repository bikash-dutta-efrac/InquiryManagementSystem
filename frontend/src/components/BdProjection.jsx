import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  BarChart3,
  Trophy,
  Target,
  Maximize,
  Minimize,
  List,
} from "lucide-react";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import { motion, AnimatePresence } from "framer-motion";

function formatAmount(num) {
  if (num < 1000) return num;
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e5, symbol: "L" },
    { value: 1e7, symbol: "Cr" },
    { value: 1e9, symbol: "B" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(2).replace(rx, "$1") + si[i].symbol;
}

const getStatus = (achieved, projected) => {
  if (projected === 0) {
    return {
      text: "No Target",
      badgeColor: "bg-gray-100 text-gray-600",
      progressColor: "bg-gray-400",
      progress: 0,
      icon: <XCircle className="w-4 h-4" />,
      isAchieved: false,
    };
  }

  const achievementPercentage = (achieved / projected) * 100;
  const progress = Math.min(achievementPercentage, 100);

  if (achieved >= projected) {
    return {
      text: "Achieved",
      badgeColor: "bg-green-100 text-green-700",
      progressColor: "bg-green-500",
      progress,
      icon: <CheckCircle2 className="w-4 h-4" />,
      isAchieved: true,
    };
  } else {
    return {
      text: "Not Achieved",
      badgeColor: "bg-red-100 text-red-700",
      progressColor: "bg-red-500",
      progress,
      icon: <TrendingDown className="w-4 h-4" />,
      isAchieved: false,
    };
  }
};

const aggregateData = (inquiries, projections) => {
  const aggregated = {};

  // Aggregate projections and map months
  projections.forEach((proj) => {
    const projDate = new Date(proj.projDate);
    const bdName = proj.bdName;

    if (!aggregated[bdName]) {
      aggregated[bdName] = {
        bdName,
        projectedValue: 0,
        achievedValue: 0,
        months: new Set(),
      };
    }
    aggregated[bdName].projectedValue += Number(proj.projVal) || 0;
    aggregated[bdName].months.add(projDate);
  });

  // Aggregate inquiries
  inquiries.forEach((inq) => {
    if (inq.regisDate && inq.regisVal && inq.bdName) {
      const regisDate = new Date(inq.regisDate);
      const bdName = inq.bdName;

      if (!aggregated[bdName]) {
        aggregated[bdName] = {
          bdName,
          projectedValue: 0,
          achievedValue: 0,
          months: new Set(),
        };
      }
      aggregated[bdName].achievedValue += Number(inq.regisVal) || 0;
      aggregated[bdName].months.add(regisDate);
    }
  });

  // Format the month range and convert to an array
  const finalData = Object.values(aggregated).map((item) => {
    const sortedMonths = [...item.months].sort((a, b) => a - b);
    let monthString;

    if (sortedMonths.length === 1) {
      monthString = sortedMonths[0].toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
    } else if (sortedMonths.length > 1) {
      const startMonth = sortedMonths[0].toLocaleString("en-US", {
        month: "short",
      });
      const endMonth = sortedMonths[sortedMonths.length - 1].toLocaleString(
        "en-US",
        { month: "short" }
      );
      const year = sortedMonths[0].toLocaleString("en-US", {
        year: "numeric",
      });
      if(startMonth !== endMonth) {
      monthString = `${startMonth} - ${endMonth}, ${year}`;
      } else {
        monthString = `${startMonth}, ${year}`;
      }
    } else {
      monthString = "";
    }

    return {
      bdName: item.bdName,
      month: monthString,
      projectedValue: item.projectedValue,
      achievedValue: item.achievedValue,
    };
  });

  return finalData.sort((a, b) => a.bdName.localeCompare(b.bdName));
};

export default function BdProjection({ inquiries, projections }) {
  const [view, setView] = useState("table");
  const [isFullScreen, setIsFullScreen] = useState(false);

  // console.log(inquiries, projections);

  const aggregatedData = aggregateData(inquiries, projections);

  const totalProjected = aggregatedData.reduce(
    (acc, curr) => acc + (curr.projectedValue || 0),
    0
  );
  const totalAchieved = aggregatedData.reduce(
    (acc, curr) => acc + (curr.achievedValue || 0),
    0
  );

  const bdStats = aggregatedData.reduce(
    (acc, item) => {
      const status = getStatus(item.achievedValue, item.projectedValue);
      const isTargetSet = item.projectedValue > 0;
      if (isTargetSet) {
        if (status.isAchieved) {
          acc.achieved++;
        } else {
          acc.notAchieved++;
        }
      } else {
        acc.noTarget++;
      }
      return acc;
    },
    { achieved: 0, notAchieved: 0, noTarget: 0 }
  );

  const GraphView = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center text-gray-600 py-10 text-lg rounded-2xl bg-white shadow-xl">
          🚫 No data available for projection graphs
        </div>
      );
    }
    const xAxisData = data.map((item) => `${item.bdName} - ${item.month}`);

    const Chart = ({ isModal }) => (
      <div className="w-full h-full flex items-center justify-center">
        <BarChart
          xAxis={[
            {
              scaleType: "band",
              data: xAxisData,
              label: "BD & Month",
              tickLabelStyle: {
                angle: -45,
                textAnchor: "end",
                fontSize: isModal ? 14 : 12,
              },
            },
          ]}
          yAxis={[
            {
              label: "Value (INR)",
              valueFormatter: (value) => `₹ ${formatAmount(value)}`,
            },
          ]}
          series={[
            {
              data: data.map((item) =>
                item.achievedValue >= item.projectedValue
                  ? item.achievedValue
                  : item.achievedValue
              ),
              label: "Achieved Value",
              color: "green",
              stack: "total",
              animationDuration: 500,
            },
            {
              data: data.map((item) =>
                item.achievedValue >= item.projectedValue
                  ? 0
                  : Math.max(0, item.projectedValue - item.achievedValue)
              ),
              label: "Remaining Value",
              color: "red",
              stack: "total",
              animationDuration: 500,
            },
          ]}
          slotProps={{
            legend: {
              direction: "row",
              position: { vertical: "top", horizontal: "right" },
              padding: { top: 20 },
              hidden: isModal,
            },
          }}
          sx={{
            [`& .${axisClasses.bottom} .${axisClasses.label}`]: {
              transform: "translateY(5px)",
            },
            [`& .${axisClasses.left} .${axisClasses.label}`]: {
              transform: "translateX(-20px)",
            },
            minWidth: isModal ? "1200px" : "100%",
            minHeight: isModal ? "600px" : "400px",
          }}
        />
      </div>
    );

    return (
      <>
        <div
          className={`bg-white rounded-3xl shadow-xl transition-all duration-300 p-8 animate-fadeIn`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                BD Projection
              </h2>
              <p className="text-sm text-gray-500">
                Comparison of Projected vs. Achieved values by BD and month.
              </p>
            </div>
            <button
              onClick={() => setIsFullScreen(true)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Maximize chart"
            >
              <Maximize size={20} />
            </button>
          </div>
          <div className="w-full" style={{ height: "400px" }}>
            <Chart isModal={false} />
          </div>
        </div>

        <AnimatePresence>
          {isFullScreen && (
            <motion.div
              className="fixed inset-0 z-[100] bg-gray-900 bg-opacity-90 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-7xl mx-auto h-[90vh] w-full overflow-y-auto"
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                <button
                  onClick={() => setIsFullScreen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors z-50"
                  aria-label="Minimize chart"
                >
                  <Minimize size={24} />
                </button>
                <Chart isModal={true} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

  const TableView = ({ data }) => {
    return (
      <>
        {!data.length ? (
          <div className="text-center text-gray-600 py-20 text-xl font-medium">
            🚫 No data found for the selected period.
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            {/* Header Row for larger screens */}
            <div className="hidden lg:grid grid-cols-6 gap-4 py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <div className="col-span-1">BD Name</div>
              <div className="col-span-1">Month</div>
              <div className="col-span-1 text-right">Projected Value</div>
              <div className="col-span-1 text-right">Achieved Value</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Achievement %</div>
            </div>

            {/* Data Rows */}
            <div className="divide-y divide-gray-100">
              {data.map((item, index) => {
                const status = getStatus(
                  item.achievedValue,
                  item.projectedValue
                );
                return (
                  <div
                    key={index}
                    className="py-5 px-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    {/* New Card layout for small and medium screens */}
                    <div className="lg:hidden grid grid-cols-1 gap-6 p-6 mb-4 rounded-2xl shadow-lg bg-white border border-gray-100">
                      {/* Header Section: BD Name and Month */}
                      <div className="flex items-center justify-between border-b pb-4 border-gray-200">
                        <h3 className="text-xl font-extrabold text-gray-900">
                          {item.bdName}
                        </h3>
                        <span className="text-sm font-medium text-gray-500">
                          {item.month}
                        </span>
                      </div>

                      {/* Key Metrics Section: Projected and Achieved Values */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-start p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 text-blue-700">
                            <Target className="w-5 h-5" />
                            <span className="text-xs font-semibold uppercase">
                              Projected
                            </span>
                          </div>
                          <p className="mt-1 text-2xl font-bold text-blue-800">
                            {formatAmount(item.projectedValue)}
                          </p>
                        </div>
                        <div className="flex flex-col items-start p-4 bg-teal-50 rounded-lg">
                          <div className="flex flex-col items-start p-4 bg-teal-50 rounded-lg">
                            <div className="flex items-center space-x-2 text-teal-700">
                              <Trophy className="w-5 h-5" />
                              <span className="text-xs font-semibold uppercase">
                                Achieved
                              </span>
                            </div>
                            <p className="mt-1 text-2xl font-bold text-teal-800">
                              {formatAmount(item.achievedValue)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status and Achievement Progress */}
                      <div className="flex flex-col space-y-3">
                        {/* Status Row */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">
                            Status
                          </span>
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${status.badgeColor}`}
                          >
                            {status.icon}
                            {status.text}
                          </span>
                        </div>

                        {/* Progress Bar Row */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-700">
                            Achievement %
                          </span>
                          <div className="relative w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${status.progress}%` }}
                              className={`h-full rounded-full ${status.progressColor} transition-all duration-500 ease-in-out`}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-800 min-w-[40px] text-right">
                            {status.progress.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Grid layout for large screens */}
                    <div className="hidden lg:grid grid-cols-6 gap-4 items-center">
                      <div className="col-span-1 text-sm font-semibold text-gray-900">
                        {item.bdName}
                      </div>
                      <div className="col-span-1 text-sm text-gray-700">
                        {item.month}
                      </div>
                      <div className="col-span-1 text-sm text-gray-700 font-medium text-right">
                        {formatAmount(item.projectedValue)}
                      </div>
                      <div className="col-span-1 text-sm text-gray-700 font-medium text-right">
                        {formatAmount(item.achievedValue)}
                      </div>
                      <div className="col-span-1">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${status.badgeColor}`}
                        >
                          {status.icon}
                          {status.text}
                        </span>
                      </div>
                      <div className="col-span-1">
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
        )}
      </>
    );
  };

  return (
    <div className="bg-gray-50 p-8 rounded-3xl shadow-2xl font-sans">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
          BD Performance
          <span className="block text-lg font-medium text-gray-500 mt-1">
            Projection Vs Achievement Dashboard
          </span>
        </h2>
        <div className="relative flex items-center bg-white rounded-full p-2 shadow-lg border border-gray-200 transition-all duration-300">
          <div
            className={`absolute top-1 bottom-1 w-[48%] rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 shadow-md transition-all duration-500 ease-in-out ${
              view === "table" ? "left-[4px]" : "left-[50.5%]"
            }`}
          ></div>
          <button
            onClick={() => setView("table")}
            className={`relative flex items-center justify-center gap-2 px-6 py-1.5 w-1/2 z-10 transition-colors duration-300 text-sm sm:text-base ${
              view === "table" ? "text-white" : "text-gray-700"
            } font-medium`}
          >
            <List className="w-4 h-4" />
            <span>List</span>
          </button>
          <button
            onClick={() => setView("graph")}
            className={`relative flex items-center justify-center gap-2 px-6 py-1.5 w-1/2 z-10 transition-colors duration-300 text-sm sm:text-base whitespace-nowrap ${
              view === "graph" ? "text-white" : "text-gray-700"
            } font-medium`}
          >
            <BarChart3 className="w-8 h-8" />
            <span>Graph</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Total Projected Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 border-t-4 border-blue-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold uppercase text-gray-500">
              Total Projected
            </span>
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {formatAmount(totalProjected)}
          </p>
        </div>

        {/* Total Achieved Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 border-t-4 border-teal-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold uppercase text-gray-500">
              Total Achieved
            </span>
            <div className="p-2 bg-teal-100 rounded-full text-teal-600">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {formatAmount(totalAchieved)}
          </p>
        </div>

        {/* BDs Achieved Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold uppercase text-gray-500">
              Achieved
            </span>
            <div className="p-2 bg-green-100 rounded-full text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-700">
            {bdStats.achieved}
          </p>
          <span className="mt-2 text-sm text-gray-500">
            out of {bdStats.achieved + bdStats.notAchieved} with target
          </span>
        </div>

        {/* BDs Not Achieved Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 border-t-4 border-red-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold uppercase text-gray-500">
              Not Achieved
            </span>
            <div className="p-2 bg-red-100 rounded-full text-red-600">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-700">
            {bdStats.notAchieved}
          </p>
          <span className="mt-2 text-sm text-gray-500">with a set target</span>
        </div>
      </div>

      {/* Main Content: Table or Graph */}
      {view === "table" ? (
        <TableView data={aggregatedData} />
      ) : (
        <GraphView data={aggregatedData} />
      )}
    </div>
  );
}