/**
 * Module d'effet de scan technique
 * Auto Pièces Équipements
 */

/**
 * Initialise un graphique technique avec effet de scan
 * @param {string} containerId - ID du conteneur du graphique
 * @param {Object} options - Options de configuration
 */
export function initTechScan(containerId, options = {}) {
  const defaults = {
    gridLines: 5,
    dataPoints: 15,
    startOnLoad: true,
    autoActivate: true,
    scanDuration: 2000,
    xAxisLabel: 'Temps (ms)',
    yAxisLabel: 'Performance',
    analysisText: 'ANALYSE EN COURS...'
  };
  
  const settings = { ...defaults, ...options };
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Conteneur avec l'ID "${containerId}" non trouvé.`);
    return;
  }
  
  // Ajouter les classes de base
  container.classList.add('tech-graph-container');
  
  // Créer l'élément SVG pour le graphique
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', '0 0 500 300');
  svg.style.position = 'absolute';
  container.appendChild(svg);
  
  // Ajouter les lignes de grille
  addGridLines(svg, settings.gridLines);
  
  // Ajouter les axes et labels
  addAxisLabels(container, settings.xAxisLabel, settings.yAxisLabel);
  
  // Ajouter les points de données
  addDataPoints(container, settings.dataPoints);
  
  // Créer la ligne de scan
  const scanLine = document.createElement('div');
  scanLine.className = 'scan-line';
  container.appendChild(scanLine);
  
  // Créer l'overlay d'analyse
  const analysisOverlay = document.createElement('div');
  analysisOverlay.className = 'analysis-overlay';
  analysisOverlay.textContent = settings.analysisText;
  container.appendChild(analysisOverlay);
  
  // Activer l'animation au chargement si demandé
  if (settings.startOnLoad) {
    startScan(container);
  }
  
  // Ajouter un gestionnaire de clic pour activer/désactiver le scan
  if (settings.autoActivate) {
    container.addEventListener('click', () => {
      toggleScan(container);
    });
  }
  
  // Retourner les méthodes de contrôle
  return {
    start: () => startScan(container),
    stop: () => stopScan(container),
    toggle: () => toggleScan(container)
  };
}

/**
 * Ajoute les lignes de grille au graphique
 */
function addGridLines(svg, numLines) {
  // Lignes horizontales
  for (let i = 1; i < numLines; i++) {
    const y = (i * 300) / numLines;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', y);
    line.setAttribute('x2', '500');
    line.setAttribute('y2', y);
    line.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  }
  
  // Lignes verticales
  for (let i = 1; i < numLines; i++) {
    const x = (i * 500) / numLines;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', '0');
    line.setAttribute('x2', x);
    line.setAttribute('y2', '300');
    line.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  }
}

/**
 * Ajoute les labels des axes
 */
function addAxisLabels(container, xLabel, yLabel) {
  const xAxisLabel = document.createElement('div');
  xAxisLabel.className = 'axis-label axis-x-label';
  xAxisLabel.textContent = xLabel;
  container.appendChild(xAxisLabel);
  
  const yAxisLabel = document.createElement('div');
  yAxisLabel.className = 'axis-label axis-y-label';
  yAxisLabel.textContent = yLabel;
  container.appendChild(yAxisLabel);
}

/**
 * Ajoute des points de données aléatoires
 */
function addDataPoints(container, numPoints) {
  const svg = container.querySelector('svg');
  
  for (let i = 0; i < numPoints; i++) {
    // Créer un point de donnée SVG
    const x = 50 + Math.random() * 400;
    const y = 50 + Math.random() * 200;
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '3');
    circle.setAttribute('fill', 'rgba(245, 158, 11, 0.7)');
    circle.setAttribute('class', 'data-point-svg');
    circle.style.opacity = '0';
    
    svg.appendChild(circle);
    
    // Animer les points quand la ligne de scan passe
    const point = circle;
    
    // Fonction pour vérifier si un point a été scanné
    const checkIfScanned = () => {
      const scanLine = container.querySelector('.scan-line');
      if (!scanLine) return;
      
      const scanX = scanLine.getBoundingClientRect().x - container.getBoundingClientRect().x;
      const pointX = parseFloat(point.getAttribute('cx')) / 500 * container.offsetWidth;
      
      const distance = Math.abs(scanX - pointX);
      
      if (distance < 10) {
        point.style.opacity = '1';
        point.setAttribute('r', '5');
        
        // Animation de pulsation
        if (!point.pulsing) {
          point.pulsing = true;
          
          const pulse = () => {
            if (!container.classList.contains('scanning')) {
              point.style.opacity = '0';
              point.setAttribute('r', '3');
              point.pulsing = false;
              return;
            }
            
            const currentR = parseFloat(point.getAttribute('r'));
            const targetR = currentR === 3 ? 5 : 3;
            point.setAttribute('r', targetR);
            
            setTimeout(pulse, 1000);
          };
          
          pulse();
        }
      }
    };
    
    // Fonction d'animation
    const animate = () => {
      if (container.classList.contains('scanning')) {
        checkIfScanned();
      } else {
        point.style.opacity = '0';
        point.setAttribute('r', '3');
      }
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }
}

/**
 * Démarre l'animation de scan
 */
function startScan(container) {
  container.classList.add('scanning');
}

/**
 * Arrête l'animation de scan
 */
function stopScan(container) {
  container.classList.remove('scanning');
}

/**
 * Bascule l'animation de scan
 */
function toggleScan(container) {
  container.classList.toggle('scanning');
}

// Exporter les fonctions
export { startScan, stopScan, toggleScan };
