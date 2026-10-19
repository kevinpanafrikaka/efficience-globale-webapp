import Image from "@/components/PublicImage";
import { secteurs } from "@/lib/db";

export default function ProjectCard({ projet }) {
  const secteur = secteurs[projet.secteur] ?? { label: projet.secteur, color: "#3D5347" };

  return (
    <a href={`/realisations/${projet.slug}`} className="project-card group relative flex h-full flex-col active:opacity-80">
      <div className="relative h-48 shrink-0 bg-dark-2 overflow-hidden">
        <Image
          src={projet.photo_url}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="project-card-media pointer-events-none object-cover"
        />
      </div>
      <div className="flex flex-col gap-2.5 pt-4 border-t-2 border-dark flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="text-[11px] font-bold tracking-[0.1em]" style={{ color: secteur.color }}>
            {secteur.label.toUpperCase()}
          </span>
          <span className="text-[12px] text-ink-faint">{projet.client}</span>
        </div>
        <h3 className="text-[17px] font-bold text-dark leading-snug group-hover:text-lime transition-colors">
          {projet.titre}
        </h3>
        <p className="text-[13.5px] text-ink-soft leading-relaxed flex-1">{projet.resume}</p>
      </div>
    </a>
  );
}
