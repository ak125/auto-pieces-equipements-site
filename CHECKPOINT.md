# Checkpoint — intégration du socle et des horaires, 12 septembre 2026

Objectif : livrer le contrôle du socle, les horaires centralisés et la vérification Pages.
PR #18 fusionnée : main 4d22946fd72bc149df6c185f9004f0f193947cf0.
PR #19 : codex/store-hours-publication-checks-20260912, actualisée sur cette base.
Conflits de documentation résolus en conservant les deux ensembles de consignes.

Socle : contrôle partagé de Node/npm/TypeScript/types Node et options npm.
Installation et tests du Worker exécutent aussi les contrôles HTTP et du socle.
Les workflows lisent npm depuis packageManager. Versions des paquets inchangées.

Horaires : data/store-hours.json alimente 12 pages, bandeau et JSON-LD.
Horaires habituels conservés ; exceptions vides, dates et créneaux validés.
Les exceptions remplacent les créneaux du jour dans le fuseau Europe/Paris.
Le bandeau reste neutre si la configuration est invalide.

Publication : nouveau job verify après deploy, artefact github-pages du même run.
Comparaison SHA256 des 31 fichiers publics et quatre chemins privés HTTP 404.
fetch natif, concurrence 5, délai HTTP 8 s, six tentatives espacées de 15 s,
job limité à 10 min. Rapport JSON dans les journaux ; aucun rollback automatique.

Preuves antérieures : PR #18 CI verte (67 tests site et 4 Worker), PR #19 avant
intégration CI verte (78 tests site et 4 Worker), typages et builds réussis.
Horaires bureau/mobile vérifiés localement, console sans erreur. Contrôle HTTP
35/35 sur candidat local et production 24bba07 avec son artefact exact.
Preuves : tmp/evidence/alignment-* et hours-publication-*.

Suite : valider le candidat combiné en CI, confirmer le déploiement de #18, puis
fusionner #19 et vérifier le déploiement et le nouveau job sur le même commit.
Résultat final dans tmp/evidence/integration-publication-checkpoint.md.
Les preuves antérieures ne remplacent pas la CI du candidat combiné.
Checkout initial et note utilisateur préservés ; autres projets inchangés.
