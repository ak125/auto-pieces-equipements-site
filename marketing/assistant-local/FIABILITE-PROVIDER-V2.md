# Historique des envois simulés — 2 octobre 2026

Correction locale de simulateProvider dans scripts/marketing/operations.mjs,
branche codex/ape-marketing-skills-20261002, base
3756cba51edff2f280555bab13872edc72efde52.

## Cause et comportement corrigé

La conversion permissive de prior en tableau assimilait un historique absent à
un historique vide. La recherche de la première clé correspondante ignorait ensuite
les autres lignes, leurs éventuelles contradictions et les espaces périphériques.
Une action mal formée produisait aussi rejected, présenté comme un rejet fournisseur
valablement simulé par la CLI.

Le contrôle porte maintenant sur toute l'entrée avant de calculer un résultat :

- Historique explicite, limité à 1000 lignes ; états et clés reconnus obligatoires.
- Clés et identifiants fournisseur normalisés comme lors de leur validation.
- Doublons concordants dédupliqués ; contradictions d'état ou de fournisseur
  bloquantes, indépendamment de l'ordre des lignes.
- Une information fournisseur connue n'est pas effacée par un doublon sans cette
  information. Un identifiant fourni mais mal formé bloque l'entrée.
- Une clé pending/uncertain exige un rapprochement ; toute autre clé déjà connue
  reste un doublon. Aucun retry n'est autorisé, même après rejet ou quota.
- Une action invalide reste distincte d'un rejet demandé par la simulation.

Le [contrat](CONTRAT-V2.md) précise que prior est un instantané fourni, pas un
journal ordonné de transitions. Sans chronologie authentifiée, accepted puis
processed pour une même clé ne permettent pas de choisir le dernier état.

La [nouvelle recette](recette-v2/provider-test.json) fournit une clé incertaine avec
espaces : une demande outcome=accepted retourne bien reconcile-required, sans
nouvel envoi. Commande dans le [guide de recette](recette-v2/README.md).

## Vérifications ciblées

Sept tests ajoutés dans
[marketing-provider-history.test.mjs](../../tests/marketing-provider-history.test.mjs) :
six régressions rouges avant correction et un contrôle positif déjà vert ; sept
tests verts après correction. Les cas couvrent collection absente ou mal formée,
limites 1000/1001, identités, permutations, conflits, résultats valides et processus
CLI réels. Typage marketing strict réussi. Recette exécutée avec sortie enregistrée.

Validation complète actuelle : **npm test standard 279/279**, dont **132 tests
marketing**, sous Node 24.21.0/npm 12.0.2. Contrôles des dépendances, typages site,
build et validation inclus. 11 pages catalogue générées, 12 pages SEO validées,
31 fichiers publics identiques en contenu à la base ; source/dist identiques avant
restauration des seules fins de ligne générées. Le correctif HTTP antérieur est
préservé. Les 272/272 du lot précédent restent une preuve historique.

Les codes CLI restent distincts : 1 pour entrée invalide ou contradictoire ;
0 pour calcul valide, y compris rejected, quota, uncertain, duplicate et
reconcile-required. Aucun de ces codes n'affirme une livraison réelle.

Logs ignorés dans tmp/marketing-evidence : provider-red.log, provider-green.log,
provider-typecheck.log, provider-fixture.json et provider-full.log. Sauvegarde avant
lot : provider-before/operations.mjs ; comparer les changements ultérieurs avant
tout retour arrière. Les rapports précédents sont conservés comme preuves historiques.

## Portée et limites

Aucun transport, registre durable, verrou concurrent ou adaptateur fournisseur
n'est ajouté. L'exhaustivité et la provenance de prior ne peuvent pas être prouvées
par la seule forme du tableau. Les simulations restent locales et synthétiques.

Les quatre skills, le renderer, les dépendances et le site public sont inchangés.
Découverte Codex et preuve mobile antérieures réutilisables ; invocation agent
historique, fonction corrigée non évaluée par agent. Hermes non testé. Aucune
activation, connexion, publication, dépense, programmation, push ou PR.
