
# auto-pieces-equipements-site

Site statique Auto Pièces Équipements. Le build de publication génère le catalogue
puis copie uniquement les fichiers autorisés dans `dist/`. Vite sert au développement
et à la prévisualisation ; Express fournit un serveur local optionnel.

## Versions et installation

- Node **24.21.0 LTS**, version de référence dans `.nvmrc`, utilisée aussi par les workflows.
- npm **12.0.2**, déclaré dans les deux manifestes et installé explicitement en CI.
- Vite **8.3.0** pour le site ; TypeScript **7.0.2** pour le site, le serveur et le Worker.
- Types Node **24.13.4**, alignés sur la majeure du runtime Node 24.
- Dépendances directes épinglées et deux `package-lock.json` conservés.

Sélectionner Node 24.21.0 avec son gestionnaire de versions, puis :

```sh
npm install --global npm@12.0.2
npm ci
npm test
npm run dev
```

Avec nvm sous Linux/macOS, `nvm install` et `nvm use` lisent `.nvmrc`. Sous Windows,
sélectionner explicitement `24.21.0` dans son gestionnaire de versions.
Les fichiers `.npmrc` refusent les versions Node/npm hors des plages supportées.

## Appels HTTP

Axios est interdit dans ce dépôt. Utiliser `fetch` natif, sans dépendance HTTP
supplémentaire. Les appels Google Places des serveurs partagent
`server/google-places.cjs` : contrôle HTTP, décodage JSON et délai de 10 secondes.

`npm run check:dependencies` vérifie les sources, les manifestes et les lockfiles
npm, y compris les sous-projets et les dépendances indirectes. Ce contrôle est
exécuté par `preinstall` et par `npm test`, donc aussi dans la CI du site.
Les tests vérifient le refus des imports, CDN, alias npm et dépendances indirectes.

Ce contrôle vérifie aussi l'alignement du socle : `.nvmrc`, bornes Node/npm,
`packageManager`, TypeScript commun et majeure de `@types/node`. Les deux `.npmrc`
doivent conserver `engine-strict=true` et `save-exact=true`. Les versions sources
sont `.nvmrc` et le manifeste racine ; le Worker doit rester cohérent avec eux.
Les workflows lisent la version npm depuis `packageManager`.

L'installation et `npm test` dans `google-places-proxy` exécutent également ce
contrôle commun, y compris l'interdiction HTTP. Ces commandes nécessitent le
dépôt complet, avec les scripts partagés dans le dossier parent.

Vite 8 utilise `vite.config.mjs`. Le scan des dépendances couvre les pages HTML
de la liste publique partagée avec le build statique.

Les scripts `render-catalog-pages.mjs`, `build-static.mjs` et `validate-site.mjs`
résolvent la racine depuis leur propre emplacement. Un lancement par chemin
absolu depuis un autre dossier génère, reconstruit et valide le même dépôt ;
le répertoire `dist` du dossier de lancement est préservé.

## Contrôle de types du JavaScript actif

`npm run typecheck` contrôle les fichiers JavaScript actifs sans les convertir
ni générer de fichiers supplémentaires. Il est exécuté par `npm test`, donc aussi
par les workflows qualité et publication.

- `tsconfig.browser.json` : `assets/site.js` et `server/reviews-test.js`, avec
  les API DOM et sans les variables globales Node.
- `tsconfig.server.json` : serveur, points d'entrée, helper fetch, politique HTTP,
  liste publique, données du catalogue, génération, build, validation et
  configuration Vite, avec les types Node 24 et sans le DOM.

Les deux activent `strict`, `checkJs` et `noUncheckedIndexedAccess`, sans émission.
Les paramètres sont documentés en JSDoc ; les données JSON externes restent
`unknown` jusqu'aux contrôles de structure. Les anciens scripts non publiés et
les prototypes archivés ne font pas partie de ce contrôle.

## Serveur local et diagnostic des avis

`npm start` démarre Express sur `http://127.0.0.1:3000`. `PORT` change le port ;
`HOST` permet de choisir explicitement une autre interface réseau. Le `.env`
est lu à la racine du dépôt, même si le serveur est lancé depuis un autre dossier.

- `/` et les fichiers de `publicFiles` servent le site ; les fichiers internes
  du dépôt ne sont pas accessibles par HTTP.
- `/test` affiche le diagnostic des avis, avec les contenus Google rendus comme
  texte et un état d'erreur explicite.
- `/api/google-reviews` utilise `GOOGLE_PLACE_ID` et `GOOGLE_MAPS_API_KEY`.
  Un échec amont renvoie 502, une expiration 504, un refus Google 400 et une
  configuration absente 500. Aucun avis fictif n'est utilisé en remplacement.

`node server.js` et `node server/server.js` démarrent le même serveur.
Les anciens prototypes MCP et OBD sont conservés dans `docs/archives/`, sous
forme documentaire. Leurs fonctionnalités incomplètes ne sont pas activées.
Le serveur Express est indépendant de Vite ; choisir des ports différents pour
les lancer simultanément. Le build publié sur Pages reste statique.

## Sous-projet Cloudflare

`google-places-proxy/` contient actuellement le Worker de démonstration
(`/message` et `/random`), distinct des anciennes implémentations Google Places
présentes dans `cloudflare/` et à la racine. Ses tests ne valident pas un proxy
Google Places déployé.

```sh
npm --prefix google-places-proxy ci
npm --prefix google-places-proxy run typecheck
npm --prefix google-places-proxy test
npm --prefix google-places-proxy run build
```

La dernière commande effectue seulement un build Wrangler avec `--dry-run`.
Le job CI Worker exécute ces contrôles sans identifiant Cloudflare.
Les scripts natifs esbuild et workerd nécessaires à ces outils sont autorisés
par version dans `allowScripts`, conformément au fonctionnement de npm 12.
Vitest **4.1.11** est conservé car `@cloudflare/vitest-plugin@1.1.8` exige
Vitest `^4.1.0` ; passer à Vitest 5 nécessite une version compatible de ce plugin.

Le Worker conserve son propre contrôle TypeScript des sources et des tests.
Le site reste en JavaScript, désormais vérifié par TypeScript via `checkJs`.

Voir [le bilan de mise à niveau et la comparaison des projets](docs/MISE-A-NIVEAU-DEPENDANCES-20260912.md).
