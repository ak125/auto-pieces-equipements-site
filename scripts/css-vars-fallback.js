/**
 * Polyfill pour les variables CSS
 * Remplace les variables CSS par des valeurs directes pour les navigateurs anciens
 */

(function() {
  console.log('Applying CSS variables fallback');
  
  // Définir les valeurs par défaut pour les variables CSS
  var cssVars = {
    '--primary': '#c21f1f',
    '--primary-hover': '#9e1919',
    '--secondary': '#ffd700',
    '--animation-curve': 'cubic-bezier(0.4, 0, 0.2, 1)'
  };
  
  // Appliquer les variables en tant que styles directs
  function applyFallback() {
    // Trouver toutes les feuilles de style
    var styleSheets = Array.from(document.styleSheets);
    var cssRules;
    
    // Sélecteurs qui contiennent des variables CSS à remplacer
    styleSheets.forEach(function(sheet) {
      try {
        cssRules = sheet.cssRules || sheet.rules;
        
        for (var i = 0; i < cssRules.length; i++) {
          processRule(cssRules[i]);
        }
      } catch (e) {
        console.warn('Impossible de lire les règles CSS de la feuille de style', e);
      }
    });
    
    // Appliquer des styles directs pour les éléments courants
    applyButtonStyles();
    applyCardStyles();
    applyTextColors();
  }
  
  // Traiter une règle CSS pour remplacer les variables
  function processRule(rule) {
    if (!rule || !rule.style) return;
    
    // Remplacer les variables dans les propriétés de style
    for (var j = 0; j < rule.style.length; j++) {
      var propName = rule.style[j];
      var propValue = rule.style.getPropertyValue(propName);
      
      if (propValue.includes('var(--')) {
        // Remplacer toutes les occurrences de variables
        for (var varName in cssVars) {
          propValue = propValue.replace(
            new RegExp('var\\(' + varName + '(,[^)]+)?\\)', 'g'), 
            cssVars[varName]
          );
        }
        
        rule.style.setProperty(propName, propValue, rule.style.getPropertyPriority(propName));
      }
    }
  }
  
  // Appliquer des styles directs aux boutons
  function applyButtonStyles() {
    // Appliquer des couleurs directes aux boutons avec .bg-primary
    var primaryButtons = document.querySelectorAll('.bg-primary');
    primaryButtons.forEach(function(button) {
      button.style.backgroundColor = cssVars['--primary'];
    });
    
    var primaryHoverButtons = document.querySelectorAll('.hover\\:bg-primary-hover');
    primaryHoverButtons.forEach(function(button) {
      button.addEventListener('mouseenter', function() {
        this.style.backgroundColor = cssVars['--primary-hover'];
      });
      button.addEventListener('mouseleave', function() {
        this.style.backgroundColor = cssVars['--primary'];
      });
    });
  }
  
  // Appliquer des styles directs aux cartes
  function applyCardStyles() {
    var cards = document.querySelectorAll('.card-hover');
    cards.forEach(function(card) {
      card.style.transition = 'transform 0.3s ' + cssVars['--animation-curve'] + 
                           ', box-shadow 0.3s ' + cssVars['--animation-curve'];
    });
  }
  
  // Appliquer des couleurs de texte
  function applyTextColors() {
    var primaryTexts = document.querySelectorAll('.text-primary');
    primaryTexts.forEach(function(text) {
      text.style.color = cssVars['--primary'];
    });
  }
  
  // Exécuter le fallback
  applyFallback();
  
  // Réappliquer après le chargement complet (pour les éléments dynamiques)
  window.addEventListener('load', applyFallback);
})();
