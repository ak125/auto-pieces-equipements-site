# Lot d'activation candidat — non exécuté

Version 1.0.0, périmètre Auto Pièces Équipements uniquement. Cette recette n'est pas
une autorisation. Aucun compte, profil, cron, secret, infrastructure ou droit système
n'a été modifié. La création du worktree géré par l'application ne modifie pas sa configuration.

## 1. Skills : source et chargement

Source canonique unique : `<racine-du-checkout-APE>/.agents/skills/ape-*/SKILL.md`.
Les références relatives exigent le dépôt complet. Ne pas copier seulement les quatre
dossiers dans un répertoire global et ne pas créer de symlink. Relever SHA Git et diff
des fichiers candidats ; l'absence de commit ne doit pas faire passer le seul SHA de base
pour la version des skills.

**Codex :** ouvrir ce worktree exact puis sélectionner `$ape-campagnes-locales`,
`$ape-avis-google`, `$ape-audience-preferences` ou `$ape-revue-mesure`.
La découverte locale a été testée avec `codex-cli 0.159.0`, appel `skills/list`.
Vérifier les quatre chemins canoniques et l'absence de même nom ailleurs dans l'index ;
Codex peut montrer plusieurs skills de même nom, sans fusion.
Aucune copie ni configuration utilisateur requise.

**Hermes : non testé dans Hermes.** Aucun exécutable accessible sur ce poste ; aucune
connexion VPS effectuée. La version distante et ses permissions restent à vérifier.
Selon la documentation officielle consultée, Hermes peut découvrir `.agents/skills`
dans un projet de confiance. La recette suivante n'est proposée qu'après confirmation
de la version, du chemin de travail et autorisation ciblée du changement de confiance :

1. Depuis le checkout APE exact, relever `hermes --version` et examiner l'aide de
   `hermes skills`. Vérifier la présence réelle de la découverte projet.
2. Avant activation, inspecter l'index, les doublons `ape-*`, la provenance et les
   quarantaines. Priorité documentée Hermes : projet, local, external_dirs.
3. Si la fonction est supportée et autorisée, `hermes skills trust <racine-APE>`
   enregistre la confiance dans la configuration du profil. **Ne pas exécuter dans ce lot.**
4. Depuis une session dans cette racine : `skills_list`, puis `skill_view` sur chacun
   des quatre noms ; vérifier corps/version/références. Essayer les demandes ci-dessous.
5. Sur une ancienne version sans découverte projet, arrêter et préparer un raccordement
   ciblé compatible ; ne pas installer/mettre à jour Hermes, modifier external_dirs
   globalement ou copier les skills par défaut.

Les répertoires externes ne sont pas une barrière d'écriture. Vérifier les droits
effectifs des outils et du système de fichiers ; une consigne Markdown ne les remplace pas.
Une session généraliste disposant d'un terminal ouvert n'est pas une sandbox marketing.

## 2. Permissions et effets à faire approuver

| Action future | Permission minimale | Preuve attendue | Retour arrière |
|---|---|---|---|
| Confiance projet Hermes | Lecture du checkout APE et modification ciblée de la confiance pour cette racine | Version supportée, index montrant les chemins canoniques, corps chargé | `hermes skills untrust <racine-APE>` si commande confirmée par l'aide ; vérifier disparition |
| Préparer des contenus | Lecture des sources métier, écriture dans l'espace privé explicitement autorisé ; un propriétaire d'écriture | Dossier versionné, aucune donnée personnelle dans Git, revue | Retirer uniquement les sorties du run concerné dans cet espace |
| Newsletter réelle | Fournisseur choisi et droits précis, expéditeur, audience éligible, oppositions et désinscription vérifiables | Tests dans le mode de simulation du fournisseur, validation finale de version/destination/période/limites | Désactiver le raccordement ; un message envoyé ne peut pas être rappelé de manière fiable |
| Réponse/post Google | Compte et établissement précis, contenu exact et version d'avis, autorisation par action | Brouillon relu puis preuve de soumission et preuve publique séparées | Correction/retrait manuel autorisé ; la publication peut déjà avoir été vue |

Aucun droit d'envoi/publication ni secret correspondant ne doit être remis aux agents
dans ce candidat. Si un service séparément autorisé est retenu, il devra recontrôler
éligibilité, oppositions, plafonds et échéances juste avant effet. Cette capacité est absente.

## 3. Dossier de raccordement newsletter

Décisions non prises : fournisseur, propriétaire opérationnel, espace privé autorisé,
adresse d'expédition confirmée, authentification du domaine, traitement des rebonds,
désinscriptions, oppositions, fraîcheur et base applicable au ciblage.
Pas de fournisseur recommandé sans connaître ces besoins, aucun abonnement payant ni OAuth.

Recette future : valider ces éléments, examiner permissions et coûts, préparer un
adaptateur séparé sans secret dans les prompts, tester gabarit/rendu, variables, opt-out,
erreurs et simulation ; obtenir l'approbation de la version, audience, période et limites.
Seulement ensuite, une action précise pourra être autorisée. Aucun faux formulaire
ni abonnement automatique ne doit combler l'absence de collecte.

## 4. Demandes d'essai Hermes

- `/ape-campagnes-locales APE : préparer une newsletter batterie informative sans prix ni destinataires et deux posts, en réutilisant le pack existant.`
- `/ape-avis-google APE : traiter les trois avis synthétiques du pilote, sans publication.`
- `/ape-audience-preferences APE : établir les preuves manquantes pour cibler une newsletter à partir d'anciens échanges WhatsApp, sans importer de contacts.`
- `/ape-revue-mesure APE : relire le pilote au 12 octobre avec prix manquant ; aucune donnée de campagne disponible.`
- Demandes négatives sans invocation explicite : « AutoMecanik : newsletter » et
  « Alliance Delivery : campagne clients » → aucune skill APE sélectionnée.

Réussite attendue : contenu utile rédigé directement, zéro transport, périmètre maintenu,
PRICE/EXPIRED, SENSITIVE selon cas, aucun taux inventé, aucun compte ni secret consulté.
Échec de découverte/chargement : arrêter l'activation et documenter ; ne pas la déclarer installée.

## 5. Revenir sur le candidat local

Aucun fichier préexistant n'est modifié par le lot. Pour l'abandon, examiner et retirer
seulement les nouveaux chemins listés dans le checkpoint, après préservation des travaux
à garder, ou archiver le worktree via Codex. Ne jamais nettoyer le checkout initial ni
les autres worktrees. Aucun retour arrière du site ou des comptes n'est nécessaire,
puisqu'aucune publication ou activation n'a eu lieu.
