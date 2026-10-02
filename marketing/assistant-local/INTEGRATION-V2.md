# Stabilisation et préparation d'intégration — 2 octobre 2026

## Candidat et cible

Branche locale codex/ape-marketing-skills-20261002, base
3756cba51edff2f280555bab13872edc72efde52. GitHub interrogé en lecture seule avec
git ls-remote : HEAD et refs/heads/main pointaient sur cette même base pendant la
préparation. La branche main locale est ancienne : ne pas l'utiliser comme cible
sans actualisation. Aucun fetch, rebase, commit, push, PR ou merge effectué.

Le checkout initial codex/distribution-seo-local à a3c8c0f contient deux documents
Google Business modifiés et cinq documents non suivis. Ils restent exclus du candidat
et préservés. L'intégration doit partir de main, pas de ce checkout utilisateur.

## Périmètre à relire

- Quatre skills APE 2.0.0 dans .agents/skills ; découverte et invocation historiques
  distinctes de la vérification des fonctions corrigées, Hermes non testé.
- CLI ponctuelle, six modules purs marketing, rendu local existant réutilisé ;
  données synthétiques, aucune connexion, exécution réelle indisponible.
- Tests des fonctions/CLI, corpus fictif, contrats, 72 exigences C/P/J et leurs
  limites, preuves historiques et dossier d'activation séparé.
- tests/local-server.test.mjs consomme entièrement les réponses fetch avant
  assertions et arrêt du processus, correction antérieure conservée.
- package.json borne désormais les fichiers de test concurrents à deux et inclut
  tsconfig.marketing.json dans npm run typecheck, donc dans npm test et la CI existante.

Aucune dépendance, lockfile, version d'outil, règle AGENTS, permission, workflow,
application serveur ou contenu public modifié. Le manifeste de préparation distingue
les fichiers ajoutés/modifiés et leurs empreintes. Les journaux/instruments temporaires
ne font pas partie du patch. render-marketing-pilot écrit uniquement les deux sorties
du pilote explicitement demandé ; les commandes de simulation n'ajoutent aucun suivi.

## Diagnostic et choix de stabilisation

Deux dépassements historiques de 10 s au démarrage de server-simple.js sont conservés,
notamment delivery-full.log : 313/314, puis serveur isolé 4/4 et reprise 314/314.
Le relevé initial présentait 8 processeurs logiques et environ 360 Mo libres sur 8 Go.
Une instrumentation temporaire des processus et du chargement d'Express a comparé
la concurrence par défaut à deux fichiers concurrents, sans modifier le serveur.

| Mesure instrumentée | Défaut | Concurrence 2 |
|---|---:|---:|
| Tests réussis | 314/314 | 314/314 |
| Pic de fichiers de test actifs | 7 | 2 |
| Pic de processus observés | 14 | 5 |
| Pic observé de RSS cumulée, Mo | 713 | 256 |
| Premier stdout du premier serveur, ms | 6751 | 3301 |
| Chargement Express de ce serveur, ms | 4395 | 2021 |
| Durée totale instrumentée, s | 69,2 | 107,9 |
| Minimum de mémoire système libre, Mo | 186 | 26 |

RSS échantillonnée aux événements, pas une mesure continue ; charge globale différente
entre essais. L'essai instrumenté n'a pas reproduit le timeout historique. Les chiffres
montrent un coût de démarrage et une pression de concurrence, sans prouver la cause OS
exacte des échecs passés. La borne native réduit la charge créée par notre suite ; elle
ne garantit pas l'absence de délai sous toute charge et n'accélère pas forcément la suite.
Pas de hausse des délais, retry automatique, suppression de test ou arrêt de processus tiers.

Option maintenue documentée par [Node.js 24](https://nodejs.org/docs/latest-v24.x/api/test.html#test-runner-execution-model).
Le runner continue d'isoler chaque fichier dans un processus distinct. L'instrumentation
et NODE_OPTIONS n'ont été appliqués qu'aux deux commandes de diagnostic, sans configuration
persistante ; la validation finale utilise npm test sans instrumentation.

## Validation du candidat préparé

npm test standard : **314/314**, dont **167 marketing**, au premier passage après
modification du script. Politique HTTP/socle, typages navigateur/serveur/marketing,
build et validation de 12 pages SEO/31 fichiers publics réussis. Node 24.21.0/npm 12.0.2.
Parité publique contrôlée : contenu identique à la base, source/dist exacts avant
restauration des seules fins de ligne générées. Aucun changement du rendu marketing
ou des skills ; leurs preuves antérieures restent limitées à leur périmètre.

Le contrôle du patch complet a ensuite détecté 19 lignes vides finales superflues,
invisibles au diff initial des seuls fichiers suivis. Nettoyage limité à la fin des
fichiers : contenu avant ces blancs identique, JSON comparés après parsing, aucune
instruction de skill ou logique modifiée. Les 74 tests concernés, y compris corpus
pilote et liens des skills, ont été rejoués avec succès ; integration-eof.json et
integration-format-recheck.log conservent la preuve. git diff --cached --check est
exécuté sur l'index temporaire complet avant de figer le patch.

Journaux dans tmp/marketing-evidence : startup-default.log, startup-2.log,
startup-default-summary.json, startup-2-summary.json, integration-full.log,
public-parity.json. Les observations brutes sont dans startup-default/ et startup-2/.
Le paquet local integration-candidate/ contient candidate.patch, manifest.json,
diff-stat.txt et les preuves sélectionnées ; il identifie un arbre Git sans commit.
Le patch est vérifié par application à un index temporaire de la base, puis comparaison
de l'arbre obtenu. L'index de travail normal n'est pas utilisé ni modifié.

## Séquence d'intégration proposée, non exécutée

1. Recontrôler main distant et l'empreinte du candidat. Si main a changé, préparer
   la combinaison dans un espace isolé et réévaluer les validations affectées.
2. Relire candidate.patch et le manifeste, puis autoriser le commit/push et la PR
   sur le périmètre exact. Réutiliser la branche candidate, sans reprendre les documents
   Google Business du checkout initial. Aucun commit de tmp/, dist/ ou node_modules/.
3. Attendre les contrôles de PR Site quality et Worker sur le SHA publié. Le Worker
   est inchangé et n'a pas été revalidé dans ce lot ; aucune CI distante revendiquée.
4. Décider séparément la fusion : le workflow deploy.yml publie automatiquement
   GitHub Pages sur push à main. Une fusion nécessite donc de prendre en compte cette
   publication, même si le contenu public de ce lot reste identique.
5. Après intégration et contrôles convenus, reprendre les améliorations sur une base
   propre. L'activation marketing reste soumise à D1–D7 dans ACTIVATION-V2.

Retour arrière préparatoire : conserver le patch et son manifeste, restaurer seulement
les chemins du candidat après vérification d'éventuels changements ultérieurs. Après
une future fusion, préférer un revert ciblé au retour forcé de main ; il déclencherait
aussi Pages et nécessite la même décision de publication.

État : prêt pour revue d'intégration locale, pas fusionné ou activé. Hermes, autorité
réelle, livraison, comptes et CI distante restent non vérifiés. Aucun autre lot métier
ajouté pendant cette stabilisation.
