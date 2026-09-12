# Checkpoint — Horaires et publication, 12 septembre 2026

Objectif : centraliser les horaires avec exceptions datées et contrôler le contenu après Pages.
Base : main 24bba07 (PR #17 publiée). Branche codex/store-hours-publication-checks-20260912.
La PR #18, alignement du socle, reste indépendante et n'est pas intégrée à ce lot.

Horaires : data/store-hours.json, mêmes créneaux habituels, exceptions vides.
Le générateur actualise accueil, 11 pages catalogue, tables visibles, JSON embarqué
pour le bandeau et données structurées. Exceptions par date Paris : fermeture ou
créneaux de remplacement. Validation des dates/jours/créneaux avant écriture.
Le bandeau utilise le calendrier Paris, avec repli neutre si configuration invalide.
Validation du build : affichage, bandeau et JSON-LD doivent correspondre à la source.

Publication : nouveau job verify après deploy, archive github-pages du même run,
download-artifact 8.0.1 (action.yml officiel vérifié). SHA256 des 31 fichiers publics
et quatre chemins privés HTTP 404. fetch natif, concurrence 5, timeout 8 s sur corps
inclus, 6 tentatives espacées de 15 s, job limité à 10 min. JSON dans les journaux,
échec final rend le workflow rouge ; pas de retour arrière automatique.

Vérifié local : npm test, typage strict et 78 tests verts, build/validation verts.
Test d'intégration actualisé réexécuté : changement de la source seule propagé
sur toutes les pages ; dossier de lancement préservé. Scénarios cache ancien,
contenu incorrect, 404 public, exposition privée et corps bloqué couverts.
Actionlint vert. Navigateur local : horaires bureau/mobile corrects, console vide.
Vérificateur HTTP : 35/35 contre le candidat local et 35/35 contre l'artefact de
la production existante 24bba07. Aucun nouveau déploiement effectué.
Preuves : tmp/evidence/hours-publication-*, hours-source-integration-test.log.
Dépendances et lockfiles inchangés ; validations Worker précédentes réutilisables.

Documentation : README et AGENTS. Références : Schema.org horaires exceptionnels,
Google LocalBusiness et action download-artifact. Aucune fermeture inventée.
Suite : publier PR brouillon et vérifier CI Linux exacte ; résultat dans
 tmp/evidence/hours-publication-ci-checkpoint.md. Le nouveau job Pages sera validé
lors d'une publication ultérieure. Checkout initial et note utilisateur préservés.
