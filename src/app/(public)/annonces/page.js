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
          <h1 className="text-white text-[36px] md:text-[56px] leading-[1.05] tracking-[-0.02em] mb-5 max-w-2xl">
            Les dernières <span className="text-lime italic">nouvelles</span> du cabinet
          </h1>
          <p className="text-[#d3ddce] text-[16px] md:text-[17px] leading-relaxed max-w-xl">
            Missions, partenariats, prises de parole : ce qui se passe chez Efficience Globale, au fil de l&apos;eau.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-24">
        {annonces.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-line">
            <p className="text-[16px] text-dark mb-1.5">Aucune annonce publiée pour le moment</p>
            <p className="text-[13.5px] text-ink-faint">
              Les prochaines nouvelles du cabinet apparaîtront ici.
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
