import Image from "next/image";
import { getProjets } from "@/lib/db";

export const metadata = {
  title: "Partenaires",
  description: "Les bailleurs, institutions et partenaires stratégiques d'Efficience Globale.",
};

export const dynamic = "force-dynamic";

const BAILLEURS = [
  { nom: "Gavi", logo: "partners/gavi-logo.png" },
  { nom: "UNICEF", logo: "partners/unicef-logo.png" },
  { nom: "Expertise France", logo: "partners/expertise-france-logo.png" },
  { nom: "Banque Mondiale", logo: "partners/world-bank-logo.png" },
  { nom: "Institut Français de Guinée", logo: "partners/institut-francais-logo-v2.png" },
  { nom: "Université Kofi Annan", logo: "partners/kofi-annan-logo.png" },
  { nom: "AGUIPEL", logo: null },
  { nom: "Ministère de la Santé", logo: "partners/ministere-sante-logo.png" },
];

export default async function PartenairesPage() {
  const partenariats = await getProjets({ secteur: "partenariat" });

  return (
    <>
      <section className="py-16 md:py-24 bg-darker">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-white/15 w-fit">
            <span className="text-[12px] font-bold tracking-[0.14em] text-lime-2">PARTENAIRES</span>
          </div>
          <h1 className="text-white text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.02em] mb-5 max-w-2xl">
            Ils nous font <span className="text-lime italic">confiance</span>
          </h1>
          <p className="text-[#d3ddce] text-[16px] md:text-[17px] leading-relaxed max-w-xl">
            Bailleurs, institutions académiques et organisations de la société civile : des partenaires de premier
            plan qui nous accordent leur confiance à travers l&apos;Afrique de l&apos;Ouest.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="text-[12px] font-bold tracking-[0.1em] text-lime mb-8">BAILLEURS &amp; INSTITUTIONS</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {BAILLEURS.map((p) => (
            <div key={p.nom} className="partner-card relative h-[124px] border border-line overflow-hidden">
              <div className="w-full h-full flex items-center justify-center px-6">
                {p.logo ? (
                  <Image
                    src={`/img/${p.logo}`}
                    alt={p.nom}
                    width={160}
                    height={90}
                    className="max-h-[78px] w-auto object-contain"
                  />
                ) : (
                  <span className="text-[15px] font-bold tracking-[0.02em] text-dark-2 text-center">{p.nom}</span>
                )}
              </div>
              {p.logo && (
                <div className="partner-card-name absolute inset-x-0 bottom-0 h-9 bg-darker flex items-center justify-center px-2">
                  <span className="text-white text-[11.5px] font-semibold text-center leading-tight">{p.nom}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {partenariats.length > 0 && (
        <section className="bg-cream py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="text-[12px] font-bold tracking-[0.1em] text-lime mb-3.5">PARTENARIATS STRATÉGIQUES</div>
            <h2 className="text-[28px] md:text-[38px] tracking-[-0.01em] mb-12">Des collaborations de long terme</h2>
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
              {partenariats.map((p) => (
                <div key={p.slug} className="border-l-2 border-lime pl-6 flex flex-col gap-2">
                  <div className="text-[12px] font-semibold text-dark-2 tracking-[0.05em]">{p.client.toUpperCase()}</div>
                  <h3 className="text-[18px] tracking-[-0.01em]">{p.titre}</h3>
                  <p className="text-[14px] text-ink-soft leading-relaxed">{p.resume}</p>
                  <div className="text-[12px] text-ink-faint mt-1">{p.periode}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
