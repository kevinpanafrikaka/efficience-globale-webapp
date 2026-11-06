export const MAX_CONTACT_FILES = 3;
export const MAX_CONTACT_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_CONTACT_BODY_BYTES = MAX_CONTACT_FILES * MAX_CONTACT_FILE_BYTES + 64 * 1024;

export function contactFileError(files) {
  if (files.length > MAX_CONTACT_FILES) return "Vous pouvez joindre 3 documents maximum.";
  for (const file of files) {
    if (!file || typeof file === "string" || !/\.pdf$/i.test(file.name) || !["application/pdf", "application/octet-stream", ""].includes(file.type)) return "Les documents doivent être au format PDF.";
    if (!file.size) return "Un des documents est vide.";
    if (file.size > MAX_CONTACT_FILE_BYTES) return "Chaque document doit faire 2 Mo maximum.";
  }
  return "";
}

// Bound the actual stream too: Content-Length may be missing or incorrect.
export async function readContactForm(request) {
  const tooLarge = () => Object.assign(new Error("Les documents dépassent la taille autorisée (3 PDF de 2 Mo maximum)."), { status: 413 });
  if (Number(request.headers.get("content-length")) > MAX_CONTACT_BODY_BYTES) throw tooLarge();
  if (!request.body) throw new Error("Formulaire vide.");
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_CONTACT_BODY_BYTES) { await reader.cancel(); throw tooLarge(); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new Response(bytes, { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData();
}

export async function contactAttachments(data) {
  const files = data.getAll("documents").filter(file => !(typeof file !== "string" && file.name === "" && file.size === 0));
  const error = contactFileError(files);
  if (error) throw new Error(error);
  const attachments = [];
  for (const [index, file] of files.entries()) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!new TextDecoder().decode(bytes.subarray(0, 5)).startsWith("%PDF-") || !new TextDecoder().decode(bytes.subarray(-1024)).includes("%%EOF")) throw new Error("Un des documents n’est pas un PDF valide.");
    const stem = file.name.slice(0, -4).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "Document";
    attachments.push({ name: `${stem}-${index + 1}.pdf`, bytes });
  }
  return attachments;
}
