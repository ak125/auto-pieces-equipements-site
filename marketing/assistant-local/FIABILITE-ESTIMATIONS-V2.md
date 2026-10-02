# Fidélité et estimations — 2 octobre 2026

Correction locale du candidat `codex/ape-marketing-skills-20261002`, autorisée par
la suite « continue corrections et améliorations ». Source modifiée :
`scripts/marketing/insights.mjs`, fonctions loyaltyProposal et forecast.

## Résultats

| Défaut reproduit | Correction |
|---|---|
| Récompense proposée avec parrain absent | Identités et politique contrôlées ; blocage explicite |
| 0,30 − 0,10 inférieur au seuil 0,20 à cause des flottants | Calcul des ventes, remboursements et seuils en centimes entiers |
| Doublon identique considéré contradictoire selon l'ordre JSON | Comparaison de l'identité normalisée et des montants économiques |
| Registre absent ou vente invalide donnant un total nul/partiel | Distinction historique inconnu / explicitement vide ; aucune proposition sur données invalides |
| Devises mélangées, fractions de centime ou total hors plage | Blocage avant proposition |
| Estimation calculée après suppression silencieuse de valeurs invalides | Série entière contrôlée ; statut blocked et mesures null |
| Somme de valeurs finies débordant avant calcul de moyenne | Moyenne incrémentale, résultat fini vérifié |
| Capacité négative ou mal typée utilisée ou ignorée | Erreur explicite ; capacité absente/null conservée comme inconnue |

La fidélité valide retourne proposal ; un historique vide ou un autoparrainage
identifié produit zéro récompense. Les montants invalides restent null, distincts
de zéro. EUR est la devise du contrat ; l'omission dans les anciennes fixtures
signifie EUR. Aucune conversion ni politique commerciale réelle ajoutée.

L'estimation distingue blocked, insufficient-data pour un tableau vide explicite,
et estimated pour des observations valides. Elle reste une moyenne et une plage
observées ; capacityRisk compare le maximum observé à une capacité déclarée.
Aucune probabilité, confiance statistique ou prévision entraînée n'est calculée.

## Validation et exemples

Neuf nouveaux tests ont d'abord échoué, puis réussi après correction. Ils couvrent
les calculs, les cas invalides, les doublons, l'autoparrainage et les sorties de
processus CLI. Les exemples [loyalty.json](recette-v2/loyalty.json) et
[forecast.json](recette-v2/forecast.json) sont exécutés par ces tests :

- Fidélité : 80 € nets fictifs, proposition de 5 €, issued=false.
- Estimation : moyenne 10, plage 8–12, maximum supérieur à la capacité fictive 11,
  scheduling=false.

Validation ciblée finale : **108 tests marketing verts**, typage marketing strict
vert avec Node 24.21.0. Commandes et format dans le [contrat](CONTRAT-V2.md) et
la [recette](recette-v2/README.md).

La suite globale 239/239, le build et la preuve HTTP du lot antérieur restent
historiques et réutilisables hors du périmètre marketing modifié. Aucun nouveau
résultat global ou CI n'est revendiqué. Le renderer, les compétences, le site et
les dépendances restent inchangés. Hermes non testé ; invocation agent des deux
fonctions corrigées non évaluée. Les preuves CLI déterministes restent distinctes.

Tests : [marketing-estimates.test.mjs](../../tests/marketing-estimates.test.mjs).
Journaux locaux ignorés sous tmp/marketing-evidence : estimates-red.log,
estimates-green.log, estimates-marketing.log, estimates-typecheck.log.
Sauvegarde avant ce lot : estimates-before/insights.mjs ; comparer et préserver
les changements ultérieurs avant tout retour arrière. Le rapport et les tests
sont les preuves conservables avec le candidat, toujours non commité.

Schéma 2.0.0 maintenu dans ce candidat non publié, résultats enrichis de statuts
et erreurs. Aucun transport, persistance, activation, push, PR, envoi ou dépense.
