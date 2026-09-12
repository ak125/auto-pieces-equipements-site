# Checkpoint — Scripts de publication, 12 septembre 2026

Objectif : fiabiliser la génération, le build et la validation, puis étendre leur typage strict.
Base : main f09badd55a82593b49774d7810716006893faf6c, issu de la PR #16 fusionnée.
La publication de cette base avait été vérifiée : Pages et qualité verts,
31 fichiers publics conformes à l'artefact, menu mobile et clavier fonctionnels.

Lot actuel : codex/harden-publication-scripts-20260912, worktree auto-pieces-node24-20260912.
Les trois scripts résolvent la racine depuis import.meta.url. Ils ne choisissent
plus le dossier de génération ni le dist à effacer à partir du dossier de lancement.
Typage strict étendu aux données du catalogue, au générateur, au build et au validateur.
Catalogue documenté en JSDoc ; accès optionnels et erreurs inconnues traités explicitement.
README et AGENTS mis à jour. Aucune dépendance ni aucun workflow modifié.

Vérifié localement : npm test (politique HTTP, typage, 55 tests, build, validation).
Un test isolé exécute les trois scripts depuis un autre dossier : il vérifie la
régénération des pages, les 31 fichiers de sortie et la préservation d'un autre dist.
Contre-preuves : ce test échoue avec l'ancien process.cwd() ; un slug numérique
est refusé par TypeScript (TS2322). Les 31 fichiers publics restent identiques
à l'artefact de f09badd après normalisation des fins de ligne des fichiers texte.
Preuves : tmp/evidence/publication-site-test.log, publication-directory-counterproof.log,
publication-types-counterproof.log et publication-parity.json.

Les validations précédentes du Worker restent réutilisables : sources, dépendances
et configuration inchangées. Aucun besoin de rejouer une preuve navigateur pour
ce lot de scripts sans changement du contenu publié.

Prochaine action : publier une PR brouillon et vérifier sa CI Linux.
Résultat distant à consigner dans tmp/evidence/publication-ci-checkpoint.md.
La fusion et la publication de ce nouveau lot ne sont pas effectuées.
Checkout initial et note utilisateur préservés ; autres projets inchangés.
