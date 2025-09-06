import { useState } from "react";

const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d) ? "—" : d.toLocaleDateString();
};
const fmtCurr = (n) =>
  typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "—";

export default function InquiryCard({ inquiry }) {
  const [expanded, setExpanded] = useState(false);

  const isRegistered = inquiry?.regisNo != null;
  const statusText = isRegistered ? "Registered" : "Not Registered";
  const statusClasses = isRegistered
    ? "mt-2 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-green-100 text-green-700 ring-1 ring-green-200 rounded-md"
    : "mt-2 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200 rounded-md";


  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
      {/* Header row */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {inquiry?.clientName ?? "—"}
          </h2>
          <div className="mt-1 text-sm text-gray-600">
            <span className="mr-3">
              <span className="font-medium text-gray-700">BD:</span>{" "}
              {inquiry?.bdName ?? "—"}
            </span>
            <span>
              <span className="font-medium text-gray-700">Inquiry Date:</span>{" "}
              {fmtDate(inquiry?.inqDate)}
            </span>
          </div>
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusClasses}`}>
            <span
              className={`h-2 w-2 rounded-half ${
                isRegistered ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            {statusText}
          </div>
                  </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
        >
          {expanded ? "Hide Details" : "View Details"}
        </button>
      </div>

      {/* Details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100">
          {/* Quotation */}
          <div className="mt-5 bg-gray-50 rounded-xl p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3">
              📄 Quotation Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <div>
                <span className="font-medium text-gray-800">Quotation No:</span>{" "}
                {inquiry?.quotNo ?? "—"}
              </div>
              <div>
                <span className="font-medium text-gray-800">Quotation Date:</span>{" "}
                {fmtDate(inquiry?.quotDate)}
              </div>
              <div>
                <span className="font-medium text-gray-800">
                  Value (Before Discount):
                </span>{" "}
                {fmtCurr(inquiry?.quotaValBeforeDis)}
              </div>
              <div>
                <span className="font-medium text-gray-800">
                  Value (After Discount):
                </span>{" "}
                {fmtCurr(inquiry?.quotaValAfterDis)}
              </div>
              <div>
                <span className="font-medium text-gray-800">Discount:</span>{" "}
                {inquiry?.percOfDis ?? "—"}%
              </div>
              <div>
                <span className="font-medium text-gray-800">Quotation Ageing:</span>{" "}
                {inquiry?.quoteAgeing ?? "—"} days
              </div>
            </div>
          </div>

          {/* Registration */}
          {isRegistered ? (
            <div className="mt-4 bg-green-50 rounded-xl p-4">
              <h3 className="text-base font-semibold text-green-800 mb-3">
                ✅ Registration Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-800">
                <div>
                  <span className="font-medium">Registration No:</span>{" "}
                  {inquiry?.regisNo}
                </div>
                <div>
                  <span className="font-medium">Registration Date:</span>{" "}
                  {fmtDate(inquiry?.regisDate)}
                </div>
                <div>
                  <span className="font-medium">Registration Value:</span>{" "}
                  {fmtCurr(inquiry?.regisVal)}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 bg-yellow-50 rounded-xl p-4 text-sm text-yellow-800">
              ⚠️ Not registered yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
