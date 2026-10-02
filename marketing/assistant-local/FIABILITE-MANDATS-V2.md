# Structure et bornes des mandats fictifs — 2 octobre 2026

Lot local sur codex/ape-marketing-skills-20261002, base
3756cba51edff2f280555bab13872edc72efde52. Modification limitée à checkMandate
dans scripts/marketing/operations.mjs ; aucun service d'autorisation ajouté.

## Défauts reproduits et corrections

La comparaison vérifiait seulement la présence de la valeur recherchée dans les
listes autorisées, sans contrôler leurs autres éléments. Des exclusions nulles
identiques des deux côtés, des conditions d'arrêt sans nom et des tableaux creux
pouvaient être acceptés. Les listes sont désormais validées intégralement avant
comparaison : 1 à 1000 noms explicites non vides, sans espaces périphériques.
La borne concerne la fixture locale, pas un quota fournisseur. Les doublons
concordants restent acceptés et comptent dans cette borne.

Un canal absent ou mal formé des deux côtés pouvait également être déclaré
concordant. Canal et règle d'audience exigent maintenant un nom explicite, comparé
exactement. Les catalogues réels de canaux et conditions ne sont pas vérifiés.

contacts/maxContacts et frequency/maxFrequency acceptaient des fractions et des
entiers au-delà de la précision sûre. Ils exigent désormais des entiers sûrs
positifs ou nuls, avec comparaison au plafond. Les coûts décimaux finis restent
acceptés. Une exclusion supplémentaire réduit toujours la portée sans l'élargir.

Le contrôle partagé protège mandate et suspendSimulation ; un mandat invalide
bloque la suspension avant toute transformation. La CLI retourne le code 1 sur
ces erreurs, le code 0 pour une simulation valide. permissionVerified=false,
canExecute=false, externalCalls=0 et realEffects=0 restent respectés.

## Preuves locales

- Sept tests ajoutés dans tests/marketing-mandate-inputs.test.mjs : 0/7 avant
  correction, 7/7 après. Listes invalides/creuses/surdimensionnées, exclusions,
  noms, règles d'arrêt, limites numériques, suspension et véritable CLI couverts.
- Suite ciblée mandats/contrôles/opérations : 22/22 ; typage marketing strict vert.
- npm test standard : **302/302**, dont **155 marketing**, dès le premier passage
  de ce lot. Dépendances, typages du site, build et validation réussis.
- 31 fichiers publics identiques en contenu à la base ; source/dist identiques
  avant restauration des seules fins de ligne générées. Liste publique inchangée.
- Contrat, 72 lignes de matrice et checkpoint actualisés ; liens locaux contrôlés.

Runtime : Node 24.21.0, npm 12.0.2. Traces sous tmp/marketing-evidence :
mandates-red.log, mandates-green.log, mandates-typecheck.log, mandates-full.log
et public-parity.json. Sauvegarde avant correction : mandates-before/operations.mjs.
Ces fichiers de travail sont ignorés par Git. Retour arrière ciblé possible depuis
cette sauvegarde, après vérification de l'absence de modifications ultérieures.

## Limites préservées

La concordance de documents fictifs ne prouve ni authenticité, ni propriété,
ni droits effectifs, ni application réelle des conditions d'arrêt. Aucun canal
connecté, envoi, dépense, tâche, cron ou publication activé. Candidat non commité ;
aucun push, PR ou déploiement. Checkout initial et modifications conservés.

Hermes non testé ; fonctions corrigées non évaluées par agent, aucune CI distante.
Les skills et le renderer étant inchangés, leurs preuves antérieures restent
réutilisables dans leur périmètre. Le retard de démarrage serveur observé au lot
événements reste documenté, sans cause établie ni résolution revendiquée.

Voir [contrat](CONTRAT-V2.md), [matrice](MATRICE-V2.md),
[checkpoint](CHECKPOINT.md) et [activation](ACTIVATION-V2.md).
