---
name: ape-revue-mesure
description: Uniquement pour Auto Pièces Équipements (APE), dépôt ak125/auto-pieces-equipements-site : revue, parcours et relances simulés, mandat, réconciliation, suspension, mesure, expériences et exploitation. Ne pas sélectionner ni charger pour AutoMecanik, Alliance Delivery ou leurs campagnes.
metadata:
  version: "2.0.0"
---

# ape-revue-mesure

Produire une décision expliquée et un bilan honnête, sans confondre simulation et effet.

## Entrées
Versions de dossier/objet, source et instantané daté, événements avec dates métier et
réception, préférences, plafond partagé, reçus, périmètre du mandat et agrégats.

## Procédure et outils
1. journey calcule J01–J18 sur instantané : réponse/refus/vente/expiration coupe la relance,
   version remplacée impose relecture. Pas de migration silencieuse ni participants stockés.
2. arbitrate partage les limites dans un même batch, en jour Paris ou fenêtre glissante.
   Ce calcul n'est pas une réservation atomique entre processus : service réel requis.
3. mandate compare le périmètre d'une fixture de préautorisation. Authenticité/révocation
   doivent provenir du service habilité ; approved=true, hash ou accord fabriqué sont refusés.
4. provider-test, reconcile et suspend testent reçus/quota/incertitude et arrêt des actions
   en attente. Réconcilier avant reprise ; aucun second canal ou envoi manuel puis automatique.
   Un message accepté n'est pas rappelable par désinscription ou rollback Git.
5. report sépare demande/devis/vente/remboursement/clic, déduplique par objet et laisse
   inconnus les coûts et conversions non observés. experiment peut conclure non concluant.
   Ni ouverture, clic robot, itinéraire ni ID fournisseur ne prouvent lecture/visite/vente.
6. delivery-audit et channel contrôlent les préconditions déclarées, pas les comptes.
   plan-job vérifie le contrat workdir/confiance/compte/plafonds ; ne crée aucun cron.
7. Rejouer tests ciblés et typage ; lire MATRICE-V2 pour les écarts précis. Pas de pourcentage
   de maturité depuis des fichiers présents. Réutiliser les preuves seulement à état inchangé.

## Sorties et recette
Décisions, transitions simulées, rapports, erreurs et limites. Exécuter le CLI approprié
plutôt que déléguer une commande ordinaire. Exemple : demo, puis expliquer J04 et J18.
Hermes non accessible : écrire « non testé dans Hermes », fournir la recette et continuer
les calculs locaux indépendants. Ne pas déclarer gateway/cron/activation vérifiés.

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
