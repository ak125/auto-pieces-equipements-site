/**
 * Script principal - Auto Pièces Équipements
 * Version modularisée et optimisée
 */

// Import des modules
import { initializeReviews } from './modules/reviews.js';
import { initCoreFeatures } from './modules/core-features.js';
import { initContactForm } from './modules/contact-form.js';

// Créer les icônes Lucide
function createIcons() {
  if (window.lucide) {
    lucide.createIcons();
  } else {
    console.warn('Lucide icons not loaded yet');
  }
}

// Initialisation des fonctionnalités
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser l'interface
  createIcons();
  
  // Fonctionnalités principales
  initCoreFeatures();
  initializeReviews();
  initContactForm();
  
  // Mesure des performances Web Vitals
  measureWebVitals();
});

/**
 * Mesure les métriques Web Vitals
 */
function measureWebVitals() {
  if ('webVitals' in window) {
    webVitals.getCLS(console.log);
    webVitals.getFID(console.log);
    webVitals.getLCP(console.log);
  }
}

// Export pour utilisation dans d'autres contextes
export { createIcons };
