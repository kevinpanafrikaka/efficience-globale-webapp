import { publicationDocumentUrl } from "./publication-documents.mjs";

export function publicMediaUrl(key) {
  return /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif)$/.test(key || "") ? `/uploads/${key}` : publicationDocumentUrl(key || "");
}
export function mediaFilename(file, usages = []) {
  let name = "";
  try { name = decodeURIComponent(file.customMetadata?.filename || ""); } catch { /* Older files have no filename metadata. */ }
  name = name.replace(/[\x00-\x1f\x7f]/g, "").slice(0, 200).trim();
  return name || (usages[0]?.title ? `${usages[0].title} · ${file.key.split("/").at(-1).slice(0, 8)}` : file.key.split("/").at(-1));
}
export function formatMediaSize(bytes) {
  return bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} Go` : bytes >= 1024 ** 2 ? `${(bytes / 1024 ** 2).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo` : `${Math.round(bytes / 1024).toLocaleString("fr-FR")} Ko`;
}
const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function filterMedia(items, { query = "", usage = "all", type = "all", excludeUrls = [] } = {}) {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return items.filter(item => !excludeUrls.includes(item.url) && (type === "all" || item.type === type) && (usage === "all" || (usage === "used") === (item.usages.length > 0)) && words.every(word => normalize(`${item.name} ${item.key} ${item.usages.map(use => `${use.title} ${use.label}`).join(" ")}`).includes(word)));
}
