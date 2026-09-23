import Link from "next/link";
import Image from "next/image";

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

export default function Footer() {
  return (
    <footer className="bg-darker text-[#8fa189] safe-bottom">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-14">
        <div className="grid md:grid-cols-[1.2fr_1fr_1fr] gap-10 pb-10 border-b border-white/10">
          {/* Marque */}
          <div>
            <Image
              src="/img/logo-eg.png"
              alt="Efficience Globale"
              width={150}
              height={48}
              className="h-7 w-auto brightness-0 invert opacity-95 mb-4"
            />
            <p className="text-[13.5px] leading-relaxed max-w-xs">
              Cabinet de conseil en stratégie et gestion, au service de la gouvernance, de la digitalisation et de
              l&apos;intelligence artificielle en Afrique de l&apos;Ouest.
            </p>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-[12px] font-bold tracking-wide text-white/50 mb-3">CABINET</div>
              <nav className="flex flex-col gap-2 text-[13.5px]">
                {NAV_CABINET.map((l) => (
                  <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <div className="text-[12px] font-bold tracking-wide text-white/50 mb-3">ACTIVITÉ</div>
              <nav className="flex flex-col gap-2 text-[13.5px]">
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
            <div className="text-[12px] font-bold tracking-wide text-white/50 mb-3">CONTACT</div>
            <div className="flex flex-col gap-3 text-[13.5px]">
              <div className="flex items-start gap-2.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8fa189" strokeWidth="1.8" className="mt-0.5 flex-shrink-0">
                  <path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span>Camayenne, Conakry, Guinée</span>
              </div>
              <a href="mailto:oumar.camara@efficienceglobale.com" className="flex items-start gap-2.5 hover:text-white transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8fa189" strokeWidth="1.8" className="mt-0.5 flex-shrink-0">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                <span>oumar.camara@efficienceglobale.com</span>
              </a>
              <a href="tel:+224626852951" className="flex items-start gap-2.5 hover:text-white transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8fa189" strokeWidth="1.8" className="mt-0.5 flex-shrink-0">
                  <path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2C9.5 22 2 14.5 2 6a2 2 0 0 1 2-2z" />
                </svg>
                <span>+224 626 852 951</span>
              </a>
              <Link
                href="/contact"
                className="inline-flex w-fit items-center rounded bg-lime px-4 py-2 text-[13px] font-semibold text-ink mt-1 active:scale-[0.97] transition-transform"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-6 text-[13px] text-center">
          © {new Date().getFullYear()} Efficience Globale. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
