# Fiabilité HTTP — 2 octobre 2026

Suite du mandat « meilleure approche, pas de bricolage ». Correction locale dans
le candidat `codex/ape-marketing-skills-20261002`, base
`3756cba51edff2f280555bab13872edc72efde52`.

## Défaut observé

Le test des quatre points d'entrée du serveur vérifiait parfois uniquement le
statut HTTP. Six réponses par scénario conservaient leur corps non lu, puis le
processus serveur était arrêté. Les assertions pouvaient réussir malgré une
requête encore active et une erreur de connexion lors de l'arrêt.

Le diagnostic s'appuie sur `diagnostics_channel` natif, les réponses `fetch` et
leur propriété `bodyUsed`. Aucun nouvel appel réseau ni aucune tentative
supplémentaire n'est introduit par la sonde. Un contrôle à la sortie du processus
fait échouer le diagnostic si un corps non nul reste non lu.

| Même sonde, mêmes quatre scénarios | Avant | Après |
|---|---:|---:|
| Réponses HTTP reçues | 208 | 208 |
| Corps non lus | 24 | 0 |
| Erreurs `undici:request:error` | 4 | 0 |
| Code de sortie du diagnostic | 1 | 0 |

Les quatre erreurs avant correction sont des `ECONNRESET` sur `GET /`, à
l'arrêt des enfants. Ce défaut de cycle de vie est démontré ; il ne prouve pas
à lui seul l'origine de chaque échec intermittent des exécutions antérieures.

## Correction

[Le test HTTP](../../tests/local-server.test.mjs) utilise un seul petit helper
`request` : il attend `fetch`, lit entièrement le corps en octets puis rend le
statut, les en-têtes et les octets aux assertions. Chaque requête termine donc
sa lecture avant la suivante, les assertions et l'arrêt du processus.

Les contrôles existants sont conservés : contenu exact des fichiers publics,
routes privées refusées, HEAD vide et réponses API. Le contenu exact de la
page d'accueil est désormais lui aussi vérifié. Une erreur de lecture échoue
directement au lieu d'être ignorée après réception des en-têtes.

Cette gestion suit la [documentation officielle d'Undici](https://github.com/nodejs/undici/blob/main/README.md#garbage-collection),
qui demande de consommer ou d'annuler les corps des réponses sous Node.
Le serveur applicatif, les dépendances, les délais et la configuration de
concurrence restent inchangés. Aucun retry n'est ajouté.

## Vérification actuelle

Avec Node 24.21.0 et npm 12.0.2, la commande standard **`npm test` réussit** :

- Contrôle des dépendances et politique HTTP réussi.
- Typages navigateur et serveur réussis.
- **239 tests réussis, zéro échec**, concurrence native du dépôt ; environ
  22,7 secondes pour l'étape de tests.
- Build réussi : 11 pages de catalogue générées.
- Validation réussie : 12 pages SEO, 31 fichiers publics.
- Parité des 31 fichiers publics avec la base, après normalisation des seules
  fins de ligne textuelles ; identité exacte source/dist avant restauration
  des fins de ligne générées. La modification du test a été préservée.

Le typage marketing strict du lot précédent reste réutilisable : ses sources,
dépendances et configuration sont inchangées. Les 92 tests marketing font aussi
partie de cette nouvelle exécution globale. La preuve visuelle du renderer et
la découverte des quatre skills restent celles du lot précédent, sur fichiers
inchangés. Hermes demeure **non testé** ; aucune intégration réelle n'est activée.

Journaux locaux sous `tmp/marketing-evidence/` : `http-ownership-before.log`,
`http-ownership-before.jsonl`, `http-ownership-after.log`,
`http-ownership-after.jsonl`, `http-lifecycle-full.log`, `public-parity.json`.
La sonde locale est `trace-local-http.cjs` ; le contrôle de parité est
`public-check.mjs`. Ces diagnostics sont ignorés par Git ; ce rapport et le test
portent les résultats conservables avec le candidat.

Pour reproduire la validation conservable : `npm test`. Les résultats antérieurs
de [CORRECTIONS-V2](CORRECTIONS-V2.md) restent historiques. Un passage vert
constitue une preuve de cette exécution, pas une garantie d'absence de toute
intermittence future. Le checkout initial et ses changements métier sont préservés.

Le candidat reste non commité. Aucun push, PR, déploiement, envoi, publication,
achat, cron, droit ou compte externe n'a été créé ou modifié.
