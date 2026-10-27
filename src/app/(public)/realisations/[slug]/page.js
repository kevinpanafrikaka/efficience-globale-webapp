import Image from "@/components/PublicImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjetBySlug, getProjets } from "@/lib/db";
import ProjectCard from "@/components/ProjectCard";
import ProjectPageEntry from "@/components/ProjectPageEntry";

// Dynamique : le slug est résolu contre D1 à la requête, pas connu au
// build — nécessaire puisque l'admin peut ajouter des projets sans
// redéploiement.
export const dynamic = "force-dynamic";

// Met en italique-lime la sous-chaîne désignée par titre_accent (colonne
// D1 éditable par l'admin) — un choix humain par projet, pas une
// heuristique automatique.
function renderTitre(titre, accent) {
  const i = accent ? titre.indexOf(accent) : -1;
  if (i === -1) return titre;
  return (
    <>
      {titre.slice(0, i)}
      <span className="text-lime-2 italic">{accent}</span>
      {titre.slice(i + accent.length)}
    </>
  );
}

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

  const similaires = (await getProjets({ secteur: projet.secteur })).filter((p) => p.slug !== slug).slice(0, 3);
  const presentation = projet.description?.trim() || projet.resume?.trim();

  return (
    <article className="eg-page eg-project-detail">
      <ProjectPageEntry slug={slug} />
      <section className="eg-project-hero relative min-h-[380px] md:min-h-[480px] overflow-hidden bg-darker">
        <Image src={projet.photo_url} alt="" fill sizes="100vw" priority className="object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(13,19,14,0.88) 0%, rgba(13,19,14,0.55) 45%, rgba(13,19,14,0.3) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(0deg, rgba(10,15,11,0.8) 0%, rgba(10,15,11,0.15) 45%)" }}
        />
        <div className="relative flex items-end min-h-[380px] md:min-h-[480px] pt-12">
          <div className="max-w-4xl mx-auto px-5 md:px-8 pb-8 w-full">
            <Link
              href="/realisations"
              className="inline-flex items-center rounded border-[1.5px] border-white/40 px-3.5 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white/10 mb-5 w-fit"
            >
              Toutes les réalisations
            </Link>
            <h1 className="text-white text-[26px] md:text-[40px] leading-[1.05] tracking-[-0.01em] max-w-2xl mb-5">
              {renderTitre(projet.titre, projet.titre_accent)}
            </h1>
            <div className="flex flex-wrap gap-x-8 gap-y-1.5 text-[13.5px] text-white/85">
              <div>
                <span className="text-white/75">Client / bailleur : </span>
                {projet.client}
              </div>
              <div>
                <span className="text-white/75">Période : </span>
                {projet.periode}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="project-presentation-heading" className="eg-container eg-section eg-project-presentation">
        <h2 id="project-presentation-heading" className="text-[24px] md:text-[28px] tracking-[-0.01em] mb-5">À propos du projet</h2>
        <p className="text-[16px] md:text-[17px] leading-relaxed text-ink-soft mb-10 max-w-3xl whitespace-pre-line">
          {presentation || "La présentation détaillée de ce projet sera bientôt disponible. Contactez-nous pour en savoir plus."}
        </p>

        {projet.resultats?.length > 0 && (
          <>
            <h2 className="text-[20px] tracking-[-0.01em] mb-5">Résultats obtenus</h2>
            <ul className="eg-project-results mb-12">
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
          className="eg-button eg-button--primary eg-project-contact"
        >
          Discuter d&apos;un projet similaire
        </Link>
      </section>

      {similaires.length > 0 && (
        <section className="bg-cream py-16 md:py-20">
          <div className="eg-container">
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
