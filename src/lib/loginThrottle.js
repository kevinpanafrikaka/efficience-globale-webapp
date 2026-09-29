import { getCloudflareContext } from "@opennextjs/cloudflare";

export const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

async function getDB() {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

// Vrai si cette IP a déjà échoué MAX_ATTEMPTS fois dans la fenêtre. Sans table (migration 001
// non appliquée), on ne bloque personne plutôt que de casser le login.
export async function isLoginBlocked(ip) {
  try {
    const db = await getDB();
    const row = await db
      .prepare("SELECT COUNT(*) AS n FROM tentatives_login WHERE ip = ? AND cree_le > datetime('now', ?)")
      .bind(ip, `-${WINDOW_MINUTES} minutes`)
      .first();
    return (row?.n ?? 0) >= MAX_ATTEMPTS;
  } catch {
    return false;
  }
}

export async function recordFailedLogin(ip) {
  try {
    const db = await getDB();
    await db.prepare("DELETE FROM tentatives_login WHERE cree_le < datetime('now', '-1 day')").run();
    await db.prepare("INSERT INTO tentatives_login (ip) VALUES (?)").bind(ip).run();
  } catch {}
}

export async function clearFailedLogins(ip) {
  try {
    const db = await getDB();
    await db.prepare("DELETE FROM tentatives_login WHERE ip = ?").bind(ip).run();
  } catch {}
}
