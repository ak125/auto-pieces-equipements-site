# Contexte métier commun — APE, version 1.0.0

Source canonique des quatre skills ; relire avant chaque dossier. Périmètre exclusif :
`ak125/auto-pieces-equipements-site`, Auto Pièces Équipements, magasin des
Pavillons-sous-Bois. AutoMecanik, Alliance Delivery et tout autre stock ou clientèle sont exclus.

## Faits et sources

| Information | Source du dépôt | Utilisation |
|---|---|---|
| Nom, adresse : Auto Pièces Équipements, 184 Avenue Aristide Briand, 93320 Les Pavillons-sous-Bois | `index.html`, `mentions-legales.html`, plan GBP | Faits publics concordants au candidat du 2 octobre |
| Téléphone 01 48 47 96 27 ; contact@auto-pieces-equipements.fr | mêmes pages, plan GBP | Destination publique ; réception et délivrabilité non testées |
| Horaires | `data/store-hours.json`, README | Charger à chaque run ; Europe/Paris avec exceptions et heure d'été/hiver |
| Pièces neuves et consommables ; familles de pièces | `scripts/catalog-content.mjs`, plan GBP du 29 septembre | Famille documentée, aucune preuve de référence en stock |
| WhatsApp | attributs href du site public | Lien de conversation seulement, aucune Business Platform établie |
| Catégorie Google, services, accès comptes | [plan GBP](../google-business/plan-optimisation.md) et audits existants | État historique à recontrôler avant toute intervention autorisée |

Ne pas recopier des horaires figés dans un nouveau référentiel. Appeler
`loadStoreHours()` puis `openingAt(hours, instant)` pour un instant explicite.
Les exceptions remplacent la journée entière ; aucune fermeture ne doit être inventée.
L'expiration d'une offre à date seule intervient après 23 h 59 à Paris.

## Divergences à arbitrer

Le site/candidat contient encore « dans la journée selon référence » et une question
WhatsApp sur ce délai. Les documents locaux du 29 septembre et du 1 octobre dans
le checkout initial retirent cette promesse des posts Google. **Ne pas la reprendre**.
Aucun changement public dans ce lot. Employer « prix et délai à confirmer avant commande ».

Le README GBP de la base suggère de laisser un prix vide ; le diagnostic Merchant Center
local plus récent exige une référence réelle, un prix TTC et un stock. Ces deux situations
ne se confondent pas : un brouillon documentaire peut rester incomplet, une offre commerciale
chiffrée ou une fiche produit prête à soumettre doit être validée. Les brouillons de ce lot
ne réutilisent aucun ancien tarif. Pas de marque, garantie, âge de l'entreprise, montage,
livraison ou compatibilité promis sans preuve adaptée.

Les dix corrections GBP du 1 octobre étaient « En attente » dans le rapport local.
Cette mission ne confirme pas leur état courant et ne doit pas les recréer.

## Travail et droits

Hermes réalise briefs, contenus, variantes, revue, analyse et petits ajustements locaux
dans son mandat effectif. Codex traite les intégrations et changements plus conséquents.
Un seul propriétaire d'écriture par lot. Les skills ne confèrent aucune permission système.
Aucun secret d'envoi/publication, aucun import client et aucune nouvelle plateforme.

Git peut être public, même hors `dist/`. Seuls gabarits, scripts, schémas et données entièrement
synthétiques y restent. Un vrai dossier nécessite un espace privé préalablement autorisé,
hors Git et hors publication ; ici aucun n'a été établi. Les signaux de confidentialité du
validateur ne détectent pas toutes les données personnelles, noms ou identifiants indirects.

## Sources réutilisées et ton

Lire seulement la partie utile des [posts](../google-business/posts-4-semaines.md),
du [plan et de sa procédure d'avis](../google-business/plan-optimisation.md),
des [fiches produits](../google-business/fiches-produits.md) et des
[provenances d'images](../google-business/images/SOURCES.md).
Les anciennes phrases demandant une carte grise complète sont dépassées par la minimisation
du candidat : référence connue, modèle/année/motorisation ; plaque seulement si nécessaire.

Ton direct, courtois, local, sans urgence artificielle, diagnostic définitif ou référencement
garanti. Illustration de famille ≠ photo de stock ; photos de magasin réelles uniquement.
Une invitation à un avis concerne une expérience réelle, reste neutre et n'offre aucun avantage.
Pas de filtrage des seuls clients satisfaits, faux avis, récompense, pression ou suppression négociée.

## Dossier et revue

Utiliser le [contrat](CONTRAT.md), puis le [pilote fictif](pilote/README.md).
La relecture comprend faits, liens, vie privée, dates Paris, ton et actualité.
Les états sont **brouillon → revue → approbation ciblée → publication** ; aucun outil de
ce lot n'atteint les deux derniers. Une trace d'approbation vient d'un humain identifiable,
cible contenu/version, destination/compte, période, audience, limites et effets précis.
Hash, mot « approuvé » ou option CLI ne vaut jamais autorisation. Toute modification
substantielle d'offre, d'audience, de destination ou de texte invalide la trace antérieure.
