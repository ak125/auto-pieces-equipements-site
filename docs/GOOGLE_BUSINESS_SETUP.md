# 🏢 Guide de Configuration Google Business
## Auto Pièces Équipements

> **Date de création** : Octobre 2025  
> **Dernière mise à jour** : Octobre 2025

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration Google My Business](#configuration-google-my-business)
3. [Récupération du Place ID](#récupération-du-place-id)
4. [Configuration de l'API Google Places](#configuration-de-lapi-google-places)
5. [Intégration dans le Site](#intégration-dans-le-site)
6. [Optimisation du Profil](#optimisation-du-profil)
7. [Gestion des Avis](#gestion-des-avis)
8. [Analytics et Suivi](#analytics-et-suivi)
9. [Dépannage](#dépannage)

---

## 🎯 Prérequis

### Comptes Nécessaires
- ✅ Compte Google (Gmail)
- ✅ Compte Google Cloud Platform (GCP)
- ✅ Compte Cloudflare (pour le proxy API)

### Informations à Préparer
```yaml
Nom commercial: Auto Pièces Équipements
Adresse: 184 Avenue Aristide Briand, 93320 Les Pavillons-sous-Bois
Téléphone: +33 1 48 47 96 27
Site web: https://autopieces-equipements.fr
Email: contact@autopieces-equipements.fr
Catégorie: Magasin de pièces détachées automobiles
```

---

## 🏪 Configuration Google My Business

### Étape 1 : Créer/Revendiquer votre Fiche

1. **Accéder à Google Business Profile**
   - Aller sur : https://business.google.com
   - Se connecter avec votre compte Google professionnel

2. **Créer ou Revendiquer la Fiche**
   ```
   Option A : Nouvelle entreprise
   - Cliquer sur "Ajouter votre établissement"
   - Suivre les étapes de création
   
   Option B : Entreprise existante
   - Rechercher "Auto Pièces Équipements Les Pavillons-sous-Bois"
   - Cliquer sur "Revendiquer cette fiche"
   ```

3. **Vérification de l'Établissement**
   - **Par courrier** : Code postal (5-7 jours)
   - **Par téléphone** : Code SMS/vocal (immédiat)
   - **Par email** : Si domaine vérifié (immédiat)
   - **Par vidéo** : Pour certaines catégories

### Étape 2 : Compléter les Informations de Base

#### Informations Essentielles
```yaml
Nom: Auto Pièces Équipements
Catégorie principale: Magasin de pièces détachées automobiles
Catégories secondaires:
  - Fournisseur de pièces automobiles
  - Boutique de pièces de rechange
  - Service de réparation automobile
  
Adresse: 184 Avenue Aristide Briand
Ville: Les Pavillons-sous-Bois
Code postal: 93320
Département: Seine-Saint-Denis
Région: Île-de-France

Téléphone: +33 1 48 47 96 27
Site web: https://autopieces-equipements.fr
```

#### Horaires d'Ouverture
```yaml
Lundi:    09:00 - 18:30
Mardi:    09:00 - 18:30
Mercredi: 09:00 - 18:30
Jeudi:    09:00 - 18:30
Vendredi: 09:00 - 18:30
Samedi:   09:00 - 18:30
Dimanche: Fermé

Horaires spéciaux:
  - Jours fériés: Consulter la fiche
  - Périodes de vacances: À mettre à jour
```

### Étape 3 : Description Optimisée

```markdown
🔧 **Auto Pièces Équipements** - Votre Spécialiste Pièces Auto aux Pavillons-sous-Bois

Depuis plus de [X] ans, nous fournissons des pièces détachées neuves et d'origine 
pour toutes marques de véhicules : Renault, Peugeot, Citroën, Volkswagen, Audi, 
Mercedes, BMW et plus encore.

✅ **Nos Services :**
• Large stock de pièces automobiles
• Commande et livraison rapide (24-48h)
• Conseil technique par des experts
• Diagnostic électronique OBD
• Pièces de carrosserie et mécanique
• Accessoires et équipements auto

📍 **Localisation idéale :** À proximité de Bondy, Noisy-le-Sec, Villemomble, 
Livry-Gargan et Aulnay-sous-Bois.

💳 **Paiement accepté :** CB, Espèces, Chèque
🚚 **Livraison disponible** en Île-de-France

Contactez-nous au 01 48 47 96 27 ou visitez notre site pour commander en ligne !
```

---

## 🔑 Récupération du Place ID

### Méthode 1 : Via l'Outil Place ID Finder (Déjà Disponible)

Vous disposez déjà d'un outil dans votre projet :
```bash
# Ouvrir dans le navigateur
open admin/place-id-finder.html
```

**Place ID Actuel :** `ChIJVVXZlqAT5kcRICTpgHlqx9A`

### Méthode 2 : Via Google Maps

1. Rechercher votre entreprise sur Google Maps
2. Cliquer sur "Partager" > "Intégrer une carte"
3. Le Place ID se trouve dans l'URL générée

### Méthode 3 : Via l'API Place Search

```bash
# Avec curl
curl "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Auto%20Pièces%20Équipements%20Les%20Pavillons-sous-Bois&inputtype=textquery&fields=place_id,name&key=VOTRE_API_KEY"
```

---

## 🔧 Configuration de l'API Google Places

### Étape 1 : Créer un Projet Google Cloud

1. Aller sur : https://console.cloud.google.com
2. Créer un nouveau projet : **"auto-pieces-equipements-api"**
3. Activer la facturation (obligatoire pour l'API)

### Étape 2 : Activer les APIs Nécessaires

```bash
# APIs à activer dans GCP Console
✅ Places API (New)
✅ Maps JavaScript API
✅ Geocoding API
✅ Places API (Legacy) - pour compatibilité
```

**Navigation :**
```
Console GCP > APIs & Services > Library > Rechercher "Places API"
```

### Étape 3 : Créer une Clé API

1. **Créer la clé**
   ```
   Console GCP > APIs & Services > Credentials
   > Create Credentials > API Key
   ```

2. **Restreindre la clé (IMPORTANT pour la sécurité)**

   **Restriction d'application :**
   - ✅ Sites web (HTTP referrers)
   - Ajouter vos domaines :
     ```
     https://autopieces-equipements.fr/*
     https://*.autopieces-equipements.fr/*
     http://localhost:*/*  (pour développement)
     ```

   **Restriction d'API :**
   - ✅ Places API (New)
   - ✅ Maps JavaScript API
   - ✅ Geocoding API

3. **Créer une deuxième clé pour le Backend**
   - ✅ Restriction par IP (IP de votre serveur)
   - ✅ Places API uniquement

### Étape 4 : Configurer les Variables d'Environnement

```bash
# Éditer le fichier .env
nano .env
```

```env
# Clés API Google
GOOGLE_MAPS_API_KEY=AIzaSy[VOTRE_CLE_BACKEND]
GOOGLE_MAPS_API_KEY_FRONTEND=AIzaSy[VOTRE_CLE_FRONTEND]

# Place ID vérifié
GOOGLE_PLACE_ID=ChIJVVXZlqAT5kcRICTpgHlqx9A

# Configuration API
GOOGLE_API_BASE_URL=https://maps.googleapis.com/maps/api
GOOGLE_API_FIELDS=reviews,rating,user_ratings_total,name,formatted_address,photos,opening_hours
```

⚠️ **Sécurité** : Ajouter `.env` dans `.gitignore`

---

## 🚀 Intégration dans le Site

### Configuration Cloudflare Worker (Recommandé)

Le proxy Cloudflare protège votre clé API :

```bash
# Naviguer vers le dossier worker
cd google-places-proxy

# Installer les dépendances
npm install

# Configurer wrangler
nano wrangler.jsonc
```

**Configuration `wrangler.jsonc` :**
```json
{
  "name": "auto-pieces-google-places-proxy",
  "main": "src/index.ts",
  "compatibility_date": "2025-10-02",
  "vars": {
    "ALLOWED_ORIGINS": "https://autopieces-equipements.fr,https://www.autopieces-equipements.fr"
  },
  "secrets": {
    "GOOGLE_API_KEY": "votre_clé_api"
  }
}
```

**Ajouter le secret :**
```bash
npx wrangler secret put GOOGLE_API_KEY
# Entrer votre clé API quand demandé
```

**Déployer le worker :**
```bash
npm run deploy
# Note l'URL du worker : https://auto-pieces-google-places-proxy.VOTRE-COMPTE.workers.dev
```

### Mise à Jour du Code Frontend

Éditer `scripts/modules/reviews.js` :
```javascript
const CONFIG = {
  placeId: 'ChIJVVXZlqAT5kcRICTpgHlqx9A',
  apiURL: 'https://auto-pieces-google-places-proxy.VOTRE-COMPTE.workers.dev/',
  loadDelay: 1500,
  maxReviews: 6
};
```

---

## ✨ Optimisation du Profil Google Business

### Photos et Médias

**Photos Essentielles (Minimum requis) :**
1. ✅ **Logo** (carré 720x720px)
2. ✅ **Photo de couverture** (paysage 1024x576px)
3. ✅ **Devanture du magasin** (extérieur)
4. ✅ **Intérieur du magasin** (rayons, comptoir)
5. ✅ **Équipe** (personnel accueillant)
6. ✅ **Produits** (pièces phares)

**Photos Recommandées :**
- Photos 360° de l'intérieur
- Vidéo de présentation (30-60s)
- Photos des services (diagnostic, conseil)
- Photos de pièces populaires

**Spécifications techniques :**
```yaml
Format: JPG ou PNG
Taille minimale: 720 x 720 px
Taille recommandée: 2048 x 2048 px
Poids maximum: 5 MB
```

### Attributs de l'Établissement

Activer les attributs pertinents :
```yaml
✅ Accessibilité:
  - Entrée accessible en fauteuil roulant
  - Places de parking accessibles

✅ Services:
  - Retrait en magasin
  - Livraison
  - Livraison le jour même

✅ Paiements acceptés:
  - Cartes de crédit
  - Cartes de débit
  - Paiements mobiles sans contact
  - Espèces
  - Chèques

✅ Planification:
  - Rendez-vous recommandés
  - Rendez-vous obligatoires: Non

✅ Public:
  - Toilettes non genrées
  - LGBTQ+ friendly
```

### Posts Google Business

Publier régulièrement (1-2 fois/semaine) :

**Types de posts :**
1. **Nouveautés** : Nouvelles pièces en stock
2. **Offres** : Promotions et réductions
3. **Événements** : Journées portes ouvertes
4. **Actualités** : Informations secteur auto

**Exemple de post :**
```markdown
🚗 **Nouvelle gamme de freinage disponible !**

Découvrez notre sélection de disques et plaquettes de frein 
pour toutes marques. Qualité OEM garantie.

✅ Conseil technique gratuit
✅ Montage possible sur RDV
🎁 -15% sur la pose jusqu'au 31/10

📞 01 48 47 96 27
🌐 autopieces-equipements.fr

#PiecesAuto #Freinage #Entretien #PavillonsSousBois
```

### Questions-Réponses (Q&A)

Ajouter proactivement des Q&A fréquentes :

```markdown
Q: Proposez-vous la livraison ?
R: Oui ! Livraison en 24-48h en Île-de-France. Gratuite dès 50€ d'achat.

Q: Dois-je prendre rendez-vous ?
R: Non, vous pouvez venir sans rendez-vous. RDV conseillé pour le diagnostic.

Q: Quelles marques de pièces proposez-vous ?
R: Nous proposons des pièces d'origine constructeur et équivalentes de qualité 
   pour toutes marques : Renault, Peugeot, Citroën, VW, Audi, BMW, Mercedes, etc.

Q: Faites-vous le diagnostic électronique ?
R: Oui, diagnostic OBD disponible en magasin sur rendez-vous.

Q: Acceptez-vous les retours ?
R: Oui, retour possible sous 14 jours avec facture et emballage d'origine.
```

---

## ⭐ Gestion des Avis

### Encourager les Avis Clients

**Méthodes recommandées :**

1. **QR Code en Magasin**
   ```
   Générer un QR code vers :
   https://search.google.com/local/writereview?placeid=ChIJVVXZlqAT5kcRICTpgHlqx9A
   ```

2. **Email de Suivi**
   ```html
   Bonjour [Nom],
   
   Nous espérons que votre achat chez Auto Pièces Équipements 
   vous satisfait pleinement !
   
   Votre avis compte beaucoup pour nous et aide d'autres clients.
   
   [Bouton : Laisser un avis]
   
   Merci de votre confiance !
   ```

3. **SMS Post-Achat** (24-48h après)
   ```
   Auto Pièces Équipements : Merci pour votre achat !
   Partagez votre expérience : [lien court]
   ```

### Répondre aux Avis

**Réponse aux avis positifs (⭐⭐⭐⭐⭐) :**
```markdown
Bonjour [Prénom],

Merci infiniment pour votre excellent retour ! 🚗
Nous sommes ravis d'avoir pu vous aider à trouver les bonnes pièces.

Notre équipe reste à votre disposition pour tous vos futurs besoins.

À bientôt chez Auto Pièces Équipements !
L'équipe APE
```

**Réponse aux avis négatifs (⭐⭐ ou moins) :**
```markdown
Bonjour [Prénom],

Nous sommes désolés de votre expérience décevante.
Votre satisfaction est notre priorité.

Pourriez-vous nous contacter directement au 01 48 47 96 27 
ou par email à contact@autopieces-equipements.fr pour que 
nous puissions résoudre ce problème ensemble ?

Cordialement,
[Nom du Responsable]
Auto Pièces Équipements
```

**Bonnes pratiques :**
- ✅ Répondre sous 24-48h
- ✅ Personnaliser chaque réponse
- ✅ Rester professionnel et courtois
- ✅ Proposer une solution concrète
- ✅ Inviter à un contact privé si besoin

---

## 📊 Analytics et Suivi

### Métriques à Surveiller

**Google Business Profile Insights :**
```yaml
Visibilité:
  - Recherches directes (nom de l'entreprise)
  - Recherches de découverte (catégorie/localisation)
  - Vues totales du profil

Engagement:
  - Clics vers le site web
  - Demandes d'itinéraire
  - Appels téléphoniques
  - Clics sur les photos

Avis:
  - Note moyenne
  - Nombre total d'avis
  - Taux de réponse
  - Évolution mensuelle
```

### Tableau de Bord Recommandé

Créer un suivi mensuel :

| Métrique | Oct 2025 | Nov 2025 | Objectif |
|----------|----------|----------|----------|
| Vues profil | - | - | +20% |
| Clics site web | - | - | +30% |
| Appels | - | - | +15% |
| Itinéraires | - | - | +25% |
| Nouveaux avis | - | - | 5+/mois |
| Note moyenne | 4.5 | - | 4.7+ |

### Outils de Suivi

1. **Google Business Profile**
   - Dashboard natif
   - Rapports hebdomadaires par email

2. **Google Analytics**
   - UTM tracking pour liens GBP
   - Segment "Google My Business" dans GA4

3. **Dashboard Personnalisé**
   - Vous pouvez créer un dashboard dans votre projet
   - Intégration API Google My Business

---

## 🔍 SEO Local - Optimisation

### Facteurs de Classement Google Maps

**Importance par ordre :**
1. **Pertinence** (30%)
   - Catégories correctes
   - Description détaillée
   - Attributs complets

2. **Distance** (25%)
   - Optimisation géographique
   - Mots-clés locaux

3. **Notoriété** (25%)
   - Nombre et qualité des avis
   - Activité du profil
   - Citations locales

4. **Engagement** (20%)
   - Clics, appels, itinéraires
   - Photos, posts réguliers

### Citations Locales

Inscrire votre entreprise sur :

**Annuaires Essentiels :**
```yaml
✅ Pages Jaunes (pagesjaunes.fr)
✅ 118 000 (118000.fr)
✅ Yelp France (yelp.fr)
✅ Foursquare
✅ Tripadvisor (si applicable)
✅ Facebook Business
✅ Waze

Annuaires Spécialisés Auto:
✅ Oscaro
✅ Mister Auto
✅ Autosphère
✅ L'Argus
```

**Cohérence NAP (Name, Address, Phone) :**
```
Utiliser EXACTEMENT les mêmes informations partout :
Nom : Auto Pièces Équipements
Adresse : 184 Avenue Aristide Briand, 93320 Les Pavillons-sous-Bois
Téléphone : +33 1 48 47 96 27
```

### Mots-Clés Locaux

Intégrer dans votre contenu :
```
- "pièces auto Les Pavillons-sous-Bois"
- "garage 93320"
- "pièces détachées Seine-Saint-Denis"
- "auto équipements Bondy"
- "pièces auto Noisy-le-Sec"
- "fournisseur automobile Villemomble"
```

---

## 🛠️ Dépannage

### Problèmes Courants

#### 1. **Fiche Google Suspendue**

**Causes :**
- Informations incohérentes
- Non-respect des guidelines
- Vérification non complétée

**Solutions :**
```
1. Vérifier les guidelines Google
2. Corriger les informations
3. Demander un réexamen via le formulaire Google
4. Contacter le support Google Business
```

#### 2. **Avis Disparaissent**

**Causes :**
- Avis signalés comme spam
- Violation des règles Google
- Compte Google de l'auteur supprimé

**Action :**
```
- Impossible de restaurer manuellement
- Contacter Google si erreur évidente
- Se concentrer sur nouveaux avis
```

#### 3. **API Errors**

**Error 429 - Quota Exceeded :**
```javascript
// Vérifier les quotas :
Console GCP > APIs & Services > Dashboard > Places API

// Solutions :
- Implémenter un cache Redis (TTL: 3600s)
- Limiter les appels frontend
- Augmenter les quotas (facturation)
```

**Error 403 - Request Denied :**
```javascript
// Vérifications :
✅ API activée dans GCP ?
✅ Clé API valide ?
✅ Restrictions d'origine correctes ?
✅ Facturation activée ?
```

### Contacts Support

```yaml
Google Business Support:
  Web: https://support.google.com/business
  Twitter: @GoogleMyBiz
  Forum: Google Business Profile Community

Google Cloud Support:
  Web: https://console.cloud.google.com/support
  Email: Depuis la console GCP
```

---

## ✅ Checklist de Configuration

### Phase 1 : Création (Jour 1)
- [ ] Compte Google Business créé
- [ ] Fiche établissement complétée
- [ ] Horaires d'ouverture ajoutés
- [ ] Catégories sélectionnées
- [ ] Description optimisée
- [ ] Demande de vérification envoyée

### Phase 2 : Vérification (Jours 2-7)
- [ ] Code de vérification reçu et validé
- [ ] Fiche publiée et visible
- [ ] Photos ajoutées (min 5)
- [ ] Logo et couverture uploadés

### Phase 3 : Configuration API (Jour 7)
- [ ] Projet GCP créé
- [ ] APIs activées
- [ ] Clés API créées et restreintes
- [ ] Worker Cloudflare déployé
- [ ] Variables d'environnement configurées
- [ ] Tests d'intégration réussis

### Phase 4 : Optimisation (Semaine 2)
- [ ] 10+ photos de qualité
- [ ] Q&A complétées (5+)
- [ ] Attributs cochés
- [ ] Premier post publié
- [ ] Processus de collecte d'avis mis en place

### Phase 5 : Maintenance Continue
- [ ] Posts hebdomadaires
- [ ] Réponses aux avis < 48h
- [ ] Photos mensuelles
- [ ] Horaires à jour
- [ ] Suivi des metrics mensuel

---

## 📚 Ressources Utiles

### Documentation Officielle
- [Google Business Profile](https://support.google.com/business)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Cloudflare Workers](https://developers.cloudflare.com/workers)

### Outils
- [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
- [Schema.org Generator](https://technicalseo.com/tools/schema-markup-generator/)
- [Google Business Redressal Form](https://support.google.com/business/contact/gmb_suspended)

### Monitoring
- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics 4](https://analytics.google.com)
- [Google Business Profile Insights](https://business.google.com)

---

## 📞 Support Projet

**Questions techniques :**
- Créer une issue GitHub
- Documentation : `/docs/`

**Configuration spécifique :**
- Voir `.env.example`
- Consulter `admin/place-id-finder.html`

---

**Dernière révision :** Octobre 2025  
**Version :** 1.0.0  
**Auteur :** Équipe Auto Pièces Équipements
