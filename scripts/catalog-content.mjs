/**
 * @typedef {object} CatalogProduct
 * @property {string} title
 * @property {string} description
 * @property {string[]} bullets
 * @property {string} [image]
 * @property {string} [link]
 * @property {string} [price]
 *
 * @typedef {object} CatalogPage
 * @property {string} slug
 * @property {string} navLabel
 * @property {string} eyebrow
 * @property {string} title
 * @property {string} metaDescription
 * @property {string} h1
 * @property {string} intro
 * @property {string} image
 * @property {string} imageAlt
 * @property {string} sectionTitle
 * @property {string} sectionIntro
 * @property {CatalogProduct[]} products
 * @property {string} guideTitle
 * @property {string} guideIntro
 * @property {string[]} guideItems
 * @property {{question: string, answer: string}[]} faq
 * @property {{title: string, intro: string, items: string[]}} [purchaseGuide]
 */

/** @type {CatalogPage[]} */
export const catalogPages = [
  {
    slug: 'pieces-auto-les-pavillons-sous-bois.html',
    navLabel: 'Toutes les pièces',
    eyebrow: 'Magasin de pièces auto · 93',
    title: 'Pièces auto aux Pavillons-sous-Bois (93) — Auto Pièces Équipements',
    metaDescription: 'Large choix de pièces auto aux Pavillons-sous-Bois : batteries, freinage, filtration, distribution et autres familles. Disponibilité dans la journée selon référence.',
    h1: 'Pièces auto aux Pavillons-sous-Bois',
    intro: 'Batteries, freinage, filtration, distribution, alternateurs, démarreurs, suspension, embrayage et entretien : un large choix de pièces disponibles dans la journée selon la référence. Envoyez votre plaque ou votre ancienne référence pour confirmer prix et délai. Retrait au magasin et livraison aux garages.',
    image: '/assets/images/products/freinage.webp',
    imageAlt: 'Disque et plaquettes de frein automobiles neufs',
    sectionTitle: 'Les familles de pièces recherchées au comptoir',
    sectionIntro: 'Chaque véhicule peut avoir plusieurs montages. Les pages ci-dessous expliquent les familles disponibles et les informations nécessaires pour identifier la bonne référence.',
    purchaseGuide: {
      title: 'Trouver votre pièce par téléphone',
      intro: 'Vous ne connaissez pas le nom exact de la pièce ou vous hésitez entre plusieurs références ? Préparez les informations du véhicule pour commencer la recherche avec le magasin.',
      items: ['Gardez votre plaque ou votre carte grise à portée de main, ainsi que le devis de votre garage si vous en avez un.', 'Précisez la pièce recherchée, la quantité et, selon le besoin, le côté ou l’essieu concernés.', 'Faites confirmer la référence, le prix et le délai avant de venir au 184 Avenue Aristide Briand aux Pavillons-sous-Bois.']
    },
    products: [
      { title: 'Batteries', description: 'Standard ou Start & Stop selon la technologie prévue par le véhicule.', image: '/assets/images/products/batterie-auto.webp', link: '/batterie-voiture-les-pavillons-sous-bois.html', bullets: ['Capacité et puissance adaptées', 'Dimensions et polarité vérifiées'] },
      { title: 'Freinage', description: 'Plaquettes, disques, tambours, mâchoires et capteurs selon le montage.', image: '/assets/images/products/freinage.webp', link: '/plaquettes-disques-frein-les-pavillons-sous-bois.html', bullets: ['Montage avant ou arrière', 'Dimensions contrôlées'] },
      { title: 'Filtres & vidange', description: 'Filtres à huile, air, habitacle et carburant avec huile aux normes adaptées.', image: '/assets/images/products/filtration.webp', link: '/filtres-vidange-les-pavillons-sous-bois.html', bullets: ['Référence du filtre', 'Viscosité et norme constructeur'] },
      { title: 'Distribution', description: 'Kits courroie, galets et pompe à eau selon le moteur et la composition vérifiée.', image: '/assets/images/products/distribution.webp', link: '/kit-distribution-les-pavillons-sous-bois.html', bullets: ['Identification par plaque', 'Contenu, prix et délai confirmés'] },
      { title: 'Alternateur & démarreur', description: 'Pièces de charge et de démarrage identifiées selon la motorisation.', image: '/assets/images/products/alternateur.webp', link: '/alternateur-demarreur-les-pavillons-sous-bois.html', bullets: ['Fixation et connectique', 'Puissance et poulie'] },
      { title: 'Suspension', description: 'Amortisseurs, triangles, rotules et biellettes pour la liaison au sol.', image: '/assets/images/products/suspension.webp', link: '/suspension-amortisseurs-les-pavillons-sous-bois.html', bullets: ['Côté et essieu concernés', 'Montage précis du véhicule'] },
      { title: 'Embrayage', description: 'Kits embrayage et composants adaptés au moteur et à la boîte de vitesses.', image: '/assets/images/products/embrayage.webp', link: '/embrayage-voiture-les-pavillons-sous-bois.html', bullets: ['Disque, mécanisme et butée', 'Référence confirmée avant commande'] },
      { title: 'Huiles & entretien', description: 'Huiles, liquides, essuie-glaces et ampoules pour l’entretien courant.', image: '/assets/images/products/entretien-auto.webp', link: '/huile-moteur-entretien-les-pavillons-sous-bois.html', bullets: ['Normes et viscosités', 'Conseil au comptoir'] }
    ],
    guideTitle: 'Comment préparer votre demande de pièce ?',
    guideIntro: 'Plus les informations sont précises, plus la recherche de référence est rapide et fiable.',
    guideItems: [
      'Plaque d’immatriculation ou carte grise du véhicule.',
      'Motorisation, année et, si possible, numéro de série.',
      'Photo, dimensions ou référence lisible de l’ancienne pièce.',
      'Côté concerné : avant/arrière et gauche/droite lorsque nécessaire.'
    ],
    faq: [
      { question: 'Comment être sûr de commander la bonne pièce ?', answer: 'Envoyez la plaque d’immatriculation, la carte grise ou la référence de l’ancienne pièce. Nous vérifions le montage et la compatibilité avant de confirmer la commande.' },
      { question: 'Le magasin fournit-il les garages et revendeurs ?', answer: 'Oui. Auto Pièces Équipements fournit également les professionnels de l’automobile en Seine-Saint-Denis. Les conditions et disponibilités sont confirmées directement avec le magasin.' },
      { question: 'Peut-on retirer une pièce au magasin ?', answer: 'Oui. Le retrait s’effectue au 184 Avenue Aristide Briand aux Pavillons-sous-Bois après confirmation de la référence et de la disponibilité.' },
      { question: 'La livraison locale est-elle possible ?', answer: 'Oui, nous livrons les garages du secteur. Indiquez les références, les quantités, la commune et le délai souhaité : nous confirmons disponibilité, frais et créneau. Le retrait au magasin est également possible.' },
      { question: 'Avez-vous des kits de distribution et d’autres pièces ?', answer: 'Oui, notre gamme comprend aussi les kits de distribution et d’autres familles au-delà des guides présentés. Envoyez les informations du véhicule ou la référence recherchée pour confirmer la composition, le prix et la disponibilité.' },
      { question: 'Pouvez-vous m’orienter pour le montage ?', answer: 'Oui, nous pouvons vous orienter vers un professionnel pour le montage de votre pièce. Précisez ce besoin lors de votre demande.' }
    ]
  },
  {
    slug: 'kit-distribution-les-pavillons-sous-bois.html',
    navLabel: 'Distribution',
    eyebrow: 'Distribution · Devis par plaque',
    title: 'Kit distribution aux Pavillons-sous-Bois (93) — Auto Pièces Équipements',
    metaDescription: 'Kit distribution aux Pavillons-sous-Bois : courroie, galets et pompe à eau selon moteur. Devis par plaque, disponibilité selon référence et livraison aux garages.',
    h1: 'Kit de distribution aux Pavillons-sous-Bois',
    intro: 'Préparez votre demande de kit de distribution avec votre plaque d’immatriculation. Nous recherchons la référence adaptée au moteur et confirmons le contenu du kit, le prix et la disponibilité dans la journée selon la référence. Retrait au magasin et livraison aux garages selon les conditions convenues.',
    image: '/assets/images/products/distribution.webp',
    imageAlt: 'Illustration d’un kit de distribution avec courroie crantée, galets et pompe à eau, sans référence de marque',
    sectionTitle: 'Un kit adapté à votre moteur',
    sectionIntro: 'Le visuel illustre cette famille de pièces : le contenu exact du kit proposé dépend de votre véhicule. La présence de la pompe à eau et des accessoires est confirmée dans le devis.',
    purchaseGuide: {
      title: 'Confirmer votre kit avant le rendez-vous au garage',
      intro: 'Faites valider la composition demandée par votre professionnel, puis appelez le magasin pour organiser l’achat et le retrait.',
      items: ['Préparez la plaque et la référence ou la liste de pièces demandée par votre garage.', 'Faites préciser les éléments inclus : courroie, galets, pompe à eau et éventuels accessoires selon le kit.', 'Confirmez le prix et la date de retrait avant de fixer l’intervention. Indiquez si vous avez besoin d’être orienté vers un professionnel.']
    },
    products: [
      { title: 'Courroie et galets', description: 'Nous recherchons la courroie et les galets correspondant au montage du moteur.', bullets: ['Référence et composition vérifiées', 'Motorisation et date de fabrication utiles'] },
      { title: 'Pompe à eau', description: 'Une pompe à eau peut faire partie du kit selon la référence. Nous précisons si elle est incluse dans la proposition.', bullets: ['Contenu du kit confirmé', 'Besoin à valider avec le professionnel chargé du montage'] },
      { title: 'Retrait et livraison garages', description: 'Faites confirmer la référence et le délai avant votre déplacement ou votre intervention.', bullets: ['Disponibilité dans la journée selon référence', 'Zone, frais et créneau de livraison convenus'] }
    ],
    guideTitle: 'Les informations utiles pour votre devis',
    guideIntro: 'La plaque permet de commencer la recherche. Des précisions complémentaires peuvent être nécessaires pour départager plusieurs montages.',
    guideItems: ['Plaque d’immatriculation du véhicule.', 'Modèle, année et motorisation si vous les connaissez.', 'Référence du kit demandé par votre garage ou code moteur, si disponible.', 'Besoin d’une pompe à eau, quantité et date souhaitée.', 'Pour une livraison garage : commune et créneau de besoin.'],
    faq: [
      { question: 'Quel est le prix d’un kit de distribution ?', answer: 'Le prix dépend de la référence et du contenu : courroie, galets, pompe à eau ou accessoires selon le montage. Envoyez votre plaque et votre besoin pour recevoir une proposition précise avant commande.' },
      { question: 'La pompe à eau est-elle toujours incluse ?', answer: 'Non, la composition varie selon la référence du kit. Nous confirmons les éléments inclus dans votre devis ; faites valider le besoin complet par le professionnel chargé du montage.' },
      { question: 'La pièce peut-elle être disponible dans la journée ?', answer: 'Oui, selon la référence et sa disponibilité. Contactez-nous avant de vous déplacer : nous vous confirmons le délai de retrait ou les conditions de livraison aux garages.' },
      { question: 'Et si mon moteur utilise une chaîne de distribution ?', answer: 'Précisez-le dans votre demande ou envoyez votre plaque pour identifier le montage. Un kit courroie ne doit pas être commandé pour un moteur à chaîne ; la référence et la disponibilité sont vérifiées avant toute proposition.' },
      { question: 'Pouvez-vous m’orienter pour le montage ?', answer: 'Oui, nous pouvons vous orienter vers un professionnel. Indiquez ce besoin lors de la demande de devis afin de préparer les pièces adaptées à l’intervention.' }
    ]
  },
  {
    slug: 'batterie-voiture-les-pavillons-sous-bois.html',
    navLabel: 'Batteries',
    eyebrow: 'Batteries auto · Vérification par plaque',
    title: 'Batterie voiture aux Pavillons-sous-Bois (93) — Auto Pièces Équipements',
    metaDescription: 'Batterie voiture aux Pavillons-sous-Bois : standard REBORN dès 59 €, Start & Stop EFB dès 159 €. Garantie 1 an, reprise 5 €, compatibilité vérifiée.',
    h1: 'Batterie voiture aux Pavillons-sous-Bois',
    intro: 'Achetez votre batterie voiture au magasin Auto Pièces Équipements, au 184 Avenue Aristide Briand aux Pavillons-sous-Bois. Batteries standard REBORN ou Start & Stop EFB : appelez avec votre plaque pour faire vérifier la compatibilité, le prix et la disponibilité avant de venir.',
    image: '/assets/images/products/batterie-auto.webp',
    imageAlt: 'Batterie automobile 12 volts neuve sans marque',
    sectionTitle: 'Deux familles de batteries proposées',
    sectionIntro: 'Les tarifs ci-dessous correspondent aux offres déjà publiées par le magasin. Le prix et la disponibilité exacts dépendent de la référence adaptée au véhicule. Le visuel illustre la famille de produits ; il ne représente pas une référence précise du stock.',
    purchaseGuide: {
      title: 'Votre batterie à retirer au magasin',
      intro: 'Avant de vous déplacer depuis Les Pavillons-sous-Bois, Bondy ou Livry-Gargan, faites confirmer la batterie adaptée et son délai de retrait.',
      items: ['Préparez votre plaque et, si possible, la référence lisible de la batterie actuelle.', 'Précisez si votre véhicule dispose du Start & Stop : la technologie doit être vérifiée avec les autres caractéristiques.', 'Demandez le prix de la référence retenue et les conditions de reprise de votre ancienne batterie.']
    },
    products: [
      { title: 'Batterie standard REBORN', description: 'Pour véhicules sans système Start & Stop.', price: 'Dès 59 €', bullets: ['Exemple à partir de 50 Ah', 'Garantie 1 an', 'Reprise de l’ancienne batterie : 5 €'] },
      { title: 'Batterie Start & Stop EFB', description: 'Technologie EFB pour véhicules équipés du Start & Stop.', price: 'Dès 159 €', bullets: ['Exemple à partir de 70 Ah', 'Garantie 1 an', 'Reprise de l’ancienne batterie : 5 €'] },
      { title: 'Référence vérifiée', description: 'La capacité seule ne suffit pas pour choisir une batterie.', bullets: ['Dimensions et sens des bornes', 'Puissance de démarrage', 'Technologie prévue par le constructeur'] }
    ],
    guideTitle: 'Signes possibles d’une batterie fatiguée',
    guideIntro: 'Ces signes orientent le diagnostic, mais une mesure de tension ou un contrôle professionnel reste utile avant remplacement.',
    guideItems: ['Démarrage plus lent, surtout à froid.', 'Éclairage ou accessoires électriques qui faiblissent au démarrage.', 'Voyant batterie ou message lié à l’alimentation électrique.', 'Batterie ancienne ou déchargements répétés.'],
    faq: [
      { question: 'Quelle batterie choisir pour ma voiture ?', answer: 'Transmettez la plaque, la carte grise ou une photo nette de l’ancienne batterie. Nous contrôlons la capacité, la puissance, les dimensions, la polarité et la technologie adaptée.' },
      { question: 'Avez-vous des batteries Start & Stop ?', answer: 'Oui, une offre EFB est publiée pour les véhicules équipés du Start & Stop. La compatibilité doit être confirmée avant achat.' },
      { question: 'Combien coûte une batterie ?', answer: 'L’offre publiée démarre à 59 € pour une batterie standard et à 159 € pour une batterie EFB Start & Stop. Le tarif exact varie selon la référence du véhicule.' },
      { question: 'Quelle est la garantie ?', answer: 'Les batteries présentées par le magasin sont annoncées avec une garantie d’un an. Conservez votre justificatif d’achat.' },
      { question: 'Reprenez-vous l’ancienne batterie ?', answer: 'Oui, le magasin annonce une reprise de l’ancienne batterie à 5 €. Confirmez les conditions avec l’équipe lors de votre demande.' },
      { question: 'Puis-je acheter ma batterie et la retirer dans la journée ?', answer: 'La disponibilité dans la journée dépend de la référence. Appelez le 01 48 47 96 27 avec les informations du véhicule : le magasin confirme la compatibilité, le prix et le délai avant votre déplacement au 184 Avenue Aristide Briand.' },
      { question: 'Le montage de la batterie est-il effectué au magasin ?', answer: 'Le magasin fournit la batterie et peut vous orienter vers un professionnel pour le montage. Indiquez ce besoin lors de votre demande ; la pose sur place n’est pas un service annoncé.' }
    ]
  },
  {
    slug: 'plaquettes-disques-frein-les-pavillons-sous-bois.html',
    navLabel: 'Freinage',
    eyebrow: 'Freinage automobile · Toutes marques',
    title: 'Plaquettes et disques de frein aux Pavillons-sous-Bois (93)',
    metaDescription: 'Achetez vos plaquettes et disques de frein aux Pavillons-sous-Bois. Référence vérifiée par plaque, prix et délai confirmés par téléphone avant retrait.',
    h1: 'Plaquettes et disques de frein aux Pavillons-sous-Bois',
    intro: 'Plaquettes, disques, mâchoires et tambours : Auto Pièces Équipements fournit vos pièces de freinage aux Pavillons-sous-Bois. Appelez avec votre plaque et l’essieu concerné pour connaître la référence, le prix et le délai de retrait au magasin.',
    image: '/assets/images/products/freinage.webp',
    imageAlt: 'Disque ventilé et plaquettes de frein neufs',
    sectionTitle: 'Les principales pièces de freinage',
    sectionIntro: 'La sélection dépend du véhicule, de l’essieu et du montage d’origine. Le magasin fournit la pièce ; le montage doit être confié à une personne compétente. Le visuel illustre la famille de pièces et ne permet pas d’identifier une référence compatible.',
    purchaseGuide: {
      title: 'Un devis pour vos plaquettes et disques',
      intro: 'Un même modèle de voiture peut recevoir plusieurs montages de freinage. Nous vérifions les pièces demandées avant de confirmer votre achat.',
      items: ['Indiquez votre plaque et précisez avant ou arrière.', 'Si vous avez un devis de garage, préparez les références et quantités demandées.', 'Faites confirmer le contenu de la proposition, le prix et la disponibilité avant de venir au magasin.']
    },
    products: [
      { title: 'Plaquettes de frein', description: 'Jeux avant ou arrière selon l’étrier et le montage du véhicule.', bullets: ['Forme et dimensions contrôlées', 'Témoin ou capteur selon équipement'] },
      { title: 'Disques de frein', description: 'Disques pleins ou ventilés selon la motorisation et l’essieu.', bullets: ['Diamètre et épaisseur', 'Hauteur et nombre de fixations'] },
      { title: 'Freinage arrière', description: 'Mâchoires, tambours, cylindres ou kits selon la configuration.', bullets: ['Montage à confirmer', 'Pièces associées recherchées ensemble'] }
    ],
    guideTitle: 'Quand contrôler le freinage ?',
    guideIntro: 'Un bruit ne suffit pas à identifier la pièce : une inspection du système est recommandée avant commande.',
    guideItems: ['Grincement ou bruit métallique au freinage.', 'Vibrations dans la pédale ou le volant.', 'Distance de freinage inhabituelle ou pédale différente.', 'Voyant d’usure ou message de freinage au tableau de bord.'],
    faq: [
      { question: 'Comment trouver les bonnes plaquettes ?', answer: 'La plaque ou la carte grise permet d’identifier le véhicule, mais plusieurs montages peuvent encore exister. Une photo ou les dimensions de la pièce peuvent compléter la recherche.' },
      { question: 'Faut-il changer les disques avec les plaquettes ?', answer: 'Cela dépend de l’usure et de l’épaisseur mesurée des disques. Demandez l’avis du professionnel qui inspecte ou monte le système de freinage.' },
      { question: 'Vendez-vous des kits avant et arrière ?', answer: 'Le magasin recherche les composants nécessaires pour l’essieu concerné. La disponibilité et le délai sont confirmés avant déplacement.' },
      { question: 'Pouvez-vous m’orienter pour le montage ?', answer: 'Oui, nous pouvons vous orienter vers un professionnel pour le montage de vos pièces de freinage. Précisez ce besoin lors de votre demande au magasin.' },
      { question: 'Quel est le prix des plaquettes et disques pour mon véhicule ?', answer: 'Le tarif dépend du montage, de l’essieu et des composants recherchés. Appelez le 01 48 47 96 27 avec votre plaque et les pièces demandées : nous confirmons les références, les quantités, le prix et le délai avant commande.' },
      { question: 'Où retirer mes pièces de freinage près de Bondy ou Livry-Gargan ?', answer: 'Le retrait se fait au magasin Auto Pièces Équipements, 184 Avenue Aristide Briand, 93320 Les Pavillons-sous-Bois, après confirmation de la disponibilité. Consultez les horaires et l’itinéraire avant de venir.' }
    ]
  },
  {
    slug: 'filtres-vidange-les-pavillons-sous-bois.html',
    navLabel: 'Filtres',
    eyebrow: 'Filtration & vidange · Entretien courant',
    title: 'Filtres auto et huile de vidange aux Pavillons-sous-Bois (93)',
    metaDescription: 'Filtres à huile, air, habitacle et carburant aux Pavillons-sous-Bois. Préparez votre vidange : huile et filtres adaptés, prix et retrait confirmés par téléphone.',
    h1: 'Filtres auto et huile de vidange aux Pavillons-sous-Bois',
    intro: 'Achetez les filtres et l’huile nécessaires à votre entretien chez Auto Pièces Équipements. Filtre à huile, à air, d’habitacle ou à carburant : préparez votre plaque pour faire vérifier les références et connaître le prix et la disponibilité au magasin.',
    image: '/assets/images/products/filtration.webp',
    imageAlt: 'Ensemble de filtres automobiles neufs',
    sectionTitle: 'Filtres recherchés pour votre véhicule',
    sectionIntro: 'Chaque filtre a une fonction différente. La périodicité de remplacement dépend du véhicule, de son usage et du plan d’entretien. Le visuel présente des exemples de filtres, pas les références exactes de votre véhicule.',
    purchaseGuide: {
      title: 'Préparez votre achat de filtres et d’huile',
      intro: 'Le magasin recherche les consommables pour votre véhicule. Vous pouvez préparer un ensemble filtre à huile et huile moteur, puis faire confirmer son contenu avant retrait.',
      items: ['Préparez votre plaque ou les références indiquées sur le devis de votre garage.', 'Précisez les filtres souhaités : huile, air, habitacle, essence ou gazole.', 'Pour l’huile, faites vérifier la norme constructeur et la quantité, en plus de la viscosité.', 'Appelez pour confirmer le prix de l’ensemble et le délai de retrait.']
    },
    products: [
      { title: 'Filtre à huile', description: 'Retient les impuretés présentes dans l’huile moteur.', bullets: ['Référence liée à la motorisation', 'Joint et montage adaptés'] },
      { title: 'Filtres à air & habitacle', description: 'Protègent le moteur et améliorent la qualité de l’air dans l’habitacle.', bullets: ['Dimensions précises', 'Version standard ou charbon selon référence'] },
      { title: 'Filtre à carburant', description: 'Filtration essence ou diesel selon la motorisation.', bullets: ['Connectique et forme contrôlées', 'Référence confirmée avant commande'] }
    ],
    guideTitle: 'Préparer une vidange sans erreur',
    guideIntro: 'Le carnet d’entretien et la préconisation constructeur restent les références pour la périodicité et l’huile.',
    guideItems: ['Identifier la viscosité et surtout la norme constructeur.', 'Prévoir la quantité d’huile adaptée au moteur.', 'Remplacer le filtre à huile avec la bonne référence.', 'Contrôler les autres filtres selon l’échéance d’entretien.'],
    faq: [
      { question: 'Quelle huile et quel filtre pour ma vidange ?', answer: 'Transmettez la plaque ou la carte grise. Nous recherchons la viscosité, la norme constructeur, la quantité et la référence du filtre compatibles.' },
      { question: 'Peut-on préparer un ensemble filtre et huile ?', answer: 'Oui, le magasin peut rechercher le filtre à huile et l’huile adaptée au même véhicule. Le contenu exact et la disponibilité sont confirmés avant retrait.' },
      { question: 'Avez-vous des filtres d’habitacle et à air ?', answer: 'Oui, ces familles sont proposées selon la référence du véhicule, ainsi que les filtres à carburant.' },
      { question: 'Quand faut-il remplacer les filtres ?', answer: 'La périodicité varie selon le constructeur, le kilométrage et l’usage. Consultez le carnet d’entretien ou demandez conseil à votre garage.' },
      { question: 'Faites-vous la vidange au magasin ?', answer: 'Cette page concerne la vente des filtres et de l’huile. Le magasin n’annonce pas de prestation de vidange sur place ; il peut vous orienter vers un professionnel pour l’intervention.' },
      { question: 'Comment connaître le prix et retirer mes filtres ?', answer: 'Appelez le 01 48 47 96 27 avec votre plaque et la liste des filtres souhaités. Une fois les références, le prix et la disponibilité confirmés, le retrait se fait au 184 Avenue Aristide Briand aux Pavillons-sous-Bois.' }
    ]
  },
  {
    slug: 'alternateur-demarreur-les-pavillons-sous-bois.html',
    navLabel: 'Démarrage',
    eyebrow: 'Démarrage & charge · Référence précise',
    title: 'Alternateur et démarreur aux Pavillons-sous-Bois (93)',
    metaDescription: 'Alternateur et démarreur aux Pavillons-sous-Bois. Appelez avec votre plaque : référence, prix et délai confirmés avant retrait au magasin.',
    h1: 'Alternateur et démarreur aux Pavillons-sous-Bois',
    intro: 'Auto Pièces Équipements fournit vos alternateurs et démarreurs aux Pavillons-sous-Bois. Appelez avec votre plaque et, si possible, la référence de l’ancienne pièce : nous vérifions le montage, le prix et le délai de retrait au magasin.',
    image: '/assets/images/products/alternateur.webp',
    imageAlt: 'Alternateur automobile neuf sans marque',
    sectionTitle: 'Charge électrique et démarrage moteur',
    sectionIntro: 'Un diagnostic est recommandé avant de remplacer une pièce : une batterie déchargée, un câble ou une masse peuvent provoquer des symptômes proches.',
    purchaseGuide: {
      title: 'Préparer votre achat d’alternateur ou de démarreur',
      intro: 'Deux pièces visuellement proches peuvent avoir une puissance, une fixation ou une connectique différente. Faites confirmer la référence avant votre déplacement.',
      items: ['Préparez votre plaque et la référence demandée par votre garage ou lisible sur l’ancienne pièce.', 'Précisez si vous recherchez un alternateur ou un démarreur ; faites confirmer la panne par un professionnel si le diagnostic reste incertain.', 'Appelez le magasin pour connaître le prix de la pièce compatible et son délai de retrait au 184 Avenue Aristide Briand.']
    },
    products: [
      { title: 'Alternateur', description: 'Recharge la batterie et alimente les équipements lorsque le moteur tourne.', image: '/assets/images/products/alternateur.webp', bullets: ['Puissance et poulie', 'Fixations et connecteur'] },
      { title: 'Démarreur', description: 'Entraîne le moteur au moment du démarrage.', image: '/assets/images/products/demarreur.webp', bullets: ['Puissance et nombre de dents', 'Fixations et position du solénoïde'] },
      { title: 'Recherche par référence', description: 'La plaque, la carte grise et la référence de la pièce déposée sécurisent le choix.', bullets: ['Comparaison des caractéristiques', 'Disponibilité confirmée avant retrait'] }
    ],
    guideTitle: 'Des symptômes à faire contrôler',
    guideIntro: 'Ces signes donnent une orientation, mais ils ne remplacent pas un test de batterie, de charge ou de démarrage.',
    guideItems: ['Voyant batterie ou baisse de tension moteur tournant.', 'Phares ou équipements qui faiblissent.', 'Clic sans lancement du moteur.', 'Démarrage lent malgré une batterie correctement chargée.'],
    faq: [
      { question: 'Comment distinguer alternateur et démarreur ?', answer: 'Un défaut de charge moteur tournant peut orienter vers l’alternateur, tandis qu’un clic sans lancement peut orienter vers le démarreur. Un contrôle électrique reste nécessaire.' },
      { question: 'Pourquoi la plaque est-elle nécessaire ?', answer: 'La motorisation et l’équipement du véhicule déterminent la puissance, la fixation, la poulie et la connectique. La plaque facilite la première recherche de référence.' },
      { question: 'Puis-je apporter l’ancienne pièce ?', answer: 'Oui. Une référence lisible et des photos de la pièce déposée peuvent confirmer le modèle lorsqu’il existe plusieurs montages.' },
      { question: 'Quel est le prix d’un alternateur ou d’un démarreur ?', answer: 'Le prix dépend de la référence et des caractéristiques du véhicule. Appelez le 01 48 47 96 27 avec votre plaque ou l’ancienne référence : nous confirmons la pièce compatible et son tarif avant commande.' },
      { question: 'Puis-je retirer la pièce dans la journée ?', answer: 'Oui, selon la référence et sa disponibilité. Le magasin confirme le délai avant votre déplacement au 184 Avenue Aristide Briand, 93320 Les Pavillons-sous-Bois.' },
      { question: 'Le magasin effectue-t-il le diagnostic ou le montage ?', answer: 'Le magasin fournit la pièce et peut vous orienter vers un professionnel. Indiquez ce besoin lors de votre demande ; le diagnostic électrique et le montage sont à prévoir avec le professionnel choisi.' }
    ]
  },
  {
    slug: 'suspension-amortisseurs-les-pavillons-sous-bois.html',
    navLabel: 'Suspension',
    eyebrow: 'Suspension & liaison au sol',
    title: 'Amortisseurs et suspension aux Pavillons-sous-Bois (93)',
    metaDescription: 'Amortisseurs, triangles, rotules et biellettes aux Pavillons-sous-Bois. Appelez avec votre plaque : prix et délai confirmés avant retrait au magasin.',
    h1: 'Amortisseurs et suspension aux Pavillons-sous-Bois',
    intro: 'Amortisseurs, triangles, rotules et biellettes : Auto Pièces Équipements fournit vos pièces de suspension aux Pavillons-sous-Bois. Appelez avec votre plaque, l’essieu et le côté concernés pour vérifier la référence, le prix et le délai de retrait.',
    image: '/assets/images/products/suspension.webp',
    imageAlt: 'Amortisseur, triangle, rotule et biellette de suspension neufs',
    sectionTitle: 'Pièces de suspension et de liaison au sol',
    sectionIntro: 'Une inspection préalable permet d’identifier la pièce réellement usée et d’éviter de commander un composant qui ne correspond pas au montage.',
    purchaseGuide: {
      title: 'Préparer votre demande de pièces de suspension',
      intro: 'La position de la pièce et le montage du véhicule comptent autant que son nom. Le devis ou la liste de pièces de votre garage aide à préciser le besoin.',
      items: ['Préparez votre plaque et précisez avant ou arrière, gauche ou droite.', 'Indiquez les références et quantités demandées par le professionnel ; ajoutez les coupelles ou accessoires s’ils figurent dans sa liste.', 'Faites confirmer les pièces proposées, leur prix et le délai de retrait au magasin avant de venir.']
    },
    products: [
      { title: 'Amortisseurs', description: 'Avant ou arrière, selon le châssis et l’équipement du véhicule.', bullets: ['Essieu et côté contrôlés', 'Coupelles et accessoires selon besoin'] },
      { title: 'Triangles & bras', description: 'Bras de suspension complets ou composants selon la référence.', bullets: ['Forme et points de fixation', 'Silentblocs et rotules associés'] },
      { title: 'Rotules & biellettes', description: 'Pièces de direction ou de barre stabilisatrice selon le diagnostic.', bullets: ['Longueur et filetage', 'Position exacte sur le véhicule'] }
    ],
    guideTitle: 'Signes possibles d’une suspension usée',
    guideIntro: 'Les bruits de train roulant peuvent avoir plusieurs causes. Faites inspecter le véhicule avant de choisir la pièce.',
    guideItems: ['Claquement sur les ralentisseurs ou les chaussées dégradées.', 'Véhicule qui rebondit ou manque de stabilité.', 'Usure irrégulière des pneus.', 'Jeu ou bruit lors des changements de direction.'],
    faq: [
      { question: 'Faut-il remplacer les amortisseurs par paire ?', answer: 'Le remplacement par paire sur le même essieu est généralement recommandé pour conserver un comportement équilibré. Confirmez avec le professionnel chargé du montage.' },
      { question: 'Comment identifier le bon triangle ?', answer: 'Précisez le côté, l’essieu et la motorisation. Une photo, les points de fixation ou la référence de l’ancienne pièce peuvent être nécessaires.' },
      { question: 'Vendez-vous les coupelles et biellettes ?', answer: 'Le magasin recherche également les accessoires et pièces associées selon le montage du véhicule. Disponibilité et délai sont confirmés à la demande.' },
      { question: 'Quel est le prix des pièces de suspension ?', answer: 'Le tarif dépend du véhicule, du montage, du côté et des pièces nécessaires. Appelez le 01 48 47 96 27 avec votre plaque et la liste demandée par votre garage pour obtenir une proposition précise.' },
      { question: 'Puis-je retirer mes amortisseurs au magasin ?', answer: 'Oui, au 184 Avenue Aristide Briand, 93320 Les Pavillons-sous-Bois. La disponibilité dans la journée dépend de la référence : faites confirmer le délai de retrait avant votre déplacement.' },
      { question: 'Pouvez-vous m’orienter pour le montage ?', answer: 'Oui, le magasin fournit les pièces et peut vous orienter vers un professionnel. Celui-ci confirme le diagnostic, les pièces nécessaires et les opérations à prévoir, notamment la géométrie si nécessaire.' }
    ]
  },
  {
    slug: 'embrayage-voiture-les-pavillons-sous-bois.html',
    navLabel: 'Embrayage',
    eyebrow: 'Embrayage · Moteur et boîte vérifiés',
    title: 'Kit embrayage aux Pavillons-sous-Bois (93)',
    metaDescription: 'Kit embrayage aux Pavillons-sous-Bois. Appelez avec votre plaque : contenu du kit, compatibilité, prix et délai de retrait confirmés avant commande.',
    h1: 'Kit embrayage aux Pavillons-sous-Bois',
    intro: 'Trouvez votre kit embrayage chez Auto Pièces Équipements aux Pavillons-sous-Bois. Appelez avec votre plaque et les informations de votre garage : nous vérifions la référence adaptée au moteur et à la boîte, le contenu du kit, le prix et le délai de retrait.',
    image: '/assets/images/products/embrayage.webp',
    imageAlt: 'Kit embrayage neuf avec disque, mécanisme et butée',
    sectionTitle: 'Les composants d’un kit embrayage',
    sectionIntro: 'Le contenu du kit varie selon le véhicule. Le diagnostic et la vérification du volant moteur doivent être réalisés avant ou pendant le démontage.',
    purchaseGuide: {
      title: 'Un devis précis pour votre kit embrayage',
      intro: 'Le prix d’un kit ne suffit pas à comparer deux propositions : les pièces incluses doivent correspondre à l’intervention prévue par votre garage.',
      items: ['Préparez votre plaque et, si vous les avez, le code moteur, le type de boîte ou les références demandées par le garage.', 'Faites préciser le contenu du kit : disque, mécanisme, butée et éventuelles pièces à commander séparément.', 'Appelez pour confirmer la compatibilité, le montant de la proposition et la date de retrait avant de planifier le montage.']
    },
    products: [
      { title: 'Disque & mécanisme', description: 'Le disque transmet le mouvement, le mécanisme assure son serrage.', bullets: ['Diamètre et cannelures', 'Montage lié au moteur et à la boîte'] },
      { title: 'Butée d’embrayage', description: 'Butée mécanique ou hydraulique selon le système.', bullets: ['Type de commande', 'Raccords et fixation contrôlés'] },
      { title: 'Pièces associées', description: 'Volant moteur ou éléments de commande selon le diagnostic.', bullets: ['Référence séparée si nécessaire', 'Disponibilité confirmée à la demande'] }
    ],
    guideTitle: 'Symptômes à faire diagnostiquer',
    guideIntro: 'Un embrayage est une intervention importante. Faites confirmer la cause avant de commander le kit.',
    guideItems: ['Moteur qui prend des tours sans accélération proportionnelle.', 'Point de patinage très haut ou pédale anormale.', 'À-coups, vibrations ou bruit au débrayage.', 'Difficulté à passer les rapports.'],
    faq: [
      { question: 'Que contient un kit embrayage ?', answer: 'Selon la référence, il comprend généralement le disque, le mécanisme et la butée. Le contenu exact est vérifié avant commande.' },
      { question: 'La plaque suffit-elle pour choisir le kit ?', answer: 'Elle permet d’identifier le véhicule, mais le code moteur, la boîte ou la référence de la pièce peuvent être nécessaires lorsqu’il existe plusieurs montages.' },
      { question: 'Faut-il changer le volant moteur ?', answer: 'Pas systématiquement. Son état et son type doivent être contrôlés par le professionnel qui démonte l’embrayage.' },
      { question: 'Quel est le prix d’un kit embrayage ?', answer: 'Le tarif dépend du véhicule, de la référence et du contenu du kit. Appelez le 01 48 47 96 27 avec votre plaque ou les références demandées par le garage : nous précisons les éléments inclus et leur prix avant commande.' },
      { question: 'Où et quand puis-je retirer mon kit embrayage ?', answer: 'Le retrait s’effectue au 184 Avenue Aristide Briand, 93320 Les Pavillons-sous-Bois. La disponibilité dans la journée dépend de la référence ; le magasin confirme le délai avant votre déplacement et avant l’intervention du garage.' },
      { question: 'Le magasin effectue-t-il le remplacement ?', answer: 'Le magasin fournit le kit et peut vous orienter vers un professionnel pour le montage. Précisez ce besoin lors de votre demande ; le remplacement est à organiser avec le professionnel choisi.' }
    ]
  },
  {
    slug: 'huile-moteur-entretien-les-pavillons-sous-bois.html',
    navLabel: 'Entretien',
    eyebrow: 'Huiles, liquides & entretien',
    title: 'Huile moteur et entretien auto aux Pavillons-sous-Bois (93)',
    metaDescription: 'Huile moteur et entretien auto aux Pavillons-sous-Bois. Appelez avec votre plaque : produit adapté, quantité, prix et délai confirmés avant retrait.',
    h1: 'Huile moteur et entretien auto aux Pavillons-sous-Bois',
    intro: 'Huile moteur, liquides, essuie-glaces et ampoules : Auto Pièces Équipements fournit vos produits d’entretien aux Pavillons-sous-Bois. Appelez avec votre plaque pour vérifier le produit adapté, la quantité, le prix et le délai de retrait au magasin.',
    image: '/assets/images/products/entretien-auto.webp',
    imageAlt: 'Huiles, liquide de refroidissement, essuie-glaces et ampoule automobile',
    sectionTitle: 'Produits pour l’entretien courant',
    sectionIntro: 'Les références et quantités dépendent du véhicule. Vérifiez le carnet d’entretien et faites confirmer la préconisation avant utilisation.',
    purchaseGuide: {
      title: 'Préparer votre achat d’huile ou de produits d’entretien',
      intro: 'Une viscosité identique ne suffit pas à choisir une huile : la norme constructeur et le besoin du véhicule doivent aussi être vérifiés.',
      items: ['Préparez votre plaque et les indications du carnet d’entretien ou de votre garage.', 'Précisez le besoin : appoint, vidange, liquide, essuie-glace ou ampoule, ainsi que la quantité souhaitée si vous la connaissez.', 'Appelez pour confirmer la référence et le conditionnement proposés, le prix et la disponibilité avant votre déplacement.']
    },
    products: [
      { title: 'Huile moteur', description: 'Viscosité, norme constructeur et quantité adaptées au moteur.', bullets: ['Préconisation vérifiée', 'Bidon et quantité selon besoin'] },
      { title: 'Liquides automobiles', description: 'Refroidissement, frein ou lave-glace selon la spécification demandée.', bullets: ['Type et compatibilité contrôlés', 'Pas de mélange sans vérification'] },
      { title: 'Essuie-glaces & ampoules', description: 'Éléments d’entretien et de visibilité selon le véhicule.', bullets: ['Longueur et fixation des balais', 'Type et puissance de l’ampoule'] }
    ],
    guideTitle: 'Les informations à vérifier',
    guideIntro: 'Le bon produit protège les organes du véhicule et évite les incompatibilités.',
    guideItems: ['Viscosité et norme constructeur de l’huile.', 'Spécification du liquide déjà présent dans le circuit.', 'Dimensions et fixation des balais d’essuie-glace.', 'Type d’ampoule indiqué par le véhicule ou l’ancienne pièce.'],
    faq: [
      { question: 'Quelle huile moteur choisir ?', answer: 'La plaque ou la carte grise permet de rechercher la viscosité, la norme constructeur et la quantité adaptées. Le carnet d’entretien reste également une référence importante.' },
      { question: 'Peut-on mélanger deux liquides de refroidissement ?', answer: 'Ne vous fiez pas uniquement à la couleur. Vérifiez la spécification du véhicule et la compatibilité des produits avant tout mélange.' },
      { question: 'Comment choisir les essuie-glaces ?', answer: 'Il faut contrôler la longueur, le côté et le type de fixation. La plaque et une photo de l’ancien balai peuvent faciliter la recherche.' },
      { question: 'Avez-vous des ampoules pour toutes les voitures ?', answer: 'Le magasin recherche les types courants selon le véhicule. Confirmez la référence et la disponibilité avant de vous déplacer.' },
      { question: 'Quel est le prix d’un bidon d’huile moteur ?', answer: 'Le tarif dépend de la référence, de la norme et du volume du bidon. Appelez le 01 48 47 96 27 avec votre plaque et votre besoin pour faire confirmer le produit adapté, la quantité et le prix.' },
      { question: 'Puis-je retirer mes produits d’entretien au magasin ?', answer: 'Oui, au 184 Avenue Aristide Briand, 93320 Les Pavillons-sous-Bois. La disponibilité dans la journée dépend de la référence ; faites confirmer le délai avant de venir.' },
      { question: 'Le magasin réalise-t-il la vidange ?', answer: 'Le magasin fournit les produits et peut vous orienter vers un professionnel. Précisez ce besoin lors de votre demande ; l’intervention est à organiser avec le professionnel choisi.' }
    ]
  },
  {
    slug: 'livraison-pieces-auto-93.html',
    navLabel: 'Livraison 93',
    eyebrow: 'Livraison aux garages & retrait magasin',
    title: 'Livraison de pièces auto en Seine-Saint-Denis (93)',
    metaDescription: 'Livraison de pièces auto aux garages du 93. Large gamme, disponibilité dans la journée selon référence. Frais et créneau confirmés avec le magasin.',
    h1: 'Livraison de pièces auto aux garages du 93',
    intro: 'Batteries, filtration, freinage, distribution et autres pièces : nous approvisionnons les garages autour des Pavillons-sous-Bois. Des pièces sont disponibles dans la journée selon la référence. Envoyez votre demande pour convenir du créneau de livraison ou d’un retrait au magasin.',
    image: '/assets/images/products/filtration.webp',
    imageAlt: 'Illustration de filtres automobiles neufs',
    sectionTitle: 'Retrait et livraison en pratique',
    sectionIntro: 'Pour organiser votre approvisionnement, nous confirmons ensemble les références, les quantités, les frais et l’heure de livraison.',
    purchaseGuide: {
      title: 'Organiser une livraison à votre garage par téléphone',
      intro: 'La disponibilité d’une pièce et le créneau de livraison sont deux informations distinctes. Confirmez les deux avec le magasin avant de planifier votre intervention.',
      items: ['Indiquez les références, les quantités et l’adresse du garage destinataire.', 'Précisez votre heure de besoin : nous vérifions les possibilités de livraison dans votre secteur.', 'Faites confirmer le prix des pièces, les frais et le créneau convenu. Le retrait au magasin reste une option à organiser avec l’équipe.']
    },
    products: [
      { title: '1. Envoyez la demande', description: 'Transmettez les références ou les informations du véhicule, les quantités et votre commune.', bullets: ['Référence ou photo si disponible', 'Jour et heure de besoin'] },
      { title: '2. Recevez la confirmation', description: 'Le magasin vérifie la compatibilité, le prix, la disponibilité et le délai.', bullets: ['Réponse adaptée à la référence', 'Aucun déplacement inutile'] },
      { title: '3. Choisissez le mode de remise', description: 'Retrait au comptoir ou livraison locale lorsque les conditions le permettent.', bullets: ['Adresse et horaire convenus', 'Zone confirmée au cas par cas'] }
    ],
    guideTitle: 'Ce qui détermine la livraison',
    guideIntro: 'La réponse dépend de la pièce et de la destination. Contactez le magasin pour obtenir une confirmation précise.',
    guideItems: ['Dimensions, poids et nature de la pièce.', 'Adresse ou commune de destination.', 'Disponibilité réelle de la référence.', 'Organisation et délai convenus avec le magasin.'],
    faq: [
      { question: 'Livrez-vous dans toute la Seine-Saint-Denis ?', answer: 'La livraison est locale et étudiée au cas par cas autour des Pavillons-sous-Bois. Indiquez votre commune et la pièce recherchée pour obtenir une réponse.' },
      { question: 'Quels sont les délais ?', answer: 'Des pièces sont disponibles dans la journée selon la référence. Nous confirmons séparément l’heure de disponibilité et le créneau de livraison selon votre destination et l’organisation des tournées.' },
      { question: 'Puis-je retirer au magasin ?', answer: 'Oui, après confirmation de la référence et de la disponibilité, au 184 Avenue Aristide Briand, 93320 Les Pavillons-sous-Bois.' },
      { question: 'Livrez-vous les garages ?', answer: 'Oui, nous livrons les garages du secteur. Envoyez références, quantités, commune et heure de besoin. Nous confirmons prix, frais et créneau avant de valider la livraison.' }
    ]
  },
  {
    slug: 'pieces-auto-garages-professionnels-93.html',
    navLabel: 'Professionnels',
    eyebrow: 'Garages & revendeurs · Seine-Saint-Denis',
    title: 'Pièces auto pour garages et revendeurs en Seine-Saint-Denis (93)',
    metaDescription: 'Pièces auto pour garages du 93 : large gamme, disponibilité dans la journée selon référence et livraison aux professionnels. Demande par téléphone ou WhatsApp.',
    h1: 'Pièces auto pour garages et revendeurs en Seine-Saint-Denis',
    intro: 'Votre approvisionnement en pièces auto : large gamme, disponibilité dans la journée selon la référence et livraison aux garages. Envoyez vos références, quantités, commune et heure de besoin ; nous confirmons les prix, les pièces disponibles et le créneau de livraison.',
    image: '/assets/images/products/alternateur.webp',
    imageAlt: 'Alternateur automobile neuf destiné à un professionnel',
    sectionTitle: 'Familles demandées par les professionnels',
    sectionIntro: 'Batteries, filtration, freinage, distribution, démarrage, suspension, embrayage et entretien : regroupez vos besoins dans une même demande.',
    purchaseGuide: {
      title: 'Un interlocuteur pour votre demande professionnelle',
      intro: 'Appelez le magasin avec votre liste de pièces pour faire préciser les références proposées et organiser votre approvisionnement.',
      items: ['Indiquez le nom de votre garage ou de votre activité, puis les véhicules, références et quantités concernés.', 'Faites confirmer les prix et disponibilités de chaque référence avant de valider la commande.', 'Convenez du retrait ou, pour une livraison au garage, de l’adresse, des frais et du créneau. Précisez les pièces dont vous avez besoin en priorité.']
    },
    products: [
      { title: 'Entretien & filtration', description: 'Huiles, filtres et consommables adaptés aux références des véhicules.', bullets: ['Recherche par véhicule', 'Regroupement de la demande'] },
      { title: 'Freinage & démarrage', description: 'Plaquettes, disques, batteries, alternateurs et démarreurs.', bullets: ['Caractéristiques vérifiées', 'Délai communiqué avant commande'] },
      { title: 'Suspension & embrayage', description: 'Pièces de liaison au sol et kits selon le montage précis.', bullets: ['Côté, essieu, moteur et boîte', 'Référence ancienne utile'] },
      { title: 'Distribution & autres références', description: 'Kits de distribution et recherche des autres pièces nécessaires à vos véhicules.', bullets: ['Composition du kit confirmée', 'Référence, quantité et délai souhaité'] }
    ],
    guideTitle: 'Pour accélérer une demande professionnelle',
    guideIntro: 'Une demande structurée permet de rechercher plusieurs références sans perdre les informations essentielles.',
    guideItems: ['Immatriculation ou VIN lorsque disponible.', 'Référence fabricant ou fournisseur déjà relevée.', 'Quantité et côté concernés.', 'Commune de livraison, jour et heure de besoin.'],
    faq: [
      { question: 'Travaillez-vous avec les garages et revendeurs ?', answer: 'Oui. Contactez le magasin pour présenter votre activité et obtenir les informations adaptées sur les références, les conditions et les disponibilités.' },
      { question: 'Comment transmettre une commande ?', answer: 'Par téléphone ou WhatsApp, avec les informations du véhicule, la référence recherchée et la quantité. Le magasin confirme ensuite les éléments utiles.' },
      { question: 'Livrez-vous les professionnels ?', answer: 'Oui, nous livrons les garages du secteur. Les pièces peuvent être disponibles dans la journée selon la référence ; le créneau de livraison et les frais sont confirmés avec le magasin. Retrait au comptoir également possible.' },
      { question: 'Quelles familles de pièces fournissez-vous ?', answer: 'Batteries, entretien, filtration, freinage, distribution, démarrage et charge, suspension, embrayage et autres références selon la demande.' }
    ]
  }
];
