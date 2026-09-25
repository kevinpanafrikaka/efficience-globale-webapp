import Link from "next/link";
import Image from "next/image";
import { secteurs } from "@/lib/db";

export default function ProjectCard({ projet }) {
  const secteur = secteurs[projet.secteur] ?? { label: projet.secteur, color: "#3D5347" };

  return (
    <Link href={`/realisations/${projet.slug}`} className="project-card group flex flex-col active:opacity-80">
      <div className="relative h-48 bg-dark-2 overflow-hidden">
        <Image
          src={projet.photo_url}
          alt=""
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="project-card-media object-cover"
        />
      </div>
      <div className="flex flex-col gap-2.5 pt-4 border-t-2 border-dark flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold tracking-[0.1em]" style={{ color: secteur.color }}>
            {secteur.label.toUpperCase()}
          </span>
          <span className="text-[12px] text-ink-faint">{projet.client}</span>
        </div>
        <h3 className="text-[17px] font-bold text-dark leading-snug group-hover:text-lime transition-colors">
          {projet.titre}
        </h3>
        <p className="text-[13.5px] text-ink-soft leading-relaxed flex-1">{projet.resume}</p>
        <div className="text-[12px] text-ink-faint pt-1">{projet.periode}</div>
      </div>
    </Link>
  );
}
