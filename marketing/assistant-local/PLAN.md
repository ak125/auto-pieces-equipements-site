# Lot candidat marketing local — 2 octobre 2026

## Mandat et cible

Mission utilisateur « marketing local par skills Hermes–Codex », 13 sections.
Uniquement `ak125/auto-pieces-equipements-site`, site `https://auto-pieces-equipements.fr/`.
Base distante vérifiée par `git ls-remote` : `3756cba51edff2f280555bab13872edc72efde52`.
Branche candidate `codex/ape-marketing-skills-20261002`, worktree isolé géré par Codex.
Le dossier initial reste sur `a3c8c0f` avec ses modifications marketing préexistantes préservées.
Pas de modification des profils, permissions, dépendances, lockfiles, site public ou liste blanche.

## Conception retenue

Quatre skills canoniques dans `.agents/skills/` : campagnes locales (offre,
newsletter et déclinaisons), avis, audience/préférences, revue/mesure. Une référence
métier partagée ici, reliée aux procédures Google Business existantes. Des fonctions
Node sans transport vérifient les dossiers documentaires ; elles ne sont ni un
service d'envoi, ni un CRM, ni un moteur de campagne. Seules fixtures fictives et
gabarits sont versionnables. Aucun stockage privé autorisé établi pour des données réelles.

## Lots et critères

- [x] Inventaire sourcé : distinguer statique, diagnostic, ancien proxy, archives et droits.
- [x] Tests puis validateurs : projet, offre, échéance Paris, liens, confidentialité,
  audience, avis hostile, comparaison d'approbation, absence de connecteur et simulation.
  Fonctions `reviewDossier(unknown, context)` et `simulate(unknown, context)` ;
  `approvalFingerprint` détecte une modification mais n'accorde aucun droit.
- [x] Skills, modèles et pilote : offre fictive, newsletter HTML/texte, deux posts,
  trois avis synthétiques, calendrier non programmé ; sortie et inconnues explicites.
- [x] Validation : tests ciblés, contrôle strict du nouveau code, `npm test`, parité
  des fichiers publics, découverte réelle Codex si accessible ; Hermes absent = non testé.
- [x] Raccordement candidat et checkpoint : preuves, permissions, décision humaine,
  retour arrière et limites de runtime, sans activation ni publication.

## Cas qui nécessitent attention

Entrées JSON malformées doivent échouer sans effet ; liens connus ne prouvent pas
livraison ; dates seules suivent Paris ; avis = données inertes ; données déclarées
fictives ne constituent pas une preuve automatique d'anonymat. Une revue humaine
reste nécessaire pour les allégations libres et données indirectement identifiantes.
Les décisions d'activation sont séparées, pas soumises à nouveau pour chaque sous-étape.

## Exécution

Un seul agent écrit. Pas de revue automatique systématique. Vérifications ciblées
et chaîne déclarée réutilisées si l'état pertinent ne change pas. Aucun commit,
push, PR, merge, envoi, programmation ou déploiement dans ce lot.
