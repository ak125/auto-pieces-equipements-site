const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Route API pour récupérer les avis Google
app.get('/api/google-reviews', async (req, res) => {
    try {
        const placeId = process.env.GOOGLE_PLACE_ID;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!placeId || !apiKey) {
            return res.status(500).json({
                error: 'Configuration manquante',
                details: 'GOOGLE_PLACE_ID ou GOOGLE_MAPS_API_KEY non défini dans .env'
            });
        }

        // Utilisation de l'API Legacy qui fonctionne
        const url = `https://maps.googleapis.com/maps/api/place/details/json`;
        const params = {
            place_id: placeId,
            fields: 'name,rating,user_ratings_total,reviews,formatted_address,formatted_phone_number',
            key: apiKey,
            language: 'fr'
        };

        console.log('📡 Récupération des avis Google...');
        const response = await axios.get(url, { params });

        if (response.data.status === 'OK') {
            const result = response.data.result;
            console.log(`✅ Avis récupérés: ${result.reviews?.length || 0} avis sur ${result.user_ratings_total} total`);
            
            res.json({
                success: true,
                data: {
                    name: result.name,
                    rating: result.rating,
                    totalReviews: result.user_ratings_total,
                    reviews: result.reviews || [],
                    address: result.formatted_address,
                    phone: result.formatted_phone_number
                }
            });
        } else {
            console.error('❌ Erreur API:', response.data.status, response.data.error_message);
            res.status(400).json({
                success: false,
                error: response.data.status,
                message: response.data.error_message
            });
        }
    } catch (error) {
        console.error('❌ Erreur serveur:', error.message);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur',
            details: error.message
        });
    }
});

// Page de test
app.get('/test', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Avis Google - Auto Pièces Équipements</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            color: #333;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .stats {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin-top: 20px;
        }
        .stat {
            background: #f8f9fa;
            padding: 20px 30px;
            border-radius: 15px;
            text-align: center;
        }
        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .reviews-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
        }
        .review-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }
        .review-card:hover {
            transform: translateY(-5px);
        }
        .review-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        }
        .review-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
        }
        .review-author {
            font-weight: bold;
            color: #333;
        }
        .review-date {
            color: #999;
            font-size: 0.85em;
        }
        .review-rating {
            color: #ffa500;
            font-size: 1.2em;
            margin-bottom: 10px;
        }
        .review-text {
            color: #555;
            line-height: 1.6;
        }
        .loading {
            text-align: center;
            padding: 60px;
            color: white;
            font-size: 1.5em;
        }
        .error {
            background: #fff3cd;
            border: 2px solid #ffc107;
            color: #856404;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .success {
            background: #d4edda;
            border: 2px solid #28a745;
            color: #155724;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚗 Auto Pièces Équipements</h1>
            <p>Test de Récupération des Avis Google</p>
            <div class="stats" id="stats"></div>
        </div>
        <div id="content" class="loading">
            ⏳ Chargement des avis Google...
        </div>
    </div>

    <script>
        async function loadReviews() {
            try {
                console.log('Fetching reviews from /api/google-reviews...');
                const response = await fetch('/api/google-reviews');
                const result = await response.json();

                if (result.success) {
                    const { name, rating, totalReviews, reviews, address, phone } = result.data;
                    
                    // Stats
                    document.getElementById('stats').innerHTML = \`
                        <div class="stat">
                            <div class="stat-value">⭐ \${rating}</div>
                            <div class="stat-label">Note Moyenne</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">\${totalReviews}</div>
                            <div class="stat-label">Avis Total</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">\${reviews.length}</div>
                            <div class="stat-label">Avis Affichés</div>
                        </div>
                    \`;

                    // Reviews
                    document.getElementById('content').innerHTML = \`
                        <div class="success">
                            ✅ <strong>Succès !</strong> Les avis Google sont récupérés correctement.
                            <br><br>
                            <strong>Établissement :</strong> \${name}<br>
                            <strong>Adresse :</strong> \${address || 'Non disponible'}<br>
                            <strong>Téléphone :</strong> \${phone || 'Non disponible'}
                        </div>
                        <div class="reviews-grid">
                            \${reviews.map(review => \`
                                <div class="review-card">
                                    <div class="review-header">
                                        <img src="\${review.profile_photo_url}" alt="\${review.author_name}" class="review-avatar">
                                        <div>
                                            <div class="review-author">\${review.author_name}</div>
                                            <div class="review-date">\${review.relative_time_description}</div>
                                        </div>
                                    </div>
                                    <div class="review-rating">\${'⭐'.repeat(review.rating)}</div>
                                    <div class="review-text">\${review.text}</div>
                                </div>
                            \`).join('')}
                        </div>
                    \`;
                } else {
                    throw new Error(result.message || 'Erreur inconnue');
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('content').innerHTML = \`
                    <div class="error">
                        ❌ <strong>Erreur :</strong> \${error.message}
                        <br><br>
                        Vérifiez la console pour plus de détails.
                    </div>
                \`;
            }
        }

        loadReviews();
    </script>
</body>
</html>
    `);
});

// Route par défaut
app.get('/', (req, res) => {
    res.redirect('/test');
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ============================================');
    console.log('   Auto Pièces Équipements - Serveur Démarré');
    console.log('   ============================================');
    console.log('');
    console.log(`   🌐 URL locale:     http://localhost:${PORT}`);
    console.log(`   🧪 Page de test:   http://localhost:${PORT}/test`);
    console.log(`   📡 API endpoint:   http://localhost:${PORT}/api/google-reviews`);
    console.log('');
    console.log('   📍 Place ID:', process.env.GOOGLE_PLACE_ID || '❌ Non configuré');
    console.log('   🔑 API Key:', process.env.GOOGLE_MAPS_API_KEY ? '✅ Configurée' : '❌ Non configurée');
    console.log('');
    console.log('   💡 Appuyez sur CTRL+C pour arrêter');
    console.log('   ============================================');
    console.log('');
});
