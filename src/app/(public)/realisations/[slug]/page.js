import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjetBySlug, getProjets, secteurs } from "@/lib/db";
import ProjectCard from "@/components/ProjectCard";

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
  const similaires = (await getProjets({ secteur: projet.secteur })).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <article>
      <section className="relative h-[280px] md:h-[380px]">
        <Image src={projet.photo_url} alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-5 md:px-8 pb-8 w-full">
            <Link href="/realisations" className="text-white/80 text-[13.5px] font-medium mb-4 block w-fit">
              ← Toutes les réalisations
            </Link>
            <span className="block text-[11px] font-bold tracking-[0.1em] text-lime-2 mb-3">
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
                <li key={r} className="flex items-start gap-2.5 text-[14.5px] text-ink-soft leading-relaxed">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-lime mt-[3px] shrink-0"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  {r}
                </li>
              ))}
            </ul>
          </>
        )}

        <Link
          href="/contact"
          className="inline-flex items-center rounded bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink active:scale-[0.97] transition-transform hover:bg-lime-2"
        >
          Discuter d&apos;un projet similaire
        </Link>
      </section>

      {similaires.length > 0 && (
        <section className="bg-cream py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-5 md:px-8">
            <h2 className="text-[22px] md:text-[26px] tracking-[-0.01em] mb-8">Projets similaires</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {similaires.map((p) => (
                <ProjectCard key={p.slug} projet={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
