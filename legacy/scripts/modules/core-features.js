/**
 * Fonctionnalités de base du site
 * Auto Pièces Équipements
 */

/**
 * Initialise toutes les fonctionnalités de base
 */
export function initCoreFeatures() {
  setupMobileMenu();
  setupScrollEffects();
  setupLazyLoading();
  setupVideoPlayer();
  setupDarkModeToggle();
  setupAccessibility();
}

/**
 * Configure le menu mobile
 */
function setupMobileMenu() {
  const menuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (!menuButton || !mobileMenu) return;
  
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', !expanded);
    mobileMenu.classList.toggle('hidden');
    
    // Changer l'icône du bouton
    const icon = menuButton.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', expanded ? 'menu' : 'x');
      if (window.lucide) {
        lucide.createIcons();
      }
    }
  });
  
  // Fermer le menu lorsqu'on clique sur un lien
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuButton.setAttribute('aria-expanded', 'false');
      
      // Restaurer l'icône du menu
      const icon = menuButton.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', 'menu');
        if (window.lucide) {
          lucide.createIcons();
        }
      }
    });
  });
}

/**
 * Configure les effets de défilement
 */
function setupScrollEffects() {
  // Vérifier si IntersectionObserver est disponible
  if (!('IntersectionObserver' in window)) return;
  
  // Observer pour les animations au défilement
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        // Supprimer l'observateur après l'animation
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  // Observer toutes les sections et les éléments animables
  document.querySelectorAll('section, .animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
  
  // Navigation fluide pour les ancres
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Calcul du décalage pour la navigation fixe
        const offset = 80; // Hauteur de l'en-tête fixe
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Configure le chargement paresseux des images
 */
function setupLazyLoading() {
  // Vérifier si IntersectionObserver est disponible
  if (!('IntersectionObserver' in window)) {
    // Fallback pour les navigateurs qui ne supportent pas IntersectionObserver
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
    return;
  }
  
  // Observer pour les images à chargement différé
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  });
  
  // Observer toutes les images à chargement différé
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * Configure le lecteur vidéo
 */
function setupVideoPlayer() {
  const videoButton = document.querySelector('.aspect-video button');
  if (!videoButton) return;
  
  videoButton.addEventListener('click', () => {
    // Cette fonction serait remplacée par une vraie implémentation vidéo
    // Pour la démonstration, nous allons simplement afficher une alerte
    alert('La fonctionnalité de lecture vidéo serait implémentée ici avec un lecteur vidéo comme Plyr.js ou Video.js');
  });
}

/**
 * Configure le bouton de basculement du mode sombre
 */
function setupDarkModeToggle() {
  // Si un bouton de mode sombre existe, l'initialiser
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (!darkModeToggle) return;
  
  // Vérifier la préférence de l'utilisateur
  const isDarkMode = localStorage.getItem('darkMode') === 'enabled' || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches && 
                       localStorage.getItem('darkMode') !== 'disabled');
  
  // Appliquer le mode initial
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    darkModeToggle.setAttribute('aria-checked', 'true');
  } else {
    document.documentElement.classList.remove('dark');
    darkModeToggle.setAttribute('aria-checked', 'false');
  }
  
  // Gestionnaire de basculement
  darkModeToggle.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'disabled');
      darkModeToggle.setAttribute('aria-checked', 'false');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'enabled');
      darkModeToggle.setAttribute('aria-checked', 'true');
    }
  });
}

/**
 * Améliore l'accessibilité du site
 */
function setupAccessibility() {
  // Ajouter des attributs ARIA manquants
  document.querySelectorAll('button:not([aria-label]):not([aria-hidden="true"])').forEach(button => {
    // Si le bouton n'a pas de texte visible, mais une icône
    if (!button.textContent.trim() && button.querySelector('[data-lucide]')) {
      const iconName = button.querySelector('[data-lucide]').getAttribute('data-lucide');
      button.setAttribute('aria-label', `Bouton ${iconName}`);
    }
  });
  
  // Support clavier amélioré
  document.addEventListener('keydown', function(e) {
    // Navigation par tabulation: mettre en évidence l'élément actif
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
    }
    
    // Échap: fermer les menus ouverts
    if (e.key === 'Escape') {
      const mobileMenu = document.getElementById('mobile-menu');
      const menuButton = document.getElementById('mobile-menu-button');
      
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    }
  });
  
  // Désactiver l'indicateur de focus pour la souris
  document.addEventListener('mousedown', function() {
    document.body.classList.remove('user-is-tabbing');
  });
}
