import Link from "next/link";
import Image from "@/components/PublicImage";

export default function RealisationTeaser({ projet }) {
  return (
    <Link
      href={`/realisations/${projet.slug}`}
      className="realisation-teaser relative flex items-end min-h-64 md:min-h-72 overflow-hidden"
    >
      <Image
        src={projet.photo_url}
        alt=""
        fill
        sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="realisation-teaser-media object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="realisation-teaser-text relative z-10 w-full px-5 pt-20 pb-5">
        <h3 className="text-white text-[17px] md:text-[18px] tracking-[-0.01em] leading-snug">{projet.titre}</h3>
      </div>
    </Link>
  );
}
