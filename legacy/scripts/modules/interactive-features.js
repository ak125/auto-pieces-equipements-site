/**
 * Fonctionnalités interactives modernes
 * Auto Pièces Équipements
 */

// Catégories pour la recherche diagnostique
const diagnosticCategories = [
  { name: "Moteur", icon: "🛠️" },
  { name: "Freinage", icon: "🛞" },
  { name: "Suspension", icon: "🔧" },
  { name: "Électronique", icon: "🔋" },
  { name: "Outillage", icon: "🧰" },
  { name: "Carrosserie", icon: "🚗" },
  { name: "Huiles & Fluides", icon: "💧" },
  { name: "Filtration", icon: "🔍" }
];

/**
 * Initialise toutes les fonctionnalités interactives modernes
 */
export function initInteractiveFeatures() {
  setupDiagnosticSearch();
  setupVehicleBadge();
  setupTechnicalityGauge();
  setupExpertiseButtons();
  animateHeader();
}

/**
 * Configure la recherche diagnostique interactive
 */
function setupDiagnosticSearch() {
  const searchContainer = document.querySelector('.diagnostic-search');
  if (!searchContainer) return;

  const input = searchContainer.querySelector('input');
  const dropdown = searchContainer.querySelector('.search-dropdown');
  
  // Fonction pour filtrer les catégories
  function filterCategories(query) {
    if (!query) return diagnosticCategories;
    
    return diagnosticCategories.filter(cat =>
      cat.name.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  // Fonction pour afficher les résultats
  function showResults(categories) {
    dropdown.innerHTML = '';
    
    categories.forEach(cat => {
      const option = document.createElement('div');
      option.className = 'search-option';
      option.innerHTML = `<span class="icon">${cat.icon}</span> ${cat.name}`;
      
      option.addEventListener('click', () => {
        input.value = cat.name;
        dropdown.classList.remove('active');
        
        // Simuler la soumission de recherche
        searchContainer.dispatchEvent(new CustomEvent('search', { 
          detail: { category: cat.name } 
        }));
      });
      
      dropdown.appendChild(option);
    });
    
    dropdown.classList.add('active');
  }
  
  // Écouteur d'événements pour l'input
  input.addEventListener('input', () => {
    const results = filterCategories(input.value);
    showResults(results);
  });
  
  // Écouteur pour le focus
  input.addEventListener('focus', () => {
    const results = filterCategories(input.value);
    showResults(results);
  });
  
  // Cacher le dropdown au clic extérieur
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
  
  // Événement personnalisé pour la recherche
  searchContainer.addEventListener('search', (e) => {
    console.log(`Recherche dans la catégorie: ${e.detail.category}`);
    // Ici, vous pourriez rediriger vers une page de résultats ou effectuer une recherche AJAX
  });
}

/**
 * Configure le badge de détection de véhicule
 */
function setupVehicleBadge() {
  const badge = document.querySelector('.vehicle-badge');
  if (!badge) return;
  
  // Simuler la détection du véhicule après un court délai
  setTimeout(() => {
    badge.classList.add('pulse');
    
    // Obtenir le véhicule depuis localStorage ou utiliser une valeur par défaut
    const savedVehicle = localStorage.getItem('userVehicle');
    const vehicleName = savedVehicle || "Renault Clio IV";
    
    badge.querySelector('.vehicle-name').textContent = vehicleName;
    badge.style.display = 'inline-flex';
  }, 1500);
  
  // Ajouter un gestionnaire d'événements pour changer le véhicule
  badge.addEventListener('click', () => {
    const newVehicle = prompt("Entrez votre modèle de véhicule:", badge.querySelector('.vehicle-name').textContent);
    
    if (newVehicle) {
      badge.querySelector('.vehicle-name').textContent = newVehicle;
      localStorage.setItem('userVehicle', newVehicle);
      
      // Animation de confirmation
      badge.classList.remove('pulse');
      void badge.offsetWidth; // Forcer le reflow
      badge.classList.add('pulse');
    }
  });
}

/**
 * Configure les jauges de technicité pour les produits
 */
function setupTechnicalityGauge() {
  const gauges = document.querySelectorAll('.technicality-gauge');
  
  gauges.forEach(gauge => {
    const level = parseInt(gauge.dataset.level || 1, 10);
    const dots = gauge.querySelectorAll('.dot');
    const label = gauge.querySelector('.label');
    
    // Définir les étiquettes selon le niveau
    const labels = [
      "Débutant",
      "Facile",
      "Intermédiaire",
      "Avancé",
      "Professionnel"
    ];
    
    // Animer les points selon le niveau
    dots.forEach((dot, index) => {
      setTimeout(() => {
        if (index < level) {
          dot.classList.add('active');
        }
      }, index * 150); // Délai progressif
    });
    
    // Mettre à jour l'étiquette
    if (label) {
      label.textContent = `Technicité : ${labels[level - 1] || 'Intermédiaire'}`;
    }
  });
}

/**
 * Configure les boutons d'expertise DIY et PRO
 */
function setupExpertiseButtons() {
  const diyBtn = document.querySelector('.btn-diy');
  const proBtn = document.querySelector('.btn-pro');
  
  if (!diyBtn || !proBtn) return;
  
  diyBtn.addEventListener('click', () => {
    // Filtrer les produits DIY
    filterProductsByExpertise('diy');
    
    // Mettre à jour l'apparence des boutons
    diyBtn.classList.add('active');
    proBtn.classList.remove('active');
  });
  
  proBtn.addEventListener('click', () => {
    // Filtrer les produits PRO
    filterProductsByExpertise('pro');
    
    // Mettre à jour l'apparence des boutons
    proBtn.classList.add('active');
    diyBtn.classList.remove('active');
  });
}

/**
 * Filtre les produits selon le niveau d'expertise
 */
function filterProductsByExpertise(expertise) {
  const products = document.querySelectorAll('.product-card, article');
  
  products.forEach(product => {
    // Obtenir le niveau d'expertise du produit
    const productExpertise = product.dataset.expertise || 'diy';
    
    if (expertise === 'diy' && productExpertise === 'diy') {
      // Afficher avec animation
      showProductWithAnimation(product);
    } else if (expertise === 'pro' && productExpertise === 'pro') {
      // Afficher avec animation
      showProductWithAnimation(product);
    } else {
      // Masquer avec animation
      hideProductWithAnimation(product);
    }
  });
}

/**
 * Affiche un produit avec animation
 */
function showProductWithAnimation(product) {
  product.style.opacity = '0';
  product.style.display = 'block';
  
  setTimeout(() => {
    product.style.opacity = '1';
    product.style.transform = 'translateY(0)';
    product.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  }, 50);
}

/**
 * Cache un produit avec animation
 */
function hideProductWithAnimation(product) {
  product.style.opacity = '0';
  product.style.transform = 'translateY(20px)';
  product.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  
  setTimeout(() => {
    product.style.display = 'none';
  }, 300);
}

/**
 * Anime l'en-tête avec effet de phare
 */
function animateHeader() {
  const header = document.querySelector('.header-animated');
  if (!header) return;
  
  // L'animation est contrôlée par CSS mais nous pouvons ajouter des détails ici
  console.log('Animation d\'en-tête initialisée');
}
