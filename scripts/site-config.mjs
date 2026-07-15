export const publicFiles = [
  'index.html',
  'pieces-auto-les-pavillons-sous-bois.html',
  'batterie-voiture-les-pavillons-sous-bois.html',
  'plaquettes-disques-frein-les-pavillons-sous-bois.html',
  'filtres-vidange-les-pavillons-sous-bois.html',
  'alternateur-demarreur-les-pavillons-sous-bois.html',
  'suspension-amortisseurs-les-pavillons-sous-bois.html',
  'embrayage-voiture-les-pavillons-sous-bois.html',
  'huile-moteur-entretien-les-pavillons-sous-bois.html',
  'livraison-pieces-auto-93.html',
  'pieces-auto-garages-professionnels-93.html',
  'mentions-legales.html',
  'politique-confidentialite.html',
  'assets/site.css',
  'assets/site.js',
  'assets/images/products/batterie-auto.webp',
  'assets/images/products/freinage.webp',
  'assets/images/products/filtration.webp',
  'assets/images/products/alternateur.webp',
  'assets/images/products/demarreur.webp',
  'assets/images/products/suspension.webp',
  'assets/images/products/embrayage.webp',
  'assets/images/products/entretien-auto.webp',
  'CNAME',
  'robots.txt',
  'sitemap.xml',
  'logo.svg'
];

export const seoPages = publicFiles.filter(
  (file) => file.endsWith('.html') && !file.startsWith('mentions-') && !file.startsWith('politique-')
);

export const retiredPages = [
  'futur-concept.html',
  'index-tailwind.html',
  'index-test.html',
  'index-vite.html',
  'index1.html',
  'product-example.html',
  'produits/batterie-auto-12v.html',
  'produits/modele-produit.html'
];
