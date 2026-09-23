export default function SectionHead({ eyebrow, title, lead, dark = false, className = "" }) {
  return (
    <div className={`max-w-3xl mb-14 md:mb-16 ${className}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span
          className={`shrink-0 inline-flex items-center border text-[11px] font-bold tracking-[0.1em] px-3 py-1.5 ${
            dark ? "border-lime-2/50 text-lime-2" : "border-lime/50 text-lime"
          }`}
        >
          {eyebrow}
        </span>
        <h2
          className={`text-[26px] md:text-[42px] leading-[1.1] tracking-[-0.02em] ${dark ? "text-white" : "text-dark"}`}
        >
          {title}
        </h2>
      </div>
      {lead && <p className={`mt-5 text-[16px] leading-relaxed ${dark ? "text-[#d3ddce]" : "text-ink-soft"}`}>{lead}</p>}
    </div>
  );
}
