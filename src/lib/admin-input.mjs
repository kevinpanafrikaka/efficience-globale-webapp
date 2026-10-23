import { validateApplicationDocuments } from "./application-documents.mjs";
import { ANNOUNCEMENT_TYPES, announcementActionUrl } from "./announcements.mjs";
export class AdminInputError extends Error {}

function text(data, key, max = 500, required = false) {
  const value = data[key] ?? "";
  if (typeof value !== "string") throw new AdminInputError(`Champ invalide : ${key}.`);
  const result = value.trim();
  if (required && !result) throw new AdminInputError(`Le champ ${key} est requis.`);
  if (result.length > max) throw new AdminInputError(`Le champ ${key} est trop long (${max} caractères maximum).`);
  return result;
}

function image(data, key) {
  const value = text(data, key, 2000);
  if (value && !(value.startsWith("/") && !value.startsWith("//") && !/[\\\r\n]/.test(value))) {
    try { const url = new URL(value); if (!["http:", "https:"].includes(url.protocol)) throw new Error(); }
    catch { throw new AdminInputError("L’adresse de l’image doit être un chemin du site ou une URL http(s)."); }
  }
  return value;
}

export function validateAdminContent(kind, data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new AdminInputError("Contenu JSON invalide.");
  const statut = data.statut ?? "brouillon";
  if (!["brouillon", "publie"].includes(statut)) throw new AdminInputError("Statut invalide.");
  const result = { statut };
  if (kind === "membres" || kind === "partenaires") {
    const order = data.ordre_affichage ?? 0;
    if (order === "" || !Number.isInteger(Number(order)) || Number(order) < 0 || Number(order) > 100000) throw new AdminInputError("L’ordre d’affichage doit être un entier positif ou nul.");
    result.ordre_affichage = Number(order);
  }
  if (kind === "projets") {
    result.titre = text(data, "titre", 300, true);
    result.secteur = text(data, "secteur", 30, true);
    if (!["sante", "ia", "education", "gouvernance", "local", "partenariat"].includes(result.secteur)) throw new AdminInputError("Secteur invalide.");
    for (const key of ["titre_accent", "client", "periode", "slug"]) result[key] = text(data, key);
    result.resume = text(data, "resume", 3000);
    result.description = text(data, "description", 20000);
    result.photo_url = image(data, "photo_url");
    const results = data.resultats ?? [];
    if (!Array.isArray(results) || results.length > 50 || results.some(value => typeof value !== "string" || value.length > 1000)) throw new AdminInputError("Les résultats doivent contenir au maximum 50 lignes de texte.");
    result.resultats = results.map(value => value.trim()).filter(Boolean);
  } else if (kind === "annonces") {
    result.titre = text(data, "titre", 300, true);
    result.texte = text(data, "texte", 20000, true);
    result.date = text(data, "date", 10, true);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(result.date) || Number.isNaN(Date.parse(result.date)) || new Date(result.date).toISOString().slice(0, 10) !== result.date) throw new AdminInputError("Date de publication invalide.");
    result.image_url = image(data, "image_url");
    if (data.galerie !== undefined) {
      if (!Array.isArray(data.galerie) || data.galerie.length > 50) throw new AdminInputError("La galerie peut contenir jusqu’à 50 photos.");
      const seen = new Set();
      result.galerie = data.galerie.map(photo => {
        if (!photo || typeof photo !== "object" || Array.isArray(photo)) throw new AdminInputError("Photo de galerie invalide.");
        const url = image(photo, "url");
        if (!url) throw new AdminInputError("L’adresse de chaque photo est requise.");
        return { url, legende: text(photo, "legende", 300) };
      }).filter(photo => { if (seen.has(photo.url)) return false; seen.add(photo.url); return true; });
    }
    if(data.documents_candidature!==undefined){
      try{result.documents_candidature=validateApplicationDocuments(data.documents_candidature);}catch(error){throw new AdminInputError(error.message);}
    }
    result.categorie = text(data, "categorie", 40) || "vie";
    if (!ANNOUNCEMENT_TYPES.some(type => type.value === result.categorie)) throw new AdminInputError("Type d’annonce invalide.");
    result.resume = text(data, "resume", 500);
    result.lieu = text(data, "lieu", 300);
    result.echeance = text(data, "echeance", 10);
    if (result.echeance && (!/^\d{4}-\d{2}-\d{2}$/.test(result.echeance) || Number.isNaN(Date.parse(result.echeance)) || new Date(result.echeance).toISOString().slice(0,10) !== result.echeance)) throw new AdminInputError("Date limite invalide.");
    result.action_url = text(data, "action_url", 2000);
    result.action_label = text(data, "action_label", 100);
    if (result.action_url && !announcementActionUrl(result.action_url)) throw new AdminInputError("Le lien doit commencer par https://, http:// ou mailto:.");
    if (Boolean(result.action_url) !== Boolean(result.action_label)) throw new AdminInputError("Renseignez le libellé et le lien du bouton ensemble.");

  } else if (kind === "membres") {
    result.nom = text(data, "nom", 200, true);
    result.role = text(data, "role", 300);
    result.bio = text(data, "bio", 10000);
    result.expertises = text(data, "expertises", 500);
    result.photo_url = image(data, "photo_url");
  } else if (kind === "partenaires") {
    result.nom = text(data, "nom", 200, true);
    result.logo_url = image(data, "logo_url");
    result.site_web = text(data, "site_web", 2000);
    if (result.site_web) {
      try { if (!["http:", "https:"].includes(new URL(result.site_web).protocol)) throw new Error(); }
      catch { throw new AdminInputError("Le site web doit commencer par http:// ou https://."); }
    }
  } else throw new AdminInputError("Type de contenu inconnu.");
  return result;
}
