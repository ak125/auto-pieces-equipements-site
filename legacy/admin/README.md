# Administration - Auto Pièces Équipements

## Worker Cloudflare pour l'API Google Places

### Pourquoi un proxy ?
Il est déconseillé d'utiliser directement une clé API Google Places côté client, car elle serait exposée dans le code source et pourrait être utilisée abusivement par des tiers. L'utilisation d'un Worker Cloudflare comme proxy sécurise la clé API tout en permettant au site web d'accéder aux données des avis Google.

### Déploiement du Worker

1. **Créez un compte Cloudflare Workers** si vous n'en avez pas déjà un sur [workers.cloudflare.com](https://workers.cloudflare.com/).

2. **Installez Wrangler CLI** (outil de ligne de commande pour Cloudflare Workers) :
```bash
npm install -g @cloudflare/wrangler
```

3. **Authentifiez-vous avec Cloudflare** :
```bash
wrangler login
```

4. **Configuration sécurisée** : Éditez le fichier `cloudflare/wrangler.toml` pour définir vos variables d'environnement et règles de sécurité:
```toml
[env.production]
vars = { 
  API_KEY = "VOTRE_CLE_API_GOOGLE_PLACES",
  ALLOWED_ORIGINS = "https://votre-site.fr,https://www.votre-site.fr" 
}

[[rules]]
type = "REQUEST"
expression = '''
  (http.request.uri matches "^/api/.*") && 
  (http.request.method != "GET" || 
  !any(allow_origins, origin => http.headers.origin contains origin))
'''
action = "block"
```

5. **Déployez le Worker** en mode production avec la configuration sécurisée :
```bash
cd cloudflare
wrangler deploy --env production
```

6. **Mettez à jour le script** `scripts/google-reviews.js` avec l'URL de votre Worker :
```javascript
const apiUrl = `https://google-places-proxy.workers.dev/?placeId=${placeId}`;
```

> **Note :** Si c'est votre premier déploiement, Wrangler créera automatiquement un sous-domaine pour votre Worker (généralement `google-places-proxy.workers.dev`).

### Avantages de sécurité de cette configuration

1. **Clés API sécurisées** : Stockées comme variables d'environnement et non dans le code source
2. **Accès CORS restreint** : Seuls vos domaines spécifiés peuvent accéder à l'API
3. **Méthodes limitées** : Seules les requêtes GET sont autorisées
4. **Protection contre les abus** : Les requêtes non conformes sont automatiquement bloquées

### Maintenance

- Vérifiez occasionnellement votre quota d'utilisation de l'API Google Places
- Mettez à jour votre clé API si nécessaire
- Consultez les journaux Cloudflare pour détecter des usages anormaux
- Ajustez les domaines autorisés (ALLOWED_ORIGINS) si vous modifiez vos domaines
