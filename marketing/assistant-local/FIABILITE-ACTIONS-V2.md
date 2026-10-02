# Quotas, canaux et reçus simulés — 2 octobre 2026

Lot local sur codex/ape-marketing-skills-20261002, base
3756cba51edff2f280555bab13872edc72efde52. Corrections limitées à arbitrate,
channelCheck et reconcile dans scripts/marketing/operations.mjs.

## Défauts reproduits et corrections

- Des identifiants validés avec espaces périphériques pouvaient échapper aux
  comparaisons de quotas. La validation et le comptage utilisent désormais la même
  identité normalisée, dans l'historique comme dans les nouvelles propositions.
- Une même clé d'action pouvait être proposée plusieurs fois. Sa répétition bloque
  tout le lot, y compris si les deux versions ont des coûts différents.
- Des plafonds de contacts fractionnaires pouvaient autoriser trop de propositions.
  Les plafonds de dénombrement sont désormais des entiers sûrs ; zéro reste valide.
- La plage 09:30–18:15 était calculée à l'heure entière. Les minutes, secondes et
  millisecondes sont prises en compte, avec début inclus et fin exclue à Paris.
- Un budget SMS négatif ou une horloge invalide pouvait laisser le canal prêt.
  Ces entrées sont maintenant refusées ; ready ne permet toujours aucune exécution.
- Un reçu pouvait remplacer un identifiant fournisseur connu, promouvoir un état
  précédent inconnu ou faire régresser un état terminal. Le schéma, l'identité et
  les transitions sont contrôlés. Toute incohérence porte une erreur explicite,
  propagée par la CLI avec le code 1, sans retry.

La [sémantique complète](CONTRAT-V2.md) précise les états et transitions admis.
La politique de rapprochement est conservatrice et propre aux fixtures : aucun
contrat fournisseur réel ni ordre authentifié des reçus n'est établi.

## Preuves

- Neuf tests de régression écrits avant correction : **0/9 puis 9/9**.
  [Tests des limites d'action](../../tests/marketing-action-boundaries.test.mjs).
- **npm test standard : 272/272**, dont **125 tests marketing** ; dépendances,
  typages du site, build et validation inclus. Typage marketing strict vert séparément.
- Processus CLI réellement lancés sur fixtures négatives ; erreurs bloquantes,
  canExecute=false et externalCalls=0 contrôlés.
- Build de 11 pages catalogue ; validation de 12 pages SEO et 31 fichiers publics.
  Contenu public identique à la base, liste publique exacte et source/dist identiques
  avant restauration des seules différences de fins de ligne générées.
- Checkout initial a3c8c0f et ses modifications préservés ; aucun changement de
  dépendance, configuration, autorisation ou source publique.

Logs ignorés dans tmp/marketing-evidence : actions-red.log, actions-green.log,
actions-typecheck.log, actions-full.log, public-parity.json. Le log ciblé vert porte
le premier passage des neuf tests ; le log global inclut leurs cas complémentaires.
Sauvegarde avant lot : actions-before/operations.mjs. Comparer les modifications
ultérieures avant tout retour arrière. Les rapports précédents restent historiques.

## Limites

L'arbitrage est un calcul en mémoire : aucune réservation durable ou concurrence
réelle validée. Les reçus et permissions restent fictifs. Les autres adaptateurs
simulés ne sont pas déclarés exhaustivement validés par ce lot.

Renderer, quatre skills et dépendances inchangés : preuves de découverte native
Codex et mobile antérieures réutilisables. Essai agent initial historique ; fonctions
corrigées non réévaluées par agent. Hermes non testé. Le candidat est non commité ;
aucune CI distante, connexion, publication, dépense, envoi ou programmation activée.
