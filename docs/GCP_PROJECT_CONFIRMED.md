# ✅ Projet Google Cloud Existant Détecté
**Auto Pièces Équipements**

> Date : 2 octobre 2025  
> Statut : Projet GCP existant confirmé

---

## 📊 Informations du Projet

```yaml
Nom du projet: auto-pieces-equipements
Type: Projet Google Cloud Platform
Identifiant: auto-pieces-equipements
Statut: ✅ Actif
```

---

## 🎯 Prochaines Étapes

Maintenant que votre projet GCP existe, voici ce qu'il faut faire :

### 1️⃣ Vérifier les APIs Activées

**Aller sur :** https://console.cloud.google.com/apis/library?project=auto-pieces-equipements

**APIs nécessaires :**
```yaml
À vérifier/activer:
  - [ ] Places API (New)
  - [ ] Maps JavaScript API  
  - [ ] Geocoding API
  - [ ] Places API (Legacy)
```

**Comment vérifier :**
```
Console GCP > APIs & Services > Enabled APIs & Services
```

---

### 2️⃣ Vérifier/Créer les Clés API

**Aller sur :** https://console.cloud.google.com/apis/credentials?project=auto-pieces-equipements

#### Option A : Vérifier les Clés Existantes

Si vous voyez déjà des clés API :
1. Cliquez sur le nom de la clé
2. Vérifiez les restrictions
3. Testez si elle fonctionne

#### Option B : Créer une Nouvelle Clé

Si aucune clé valide ou pour en créer une nouvelle :

**Étapes :**
```
1. Cliquer sur "Create Credentials"
2. Sélectionner "API Key"
3. La clé est générée automatiquement
4. IMPORTANT : Cliquer immédiatement sur "Restrict Key"
```

---

### 3️⃣ Restreindre la Clé API (CRUCIAL)

#### Pour le Frontend (Site Web)

```yaml
Nom de la clé: auto-pieces-frontend-key

Restrictions d'application:
  Type: HTTP referrers (sites web)
  Sites web autorisés:
    - https://autopieces-equipements.fr/*
    - https://*.autopieces-equipements.fr/*
    - http://localhost:*/*
    - http://127.0.0.1:*/*

Restrictions d'API:
  - Places API (New)
  - Maps JavaScript API
  - Geocoding API
```

#### Pour le Backend (Serveur)

```yaml
Nom de la clé: auto-pieces-backend-key

Restrictions d'application:
  Type: IP addresses
  Adresses IP autorisées:
    - [IP de votre serveur]
    - [IP de Cloudflare Workers si utilisé]

Restrictions d'API:
  - Places API (New)
  - Geocoding API
```

---

## 🔧 Activer les APIs Étape par Étape

### Méthode 1 : Via Console Web (Recommandé)

1. **Aller sur la bibliothèque d'APIs**
   ```
   https://console.cloud.google.com/apis/library?project=auto-pieces-equipements
   ```

2. **Activer Places API (New)**
   - Rechercher "Places API (New)"
   - Cliquer sur le résultat
   - Cliquer sur "ENABLE" / "ACTIVER"
   - Attendre quelques secondes

3. **Activer Maps JavaScript API**
   - Rechercher "Maps JavaScript API"
   - Cliquer sur le résultat
   - Cliquer sur "ENABLE"

4. **Activer Geocoding API**
   - Rechercher "Geocoding API"
   - Cliquer sur le résultat
   - Cliquer sur "ENABLE"

### Méthode 2 : Via gcloud CLI

```bash
# Se connecter au projet
gcloud config set project auto-pieces-equipements

# Activer les APIs
gcloud services enable places-backend.googleapis.com
gcloud services enable maps-backend.googleapis.com
gcloud services enable geocoding-backend.googleapis.com

# Vérifier les APIs activées
gcloud services list --enabled
```

---

## 💳 Vérifier la Facturation

**IMPORTANT :** Les APIs Google nécessitent un compte de facturation actif.

### Vérifier si la Facturation est Active

**Aller sur :**
```
https://console.cloud.google.com/billing?project=auto-pieces-equipements
```

**Statuts possibles :**

#### ✅ Facturation Active
```
Compte de facturation : [Nom du compte]
Statut : Actif
→ Vous pouvez utiliser les APIs
```

#### ❌ Aucun Compte de Facturation
```
Statut : Aucun compte associé
→ Vous devez créer/associer un compte
```

### Créer un Compte de Facturation

Si vous n'en avez pas :

1. **Cliquer sur "Link a billing account"**
2. **Option A : Créer un nouveau compte**
   - Nom : "Auto Pièces Équipements - Facturation"
   - Pays : France
   - Devise : EUR (€)
   - Carte bancaire requise

3. **Option B : Lier un compte existant**
   - Sélectionner dans la liste
   - Confirmer

**Note :** Google offre $300 de crédit gratuit pour les nouveaux comptes (3 mois)

---

## 📋 Checklist de Configuration

### Étape 1 : Projet (✅ Déjà fait)
- [x] Projet GCP créé : `auto-pieces-equipements`

### Étape 2 : Facturation
- [ ] Compte de facturation créé/associé
- [ ] Carte bancaire ajoutée
- [ ] Facturation vérifiée comme active

### Étape 3 : APIs
- [ ] Places API (New) activée
- [ ] Maps JavaScript API activée
- [ ] Geocoding API activée
- [ ] Vérification des APIs dans la console

### Étape 4 : Clés API
- [ ] Clé Frontend créée
- [ ] Clé Frontend restreinte (HTTP referrers)
- [ ] Clé Backend créée (optionnel)
- [ ] Clé Backend restreinte (IP)
- [ ] Clés testées et fonctionnelles

### Étape 5 : Configuration Projet
- [ ] Clé ajoutée dans `.env`
- [ ] Configuration testée
- [ ] Avis Google affichés sur le site

---

## 🧪 Tester Votre Configuration

### Test 1 : Vérifier que l'API Fonctionne

Une fois la clé créée, testez-la :

```bash
# Remplacer VOTRE_NOUVELLE_CLE par la vraie clé
curl "https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJVVXZlqAT5kcRICTpgHlqx9A&key=VOTRE_NOUVELLE_CLE&fields=name,rating,reviews"
```

**Résultat attendu :**
```json
{
  "result": {
    "name": "Auto Pieces Equipements",
    "rating": 4.9,
    "reviews": [...]
  },
  "status": "OK"
}
```

**Si vous obtenez une erreur :**
```json
{
  "error_message": "...",
  "status": "REQUEST_DENIED"
}
```
→ Vérifier que l'API Places est bien activée et que la facturation est configurée

### Test 2 : Mettre à Jour le Fichier .env

```bash
# Éditer .env
nano .env

# Remplacer
GOOGLE_MAPS_API_KEY=AIzaSyDxnNu4toDv4yZtPsd6i_WRj60LJLM3eY4

# Par votre nouvelle clé
GOOGLE_MAPS_API_KEY=AIzaSy[VOTRE_NOUVELLE_CLE]
```

### Test 3 : Démarrer le Serveur

```bash
# Démarrer le serveur
npm start

# Ouvrir le site
open http://localhost:3000

# Vérifier que les avis s'affichent
```

---

## 🔗 Liens Rapides

### Console Google Cloud
```
Projet : https://console.cloud.google.com/home/dashboard?project=auto-pieces-equipements
APIs : https://console.cloud.google.com/apis/library?project=auto-pieces-equipements
Credentials : https://console.cloud.google.com/apis/credentials?project=auto-pieces-equipements
Facturation : https://console.cloud.google.com/billing?project=auto-pieces-equipements
Quotas : https://console.cloud.google.com/apis/dashboard?project=auto-pieces-equipements
```

### Documentation
```
Places API (New) : https://developers.google.com/maps/documentation/places/web-service/overview
Maps JavaScript : https://developers.google.com/maps/documentation/javascript
Geocoding API : https://developers.google.com/maps/documentation/geocoding
```

---

## 💡 Conseils Importants

### 1. Sécurité des Clés
```yaml
❌ Ne JAMAIS :
  - Commiter les clés dans Git
  - Partager les clés publiquement
  - Utiliser la même clé partout
  - Laisser une clé sans restriction

✅ TOUJOURS :
  - Restreindre par domaine ET par API
  - Utiliser des clés différentes (frontend/backend)
  - Stocker dans .env (ignoré par Git)
  - Surveiller l'utilisation
```

### 2. Quotas et Coûts
```yaml
Quota gratuit Places API:
  - $200 de crédit/mois
  - ~11,000 requêtes gratuites/mois
  
Usage estimé pour votre site:
  - 100 visiteurs/jour = 3000/mois
  - Coût: 0$ (dans le quota gratuit)

Monitoring:
  - Console GCP > APIs & Services > Dashboard
  - Voir graphiques d'utilisation
  - Alertes si dépassement
```

### 3. Maintenance
```yaml
À faire régulièrement:
  - Vérifier les quotas mensuellement
  - Rotation des clés tous les 90 jours
  - Surveiller les erreurs dans les logs
  - Mettre à jour les restrictions si domaine change
```

---

## 🚀 Commandes Rapides

```bash
# Ouvrir le projet dans la console
open "https://console.cloud.google.com/home/dashboard?project=auto-pieces-equipements"

# Ouvrir la page des APIs
open "https://console.cloud.google.com/apis/library?project=auto-pieces-equipements"

# Ouvrir les credentials
open "https://console.cloud.google.com/apis/credentials?project=auto-pieces-equipements"

# Éditer .env
code .env

# Tester l'intégration
npm start
```

---

## 📞 Besoin d'Aide ?

### Si les APIs ne s'activent pas
1. Vérifier la facturation
2. Vérifier les permissions du compte Google
3. Essayer dans un navigateur en navigation privée
4. Contacter le support Google Cloud

### Si la clé ne fonctionne pas
1. Vérifier que l'API est activée
2. Vérifier les restrictions
3. Attendre 5 minutes (propagation)
4. Tester avec curl (commande ci-dessus)

### Support Google Cloud
- Documentation : https://cloud.google.com/docs
- Support : https://console.cloud.google.com/support
- Forum : https://stackoverflow.com/questions/tagged/google-cloud-platform

---

## ✅ Résumé

**Vous avez :**
- ✅ Projet GCP : `auto-pieces-equipements`
- ✅ Place ID : `ChIJVVXZlqAT5kcRICTpgHlqx9A`

**Il vous reste à faire :**
1. Activer la facturation (si pas déjà fait)
2. Activer les 3 APIs nécessaires
3. Créer une clé API restreinte
4. Tester la clé
5. Mettre à jour `.env`
6. Vérifier que les avis s'affichent

**Temps estimé :** 15-20 minutes

---

**Dernière mise à jour :** 2 octobre 2025  
**Projet GCP :** auto-pieces-equipements ✅
