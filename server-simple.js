const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { publicFiles } = require('./scripts/site-config.mjs');
const { fetchPlaceDetails } = require('./server/google-places.cjs');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const app = express();
app.disable('x-powered-by');

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

app.get('/api/google-reviews', cors(), async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const placeId = process.env.GOOGLE_PLACE_ID;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!placeId || !apiKey) {
        return res.status(500).json({
            error: 'Configuration manquante',
            details: 'GOOGLE_PLACE_ID ou GOOGLE_MAPS_API_KEY non défini dans .env'
        });
    }
    try {
        const data = await fetchPlaceDetails({
            place_id: placeId,
            fields: 'name,rating,user_ratings_total,reviews,formatted_address,formatted_phone_number',
            key: apiKey,
            language: 'fr'
        });
        if (!isRecord(data) || typeof data.status !== 'string') throw new Error('Invalid Google response');
        if (data.status !== 'OK') {
            return res.status(400).json({
                success: false,
                error: data.status,
                message: 'Google Places n’a pas pu fournir les avis.'
            });
        }
        const result = data.result;
        if (!isRecord(result) ||
            (result.reviews !== undefined && !Array.isArray(result.reviews))) {
            throw new Error('Invalid Google result');
        }
        return res.json({ success: true, data: {
            name: result.name,
            rating: result.rating,
            totalReviews: result.user_ratings_total,
            reviews: result.reviews || [],
            address: result.formatted_address,
            phone: result.formatted_phone_number
        } });
    } catch (error) {
        const timedOut = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
        return res.status(timedOut ? 504 : 502).json({
            success: false,
            error: timedOut ? 'Délai Google Places dépassé' : 'Service Google Places indisponible'
        });
    }
});

app.get('/test', (req, res) => res.sendFile(path.join(__dirname, 'server/reviews-test.html')));
app.get('/test/reviews.js', (req, res) => res.sendFile(path.join(__dirname, 'server/reviews-test.js')));

// Share the publication allowlist. Never expose the repository as a static directory.
const allowedFiles = new Set(publicFiles);
app.use((req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method)) return next();
    let file;
    try {
        file = decodeURIComponent(req.path).slice(1) || 'index.html';
    } catch {
        return res.status(400).type('text').send('Adresse invalide');
    }
    if (!allowedFiles.has(file)) return next();
    return res.sendFile(file, { root: __dirname, dotfiles: 'deny' });
});
app.use((req, res) => res.status(404).type('text').send('Page introuvable'));
/** @type {import('express').ErrorRequestHandler} */
const handleError = (error, req, res, next) => {
    if (res.headersSent) return next(error);
    res.status(isRecord(error) && error.status === 404 ? 404 : 500).type('text').send('Ressource indisponible');
};
app.use(handleError);

function startServer() {
    const port = Number(process.env.PORT ?? 3000);
    const host = process.env.HOST || '127.0.0.1';
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
        throw new Error('PORT doit être un entier entre 0 et 65535.');
    }
    const server = app.listen(port, host, () => {
        const address = server.address();
        if (!address || typeof address === 'string') return;
        const hostname = address.address.includes(':') ? `[${address.address}]` : address.address;
        console.log(`Serveur Auto Pièces : http://${hostname}:${address.port}`);
        console.log('Diagnostic des avis : /test');
    });
    server.on('error', (error) => {
        const code = isRecord(error) && typeof error.code === 'string' ? error.code : 'UNKNOWN';
        console.error(`Démarrage impossible (${code}). Vérifiez HOST et PORT.`);
        process.exitCode = 1;
    });
    return server;
}

module.exports = Object.assign(app, { startServer });
if (require.main === module) startServer();
