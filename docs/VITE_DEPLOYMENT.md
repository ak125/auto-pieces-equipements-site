# 🚀 Guide de Déploiement Vite + GitHub Pages

**Projet :** Auto Pièces Équipements  
**Date :** 2 octobre 2025

---

## ✅ Configuration Terminée

Votre projet est maintenant configuré avec **Vite** pour un déploiement automatique sur **GitHub Pages** ! 🎉

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  GitHub Pages (Statique)            │
│  https://ak125.github.io/...        │
│                                      │
│  ✅ HTML/CSS/JS compilé par Vite    │
│  ✅ Appels API directs depuis       │
│     le navigateur                   │
│  ✅ Pas de serveur backend          │
└─────────────────────────────────────┘
           │
           │ Fetch API
           ▼
┌─────────────────────────────────────┐
│  Google Places API                  │
│  https://maps.googleapis.com/...    │
│                                      │
│  ✅ Récupération des avis           │
│  ✅ 200$ gratuits/mois               │
└─────────────────────────────────────┘
```

---

## 📦 Structure du Projet

```
auto-pieces-equipements-site/
├── index-vite.html          # Point d'entrée Vite
├── vite.config.js           # Configuration Vite
├── package.json             # Dépendances et scripts
│
├── src/
│   ├── main.js              # Application principale
│   ├── api.js               # Service API Google
│   └── style.css            # Styles CSS
│
├── dist/                    # Build de production (généré)
│   ├── index.html
│   ├── assets/
│   │   ├── main-[hash].js
│   │   └── style-[hash].css
│   └── ...
│
└── .github/workflows/
    └── deploy.yml           # CI/CD GitHub Actions
```

---

## 🛠️ Commandes Disponibles

### Développement Local

```bash
# Démarrer le serveur de dev (avec hot reload)
npm run dev

# Ouvre automatiquement http://localhost:3000/auto-pieces-equipements-site/
```

### Build de Production

```bash
# Compiler pour la production
npm run build

# Le résultat est dans ./dist/
```

### Preview du Build

```bash
# Tester le build de production localement
npm run preview
```

---

## 🚀 Déploiement sur GitHub Pages

### Configuration Requise (À FAIRE UNE FOIS)

#### 1. Activer GitHub Pages

1. **Aller dans les paramètres du repo :**
   - https://github.com/ak125/auto-pieces-equipements-site/settings/pages

2. **Configurer la source :**
   ```
   Source: GitHub Actions
   ```

3. **Enregistrer**

#### 2. Ajouter les Secrets GitHub

1. **Aller dans les secrets :**
   - https://github.com/ak125/auto-pieces-equipements-site/settings/secrets/actions

2. **Ajouter 2 secrets :**

   **Secret 1 : GOOGLE_PLACE_ID**
   ```
   Name: GOOGLE_PLACE_ID
   Value: ChIJVVXZlqAT5kcRICTpgHlqx9A
   ```

   **Secret 2 : GOOGLE_MAPS_API_KEY**
   ```
   Name: GOOGLE_MAPS_API_KEY
   Value: AIzaSyBuwRyhi7erxNsoXzc8XlX0cK9oC8g--MI
   ```

3. **Cliquer sur "Add secret"** pour chaque

---

### Déploiement Automatique

Une fois les secrets configurés, **chaque push sur `main` déclenche automatiquement** :

```bash
# 1. Commit vos changements
git add .
git commit -m "feat: Configuration Vite pour GitHub Pages"
git push origin main

# 2. GitHub Actions s'exécute automatiquement :
#    - Install dependencies
#    - Build avec Vite
#    - Deploy sur GitHub Pages

# 3. Votre site est en ligne ! 🎉
#    https://ak125.github.io/auto-pieces-equipements-site/
```

---

### Vérifier le Déploiement

1. **Aller dans Actions :**
   - https://github.com/ak125/auto-pieces-equipements-site/actions

2. **Cliquer sur le dernier workflow "Deploy to GitHub Pages"**

3. **Vérifier que les jobs sont ✅ verts**

4. **Visiter votre site :**
   - https://ak125.github.io/auto-pieces-equipements-site/

---

## 🔧 Configuration Vite Expliquée

### vite.config.js

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  // Base URL pour GitHub Pages
  base: '/auto-pieces-equipements-site/',
  
  build: {
    outDir: 'dist',              // Dossier de sortie
    assetsDir: 'assets',          // Assets (JS/CSS)
    rollupOptions: {
      input: {
        main: './index-vite.html', // Point d'entrée
      }
    }
  },
  
  server: {
    port: 3000,                   // Port dev
    open: true                    // Ouvrir navigateur auto
  }
});
```

---

## 📊 Performance

### Optimisations Vite

Vite optimise automatiquement :

- ✅ **Code Splitting** : JS séparé en chunks
- ✅ **Minification** : Code compressé
- ✅ **Tree Shaking** : Code mort supprimé
- ✅ **CSS Extraction** : CSS séparé
- ✅ **Asset Hashing** : Cache busting (main-[hash].js)
- ✅ **ES Modules** : Import natif navigateur

### Résultats Attendus

```yaml
Build Time: ~2-5 secondes
Bundle Size: ~50-100 KB (gzippé)
First Load: < 1 seconde
Lighthouse Score: 90-100/100
```

---

## 🔐 Sécurité

### ⚠️ Clé API Exposée

**IMPORTANT :** Votre clé API est visible dans le code JavaScript côté client !

#### Solutions de Sécurité :

##### Option 1 : Restrictions HTTP Referrers (Recommandé)

Dans Google Cloud Console :

1. **Aller dans Credentials :**
   - https://console.cloud.google.com/apis/credentials?project=auto-pieces-equipements

2. **Modifier votre clé API**

3. **Application restrictions :**
   ```
   HTTP referrers (web sites)
   
   Website restrictions:
   - https://ak125.github.io/*
   - http://localhost:3000/*  (pour dev)
   ```

4. **Sauvegarder**

Maintenant la clé ne fonctionne que depuis vos domaines ! ✅

##### Option 2 : Cloudflare Worker (Plus avancé)

Utiliser un proxy Cloudflare Worker :

```javascript
// google-places-proxy/src/index.ts
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Proxy vers Google Places API
    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json${url.search}&key=${env.GOOGLE_API_KEY}`;
    
    const response = await fetch(apiUrl);
    return response;
  }
};
```

Puis dans votre code :
```javascript
// Au lieu de :
fetch(`https://maps.googleapis.com/maps/api/...&key=XXX`)

// Utiliser :
fetch(`https://api.votre-worker.workers.dev/places`)
```

---

## 🐛 Dépannage

### Problème : Site ne se charge pas sur GitHub Pages

**Causes possibles :**

1. **Base URL incorrecte**
   ```javascript
   // vite.config.js
   base: '/auto-pieces-equipements-site/', // Doit correspondre au nom du repo
   ```

2. **GitHub Pages pas activé**
   - Vérifier : Settings > Pages > Source = "GitHub Actions"

3. **Workflow échoué**
   - Vérifier : Actions > Dernier workflow
   - Lire les logs d'erreur

---

### Problème : API ne fonctionne pas en production

**Causes possibles :**

1. **Secrets GitHub manquants**
   - Vérifier : Settings > Secrets > Actions
   - Ajouter GOOGLE_PLACE_ID et GOOGLE_MAPS_API_KEY

2. **CORS bloqué**
   - L'API Legacy Google accepte les requêtes depuis le navigateur
   - Si erreur CORS, vérifier les restrictions de la clé API

3. **Clé API invalide**
   - Tester avec : `./test-api.sh`
   - Vérifier dans GCP Console

---

### Problème : Build échoue

**Causes possibles :**

1. **Dépendances manquantes**
   ```bash
   npm install
   npm run build
   ```

2. **Erreur dans le code**
   - Vérifier les logs : `npm run build`
   - Corriger les erreurs TypeScript/JS

---

## 📈 Monitoring

### Google Analytics (Optionnel)

Ajouter dans `index-vite.html` :

```html
<head>
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>
</head>
```

---

## 🎯 Checklist de Déploiement

### Avant le Premier Déploiement

- [ ] GitHub Pages activé (Settings > Pages > GitHub Actions)
- [ ] Secrets ajoutés (GOOGLE_PLACE_ID, GOOGLE_MAPS_API_KEY)
- [ ] Clé API restreinte aux domaines (GCP Console)
- [ ] Code testé localement (`npm run dev`)
- [ ] Build testé (`npm run build && npm run preview`)

### Déploiement

- [ ] Code commité : `git add . && git commit -m "..."`
- [ ] Push vers GitHub : `git push origin main`
- [ ] Workflow réussi (Actions > ✅ vert)
- [ ] Site accessible : https://ak125.github.io/auto-pieces-equipements-site/
- [ ] Avis Google s'affichent correctement

---

## 💰 Coûts

```yaml
Hébergement GitHub Pages: GRATUIT ✅
Domaine .github.io: GRATUIT ✅
Vite build tool: GRATUIT ✅
Google Places API: GRATUIT (200$/mois crédit) ✅

Total: 0 € / mois 🎉
```

---

## 🚀 Prochaines Étapes

### Améliorations Possibles

1. **Domaine personnalisé**
   - Acheter autopieces-equipements.fr
   - Configurer DNS vers GitHub Pages

2. **PWA (Progressive Web App)**
   - Ajouter manifest.json
   - Service Worker pour cache offline

3. **Optimisation SEO**
   - Meta tags Open Graph
   - Schema.org markup
   - Sitemap.xml

4. **Analytics avancé**
   - Google Analytics
   - Hotjar heatmaps
   - Conversion tracking

5. **A/B Testing**
   - Tester différentes présentations d'avis
   - Optimiser le taux de conversion

---

## 📚 Ressources

### Documentation

- [Vite](https://vitejs.dev/)
- [GitHub Pages](https://pages.github.com/)
- [GitHub Actions](https://docs.github.com/actions)
- [Google Places API](https://developers.google.com/maps/documentation/places)

### Support

- Issues GitHub : https://github.com/ak125/auto-pieces-equipements-site/issues
- Documentation projet : `docs/`

---

**🎊 Projet prêt pour le déploiement !**

Suivez simplement les étapes de configuration des secrets GitHub, puis `git push` ! 🚀

---

**Créé le :** 2 octobre 2025  
**Version :** 1.0.0  
**Status :** ✅ READY TO DEPLOY
