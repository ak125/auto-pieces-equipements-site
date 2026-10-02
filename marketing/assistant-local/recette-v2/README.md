# Recette V2 — corpus entièrement fictif

Aucun contact, devis ou reçu réel. Les montants (42 €, plafonds et récompenses) sont
des hypothèses de test, jamais les prix ou politiques du magasin.
scenarios.json contient J01–J18 avec déclencheur, source, version, objet, branches,
métrique et résultat attendu. Le simulateur ajoute arrêt, réentrée et limites d'effet.

```sh
node scripts/marketing-workbench.mjs demo
node scripts/marketing-workbench.mjs prepare marketing/assistant-local/recette-v2/prepare.json --now 2026-10-02T10:00:00Z
node scripts/marketing-workbench.mjs review marketing/assistant-local/recette-v2/review.json --now 2026-10-02T10:00:00Z
node scripts/marketing-workbench.mjs qr marketing/assistant-local/recette-v2/qr.json --now 2026-10-02T10:00:00Z
node scripts/marketing-workbench.mjs mandate marketing/assistant-local/recette-v2/mandate.json --now 2026-10-02T10:00:00Z
node scripts/marketing-workbench.mjs reconcile marketing/assistant-local/recette-v2/reconcile.json --now 2026-10-02T10:00:00Z
node scripts/marketing-workbench.mjs provider-test marketing/assistant-local/recette-v2/provider-test.json
node scripts/marketing-workbench.mjs suspend marketing/assistant-local/recette-v2/suspend.json --now 2026-10-02T10:00:00Z
node scripts/marketing-workbench.mjs report marketing/assistant-local/recette-v2/report.json --now 2026-10-02T10:00:00Z
node scripts/marketing-workbench.mjs loyalty marketing/assistant-local/recette-v2/loyalty.json
node scripts/marketing-workbench.mjs forecast marketing/assistant-local/recette-v2/forecast.json
node scripts/marketing-workbench.mjs skill-index marketing/assistant-local/recette-v2/skill-index.json
node scripts/marketing-workbench.mjs delivery-audit marketing/assistant-local/recette-v2/delivery-audit.json --now 2026-10-02T10:00:00Z
```

Résultats utiles attendus :
- segment : une inclusion, un historique inconnu, une opposition, avec raisons séparées.
- J01/J02 : seule précision utile, aucune compatibilité ou disponibilité inventée.
- J04 : proposition de relance, puis arrêt si réponse/devis accepté/expiration/remplacement.
- J05/J06 : stock fournisseur distinct du magasin ; réservation officielle requise.
- J07 : réception et confirmation, jamais formulaire visible assimilé à inscription.
- J08/J09/J14 : newsletter/deux posts et sources ; aucun contenu déclaré publié.
- J12/J13 : cas sensible à l'humain et invitation neutre, indépendamment de satisfaction.
- J15 : état horaire calculé depuis la source, pas une mutation du site ou Google.
- J16 : brief QR exact vers le site, sans image ou collecte fictive.
- J17 : budget candidat de 20 €, dépense réelle 0 €.
- J18 : une demande, un devis, une vente fictive de 42 €, coûts/marge inconnus.
- loyalty : doublon identique déduit, 80 € nets observés, proposition fictive de 5 €,
  aucun avantage émis ; seuil et récompense sont des hypothèses de recette.
- forecast : moyenne observée 10, plage 8–12 ; maximum supérieur à la capacité
  fictive 11. Aucune prévision probabiliste ou planification déclenchée.
- mandate : scopeMatches=true et permissionVerified=false.
- delivery-audit : preconditionsMet=true, stop=false sur cette observation fictive
  à l'heure indiquée. observationVerified=false, queriedDns=false et inboxGuaranteed=false.
  Compteurs manquants/périmés sans incident déclaré : stop=null et code 1 ; un incident
  entier positif déclaré conserve stop=true même si les autres données manquent.
- skill-index : valid=true, complete=true, missingSkills=[] ; referencesVerified=false
  et implicitRoutingVerified=false. Les chemins /fixtures/ape sont fictifs : aucun
  fichier n'est lu par ce contrôle. Une inspection partielle valide reste de code 0
  avec complete=false et la liste explicite des skills absents.
- reconcile : accepted simulé, pas un email remis.
- provider-test : reconcile-required malgré outcome=accepted ; l'envoi fictif déjà
  incertain est reconnu après normalisation de la clé. Aucun nouvel envoi ni retry.
- suspend : pending→cancelled simulé ; accepted reste accepted, rappel non garanti.

Pour l'offre expirée/prix manquant, conserver aussi le pilote V1 et ses tests.
Une reproduction à la date réelle hors période doit bloquer, pas prolonger les preuves.


Rendu enregistré depuis render.json : [newsletter HTML](newsletter.html),
[version texte](newsletter.txt). Commande sans écriture :
`node scripts/marketing-workbench.mjs render marketing/assistant-local/recette-v2/render.json --now 2026-10-02T10:00:00Z`.
