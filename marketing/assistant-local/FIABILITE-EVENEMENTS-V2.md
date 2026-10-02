# Événements d'arrêt et relances — 2 octobre 2026

Lot local limité à foldEvents dans scripts/marketing/operations.mjs, branche
codex/ape-marketing-skills-20261002, base
3756cba51edff2f280555bab13872edc72efde52.

## Défauts reproduits

Un identifiant d'objet avec espaces périphériques passait la validation puis était
comparé sans normalisation. La réponse était ignorée et J04 pouvait proposer une
nouvelle relance. Les clés d'événement présentaient la même incohérence, masquant
des doublons contradictoires.

La comparaison textuelle des dates ne reconnaissait pas les instants équivalents.
Lors de réceptions répétées, la dernière ligne remplaçait la précédente ; certains
conflits conservaient même des événements partiels dépendant de l'ordre d'entrée.
Un type inconnu ou une version mal formée pouvait passer sans erreur.

## Corrections

- Identifiants normalisés avant filtrage et déduplication ; chaque dossier conserve
  son périmètre, sans mélanger les événements d'un autre objet.
- Types locaux et versions contrôlés ; un type inconnu reste bloquant.
- Comparaison des dates par instant ; représentation UTC canonique.
- Réceptions concordantes dédupliquées avec la première réception valide observée.
- Tri par survenue, puis réception et identifiant.
- Conflit ou schéma invalide : aucune liste partielle, stop=null et erreurs explicites.
  Le parcours bloque avant toute proposition. Les exceptions J12/J15/J18 existantes
  au signal d'arrêt ne changent pas.

Le [contrat](CONTRAT-V2.md) décrit les champs, types et limites. La correction reste
dans la fonction commune ; aucune exception propre au test J04 n'a été ajoutée.

## Preuves ciblées

Huit nouveaux tests écrits avant correction : **0/8 puis 8/8**, dans
[marketing-event-history.test.mjs](../../tests/marketing-event-history.test.mjs).
Ils couvrent la décision J04, les permutations, dates équivalentes, réceptions
répétées, erreurs, collections inutilisables et séparation des dossiers. Des
processus CLI réels vérifient stop/code 0, blocked/code 1 et la relance encore
proposable sur la fixture initiale sans événement. Typage marketing strict vert.

Logs locaux ignorés sous tmp/marketing-evidence : events-red.log, events-green.log,
events-typecheck.log, events-full.log, events-server-isolated.log et
events-full-recheck.log. Sauvegarde avant lot :
events-before/operations.mjs. Comparer les changements ultérieurs avant retour arrière.

Le premier npm test a donné 286/287 : échec de
« server-simple.js starts outside the repository and exposes only public routes »,
limite de démarrage de 10 secondes atteinte sans sortie du serveur. Les 140 tests
marketing ont réussi. Rejoués isolément sans aucune modification, les quatre tests
local-server ont réussi. La cause exacte du délai n'est pas établie ; le correctif
marketing ne prétend pas résoudre cette intermittence. Aucun délai, réglage de
concurrence ni mécanisme de retry n'a été ajouté aux tests ou au serveur.

La seconde exécution standard, après ce contrôle isolé, réussit : **npm test
287/287, dont 140 tests marketing**. Dépendances, typages site, build et validation
réussis sous Node 24.21.0/npm 12.0.2. 11 pages catalogue générées, 12 pages SEO
validées et 31 fichiers publics identiques en contenu à la base ; source/dist
identiques avant restauration des seules fins de ligne générées. La première
exécution échouée reste conservée et n'est pas assimilée à une exécution verte.
Ce second passage ne garantit pas la disparition du retard intermittent de démarrage.

## Limites

Ces vérifications portent sur des fixtures synthétiques. Elles n'établissent pas
l'exhaustivité, la provenance ou l'ordre authentifié d'un historique réel. Le
vocabulaire d'une source externe devra être explicitement raccordé au contrat.
Aucune persistance, exécution de relance ou connexion n'est ajoutée.

Quatre skills, renderer et dépendances inchangés ; preuves antérieures de découverte
Codex et mobile réutilisables. Essai agent initial historique ; fonction corrigée
non évaluée par agent. Hermes non testé. Aucun push, PR, publication, envoi, dépense
ou programmation activée ; candidat non commité.
