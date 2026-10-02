# Comparaisons et essais A/B — 2 octobre 2026

Suite locale autorisée dans le candidat codex/ape-marketing-skills-20261002,
base 3756cba51edff2f280555bab13872edc72efde52. Les deux fonctions corrigées sont
compareSources et experimentReport, dans scripts/marketing/insights.mjs.

## Corrections

Un même participant A/B pouvait apparaître avec deux conversions différentes ;
la dernière ligne remplaçait la première sans conflit déclaré. Une conversion
absente était comptée comme un échec et pouvait laisser l'essai devenir prêt à
examiner. Ces cas sont désormais séparés :

- Conflit de variante ou conversion pour la même identité normalisée : rapport
  bloqué, contamination signalée, arms=null ; aucun agrégat arbitraire conservé.
- Conversion absente/null : valeur inconnue, compteur unknown par groupe,
  converted=null pour le groupe concerné et décision inconclusive.
- Doublon concordant : compté une fois, indépendamment des métadonnées.
- Plan, collection, variante, conversion ou horloge invalide : erreur explicite.
- Échantillon valide incomplet, trop petit ou encore ouvert : inconclusive.

Deux sources pouvaient aussi fournir des valeurs différentes pour le même sujet
au même instant. Le tri par référence sélectionnait alors arbitrairement une base
pour la comparaison suivante. Ces contradictions bloquent désormais la comparaison.
Les doublons concordants et les dates avec offsets équivalents sont dédupliqués.
Les collections sont bornées à 1000 lignes ; schéma, chronologie, valeurs finies
et différence numérique sont contrôlés. Les sources expirées sont comptées à part.
Une entrée invalide ne produit aucune comparaison partielle ; un tableau vide ou
un seul instant exploitable reste insufficient-data.

Les deux fonctions renvoient leur statut et leurs erreurs à la CLI existante,
qui bloque correctement avec le code 1. Aucun nouvel adaptateur ni moteur ajouté.
Les contrats détaillés sont dans [CONTRAT-V2](CONTRAT-V2.md).

## Preuves actuelles

- Huit nouveaux tests écrits avant correction, rouges puis verts dans
  [marketing-comparisons.test.mjs](../../tests/marketing-comparisons.test.mjs).
- Contrôles de permutations, doublons, données inconnues et processus CLI réels.
- Typage marketing strict réussi, Node 24.21.0/npm 12.0.2.
- **Commande standard npm test réussie : 263/263**, dont 116 tests marketing ;
  contrôles des dépendances, typages du site, build et validation inclus.
- Build : 11 pages de catalogue générées ; validation : 12 pages SEO,
  exactement 31 fichiers publics. Parité du contenu public avec la base contrôlée ;
  fins de ligne générées restaurées après comparaison, test HTTP corrigé préservé.

Les 239/239 du lot HTTP et les validations ciblées intermédiaires restent des
preuves historiques. Cette nouvelle exécution globale porte les corrections
accumulées de rapports, fidélité, estimations, comparaisons et essais A/B.

Journaux locaux ignorés dans tmp/marketing-evidence : comparisons-red.log,
comparisons-green.log, comparisons-typecheck.log, comparisons-full.log et
public-parity.json. Sauvegarde antérieure au lot : comparisons-before/insights.mjs.
Comparer et préserver tout changement ultérieur avant un retour arrière.

## Limites conservées

ready-for-statistical-review ne désigne aucun gagnant : winner=null et
causalityEstablished=false. Affectation des groupes, puissance, significativité,
couverture réelle et vérité des sources ne sont pas établies par ces fixtures.
La comparaison numérique ne vérifie pas la comparabilité métier ou les unités.

Compétences, renderer et dépendances inchangés ; preuves de découverte Codex et
mobile antérieures réutilisables. Fonctions corrigées non évaluées par agent,
Hermes non testé. Le candidat reste non commité, sans CI distante, activation,
push, PR, publication, transport réel, dépense ou cron.
