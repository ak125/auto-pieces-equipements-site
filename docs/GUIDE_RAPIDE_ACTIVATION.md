# 🚀 Guide Rapide: Activer Places API (New)

## ⏱️ Temps requis: 3 minutes

---

## ✅ Votre clé API est créée !

**Clé API :** `AIzaSyBuwRyhi7erxNsoXzc8XlX0cK9oC8g--MI`  
**Projet :** `auto-pieces-equipements`

🎯 **Il reste juste à activer l'API Places (New)**

---

## 📋 3 Étapes Simples

### Étape 1️⃣ : Activer Places API (New) ⏱️ 1 min

**Cliquez sur ce lien direct :**
👉 https://console.cloud.google.com/apis/library/places-backend.googleapis.com?project=auto-pieces-equipements

**Que faire :**
1. Le lien vous amène directement à la bonne API
2. Cliquez sur le bouton bleu **"ACTIVER"** (en haut)
3. Attendez 30 secondes → vous verrez "✓ API activée"

---

### Étape 2️⃣ : Vérifier la Clé API ⏱️ 1 min

**Cliquez sur ce lien :**
👉 https://console.cloud.google.com/apis/credentials?project=auto-pieces-equipements

**Que faire :**
1. Cherchez votre clé API dans la liste (celle qui se termine par `--MI`)
2. Cliquez sur le **nom de la clé**
3. Descendez à "API restrictions"

**Option A - Aucune restriction (pour tester) :**
- ✅ Sélectionnez **"Don't restrict key"**
- Cliquez **"Save"**
- ⚠️ À changer plus tard pour la sécurité

**Option B - Avec restrictions (recommandé) :**
- ✅ Sélectionnez **"Restrict key"**
- Cherchez et cochez **"Places API (New)"**
- Cliquez **"Save"**

---

### Étape 3️⃣ : Tester ⏱️ 1 min

**Dans votre terminal VS Code, lancez :**

```bash
./test-api.sh
```

**Résultat attendu :**
```
✅ SUCCESS! L'API fonctionne parfaitement!

📊 Données récupérées:
{
  "displayName": {
    "text": "Auto Pièces Équipements",
    "languageCode": "fr"
  },
  "rating": 4.9,
  "userRatingCount": 28
}

🎉 Configuration complète!
```

---

## 🔍 Dépannage Rapide

### Si vous voyez "REQUEST_DENIED"

**Cause :** API pas encore activée

**Solution :**
1. Retournez à l'Étape 1
2. Vérifiez que vous avez bien cliqué sur "ACTIVER"
3. Attendez 2-3 minutes (propagation)
4. Relancez `./test-api.sh`

---

### Si vous voyez "403 Forbidden"

**Cause :** Problème de restrictions de clé

**Solution :**
1. Allez dans l'Étape 2
2. Choisissez "Don't restrict key" temporairement
3. Sauvegardez
4. Attendez 1 minute
5. Relancez `./test-api.sh`

---

### Si vous voyez "Billing not enabled"

**Cause :** Compte de facturation pas configuré

**Solution :**
1. Allez sur : https://console.cloud.google.com/billing?project=auto-pieces-equipements
2. Cliquez "Link a billing account"
3. Ajoutez votre carte bancaire
4. ✅ Pas de panique : **200 $ gratuits/mois !**
5. Vous ne paierez rien avec le cache (estimé : 12$/mois utilisés)

---

## 🎯 Une fois que ça marche

### Tester le site localement

```bash
npm start
```

Puis ouvrez : http://localhost:3000

Les avis Google devraient s'afficher ! 🎉

---

### Configurer Cloudflare Worker (optionnel - sécurité)

```bash
cd google-places-proxy
npx wrangler secret put GOOGLE_API_KEY
# Entrez : AIzaSyBuwRyhi7erxNsoXzc8XlX0cK9oC8g--MI
npm run deploy
```

---

## 📞 Besoin d'Aide ?

Si après ces 3 étapes vous avez encore des erreurs :

1. **Vérifiez le fichier détaillé :**
   - Ouvrez `docs/VERIFICATION_API.md`

2. **Consultez les logs GCP :**
   - https://console.cloud.google.com/logs?project=auto-pieces-equipements

3. **Contactez-moi avec :**
   - Le message d'erreur exact
   - La capture d'écran de la console GCP
   - Le résultat de `./test-api.sh`

---

## 💰 Rappel des Coûts

```yaml
Crédit gratuit mensuel: 200 $ USD
Votre usage estimé: 12 $/mois (avec cache)
Résultat: GRATUIT ! 🎉

Économies sur 1 an: 2400 $ - 144 $ = 2256 $ gratuits
```

---

**✅ Checklist Finale**

- [ ] Places API (New) activée dans GCP
- [ ] Clé API configurée (restrictions OK)
- [ ] Test `./test-api.sh` réussi (code 200)
- [ ] Site local testé avec `npm start`
- [ ] Avis Google visibles sur http://localhost:3000

---

**Créé le :** 2 octobre 2025  
**Projet :** Auto Pièces Équipements
