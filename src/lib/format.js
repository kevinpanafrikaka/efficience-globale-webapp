// Les dates D1 sont en UTC. Accepter aussi les dates ISO déjà horodatées.
export function formatDate(value) {
  if (!value || typeof value !== "string") return "—";
  const normalized = value.trim().replace(" ", "T");
  const date = new Date(/[zZ]$|[+-]\d{2}:?\d{2}$/.test(normalized) ? normalized : `${normalized}Z`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}
