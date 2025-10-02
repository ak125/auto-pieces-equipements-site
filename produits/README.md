# 📄 Guide d'utilisation des pages produits

## 🎯 Objectif

Ces pages produits sont conçues pour être liées depuis votre profil **Google Business** afin d'améliorer votre visibilité locale et de convertir plus de visiteurs en clients.

---

## 📁 Structure des fichiers

```
produits/
├── modele-produit.html        # Template vierge à dupliquer
├── batterie-auto-12v.html     # Exemple rempli
└── README.md                  # Ce fichier
```

---

## 🚀 Comment créer une nouvelle page produit

### Étape 1 : Dupliquer le modèle

```bash
cp produits/modele-produit.html produits/nom-de-votre-produit.html
```

### Étape 2 : Personnaliser le contenu

Ouvrez le fichier et modifiez les sections suivantes :

1. **Titre de la page** (`<title>`) :
   ```html
   <title>Nom du produit - Auto Pièces Équipements | Aulnay-sous-Bois</title>
   ```

2. **Description SEO** (`<meta name="description">`) :
   ```html
   <meta name="description" content="Description courte et percutante pour Google.">
   ```

3. **Contenu principal** :
   - Nom du produit (`<h1>`)
   - Image du produit (`<img src="...">`)
   - Prix
   - Description détaillée
   - Caractéristiques techniques
   - Services inclus

4. **Informations de contact** :
   - Vérifiez que le numéro de téléphone est correct : `tel:+33148479627`
   - Vérifiez le lien WhatsApp : `https://wa.me/33148479627`

### Étape 3 : Ajouter des images

Placez vos images dans un dossier `images/` :

```bash
mkdir -p produits/images
# Copiez vos images dans ce dossier
```

Puis référencez-les dans le HTML :
```html
<img src="images/batterie-auto.jpg" alt="Batterie auto 12V">
```

---

## 🔗 Lier ces pages à Google Business

### Option 1 : Ajouter un lien dans les posts Google Business

1. Allez sur votre profil Google Business
2. Créez un nouveau post
3. Ajoutez le lien vers votre page produit :
   ```
   https://votre-site.com/produits/batterie-auto-12v.html
   ```

### Option 2 : Utiliser les "Services" ou "Produits"

1. Dans Google Business, allez dans **"Produits"** ou **"Services"**
2. Créez une nouvelle fiche produit
3. Ajoutez l'URL de votre page dans le champ "En savoir plus"

### Option 3 : Créer un QR Code

Générez un QR code pour chaque produit et affichez-le en magasin :

```bash
# Utilisez un outil en ligne comme qr-code-generator.com
# ou un script Node.js avec le package 'qrcode'
```

---

## 📊 Suivi et amélioration

### Analytics

Ajoutez Google Analytics pour suivre les performances :

```html
<!-- Ajoutez avant </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Search Console

1. Ajoutez vos pages dans Google Search Console
2. Vérifiez l'indexation et les performances SEO
3. Optimisez selon les recommandations

---

## ✅ Checklist avant publication

- [ ] Titre de page unique et descriptif
- [ ] Meta description optimisée (150-160 caractères)
- [ ] Image de produit de bonne qualité
- [ ] Prix à jour
- [ ] Numéro de téléphone correct
- [ ] Lien WhatsApp fonctionnel
- [ ] Horaires d'ouverture à jour
- [ ] Adresse correcte
- [ ] Schema.org (données structurées) rempli
- [ ] Testé sur mobile
- [ ] Testé sur desktop

---

## 🎨 Personnalisation avancée

### Modifier les couleurs

Dans la section `<style>`, modifiez :

```css
/* Couleur principale */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Couleur des boutons */
.btn-primary {
  background: #667eea; /* Changez cette valeur */
}
```

### Ajouter un chatbot

Intégrez votre chatbot existant en ajoutant le script avant `</body>` :

```html
<script src="../scripts/modules/chatbot.js"></script>
```

### Ajouter des avis clients

Utilisez votre module de reviews :

```html
<div id="reviews-section"></div>
<script src="../scripts/modules/reviews.js"></script>
```

---

## 📱 Exemple de promotion Google Business

**Post type "Offre" :**

```
🔋 BATTERIE AUTO 12V

✅ À partir de 79€
✅ Installation OFFERTE
✅ Garantie 2 ans
✅ Stock permanent

📍 Aulnay-sous-Bois (93)
📞 01 48 47 96 27

👉 Voir les détails : [lien vers batterie-auto-12v.html]

#AutoPieces #Batterie #Aulnay #SeineStDenis
```

---

## 🆘 Problèmes courants

### Les images ne s'affichent pas

Vérifiez que :
- Le chemin de l'image est correct
- Le fichier image existe
- Les permissions sont correctes

### Le lien WhatsApp ne fonctionne pas

Format correct :
```
https://wa.me/33148479627?text=Message%20pr%C3%A9rempli
```

### La page ne s'affiche pas correctement sur mobile

Vérifiez la présence de :
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 📞 Support

Pour toute question, contactez :
- Email : votre-email@example.com
- Téléphone : 01 48 47 96 27

---

**Dernière mise à jour :** Octobre 2025
