import PageHero from "@/components/PageHero";
import Link from "next/link";
import { PageIntro } from "@/components/PublicEditorial";
import Image from "@/components/PublicImage";
import { getAnnonces } from "@/lib/db";
import { announcementDate, announcementExcerpt } from "@/lib/announcements.mjs";

export const metadata = {
  title: "Annonces",
  description: "Les dernières annonces d'Efficience Globale.",
};

export const dynamic = "force-dynamic";

export default async function AnnoncesPage() {
  const annonces = await getAnnonces();
  return <div className="eg-page eg-news">
    <PageHero image="/img/hero-annonces.jpg" title={<>Les dernières <span className="text-lime-2 italic">nouvelles</span> du cabinet</>} description="Missions, partenariats, prises de parole : ce qui se passe chez Efficience Globale, au fil de l’eau." />
    <section className="eg-container eg-section" aria-labelledby="news-heading"><PageIntro id="news-heading" label="Notre actualité" title={<>Le cabinet<br /><em>en mouvement.</em></>} description="Des nouvelles du terrain et des moments qui rythment la vie d’Efficience Globale." />
      {annonces.length === 0 ? <div className="eg-news-empty"><span className="eg-news-seal" aria-hidden="true">EG</span><div><h3>Les prochaines nouvelles s’écrivent sur le terrain.</h3><p>Aucune annonce publiée pour le moment. Retrouvez dès maintenant les projets et collaborations du cabinet.</p><Link href="/realisations" className="eg-button eg-button--secondary">Explorer nos réalisations</Link></div></div> : <div className="eg-news-grid">{annonces.map((a) => <Link key={a.slug} href={`/annonces/${a.slug}`} className="project-card eg-news-card group relative flex h-full flex-col active:opacity-80">
        <div className="project-card-photo relative shrink-0 overflow-hidden">{a.image_url ? <Image src={a.image_url} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="pointer-events-none object-cover" /> : <span className="eg-news-card-placeholder" aria-hidden="true">EG</span>}</div>
        <div className="project-card-copy flex flex-col gap-2.5 flex-1"><time dateTime={a.date} className="eg-news-date">{announcementDate(a.date)}</time><h3>{a.titre}</h3><p>{announcementExcerpt(a.texte)}</p></div>
      </Link>)}</div>}
    </section>
  </div>;
}
