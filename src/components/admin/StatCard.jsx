export default function StatCard({ label, value, helper, highlight = false }) {
  return (
    <div className="bg-white border border-[#E6E2DC] p-5 flex flex-col justify-between gap-2">
      <span className="text-sm font-medium text-[#625D57]">{label}</span>
      <span
        className={`text-2xl font-bold tabular-nums tracking-tight ${
          highlight ? 'text-[#B42318]' : 'text-[#17130F]'
        }`}
      >
        {value}
      </span>
      {helper && <span className="text-sm text-[#625D57]">{helper}</span>}
    </div>
  );
}
