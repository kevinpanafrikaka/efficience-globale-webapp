export default function SectionHead({ eyebrow, index, title, lead, dark = false, className = "" }) {
  return (
    <div className={`max-w-2xl mb-12 md:mb-14 ${className}`}>
      <div
        className={`flex items-baseline gap-3 pb-3 mb-5 border-b ${dark ? "border-white/15" : "border-line"}`}
      >
        {index && (
          <span className={`text-[12.5px] tabular-nums ${dark ? "text-white/40" : "text-ink-faint"}`}>{index}</span>
        )}
        <span className={`text-[12px] font-bold tracking-[0.12em] ${dark ? "text-lime-2" : "text-lime"}`}>
          {eyebrow}
        </span>
      </div>
      <h2
        className={`text-[32px] md:text-[46px] leading-[1.05] tracking-[-0.02em] ${dark ? "text-white" : "text-dark"}`}
      >
        {title}
      </h2>
      {lead && <p className={`mt-4 text-[16px] leading-relaxed ${dark ? "text-[#d3ddce]" : "text-ink-soft"}`}>{lead}</p>}
    </div>
  );
}
