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

  const data = await request.json();
  const values = {};

  for (const cle of ["email", "email_destinataire"]) {
    const v = (data[cle] ?? "").toString().trim();
    if (!EMAIL_RE.test(v)) {
      return Response.json({ error: `Adresse email invalide : ${cle === "email" ? "email de contact" : "destinataire du formulaire"}.` }, { status: 400 });
    }
    values[cle] = v;
  }

  values.telephone = (data.telephone ?? "").toString().trim();
  values.adresse = (data.adresse ?? "").toString().trim();

  for (const cle of ["facebook", "x", "linkedin"]) {
    const v = (data[cle] ?? "").toString().trim();
    if (v && !isHttpUrl(v)) {
      return Response.json({ error: `Lien invalide pour ${cle} (il doit commencer par https://).` }, { status: 400 });
    }
    values[cle] = v;
  }

  if (!Array.isArray(data.stats_equipe)) {
    return Response.json({ error: "Statistiques invalides." }, { status: 400 });
  }
  const stats = data.stats_equipe
    .map((s) => ({ nombre: Number(s.nombre), label: (s.label ?? "").toString().trim() }))
    .filter((s) => s.label && Number.isFinite(s.nombre));
  values.stats_equipe = JSON.stringify(stats);

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
