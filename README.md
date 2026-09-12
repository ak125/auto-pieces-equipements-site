
# auto-pieces-equipements-site

Site statique Auto Pièces Équipements. Le build de publication génère le catalogue
puis copie uniquement les fichiers autorisés dans `dist/`. Vite sert au développement
et à la prévisualisation ; Express fournit un serveur local optionnel.

## Versions et installation

- Node **24.21.0 LTS**, version de référence dans `.nvmrc`, utilisée aussi par les workflows.
- npm **12.0.2**, déclaré dans les deux manifestes et installé explicitement en CI.
- Vite **8.3.0** pour le site ; TypeScript **7.0.2** pour le sous-projet Worker.
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

Le JavaScript du site reste du JavaScript : la mise à jour du compilateur concerne
les sources TypeScript du Worker et ne constitue pas une conversion du site.

Voir [le bilan de mise à niveau et la comparaison des projets](docs/MISE-A-NIVEAU-DEPENDANCES-20260912.md).
