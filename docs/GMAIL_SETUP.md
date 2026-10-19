# Notifications Contact via Gmail

Le formulaire conserve Resend tant qu’aucune connexion Gmail n’est enregistrée.
Après connexion, Gmail envoie exclusivement à `oumar.camara@efficienceglobale.com`,
depuis `kevinkandet05@gmail.com`. Le Reply-To reste celui du visiteur.
Aucun écran ou réglage de l’administration existante n’est modifié.

## Activer

1. Dans Google Cloud, activer Gmail API et utiliser un client OAuth **Application Web**.
2. Dans **URI de redirection autorisés**, ajouter exactement :
   `https://portfolio.efficienceglobale.workers.dev/api/email/google/callback`.
   Lors du transfert du site, ajouter aussi
   `https://efficienceglobale.com/api/email/google/callback`.
   Les seules racines de domaine ne suffisent pas dans ce champ.
3. Dans Cloudflare : compte **Efficience Globale** → **Workers & Pages** →
   **portfolio** → **Settings** → **Variables and Secrets**, ajouter deux secrets :
   - `GOOGLE_CLIENT_ID` : ID OAuth réel, non modifié.
   - `GOOGLE_CLIENT_SECRET` : secret du même client.
   Enregistrer/déployer. Ne pas les mettre dans GitHub ou dans le navigateur.
4. Se connecter à l’administration existante du site, puis ouvrir
   `https://portfolio.efficienceglobale.workers.dev/api/email/google`.
5. Cliquer **Connecter Gmail**, sélectionner `kevinkandet05@gmail.com` et autoriser
   l’envoi. Les autorisations demandées sont `openid`, `email` et `gmail.send` ;
   aucune lecture de boîte mail n’est demandée.
6. La page confirme la connexion. Soumettre alors un message de test identifié,
   avec accord du destinataire, puis vérifier sa réception chez M. Oumar.

Si l’application Google est externe en statut **Test**, ajouter le compte aux
utilisateurs de test. Ce statut fait normalement expirer l’autorisation de
renouvellement après sept jours avec le périmètre Gmail. Préparer le passage en
production selon les exigences Google avant de considérer l’envoi comme durable.

## Fonctionnement et dépannage

- Le retour OAuth exige la session admin, un état chiffré de dix minutes et PKCE.
- Seul le compte propriétaire attendu peut être connecté.
- L’autorisation de renouvellement est chiffrée en AES-GCM dans une table D1
  dédiée `gmail_connection`, créée lors de la première connexion réussie.
- Une rotation du secret client nécessite une nouvelle connexion Google.
- Si Google refuse l’envoi, le message reste enregistré dans Admin → Messages,
  sans notification envoyée à une autre personne.
- La réponse positive du formulaire confirme l’enregistrement, pas la réception
  de l’email dans la boîte du destinataire.
- Pour renouveler un accès expiré ou révoqué, rouvrir `/api/email/google`.
- Aucun mail de test n’est envoyé automatiquement lors de la connexion.

## Vérifications

`node --experimental-vm-modules --test tests/gmail*.test.mjs`

`npx opennextjs-cloudflare build`
