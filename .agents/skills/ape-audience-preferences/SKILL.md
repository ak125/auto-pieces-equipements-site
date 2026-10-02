---
name: ape-audience-preferences
description: Uniquement pour le magasin Auto Pièces Équipements (APE), dépôt ak125/auto-pieces-equipements-site : qualité des données, import simulé, segmentation, scores observés, préférences et confidentialité. Ne pas sélectionner ni charger pour AutoMecanik, Alliance Delivery ou leurs contacts.
metadata:
  version: "2.0.0"
---

# ape-audience-preferences

Calculer et expliquer une audience simulée sans créer de base de contacts.

## Entrées
Contrat de source autorisée, finalité/canal, période couverte, préférences et oppositions,
identifiants d'objets, règle versionnée et politique candidate. Dans cette livraison :
fixtures à identifiants syn- et emails example.invalid seulement.

## Procédure et outils
1. import normalise le domaine email sans supprimer points/tags ni fusionner deux IDs.
   Examiner erreurs par ligne, ambiguïtés et provenance. Le replay ne réabonne pas.
2. segment calcule ET/OU/NON, événements, séquences et relations exactes. Expliquer
   inclusions/exclusions et inconnues : historique absent ≠ aucune activité.
3. Distinguer estimation, instantané et dynamique ; tous exigent préférences et limites
   recontrôlées au moment de l'action réelle. Une exclusion réduit sans élargir le mandat.
4. score expose contributions/RFM observés sur fenêtre et poids hypothétiques, sans LTV
   ou probabilité inventée. Les attributs sensibles et solvabilité ne sont pas inférés.
5. privacy prépare export/effacement/rétention et conservation minimale des oppositions
   dans le système officiel, sans effacer ni exporter réellement. loyalty propose une
   règle hypothétique sans émettre de crédit ni inscrire un tiers.
6. Un achat, devis ou échange WhatsApp n'abonne pas. Ne jamais contourner un refus en
   changeant de canal. Les notifications de service nécessitent leur propre finalité.

## Sorties et recette
Références fictives et agrégats minimisés, règle et raisons, inconnues et blocages exacts.
Exemple exécutable : segment recette-v2/segment.json --now 2026-10-02T10:00:00Z
via node scripts/marketing-workbench.mjs (chemin complet dans le contrat).
Sans source réelle et espace privé établis, rester sur les fixtures, pas sur des clients.

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
