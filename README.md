# Efficience Globale — site & espace admin

Site vitrine (Next.js 16, App Router) déployé sur Cloudflare Workers via OpenNext, avec un espace
d'administration (`/admin`) pour gérer le contenu.

## Stack
- **Next.js 16 / React 19 / Tailwind 4**, déploiement `@opennextjs/cloudflare`
- **D1** (binding `DB`) : projets, membres, annonces, partenaires, messages, réglages
- **R2** (binding `UPLOADS`, bucket `eguploads`) : images envoyées depuis l'admin, servies par `/uploads/...`
- **Resend** : notification email des messages du formulaire de contact

## Secrets / variables
| Nom | Rôle |
|---|---|
| `ADMIN_PASSWORD` | mot de passe de l'admin (sert aussi à signer le cookie de session) |
| `RESEND_API_KEY` | envoi de la notification email (optionnel : les messages sont de toute façon enregistrés) |

En local, créer un fichier `.dev.vars` (ignoré par git) : `ADMIN_PASSWORD=...`.

## Base de données
```bash
# Nouvelle base
wrangler d1 execute efficience-globale-db --remote --file=schema.sql
wrangler d1 execute efficience-globale-db --remote --file=seed.sql
wrangler d1 execute efficience-globale-db --remote --file=migrations/001_admin_completion.sql

# Base existante : appliquer seulement les migrations manquantes
wrangler d1 execute efficience-globale-db --remote --file=migrations/001_admin_completion.sql
```
Utiliser `--local` à la place de `--remote` pour la base de développement. Les migrations sont idempotentes.
Tant que la migration 001 n'est pas appliquée, le site public retombe sur des valeurs par défaut (partenaires,
coordonnées) et les écrans concernés de l'admin l'indiquent.

## Espace admin
Tableau de bord, projets, membres, annonces, **partenaires**, **messages** (formulaire de contact),
**médias** (images R2), **réglages** (coordonnées, réseaux sociaux, destinataire des emails, chiffres de l'équipe).
Les projets, membres et partenaires se réordonnent avec les boutons ↑ / ↓. Le login est limité à 5 échecs par
15 minutes et par IP.

## Développement
```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run preview    # build OpenNext + aperçu Workers
npm run deploy
```

## Expertises des membres
Le formulaire des membres accepte jusqu’à trois expertises séparées par des virgules. Elles apparaissent sur la fiche publique lorsqu’elles sont renseignées.
Pour une base existante, vérifier `PRAGMA table_info(membres)` puis appliquer une seule fois `migrations/003_member_expertises.sql` si la colonne `expertises` est absente. Une nouvelle base initialisée avec `schema.sql` possède déjà cette colonne.
