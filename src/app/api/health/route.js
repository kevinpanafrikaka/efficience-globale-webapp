// Endpoint de vérification — confirme que le Worker Cloudflare répond
// une fois déployé. Point de départ du dossier `api/` (routes backend),
// séparé du dossier `(public)/` (pages frontend).
export async function GET() {
  return Response.json({ status: "ok" });
}
