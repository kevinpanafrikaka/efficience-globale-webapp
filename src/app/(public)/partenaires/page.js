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
  { nom: "Institut Français de Guinée", logo: "partners/institut-francais-logo.png" },
  { nom: "Université Kofi Annan", logo: "partners/kofi-annan-logo.png" },
  { nom: "AGUIPEL", logo: "partners/aguipel-logo.png" },
  { nom: "Ministère de la Santé", logo: "partners/ministere-sante-logo.png" },
];

export default async function PartenairesPage() {
  const partenariats = await getProjets({ secteur: "partenariat" });

  return (
    <>
      <section className="py-14 md:py-16" style={{ background: "linear-gradient(120deg, #2e3f32 0%, #16211a 100%)" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-lime-2 text-[12.5px] font-bold tracking-wide mb-3.5">PARTENAIRES</div>
          <h1 className="text-white text-[28px] md:text-[42px] leading-tight">Ils nous font confiance</h1>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BAILLEURS.map((p) => (
            <div key={p.nom} className="border border-line rounded-xl h-[90px] flex items-center justify-center px-4">
              <Image
                src={`/img/${p.logo}`}
                alt={p.nom}
                width={130}
                height={50}
                className="max-h-[50px] w-auto object-contain grayscale opacity-90"
              />
            </div>
          ))}
        </div>
      </section>

      {partenariats.length > 0 && (
        <section className="bg-cream py-14 md:py-16">
          <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="text-[12.5px] font-bold tracking-wide text-lime mb-3.5">PARTENARIATS STRATÉGIQUES</div>
            <h2 className="text-[26px] md:text-[32px] mb-10">Des collaborations de long terme</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {partenariats.map((p) => (
                <div key={p.slug} className="bg-white rounded-xl p-6 flex flex-col gap-2.5">
                  <div className="text-[12px] font-semibold text-lime">{p.client}</div>
                  <h3 className="text-[16.5px]">{p.titre}</h3>
                  <p className="text-[13.5px] text-ink-soft leading-relaxed">{p.resume}</p>
                  <div className="text-[12px] text-ink-faint border-t border-line pt-3 mt-2">{p.periode}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
