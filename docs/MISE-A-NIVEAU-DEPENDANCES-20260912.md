# Mise à niveau des dépendances — 12 septembre 2026

## Périmètre et résultat

Mise à niveau locale complète des deux manifestes d'Auto Pièces, après comparaison
des configurations déclarées d'Alliance Delivery et d'AutoMecanik. La demande
reprend le chantier précédemment différé et précise la montée de Vite, TypeScript
et de l'outillage aux versions stables compatibles.

Base Auto Pièces : `b1f0ede0d32b2d34b4b96a2e5e246370b6cc8ace`.
Branche : `codex/align-node24-dependencies-20260912`.
Les dépôts Alliance et AutoMecanik ont été lus, pas modifiés. Aucun push,
déploiement ou changement de processus de production n'a été effectué.

## Versions retenues dans Auto Pièces

Les anciennes versions de paquets sont celles des lockfiles de la base, pas
seulement les plages déclarées dans les manifestes.

| Composant | Avant | Après |
|---|---|---|
| Node CI / build Pages | 20 | 24.21.0 LTS |
| npm | Non déclaré | 12.0.2 |
| Vite | 7.1.8 | 8.3.0 |
| Axios | 1.8.4 | 1.20.0 |
| CORS | 2.8.5 | 2.8.6 |
| dotenv | 17.2.3 | 17.4.2 |
| Express | 5.1.0 | 5.2.1 |
| Plugin Vite legacy | 7.2.1, non utilisé | Retiré |
| TypeScript du Worker | 5.8.2 | 7.0.2 |
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
des dépendances part d'`index.html` pour éviter les anciens dashboards et les
copies temporaires. Le build public demeure le générateur/copieur statique.
Le site JavaScript n'a pas été converti en TypeScript. Le contrôle TypeScript
couvre les sources et les tests du Worker, en mode strict préexistant.

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
| `npm test`, racine | 35 tests, 0 échec ; génération de 11 pages ; validation de 12 pages SEO et 31 fichiers publics |
| `npm --prefix google-places-proxy ci` | Réussite, scripts natifs autorisés explicitement |
| `npm --prefix google-places-proxy run typecheck` | TypeScript 7.0.2, sources et tests sans erreur |
| `npm --prefix google-places-proxy test` | 4 tests, 0 échec, runtime local Cloudflare |
| `npm --prefix google-places-proxy run build` | Wrangler 4.131.1, build `--dry-run` réussi |
| `npm ls --depth=0`, deux projets | Arbres valides, versions conformes |
| `actionlint 1.7.12`, deux workflows | Réussite, aucune erreur |
| `npm audit`, racine | 15 alertes initiales, dont 1 critique → 0 |
| `npm audit`, Worker | 17 alertes initiales, dont 2 critiques → 0 |
| Parité du build | SHA256 identiques sur les 31 fichiers, comparaison avec le build des sources de la base |
| Vite 8.3.0, HTTP local | Accueil, module navigateur et client HMR : HTTP 200 |
| Express 5.2.1, HTTP local | Accueil : HTTP 200 ; configuration Google absente : erreur attendue, sans appel Google |

La comparaison du build utilise la même convention de fins de ligne Windows
pour les deux checkouts et exécute la génération du catalogue dans les deux cas.
Les fichiers de contenu du dépôt ne changent pas. Les journaux et inventaires
bruts sont conservés localement dans `tmp/evidence/` (ignoré par Git).

Ce sont des preuves locales Windows : aucune exécution CI Linux de ce candidat,
aucune preuve navigateur interactive, aucune vérification d'un Worker ou d'un
site effectivement déployé. Les audits npm portent sur les deux lockfiles
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
