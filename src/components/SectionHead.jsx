export default function SectionHead({ eyebrow, title, lead, dark = false, className = "" }) {
  return (
    <div className={`max-w-2xl mb-10 md:mb-11 ${className}`}>
      <div className={`text-[12.5px] font-bold tracking-wide mb-3.5 ${dark ? "text-lime-2" : "text-lime"}`}>
        {eyebrow}
      </div>
      <h2 className={`text-[28px] md:text-[34px] leading-tight ${dark ? "text-white" : "text-dark"}`}>{title}</h2>
      {lead && <p className={`mt-3.5 text-[15.5px] ${dark ? "text-[#d3ddce]" : "text-ink-soft"}`}>{lead}</p>}
    </div>
  );
}
