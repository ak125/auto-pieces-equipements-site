const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleAuth } = require('google-auth-library');
const { createClient } = require('@google/maps');
const natural = require('natural');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Initialisation du serveur Express
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '.')));

// Configuration Google Maps/Places API
const googleMapsClient = createClient({
    key: process.env.GOOGLE_MAPS_API_KEY,
    Promise: Promise
});

// Base de données de véhicules et pièces (en production, utilisez une vraie base de données)
const vehiclesDB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/vehicles.json')));
const partsDB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/parts.json')));
const dtcCodesDB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/dtc_codes.json')));

// API pour enrichir les avis avec MCP
app.post('/api/mcp/enrich-reviews', (req, res) => {
    const { reviews } = req.body;
    
    if (!reviews || !Array.isArray(reviews)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Format de données invalide' 
        });
    }
    
    // Traitement du langage naturel sur les avis
    const tokenizer = new natural.WordTokenizer();
    const stemmer = natural.PorterStemmerFr;
    
    // Enrichir chaque avis
    const enrichedReviews = reviews.map(review => {
        const text = review.text || '';
        const tokens = tokenizer.tokenize(text.toLowerCase());
        
        // Détecter les mentions de modèles de véhicules
        let model = null;
        let modelContext = '';
        
        for (const vehicle of vehiclesDB) {
            const manufacturer = vehicle.manufacturer.toLowerCase();
            for (const modelName of vehicle.models) {
                const modelNameLower = modelName.toLowerCase();
                if (text.toLowerCase().includes(`${manufacturer} ${modelNameLower}`)) {
                    model = `${vehicle.manufacturer} ${modelName}`;
                    modelContext = `${manufacturer} ${modelNameLower} ${vehicle.keywords.join(' ')}`;
                    break;
                }
            }
            if (model) break;
        }
        
        // Détection de tags pour les services
        const tags = [];
        
        // Mots-clés pour le diagnostic MCP
        const mcpKeywords = ['diagnostic', 'scanner', 'obd', 'lecture', 'mcp', 'erreur', 'code'];
        if (mcpKeywords.some(keyword => tokens.includes(keyword))) {
            tags.push('mcp');
        }
        
        // Mots-clés pour les pièces
        const partsKeywords = ['pièce', 'pièces', 'achat', 'commander', 'reçu', 'livraison'];
        if (partsKeywords.some(keyword => tokens.includes(keyword))) {
            tags.push('parts');
        }
        
        // Mots-clés pour le service
        const serviceKeywords = ['répara', 'service', 'garage', 'technic', 'mécan', 'montage'];
        if (serviceKeywords.some(keyword => tokens.some(token => token.startsWith(keyword)))) {
            tags.push('service');
        }
        
        return {
            ...review,
            model,
            modelContext,
            tags: tags.length > 0 ? tags : undefined
        };
    });
    
    res.json({
        success: true,
        reviews: enrichedReviews
    });
});

// API pour obtenir des recommandations basées sur les codes d'erreur
app.post('/api/mcp/get-recommendations', (req, res) => {
    const { dtcCodes, vehicleInfo } = req.body;
    
    if (!dtcCodes || !Array.isArray(dtcCodes)) {
        return res.status(400).json({
            success: false,
            error: 'Format de données invalide'
        });
    }
    
    // Rechercher les pièces recommandées pour chaque code d'erreur
    const recommendations = [];
    
    dtcCodes.forEach(code => {
        const dtcInfo = dtcCodesDB.find(dtc => dtc.code === code);
        
        if (dtcInfo) {
            // Trouver les pièces correspondantes
            const relatedParts = partsDB.filter(part => 
                part.dtcCodes.includes(code) && 
                (!vehicleInfo || part.compatibleVehicles.includes(vehicleInfo.model))
            );
            
            recommendations.push({
                code,
                description: dtcInfo.description,
                severity: dtcInfo.severity,
                possibleCauses: dtcInfo.possibleCauses,
                recommendedParts: relatedParts.map(part => ({
                    id: part.id,
                    name: part.name,
                    reference: part.reference,
                    price: part.price,
                    compatibility: part.compatibilityRating,
                    inStock: part.inStock
                }))
            });
        }
    });
    
    res.json({
        success: true,
        recommendations
    });
});

// Route pour les avis Google
app.get('/api/google-reviews', async (req, res) => {
    const { placeId } = req.query;
    
    if (!placeId) {
        return res.status(400).json({ error: 'Place ID requis' });
    }
    
    try {
        // Si pas de clé API, retourner une réponse simulée
        if (!process.env.GOOGLE_API_KEY) {
            console.warn('Aucune clé API Google trouvée, retour de données simulées');
            return res.json(getMockGoogleReviews(placeId));
        }
        
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
                place_id: placeId,
                fields: 'name,rating,reviews',
                key: process.env.GOOGLE_API_KEY,
                language: 'fr'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Erreur lors de la récupération des avis Google:', error);
        
        // En cas d'erreur, retourner des données mockées
        res.json(getMockGoogleReviews(placeId));
    }
});

// Fonction pour générer des avis simulés
function getMockGoogleReviews(placeId) {
    return {
        result: {
            name: "Auto Pièces Équipements",
            rating: 4.7,
            reviews: [
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
                },
                {
                    author_name: "Émilie Rousseau",
                    rating: 5,
                    relative_time_description: "Il y a 2 mois",
                    text: "Excellente qualité des pièces et prix compétitifs pour ma Citroën C3. La livraison a été rapide et le suivi par email très pratique. Je reviendrai sans hésiter.",
                    profile_photo_url: "https://randomuser.me/api/portraits/women/29.jpg",
                    time: 1672663243
                },
                {
                    author_name: "Thomas Petit",
                    rating: 5,
                    relative_time_description: "Il y a 3 mois",
                    text: "Le diagnostic MCP a identifié un problème de vanne EGR sur mon véhicule Peugeot. Le technicien m'a montré les données en temps réel et expliqué les causes du problème. Travail professionnel et transparent.",
                    profile_photo_url: "https://randomuser.me/api/portraits/men/42.jpg",
                    time: 1670071243
                },
                {
                    author_name: "Clara Martin",
                    rating: 4,
                    relative_time_description: "Il y a 3 mois",
                    text: "Support technique très réactif. J'ai eu un doute sur la compatibilité d'une pièce pour ma Renault Megane, ils m'ont guidé par vidéo pour vérifier. L'application est aussi très bien faite.",
                    profile_photo_url: "https://randomuser.me/api/portraits/women/63.jpg",
                    time: 1669984843
                }
            ]
        }
    };
}

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur MCP démarré sur le port ${PORT}`);
    console.log(`API des avis Google disponible sur http://localhost:${PORT}/api/google-reviews`);
    console.log(`Place ID configuré: ChIJVVXZlqAT5kcRICTpgHlqx9A (Auto Pièces Équipements)`);
});