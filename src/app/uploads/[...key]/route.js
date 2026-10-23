import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request, { params }) {
  const { env } = await getCloudflareContext({ async: true });
  const { key } = await params;
  const objectKey = key.join("/");

  if ((objectKey.startsWith("private-applications/") || objectKey.startsWith("publication-documents/"))) return new Response("Introuvable", { status: 404, headers: { "Cache-Control": "no-store" } });
  const object = await env.UPLOADS.get(objectKey);
  if (!object) {
    return new Response("Introuvable", { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", object.httpEtag);

  return new Response(object.body, { headers });
}
