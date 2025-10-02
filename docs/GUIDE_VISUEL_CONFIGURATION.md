# 📸 Guide Visuel - Configuration Google Cloud Platform
**Auto Pièces Équipements - Étape par Étape**

> Ce guide vous montre **exactement** quoi faire, étape par étape avec descriptions détaillées.

---

## 🎯 Objectif

Configurer votre projet Google Cloud pour afficher automatiquement vos avis Google (4.9/5 ⭐) sur votre site web.

**Temps estimé** : 15 minutes  
**Niveau** : Débutant (explications détaillées)

---

## ✅ Ce que vous avez déjà

```yaml
✅ Projet GCP : auto-pieces-equipements
✅ Compte Google : autope93@gmail.com
✅ Place ID : ChIJVVXZlqAT5kcRICTpgHlqx9A
✅ 28 avis Google (note 4.9/5)
```

---

## 📋 Ce que vous devez faire (4 étapes)

```
Étape 1 : Activer la facturation (5 min)
Étape 2 : Activer les 3 APIs (5 min)
Étape 3 : Créer une clé API (3 min)
Étape 4 : Configurer le projet (2 min)
```

---

## 🚀 ÉTAPE 1 : Activer la Facturation

### 1.1 Ouvrir la Console de Facturation

**Lien direct** : https://console.cloud.google.com/billing?project=auto-pieces-equipements

**Ce que vous verrez** :
```
┌─────────────────────────────────────────────────────┐
│  Google Cloud Console                               │
│  ────────────────────────────────────────────       │
│                                                      │
│  Facturation                                        │
│                                                      │
│  ⚠️  Ce projet n'est pas associé à un compte       │
│      de facturation                                 │
│                                                      │
│  [ Associer un compte de facturation ]              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 1.2 Cliquer sur "Associer un compte de facturation"

**Vous avez 2 options** :

#### Option A : Vous avez déjà un compte de facturation
```
→ Sélectionner le compte dans la liste
→ Cliquer sur "Définir le compte"
→ ✅ Terminé !
```

#### Option B : Créer un nouveau compte (RECOMMANDÉ pour la première fois)
```
→ Cliquer sur "Créer un compte de facturation"
→ Vous verrez un formulaire
```

### 1.3 Remplir le Formulaire de Facturation

**Informations à entrer** :

```yaml
Nom du compte de facturation:
  → "Auto Pièces Équipements - Facturation"

Pays:
  → France 🇫🇷

Devise:
  → EUR (€)

Type de compte:
  → Entreprise (recommandé)
  → OU Particulier (si vous préférez)
```

### 1.4 Ajouter une Carte Bancaire

**Pourquoi c'est obligatoire** :
```
⚠️  Google exige une carte même si c'est gratuit
✅  200$ de crédit gratuit pendant 3 mois
✅  Vous ne serez PAS débité automatiquement
✅  Vous recevrez une alerte avant tout paiement
```

**Informations demandées** :
```
Numéro de carte : [16 chiffres]
Date d'expiration : [MM/AA]
CVV : [3 chiffres au dos]
Nom du titulaire : [Votre nom]
Adresse de facturation : 184 Av. Aristide Briand
Code postal : 93320
Ville : Les Pavillons-sous-Bois
```

### 1.5 Valider

```
→ Cliquer sur "Démarrer mon essai gratuit"
→ Accepter les conditions
→ Cliquer sur "Confirmer"

✅ Vous verrez : "Compte de facturation activé"
```

**Résultat attendu** :
```
┌─────────────────────────────────────────────────────┐
│  ✅ Facturation Active                              │
│                                                      │
│  Compte : Auto Pièces Équipements - Facturation    │
│  Crédit : 200,00 $ (valable 90 jours)              │
│  Projet : auto-pieces-equipements                   │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 ÉTAPE 2 : Activer les APIs

### 2.1 Ouvrir la Bibliothèque d'APIs

**Lien direct** : https://console.cloud.google.com/apis/library?project=auto-pieces-equipements

**Ce que vous verrez** :
```
┌─────────────────────────────────────────────────────┐
│  Bibliothèque d'API                                 │
│  ────────────────────────────────────────────       │
│                                                      │
│  🔍 [Rechercher des API et des services]           │
│                                                      │
│  APIs populaires :                                  │
│  [Google Maps Platform]  [Cloud Storage]  [...]    │
└─────────────────────────────────────────────────────┘
```

### 2.2 Activer "Places API (New)"

**Étapes détaillées** :

1. **Taper dans la barre de recherche** :
   ```
   Places API
   ```

2. **Vous verrez plusieurs résultats** :
   ```
   Places API (New) ⭐ ← CLIQUER SUR CELUI-CI
   Places API (Legacy)
   ```

3. **Cliquer sur "Places API (New)"**

4. **Vous arrivez sur la page de l'API** :
   ```
   ┌─────────────────────────────────────────────────┐
   │  Places API (New)                               │
   │  ──────────────────────────────────────         │
   │                                                  │
   │  API pour accéder aux informations de lieux     │
   │  et aux avis clients sur Google Maps            │
   │                                                  │
   │  [ ➕ ACTIVER ]  ← CLIQUER ICI                  │
   └─────────────────────────────────────────────────┘
   ```

5. **Cliquer sur "ACTIVER"**

6. **Attendre quelques secondes** (1-5 secondes)

7. **Vous verrez** :
   ```
   ✅ Places API (New) activée
   ```

### 2.3 Activer "Maps JavaScript API"

**Répéter le même processus** :

1. Retourner à la bibliothèque (bouton "Retour" ou lien)
2. Rechercher : `Maps JavaScript API`
3. Cliquer sur le résultat
4. Cliquer sur "ACTIVER"
5. Attendre la confirmation

### 2.4 Activer "Geocoding API"

**Répéter encore une fois** :

1. Retourner à la bibliothèque
2. Rechercher : `Geocoding API`
3. Cliquer sur le résultat
4. Cliquer sur "ACTIVER"
5. Attendre la confirmation

### 2.5 Vérifier que les 3 APIs sont activées

**Aller sur** : https://console.cloud.google.com/apis/dashboard?project=auto-pieces-equipements

**Vous devriez voir** :
```
┌─────────────────────────────────────────────────────┐
│  APIs activées                                      │
│  ────────────────────────────────────────────       │
│                                                      │
│  ✅ Places API (New)                                │
│  ✅ Maps JavaScript API                             │
│  ✅ Geocoding API                                   │
│                                                      │
│  Total : 3 APIs activées                            │
└─────────────────────────────────────────────────────┘
```

---

## 🔑 ÉTAPE 3 : Créer une Clé API

### 3.1 Ouvrir la Page des Identifiants

**Lien direct** : https://console.cloud.google.com/apis/credentials?project=auto-pieces-equipements

**Ce que vous verrez** :
```
┌─────────────────────────────────────────────────────┐
│  Identifiants                                       │
│  ────────────────────────────────────────────       │
│                                                      │
│  ➕ CRÉER DES IDENTIFIANTS  ← CLIQUER ICI          │
│                                                      │
│  Clés API existantes :                              │
│  [Peut-être vide ou avec des clés anciennes]        │
└─────────────────────────────────────────────────────┘
```

### 3.2 Créer la Clé

1. **Cliquer sur "➕ CRÉER DES IDENTIFIANTS"**

2. **Un menu déroulant apparaît** :
   ```
   ┌─────────────────────────────────┐
   │  Clé API               ← CLIQUER│
   │  ID client OAuth 2.0            │
   │  Compte de service              │
   └─────────────────────────────────┘
   ```

3. **Cliquer sur "Clé API"**

4. **Une popup s'affiche** :
   ```
   ┌─────────────────────────────────────────────┐
   │  Clé API créée                              │
   │  ─────────────────────────────────────      │
   │                                              │
   │  Votre nouvelle clé API :                   │
   │                                              │
   │  AIzaSyABCDEF123456789EXEMPLE...            │
   │  [📋 Copier]                                │
   │                                              │
   │  ⚠️  Limitez l'utilisation de cette clé    │
   │                                              │
   │  [ Fermer ]  [ Restreindre la clé ]         │
   └─────────────────────────────────────────────┘
   ```

5. **IMPORTANT : Copier la clé**
   ```
   → Cliquer sur l'icône 📋 pour copier
   → OU sélectionner le texte et Ctrl+C
   → Coller dans un fichier texte temporaire
   ```

6. **Cliquer sur "Restreindre la clé"** (IMPORTANT !)

### 3.3 Restreindre la Clé (SÉCURITÉ ESSENTIELLE)

**Vous arrivez sur la page de configuration** :

```
┌─────────────────────────────────────────────────────┐
│  Modifier la clé API                                │
│  ────────────────────────────────────────────       │
│                                                      │
│  Nom :                                              │
│  [Clé API 1]  ← Renommer en "Auto Pièces Frontend" │
│                                                      │
│  Restrictions d'application                         │
│  ○ Aucune                                           │
│  ● Références HTTP (sites web) ← SÉLECTIONNER      │
│  ○ Adresses IP                                      │
│  ○ Applications Android                             │
│  ○ Applications iOS                                 │
│                                                      │
└─────────────────────────────────────────────────────┘
```

#### 3.3.1 Renommer la Clé

```
Nom actuel : "Clé API 1"
Nouveau nom : "Auto Pièces Frontend"

→ Cliquer dans le champ et remplacer le texte
```

#### 3.3.2 Sélectionner "Références HTTP (sites web)"

```
→ Cliquer sur le bouton radio "● Références HTTP (sites web)"
```

**Un nouveau champ apparaît** :

```
┌─────────────────────────────────────────────────────┐
│  Références de site web                             │
│                                                      │
│  Ajouter un élément :                               │
│  [_____________________________________] [Ajouter]  │
│                                                      │
│  Éléments :                                         │
│  [Vide pour l'instant]                              │
└─────────────────────────────────────────────────────┘
```

#### 3.3.3 Ajouter Vos Domaines

**Ajouter 2 domaines** :

1. **Premier domaine (production)** :
   ```
   Taper : https://autopieces-equipements.fr/*
   Cliquer sur "Ajouter"
   ```

2. **Deuxième domaine (développement local)** :
   ```
   Taper : http://localhost:*/*
   Cliquer sur "Ajouter"
   ```

**Résultat** :
```
┌─────────────────────────────────────────────────────┐
│  Références de site web                             │
│                                                      │
│  Éléments :                                         │
│  ✅ https://autopieces-equipements.fr/*            │
│  ✅ http://localhost:*/*                            │
└─────────────────────────────────────────────────────┘
```

#### 3.3.4 Restreindre les APIs

**Faire défiler vers le bas** :

```
┌─────────────────────────────────────────────────────┐
│  Restrictions liées aux API                         │
│                                                      │
│  ○ Ne pas restreindre la clé                        │
│  ● Restreindre la clé  ← SÉLECTIONNER              │
│                                                      │
│  Sélectionner les API :                             │
│  🔍 [Rechercher]                                    │
│                                                      │
│  [Liste d'APIs avec cases à cocher]                 │
└─────────────────────────────────────────────────────┘
```

**Cocher les 3 APIs** :

```
☑️ Places API (New)
☑️ Maps JavaScript API
☑️ Geocoding API
```

**Comment les trouver** :
- Soit défiler dans la liste
- Soit utiliser la barre de recherche pour chaque API

#### 3.3.5 Sauvegarder

```
→ Faire défiler tout en bas
→ Cliquer sur le bouton bleu "ENREGISTRER"
→ Attendre le message "Clé API mise à jour"
```

### 3.4 Copier Votre Clé

**Retour sur la page des identifiants** :

```
┌─────────────────────────────────────────────────────┐
│  Clés API                                           │
│  ────────────────────────────────────────────       │
│                                                      │
│  Nom                 │ Clé           │ Modifiée     │
│  ──────────────────────────────────────────────     │
│  Auto Pièces         │ AIzaSyABC...  │ À l'instant │
│  Frontend            │ [📋 Copier]   │              │
└─────────────────────────────────────────────────────┘
```

**Copier la clé** :
```
→ Cliquer sur l'icône 📋 à côté de la clé
→ La clé est copiée dans le presse-papier
```

---

## 💾 ÉTAPE 4 : Configurer le Projet

### 4.1 Ouvrir le Terminal dans VS Code

**Dans VS Code** :
```
→ Menu : Terminal > New Terminal
→ OU raccourci : Ctrl+` (accent grave)
```

### 4.2 Éditer le Fichier .env

**Dans le terminal, taper** :
```bash
nano .env
```

**OU dans VS Code** :
```
→ Ouvrir l'explorateur de fichiers (Ctrl+Shift+E)
→ Cliquer sur le fichier ".env"
```

### 4.3 Remplacer la Clé

**Trouver cette ligne** :
```env
GOOGLE_MAPS_API_KEY=AIzaSyDxnNu4toDv4yZtPsd6i_WRj60LJLM3eY4
```

**Remplacer par votre nouvelle clé** :
```env
GOOGLE_MAPS_API_KEY=AIzaSy[COLLEZ VOTRE CLÉ ICI]
```

**Exemple (avec votre vraie clé)** :
```env
GOOGLE_MAPS_API_KEY=AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567
```

### 4.4 Sauvegarder

**Si vous utilisez nano** :
```
→ Ctrl+X
→ Appuyer sur Y (ou O)
→ Appuyer sur Enter
```

**Si vous utilisez VS Code** :
```
→ Ctrl+S (ou Cmd+S sur Mac)
```

### 4.5 Vérifier la Configuration

**Dans le terminal** :
```bash
cat .env | grep GOOGLE_MAPS_API_KEY
```

**Vous devriez voir** :
```
GOOGLE_MAPS_API_KEY=AIzaSy[votre_vraie_clé]
```

---

## 🧪 ÉTAPE 5 : Tester l'Intégration

### 5.1 Démarrer le Serveur

**Dans le terminal** :
```bash
npm start
```

**Vous verrez** :
```
> auto-pieces-equipements-site@1.0.0 start
> node server.js

Server running on port 3000
```

### 5.2 Ouvrir le Site

**Dans votre navigateur** :
```
Aller sur : http://localhost:3000
```

### 5.3 Vérifier les Avis

**Ce que vous DEVRIEZ voir** :

```
┌─────────────────────────────────────────────────────┐
│  Auto Pièces Équipements                            │
│                                                      │
│  ⭐⭐⭐⭐⭐ 4.9/5 (28 avis Google)                  │
│                                                      │
│  📝 Derniers avis :                                 │
│  ─────────────────────────────────────────────      │
│  👤 Automecanik ⭐⭐⭐⭐⭐                          │
│  "Excellent service, j'ai trouvé exactement..."     │
│                                                      │
│  👤 Yassine Khili ⭐⭐⭐⭐⭐                        │
│  "Accueil au top. J'ai fais plusieurs..."          │
│                                                      │
│  [Voir tous les 28 avis] →                          │
└─────────────────────────────────────────────────────┘
```

**Si ça fonctionne** : 🎉 **Félicitations !** Tout est configuré !

### 5.4 Dépannage si ça ne Marche Pas

#### Problème 1 : "REQUEST_DENIED"

**Message d'erreur** :
```
Les avis ne peuvent pas être chargés
Error: REQUEST_DENIED
```

**Solutions** :
```
1. Vérifier que la facturation est activée
   → https://console.cloud.google.com/billing

2. Vérifier que Places API (New) est activée
   → https://console.cloud.google.com/apis/dashboard

3. Attendre 5 minutes (propagation de la clé)
```

#### Problème 2 : "API_KEY_INVALID"

**Solutions** :
```
1. Vérifier que vous avez bien copié toute la clé
2. Pas d'espaces avant/après dans .env
3. Relancer le serveur : Ctrl+C puis npm start
```

#### Problème 3 : "ZERO_RESULTS"

**Solutions** :
```
1. Vérifier le Place ID dans .env :
   GOOGLE_PLACE_ID=ChIJVVXZlqAT5kcRICTpgHlqx9A

2. Vérifier les restrictions de la clé API
```

---

## ✅ Checklist Finale

### Vérifications à Faire

```
☐ Facturation activée dans GCP
☐ 3 APIs activées (Places, Maps JS, Geocoding)
☐ Clé API créée
☐ Clé API restreinte (domaines + APIs)
☐ Clé copiée dans .env
☐ Serveur redémarré
☐ Site testé dans le navigateur
☐ Avis Google affichés correctement
```

---

## 📞 Besoin d'Aide ?

### Si Vous Êtes Bloqué

**Vérifier ces points** :

1. **Facturation** :
   ```
   https://console.cloud.google.com/billing?project=auto-pieces-equipements
   → Doit montrer "Compte actif"
   ```

2. **APIs activées** :
   ```
   https://console.cloud.google.com/apis/dashboard?project=auto-pieces-equipements
   → Doit montrer 3 APIs (minimum)
   ```

3. **Clé API** :
   ```
   https://console.cloud.google.com/apis/credentials?project=auto-pieces-equipements
   → Doit montrer au moins 1 clé
   ```

4. **Fichier .env** :
   ```bash
   cat .env | grep GOOGLE_MAPS_API_KEY
   → Doit montrer votre clé (AIzaSy...)
   ```

### Messages d'Erreur Courants

| Erreur | Cause | Solution |
|--------|-------|----------|
| REQUEST_DENIED | API pas activée | Activer Places API (New) |
| API_KEY_INVALID | Clé incorrecte | Vérifier copier/coller |
| OVER_QUERY_LIMIT | Quota dépassé | Vérifier facturation |
| ZERO_RESULTS | Place ID incorrect | Vérifier ChIJVVXZlqAT5kcRICTpgHlqx9A |

---

## 🎉 Félicitations !

Si vous avez suivi toutes les étapes, votre site affiche maintenant automatiquement :

✅ Note Google : **4.9/5 ⭐⭐⭐⭐⭐**  
✅ Nombre d'avis : **28**  
✅ Commentaires des clients  
✅ Mise à jour automatique

**Prochaine étape** : Augmenter le nombre d'avis (objectif 100+) avec les QR codes créés !

---

**Guide créé le** : 2 octobre 2025  
**Projet** : auto-pieces-equipements  
**Difficulté** : ⭐⭐☆☆☆ (Facile avec ce guide)
