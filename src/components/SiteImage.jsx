import Image from "next/image";

// Comme next/image, mais sans optimisation pour les images envoyées depuis l'admin
// (/uploads/...) : ce sont des réponses de route (R2), que l'optimiseur d'images de
// Next ne peut pas récupérer sur Cloudflare.
export default function SiteImage({ src, ...props }) {
  const unoptimized = typeof src === "string" && src.startsWith("/uploads/");
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image src={src} unoptimized={unoptimized} {...props} />;
}
