import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import { getReglages } from "@/lib/db";

export const metadata = {
  title: "Contact",
  description: "Discutons de votre prochain projet avec Efficience Globale : gouvernance, digitalisation, intelligence artificielle.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const reglages = await getReglages();
  const telHref = `tel:${reglages.telephone.replace(/[^\d+]/g, "")}`;
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/img/hero-contact.jpg" alt="" fill className="object-cover" priority />
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
            Discutons de votre prochain <span className="text-lime italic">projet</span>
          </h1>
          <p className="text-[#d3ddce] text-[16px] md:text-[17px] leading-relaxed max-w-xl">
            Gouvernance, digitalisation, intelligence artificielle ou renforcement de capacités : parlons de vos
            objectifs.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-12 md:gap-16">
          <div>
            <div className="text-[12px] font-bold tracking-[0.1em] text-lime mb-6">ENVOYEZ-NOUS UN MESSAGE</div>
            <ContactForm emailContact={reglages.email} />
          </div>

          <div className="bg-cream border border-line p-6 md:p-8 h-fit">
            <div className="text-[12px] font-bold tracking-[0.1em] text-lime mb-6">NOS COORDONNÉES</div>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-white border border-line flex items-center justify-center text-lime shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-ink-faint mb-0.5">ADRESSE</div>
                  <div className="text-[14.5px] text-dark">{reglages.adresse}</div>
                </div>
              </div>

              <a href={`mailto:${reglages.email}`} className="flex items-start gap-3.5 group">
                <div className="w-9 h-9 rounded-lg bg-white border border-line flex items-center justify-center text-lime shrink-0 transition-colors group-hover:border-lime">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-ink-faint mb-0.5">EMAIL</div>
                  <div className="text-[14.5px] text-dark group-hover:text-lime transition-colors">
                    {reglages.email}
                  </div>
                </div>
              </a>

              <a href={telHref} className="flex items-start gap-3.5 group">
                <div className="w-9 h-9 rounded-lg bg-white border border-line flex items-center justify-center text-lime shrink-0 transition-colors group-hover:border-lime">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2C9.5 22 2 14.5 2 6a2 2 0 0 1 2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-ink-faint mb-0.5">TÉLÉPHONE</div>
                  <div className="text-[14.5px] text-dark group-hover:text-lime transition-colors">
                    {reglages.telephone}
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
