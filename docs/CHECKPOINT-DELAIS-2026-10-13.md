# Auto Pièces — délais et parcours de demande, 13 octobre 2026

Objectif : poursuivre les corrections utiles au client. Lot limité à la cohérence des délais annoncés sur le site et à la lisibilité de l’accueil mobile.

État vérifié : `origin/main` relu sur GitHub, base `693e2c5392ae4f53dd5ce6105bc30c9d9ef94c9c`. Le site public répond HTTP 200 et promet encore des pièces « disponibles dans la journée ». Les corrections Google du 1er octobre, conservées dans le workspace initial, demandaient déjà de confirmer prix et délai avant commande ; leurs statuts actuels n’ont pas été revérifiés. Le workspace initial et les autres candidats sont préservés.

Changements locaux : accueil, source du catalogue et modèle commun corrigés ; onze pages catalogue régénérées. Prix et délai confirmés avant commande, retrait après confirmation, disponibilité des pièces distinguée du créneau de livraison. Métadonnées, FAQ et JSON-LD suivent le contenu. Messages WhatsApp actualisés ; référence/véhicule privilégiés, plaque seulement si nécessaire. Introduction de l’accueil raccourcie pour faciliter l’accès aux boutons sur mobile. Aucun tarif ni stock modifié.

Validation : génération et build réussis ; validateur public vert sur 12 pages SEO et 31 fichiers. 22 tests ciblés verts (références publiques, répertoire de génération, horaires). Typage strict des deux scripts modifiés et de leurs imports réussi avec le compilateur et les types existants du worktree marketing. Contrôle des 49 liens WhatsApp et absence de « dans la journée » dans le HTML généré, métadonnées, JSON-LD et messages décodés. Navigateur Chromium, accueil à 390 × 844 et navigation vers Alternateur/Démarreur ; capture dans `tmp/evidence/accueil-mobile.png`. Seule erreur console observée : favicon.ico absent sur le serveur statique local.

Limites : Node local 24.11.1/npm 11.6.2, inférieurs aux versions exigées ; validation complète `npm test`/CI non réalisée sur ce candidat. Les tests ciblés restent des preuves locales. Aucune preuve de hausse d’appels, de demandes ou de ventes. Aucun push, fusion ni déploiement de ce lot.

Autorisation reçue le 13 octobre 2026 : publier ce candidat sur GitHub, puis fusionner et déployer si les contrôles passent. Suite : exécuter la CI du SHA exact et vérifier après déploiement les textes et les contacts du site public. Le correctif local ne change pas encore ce que les clients voient en ligne. Retour arrière : annuler uniquement le diff de ce lot ; ne pas réinitialiser les autres worktrees.
