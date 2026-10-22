export const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const normalize = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\./g, "").trim();
export function parseProjectPeriod(value) {
  const empty = { startMonth: "", startYear: "", endMonth: "", endYear: "", ongoing: false };
  if (!value?.trim()) return empty;
  const pieces = value.trim().split(/\s+[–—-]\s+|\s+(?:à|au)\s+/i);
  if (pieces.length !== 2) return null;
  function date(text) {
    const match = text.match(/^([^\d]+)\s+(\d{4})$/);
    if (!match) return null;
    const month = MONTHS.findIndex(m => normalize(m) === normalize(match[1]) || normalize(m).slice(0,3) === normalize(match[1]));
    return month < 0 ? null : { month: String(month + 1), year: match[2] };
  }
  const start = date(pieces[0]);
  const ongoing = normalize(pieces[1]) === "en cours";
  const end = ongoing ? null : date(pieces[1]);
  if (!start || (!ongoing && !end)) return null;
  return { startMonth: start.month, startYear: start.year, endMonth: end?.month || "", endYear: end?.year || "", ongoing };
}
export function projectPeriodResult(range) {
  const { startMonth: sm, startYear: sy, endMonth: em, endYear: ey, ongoing } = range;
  if (!sm && !sy && !em && !ey && !ongoing) return { value: "", error: "" };
  const valid = (m,y) => +m >= 1 && +m <= 12 && /^[1-9]\d{3}$/.test(String(y));
  if (!valid(sm,sy) || (!ongoing && !valid(em,ey))) return { value: "", error: "Complétez le mois et l’année de début et de fin, ou choisissez « Projet en cours »." };
  if (!ongoing && (+ey * 12 + +em < +sy * 12 + +sm)) return { value: "", error: "La fin du projet doit être postérieure ou égale à son début." };
  return { value: `${MONTHS[+sm - 1]} ${sy} – ${ongoing ? "En cours" : `${MONTHS[+em - 1]} ${ey}`}`, error: "" };
}
