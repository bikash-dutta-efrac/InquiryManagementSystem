import React, { useMemo } from 'react';
import {
  FlaskConical,
  DollarSign,
  CheckCircle2,
  XCircle,
  BarChart3,
  List,
} from 'lucide-react';

// Utility function copied from BdProjection.jsx for consistent number formatting
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

// Reusable card component based on the BdProjection design
const LabAnalysisSummaryCard = ({ title, value, color, icon }) => {
    const borderColor = `border-t-4 border-${color}-500`;
    const bgColor = `bg-${color}-100`;
    const iconColor = `text-${color}-600`;

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 ${borderColor}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold uppercase text-gray-500">{title}</span>
                <div className={`p-2 rounded-full ${bgColor} ${iconColor}`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    );
};

// Simplified Status badge getter for Lab Analysis
const getStatusBadge = (status) => {
    switch (status) {
        case 'Verified by HO':
            return { text: 'Verified by HO', badgeColor: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-4 h-4" /> };
        case 'By QIMA':
            return { text: 'By QIMA', badgeColor: 'bg-blue-100 text-blue-700', icon: <FlaskConical className="w-4 h-4" /> };
        case 'By Mail':
            return { text: 'By Mail', badgeColor: 'bg-yellow-100 text-yellow-700', icon: <BarChart3 className="w-4 h-4" /> };
        case 'Pending':
        default:
            return { text: 'Pending', badgeColor: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> };
    }
};


const LabAnalysisTable = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            {/* Header Row for larger screens - adapted to 7 columns */}
            <div className="hidden lg:grid grid-cols-7 gap-4 py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <div className="col-span-1">Reg. Date</div>
                <div className="col-span-1">Quot. No</div>
                <div className="col-span-1">Lab</div>
                <div className="col-span-1">Parameter</div>
                <div className="col-span-1 text-right">Quantity</div>
                <div className="col-span-1">Unit</div>
                <div className="col-span-1">Status</div>
            </div>

            {/* Data Rows */}
            <div className="divide-y divide-gray-100">
                {data.map((item, index) => {
                    const status = getStatusBadge(item.status);
                    
                    return (
                        <div
                            key={index}
                            className="py-5 px-6 hover:bg-gray-50 transition-colors duration-200"
                        >
                            {/* Card layout for small and medium screens (lg:hidden) */}
                            <div className="lg:hidden grid grid-cols-1 gap-6 p-6 mb-4 rounded-2xl shadow-lg bg-white border border-gray-100">
                                {/* Header Section: Quot. No and Reg. Date */}
                                <div className="flex items-center justify-between border-b pb-4 border-gray-200">
                                    <h3 className="text-xl font-extrabold text-gray-900">
                                        {item.QuotNo || 'N/A'}
                                    </h3>
                                    <span className="text-sm font-medium text-gray-500">
                                        {item.RegDate || 'N/A'}
                                    </span>
                                </div>

                                {/* Key Metrics Section: Lab and Parameter */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col items-start p-4 bg-blue-50 rounded-lg">
                                        <span className="text-xs font-semibold uppercase text-blue-700">Lab</span>
                                        <p className="mt-1 text-base font-bold text-blue-800">
                                            {item.Lab || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start p-4 bg-teal-50 rounded-lg">
                                        <span className="text-xs font-semibold uppercase text-teal-700">Parameter</span>
                                        <p className="mt-1 text-base font-bold text-teal-800">
                                            {item.Parameter || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Quantity and Status */}
                                <div className="flex flex-col space-y-3 pt-3">
                                     <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700">Quantity / Unit</span>
                                        <p className="text-base font-bold text-gray-800">
                                            {formatAmount(Number(item.quantity) || 0)} {item.unit}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700">Status</span>
                                        <span
                                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${status.badgeColor}`}
                                        >
                                            {status.icon}
                                            {status.text}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Grid layout for large screens (hidden lg:grid) */}
                            <div className="hidden lg:grid grid-cols-7 gap-4 items-center">
                                <div className="col-span-1 text-sm text-gray-700">{item.RegDate || 'N/A'}</div>
                                <div className="col-span-1 text-sm font-semibold text-gray-900">{item.QuotNo || 'N/A'}</div>
                                <div className="col-span-1 text-sm text-gray-700">{item.Lab || 'N/A'}</div>
                                <div className="col-span-1 text-sm text-gray-700">{item.Parameter || 'N/A'}</div>
                                <div className="col-span-1 text-sm text-gray-700 font-medium text-right">
                                    {formatAmount(Number(item.quantity) || 0)}
                                </div>
                                <div className="col-span-1 text-sm text-gray-700">{item.unit || 'N/A'}</div>
                                <div className="col-span-1">
                                    <span
                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${status.badgeColor}`}
                                    >
                                        {status.icon}
                                        {status.text}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export default function LabAnalysis({ data = [] }) {
    
    // --- Summary Logic ---
    const summary = useMemo(() => {
        const totalAnalyses = data.length;
        
        // Calculate Total Quantity
        const totalQuantity = data.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

        // Calculate Status Counts
        const statusCounts = data.reduce((acc, item) => {
            const statusKey = item.status || 'Pending'; 
            acc[statusKey] = (acc[statusKey] || 0) + 1;
            return acc;
        }, {});

        return {
            totalAnalyses,
            totalQuantity,
            verifiedHo: statusCounts['Verified by HO'] || 0,
            byQima: statusCounts['By QIMA'] || 0,
        };
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="text-center text-gray-600 py-20 text-xl font-medium rounded-2xl bg-white shadow-xl">
                🚫 No lab analysis data found for the selected filters.
            </div>
        );
    }

    return (
        <div className="bg-gray-50 p-8 rounded-3xl shadow-2xl font-sans">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
                    Lab Analysis Report
                    <span className="block text-lg font-medium text-gray-500 mt-1">
                        Summary and Detailed Log
                    </span>
                </h2>
                {/* View toggle removed as per request */}
            </div>

            {/* Summary Cards - Styled like BdProjection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                
                {/* Total Analyses Card */}
                <LabAnalysisSummaryCard 
                    title="Total Analyses" 
                    value={formatAmount(summary.totalAnalyses)} 
                    color="blue" 
                    icon={<FlaskConical className="w-6 h-6" />}
                />

                {/* Total Quantity Card */}
                <LabAnalysisSummaryCard 
                    title="Total Quantity (Units)" 
                    value={formatAmount(summary.totalQuantity)} 
                    color="teal" 
                    icon={<DollarSign className="w-6 h-6" />}
                />

                {/* Verified by HO Card */}
                <LabAnalysisSummaryCard 
                    title="Verified by HO" 
                    value={formatAmount(summary.verifiedHo)} 
                    color="green" 
                    icon={<CheckCircle2 className="w-6 h-6" />}
                />

                {/* By QIMA Card */}
                <LabAnalysisSummaryCard 
                    title="By QIMA" 
                    value={formatAmount(summary.byQima)} 
                    color="red" 
                    icon={<XCircle className="w-6 h-6" />}
                />
            </div>

            {/* Main Content: Table */}
            <LabAnalysisTable data={data} />
        </div>
    );
}