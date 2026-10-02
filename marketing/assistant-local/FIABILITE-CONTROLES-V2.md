# Suspension et tâches simulées — 2 octobre 2026

Lot local sur codex/ape-marketing-skills-20261002, base
3756cba51edff2f280555bab13872edc72efde52. Corrections limitées à suspendSimulation
et validateJob dans scripts/marketing/operations.mjs.

## Défauts reproduits et corrections

La suspension convertissait une entrée absente en liste vide et transformait chaque
ligne sans contrôler son identité, son état, les doublons ou un périmètre déclaré
différent du mandat. La liste doit maintenant être explicite et bornée. Un conflit
bloque tout le lot ; les doublons concordants sont dédupliqués après normalisation.
Les informations de périmètre présentes sont comparées au mandat fictif.

Seuls les éléments pending/proposed/scheduled deviennent cancelled dans la simulation.
Les états accepted/processed/uncertain/rejected/cancelled/quota restent inchangés.
Les sorties distinguent simulated de blocked et exposent les erreurs à la CLI.
Aucune permission réelle ni propriété des clés n'est authentifiée.

Le contrat de tâche acceptait des nombres fractionnaires pour les volumes et durées,
un répertoire relatif et une commande contenant des espaces périphériques. Il exige
désormais des entiers dans les bornes existantes, une commande exacte et un chemin
absolu égal au contexte. Les formes POSIX, Windows avec lecteur et UNC sont contrôlées
avec node:path ; aucun accès au disque ou au réseau n'est déclenché.

Voir le [contrat détaillé](CONTRAT-V2.md). Aucun ordonnanceur, service de suspension,
nouveau stockage, dépendance ou changement de configuration n'est ajouté.

## Preuves ciblées

Huit tests écrits avant correction, **0/8 puis 8/8**, dans
[marketing-control-inputs.test.mjs](../../tests/marketing-control-inputs.test.mjs).
Cas couverts : entrées absentes/mal formées, bornes 1000/1001, états, doublons,
permutations, périmètre contradictoire, nombres fractionnaires, chemins absolus
et relatifs, commande exacte et processus CLI réels. Typage marketing strict vert.
La recette de suspension existante reste un cas positif couvert par la CLI.

Validation complète actuelle : **npm test standard 295/295**, dont **148 tests
marketing**, réussi dès le premier passage de ce lot. Contrôles des dépendances,
typages site, build et validation réussis sous Node 24.21.0/npm 12.0.2.
11 pages catalogue générées, 12 pages SEO validées et 31 fichiers publics identiques
en contenu à la base ; source/dist identiques avant restauration des seules fins
de ligne générées. Les modifications du checkout initial et le correctif HTTP
antérieur sont préservés.

Logs ignorés sous tmp/marketing-evidence : controls-red.log, controls-green.log,
controls-typecheck.log et controls-full.log. Sauvegarde avant lot :
controls-before/operations.mjs ; comparer les changements ultérieurs avant retour arrière.

## Limites conservées

Le contrôle d'un chemin est syntaxique : existence, résolution des liens symboliques,
droits et provenance du contexte doivent être vérifiés par le futur runtime autorisé.
Un mandat concordant et une liste sans contradiction ne prouvent ni propriété des
éléments, exhaustivité ou permission effective. realEffects=0 et activated=false.

Le retard intermittent de démarrage serveur observé au lot précédent reste documenté
dans [FIABILITE-EVENEMENTS-V2](FIABILITE-EVENEMENTS-V2.md). Sa cause n'est pas établie ;
ce lot ne modifie pas le serveur, ses tests, leurs délais ou leur concurrence.

Quatre skills, renderer et dépendances inchangés : découverte Codex et preuve mobile
antérieures réutilisables. Fonctions corrigées non évaluées par agent ; Hermes non
testé. Candidat non commité ; aucune CI distante, connexion, activation, publication,
dépense, programmation, push ou PR.
