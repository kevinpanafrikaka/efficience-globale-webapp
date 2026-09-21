import RealisationsGrid from "@/components/RealisationsGrid";
import { projets, partenariats } from "@/data/projects";

export const metadata = {
  title: "Réalisations",
  description:
    "Les 17 projets et les partenariats stratégiques menés par Efficience Globale entre 2022 et 2025, avec Gavi, UNICEF, la Banque Mondiale, Expertise France, Enabel et bien d'autres.",
};

export default function RealisationsPage() {
  return (
    <>
      <section
        className="py-14 md:py-16"
        style={{ background: "linear-gradient(120deg, #2e3f32 0%, #16211a 100%)" }}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-lime-2 text-[12.5px] font-bold tracking-wide mb-3.5">RÉALISATIONS</div>
          <h1 className="text-white text-[28px] md:text-[42px] leading-tight mb-4">
            17 projets, 4 partenariats stratégiques
          </h1>
          <p className="text-[#d3ddce] text-[16px] max-w-2xl">
            Depuis 2022, Efficience Globale a conduit des interventions dans la santé publique, l&apos;intelligence
            artificielle, l&apos;éducation, la gouvernance et le développement local, aux côtés de bailleurs et
            institutions de référence.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-16">
        <RealisationsGrid projets={projets} partenariats={partenariats} />
      </section>
    </>
  );
}
