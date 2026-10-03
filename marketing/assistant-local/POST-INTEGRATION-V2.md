# Intégration et recette locale — 3 octobre 2026

## État intégré

La [PR #33](https://github.com/ak125/auto-pieces-equipements-site/pull/33)
a été fusionnée le 2 octobre 2026 à 23 h 50, heure de Paris. Le commit intégré
est `1345111aa109f6f134b5b82ca67e178c104ec0cf`, avec l'arbre
`2bf703db459757d9cf1d9741bbc8697e1b97025b`, identique au candidat revu `cc1eb64`.
La lecture de `main` distant le 3 octobre confirme cette référence.

Le présent lot part de ce commit dans la branche locale
`codex/ape-recette-post-integration-20261003`. Il actualise les preuves et le dossier
de reprise. Les fonctions métier marketing, les quatre skills et les fixtures sont
inchangés ; la sortie informative de `capabilities` renvoie désormais aux recettes
datées et un test CLI couvre les variantes de l'avis sensible déjà répondu.
Le checkout initial et ses documents Google Business sont conservés séparément.

L'intégration de ce complément dans `main` a été autorisée le 3 octobre. Les
résultats de sa PR et de ses workflows doivent être contrôlés sur son propre SHA ;
les preuves de PR #33 ci-dessous restent celles du lot précédent. Le workflow
existant publie Pages après fusion. Aucun contenu public ni workflow n'est modifié.

## Preuves de livraison réutilisées

- [Revue automatique ciblée](https://github.com/ak125/auto-pieces-equipements-site/pull/33#issuecomment-5962042134) :
  aucun défaut P1/P2 identifié dans le périmètre examiné ; 54 tests ciblés réussis.
- [CI du commit fusionné](https://github.com/ak125/auto-pieces-equipements-site/actions/runs/37069220403) :
  314/314 tests du site, 4/4 tests du Worker, contrôles de types et builds réussis.
- [Publication du même commit](https://github.com/ak125/auto-pieces-equipements-site/actions/runs/37069220398) :
  build, déploiement et contrôle après publication réussis. Les 35 contrôles sont
  conformes dès la première tentative : 31 fichiers publics comparés à l'artefact
  déployé et quatre chemins privés inaccessibles.

Ces preuves datent du déploiement du 2 octobre ; elles ne constituent pas une nouvelle
mesure de disponibilité du site le 3 octobre. Les documents de
[préparation d'intégration](INTEGRATION-V2.md) et de
[recette initiale](RECETTE-AGENT-V2.md) restent conservés comme historique.

## Nouvelle recette d'invocation

La [recette du 3 octobre](RECETTE-POST-INTEGRATION-V2.md) complète les preuves
précédentes : sept demandes, dont trois contrôles de sélection de projet et quatre
cas métier exécutant six commandes. Toutes les commandes ont terminé avec le code 0.
Il s'agit d'une invocation guidée en contexte frais, pas d'une preuve de sélection
implicite de l'application ni d'une exécution dans Hermes.

## Limites et prochaine étape

L'intégration Git et la publication du site ne constituent pas une activation marketing.
La [recette Hermes suivante](EXECUTION-HERMES-V2.md) observe la découverte native,
le chargement des quatre skills et des simulations dans un profil CLI dédié.
La découverte, le choix guidé d'un skill, l'exécution d'une CLI et un effet réel
restent des preuves distinctes.
Les tests déterministes ne prouvent pas le comportement d'un agent sur toutes les
72 exigences de la [matrice](MATRICE-V2.md).

Le raccordement réel reste défini dans [ACTIVATION-V2](ACTIVATION-V2.md), dépendances
D1–D7. Le raccordement D7 de recette a été autorisé puis appliqué ; cette autorisation
reste limitée au checkout et au profil dédiés décrits dans son rapport. Les services
marketing réels, le gateway et cron n'ont pas été activés par cette recette.
