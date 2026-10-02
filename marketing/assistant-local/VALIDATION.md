# Validation du candidat — 2 octobre 2026

**Preuve historique V1.** La version V2 et ses nouveaux résultats sont dans
[VALIDATION-V2.md](VALIDATION-V2.md). Les nombres ci-dessous ne décrivent pas V2.

Base `3756cba51edff2f280555bab13872edc72efde52`, branche
`codex/ape-marketing-skills-20261002`. Nouveaux fichiers non commités ; le SHA
de base ne désigne pas à lui seul ce candidat. Aucune preuve CI distante ajoutée.

## Résultats observés

| Contrôle | Résultat | Limite |
|---|---|---|
| Runtime | Node 24.21.0, npm 12.0.2 portables déjà présents | Node global Windows 24.11.1/npm 11.6.2 non utilisés pour la chaîne ; aucune mise à jour |
| Installation | npm ci --ignore-scripts --no-audit --no-fund, 100 paquets | Aucun nouveau paquet déclaré ; scripts d'installation neutralisés, contrôles déclarés ensuite exécutés |
| Typage du nouveau code | tsc -p tsconfig.marketing.json, succès | Contrôle complémentaire explicite, non ajouté aux scripts npm existants |
| Chaîne déclarée npm test | **170 tests, 0 échec**, politique HTTP et socle, typage navigateur/serveur, build et validation réussis | Préconditions Node/npm respectées ; pas de déploiement ni CI |
| Tests marketing | **23 cas** inclus dans les 170 | Fonctionnels/déterministes, pas une garantie sémantique universelle des agents |
| Rendu pilote | HTML et texte générés ; newsletter mobile 390 px, scrollWidth 390, zéro requête | Edge Chromium via Playwright existant ; pas un test Gmail/Outlook ni de délivrabilité |
| Liste publique | Exactement 31 fichiers dans dist ; sources et dist identiques par SHA256 avant remise des fins de ligne | Aucun fichier de marketing, skill, source interne ou prototype ajouté |
| Parité avec la base | 31 fichiers inchangés en contenu ; comparaison texte neutralisant CRLF/LF, binaire exacte | Le build réécrit 12 pages en LF ; restaurées ensuite au format du checkout, aucun changement suivi |
| Codex 0.159.0 | skills/list : quatre skills ape-, scope repo, enabled true, zéro erreur et aucun doublon ape- dans l'index | Aucun nouveau chat modèle ou configuration globale lancé pour ce contrôle |
| Chargement/invocation locale | Un sous-agent borné a lu les skills/références et traité cinq cas | Lecture explicite et test comportemental ; différent d'une preuve de sélection implicite de l'application |
| Hermes | **Non testé dans Hermes** | Pas d'exécutable accessible dans le PATH ; aucune connexion VPS ni activation |
| Outil quick_validate.py | Non lancé : dépendance PyYAML absente | Aucun paquet installé pour le contourner ; le parseur natif Codex accepte les quatre fichiers |

npm signale une option d'environnement héritée `global-ignore-file` inconnue ;
avertissement non bloquant, aucune configuration globale changée.

## Couverture minimale et résultats

- Mauvais projet : AutoMecanik, Alliance Delivery, identifiant étranger ou vide refusés.
- Audience non vide ou déclarée éligible sans système vérifié : AUDIENCE, aucun adressage.
- Compatibilité affirmée sans vérification : COMPATIBILITY.
- Prix absent : PRICE ; fin de période passée : EXPIRED ; date impossible : PERIOD.
- Fuseau : minuit Paris avant/après changement d'heure ; deux occurrences de 02 h 30
  le 25 octobre et exception de fermeture le 26 octobre traitées correctement.
- Lien inconnu, protocole actif et paramètre personnel : LINK.
- Avis avec demande de lire .env : UNTRUSTED_REVIEW/SENSITIVE ; texte jamais exécuté.
- Email personnel synthétique, plaque synthétique et déclaration de donnée privée :
  PRIVACY, valeurs non réaffichées dans le rapport.
- Modification texte, version, offre, période, audience ou destination :
  APPROVAL_CHANGED ; même une empreinte concordante conserve canExecute false.
- Absence de connecteur : NO_CONNECTOR ; simulation sans transport, zéro appel fetch.
- Rendu : HTML hostile échappé ; expéditeur et variable de désinscription visibles.
- Brouillon informatif : pas d'étiquette de fiction ajoutée arbitrairement.
- Exclusion publication : liste fermée préservée et dist contrôlé après build.

## Essais des skills

Un test à contexte séparé a produit une newsletter informative et deux mini-posts
sans prix ni audience, refusé l'abonnement depuis d'anciens échanges WhatsApp,
rédigé une réponse prudente à un avis sensible et exécuté la revue d'un pilote au
12 octobre avec prix null : PRICE + EXPIRED, zéro transport et performance indisponible.

Le premier essai a sélectionné ape-campagnes-locales pour une demande AutoMecanik,
puis refusé l'exécution après lecture. C'était une sélection indue. Les descriptions
ont été corrigées pour interdire explicitement sélection ET chargement hors APE.
Le contre-test sur descriptions seules écarte AutoMecanik et Alliance Delivery,
et sélectionne ape-campagnes-locales pour APE. Il a utilisé le même évaluateur :
**pas de preuve statistique, ni de garantie du routage implicite futur**.
Le garde-fou de projet du validateur demeure testé indépendamment.

## Reproduire

Depuis la racine avec les versions prescrites par le README :
```sh
node --test tests/marketing-local.test.mjs
node node_modules/typescript/bin/tsc -p tsconfig.marketing.json
node scripts/render-marketing-pilot.mjs
npm test
node scripts/marketing-local.mjs marketing/assistant-local/pilote/newsletter.json
```

La dernière commande emploie la date réelle et échouera quand la période pilote sera
expirée. Les tests/rendu pilote figent le 2 octobre ; ce n'est jamais un mode d'envoi.
Les journaux techniques synthétiques restent localement dans `tmp/marketing-evidence/`
(ignoré), notamment npm-test-final.log, public-parity.json, discovery.json,
pilot-review.json et newsletter-mobile.png. Aucune donnée client dans ces fichiers.

## Non établi / non effectué

Aucune réception de formulaire, collecte d'inscription, délivrabilité email, compte
WhatsApp Business, exhaustivité Places, publication Google, rang SEO, revenu ou conversion.
Pas de fournisseur, OAuth, infrastructure, base, queue, hook, cron, push, PR, merge,
déploiement ou modification des profils globaux. Les tests Worker ne sont pas relancés :
aucune source/dépendance/configuration Worker modifiée ; aucun nouveau résultat Worker revendiqué.
