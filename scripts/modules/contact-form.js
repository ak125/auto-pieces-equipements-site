/**
 * Module de gestion du formulaire de contact
 * Auto Pièces Équipements
 */

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Configuration des validateurs
  const validators = {
    'nom': {
      required: true,
      minLength: 2,
      errorMessage: 'Veuillez entrer votre nom (minimum 2 caractères)'
    },
    'email': {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Veuillez entrer une adresse email valide'
    },
    'telephone': {
      pattern: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      errorMessage: 'Veuillez entrer un numéro de téléphone valide (format français)'
    },
    'message': {
      required: true,
      minLength: 10,
      errorMessage: 'Veuillez entrer votre message (minimum 10 caractères)'
    }
  };

  // Gestionnaire de soumission du formulaire
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateForm(form, validators)) {
      submitForm(form);
    }
  });

  // Ajouter des validateurs en temps réel sur les champs
  Object.keys(validators).forEach(fieldName => {
    const field = form.elements[fieldName];
    if (field) {
      field.addEventListener('blur', () => {
        validateField(field, validators[fieldName]);
      });
      
      field.addEventListener('input', () => {
        // Effacer l'erreur lorsque l'utilisateur commence à corriger
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
          errorElement.textContent = '';
          errorElement.classList.add('hidden');
        }
        field.classList.remove('border-red-500');
      });
    }
  });
}

/**
 * Valide un champ individuel
 */
function validateField(field, rules) {
  let isValid = true;
  let errorMessage = '';

  // Vérification si requis
  if (rules.required && !field.value.trim()) {
    isValid = false;
    errorMessage = rules.errorMessage || 'Ce champ est requis';
  }
  
  // Vérification longueur minimale
  else if (rules.minLength && field.value.trim().length < rules.minLength) {
    isValid = false;
    errorMessage = rules.errorMessage || `Ce champ doit contenir au moins ${rules.minLength} caractères`;
  }
  
  // Vérification de motif (regex)
  else if (rules.pattern && field.value.trim() && !rules.pattern.test(field.value.trim())) {
    isValid = false;
    errorMessage = rules.errorMessage || 'Format invalide';
  }

  // Appliquer le style d'erreur ou succès
  updateFieldStatus(field, isValid, errorMessage);
  
  return isValid;
}

/**
 * Met à jour l'apparence d'un champ en fonction de sa validité
 */
function updateFieldStatus(field, isValid, errorMessage) {
  const fieldId = field.id || field.name;
  let errorElement = document.getElementById(`${fieldId}-error`);
  
  if (!isValid) {
    // Ajouter un style d'erreur
    field.classList.add('border-red-500');
    
    // Créer ou mettre à jour l'élément d'erreur
    if (!errorElement) {
      errorElement = document.createElement('p');
      errorElement.id = `${fieldId}-error`;
      errorElement.className = 'text-red-500 text-sm mt-1';
      field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = errorMessage;
    errorElement.classList.remove('hidden');
  } else {
    // Retirer le style d'erreur
    field.classList.remove('border-red-500');
    
    // Masquer le message d'erreur s'il existe
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.add('hidden');
    }
  }
}

/**
 * Valide le formulaire complet
 */
function validateForm(form, validators) {
  let isValid = true;
  
  // Valider chaque champ
  Object.keys(validators).forEach(fieldName => {
    const field = form.elements[fieldName];
    if (field) {
      if (!validateField(field, validators[fieldName])) {
        isValid = false;
      }
    }
  });
  
  return isValid;
}

/**
 * Soumet le formulaire avec animation de chargement
 */
function submitForm(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  
  // Afficher l'animation de chargement
  submitButton.disabled = true;
  submitButton.innerHTML = `
    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Envoi en cours...
  `;
  
  // En production, ceci serait un vrai appel API
  // Simulation d'un appel API
  setTimeout(() => {
    // Afficher le message de succès
    const confirmationElement = document.getElementById('form-confirmation');
    if (confirmationElement) {
      confirmationElement.classList.remove('hidden');
      
      // Faire défiler jusqu'au message
      confirmationElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Cacher après 5 secondes
      setTimeout(() => {
        confirmationElement.classList.add('hidden');
      }, 5000);
    }
    
    // Réinitialiser le formulaire et le bouton
    form.reset();
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }, 1500);
}
