# Checkpoint — Auto Pièces, 12 septembre 2026

Objectif : moderniser les dépendances, interdire Axios et corriger le serveur local.
Worktree auto-pieces-node24-20260912 ; branche
codex/align-node24-dependencies-20260912 ; base b1f0ede.
Checkout initial préservé. Aucun push ni déploiement.

Socle : Node 24.21.0, npm 12.0.2, Vite 8.3.0 ; Worker TS 7.0.2,
Vitest 4.1.11, plugin Cloudflare 1.1.8, Wrangler 4.131.1. Versions épinglées,
CI modernisée, Axios retiré ; contrôle sources/manifestes/lockfiles en preinstall
et npm test. Fetch natif, contrôle HTTP/JSON, timeout serveur 10 s.

Nouveau lot : les trois commandes serveur utilisent server-simple.js. PublicFiles
limite les fichiers accessibles ; chemins indépendants du dossier de lancement,
écoute 127.0.0.1 par défaut. Page /test séparée, rendu DOM sans injection HTML,
photos HTTPS, états vide/erreur/timeout. API : erreurs amont 502, timeout 504,
détails techniques masqués. Prototypes MCP/OBD archivés intégralement dans docs/archives.

Vérifié : 51 tests site, build et validation publics verts ; Vite (15 pages),
preview (31 fichiers), trois commandes Express depuis un autre dossier testées.
Contenu public SHA256 inchangé. Archives comparées à la révision précédente,
ports invalides refusés. Journaux tmp/evidence/server-*.
Preuves réutilisées car périmètres inchangés : npm ci/audits 0, Worker 4 tests,
typage TS7, build Wrangler à blanc, actionlint. Aucune preuve navigateur interactive.

Décisions : Vitest 5 incompatible avec le plugin ; TS7 limité au Worker.
Alliance/AutoMecanik comparés précédemment en lecture seule ; Hermes inchangé.
Bilan : docs/MISE-A-NIVEAU-DEPENDANCES-20260912.md.
Suite : PR et CI Linux avant fusion (main déclenche Pages).
