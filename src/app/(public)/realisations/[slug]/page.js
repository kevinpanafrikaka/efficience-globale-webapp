import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjetBySlug, getProjets } from "@/lib/db";
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

  const similaires = (await getProjets({ secteur: projet.secteur })).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <article>
      <section className="relative h-[380px] md:h-[480px] overflow-hidden">
        <Image src={projet.photo_url} alt="" fill priority className="object-cover" />
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
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-5 md:px-8 pb-8 w-full">
            <Link
              href="/realisations"
              className="inline-flex items-center rounded border-[1.5px] border-white/40 px-3.5 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white/10 mb-5 w-fit"
            >
              ← Toutes les réalisations
            </Link>
            <h1 className="text-white text-[26px] md:text-[40px] leading-[1.05] tracking-[-0.01em] max-w-2xl mb-5">
              {projet.titre}
            </h1>
            <div className="flex flex-wrap gap-x-8 gap-y-1.5 text-[13.5px] text-white/85">
              <div>
                <span className="text-white/50">Client / bailleur : </span>
                {projet.client}
              </div>
              <div>
                <span className="text-white/50">Période : </span>
                {projet.periode}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-16">
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
