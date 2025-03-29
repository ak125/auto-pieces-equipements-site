/**
 * Module d'optimisation des performances
 * Implémente des stratégies avancées pour améliorer l'expérience utilisateur
 */

// Configuration
const CONFIG = {
  prefetchThreshold: 0.3, // Probabilité minimale pour prefetch
  lowBatteryThreshold: 0.2, // Seuil de batterie faible
  useWasm: true, // Utiliser WebAssembly quand disponible
  prefetchEnabled: true // Active/désactive le prefetch
};

/**
 * Prédiction de navigation et prefetch intelligent
 */
class NavigationPredictor {
  constructor() {
    this.patterns = new Map(); // Stockage des modèles de navigation
    this.currentSession = []; // Pages visitées durant la session
    this.maxSessionLength = 5; // Nombre max de pages à mémoriser
    
    this.init();
  }
  
  init() {
    // Enregistrer la page courante
    this.recordNavigation(window.location.pathname);
    
    // Observer les liens
    this.observeLinks();
    
    // Charger les modèles précédents (si disponible)
    this.loadStoredPatterns();
    
    // Écouter les événements de navigation
    window.addEventListener('beforeunload', () => this.storePatterns());
  }
  
  recordNavigation(path) {
    this.currentSession.push(path);
    
    // Limiter la taille de la session
    if (this.currentSession.length > this.maxSessionLength) {
      this.currentSession.shift();
    }
    
    // Mettre à jour les patterns
    if (this.currentSession.length > 1) {
      const previousPath = this.currentSession[this.currentSession.length - 2];
      const currentPath = this.currentSession[this.currentSession.length - 1];
      
      if (!this.patterns.has(previousPath)) {
        this.patterns.set(previousPath, new Map());
      }
      
      const destinations = this.patterns.get(previousPath);
      const count = destinations.get(currentPath) || 0;
      destinations.set(currentPath, count + 1);
    }
  }
  
  predictNextPage(currentPath = window.location.pathname) {
    if (!this.patterns.has(currentPath)) {
      return null;
    }
    
    const destinations = this.patterns.get(currentPath);
    let totalTransitions = 0;
    
    // Calculer le total des transitions depuis cette page
    for (const count of destinations.values()) {
      totalTransitions += count;
    }
    
    // Trier les destinations par probabilité
    const predictions = Array.from(destinations.entries())
      .map(([path, count]) => ({
        path,
        probability: count / totalTransitions
      }))
      .sort((a, b) => b.probability - a.probability);
    
    // Retourner la prédiction la plus probable
    return predictions.length > 0 ? predictions[0] : null;
  }
  
  prefetchPredictedPage() {
    if (!CONFIG.prefetchEnabled) return;
    
    const prediction = this.predictNextPage();
    
    if (prediction && prediction.probability > CONFIG.prefetchThreshold) {
      // Créer un lien de prefetch
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = prediction.path;
      link.as = 'document';
      
      console.log(`[Prefetch] Préchargement de ${prediction.path} (probabilité: ${prediction.probability.toFixed(2)})`);
      document.head.appendChild(link);
    }
  }
  
  observeLinks() {
    // Observer les survols de liens pour prefetch
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a');
      if (link && link.href && link.host === window.location.host) {
        // Prefetch quand un utilisateur survole un lien
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = link.href;
        prefetchLink.as = 'document';
        document.head.appendChild(prefetchLink);
      }
    });
  }
  
  loadStoredPatterns() {
    try {
      const storedPatterns = localStorage.getItem('navigationPatterns');
      if (storedPatterns) {
        // Conversion de la structure serialisée en Map
        const parsed = JSON.parse(storedPatterns);
        
        for (const [source, destinations] of Object.entries(parsed)) {
          const destMap = new Map();
          for (const [dest, count] of Object.entries(destinations)) {
            destMap.set(dest, count);
          }
          this.patterns.set(source, destMap);
        }
        
        console.log('[Navigation] Modèles de navigation chargés');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des modèles de navigation', error);
    }
  }
  
  storePatterns() {
    try {
      // Conversion de Map en objet pour serialisation
      const serializable = {};
      
      for (const [source, destinations] of this.patterns.entries()) {
        serializable[source] = {};
        for (const [dest, count] of destinations.entries()) {
          serializable[source][dest] = count;
        }
      }
      
      localStorage.setItem('navigationPatterns', JSON.stringify(serializable));
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des modèles de navigation', error);
    }
  }
}

/**
 * Gestionnaire d'économie d'énergie
 */
class EnergyManager {
  constructor() {
    this.lowPowerMode = false;
    this.init();
  }
  
  async init() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        
        // Vérifier le niveau initial
        this.checkBatteryLevel(battery.level);
        
        // Surveiller les changements
        battery.addEventListener('levelchange', () => {
          this.checkBatteryLevel(battery.level);
        });
        
        console.log('[Energy] Gestionnaire d\'énergie activé');
      } catch (error) {
        console.warn('Impossible d\'accéder à la batterie', error);
      }
    }
  }
  
  checkBatteryLevel(level) {
    if (level < CONFIG.lowBatteryThreshold && !this.lowPowerMode) {
      this.enableLowPowerMode();
    } else if (level >= CONFIG.lowBatteryThreshold && this.lowPowerMode) {
      this.disableLowPowerMode();
    }
  }
  
  enableLowPowerMode() {
    this.lowPowerMode = true;
    
    // Désactiver le prefetch
    CONFIG.prefetchEnabled = false;
    
    // Réduire les animations
    document.documentElement.classList.add('reduce-motion');
    
    // Réduire la qualité des images
    document.querySelectorAll('img:not([loading="lazy"])').forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
    
    console.log('[Energy] Mode économie d\'énergie activé');
  }
  
  disableLowPowerMode() {
    this.lowPowerMode = false;
    
    // Réactiver le prefetch
    CONFIG.prefetchEnabled = true;
    
    // Restaurer les animations
    document.documentElement.classList.remove('reduce-motion');
    
    console.log('[Energy] Mode économie d\'énergie désactivé');
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser le prédicteur de navigation
  window.navigationPredictor = new NavigationPredictor();
  
  // Initialiser le gestionnaire d'énergie
  window.energyManager = new EnergyManager();
  
  // Prefetch après le chargement complet
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.navigationPredictor.prefetchPredictedPage();
    }, 2000); // Délai pour ne pas interférer avec le chargement initial
  });
  
  console.log('[Performance] Optimisations de performance initialisées');
});

// Exportation pour utilisation dans d'autres modules
export { NavigationPredictor, EnergyManager };
