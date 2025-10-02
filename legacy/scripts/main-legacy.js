/**
 * Version de compatibilité du script principal pour les navigateurs anciens
 * Auto Pièces Équipements
 */

// Polyfills pour compatibilité
(function() {
  // Polyfill pour Array.from
  if (!Array.from) {
    Array.from = function(arrayLike) {
      return Array.prototype.slice.call(arrayLike);
    };
  }
  
  // Polyfill pour Element.matches
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || 
                               Element.prototype.webkitMatchesSelector;
  }
  
  // Polyfill pour Element.closest
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var el = this;
      do {
        if (Element.prototype.matches.call(el, s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }
})();

document.addEventListener('DOMContentLoaded', function() {
  // Créer les icônes
  if (window.lucide) {
    lucide.createIcons();
  }
  
  // Initialiser les formulaires
  initForms();
  
  // Initialiser la navigation mobile
  initMobileMenu();
  
  // Initialiser les avis (version simplifiée)
  initReviews();
  
  // A/B Testing des CTA (version simplifiée)
  var mainCta = document.querySelector('a[href="#devis"]');
  if (mainCta) {
    var variants = [
      { text: '📞 Demandez un devis gratuit', color: 'bg-secondary' },
      { text: '💸 Économisez sur vos pièces auto', color: 'bg-green-500' }
    ];
    var randomVariant = variants[Math.floor(Math.random() * variants.length)];
    mainCta.textContent = randomVariant.text;
    mainCta.className = randomVariant.color + ' text-gray-900 px-8 py-4 rounded-full font-bold hover:opacity-90 transition';
  }
});

// Fonction d'initialisation des avis (simplifiée)
function initReviews() {
  var container = document.getElementById('google-reviews-container');
  if (!container) return;
  
  var reviews = [
    {
      author_name: "Marc Dupont",
      text: "Service exceptionnel ! J'ai commandé des plaquettes de frein pour ma Renault Clio et ils m'ont conseillé parfaitement.",
      rating: 5
    },
    {
      author_name: "Sophie Laurent",
      text: "La meilleure boutique de pièces auto du 93 ! Prix imbattables et conseils vraiment professionnels.",
      rating: 5
    },
    {
      author_name: "Karim Benali",
      text: "Très bonne expérience globale. Pièces de qualité et conformes à ma BMW.",
      rating: 4
    }
  ];
  
  var html = '';
  for (var i = 0; i < reviews.length; i++) {
    var review = reviews[i];
    html += '<div class="review-card bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">';
    html += '<div class="flex items-center gap-4 mb-4">';
    html += '<img src="https://via.placeholder.com/150?text=' + review.author_name.substring(0, 2).toUpperCase() + '" ';
    html += 'alt="Photo de ' + review.author_name + '" class="w-12 h-12 rounded-full" loading="lazy">';
    html += '<div><p class="font-bold">' + review.author_name + '</p>';
    html += '<div class="flex text-yellow-400">' + '★'.repeat(review.rating) + '</div></div></div>';
    html += '<p class="text-gray-600 dark:text-gray-300 mb-4">' + review.text + '</p>';
    html += '</div>';
  }
  
  container.innerHTML = html;
}

// Initialiser les formulaires (version simplifiée)
function initForms() {
  var forms = document.querySelectorAll('form');
  forms.forEach(function(form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Envoi en cours...';
      
      // Simuler l'envoi
      setTimeout(function() {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Envoyer ma demande';
        
        var confirmation = document.getElementById('confirmation');
        if (confirmation) {
          confirmation.classList.remove('hidden');
          setTimeout(function() {
            confirmation.classList.add('hidden');
          }, 5000);
        }
      }, 1500);
    });
  });
}

// Initialiser le menu mobile
function initMobileMenu() {
  var menuButton = document.getElementById('mobile-menu-button');
  var mobileMenu = document.getElementById('mobile-menu');
  
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      var isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
    });
  }
}
