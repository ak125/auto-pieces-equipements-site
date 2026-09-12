# Mise à niveau des dépendances — 12 septembre 2026

## Périmètre et résultat

Mise à niveau locale complète des deux manifestes d'Auto Pièces, après comparaison
des configurations déclarées d'Alliance Delivery et d'AutoMecanik. La demande
reprend le chantier précédemment différé et précise la montée de Vite, TypeScript
et de l'outillage aux versions stables compatibles.

Base Auto Pièces : `b1f0ede0d32b2d34b4b96a2e5e246370b6cc8ace`.
Branche : `codex/align-node24-dependencies-20260912`.
Les dépôts Alliance et AutoMecanik ont été lus, pas modifiés. Le candidat est
publié dans la PR brouillon #16 pour validation CI. Fusion et déploiement
constituent une étape distincte.

## Versions retenues dans Auto Pièces

Les anciennes versions de paquets sont celles des lockfiles de la base, pas
seulement les plages déclarées dans les manifestes.

| Composant | Avant | Après |
|---|---|---|
| Node CI / build Pages | 20 | 24.21.0 LTS |
| npm | Non déclaré | 12.0.2 |
| Vite | 7.1.8 | 8.3.0 |
| Axios | 1.8.4 | Retiré et interdit ; `fetch` natif |
| CORS | 2.8.5 | 2.8.6 |
| dotenv | 17.2.3 | 17.4.2 |
| Express | 5.1.0 | 5.2.1 |
| Plugin Vite legacy | 7.2.1, non utilisé | Retiré |
| TypeScript | Worker 5.8.2 ; absent du site | 7.0.2 pour Worker et JavaScript actif |
| Types Node du site | Absents | 24.13.4, majeure alignée sur le runtime |
| Types Express / CORS | Absents | 5.0.6 / 2.8.19 |
| Vitest du Worker | 3.0.9 | 4.1.11 |
| Intégration de test Cloudflare | vitest-pool-workers 0.7.8 | vitest-plugin 1.1.8 |
| Types Workers | 4.20250327.0 | 5.20260911.1 |
| Wrangler | 4.6.0 | 4.131.1 |

Vitest 5.0.0 est stable mais exclu : le plugin Cloudflare 1.1.8 déclare
`vitest`, `@vitest/runner` et `@vitest/snapshot` à `^4.1.0`.
`npm outdated` ne remonte aucun retard direct pour le site ; dans le Worker,
seul Vitest apparaît. Réexaminer cette exception à la sortie d'un plugin
Cloudflare annonçant la prise en charge de Vitest 5.

Node reste sur la branche LTS 24. Node 26 Current n'est pas la cible commune.
Les versions Node et npm sont bornées à leur majeure dans `engines` et les deux
`.npmrc` activent `engine-strict`. `.nvmrc` fournit la version exacte aux workflows.
Toutes les dépendances directes sont épinglées ; les deux lockfiles restent au
format 3 et ont été régénérés puis réinstallés avec npm 12.0.2.

npm 12 bloque par défaut les scripts d'installation des dépendances. Les seuls
scripts nécessaires autorisés dans le Worker sont ceux d'`esbuild@0.28.1` et
`workerd@1.20260911.1`, qui installent/vérifient leurs binaires. Les autorisations
sont épinglées à ces versions, sans autorisation globale.

Vite utilise maintenant `vite.config.mjs`, cohérent avec sa syntaxe ESM ; le scan
des dépendances utilise les 15 pages HTML de `publicFiles`, liste partagée avec
le build, pour éviter les anciens dashboards et les copies temporaires.
Le build public demeure le générateur/copieur statique.
Le site JavaScript n'a pas été converti en TypeScript. Le contrôle couvre les
sources et tests du Worker ainsi que, désormais, le JavaScript actif du site et
du serveur avec `checkJs`.

## Typage strict du JavaScript actif

Deux configurations séparent les environnements : `tsconfig.browser.json`
contrôle `assets/site.js` et le script de diagnostic ; `tsconfig.server.json`
contrôle les trois points d'entrée serveur, le helper fetch, la politique HTTP,
la liste publique et Vite. Les neuf fichiers d'entrée utilisent `strict`,
`checkJs`, `noUncheckedIndexedAccess` et `noEmit`, sans `skipLibCheck`.
Les types DOM et Node sont isolés ; les types Node restent sur la majeure 24.

`npm run typecheck` est intégré dans `npm test`. Le typage a conduit à protéger
les accès DOM, les cibles d'événements, les index des horaires et les formes de
réponses Google. Les JSON sont traités comme `unknown` avant validation ; les
valeurs d'erreur inattendues ont un message de secours. Aucun contournement par
`@ts-ignore`, `@ts-nocheck` ou ajout d'`any` n'a été introduit.
Les scripts anciens non publiés et les tests JavaScript ne sont pas inclus dans
ce lot de typage ; les tests TypeScript du Worker restent contrôlés séparément.

## Transport HTTP natif et interdiction d'Axios

Le serveur commun aux trois commandes de démarrage utilise `fetchPlaceDetails`, dans
`server/google-places.cjs`, fondé sur `fetch` natif de Node 24. Le helper encode les
paramètres avec `URLSearchParams`, refuse les réponses HTTP non réussies, décode
le JSON et limite à 10 secondes la requête et la lecture du corps. L'erreur HTTP
ne contient ni URL ni clé API. L'exemple commenté navigateur utilise aussi `fetch`.
La suppression d'Axios retire 13 paquets de l'installation racine.

La règle est inscrite dans `AGENTS.md` et le README. Le script
`scripts/check-http-policy.mjs` refuse sa présence dans les sources JS/TS/HTML,
les workflows YAML, les manifestes et les lockfiles npm de tout le dépôt, y compris
les alias et dépendances indirectes des sous-projets. Il ignore les fichiers
générés, installations et répertoires temporaires. `preinstall`,
`npm run check:dependencies` et `npm test` exécutent le contrôle ; les workflows
existants exécutent `npm test`. Les contre-tests prouvent un code de sortie 1
pour un alias npm, un lockfile indirect, un import et un CDN.

Les tests du transport couvrent encodage, JSON invalide, erreur réseau, HTTP 503,
expiration pendant un corps JSON bloqué et réponses de l'endpoint Express actif
(succès, refus Google, erreur HTTP). Aucun appel réel à Google n'est nécessaire.
`npm start` utilise `server-simple.js`, vérifié ici. `server.js` et
`server/server.js` sont désormais des points d'entrée vers cette même application.

## Corrections du serveur local

Le serveur ne publie plus la racine entière du dépôt. Il sert uniquement les
fichiers de `publicFiles` et les routes de diagnostic explicites. Les chemins sont
résolus depuis le dépôt, indépendamment du dossier de lancement. Le `.env` utilise
aussi un chemin absolu. L'écoute est locale sur `127.0.0.1` par défaut ; `HOST` et
`PORT` permettent une configuration explicite. Les ports invalides sont refusés
et les échecs d'écoute signalés avec un code de sortie non nul.

La page `/test` et son script sont séparés du serveur. Le rendu utilise des nœuds
DOM et `textContent`, sans interpolation des avis dans du HTML. Les photos doivent
utiliser HTTPS, les étoiles sont bornées entre 0 et 5 et les états de chargement,
liste vide et erreur sont explicites. La requête navigateur expire après 12 s.

L'API conserve le format de succès ; les échecs HTTP/réseau/JSON ou les résultats
Google mal formés renvoient 502, les expirations 504. Aucun détail d'exception amont
n'est renvoyé au navigateur. Les réponses API ne sont pas mises en cache.

Les anciens prototypes étaient inutilisables : modules/données absents dans
`server.js`, Java Android inséré dans `server/server.js`, diagnostic OBD sans
réponse et avis fictifs de secours. Leur contenu est conservé intégralement dans
`docs/archives/prototype-mcp.md` et `prototype-obd.md`. Les deux anciennes commandes
démarrent maintenant le serveur actif ; les routes MCP/OBD non opérationnelles
ne sont pas exposées. Aucune dépendance supplémentaire n'a été introduite.

## Actions GitHub

| Action | Avant | Après |
|---|---|---|
| checkout | v4 | v7.0.1 |
| setup-node | v4 | v7.0.0 |
| configure-pages | v4 | v6.0.0 |
| upload-pages-artifact | v3 | v5.0.0 |
| deploy-pages | v4 | v5.0.1 |

Versions et entrées vérifiées dans les releases et `action.yml` officiels.
Les actions JavaScript utilisent Node 24 ; l'action d'upload est composite.
Les déclencheurs de publication Pages restent ceux de la base. Le workflow
qualité ajoute un job Worker : installation, typage, tests locaux et build à blanc.
Il n'utilise aucun secret Cloudflare et n'exécute pas le script `deploy`.

## Preuves locales

Runtime portable Node 24.21.0 officiel, archive vérifiée par SHA256. La version
Node globale Windows n'a pas été remplacée. npm 12.0.2 est installé dans l'espace
temporaire du worktree. Les vérifications finales utilisent ces deux versions.

| Vérification | Résultat |
|---|---|
| `npm ci`, racine | Réussite |
| `npm test`, racine | Typage strict et 54 tests, 0 échec ; politique HTTP validée ; génération de 11 pages ; validation de 12 pages SEO et 31 fichiers publics |
| Contre-preuves de typage | Mauvais arguments refusés ; `process` interdit côté navigateur et `document` interdit côté Node |
| `npm --prefix google-places-proxy ci` | Réussite, scripts natifs autorisés explicitement |
| `npm --prefix google-places-proxy run typecheck` | TypeScript 7.0.2, sources et tests sans erreur |
| `npm --prefix google-places-proxy test` | 4 tests, 0 échec, runtime local Cloudflare |
| `npm --prefix google-places-proxy run build` | Wrangler 4.131.1, build `--dry-run` réussi |
| `npm ls --depth=0`, deux projets | Arbres valides, versions conformes |
| `actionlint 1.7.12`, deux workflows | Réussite, aucune erreur |
| `npm audit`, racine | 15 alertes initiales, dont 1 critique → 0 |
| `npm audit`, Worker | 17 alertes initiales, dont 2 critiques → 0 |
| Parité du build | SHA256 identiques pour 30 fichiers ; `assets/site.js` seul modifié par le typage et les gardes DOM, copie publiée conforme à la source |
| Vite 8.3.0, HTTP local | 15 pages HTML publiques, module navigateur et client HMR : HTTP 200 ; entrées configurées vérifiées |
| Vite 8.3.0, prévisualisation | 31 fichiers publics : HTTP 200 et SHA256 conformes au build |
| Express 5.2.1, HTTP local | Accueil : HTTP 200 ; configuration Google absente : erreur attendue, sans appel Google |
| Trois commandes serveur depuis un autre dossier | 31 fichiers publics conformes ; sources, lockfiles, archives, fichiers cachés et traversées refusés ; routes de test disponibles |
| Rendu de la page de test | Texte hostile inerte, photos non HTTPS refusées, notes bornées, erreurs HTTP et expiration visibles (DOM simulé) |

La comparaison du build utilise la même convention de fins de ligne Windows
pour les deux checkouts et exécute la génération du catalogue dans les deux cas.
Les pages HTML et les visuels ne changent pas. Les journaux et inventaires
bruts sont conservés localement dans `tmp/evidence/` (ignoré par Git).

Après retrait d'Axios, l'installation propre, les 45 tests, le build du site,
l'audit racine et les contrôles HTTP ont été réexécutés (`fetch-site-ci.log`,
`fetch-site-test.log`, `fetch-site-audit.json`, `fetch-smoke.log`). Les validations
Worker et actionlint précédentes sont réutilisées : leurs sources, dépendances,
configurations et workflows sont inchangés depuis ces résultats verts.

Après corrections serveur, les 51 tests et le build ont été exécutés ensemble
(`server-site-test.log`), puis les contrôles Vite/preview/Express et la comparaison
des 31 SHA256 (`server-smoke.log`). Les dépendances et lockfiles sont inchangés :
installation propre et audits précédents réutilisables. Les archives des deux
prototypes ont été comparées au contenu de la révision précédente.

Après ajout du typage site/serveur : nouvelle installation propre, 54 tests,
build et audit racine sans alerte (`checkjs-ci.log`, `checkjs-site-test.log`,
`checkjs-audit.json`). HTTP Vite/preview/Express et fichiers publiés vérifiés
(`checkjs-smoke.log`). Les contre-preuves utilisent des copies temporaires
(`checkjs-counterproof.log`). Le typage et les 4 tests Worker ont été réexécutés
pour vérifier l'effet possible des nouveaux types installés dans le dossier
parent (`checkjs-worker-typecheck.log`, `checkjs-worker-test.log`). Le build
Wrangler et actionlint précédents restent réutilisables, leurs périmètres inchangés.

Cette section décrit les preuves locales Windows. La validation CI Linux est
suivie dans la PR #16 et dans `tmp/evidence/ci-checkpoint.md`. Aucune preuve
navigateur interactive ni vérification d'un Worker ou d'un site déployé.
Les audits npm portent sur les deux lockfiles
Auto Pièces et les avis du registre au moment de cette vérification.

## Comparaison actuelle des autres projets

Lecture des manifestes, fichiers de version, Dockerfiles et workflows :
32 fichiers Alliance et 94 fichiers AutoMecanik. Révisions immuables consultées :

- Alliance : `58e91719ee69b06721772ed1e127db3804e06335`.
- AutoMecanik (`nestjs-remix-monorepo`) : `0c31807c8453c251d70c7575eafcc973f04eed14`.

| Sujet | Alliance | AutoMecanik |
|---|---|---|
| Node déclaré | `>=24.0.0`, CI 24 | `>=24.0.0`, `.nvmrc` et CI 24 |
| Images | 24.19.0 bookworm-slim avec digest | 24-alpine, 24-slim et 24-bookworm-slim selon service |
| Gestionnaire | pnpm 11.17.0 | npm 11.13.0 |
| TypeScript principal | 6.0.3 | 6.0.3 |
| TypeScript 7 | 7.0.2 dans un spike dédié | Scripts de comparaison TS7 présents dans le manifeste |
| Vite | 8.2.2, portail web | 8.1.0, racine et frontend |
| Vitest | 4.1.11 | `^4.0.2` frontend ; `^2.1.8` design-tokens |
| Types Node | 26.4.0 dans plusieurs paquets | `^24`, également imposé par override |

Écarts à traiter dans les lots de ces projets :

1. Alliance : types Node 26 pour un runtime 24 ; vérifier et borner les types 24
   contre le typecheck complet avant modification. Image 24.19.0 à mettre à jour
   avec un nouveau digest validé. Borne supérieure Node absente.
2. AutoMecanik : Node sans borne supérieure et images flottantes ; npm et Vite en
   retrait ; Vitest 2 dans design-tokens à migrer avec les tests de ce paquet.
3. Les deux : TypeScript 7 ne doit pas remplacer aveuglément TypeScript 6 dans les
   outils qui consomment l'API du compilateur. Microsoft indique que TypeScript 7.0
   ne fournit pas cette API ; les chaînes de lint/framework doivent être validées
   selon leur compatibilité. Dans Auto Pièces, la compilation directe du Worker
   n'a pas cette dépendance et a été validée avec TypeScript 7.

La lecture des déclarations des autres projets ne constitue ni un audit complet
de leurs lockfiles ni une mesure des versions des processus en production.
Leur modernisation effective nécessite leurs worktrees canoniques et leurs
validations propres. Aucun changement Hermes ni extension de ses droits.

## Références officielles consultées

- [Cycle de vie Node](https://nodejs.org/en/about/previous-releases) : Node 24 LTS, Node 20 EOL.
- [Migration Vite 8](https://vite.dev/guide/migration).
- [TypeScript 7 et coexistence avec TypeScript 6](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/).
- [Migration du plugin de test Cloudflare](https://developers.cloudflare.com/workers/testing/vitest-integration/migration-guides/migrate-to-vitest-plugin/).
- [Migration Cloudflare Vitest 3 vers 4](https://developers.cloudflare.com/workers/testing/vitest-integration/migration-guides/migrate-from-vitest-3-to-vitest-4/).
- [Changements npm 12](https://github.com/npm/cli/releases/tag/v12.0.0).

Les versions stables exactes et les contraintes de compatibilité ont aussi été
lues avec `npm view` dans le registre npm pendant cette intervention.
