# Fiabilité des rapports et codes de sortie — 2 octobre 2026

Lot local autorisé par « continue corrections et améliorations », sur le candidat
`codex/ape-marketing-skills-20261002`. Aucun raccordement externe.

## Problème et correction

Le calcul commercial convertissait une collection absente en tableau vide. Avec
`salesCoverage=true`, cela pouvait afficher zéro vente et zéro revenu sans
historique. Il conservait aussi certains totaux malgré une source ou une cohorte
manquante. Une contradiction rendait les ventes inconnues, mais n'empêchait pas
le parcours J18 et la CLI d'annoncer une simulation terminée sans blocage.

La correction porte sur la source du résultat, `commercialReport`, puis sa
propagation dans J18. La CLI utilise le statut et les erreurs ainsi établis.

| Entrée | Résultat désormais attendu |
|---|---|
| Historique absent, non-tableau, mal formé ou supérieur à 1000 lignes | Rapport bloqué, indicateurs `null` |
| Tableau explicitement vide, périmètre valide et couverture des ventes déclarée | Zéro vente, zéro revenu ; taux de conversion inconnu sans devis |
| Source, cohorte ou période invalide | `REPORT_SCOPE`, aucun agrégat présenté comme fiable |
| Vente contradictoire ou remboursement incohérent | `REPORT_CONFLICT`, blocage transmis par J18 |
| Couverture mal typée ou coûts complets invalides | Erreur explicite |
| Agrégat dépassant la représentation sûre en centimes | `AMOUNT_RANGE`, aucun `Infinity` silencieusement sérialisé en `null` |
| Couverture des ventes explicitement partielle | Ventes/revenu inconnus, autres observations valides conservées |
| Doublon métier identique | Une seule vente comptée |

Les types d'événements sont validés dans leur forme exacte. Un type avec des
espaces périphériques ne peut plus être accepté puis ignoré par le calcul.
La période et la couverture sont des déclarations de fixtures ; ce contrôle
n'établit pas la complétude ou la vérité d'un système réel.

La commande `execute`, toujours indisponible, renvoyait le code processus 0.
Elle renvoie désormais **2**, avec `status=unavailable`, `canExecute=false` et
`externalCalls=0`. Le code **1** reste celui des requêtes invalides ou bloquées,
et **0** celui des simulations terminées. Les décisions métier stop/defer/human
et les états de fournisseurs simulés restent distincts d'une erreur technique.

## Preuves

- Sept nouveaux tests dans [marketing-reporting.test.mjs](../../tests/marketing-reporting.test.mjs),
  écrits avant correction ; contrôle rouge puis vert.
- Cas supplémentaire de type `" quote "` reproduit avant sa correction.
- **99 tests marketing réussis** sur l'état final, y compris les contrôles CLI
  réels pour report, journey/J18 et execute, et les 18 scénarios du demo.
- **Typage marketing strict réussi**, Node 24.21.0.
- La suite globale **239/239**, le build, la validation publique et la preuve HTTP
  du [lot précédent](FIABILITE-HTTP-V2.md) restent historiques. Leurs périmètres
  extérieurs aux trois sources marketing modifiées sont inchangés et réutilisables.
  Aucune nouvelle invocation globale n'est revendiquée pour ce lot.
- Renderer, compétences et dépendances inchangés. Découverte Codex et preuve
  mobile précédentes réutilisables ; invocation agent de J18 corrigé et runtime
  Hermes non vérifiés. Aucune CI ni activation réelle déduite des tests locaux.

Reproduire depuis le worktree :

```sh
node --test tests/marketing-reporting.test.mjs
node --test tests/marketing-*.test.mjs
node node_modules/typescript/bin/tsc -p tsconfig.marketing.json
```

Sources modifiées : `scripts/marketing/insights.mjs`, `journeys.mjs` et
`scripts/marketing-workbench.mjs`. Sauvegardes antérieures à ce lot dans
`tmp/marketing-evidence/reporting-before/`. Comparer et préserver tout changement
ultérieur avant un éventuel retour arrière ; les copies ignorées ne constituent
pas un commit de sauvegarde.

Journaux ignorés locaux : `reporting-red.log`, `reporting-kind-red.log`,
`reporting-green.log`, `reporting-marketing.log`, `reporting-typecheck.log`, sous
`tmp/marketing-evidence/`. Les tests et ce rapport portent les preuves conservables.

Schéma et skills restent 2.0.0 dans ce candidat non publié ; sorties enrichies de
`status`/`errors` et validation des entrées renforcée. Les codes de sortie sont
documentés dans le [contrat](CONTRAT-V2.md). Aucun commit, push, publication,
envoi, dépense, cron, compte ni permission externe modifié.
