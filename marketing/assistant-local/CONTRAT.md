# Contrat des dossiers documentaires — version 1.0.0

Le [JSON du pilote](pilote/newsletter.json) est le gabarit exécutable. Il est entièrement
synthétique. Aucune adresse de destinataire, nom de client, plaque réelle, export de devis
ou avis privé ne doit être entré dans le dépôt. Le CLI lit et produit seulement une revue
avec codes, jamais le corps reçu ; ne pas rediriger des données réelles ici.

| Champ | Contrat |
|---|---|
| project / environment | `ak125/auto-pieces-equipements-site` / `simulation` |
| runId / skill | Identifiant local, nom ape- et version 1.0.0 ; pas un registre central |
| objective / channel / destination | Objectif, support précis, aucune audience par défaut |
| sources | Référence et date de vérification ; source commerciale relue par un humain |
| content | Version, objet pour newsletter, texte, libellé CTA et lien exact connu |
| facts | Chaque fait renvoie à une source datée du dossier |
| offer | null pour information seule ; sinon fictional/real, produits, prix TTC, conditions, dates Paris, preuve ; compatibilité unverified |
| audience | `{"mode":"none","count":0}` ; tout adressage est bloqué par l'outil actuel |
| privacy | synthetic ou public-business-only, containsPersonalData false ; déclaration insuffisante sans relecture |
| review | Pour un avis : identifiant, date, version, texte synthétique/anonymisé autorisé, réponse existante ou null, indicateur sensible |
| unknowns / risks | Inconnues explicites, risques, même si la conclusion est « aucun autre risque identifié après revue » |
| validationRequired / actionsNotPerformed | Validation humaine nécessaire et opérations non réalisées |
| approval | null ; trace documentaire optionnelle avec fingerprint et référence humaine, jamais une permission d'exécution |

Les sorties ont `draftReady` (contrôles automatiques satisfaits), `canExecute:false`,
et des `issues` classées blocker/review. `draftReady:true` ne signifie ni approbation
ni exhaustivité de vérification. Un prix absent bloque l'offre, pas la possibilité de rédiger
un contenu informatif sans prix avec `offer:null`. Aucun hash ne prouve les faits ni l'accord.

## Commandes

Depuis la racine du worktree, avec les versions du README :
```sh
node scripts/marketing-local.mjs marketing/assistant-local/pilote/newsletter.json
node scripts/render-marketing-pilot.mjs
node --test tests/marketing-local.test.mjs
node node_modules/typescript/bin/tsc -p tsconfig.marketing.json
npm test
```

Le CLI emploie la date courante ; le pilote finira donc par signaler EXPIRED, volontairement.
Les tests utilisent une horloge figée au 2 octobre 2026 pour être reproductibles.
Aucune option d'envoi, clé, HTTP, cron ou connecteur n'existe.

Le rendu HTML/texte est disponible par `renderNewsletter(dossier, context)`. Liens
chargés par `loadAllowedLinks()` depuis les href et pages publics ; ce contrôle démontre
une concordance documentaire, pas une disponibilité HTTP externe ni une réception.
Aucun lien fourni par un avis n'est ajouté à cette liste.

## Revues qui restent humaines

Le validateur contrôle structure, périmètre, dates, liens et signaux simples de confidentialité,
compatibilité et sensibilité. Il ne certifie pas une allégation libre, un stock, une validation
commerciale, une anonymisation ou une base juridique. Les variantes de langage et les données
indirectement identifiantes peuvent lui échapper. Toujours relire texte ET HTML/texte final.

Pour audience réelle, source/finalité, permission applicable, preuve, fraîcheur et oppositions
doivent être vérifiables dans le système autorisé, sans copie ici. Achat, devis ou WhatsApp ne
valent pas un abonnement général. À défaut, livrer le brouillon sans adressage.

Pour les performances : noter période et fuseau, source et fraîcheur, numérateur/dénominateur,
couverture comparable ; missing ≠ zéro. Aucun chiffre pilote ne doit être pris pour une vente.
