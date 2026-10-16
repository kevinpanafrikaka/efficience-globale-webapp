import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Le Footer lit les réglages (coordonnées, réseaux) en base : pas de rendu statique.
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }) {
  return (
    <>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <Header />
      <main id="contenu" tabIndex={-1} className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
