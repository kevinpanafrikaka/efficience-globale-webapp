export default function SectionHead({ eyebrow, index, title, lead, dark = false, className = "" }) {
  return (
    <div className={`relative mb-14 md:mb-16 ${className}`}>
      {index && (
        <span
          aria-hidden="true"
          className={`pointer-events-none select-none absolute -top-2 md:-top-7 left-0 text-[76px] md:text-[150px] leading-none italic ${
            dark ? "text-white/10" : "text-dark/[0.07]"
          }`}
          style={{ fontFamily: "var(--font-head)" }}
        >
          {index}
        </span>
      )}
      <div className="relative max-w-2xl pt-8 md:pt-14">
        <div className={`text-[12px] font-bold tracking-[0.14em] mb-3 ${dark ? "text-lime-2" : "text-lime"}`}>
          {eyebrow}
        </div>
        <h2
          className={`text-[32px] md:text-[46px] leading-[1.05] tracking-[-0.02em] ${dark ? "text-white" : "text-dark"}`}
        >
          {title}
        </h2>
        {lead && <p className={`mt-4 text-[16px] leading-relaxed ${dark ? "text-[#d3ddce]" : "text-ink-soft"}`}>{lead}</p>}
      </div>
    </div>
  );
}
