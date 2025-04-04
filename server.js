const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleAuth } = require('google-auth-library');
const { createClient } = require('@google/maps');
const natural = require('natural');
const fs = require('fs');
const path = require('path');

// Initialisation du serveur Express
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

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

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur MCP démarré sur le port ${PORT}`);
});