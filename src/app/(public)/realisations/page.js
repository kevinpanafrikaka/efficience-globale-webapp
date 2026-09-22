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
      <section
        className="py-14 md:py-16"
        style={{ background: "linear-gradient(120deg, #2e3f32 0%, #16211a 100%)" }}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-lime-2 text-[12.5px] font-bold tracking-wide mb-3.5">RÉALISATIONS</div>
          <h1 className="text-white text-[28px] md:text-[42px] leading-tight mb-4">
            Nos projets et partenariats stratégiques
          </h1>
          <p className="text-[#d3ddce] text-[16px] max-w-2xl">
            Depuis 2022, Efficience Globale a conduit des interventions dans la santé publique, l&apos;intelligence
            artificielle, l&apos;éducation, la gouvernance et le développement local, aux côtés de bailleurs et
            institutions de référence.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-16">
        {projets.length === 0 ? (
          <p className="text-center text-ink-soft py-14">Aucun projet publié pour le moment.</p>
        ) : (
          <RealisationsGrid projets={projets} />
        )}
      </section>
    </>
  );
}
