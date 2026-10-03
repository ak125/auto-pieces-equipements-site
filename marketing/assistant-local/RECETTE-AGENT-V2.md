# Recette d'invocation des skills V2

Historique initial conservé. La [recette après intégration du 3 octobre](RECETTE-POST-INTEGRATION-V2.md)
porte sur les fonctions corrigées ; ses limites sont distinctes de celles ci-dessous.

Observation de la livraison V2 initiale, avant [le lot de corrections](CORRECTIONS-V2.md).
Les skills sont inchangés, mais certaines fonctions appelées ont été corrigées depuis.
Cet essai n'est pas une nouvelle invocation d'agent sur le code corrigé.

Exécution le 2 octobre 2026 dans un unique sous-agent à contexte frais, sans
sous-délégation, écriture de fichiers ni accès réseau. Mission limitée à quatre demandes.
Le parent réalise l'implémentation et les contrôles déterministes séparément.

| Demande | Choix et résultat observés |
|---|---|
| A — Préparer une newsletter AutoMecanik | Aucune skill APE sélectionnée ; aucune référence métier chargée pour cette demande |
| B — Préparer une campagne, projet absent | Projet manquant identifié ; aucune skill spécialisée APE choisie |
| C — APE : calculer le segment fictif | ape-audience-preferences, contexte et contrat lus ; CLI segment exécutée : une inclusion, un historique inconnu, une opposition, raisons distinctes |
| D — APE : J04 puis reçu incertain | ape-revue-mesure, contexte et contrat lus ; CLI journey puis reconcile exécutées : propose-reminder, accepted fictif, retry false, aucun envoi |

Exécutable utilisé : Node portable 24.21.0 du workspace existant.
Fixtures : recette-v2/segment.json, journey.json, reconcile.json ; horloge
`2026-10-02T10:00:00Z`. Aucun besoin d'intervention humaine pendant ces essais.
La demande B nécessiterait une précision de projet en situation réelle.

## Limites de la preuve

La première lecture a affiché les douze premières lignes de chacun des quatre skills,
soit les métadonnées mais aussi titres/premières lignes du corps. Ce n'est donc pas
une évaluation strictement limitée aux descriptions. Les références métier n'ont été
chargées qu'à partir de C. L'invocation était explicitement guidée par la mission
d'essai ; la sélection implicite de l'application n'est pas démontrée.

Il n'existe pas de banc avant/après à prompts strictement identiques pour V1/V2.
Les essais V1 sont conservés comme observations historiques, pas comme score comparatif.
Tokens, prix modèle, latence du raisonnement et variance statistique non mesurés.
Aucun runtime Hermes disponible : **non testé dans Hermes**.

Pour une comparaison future : figer ces quatre demandes, les mêmes fixtures et dates,
utiliser des contextes frais séparés pour V1 et V2, consigner choix du skill, sources
chargées, commandes/sorties, erreurs factuelles, demandes humaines et coûts effectivement
retournés par le runtime. Ajouter les cas préparation/avis et projet Alliance. Ne pas
changer la confiance ou activer une tâche pour contourner un blocage.

## Découverte native distincte

Codex CLI 0.159.0 via app-server stdio, méthode skills/list et forceReload, cwd du
worktree candidat : quatre chemins canoniques .agents/skills/ape-*/SKILL.md, scope repo,
enabled true, aucune erreur ou doublon APE. La version 2.0.0 est contrôlée dans les
fichiers par les tests. Ce contrôle n'a pas lancé de nouveau chat modèle ni changé les
réglages globaux. Copie locale : tmp/marketing-evidence/discovery-v2.json.
