/**
 * Récupération et affichage des avis Google pour Auto Pièces Équipements
 * Version améliorée avec simulation d'API et cache local
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
  
  // Afficher l'indicateur de chargement
  if (loadingElement) loadingElement.style.display = 'flex';
  
  // Vérifier si des avis sont en cache et toujours valides
  const cachedReviews = getCachedReviews();
  if (cachedReviews) {
    renderReviews(cachedReviews, container);
    updateGlobalRating(4.9, 4924);
    if (loadingElement) loadingElement.style.display = 'none';
    return;
  }
  
  // Simuler la récupération depuis une API (avec délai variable pour plus de réalisme)
  const fetchDelay = Math.random() * 1000 + 800; // Entre 800ms et 1800ms
  setTimeout(() => {
    try {
      // Dans un environnement réel, cette fonction ferait un appel à votre backend PHP/Node.js
      fetchReviews()
        .then(reviews => {
          // Enregistrer dans le cache
          cacheReviews(reviews);
          
          // Afficher les avis
          renderReviews(reviews, container);
          updateGlobalRating(4.9, 4924);
          
          // Masquer le loader
          if (loadingElement) loadingElement.style.display = 'none';
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des avis:', error);
          renderError(container);
          if (loadingElement) loadingElement.style.display = 'none';
        });
    } catch (error) {
      renderError(container);
      if (loadingElement) loadingElement.style.display = 'none';
      console.error('Erreur lors du chargement des avis', error);
    }
  }, fetchDelay);
}

/**
 * Récupère les avis (version simulée)
 * Dans un environnement de production, cette fonction appellerait votre API backend
 */
async function fetchReviews() {
  // Simulation d'un appel API
  return new Promise((resolve) => {
    // Récupérer tous les avis statiques
    const allReviews = getAllStaticReviews();
    
    // En sélectionner un sous-ensemble aléatoire pour la variété
    const randomSubset = getRandomSubset(allReviews, 6);
    
    // Trier par les plus récents en premier
    randomSubset.sort((a, b) => b.time - a.time);
    
    resolve(randomSubset);
  });
}

/**
 * Vérifie si des avis sont déjà en cache et toujours valides
 */
function getCachedReviews() {
  try {
    const cachedData = localStorage.getItem('google-reviews-cache');
    if (!cachedData) return null;
    
    const { reviews, timestamp } = JSON.parse(cachedData);
    
    // Vérifier si le cache est encore valide (1 heure)
    const now = new Date().getTime();
    if (now - timestamp > 3600000) return null; // Expiré
    
    return reviews;
  } catch (e) {
    console.warn('Erreur lors de la lecture du cache:', e);
    return null;
  }
}

/**
 * Enregistre les avis dans le cache local
 */
function cacheReviews(reviews) {
  try {
    const cacheData = {
      reviews,
      timestamp: new Date().getTime()
    };
    
    localStorage.setItem('google-reviews-cache', JSON.stringify(cacheData));
  } catch (e) {
    console.warn('Erreur lors de l\'enregistrement en cache:', e);
  }
}

/**
 * Sélectionne un sous-ensemble aléatoire d'éléments d'un tableau
 */
function getRandomSubset(array, size) {
  // Copier le tableau pour ne pas modifier l'original
  const shuffled = [...array];
  
  // Mélanger le tableau (algorithme de Fisher-Yates)
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Renvoyer le nombre d'éléments demandé
  return shuffled.slice(0, size);
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
  // Générer le HTML pour chaque avis
  const reviewsHTML = reviews.map(review => `
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
  
  // Ajouter le bouton "Voir plus d'avis"
  const loadMoreButton = `
    <div class="text-center col-span-full mt-6">
      <button id="load-more-reviews" class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition">
        Voir plus d'avis
      </button>
    </div>
  `;
  
  // Mettre à jour le conteneur
  container.innerHTML = reviewsHTML + loadMoreButton;
  
  // Ajouter l'événement au bouton "Voir plus"
  document.getElementById('load-more-reviews')?.addEventListener('click', function() {
    loadMoreReviews(container);
  });
}

/**
 * Charge plus d'avis quand l'utilisateur clique sur "Voir plus"
 */
function loadMoreReviews(container) {
  // Masquer le bouton pendant le chargement
  const loadMoreBtn = document.getElementById('load-more-reviews');
  if (loadMoreBtn) {
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Chargement...';
    loadMoreBtn.disabled = true;
  }
  
  // Simuler un délai de chargement
  setTimeout(() => {
    // Récupérer 3 avis supplémentaires
    const additionalReviews = getRandomSubset(getAllStaticReviews(), 3);
    
    // Créer le HTML pour les nouveaux avis
    const newReviewsHTML = additionalReviews.map(review => `
      <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm transition-all hover:shadow-md opacity-0" style="animation: fadeIn 0.5s forwards;">
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
    
    // Injecter les nouveaux avis avant le bouton
    if (loadMoreBtn) {
      loadMoreBtn.insertAdjacentHTML('beforebegin', newReviewsHTML);
      
      // Réinitialiser le bouton
      loadMoreBtn.innerHTML = 'Voir plus d\'avis';
      loadMoreBtn.disabled = false;
    }
    
    // Ajouter un style d'animation pour les nouveaux éléments
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }, 1200);
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
function renderError(container) {
  container.innerHTML = `
    <div class="text-center col-span-full py-12">
      <p class="text-gray-500 mb-4">Impossible de charger les avis</p>
      <a href="https://search.google.com/local/reviews?placeid=ChIJVVXZlqAT5kcRICTpgHlqx9A" 
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
 * Renvoie tous les avis statiques disponibles
 * Cette fonction est utilisée pour simuler une base de données d'avis
 * 
 * Pour une implémentation réelle, voici comment récupérer les vrais avis Google:
 * 
 * 1. Option PHP: Créer un script PHP qui récupère les avis et les stocke en cache
 *    ```php
 *    <?php
 *    // Récupérer les avis depuis l'API Google Places
 *    $api_key = 'VOTRE_CLE_API';
 *    $place_id = 'VOTRE_PLACE_ID';
 *    $url = "https://maps.googleapis.com/maps/api/place/details/json?place_id={$place_id}&fields=reviews,rating,user_ratings_total&key={$api_key}";
 *    
 *    // Vérifier le cache
 *    $cache_file = 'reviews-cache.json';
 *    $cache_time = 3600; // 1 heure
 *    
 *    if (file_exists($cache_file) && (time() - filemtime($cache_file) < $cache_time)) {
 *        // Utiliser le cache
 *        echo file_get_contents($cache_file);
 *    } else {
 *        // Récupérer de nouvelles données
 *        $response = file_get_contents($url);
 *        file_put_contents($cache_file, $response);
 *        echo $response;
 *    }
 *    ```
 * 
 * 2. Option Node.js: Créer un petit serveur Node.js qui fait la même chose
 *    ```javascript
 *    const express = require('express');
 *    const axios = require('axios');
 *    const fs = require('fs');
 *    const app = express();
 *    
 *    app.get('/api/reviews', async (req, res) => {
 *      const cacheFile = './reviews-cache.json';
 *      const cacheTime = 3600 * 1000; // 1 heure en ms
 *      
 *      try {
 *        // Vérifier le cache
 *        if (fs.existsSync(cacheFile)) {
 *          const stats = fs.statSync(cacheFile);
 *          if (Date.now() - stats.mtimeMs < cacheTime) {
 *            // Utiliser le cache
 *            const data = fs.readFileSync(cacheFile, 'utf8');
 *            return res.send(JSON.parse(data));
 *          }
 *        }
 *        
 *        // Récupérer nouvelles données
 *        const response = await axios.get(
 *          `https://maps.googleapis.com/maps/api/place/details/json?place_id=VOTRE_PLACE_ID&fields=reviews,rating,user_ratings_total&key=VOTRE_CLE_API`
 *        );
 *        
 *        // Sauvegarder dans le cache
 *        fs.writeFileSync(cacheFile, JSON.stringify(response.data));
 *        
 *        res.send(response.data);
 *      } catch (error) {
 *        res.status(500).send({ error: 'Erreur serveur' });
 *      }
 *    });
 *    
 *    app.listen(3000, () => console.log('Serveur démarré sur le port 3000'));
 *    ```
 */
function getAllStaticReviews() {
  return [
    {
      "author_name": "Marc Dupont",
      "author_url": "https://www.google.com/maps/contrib/123456789",
      "profile_photo_url": "https://randomuser.me/api/portraits/men/32.jpg",
      "rating": 5,
      "text": "Service exceptionnel ! J'ai commandé des plaquettes de frein pour ma Renault Clio et ils m'ont conseillé parfaitement. Livraison en moins de 24h, montage facile, ma voiture est comme neuve !",
      "time": 1678524000 // 11 Mars 2023
    },
    {
      "author_name": "Sophie Laurent",
      "author_url": "https://www.google.com/maps/contrib/987654321",
      "profile_photo_url": "https://randomuser.me/api/portraits/women/44.jpg",
      "rating": 5,
      "text": "La meilleure boutique de pièces auto du 93 ! Prix imbattables et conseils vraiment professionnels. J'ai économisé plus de 200€ sur mes amortisseurs par rapport au garage.",
      "time": 1683835200 // 12 Mai 2023
    },
    {
      "author_name": "Karim Benali",
      "author_url": "https://www.google.com/maps/contrib/456789123",
      "profile_photo_url": "https://randomuser.me/api/portraits/men/75.jpg",
      "rating": 4,
      "text": "Très bonne expérience globale. Pièces de qualité et conformes à ma BMW. Seul petit bémol : le délai de livraison a été un peu plus long que prévu (48h au lieu de 24h). Je recommande quand même !",
      "time": 1688169600 // 1 Juillet 2023
    },
    {
      "author_name": "Julie Moreau",
      "author_url": "https://www.google.com/maps/contrib/123789456",
      "profile_photo_url": "https://randomuser.me/api/portraits/women/65.jpg",
      "rating": 5,
      "text": "J'étais un peu perdue pour trouver la bonne pièce pour ma Peugeot 208, le service client a été d'une aide précieuse par téléphone. Ils m'ont guidée pas à pas et j'ai reçu exactement ce qu'il me fallait !",
      "time": 1693526400 // 1 Septembre 2023
    },
    {
      "author_name": "François Martin",
      "author_url": "https://www.google.com/maps/contrib/456123789",
      "profile_photo_url": "https://randomuser.me/api/portraits/men/41.jpg",
      "rating": 5,
      "text": "Après avoir fait plusieurs magasins, c'est ici que j'ai trouvé le meilleur rapport qualité/prix pour mes amortisseurs. Le système de recherche par immatriculation est vraiment pratique et précis.",
      "time": 1698796800 // 1 Novembre 2023
    },
    {
      "author_name": "Mohammed Bakir",
      "author_url": "https://www.google.com/maps/contrib/789123456",
      "profile_photo_url": "https://randomuser.me/api/portraits/men/57.jpg",
      "rating": 4.5,
      "text": "Je suis mécanicien professionnel et je commande régulièrement chez Auto Pièces Équipements. La qualité est toujours au rendez-vous et les prix sont compétitifs. Parfois quelques jours de délai pour les pièces rares.",
      "time": 1704067200 // 1 Janvier 2024
    },
    {
      "author_name": "Léa Dubois",
      "author_url": "https://www.google.com/maps/contrib/321654987",
      "profile_photo_url": "https://randomuser.me/api/portraits/women/33.jpg",
      "rating": 5,
      "text": "Je cherchais des phares LED spécifiques pour ma Golf, introuvables ailleurs. Non seulement ils les avaient en stock, mais ils m'ont même aidé à les installer ! Un service vraiment complet.",
      "time": 1706745600 // 1 Février 2024
    },
    {
      "author_name": "Antoine Mercier",
      "author_url": "https://www.google.com/maps/contrib/159753456",
      "profile_photo_url": "https://randomuser.me/api/portraits/men/36.jpg",
      "rating": 4,
      "text": "Les produits sont de très bonne qualité. J'ai apprécié les conseils techniques, mais l'attente en magasin était un peu longue. Cela dit, ça valait le coup d'attendre pour avoir les bonnes pièces.",
      "time": 1704672000 // 8 Janvier 2024
    },
    {
      "author_name": "Emilie Roux",
      "author_url": "https://www.google.com/maps/contrib/753159852",
      "profile_photo_url": "https://randomuser.me/api/portraits/women/22.jpg",
      "rating": 5,
      "text": "Un service client exceptionnel ! Ils ont pris le temps de m'expliquer chaque étape pour remplacer ma batterie, même si je n'y connaissais rien. Je recommande vivement !",
      "time": 1701475200 // 2 Décembre 2023
    },
    {
      "author_name": "Thierry Lambert",
      "author_url": "https://www.google.com/maps/contrib/987321654",
      "profile_photo_url": "https://randomuser.me/api/portraits/men/62.jpg",
      "rating": 5,
      "text": "Imbattable sur les prix et la qualité. J'ai comparé avec plusieurs enseignes et sites en ligne, c'est ici que j'ai trouvé la meilleure offre pour l'entretien complet de ma Mégane.",
      "time": 1696118400 // 1 Octobre 2023
    },
    {
      "author_name": "Nadia Boucher",
      "author_url": "https://www.google.com/maps/contrib/456789321",
      "profile_photo_url": "https://randomuser.me/api/portraits/women/54.jpg",
      "rating": 4,
      "text": "Magasin bien organisé avec un large choix de pièces. Le site internet est très pratique pour vérifier la disponibilité des produits avant de se déplacer. Personnel compétent.",
      "time": 1698192000 // 25 Octobre 2023
    },
    {
      "author_name": "Patrick Leroy",
      "author_url": "https://www.google.com/maps/contrib/123987456",
      "profile_photo_url": "https://randomuser.me/api/portraits/men/29.jpg",
      "rating": 3,
      "text": "Produits de bonne qualité, mais le système de commande en ligne a eu quelques bugs lors de ma dernière commande. Le service client a cependant été réactif pour résoudre le problème.",
      "time": 1685649600 // 2 Juin 2023
    }
  ];
}
