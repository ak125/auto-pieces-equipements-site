/**
 * Script principal - Auto Pièces Équipements
 * Version modularisée et optimisée
 */

// Import des modules
import { initializeReviews } from './modules/reviews.js';
import { initializeServices } from './modules/services.js';
import { setupBooking } from './modules/booking.js';
import { setupFormHandling } from './modules/forms.js';
import { setupChatbot } from './modules/chatbot.js';
import { setupAnimations } from './modules/animations.js';
import { setupProductFilters } from './modules/products.js'; 
import { enhanceProductSection } from './modules/products-enhanced.js';

// Créer les icônes Lucide
function createIcons() {
  if (window.lucide) {
    lucide.createIcons();
  } else {
    console.warn('Lucide icons not loaded yet');
  }
}

// Initialisation des fonctionnalités
document.addEventListener('DOMContentLoaded', async () => {
  // Initialiser l'interface
  createIcons();
  
  // Fonctionnalités principales
  initializeReviews();
  initializeServices();
  setupBooking();
  setupFormHandling();
  setupChatbot();
  setupAnimations();
  setupProductFilters();
  enhanceProductSection();
  
  // A/B Testing des CTA
  const ctaVariants = [
    { text: '📞 Demandez un devis gratuit', color: 'bg-secondary' },
    { text: '💸 Économisez sur vos pièces auto', color: 'bg-green-500' }
  ];

  const mainCta = document.querySelector('a[href="#devis"]');
  if (mainCta) {
    const randomCta = ctaVariants[Math.floor(Math.random() * ctaVariants.length)];
    mainCta.textContent = randomCta.text;
    mainCta.className = `${randomCta.color} text-gray-900 px-8 py-4 rounded-full font-bold hover:opacity-90 transition`;
  }
  
  // Observer les sections pour animations au scroll
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(el => {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });
  } else {
    // Fallback pour les navigateurs sans IntersectionObserver
    document.querySelectorAll('section').forEach(el => {
      el.classList.add('animate-fade-in-up');
    });
  }
});

// Debug et surveillance des performances
if (process.env.NODE_ENV !== 'production') {
  // Surveiller et journaliser les performances de l'application
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log(`Page chargée en ${pageLoadTime}ms`);
    });
  }
}

// Web Vitals Tracking (si disponible)
if ('webVitals' in window) {
  webVitals.getCLS(console.log);
  webVitals.getFID(console.log);
  webVitals.getLCP(console.log);
} else {
  // Le fallback est déjà géré par le script separé
}

// Export pour utilisation dans d'autres contextes
export { createIcons };
