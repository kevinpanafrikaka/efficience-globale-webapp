export const ANNOUNCEMENT_TYPES = [
  { value: "recrutement", label: "Recrutement" },
  { value: "formation", label: "Formations" },
  { value: "evenement", label: "Événements" },
  { value: "actualite", label: "Actualités" },
  { value: "publication", label: "Publications" },
];
// Old categories remain readable in saved records and already-open editor tabs.
export function announcementCategory(value) {
  if(value === "mission" || value === "vie") return "actualite";
  return ANNOUNCEMENT_TYPES.some(type => type.value === value) ? value : "actualite";
}
export function announcementType(value) { return ANNOUNCEMENT_TYPES.find(type => type.value === announcementCategory(value)); }
export function announcementBlocks(value) {
  const blocks = [];
  let pending = null;
  function flush() { if (pending) blocks.push(pending); pending = null; }
  for (const raw of String(value || "").replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const heading = /^##[\t ]+(.+)$/u.exec(line);
    if (heading) { flush(); blocks.push({ type: "heading", text: heading[1].trim() }); continue; }
    const item = /^[-•][\t ]+(.+)$/u.exec(line);
    if (item) {
      if (pending?.type !== "list") { flush(); pending = { type: "list", items: [] }; }
      pending.items.push(item[1].trim());
    } else {
      if (pending?.type !== "paragraph") { flush(); pending = { type: "paragraph", text: "" }; }
      pending.text += `${pending.text ? "\n" : ""}${line}`;
    }
  }
  flush();
  return blocks;
}
export function announcementSummary(annonce) { return annonce.resume?.trim() || announcementExcerpt(annonce.texte); }
export function announcementActionUrl(value) {
  if (!value) return "";
  try { const url = new URL(value); return ["https:", "http:", "mailto:"].includes(url.protocol) ? value : ""; } catch { return ""; }
}

export function announcementDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

export function announcementExcerpt(value, length = 180) {
  const text = (value || "").replace(/^## /gm, "").replace(/^[-•] /gm, "").replace(/\s+/g, " ").trim();
  if (text.length <= length) return text;
  const cut = text.slice(0, length + 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : length).trimEnd()}…`;
}

// Group the author's headings without rewriting the saved article.
export function announcementArticleContent(value, summary = "") {
  const blocks = announcementBlocks(value);
  let lead = String(summary || "").trim();
  const sameText = text => text.replace(/\s+/gu, " ").trim();
  if (blocks[0]?.type === "paragraph") {
    if (!lead) lead = blocks.shift().text;
    else if (sameText(blocks[0].text) === sameText(lead)) blocks.shift();
  }
  const preamble = [], sections = [];
  for (const block of blocks) {
    if (block.type === "heading") sections.push({ title: block.text, blocks: [] });
    else if (sections.length) sections.at(-1).blocks.push(block);
    else preamble.push(block);
  }
  return { lead, preamble, sections };
}

// A cabinet contact link on a recruitment offer becomes the dedicated application form.
// Explicit links to external recruitment tools keep their original destination.
export function announcementApplicationPath(annonce) {
  if (annonce.categorie !== "recrutement") return "";
  const path=`/annonces/${encodeURIComponent(annonce.slug)}/postuler`;
  if (!annonce.action_url?.trim()) return path;
  try {
    const url=new URL(annonce.action_url);
    const local=["portfolio.efficienceglobale.workers.dev","efficienceglobale.com","www.efficienceglobale.com"].includes(url.hostname);
    return local && ["/contact",path].includes(url.pathname.replace(/\/$/,"")) ? path : "";
  } catch { return ""; }
}
