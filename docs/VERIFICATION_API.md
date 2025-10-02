# ✅ Vérification et Activation de l'API Google Places

## 📋 État Actuel

**Clé API créée :** `AIzaSyBuwRyhi7erxNsoXzc8XlX0cK9oC8g--MI`  
**Projet GCP :** `auto-pieces-equipements`  
**Place ID :** `ChIJVVXZlqAT5kcRICTpgHlqx9A`

---

## ⚠️ Problème Détecté

L'API retourne une erreur `REQUEST_DENIED` avec le message :
```
You're calling a legacy API, which is not enabled for your project.
To get newer features and more functionality, switch to the Places API (New).
```

**Cause :** La nouvelle Places API (New) n'est pas encore activée dans votre projet GCP.

---

## 🔧 Actions Requises (5 minutes)

### Étape 1 : Activer Places API (New)

1. **Aller dans la console GCP :**
   - URL directe : https://console.cloud.google.com/apis/library/places-backend.googleapis.com?project=auto-pieces-equipements

2. **Cliquer sur "ACTIVER" (bouton bleu)**
   - L'activation prend 30 secondes

3. **Confirmer l'activation**
   - Vous verrez "API activée" avec une coche verte

### Étape 2 : Vérifier les Restrictions de la Clé API

1. **Aller dans Credentials :**
   - https://console.cloud.google.com/apis/credentials?project=auto-pieces-equipements

2. **Cliquer sur votre clé API** (celle qui se termine par `--MI`)

3. **Vérifier les restrictions d'API :**
   ```yaml
   API restrictions: Restrict key
   
   APIs sélectionnées:
     ✅ Places API (New)
     ✅ Maps JavaScript API (optionnel)
   ```

4. **Si pas encore fait, ajouter Places API (New) :**
   - Cliquer sur "Restrict key"
   - Chercher "Places API (New)"
   - Cocher la case
   - Cliquer "Save"

### Étape 3 : Vérifier les Restrictions HTTP Referrers

Si vous voulez utiliser la clé depuis votre site web :

```yaml
Application restrictions:
  Type: HTTP referrers (web sites)
  
Website restrictions:
  - https://autopieces-equipements.fr/*
  - https://*.autopieces-equipements.fr/*
  - http://localhost:*/*
```

**⚠️ Pour les tests en terminal :** Créez une deuxième clé "Backend" sans restrictions HTTP.

---

## 🧪 Tests de Vérification

### Test 1 : API Legacy (devrait échouer - normal)

```bash
curl "https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJVVXZlqAT5kcRICTpgHlqx9A&key=AIzaSyBuwRyhi7erxNsoXzc8XlX0cK9oC8g--MI"
```

**Résultat attendu :** `REQUEST_DENIED` (normal, legacy API)

### Test 2 : Places API (New) - Version correcte

```bash
curl -X POST "https://places.googleapis.com/v1/places/ChIJVVXZlqAT5kcRICTpgHlqx9A" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: AIzaSyBuwRyhi7erxNsoXzc8XlX0cK9oC8g--MI" \
  -H "X-Goog-FieldMask: displayName,rating,userRatingCount,reviews"
```

**Résultat attendu après activation :**
```json
{
  "displayName": {
    "text": "Auto Pièces Équipements",
    "languageCode": "fr"
  },
  "rating": 4.9,
  "userRatingCount": 28,
  "reviews": [...]
}
```

### Test 3 : Via Node.js (après activation)

```bash
cd /workspaces/auto-pieces-equipements-site
npm start
```

Puis ouvrir dans le navigateur : http://localhost:3000

---

## 📊 Checklist de Vérification

Cochez au fur et à mesure :

### Dans Google Cloud Console

- [ ] **Billing activé** (compte de facturation lié au projet)
  - Vérifier : https://console.cloud.google.com/billing/projects?project=auto-pieces-equipements

- [ ] **Places API (New) activée**
  - Vérifier : https://console.cloud.google.com/apis/library/places-backend.googleapis.com?project=auto-pieces-equipements
  - État : Doit afficher "API activée" en vert

- [ ] **Clé API créée**
  - ✅ Déjà fait : `AIzaSyBuwRyhi7erxNsoXzc8XlX0cK9oC8g--MI`

- [ ] **Clé API configurée pour Places API (New)**
  - Vérifier : https://console.cloud.google.com/apis/credentials?project=auto-pieces-equipements
  - Ouvrir la clé > API restrictions > Doit inclure "Places API (New)"

### Dans le Projet

- [x] **Fichier .env mis à jour**
  - ✅ Clé API ajoutée : `GOOGLE_MAPS_API_KEY=AIzaSyBuwRyhi7erxNsoXzc8XlX0cK9oC8g--MI`

- [ ] **Test API réussi**
  - Après activation, relancer le test curl ci-dessus

- [ ] **Serveur Node.js testé**
  - `npm start` et vérifier les avis sur http://localhost:3000

---

## 🚨 Dépannage

### Erreur : "REQUEST_DENIED"

**Causes possibles :**
1. ❌ Places API (New) pas activée → **Activer dans GCP Console**
2. ❌ Billing pas activé → **Ajouter un compte de facturation**
3. ❌ Clé API pas restreinte à Places API (New) → **Modifier les restrictions**
4. ❌ Restrictions HTTP trop strictes → **Créer une clé backend séparée**

### Erreur : "PERMISSION_DENIED"

**Causes possibles :**
1. ❌ Compte GCP sans permissions → **Vérifier que vous êtes propriétaire du projet**
2. ❌ API désactivée → **Réactiver Places API (New)**

### Erreur : "INVALID_ARGUMENT"

**Causes possibles :**
1. ❌ Place ID incorrect → **Vérifier avec place-id-finder.html**
2. ❌ Format de requête incorrect → **Utiliser la syntaxe Places API (New)**

### Pas d'erreur mais résultat vide

**Causes possibles :**
1. ❌ Délai de propagation (attendre 2-3 minutes)
2. ❌ Cache navigateur → **Vider le cache / CTRL+SHIFT+R**
3. ❌ Field mask incorrect → **Vérifier les champs demandés**

---

## 📝 Notes Importantes

### Différences API Legacy vs New

| Caractéristique | Legacy API | Places API (New) |
|----------------|-----------|------------------|
| **Endpoint** | `maps.googleapis.com/maps/api/place/` | `places.googleapis.com/v1/` |
| **Méthode HTTP** | GET | POST |
| **Header API Key** | Query param `?key=` | Header `X-Goog-Api-Key:` |
| **Format réponse** | JSON simple | JSON structuré |
| **Prix** | 0,017 $/requête | 0,017 $/requête (identique) |
| **Support** | Déprécié 2024+ | Recommandé |

### Coûts Estimés

Avec votre configuration actuelle :
```yaml
Crédit gratuit mensuel: 200 $ USD
Requêtes estimées: 720/mois (avec cache)
Coût estimé: 12,24 $ (6% du crédit gratuit)
Résultat: 🎉 GRATUIT !
```

---

## 🎯 Prochaines Étapes

Une fois l'API activée et testée :

1. **Configurer le Cloudflare Worker**
   ```bash
   cd google-places-proxy
   npx wrangler secret put GOOGLE_API_KEY
   # Entrer: AIzaSyBuwRyhi7erxNsoXzc8XlX0cK9oC8g--MI
   npm run deploy
   ```

2. **Mettre à jour le frontend**
   - Modifier `scripts/modules/reviews.js`
   - Pointer vers le worker Cloudflare

3. **Activer les alertes de facturation**
   - Console GCP > Billing > Budgets
   - Alertes à 50$, 100$, 150$, 190$

4. **Tester en production**
   - Déployer sur autopieces-equipements.fr
   - Vérifier les avis s'affichent correctement

---

## 📞 Besoin d'Aide ?

Si après 10 minutes vous avez toujours des erreurs :

1. **Vérifier le statut GCP :**
   - https://status.cloud.google.com/

2. **Consulter les logs :**
   - Console GCP > APIs & Services > Dashboard > Places API (New) > View logs

3. **Contacter le support Google Cloud :**
   - https://console.cloud.google.com/support?project=auto-pieces-equipements

---

**Créé le :** 2 octobre 2025  
**Dernière mise à jour :** 2 octobre 2025  
**Version :** 1.0
