import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjetBySlug, secteurs } from "@/lib/db";

// Dynamique : le slug est résolu contre D1 à la requête, pas connu au
// build — nécessaire puisque l'admin peut ajouter des projets sans
// redéploiement.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const projet = await getProjetBySlug(slug);
  if (!projet) return {};
  return { title: projet.titre, description: projet.resume };
}

export default async function ProjetDetailPage({ params }) {
  const { slug } = await params;
  const projet = await getProjetBySlug(slug);
  if (!projet) notFound();

  const secteur = secteurs[projet.secteur] ?? { label: projet.secteur, color: "#3D5347" };

  return (
    <article>
      <section className="relative h-[280px] md:h-[380px]">
        <Image src={projet.photo_url} alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-5 md:px-8 pb-8 w-full">
            <Link href="/realisations" className="text-white/80 text-[13.5px] font-medium mb-3 inline-block">
              ← Toutes les réalisations
            </Link>
            <span className="inline-block text-[11px] font-bold tracking-[0.1em] mb-3" style={{ color: "#fff" }}>
              {secteur.label.toUpperCase()}
            </span>
            <h1 className="text-white text-[26px] md:text-[40px] leading-[1.05] tracking-[-0.01em] max-w-2xl">
              {projet.titre}
            </h1>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 mb-12 text-[13.5px] border-t border-b border-line">
          <div className="py-5 pr-4">
            <div className="text-ink-faint mb-1">Client / bailleur</div>
            <div className="font-semibold text-dark">{projet.client}</div>
          </div>
          <div className="py-5 pl-4 border-l border-line">
            <div className="text-ink-faint mb-1">Période</div>
            <div className="font-semibold text-dark">{projet.periode}</div>
          </div>
        </div>

        {projet.description && (
          <p className="text-[17px] leading-relaxed text-ink-soft mb-12 max-w-xl">{projet.description}</p>
        )}

        {projet.resultats?.length > 0 && (
          <>
            <h2 className="text-[20px] tracking-[-0.01em] mb-5">Résultats obtenus</h2>
            <ul className="space-y-2.5 mb-12">
              {projet.resultats.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-[14.5px] text-ink-soft">
                  <span className="mt-2 h-1.5 w-1.5 bg-lime flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </>
        )}

        <Link
          href="/contact"
          className="inline-flex items-center rounded bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform"
        >
          Discuter d&apos;un projet similaire
        </Link>
      </section>
    </article>
  );
}
