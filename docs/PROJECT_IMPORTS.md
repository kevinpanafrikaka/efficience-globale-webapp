# Préparation de l’import des projets terminés

État : socle interne testé, **connexion externe non configurée et non activée**.
Aucun appel réseau, webhook, nouvel endpoint public ou tâche planifiée n’est
ajouté. Aucune migration n’est appliquée automatiquement. Aucun projet existant
n’est lié ou modifié par cette préparation.

## Frontière entre les deux applications

Un futur adaptateur serveur authentifié traduira le format réel du site de
gestion vers le contrat interne ci-dessous. Il devra uniquement sélectionner
les champs destinés à être rendus publics. Ce contrat n’est pas une description
de l’API du site de gestion, encore inconnue.

```js
await importCompletedProject(env, "gestion-cabinet", {
  externalId: "identifiant-stable-fourni-par-la-source",
  status: "completed",
  updatedAt: "2026-11-07T10:00:00Z",
  project: {
    titre: "Titre public du projet",
    secteur: "education",
    client: "Organisation partenaire",
    periode: "2026",
    resume: "Résumé public",
    description: "Présentation publique",
    resultats: ["Résultat vérifié"],
    photo_url: "/uploads/image-existante.jpg",
  },
});
```

Les secteurs autorisés sont ceux du site vitrine : `sante`, `ia`, `education`,
`gouvernance`, `local`, `partenariat`. Leur correspondance avec la source sera
définie après examen de son modèle. Aucune catégorie arbitraire n’est inventée.

L’identifiant externe est une chaîne stable, opaque et sensible à la casse ;
l’adaptateur ne doit jamais le remplacer par un titre ou par la position dans
une liste. La date doit porter un fuseau horaire et identifier une version
source : le même contenu/version peut être reçu plusieurs fois. Deux contenus
différents avec une même date sont refusés, pas arbitrés silencieusement.

## Comportements déjà préparés

- Seul le statut interne exact `completed` déclenche un import.
- Le premier import crée un projet **brouillon**, avec un lien unique
  `(source, identifiant externe)`. Un statut de publication reçu est ignoré.
- Un nouvel envoi identique réutilise ce lien ; il ne crée aucun doublon.
- Une modification source plus récente met à jour une copie séparée des
  informations et marque une mise à jour en attente. Elle ne remplace pas la
  fiche retravaillée localement et ne la publie pas.
- Une version plus ancienne est ignorée. Les projets saisis manuellement
  restent distincts, même si leur titre est identique.
- Une suppression locale conserve l’identité source via une référence devenue
  nulle ; une synchronisation ne recrée pas automatiquement le projet supprimé.
- Projet et lien source sont écrits dans une même transaction D1 `batch`.
- Seuls les champs publics explicitement autorisés sont conservés. Les données
  inconnues, identifiants locaux, dates locales et statut publié ne sont pas copiés.

Le service ne remplace pas les contrôles d’authentification : il est réservé à
un appel serveur de confiance. Le futur endpoint ou planificateur devra
authentifier la source avant tout appel. Il ne faut pas l’exposer directement.

## Ce qui attend les informations du site de gestion

1. URL, documentation, méthode d’authentification et autorisation de lecture.
2. Identifiant stable, statut « terminé », version/date de modification et
   correspondance des champs/secteurs.
3. Pagination, limites, horodatages et traitement des projets redevenus en cours,
   retirés ou supprimés dans la source.
4. Choix webhook ou vérification périodique, reprise après interruption,
   protection anti-rejeu et journal d’exécution sans secrets.
5. Hébergement des images et droits de réutilisation ; pas de téléchargement
   automatique d’une URL arbitraire fournie dans un projet.
6. Règles d’application des mises à jour source, avec comparaison dans l’admin
   et protection des champs éditoriaux locaux.

Avant activation, appliquer `migrations/009_project_imports.sql` une fois sur la
base cible. La migration est additive et conserve les projets existants. Puis
tester sur une source de démonstration : premier import, rejouement, version
ancienne, mise à jour, suppression locale, erreur réseau et reprise paginée.

L’interface d’administration et le connecteur réel seront ajoutés après
validation de ce contrat avec le responsable du site de gestion. Aucun état
« connecté », import de démonstration ou bouton d’import inopérant n’est affiché.
