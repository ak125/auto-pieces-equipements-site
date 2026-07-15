# Vérification des intégrations Google

Le site public statique n'appelle actuellement aucune API Google nécessitant une clé. Les liens vers Google Maps et
la fiche Google sont des liens HTTPS ordinaires et ne nécessitent aucun secret.

## Vérifier le site public

```bash
npm ci
npm test
```

Le test construit une liste blanche de fichiers publics, vérifie les balises SEO et légales, puis recherche les
formats de secrets connus dans tous les fichiers suivis.

## Tester un worker ou un outil d'administration

Effectuer les tests dans l'environnement du service concerné avec une clé nouvellement créée, restreinte et stockée
dans son gestionnaire de secrets. Ne jamais coller la valeur dans ce dépôt, dans une capture d'écran, une commande
partagée ou un rapport.

Avant toute activation :

- confirmer l'API et le projet Google Cloud réellement utilisés ;
- limiter la clé aux API nécessaires ;
- limiter les origines ou adresses autorisées ;
- fixer des quotas et alertes de facturation ;
- vérifier que les journaux et messages d'erreur ne révèlent pas la valeur.

Les anciennes valeurs présentes dans l'historique Git doivent être révoquées par le propriétaire du compte.
