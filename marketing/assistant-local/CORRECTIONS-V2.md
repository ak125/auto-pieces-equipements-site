# Corrections V2 — lot de fiabilité du 2 octobre 2026

Résultats historiques de ce lot. La correction du cycle de vie HTTP et la nouvelle
validation globale réussie sont dans [FIABILITE-HTTP-V2](FIABILITE-HTTP-V2.md).

Suite autorisée : « continue corrections et améliorations ». Même worktree et branche
codex/ape-marketing-skills-20261002, base 3756cba51edff2f280555bab13872edc72efde52.
Aucune extension des droits, connexion externe ou modification du site public.

## Défauts reproduits et corrections

Onze cas de régression ont été écrits avant modification : dix échouaient, un cas
positif de contrôle passait. Les onze passent après correction.

| Défaut observable | Comportement corrigé |
|---|---|
| Historique absent ou événement mal formé interprété comme zéro vente | Segment inconnu ; pas de réactivation sur une absence non prouvée |
| Relations absentes devenant un segment positif via NOT | Relation inconnue distincte du tableau explicitement vide |
| Vente invalide filtrée ou doublon contradictoire remplacé silencieusement | Mesures RFM inconnues ; les doublons identiques restent dédupliqués |
| Opposition mal datée ignorée au profit d'un accord antérieur | Éligibilité refusée avec PREFERENCE_UNKNOWN |
| Historique de quota non fourni considéré vide ; pending ignoré | HISTORY_UNKNOWN pour historique invalide ; pending/proposed/scheduled comptent dans les plafonds |
| Événements de parcours sans tableau ou identité ignorés | Blocage explicite avant proposition d'action |
| Clés JSON de credentials non reconnues par le filtre textuel | Contrôle structurel récursif des clés, sans exposer leurs valeurs |
| 24:00 normalisé au lendemain | Horodatage refusé ; les deux offsets du changement d'heure restent valides |
| Comparaison de veille dépendant de l'ordre d'export | Tri par sujet et date avant comparaison |
| Contrôle CLI négatif affiché comme succès global | status=blocked et code processus 1 ; état métier stop/defer/human distinct |

Les schémas métier restent 2.0.0 ; le contrôle est plus strict sur des entrées auparavant
acceptées à tort. Un tableau explicitement vide est accepté lorsque la couverture a été
déclarée. Aucune donnée client réelle n'a servi à cette recette.

## Résultats et limites

- **92 tests marketing réussis**, dont les onze nouvelles régressions.
- Typage marketing strict réussi ; politique HTTP/socle et typages du site réussis.
- Suite globale exécutée avec `--test-concurrency=1` : **235/237**, deux échecs
  ECONNRESET dans local-server. Reprise ciblée du fichier inchangé : **4/4**.
  Ce n'est pas une suite globale intégralement verte en une invocation.
- Aucun relèvement de délai, retry ajouté aux tests ou changement du serveur pour
  masquer ces erreurs. La cause des réinitialisations de connexion locale reste non établie.
- Build et validation réussis : 12 pages SEO, exactement 31 fichiers publics.
  Parité de contenu avec la base ; fins de ligne générées restaurées après comparaison.
- HTML/texte et CSS du renderer inchangés : preuve visuelle mobile V2 réutilisée.
- Skills inchangés : découverte native antérieure réutilisable ; essai agent antérieur
  historique. Aucune nouvelle preuve d'invocation dans Hermes ni comparaison agent avant/après.

## Reproduire

Depuis le worktree, avec Node 24.21.0/npm 12.0.2 prescrits :

```sh
node --test tests/marketing-regressions.test.mjs
node --test --test-concurrency=1 tests/marketing-*.test.mjs
node node_modules/typescript/bin/tsc -p tsconfig.marketing.json
npm run check:dependencies
npm run typecheck
node --test --test-concurrency=1 tests/*.test.mjs
npm run build
node scripts/validate-site.mjs
```

La séquentialisation est un argument de cette invocation, pas une configuration du dépôt.
Node n'autorise pas ce drapeau dans NODE_OPTIONS ; aucune configuration globale n'a changé.

Sources corrigées : scripts/marketing/common.mjs, data.mjs, operations.mjs,
insights.mjs et scripts/marketing-workbench.mjs. Les cinq versions avant correction
sont conservées dans tmp/marketing-evidence/corrections-before/ ; ne les restaurer
qu'après comparaison et préservation d'éventuelles modifications ultérieures.
Nouveau test : tests/marketing-regressions.test.mjs.

Journaux locaux : corrections-red.log, corrections-first-green.log,
corrections-marketing.log, corrections-full.log, corrections-server-retry.log,
corrections-build.log et corrections-public-parity.json, sous tmp/marketing-evidence/.
Les journaux n'exposent que les fixtures synthétiques. Les tests et ce rapport sont
les preuves conservables avec le candidat ; tmp reste ignoré par Git.

Les dépendances réelles D1–D7 et les fonctions avancées non réalisées restent dans
[MATRICE-V2.json](MATRICE-V2.json) et [ACTIVATION-V2.md](ACTIVATION-V2.md).
Aucun commit, push, PR, envoi, publication, dépense, cron ou compte activé.
