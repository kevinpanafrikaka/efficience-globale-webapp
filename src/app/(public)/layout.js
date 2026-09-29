import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Le Footer lit les réglages (coordonnées, réseaux) en base : pas de rendu statique.
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
