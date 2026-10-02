# Inventaire sourcé — 2 octobre 2026

## Complément V2

Identité/branche/base du worktree candidat recontrôlées le 2 octobre : inchangées.
La recherche bornée dans scripts, serveur, workflows et gouvernance n'a trouvé aucun
Command Center, engineering kit, CRM, inbox/outbox, service de mandat, moteur de parcours
ou connexion marketing opérationnelle à réutiliser dans ce dépôt. Les noms de modules
historiques de formulaires ne prouvent pas une réception active. core.hooksPath absent ;
aucun hook actif hors exemples constaté. Les workflows de publication sont laissés intacts.

Réemploi : quatre skills et dossier V1, source horaire, catalogue, whitelist, tests et rendu.
Ajout candidat : scripts/marketing-workbench.mjs et six modules purs scripts/marketing.
Le CLI ne lit aucun credential, ne fait pas de réseau et ne persiste ni contacts ni parcours.
Voir [matrice V2](MATRICE-V2.md) pour les 72 lignes et les écarts nommés.

## Identité et méthode

Origine Git vérifiée : `https://github.com/ak125/auto-pieces-equipements-site.git`.
Base `3756cba51edff2f280555bab13872edc72efde52`, concordante avec `git ls-remote origin refs/heads/main`.
Candidat `codex/ape-marketing-skills-20261002`, worktree isolé ; aucune fusion d'autres projets.
`AGENTS.md` et README lus ; pas de CLAUDE.md ni convention de skills dans cette base.
Le checkout initial `codex/distribution-seo-local` à `a3c8c0f` est conservé avec ses changements.
Les autres worktrees recensés concernent navigation, outils et textes produits ; aucun pack de skills APE trouvé.
Il s'agit d'un audit du code et des documents, pas d'un audit des comptes externes ni d'une preuve de déploiement courant.

## Capacités

| Besoin | Composant et source | Accès et droits dans ce lot | Test/preuve disponible | État et lacune |
|---|---|---|---|---|
| Inscriptions/newsletter | Aucun formulaire actif ; `politique-confidentialite.html`, liste `publicFiles` | Lecture source | Validation statique + inspection HTML | Pas de collecte, fournisseur, consentement ou désinscription vérifiés ; brouillons non adressés uniquement |
| Devis/demande de pièce | Liens tel/mailto/wa.me dans `index.html`, catalogue | Lecture ; aucune prise de contact | Tests références publiques | Conversation initiée par visiteur ; aucun devis reçu, conservé, validé ou vendu démontré |
| WhatsApp | Liens vers numéro officiel avec texte préparé | Pas d'accès Business Platform établi | Analyse destination source | Lien seul ; aucun compte privé, import de contacts ni envoi en masse |
| Offres | Catalogue et `marketing/google-business/fiches-produits.md` | Sources publiques documentaires | Validation site et nouveau validateur | Familles, pas inventaire commercial ; prix/stock/période à confirmer |
| Contenus locaux | Plan, cycle de posts, images et SOURCES existants | Réutilisation pour brouillons | Relecture des corrections historiques | Pas de nouvelle page locale ou modification SEO ; calendrier non programmé |
| Avis en lecture | `server-simple.js`, `server/google-places.cjs`, diagnostic /test | Configuration non inspectée, aucun appel Google | `google-places-fetch`, `reviews-test-page`, `local-server` | Endpoint local avec clé Places nécessaire ; ne prouve ni accès actuel ni exhaustivité |
| Réponses Google | Procédure documentaire GBP ; pas de route d'écriture | Aucune permission de réponse/publication | Trois avis synthétiques, contenu hostile | Compte propriétaire et réponse existante à recontrôler manuellement lors d'un lot autorisé |
| Proxy ancien | `cloudflare/google-places-worker.js`, configs racine | Lecture seulement | Pas de preuve d'un déploiement actif | Ne pas exécuter les anciennes instructions de connexion/déploiement |
| Worker actuel | `google-places-proxy/src/index.ts` | Hors modification | Tests existants /message et /random | Démonstration ; ses tests ne prouvent pas Google Places |
| Formulaires/prototypes | `scripts/modules/forms.js`, scripts historiques, `docs/archives/` | Lecture ponctuelle | Exclusion de la liste publique | Une simulation front-end, un submit ou localStorage ne constitue pas une collecte ; ne pas réactiver |
| Site publié | `scripts/site-config.mjs`, build statique, workflow Pages | Build local autorisé ; publication interdite | `published-artifact`, `public-references`, `publication-directory` | Liste fermée de 31 fichiers ; aucun dossier marketing ou skill publié |
| Mesure | Politique confidentialité ; section mesure du plan GBP ; rapports Search Console | Documents existants, aucun compte/export nouvellement consulté | Inspection JS publié | Aucun analytics configuré ; données GBP/GSC et ventes non récupérées |
| Skills Codex | Canonique candidat `.agents/skills/ape-*/SKILL.md` | Découverte/lecture locale | Recette et preuve dans VALIDATION.md | Le chargement ne donne aucun droit d'envoi |
| Skills Hermes | Exécutable absent du PATH Windows | Aucun profil/VPS modifié | Recette d'activation séparée | **Non testé dans Hermes** ; ni installé ni activé |

## État documentaire plus récent hors base

Lecture ciblée des fichiers locaux préexistants du checkout initial :
`marketing/google-business/README.md`, `audit-2026-09-29.md`,
`merchant-center-2026-09-29.md`, `posts-corrections-2026-09-29.md` et
`posts-corrections-2026-10-01.md`. Ils restent dans leur checkout, sans copie divergente.
La reprise du 1 octobre rapporte dix corrections en attente et trois précédentes
avec date de publication. Ce sont des observations historiques, pas une confirmation live.

## Mesure et suivi commercial

Réutiliser le plan GBP et le rapport existant `docs/SEARCH_CONSOLE_2026-09-09.md` ;
ne pas créer de registre clients.
Demander seulement des agrégats autorisés avec période, fuseau, définition, couverture
et provenance. Les étapes suivantes sont distinctes :
clic → demande effectivement reçue → devis validé → vente documentée.
Aucun compteur disponible n'est remplacé par zéro, aucune conversion sans dénominateur
comparable et aucune causalité attribuée à un post sans dispositif de mesure.

Le plan propose un UTM GBP, non appliqué. Il ne crée pas de mesure sans outil.
Ce lot conserve les liens publics exacts et n'ajoute aucun paramètre de suivi.
