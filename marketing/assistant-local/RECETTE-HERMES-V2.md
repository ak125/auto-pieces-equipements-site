# Préparation de la recette Hermes — 3 octobre 2026

**État historique d'identification.** Le raccordement a ensuite été autorisé et
la [recette exécutée dans Hermes](EXECUTION-HERMES-V2.md). Les absences ci-dessous
décrivent l'état avant ce raccordement.

## Résultat

Runtime, profil, comptes système et checkouts historiques identifiés en lecture.
**Recette métier non exécutée : le raccordement au code V2 reste à autoriser.**
Les lectures SSH ne constituent ni une invocation de skill par Hermes ni une
validation de ses décisions. Les simulations Codex restent consignées séparément
dans [la recette après intégration](RECETTE-POST-INTEGRATION-V2.md).

## Identification vérifiée

| Élément | Observation |
|---|---|
| Accès SSH | Alias `hermes`, compte `admin-hermes` (UID 1000) |
| Compte du runtime | `hermes`, UID/GID 1001 ; lancement vérifié via `sudo -n -iu hermes` |
| Lanceur | `/home/hermes/.local/bin/hermes`, puis `/home/hermes/.hermes/hermes-agent/.hermes/bin/hermes` |
| Version | Hermes Agent `v0.21.5+4911.g6ec0520.dirty` ; révision `6ec05205a943cf813bd56c3c79d64bcf922dac67` |
| Python natif | `3.14.7`, sous `/home/hermes/.hermes/tools/python-3.14.7+20260901-linux-x64/bin/python3` |
| Profil APE actif | `orchestration-auto-pieces-cycle` |
| Modèle configuré | `gpt-6-astra`, fournisseur `openai-codex`, effort `high`, maximum de quatre tours ; aucun appel modèle réalisé |
| Gateway | Service utilisateur `hermes-gateway-orchestration-auto-pieces-cycle.service`, actif ; répertoire de travail = racine du profil |
| Node disponible au compte Hermes | `/opt/codex-project-tools/node-v24.21.0-linux-x64/bin/node`, version `v24.21.0` |
| Inventaire natif du profil | `hermes -p orchestration-auto-pieces-cycle skills list` : deux skills, `typesafe-ai` et `hermes-agent`, aucun `ape-*` |

La mention `dirty` est celle du runtime installé ; aucune mise à niveau ou réparation
de cette installation n'a été tentée. L'inventaire CLI est distinct de la liste
des outils effectivement exposés à une session modèle.

La configuration historique `toolsets` liste `isolated_mission`, `codex_diagnostics`
et `auto_pieces_supervision`. Vérification complémentaire lors du raccordement :
`platform_toolsets.cli` sélectionne seulement `isolated_mission`, et
`platform_toolsets.telegram` sélectionne les trois groupes. La sélection effective
dépend de cette clé par surface, pas du seul champ historique `toolsets`.
Sa configuration `skills` contient `external_dirs: []`,
sans racine projet approuvée. Le code installé sélectionne les outils des groupes
configurés (`model_tools.py`, fonction `_select_tool_names`) : les outils skills et
terminal ne sont pas sélectionnés par ces trois groupes de supervision/délégation.

La découverte projet native exige `skills.trusted_project_dirs` et applique un
scan des skills ; un verdict dangereux ou une erreur de scan bloque leur chargement
(`agent/skill_utils.py`, fonctions `get_project_skills_dirs` et
`is_quarantined_project_skill`). Aucun changement de confiance ou contournement
du scanner n'a été effectué. Voir aussi la
[documentation officielle des skills Hermes](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills).

## Checkouts et permissions

`/home/hermes/workspaces/development-contexts/auto-pieces` contient les méthodes
d'ingénierie : son AGENTS.md précise explicitement qu'il ne contient pas
l'application. Ce répertoire ne remplace pas un checkout APE.

Le service système historique `codex-auto-pieces-cycle@.service`, avec son
complément `60-contract.conf`, utilise le compte `codex-auto-pieces` (UID 996,
GID 987) et le checkout `navigation-keyboard-20260911` ci-dessous. Le socket
`codex-auto-pieces-cycle.socket` est **inactif** et son chemin de socket est absent.
Cette mission historique n'a pas été soumise ou réactivée.

Inventaire sous `/var/lib/codex-auto-pieces/workspace`, relevé avec le compte
propriétaire uniquement pour lire les métadonnées Git :

| Checkout | HEAD observé | État |
|---|---|---|
| `repository` | `5278a438aa1f84a5c05b3545a6211ab81ae3f66c` | Règles/méthodes non suivies |
| `correction-pilot` | `5278a438aa1f84a5c05b3545a6211ab81ae3f66c` | Modifications et fichiers non suivis |
| `opening-status-fix` | `5278a438aa1f84a5c05b3545a6211ab81ae3f66c` | Modifications locales |
| `navigation-keyboard-20260911` | `afd7d190271af2c8546134177cad86d352ba5c51` | Modifications et fichiers non suivis |
| `mobile-menu-focus-20260912` | `f124acb3d8665491f71e70e587fd6f45759b3285` | `assets/site.js` modifié |
| `catalog-v6-proof-20260912` | `2da0c19b7027d06191b0186930e026d7f5ac66a6` | `proof.json` modifié |
| `methods-artifact-proof-20260912` | `0c2b1b2178e0de8592571c50c6c1e3285e2d5de4` | `proof.json` modifié |
| `telegram-source` | `87e800a35e578cf99c1a1bf0fc27b56d8cf55223` | Propre |
| `tg-codex` | Métadonnées Git indisponibles | Aucun contrat V2 ou skill `ape-*` trouvé à la racine attendue |

Aucun de ces répertoires ne contient `marketing/assistant-local/CONTRAT-V2.md`
ni les quatre dossiers `.agents/skills/ape-*`. Une lecture du répertoire parent
par le compte **hermes** échoue avec `PermissionError`. Les droits administratifs
utilisés pour cet inventaire ne sont pas des droits accordés à l'agent Hermes.
Ce constat porte sur les répertoires inventoriés, pas sur tous les disques du VPS.

## Raccordement proposé, non appliqué

1. Préparer un checkout Git dédié du commit intégré
   `1345111aa109f6f134b5b82ca67e178c104ec0cf`, à l'emplacement proposé
   `/home/hermes/workspaces/ape-marketing-recette-1345111`. Vérifier révision,
   origine et intégrité depuis la source APE ; conserver les checkouts historiques.
   Charger les skills depuis ce checkout, sans copie indépendante de leurs fichiers.
2. Créer par la CLI native un profil de recette `ape-marketing-recette`, sous
   le compte `hermes`, sans clonage des canaux ou secrets du profil actif.
   Les deux chemins proposés sont absents au moment du contrôle. Vérifier le
   mécanisme d'authentification natif existant avant tout appel ; ne pas copier
   de jeton pour compenser une authentification manquante.
3. Autoriser explicitement la confiance sur ce seul checkout et les outils
   nécessaires à la lecture des skills et à l'exécution locale des fixtures.
   Examiner la sélection effective des outils et les permissions système avant
   lancement. Un profil distinct n'est pas une sandbox système ; une consigne
   « lecture seule » ne restreint pas à elle seule un terminal.
4. Dans une session CLI Hermes au répertoire absolu fixé, relever l'index natif,
   les éventuelles quarantaines, les chemins et versions 2.0.0, puis les appels
   `skill_view` et commandes réellement choisis par l'agent. Utiliser Astra/high,
   un seul agent et une borne de tours adaptée à la recette.
5. Exécuter les cas métier et hors projet décrits dans
   [ACTIVATION-V2](ACTIVATION-V2.md), uniquement sur les fixtures du dépôt et avec
   `--now 2026-10-02T10:00:00Z`. Archiver sorties, codes de retour et décisions ;
   distinguer sélection, chargement, calcul local et effet. Attendre
   `environment=simulation`, `canExecute=false`, `externalCalls=0`.

Ce raccordement n'active aucun canal marketing, tâche cron ou mission historique.
Le gateway actif conserve sa configuration et ses outils. Retour arrière prévu :
révoquer uniquement la confiance ajoutée, conserver les preuves puis retirer le
profil de recette par la CLI native ; aucun nettoyage des checkouts historiques.

La décision requise porte sur **ce nouveau checkout, ce profil de recette, la
confiance projet et les outils locaux nécessaires**. Elle est distincte de la
demande déjà exécutée d'identification en lecture et de la recette Codex antérieure.

## Références de contrôle pour la reprise

Empreintes SHA-256 relevées après identification, avant toute modification future :

- Profil actif `config.yaml` : `b4e46680125efb7f9e8c273268ca6bbb643b4dd9d4a40aba4aa5b91236c33772`.
- Unité utilisateur du gateway APE : `be9817d6ccc405f82e115ffabeb4b1786c6267b3b42690e57a97ea2a92d550bd`.

Aucun service relancé, mission soumise, checkout distant modifié ou droit étendu
par les commandes de cette identification. Les CLI natives peuvent entretenir
leurs caches internes ; aucune invariance de tout le système de fichiers n'est
prétendue. Ces observations sont datées et doivent être revalidées sur les seuls
éléments concernés avant le raccordement.
