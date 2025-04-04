/**
 * Module pour récupérer et afficher les avis Google réels
 */
class GoogleReviewsAPI {
    /**
     * Initialise l'API des avis Google
     * @param {string} placeId ID Google My Business de votre établissement
     * @param {string} apiKey Clé API Google (avec les restrictions appropriées)
     */
    constructor(placeId, apiKey) {
        this.placeId = placeId;
        this.apiKey = apiKey;
        this.reviews = [];
        this.initialized = false;
    }
    
    /**
     * Initialise la bibliothèque Google Maps pour récupérer les avis
     * @returns {Promise} Résultat de l'initialisation
     */
    async initialize() {
        if (this.initialized) return { success: true };
        
        return new Promise((resolve, reject) => {
            // Charger l'API Google Maps Places
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&callback=initGoogleReviews`;
            script.defer = true;
            
            // Définir la fonction de callback
            window.initGoogleReviews = () => {
                this.initialized = true;
                resolve({ success: true });
            };
            
            script.onerror = () => {
                reject({ success: false, error: "Erreur de chargement de l'API Google Maps" });
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * Récupère les avis depuis l'API Google Places
     * @returns {Promise<Array>} Liste des avis
     */
    async fetchReviews() {
        if (!this.initialized) {
            await this.initialize();
        }
        
        return new Promise((resolve, reject) => {
            const placesService = new google.maps.places.PlacesService(document.createElement('div'));
            
            placesService.getDetails({
                placeId: this.placeId,
                fields: ['reviews', 'name', 'rating', 'user_ratings_total']
            }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    this.reviews = place.reviews || [];
                    resolve({
                        success: true,
                        reviews: this.reviews,
                        placeInfo: {
                            name: place.name,
                            rating: place.rating,
                            totalRatings: place.user_ratings_total
                        }
                    });
                } else {
                    reject({
                        success: false,
                        error: `Erreur API Places: ${status}`
                    });
                }
            });
        });
    }
    
    /**
     * Enrichit les avis avec les données de contexte MCP
     * @param {Array} reviews Avis à enrichir
     * @returns {Array} Avis enrichis
     */
    enrichReviewsWithMCP(reviews) {
        // Dans une implémentation réelle, cette fonction interrogerait votre serveur
        // pour analyser le texte des avis et extraire des données contextuelles
        
        // Simulons une API réelle avec un appel fetch
        return fetch('/api/mcp/enrich-reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reviews })
        })
        .then(response => response.json())
        .catch(error => {
            console.error("Erreur d'enrichissement des avis:", error);
            
            // En cas d'échec de l'API, effectuer un enrichissement basique côté client
            return reviews.map(review => {
                const enriched = { ...review };
                
                // Détecter les mentions de modèles de voiture
                const modelRegex = /(renault|peugeot|citroen|volkswagen|audi|bmw|mercedes|toyota|ford)\s+([\w\-]+)/i;
                const modelMatch = review.text.match(modelRegex);
                
                if (modelMatch) {
                    enriched.model = `${modelMatch[1].charAt(0).toUpperCase() + modelMatch[1].slice(1)} ${modelMatch[2]}`;
                    enriched.modelContext = `${modelMatch[1]} ${modelMatch[2]} diagnostic réparation entretien`;
                }
                
                // Détecter le type de service
                enriched.tags = [];
                
                if (/diagnosti|scanner|obd|lecture|mcp/i.test(review.text)) {
                    enriched.tags.push('mcp');
                }
                
                if (/pièce|pièces|achat|commander|reçu/i.test(review.text)) {
                    enriched.tags.push('parts');
                }
                
                if (/répara|service|garage|technic|mécan/i.test(review.text)) {
                    enriched.tags.push('service');
                }
                
                return enriched;
            });
        });
    }
    
    /**
     * Récupère et traite les avis pour l'affichage
     * @param {string} containerId ID du conteneur HTML pour les avis
     * @returns {Promise} Résultat de l'opération
     */
    async displayReviews(containerId) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Conteneur d'avis introuvable: ${containerId}`);
            }
            
            // Afficher l'indicateur de chargement
            const loadingElement = document.getElementById('reviews-loading');
            if (loadingElement) {
                loadingElement.style.display = 'flex';
            }
            
            // Récupérer les avis
            const result = await this.fetchReviews();
            
            // Enrichir les avis avec MCP
            const enrichedReviews = await this.enrichReviewsWithMCP(result.reviews);
            
            // Masquer l'indicateur de chargement
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            // Afficher les avis
            container.innerHTML = ''; // Vider le conteneur
            
            if (enrichedReviews.length === 0) {
                container.innerHTML = `
                    <div class="col-span-3 text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p class="text-gray-500 dark:text-gray-400">Aucun avis disponible pour le moment</p>
                    </div>
                `;
                return { success: true, reviewsCount: 0 };
            }
            
            // Générer les cartes d'avis
            enrichedReviews.forEach(review => {
                const reviewCard = this.createReviewCard(review);
                container.appendChild(reviewCard);
            });
            
            // Mettre à jour les statistiques générales
            this.updateReviewStats(result.placeInfo, enrichedReviews);
            
            return {
                success: true,
                reviewsCount: enrichedReviews.length,
                placeInfo: result.placeInfo
            };
            
        } catch (error) {
            console.error("Erreur d'affichage des avis:", error);
            
            // Afficher un message d'erreur
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="col-span-3 text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p class="text-red-500 dark:text-red-400">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            Impossible de charger les avis. Veuillez réessayer plus tard.
                        </p>
                    </div>
                `;
            }
            
            // Masquer l'indicateur de chargement
            const loadingElement = document.getElementById('reviews-loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Crée un élément de carte d'avis
     * @param {Object} review Données de l'avis
     * @returns {HTMLElement} Élément DOM de la carte d'avis
     */
    createReviewCard(review) {
        const card = document.createElement('div');
        card.className = 'review-card bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1';
        
        // Ajouter des attributs data pour le filtrage
        if (review.tags) {
            card.setAttribute('data-tags', review.tags.join(' '));
        }
        
        if (review.model) {
            card.setAttribute('data-model', review.model.toLowerCase());
        }
        
        if (review.modelContext) {
            card.setAttribute('data-model-context', review.modelContext.toLowerCase());
        }
        
        // Générer les étoiles
        const stars = Array(5).fill().map((_, i) => 
            i < review.rating 
                ? '<i class="fas fa-star text-yellow-400"></i>' 
                : '<i class="far fa-star text-gray-400"></i>'
        ).join('');
        
        // Générer les tags s'ils existent
        let tagBadges = '';
        if (review.tags && review.tags.length > 0) {
            tagBadges = review.tags.map(tag => {
                let color, icon, text;
                switch(tag) {
                    case 'mcp':
                        color = 'bg-blue-900/40 text-blue-400';
                        icon = 'fas fa-microchip';
                        text = 'Diagnostic MCP';
                        break;
                    case 'parts':
                        color = 'bg-green-900/40 text-green-400';
                        icon = 'fas fa-cogs';
                        text = 'Pièces détachées';
                        break;
                    case 'service':
                        color = 'bg-yellow-900/40 text-yellow-400';
                        icon = 'fas fa-wrench';
                        text = 'Service technique';
                        break;
                    default:
                        color = 'bg-gray-900/40 text-gray-400';
                        icon = 'fas fa-tag';
                        text = tag;
                }
                return `<span class="${color} text-xs rounded-full px-2 py-1 flex items-center"><i class="${icon} mr-1"></i>${text}</span>`;
            }).join('');
        }
        
        // Ajouter le badge de modèle si disponible
        const modelBadge = review.model ? 
            `<span class="bg-blue-900/40 text-blue-400 text-xs rounded-full px-2 py-1 flex items-center ml-1"><i class="fas fa-car mr-1"></i>${review.model}</span>` : '';
        
        // Formatter la date
        const reviewDate = new Date(review.time * 1000);
        const formattedDate = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(
            Math.floor((reviewDate - new Date()) / (1000 * 60 * 60 * 24)), 'day'
        );
        
        // Contenu de la carte
        card.innerHTML = `
            <div class="p-4">
                <div class="flex items-start">
                    <img src="${review.profile_photo_url}" alt="${review.author_name}" class="w-12 h-12 rounded-full mr-3">
                    <div>
                        <h4 class="font-bold text-darker dark:text-white">${review.author_name}</h4>
                        <div class="flex items-center">
                            <div class="mr-2">${stars}</div>
                            <span class="text-gray-500 dark:text-gray-400 text-sm">${formattedDate}</span>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <p class="text-gray-700 dark:text-gray-300">${review.text}</p>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                    ${tagBadges}
                    ${modelBadge}
                </div>
            </div>
            <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                <div class="flex items-center">
                    <img src="https://www.google.com/favicon.ico" alt="Google" class="w-4 h-4 mr-1">
                    <span class="text-xs text-gray-500 dark:text-gray-400">Avis Google</span>
                </div>
                <a href="${review.author_url}" target="_blank" class="text-primary text-sm hover:underline">Voir le profil</a>
            </div>
        `;
        
        return card;
    }
    
    /**
     * Met à jour les statistiques d'avis
     * @param {Object} placeInfo Informations sur l'établissement
     * @param {Array} reviews Liste des avis
     */
    updateReviewStats(placeInfo, reviews) {
        // Mettre à jour la note générale
        const ratingElement = document.querySelector('.text-yellow-400 + span.ml-2');
        if (ratingElement && placeInfo.rating) {
            ratingElement.textContent = `${placeInfo.rating.toFixed(1)}/5`;
        }
        
        // Compter les occurrences de chaque service
        const serviceCounts = {
            mcp: 0,
            parts: 0,
            service: 0
        };
        
        // Compter les modèles mentionnés
        const modelCounts = {};
        
        reviews.forEach(review => {
            if (review.tags) {
                review.tags.forEach(tag => {
                    if (serviceCounts[tag] !== undefined) {
                        serviceCounts[tag]++;
                    }
                });
            }
            
            if (review.model) {
                const model = review.model.toLowerCase();
                modelCounts[model] = (modelCounts[model] || 0) + 1;
            }
        });
        
        // Mettre à jour les compteurs de service
        Object.keys(serviceCounts).forEach(service => {
            const element = document.querySelector(`.bg-gray-900 .text-xs.text-gray-400:contains("${service}")`);
            if (element) {
                const countElement = element.nextElementSibling;
                if (countElement) {
                    countElement.textContent = `${Math.floor((serviceCounts[service] / reviews.length) * 100)}%`;
                }
            }
        });
        
        // Mettre à jour les modèles populaires
        const topModels = Object.entries(modelCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
            
        // Trouver le conteneur des modèles populaires et le mettre à jour
        // Cela dépendra de la structure exacte de votre HTML
    }
}

// Exporter la classe
export default GoogleReviewsAPI;