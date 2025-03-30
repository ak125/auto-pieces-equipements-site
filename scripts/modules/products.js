/**
 * Module de gestion des produits
 * Auto Pièces Équipements
 */

/**
 * Configure les filtres et interactions produits
 */
export function setupProductFilters() {
  // Filtres de produits
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productItems = document.querySelectorAll('.filter-product');
  
  if (filterButtons.length === 0 || productItems.length === 0) return;
  
  // Gestionnaire de clic sur les boutons de filtrage
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Mise à jour de l'UI des boutons
      filterButtons.forEach(btn => btn.classList.remove('active', 'bg-gray-200', 'dark:bg-gray-600'));
      button.classList.add('active', 'bg-gray-200', 'dark:bg-gray-600');
      
      const filter = button.getAttribute('data-filter');
      
      // Filtrer les produits
      filterProducts(filter, productItems);
    });
  });
  
  // Gestionnaires pour les boutons d'actions rapides
  setupQuickViewButtons();
  setupCompareButtons();
}

/**
 * Filtre les produits selon la catégorie sélectionnée
 */
function filterProducts(filter, products) {
  // Animation des produits
  products.forEach(item => {
    // Si on montre tous les produits ou si le produit appartient à la catégorie filtrée
    const shouldShow = filter === 'all' || item.getAttribute('data-categories').includes(filter);
    
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
 * Configure les boutons d'aperçu rapide
 */
function setupQuickViewButtons() {
  const quickViewButtons = document.querySelectorAll('.quick-view-btn');
  
  quickViewButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Trouver le produit parent
      const productCard = button.closest('.product-card');
      if (!productCard) return;
      
      // Extraire les données du produit
      const productName = productCard.querySelector('h3').textContent;
      const productPrice = productCard.querySelector('[itemprop="price"]').textContent;
      const productImgSrc = productCard.querySelector('img').src;
      
      // Simuler une modale d'aperçu rapide (dans un cas réel, ouvrirait une vraie modale)
      alert(`Aperçu rapide: ${productName} - ${productPrice}€`);
    });
  });
}

/**
 * Configure les boutons de comparaison
 */
function setupCompareButtons() {
  const compareButtons = document.querySelectorAll('.compare-btn');
  let comparedProducts = [];
  
  compareButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Trouver le produit parent
      const productCard = button.closest('.product-card');
      if (!productCard) return;
      
      // Extraire les données du produit
      const productName = productCard.querySelector('h3').textContent;
      const productId = productCard.querySelector('[itemprop="mpn"]').content;
      
      // Ajouter/retirer de la liste de comparaison
      if (!comparedProducts.some(p => p.id === productId)) {
        if (comparedProducts.length >= 3) {
          alert('Vous ne pouvez pas comparer plus de 3 produits à la fois.');
          return;
        }
        
        comparedProducts.push({
          id: productId,
          name: productName
        });
        
        // Mettre en évidence le produit sélectionné
        productCard.classList.add('ring-2', 'ring-primary');
        button.classList.add('bg-primary', 'text-white');
      } else {
        // Retirer de la comparaison
        comparedProducts = comparedProducts.filter(p => p.id !== productId);
        
        // Réinitialiser le style
        productCard.classList.remove('ring-2', 'ring-primary');
        button.classList.remove('bg-primary', 'text-white');
      }
      
      // Afficher un message récapitulatif
      if (comparedProducts.length > 0) {
        console.log(`Produits à comparer: ${comparedProducts.map(p => p.name).join(', ')}`);
        
        // Dans une implémentation réelle, afficherait un badge de compteur
        // ou ouvrirait une modale de comparaison
      }
    });
  });
}
