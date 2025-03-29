/**
 * Module de gestion des avis Google Places
 * Auto Pièces Équipements
 */

// Configuration
const CONFIG = {
  placeId: 'ChIJVVXZlqAT5kcRICTpgHlqx9A', // Place ID Auto Pièces Équipements
  apiURL: 'https://votre-worker.votre-account.workers.dev/',
  loadDelay: 1500, // Délai de chargement simulé (ms)
  maxReviews: 3 // Nombre maximum d'avis à afficher
};

/**
 * Initialise les avis
 */
export function initializeReviews() {
  const container = document.getElementById('google-reviews-container');
  if (!container) return;
  
  setTimeout(() => {
    try {
      const isProduction = isProductionEnvironment();
      
      if (isProduction) {
        fetchProductionReviews(CONFIG.placeId, container);
      } else {
        const reviews = getMockReviews();
        renderReviews(reviews, container);
      }
    } catch (error) {
      renderError(container, CONFIG.placeId);
      console.error('Erreur lors du chargement des avis', error);
    }
  }, CONFIG.loadDelay);
}

/**
 * Vérifie si l'environnement est en production
 */
function isProductionEnvironment() {
  return window.location.hostname !== 'localhost' && 
         !window.location.hostname.includes('127.0.0.1') &&
         !window.location.hostname.includes('github.io');
}

/**
 * Récupère les avis depuis le Worker Cloudflare en production
 */
async function fetchProductionReviews(placeId, container) {
  try {
    const apiUrl = `${CONFIG.apiURL}?placeId=${placeId}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Erreur réseau: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.result && data.result.reviews) {
      const reviews = data.result.reviews
        .slice(0, CONFIG.maxReviews)
        .map(formatReviewData);
      
      renderReviews(reviews, container);
      
      // Mettre à jour la note globale
      updateGlobalRating(data.result.rating);
    } else {
      throw new Error('Format de données incorrect');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    renderError(container, placeId);
  }
}

/**
 * Formate les données d'un avis
 */
function formatReviewData(review) {
  return {
    author_name: review.author_name,
    author_url: review.author_url,
    profile_photo_url: review.profile_photo_url || 
      `https://via.placeholder.com/150?text=${review.author_name.substring(0, 2).toUpperCase()}`,
    rating: review.rating,
    text: review.text,
    time: review.time
  };
}

/**
 * Met à jour la note globale dans l'interface
 */
function updateGlobalRating(rating) {
  if (!rating) return;
  
  const ratingElement = document.querySelector('.text-primary');
  if (ratingElement) {
    ratingElement.textContent = parseFloat(rating).toFixed(1) + '/5';
  }
}

/**
 * Affiche les avis dans le conteneur
 */
function renderReviews(reviews, container) {
  // Utiliser le HTML existant, déjà bien formaté
  container.innerHTML = reviews.map(review => `
    <div class="review-card bg-gray-50 dark:bg-gray-800 p-6 rounded-xl hover:shadow-lg transition-all">
      <div class="flex items-center gap-4 mb-4">
        <img src="${review.profile_photo_url}" 
             alt="Photo de ${review.author_name}" 
             class="w-12 h-12 rounded-full object-cover"
             loading="lazy">
        <div>
          <p class="font-bold">${review.author_name}</p>
          <div class="flex items-center gap-1 text-yellow-400" 
               aria-label="${review.rating} étoiles sur 5">
            ${'★'.repeat(Math.floor(review.rating))}${review.rating % 1 !== 0 ? '½' : ''}
          </div>
        </div>
      </div>
      <p class="text-gray-600 dark:text-gray-300 mb-4">${review.text}</p>
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>${formatDate(review.time)}</span>
        <a href="${review.author_url}" 
           target="_blank" 
           rel="noopener"
           class="text-primary hover:underline">
          Voir l'avis
        </a>
      </div>
    </div>
  `).join('');
}

/**
 * Affiche un message d'erreur
 */
function renderError(container, placeId) {
  container.innerHTML = `
    <div class="text-center col-span-3 py-12">
      <p class="text-gray-500 mb-4">Impossible de charger les avis</p>
      <a href="https://search.google.com/local/reviews?placeid=${placeId}" 
         target="_blank"
         rel="noopener"
         class="text-primary hover:underline">
         Voir les avis sur Google
      </a>
    </div>
  `;
}

/**
 * Formate une date timestamp en format local
 */
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Fournit des avis fictifs pour la démo
 */
function getMockReviews() {
  return [
    {
      "author_name": "Marc Dupont",
      "author_url": "https://www.google.com/maps/contrib/123456789",
      "profile_photo_url": "https://via.placeholder.com/150?text=MD",
      "rating": 5,
      "text": "Service exceptionnel ! J'ai commandé des plaquettes de frein pour ma Renault Clio et ils m'ont conseillé parfaitement. Livraison en moins de 24h, montage facile, ma voiture est comme neuve !",
      "time": 1678524000 // 11 Mars 2023
    },
    {
      "author_name": "Sophie Laurent",
      "author_url": "https://www.google.com/maps/contrib/987654321",
      "profile_photo_url": "https://via.placeholder.com/150?text=SL",
      "rating": 5,
      "text": "La meilleure boutique de pièces auto du 93 ! Prix imbattables et conseils vraiment professionnels. J'ai économisé plus de 200€ sur mes amortisseurs par rapport au garage.",
      "time": 1683835200 // 12 Mai 2023
    },
    {
      "author_name": "Karim Benali",
      "author_url": "https://www.google.com/maps/contrib/456789123",
      "profile_photo_url": "https://via.placeholder.com/150?text=KB",
      "rating": 4,
      "text": "Très bonne expérience globale. Pièces de qualité et conformes à ma BMW. Seul petit bémol : le délai de livraison a été un peu plus long que prévu (48h au lieu de 24h). Je recommande quand même !",
      "time": 1688169600 // 1 Juillet 2023
    }
  ];
}
