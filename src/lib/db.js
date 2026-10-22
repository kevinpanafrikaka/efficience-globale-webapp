import { expertiseTags } from "@/lib/member-expertises.mjs";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { equipeStats as equipeStatsParDefaut } from "@/data/team";

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

// Projets publiés : `total` (tout) et `realises` (hors partenariats).
export async function countProjets() {
  const db = await getDB();
  const row = await db
    .prepare(
      "SELECT COUNT(*) AS total, SUM(secteur != 'partenariat') AS realises FROM projets WHERE statut = 'publie'"
    )
    .first();
  return { total: row?.total ?? 0, realises: row?.realises ?? 0 };
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

// Renvoie `base`, ou `base-2`, `base-3`... si la valeur est déjà prise dans `table`.
async function uniqueId(db, table, base, column = "id") {
  const root = base || "element";
  let candidate = root;
  let n = 2;
  while (await db.prepare(`SELECT 1 FROM ${table} WHERE ${column} = ?`).bind(candidate).first()) {
    candidate = `${root}-${n++}`;
  }
  return candidate;
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
  const id = await uniqueId(db, "projets", slugify(data.titre));
  const slug = await uniqueId(db, "projets", id, "slug");
  await db
    .prepare(
      `INSERT INTO projets (id, slug, titre, titre_accent, secteur, client, periode, resume, description, resultats, photo_url, statut, ordre_affichage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      slug,
      data.titre,
      data.titre_accent || null,
      data.secteur,
      data.client || null,
      data.periode || null,
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

// Met à jour un projet. Si `data.slug` est fourni et différent, il est normalisé puis rendu unique.
export async function updateProjet(id, data) {
  const db = await getDB();
  let slug = null;
  if (data.slug) {
    const wanted = slugify(data.slug);
    const current = await db.prepare("SELECT slug FROM projets WHERE id = ?").bind(id).first();
    if (wanted && wanted !== current?.slug) {
      slug = await uniqueId(db, "projets", wanted, "slug");
    }
  }
  await db
    .prepare(
      `UPDATE projets SET slug = COALESCE(?, slug), titre = ?, titre_accent = ?, secteur = ?, client = ?, periode = ?, resume = ?, description = ?, resultats = ?, photo_url = ?, statut = ?, ordre_affichage = ?, maj_le = datetime('now')
       WHERE id = ?`
    )
    .bind(
      slug,
      data.titre,
      data.titre_accent || null,
      data.secteur,
      data.client || null,
      data.periode || null,
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
  const id = await uniqueId(db, "membres", slugify(data.nom));
  await db
    .prepare(
      `INSERT INTO membres (id, nom, role, bio, photo_url, ordre_affichage, statut, expertises)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, data.nom, data.role || null, data.bio || null, data.photo_url || null, data.ordre_affichage ?? 0, data.statut || "brouillon", expertiseTags(data.expertises).join(", "))
    .run();
  return id;
}

export async function updateMembre(id, data) {
  const db = await getDB();
  await db
    .prepare(
      `UPDATE membres SET nom = ?, role = ?, bio = ?, photo_url = ?, ordre_affichage = ?, statut = ?, expertises = ?, maj_le = datetime('now')
       WHERE id = ?`
    )
    .bind(data.nom, data.role || null, data.bio || null, data.photo_url || null, data.ordre_affichage ?? 0, data.statut || "brouillon", expertiseTags(data.expertises).join(", "), id)
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

export async function getAnnonceBySlug(slug) {
  const db = await getDB();
  return db.prepare("SELECT * FROM annonces WHERE slug = ? AND statut = 'publie'").bind(slug).first();
}

// ===== Admin : annonces (tous statuts) =====

export async function getAllAnnonces() {
  const db = await getDB();
  const { results } = await db.prepare("SELECT * FROM annonces ORDER BY date DESC").all();
  return results;
}

export async function getAnnonceById(id) {
  const db = await getDB();
  return db.prepare("SELECT * FROM annonces WHERE id = ?").bind(id).first();
}

export async function createAnnonce(data) {
  const db = await getDB();
  const id = await uniqueId(db, "annonces", slugify(data.titre));
  await db
    .prepare(
      `INSERT INTO annonces (id, slug, titre, texte, image_url, date, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, id, data.titre, data.texte, data.image_url || null, data.date, data.statut || "brouillon")
    .run();
  return id;
}

export async function updateAnnonce(id, data) {
  const db = await getDB();
  await db
    .prepare(`UPDATE annonces SET titre = ?, texte = ?, image_url = ?, date = ?, statut = ? WHERE id = ?`)
    .bind(data.titre, data.texte, data.image_url || null, data.date, data.statut || "brouillon", id)
    .run();
}

export async function deleteAnnonce(id) {
  const db = await getDB();
  await db.prepare("DELETE FROM annonces WHERE id = ?").bind(id).run();
}

// ===== Partenaires =====

// Valeurs affichées tant que la migration 001 n'a pas été appliquée sur D1.
const PARTENAIRES_PAR_DEFAUT = [
  { id: "gavi", nom: "Gavi", logo_url: "/img/partners/gavi-logo.png" },
  { id: "unicef", nom: "UNICEF", logo_url: "/img/partners/unicef-logo.png" },
  { id: "expertise-france", nom: "Expertise France", logo_url: "/img/partners/expertise-france-logo.png" },
  { id: "banque-mondiale", nom: "Banque Mondiale", logo_url: "/img/partners/world-bank-logo.png" },
  { id: "institut-francais", nom: "Institut Français de Guinée", logo_url: "/img/partners/institut-francais-logo-v2.png" },
  { id: "kofi-annan", nom: "Université Kofi Annan", logo_url: "/img/partners/kofi-annan-logo.png" },
  { id: "aguipel", nom: "AGUIPEL", logo_url: null },
  { id: "ministere-sante", nom: "Ministère de la Santé", logo_url: "/img/partners/ministere-sante-logo.png" },
];

export async function getPartenaires() {
  try {
    const db = await getDB();
    const { results } = await db
      .prepare("SELECT * FROM partenaires WHERE statut = 'publie' ORDER BY ordre_affichage ASC, rowid ASC")
      .all();
    return results;
  } catch {
    return PARTENAIRES_PAR_DEFAUT;
  }
}

export async function getAllPartenaires() {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT * FROM partenaires ORDER BY ordre_affichage ASC, rowid ASC")
    .all();
  return results;
}

export async function getPartenaireById(id) {
  const db = await getDB();
  return db.prepare("SELECT * FROM partenaires WHERE id = ?").bind(id).first();
}

export async function createPartenaire(data) {
  const db = await getDB();
  const id = await uniqueId(db, "partenaires", slugify(data.nom));
  await db
    .prepare(
      `INSERT INTO partenaires (id, nom, logo_url, site_web, ordre_affichage, statut)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(id, data.nom, data.logo_url || null, data.site_web || null, data.ordre_affichage ?? 0, data.statut || "brouillon")
    .run();
  return id;
}

export async function updatePartenaire(id, data) {
  const db = await getDB();
  await db
    .prepare(
      `UPDATE partenaires SET nom = ?, logo_url = ?, site_web = ?, ordre_affichage = ?, statut = ?, maj_le = datetime('now')
       WHERE id = ?`
    )
    .bind(data.nom, data.logo_url || null, data.site_web || null, data.ordre_affichage ?? 0, data.statut || "brouillon", id)
    .run();
}

export async function deletePartenaire(id) {
  const db = await getDB();
  await db.prepare("DELETE FROM partenaires WHERE id = ?").bind(id).run();
}

// ===== Messages de contact =====

export async function createMessage({ nom, email, sujet, message }) {
  const db = await getDB();
  const id = crypto.randomUUID();
  await db
    .prepare("INSERT INTO messages (id, nom, email, sujet, message) VALUES (?, ?, ?, ?, ?)")
    .bind(id, nom, email, sujet || null, message)
    .run();
  return id;
}

export async function markMessageSent(id) {
  const db = await getDB();
  await db.prepare("UPDATE messages SET envoye = 1 WHERE id = ?").bind(id).run();
}

export async function getAllMessages() {
  const db = await getDB();
  const { results } = await db.prepare("SELECT * FROM messages ORDER BY cree_le DESC").all();
  return results;
}

export async function getMessageById(id) {
  const db = await getDB();
  return db.prepare("SELECT * FROM messages WHERE id = ?").bind(id).first();
}

export async function setMessageLu(id, lu) {
  const db = await getDB();
  await db.prepare("UPDATE messages SET lu = ? WHERE id = ?").bind(lu ? 1 : 0, id).run();
}

export async function deleteMessage(id) {
  const db = await getDB();
  await db.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
}

export async function countMessagesNonLus() {
  try {
    const db = await getDB();
    const row = await db.prepare("SELECT COUNT(*) AS n FROM messages WHERE lu = 0").first();
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}

// ===== Réglages du site =====

export const REGLAGES_PAR_DEFAUT = {
  email: "oumar.camara@efficienceglobale.com",
  telephone: "+224 626 852 951",
  adresse: "Camayenne, Conakry, Guinée",
  // Resend sans domaine vérifié n'envoie qu'à l'adresse du compte Resend.
  email_destinataire: "kevinkandet05@gmail.com",
  facebook: "",
  x: "",
  linkedin: "",
  stats_equipe: JSON.stringify(equipeStatsParDefaut),
};

export async function getReglages() {
  let rows = [];
  try {
    const db = await getDB();
    ({ results: rows } = await db.prepare("SELECT cle, valeur FROM reglages").all());
  } catch {
    // Table absente (migration non appliquée) : on retombe sur les valeurs par défaut.
  }
  const reglages = { ...REGLAGES_PAR_DEFAUT };
  for (const r of rows) reglages[r.cle] = r.valeur;
  return reglages;
}

export function parseStatsEquipe(reglages) {
  try {
    const stats = JSON.parse(reglages.stats_equipe);
    if (Array.isArray(stats)) return stats;
  } catch {}
  return equipeStatsParDefaut;
}

export async function getEquipeStats() {
  return parseStatsEquipe(await getReglages());
}

export async function saveReglages(values) {
  const db = await getDB();
  const cles = Object.keys(REGLAGES_PAR_DEFAUT).filter((k) => k in values);
  if (!cles.length) return;
  await db.batch(
    cles.map((cle) =>
      db
        .prepare("INSERT INTO reglages (cle, valeur) VALUES (?, ?) ON CONFLICT(cle) DO UPDATE SET valeur = excluded.valeur")
        .bind(cle, String(values[cle] ?? ""))
    )
  );
}

// ===== Ordre d'affichage =====

const ORDERABLE_TABLES = ["projets", "membres", "partenaires"];

// Place `id` à la position de `targetId` dans l'ordre global de `table`, puis renumérote 0..n-1.
export async function moveItem(table, id, targetId) {
  if (!ORDERABLE_TABLES.includes(table)) throw new Error("Table non ordonnable.");
  const db = await getDB();
  const { results } = await db
    .prepare(`SELECT id FROM ${table} ORDER BY ordre_affichage ASC, rowid ASC`)
    .all();
  const ids = results.map((r) => r.id);
  const from = ids.indexOf(id);
  const to = ids.indexOf(targetId);
  if (from === -1 || to === -1 || from === to) return;
  ids.splice(to, 0, ids.splice(from, 1)[0]);
  await db.batch(
    ids.map((itemId, i) => db.prepare(`UPDATE ${table} SET ordre_affichage = ? WHERE id = ?`).bind(i, itemId))
  );
}

// ===== Tableau de bord & médias =====

export async function getDashboardStats() {
  const db = await getDB();
  const count = async (sql) => (await db.prepare(sql).first())?.n ?? 0;
  const stats = {
    projets: { publies: await count("SELECT COUNT(*) n FROM projets WHERE statut = 'publie'"), brouillons: await count("SELECT COUNT(*) n FROM projets WHERE statut != 'publie'") },
    membres: { publies: await count("SELECT COUNT(*) n FROM membres WHERE statut = 'publie'"), brouillons: await count("SELECT COUNT(*) n FROM membres WHERE statut != 'publie'") },
    annonces: { publies: await count("SELECT COUNT(*) n FROM annonces WHERE statut = 'publie'"), brouillons: await count("SELECT COUNT(*) n FROM annonces WHERE statut != 'publie'") },
    partenaires: null,
    messagesNonLus: null,
    derniersMessages: [],
  };
  try {
    stats.partenaires = {
      publies: await count("SELECT COUNT(*) n FROM partenaires WHERE statut = 'publie'"),
      brouillons: await count("SELECT COUNT(*) n FROM partenaires WHERE statut != 'publie'"),
    };
    stats.messagesNonLus = await count("SELECT COUNT(*) n FROM messages WHERE lu = 0");
    const { results } = await db.prepare("SELECT id, nom, sujet, lu, cree_le FROM messages ORDER BY cree_le DESC LIMIT 5").all();
    stats.derniersMessages = results;
  } catch {
    // migration 001 non appliquée
  }
  const sources = [
    { table: "projets", title: "titre", image: "photo_url" },
    { table: "membres", title: "nom", image: "photo_url" },
    { table: "annonces", title: "titre", image: "image_url" },
    ...(stats.partenaires ? [{ table: "partenaires", title: "nom", image: "logo_url" }] : []),
  ];
  // Source identifiers are fixed above; no user input enters these queries.
  const latest = async (published, limit) => {
    const query = sources.map(({ table, title, image }) =>
      `SELECT id, ${title} AS titre, ${image} AS image_url, cree_le AS date, '${table}' AS type FROM ${table} WHERE statut ${published ? "= 'publie'" : "!= 'publie'"}`
    ).join(" UNION ALL ");
    const { results } = await db.prepare(`${query} ORDER BY date DESC, type ASC, id ASC LIMIT ?`).bind(limit).all();
    return results;
  };
  [stats.dernieresPublications, stats.derniersBrouillons] = await Promise.all([latest(true, 6), latest(false, 4)]);
  return stats;
}

// Ensemble des URLs d'images référencées en base (pour repérer les médias inutilisés).
export async function getUsedMediaUrls({ strict = false } = {}) {
  const db = await getDB();
  const queries = [
    "SELECT photo_url AS u FROM projets",
    "SELECT photo_url AS u FROM membres",
    "SELECT image_url AS u FROM annonces",
    "SELECT logo_url AS u FROM partenaires",
  ];
  const used = new Set();
  for (const q of queries) {
    try {
      const { results } = await db.prepare(q).all();
      for (const r of results) if (r.u) used.add(r.u);
    } catch (error) { if (strict) throw error; }
  }
  return used;
}

export const secteurs = {
  sante: { label: "Santé publique", color: "#00897B" },
  ia: { label: "Intelligence Artificielle", color: "#7CB342" },
  education: { label: "Éducation", color: "#B7891E" },
  gouvernance: { label: "Gouvernance", color: "#3D5347" },
  local: { label: "Développement local", color: "#B7C233" },
  partenariat: { label: "Partenariat", color: "#6B4EA6" },
};
