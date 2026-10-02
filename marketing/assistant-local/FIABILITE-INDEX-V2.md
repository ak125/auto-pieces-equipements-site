# Index des skills — 2 octobre 2026

Lot local sur codex/ape-marketing-skills-20261002, base
3756cba51edff2f280555bab13872edc72efde52. Correction de inspectSkillIndex dans
scripts/marketing/operations.mjs, six nouveaux tests et une recette CLI fictive.

## Défauts et décisions

Le contrôle comparait les noms bruts pour détecter les doublons, mais normalisait
ces noms pour valider les chemins : un doublon avec espaces échappait au contrôle.
La même normalisation s'applique maintenant aux deux comparaisons.
Un tableau creux provoquait une exception en lisant name ; ses cases sont désormais
traitées comme des entrées invalides avec erreurs structurées. L'index doit être un
tableau explicite de 0 à 1000 éléments ; une liste vide reste invalide (EMPTY).
Une racine relative concordante avec les chemins était acceptée ; elle doit être
absolue, explicite et sans NUL, contrôlée avec node:path (POSIX, lecteur Windows, UNC).

Le test historique accepte volontairement l'inspection d'une seule skill. Cette
compatibilité est conservée : valid décrit les entrées déclarées, complete exige
en plus les quatre noms attendus. expectedCount et missingSkills rendent la portée
visible. Les noms manquants sont ceux absents de la liste, pas les versions invalides
de noms présents. Une erreur rend complete=false, même si aucun nom ne manque.
Erreurs et noms manquants sont dédupliqués/triés pour une sortie stable.

referencesValid reste une déclaration d'entrée. referencesVerified=false et
implicitRoutingVerified=false sont systématiques : aucun fichier, lien ou runtime
n'est interrogé par la fonction. Un chemin syntaxiquement concordant ne prouve ni
existence, ni résolution de symlink, ni chargement. La recette utilise /fixtures/ape.
CLI : code 0 pour une inspection valide, même partielle ; code 1 en erreur. Le champ
complete doit être lu pour vérifier la complétude de l'observation.

## Vérification

Six tests rouges avant correction, puis verts ; reproduction de l'exception sur
case absente conservée dans le journal. Suite index/contrats : 14/14. Typage marketing
strict vert. npm test standard : **308/308**, dont **161 marketing**, au premier
passage de ce lot ; dépendances, typages site, build et validation réussis.
31 fichiers publics identiques en contenu à la base, source/dist exacts avant
restauration des seules fins de ligne générées. Liste publique inchangée.
Recette CLI exécutée : valid=true, complete=true, références/routage non vérifiés.
72 lignes de matrice, liens locaux et couverture contrôlés après documentation.

Node 24.21.0/npm 12.0.2. Journaux ignorés dans tmp/marketing-evidence :
skill-index-red.log, skill-index-green.log, skill-index-typecheck.log,
skill-index-full.log, skill-index-example.log et public-parity.json.
Sauvegarde : skill-index-before/operations.mjs ; retour arrière ciblé après contrôle
des éventuels changements ultérieurs, sans restaurer tout le worktree.

Candidat local non commité ; aucune activation, permission modifiée, publication,
envoi, tâche, dépense, connexion, push ou PR. Checkout initial préservé.
Hermes non testé ; fonctions corrigées non évaluées par agent, aucune CI distante.
Skills et renderer inchangés, preuves antérieures réutilisables dans leur périmètre.
Le retard de démarrage serveur du lot événements reste inexpliqué et non résolu.

Voir [contrat](CONTRAT-V2.md), [recette](recette-v2/README.md),
[matrice](MATRICE-V2.md) et [checkpoint](CHECKPOINT.md).
