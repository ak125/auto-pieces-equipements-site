# Couverture V2 — 72 exigences, dimensions séparées

La [matrice JSON](MATRICE-V2.json) porte **chaque C/P/J** avec les champs demandés :
besoin, valeur, source, propriétaire, réemploi, ajout, préconditions, skill, outil,
preuve, priorité, dépendances, blocage et huit dimensions de maturité.
Ce fichier en est une vue de lecture, pas un deuxième suivi.
Les repères viennent du mandat utilisateur, pas de la gouvernance officielle du dépôt.

**Candidat local testé sur fixtures ≠ connexion ≠ activation.** Aucun pourcentage de
maturité n'est calculé. A1 est autorisé par le mandat ; A2 n'est pas établi.
Les sous-fonctions avancées non implémentées restent explicitement dans blocage_exact.
D1–D7 sont définis dans [la demande d'activation](ACTIVATION-V2.md).
La couverture d'une ligne signifie une partie locale utile, pas toutes ses capacités réelles.

| ID | Besoin | Commande locale | Dépendances réelles |
|---|---|---|---|
| C01 | Stratégie commerciale et plan de croissance | `prepare` | D1 |
| C02 | Veille marché et opportunités | `compare` | D1 |
| C03 | Acquisition et inscription | `journey` | D1, D2 |
| C04 | Identités et qualité des données | `import` | D1 |
| C05 | Préférences et éligibilité | `segment` | D1, D2 |
| C06 | Profil et relations métier | `segment` | D1 |
| C07 | Segmentation avancée | `segment` | D1 |
| C08 | Scoring et cycle de vie | `score` | D1, D5 |
| C09 | Suivi commercial et conversation | `qualify` | D1, D2 |
| C10 | Parcours événementiels | `journey` | D1, D4 |
| C11 | Arbitrage des sollicitations | `arbitrate` | D1, D3, D4 |
| C12 | Studio éditorial | `prepare` | D1, D6 |
| C13 | Rendu email et accessibilité | `render` | D2 |
| C14 | Offres recommandations et catalogues | `prepare` | D1 |
| C15 | Email SMS WhatsApp notifications | `channel` | D2, D3 |
| C16 | Réseaux sociaux et multiformat | `prepare` | D2, D6 |
| C17 | Délivrabilité et hygiène | `delivery-audit` | D2 |
| C18 | Voix client satisfaction avis | `review` | D1, D2 |
| C19 | Fidélité parrainage ambassadeurs | `loyalty` | D1, D3 |
| C20 | SEO contenu utile conversion | `prepare` | D5 |
| C21 | Publicité acquisition payante | `paid` | D2, D3, D5 |
| C22 | Instrumentation attribution | `report` | D1, D5 |
| C23 | Économie cohortes | `report` | D1, D5 |
| C24 | Expérimentation | `experiment` | D5 |
| C25 | Prévisions saisonnalité | `forecast` | D1, D5 |
| C26 | Reporting alertes utiles | `report` | D5 |
| C27 | Planification économique | `plan-job` | D3, D4, D7 |
| C28 | Robustesse connecteurs | `provider-test` | D2, D4 |
| C29 | Données privées sécurité | `privacy` | D1, D3 |
| C30 | Qualité des skills | `skill-index` | D7 |
| P01 | Fiche commerciale faisant autorité | `business-facts` | D1 |
| P02 | Publics locaux et besoins | `prepare` | D1 |
| P03 | Qualification de demandes de pièces | `qualify` | D1, D2 |
| P04 | Réponse commerciale multicanale | `journey` | D1, D2, D4 |
| P05 | Devis et propositions | `quote` | D1 |
| P06 | Relance de devis | `journey` | D1, D4 |
| P07 | Référence et disponibilité | `journey` | D1, D2 |
| P08 | Réservation et retrait | `journey` | D1, D4 |
| P09 | Passage au magasin | `journey` | D5 |
| P10 | Newsletter thématique | `journey` | D1, D2 |
| P11 | Offres saisonnières | `prepare` | D1 |
| P12 | Fidélisation et réactivation | `journey` | D1, D5 |
| P13 | Clientèle professionnelle | `journey` | D1, D2 |
| P14 | Google Business audit opérationnel | `business-facts` | D2 |
| P15 | Posts Google calendrier | `journey` | D2, D6 |
| P16 | Avis lecture réponse modification | `review` | D2 |
| P17 | Invitations neutres aux avis | `invite` | D1, D2 |
| P18 | Photos vidéos preuves locales | `prepare` | D6 |
| P19 | Réseaux sociaux conversationnels | `prepare` | D2, D4 |
| P20 | SEO citations partenariats | `business-facts` | D5 |
| P21 | Supports magasin QR | `qr` | D6 |
| P22 | Acquisition payante locale | `paid` | D2, D3, D5 |
| P23 | Mesure hors ligne devis ventes | `report` | D1, D5 |
| P24 | Calendrier service continuité | `journey` | D1, D4 |
| J01 | Demande de pièce | `journey` | D1, D2, D3, D4 |
| J02 | Information véhicule manquante | `journey` | D1, D2, D3, D4 |
| J03 | Devis préparé | `journey` | D1, D2, D3, D4 |
| J04 | Devis sans réponse | `journey` | D1, D2, D3, D4 |
| J05 | Disponibilité demandée | `journey` | D1, D2, D3, D4 |
| J06 | Réservation officielle | `journey` | D1, D2, D3, D4 |
| J07 | Inscription magasin | `journey` | D1, D2, D3, D4 |
| J08 | Newsletter thématique | `journey` | D1, D2, D3, D4 |
| J09 | Campagne saisonnière | `journey` | D1, D2, D3, D4 |
| J10 | Réactivation locale | `journey` | D1, D2, D3, D4 |
| J11 | Garage prospect | `journey` | D1, D2, D3, D4 |
| J12 | Nouvel avis | `journey` | D1, D2, D3, D4 |
| J13 | Invitation aux avis | `journey` | D1, D2, D3, D4 |
| J14 | Post d’offre | `journey` | D1, D2, D3, D4 |
| J15 | Horaires exceptionnels | `journey` | D1, D2, D3, D4 |
| J16 | Support magasin QR | `journey` | D1, D2, D3, D4, D6 |
| J17 | Acquisition payante locale | `journey` | D1, D2, D3, D4 |
| J18 | Bilan commercial local | `journey` | D1, D2, D3, D4 |

Les commandes complètes sont dans le JSON et [CONTRAT-V2](CONTRAT-V2.md).
La recette initiale est dans [VALIDATION-V2](VALIDATION-V2.md). La validation locale
actuelle et ses limites sont dans [FIABILITE-DELIVRABILITE-V2](FIABILITE-DELIVRABILITE-V2.md) :
314 tests verts au second passage standard de ce lot, dont 167 marketing.
Premier passage : 313/314, délai de démarrage serveur dépassé ; suite isolée 4/4, sans modification.
Le délai de démarrage serveur rencontré au lot précédent reste documenté dans
[FIABILITE-EVENEMENTS-V2](FIABILITE-EVENEMENTS-V2.md), sans cause établie.
Les dimensions connexion, autorisation réelle
et activation restent distinctes de ces résultats.

Préparation historique : [INTEGRATION-V2](INTEGRATION-V2.md). Après stabilisation, npm test 314/314 au premier passage, concurrence native 2 et typage marketing intégré. Les résultats ci-dessus restent historiques.

État courant : [POST-INTEGRATION-V2](POST-INTEGRATION-V2.md), PR #33 intégrée et CI du
commit fusionné verte. La [recette d'agent suivante](RECETTE-POST-INTEGRATION-V2.md)
observe six commandes sur des fixtures ; elle ne vérifie pas toutes les capacités de
chaque ligne C/P/J. Les périmètres de runtime distinguent cet échantillon de la
validation complète, qui reste non vérifiée. La [recette Hermes](EXECUTION-HERMES-V2.md)
ajoute une découverte native, quatre chargements et des observations sur fixtures ;
les périmètres des lignes concernées les précisent sans généralisation. L'activation
marketing reste absente.
