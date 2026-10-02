---
name: ape-campagnes-locales
description: Uniquement pour Auto Pièces Équipements (APE), dépôt ak125/auto-pieces-equipements-site : stratégie, veille, qualification de pièce, devis, newsletter, offre, contenus locaux ou supports QR. Ne pas sélectionner ni charger pour AutoMecanik, Alliance Delivery, une vente privée en Tunisie ou un autre magasin.
metadata:
  version: "2.0.0"
---

# ape-campagnes-locales

Préparer directement contenus et réponses utiles depuis les faits du magasin.

## Entrées
Objectif, besoin et public déclaré, source datée, canal, période Europe/Paris, référence
et conditions vérifiées si offre. Ne pas importer de conversation ou pièce privée ici.

## Procédure et outils
1. Lire les parties utiles du pack Google Business existant ; reprendre les faits sourcés,
   signaler les contradictions avec business-facts et ne pas changer les informations publiques.
2. Une demande reçue utilise qualify puis quote si les données le permettent. Demander la
   seule précision utile ; disponibilité fournisseur ≠ stock magasin, devis ≠ réservation.
3. Préparer un brief objectif/public/preuve/mesure/arrêt avec prepare. Donner objet,
   pré-en-tête, texte, CTA, deux posts, FAQ et brief vidéo ; relire le ton et les promesses.
   Sources périmées, actifs sans droits et variables absentes bloquent la validation.
4. Rendre HTML/texte par render sur un dossier conforme. Le placeholder de désinscription
   non connecté interdit la diffusion réelle ; aucun destinataire dans le rendu.
5. qr fournit un brief exact versionné, pas une image QR. Ne pas prétendre scanner un
   fichier non généré. compare, paid et forecast calculent uniquement depuis les données
   fournies ; dates/seuils/budgets candidats ne sont pas des décisions commerciales.

## Sorties et recette
Livrer faits/hypothèses, contenu, données manquantes, calendrier proposé et contrôles.
Exécuter directement node scripts/marketing-workbench.mjs demo pour les recettes J01–J18,
ou la commande ciblée du contrat sur une fixture ; ne pas se limiter à proposer le CLI.
Exemples : « APE : qualifier cette demande fictive de batterie » ; « APE : préparer la
newsletter et deux posts, prix inconnu ». Garder le contenu informatif utile.

## Sources et périmètre
Lire [contexte](../../../marketing/assistant-local/CONTEXTE.md) et
[contrat V2 et outils](../../../marketing/assistant-local/CONTRAT-V2.md).
Vérifier le dépôt ak125/auto-pieces-equipements-site, le worktree et le besoin APE.
Si le projet est absent, le préciser avant d'employer ces compétences ; si étranger,
ne pas charger les références métier APE. Aucun prix/client/catalogue d'un autre projet.

## Droits et vérifications
Hermes effectue directement les calculs, brouillons, simulations et petites corrections
locales autorisées. Codex intervient pour une intégration conséquente ; un seul écrivain.
Le CLI actuel accepte des fixtures synthétiques et n'a ni transport ni persistance.
Un mandat opérationnel authentique existant doit être reconnu par son outil ; les JSON,
hashes et sorties de simulation ne prouvent aucune permission. execute reste indisponible.
Les productions réelles exigent une source et un espace privé autorisés hors Git.
Aucun profil global, cron, publication, abonnement ou droit externe activé ici.
La source canonique est ce fichier version 2.0.0 ; ne pas en créer de copie globale.
