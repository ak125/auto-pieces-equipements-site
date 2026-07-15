import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { catalogPages } from './catalog-content.mjs';

const root = process.cwd();
const baseUrl = 'https://auto-pieces-equipements.fr';
const phoneDisplay = '01 48 47 96 27';
const phoneHref = 'tel:+33148479627';
const whatsappHref = 'https://wa.me/33148479627?text=Bonjour,%20je%20cherche%20une%20pi%C3%A8ce%20auto';
const mapsHref = 'https://www.google.com/maps/dir/?api=1&destination=Auto+Pi%C3%A8ces+%C3%89quipements+184+Avenue+Aristide+Briand+93320+Les+Pavillons-sous-Bois';
const googleProfileHref = 'https://www.google.com/maps/search/?api=1&query=Auto+Pi%C3%A8ces+%C3%89quipements+184+Avenue+Aristide+Briand+93320+Les+Pavillons-sous-Bois';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function header() {
  return `
    <a class="skip-link" href="#contenu">Aller au contenu</a>
    <header class="site-header">
      <div class="container header-row">
        <a class="brand" href="/" aria-label="Auto Pièces Équipements — accueil">
          <img src="/logo.svg" width="42" height="42" alt="">
          <span>Auto Pièces <span class="brand-mark">Équipements</span></span>
        </a>
        <nav class="desktop-nav" aria-label="Navigation principale">
          <a href="/pieces-auto-les-pavillons-sous-bois.html">Pièces auto</a>
          <a href="/batterie-voiture-les-pavillons-sous-bois.html">Batteries</a>
          <a href="/plaquettes-disques-frein-les-pavillons-sous-bois.html">Freinage</a>
          <a href="/filtres-vidange-les-pavillons-sous-bois.html">Filtres</a>
          <a href="/#contact">Contact</a>
        </nav>
        <div class="header-actions">
          <a class="button button-primary header-phone" href="${phoneHref}" aria-label="Appeler le ${phoneDisplay}"><span>${phoneDisplay}</span><span class="visually-hidden">Appeler</span></a>
          <button class="menu-button" type="button" aria-expanded="false" aria-controls="navigation-mobile" data-menu-button>Menu</button>
        </div>
      </div>
      <nav class="container mobile-nav" id="navigation-mobile" aria-label="Navigation mobile" data-mobile-nav>
        <a href="/pieces-auto-les-pavillons-sous-bois.html">Toutes les pièces auto</a>
        <a href="/batterie-voiture-les-pavillons-sous-bois.html">Batteries</a>
        <a href="/plaquettes-disques-frein-les-pavillons-sous-bois.html">Freinage</a>
        <a href="/filtres-vidange-les-pavillons-sous-bois.html">Filtres &amp; vidange</a>
        <a href="/alternateur-demarreur-les-pavillons-sous-bois.html">Alternateur &amp; démarreur</a>
        <a href="/suspension-amortisseurs-les-pavillons-sous-bois.html">Suspension</a>
        <a href="/embrayage-voiture-les-pavillons-sous-bois.html">Embrayage</a>
        <a href="/huile-moteur-entretien-les-pavillons-sous-bois.html">Huiles &amp; entretien</a>
        <a href="/#contact">Contact &amp; horaires</a>
      </nav>
    </header>
    <div class="status-strip" role="status" data-opening-status>Consultez les horaires du magasin avant votre déplacement.</div>`;
}

function footer() {
  return `
    <section class="section section-dark" id="contact">
      <div class="container contact-panel">
        <div>
          <p class="kicker">Magasin local aux Pavillons-sous-Bois</p>
          <h2>Une référence à vérifier&nbsp;?</h2>
          <p>Appelez-nous ou envoyez la plaque, la carte grise ou la référence de l’ancienne pièce sur WhatsApp.</p>
          <ul class="contact-list">
            <li>184 Avenue Aristide Briand, 93320 Les Pavillons-sous-Bois</li>
            <li><a href="${phoneHref}">${phoneDisplay}</a></li>
            <li><a href="mailto:contact@auto-pieces-equipements.fr">contact@auto-pieces-equipements.fr</a></li>
          </ul>
          <div class="section-actions">
            <a class="button button-primary" href="${phoneHref}">Appeler le magasin</a>
            <a class="button button-whatsapp" href="${whatsappHref}" target="_blank" rel="noopener">Envoyer une demande</a>
            <a class="button button-light" href="${mapsHref}" target="_blank" rel="noopener">Itinéraire</a>
          </div>
        </div>
        <div class="hours-card">
          <h3>Horaires d’ouverture</h3>
          <dl>
            <dt>Lundi–jeudi</dt><dd>9h30–18h30</dd>
            <dt>Vendredi</dt><dd>9h30–13h30<br>14h30–18h30</dd>
            <dt>Samedi</dt><dd>9h30–16h00</dd>
            <dt>Dimanche</dt><dd>Fermé</dd>
          </dl>
        </div>
      </div>
    </section>
    <footer class="site-footer">
      <div class="container footer-row">
        <div>© <span data-current-year>2026</span> Auto Pièces Équipements · Les Pavillons-sous-Bois</div>
        <nav class="footer-links" aria-label="Liens de pied de page">
          <a href="/">Accueil</a>
          <a href="/livraison-pieces-auto-93.html">Livraison 93</a>
          <a href="/pieces-auto-garages-professionnels-93.html">Professionnels</a>
          <a href="/mentions-legales.html">Mentions légales</a>
          <a href="/politique-confidentialite.html">Confidentialité</a>
        </nav>
      </div>
    </footer>
    <a class="floating-whatsapp" href="${whatsappHref}" target="_blank" rel="noopener" aria-label="Demander une pièce sur WhatsApp">WhatsApp</a>
    <script src="/assets/site.js" defer></script>`;
}

function structuredData(page) {
  const pageUrl = `${baseUrl}/${page.slug}`;
  const imageUrl = `${baseUrl}${page.image}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AutoPartsStore',
        '@id': `${baseUrl}/#store`,
        name: 'Auto Pièces Équipements',
        url: baseUrl,
        logo: `${baseUrl}/logo.svg`,
        telephone: '+33148479627',
        email: 'contact@auto-pieces-equipements.fr',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '184 Avenue Aristide Briand',
          addressLocality: 'Les Pavillons-sous-Bois',
          postalCode: '93320',
          addressCountry: 'FR'
        },
        geo: { '@type': 'GeoCoordinates', latitude: 48.91012, longitude: 2.51387 },
        openingHoursSpecification: [
          { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '09:30', closes: '18:30' },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '09:30', closes: '13:30' },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '14:30', closes: '18:30' },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:30', closes: '16:00' }
        ],
        areaServed: ['Les Pavillons-sous-Bois', 'Bondy', 'Livry-Gargan', 'Le Raincy', 'Villemomble', 'Noisy-le-Sec'].map((name) => ({ '@type': 'City', name }))
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: page.title,
        description: page.metaDescription,
        inLanguage: 'fr-FR',
        about: { '@id': `${baseUrl}/#store` },
        primaryImageOfPage: { '@type': 'ImageObject', url: imageUrl }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${baseUrl}/` },
          { '@type': 'ListItem', position: 2, name: page.h1, item: pageUrl }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer }
        }))
      }
    ]
  };
}

function renderProducts(page) {
  return page.products.map((product) => `
          <article class="product-card">
            ${product.image ? `<img src="${product.image}" width="960" height="960" loading="lazy" alt="${escapeHtml(product.title)}">` : ''}
            <h3>${escapeHtml(product.title)}</h3>
            ${product.price ? `<p><strong>${escapeHtml(product.price)}</strong></p>` : ''}
            <p>${escapeHtml(product.description)}</p>
            <ul>${product.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
            ${product.link ? `<a class="card-link" href="${product.link}">Voir la fiche détaillée →</a>` : ''}
          </article>`).join('');
}

function renderRelated(currentPage) {
  return catalogPages
    .filter((page) => page.slug !== currentPage.slug)
    .slice(0, 6)
    .map((page) => `<li><a href="/${page.slug}">${escapeHtml(page.navLabel)}</a></li>`)
    .join('');
}

function renderPage(page) {
  const pageUrl = `${baseUrl}/${page.slug}`;
  const imageUrl = `${baseUrl}${page.image}`;
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.metaDescription)}">
  <meta name="theme-color" content="#0b1324">
  <link rel="canonical" href="${pageUrl}">
  <link rel="preload" href="${page.image}" as="image" type="image/webp">
  <link rel="stylesheet" href="/assets/site.css">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:site_name" content="Auto Pièces Équipements">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.metaDescription)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:alt" content="${escapeHtml(page.imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(structuredData(page))}</script>
</head>
<body>
  ${header()}
  <nav class="breadcrumbs" aria-label="Fil d’Ariane"><div class="container"><a href="/">Accueil</a> / <span>${escapeHtml(page.h1)}</span></div></nav>
  <main id="contenu">
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.h1)}</h1>
          <p class="hero-lead">${escapeHtml(page.intro)}</p>
          <div class="hero-actions">
            <a class="button button-primary" href="${phoneHref}">Appeler le magasin</a>
            <a class="button button-whatsapp" href="${whatsappHref}" target="_blank" rel="noopener">Demander une pièce</a>
            <a class="button button-light" href="${googleProfileHref}" target="_blank" rel="noopener">Voir la fiche Google</a>
          </div>
        </div>
        <div class="hero-media">
          <img src="${page.image}" width="960" height="960" alt="${escapeHtml(page.imageAlt)}">
        </div>
      </div>
    </section>

    <div class="container trust-bar" aria-label="Services essentiels">
      <div class="trust-grid">
        <div class="trust-item"><strong>Compatibilité vérifiée</strong><span>Plaque, carte grise ou ancienne référence</span></div>
        <div class="trust-item"><strong>Retrait au magasin</strong><span>Après confirmation de la disponibilité</span></div>
        <div class="trust-item"><strong>Livraison locale</strong><span>Selon la pièce, la zone et la disponibilité</span></div>
      </div>
    </div>

    <section class="section section-white">
      <div class="container">
        <div class="section-head">
          <p class="kicker">Guide de choix</p>
          <h2>${escapeHtml(page.sectionTitle)}</h2>
          <p>${escapeHtml(page.sectionIntro)}</p>
        </div>
        <div class="card-grid">${renderProducts(page)}</div>
      </div>
    </section>

    <section class="section">
      <div class="container two-column">
        <div>
          <p class="kicker">Avant de commander</p>
          <h2>${escapeHtml(page.guideTitle)}</h2>
          <p>${escapeHtml(page.guideIntro)}</p>
          <ul class="check-list">${page.guideItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </div>
        <div class="notice">
          <h2>Pourquoi plusieurs références existent&nbsp;?</h2>
          <p>La finition, la date de fabrication, la motorisation ou l’équipement peuvent changer le montage d’une pièce sur un même modèle.</p>
          <p><strong>Notre méthode :</strong> identifier le véhicule, comparer les caractéristiques, puis confirmer la disponibilité avant votre déplacement.</p>
          <div class="section-actions"><a class="button button-whatsapp" href="${whatsappHref}" target="_blank" rel="noopener">Envoyer les informations</a></div>
        </div>
      </div>
    </section>

    <section class="section section-white">
      <div class="container">
        <div class="section-head centered">
          <p class="kicker">Demande en trois étapes</p>
          <h2>Une recherche simple et vérifiable</h2>
        </div>
        <div class="steps">
          <article class="step-card"><h3>Identifiez le véhicule</h3><p>Plaque, carte grise, motorisation et année lorsque vous les connaissez.</p></article>
          <article class="step-card"><h3>Précisez la pièce</h3><p>Symptôme, côté concerné, photo ou référence de l’ancienne pièce.</p></article>
          <article class="step-card"><h3>Confirmez avant de venir</h3><p>Nous vérifions la référence, la disponibilité et le mode de retrait ou livraison.</p></article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="narrow">
        <div class="section-head centered">
          <p class="kicker">Questions fréquentes</p>
          <h2>Réponses utiles avant votre demande</h2>
        </div>
        <div class="faq-list">
          ${page.faq.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')}
        </div>
      </div>
    </section>

    <section class="section section-white">
      <div class="container content-grid">
        <div>
          <p class="kicker">Zone desservie</p>
          <h2>Un magasin de proximité en Seine-Saint-Denis</h2>
          <p>Auto Pièces Équipements vous accueille au 184 Avenue Aristide Briand, aux Pavillons-sous-Bois. Le magasin répond également aux demandes venant de Bondy, Livry-Gargan, Le Raincy, Villemomble et Noisy-le-Sec.</p>
        </div>
        <div>
          <p class="kicker">Autres familles</p>
          <h2>Continuer votre recherche</h2>
          <ul class="plain-list">${renderRelated(page)}</ul>
        </div>
      </div>
    </section>
  </main>
  ${footer()}
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}

for (const page of catalogPages) {
  await writeFile(path.join(root, page.slug), renderPage(page), 'utf8');
}

console.log(`Catalogue généré : ${catalogPages.length} pages.`);
