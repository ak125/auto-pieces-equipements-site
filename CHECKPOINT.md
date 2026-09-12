# Checkpoint — références publiques, 12 septembre 2026

Objectif : empêcher la publication de liens internes, ancres et ressources cassés.
Base : main de5fb2fc524be2b8021e8cb0ba4ba783a0472ffd, PR #18 et #19 publiées.
Branche : codex/validate-public-navigation-20260912.

Lacune constatée : le validateur ignorait les fragments, les URL absolues internes
et certains src locaux. Nouveau check-public-references.mjs typé strictement :
contrôle href/src dans les HTML de dist, chemins relatifs et URL du même domaine,
ancres sur la page cible, identifiants dupliqués, encodage invalide. Commentaires
et contenus textuels des scripts/styles exclus. Pas de requête externe.
Anciennes vérifications partielles remplacées ; pas de dépendance ajoutée.
Aucun fichier public ni horaire ni contenu commercial modifié.

Tests ciblés : 19 réussis, dont mutations du seul dist (contact absent, page
absolue interne absente, script absent, ID dupliqué). Typage strict vert.
La validation combinée complète du candidat en CI reste à obtenir.
Preuve : tmp/evidence/public-references-targeted.log.
README et consignes actualisés ; limites CSS/srcset et liens externes explicites.

Suite : commit et PR brouillon, puis CI exacte site/Worker ; ne pas refaire
les preuves navigateur puisque les fichiers publics sont inchangés.
Résultat final : tmp/evidence/public-references-ci-checkpoint.md.
Checkout initial et note utilisateur préservés ; aucun nouveau déploiement.
