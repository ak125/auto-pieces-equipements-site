import './style.css';
import { getGoogleReviews, generateStars } from './api.js';

// Configuration de l'application
const app = document.querySelector('#app');

// Template HTML
app.innerHTML = `
  <div class="container">
    <header class="header">
      <h1>🚗 Auto Pièces Équipements</h1>
      <p class="subtitle">Vos avis Google en temps réel</p>
      <div class="stats" id="stats"></div>
    </header>
    
    <div id="content" class="loading">
      <div class="spinner"></div>
      <p>⏳ Chargement des avis Google...</p>
    </div>
  </div>
`;

// Fonction pour afficher les statistiques
function displayStats(data) {
  const statsEl = document.getElementById('stats');
  statsEl.innerHTML = `
    <div class="stat">
      <div class="stat-value">⭐ ${data.rating}</div>
      <div class="stat-label">Note Moyenne</div>
    </div>
    <div class="stat">
      <div class="stat-value">${data.totalReviews}</div>
      <div class="stat-label">Avis Total</div>
    </div>
    <div class="stat">
      <div class="stat-value">${data.reviews.length}</div>
      <div class="stat-label">Avis Affichés</div>
    </div>
  `;
}

// Fonction pour afficher les avis
function displayReviews(data) {
  const contentEl = document.getElementById('content');
  
  const reviewsHTML = data.reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <img src="${review.profile_photo_url}" alt="${review.author_name}" class="review-avatar">
        <div>
          <div class="review-author">${review.author_name}</div>
          <div class="review-date">${review.relative_time_description}</div>
        </div>
      </div>
      <div class="review-rating">${generateStars(review.rating)}</div>
      <div class="review-text">${review.text}</div>
    </div>
  `).join('');

  contentEl.innerHTML = `
    <div class="success">
      ✅ <strong>Succès !</strong> Les avis Google sont récupérés correctement.
      <br><br>
      <strong>Établissement :</strong> ${data.name}<br>
      <strong>Adresse :</strong> ${data.address || 'Non disponible'}<br>
      <strong>Téléphone :</strong> ${data.phone || 'Non disponible'}
    </div>
    <div class="reviews-grid">
      ${reviewsHTML}
    </div>
  `;
}

// Fonction pour afficher une erreur
function displayError(error) {
  const contentEl = document.getElementById('content');
  contentEl.innerHTML = `
    <div class="error">
      ❌ <strong>Erreur :</strong> ${error.message || 'Erreur inconnue'}
      <br><br>
      ${error.error ? `<code>${error.error}</code><br><br>` : ''}
      Vérifiez la console pour plus de détails.
    </div>
  `;
}

// Charger les avis au démarrage
async function init() {
  console.log('🚀 Chargement des avis Google...');
  
  const result = await getGoogleReviews();
  
  if (result.success) {
    console.log('✅ Avis chargés avec succès:', result.data);
    displayStats(result.data);
    displayReviews(result.data);
  } else {
    console.error('❌ Erreur lors du chargement:', result);
    displayError(result);
  }
}

// Démarrer l'application
init();
