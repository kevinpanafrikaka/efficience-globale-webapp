import { getAnnonces } from "@/lib/db";

export const metadata = {
  title: "Annonces",
  description: "Les dernières annonces d'Efficience Globale.",
};

export const dynamic = "force-dynamic";

export default async function AnnoncesPage() {
  const annonces = await getAnnonces();

  return (
    <>
      <section className="py-16 md:py-24 bg-darker">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-white/15 w-fit">
            <span className="text-[12px] font-bold tracking-[0.14em] text-lime-2">ANNONCES</span>
          </div>
          <h1 className="text-white text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.02em] max-w-2xl">
            Les dernières nouvelles du cabinet
          </h1>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-24">
        {annonces.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-[16px] text-ink-soft">Aucune annonce publiée pour le moment.</p>
            <p className="text-[13.5px] text-ink-faint mt-2">
              Les annonces publiées depuis l&apos;espace admin apparaîtront ici.
            </p>
          </div>
        ) : (
          <div>
            {annonces.map((a, i, arr) => (
              <article key={a.slug} className={`py-8 ${i < arr.length - 1 ? "border-b border-line" : ""}`}>
                <div className="text-[12.5px] text-ink-faint mb-2 tabular-nums">{a.date}</div>
                <h2 className="text-[20px] tracking-[-0.01em] mb-2.5">{a.titre}</h2>
                <p className="text-[14.5px] text-ink-soft leading-relaxed">{a.texte}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
