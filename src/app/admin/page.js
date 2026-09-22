export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Placeholder — sera remplacé par l'authentification puis les pages de
// gestion (projets, équipe, annonces) une fois D1 branché.
export default function AdminPage() {
  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <h1 className="text-[22px] mb-3">Espace admin</h1>
      <p className="text-[14.5px] text-ink-soft">
        Authentification et gestion des projets, membres et annonces — à venir.
      </p>
    </div>
  );
}
