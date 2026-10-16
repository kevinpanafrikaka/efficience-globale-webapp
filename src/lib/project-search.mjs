export function normalizeSearch(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").trim();
}

export function filterProjects(projects, sector, query) {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return projects.filter((project) => {
    if (sector !== "all" && project.secteur !== sector) return false;
    const text = normalizeSearch([project.titre, project.client, project.resume].filter(Boolean).join(" "));
    return words.every((word) => text.includes(word));
  });
}
