# Checkpoint — mise à niveau Auto Pièces, 12 septembre 2026

Objectif : moderniser Node, Vite, TypeScript et les dépendances Auto Pièces,
avec comparaison des autres projets. Demande reprise puis précisée par l'utilisateur.

Worktree : `auto-pieces-node24-20260912`, branche
`codex/align-node24-dependencies-20260912`, base `b1f0ede`.
Le checkout initial et sa note non suivie sont préservés.

Changements : Node 24.21.0 LTS, npm 12.0.2, Vite 8.3.0 ; Worker TS 7.0.2,
Vitest 4.1.11, plugin Cloudflare 1.1.8, Wrangler 4.131.1 ; bibliothèques serveur
à jour, plugin legacy inutilisé retiré. Manifestes/lockfiles cohérents, engines
bornés, `.nvmrc`, `.npmrc`, scripts natifs npm 12 autorisés par version.
Configuration Vite en `.mjs`. Actions GitHub actualisées et job CI Worker ajouté.

Vérifié localement sous Windows avec Node portable 24.21.0 et npm 12.0.2 :
deux installations `npm ci`, 35 tests site, 4 tests Worker, typecheck TS7,
build Wrangler à blanc ; audits npm 0/0 (avant 15/17), `npm ls` valide,
31 fichiers du build identiques par SHA256 à la base reconstruite,
HTTP Vite/Express vert, actionlint 1.7.12 vert. Journaux : `tmp/evidence/`.
La version Node globale du poste n'a pas changé.

Décision : Vitest 5 exclu car le plugin Cloudflare exige `^4.1.0`.
TS7 concerne le Worker ; le site reste JavaScript. Aucun déploiement du Worker
de démonstration ni modification des dates de compatibilité Cloudflare.

Comparaison en lecture seule : 32 fichiers Alliance (`58e9171`), 94 AutoMecanik
(`0c31807`). Écarts documentés : types Node26/Node24 Alliance, ancienne image
24.19.0, versions Vite/TS/npm en retrait, Vitest2 design-tokens AutoMecanik,
bases Node sans borne supérieure. Pas de migration de ces deux dépôts.

Prochaine action : publier le candidat via une PR puis vérifier la CI Linux avant
toute fusion ; celle-ci déclenche Pages sur main. Aucun push ni déploiement réalisé.
Réutiliser les tests locaux seulement si code, lockfiles, configurations et données
pertinents restent inchangés. Bilan détaillé :
`docs/MISE-A-NIVEAU-DEPENDANCES-20260912.md`.
