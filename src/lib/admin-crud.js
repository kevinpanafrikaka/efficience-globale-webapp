import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { AdminInputError, validateAdminContent } from "@/lib/admin-input.mjs";

export function adminCrud({ kind, create, update, remove, find }) {
  function handler(action) {
    return async (request, context = {}) => {
      const { env } = await getCloudflareContext({ async: true });
      const headers = { "Cache-Control": "no-store" };
      if (!(await isAdminRequest(request, env))) return Response.json({ error: "Non autorisé." }, { status: 401, headers });
      const origin = request.headers.get("origin");
      if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Origine refusée." }, { status: 403, headers });
      try {
        const { id } = await (context.params || {});
        if (action !== "create" && (!id || !(await find(id)))) return Response.json({ error: "Ce contenu n’existe plus. Actualisez la liste." }, { status: 404, headers });
        if (action === "remove") { await remove(id); return Response.json({ success: true }, { headers }); }
        let raw;
        try { raw = await request.json(); } catch { throw new AdminInputError("La demande JSON est invalide."); }
        const data = validateAdminContent(kind, raw);
        if (action === "create") return Response.json({ success: true, id: await create(data) }, { headers });
        await update(id, data);
        return Response.json({ success: true }, { headers });
      } catch (error) {
        const invalid = error instanceof AdminInputError;
        return Response.json({ error: invalid ? error.message : "L’action n’a pas pu être enregistrée. Réessayez." }, { status: invalid ? 400 : 500, headers });
      }
    };
  }
  return { POST: handler("create"), PUT: handler("update"), DELETE: handler("remove") };
}
