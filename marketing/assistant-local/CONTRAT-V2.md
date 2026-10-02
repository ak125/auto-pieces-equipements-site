# Contrat local V2 — fonctions réutilisables sans persistance

Version de schéma et de skills : 2.0.0. Source : mandat V2 du 2 octobre 2026.
Les repères C/P/J/T sont ceux du mandat, pas des exigences officielles du dépôt.
Les dossiers V1 restent lisibles par marketing-local (versions 1.0.0 et 2.0.0) ;
un index de skills V1 ne valide pas le chargement de la compétence V2.

## Exécution et données

Depuis la racine avec Node/npm prescrits par README :
```sh
node scripts/marketing-workbench.mjs --help
node scripts/marketing-workbench.mjs capabilities
node scripts/marketing-workbench.mjs demo
node scripts/marketing-workbench.mjs segment marketing/assistant-local/recette-v2/segment.json --now 2026-10-02T10:00:00Z
node scripts/marketing-workbench.mjs journey marketing/assistant-local/recette-v2/journey.json --now 2026-10-02T10:00:00Z
node scripts/marketing-workbench.mjs render marketing/assistant-local/recette-v2/render.json --now 2026-10-02T10:00:00Z
```

CLI ponctuelle, sans réseau, lecture de secrets, écritures de données, serveur ou LLM.
demo résout ses fichiers depuis import.meta.url, avec horloge fixée pour la recette.
Les autres commandes prennent la date réelle sauf --now explicite en simulation.
Le JSON d'entrée est limité à 1 MiB, extension .json ; erreurs sans contenu privé.
Import limité à 1000 lignes, règles à profondeur 12 et 30 enfants par groupe.
Les sorties sont sur stdout ; ne rediriger ici que les fixtures fictives. Aucun export réel.

Les historiques d'événements et de quotas sont eux aussi limités à 1000 éléments.
Un tableau vide explicite représente un historique fourni sans événement ; champ absent,
objet à la place du tableau, événement non identifiable ou contradictoire : état inconnu,
jamais une preuve d'inactivité. Les relations suivent la même distinction absent/vide.
Une vente invalide ou contradictoire rend les mesures RFM inconnues, sans total partiel.
Les réservations en attente, proposées ou planifiées consomment les plafonds du batch.
Une préférence mal datée ne peut pas faire réapparaître une permission plus ancienne.

Le rapport commercial exige un tableau events explicite (1000 éléments maximum),
une source, une cohorte syn- et une période ordonnée. Les types d'événements sont
request, quote, sale, refund, click, route-click et open, écrits exactement ainsi.
Un historique absent ou mal formé, une contradiction de vente/remboursement, une
couverture mal typée ou un montant dépassant la représentation sûre en centimes
bloquent le rapport : status=blocked, errors explicites et indicateurs à null.
Un tableau vide valide permet zéro vente si salesCoverage=true ; salesCoverage=false
conserve les ventes et revenus inconnus tout en permettant les autres observations.
Les coûts annoncés complets exigent un montant valide. J18 transmet les blocages et
leurs raisons jusqu'à la CLI. La source et la couverture restent des déclarations
de fixtures, pas une preuve de vérité ou de complétude des systèmes réels.

Un contrôle négatif (canal, mandat, préflight, planification, délivrabilité, demande non
reçue ou erreur de schéma) renvoie status=blocked et un code processus 1. Les décisions
métier stop/defer/human restent des résultats de simulation à examiner, pas des erreurs
techniques. canExecute reste false dans tous les cas. Un résultat unavailable indique
l'absence de raccordement et renvoie le code processus 2 ; completed-simulation
renvoie 0 et ne signifie jamais action effectuée. Ces codes sont ceux de la CLI
marketing-workbench ; les décisions internes d'un fournisseur simulé restent
des résultats de simulation, pas des preuves d'envoi.
Le filtre contrôle les clés de credentials imbriquées avant toute sortie ; il reste
heuristique et n'autorise pas l'utilisation de véritables secrets dans les fixtures.

Fidélité : tableau sales explicite, au plus 1000 lignes ; identifiants synthétiques
du parrain et du filleul obligatoires. Montants, remboursements, seuil et récompense
doivent être des montants non négatifs exacts en centimes, dans la plage des entiers
sûrs ; seuil strictement positif. Calcul et comparaison se font en centimes entiers.
EUR seulement : devise omise dans les anciennes fixtures V2 signifie EUR ; toute
autre devise explicite est refusée. La déduplication utilise l'identité normalisée
de vente et ses montants, indépendamment de l'ordre JSON ou des métadonnées.
Un conflit ou une entrée invalide donne status=blocked et montants à null. Un
registre explicitement vide ou un autoparrainage identifié donne zéro proposition.
issued reste false ; aucune politique réelle de fidélité n'est approuvée ici.

Estimation : observations est un tableau de 0 à 1000 nombres finis non négatifs,
sans filtrage silencieux. Une capacité fournie doit être un nombre fini non négatif ;
absente ou null, elle reste inconnue. Une série absente ou invalide est bloquée.
Une série explicitement vide donne insufficient-data et des mesures null ; une
série valide non vide donne estimated, moyenne incrémentale et min/max observés.
capacityRisk compare le maximum observé à la capacité, sans mesure probabiliste
de risque. Aucun modèle entraîné, intervalle de confiance ni planning n'est produit.

Comparaison : sources est un tableau explicite de 0 à 1000 instantanés numériques,
avec ref, subject, value finie, checkedAt et expiresAt valides. La date de contrôle
doit précéder l'expiration et ne pas être future. Les sources expirées sont exclues
et comptées dans stale ; les autres anomalies sont des erreurs, pas des absences.
Deux valeurs différentes pour le même sujet au même instant bloquent la comparaison,
même si leurs références diffèrent. Les doublons de même valeur sont dédupliqués ;
les offsets représentant le même instant sont équivalents. Le tri choisit une
référence stable pour les doublons concordants, jamais une valeur en cas de conflit.
status vaut compared, insufficient-data ou blocked ; aucune différence partielle
n'est présentée si une erreur existe. Comparabilité métier et unités restent à
vérifier dans les sources : ce calcul ne prouve ni leur vérité ni leur pertinence.

Essais A/B : participants est un tableau explicite de 0 à 1000 lignes. Chaque ligne
porte id synthétique et variant exactement control ou variant. converted vaut true,
false ou null/absent pour inconnu ; une chaîne ou un nombre est invalide. Les
doublons d'identité normalisée doivent concorder sur variante et conversion ; sans
version/source pour les départager, tout conflit bloque le rapport et rend arms null.
Un groupe avec des conversions inconnues expose unknown et converted=null.
Le plan exige minimumPerArm entier sûr positif, primary non vide et until valide.
Une entrée invalide donne status/decision=blocked. Un échantillon valide mais vide,
trop petit, encore ouvert ou incomplet reste inconclusive. ready-for-statistical-review
signifie uniquement que ces préconditions sont remplies : winner reste null et
causalityEstablished false ; affectation, puissance et significativité restent à examiner.

Enveloppe : project exact, environment=simulation, classification=synthetic,
schemaVersion=2.0.0, runId. Identifiants syn-, emails domaine .invalid pour les imports.
La classification n'anonymise rien : filtres heuristiques incomplets, aucun client réel autorisé.
Les modules contrôlent leurs types comme unknown ; pas de validation JSON concurrente.
Les corps de référence exécutables sont les fixtures [recette-v2](recette-v2/README.md).

## Opérations et sorties

| Commande | Entrée métier | Sortie locale et limite |
|---|---|---|
| capabilities | aucune | Inventaire vérifié au code, comptes non connectés |
| import | records, existing optionnel | Créations proposées, erreurs par ligne, références ; aucun fichier de contacts |
| segment | records, rule, mode, channel | Effectif, raisons, inconnues ; préférences recontrôlées même en snapshot |
| score | person, policy | Contributions, RFM de fenêtre, manque d'historique ; aucune prédiction |
| qualify / quote | request / quote | Question minimale ou devis non engageant |
| prepare / render | brief complet / dossier V1 ou V2 | Contenus sourcés / HTML et texte sans destinataires |
| review / invite | review / experience | Réponse prudente, skip/recheck/human / invitation indépendante de la note |
| qr | qr : URL, finalité, version, expiration | Brief exact, image non générée, réception non vérifiée |
| journey | scénario J, snapshot, objets, événements | Décision et prochaine action ; pas un moteur durable |
| preflight | dossier | Contrôle documentaire V1, toujours canExecute=false |
| mandate | action, grant fictif | Concordance de portée ; permissionVerified=false |
| execute | action | unavailable, jamais un succès simulant un effet réel |
| provider-test / reconcile | action+prior / previous+receipt | Reçu simulé, incertitude, rapprochement sans retry |
| suspend | items, action suspend, grant | Annulation simulée des attentes ; accepté ≠ rappelé |
| arbitrate | items, history, policy | Priorités/plafonds communs dans le batch seulement |
| plan-job | job, context | Contrat de tâche, aucune création/activation |
| channel / delivery-audit | canal / observations | Préconditions déclarées, aucun compte ou DNS interrogé |
| report | report | Demandes/devis/ventes dédupliquées, remboursements, inconnues |
| compare / business-facts | sources / référence+observations | Écarts datés / contradictions ; pas de collecte ni édition publique |
| loyalty / experiment / forecast / paid / alerts | fixtures indiquées dans tests | Propositions, contrôle, baseline, plan sans dépense, alertes regroupées |
| privacy / skill-index | sujet+opération / index+contexte | Plan non exécuté / validité des entrées, complétude, doublons, versions et chemins déclarés |

Les fonctions pures sous scripts/marketing sont utilisables directement par un script
autorisé, mais elles ne constituent pas une API métier authentifiée. Le CLI ne déclare
aucune connexion et ne reçoit jamais les credentials d'un canal.

## Sémantique des règles et de la chronologie

Règles : all/any/not ; field sur kind/need/zone/language avec equals ; event avec
since/until/min/max ; sequence de types d'événements strictement ordonnés ; relation
par ID+type et catégorie facultative. Trois valeurs true/false/null, NOT(null)=null.
historyFrom doit couvrir toute la fenêtre : absence de traces n'est pas absence d'activité.
Aucun profil sensible inféré. Les contacts restent distincts par ID, pas fusionnés par email.
Une opposition reste bloquante lors d'un réimport, même plus récent ; sa résolution légitime
devra venir du système de préférences, pas d'une fusion automatique.

Dates avec offset explicite ; chronologie métier puis réception puis décision. Les
calendriers et limites par jour utilisent Europe/Paris. L'heure de Tunis ne s'applique pas.
L'heure 24:00 est refusée pour éviter la normalisation silencieuse au lendemain.
Exceptions via store-hours.json ; les tests injectent des fermetures, sans les enregistrer.

journey exige source, snapshotAt, version/currentVersion, trigger et metric. Les sorties
ont runId, actionKey documentaire, schemaVersion et decidedAt. L'actionKey stable lie
projet/parcours/objet/version ; les reçus du système officiel devront assurer la déduplication.
Le calcul n'a pas de participants en attente, timer, compensation ou boucle de reprise.
Les transitions simulées et décisions doivent être inscrites dans le suivi officiel
lorsqu'il existera, pas dans une base ou un registre ajouté par cette mission.

## Autorité et branche réelle

Une fixture de mandat couvre acteur, compte, opérations, familles, template/révision,
règle d'audience, bornes, exclusions, volume/coût/fréquence, période Paris, révocation,
approbateur et conditions d'arrêt. La concordance n'authentifie jamais ces déclarations.
Un retrait réduit l'audience sans invalider la portée ; élargissement ou hausse exige revue.
Voir [activation V2](ACTIVATION-V2.md) pour l'adaptateur d'autorité manquant.

checkMandate contrôle toutes les entrées des listes operations, families, templates,
revisions, exclusions et stopConditions : tableaux explicites de 1 à 1000 noms non
vides, sans espaces périphériques, valeurs non textuelles ou cases absentes. Cette
borne est une limite locale de fixture, pas un quota fournisseur. Les doublons
concordants ne changent pas la portée ; ils comptent dans la taille du tableau.
Les exclusions de l'action doivent contenir toutes celles du mandat et peuvent en
ajouter. Canal et règle d'audience sont des noms explicites identiques des deux côtés.
Les noms sont comparés exactement, sans réparation silencieuse. Les catalogues réels
de canaux, opérations et conditions d'arrêt ne sont pas authentifiés par ce contrôle.

contacts/maxContacts et frequency/maxFrequency exigent des entiers sûrs positifs
ou nuls ; zéro n'autorise qu'une valeur zéro. cost/maxCost conservent les nombres
finis positifs ou nuls, y compris décimaux. Les valeurs de l'action ne dépassent
jamais les plafonds. Les erreurs de mandat bloquent aussi suspendSimulation avant
toute transformation d'élément. permissionVerified et canExecute restent false.

Réconciliation : demandé, accepté, traité, rejeté, incertain, annulé sont distincts.
Un timeout est incertain ; aucun retry/failover ni bascule manuelle automatique.
Une preuve fournisseur n'est ni une lecture humaine ni une vente.

## Contrôles des propositions et reçus simulés

arbitrate compare les identifiants de contact, compte, action et canal après retrait
des espaces périphériques, comme leur validation. Une clé d'action répétée bloque
tout le batch avec DUPLICATE_CANDIDATE ; aucune version concurrente n'est choisie.
Les plafonds de contact/compte/canal sont des entiers sûrs positifs ou nuls. Zéro
interdit une nouvelle proposition. costCap reste un nombre fini positif ou nul.
Les bornes horaires peuvent inclure une fraction d'heure ; début inclus, fin exclue,
avec minutes, secondes et millisecondes de l'instant Europe/Paris. Les réservations
restent limitées au batch en mémoire, sans garantie de concurrence ou de persistance.

channel refuse une horloge invalide ; le plafond SMS doit être fini et non négatif.
ready reste une concordance de préconditions déclarées, sans compte connecté.

reconcile exige un état précédent explicite : pending, uncertain, accepted,
processed, rejected, cancelled ou quota. Un reçu doit désigner la même clé, un
identifiant fournisseur synthétique, une preuve fictive non vide et un état parmi
accepted, processed, rejected, cancelled. Un identifiant fournisseur déjà lié doit
correspondre. Les clés et états validés sont normalisés dans la sortie.

Depuis pending/uncertain, les quatre états du reçu sont rapprochables. Depuis
accepted, seul le maintien accepted ou le passage processed est accepté. Les états
processed, rejected et cancelled acceptent seulement un reçu du même état. Un reçu
terminal suivant quota, ou une autre transition contradictoire, produit un conflit.
Ces règles conservatrices de fixture ne constituent pas le contrat d'un fournisseur
réel ; aucun reçu daté et ordonné n'est disponible pour justifier une régression.

Un schéma invalide produit uncertain avec RECEIPT_OR_PREVIOUS_INVALID ; un changement
de fournisseur produit PROVIDER_CONFLICT ; une transition incompatible produit
STATE_CONFLICT. Ces erreurs bloquent la CLI avec le code 1. Aucun retry, écrasement
d'état persistant ou appel externe n'en découle ; retryAllowed reste false.

## Historique fourni à provider-test

action exige une clé synthétique et un outcome parmi accepted, rejected, uncertain,
quota ou timeout. Un outcome invalide est une erreur d'entrée ; il ne représente pas
un refus provenant du fournisseur. timeout produit uncertain.

prior doit être un tableau explicite de 0 à 1000 états connus : une absence n'est pas
équivalente à []. Chaque ligne exige une clé synthétique et un état parmi pending,
uncertain, accepted, processed, rejected, cancelled ou quota. providerId est facultatif,
mais doit être synthétique s'il est présent. Les clés, états et identifiants fournisseur
sont normalisés par retrait des espaces périphériques.

Cet historique est un instantané fourni, sans ordre ni chronologie authentifiés.
Deux lignes de même clé doivent avoir le même état et des identifiants fournisseur
compatibles ; l'absence d'identifiant n'efface pas celui fourni par une autre ligne.
Les doublons concordants sont dédupliqués. Une contradiction, même sur une autre clé,
bloque l'ensemble de l'entrée : aucune ligne n'est arbitrairement déclarée la dernière.
Un journal de transitions doit être rapproché en amont, pas déduit de l'ordre du tableau.

Une clé connue pending/uncertain renvoie reconcile-required ; tout autre état connu
renvoie duplicate, y compris rejected/quota/cancelled. Une clé absente d'un historique
valide permet seulement de calculer le résultat fictif demandé. retryAllowed reste
false dans tous les cas. Ces sorties ne constituent jamais une autorisation d'envoi.

Erreurs : PROVIDER_ACTION_INVALID, PROVIDER_HISTORY_INVALID ou
PROVIDER_HISTORY_CONFLICT, avec status=blocked et code CLI 1. Un rejet, quota, timeout,
doublon ou rapprochement requis valablement simulé conserve le code CLI 0 : celui-ci
signifie que le calcul s'est terminé, pas qu'une livraison a eu lieu. Voir la
[fixture d'historique incertain](recette-v2/provider-test.json).

## Événements d'arrêt des parcours

foldEvents lit au maximum 1000 lignes et travaille sur le dossier object demandé.
Les identifiants d'objet et d'événement sont normalisés avant filtrage et comparaison.
Une ligne sans objet identifiable rend l'historique inutilisable ; un autre objet
identifiable est ignoré et ne peut pas arrêter le dossier demandé.

Le vocabulaire local est explicite : request et quote sont des faits sans arrêt ;
reply, refused, sale, closed, opt-out, withdrawn, collected et cancelled sont des
faits d'arrêt. Un type inconnu du dossier demandé bloque le parcours : aucun sens
métier n'est déduit automatiquement d'un terme comme accepted. Tout raccordement
devra établir la correspondance des types depuis la source autorisée.

Chaque événement du dossier exige id, kind, occurredAt et receivedAt, avec
occurredAt <= receivedAt <= instant de décision. Les dates exigent un offset.
version est facultatif ; s'il est fourni, c'est une chaîne non vide. Une version
absente reste inconnue et n'est pas assimilée à une version renseignée.

Pour le même objet et le même ID normalisés, type, instant de survenue et version
doivent concorder. Des offsets différents représentant le même instant concordent.
Une réception répétée conserve la première date de réception valide observée,
indépendamment de l'ordre du tableau. Les événements normalisés ne contiennent que
id, object, kind, version (null si absente), occurredAt et receivedAt, dates en UTC.
Le tri suit survenue, réception puis identifiant pour départager les égalités.

Tout schéma invalide ou conflit renvoie events=[], errors explicites et stop=null.
Seul un historique valide produit stop=true ou false. simulateJourney contrôle
les erreurs avant de décider ; la CLI bloque les erreurs avec le code 1. Une
réponse valide produit stop, pas propose-reminder pour J04. Les exceptions métier
existantes J12/J15/J18 au signal d'arrêt restent inchangées.

L'absence d'événement dans une collection explicite ne prouve pas l'exhaustivité
de la source. Aucune identité, chronologie ou provenance réelle n'est authentifiée
par ces fixtures ; aucun journal durable ni moteur de relance n'est ajouté.

## Suspension et contrat de tâche simulés

suspend exige le mandat fictif concordant puis un tableau items explicite de 0 à
1000 éléments. Chaque ligne doit avoir une clé synthétique et un état reconnu.
Les clés et états sont normalisés par retrait des espaces périphériques. Deux
lignes concordantes de même clé sont dédupliquées ; des états différents bloquent
tout le lot, sans résultat partiel. La sortie est triée par clé.

Seuls pending, proposed et scheduled deviennent cancelled dans la simulation.
accepted, processed, uncertain, rejected, cancelled et quota restent inchangés.
Les états acceptés ou incertains exigent un rapprochement fournisseur, pas un rappel
présumé. Si une ligne précise project, account, channel, family, template, revision
ou audienceRule, ce champ doit correspondre à l'action du mandat après normalisation.
L'absence de ces champs ne prouve pas que l'élément appartient au périmètre réel :
la propriété des clés et l'autorité restent à établir par les systèmes existants.

Liste inutilisable : SUSPENSION_INPUT ; états contradictoires : SUSPENSION_CONFLICT ;
périmètre déclaré contradictoire : SUSPENSION_SCOPE. Mandat invalide : MANDATE.
Les erreurs produisent status=blocked, items=[] et le code CLI 1. Une liste valide,
y compris vide, produit status=simulated. realEffects=0, recallGuaranteed=false et
permissionVerified=false restent explicites dans tous les cas.

plan-job exige maxItems entier de 1 à 1000, timeoutMs entier de 1 à 30000 et costCap=0.
La commande doit être exactement report ou capabilities, avec llm=false et
timeZone=Europe/Paris. Une commande entourée d'espaces n'est pas acceptée telle quelle.

workdir doit correspondre exactement au contexte, sans espaces périphériques ni
caractère nul, et être un chemin absolu POSIX, Windows avec lecteur, ou UNC complet.
Les chemins relatifs, y compris ceux relatifs au lecteur Windows courant, sont
refusés. Le contrôle utilise node:path ; il ne consulte pas le disque ou le réseau.
Il ne vérifie ni existence, liens symboliques, racine réelle, permissions ou provenance
du contexte. valid est une validation de forme, avec activated=false et
permissionVerified=false ; aucune tâche ni programmation n'est créée.

## Observation de l'index des skills


skill-index inspecte une liste déclarée, explicite et bornée à 1000 entrées.
Les cases absentes et valeurs mal formées rendent l'inspection invalide ; une liste
vide porte EMPTY. Les noms sont normalisés par retrait des espaces périphériques
avant contrôle de doublon et de chemin. La racine du contexte doit être absolue,
sans NUL ni espaces périphériques, syntaxiquement POSIX/Windows/UNC avec node:path.
Les chemins restent comparés sans accès disque ou résolution réelle de symlink.

valid=true signifie que les entrées fournies sont cohérentes. complete=true exige
aussi les quatre noms attendus sans erreur. expectedCount=4 et missingSkills liste
les noms absents, dans un ordre stable ; un nom présent avec mauvaise version ne
figure pas parmi les absents mais rend valid et complete faux. Une inspection
partielle valide garde le code CLI 0, avec complete=false. Une erreur donne code 1.

referencesValid est une déclaration, pas une preuve : referencesVerified=false et
implicitRoutingVerified=false restent systématiques. Ni complétude ni validité
ne prouvent découverte, chargement, invocation ou effet dans Codex/Hermes.
Voir [la recette fictive](recette-v2/skill-index.json).

## Observations de délivrabilité et signal d'arrêt


delivery-audit n'interroge ni DNS ni fournisseur. hardBounces et complaints sont
des entiers sûrs positifs ou nuls, sans conversion depuis du texte ou des booléens.
stop=true conserve tout incident entier positif déclaré, même si la date ou une
autre donnée manque. Sans incident valide déclaré, stop=false exige deux compteurs
à zéro et une observation récente ; sinon stop=null (inconnu). Aucun état historique
n'est enregistré : le résultat porte sur la seule observation fournie.

La fenêtre de fixture reste de 24 h, borne incluse, observation non future et
horloge valide. CLOCK/OBSERVATION_TIME/OBSERVATION_STALE/INCIDENT_COUNTS précisent
les défauts ; AUTHENTICATION et SENDER_READINESS précisent les préconditions
techniques déclarées qui échouent. preconditionsMet exige aucune erreur et stop
strictement false. Le code CLI est 1 sinon, y compris pour un incident valide sans
erreur de schéma. stop=false seul ne vaut pas autorisation de poursuivre.

observationVerified=false, queriedDns=false et inboxGuaranteed=false sont constants.
Authenticité, compte, provenance et réception réelle restent non vérifiés. La fenêtre
de recette ne fixe aucune politique réelle. Voir [exemple fictif](recette-v2/delivery-audit.json).
