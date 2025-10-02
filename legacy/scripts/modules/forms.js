/**
 * Module de gestion des formulaires
 * Auto Pièces Équipements
 */

/**
 * Configure tous les formulaires du site
 */
export function setupFormHandling() {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    // Ne pas configurer les formulaires de recherche
    if (form.getAttribute('role') === 'search' || form.id === 'bookingForm') return;
    
    new FormHandler(form);
  });
}

/**
 * Classe de gestion de formulaire
 */
class FormHandler {
  constructor(form) {
    this.form = form;
    this.submitBtn = form.querySelector('button[type="submit"]');
    this.confirmationElement = document.getElementById('confirmation');
    this.errorElement = document.getElementById('error-message');
    
    // Configurer la validation
    this.setupValidation();
    
    // Ajouter le gestionnaire de soumission
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }
  
  setupValidation() {
    // Validation côté client pour les champs requis
    const requiredInputs = this.form.querySelectorAll('[required]');
    
    requiredInputs.forEach(input => {
      // Validation lors de la sortie du champ
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      // Réinitialiser les styles à la saisie
      input.addEventListener('input', () => {
        input.classList.remove('border-red-500');
        
        // Trouver et masquer le message d'erreur associé
        const errorId = input.id + '-error';
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
          errorElement.textContent = '';
          errorElement.classList.add('hidden');
        }
      });
    });
  }
  
  validateField(field) {
    let isValid = true;
    let errorMessage = '';
    
    // Validation selon le type de champ
    if (field.hasAttribute('required') && !field.value.trim()) {
      isValid = false;
      errorMessage = 'Ce champ est requis';
    } else if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        isValid = false;
        errorMessage = 'Adresse e-mail invalide';
      }
    } else if (field.type === 'tel' && field.value) {
      const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
      if (!phoneRegex.test(field.value)) {
        isValid = false;
        errorMessage = 'Numéro de téléphone invalide';
      }
    }
    
    // Appliquer les styles et messages d'erreur
    if (!isValid) {
      field.classList.add('border-red-500');
      
      // Créer ou mettre à jour le message d'erreur
      let errorElement = document.getElementById(field.id + '-error');
      if (!errorElement) {
        errorElement = document.createElement('p');
        errorElement.id = field.id + '-error';
        errorElement.classList.add('text-red-500', 'text-sm', 'mt-1');
        field.parentNode.appendChild(errorElement);
      }
      
      errorElement.textContent = errorMessage;
      errorElement.classList.remove('hidden');
    } else {
      field.classList.remove('border-red-500');
      
      const errorElement = document.getElementById(field.id + '-error');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
      }
    }
    
    return isValid;
  }
  
  validateForm() {
    const requiredFields = this.form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    // Vérifier la validation
    if (!this.validateForm()) {
      return;
    }
    
    // Désactiver le bouton et montrer l'état de chargement
    this.setLoading(true);
    
    try {
      // En production, on ferait un appel API réel
      // const response = await fetch(this.form.action, {
      //   method: 'POST',
      //   body: new FormData(this.form),
      // });
      
      // Pour la démo, simuler un appel API
      await this.simulateApiCall();
      
      // Traiter le succès
      this.showSuccess();
      this.form.reset();
    } catch (error) {
      console.error('Erreur lors de la soumission :', error);
      this.showError();
    } finally {
      this.setLoading(false);
    }
  }
  
  setLoading(isLoading) {
    if (this.submitBtn) {
      this.submitBtn.disabled = isLoading;
      
      if (isLoading) {
        this.submitBtnText = this.submitBtn.innerHTML;
        this.submitBtn.innerHTML = `<i data-lucide="loader" class="loading-spinner inline-block mr-2"></i> Envoi en cours...`;
        window.lucide?.createIcons();
      } else {
        this.submitBtn.innerHTML = this.submitBtnText || 'Envoyer';
      }
    }
  }
  
  showSuccess() {
    // Masquer les erreurs éventuelles
    if (this.errorElement) {
      this.errorElement.classList.add('hidden');
    }
    
    // Afficher le message de confirmation
    if (this.confirmationElement) {
      this.confirmationElement.classList.remove('hidden');
      // Cacher le message après 5 secondes
      setTimeout(() => {
        this.confirmationElement.classList.add('hidden');
      }, 5000);
    } else {
      alert('Votre demande a été envoyée avec succès. Nous vous contacterons rapidement.');
    }
  }
  
  showError() {
    // Masquer le message de confirmation s'il est affiché
    if (this.confirmationElement) {
      this.confirmationElement.classList.add('hidden');
    }
    
    // Afficher le message d'erreur
    if (this.errorElement) {
      this.errorElement.classList.remove('hidden');
      // Cacher le message après 5 secondes
      setTimeout(() => {
        this.errorElement.classList.add('hidden');
      }, 5000);
    } else {
      alert('Une erreur est survenue lors de l\'envoi du formulaire. Veuillez réessayer.');
    }
  }
  
  async simulateApiCall() {
    // Simuler le délai et la réussite/échec aléatoire
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% de chance de succès
        if (success) {
          resolve({ success: true });
        } else {
          reject(new Error('Erreur simulée'));
        }
      }, 1500);
    });
  }
}
