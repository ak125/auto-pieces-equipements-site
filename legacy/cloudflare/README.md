# Worker Cloudflare pour l'API Google Places

## Démarrage rapide

Pour démarrer rapidement avec le Worker Cloudflare:

```bash
# Installation de Wrangler CLI
npm install -g @cloudflare/wrangler

# Authentification avec votre compte Cloudflare
wrangler login

# Déploiement du Worker
cd /workspaces/auto-pieces-equipements-site/cloudflare
wrangler deploy --env production
```

## Test du Worker

Une fois le Worker déployé, vous pouvez le tester directement dans votre navigateur ou avec un outil comme Postman. Voici un exemple d'utilisation avec JavaScript:

```javascript
// Exemple d'appel au Worker
fetch('https://votre-worker.votre-account.workers.dev/?placeId=ChIJVVXZlqAT5kcRICTpgHlqx9A')
  .then(response => response.json())
  .then(data => {
    console.log(data);
    
    // Extraire la note moyenne
    const rating = data.result.rating;
    console.log(`Note moyenne: ${rating}/5`);
    
    // Extraire les avis
    const reviews = data.result.reviews;
    console.log(`Nombre d'avis: ${reviews.length}`);
    
    // Afficher le premier avis
    if (reviews.length > 0) {
      console.log('Premier avis:');
      console.log(`- Auteur: ${reviews[0].author_name}`);
      console.log(`- Note: ${reviews[0].rating}/5`);
      console.log(`- Commentaire: ${reviews[0].text}`);
    }
  })
  .catch(error => console.error('Erreur:', error));
```

## Limites de l'API Google Places

N'oubliez pas que l'API Google Places a des limites d'utilisation:

- 100 000 requêtes par jour maximum (plan de base)
- 5 requêtes par seconde maximum
- Nécessite une carte de crédit pour l'activation

## Supervision

Pour superviser l'utilisation de votre Worker:

1. Connectez-vous à votre [Dashboard Cloudflare Workers](https://dash.cloudflare.com)
2. Sélectionnez le Worker `google-places-proxy`
3. Consultez les onglets "Invocations" et "Errors" pour suivre l'activité

## Configuration de secours

En cas de problème avec l'API ou de dépassement de quota, assurez-vous que votre script client dispose d'une solution de secours (comme les exemples d'avis prédéfinis que nous utilisons en mode développement).
