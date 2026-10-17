import PageHero from "@/components/PageHero";
import Image from "@/components/PublicImage";
import { getAnnonces } from "@/lib/db";

export const metadata = {
  title: "Annonces",
  description: "Les dernières annonces d'Efficience Globale.",
};

export const dynamic = "force-dynamic";

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

export default async function AnnoncesPage() {
  const annonces = await getAnnonces();

  return (
    <>
      <PageHero image="/img/hero-annonces.jpg"
        title={<>Les dernières <span className="text-lime-2 italic">nouvelles</span> du cabinet</>}
        description="Missions, partenariats, prises de parole : ce qui se passe chez Efficience Globale, au fil de l’eau." />

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        {annonces.length === 0 ? (
          <div className="text-center py-14 rounded-xl bg-cream border border-dashed border-line">
            <p className="text-[16px] text-dark mb-1.5">Aucune annonce publiée pour le moment</p>
            <p className="text-[13.5px] text-ink-faint">
              Les prochaines nouvelles du cabinet apparaîtront ici.
            </p>
          </div>
        ) : (
          <div>
            {annonces.map((a, i, arr) => (
              <article key={a.slug} className={`py-8 ${i < arr.length - 1 ? "border-b border-line" : ""}`}>
                {a.image_url && <div className="relative aspect-[16/7] max-w-3xl rounded-xl overflow-hidden mb-6"><Image src={a.image_url} alt="" fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" /></div>}
                <time dateTime={a.date} className="block text-[12.5px] text-ink-faint mb-2 tabular-nums">{formatDate(a.date)}</time>
                <h2 className="text-[20px] tracking-[-0.01em] mb-2.5">{a.titre}</h2>
                <p className="text-[15px] text-ink-soft leading-relaxed whitespace-pre-line max-w-3xl">{a.texte}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
