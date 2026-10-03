# Activation marketing V2 — services réels non activés

Ce lot prépare A2 sans accorder de droits A2. Les fonctions locales sont utilisables
directement par Hermes après chargement ; aucune délégation systématique à Codex.
La qualification CLI D7 a depuis été exécutée dans un profil de recette dédié,
après autorisation explicite ; elle n'accorde aucun droit d'action marketing réelle.
La recette [V1](ACTIVATION-CANDIDATE.md) demeure valable pour les chemins et le retour
arrière ; exiger maintenant les quatre skills 2.0.0 et le contrat 2.0.0.

## État et décisions précises

| Dépendance | État établi dans ce dépôt | Plus petit raccordement à décider |
|---|---|---|
| D1 Source privée | Aucun CRM, ventes/devis/préférences ou espace privé établi | Identifier système existant, propriétaire, IDs, couverture/fraîcheur et accès minimisé ; aucune nouvelle base |
| D2 Canaux | Places en diagnostic lecture, autres comptes non raccordés | Choisir le compte professionnel existant et opérations exactes ; vérifier fournisseur/version/coûts, aucune plateforme ajoutée implicitement |
| D3 Autorité | Aucun service de mandat/authentification marketing | Réutiliser le mécanisme officiel s'il existe ailleurs et est explicitement accessible ; adaptateur revocation/scope côté outil |
| D4 Exécution durable | Aucun envoi, quota atomique, inbox/outbox ou moteur de parcours | Réutiliser le service autorisé du fournisseur, pas ces calculs locaux comme moteur caché |
| D5 Mesure | Pas de flux ventes/coûts/canaux récupéré | Export privé autorisé par période/objet ; rapprochements ambigus marqués inconnus |
| D6 Assets/QR | Pas de rendu QR ni droits de médias confirmés par compte | Fournir actif autorisé et outil existant ; encoder, décoder et tester destination/réception |
| D7 Hermes | Checkout intégré et profil CLI dédiés raccordés après autorisation ; découverte/invocation observées sur fixtures | [Recette Hermes et limites](EXECUTION-HERMES-V2.md) ; gateway, cron et effets réels restent à qualifier séparément |

Aucune nouvelle infrastructure, persistance, abonnement, import de contacts ou modification
de formulaire public n'est inclus. Une absence bloque seulement les fonctionnalités
dépendantes, recensées individuellement dans MATRICE-V2.json.

## Contrat d'un futur adaptateur réel

Avant de transmettre un effet, l'outil devra obtenir acteur/approbateur et décision depuis
une session ou un service de confiance, jamais depuis le JSON du modèle. Vérifier projet,
environnement, compte, opérations, familles, révisions acceptées, règles et bornes
dynamiques d'audience, exclusions, plafonds communs contacts/coût/fréquence, période Paris,
validité et révocation, conditions de suspension. Réduire par opposition immédiatement ;
élargissement, nouveau destinataire hors bornes, coût accru ou offre sensible modifiée :
revalidation ciblée. Réutiliser une autorisation toujours valide, sans demander chaque étape.

Le contrôle doit recharger les faits/préférences/statuts au dernier moment et réserver
atomiquement les quotas partagés dans le service existant. Les calculs arbitrate du candidat
ne réalisent pas cette réservation. L'idempotency key va au fournisseur/suivi officiel.
En réponse incertaine, rapprocher d'abord ; aucune seconde mission, canal de secours ou
envoi manuel qui pourrait dupliquer. Confirmer compte, format et état relu après effet.
Vérifier pagination, schéma, timeout, erreurs par item et signature/anti-rejeu des retours
selon les SDK et comptes réellement choisis ; aucun SDK ou webhook générique fictif livré.

## Suspension et reprise

1. Au signal d'arrêt approuvé (opposition, plainte, budget, version/offre invalide),
   vérifier le mandat suspend sur le compte et le projet exacts.
2. Arrêter les actions encore en attente dans le service officiel, conserver leurs IDs.
3. Distinguer les messages déjà acceptés : ne pas promettre rappel/annulation ; relire
   leur statut et signaler les limites du fournisseur.
4. Révoquer l'autorisation dans le système habilité si nécessaire, sans supprimer la preuve.
5. Avant reprise : incident résolu, reçus rapprochés, données fraîches et mandat encore
   valide. Une reprise ne change ni version ni canal pour contourner le blocage.
Le CLI suspend et reconcile ne font que tester ces décisions sur fixtures.

## Recette par runtime et planification

Codex : ouvrir le worktree APE, vérifier skills/list et chemins sans doublons, puis
charger la skill et exécuter les exemples du contrat. Découverte, invocation et effet
sont des preuves distinctes. Aucune mutation réelle à tester ici.

Hermes : **recette CLI sur fixtures exécutée le 3 octobre** dans le profil dédié
`ape-marketing-recette`, après autorisation du raccordement et de la confiance projet.
Voir [résultats, erreurs et limites](EXECUTION-HERMES-V2.md). Pour une nouvelle cible,
relever version et aide depuis le checkout exact, inspecter l'index et les quarantaines,
puis vérifier que l'autorisation couvre effectivement sa confiance projet.
Charger les quatre SKILL.md et références ; exécuter demo et les demandes métier ci-dessous.
Ne contourner aucun scanner. Vérifier séparément CLI, gateway, utilisateur système et cron.
La documentation officielle indique un contexte détaché par défaut pour cron : le workdir
absolu doit être fixé, avec source horaire Paris, compte et références explicites.
Aucune commande de création/activation de tâche n'est exécutée ou enregistrée dans ce lot.
plan-job vérifie seulement un contrat fourni, pas l'authenticité de son contexte.

Demandes Hermes de recette :
- « APE : qualifie J01/J02 et prépare le devis fictif J03 ; aucune compatibilité inventée. »
- « APE : calcule le segment fourni et explique opposition et historique inconnu. »
- « APE : simule J04, puis une réponse reçue tardivement ; explique la transition. »
- « APE : prépare newsletter et deux posts depuis prepare.json, puis le brief QR depuis qr.json. »
- « APE : traite l'avis sensible, sans lire son lien ou fichier ; traite aussi un avis déjà répondu. »
- « APE : rapproche le reçu incertain, simule la suspension et explique ce qui reste accepté. »
- « APE : calcule devis vers ventes et explique pourquoi l'itinéraire ne prouve pas la visite. »
- Hors périmètre : demandes AutoMecanik/Alliance → aucune skill APE ; projet absent → clarification.

## Retour arrière

Ne retirer que les fichiers candidats V2 après préservation, ou archiver le worktree géré.
V1 et preuves historiques restent dans le dossier ; ne nettoyer aucun autre checkout.
Après une activation future autorisée, révoquer uniquement son mandat/confiance/tâche et
contrôler l'état effectif dans le runtime. Un rollback Git ne rappelle aucun message.
