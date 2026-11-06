import { getMediaUsages } from "./db.js";
import { mediaFilename, publicMediaUrl } from "./media-files.mjs";

export async function getMediaLibrary(env) {
  if (!env.UPLOADS) throw new Error("Storage unavailable");
  const usages = await getMediaUsages();
  const items = [];
  let cursor;
  do {
    const page = await env.UPLOADS.list({ cursor, limit: 500, include: ["customMetadata"] });
    for (const file of page.objects) {
      const url = publicMediaUrl(file.key);
      if (!url) continue; // Allowlist excludes all private documents, even unfamiliar prefixes.
      const references = usages[url] || [];
      const date = new Date(file.uploaded);
      items.push({ key: file.key, url, name: mediaFilename(file, references), type: url.startsWith("/documents/") ? "pdf" : "image", size: file.size, uploaded: Number.isNaN(date.getTime()) ? null : date.toISOString(), usages: references });
    }
    if (page.truncated && (!page.cursor || page.cursor === cursor)) throw new Error("Incomplete media listing");
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  items.sort((a, b) => (Date.parse(b.uploaded) || 0) - (Date.parse(a.uploaded) || 0) || a.key.localeCompare(b.key));
  return items;
}
