import React, { useState } from "react";
import { BarChart2, List } from "lucide-react";
import BdProjectionList from "./BdProjectionList";
import BdProjectionGraph from "./BdProjectionGraph";

const aggregateData = (inquiries, projections) => {
  const aggregated = {};

  projections.forEach((proj) => {
    const projDate = new Date(proj.projDate);
    const month = projDate.toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });
    const key = `${proj.bdId}-${month}`;
    if (!aggregated[key]) {
      aggregated[key] = {
        bdName: proj.bdName,
        month,
        projectedValue: 0,
        achievedValue: 0,
      };
    }
    aggregated[key].projectedValue += proj.projVal;
  });

  inquiries.forEach((inq) => {
    if (inq.regisVal) {
      const regisDate = new Date(inq.regisDate);
      const month = regisDate.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      });
      const key = `${inq.bdId}-${month}`;
      if (!aggregated[key]) {
        aggregated[key] = {
          bdName: inq.bdName,
          month,
          projectedValue: 0,
          achievedValue: 0,
        };
      }
      aggregated[key].achievedValue += inq.regisVal;
    }
  });

  return Object.values(aggregated).sort((a, b) => {
    const dateA = new Date(`01 ${a.month}`);
    const dateB = new Date(`01 ${b.month}`);
    if (dateA - dateB !== 0) {
      return dateA - dateB;
    }
    return a.bdName.localeCompare(b.bdName);
  });
};

export default function BdProjection({ inquiries, projections }) {
  const [view, setView] = useState("table");
  const aggregatedData = aggregateData(inquiries, projections);

  return (
    <div className="space-y-8 bg-white p-8 rounded-3xl shadow-xl animate-fadeIn">
      <div className="flex justify-end items-center gap-3">
        <button
          onClick={() => setView("table")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full shadow-lg transition-all ${
            view === "table"
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <List className="w-4 h-4" />
          <span>Table View</span>
        </button>
        <button
          onClick={() => setView("graph")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full shadow-lg transition-all ${
            view === "graph"
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Graphical View</span>
        </button>
      </div>

      {view === "table" ? (
        <BdProjectionList data={aggregatedData} />
      ) : (
        <BdProjectionGraph data={aggregatedData} />
      )}
    </div>
  );
}