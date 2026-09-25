import Image from "next/image";
import RealisationsGrid from "@/components/RealisationsGrid";
import { getProjets } from "@/lib/db";

export const metadata = {
  title: "Réalisations",
  description:
    "Les projets et les partenariats stratégiques menés par Efficience Globale depuis 2022, avec Gavi, UNICEF, la Banque Mondiale, Expertise France, Enabel et bien d'autres.",
};

// Dynamique : lit D1 à chaque requête, pour refléter les publications
// de l'admin sans avoir besoin de redéployer.
export const dynamic = "force-dynamic";

export default async function RealisationsPage() {
  const projets = await getProjets();

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/img/hero-realisations.jpg" alt="" fill className="object-cover" priority />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(13,19,14,0.88) 0%, rgba(13,19,14,0.55) 45%, rgba(13,19,14,0.3) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(0deg, rgba(10,15,11,0.55) 0%, rgba(10,15,11,0.1) 40%)" }}
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-28">
          <h1 className="text-white text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.02em] mb-5 max-w-2xl">
            Nos projets et <span className="text-lime italic">partenariats</span> stratégiques
          </h1>
          <p className="text-[#d3ddce] text-[16px] md:text-[17px] leading-relaxed max-w-xl">
            Depuis 2022, Efficience Globale a conduit des interventions dans la santé publique, l&apos;intelligence
            artificielle, l&apos;éducation, la gouvernance et le développement local, aux côtés de bailleurs et
            institutions de référence.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        {projets.length === 0 ? (
          <p className="text-center text-ink-soft py-14">Aucun projet publié pour le moment.</p>
        ) : (
          <RealisationsGrid projets={projets} />
        )}
      </section>
    </>
  );
}
