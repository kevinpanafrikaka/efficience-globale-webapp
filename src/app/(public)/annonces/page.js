import PageHero from "@/components/PageHero";
import Link from "next/link";
import { PageIntro } from "@/components/PublicEditorial";
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
  return <div className="eg-page eg-news">
    <PageHero image="/img/hero-annonces.jpg" label="Le journal du cabinet" title={<>Les dernières <span className="text-lime-2 italic">nouvelles</span> du cabinet</>} description="Missions, partenariats, prises de parole : ce qui se passe chez Efficience Globale, au fil de l’eau." />
    <section className="eg-container eg-section" aria-labelledby="news-heading"><PageIntro id="news-heading" label="Notre actualité" title={<>Le cabinet<br /><em>en mouvement.</em></>} description="Des nouvelles du terrain et des moments qui rythment la vie d’Efficience Globale." />
      {annonces.length === 0 ? <div className="eg-news-empty"><span className="eg-news-seal" aria-hidden="true">EG</span><div><h3>Les prochaines nouvelles s’écrivent sur le terrain.</h3><p>Aucune annonce publiée pour le moment. Retrouvez dès maintenant les projets et collaborations du cabinet.</p><Link href="/realisations" className="eg-button eg-button--secondary">Explorer nos réalisations</Link></div></div> : <div className="eg-news-grid">{annonces.map((a, i) => <article key={a.slug} className={`eg-news-article ${i === 0 ? "is-featured" : ""} ${a.image_url ? "has-image" : ""}`}>
        {a.image_url && <div className="eg-news-photo"><Image src={a.image_url} alt="" fill sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 50vw, 100vw"} className="object-cover" /></div>}
        <div className="eg-news-copy"><time dateTime={a.date}>{formatDate(a.date)}</time><h3>{a.titre}</h3><p>{a.texte}</p></div>
      </article>)}</div>}
    </section>
  </div>;
}
