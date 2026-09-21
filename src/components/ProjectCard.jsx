import Link from "next/link";
import Image from "next/image";
import { secteurs } from "@/data/projects";

export default function ProjectCard({ projet }) {
  const secteur = secteurs[projet.secteur];

  return (
    <Link
      href={`/realisations/${projet.slug}`}
      className="group flex flex-col rounded-xl border border-line bg-white overflow-hidden active:scale-[0.99] transition-transform"
    >
      <div className="relative h-40 bg-dark-2">
        <Image
          src={`/img/realisations/${projet.photo}`}
          alt=""
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-2.5 p-5 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-full"
            style={{ color: secteur.color, backgroundColor: `${secteur.color}1A` }}
          >
            {secteur.label.toUpperCase()}
          </span>
          <span className="text-[12px] text-ink-faint">{projet.client}</span>
        </div>
        <h3 className="text-[16.5px] font-bold text-dark leading-snug group-hover:text-lime transition-colors">
          {projet.titre}
        </h3>
        <p className="text-[13.5px] text-ink-soft leading-relaxed flex-1">{projet.resume}</p>
        <div className="text-[12px] text-ink-faint border-t border-line pt-3">
          {projet.periode}
          {projet.montant ? ` · ${projet.montant}` : ""}
        </div>
      </div>
    </Link>
  );
}
