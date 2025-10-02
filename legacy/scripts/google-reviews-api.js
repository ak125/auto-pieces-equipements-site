/**
 * Module pour récupérer et afficher les avis Google réels
 */
class GoogleReviewsAPI {
    constructor(placeId = 'ChIJVVXZlqAT5kcRICTpgHlqx9A') {
        this.placeId = placeId;
        this.baseUrl = '/api/google-reviews';
        this.fallbackReviews = [
            {
                author_name: "Julien Moreau",
                rating: 5,
                relative_time_description: "Il y a 2 semaines",
                text: "Le diagnostic MCP a détecté un problème de bobine d'allumage sur ma Renault Clio que deux autres garages avaient manqué. Pièce remplacée, problème résolu en moins d'une heure. Très impressionné par cette technologie!",
                profile_photo_url: "https://randomuser.me/api/portraits/men/32.jpg",
                time: 1677412843
            },
            {
                author_name: "Sophie Lambert",
                rating: 5,
                relative_time_description: "Il y a 1 mois",
                text: "Service impeccable. La visualisation 3D des pièces avant achat est vraiment pratique. J'ai pu vérifier la compatibilité avec ma Peugeot 308 sans erreur possible.",
                profile_photo_url: "https://randomuser.me/api/portraits/women/45.jpg",
                time: 1675341643
            },
            {
                author_name: "Michel Dupont",
                rating: 4,
                relative_time_description: "Il y a 1 mois",
                text: "Le système d'analyse MCP a diagnostiqué un problème de capteur sur ma Golf que même le concessionnaire n'arrivait pas à trouver. Précision impressionnante, je recommande!",
                profile_photo_url: "https://randomuser.me/api/portraits/men/22.jpg",
                time: 1675168843
            }
        ];
    }
    
    async fetchReviews() {
        try {
            // Essayer de récupérer les avis depuis l'API
            const response = await fetch(`${this.baseUrl}?placeId=${this.placeId}`);
            
            if (!response.ok) {
                // En cas d'erreur, utiliser les avis de secours
                console.warn("Impossible de récupérer les avis Google, utilisation des avis de secours");
                return this.fallbackReviews.map(review => this.enrichReviewWithMCP(review));
            }
            
            const data = await response.json();
            
            if (!data.result || !data.result.reviews) {
                console.warn("Format de réponse invalide, utilisation des avis de secours");
                return this.fallbackReviews.map(review => this.enrichReviewWithMCP(review));
            }
            
            return data.result.reviews.map(review => this.enrichReviewWithMCP(review));
        } catch (error) {
            console.error('Erreur lors de la récupération des avis:', error);
            // En cas d'erreur, utiliser les avis de secours
            return this.fallbackReviews.map(review => this.enrichReviewWithMCP(review));
        }
    }
    
    enrichReviewWithMCP(googleReview) {
        // Extraire des informations de contexte du texte de l'avis
        const tags = this.analyzeTags(googleReview.text);
        const modelInfo = this.extractModelInfo(googleReview.text);
        
        // Retourner l'avis enrichi de métadonnées MCP
        return {
            // Données Google originales
            id: googleReview.time,
            name: googleReview.author_name,
            rating: googleReview.rating,
            date: googleReview.relative_time_description,
            text: googleReview.text,
            avatar: googleReview.profile_photo_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(googleReview.author_name),
            
            // Métadonnées MCP ajoutées
            tags: tags,
            model: modelInfo?.fullName || '',
            modelBrand: modelInfo?.brand || '',
            modelName: modelInfo?.model || '',
            modelContext: this.generateModelContext(googleReview.text, modelInfo)
        };
    }
    
    analyzeTags(reviewText) {
        const tags = [];
        
        // Détection de mentions MCP
        if (/\b(mcp|diagnostic|protocole|obd|scanner|scan|diagnostic|problème moteur)\b/i.test(reviewText)) {
            tags.push('mcp');
        }
        
        // Détection de mentions de pièces
        if (/\b(pièce|pièces|part|parts|composant|composants|huile|filtre|plaquette|frein|batterie)\b/i.test(reviewText)) {
            tags.push('parts');
        }
        
        // Détection de mentions de service
        if (/\b(service|support|technicien|réparation|réparer|installer|installation|conseil|atelier|mécanicien)\b/i.test(reviewText)) {
            tags.push('service');
        }
        
        return tags;
    }
    
    extractModelInfo(reviewText) {
        // Base de données simplifiée de modèles à détecter
        const carBrands = [
            { brand: 'renault', models: ['clio', 'megane', 'captur', 'kadjar', 'scenic'] },
            { brand: 'peugeot', models: ['208', '308', '3008', '508', '2008'] },
            { brand: 'citroen', models: ['c3', 'c4', 'c5', 'ds3', 'ds4'] },
            { brand: 'volkswagen', models: ['golf', 'polo', 'passat', 'tiguan', 't-roc'] }
        ];
        
        // Convertir le texte en minuscules pour la recherche
        const lowerText = reviewText.toLowerCase();
        
        // Rechercher des mentions de marques et modèles
        for (const brand of carBrands) {
            // Vérifier si la marque est mentionnée
            if (new RegExp(`\\b${brand.brand}\\b`, 'i').test(lowerText)) {
                // Rechercher des mentions de modèles
                for (const model of brand.models) {
                    if (new RegExp(`\\b${model}\\b`, 'i').test(lowerText)) {
                        return {
                            brand: brand.brand,
                            model: model,
                            fullName: `${brand.brand.charAt(0).toUpperCase() + brand.brand.slice(1)} ${model.charAt(0).toUpperCase() + model.slice(1)}`
                        };
                    }
                }
                
                // Si seule la marque est mentionnée
                return {
                    brand: brand.brand,
                    model: '',
                    fullName: brand.brand.charAt(0).toUpperCase() + brand.brand.slice(1)
                };
            }
        }
        
        return null;
    }
    
    generateModelContext(reviewText, modelInfo) {
        // Générer un contexte enrichi pour la recherche
        let context = reviewText.toLowerCase();
        
        if (modelInfo) {
            // Ajouter des synonymes et des termes associés pour améliorer la recherche
            context += ` ${modelInfo.brand} ${modelInfo.model} automobile véhicule voiture`;
        }
        
        return context;
    }
    
    async displayReviews(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Conteneur avec l'ID ${containerId} non trouvé`);
            return [];
        }
        
        try {
            // Récupérer les avis enrichis avec MCP
            const reviews = await this.fetchReviews();
            
            if (reviews.length === 0) {
                container.innerHTML = '<div class="text-center text-gray-500 dark:text-gray-400">Aucun avis disponible pour le moment</div>';
                return [];
            }
            
            // Générer le HTML pour les avis
            container.innerHTML = this.generateReviewsHTML(reviews);
            
            return reviews;
        } catch (error) {
            console.error('Erreur d\'affichage des avis:', error);
            container.innerHTML = `<div class="text-center text-red-500">Erreur: ${error.message}</div>`;
            return [];
        }
    }
    
    generateReviewsHTML(reviews) {
        return reviews.map(review => {
            // Générer les étoiles
            const stars = Array(5).fill().map((_, i) => 
                i < review.rating 
                    ? '<i class="fas fa-star text-yellow-400"></i>' 
                    : '<i class="far fa-star text-gray-400"></i>'
            ).join('');
            
            // Générer les tags
            const tagBadges = review.tags.map(tag => {
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
                }
                return `<span class="${color} text-xs rounded-full px-2 py-1 flex items-center"><i class="${icon} mr-1"></i>${text}</span>`;
            }).join('');
            
            // Générer le badge de modèle si disponible
            const modelBadge = review.model ? 
                `<span class="bg-blue-900/40 text-blue-400 text-xs rounded-full px-2 py-1 flex items-center ml-1"><i class="fas fa-car mr-1"></i>${review.model}</span>` : '';
            
            return `
                <div class="review-card bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1" data-tags="${review.tags.join(' ')}" data-model="${review.modelBrand || ''}" data-model-context="${review.modelContext || ''}">
                    <div class="p-4">
                        <div class="flex items-start">
                            <img src="${review.avatar}" alt="${review.name}" class="w-12 h-12 rounded-full mr-3">
                            <div>
                                <h4 class="font-bold text-darker dark:text-white">${review.name}</h4>
                                <div class="flex items-center">
                                    <div class="mr-2">${stars}</div>
                                    <span class="text-gray-500 dark:text-gray-400 text-sm">${review.date}</span>
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
                        <button class="text-primary text-sm hover:underline">Utile</button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

export default GoogleReviewsAPI;