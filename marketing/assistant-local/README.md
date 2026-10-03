# Assistant marketing local — simulations intégrées

## Livraison V2 du 2 octobre 2026

État courant : [intégration et recette du 3 octobre 2026](POST-INTEGRATION-V2.md).
La PR #33 est fusionnée ; le dossier de préparation reste une preuve historique.
Le code de simulation est intégré, les services marketing réels restent non activés.
Complément candidat local : références de recette corrigées dans `capabilities`
et variantes CLI de l'avis sensible déjà répondu vérifiées ; voir le
[complément local après recette](EXECUTION-HERMES-V2.md#complément-local-après-recette--3-octobre-2026).

Le mandat V2 remplace V1. Les quatre skills sont en version 2.0.0 ; la CLI locale
ajoute calculs, préparation et décisions simulées. Aucun service externe n'est activé.

- [Matrice complète C/P/J](MATRICE-V2.md) et [données détaillées](MATRICE-V2.json)
- [Contrat et commandes V2](CONTRAT-V2.md)
- [Corpus des 18 recettes et exemples](recette-v2/README.md)
- [Validation V2 et limites](VALIDATION-V2.md)
- [Dernier lot : observations de délivrabilité](FIABILITE-DELIVRABILITE-V2.md)
- [Fiabilité de l’index des skills](FIABILITE-INDEX-V2.md)
- [Structure et bornes des mandats fictifs](FIABILITE-MANDATS-V2.md)
- [Suspension et tâches simulées](FIABILITE-CONTROLES-V2.md)
- [Événements d'arrêt et relances](FIABILITE-EVENEMENTS-V2.md)
- [Historique et doublons des envois simulés](FIABILITE-PROVIDER-V2.md)
- [Quotas, canaux, reçus et validation globale antérieure](FIABILITE-ACTIONS-V2.md)
- [Comparaisons et essais A/B](FIABILITE-COMPARAISONS-V2.md)
- [Fidélité et estimations fiables](FIABILITE-ESTIMATIONS-V2.md)
- [Fiabilité des rapports et codes de sortie](FIABILITE-RAPPORTS-V2.md)
- [Fiabilité HTTP et validation globale antérieure](FIABILITE-HTTP-V2.md)
- [Corrections métier et preuves antérieures](CORRECTIONS-V2.md)
- [Essai d’invocation des skills](RECETTE-AGENT-V2.md)
- [Recette exécutée dans Hermes et limites](EXECUTION-HERMES-V2.md)
- [Identification Hermes avant raccordement](RECETTE-HERMES-V2.md)
- [Activation, suspension et retour arrière V2](ACTIVATION-V2.md)
- [Plan et décisions V2](PLAN-V2.md)

Point d'entrée : `node scripts/marketing-workbench.mjs demo`.
Exemple : [newsletter fictive V2](recette-v2/newsletter.html) et [version texte](recette-v2/newsletter.txt).
Le dossier V1 ci-dessous reste conservé comme preuve historique et pilote initial.

Quatre skills projet, des procédures partagées et un pilote synthétique pour
**Auto Pièces Équipements**, sans nouvelle plateforme ni fournisseur d'envoi.

- [Inventaire des capacités et lacunes](INVENTAIRE.md)
- [Contexte métier et divergences à arbitrer](CONTEXTE.md)
- [Contrat des dossiers et commandes](CONTRAT.md)
- [Modèles réutilisables](MODELES.md)
- [Pilote : newsletter, deux posts, trois avis, calendrier](pilote/README.md)
- [Résultats et limites de validation](VALIDATION.md)
- [Recette et lot d'activation séparé](ACTIVATION-CANDIDATE.md)
- [Plan du lot](PLAN.md) et [checkpoint de reprise](CHECKPOINT.md)
- [Sources officielles consultées](SOURCES-OFFICIELLES.md)

Les skills canoniques sont dans [.agents/skills](../../.agents/skills).
Hermes prépare directement les dossiers dans ses droits effectifs ; Codex réalise les
intégrations et contrôles nécessaires. Aucun compte, audience, CRM, service d'envoi,
publication, programmation ou modification des profils globaux dans ce lot.

Démarrage local : lire le contexte, demander un brouillon avec la skill adaptée,
remplir le contrat puis lancer le validateur. Un dossier réel exige un espace privé
déjà autorisé. Ici, utiliser seulement les fixtures fictives.
