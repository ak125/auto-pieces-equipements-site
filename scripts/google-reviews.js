/**
 * Intégration des avis Google pour Auto Pièces Équipements
 * Affiche les avis Google Places sur le site
 */

document.addEventListener('DOMContentLoaded', () => {
  initReviews();
});

/**
 * Initialise et charge les avis Google
 */
function initReviews() {
  const container = document.getElementById('google-reviews-container');
  const loadingElement = document.getElementById('reviews-loading');
  
  if (!container) return;
  
  const placeId = 'ChIJVVXZlqAT5kcRICTpgHlqx9A'; // Place ID Auto Pièces Équipements
  
  // Afficher l'indicateur de chargement
  if (loadingElement) loadingElement.style.display = 'flex';
  
  // Simuler un délai de chargement
  setTimeout(() => {
    try {
      // Déterminer si nous sommes en environnement de production
      const isProduction = window.location.hostname !== 'localhost' && 
                          !window.location.hostname.includes('127.0.0.1') &&
                          !window.location.hostname.includes('github.io');
      
      if (isProduction) {
        // En production, utiliser le Worker Cloudflare
        fetchProductionReviews(placeId, container, loadingElement);
      } else {
        // En développement, utiliser les données de démo
        const reviews = getMockReviews();
        renderReviews(reviews, container);
        if (loadingElement) loadingElement.style.display = 'none';
      }
    } catch (error) {
      renderError(container, placeId);
      if (loadingElement) loadingElement.style.display = 'none';
      console.error('Erreur lors du chargement des avis', error);
    }
  }, 1000);
}

/**
 * Récupère les avis depuis le Worker Cloudflare en production
 */
async function fetchProductionReviews(placeId, container, loadingElement) {
  try {
    // URL du Worker Cloudflare (format de production)
    const apiUrl = `https://google-places-proxy.your-account.workers.dev/?placeId=${placeId}`;
    
    // Appel au Worker Cloudflare
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Erreur réseau: ${response.status}`);
    }
    
    // Récupération des données
    const data = await response.json();
    
    // Masquer l'indicateur de chargement
    if (loadingElement) loadingElement.style.display = 'none';
    
    // Vérification et traitement des données
    if (data && data.result && data.result.reviews) {
      // Extraire les avis du résultat
      const reviews = data.result.reviews.map(review => ({
        author_name: review.author_name,
        author_url: review.author_url,
        profile_photo_url: review.profile_photo_url || 'https://via.placeholder.com/150?text=' + review.author_name.substring(0, 2).toUpperCase(),
        rating: review.rating,
        text: review.text,
        time: review.time
      }));
      
      // Afficher les avis
      renderReviews(reviews, container);
      
      // Ajouter note globale si disponible
      if (data.result.rating) {
        updateGlobalRating(data.result.rating, data.result.user_ratings_total);
      }
    } else {
      console.error('Format de données incorrect:', data);
      throw new Error('Format de données incorrect');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    renderError(container, placeId);
    if (loadingElement) loadingElement.style.display = 'none';
  }
}

/**
 * Met à jour l'affichage de la note globale
 */
function updateGlobalRating(rating, totalRatings) {
  const ratingElements = document.querySelectorAll('.global-rating-value');
  const totalElements = document.querySelectorAll('.global-rating-count');
  
  ratingElements.forEach(el => {
    el.textContent = rating.toFixed(1);
  });
  
  totalElements.forEach(el => {
    el.textContent = totalRatings;
  });
}

/**
 * Affiche les avis dans le conteneur avec le style Tailwind
 */
function renderReviews(reviews, container) {
  container.innerHTML = reviews.map(review => `
    <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm transition-all hover:shadow-md">
      <div class="flex items-center mb-4">
        <img src="${review.profile_photo_url}" 
             alt="${review.author_name}" 
             class="w-10 h-10 rounded-full mr-3 object-cover"
             loading="lazy">
        <div>
          <h4 class="font-medium">${review.author_name}</h4>
          <div class="flex items-center text-amber-400">
            ${generateStars(review.rating)}
          </div>
        </div>
      </div>
      <p class="text-gray-600 dark:text-gray-300 mb-4">${formatReviewText(review.text)}</p>
      <div class="flex justify-between items-center">
        <span class="text-gray-400 text-sm">${formatDate(review.time)}</span>
        <a href="${review.author_url}" target="_blank" class="text-primary hover:underline text-sm">
          Voir sur Google
        </a>
      </div>
    </div>
  `).join('');
}

/**
 * Génère les étoiles HTML pour l'affichage de la note
 */
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return `
    ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
    ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
    ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
  `;
}

/**
 * Formate le texte de l'avis (limite la longueur)
 */
function formatReviewText(text) {
  const maxLength = 150;
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

/**
 * Affiche un message d'erreur
 */
function renderError(container, placeId) {
  container.innerHTML = `
    <div class="text-center col-span-full py-12">
      <p class="text-gray-500 mb-4">Impossible de charger les avis</p>
      <a href="https://search.google.com/local/reviews?placeid=${placeId}" 
         target="_blank" 
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
 * À remplacer par de vrais avis via l'API Google Places en production
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
