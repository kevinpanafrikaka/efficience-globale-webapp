export const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const normalize = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\./g, "").trim();
const ALIASES = ["janvier janv jan", "fevrier fevr fev", "mars mar", "avril avr", "mai", "juin", "juillet juil", "aout aou", "septembre sept sep", "octobre oct", "novembre nov", "decembre dec"];
const monthNumber = word => ALIASES.findIndex(names => names.split(" ").includes(normalize(word))) + 1;
const pieces = text => text.split(/\s*[–—]\s*|\s+-\s+|\s+(?:à|au)\s+/i);
export function parseProjectPeriod(value) {
  const empty = { startMonth: "", startYear: "", endMonth: "", endYear: "" };
  if (!value?.trim()) return empty;
  const parts = pieces(value.trim());
  if (parts.length !== 2) return null;
  function date(text, inheritedYear = "") {
    const match = text.match(/^([^\d]+?)(?:\s+(\d{4}))?$/);
    const month = match && monthNumber(match[1]);
    const year = match?.[2] || inheritedYear;
    return month && year ? { month: String(month), year } : null;
  }
  const end = date(parts[1]);
  const start = end && date(parts[0], end.year);
  if (!start || !end) return null;
  return { startMonth: start.month, startYear: start.year, endMonth: end.month, endYear: end.year };
}
export function projectPeriodResult(range) {
  const { startMonth: sm, startYear: sy, endMonth: em, endYear: ey } = range;
  if (!sm && !sy && !em && !ey) return { value: "", error: "" };
  const valid = (m,y) => +m >= 1 && +m <= 12 && /^[1-9]\d{3}$/.test(String(y));
  if (!valid(sm,sy) || !valid(em,ey)) return { value: "", error: "Complétez le mois et l’année de début et de fin du projet." };
  if (+ey * 12 + +em < +sy * 12 + +sm) return { value: "", error: "La fin du projet doit être postérieure ou égale à son début." };
  return { value: `${MONTHS[+sm - 1]} ${sy} – ${MONTHS[+em - 1]} ${ey}`, error: "" };
}

// Unknown end dates stay behind dated projects. Never substitute creation dates
// or extrapolate an agreement's end from its renewal/duration wording.
export function projectEndKey(value) {
  const text = normalize(value);
  if (!text || /en cours|depuis/.test(text)) return null;
  const [period, ...notes] = text.split("·");
  if (/\b(?:ans?|mois|renouvelable)\b/.test(notes.join(" "))) return null;
  const end = pieces(period.trim()).at(-1).trim();
  const dated = end.match(/^(?:(\d{1,2})(?:er)?\s+)?([a-z]+)\s+([1-9]\d{3})$/);
  if (dated) {
    const month = monthNumber(dated[2]);
    if (!month) return null;
    const day = +(dated[1] || 0);
    if (day > 31) return null;
    return +dated[3] * 10000 + month * 100 + day;
  }
  return /^[1-9]\d{3}$/.test(end) ? +end * 10000 : null;
}
export function sortProjectsByEnd(projects) {
  return [...projects].sort((a,b) => {
    const left = projectEndKey(a.periode), right = projectEndKey(b.periode);
    if (left !== right) {
      if (left === null) return 1;
      if (right === null) return -1;
      return right - left;
    }
    return String(a.titre || "").localeCompare(String(b.titre || ""), "fr") || String(a.id).localeCompare(String(b.id));
  });
}
