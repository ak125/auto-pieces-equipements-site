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
  const placeId = 'ChIJVVXZlqAT5kcRICTpgHlqx9A'; // Place ID Auto Pièces Équipements
  
  // Simuler un délai de chargement
  setTimeout(() => {
    try {
      // Déterminer si nous sommes en environnement de production
      const isProduction = window.location.hostname !== 'localhost' && 
                          !window.location.hostname.includes('127.0.0.1') &&
                          !window.location.hostname.includes('github.io');
      
      if (isProduction) {
        // En production, utiliser le Worker Cloudflare
        fetchProductionReviews(placeId, container);
      } else {
        // En développement, utiliser les données de démo
        const reviews = getMockReviews();
        renderReviews(reviews, container);
      }
    } catch (error) {
      renderError(container, placeId);
      console.error('Erreur lors du chargement des avis', error);
    }
  }, 1500);
}

/**
 * Récupère les avis depuis le Worker Cloudflare en production
 */
async function fetchProductionReviews(placeId, container) {
  try {
    // URL du Worker Cloudflare (format de production)
    const apiUrl = `https://votre-worker.votre-account.workers.dev/?placeId=${placeId}`;
    
    // Appel au Worker Cloudflare
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Erreur réseau: ${response.status}`);
    }
    
    // Récupération des données
    const data = await response.json();
    
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
        const ratingHeader = document.querySelector('.text-primary');
        if (ratingHeader) {
          ratingHeader.textContent = data.result.rating.toFixed(1) + '/5';
        }
      }
    } else {
      console.error('Format de données incorrect:', data);
      throw new Error('Format de données incorrect');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    renderError(container, placeId);
  }
}

/**
 * Affiche les avis dans le conteneur
 */
function renderReviews(reviews, container) {
  container.innerHTML = reviews.map(review => `
    <div class="review-card bg-gray-50 dark:bg-gray-800 p-6 rounded-xl hover:shadow-lg transition-all">
      <div class="flex items-center gap-4 mb-4">
        <img src="${review.profile_photo_url}" 
             alt="Photo de ${review.author_name}" 
             class="w-12 h-12 rounded-full object-cover"
             loading="lazy">
        <div>
          <p class="font-bold">${review.author_name}</p>
          <div class="flex items-center gap-1 text-yellow-400">
            ${'★'.repeat(review.rating)}${review.rating % 1 !== 0 ? '½' : ''}
          </div>
        </div>
      </div>
      <p class="text-gray-600 dark:text-gray-300 mb-4">${review.text}</p>
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>${formatDate(review.time)}</span>
        <a href="${review.author_url}" 
           target="_blank" 
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
