/**
 * Gestion des onglets pour les fiches produits techniques
 * Auto Pièces Équipements
 */

/**
 * Initialise les onglets pour la fiche produit technique
 */
export function initProductTabs() {
  const tabButtons = document.querySelectorAll('.tech-tab-button');
  const tabContents = document.querySelectorAll('.tech-tab-content');
  
  if (tabButtons.length === 0 || tabContents.length === 0) return;
  
  // Gestionnaire de clic sur les onglets
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Récupérer l'ID du contenu associé à cet onglet
      const targetId = button.getAttribute('data-tab');
      
      // Désactiver tous les onglets
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Activer l'onglet sélectionné
      button.classList.add('active');
      
      // Afficher le contenu de l'onglet
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
  
  // Initialiser le suivi du produit
  initProductTracking();
}

/**
 * Suivi des interactions avec le produit
 */
function initProductTracking() {
  const product = {
    id: document.querySelector('.tech-product-card').getAttribute('data-product-id'),
    name: document.querySelector('.tech-product-title').textContent,
    price: parseFloat(document.querySelector('.tech-price-current').getAttribute('data-price'))
  };
  
  // Tracking du clic sur ajouter au panier
  document.querySelector('.tech-add-to-cart')?.addEventListener('click', () => {
    trackProductAction('add_to_cart', product);
  });
  
  // Tracking du clic sur la demande de devis
  document.querySelector('.tech-request-quote')?.addEventListener('click', () => {
    trackProductAction('request_quote', product);
  });
  
  // Tracking du changement d'onglet
  document.querySelectorAll('.tech-tab-button').forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.textContent.trim();
      trackProductAction('view_tab', { ...product, tab: tabName });
    });
  });
}

/**
 * Envoie les données de tracking
 */
function trackProductAction(action, data) {
  // Dans un environnement de production, on utiliserait Google Analytics ou un autre outil
  console.log(`[TRACKING] Action: ${action}`, data);
  
  // Exemple d'envoi à Google Analytics (si chargé)
  if (window.gtag) {
    gtag('event', action, {
      items: [{
        item_id: data.id,
        item_name: data.name,
        price: data.price
      }]
    });
  }
}

// Initialiser les onglets quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initProductTabs);
