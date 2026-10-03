# Recette exécutée dans Hermes — 3 octobre 2026

## Résultat et portée

Après autorisation explicite du raccordement, les quatre skills 2.0.0 ont été
découverts et chargés par Hermes. La passe métier a exécuté **onze commandes de
simulation avec code 0**, plus **huit tests ciblés réussis**. Un contrôle négatif
QR termine avec le code 1 attendu pour une entrée incomplète. Les trois demandes
hors projet ont été rejouées dans une session distincte avec la configuration finale.

Cela établit une invocation guidée dans la CLI Hermes sur données fictives.
Cela ne valide pas toutes les capacités des 72 exigences, le routage implicite,
le gateway, cron, les comptes marketing ou des effets réels.

## Raccordement appliqué et état final

- Compte système : `hermes` (UID 1001), accès administratif via `admin-hermes`.
- Runtime existant : `v0.21.5+4911.g6ec0520.dirty`, Python 3.14.7 ; aucune mise à jour.
- Checkout Git dédié : `/home/hermes/workspaces/ape-marketing-recette-1345111`.
  Origine `https://github.com/ak125/auto-pieces-equipements-site.git`, HEAD détachée
  `1345111aa109f6f134b5b82ca67e178c104ec0cf`, arbre
  `2bf703db459757d9cf1d9741bbc8697e1b97025b`. Propre après la recette.
- Profil créé par `hermes profile create ape-marketing-recette --no-alias --no-skills`.
  Aucune copie de secrets ou de canaux. Authentification native observée :
  `logged_in=true`, source `pool:hermes-chatgpt`, mode `chatgpt`.
- Astra/high ; session métier bornée à 24 tours et 600 secondes. Un seul agent
  Hermes actif à la fois, aucune délégation.
- Confiance enregistrée par `hermes -p ape-marketing-recette skills trust` sur
  le seul checkout dédié. Les sources restent dans `.agents/skills/ape-*`.
- Scanner natif `skills-guard-v7` : quatre verdicts `safe`. Index natif : quatre
  skills APE et la skill essentielle `hermes-agent`, malgré `--no-skills`.
- Configuration effective finale : `platform_toolsets.cli: [skills, terminal, no_mcp]`.
  Résolution native contrôlée : `skills_list`, `skill_view`, `skill_manage`,
  `terminal`, `process_manage` avant la découverte différée des outils.
  Les appels observés dans les passes finales sont uniquement `skills_list`,
  `skill_view` et `terminal`. La gestion de skills n'a pas été utilisée.
- Node et npm observés : 24.21.0 et 12.0.2. Le terminal résout Node via
  `/home/hermes/.local/bin/node` ; le binaire connu sous `/opt/codex-project-tools`
  confirme la même version.

Le profil de recette et son checkout restent disponibles. Ils n'ont ni gateway
ni cron activé par cette mission. Le profil APE actif et son unité systemd gardent
les deux empreintes consignées dans [l'identification](RECETTE-HERMES-V2.md) ;
son gateway reste actif. Aucun ancien checkout ou service de mission modifié.
Un profil dédié ne constitue pas une sandbox système.

## Demandes et résultats observés

Horloge des simulations : `2026-10-02T10:00:00Z`, distincte de la date réelle de recette.
Chaque commande ci-dessous utilise `node scripts/marketing-workbench.mjs`, avec
sa fixture homonyme sous `marketing/assistant-local/recette-v2` et `--now` fixé.
`demo` charge le corpus `scenarios.json`.

| Demande | Skill et exécution | Résultat |
|---|---|---|
| J01/J02, devis J03 | campagnes ; `demo` | Deux décisions `ask`, compatibilité non vérifiée ; J03 `draft`, total fictif 42 €, `engaging=false`, stock magasin non confirmé |
| Segment | audience ; `segment` | Une inclusion, un historique inconnu `HISTORY_UNKNOWN`, opposition `SUPPRESSED` exclue malgré correspondance à la règle |
| J04, réponse tardive | revue ; `journey`, puis test existant en mémoire | `propose-reminder`, puis assertion `stop` réussie après réception de la réponse ; version remplacée `recheck` |
| Newsletter/deux posts | campagnes ; `prepare` | Brouillon et deux posts, sources et limites explicites ; aucun contenu publié |
| Rendu | campagnes ; `render` | HTML/texte sur stdout, mention d'exercice, `{{unsubscribe_url}}` non raccordé ; fixture distincte de prepare |
| Brief QR | campagnes ; `qr` | Avec `qr.json` : `brief-ready`, destination exacte, aucune image générée ni réception vérifiée |
| Avis sensible | avis ; `review` | `human`, brouillon de contact privé ; instruction hostile traitée comme donnée |
| Avis déjà répondu | avis ; test P16/P17 existant | Assertion `skip` réussie sur son propre avis synthétique ; pas sur une copie exacte de review.json |
| Reçu incertain | revue ; `provider-test`, `reconcile` | `reconcile-required`, puis reçu fictif `accepted`, `retryAllowed=false` |
| Suspension | revue ; `suspend` | Élément en attente `cancelled`, élément accepté toujours `accepted` ; rappel non garanti |
| Devis/ventes | revue ; `report` et J18 de `demo` | Une demande, un devis, une vente fictive de 42 €, ratio 1 ; marge/visites/effet causal inconnus |

Les onze commandes réussies sont : `segment`, `journey`, `prepare`, `qr`, `render`,
`review`, `provider-test`, `reconcile`, `suspend`, `report`, `demo`.
Les sorties déclarent `canExecute=false`, `externalCalls=0`, environnement de
simulation. Les appels au modèle nécessaires à Hermes sont distincts de ces
compteurs métier. `demo` produit J01–J18, sans évaluation agent complète de chaque
branche de ces parcours.

Session hors projet finale : `20261003_065726_3acd04`, code 0, **un seul appel
`skills_list`**, aucun `skill_view` ou terminal. AutoMecanik et Alliance Delivery
exclus ; projet absent → clarification. Le prompt précisait explicitement la
frontière projet : ce n'est pas une mesure de routage implicite non guidé.

Session métier finale : `20261003_065119_f12ea8`, code 0, 330,681 secondes rapportées.
L'index a été lu en premier et les quatre skills chargés avec `skill_view`.
Leur version, les références et les résultats ont été contrôlés sur le checkout.

## Tests, erreurs et limites conservées

Deux commandes de tests existants, sans ajout de test ou modification de fixture :

```sh
node --test --test-name-pattern='J04 stops|P16/P17|T15/P23' tests/marketing-journeys.test.mjs tests/marketing-studio.test.mjs
node --test --test-name-pattern='T03/T05/T18|T04 nested|T17 suspension|report preserves deduplication|valid events use occurrence' tests/marketing-data.test.mjs tests/marketing-operations.test.mjs tests/marketing-reporting.test.mjs tests/marketing-event-history.test.mjs
```

Résultats : respectivement 3/3 et 5/5. Les tests exécutent des variantes en mémoire
et prouvent leurs assertions ; ils ne constituent pas une conversation métier
indépendante par variante. Les observations suivantes restent visibles :

1. Première passe interrompue, code 130 : le champ historique `toolsets` ne
   restreignait pas la CLI de cette version. Correction dans **le seul profil de
   recette** vers `platform_toolsets.cli`, puis contrôle du résolveur natif et
   reprise en session neuve avec `-t skills,terminal`. La passe interrompue ne
   compte pas comme une recette réussie.
2. Protection native : `execute_code` refusé dans la première passe ; Python `-c`
   et Node heredoc refusés dans la passe finale. Aucun de ces scripts exécuté ;
   aucune modification de `approvals.single_query_mode`. Les lectures ordinaires,
   CLI existantes et tests du dépôt ont permis de poursuivre.
3. `qr prepare.json` : code 1, `status=blocked`, `destination=null` ; l'objet QR
   attendu manque. La recette documentaire est corrigée pour demander **prepare.json
   et qr.json**, sans inventer les données manquantes ou modifier le code.
4. `npm run typecheck` : code 127, `tsc: not found` sur ce clone sans dépendances.
   Aucune installation tentée. La CI du même commit reste une preuve séparée ;
   aucun succès de typage sur le VPS n'est déclaré.
5. L'avis déjà répondu est couvert par le test synthétique existant, pas par la
   variante exacte du fichier review.json. Aucun accès à un compte Google testé.

## Complément local après recette — 3 octobre 2026

Dans le candidat local basé sur `1345111`, la sortie `capabilities` renvoie
désormais aux comptes rendus datés Hermes et Codex. L'affirmation figée « not
tested in Hermes » était devenue obsolète. Ces références ne certifient pas le
runtime qui exécute la commande ; les champs de simulation et d'activation
restent inchangés.

Le test `P16 CLI review recipe` de `tests/marketing-workbench.test.mjs` charge
le fichier canonique `recette-v2/review.json`, sans recopier son contenu. Il
exécute trois variantes via la CLI : avis sensible → `human`, même avis déjà
répondu → `skip` avec brouillon nul, avis déjà répondu dont la version courante
diffère → `recheck` avec brouillon nul. Les trois conservent `canExecute=false`
et `externalCalls=0`. La logique de réponse aux avis n'a pas été modifiée.

Les trois fichiers de tests workbench, studio et control-inputs passent :
**25/25 tests locaux**, sous Node 24.21.0. Cela complète la couverture locale
de la variante exacte. Les neuf tests couverture/index et le typage strict
navigateur/serveur/marketing réussissent également localement. La limite n° 5 reste vraie pour la session Hermes
historique. Ce candidat n'a pas été transféré au checkout Hermes épinglé.

## Traces et reprise

Preuves distantes :
`/home/hermes/.hermes/profiles/ape-marketing-recette/recette-20261003`.
Copie locale : `tmp/marketing-evidence/hermes-20261003`, non publiée et non suivie.
Elle contient prompts, journaux JSONL, codes de sortie, contrôles avant/après,
résumé vérifié et manifeste SHA-256. Les aperçus `tool_result` JSONL sont tronqués
à 5 000 caractères : les sorties complètes ont été extraites en lecture seule de
la base native, pour **cette seule session**, sans raisonnement ni prompt système,
dans `metier-corrige-messages.json`.

Les preuves de livraison et la recette Codex restent dans
[POST-INTEGRATION-V2](POST-INTEGRATION-V2.md). L'identification antérieure reste
historique ; l'autorisation utilisateur du raccordement a depuis été appliquée.
Retour arrière disponible : révoquer la confiance du seul checkout, conserver
les preuves, puis supprimer le seul profil de recette par la CLI native.
Aucune suppression effectuée. Aucune activation marketing autorisée par cette recette.
