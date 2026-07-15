# Audit des clés Google

Mise à jour : 15 juillet 2026

## État du dépôt

- Le site public ne dépend plus d'une clé Google au moment du build ou de l'exécution.
- Les valeurs ressemblant à des clés Google ont été retirées de l'arborescence courante.
- La CI exécute `npm test` et bloque toute nouvelle valeur correspondant au format d'une clé Google.
- Les fichiers `.env*` restent ignorés, à l'exception du modèle `.env.example`.

## Action propriétaire obligatoire

Le nettoyage de la branche ne supprime pas les valeurs des anciens commits. Toute clé ou tout mot de passe ayant déjà
été publié doit être considéré comme compromis :

1. révoquer ou régénérer la valeur depuis le compte fournisseur ;
2. vérifier l'usage et la facturation associés ;
3. appliquer des restrictions d'API, de domaine et de quota ;
4. stocker la nouvelle valeur uniquement dans le gestionnaire de secrets du service qui en a réellement besoin ;
5. ne pas fusionner une réécriture d'historique sans sauvegarde et coordination avec les contributeurs.

## Réactivation éventuelle d'un outil Google

Les outils d'administration et workers ne sont pas inclus dans l'artefact GitHub Pages. Si l'un d'eux est réactivé,
sa clé doit être injectée par variable d'environnement ou gestionnaire de secrets. Une clé privée ne doit jamais être
placée dans un fichier HTML, une documentation, un script de test ou une URL committée.

## Vérification locale

```bash
npm test
git grep -n -E 'AIza[0-9A-Za-z_-]{20,}'
```

La seconde commande ne doit retourner aucun résultat.
