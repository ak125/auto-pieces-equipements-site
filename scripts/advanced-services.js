/**
 * Module pour les fonctionnalités avancées de services
 * Auto Pièces Équipements
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialiser les composants
  const availabilityManager = new AvailabilityManager();
  const bookingSystem = new BookingSystem();
  const serviceComparator = new ServiceComparator();
  const orderTracker = new OrderTracker();
  
  // Simuler les données en temps réel
  availabilityManager.simulateRealTimeUpdates();
});

/**
 * Gestionnaire de disponibilité temps réel
 */
class AvailabilityManager {
  constructor() {
    this.statusElement = document.getElementById('livraisonStatus');
    this.dotElement = document.querySelector('.availability-dot');
    this.isSimulating = false;
    
    // Dans un environnement réel, nous utiliserions SSE ou WebSockets
    // this.sseSource = new EventSource('/api/availability');
    // this.initListeners();
  }
  
  initListeners() {
    // Pour une implémentation réelle avec SSE
    this.sseSource.addEventListener('livraison', (e) => {
      this.updateDeliveryStatus(JSON.parse(e.data));
    });
  }
  
  updateDeliveryStatus(data) {
    if (!this.statusElement || !this.dotElement) return;
    
    this.dotElement.style.backgroundColor = data.available ? '#10B981' : '#EF4444';
    this.statusElement.innerHTML = data.available 
      ? `Livraison disponible - ${data.estimatedTime}`
      : `Livraison temporairement indisponible - ${data.reason}`;
  }
  
  simulateRealTimeUpdates() {
    if (this.isSimulating) return;
    this.isSimulating = true;
    
    // Simulation des mises à jour en temps réel
    const updates = [
      { available: true, estimatedTime: 'Délai estimé: 24h' },
      { available: true, estimatedTime: 'Délai estimé: 48h (forte demande)' },
      { available: false, reason: 'Trafic important dans la zone' },
      { available: true, estimatedTime: 'Délai estimé: 24h' }
    ];
    
    let currentIndex = 0;
    
    // Mise à jour initiale
    this.updateDeliveryStatus(updates[0]);
    
    // Mise à jour périodique pour simuler les données en temps réel
    setInterval(() => {
      currentIndex = (currentIndex + 1) % updates.length;
      this.updateDeliveryStatus(updates[currentIndex]);
    }, 10000); // Toutes les 10 secondes
  }
}

/**
 * Système de réservation avec calendrier
 */
class BookingSystem {
  constructor() {
    this.bookingForm = document.getElementById('bookingForm');
    this.bookingWidget = document.getElementById('bookingWidget');
    this.openBookingBtn = document.getElementById('openBooking');
    this.closeBookingBtn = document.getElementById('closeBooking');
    this.serviceTypeSelect = document.getElementById('serviceType');
    
    // Initialiser flatpickr si chargé
    if (typeof flatpickr === 'function') {
      this.initFlatpickr();
    } else {
      // Fallback si flatpickr n'est pas chargé
      console.warn('flatpickr not loaded yet');
    }
    
    this.initEventListeners();
  }
  
  initFlatpickr() {
    this.calendar = flatpickr('#bookingDate', {
      enableTime: true,
      minDate: 'today',
      dateFormat: 'd/m/Y à H:i',
      time_24hr: true,
      locale: 'fr',
      minTime: '08:00',
      maxTime: '19:00',
      disable: [
        function(date) {
          // Désactiver les dimanches
          return date.getDay() === 0;
        }
      ]
    });
  }
  
  initEventListeners() {
    // Gérer l'ouverture/fermeture du widget
    if (this.openBookingBtn) {
      this.openBookingBtn.addEventListener('click', () => {
        this.bookingWidget.classList.add('active');
      });
    }
    
    if (this.closeBookingBtn) {
      this.closeBookingBtn.addEventListener('click', () => {
        this.bookingWidget.classList.remove('active');
      });
    }
    
    // Gérer le changement de service sélectionné
    if (this.serviceTypeSelect) {
      this.serviceTypeSelect.addEventListener('change', () => {
        this.updateAvailableTimes();
      });
    }
    
    // Gérer la soumission du formulaire
    if (this.bookingForm) {
      this.bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleBookingSubmit();
      });
    }
  }
  
  updateAvailableTimes() {
    const service = this.serviceTypeSelect.value;
    
    // Dans une implémentation réelle, nous ferions un appel API
    // pour obtenir les créneaux disponibles selon le service choisi
    console.log(`Fetching available times for ${service}`);
    
    // Simuler des créneaux différents pour chaque service
    let disabledTimes = [];
    switch (service) {
      case 'livraison':
        disabledTimes = ['11:00', '12:00', '13:00'];
        break;
      case 'retrait':
        disabledTimes = ['09:00', '10:00', '17:00', '18:00'];
        break;
      case 'conseil':
        disabledTimes = ['08:00', '09:00', '15:00', '16:00'];
        break;
    }
    
    // Mettre à jour les créneaux disponibles
    if (this.calendar) {
      this.calendar.set('disable', [
        function(date) {
          // Désactiver les dimanches
          if (date.getDay() === 0) return true;
          
          // Désactiver les heures spécifiques
          const hour = date.getHours().toString().padStart(2, '0') + ':00';
          return disabledTimes.includes(hour);
        }
      ]);
    }
  }
  
  handleBookingSubmit() {
    const service = this.serviceTypeSelect.value;
    const date = document.getElementById('bookingDate').value;
    
    if (!date) {
      alert('Veuillez sélectionner une date et heure');
      return;
    }
    
    // Simulation de l'envoi au serveur
    console.log(`Réservation pour ${service} le ${date}`);
    
    // Afficher un message de confirmation
    alert(`Votre réservation pour ${service} le ${date} a été enregistrée.`);
    
    // Réinitialiser le formulaire et fermer le widget
    this.bookingForm.reset();
    this.bookingWidget.classList.remove('active');
  }
}

/**
 * Comparateur de services interactif
 */
class ServiceComparator {
  constructor() {
    this.cards = document.querySelectorAll('.comparator-card');
    this.compareResultsContainer = document.getElementById('comparisonResults');
    this.compareContentContainer = document.getElementById('compareContent');
    this.selectedServices = [];
    
    this.initDragDrop();
  }
  
  initDragDrop() {
    this.cards.forEach(card => {
      // Drag events
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.dataset.service);
        card.classList.add('dragging');
        
        // Pour le suivi UX
        card.addEventListener('click', () => {
          this.toggleServiceSelection(card.dataset.service);
        });
      });
      
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
      
      // Click alternative for mobile
      card.addEventListener('click', () => {
        this.toggleServiceSelection(card.dataset.service);
      });
    });
    
    // Drop zone
    document.addEventListener('dragover', (e) => {
      e.preventDefault(); // Nécessaire pour permettre le drop
    });
    
    document.addEventListener('drop', (e) => {
      e.preventDefault();
      const service = e.dataTransfer.getData('text/plain');
      
      // Vérifier si on a droppé sur une autre carte
      const target = e.target.closest('.comparator-card');
      if (target && target.dataset.service !== service) {
        this.compareServices(service, target.dataset.service);
      }
    });
  }
  
  toggleServiceSelection(service) {
    const index = this.selectedServices.indexOf(service);
    
    if (index === -1) {
      // Ajouter le service s'il n'est pas déjà sélectionné
      this.selectedServices.push(service);
      
      // Si nous avons 2 services, faire la comparaison
      if (this.selectedServices.length === 2) {
        this.compareServices(this.selectedServices[0], this.selectedServices[1]);
        this.selectedServices = []; // Réinitialiser après la comparaison
      }
    } else {
      // Retirer le service s'il est déjà sélectionné
      this.selectedServices.splice(index, 1);
    }
    
    // Mettre à jour l'UI pour montrer les services sélectionnés
    this.updateSelectionUI();
  }
  
  updateSelectionUI() {
    // Reset all cards
    this.cards.forEach(card => {
      card.classList.remove('ring-2', 'ring-primary');
    });
    
    // Highlight selected cards
    this.selectedServices.forEach(service => {
      const card = document.querySelector(`.comparator-card[data-service="${service}"]`);
      if (card) {
        card.classList.add('ring-2', 'ring-primary');
      }
    });
  }
  
  compareServices(service1, service2) {
    console.log(`Comparing ${service1} vs ${service2}`);
    
    // Données de comparaison (en production, cela viendrait d'une API)
    const serviceData = {
      livraison: {
        name: 'Livraison Express',
        price: '5,90 €',
        time: '24-48h',
        benefits: ['Suivi GPS', 'Choix du créneau', 'Livraison le samedi'],
        limitations: ['Zone limitée à 50km', 'Supplément pour pièces lourdes']
      },
      retrait: {
        name: 'Click & Collect',
        price: 'Gratuit',
        time: '1h',
        benefits: ['Disponibilité immédiate', 'Vérification sur place', 'Conseils techniques'],
        limitations: ['Horaires d\'ouverture du magasin']
      },
      conseil: {
        name: 'Conseil Expert',
        price: 'Gratuit',
        time: 'Immédiat',
        benefits: ['Diagnostic précis', 'Recommandations personnalisées', 'Documentation technique'],
        limitations: ['Selon disponibilité des experts']
      }
    };
    
    // Préparer le contenu HTML de comparaison
    if (this.compareContentContainer) {
      this.compareContentContainer.innerHTML = `
        <div class="service-column">
          <h4 class="font-bold text-lg mb-4">${serviceData[service1].name}</h4>
          <p class="mb-2"><strong>Prix:</strong> ${serviceData[service1].price}</p>
          <p class="mb-4"><strong>Délai:</strong> ${serviceData[service1].time}</p>
          
          <div class="mb-4">
            <h5 class="font-semibold mb-2">Avantages</h5>
            <ul class="list-disc pl-5 space-y-1">
              ${serviceData[service1].benefits.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>
          
          <div>
            <h5 class="font-semibold mb-2">Limitations</h5>
            <ul class="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
              ${serviceData[service1].limitations.map(l => `<li>${l}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <div class="service-column">
          <h4 class="font-bold text-lg mb-4">${serviceData[service2].name}</h4>
          <p class="mb-2"><strong>Prix:</strong> ${serviceData[service2].price}</p>
          <p class="mb-4"><strong>Délai:</strong> ${serviceData[service2].time}</p>
          
          <div class="mb-4">
            <h5 class="font-semibold mb-2">Avantages</h5>
            <ul class="list-disc pl-5 space-y-1">
              ${serviceData[service2].benefits.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>
          
          <div>
            <h5 class="font-semibold mb-2">Limitations</h5>
            <ul class="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
              ${serviceData[service2].limitations.map(l => `<li>${l}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
      
      // Afficher les résultats
      if (this.compareResultsContainer) {
        this.compareResultsContainer.classList.remove('hidden');
        
        // Scroller jusqu'aux résultats
        this.compareResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }
}

/**
 * Suivi de commande en temps réel
 */
class OrderTracker {
  constructor() {
    this.steps = document.querySelectorAll('.tracker-step');
    this.currentStep = 1; // Par défaut, commande confirmée
    
    // Dans une implementation réelle :
    // this.orderSocket = new WebSocket('wss://api.autopieces.fr/order-tracker');
    // this.initSocketListeners();
    
    // Pour la démo, simuler des mises à jour
    this.simulateOrderProgress();
  }
  
  initSocketListeners() {
    this.orderSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.updateOrderStatus(data.status, data.details);
    };
  }
  
  updateOrderStatus(stepIndex, details) {
    // Mise à jour UI pour refléter l'état actuel
    this.steps.forEach((step, index) => {
      const stepIcon = step.querySelector('div');
      const stepIconInner = step.querySelector('i');
      
      if (index < stepIndex) {
        // Étapes terminées
        stepIcon.classList.remove('bg-gray-300', 'dark:bg-gray-700');
        stepIcon.classList.add('bg-primary');
        
        stepIconInner.classList.remove('text-gray-600', 'dark:text-gray-400');
        stepIconInner.classList.add('text-white');
      } else if (index === stepIndex) {
        // Étape en cours
        stepIcon.classList.remove('bg-gray-300', 'dark:bg-gray-700');
        stepIcon.classList.add('bg-yellow-400');
        
        stepIconInner.classList.remove('text-gray-600', 'dark:text-gray-400');
        stepIconInner.classList.add('text-white');
      } else {
        // Étapes à venir
        stepIcon.classList.remove('bg-primary', 'bg-yellow-400');
        stepIcon.classList.add('bg-gray-300', 'dark:bg-gray-700');
        
        stepIconInner.classList.remove('text-white');
        stepIconInner.classList.add('text-gray-600', 'dark:text-gray-400');
      }
    });
  }
  
  simulateOrderProgress() {
    // Pour la démo, simuler des mises à jour d'état toutes les 20 secondes
    setInterval(() => {
      if (this.currentStep < 3) {
        this.currentStep++;
        this.updateOrderStatus(this.currentStep);
      }
    }, 20000);
    
    // État initial
    this.updateOrderStatus(this.currentStep);
  }
}
