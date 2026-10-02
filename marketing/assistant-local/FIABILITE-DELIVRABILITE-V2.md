# Observations de délivrabilité — 2 octobre 2026

Lot local sur codex/ape-marketing-skills-20261002, base
3756cba51edff2f280555bab13872edc72efde52. Modification limitée à auditDelivery,
six nouveaux tests et une recette fictive. Aucun diagnostic fournisseur ou DNS réel.

## Défauts reproduits et correction

Le signal stop valait false avec des compteurs absents ou des zéros périmés.
La conversion Number acceptait aussi chaînes, booléens et tableaux comme incidents.
preconditionsMet bloquait déjà ces entrées ; le défaut concernait le sens du signal
d'arrêt et l'absence d'explication structurée, pas un envoi réel autorisé.

hardBounces et complaints exigent maintenant des entiers sûrs positifs ou nuls.
stop=true dès qu'un compteur valide déclare un incident positif, même si l'autre
compteur, la date ou l'horloge sont invalides. Le signal déclaré est ainsi conservé
sans prétendre en authentifier la provenance ou la chronologie.
stop=false exige deux compteurs valides à zéro et une observation récente.
Dans les autres cas stop=null signifie inconnu, sans conclusion d'absence d'incident.
La fonction est sans état : elle ne réconcilie pas plusieurs observations successives.

La fenêtre fictive de 24 h est inchangée, borne incluse. Les dates futures/invalides,
horloges invalides, observations périmées et compteurs incorrects ont des erreurs
distinctes : CLOCK, OBSERVATION_TIME, OBSERVATION_STALE, INCIDENT_COUNTS.
AUTHENTICATION couvre SPF/DKIM/DMARC non pass ou alignement non true ;
SENDER_READINESS couvre expéditeur/désabonnement non déclarés true.
stop=false n'autorise rien si ces autres préconditions échouent.
Un incident valide peut donner errors=[] et stop=true : preconditionsMet reste false.
La CLI bloque sur les erreurs ou preconditionsMet=false (code 1).

observationVerified=false explicite la limite des déclarations fournies.
queriedDns=false, inboxGuaranteed=false et les garde-fous de la CLI restent inchangés.
La fenêtre de recette n'est pas une politique opérationnelle du magasin ou fournisseur.

## Vérification

Six tests rouges puis verts ; 25 tests ciblés délivrabilité/contrats/régressions verts.
Typage marketing strict vert. Premier npm test : 313/314, délai de démarrage de
server-simple.js dépassé après 10 s, sans sortie enfant. Suite serveur isolée : 4/4,
sans changement. Deuxième npm test standard : **314/314**, dont **167 marketing**.
Délais, concurrence, serveur et tests inchangés entre les deux passages ; aucune
cause ni résolution de l'intermittence revendiquée. Les deux résultats sont conservés.
Dépendances, typages site, build et validation réussis au second passage.
31 fichiers publics identiques en contenu à la base ; source/dist exacts avant
restauration des seules fins de ligne générées. Liste publique inchangée.
Recette CLI delivery-audit.json exécutée à l'heure fixée, sans effet externe.
Matrice de 72 lignes, couverture et liens locaux recontrôlés après documentation.

Node 24.21.0/npm 12.0.2. Journaux ignorés sous tmp/marketing-evidence :
delivery-red.log, delivery-green.log, delivery-typecheck.log, delivery-full.log,
delivery-server-isolated.log, delivery-full-recheck.log,
delivery-example.log et public-parity.json. Sauvegarde delivery-before/operations.mjs
pour retour arrière ciblé après vérification des éventuelles modifications ultérieures.

Candidat non commité, checkout initial préservé. Aucun raccordement, changement de
permission, configuration, dépendance, contenu public, envoi, dépense, tâche activée,
push, PR ou déploiement. Hermes non testé ; fonctions corrigées non évaluées par agent,
aucune CI distante. Skills et renderer inchangés : preuves antérieures réutilisables
dans leur périmètre. Retard intermittent serveur antérieur toujours inexpliqué.

Voir [contrat](CONTRAT-V2.md), [recette](recette-v2/README.md),
[matrice](MATRICE-V2.md) et [checkpoint](CHECKPOINT.md).
