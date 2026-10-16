import Link from "next/link";
import TeamGallery from "@/components/TeamGallery";
import { getMembres, getEquipeStats } from "@/lib/db";

export const metadata = {
  title: "Équipe",
  description: "Découvrez les visages et les expertises d’Efficience Globale, au service de la gouvernance, de la digitalisation et de l’intelligence artificielle en Guinée.",
};

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  const [membres, equipeStats] = await Promise.all([getMembres(), getEquipeStats()]);
  return (
    <>
      <section className="bg-darker overflow-hidden pt-12 md:pt-20 pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-lime-2 mb-5">NOTRE ÉQUIPE</p>
            <h1 className="text-white text-[38px] md:text-[58px] leading-[1.08] tracking-[-0.02em]">
              Les visages de notre <span className="text-lime-2 italic">impact</span>
            </h1>
            <p className="text-[#d2dcd0] text-base md:text-lg leading-relaxed mt-5">
              Des parcours complémentaires, une connaissance du terrain et une même ambition : faire avancer vos projets.
            </p>
          </div>
          <TeamGallery members={membres} />
        </div>
      </section>
      <section aria-label="Les expertises de notre collectif" className="bg-cream border-b border-line">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-9 md:py-11 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
          {equipeStats.map((stat) => (
            <div key={stat.label} className="border-l-2 border-lime pl-4">
              <p className="text-[32px] md:text-[38px] leading-none font-head text-dark tabular-nums mb-2">{stat.nombre}</p>
              <p className="text-sm text-ink-soft leading-relaxed max-w-[230px]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16 grid md:grid-cols-[1fr_auto] gap-7 items-center">
        <div className="max-w-xl">
          <h2 className="text-[28px] md:text-[34px] leading-tight mb-3">Des compétences qui se complètent.</h2>
          <p className="text-ink-soft text-base leading-relaxed">Gouvernance, suivi-évaluation, digitalisation et intelligence artificielle : notre collectif réunit les expertises nécessaires pour accompagner vos projets, de la réflexion à l’action.</p>
        </div>
        <Link href="/contact" className="inline-flex w-fit items-center justify-center rounded bg-dark px-6 py-3.5 text-white text-sm font-semibold hover:bg-dark-2">Échangeons sur votre projet <span aria-hidden="true" className="ml-4">↗</span></Link>
      </section>
    </>
  );
}
