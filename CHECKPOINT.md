# Checkpoint — Auto Pièces, 12 septembre 2026

Objectif : moderniser les dépendances et améliorer la fiabilité du code actif.
Worktree auto-pieces-node24-20260912 ; branche
codex/align-node24-dependencies-20260912 ; base b1f0ede.
Checkout initial préservé. Aucun push ni déploiement.

Socle : Node 24.21.0, npm 12.0.2, Vite 8.3.0, TypeScript 7.0.2.
Worker : Vitest 4.1.11, plugin Cloudflare 1.1.8, Wrangler 4.131.1.
Axios interdit avec contrôle automatique ; fetch natif et timeout 10 s.
Serveur unifié, liste publique restrictive, diagnostic DOM sûr, prototypes archivés.

Nouveau lot : typage strict de neuf fichiers JS actifs et de Vite, via checkJs,
JSDoc et deux configurations DOM/Node distinctes, sans émission ni skipLibCheck.
Types Node 24.13.4, Express 5.0.6, CORS 2.8.19. npm test inclut typecheck.
JSON externes unknown, gardes DOM/événements et erreurs inattendues corrigées.
Anciennes sources non publiées et tests JS hors périmètre de typage.

Vérifié : npm ci, typage strict, 54 tests site, build et audit 0. Contre-preuves :
mauvais arguments et variables globales du mauvais runtime refusés.
Worker : typage et 4 tests réexécutés après ajout des types dans le parent.
HTTP Vite (15 pages), preview (31 fichiers), Express verts.
30 fichiers publics SHA256 inchangés ; assets/site.js seul modifié et conforme
à sa source. Pages HTML et visuels inchangés. Journaux tmp/evidence/checkjs-*.
Build Wrangler et actionlint précédents réutilisables, périmètres inchangés.

Décisions : Vitest 5 incompatible avec le plugin. Site toujours JavaScript,
désormais contrôlé par TS7. Alliance/AutoMecanik lus seulement ; Hermes inchangé.
Bilan : docs/MISE-A-NIVEAU-DEPENDANCES-20260912.md.
Suite : PR puis CI Linux avant fusion (main déclenche Pages).
Aucune preuve navigateur interactive ou de déploiement pour ce candidat.
