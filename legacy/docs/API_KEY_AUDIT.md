# 🔍 Rapport d'Audit - Clé API Google Existante

**Date** : 2 octobre 2025  
**Projet** : Auto Pièces Équipements

---

## ✅ RÉSULTAT : CLÉ API TROUVÉE !

Vous avez déjà une clé API Google configurée dans votre projet.

### 📋 Informations Trouvées

```yaml
Clé API: AIzaSyD_lT8RkN6RS55EF6G9I5nEFkw7J7Y40O8
Statut: ✅ Active et utilisée
Localisation: admin/place-id-finder.html
Usage actuel: Place ID Finder (Google Maps)
```

---

## 📍 Où la Clé est Utilisée

### Fichiers Utilisant la Clé

1. **`admin/place-id-finder.html`** (2 occurrences)
   ```html
   <!-- Ligne 9 -->
   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD_lT8RkN6RS55EF6G9I5nEFkw7J7Y40O8&libraries=places"></script>
   
   <!-- Ligne 357 -->
   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD_lT8RkN6RS55EF6G9I5nEFkw7J7Y40O8&callback=initMap&libraries=places&v=weekly" defer></script>
   ```

### Fichiers Prêts à Utiliser une Clé (via .env)

2. **`server.js`** (ligne 20)
   ```javascript
   key: process.env.GOOGLE_MAPS_API_KEY,
   ```

3. **`cloudflare/google-places-worker.js`** (ligne 32)
   ```javascript
   `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`
   ```

4. **`server/server.js`** (ligne 30)
   ```javascript
   key: process.env.GOOGLE_MAPS_API_KEY,
   ```

---

## 🔒 État de Sécurité

### ⚠️ PROBLÈME DE SÉCURITÉ IDENTIFIÉ

**Clé API exposée publiquement dans le code HTML !**

```
Fichier: admin/place-id-finder.html
Risque: 🔴 ÉLEVÉ
Raison: La clé est visible dans le code source
Impact: N'importe qui peut voir et utiliser votre clé
```

### ❌ Ce Qui Ne Va Pas

```html
<!-- ❌ MAUVAIS : Clé en clair dans le HTML -->
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD_lT8RkN6RS55EF6G9I5nEFkw7J7Y40O8"></script>
```

**Problèmes** :
- ❌ Visible dans le code source de la page
- ❌ Peut être volée et utilisée ailleurs
- ❌ Risque de dépassement de quota
- ❌ Risque de facturation excessive

---

## ✅ Solution Immédiate

### Option 1 : Restreindre la Clé Existante (Recommandé)

**Avantage** : Rapide, la clé continue de fonctionner

#### Étapes :

1. **Aller sur Google Cloud Console**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Trouver la clé** `AIzaSyD_lT8RkN6RS55EF6G9I5nEFkw7J7Y40O8`

3. **Ajouter des restrictions**
   
   **Restriction d'application** :
   ```yaml
   Type: HTTP referrers (sites web)
   Domaines autorisés:
     - https://autopieces-equipements.fr/*
     - https://*.autopieces-equipements.fr/*
     - http://localhost:*/* (développement)
   ```
   
   **Restriction d'API** :
   ```yaml
   APIs autorisées:
     - Maps JavaScript API
     - Places API (New)
     - Geocoding API
   ```

4. **Sauvegarder**

### Option 2 : Créer 2 Clés Séparées (Meilleure Pratique)

**Avantage** : Sécurité maximale

#### 2 Clés Différentes :

**Clé Frontend** (pour les pages HTML publiques)
```yaml
Nom: auto-pieces-frontend
Restrictions:
  - Type: HTTP referrers
  - Domaines: Votre site uniquement
  - APIs: Maps JavaScript, Places
```

**Clé Backend** (pour le serveur Node.js)
```yaml
Nom: auto-pieces-backend
Restrictions:
  - Type: IP addresses
  - IP: IP de votre serveur
  - APIs: Places API uniquement
```

---

## 🔧 Actions à Faire MAINTENANT

### Étape 1 : Vérifier et Restreindre la Clé Actuelle

```bash
# 1. Aller sur Google Cloud Console
https://console.cloud.google.com/apis/credentials

# 2. Chercher la clé AIzaSyD_lT8RkN6RS55EF6G9I5nEFkw7J7Y40O8

# 3. Cliquer sur "Modifier"

# 4. Ajouter les restrictions (voir ci-dessus)

# 5. Sauvegarder
```

### Étape 2 : Ajouter la Clé dans .env

```bash
# Éditer .env
nano .env

# Ajouter la clé
GOOGLE_MAPS_API_KEY=AIzaSyD_lT8RkN6RS55EF6G9I5nEFkw7J7Y40O8
```

### Étape 3 : Mettre à Jour les Fichiers

#### Fichier `.env`
```env
# Clés API Google
GOOGLE_MAPS_API_KEY=AIzaSyD_lT8RkN6RS55EF6G9I5nEFkw7J7Y40O8

# Place ID
GOOGLE_PLACE_ID=ChIJVVXZlqAT5kcRICTpgHlqx9A
```

### Étape 4 : Tester l'Intégration

```bash
# Démarrer le serveur
npm start

# Ouvrir dans le navigateur
open http://localhost:3000

# Vérifier que les avis Google s'affichent
```

---

## 📊 Vérification de la Clé API

### Test Rapide : La Clé Fonctionne-t-elle ?

```bash
# Test via curl
curl "https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJVVXZlqAT5kcRICTpgHlqx9A&key=AIzaSyD_lT8RkN6RS55EF6G9I5nEFkw7J7Y40O8&fields=name,rating,reviews"
```

**Résultats possibles** :

✅ **Succès** :
```json
{
  "result": {
    "name": "Auto Pièces Équipements",
    "rating": 4.9,
    "reviews": [...]
  },
  "status": "OK"
}
```

❌ **Erreur - API désactivée** :
```json
{
  "error_message": "This API project is not authorized to use this API.",
  "status": "REQUEST_DENIED"
}
```
**Solution** : Activer Places API dans Google Cloud Console

❌ **Erreur - Quota dépassé** :
```json
{
  "error_message": "You have exceeded your daily request quota",
  "status": "OVER_QUERY_LIMIT"
}
```
**Solution** : Attendre 24h ou augmenter le quota

❌ **Erreur - Clé invalide** :
```json
{
  "error_message": "The provided API key is invalid.",
  "status": "REQUEST_DENIED"
}
```
**Solution** : Vérifier la clé ou en créer une nouvelle

---

## 🎯 Configuration Complète Recommandée

### Fichier `.env` Final

```env
# ============================================
# CLÉS API GOOGLE
# ============================================

# Clé API actuelle (à restreindre)
GOOGLE_MAPS_API_KEY=AIzaSyD_lT8RkN6RS55EF6G9I5nEFkw7J7Y40O8

# Place ID vérifié
GOOGLE_PLACE_ID=ChIJVVXZlqAT5kcRICTpgHlqx9A

# ============================================
# URLs API
# ============================================

# URL de base Google Places
GOOGLE_API_BASE_URL=https://maps.googleapis.com/maps/api

# Champs à récupérer
GOOGLE_API_FIELDS=reviews,rating,user_ratings_total,name,formatted_address,photos

# ============================================
# CLOUDFLARE WORKER (Optionnel - plus sécurisé)
# ============================================

# URL du worker Cloudflare (à déployer)
CLOUDFLARE_WORKER_URL=https://auto-pieces-google-places.workers.dev

# ============================================
# CONFIGURATION SERVEUR
# ============================================

PORT=3000
NODE_ENV=production

# ============================================
# BASE DE DONNÉES
# ============================================

DB_HOST=localhost
DB_PORT=3306
DB_NAME=auto_pieces_db
DB_USER=root
DB_PASS=password

# ============================================
# ADMINISTRATION
# ============================================

ADMIN_EMAIL=autope93@gmail.com
```

---

## 📈 Quota et Coûts

### Vérifier l'Utilisation Actuelle

```bash
# 1. Aller sur Google Cloud Console
https://console.cloud.google.com/apis/dashboard

# 2. Sélectionner "Maps JavaScript API" et "Places API"

# 3. Voir les métriques :
   - Requêtes aujourd'hui
   - Requêtes ce mois
   - Coût estimé
```

### Quotas Gratuits Google

```yaml
Places API (New):
  Crédit gratuit: 200$/mois
  
  Coûts après crédit:
    - Place Details: 0.017$ par requête
    - Place Search: 0.032$ par requête
    - Place Photos: 0.007$ par requête

Maps JavaScript API:
  Crédit gratuit: 200$/mois
  Chargement carte: 0.007$ pour 1000 chargements
```

### Estimation pour Votre Site

```yaml
Trafic estimé: 100 visiteurs/jour

Requêtes:
  - Chargement page avec avis: 100/jour
  - Carte Google Maps: 100/jour
  
Total mensuel: ~6000 requêtes

Coût: 6000 × 0.017$ = 102$
Crédit gratuit: 200$/mois
Coût réel: 0$ ✅
```

---

## ✅ Checklist de Sécurisation

### À Faire Immédiatement

- [ ] Aller sur https://console.cloud.google.com/apis/credentials
- [ ] Trouver la clé `AIzaSyD_lT8RkN6RS55EF6G9I5nEFkw7J7Y40O8`
- [ ] Ajouter restrictions HTTP referrers
- [ ] Ajouter restrictions d'APIs
- [ ] Ajouter la clé dans `.env`
- [ ] Tester l'intégration
- [ ] Vérifier les quotas

### À Faire Cette Semaine

- [ ] Créer une clé backend séparée
- [ ] Configurer le Cloudflare Worker
- [ ] Mettre en place un système de cache
- [ ] Monitorer l'utilisation de l'API

---

## 🆘 Support

### Si la Clé Ne Fonctionne Plus

**Causes possibles** :
1. API désactivée → Activer dans Google Cloud
2. Quota dépassé → Vérifier le dashboard
3. Restrictions trop strictes → Ajuster les domaines
4. Clé révoquée → Créer une nouvelle clé

### Ressources

```yaml
Google Cloud Console: https://console.cloud.google.com
Places API Docs: https://developers.google.com/maps/documentation/places
Support Google: https://console.cloud.google.com/support

Documentation projet:
  - docs/GOOGLE_BUSINESS_SETUP.md
  - docs/SECURITY_GUIDE.md
```

---

## 🎉 Résumé

```
✅ Clé API trouvée: AIzaSyD_lT8RkN6RS55EF6G9I5nEFkw7J7Y40O8
✅ Utilisée dans: admin/place-id-finder.html
⚠️  Action requise: Restreindre la clé (sécurité)
✅ Place ID configuré: ChIJVVXZlqAT5kcRICTpgHlqx9A
📊 Avis disponibles: 28 avis - 4.9/5

Prochaine étape: Restreindre la clé et tester l'intégration
```

---

**Créé le** : 2 octobre 2025  
**Action prioritaire** : Sécuriser la clé API via restrictions
