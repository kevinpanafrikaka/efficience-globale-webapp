import Link from "next/link";
import Image from "next/image";

export default function RealisationTeaser({ projet }) {
  return (
    <Link
      href={`/realisations/${projet.slug}`}
      className="realisation-teaser relative block h-64 md:h-72 overflow-hidden"
    >
      <Image
        src={projet.photo_url}
        alt=""
        fill
        sizes="(min-width: 768px) 33vw, 50vw"
        className="realisation-teaser-media object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="realisation-teaser-text absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white text-[17px] md:text-[18px] tracking-[-0.01em] leading-snug">{projet.titre}</h3>
      </div>
    </Link>
  );
}
