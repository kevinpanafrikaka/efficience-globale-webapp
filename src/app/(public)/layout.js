import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./public-site.css";

// Le Footer lit les réglages (coordonnées, réseaux) en base : pas de rendu statique.
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }) {
  return (
    <div className="public-site flex min-h-screen flex-col">
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <Header />
      <main id="contenu" tabIndex={-1} className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
