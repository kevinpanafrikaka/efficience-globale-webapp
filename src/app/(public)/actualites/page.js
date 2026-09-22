import { getAnnonces } from "@/lib/db";

export const metadata = {
  title: "Actualités",
  description: "Les dernières actualités d'Efficience Globale.",
};

export const dynamic = "force-dynamic";

export default async function ActualitesPage() {
  const annonces = await getAnnonces();

  return (
    <>
      <section className="py-14 md:py-16" style={{ background: "linear-gradient(120deg, #2e3f32 0%, #16211a 100%)" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-lime-2 text-[12.5px] font-bold tracking-wide mb-3.5">ACTUALITÉS</div>
          <h1 className="text-white text-[28px] md:text-[42px] leading-tight">Les dernières nouvelles du cabinet</h1>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20">
        {annonces.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-[16px] text-ink-soft">Aucune annonce publiée pour le moment.</p>
            <p className="text-[13.5px] text-ink-faint mt-2">
              Les actualités publiées depuis l&apos;espace admin apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {annonces.map((a) => (
              <article key={a.slug} className="border border-line rounded-xl p-6">
                <div className="text-[12.5px] text-ink-faint mb-2">{a.date}</div>
                <h2 className="text-[19px] mb-2.5">{a.titre}</h2>
                <p className="text-[14.5px] text-ink-soft leading-relaxed">{a.texte}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
