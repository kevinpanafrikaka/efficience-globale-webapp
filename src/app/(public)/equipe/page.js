import Link from "next/link";
import Image from "@/components/SiteImage";
import TeamGallery from "@/components/TeamGallery";
import { getMembres } from "@/lib/db";

export const metadata = {
  title: "Équipe",
  description: "Découvrez les visages et les expertises d’Efficience Globale, au service de la gouvernance, de la digitalisation et de l’intelligence artificielle en Guinée.",
};

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  const membres = await getMembres();
  return (
    <>
      <section className="relative overflow-hidden bg-darker">
        <div className="absolute inset-0">
          <Image src="/img/hero-conakry.jpg" alt="" fill className="object-cover object-top" sizes="100vw" priority />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, rgba(13,19,14,0.88) 0%, rgba(13,19,14,0.55) 45%, rgba(13,19,14,0.3) 100%)" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(0deg, rgba(10,15,11,0.55) 0%, rgba(10,15,11,0.1) 40%)" }}
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-28">
          <h1 className="text-white text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.02em] mb-5 max-w-2xl">
            Les visages de notre <span className="text-lime italic">impact</span>
          </h1>
          <p className="text-[#d3ddce] text-[16px] md:text-[17px] leading-relaxed max-w-xl">
            Des parcours complémentaires, une connaissance du terrain et une même ambition : faire avancer vos projets.
          </p>
        </div>
      </section>
      <section aria-label="Les membres du cabinet" className="team-gallery-body bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-8 md:pb-12">
          <TeamGallery members={membres} />
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
