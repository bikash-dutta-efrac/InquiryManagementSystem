import {
  FileText,
  CheckCircle,
  XCircle,
  Wallet,
  ClipboardList,
  ThumbsUp,
  Clock,
  Ban,
} from "lucide-react";

function KpiCard({ title, value, sub, chip, icon, gradient }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition min-h-[140px] max-h-[160px]">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-95`}
      />
      <div className="relative p-5 text-white flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider bg-black/30 px-2 py-1 rounded-full">
            {chip}
          </span>
          <div className="p-2 bg-black/20 rounded-xl">{icon}</div>
        </div>
        <div>
          <h4 className="mt-3 text-sm opacity-90">{title}</h4>
          <div className="text-2xl font-extrabold tracking-tight drop-shadow-sm">
            {value}
          </div>
          {<div className="mt-2 text-xs opacity-90">{sub}</div>}
        </div>
      </div>
      <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/10 group-hover:bg-white/20 transition" />
    </div>
  );
}

export default function InquiryOverview({ data = [], onCardClick }) {
  const dedupeBy = (arr, key) => [...new Map(arr.map(x => [x[key], x])).values()];

  const totalInquiries   = new Set(data.map(d => d.inqNo).filter(Boolean)).size;
  const totalQuotations  = new Set(data.map(d => d.quotNo).filter(Boolean)).size;

  const registration = new Set(
    data.filter(d => d.regisNo).filter(Boolean)
  );

  const registered     = registration.size;
  const notRegistered  = data.length - registered;

  const totalRegisteredValue = dedupeBy(
    data.filter(d => d.regisNo), 'regisNo'
  ).reduce((sum, d) => sum + (parseFloat(d.regisVal) || 0), 0);

  const totalQuotationValue = dedupeBy(data, 'quotNo').reduce(
    (sum, d) => sum + (parseFloat(d.quotValAfterDis) || 0), 0
  );

  const avgQuotationValue = totalQuotations > 0 ? totalQuotationValue / totalQuotations : 0;

  const distinctQuotations = dedupeBy(data, 'quotNo');
  const quotations         = distinctQuotations.length;
  const registeredFromQuot = new Set(
      data.filter((d) => d.quotNo && d.regisNo).map((d) => d.quotNo)
    ).size;

  // Group registrations by quotNo
  const quotToRegs = {};
  data.forEach((d) => {
    if (d.quotNo && d.regisNo) {
      if (!quotToRegs[d.quotNo]) quotToRegs[d.quotNo] = new Set();
      quotToRegs[d.quotNo].add(d.regisNo);
    }
  });

  // Total registrations linked to quotations
  const totalRegsPerQuot = Object.values(quotToRegs).reduce(
    (sum, regs) => sum + regs.size,
    0
  );

  // Average registrations per quotation
  const avgRegsPerQuot =
    distinctQuotations.length > 0
      ? Number((totalRegsPerQuot / distinctQuotations.length).toFixed(3))
      : 0;



  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <div onClick={() => onCardClick("inquiries")} className="cursor-pointer">
        <KpiCard
          title="Total Inquiries"
          value={totalInquiries}
          icon={<FileText className="w-5 h-5" />}
          gradient="from-blue-600 via-blue-700 to-indigo-700"
          chip="Inquiries"
        />
      </div>

      <div onClick={() => onCardClick("quotations")} className="cursor-pointer">
        <KpiCard
          title="Total Quotations"
          value={quotations}
          sub={
            <div className="space-y-1">
              <div>
                Avg Value: ₹{" "}
                {avgQuotationValue.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          }
          icon={<ClipboardList className="w-5 h-5" />}
          gradient="from-cyan-600 via-sky-700 to-blue-700"
          chip="Quotations"
        />
      </div>

      <div
        onClick={() => onCardClick("approved")}
        className="cursor-pointer"
      >
        <KpiCard
          title="Approved Quotations"
          value={registeredFromQuot}
          icon={<CheckCircle className="w-5 h-5" />}
          gradient="from-green-600 via-emerald-700 to-teal-700"
          chip="Quotations"
        />
      </div>

      <div
        onClick={() => onCardClick("unapproved")}
        className="cursor-pointer"
      >
        <KpiCard
          title="Unapproved Quotations"
          value={totalQuotations - registeredFromQuot}
          icon={<XCircle className="w-5 h-5" />}
          gradient="from-red-600 via-rose-700 to-pink-700"
          chip="Quotations"
        />
      </div>

      <div onClick={() => onCardClick("registrations")} className="cursor-pointer">
        <KpiCard
          title="Total Registrations"
          value={data.length}
          icon={<ThumbsUp className="w-5 h-5" />}
          gradient="from-amber-600 via-yellow-700 to-orange-700"
          chip="Registration"
        />
      </div>

      <KpiCard
        title="Total Registered Value"
        value={`₹ ${Math.round(totalRegisteredValue)}`}
        icon={<Wallet className="w-5 h-5" />}
        gradient="from-purple-600 via-fuchsia-700 to-pink-700"
        chip="Registration"
      />
    </div>
  );
}


