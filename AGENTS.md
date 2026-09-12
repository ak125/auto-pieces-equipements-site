# Règles du projet

- Axios est interdit : ne pas l'ajouter aux dépendances, aux lockfiles, aux sources
  ou aux exemples de code. Utiliser `fetch` natif de Node et des navigateurs.
- Pour les appels HTTP serveur, contrôler `response.ok`, décoder explicitement
  la réponse et imposer un délai avec `AbortSignal.timeout`.
- Exécuter `npm run check:dependencies` après toute modification des dépendances
  ou du transport HTTP. Ce contrôle fait aussi partie de `npm test` et de la CI.
- Conserver la configuration ESM de Vite 8 et sa liste d'entrées publiques issue
  de `scripts/site-config.mjs`. La publication utilise le build statique dédié.
- Le serveur actif est `server-simple.js` ; les deux autres points d'entrée
  démarrent cette même application. Les prototypes de `docs/archives/` sont
  documentaires, sans fonctions actives ni avis fictifs de secours.
- Servir uniquement les fichiers de `publicFiles` et les routes explicitement
  déclarées. Rendre les données externes avec les API DOM/textContent.
- Maintenir `npm run typecheck` vert : JavaScript actif vérifié en mode strict,
  environnements DOM et Node séparés, types Node alignés sur le runtime 24.
  Contrôler les JSON externes comme `unknown` ; ne pas masquer les erreurs avec
  `@ts-ignore`, `@ts-nocheck` ou un type `any` ajouté pour contourner le contrôle.
- Les scripts de publication résolvent leur racine depuis `import.meta.url`.
  Ne pas utiliser le dossier de lancement pour choisir le `dist` à reconstruire.
  Maintenir le catalogue et les scripts de publication dans le typage strict.
- Les horaires proviennent de `data/store-hours.json` ; générer les pages après
  modification et conserver bandeau, affichage et données structurées cohérents.
  Ne pas inventer de fermeture exceptionnelle. Les exceptions remplacent les
  horaires habituels de la date concernée, dans le fuseau Europe/Paris.
- Le contrôle après publication compare le site à l'artefact du même déploiement.
  Conserver délais, nombre de tentatives et concurrence bornés ; ne pas ignorer
  les différences de contenu ni les erreurs finales du contrôle.
- Une mise à niveau du socle doit garder `.nvmrc`, les bornes Node/npm des deux
  manifestes, `packageManager`, TypeScript et les types Node cohérents.
  Le contrôle partagé couvre aussi l'installation et les tests du Worker.
  Les workflows lisent npm depuis `packageManager`, sans recopier sa version.
