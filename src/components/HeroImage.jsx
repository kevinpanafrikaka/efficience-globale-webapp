import { HERO_IMAGES } from "@/lib/hero-images.mjs";

// One picture lets the browser request only the composition matching its viewport.
// No independent desktop/mobile images or unconditional landscape preload.
export default function HeroImage({ src, className = "object-center" }) {
  const artwork = HERO_IMAGES[src];
  return (
    <picture className="hero-picture absolute inset-0 block" aria-hidden="true">
      {artwork && <source media="(max-width: 767px)" srcSet={artwork.mobile} type="image/webp" width="768" height="1152" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={artwork?.width} height={artwork?.height}
        fetchPriority="high" decoding="async"
        className={`hero-artwork absolute inset-0 h-full w-full object-cover ${className}`} />
    </picture>
  );
}
