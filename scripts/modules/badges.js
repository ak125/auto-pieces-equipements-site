/**
 * Module de gestion des badges améliorés
 * Auto Pièces Équipements
 */

/**
 * Crée un badge amélioré
 * @param {Object} options - Configuration du badge
 * @param {string} options.color - Couleur du badge (primary, blue, teal, amber, red, green)
 * @param {string} options.icon - Emoji ou texte pour l'icône
 * @param {string} options.text - Texte du badge
 * @param {boolean} options.pulse - Activer l'animation de pulsation
 * @param {string} options.customColor - Couleur personnalisée (hex ou rgba)
 * @param {HTMLElement} options.container - Conteneur où ajouter le badge
 * @returns {HTMLElement} Le badge créé
 */
export function createBadge(options) {
  const {
    color = 'primary',
    icon = '',
    text = '',
    pulse = false,
    customColor = null,
    container = null
  } = options;
  
  // Créer le badge
  const badge = document.createElement('div');
  badge.className = `enhanced-badge ${color} ${pulse ? 'pulse' : ''}`;
  
  // Appliquer une couleur personnalisée si fournie
  if (customColor) {
    badge.style.backgroundColor = customColor;
    badge.style.boxShadow = `0 0 10px ${customColor}40`;
  }
  
  // Ajouter l'icône si fournie
  if (icon) {
    const iconSpan = document.createElement('span');
    iconSpan.className = 'badge-icon';
    iconSpan.textContent = icon;
    badge.appendChild(iconSpan);
  }
  
  // Ajouter le texte
  const textSpan = document.createElement('span');
  textSpan.className = 'badge-text';
  textSpan.textContent = text;
  badge.appendChild(textSpan);
  
  // Ajouter à un conteneur si spécifié
  if (container) {
    container.appendChild(badge);
  }
  
  // Animation d'entrée
  setTimeout(() => {
    badge.classList.add('active');
  }, 10);
  
  return badge;
}

/**
 * Initialise les badges à partir des attributs data
 */
export function initBadges() {
  document.querySelectorAll('[data-badge]').forEach(element => {
    const config = {};
    
    try {
      // Essayer de parser la configuration JSON
      const jsonConfig = element.dataset.badge;
      if (jsonConfig && jsonConfig !== 'true') {
        Object.assign(config, JSON.parse(jsonConfig));
      }
    } catch (e) {
      console.warn('Configuration de badge invalide', e);
    }
    
    // Valeurs par défaut ou depuis les attributs data individuels
    config.color = config.color || element.dataset.badgeColor || 'primary';
    config.icon = config.icon || element.dataset.badgeIcon || '';
    config.text = config.text || element.dataset.badgeText || element.textContent;
    config.pulse = config.pulse !== undefined ? config.pulse : element.dataset.badgePulse === 'true';
    config.customColor = config.customColor || element.dataset.badgeCustomColor || null;
    
    // Créer le badge
    const badge = createBadge(config);
    
    // Remplacer l'élément original
    if (element.tagName !== 'DIV') {
      element.replaceWith(badge);
    } else {
      element.innerHTML = '';
      element.appendChild(badge);
    }
  });
}

/**
 * Crée un badge de statut pour une tâche ou un produit
 */
export function createStatusBadge(status, container = null) {
  const statusConfig = {
    'en-stock': { color: 'green', icon: '✓', text: 'En stock', pulse: false },
    'rupture': { color: 'red', icon: '✕', text: 'Rupture de stock', pulse: false },
    'promotion': { color: 'amber', icon: '🔥', text: 'Promotion', pulse: true },
    'nouveau': { color: 'blue', icon: '🆕', text: 'Nouveau', pulse: false },
    'populaire': { color: 'primary', icon: '⭐', text: 'Populaire', pulse: false },
    'preparation': { color: 'blue', icon: '⚙️', text: 'En préparation', pulse: true },
    'expedie': { color: 'teal', icon: '📦', text: 'Expédié', pulse: false },
    'livre': { color: 'green', icon: '🚚', text: 'Livré', pulse: false }
  };
  
  const config = statusConfig[status] || { color: 'primary', text: status };
  config.container = container;
  
  return createBadge(config);
}

// Initialiser les badges au chargement du DOM
document.addEventListener('DOMContentLoaded', initBadges);
