/**
 * Module d'amélioration des produits
 * Améliore la section des produits sans modifier le HTML existant
 */

document.addEventListener('DOMContentLoaded', () => {
  enhanceProductSection();
});

/**
 * Améliore la section produits avec filtres et interactions
 */
function enhanceProductSection() {
  const productsSection = document.getElementById('meilleures-pieces');
  if (!productsSection) return;
  
  // 1. Ajouter un système de filtrage au-dessus des produits
  addFilteringSystem(productsSection);
  
  // 2. Améliorer chaque carte produit
  enhanceProductCards();
  
  // 3. Ajouter un bouton "Voir plus" à la fin de la section
  addViewMoreButton(productsSection);
  
  console.log('🛠️ Section produits améliorée avec filtres et interactions');
}

/**
 * Ajoute un système de filtrage au-dessus des produits
 */
function addFilteringSystem(container) {
  // Créer le conteneur de filtre
  const filterContainer = document.createElement('div');
  filterContainer.className = 'flex flex-col md:flex-row justify-between items-center mb-6';
  
  // Créer les boutons de filtre
  const filterButtons = document.createElement('div');
  filterButtons.className = 'inline-flex rounded-md shadow-sm mt-4 md:mt-0';
  filterButtons.setAttribute('role', 'group');
  filterButtons.innerHTML = `
    <button type="button" class="filter-btn active px-4 py-2 text-sm font-medium rounded-l-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" data-filter="all">
      Tous
    </button>
    <button type="button" class="filter-btn px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" data-filter="popular">
      Populaires
    </button>
    <button type="button" class="filter-btn px-4 py-2 text-sm font-medium rounded-r-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" data-filter="promo">
      Promos
    </button>
  `;
  
  // Insérer le filtre avant la grille de produits
  const heading = container.querySelector('h2');
  
  // Conserver le titre mais ajouter les contrôles de filtre
  if (heading) {
    // Créer un nouveau conteneur qui contient le titre original et les filtres
    const headerContainer = document.createElement('div');
    headerContainer.className = 'flex flex-col md:flex-row justify-between items-center mb-6';
    
    // Cloner le titre pour le préserver
    const titleClone = heading.cloneNode(true);
    headerContainer.appendChild(titleClone);
    headerContainer.appendChild(filterButtons);
    
    // Remplacer le titre original par notre nouveau conteneur
    heading.parentNode.replaceChild(headerContainer, heading);
  } else {
    // Fallback si le titre n'est pas trouvé
    container.insertBefore(filterContainer, container.firstChild);
  }
  
  // Ajouter les gestionnaires d'événements pour les filtres
  setupFilterHandlers();
}

/**
 * Configure les gestionnaires d'événements pour les filtres
 */
function setupFilterHandlers() {
  // Attribuer des catégories aux produits existants
  const products = document.querySelectorAll('#meilleures-pieces article');
  
  // Attribuer des catégories fictives pour la démo
  products.forEach((product, index) => {
    // Ajouter l'attribut data-categories
    let categories;
    if (index % 3 === 0) {
      categories = 'popular,promo';
    } else if (index % 2 === 0) {
      categories = 'popular';
    } else {
      categories = 'promo';
    }
    product.setAttribute('data-categories', categories);
    product.classList.add('filter-product');
    
    // Ajouter un badge si c'est une promo
    if (categories.includes('promo')) {
      const badge = document.createElement('span');
      badge.className = 'product-badge bg-green-500 text-white py-1 px-3 absolute top-3 right-3 rounded-full text-xs font-bold z-10';
      badge.textContent = '-15%';
      product.style.position = 'relative';
      product.appendChild(badge);
    }
    
    // Ajouter un badge si c'est populaire
    if (categories.includes('popular') && !categories.includes('promo')) {
      const badge = document.createElement('span');
      badge.className = 'product-badge bg-primary text-white py-1 px-3 absolute top-3 right-3 rounded-full text-xs font-bold z-10';
      badge.textContent = 'TOP VENTES';
      product.style.position = 'relative';
      product.appendChild(badge);
    }
  });
  
  // Gestionnaire de clic sur les boutons de filtrage
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Mise à jour de l'UI des boutons
      filterButtons.forEach(btn => btn.classList.remove('active', 'bg-gray-200', 'dark:bg-gray-600'));
      button.classList.add('active', 'bg-gray-200', 'dark:bg-gray-600');
      
      const filter = button.getAttribute('data-filter');
      
      // Filtrer les produits
      filterProducts(filter);
    });
  });
}

/**
 * Filtre les produits selon la catégorie sélectionnée
 */
function filterProducts(filter) {
  const products = document.querySelectorAll('.filter-product');
  
  products.forEach(item => {
    const categories = item.getAttribute('data-categories') || '';
    
    // Si on montre tous les produits ou si le produit appartient à la catégorie filtrée
    const shouldShow = filter === 'all' || categories.includes(filter);
    
    if (shouldShow) {
      // Montrer avec animation
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.display = 'block';
      
      // Temporisation pour l'animation
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      }, 50);
    } else {
      // Cacher avec animation
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      // Cacher après l'animation
      setTimeout(() => {
        item.style.display = 'none';
      }, 300);
    }
  });
}

/**
 * Améliore les cartes produits existantes
 */
function enhanceProductCards() {
  const productCards = document.querySelectorAll('#meilleures-pieces article');
  
  productCards.forEach(card => {
    // Ajouter des classes pour le style et les animations
    card.classList.add('relative', 'overflow-hidden', 'transition-all', 'duration-300');
    
    // Trouver l'image du produit
    const imageContainer = card.querySelector('.relative');
    if (imageContainer) {
      // Créer un conteneur pour les boutons d'action rapide
      const quickActionButtons = document.createElement('div');
      quickActionButtons.className = 'absolute -bottom-10 left-0 right-0 flex justify-center gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:bottom-4';
      quickActionButtons.innerHTML = `
        <button class="quick-view-btn bg-white text-gray-800 p-2 rounded-full shadow hover:bg-gray-100" 
                aria-label="Aperçu rapide">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
        <button class="compare-btn bg-white text-gray-800 p-2 rounded-full shadow hover:bg-gray-100" 
                aria-label="Comparer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line></svg>
        </button>
      `;
      
      // Ajouter les classes pour l'effet de survol
      imageContainer.classList.add('group');
      
      // Ajouter les boutons d'action rapide
      imageContainer.appendChild(quickActionButtons);
      
      // Créer un conteneur pour l'image qui fera l'effet de zoom
      const imgElement = imageContainer.querySelector('img');
      if (imgElement) {
        const imageWrap = document.createElement('div');
        imageWrap.className = 'product-image-container absolute inset-0 transition-transform duration-500 group-hover:scale-105';
        
        // Déplacer l'image dans le nouveau conteneur
        imgElement.parentNode.insertBefore(imageWrap, imgElement);
        imageWrap.appendChild(imgElement);
      }
    }
    
    // Ajouter des gestionnaires d'événements pour les boutons d'action
    setupCardInteractions(card);
  });
}

/**
 * Configure les interactions pour une carte produit
 */
function setupCardInteractions(card) {
  const quickViewBtn = card.querySelector('.quick-view-btn');
  const compareBtn = card.querySelector('.compare-btn');
  
  if (quickViewBtn) {
    quickViewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const productName = card.querySelector('h3')?.textContent || 'Produit';
      alert(`Aperçu rapide: ${productName}`);
    });
  }
  
  if (compareBtn) {
    compareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Ajouter/retirer la classe de comparaison
      if (card.classList.contains('comparing')) {
        card.classList.remove('comparing', 'ring-2', 'ring-primary');
        compareBtn.classList.remove('bg-primary', 'text-white');
      } else {
        card.classList.add('comparing', 'ring-2', 'ring-primary');
        compareBtn.classList.add('bg-primary', 'text-white');
        
        // Simuler l'ajout au comparateur
        const productName = card.querySelector('h3')?.textContent || 'Produit';
        console.log(`Produit ajouté au comparateur: ${productName}`);
      }
    });
  }
}

/**
 * Ajoute un bouton "Voir plus" à la fin de la section
 */
function addViewMoreButton(container) {
  // Vérifier si un bouton existe déjà pour éviter les doublons
  if (container.querySelector('.view-more-btn')) return;
  
  const viewMoreContainer = document.createElement('div');
  viewMoreContainer.className = 'text-center mt-8';
  
  const viewMoreBtn = document.createElement('a');
  viewMoreBtn.href = '#';
  viewMoreBtn.className = 'view-more-btn inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors';
  viewMoreBtn.innerHTML = `
    <span>Voir tout le catalogue</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
  `;
  
  viewMoreBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Cette fonctionnalité ouvrira la page complète du catalogue');
  });
  
  viewMoreContainer.appendChild(viewMoreBtn);
  container.appendChild(viewMoreContainer);
}

// Exporter les fonctions pour utilisation dans d'autres modules
export {
  enhanceProductSection,
  filterProducts
};
