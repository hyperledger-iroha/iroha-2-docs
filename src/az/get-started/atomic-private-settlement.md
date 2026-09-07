---
translation_locale: az
translation_source: /get-started/atomic-private-settlement.md
translation_source_hash: 7f36336e2ddf76514b36aac820246db6a67fb609b97c527e28f0b32c5deb145f
translation_status: machine-validated
translation_engine: bing-translator-llm
---

# Atomik Şəxsi Çarpaz Məlumatlar Məkanında maliyyə əməliyyatı hesablaşmasını işlədin {#run-atomic-private-cross-dataspace-settlement}

`AtomicPrivateSettlementV1` hər biri 2-dən 255-ə qədər SORA Nexus məlumat sahəsində bir gizli maliyyə transferi hissəsini koordinasiya edir və hər maliyyə transferi hissəsini bir qlobal vəziyyətdə yekunlaşdırır əməliyyat. Reddedilmiş, müddəti bitmiş və ya dayandırılmış paket heç bir maliyyə köçürməsi hissəsi tətbiq etmir. Şəffaf Yerli AMX DvP/PvP ayrı bir protokol yolu olaraq qalır.

::: warning Buraxılış vəziyyəti
Bu xüsusiyyət idarə olunur, varsayılan olaraq söndürülür və hələ istehsal üçün uyğunlaşdırılmayıb. Çap olunmuş funksional olana qədər həqiqi CBDC dəyəri üçün onu aktiv etməyin, Məxfilik, səhv, performans, təkrarlana bilən quruluş, müstəqil kriptoqrafik nəzərdən keçirilmə və artefakt nəşri qapıları hər biri dəqiq buraxılış üçün keçilib.
:::

## Protokolun gizlətdiyi {#what-the-protocol-hides}

Hər maliyyə transfert hissəsi sabit iki girişi, üç çıxışı olan xüsusi qeydlər sübutundan istifadə edir. Komitə təsdiq ediciləri sübutu və qeyri-şəffaf vəziyyət keçidini yoxlayır; onlar aydın mətn tərəflərini, aktivləri, məbləği, qeydi və ya iş nəticəsini almırlar. Səlahiyyətli yerli auditor əlavə edilmiş audit kapsulunu deşifrə edir, həmin məzmunu yoxlayır və məqsəd üzrə ayrılmış təsdiqi imzalayır. Defolt siyasət tənzimlənən auditor dəstindən bir təsdiqi qəbul edir.

İctimai konteyner əməliyyatı və protokol nəticəsi qeydləri qəsdən açıqlayır:

- şəbəkə və paket identifikatorları
- iştirakçı məlumat sahəsi marşrutları və iştirakçı sayı
- vaxtlama və bitmə hündürlükləri
- sabit qeyri-şəffaf protokol məlumat qrupu identifikatorları, köklər, nullifikatorlar, kriptoqrafik öhdəlik dəyərləri və sabit şifr mətn qutuları
- komitə səlahiyyət prinsipləri və dəqiq 3-dən 4-ə mövcudluq, Hazırlıq və protokolun yekunlaşdırılması sertifikatları
- sponsor, ictimai şəbəkə haqqı və terminal vəziyyəti

Bu məzmunun məxfiliyidir, trafik axınının anonimliyi deyil. Vaxtlama, iştirakçı sayı, verilənlər məkanının kimliyi və sabit hovuz fəaliyyətləri ictimai qalır. Yalnız bir CBDC yerləşdirən bir verilənlər məkanı, heç bir əsl aktiv identifikatoru dərc edilməsə belə, aktivin marşrutdan çıxarılmasına imkan verə bilər.

Hər sabit şifrəli çıxış onun səlahiyyət verilmiş birdəfəlik çıxış baxış açarından əldə edilmiş `recipient` identifikatorunu yayımlayır. Bir maliyyə köçürməsinin hissəsindəki üç identifikator fərqli olmalıdır; tam Hazırlıq baryeri və protokol nəticəsi qeydiyyatı bu yoxlamanı bütün maliyyə köçürmə hissələrinə yayır. Səsvermədən əvvəl hazırlıq görərkən, hər komitə yoxlayıcısı həmçinin artıq yekunlaşdırılmış WSV-də mövcud olan bir identifikatoru rədd edir. Qlobal yekunlaşdırma, deterministik alıcı indeksi ilə yekunlaşdırılmış paket tarixçəsi boyunca eyni qaydanı tətbiq edir. İndeks nöqtə-vaxt məlumat görünüşü yükü payloadlarından çıxarılır və bərpa zamanı tək protokol-standart şifrələnmiş çıxışlardan yenidən qurulur, buna görə saxlanılan təkrarlamalar bağlı qalmır. Bu bir dəfəlik tanıma və təkrar oynatma sərhədidir, zərərli göndərici və ya şəbəkə müşahidəçisinin nəşrdən əvvəl trafiki əlaqələndirə bilməyəcəyinə zəmanət deyil.

## Quraşdırma tələbləri {#deployment-requirements}

Aktivləşdirmədən əvvəl operatorların bunların hamısına ehtiyacı var:

1. hər bir iştirak edən məlumat sahəsi üçün dəqiq dörd təsdiqedici, fərqli BLS konsensus açarları və sahiblik sübutları ilə
2. hər hündürlük üçün məcburi Sumeragi DA/RBC aktivləşdirildi
3. hər məlumat məkanında idarə olunan gizli maliyyə əməliyyatı hesablaşması protokol məlumat qrupu və ilkin kök
4. aktiv V1 şəxsi qeydlər qabiliyyəti və ayrı maliyyə əməliyyatlarının həll sübutu profili
5. ən azı bir idarə olunan yerli `PrivateSettlementAuditPolicyV1`, fərqli auditor imzası və hibrid şifrələmə açarları, açar dövrü, hündürlük uyğunluğu və təsdiq həddi daxil olmaqla
6. konfiqurasiya edilmiş saxlanma müddəti üçün kifayət qədər özəl əlavə qeyd saxlama
7. son ictimai konteyner əməliyyatını təqdim edə bilən neytral sponsor hesabı

Auditor həmçinin doğrulayıcı işlədə bilər, amma müstəqil konsensus, auditor-imzalama və auditor-şifrələmə açarlarından istifadə etməlidir. Lisenziyadan çıxarılan deşifrələmə açarlarını tənzimləyici saxlama müddəti ərzində saxlayın və ya onları lisenziyadan çıxarmadan əvvəl kapsulun yenidən qablaşdırılmasını idarə edin və test edin.

Dördlü doğrulayıcı səlahiyyət prinsipi dövlət tərəfindən təyin olunur, müştəri tərəfindən təmin edilmir. Texniki manifestin `authority_context_height` ünvanında, hər bir doğrulayıcı konsensus vəziyyətindən dəqiq sıralanmış xətt/veri məkanı siyahısını və aktiv icra xətti təzahürünü həll edir, həll edilmiş hündürlüyün uyğun olmasını tələb edir, və dörd BLS açarını və sahiblik sübutlarını təsdiqləyir. Yükləmə, Hazırlama və yekun protokol nəticəsi qeydi qəbulunun hamısı eyni tarixi səlahiyyət prinsipindən istifadə edir.

Hazırlıq baryeri, yekun protokolun yekunlaşdırma paketi və protokol nəticəsi qeydi tək bir kompakt iki səviyyəli avtorizasiya əsas kataloqunu paylaşır. Onun `rosters` marşrutsuz yoxlayıcı şəxsiyyətlərini və düzülmüş BLS mülkiyyət sübutlarını ehtiva edir, tək protokol-standart ilk istifadəsi sırası ilə təkrarsızlaşdırılmışdır. `leg_roster_indices[i]` texniki manifest maliyyə köçürməsi hissəsi üçün siyahını seçir `i`. Bir faza sertifikatının `authority_catalog_index` mənası loqikal manifest-leg sıra nömrəsi olaraq qalır, siyahı indeksi deyil. Səlahiyyətlərin xülasəsi və ya QC yoxlamasından əvvəl, təsdiqləyicilər texniki manifest maliyyə köçürmə hissəsinin dəqiq marşrutunu və aktiv icra yolunun təcəssümünü seçilmiş siyahı ilə birləşdirərək marşrutla bağlı `PrivateSettlementCommitteeAuthorityV1`-ü bərpa edirlər.

## Qəbulu konfiqurasiya et {#configure-admission}

Bütün istehsal davranışı düyün konfiqurasiyasından gəlir. Ətraf mühit dəyişənləri bu yolu aktivləşdirə bilməz. Göndərilən standart `enabled = false`-dır; xüsusiyyətin deaktiv saxlanması üçün heç bir ödəniş-spesifik konfiqurasiya tələb olunmur.

İdarəetmə tələb olunan qabiliyyəti qeyd etdikdən və kifayət qədər xəbərdarlıqla aktivləşdirmə hündürlüyünü seçdikdən sonra, hər bir müvafiq nodu ardıcıl şəkildə konfiqurasiya edin:

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

Nümunə göndərilmiş V1 limitlərindən istifadə edir, performans tövsiyəsi deyil. Saxlama, sübut, kapsul, konteyner əməliyyatı və gecikmə məlumat konteynerlərini ölçün Əməliyyat sərhədlərini seçmədən əvvəl nəzərdə tutulan avadanlığı müəyyən edin. Üç fazalı zaman aşım müddətləri `max_expiry_blocks` daxilində olmalıdır və əlavə qeydlərin saxlanma müddəti ən azı həmin müddət qədər olmalıdır.

`max_capsule_bytes` bütün `PrivateSettlementAuditCapsuleV1`-in tək protokol-standart Norito kodlaşdırmasını məhdudlaşdırır: AAD, kriptoqrafik nonce dəyəri, şifrələnmiş mətn, vektor çərçivəsi, auditor identlikləri və hər bir sarılmış-DEK sətir. Bu yalnız şifrələnmiş mətn üçün olan bir məhdudiyyət deyil. Hər konfiqurasiya edilmiş doldurma sinfi ən azı `default_min_auditor_approvals` auditor üçün qənaətbəxş tam kapsul məlumat konteynerinə uyğun olmalıdır. Torii həmçinin yeni birini rədd edir qəbul edilmiş siyasət, `min_approvals`-ü tənzimlənmiş minimum səviyyədən aşağı olan, və tam tək protokol-standart kodlaması çox böyük olan hər hansı faktiki kapsulu rədd edir.

`max_carrier_bytes` yalnız təsdiq edilmiş paket deyil, tam bir protokol-standart sponsor-ə imzalanmış əməliyyatı məhdudlaşdırır. Sayma qeydiyyatdan keçmiş təlimatı da əhatə edir çərçivələmə, əməliyyatın təsdiqi prinsipi və metadatası, ödəniş niyyəti və imza. Adi şəbəkə əməliyyatı məhdudiyyətləri hələ də müstəqil yuxarı hədd kimi tətbiq olunur.

Aktivləşdirmə, tənzimlənən imkan aktiv olmadıqda, onun vəziyyəti və aktivləşdirmə hündürlükləri xəbərdarlıq müddətinə cavab vermədikdə, tərtib olunmuş sübut profili V1 ilə uyğun gəlmədikdə və zəncir üzərindəki protokol məlumatları qrupu və audit qeydləri aktual olmadıqda bağlanmış vəziyyətdə uğursuz olur. Yalnız konfiqurasiya bayrağını aktivləşdirmək kifayət deyil.

## maliyyə əməliyyatı hesablaşma iş axını {#settlement-workflow}

Müştəri sübutları və şifrələnmiş kapsulları yerli səviyyədə yaradır. Gizli şahidlər yerli cüzdanda və ya yerli işçidə qalmalıdır; onları tətbiq jurnallarına, Python obyektlərinə, HTTP sorğularına və ya davamlı koordinasiya qeydlərinə seriyalaşdırmayın.

Kapsul və auditor başına DEK-qatlanmış autentifikasiya olunmuş məlumatlar dəqiq vəziyyətlə əlaqəli komitənin və `authority_context_height`-ın kriptoqrafik xülasə dəyərini, həmçinin şəbəkəni, marşrutu/inkarnasiyanı əhatə edir, paket, maliyyə köçürməsi hissəsi, siyasət, əsas dövr və açıq mətn kriptoqrafik öhdəlik dəyəri. Qablaşdırılmış açarı fərqli siyahıya və ya tarixi səlahiyyət prinsipi kontekstinə köçürmək olmaz.

Hər bir ayrı protokol-standart maliyyə köçürmə hissəsi üçün koordinatır sonra bu ardıcıllığı icra edir:

1. Müvəqqəti şifrələnmiş materialı bütün dörd yoxlayıcıya yükləyin və tək bir protokol-standart dəqiq 3-ü 4-də mövcudluq sertifikatı əldə edin.
2. Aşağıda təsvir edilmiş təsdiqlənmiş `POST` sorğusu ilə kapsulunu gətirmək üçün səlahiyyətli auditoru təyin edin, onu deşifr edin, açıq bağlılıqları yenidən hesablayın, yerli siyasəti tətbiq edin və təsdiq təqdim edin. Siyasət dövründən sonra kapsul giriş yalnız saxlanma üçün nəzərdə tutulub: mövcud varis uyğun tarixi oxunu təsdiq edə bilər, lakin köhnə siyasət çərçivəsində hazırlanmış maliyyə köçürməsi hissəsinə təsdiq əlavə edə bilməz.
3. Dörd təstiqçi tərəfindən səsvermə üçün Hazırlıq tələb edin. Hər bir təstiqçi delta sənədlərini müstəqil şəkildə yoxlayır və səsvermədən əvvəl davamlı olaraq hazırlayır. Hər hazırlanan cavablayıcıda yeganə protokol-standart 3-dən-4-ə Hazırlıq sertifikatını saxlayın.
4. Hər maliyyə köçürməsindən sonra hissənin Hazırlıq sertifikatı olur, dəyişməz tam Hazırlıq baryerini qurun. Tək protokol-standart 3-dən 4 protokol bitirmə sertifikatını tələb edin və saxlayın. Əgər koordinator yenidən başladılarsa, iştirakçı düyünlərdən onların lokalla saxlanmış Prepare və konsensus yekunlaşdırma sertifikatlarını sorğu et, tək bir protokol-standartı kvorum-ə bərabər sertifikat seç və davam etmədən əvvəl bunu yenidən payla; heç vaxt sertifikatı təsdiqlənməmiş yerli keşdən bərpa etmə.
5. Texniki manifest sponsoru imzalasın və dəqiq olaraq bir qlobal konteyner əməliyyatını təqdim etsin. Konteyner əməliyyatı bir `FinalizeAtomicPrivateSettlementV1` təlimatını və tam təsdiqlənmiş paketini özündə ehtiva edir. Koordinator və WSV qeydiyyatdan keçmiş təlimat çərçivəsini daxil olmaqla, tipdən azad edilmiş yekunlaşdırma təlimatını tam olaraq əvvəlcədən yoxlayırlar. Torii və əsas bir dəfəlik konteyner əməliyyatı birləşməsi `max_carrier_bytes`-i dəqiq tək protokol-standart sponsor tərəfindən imzalanmış əməliyyat üzərində tətbiq edirlər, avtorizasiya prinsipi, metadata, ödəniş niyyəti və imzanı daxil olmaqla. Torii avtorizasiya prinsipi kontekstindən əvvəl, son giriş hündürlüyündə və ya onunla birlikdə vaxt bitməsinə çata biləcək və ya idarə olunan vaxt müddətindən kənarda olan konteyner əməliyyatını rədd edir.
6. Qlobal sonluğa qədər ictimai paket vəziyyətini və protokol nəticəsi qeydini sorğu et. Lokal köməkçi qeyd vəziyyətini, o dəyişməz qlobal son qeyd ilə uyğunlaşana qədər müvəqqəti hesab et.

Rust müştəri bu axını `certify_and_upload_private_settlement_legs_v1`, `prepare_private_settlement_bundle_v1`, `commit_private_settlement_bundle_v1` və `submit_private_settlement_bundle_v1` daxil olmaqla metodlar vasitəsilə təqdim edir. Yenidən başlatma-davamlı koordinasiya `recover_or_prepare_private_settlement_bundle_v1` və `recover_or_commit_private_settlement_bundle_v1` istifadə edir. Komitə və auditor texniki çağırışları açıq rol səlahiyyətlərini tələb edir; onlar adi hesabın kriptoqrafik imzalayıcısını təkrar istifadə etmirlər.

## Auditor siyasətini təhlükəsiz şəkildə fırladın {#rotate-an-auditor-policy-safely}

Məxfilik-idarəetmə-icazəli `RotatePrivateSettlementPoolPolicyV1` təlimatından istifadə edin. O, cari idarəetmə kriptoqrafik xülasə dəyərini dəqiq göstərməli, eyni marşrutu, protokol məlumat qrupu və aktiv-bağlama kriptoqrafik öhdəlik dəyərini saxlamalı, idarəetmə reviziyasını bir artırmalıdır, tamamilə yeni açar dövrü və fərqli siyasət/idarəetmə kriptoqrafik xülasələri istifadə edin və rotasiyanı ehtiva edən blokda aktivləşdirin. Protokol məlumatları qrupu sərhədi, köklər, nullifikatorlar, çıxışlar, Təkrar oynatma dəstləri və yekunlaşmış protokol nəticəsi qeydləri saxlanılır. Dövrün aktivasiya hündürlüyündə eyni marşrut/pul ilə əlaqəli bir protokol nəticəsi qeydini daxil etməyin; təlimat həmin sərhədi rədd edir.

İctimai protokol məlumat qrupunun proqnozu tamamilə əvəz edilmiş siyasət-yeniləmə xronologiyasını saxlayır. Buna görə də rotasiyadan əvvəl yekunlaşdırılmış protokol nəticəsi qeydi yenidən başladıqdan sonra tarixi sübut kimi etibarlı qalır. tam olaraq həmin protokol nəticəsi qeydi təkrarlanarkən, vəziyyət dəyişmədən deterministik olaraq rədd olunur. Nəsil tamamlanmamış işi təsdiqləmir: aktivasiya sərhədini keçən hər hansı köhnə-siyasət paketi qlobal vəziyyət dəyişikliklərindən əvvəl bağlı şəkildə uğursuz olur. Bir ardıcıllıq siyasəti, yalnız daha sonrakı idarəetmə yeniləməsi və açar dövrü ilə eyni siyasət xəttinə aid olduqda qorunan tarixi kapsulu oxumağa icazə verə bilər, və təsdiqlənmiş cari imzalama açarı tarixi siyasətdə və qablaşdırılmış-DEK siyahıda eyni stabill auditor şəxsiyyətinə uyğun gəlir. Kapsul tarixi auditor açarı ilə şifrələnmiş qalır: Onu açmaq üçün həmin dəqiq tarixi deşifrə açarını saxlayın və ya açarı məhv etməzdən əvvəl tənzimlənmiş və sınaqdan keçirilmiş kapsulu yenidən bükün. Bu saxlama girişi fırlanmış/indiki siyasətin köhnə hazırlanmış siyasət altında təsdiq əlavə etməsinə icazə vermir.

## Torii marşrut ailəsi {#torii-route-family}

Bu marşrutlar tək protokol-standart Norito sorğu və cavab obyektlərindən istifadə edir. Sertifikatlaşdırılmış və məhdud cavablar xüsusi `no-store` keşik davranışından istifadə edir.

|Əməliyyat|Metod və yol|Müdir|
| ------------------ | -------------------------------------------------------------------------- | --------------------------- |
|Maliyyə köçürməsinin hissəsini yükləyin| `POST /v1/nexus/private-settlements/legs`                                  |tək protokol-standart hesab imzası|
|Mövcudluq payı| `POST /v1/nexus/private-settlements/legs/availability-shares`              |tək protokol-standart hesab imzası|
|Səs verməyə hazırlaş| `POST /v1/nexus/private-settlements/phases/prepare-votes`                  |tək protokol-standart hesab imzası|
| yekunlaşdırma mərhələsi səsverməsi | `POST /v1/nexus/private-settlements/phases/commit-votes`                   |tək protokol-standart hesab imzası|
|Davam et mərhələsi QC| `POST /v1/nexus/private-settlements/phases/certificates`                   |tək protokol-standart hesab imzası|
|Bərpa mərhələsi QCs| `GET /v1/nexus/private-settlements/legs/{payload_digest}/phase-certificates` |texniki manifest sponsoru|
|maliyyə köçürməsi hissəsi statusu| `GET /v1/nexus/private-settlements/legs/{payload_digest}/status`           |tək protokol-standart hesab imzası|
|Komitə sübutu| `GET /v1/nexus/private-settlements/legs/{payload_digest}/committee-proof` |dəqiq komanda siyahısı yoxlayıcısı|
|Audit kapsulu| `POST /v1/nexus/private-settlements/legs/{payload_digest}/audit-capsule` |idarə olunan auditor|
|Auditorun təsdiqi| `POST /v1/nexus/private-settlements/legs/{payload_digest}/audit-approvals` |idarə olunan auditor|
|Son göndər/imtina et| `POST /v1/nexus/private-settlements/bundles`                               |texniki manifest sponsoru|
|Paket vəziyyəti| `GET /v1/nexus/private-settlements/bundles/{bundle_id}`                    |ictimai|
|protokol nəticəsi qeydi və ya dayandırmaq| `GET /v1/nexus/private-settlements/bundles/{bundle_id}/receipt`            |ictimai|

İctimai status və protokol nəticəsi qeydi APIs yalnız sənədləşdirilmiş ictimai sahələri göstərir. Xüsusilə, adi maliyyə köçürmə hissəsinin statusu təsdiqi açıq etmir hesablar və ya idarə olunan auditor meyarı. Məhdud oxumalar qəsdən çatmayan, icazəsiz və saxlanma müddəti bitmiş materialları eyni əlçatmaz cavab sinfinə birləşdirir.

Audit-kapsül əməliyyatı yalnız oxumaq üçündür, şəxsiyyətə bağlı `POST`, `GET` deyil. Onun imzalı Norito JSON sorğu bədəni tam olaraq `{"audit_policy": <PrivateSettlementAuditPolicyV1>}`-dir: tam cari idarə olunan siyasət icazənin sübutudur, müştərinin təqdim etdiyi icazə prinsipi deyil. Qovşaq kapsulun tarixi `audit_policy`-ünü texniki manifestin `authority_context_height` tarixində qüvvəyə minmiş idarəetmə düzəlişi ilə bağlayır, tələb olunan cari və ya varisi siyasəti isə qovşaq-təsdiq edilmiş oxu hündürlüyündə qüvvəyə minmiş düzəlişlə bağlayır, və təsdiqlənmiş imzalama açarını hər iki siyasət tərəfindən paylaşılmış sabit auditor şəxsiyyəti vasitəsilə xəritələndirir. Təsdiqlənmiş cavab tarixi `audit_policy` əks etdirir və daxil olmaq üçün istifadə olunan dəqiq siyasət `access_audit_policy` kimi, və cavab verən təsdiqi hər ikisini bağlayır. Müştərilər `access_audit_policy`-nin sorğuda göndərilən siyasətə bərabər olmasını tələb etməlidirlər.

Təqdim etmə marşrutu dəqiq olaraq birbaşa sponsor tərəfindən imzalanmış yekunlaşdırma və ya ləğv təlimatını qəbul edir. Onun `202` cavabı yalnız paket ID-sini, müşahidə edilmiş qəbul hündürlüyünü və konteyner əməliyyatının kriptoqrafik xəşini ehtiva edir; o, növbəyə alınmış ləğvin artıq yekun olduğunu iddia etmir. SDKs həm identifikatorların tək protokol-standartlı yoxlanış cəmi olan Norito `Hash` JSON literallar olmasını, həm də hündürlüyün dəqiq işarəsiz 64-bit tam ədəd olmasını tələb edir; itkin, əlavə, səhv yazılmış, tək protokol standartına uyğun olmayan, cəmdə səhv olan, mənfi, mənfi-sıfır, kəsrli və ya daşmış sahələr bağlanmış vəziyyətdə uğursuz olur. Səlahiyyətli son vəziyyəti öyrənmək üçün paket statusundan və ya protokol nəticə qeydindən istifadə edin. Status kodu da dəqiqdir: bu konteyner əməliyyatı-qəbulu marşrutu `202` tələb edir, halbuki digər bütün şəxsi-hesablaşma V1 müvəffəqiyyət cavabları `200` tələb edir. Müştərilər alternativ uğurlu `2xx` kodlarını müştəri səhvləri vasitəsilə gözlənilməz cavab bədənini əks etdirmədən müqavilə sapması kimi rədd edirlər. Onlar yalnız server rədd kodunu açığa çıxarırlar o `[A-Za-z0-9_.:-]{1,128}` ilə uyğun gəldikdə və cavab analizçisi/təsdiqləmə səbəblərini xaric edin, beləliklə, bədən məzmunu və ya hücumçu tərəfindən seçilmiş JSON sahə adlarının səbəbə əsaslanan qeydlər vasitəsilə yenidən meydana çıxmasının qarşısını alır.

## Uğursuzluq və bərpa {#failure-and-recovery}

Əskik və ya köhnəlmiş auditor təsdiqləri, üçdən az doğrulayıcı səs, yanlış köklər və ya epoxlar, təkrarlanan nullifierlər, əvəz edilmiş sübutlar və ya kapsullar, qeyri-kanonik maliyyə hissə sifarişini köçürmək, müddəti bitmiş paketlər və uyğun gəlməyən geri ödəniş şərtləri qlobal mutasiyadan əvvəl hamısı uğursuz olur. konsensusun yekunlaşdırma sertifikatları heç vaxt xüsusi vəziyyəti mutasiya etməz.

Təsdiq edənlər əlavə qeydləri, mərhələli dəyişiklikləri və faza sertifikatlarını təsdiqləməzdən əvvəl fsync edirlər. Yenidən başladıqda onlar tək protokol-standart davamlı qeydlərdən rezervasiyaları bərpa edir, sonra isə dəyişməz qlobal protokol nəticəsi qeydlərini, abort markerlərini və ya müddətinin bitməsini uyğunlaşdırırlar. Nəzarətli uzlaşdırıcı, uzlaşdırılacaq heç bir terminal namizəd olmasa belə, eyni vaxtda müşahidə olunan səlahiyyətli hündürlükdə terminal qorunmasının kəsilməsini də həyata keçirir, və kəsilmiş səhvi üzərində bağlanır. Yalnız səlahiyyətli qlobal terminal qeydi səhnəyə qoyulmuş kilidləri buraxır. Dəqiq yekunlaşdırılmış protokol nəticəsi qeydi təkrar oynatma və ziddiyyətli təkrar oynatma hər ikisi də vəziyyət dəyişmədən deterministik olaraq rədd edilir.

Rezervasiya kimliyi tam marşrutu əhatə edir. Protokol məlumat qrupunun başları `(route, pool_id, epoch, root)` istifadə edir, nullifikatorlar `(route, pool_id, nullifier)` istifadə edir və çıxışlar `(route, pool_id, commitment)` istifadə edir. Başqa marşrutda bərabər qeyri-şəffaf dəyərlər müstəqildir; dəqiq marşrut toqquşması yenidən başladıqda da bağlı qalır.

Əməliyyat xəbərdarlıqları yalnız qeyri-şəffaf dəstə, marşrut, faza, kriptoqrafik həzm dəyəri, hündürlük və səbəb-sinfi sahələrindən istifadə etməlidir. Heç vaxt deşifrə olunmuş kapsullar, hesab və ya aktiv identifikatorları, məbləğlər, qeydlər, görünüş məlumatları, sübut şahidləri və ya parser yükləri loglarda, hadisələrdə, metrik etiketlərində və ya izləmə intervalında yerləşdirilməməlidir.

## Həqiqi dəyərdən əvvəl ixtisas {#qualification-before-real-value}

Quraşdırmaq istədiyiniz dəqiq quruluş və konfiqurasiya üçün, aşağıdakıları əhatə edən sübutları arxivləşdirin:

- müxalifət sübutu, kapsul, siyasət, açar dövriyyəsi, geri ödəmə və təkrar oynatma halları
- 2, 3, 4, 8 və 16 data sahəsi üçün real dörd-təsdiqləyici prosesləri, o cümlədən təsdiqləyici və koordinatorun yenidən başladılması, təsdiqlənmiş 5%, 10% və 20% mesaj itkisi, mərhələ bölünmələri, bərpa və davamlılıq sərhədindəki çökmələr
- kanar və fərqli sızma analizini Torii, P2P blokları, Kura, zaman nöqtəsində məlumat baxışları, sorğular, hadisələr, qeydlər və telemetriya üzrə
- hər real-şəbəkə iştirakçısı sayı üçün ən azı beş isinmə mərhələsi və otuz ölçülmüş paket, p50, p95, p99, etibarlılıq intervalları, resurslar, trafik, sübut və protokol nəticəsi qeyd ölçüləri, və nəzarət kimi şəffaf AMX
- sərt iş sahəsi testləri, lint və format yoxlamaları, təsadüfi toxumlar, soak, təkrar istehsal olunan quruluşlar, SBOMs, və imzalanmış artefakt kriptoqrafik xeshləri
- hər iki rəsmi qat: 3/255 ayaq sayğı-simetriya yoxlamaları və dəqiq dörd-valiador komitəsi-indeksli N=2 valiador-mərkəzli plus tam məhdud-səhv, kağız-əsaslı N=3 səhv, N=4 təmiz və N=3 müddət-bitmə/təkrar konfiqurasiyaları, komitəyə görə müstəqil səhv büdcələri ilə
- subut əlaqəsinin, saxta-slot seçicilərinin, aktiv və kapsul bağlamalarının, ödəniş əlaqəsinin, kriptoqrafiyanın və kəsişən-məlumatlararası vəziyyət maşınının müstəqil icmalı

Xam və təmizlənmiş sübutları, təhdid modelini, protokol arqumentlərini, məhdudiyyətləri, mənbə kodu versiya identifikasiyalarını, aparat təsvirini və audit hesabatlarını birində dərc edin dəyişməz DOI-dəstəklənən artefakt. Yalnız anbar testləri bu xüsusiyyəti istehsalat səviyyəsində uyğun CBDC maliyyə əməliyyatı hesablaşma sisteminə çevirmir.

Son təmiz Iroha kassadan, buraxılış mənbə inventarını yaradın və həmin kassadan kənarda əvvəlcədən mövcud olan paket kökünə möhürləyin:

```sh
python3 scripts/private_settlement_source_evidence.py \
  --repository-root . \
  --bundle-root /absolute/path/to/release-bundle
```

Prodüser, səhnələnmiş, səhnələnməmiş, izlənilməmiş və ya birləşdirilməmiş fayllarda və capture zamanı hər hansı mənbə dəyişikliyində uğursuz olur. O, xam mənbə-kod versiyası obyektini, tək protokol-standart Git ağac siyahısını, dəqiq binary yol siyahısını, deterministik mənbə möhürünü və `Cargo.lock` saxlayır; Son buraxılış texniki manifestinə onun JSON nəticəsindəki hər bir artefakt bəyanatını daxil edin. Bu, son DOI-paket yoxlayıcısını və ya hər hansı xarici buraxılış qapısını ləğv etmir.

Mənbə möhürü daşına biləndir və qapalı vəziyyətdə uğursuz olur: istehsalçı və son yoxlayıcı bütün arxivlənmiş symlink qrafını həll edirlər, belə ki, kökdə görünən, lakin başqa bir link, dövr, `.git` keçid və ya Windows tipli hədəf vasitəsilə qaçan linklər yaradılmadan rədd edilir. Quraşdırılmış mənbə və qapı hesabatları yalnız kriptoqrafik xülasə dəyəri və uzunluğu buraxılış texniki manifestinə uyğun olan məhdud sabit fayllardan təhlil edilir və hər bir mənbə yükü növü dəqiq olaraq bir dəfə meydana çıxmalıdır.

Hər bir xam səhv işləməsi və gecikmə nümunəsi tam buraxılış mənbə kodu reviziya, bir strukturlaşdırılmış möhkəmləndirilmiş aparat təsvirinin SHA-256 və onun dəqiq iştirakçı say konfiqurasiyasının SHA-256 ilə əlaqələndirilməlidir. N=2,3,4,8,16 üçün bir tək protokol-standart konfiqurasiya texniki manifestini arxivləşdirin; hər bir giriş saxlanılan konfiqurasiya baytlarına istinad etməli və hər məlumat sahəsi üçün tam olaraq dörd təsdiqedici, 3-dən 4-ə çoxtərəfli qərar və məcburi imzalı RS16 DA/RBC olduğunu təsdiqləməlidir. Buraxılış yoxlayıcısı fərqli quruluş, aparat profili və ya şəbəkə konfiqurasiyasında yaradılmış xülasələri rədd edir. Hər bir fərdi itgi, faza kəsimi və davamlılıq-böhran sətri əlavə olaraq SHA-256-ə aid qlobal olaraq təkrar istifadə edilməyən dəqiq JSONL qeyd istinadlarını adlandırmalıdır təsdiqlənmiş-nəzarətçi və atomiklik-tutma sənədləri. Buraxılış təsdiqləyicisi həmin kriptoqrafik xülasələri həll edir və satırların iş icması, sınaq indeksi və parametrlərlə, nəzarətçi təsdiqi və ya bərpa nəticəsi, davamlı yoxlama sayı ilə uyğun olmasını tələb edir, və sıfır qismli görünürlük və xərcləmə müşahidələri. Daha sonrakı buraxılış p95/p99 müqayisələri də namizəd ilə fərqli avadanlıq, konfiqurasiyalar və ya ölçmə tələblərinə sahib imzalanmış bir əsas xətti rədd edir. Son yoxlayıcı, ayrılmış benchmark xülasəsinə inanmaq əvəzinə, arxivlənmiş xam nümunələrdən bütün hesabat verilmiş faizləri, MADs və deterministik etibar intervalını yenidən yaradır. O həmçinin kanarya texniki manifestini yenidən yükləyir və hər bir arxivlənmiş məxfilik səthini müstəqil olaraq yenidən skan edir, beləliklə hesabat fayl kriptoqrafik həzmalarını yenidən bağladıqdan sonra yerləşdirilmiş gizli tapmağı basdıra bilməz. Hər bir yalnız sirlər üçün icra, sahibinə məxsus filtrelənməmiş loopback pcap, xam tcpdump stderr və sıfır-itki statistikasını, tək protokol-standart port texniki manifestini, paketlənmiş məhdud mənbə arxivini və bütün tərəfdaşların atomik müşahidələrini saxlamalıdır. Son yoxlayıcı, yayımlanan xülasələrə etibar etmək əvəzinə, arxivlənmiş baytlardan porta bağlı paket bölünməsini, mənbə projeksiyalarını və baza xəttindən terminala qədər atomluq yoxlamalarını yenidən icra edir.

Arxiv həmçinin hər bir tələb olunan məxfilik səthi üçün dəqiq sol və sağ fayl yollarını, növlərini, bayt uzunluqlarını və SHA-256 kriptoqrafik xülasələrini birləşdirən tək protokol-standart cüt trafik sayımı və diferensial-cüt texniki manifestləri də əhatə etməlidir. Bəyən edilmiş kökləri dəqiq cütləşdirilmiş arxiv inventarını ehtiva etməlidir. Yoxlayıcı bərabər tam fayl ölçüləri və adi səthlər üçün JSON ümumi şəkillər tələb edir. Entropiya daşıyan xam loopback tutma və sıxılmış məhdud mənbə arxivi açıq ölçü istisnalarıdır; onun əvəzinə paket link növünü və hər paket uzunluqlarını, məhdud mənbə kimliklərini və sabit formalı sətir uzunluqlarını müqayisə edir. Hər Torii sorğu/cavab, ictimai/məhdud P2P paket, blok, sorğu, hadisə, jurnal və telemetriya trafiki sayı da uyğun olmalıdır. Paket forması dəyişməsi, eyni ölçüdə struktur sızması, yanlış mənşəyin iddiası, və ya cütləşdirilməmiş fayl sızma hesabatı və onun kriptoqrafik xəşlərini yenidən yazmaqla gizlədilə bilməz.
