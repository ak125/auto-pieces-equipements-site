# Références officielles consultées le 2 octobre 2026

## Format et permissions

- [Skills Codex](https://developers.openai.com/codex/skills/), redirection officielle
  vers [Build skills](https://learn.chatgpt.com/docs/build-skills) : frontmatter name/description,
  découverte projet dans .agents/skills ; doublons non fusionnés. Vérification réelle
  locale complémentaire avec Codex 0.159.0.
- [Sécurité Codex](https://developers.openai.com/codex/security/), redirection vers
  [Codex Security](https://learn.chatgpt.com/docs/security) : ne pas confondre revue du code
  et permissions d'exécution. La page demandée a été consultée, sans déduire une capacité
  ou un droit supplémentaire dans la session.
- [Skills Hermes](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) :
  découverte projet .hermes/skills et .agents/skills, confiance explicite, priorité
  projet/local/externe, répertoires externes potentiellement modifiables. Ces possibilités
  documentées doivent être rapprochées de la version réellement installée avant activation.
  Aucun Hermes n'a été testé.

## Canaux retenus

- [Gérer les avis Google](https://support.google.com/business/answer/3474050?hl=fr) :
  réponse depuis l'établissement validé, examen par Google ; soumission et publication
  restent des preuves distinctes.
- [Place Details Legacy](https://developers.google.com/maps/documentation/places/web-service/legacy/details) :
  source de lecture utilisée par le helper existant, pas un droit de réponse.
- [Politique de contenu Google Maps](https://support.google.com/contributionpolicy/answer/7400114?hl=fr) :
  règles de contributions réelles, absence de manipulation et de contrepartie.
- [Prospection électronique, CNIL](https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique-sms-mms-et-automate-dappel) :
  distinguer particuliers, professionnels et exceptions conditionnelles ; information,
  éligibilité et opposition doivent être établies. Une conversation WhatsApp seule ne
  documente pas ces conditions. Le candidat ne décide pas d'une base juridique à partir
  d'une donnée inconnue et n'importe aucun contact.

Ces références éclairent les procédures ; elles ne prouvent aucun accès aux comptes,
expéditeur authentifié, consentement, livraison d'email ou compatibilité automobile.

## Vérifications complémentaires V2 — 2 octobre 2026

- [Agent Skills specification](https://agentskills.io/specification) : métadonnées
  versionnées, nom/description, références relatives ; quatre sources canoniques conservées.
- [Hermes tâches planifiées](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron) :
  contexte détaché par défaut, workdir absolu explicite ; une CLI testée n'établit pas
  le contexte gateway/cron. Aucune tâche créée, aucun argument supposé disponible localement.
- [Hermes skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) :
  confiance projet enregistrée dans le profil ; aucune activation dans ce mandat,
  scanner et quarantaine non contournés.
- [WhatsApp Business policy](https://whatsappbusiness.com/policy/) : opposition respectée,
  templates approuvés hors fenêtre de service de 24 heures ; contrat candidat testé,
  aucun compte/API ou tarification vérifiés.
- [Google Business Profile review data](https://developers.google.com/my-business/content/review-data) :
  opérations de lecture et réponse liées aux comptes/établissements et autorisations.
  L'existence de cette API ne raccorde pas le diagnostic Places du dépôt.
- [Gmail sender guidelines](https://support.google.com/mail/answer/81126?hl=fr) :
  authentification, alignement, désabonnement et réputation sont des contrôles distincts ;
  audit local d'observations, aucun DNS ou résultat de délivrabilité revendiqué.
- [CNIL prospection électronique](https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique-sms-mms-et-automate-dappel) :
  distinctions de destinataires/finalités, preuves et oppositions à établir pour le canal.
  Le moteur local n'est pas un avis juridique ni une règle universelle d'éligibilité.

Les SDK et documentations de fournisseurs non choisis ne sont pas utilisés pour inventer
une intégration. Leur vérification devient obligatoire au raccordement concret.
