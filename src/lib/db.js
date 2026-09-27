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

// ===== Admin : projets (tous statuts) =====

export function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getAllProjets() {
  const db = await getDB();
  const { results } = await db.prepare("SELECT * FROM projets ORDER BY ordre_affichage ASC").all();
  return results.map(parseProjet);
}

export async function getProjetById(id) {
  const db = await getDB();
  const row = await db.prepare("SELECT * FROM projets WHERE id = ?").bind(id).first();
  return row ? parseProjet(row) : null;
}

export async function createProjet(data) {
  const db = await getDB();
  const id = slugify(data.titre);
  await db
    .prepare(
      `INSERT INTO projets (id, slug, titre, titre_accent, secteur, client, periode, montant, resume, description, resultats, photo_url, statut, ordre_affichage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      id,
      data.titre,
      data.titre_accent || null,
      data.secteur,
      data.client || null,
      data.periode || null,
      data.montant || null,
      data.resume || null,
      data.description || null,
      JSON.stringify(data.resultats || []),
      data.photo_url || null,
      data.statut || "brouillon",
      data.ordre_affichage ?? 0
    )
    .run();
  return id;
}

export async function updateProjet(id, data) {
  const db = await getDB();
  await db
    .prepare(
      `UPDATE projets SET titre = ?, titre_accent = ?, secteur = ?, client = ?, periode = ?, montant = ?, resume = ?, description = ?, resultats = ?, photo_url = ?, statut = ?, ordre_affichage = ?, maj_le = datetime('now')
       WHERE id = ?`
    )
    .bind(
      data.titre,
      data.titre_accent || null,
      data.secteur,
      data.client || null,
      data.periode || null,
      data.montant || null,
      data.resume || null,
      data.description || null,
      JSON.stringify(data.resultats || []),
      data.photo_url || null,
      data.statut || "brouillon",
      data.ordre_affichage ?? 0,
      id
    )
    .run();
}

export async function deleteProjet(id) {
  const db = await getDB();
  await db.prepare("DELETE FROM projets WHERE id = ?").bind(id).run();
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

// ===== Admin : membres (tous statuts) =====

export async function getAllMembres() {
  const db = await getDB();
  const { results } = await db.prepare("SELECT * FROM membres ORDER BY ordre_affichage ASC").all();
  return results;
}

export async function getMembreById(id) {
  const db = await getDB();
  return db.prepare("SELECT * FROM membres WHERE id = ?").bind(id).first();
}

export async function createMembre(data) {
  const db = await getDB();
  const id = slugify(data.nom);
  await db
    .prepare(
      `INSERT INTO membres (id, nom, role, bio, photo_url, ordre_affichage, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, data.nom, data.role || null, data.bio || null, data.photo_url || null, data.ordre_affichage ?? 0, data.statut || "brouillon")
    .run();
  return id;
}

export async function updateMembre(id, data) {
  const db = await getDB();
  await db
    .prepare(
      `UPDATE membres SET nom = ?, role = ?, bio = ?, photo_url = ?, ordre_affichage = ?, statut = ?, maj_le = datetime('now')
       WHERE id = ?`
    )
    .bind(data.nom, data.role || null, data.bio || null, data.photo_url || null, data.ordre_affichage ?? 0, data.statut || "brouillon", id)
    .run();
}

export async function deleteMembre(id) {
  const db = await getDB();
  await db.prepare("DELETE FROM membres WHERE id = ?").bind(id).run();
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
