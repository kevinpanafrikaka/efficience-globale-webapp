// Shared by the two configured email providers; never imported by the browser.
export function emailAttachments(value = []) {
  if (!Array.isArray(value) || value.length > 2) throw new Error("Invalid attachments");
  return value.map(file => {
    if (!/^[a-zA-Z0-9_-]+\.pdf$/.test(file.name) || !ArrayBuffer.isView(file.bytes) || !file.bytes.byteLength || file.bytes.byteLength > 2 * 1024 * 1024) throw new Error("Invalid attachment");
    return { name: file.name, content: Buffer.from(file.bytes).toString("base64") };
  });
}
