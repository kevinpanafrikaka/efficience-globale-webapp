import { MAX_APPLICATION_DOCUMENTS,MAX_DOCUMENT_BYTES } from "./application-documents.mjs";
// Shared by the two configured email providers; never imported by the browser.
export function emailAttachments(value = []) {
  if (!Array.isArray(value) || value.length > MAX_APPLICATION_DOCUMENTS) throw new Error("Invalid attachments");
  return value.map(file => {
    if (!/^[a-zA-Z0-9_-]+\.pdf$/.test(file.name) || !ArrayBuffer.isView(file.bytes) || !file.bytes.byteLength || file.bytes.byteLength > MAX_DOCUMENT_BYTES) throw new Error("Invalid attachment");
    return { name: file.name, content: Buffer.from(file.bytes).toString("base64") };
  });
}
