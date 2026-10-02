# Plan V2 — extension locale du candidat APE

Mandat : cahier V2 du 2026-10-02 fourni dans cette conversation. Il remplace V1.
Exécution directe avec executing-plans et test-driven-development, un seul écrivain.
Le mandat autorise les lots locaux : pas de nouvelle demande d'accord pour les étapes
réversibles, pas de commit/push ou activation. Les revues systématiques et les registres
additionnels des skills génériques ne sont pas appliqués (préférences utilisateur).
Ce document et MATRICE-V2.json prolongent le dossier existant, sans suivi de clients.

## Décision de conception

Réutiliser les quatre skills, le rendu marketing-local, les horaires, la liste publique
et les tests Node. Ajouter des modules purs sous scripts/marketing/ et une CLI ponctuelle.
Pas de boucle d'exécution, ordonnanceur, persistance de destinataires ou frontend.
Les calculs acceptent uniquement des corpus synthétiques dans cette livraison. Un futur
adaptateur réel devra obtenir les données et permissions depuis les systèmes de confiance ;
aucun booléen, fichier ou hash fourni au CLI ne peut activer un transport.
La simulation démontre des décisions reproductibles, pas une infrastructure disponible.

Alternatives écartées : documentation seule (ne couvre pas V2) ; moteur persistant local
(interdit et duplique les futurs services). Aucun Command Center, CRM, moteur durable,
connecteur de messagerie ou service de mandat trouvé dans le périmètre inspecté.
Ne pas créer leur équivalent ni inspecter des configurations globales pour les remplacer.
Le mandat V2 autorise Hermes à faire directement le travail local ; l'ancienne mémoire
de socle ne restreint pas ce nouveau mandat, ni n'accorde des droits externes.

## Lots et interfaces

- [x] 0. Matrice exhaustive C01–C30, P01–P24, J01–J18 : chaque ligne contient besoin,
  valeur, source, propriétaire, réemploi, ajout, préconditions, skill, outil, preuve,
  priorité, dépendance, blocage et huit dimensions de maturité.
- [x] 1. scripts/marketing/data.mjs : importSimulation, eligibility, evaluateSegment,
  scoreProfile, privacyPlan. Entrées JSON contrôlées, sorties en mémoire et explications.
  Tests T01/T03/T04/T05/T18, puis typage strict.
- [x] 2. scripts/marketing/studio.mjs et insights.mjs : briefs sourcés, variantes,
  demandes/devis, avis, supports QR sous forme de brief exact, veille, offres, économie,
  expériences, prévisions et alertes. Réutiliser renderNewsletter, jamais inventer prix.
  Tests positifs C01–C30 pertinents et T06/T14/T15/T16.
- [x] 3. scripts/marketing/operations.mjs et journeys.mjs : contrats de mandat,
  arbitrage global du batch, chronologie, réconciliation, suspension, scénarios J01–J18.
  Pas de moteur durable. Tests T07–T13/T17/T19/T20 et variantes métier.
- [x] 4. scripts/marketing-workbench.mjs : aide, capabilities, import, segment, score,
  prepare, journey, preflight, reconcile, suspend, report, privacy, demo.
  Lecture bornée, sorties JSON minimisées, zéro réseau, erreurs sans entrée privée.
  Corpus fictif versionné sous marketing/assistant-local/recette-v2/.
- [x] 5. Actualiser skills, contrats, activation/suspension, demandes Hermes, sources,
  preuves, matrice et checkpoint. Réessayer découverte et invocation locale quand accessible.
  Rejouer npm test, typage marketing, build, parité publique et rendu si changé.

## Risques ciblés et preuves

Identité homonyme entre projets ; opposition plus récente qu'un import ; historique
incomplet interprété comme absence ; mandat apparent fourni par l'agent ; fournisseur
incertain rejoué. Chacun doit avoir une assertion dédiée. Les seuils du corpus sont des
hypothèses de recette et non des règles commerciales. Chronologie en UTC, calendrier Paris.
Les cas de corps malformé, conflit de doublon, dépassement de bornes et coûts manquants
doivent échouer sans exception contenant les données.

## Journal des décisions et état

2026-10-02 : base et branche V1 revalidées, modifications V1 présentes et préservées.
Manifestes et gouvernance inchangés ; core.hooksPath absent. Aucun script de publication
appelé. Sources publiques, placeholders et APIs de diagnostic restent distincts.


2026-10-02 : lots locaux terminés dans leur périmètre candidat/simulation ;
les fonctions avancées et dépendances réelles restent dans MATRICE-V2.json.
81 tests marketing verts, typage strict vert. Chaîne npm initiale avec délais dépassés ;
reprise ciblée 49/49 sans code changé, build/validation et parité 31/31 réussis.
Découverte Codex et invocation bornée documentées ; Hermes non testé.

2026-10-02 — suite autorisée « corrections et améliorations » : lot de fiabilité borné,
sans changement d'architecture. Reproduction de dix défauts dans onze cas ciblés ;
corrections des données inconnues, événements contradictoires, préférences mal datées,
quotas en attente, clés de credentials JSON, horodatages et statuts de sortie CLI.
Les instantanés de veille sont triés avant comparaison, indépendamment de l'export.
92 tests marketing et typage strict verts ; suite séquentielle 235/237 (deux ECONNRESET),
reprise isolée du serveur 4/4, build/validation et parité 31/31 réussis.
Les cinq sources avant correction sont conservées sous tmp/marketing-evidence/corrections-before/.
