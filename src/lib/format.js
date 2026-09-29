// Les dates D1 sont en UTC au format "YYYY-MM-DD HH:MM:SS".
export function formatDate(iso) {
  return new Date(`${iso.replace(" ", "T")}Z`).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
