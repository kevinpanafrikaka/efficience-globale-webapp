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
  if (data.stats_equipe.length > 12 || data.stats_equipe.some(s => !s || typeof s !== "object" || !String(s.label ?? "").trim() || !String(s.nombre ?? "").trim() || !Number.isFinite(Number(s.nombre)) || Number(s.nombre) < 0)) {
    return Response.json({ error: "Renseignez un libellé et un nombre positif ou nul pour chaque chiffre, ou retirez la ligne vide (12 lignes maximum)." }, { status: 400 });
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
