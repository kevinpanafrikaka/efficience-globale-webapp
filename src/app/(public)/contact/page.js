import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import { getReglages } from "@/lib/db";
import "./contact.css";

export const metadata = {
  title: "Contact",
  description: "Discutons de votre prochain projet avec Efficience Globale : gouvernance, digitalisation, intelligence artificielle.",
};
export const dynamic = "force-dynamic";

function ContactIcon({ type }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {type === "pin" ? <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></> :
      type === "mail" ? <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></> :
      <path d="M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2Z" />}
  </svg>;
}

export default async function ContactPage() {
  const reglages = await getReglages();
  const telHref = `tel:${(reglages.telephone || "").replace(/[^\d+]/g, "")}`;
  const mapHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(reglages.adresse || "Camayenne, Conakry, Guinée")}`;
  return <div className="eg-page eg-contact">
    <PageHero image="/img/hero-contact.jpg"
      title={<>Discutons de votre prochain <span className="text-lime-2 italic">projet</span></>}
      description="Gouvernance, digitalisation, intelligence artificielle ou renforcement de capacités : parlons de vos objectifs." />

    <section aria-labelledby="contact-heading" className="contact-body eg-container eg-section">
      <div className="contact-intro">
        <span className="contact-intro-line" aria-hidden="true" />
        <h2 id="contact-heading">Votre projet commence <em>ici.</em></h2>
        <p>Une idée à faire grandir, un défi à relever, une équipe à accompagner. Racontez-nous ce qui vous anime.</p>
      </div>

      <div className="contact-layout">
        <aside aria-labelledby="contact-details-heading" className="contact-details">
          <div className="contact-details-top">
            <span className="contact-location"><span aria-hidden="true" /> CONAKRY, GUINÉE</span>
            <h3 id="contact-details-heading">Faisons connaissance.</h3>
            <p>Par message ou de vive voix, choisissons le premier pas qui vous convient.</p>
          </div>
          <div className="contact-detail-list">
            {reglages.email && <a href={`mailto:${reglages.email}`} className="contact-detail">
              <span className="contact-detail-icon"><ContactIcon type="mail" /></span>
              <span><span className="contact-detail-label">Écrivez-nous</span><span className="contact-detail-value">{reglages.email}</span></span>
            </a>}
            {reglages.telephone && <a href={telHref} className="contact-detail">
              <span className="contact-detail-icon"><ContactIcon type="phone" /></span>
              <span><span className="contact-detail-label">Appelez-nous</span><span className="contact-detail-value">{reglages.telephone}</span></span>
            </a>}
            {reglages.adresse && <div className="contact-detail">
              <span className="contact-detail-icon"><ContactIcon type="pin" /></span>
              <span><span className="contact-detail-label">Retrouvez-nous</span><span className="contact-detail-value">{reglages.adresse}</span></span>
            </div>}
          </div>
          <div className="contact-quick-actions">
            {reglages.telephone && <a href={telHref}><ContactIcon type="phone" /> Appeler</a>}
            {reglages.email && <a href={`mailto:${reglages.email}`}><ContactIcon type="mail" /> Écrire</a>}
          </div>
          {reglages.adresse && <a href={mapHref} target="_blank" rel="noopener noreferrer" className="contact-directions" aria-label="Ouvrir l’itinéraire dans Google Maps (nouvel onglet)">Voir l’itinéraire</a>}
          <div className="contact-details-note"><p>Des ambitions locales.<br /><strong>Un regard global.</strong></p></div>
        </aside>

        <div className="contact-form-card">
          <ContactForm emailContact={reglages.email} />
        </div>
      </div>
    </section>
  </div>;
}
