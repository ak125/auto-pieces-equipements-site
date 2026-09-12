# Règles du projet

- Axios est interdit : ne pas l'ajouter aux dépendances, aux lockfiles, aux sources
  ou aux exemples de code. Utiliser `fetch` natif de Node et des navigateurs.
- Pour les appels HTTP serveur, contrôler `response.ok`, décoder explicitement
  la réponse et imposer un délai avec `AbortSignal.timeout`.
- Exécuter `npm run check:dependencies` après toute modification des dépendances
  ou du transport HTTP. Ce contrôle fait aussi partie de `npm test` et de la CI.
- Conserver la configuration ESM de Vite 8 et sa liste d'entrées publiques issue
  de `scripts/site-config.mjs`. La publication utilise le build statique dédié.
