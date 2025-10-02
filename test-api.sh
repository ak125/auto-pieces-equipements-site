#!/bin/bash

# Script de test de l'API Google Places
# Auto Pièces Équipements

echo "🔍 Test de Configuration Google Places API"
echo "=========================================="
echo ""

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ Fichier .env chargé"
else
    echo "❌ Fichier .env introuvable"
    exit 1
fi

echo "📍 Place ID: $GOOGLE_PLACE_ID"
echo "🔑 Clé API: ${GOOGLE_MAPS_API_KEY:0:20}..."
echo ""

# Test 1: Places API (New) - Recommandé
echo "📡 Test 1: Places API (New)"
echo "----------------------------"

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
  "https://places.googleapis.com/v1/places/$GOOGLE_PLACE_ID" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $GOOGLE_MAPS_API_KEY" \
  -H "X-Goog-FieldMask: displayName,rating,userRatingCount")

HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "Status Code: $HTTP_CODE"

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ SUCCESS! L'API fonctionne parfaitement!"
    echo ""
    echo "📊 Données récupérées:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo "🎉 Configuration complète! Vous pouvez maintenant:"
    echo "   1. Démarrer le serveur: npm start"
    echo "   2. Configurer Cloudflare Worker"
    echo "   3. Déployer en production"
elif [ "$HTTP_CODE" == "403" ] || [ "$HTTP_CODE" == "400" ]; then
    echo "⚠️  ERREUR: API non activée ou restrictions incorrectes"
    echo ""
    echo "🔧 Actions requises:"
    echo "   1. Activer Places API (New) dans GCP Console"
    echo "   2. Vérifier les restrictions de la clé API"
    echo "   3. Attendre 2-3 minutes la propagation"
    echo ""
    echo "📋 Liens utiles:"
    echo "   - Activer l'API: https://console.cloud.google.com/apis/library/places-backend.googleapis.com?project=auto-pieces-equipements"
    echo "   - Gérer les clés: https://console.cloud.google.com/apis/credentials?project=auto-pieces-equipements"
    echo ""
    echo "Réponse complète:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
elif [ "$HTTP_CODE" == "404" ]; then
    echo "⚠️  ERREUR 404: Place ID introuvable ou API pas encore activée"
    echo ""
    echo "Vérifications:"
    echo "   - Place ID correct? $GOOGLE_PLACE_ID"
    echo "   - API activée dans GCP?"
    echo "   - Délai de propagation (attendre 2-3 min)"
else
    echo "❌ ERREUR: Code HTTP inattendu"
    echo ""
    echo "Réponse:"
    echo "$BODY"
fi

echo ""
echo "----------------------------"
echo ""

# Test 2: Legacy API (pour comparaison)
echo "📡 Test 2: Legacy API (déprécié - pour information)"
echo "----------------------------"

LEGACY_RESPONSE=$(curl -s \
  "https://maps.googleapis.com/maps/api/place/details/json?place_id=$GOOGLE_PLACE_ID&key=$GOOGLE_MAPS_API_KEY&fields=name,rating")

LEGACY_STATUS=$(echo "$LEGACY_RESPONSE" | python3 -c "import json, sys; print(json.load(sys.stdin).get('status', 'UNKNOWN'))" 2>/dev/null)

echo "Status: $LEGACY_STATUS"

if [ "$LEGACY_STATUS" == "OK" ]; then
    echo "✅ Legacy API fonctionne (mais préférez la nouvelle API)"
elif [ "$LEGACY_STATUS" == "REQUEST_DENIED" ]; then
    echo "⚠️  Normal: Legacy API non activée (utilisez Places API New)"
else
    echo "ℹ️  Status: $LEGACY_STATUS"
fi

echo ""
echo "=========================================="
echo "📋 Résumé:"
echo ""

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Configuration fonctionnelle!"
    echo "   Vous pouvez utiliser l'API Places (New)"
    echo ""
    echo "💰 Coût estimé avec cache:"
    echo "   ~720 requêtes/mois = 12$ sur 200$ gratuits"
    echo "   = 🎉 GRATUIT!"
else
    echo "⚠️  Configuration incomplète"
    echo "   Suivez le guide: docs/VERIFICATION_API.md"
    echo ""
    echo "🔗 Liens rapides:"
    echo "   - https://console.cloud.google.com/apis/library/places-backend.googleapis.com?project=auto-pieces-equipements"
    echo "   - https://console.cloud.google.com/apis/credentials?project=auto-pieces-equipements"
fi

echo ""
echo "=========================================="
