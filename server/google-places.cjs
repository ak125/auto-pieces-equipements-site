const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

// Native Node fetch: reject non-2xx responses and bound both headers and body reads.
/**
 * @param {Record<string, string>} params
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<unknown>}
 */
async function fetchPlaceDetails(params, { timeoutMs = 10_000 } = {}) {
    const url = new URL(GOOGLE_PLACES_URL);
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });

    if (!response.ok) {
        await response.body?.cancel();
        // Do not include the URL: its query string contains the API key.
        throw new Error(`Google Places HTTP ${response.status}`);
    }

    return response.json();
}

module.exports = { fetchPlaceDetails };
