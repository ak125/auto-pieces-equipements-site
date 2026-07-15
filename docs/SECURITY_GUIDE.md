# 🔒 GUIDE DE SÉCURITÉ - INFORMATIONS SENSIBLES
## Auto Pièces Équipements

> **⚠️ LECTURE OBLIGATOIRE AVANT TOUTE CONFIGURATION**

---

## 🚨 Règles de Sécurité Essentielles

### 1. Ne JAMAIS Partager Publiquement

❌ **À NE JAMAIS PARTAGER** :
- Mots de passe de comptes (Google, email, etc.)
- Clés API non restreintes
- Tokens d'authentification
- Identifiants de base de données
- Secrets de session

### 2. Différence : Identifiants vs Clés API

#### Identifiants de Connexion (Login/Password)
```yaml
Utilisation: Connexion manuelle à Google Business
Stockage: JAMAIS dans le code ou .env
Sécurité: 
  - Gestionnaire de mots de passe (LastPass, 1Password, Bitwarden)
  - Vérification en 2 étapes OBLIGATOIRE
  - Changer régulièrement
```

#### Clés API
```yaml
Utilisation: Accès programmatique aux services Google
Stockage: Dans .env (JAMAIS commité sur Git)
Création: Via Google Cloud Console
Sécurité:
  - Restrictions par domaine/IP
  - Restrictions par API
  - Rotation régulière
```

---

## 📧 Sécurisation du Compte Google Business

### Compte : autope93@gmail.com

#### ✅ Actions de Sécurité Immédiates

1. **Changer le Mot de Passe MAINTENANT**
   ```
   URL: https://myaccount.google.com/security
   
   Nouveau mot de passe doit:
   - ✅ Minimum 16 caractères
   - ✅ Mélanger majuscules, minuscules, chiffres, symboles
   - ✅ Être unique (jamais utilisé ailleurs)
   - ✅ Utiliser un gestionnaire de mots de passe
   ```

2. **Activer la Vérification en 2 Étapes**
   ```
   URL: https://myaccount.google.com/signinoptions/two-step-verification
   
   Méthodes recommandées (par ordre de préférence):
   1. Application d'authentification (Google Authenticator, Authy)
   2. Clé de sécurité physique (YubiKey)
   3. SMS (moins sécurisé mais mieux que rien)
   ```

3. **Vérifier les Connexions Récentes**
   ```
   URL: https://myaccount.google.com/device-activity
   
   Actions:
   - Vérifier toutes les connexions
   - Déconnecter les appareils inconnus
   - Activer les alertes de connexion
   ```

4. **Configurer les Codes de Secours**
   ```
   URL: https://myaccount.google.com/signinoptions/two-step-verification/backup-codes
   
   - Générer 10 codes de secours
   - Les imprimer et les stocker en lieu sûr
   - Les garder au coffre ou dans un endroit sécurisé
   ```

---

## 🔑 Configuration Correcte des APIs

### Étape 1 : Créer un Projet Google Cloud

```bash
# 1. Aller sur Google Cloud Console
https://console.cloud.google.com

# 2. Se connecter avec autope93@gmail.com

# 3. Créer un nouveau projet
Nom: auto-pieces-equipements-production
ID: auto-pieces-equipements-prod
```

### Étape 2 : Activer les APIs

```yaml
APIs à activer:
  - Places API (New)
  - Maps JavaScript API
  - Geocoding API
```

### Étape 3 : Créer des Clés API Sécurisées

#### Clé API Backend (Serveur)
```yaml
Nom: auto-pieces-backend-api-key
Restrictions:
  Type: Adresse IP
  IPs autorisées: [IP de votre serveur de production]
  APIs: Places API uniquement
```

#### Clé API Frontend (Site Web)
```yaml
Nom: auto-pieces-frontend-api-key
Restrictions:
  Type: Référents HTTP
  Domaines autorisés:
    - https://autopieces-equipements.fr/*
    - https://www.autopieces-equipements.fr/*
    - http://localhost:3000/* (développement)
  APIs: Maps JavaScript API, Places API
```

---

## 📁 Structure du Fichier .env

### Contenu Correct

```bash
# ====================================
# CONFIGURATION AUTO PIÈCES ÉQUIPEMENTS
# ====================================
# ⚠️ NE JAMAIS COMMITER CE FICHIER SUR GIT
# ⚠️ NE JAMAIS PARTAGER CES CLÉS PUBLIQUEMENT
# ====================================

# === GOOGLE CLOUD PLATFORM ===
# Clé API Backend (avec restriction IP)
GOOGLE_MAPS_API_KEY=AIzaSy...VOTRE_CLE_BACKEND_ICI

# Clé API Frontend (avec restriction domaine)
GOOGLE_MAPS_API_KEY_FRONTEND=AIzaSy...VOTRE_CLE_FRONTEND_ICI

# === GOOGLE BUSINESS ===
# Place ID de votre établissement
GOOGLE_PLACE_ID=ChIJVVXZlqAT5kcRICTpgHlqx9A

# URL de base de l'API
GOOGLE_API_BASE_URL=https://maps.googleapis.com/maps/api

# Champs à récupérer
GOOGLE_API_FIELDS=reviews,rating,user_ratings_total,name,formatted_address,photos,opening_hours

# === CLOUDFLARE WORKER ===
# URL du worker Cloudflare (proxy API)
CLOUDFLARE_WORKER_URL=https://votre-worker.votre-compte.workers.dev

# === BASE DE DONNÉES ===
# NOTE: Utiliser un utilisateur dédié avec privilèges limités
DB_HOST=localhost
DB_PORT=3306
DB_NAME=auto_pieces_db
DB_USER=auto_pieces_user
DB_PASS=GENERER_UN_MOT_DE_PASSE_SECURISE

# === SERVEUR ===
PORT=3000
NODE_ENV=production

# Session secret (générer avec: openssl rand -base64 32)
SESSION_SECRET=GENERER_UN_SECRET_UNIQUE

# === EMAILS (si applicable) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=autope93@gmail.com
SMTP_PASS=MOT_DE_PASSE_APPLICATION_GOOGLE
# NOTE: Utiliser un "mot de passe d'application" Google, PAS le mot de passe principal

# === ENVIRONNEMENT ===
SITE_URL=https://autopieces-equipements.fr
ADMIN_EMAIL=autope93@gmail.com
```

### ❌ Ce qu'on NE met JAMAIS dans .env

```bash
# ❌ MAUVAIS - Ne jamais faire ça !
GOOGLE_EMAIL=autope93@gmail.com
GOOGLE_PASSWORD=VOTRE_MOT_DE_PASSE

# Ces informations ne doivent JAMAIS être dans le code
# Elles servent uniquement pour la connexion manuelle
```

---

## 🛡️ Mot de Passe d'Application Google (Pour SMTP)

Si vous voulez envoyer des emails via Gmail :

### Créer un Mot de Passe d'Application

```bash
1. Aller sur: https://myaccount.google.com/apppasswords
   (Nécessite la vérification en 2 étapes activée)

2. Sélectionner:
   - Application: Autre (nom personnalisé)
   - Nom: "Auto Pieces Equipements Website"

3. Cliquer sur "Générer"

4. Copier le mot de passe généré (16 caractères)

5. L'utiliser dans .env:
   SMTP_PASS=xxxx xxxx xxxx xxxx
```

⚠️ Ce mot de passe est DIFFÉRENT de votre mot de passe principal

---

## 🔐 Gestionnaires de Mots de Passe Recommandés

### Pour Stocker vos Identifiants Personnels

```yaml
Gratuits:
  - Bitwarden: https://bitwarden.com (Open source)
  - LastPass: https://lastpass.com (Version gratuite limitée)
  
Payants mais Excellent:
  - 1Password: https://1password.com
  - Dashlane: https://dashlane.com
  
Intégré:
  - Google Password Manager (dans Chrome)
  - iCloud Keychain (Apple)
```

### Avantages

✅ Génération de mots de passe forts
✅ Stockage sécurisé chiffré
✅ Synchronisation multi-appareils
✅ Alerte si mot de passe compromis
✅ Remplissage automatique

---

## 📋 Checklist de Sécurité

### Immédiat (Maintenant)

- [ ] Changer le mot de passe de autope93@gmail.com
- [ ] Activer la vérification en 2 étapes
- [ ] Vérifier les connexions récentes
- [ ] Générer des codes de secours
- [ ] Installer un gestionnaire de mots de passe

### Court Terme (Cette Semaine)

- [ ] Créer un projet Google Cloud Platform
- [ ] Générer des clés API avec restrictions
- [ ] Configurer le fichier .env correctement
- [ ] Ajouter .env au .gitignore
- [ ] Tester l'intégration API

### Maintenance Continue

- [ ] Changer les mots de passe tous les 3-6 mois
- [ ] Vérifier les accès API mensuellement
- [ ] Monitorer les logs d'accès
- [ ] Mettre à jour les restrictions si nécessaire

---

## 🚨 En Cas de Compromission

### Si vous pensez que votre compte a été compromis :

```bash
1. Changer IMMÉDIATEMENT le mot de passe
2. Déconnecter tous les appareils
3. Révoquer toutes les clés API
4. Vérifier l'activité récente du compte
5. Activer les alertes de sécurité
6. Contacter le support Google si nécessaire
```

### Support Google

```yaml
Aide Google Account:
  URL: https://support.google.com/accounts
  
Aide Google Business:
  URL: https://support.google.com/business
  
Sécurité du Compte:
  URL: https://myaccount.google.com/security
```

---

## 📚 Ressources Supplémentaires

### Documentation Officielle

- [Google Account Security](https://myaccount.google.com/security)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)

### Outils de Vérification

- [Have I Been Pwned](https://haveibeenpwned.com) - Vérifier si votre email a été compromis
- [Google Security Checkup](https://myaccount.google.com/security-checkup)

---

## ⚡ Commandes Utiles

### Générer des Secrets Sécurisés

```bash
# Générer un secret aléatoire (32 caractères)
openssl rand -base64 32

# Générer un mot de passe fort (20 caractères)
openssl rand -base64 20 | tr -d "=+/" | cut -c1-20

# Générer un UUID
uuidgen
```

### Vérifier le Fichier .env

```bash
# S'assurer que .env est dans .gitignore
grep -q "^\.env$" .gitignore && echo "✅ .env est ignoré" || echo "❌ Ajouter .env au .gitignore"

# Vérifier que .env n'est pas tracké par Git
git ls-files | grep -q "^\.env$" && echo "⚠️ .env est tracké par Git!" || echo "✅ .env n'est pas tracké"
```

---

## 💡 Résumé des Bonnes Pratiques

### ✅ À FAIRE

1. Utiliser un gestionnaire de mots de passe
2. Activer la vérification en 2 étapes partout
3. Créer des clés API avec restrictions strictes
4. Stocker les secrets dans .env (jamais commité)
5. Utiliser des mots de passe d'application pour SMTP
6. Changer régulièrement les mots de passe
7. Monitorer les accès et alertes

### ❌ À NE JAMAIS FAIRE

1. Partager des mots de passe dans un chat/email
2. Commiter .env sur Git/GitHub
3. Utiliser le même mot de passe partout
4. Désactiver la vérification en 2 étapes
5. Partager des clés API non restreintes
6. Stocker des mots de passe en clair dans le code
7. Ignorer les alertes de sécurité

---

**🔒 LA SÉCURITÉ EST UNE PRIORITÉ ABSOLUE**

Prenez le temps de bien configurer la sécurité maintenant, cela vous évitera de gros problèmes plus tard.

---

**Dernière mise à jour :** 2 octobre 2025  
**À revoir :** Trimestriellement
