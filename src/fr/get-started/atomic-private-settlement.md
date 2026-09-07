---
translation_locale: fr
translation_source: /get-started/atomic-private-settlement.md
translation_source_hash: 7f36336e2ddf76514b36aac820246db6a67fb609b97c527e28f0b32c5deb145f
translation_status: machine-validated
translation_engine: bing-translator-llm
---

# Exécuter le règlement des transactions financières cross-dataspace atomiques et privées {#run-atomic-private-cross-dataspace-settlement}

`AtomicPrivateSettlementV1` coordonne une partie confidentielle de transfert financier dans chacun des 2 à 255 SORA Nexus espaces de données et finalise chaque partie de transfert financier dans un état global transaction. Un lot rejeté, expiré ou avorté n'applique aucune partie de transfert financier. Transparent Native AMX DvP/PvP reste un chemin de protocole séparé.

::: warning Statut de publication
Cette fonctionnalité est régie, désactivée par défaut et pas encore qualifiée pour la production. Ne l'activez pas pour une valeur réelle CBDC tant que la fonctionnalité publiée La confidentialité, la faute, la performance, la construction reproductible, la revue cryptographique indépendante et les étapes de publication des artefacts ont toutes été franchies pour la version exacte.
:::

## Ce que le protocole cache {#what-the-protocol-hides}

Chaque partie d'un transfert financier utilise une preuve de note privée fixe à deux entrées et trois sorties. Les validateurs du comité vérifient la preuve et une transition d'état opaque ; ils ne reçoivent pas les parties en clair, l'actif, le montant, le mémo ou le résultat commercial. Un auditeur local autorisé déchiffre la capsule d'audit remplie, vérifie ces contenus et signe une approbation à usage séparé. La politique par défaut accepte une approbation provenant de l'ensemble des auditeurs régis.

L'enregistrement de la transaction et du résultat du protocole du conteneur public révèle délibérément :

- les identifiants de réseau et de paquet
- routes de l’espace de données des participants et nombre de participants
- hauteurs de synchronisation et d'expiration
- identifiants de groupe de données de protocole opaques stables, racines, nullificateurs, valeurs d'engagement cryptographique et emplacements de texte chiffré fixes
- principes d'autorisation du comité et disponibilité exacte de 3 sur 4, Préparer, et certificats de finalisation du protocole
- parrain, frais de réseau public et état du terminal

Il s'agit de la confidentialité du contenu, pas de l'anonymat du flux de trafic. Le moment, le nombre de participants, l'identité de l'espace de données et l'activité du pool stable restent publics. Un espace de données qui héberge un seul CBDC peut également rendre l'actif inférable à partir de l'itinéraire même si aucun identifiant d'actif littéral n'est publié.

Chaque sortie chiffrée fixe publie un identifiant `recipient` dérivé de sa clé de vue de sortie unique autorisée. Les trois identifiants dans une partie de transfert financier doivent être distincts ; l'enregistrement complet de la barrière Prepare et du résultat du protocole étend cette vérification à toutes les parties du transfert financier. Avant de voter Préparer, chaque validateur de comité rejette également un identifiant déjà présent dans le WSV finalisé. La finalisation globale applique la même règle à l'ensemble de l'historique des lots finalisés avec un index de destinataire déterministe. L'index est exclu des charges utiles de vue de données à un instant donné et reconstruit à partir de sorties chiffrées standard de protocole unique lors de la restauration, de sorte que les doublons persistants échouent en fermeture. Ceci est un identifiant unique et une limite de répétition, et non une garantie qu'un expéditeur malveillant ou un observateur du réseau ne peut pas corréler le trafic avant la publication.

## Exigences de déploiement {#deployment-requirements}

Avant l'activation, les opérateurs ont besoin de tout ce qui suit :

1. exactement quatre validateurs pour chaque espace de données participant, avec des clés de consensus BLS distinctes et des preuves de possession
2. obligatoire Sumeragi DA/RBC activé pour chaque hauteur
3. un groupe de données de protocole de règlement de transaction financière confidentielle gouverné et racine initiale dans chaque espace de données
4. une capacité de note privée active V1 et le profil de preuve de règlement de transaction financière distinct
5. au moins un `PrivateSettlementAuditPolicyV1` local gouverné, incluant la signature d'auditeur distincte et les clés de chiffrement hybride, une époque de clé, la validité en hauteur et un seuil d'approbation
6. suffisamment de stockage d'enregistrements auxiliaires privés pour la période de conservation configurée
7. un compte de sponsor neutre capable de soumettre la transaction finale du conteneur public

Un auditeur peut également exploiter un validateur, mais doit utiliser des clés distinctes pour le consensus, la signature d'auditeur et le chiffrement d'auditeur. Conservez les clés de déchiffrement mises hors service pendant la période de conservation réglementaire, ou gérez et testez le reconditionnement des capsules avant de les mettre hors service.

Le principe d'autorisation à quatre validateurs est ancré dans l'état, et non fourni par le client. Au `authority_context_height` du manifeste technique, chaque validateur résout la liste exacte et ordonnée des voies/espaces de données et l'incarnation de la voie d'exécution active à partir de l'état de consensus, et exige que la hauteur résolue corresponde, et vérifie les quatre clés BLS et les preuves de possession. Le téléchargement, la préparation et l'enregistrement du résultat final du protocole utilisent tous ce même principe d'autorisation historique.

La barrière Prepare, le lot de finalisation du protocole final et le registre des résultats du protocole partagent un catalogue principal d'autorisation compact à deux niveaux. Ses `rosters` contiennent des identités de validateur sans itinéraire et des preuves de possession BLS alignées. dédupliqué dans l'ordre d'utilisation initiale standard du protocole unique. `leg_roster_indices[i]` sélectionne la liste pour la partie transfert financier du manifeste technique `i`. Le certificat de phase `authority_catalog_index` reste l'ordinal du manifeste logique, et non l'indice de la liste. Avant la digestion d'autorité ou la vérification QC, les validateurs combinent l'incarnation exacte de l'itinéraire et de la voie d'exécution active de cette partie technique de transfert financier avec la liste sélectionnée pour reconstruire le `PrivateSettlementCommitteeAuthorityV1` lié à l'itinéraire.

## Configurer l'admission {#configure-admission}

Tout comportement de production provient de la configuration du nœud. Les variables d'environnement ne peuvent pas activer ce chemin. La valeur par défaut fournie est `enabled = false` ; laisser la fonctionnalité désactivée ne nécessite aucune configuration spécifique au règlement.

Après que la gouvernance a enregistré la capacité requise et choisi une hauteur d'activation avec un préavis adéquat, configurez chaque nœud pertinent de manière cohérente :

```toml
[nexus.atomic_private_settlement]
enabled = true
activation_height = 500000
minimum_activation_notice_blocks = 7200
proof_profile_version = 1
max_participants = 255
max_expiry_blocks = 7200
audit_timeout_blocks = 1200
prepare_timeout_blocks = 1200
commit_timeout_blocks = 1200
capsule_padding_classes_bytes = [4096, 16384, 65536, 262144]
max_proof_bytes = 8388608
max_capsule_bytes = 1048576
max_carrier_bytes = 4194304
sidecar_retention_blocks = 1000000
sidecar_max_records = 256
sidecar_max_total_bytes = 3221225472
default_min_auditor_approvals = 1
permitted_policy_versions = [1]
```

L'exemple utilise les limites V1 livrées, et non une recommandation de performance. Mesurez le stockage, la preuve, la capsule, la transaction de conteneur et les conteneurs de données de latence sur le matériel prévu avant de choisir les limites opérationnelles. Les délais d'attente des trois phases doivent tenir à l'intérieur de `max_expiry_blocks`, et la conservation des enregistrements auxiliaires doit être au moins égale à cette période d'expiration.

`max_capsule_bytes` limite l'encodage d'un seul protocole standard Norito de l'ensemble `PrivateSettlementAuditCapsuleV1` : AAD, valeur de nonce cryptographique, texte chiffré, structuration vectorielle, identités des auditeurs, et chaque ligne emballée-DEK. Ce n'est pas une limite réservée uniquement au texte chiffré. Chaque classe de rembourrage configurée doit s'adapter au conteneur de données à capsule entière conservateur pour au moins `default_min_auditor_approvals` auditeurs. Torii rejette également un nouveau politique admise dont `min_approvals` est en dessous du plancher applicable, et rejette toute capsule réelle dont l'encodage complet conforme au protocole unique est trop volumineux.

`max_carrier_bytes` limite la transaction complète conforme à un protocole unique et signée par le sponsor, pas seulement le lot certifié. Le décompte inclut l'instruction enregistrée encadrement, principal et métadonnées d'autorisation de transaction, intention de frais et signature. Les limites ordinaires des transactions réseau s'appliquent toujours comme limite supérieure indépendante.

L'activation échoue en position fermée à moins que la capacité régie ne soit active, que son état et ses hauteurs d'activation satisfassent la période de préavis, que le profil de preuve compilé corresponde à V1, et que le groupe de données du protocole en chaîne et les dossiers d'audit soient à jour. Activer le seul indicateur de configuration est insuffisant.

## flux de travail de règlement des transactions financières {#settlement-workflow}

Le client construit des preuves et des capsules chiffrées localement. Les témoins secrets doivent rester dans le portefeuille natif ou le travailleur natif ; ne les sérialisez pas dans les journaux d'application, les objets Python, les requêtes HTTP ou les enregistrements de coordination durables.

Les données authentifiées encapsulées et par auditeur DEK-wrap incluent la valeur du digest cryptographique de l'état exact ancré du comité et `authority_context_height`, ainsi que le réseau, la route/incarnation, lot, partie de transfert financier, politique, époque clé et valeur d'engagement cryptographique en texte clair. Une clé encapsulée ne peut pas être déplacée vers un autre registre ou contexte de principal d'autorisation historique.

Pour chaque partie de transfert financier conforme à un protocole unique, le coordinateur exécute ensuite cette séquence :

1. Téléchargez le matériel chiffré provisoire sur les quatre validateurs et obtenez un seul certificat de disponibilité exact 3-sur-4 conforme au protocole.
2. Faites en sorte qu'un auditeur autorisé récupère sa capsule avec la demande authentifiée `POST` décrite ci-dessous, la décrypte, recalculer les liaisons publiques, applique la politique locale et soumette une approbation. L'accès à la capsule après une rotation de politique est uniquement en lecture : un successeur actuel peut autoriser une lecture historique éligible, mais il ne peut pas ajouter une approbation à une partie de transfert financier préparée sous l'ancienne politique.
3. Demander de préparer les votes des quatre validateurs. Chaque validateur vérifie de manière indépendante et enregistre de manière durable le delta avant de voter. Conserver le certificat Prepare unique conforme au protocole 3 sur 4 sur chaque répondeur mis en scène.
4. Après chaque transfert financier, chaque partie possède un certificat Prepare, construisez la barrière complète Prepare immuable. Demandez et conservez les certificats de finalisation du protocole unique 3-sur-4 conforme au protocole. Si le coordinateur redémarre, interrogez les nœuds participants pour leurs certificats de préparation et de finalisation de consensus durables localement, sélectionnez un seul certificat équivalent à un quorum conforme au protocole et redistribuez-le avant de continuer ; ne reconstruisez jamais un certificat à partir d'un cache local non authentifié.
5. Faites signer et soumettre par le sponsor du manifeste technique exactement une transaction de conteneur global. La transaction de conteneur contient une instruction `FinalizeAtomicPrivateSettlementV1` et le lot certifié complet exact. Le coordinateur et WSV mesurent en pré-contrôle l'instruction de finalisation complète effacée par type, y compris l'encadrement de l'instruction enregistrée. Torii et la liaison de transaction du conteneur à usage unique central appliquent `max_carrier_bytes` sur la transaction standard unique signée par le sponsor selon le protocole exact, y compris le principal d'autorisation, les métadonnées, l'intention de frais et la signature. Torii rejette une transaction de conteneur avant son contexte de principal d'autorisation, à ou après la dernière hauteur d'entrée susceptible d'atteindre la finalité par expiration, ou au-delà de la période d'expiration régie.
6. Interrogez le statut du paquet public et l’enregistrement du résultat du protocole jusqu’à la finalité globale. Considérez l’état de l’enregistrement auxiliaire local comme provisoire jusqu’à ce qu’il se réconcilie avec cet enregistrement terminal global immuable.

Le client Rust expose ce flux par le biais de méthodes incluant `certify_and_upload_private_settlement_legs_v1`, `prepare_private_settlement_bundle_v1`, `commit_private_settlement_bundle_v1` et `submit_private_settlement_bundle_v1`. La coordination sécurisée au redémarrage utilise `recover_or_prepare_private_settlement_bundle_v1` et `recover_or_commit_private_settlement_bundle_v1`. Les invocations techniques du comité et de l'auditeur nécessitent des identifiants de rôle explicites ; elles ne réutilisent pas le signataire cryptographique du compte ordinaire.

## Faire tourner une politique d'auditeur en toute sécurité {#rotate-an-auditor-policy-safely}

Utilisez l'instruction `RotatePrivateSettlementPoolPolicyV1` autorisée par la gouvernance de la confidentialité. Elle doit indiquer la valeur exacte actuelle du condensé cryptographique de la gouvernance, conserver le même itinéraire, groupe de données du protocole et valeur d'engagement cryptographique lié à l'actif, et avancer la révision de la gouvernance d'un cran. utilisez une époque de clé strictement plus récente et des résumés cryptographiques de politique/gouvernance différents, et activez au bloc qui contient la rotation. Le groupe de données du protocole frontier, racines, nullificateurs, sorties, Les ensembles de relecture et les enregistrements de résultats de protocole finalisés sont conservés. N’incluez pas un enregistrement de résultat de protocole concernant cette même route/pool à la hauteur d’activation de la rotation ; l’instruction rejette cette limite.

La projection du groupe de données du protocole public conserve l'ensemble de la lignée des révisions de politique remplacées. Un enregistrement de résultats de protocole finalisé avant la rotation reste donc valide en tant que preuve historique après le redémarrage. tandis que la relecture de ce même enregistrement de résultat de protocole est rejetée de manière déterministe sans mutation d'état. La lignée n'autorise pas le travail inachevé : tout paquet de vieille politique qui franchit la frontière d'activation échoue de manière clôturée avant les changements d'état globaux. Une politique successeur peut autoriser la lecture d’une capsule historique conservée uniquement lorsqu’elle appartient à la même lignée de politique qu’une révision de gouvernance ultérieure et une époque de clé, et la clé de signature actuelle authentifiée correspond à la même identité d'auditeur stable dans la politique historique et la liste enveloppée-DEK. La capsule reste chiffrée avec la clé de l'auditeur historique : conservez cette clé de déchiffrement historique exacte pour l'ouvrir, ou effectuez un reconditionnement de capsule gouverné et testé avant de détruire la clé. Cet accès de rétention ne permet pas à la politique actuelle/rotative d'ajouter une approbation sous l'ancienne politique préparée.

## Torii famille de route {#torii-route-family}

Ces routes utilisent des objets de requête et de réponse à protocole unique standard Norito. Les réponses authentifiées et restreintes utilisent un comportement de cache privé `no-store`.

|Opération|Méthode et chemin|Principal|
| ------------------ | -------------------------------------------------------------------------- | --------------------------- |
|Télécharger la partie du transfert financier| `POST /v1/nexus/private-settlements/legs`                                  |signature de compte standard unique de protocole|
|Partage de disponibilité| `POST /v1/nexus/private-settlements/legs/availability-shares`              |signature de compte standard unique de protocole|
|Préparer le vote| `POST /v1/nexus/private-settlements/phases/prepare-votes`                  |signature de compte standard unique de protocole|
|vote de la phase de finalisation| `POST /v1/nexus/private-settlements/phases/commit-votes`                   |signature de compte standard unique de protocole|
|Phase de persistance QC| `POST /v1/nexus/private-settlements/phases/certificates`                   |signature de compte standard unique de protocole|
|Phase de récupération QCs| `GET /v1/nexus/private-settlements/legs/{payload_digest}/phase-certificates` |parrain du manifeste technique|
|statut de la partie du transfert financier| `GET /v1/nexus/private-settlements/legs/{payload_digest}/status`           |signature de compte standard unique de protocole|
|preuve du comité| `GET /v1/nexus/private-settlements/legs/{payload_digest}/committee-proof`  |validateur de liste exacte|
|Audit capsule| `POST /v1/nexus/private-settlements/legs/{payload_digest}/audit-capsule`   |auditeur régulé|
|Approbation de l'auditeur| `POST /v1/nexus/private-settlements/legs/{payload_digest}/audit-approvals` |auditeur régulé|
|Soumettre final/annuler| `POST /v1/nexus/private-settlements/bundles`                               |parrain du manifeste technique|
|Statut du paquet| `GET /v1/nexus/private-settlements/bundles/{bundle_id}`                    |publique|
|enregistrement du résultat du protocole ou abandon| `GET /v1/nexus/private-settlements/bundles/{bundle_id}/receipt`            |publique|

Le statut public et l'enregistrement des résultats du protocole APIs ne dévoilent que les champs publics documentés. En particulier, le statut des parties ordinaires de transfert financier ne révèle pas l'approbation. comptes ou le seuil d'audit contrôlé. Les lectures restreintes regroupent intentionnellement les documents manquants, non autorisés et expirés pour conservation dans la même classe de réponse indisponible.

L'opération audit-capsule est une `POST` à lecture seule liée à l'identité, et non une `GET`. Son corps de requête Norito JSON signé est exactement `{"audit_policy": <PrivateSettlementAuditPolicyV1>}` : la politique gouvernée complète actuelle constitue la preuve d'autorisation, et non le principal d'autorisation fourni par le client. Le nœud lie l'historique de la capsule `audit_policy` à la révision de gouvernance en vigueur à la manifestation technique `authority_context_height`, lie la politique actuelle ou successeur demandée à la révision en vigueur à la hauteur de lecture faisant autorité pour le nœud, et cartographie la clé de signature authentifiée à travers l'identité d'auditeur stable partagée par les deux politiques. La réponse authentifiée renvoie l'historique `audit_policy` et la politique exacte utilisée pour l'accès comme `access_audit_policy`, et l'attestation du répondant lie les deux. Les clients doivent exiger que `access_audit_policy` soit égal à la politique envoyée dans la demande.

La route de soumission accepte exactement une instruction de finalisation ou d'abandon signée directement par le sponsor. Sa réponse `202` contient uniquement l'ID du bundle, la hauteur d'admission observée et le hash cryptographique de la transaction du container ; elle ne prétend pas qu'un abandon en file d'attente soit déjà final. Les SDKs exigent que les deux identifiants soient des littéraux Norito `Hash` JSON à somme de contrôle standard du protocole unique et que la hauteur soit un entier non signé exact de 64 bits ; Les champs manquants, supplémentaires, mal saisis, non conformes au protocole unique, avec somme de contrôle invalide, négatifs, négatif-zéro, fractionnaires ou ayant subi un débordement échouent en mode fermé. Utilisez l'état du paquet ou l'enregistrement du résultat du protocole pour connaître l'état terminal officiel. Le code d'état est également exact : cette route d'admission de transaction de conteneur nécessite `202`, tandis que chaque autre réponse de succès de règlement privé V1 nécessite `200`. Les clients rejettent les codes alternatifs réussis `2xx` comme une dérive de contrat sans répercuter le corps de réponse inattendu à travers les erreurs client. Ils exposent uniquement un code de rejet serveur lorsqu'il correspond à `[A-Za-z0-9_.:-]{1,128}` et éliminer les causes liées au parseur/à la validation des réponses, empêchant le contenu du corps ou les noms de champs JSON choisis par l'attaquant de réapparaître via des journaux conscients des causes.

## Échec et récupération {#failure-and-recovery}

Approbations d'auditeur manquantes ou obsolètes, moins de trois votes de validateurs, racines ou époques incorrectes, nullificateurs dupliqués, preuves ou capsules substituées, financières non canoniques le transfert de commandes partielles, les lots périmés et les conditions de remboursement incompatibles échouent tous avant la mutation globale. les certificats de finalisation de consensus ne modifient jamais l'état privé.

Les validateurs fsync les enregistrements auxiliaires, les deltas mis en scène et les certificats de phase avant de les confirmer. Au redémarrage, ils reconstruisent les réservations à partir d'enregistrements durables standard du protocole unique, puis réconcilient les enregistrements de résultats globaux immuables du protocole, les marqueurs d'abandon ou les expirations. Le réconciliateur supervisé exécute également l'élagage de la rétention terminale à la hauteur autoritaire observée de manière synchrone même lorsqu'il n'y a aucun candidat terminal à réconcilier, et il se ferme en cas d'erreur de taille. Seul un enregistrement terminal global autoritaire libère les verrous mis en attente. La relecture exacte de l'enregistrement du résultat du protocole finalisé et la relecture conflictuelle sont toutes deux rejetées de manière déterministe sans mutation d'état.

L'identité de réservation inclut l'itinéraire complet. Les chefs de groupe de données de protocole utilisent `(route, pool_id, epoch, root)`, les annulateurs utilisent `(route, pool_id, nullifier)`, et les sorties utilisent `(route, pool_id, commitment)`. Les valeurs opaques égales sur un autre itinéraire sont indépendantes ; une collision d'itinéraire exact reste verrouillée après un redémarrage.

Les alertes opérationnelles ne doivent utiliser que les champs de bundle opaque, de route, de phase, de valeur de résumé cryptographique, de hauteur et de classe de raison. Ne jamais placer de capsules décryptées, d'identifiants de compte ou d'actifs, de montants, de mémos, de données de vue, de témoins de preuve ou de charges utiles de parseur dans les journaux, les événements, les étiquettes de métriques ou les intervalles de traçage.

## Qualification avant la valeur réelle {#qualification-before-real-value}

Pour la version et la configuration exactes que vous avez l'intention de déployer, archivez les preuves couvrant :

- preuve conflictuelle, capsule, politique, rotation des clés, remboursement et cas de lecture répétée
- véritables processus à quatre validateurs pour 2, 3, 4, 8 et 16 espaces de données, incluant les redémarrages de validateurs et de coordinateurs, la perte de messages authentifiée de 5 %, 10 % et 20 %, les partitions de phase, la récupération et les plantages aux limites de persistance
- canari et analyse des fuites différentielles à travers Torii, P2P, blocs, Kura, vues de données ponctuelles, requêtes, événements, journaux et télémétrie
- au moins cinq échauffements et trente lots mesurés par nombre de participants du réseau réel, avec p50, p95, p99, intervalles de confiance, ressources, trafic, tailles des enregistrements de preuves et résultats de protocole, et AMX transparent comme contrôle
- tests stricts de l'espace de travail, vérifications lint et de format, graines aléatoires, soak, builds reproductibles, SBOMs, et hachages cryptographiques des artefacts signés
- les deux couches formelles : les vérifications de symétrie du nombre de pattes 3/255 et le comité exact de quatre validateurs indexé N=2 axé sur le validateur plus les configurations de défaut entièrement bornées, N=3 papier-principal, N=4 propre, et N=3 expiration/rejeu, avec des budgets de défaut indépendants par comité
- révision indépendante de la relation de preuve, des sélecteurs de slots factices, des liaisons d'actifs et de capsules, de la relation de remboursement, de la cryptographie et de la machine à états inter-espaces de données

Publiez les preuves brutes et assainies, le modèle de menace, l’argument du protocole, les limitations, les identifiants de révision du code source, la description du matériel et les rapports d’audit dans un artefact immuable DOI soutenu. Les tests de dépôt seuls ne transforment pas la fonctionnalité en un système de règlement des transactions financières CBDC qualifié pour la production.

À partir du checkout final propre Iroha, générez l'inventaire source de la version et scellez-le dans une racine de bundle préexistante en dehors de ce checkout :

```sh
python3 scripts/private_settlement_source_evidence.py \
  --repository-root . \
  --bundle-root /absolute/path/to/release-bundle
```

Le producteur échoue sur les fichiers mis en scène, non mis en scène, non suivis ou non fusionnés et sur toute modification de source pendant la capture. Il conserve l'objet de révision du code source brut, l'inventaire de l'arbre Git à protocole unique, la liste exacte des chemins binaires, le sceau de source déterministe et `Cargo.lock`; inclure chaque déclaration d'artifact provenant de son résultat JSON dans le manifeste technique final de la version. Cela ne dispense pas du vérificateur de bundle final DOI ni d'aucune étape de validation externe de la version.

Le sceau source est portable et ferme en cas de défaut : le producteur et le vérificateur final résolvent l'ensemble du graphe de liens symboliques archivé, donc un lien qui semble être à la racine mais qui s'échappe par un autre lien, un cycle, une traversée `.git` ou une cible de style Windows est rejeté avant que les liens ne soient créés. Les rapports structurés de source et de passerelle ne sont analysés qu'à partir de fichiers stables délimités dont la valeur de résumé cryptographique et la longueur correspondent au manifeste technique de publication, et chaque type de charge utile source doit apparaître exactement une fois.

Chaque échantillon brut de défaillance et de latence doit lier la révision complète du code source de la version, le SHA-256 d'une description matériel fixée et structurée, et le SHA-256 de sa configuration exacte du nombre de participants. Archiver un unique manifeste technique de configuration standard de protocole couvrant N=2,3,4,8,16 ; chaque entrée doit référencer les octets de configuration retenus et déclarer exactement quatre validateurs par espace de données, un quorum de 3 sur 4, et des RS16 DA/RBC signés obligatoires. Le vérificateur de version rejette les résumés produits sur une version, un profil matériel ou une configuration réseau différente. Chaque perte individuelle, coupure de phase et ligne de crash de persistance doit en outre nommer des références de fichiers exactes JSONL globalement non réutilisables à l'intérieur des limites de SHA-256 artefacts d'authentification du contrôleur et de capture d'atomicité. Le vérificateur de version résout ces digests cryptographiques et exige que les lignes correspondent à l'identité de l'exécution, à l'indice de l'essai et aux paramètres, à l'accusé de réception du contrôleur ou au résultat de récupération, au nombre de vérifications continues, et aucune observation de visibilité partielle ni de capacité de dépense. Les comparaisons p95/p99 publiées plus tard rejettent également une base signée dont le matériel, les configurations ou les exigences de mesure diffèrent du candidat. Le vérificateur final régénère tous les centiles signalés, MADs, et les intervalles de confiance déterministes à partir des échantillons bruts archivés au lieu de se fier à un résumé de benchmark détaché. Il recharge également le manifeste technique canari et rescane indépendamment chaque surface de confidentialité archivée, de sorte qu’un rapport ne peut pas supprimer une détection de secret implantée après le rebondissement des digests cryptographiques des fichiers. Chaque exécution réservée aux secrets doit conserver son pcap de bouclage non filtré réservé au propriétaire, son tcpdump brut sur stderr et ses statistiques sans pertes, son manifeste technique de port standard à protocole unique, son archive de source restreinte empaquetée, et toutes les observations d'atomicité entre pairs. Le vérificateur final relance la répartition des paquets liés aux ports, les projections de source et les vérifications d'atomicité de la ligne de base au terminal à partir de ces octets archivés plutôt que de se fier aux résumés publiés.

L'archive doit également inclure un nombre unique de trafic apparié standard de protocole et des manifestes techniques de paires différentielles liant les chemins de fichiers gauche et droit exacts, les types, les longueurs en octets et les empreintes cryptographiques SHA-256 pour chaque surface de confidentialité requise. Ses racines déclarées doivent contenir exactement l'inventaire d'archives apparié. Le vérificateur exige des tailles de fichiers entières égales et des formes publiques JSON pour les surfaces ordinaires. La capture en boucle brute portant l'entropie et l'archive source restreinte empaquetée sont des exceptions de taille explicites ; elle compare plutôt le type de lien de paquet et les longueurs par paquet, les identités de source restreinte, et les longueurs de ligne à forme fixe. Chaque demande/réponse Torii, paquet public/restreint P2P, bloc, requête, événement, journal et comptage du trafic de télémétrie doivent également correspondre. Un changement de forme de paquet, une fuite structurelle de même taille, une fausse revendication de provenance, ou un fichier non apparié ne peut pas être caché en réécrivant le rapport de fuite et ses hachages cryptographiques.
