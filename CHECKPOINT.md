# Checkpoint — Contrôle du socle, 12 septembre 2026

Objectif : empêcher la divergence des versions entre site, Worker et CI, et
appliquer l'interdiction HTTP aux commandes isolées du Worker.
Base : main 24bba07cbe1778529964d7b6baf0d7c09603420f, PR #17 fusionnée et publiée.
Lot : codex/enforce-toolchain-alignment-20260912, worktree auto-pieces-node24-20260912.

Changements : contrôle partagé de .nvmrc, packageManager, bornes Node/npm,
TypeScript commun, majeure des types Node et options npm engine-strict/save-exact.
Nouveau script couvert par le typage strict. Installation et tests Worker appellent
le contrôle commun (alignement et interdiction HTTP). Les workflows lisent npm
à partir du manifeste au lieu de recopier la version.
Aucune version de paquet modifiée. Le lockfile Worker ajoute seulement hasInstallScript.

Preuves locales : installations propres site et Worker réussies, 0 vulnérabilité
signalée ; npm test site, typage et 67 tests verts, build statique validé ;
typage Worker et 4 tests verts. Actionlint 1.7.12 valide les deux workflows.
Contre-preuves isolées : preinstall/pretest Worker refusent une dépendance interdite ;
pretest refuse un TypeScript divergent. Aucun paquet interdit installé.
Journaux : tmp/evidence/alignment-site-*, alignment-worker-* et alignment-hooks-counterproof.log.
Les 31 fichiers publics sont inchangés dans Git ; aucun nouveau contrôle navigateur requis.

Prochaine action : publier la PR brouillon et vérifier le candidat exact en CI Linux.
Résultat final, incluant le build Worker à blanc, dans tmp/evidence/alignment-ci-checkpoint.md.
Aucune fusion ni publication de ce nouveau lot. Les autres projets sont inchangés.
Checkout initial et note utilisateur préservés.
