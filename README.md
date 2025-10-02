# 🚗 Auto Pièces Équipements - Site Web

Site web moderne pour Auto Pièces Équipements avec intégration Google Business.

## 🏗️ Architecture

Ce projet utilise un **monorepo NestJS + Remix** pour une application full-stack moderne.

```
auto-pieces-equipements-site/
├── backend/                    # 🚀 API NestJS
│   ├── src/
│   │   ├── google-business/    # Module Google Business API
│   │   ├── auth/               # Authentification
│   │   ├── supabase/           # Intégration Supabase
│   │   └── ...
│   └── package.json
│
├── frontend/                   # 🎨 Interface Remix
│   ├── app/
│   │   ├── routes/             # Pages
│   │   └── components/         # Composants React
│   └── package.json
│
├── packages/                   # 📦 Code partagé
│   ├── eslint-config/
│   └── typescript-config/
│
└── legacy/                     # � Ancien site (archivé)
    ├── index.html
    ├── produits/               # Pages produits Google Business
    ├── styles/
    └── scripts/
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- Docker (pour Redis)
- Compte Supabase

### Installation

```bash
# 1. Installer les dépendances (monorepo)
npm install

# 2. Configurer les variables d'environnement
cp .env backend/.env

# 3. Démarrer Redis
docker run -d --name redis -p 6379:6379 redis:alpine
# OU
npm run docker:redis

# 4. Démarrer le serveur (backend + frontend)
npm run dev

# OU séparément :
npm run dev:backend   # API sur http://localhost:3000
npm run dev:frontend  # Frontend sur http://localhost:5173
```

Le serveur démarre sur **http://localhost:3000**

## 🔌 API Endpoints

### Google Business API

- `GET /api/google-business/place-details` - Détails de l'établissement
- `GET /api/google-business/reviews` - Avis clients Google
- `GET /api/google-business/stats` - Statistiques

### Authentification

- `GET /authenticate` - Vérifier la session
- `POST /auth/logout` - Déconnexion

## 🛠️ Stack Technique

### Backend
- **NestJS** - Framework Node.js
- **Supabase** - Base de données PostgreSQL
- **Redis** - Cache et sessions
- **Fetch API** - Requêtes HTTP natives

### Frontend
- **Remix** - Framework React SSR
- **TailwindCSS** - Styling
- **React** - Interface utilisateur

### DevOps
- **Docker** - Containerisation
- **GitHub Actions** - CI/CD
- **Turbo** - Monorepo build system

## 📊 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine avec :

```env
# Google Maps & Places API
GOOGLE_MAPS_API_KEY=your_api_key
GOOGLE_PLACE_ID=your_place_id

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

## 📝 Documentation

- [`/legacy/docs/`](legacy/docs/) - Documentation complète (Google Business, sécurité, etc.)
- [`/backend/`](backend/) - Documentation API NestJS
- [`/frontend/`](frontend/) - Documentation frontend Remix

## 🔐 Sécurité

- ✅ Variables d'environnement sécurisées
- ✅ API keys jamais exposées côté client
- ✅ Sessions Redis sécurisées
- ✅ HTTPS en production

## 📞 Contact

**Auto Pièces Équipements**
- 📍 184 Av. Aristide Briand, 93320 Les Pavillons-sous-Bois
- 📞 01 48 47 96 27
- 📧 autope93@gmail.com

## 📜 Licence

Propriétaire - Auto Pièces Équipements © 2025

---

**Dernière mise à jour:** 2 octobre 2025
**Statut:** 🚀 En développement actif
