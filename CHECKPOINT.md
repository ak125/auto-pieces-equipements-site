# Checkpoint — Auto Pièces, 12 septembre 2026

Objectif : moderniser Node/Vite/TypeScript ; interdire Axios et utiliser fetch.
Worktree `auto-pieces-node24-20260912`, branche
`codex/align-node24-dependencies-20260912`, base `b1f0ede`.
Checkout initial et note utilisateur préservés. Aucun push ni déploiement.

Changements : Node 24.21.0, npm 12.0.2, Vite 8.3.0 ; Worker TS 7.0.2,
Vitest 4.1.11, plugin Cloudflare 1.1.8, Wrangler 4.131.1. Versions épinglées,
engines bornés, actions GitHub actualisées, CI Worker ajoutée.
Vite ESM scanne les 15 pages publiques. Axios retiré (13 paquets) ; helper
fetch avec contrôle HTTP/JSON et timeout 10 s. Règle AGENTS/README et contrôle
sources/manifestes/lockfiles dans preinstall et npm test, avec contre-tests.

Vérifié sous Windows : npm ci racine, 45 tests verts, build statique validé,
audit 0, HTTP Vite/Express et preview verts, 31 fichiers SHA256 identiques.
Preuves Worker réutilisées car périmètre inchangé : ci, 4 tests, typage TS7,
build Wrangler à blanc, audit 0. Workflows inchangés depuis actionlint vert.
Journaux locaux : tmp/evidence/fetch-* et précédents. Node global inchangé.

Décisions : Vitest 5 incompatible avec le plugin Cloudflare. TS7 concerne
le Worker. Serveur actif validé : server-simple.js ; anciens prototypes
non exécutables en l'état (modules absents/Java imbriqué), hors remise en état.
Alliance (58e9171) et AutoMecanik (0c31807) comparés en lecture seule.
Hermes inchangé. Bilan : docs/MISE-A-NIVEAU-DEPENDANCES-20260912.md.

Suite : publication par PR puis CI Linux avant fusion (main déclenche Pages).
Aucune preuve CI distante ni de déploiement pour ce candidat.
