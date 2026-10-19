function normalized(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// Sigles déjà employés dans le champ client / bailleur des réalisations.
const ALIASES = {
  "ministere de la sante": ["mshp", "ministere de la sante et de l hygiene publique"],
  "ministere de la sante et de l hygiene publique": ["mshp", "ministere de la sante"],
};

export function projectsForPartner(partner, projects) {
  const name = normalized(partner?.nom);
  if (!name) return [];
  const names = [name, ...(ALIASES[name] || [])];
  return projects.filter((project) => {
    const client = ` ${normalized(project.client)} `;
    return names.some((alias) => client.includes(` ${alias} `));
  });
}

export function partnerProjectsHref(partner) {
  return `/realisations?partenaire=${encodeURIComponent(partner.id)}#projets`;
}
