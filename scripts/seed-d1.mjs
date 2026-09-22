// Génère seed.sql à partir des données existantes (src/data/*.js) pour
// peupler la base D1 réelle. Les 4 partenariats sont insérés dans la
// même table `projets`, avec secteur = 'partenariat' (même structure de
// carte côté frontend, pas besoin d'une table séparée).
import { writeFileSync } from "node:fs";
import { projets, partenariats } from "../src/data/projects.js";
import { fondateur } from "../src/data/team.js";

function esc(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

const lines = [];

let ordre = 0;
for (const p of projets) {
  lines.push(
    `INSERT INTO projets (id, slug, titre, secteur, client, periode, montant, resume, description, resultats, photo_url, statut, ordre_affichage) VALUES (` +
      [
        esc(p.slug),
        esc(p.slug),
        esc(p.titre),
        esc(p.secteur),
        esc(p.client),
        esc(p.periode),
        esc(p.montant),
        esc(p.resume),
        esc(p.description),
        esc(JSON.stringify(p.resultats ?? [])),
        esc(`/img/realisations/${p.photo}`),
        esc("publie"),
        ordre++,
      ].join(", ") +
      ");"
  );
}

for (const p of partenariats) {
  lines.push(
    `INSERT INTO projets (id, slug, titre, secteur, client, periode, montant, resume, description, resultats, photo_url, statut, ordre_affichage) VALUES (` +
      [
        esc(p.slug),
        esc(p.slug),
        esc(p.titre),
        esc("partenariat"),
        esc(p.client),
        esc(p.periode),
        esc(null),
        esc(p.resume),
        esc(null),
        esc(JSON.stringify([])),
        esc(`/img/realisations/${p.photo}`),
        esc("publie"),
        ordre++,
      ].join(", ") +
      ");"
  );
}

lines.push(
  `INSERT INTO membres (id, nom, role, bio, photo_url, ordre_affichage, statut) VALUES (` +
    [
      esc("fondateur"),
      esc(fondateur.nom),
      esc(fondateur.role),
      esc(fondateur.bio),
      esc(`/img/${fondateur.photo}`),
      0,
      esc("publie"),
    ].join(", ") +
    ");"
);

writeFileSync(new URL("../seed.sql", import.meta.url), lines.join("\n") + "\n");
console.log(`seed.sql généré : ${lines.length} lignes`);
