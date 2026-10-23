import PageHero from "@/components/PageHero";
import AnnouncementsGrid from "@/components/AnnouncementsGrid";
import { getAnnonces } from "@/lib/db";
export const metadata = { title: "Annonces", description: "Les actualités et opportunités d’Efficience Globale." };
export const dynamic = "force-dynamic";
export default async function AnnoncesPage() {
  const annonces = await getAnnonces();
  return <div className="eg-page eg-news">
    <PageHero image="/img/hero-annonces.jpg" title={<>Les <span className="text-lime-2 italic">nouvelles</span> du cabinet</>} description="Les actualités, opportunités et rendez-vous d’Efficience Globale." />
    <section className="eg-container eg-section eg-news-list-section" aria-label="Les annonces du cabinet"><AnnouncementsGrid annonces={annonces} /></section>
  </div>;
}
