addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Utiliser les variables d'environnement définies dans wrangler.toml
  const API_KEY = env.API_KEY || 'VOTRE_CLE_SECRETE'
  const ALLOWED_ORIGINS = (env.ALLOWED_ORIGINS || 'https://votre-domaine.com').split(',')
  
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': getValidOrigin(request, ALLOWED_ORIGINS),
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Max-Age': '86400',
  }

  // Gestion des requêtes OPTIONS (preflight CORS)
  if (request.method === 'OPTIONS') {
    return handleOptions(request, CORS_HEADERS)
  }

  try {
    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('placeId')

    // Validation des paramètres
    if (!placeId || !/^[a-zA-Z0-9_-]{27,}$/.test(placeId)) {
      return new Response('Invalid Place ID', { status: 400, headers: CORS_HEADERS })
    }

    // Appel à l'API Google Places
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`
    )

    // Traitement de la réponse
    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      headers: { 
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache 1h
      }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { 
      status: 500,
      headers: CORS_HEADERS 
    })
  }
}

/**
 * Gère les requêtes OPTIONS (preflight CORS)
 */
function handleOptions(request, corsHeaders) {
  // Ajouter tous les headers CORS pour les requêtes OPTIONS
  return new Response(null, {
    headers: {
      ...corsHeaders,
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}

/**
 * Valide l'origine de la requête
 */
function getValidOrigin(request, allowedOrigins) {
  const origin = request.headers.get('Origin')
  if (origin && allowedOrigins.includes(origin)) {
    return origin
  }
  // Par défaut, retourner la première origine autorisée
  return allowedOrigins[0]
}
