# Checkpoint — stabilisation et préparation d’intégration, 2 octobre 2026

**Objectif.** Stabiliser puis préparer l'intégration du candidat APE. Aucune fusion,
publication ou activation autorisée par cette étape.

**État vérifié.** Branche codex/ape-marketing-skills-20261002, base
3756cba51edff2f280555bab13872edc72efde52, identique à main distant lu ce jour.
Worktree C:\Users\Marwane\.codex\worktrees\ape-marketing-skills\auto  pieces  equipement codex.
Non commité. Checkout initial a3c8c0f et ses documents conservés ; main local ancien.

**Changements.** package.json : concurrence native des tests bornée à 2 ; typage
marketing intégré à npm test/CI existante. Aucun nouveau lot métier. Correction
HTTP précédente conservée ; délai serveur 10 s inchangé, aucun retry automatique.
Diagnostic : premier stdout 6,75 s par défaut contre 3,30 s à concurrence 2 ; pic
observé de processus 14 contre 5, RSS cumulée 713 contre 256 Mo. Pression système
variable ; cause OS exacte des timeouts historiques non démontrée. Voir INTEGRATION-V2.

**Tests réutilisables.** Diagnostics 314/314 chacun ; npm test final sans instrument
314/314, dont 167 marketing, premier passage ; typages complets, build, validation
verts. Node 24.21.0/npm 12.0.2. 31 fichiers publics identiques en contenu à la base ;
parité source/dist avant restauration EOL. Couverture/liens recontrôlés après docs.
Logs startup-*, integration-full.log et public-parity.json sous tmp/marketing-evidence.
Nettoyage de lignes vides finales uniquement sur 19 fichiers, contenu utile identique ;
74 tests concernés rejoués verts, preuve integration-eof.json/format-recheck.log.
Paquet integration-candidate : patch, manifeste/empreintes, arbre candidat, statistiques
et preuves sélectionnées ; application vérifiée dans un index temporaire.

**Décisions.** Aucun commit, push, PR, merge, permission, dépendance ou workflow modifié.
Une future fusion vers main déclencherait GitHub Pages : décision distincte nécessaire.
Hermes non testé ; invocation des fonctions corrigées et CI distante non vérifiées.
Worker inchangé, à contrôler en CI. Activation marketing D1–D7 toujours absente.

**Prochaine action.** Relire INTEGRATION-V2 et le manifeste du paquet, revalider main
et l'absence de dérive du candidat, puis décider commit/push/PR sur ce périmètre.
Ne pas ajouter de nouvelles améliorations avant cette revue. Aucune tâche créée.
