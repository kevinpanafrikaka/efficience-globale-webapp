"use client";
export default function AdminError({ reset }) {
  return <div className="admin-note" role="alert"><h1>Cette page n’a pas pu être chargée.</h1><p>Vos contenus enregistrés sont conservés. Vérifiez votre connexion puis réessayez.</p><button type="button" onClick={reset} className="mt-4 rounded-lg bg-lime px-5 py-3 font-semibold">Réessayer</button></div>;
}
