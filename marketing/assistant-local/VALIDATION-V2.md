# Validation V2 — 2 octobre 2026

**État historique avant le lot de corrections.** La preuve actuelle est dans
[CORRECTIONS-V2.md](CORRECTIONS-V2.md) : 92 tests marketing verts, typage strict,
suite globale 235/237 puis reprise ciblée 4/4, build/parité publics réussis.
Les nombres et essais d'agent ci-dessous décrivent la livraison initiale V2.

## Identité et portée

Candidat local non commité : branche `codex/ape-marketing-skills-20261002`,
base `3756cba51edff2f280555bab13872edc72efde52`. Le SHA de base ne représente
pas les nouveaux fichiers. Le checkout initial et ses modifications restent séparés.
Les [72 lignes C/P/J](MATRICE-V2.json) décrivent une couverture locale et ses limites,
pas 72 capacités entièrement raccordées. Aucun résultat de CI ou de production.

## Résultats exécutés

| Preuve | Observation | Limite |
|---|---|---|
| Runtime | Node portable 24.21.0, npm portable 12.0.2 existants | Aucun changement de runtime ou manifeste |
| Tests marketing ciblés | **81 réussites, 0 échec**, dont 23 cas V1 et 18 parcours positifs J01–J18 | Données entièrement fictives, fonctions déterministes |
| Typage complémentaire | `tsc -p tsconfig.marketing.json` réussi | Vérification séparée des scripts npm conservés |
| Première chaîne npm test | Politique HTTP/socle et typages existants réussis ; 228 tests, 223 réussites, 5 échecs comptés | Trois démarrages serveur à 10 s et un validateur à 15 s ont dépassé leurs délais, plus l'échec du test parent ; build final non atteint dans cette invocation |
| Reprise ciblée | local-server et published-artifact : **49 réussites, 0 échec**, un fichier à la fois, 39,6 s | Aucun code ni délai modifié ; compatible avec un effet de charge/concurrence, cause système exacte non établie |
| Build/validation et parité | Réussis : 12 pages SEO, exactement 31 fichiers publics ; source/dist identiques avant restauration des fins de ligne, contenu identique à la base | 12 fichiers générés remis aux fins de ligne du checkout après comparaison ; aucun changement public en contenu |
| Newsletter V2 | HTML et texte générés ; Edge headless, largeur 390 et scrollWidth 390, langue fr, zéro requête, contraste minimum 8,75:1 | Inspection visuelle effectuée ; pas une validation Outlook/Gmail, DNS ou délivrabilité |
| Découverte Codex | CLI 0.159.0, skills/list : quatre skills repo activés, chemins canoniques, aucune erreur | Découverte native distincte d'une sélection implicite par le modèle |
| Invocation agent | Quatre demandes bornées ; segment, J04 et reconcile réellement exécutés | Voir [recette agent](RECETTE-AGENT-V2.md) ; ni comparaison avant/après contrôlée, ni score statistique |
| Hermes | **Non testé dans Hermes** ; exécutable absent du PATH local | Aucun VPS, profil, confiance ou cron modifié |
| Performance | Import et évaluation de 1 000 profils synthétiques : 61 ms dans la recette ciblée ; 191 ms pour le test dans la chaîne concurrente | Une machine, un corpus borné ; aucun débit réseau ou capacité fournisseur mesuré |

Le journal complet initial est conservé : `tmp/marketing-evidence/v2-npm-test.log`.
La reprise ciblée est indépendante ; ne pas présenter cette première invocation comme verte.
Commande : `node --test --test-concurrency=1 tests/local-server.test.mjs tests/published-artifact.test.mjs`.
Journaux : `v2-retry-existing.log`, `v2-build.log`, `public-parity-v2.json` dans ce même répertoire.
Les heuristiques de confidentialité, le contrôle d'un index fourni et les mandats de fixture
ne remplacent ni permissions effectives ni authentification ni examen sémantique humain.

## Correspondance T01–T20

Les fichiers ci-dessous sont sous `tests/`. Plusieurs assertions peuvent appartenir à un
même test ; 20 familles de recette ne signifient pas seulement 20 assertions.

| ID | Preuves locales exécutées | Ce qu'elles ne prouvent pas |
|---|---|---|
| T01 | marketing-data, marketing-local, marketing-coverage : projet étranger, identité ambiguë et projet imbriqué refusés | Isolation d'un système externe |
| T02 | marketing-contracts et marketing-coverage : homonyme, contexte absent, version, liens ; découverte native et quatre demandes agent | Routage implicite universel, Hermes |
| T03 | marketing-data : replay, local-part conservé, conflit email, opposition conservée après import | Import ou rollback dans un CRM |
| T04 | marketing-data et marketing-contracts : ET/OU/NON, historique inconnu, séquence, relation, fenêtre, profondeur et date impossible | Segments alimentés en continu |
| T05 | marketing-data, marketing-contracts et marketing-journeys : opposition/pause/plainte, réponse tardive, devis accepté/remplacé | Propagation temps réel des préférences |
| T06 | marketing-local et marketing-studio : prix/période, faits, actifs, variables, URL | Vérité commerciale de données réelles |
| T07 | marketing-operations, marketing-contracts et marketing-local : batch commun, fenêtre glissante/jour Paris, DST, historique invalide | Réservation atomique de quotas entre processus |
| T08 | marketing-operations et marketing-journeys : ordre métier/réception, doublons contradictoires, événement tardif, rejeu sur reçu fourni | Reprise durable après panne d'un service |
| T09 | marketing-operations : état incertain, rapprochement puis reçu accepté fictif, absence de retry aveugle | Lecture fournisseur réelle |
| T10 | marketing-operations : faux mandat, expiration, révocation, compte, élargissement, exclusions | Authentification de l'approbateur ; permissionVerified reste false |
| T11 | marketing-local, marketing-studio, marketing-coverage, marketing-workbench : entrée privée, injection d'avis, liens interdits et erreur minimisée | Détection exhaustive des données personnelles ou des injections |
| T12 | marketing-operations : fetch surveillé, variable de clé fictive présente, zéro appel ; liste publique et plan-job | Aucune vraie clé n'a été chargée pour ce test |
| T13 | marketing-operations et marketing-journeys : mauvais compte, fenêtre WhatsApp, opposition et canal service distinct | Compte social professionnel ou expéditeur connecté |
| T14 | marketing-local et marketing-studio : échappement, variables et accents ; HTML/texte V2 et preuve navigateur ci-dessus | Matrice des clients email, traduction multilingue |
| T15 | marketing-studio et marketing-contracts : robots/ouvertures non ventes, déduplication, remboursement par commande, coût et cohorte manquants | Attribution causale, vente hors ligne non observée |
| T16 | marketing-studio : affectation stable, témoin, contamination, volume/durée insuffisants, aucun gagnant déclaré | Puissance ou significativité statistique |
| T17 | marketing-operations : pending annulé, accepted conservé, périmètre de mandat | Rappel d'un message livré |
| T18 | marketing-data : plan export/effacement et suppression conservée contre réimport | Exécution des droits ou rétention dans une base réelle |
| T19 | marketing-operations : mauvais workdir/confiance/compte rejeté | Identité système authentifiée ou contexte gateway |
| T20 | marketing-workbench et marketing-operations : 1 000 profils, bornes, budget et absence de LLM | Minuterie d'arrêt d'un ordonnanceur ou garantie de charge |

Les cas positifs C01–C30 sont répartis entre data, studio, operations, contracts et
journeys ; chaque ligne de matrice précise la sous-fonction effectivement implémentée.
Les prévisions sont des moyennes/min/max observés, les récompenses des propositions,
les QR des briefs de destination. Les modèles prédictifs, rendus médias avancés,
collecteurs, abonnements, transports et quotas durables manquants restent nommés.

## Reproduction et conservation des preuves

Avec les versions prescrites par le dépôt, depuis sa racine :
```sh
node --test tests/marketing-*.test.mjs
node node_modules/typescript/bin/tsc -p tsconfig.marketing.json
node scripts/marketing-workbench.mjs demo
node scripts/marketing-workbench.mjs render marketing/assistant-local/recette-v2/render.json --now 2026-10-02T10:00:00Z
npm test
```

La CLI render renvoie le HTML/texte en JSON et n'écrit aucun fichier. Les deux fichiers
de présentation enregistrés dans recette-v2 proviennent de ce même renderer et de la
fixture versionnée. Les preuves de navigateur, découverte et parité sont locales sous
`tmp/marketing-evidence/`, ignorées par Git ; les résultats résumés ici sont conservés.
Les recettes unitaires et les fixtures permettent la reproduction sans ce répertoire.

Réutiliser un résultat seulement si les fichiers, dépendances, configuration et données
de son périmètre n'ont pas changé. Le rendu V1 et son rapport restent historiques.
L'avertissement npm sur `global-ignore-file` est hérité et n'a entraîné aucune mutation
de configuration. Aucun commit, push, PR, déploiement, envoi, dépense ou cron activé.
