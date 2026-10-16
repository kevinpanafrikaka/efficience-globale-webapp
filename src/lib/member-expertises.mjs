export function expertiseTags(value) {
  const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[,;\n]/) : [];
  const seen = new Set();
  return values.filter((item) => typeof item === "string").map((item) => item.trim().slice(0, 50))
    .filter((item) => {
      const key = item.toLocaleLowerCase("fr");
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 3);
}
