import Image from "next/image";
import { getProjets, getPartenaires } from "@/lib/db";
import PartnerCard from "@/components/PartnerCard";

export const metadata = {
  title: "Partenaires",
  description: "Les bailleurs, institutions et partenaires stratégiques d'Efficience Globale.",
};

export const dynamic = "force-dynamic";

export default async function PartenairesPage() {
  const [partenariats, bailleurs] = await Promise.all([
    getProjets({ secteur: "partenariat" }),
    getPartenaires(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/img/hero-partenaires.jpg" alt="" fill className="object-cover" priority />
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
            Ils nous font <span className="text-lime italic">confiance</span>
          </h1>
          <p className="text-[#d3ddce] text-[16px] md:text-[17px] leading-relaxed max-w-xl">
            Bailleurs, institutions académiques et organisations de la société civile : des partenaires de premier
            plan qui nous accordent leur confiance à travers l&apos;Afrique de l&apos;Ouest.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="flex items-baseline gap-3 mb-8">
          <div className="text-[12px] font-bold tracking-[0.1em] text-lime">BAILLEURS &amp; INSTITUTIONS</div>
          <div className="text-[12px] text-ink-faint">{bailleurs.length} institutions partenaires actives</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {bailleurs.map((p) => (
            <PartnerCard key={p.id} partenaire={p} />
          ))}
        </div>
      </section>

      {partenariats.length > 0 && (
        <section className="bg-cream py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="text-[12px] font-bold tracking-[0.1em] text-lime mb-3.5">PARTENARIATS STRATÉGIQUES</div>
            <h2 className="text-[28px] md:text-[38px] tracking-[-0.01em] mb-4">
              Des <span className="text-lime italic">collaborations</span> de long terme
            </h2>
            <p className="text-[15.5px] text-ink-soft leading-relaxed max-w-2xl mb-12">
              Des accords-cadres et protocoles d&apos;entente qui structurent notre collaboration avec des
              institutions académiques, associatives et internationales sur plusieurs années.
            </p>
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
              {partenariats.map((p) => (
                <div key={p.slug} className="border-l-2 border-lime pl-6 flex flex-col gap-2">
                  <div className="text-[12px] font-semibold text-dark-2 tracking-[0.05em]">{p.client.toUpperCase()}</div>
                  <h3 className="text-[18px] tracking-[-0.01em]">{p.titre}</h3>
                  <p className="text-[14px] text-ink-soft leading-relaxed">{p.resume}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
