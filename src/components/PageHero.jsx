import HeroImage from "@/components/HeroImage";

export default function PageHero({ image, title, description, imageClassName = "object-center", children }) {
  return <section className="public-page-hero relative overflow-hidden bg-darker" aria-labelledby="page-heading">
    <div className="absolute inset-0"><HeroImage src={image} className={imageClassName} /><div className="eg-hero-shade absolute inset-0" /></div>
    <div className="eg-hero-content relative max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-28">
      <h1 id="page-heading" className="text-white text-[36px] md:text-[56px] leading-[1.08] tracking-[-0.02em] mb-5 max-w-2xl">{title}</h1>
      <p className="eg-hero-description text-[#d3ddce] text-base md:text-[17px] leading-relaxed max-w-xl">{description}</p>
      {children && <div className="mt-8">{children}</div>}
    </div>
  </section>;
}
