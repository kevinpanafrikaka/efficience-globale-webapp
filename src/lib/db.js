import { getCloudflareContext } from "@opennextjs/cloudflare";

async function getDB() {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

function parseProjet(row) {
  return { ...row, resultats: row.resultats ? JSON.parse(row.resultats) : [] };
}

export async function getProjets({ secteur } = {}) {
  const db = await getDB();
  const query =
    secteur && secteur !== "all"
      ? db
          .prepare(
            "SELECT * FROM projets WHERE statut = 'publie' AND secteur = ? ORDER BY ordre_affichage ASC"
          )
          .bind(secteur)
      : db.prepare(
          "SELECT * FROM projets WHERE statut = 'publie' ORDER BY ordre_affichage ASC"
        );
  const { results } = await query.all();
  return results.map(parseProjet);
}

export async function getProjetsRecents(limit = 6) {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT * FROM projets WHERE statut = 'publie' ORDER BY cree_le DESC LIMIT ?")
    .bind(limit)
    .all();
  return results.map(parseProjet);
}

export async function getProjetBySlug(slug) {
  const db = await getDB();
  const row = await db
    .prepare("SELECT * FROM projets WHERE slug = ? AND statut = 'publie'")
    .bind(slug)
    .first();
  return row ? parseProjet(row) : null;
}

export async function getAllProjetSlugs() {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT slug FROM projets WHERE statut = 'publie'")
    .all();
  return results.map((r) => r.slug);
}

export async function getMembres() {
  const db = await getDB();
  const { results } = await db
    .prepare(
      "SELECT * FROM membres WHERE statut = 'publie' ORDER BY ordre_affichage ASC"
    )
    .all();
  return results;
}

export async function getAnnonces() {
  const db = await getDB();
  const { results } = await db
    .prepare(
      "SELECT * FROM annonces WHERE statut = 'publie' ORDER BY date DESC"
    )
    .all();
  return results;
}

export const secteurs = {
  sante: { label: "Santé publique", color: "#00897B" },
  ia: { label: "Intelligence Artificielle", color: "#7CB342" },
  education: { label: "Éducation", color: "#B7891E" },
  gouvernance: { label: "Gouvernance", color: "#3D5347" },
  local: { label: "Développement local", color: "#B7C233" },
  partenariat: { label: "Partenariat", color: "#6B4EA6" },
};
