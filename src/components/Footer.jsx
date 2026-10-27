import Link from "next/link";
import Image from "next/image";
import { getReglages } from "@/lib/db";

const NAV_CABINET = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/equipe", label: "Notre équipe" },
  { href: "/partenaires", label: "Partenaires" },
];

const NAV_ACTIVITE = [
  { href: "/domaines", label: "Domaines" },
  { href: "/services", label: "Services" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/annonces", label: "Annonces" },
];

const SOCIAL_LINKS = [
  {
    nom: "Facebook",
    key: "facebook",
    icon: (
      <path d="M14 13.5h2.5l.5-3H14V8.5c0-1 .3-1.5 1.6-1.5H17V4.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.7 1.4-3.7 3.9V10.5H8.5v3H11V21h3v-7.5z" />
    ),
  },
  {
    nom: "X",
    key: "x",
    icon: (
      <path d="M13.6 10.7 20 3.5h-1.6l-5.6 6.3-4.6-6.3H3l6.8 9.5L3 21h1.6l6-6.7 4.9 6.7h5.2l-7.1-10.3ZM11.4 13.3l-.7-1L5.1 4.7h2.3l4.5 6.2.7 1 5.8 8h-2.3l-4.7-6.6Z" />
    ),
  },
  {
    nom: "LinkedIn",
    key: "linkedin",
    icon: (
      <path d="M6.9 8.5H3.6V20h3.3V8.5ZM5.2 3.5a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM20.4 20h-3.3v-6c0-1.4 0-3.3-2-3.3s-2.3 1.6-2.3 3.2V20H9.5V8.5h3.2v1.6h.1c.4-.8 1.5-1.8 3.2-1.8 3.4 0 4.4 2.3 4.4 5.3V20Z" />
    ),
  },
];

export default async function Footer() {
  const reglages = await getReglages();
  const telHref = `tel:${reglages.telephone.replace(/[^\d+]/g, "")}`;
  const reseaux = SOCIAL_LINKS.filter((s) => reglages[s.key]);

  return (
    <footer className="bg-darker text-[#8fa189] safe-bottom">
      <div className="public-shell py-10">
        <div className="public-footer-grid grid md:grid-cols-[1.2fr_1fr_1fr] gap-8 pb-8 border-b border-white/10">
          {/* Marque */}
          <div>
            <Image
              src="/img/logo-eg.png"
              alt="Efficience Globale"
              width={150}
              height={48}
              className="h-7 w-auto brightness-0 invert opacity-95 mb-3"
            />
            <p className="text-[13px] leading-relaxed max-w-xs">
              Cabinet de conseil en stratégie et gestion, au service de la gouvernance, de la digitalisation et de
              l&apos;intelligence artificielle en Afrique de l&apos;Ouest.
            </p>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-[11.5px] font-bold tracking-wide text-white/50 mb-2.5">CABINET</div>
              <nav aria-label="Liens du cabinet" className="flex flex-col gap-1.5 text-[13px]">
                {NAV_CABINET.map((l) => (
                  <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <div className="text-[11.5px] font-bold tracking-wide text-white/50 mb-2.5">ACTIVITÉ</div>
              <nav aria-label="Liens des activités" className="flex flex-col gap-1.5 text-[13px]">
                {NAV_ACTIVITE.map((l) => (
                  <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="text-[11.5px] font-bold tracking-wide text-white/50 mb-2.5">CONTACT</div>
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex items-start gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8fa189" strokeWidth="1.8" className="mt-0.5 flex-shrink-0">
                  <path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span>{reglages.adresse}</span>
              </div>
              <a href={`mailto:${reglages.email}`} className="flex items-start gap-2.5 hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8fa189" strokeWidth="1.8" className="mt-0.5 flex-shrink-0">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                <span>{reglages.email}</span>
              </a>
              <a href={telHref} className="flex items-start gap-2.5 hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8fa189" strokeWidth="1.8" className="mt-0.5 flex-shrink-0">
                  <path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2C9.5 22 2 14.5 2 6a2 2 0 0 1 2-2z" />
                </svg>
                <span>{reglages.telephone}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-5 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 text-[12.5px]">
          <div>© {new Date().getFullYear()} Efficience Globale. Tous droits réservés.</div>
          <div className="public-social-links flex items-center gap-2">
            {reseaux.map((s) => (
              <a
                key={s.nom}
                href={reglages[s.key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.nom}
                className="text-[#8fa189] hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  {s.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
