/**
 * Module de gestion des spécifications techniques
 * Auto Pièces Équipements
 */

/**
 * Crée une ligne de spécification technique
 * @param {string} label - Libellé de la spécification
 * @param {string} value - Valeur de la spécification
 * @param {boolean} highlight - Si la ligne doit être mise en évidence
 * @returns {HTMLElement} Élément DOM de la ligne de spécification
 */
export function createSpecRow(label, value, highlight = false) {
  // Créer la ligne
  const row = document.createElement('div');
  row.className = `tech-spec-row ${highlight ? 'highlight' : ''}`;
  
  // Créer le libellé
  const labelSpan = document.createElement('span');
  labelSpan.className = 'tech-spec-label';
  labelSpan.textContent = label;
  
  // Créer la valeur
  const valueSpan = document.createElement('span');
  valueSpan.className = `tech-spec-value ${highlight ? 'highlight' : ''}`;
  valueSpan.textContent = value;
  
  // Assembler
  row.appendChild(labelSpan);
  row.appendChild(valueSpan);
  
  return row;
}

/**
 * Initialise un conteneur de spécifications techniques
 * @param {HTMLElement} container - Élément conteneur pour les spécifications
 * @param {Array} specs - Tableau d'objets de spécifications {label, value, highlight}
 */
export function initTechSpecs(container, specs) {
  // Vider le conteneur
  container.innerHTML = '';
  
  // Ajouter la classe de conteneur
  container.classList.add('tech-specs-container');
  
  // Ajouter chaque spécification
  specs.forEach(spec => {
    const row = createSpecRow(spec.label, spec.value, spec.highlight);
    container.appendChild(row);
  });
}

/**
 * Génère le HTML pour un ensemble de spécifications
 * @param {Array} specs - Tableau d'objets de spécifications {label, value, highlight}
 * @returns {string} HTML des spécifications
 */
export function generateSpecsHTML(specs) {
  let html = '<div class="tech-specs-container">';
  
  specs.forEach(spec => {
    html += `
      <div class="tech-spec-row ${spec.highlight ? 'highlight' : ''}">
        <span class="tech-spec-label">${spec.label}</span>
        <span class="tech-spec-value ${spec.highlight ? 'highlight' : ''}">${spec.value}</span>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

// Initialiser les spécifications techniques au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  const specContainers = document.querySelectorAll('[data-tech-specs]');
  
  specContainers.forEach(container => {
    try {
      // Tenter de parser les données JSON si disponibles
      const specs = JSON.parse(container.dataset.techSpecs);
      initTechSpecs(container, specs);
    } catch (e) {
      console.error('Erreur lors de l\'initialisation des spécifications techniques:', e);
    }
  });
});
