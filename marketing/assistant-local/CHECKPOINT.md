# Checkpoint — corrections après recette Hermes, 3 octobre 2026

**Objectif.** Consolider la recette marketing V2 et corriger ses écarts locaux sans élargir l'activation.

**État.** Commit intégré `1345111aa109f6f134b5b82ca67e178c104ec0cf`. Checkout VPS `/home/hermes/workspaces/ape-marketing-recette-1345111`, propre. Profil natif `ape-marketing-recette`, compte hermes UID 1001, Astra/high, runtime 0.21.5+4911.g6ec0520.dirty. Confiance limitée au checkout ; quatre skills 2.0.0 et quatre scans safe. Authentification native réutilisée sans copie de jeton.

**Configuration.** `platform_toolsets.cli` sélectionne skills/terminal/no_mcp ; sélection effective vérifiée. Le champ historique toolsets était insuffisant : première passe arrêtée, puis reprise en session neuve. Protections conservées, aucun gateway ou cron de recette activé. Profil actif et unité systemd inchangés, gateway toujours actif.

**Preuves.** Session métier `20261003_065119_f12ea8` : onze commandes fictives code 0, huit tests ciblés verts. QR depuis prepare.json bloqué code 1 ; qr.json réussit. Hors projet `20261003_065726_3acd04` : seul skills_list appelé, exclusions AutoMecanik/Alliance et clarification du projet absent. Traces complètes et manifeste dans tmp/marketing-evidence/hermes-20261003.

**Limites Hermes.** Deux scripts inline refusés ; variantes via tests existants. Avis déjà répondu testé sur son propre cas synthétique dans cette session. Typage VPS non réalisé : tsc absent, code 127 ; aucune dépendance installée. La CI intégrée reste une preuve séparée. Aucun effet marketing réel.

**Changements locaux.** Branche codex/ape-recette-post-integration-20261003, checkout .codex/worktrees/ape-marketing-skills/auto pieces equipement codex (nom réel avec doubles espaces). capabilities remplace l'affirmation obsolète « Hermes non testé » par les références datées Hermes/Codex, sans certifier le runtime courant. Nouveau test CLI à partir du review.json canonique : sensible → human, déjà répondu → skip sans brouillon, version changée → recheck sans brouillon. Logique métier inchangée. EXECUTION-HERMES-V2 distingue ce complément local des preuves natives ; documents antérieurs préservés.

**Tests réutilisables.** Node 24.21.0/npm 12.0.2 : npm test complet 318/318, contrôles des dépendances, typages navigateur/serveur/marketing, build et validation 12 pages SEO/31 fichiers publics réussis. Log : tmp/marketing-evidence/integration-post-recette-full.log. HTML suivi identique après normalisation des fins de ligne générées. Ancien contrôle de 60 liens antérieur à ce lot. Preuves natives dans tmp/marketing-evidence/hermes-20261003 inchangées.

**Décision et suite, avant publication.** Intégration du candidat et des comptes rendus autorisée le 3 octobre : commit, PR vers main, contrôles du SHA puis fusion et vérification Pages par les workflows existants. Le résultat GitHub fera référence après cette préparation. Checkout Hermes conservé sur 1345111 ; sa mise à niveau n'est pas incluse. Ne pas rejouer PR #33 ni extrapoler vers gateway/cron ou activation D1–D6. Conserver le worktree et ses preuves ignorées.
