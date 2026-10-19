# Notifications du formulaire avec Brevo

Destinataire : **oumar.camara@efficienceglobale.com**. Le visiteur devient
l'adresse de réponse, jamais l'expéditeur. Aucun changement dans l'espace admin.

## Configuration

1. Dans Brevo, faire valider l'adresse d'expédition choisie et configurer
   l'authentification de son domaine selon les instructions Brevo.
2. Dans Cloudflare, Worker **portfolio**, configurer les valeurs d'exécution :
   - `BREVO_API_KEY` : **Secret**, contenant la clé API Brevo (pas la clé SMTP).
   - `BREVO_SENDER_EMAIL` : **Texte**, contenant exactement l'adresse validée
     comme expéditeur dans Brevo. Cette adresse reste à confirmer avec Kevin ;
     aucune adresse supposée n'est inscrite par défaut dans le code.
3. Enregistrer et déployer la configuration du Worker.

Ne jamais mettre la clé dans GitHub, le navigateur, `NEXT_PUBLIC_*`, le fichier
Wrangler ou une conversation. Les valeurs sont lues à l'exécution côté serveur.

## Activation et traitement des erreurs

- Brevo est prioritaire dès que les deux valeurs sont renseignées et que
  l'adresse d'expédition a un format valide. La validation effective de cet
  expéditeur est contrôlée par Brevo au moment de l'envoi.
- Tant que la configuration Brevo est incomplète, le fonctionnement existant
  est conservé : Gmail si connecté, sinon Resend avec son destinataire actuel.
- Le formulaire enregistre d'abord le message en base de données.
- Seule une réponse Brevo réussie avec un `messageId` marque l'email envoyé.
  Cela confirme l'acceptation par Brevo, pas la réception en boîte de réception.
- En cas d'erreur, délai dépassé ou refus, le message reste consultable dans
  Admin → Messages, email non envoyé. Aucun autre prestataire n'est essayé
  après un échec Brevo, pour éviter les doubles envois et un destinataire différent.

## Vérification après configuration

Soumettre un message de test identifié comme tel depuis le formulaire public.
Vérifier le statut dans les journaux transactionnels Brevo, l'indicateur
`mail_sent` du message enregistré et la réception chez M. Oumar.
Les tests automatisés du dépôt utilisent exclusivement des réponses simulées.

Documentation : https://developers.brevo.com/reference/send-transac-email
