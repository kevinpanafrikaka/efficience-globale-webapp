import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isAdminRequest } from "@/lib/adminAuth";
import { saveReglages } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function PUT(request) {
  const { env } = await getCloudflareContext({ async: true });
  if (!(await isAdminRequest(request, env))) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  let data;
  try { data = await request.json(); } catch { return Response.json({ error: "Demande JSON invalide." }, { status: 400 }); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return Response.json({ error: "Réglages invalides." }, { status: 400 });
  const values = {};

  const email = (data.email ?? "").toString().trim();
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Adresse email de contact invalide." }, { status: 400 });
  }
  values.email = email;

  values.telephone = (data.telephone ?? "").toString().trim();
  values.adresse = (data.adresse ?? "").toString().trim();

  for (const cle of ["facebook", "x", "linkedin"]) {
    const v = (data[cle] ?? "").toString().trim();
    if (v && !isHttpUrl(v)) {
      return Response.json({ error: `Lien invalide pour ${cle} (il doit commencer par https://).` }, { status: 400 });
    }
    values[cle] = v;
  }

  // Only update editable contact fields; preserve existing team figures and
  // the legacy fallback recipient used by the notification backend.

  try {
    await saveReglages(values);
  } catch {
    return Response.json(
      { error: "Enregistrement impossible : la migration 001 a-t-elle été appliquée sur D1 ?" },
      { status: 500 }
    );
  }
  return Response.json({ success: true });
}
