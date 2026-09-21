import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-darker text-[#8fa189] safe-bottom">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Image src="/img/logo-eg.png" alt="Efficience Globale" width={130} height={42} className="h-6 w-auto brightness-0 invert opacity-90" />
          </div>
          <nav className="flex flex-wrap gap-5 text-[13.5px]">
            <Link href="/">Accueil</Link>
            <Link href="/a-propos">À propos</Link>
            <Link href="/realisations">Réalisations</Link>
            <Link href="/equipe">Équipe</Link>
            <Link href="/actualites">Actualités</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
        <div className="pt-6 text-[13px] text-center">
          © {new Date().getFullYear()} Efficience Globale. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
