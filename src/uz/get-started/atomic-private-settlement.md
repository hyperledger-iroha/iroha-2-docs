---
translation_locale: uz
translation_source: /get-started/atomic-private-settlement.md
translation_source_hash: 7f36336e2ddf76514b36aac820246db6a67fb609b97c527e28f0b32c5deb145f
translation_status: machine-validated
translation_engine: bing-translator-llm
---

# Atomik Shaxsiy Cross-Dataspace moliyaviy tranzaksiya hisob-kitobini amalga oshirish {#run-atomic-private-cross-dataspace-settlement}

`AtomicPrivateSettlementV1` har bir 2 dan 255 gacha bo‘lgan SORA Nexus ma’lumotlar maydonidagi maxfiy moliyaviy o‘tkazma qismini muvofiqlashtiradi va barcha moliyaviy o‘tkazma qismlarini yagona global holatda yakunlaydi tranzaksiya. Rad etilgan, muddati o'tgan yoki bekor qilingan paket moliyaviy o'tkazma qismidan foydalanmaydi. Shaffof Native AMX DvP/PvP alohida protokol yo'li sifatida qoladi.

::: warning Chiqarish holati
Ushbu xususiyat boshqariladi, standart bo‘yicha o‘chirib qo‘yilgan va hali ishlab chiqarishga tayyor emas. E’lon qilingan funksionallikka qadar uni haqiqiy CBDC qiymat uchun yoqmang. maxfiylik, xato, ishlash, qayta ishlab chiqariladigan qurilish, mustaqil kriptografik ko‘rib chiqish va artefakt nashr etish qoidalari aynan shu reliz uchun barchasi muvaffaqiyatli o‘tgan.
:::

## Protokol nimani yashiradi {#what-the-protocol-hides}

Har bir moliyaviy o'tkazma qismi ikki kirishli, uch chiqishli maxfiy yozuv isboti bilan ishlaydi. Kengash tasdiqlovchilari isbot va shaffof bo'lmagan holat o'zgarishini tekshiradilar; ular shaffof tomonlar, aktiv, miqdor, memo yoki biznes natijasini olmaydilar. Avtorize qilingan mahalliy auditor quvurlangan audit kapsulasini shifrdan chiqaradi, uning mazmunini tekshiradi va maqsadga ajratilgan tasdiqni imzolaydi. Standart siyosat boshqariladigan auditorlar to‘plamidan bitta tasdiqni qabul qiladi.

Ommaviy konteyner tranzaksiyasi va protokol natijalari yozuvi ataylab quyidagilarni oshkor qiladi:

- tarmoq va paket identifikatorlari
- ishtirokchi ma'lumotlar maydoni yo‘llari va ishtirokchi soni
- vaqt va muddati balandliklari
- barqaror shaffof bo‘lmagan protokol ma’lumotlar guruhi identifikatorlari, ildizlar, nullifikatorlar, kriptografik majburiyat qiymatlari va belgilangan shifrlangan matn uyalar
- qo'mita vakolat prinsiplari va aniq 3-dan 4 mavjudlik, tayyorlash va protokolni yakunlash sertifikatlari
- sponsor, jamoat tarmoq to'lovi va terminal holati

Bu kontent maxfiyligi, trafik oqimi anonimligi emas. Vaqt, ishtirokchilar soni, dataspace shaxsi va barqaror havza faoliyati ommaviy bo'lib qoladi. Faqat bitta CBDC ni joylashtirgan dataspace ham, hech qanday haqiqiy aktiv identifikatori e'lon qilinmasa ham, aktivni marshrutdan aniqlash mumkin bo‘lishi mumkin.

Har bir belgilangan shifrlangan chiqish o‘z vakolatli bir martalik chiqish ko‘rinishi kalitidan olingan `recipient` identifikatorini e’lon qiladi. Bir moliyaviy o‘tkazma qismidagi uchta identifikator farq qilishi kerak; to‘liq Tayyorlash to‘siqlari va protokol natijalari yozuvi ushbu tekshiruvni barcha moliyaviy o‘tkazma qismlariga kengaytiradi. Vot berishdan oldin tayyorlaning, har bir qo'mita validatori allaqachon yakunlangan WSV da mavjud bo'lgan identifikatorni ham rad etadi. Global yakunlash yakunlangan paket tarixi bo‘ylab bir xil qoida amal qilishini, deterministik qabul qiluvchi indeks bilan ta'minlaydi. Indeks nuqta-vaqti ma’lumot ko‘rinishi payloadlaridan chiqarib tashlanadi va tiklash vaqtida yagona protokol-standart shifrlangan chiqishlardan qayta yaratiladi, shuning uchun saqlangan nusxalar yopilishadi. Bu bir martalik identifikator va qayta ijro chegarasi bo‘lib, yomon niyatli yuboruvchi yoki tarmoq kuzatuvchisi e’lon qilishdan oldin trafikni bog‘lay olmaydi, degan kafolat bermaydi.

## Joylashtirish talableri {#deployment-requirements}

Faollashtirishdan oldin, operatorlarga quyidagilarning barchasi kerak bo'ladi:

1. har bir ishtirokchi ma'lumotlar maydoni uchun aniq to'rtta validator, har biri alohida BLS konsensus kalitlari va egalik dalillari bilan
2. majburiy Sumeragi DA/RBC har bir balandlik uchun yoqilgan
3. har bir ma'lumot maydonida boshqariladigan maxfiy moliyaviy tranzaksiya yechimi protokoli guruhi va dastlabki ildiz
4. faol V1 xususiy eslatma imkoniyati va alohida moliyaviy tranzaksiya yakunlash dalili profili
5. hech bo‘lmaganda bitta boshqariladigan mahalliy `PrivateSettlementAuditPolicyV1`, jumladan alohida auditor imzolash va gibrid shifrlash kalitlari, kalit davri, balandlik haqiqiyligi va tasdiqlash mezoni
6. sozlangan saqlash muddati uchun yetarli shaxsiy yordamchi yozuvlar saqlash joyi
7. yakuniy jamoat konteyneri tranzaksiyasini yubora oladigan neytral homiy hisob qaydnomasi

Auditor shuningdek validatorni boshqarishi mumkin, lekin alohida konsensus, auditor-imalash va auditor-shifrlash kalitlaridan foydalanishi kerak. Pensiyaga chiqarilgan shifrlash kalitlarini tartibga soluvchi saqlash muddati uchun saqlang yoki ulardan foydalanishni to‘xtatishdan oldin kapsulani qayta qadoqlashni boshqaring va sinab ko‘ring.

To‘rtta tasdiqlovchi avtorizatsiya prinsipi davlat tomonidan aniq belgilangan bo‘lib, mijoz tomonidan ta’minlanmaydi. Texnik manifesto `authority_context_height`da har bir tasdiqlovchi aniq tartiblangan yo‘l/ma’lumotlar maydoni ro‘yxati va faol bajarilish yo‘li inkarnatsiyasini konsensus holatidan hal qiladi, hal qilingan balandlik mos kelishini talab qiladi, va to'rtta BLS kalitlari va egalik dalillarini tekshiradi. Yuklash, tayyorlash va yakuniy protokol natijalarini yozib olish barchasi shu tarixiy ruxsat olish printsipidan foydalanadi.

Tayyorlash to‘sig‘i, yakuniy protokolni yakunlash to‘plami va protokol natijalari yozuvi yagona ixcham ikki darajali avtorizatsiya asosiy katalogini baham ko‘radi. Uning `rosters` marshrutsiz validator identifikatorlarini va moslashtirilgan BLS egalik dalillarini o‘z ichiga oladi, bir protokol-standart birinchi foydalanish tartibida takrorlanmagan. `leg_roster_indices[i]` texnik manifest moliyaviy o‘tkazma qismi uchun ro‘yxatni tanlaydi `i`. Bir bosqich sertifikatining `authority_catalog_index` mantiqiy manifest-leg tartibiy raqami qoladi, ro‘yxat indeksi emas. Avtoritet-ixcham yoki QC tekshiruvdan oldin, tasdiqlovchilar tanlangan ro‘yxat bilan texnik manifestning moliyaviy o‘tkazma qismining aniq yo‘nalishini va faol bajarish yo‘lagi inkarnasini birlashtiradilar va yo‘nalishga bog‘langan `PrivateSettlementCommitteeAuthorityV1`ni tiklaydilar.

## Qabulni sozlash {#configure-admission}

Barcha ishlab chiqarish xatti-harakatlari tugun konfiguratsiyasidan kelib chiqadi. Muhit o'zgaruvchilari bu yo'lni faollayolmaydi. Yetkazib berilgan standart `enabled = false`; funksiyani o‘chirib qo‘ymoqchi bo‘lsangiz, hech qanday maxsus konfiguratsiya talab qilinmaydi.

Boshqaruv zarur imkoniyatni ro‘yxatga olgach va yetarlicha ogohlantirish bilan faollashtirish balandligini tanlagach, har bir tegishli tugunni izchil tarzda sozlang:

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

Misolda jo‘natilgan V1 cheklovlar ishlatilgan, bu esa ish faoliyati bo‘yicha tavsiya emas. Saqlash, isbot, kapsula, konteyner tranzaksiya va kechikish ma’lumotlar konteynerlarini o‘lchang Amaliy chegaralarni tanlashdan oldin mo‘ljallangan apparatni hisobga oling. Uch fazali vaqt tugashlari `max_expiry_blocks` ichida bo‘lishi kerak, va qo‘shimcha yozuvlarni saqlash vaqti kamida shu yakunlanish oynasi bilan bir xil bo‘lishi kerak.

`max_capsule_bytes` butun `PrivateSettlementAuditCapsuleV1`ning yagona protokol-standart Norito kodlashini cheklaydi: AAD, kriptografik nonce qiymati, shifrlangan matn, vektor ramkalash, auditor identifikatorlari va har bir o'ralgan-DEK satr. Bu faqat shifrlangan matnga oid cheklov emas. Har bir sozlangan padding sinfi kamida `default_min_auditor_approvals` auditorlar uchun konservativ butun kapsula ma’lumot konteyneriga mos kelishi kerak. Torii shuningdek, yangi ... ni rad etadi qabul qilingan siyosat, uning `min_approvals` boshqariladigan minimal darajadan past bo‘lsa, va har qanday haqiqiy kapsulani rad etadi, agar uning to‘liq yagona protokol-standart kodlash juda katta bo‘lsa.

`max_carrier_bytes` faqat sertifikatlangan paket bilan cheklanmay, to‘liq yagona protokol-standart homiy imzolangan tranzaksiyani cheklaydi. Hisobga olingan son ro‘yxatga olingan ko‘rsatmani o‘z ichiga oladi freyming, tranzaksiya tasdiqlash asosiy elementi va metadata, to'lov niyati va imzo. Oddiy tarmoq tranzaksiya cheklovlari mustaqil yuqori chegarasi sifatida hanuz amal qilmoqda.

Faollashtirish faqat boshqarilayotgan imkoniyat faol bo'lsa, uning holati va faollashtirish balandligi bildirish davriga javob bersa, yakunlangan dalil profili V1 ga mos kelsa va zanjir ustidagi protokol ma'lumotlar guruhi va tekshiruv yozuvlari yangilangan bo'lsa ishlaydi. Faqat konfiguratsiya bayrog'ini yoqish yetarli emas.

## moliyaviy operatsiyalarni hisob-kitob qilish ish oqimi {#settlement-workflow}

Mijoz isbotlarni va shifrlangan kapsulalarni mahalliy ravishda yaratadi. Maxfiy guvohlar mahalliy hamyonda yoki mahalliy ishchida qolishi kerak; ularni ilova jurnallariga, Python ob'ektlarga, HTTP so'rovlarga yoki barqaror muvofiqlashtirish yozuvlariga seriyalashtirmang.

Kapsula va har bir auditor uchun DEK o‘ramining autentifikatsiyalangan ma’lumotlari aniq holatga biriktirilgan qo‘mita dayjesti va `authority_context_height` qiymatini, shuningdek tarmoq, yo‘nalish/inkarnatsiya, to‘plam, bosqich, siyosat, kalit davri va ochiq matn majburiyatini o‘z ichiga oladi. O‘ralgan kalitni boshqa tarkibga yoki vakolatning boshqa tarixiy kontekstiga ko‘chirib bo‘lmaydi.

Har bir alohida protokol-standart moliyaviy o'tkazma qismi uchun, kordinator keyin ushbu ketma-ketlikni bajaradi:

1. Vaqtinchalik shifrlangan materialni barcha to'rtta validatorga yuklang va yagona protokol-standartga mos aniq 3-dan-4 mavjudlik sertifikatini oling.
2. Quyida taʼriflangan avtorizatsiyalangan `POST` soʻrovi bilan uning kapsulasini olish uchun ruxsat berilgan auditorni yuboring, uni shifrdan chiqaring, jamoat bogʻlamalarni qayta hisoblang, mahalliy siyosatni qoʻllang va tasdiqlashni yuboring. Siyosat aylanishidan keyingi kapsula kirishi faqat saqlash uchun: hozirgi merosxo'r mos tarixiy o'qishni ruxsat berishi mumkin, lekin eski siyosat ostida tayyorlangan moliyaviy o'tkazma qismiga tasdiq qo'sha olmaydi.
3. To'rt validatorning tayyorlash ovozlarini so'rang. Har bir validator ovoz berishdan oldin deltani mustaqil ravishda tekshiradi va barqaror ravishda tayyorlaydi. Har bir tayyorlangan javob beruvchida yagona protsedura-standart 3-of-4 Tayyorlash sertifikatini saqlang.
4. Har bir moliyaviy o'tkazma qismi Prepare sertifikatiga ega bo'lgandan so'ng, o'zgarmas to'liq Prepare to'sig'ini yarating. Bitta protokol-standart 3-of-4 protokol yakuniy sertifikatlarini so'rang va saqlang. Agar koordinatchi qayta ishga tushsa, ishtirokchi tugunlardan ularning mahalliy barqaror Prepare va konsensus yakunlash sertifikatlarini so‘rang, bitta protokol-standart kvorumga teng sertifikatni tanlang va davom etishdan oldin uni qayta tarqating; sertifikatni autentifikatsiyalanmagan mahalliy keshdan qayta tuzmang.
5. Texnik manifest homiysi tomonidan imzolanishi va aniq bitta global konteyner tranzaksiyasini yuborilishi kerak. Konteyner tranzaksiyasi bitta `FinalizeAtomicPrivateSettlementV1` ko‘rsatmani va to‘liq sertifikatlangan paketni o‘z ichiga oladi. Koordinator va WSV oldin uchish chorasi ro‘yxatdan o‘tgan ko‘rsatmalar tuzilishini o‘z ichiga olgan to‘liq tur-erased yakuniylashtirish ko‘rsatmasini o‘lchaydi. Torii va asosiy bir martalik konteyner tranzaksiya bog‘lamasi aniq yagona protokol-standart homiy tomonidan imzolangan tranzaksiya ustidan `max_carrier_bytes` ni amalga oshiradi, shu jumladan avtorizatsiya prinsipi, metadata, to‘lov niyati va imzo. Torii konteyner tranzaksiyasini uning avtorizatsiya prinsipi konteksti oldidan, oxirgi kirish balandligidan keyin yoki yakuniy muddati orqali yakunlanishi mumkin bo‘lgan vaqtdan keyin, yoki belgilangan muddati doirasidan tashqarida rad etadi.
6. Jamoaviy paket holati va protokol natijasi yozuvini global yakuniylikgacha so‘rang. Mahalliy yordamchi yozuv holatini o‘sha o‘zgarmas global yakuniy yozuv bilan mos kelguncha vaqtincha deb hisoblang.

Rust mijoz ushbu oqimni `certify_and_upload_private_settlement_legs_v1`, `prepare_private_settlement_bundle_v1`, `commit_private_settlement_bundle_v1` va `submit_private_settlement_bundle_v1` metodlari orqali namoyon qiladi. Qayta ishga tushirishga bardoshli muvofiqlashtirish `recover_or_prepare_private_settlement_bundle_v1` va `recover_or_commit_private_settlement_bundle_v1` dan foydalanadi. Komitet va auditorning texnik chaqiruvlari aniq rolga ega bo‘lgan shaxsiy ma’lumotlarni talab qiladi; ular oddiy hisob kriptografik imzosini qayta ishlatmaydi.

## Auditor siyosatini xavfsiz aylantiring {#rotate-an-auditor-policy-safely}

Maxfiylik boshqaruvi ruxsat bergan `RotatePrivateSettlementPoolPolicyV1` ko‘rsatmasidan foydalaning. U joriy boshqaruv dayjestini aynan ko‘rsatishi, ayni yo‘nalish, protokol guruhi va aktivni bog‘lash majburiyatini saqlashi, boshqaruv tahririni bittaga oshirishi, albatta yangiroq kalit davri hamda boshqa siyosat va boshqaruv dayjestlaridan foydalanishi va aylantirishni o‘z ichiga olgan blokda faollashishi kerak. Protokol guruhi chegarasi, ildizlar, nullifikatorlar, natijalar, takroriy ijro to‘plamlari va yakunlangan kvitansiyalar saqlanadi. Aylantirish faollashadigan blok balandligida ayni yo‘nalish yoki protokol guruhiga tegishli kvitansiyani kiritmang; ko‘rsatma bu chegarani rad etadi.

Jamoat protokoli ma'lumotlar guruhi proyeksiyasi to'liq yangilangan siyosat-tuzatish avlodini saqlaydi. Shuning uchun aylanishdan oldin yakunlangan protokol natijalari yozuvi qayta ishga tushirilgandan keyin ham tarixiy dalil sifatida haqiqiy bo'lib qoladi. shu aniq protokol natijasi yozuvini qayta ijro etishda hech qanday holat o‘zgarishisiz deterministik tarzda rad etiladi. Nasl tug‘rilanmagan ishni ruxsat bermaydi: faollashtirish chegarasini kesib o‘tgan har qanday eski-siyosat to‘plami global holat o‘zgarishlaridan oldin yopiq holda muvaffaqiyatsiz bo‘ladi. Vorisi siyosati, faqat keyingi boshqaruv tuzatishi va kalit davri bilan bir xil siyosat naslidan bo‘lgan hollarda saqlangan tarixiy kapsulani o‘qishga ruxsat berishi mumkin, va tasdiqlangan joriy imzolash kaliti tarixiy siyosatda va o‘ralgan-DEK ro‘yxatda bir xil barqaror auditor identifikatoriga mos keladi. Kapsula tarixiy auditor kalitiga shifrlangan holda qoladi: uni ochish uchun aniq tarixiy shifrlash kalitini saqlang yoki kalitni yo'q qilishdan oldin boshqariladigan va sinovdan o'tgan kapsula qayta o'rashni bajaring. Bu saqlash kirish eski tayyorlangan siyosat ostida tasdiq qo'shishga ruxsat bermaydi, aylantirilgan/joriy siyosatga.

## Torii marshrut oilasi {#torii-route-family}

Bu marshrutlar bitta protokol-standart Norito so‘rov va javob obyektlaridan foydalanadi. Autentifikatsiyalangan va cheklangan javoblar maxfiy `no-store` keshlash xatti-harakatidan foydalanadi.

|Operatsiya|Usul va yo'l|Direktor|
| ------------------ | -------------------------------------------------------------------------- | --------------------------- |
|Moliyaviy o'tkazma qismini yuklash| `POST /v1/nexus/private-settlements/legs`                                  |yagona protokol-standart hisob imzosi|
|Mavjudlik ulushi| `POST /v1/nexus/private-settlements/legs/availability-shares`              |yagona protokol-standart hisob imzosi|
|Ovoz berishga tayyorlaning| `POST /v1/nexus/private-settlements/phases/prepare-votes`                  |yagona protokol-standart hisob imzosi|
|yakuniy bosqich ovozi| `POST /v1/nexus/private-settlements/phases/commit-votes`                   |yagona protokol-standart hisob imzosi|
|Uzluksiz faza QC| `POST /v1/nexus/private-settlements/phases/certificates`                   |yagona protokol-standart hisob imzosi|
|Qayta tiklash bosqichi QCs| `GET /v1/nexus/private-settlements/legs/{payload_digest}/phase-certificates` |texnik manifest homiy|
|moliyaviy o'tkazma qismi holati| `GET /v1/nexus/private-settlements/legs/{payload_digest}/status`           |yagona protokol-standart hisob imzosi|
|Qo'mita isboti| `GET /v1/nexus/private-settlements/legs/{payload_digest}/committee-proof`  |aniq ro'yxat tekshirgichi|
|Audit kapsula| `POST /v1/nexus/private-settlements/legs/{payload_digest}/audit-capsule`   |nazorat qilinadigan auditor|
|Auditorning tasdiqlashi| `POST /v1/nexus/private-settlements/legs/{payload_digest}/audit-approvals` |nazorat qilinadigan auditor|
|Yakunlash/tugatish| `POST /v1/nexus/private-settlements/bundles`                               |texnik manifest homiy|
|Paket holati| `GET /v1/nexus/private-settlements/bundles/{bundle_id}`                    |jamoat|
|protokol natijasi yozuvi yoki bekor qilish| `GET /v1/nexus/private-settlements/bundles/{bundle_id}/receipt`            |jamoat|

Jamoat holati va protokol natijalari yozuvi APIs faqat hujjatlashtirilgan jamoat maydonlarini ochib beradi. Xususan, oddiy moliyaviy o'tkazmalar qismi holati tasdiqlashni oshkor qilmaydi hisoblar yoki boshqariladigan auditor sharti. Cheklangan o‘qishlar yo‘qolgan, ruxsatsiz va saqlash muddati tugagan materiallarni ataylab bir xil mavjud bo‘lmagan javob klassiga birlashtiradi.

Audit-kapsula operatsiyasi faqat o'qish uchun mo'ljallangan, identifikatsiyaga bog'langan `POST`, `GET` emas. Uning imzolangan Norito JSON so'rov tanasi aniq `{"audit_policy": <PrivateSettlementAuditPolicyV1>}`: to'liq joriy boshqariladigan siyosat vakolat uchun dalil hisoblanadi, mijoz tomonidan taqdim etilgan vakolat asosiy emas. Ulgurji tugun kapsula tarixiy `audit_policy` ni texnik manifestning `authority_context_height` da kuchga kirgan boshqaruv tuzatishga bog‘laydi, so‘ralgan joriy yoki voris siyosatini tugun vakolatli o‘qish balandligida kuchga kirgan tuzatishga bog‘laydi, va tasdiqlangan imzolash kalitini ikkala siyosat tomonidan baham ko‘rilgan barqaror auditor identifikatori orqali xaritalaydi. Tasdiqlangan javob tarixiy `audit_policy` ni aks ettiradi va kirish uchun qo‘llaniladigan aniq siyosat `access_audit_policy` sifatida bo‘lib, javob beruvchining tasdiqlashi ikkalasini ham bog‘laydi. Mijozlar `access_audit_policy` so‘rovda yuborilgan siyosatga teng bo‘lishini talab qilishi kerak.

Submit yo‘li aniqlik bilan bitta to‘g‘ridan-to‘g‘ri homiy tomonidan imzolangan yakunlash yoki bekor qilish ko‘rsatmasini qabul qiladi. Uning `202` javobi faqat paket IDsi, kuzatilgan qabul balandligi va konteyner tranzaksiyasi kriptografik xashini o‘z ichiga oladi; u navbatdagi bekor qilishning allaqachon yakunlanganligini da’vo qilmaydi. SDKs ikkala identifikatorning ham yagona protokol-standartli tekshirish summasiga ega Norito `Hash` JSON literal bo‘lishini va balandlikning aniq belgisiz 64-bitli butun son bo‘lishini talab qiladi; yo‘q, qo‘shimcha, noto‘g‘ri yozilgan, yagona protokol-standartiga mos kelmaydigan, cheksum-xato, manfiy, manfiy-nol, kasrli yoki ortiqcha maydonlar yopiq holatda muvaffaqiyatsiz bo‘ladi. Avtorizatsiyalangan terminallar holati uchun paket holati yoki protokol natijasi yozuvidan foydalaning. Holat kodi ham aniq: bu konteyner tranzaksiya-qabul qilish yo'li `202` talab qiladi, holbuki har bir boshqa xususiy-hal qilish V1 muvaffaqiyatli javobi `200` talab qiladi. Mijozlar alternativ muvaffaqiyatli `2xx` kodlarini shartnoma sirpanishi sifatida rad etadilar, mijoz xatoliklari orqali kutilmagan javob tanasini aks ettirmasdan. Ular faqat server rad etish kodini ochib beradi u `[A-Za-z0-9_.:-]{1,128}` bilan mos kelganda va javob parseri/tekshirish sabablarini bekor qilib, tana mazmuni yoki hujumchi tanlagan JSON maydon nomlarining sababni biladigan loglar orqali qayta paydo bo‘lishini oldini oladi.

## Muvaffaqiyatsizlik va tiklanish {#failure-and-recovery}

Auditor tasdiqlari yo‘q yoki eskirgan, uchta validator ovozidan kam, noto‘g‘ri ildizlar yoki epoxalar, takroriy nullifierlar, almashtirilgan isbotlar yoki kapsulalar, noan’anaviy moliyaviy qism buyurtmasini uzatish, muddati o'tgan to'plamlar va mos kelmaydigan kompensatsiya shartlari global mutatsiyadan oldin muvaffaqiyatsiz bo'ladi. kelishuvni yakunlash sertifikatlari hech qachon xususiy holatni o'zgartirmaydi.

Validatorlar yordamchi yozuvlar, tayyorlangan o‘zgarishlar va bosqich sertifikatlarini tasdiqlashdan oldin fsync qiladi. Qayta ishga tushganda ular yagona protokol-standart bardoshli yozuvlardan rezervatsiyalarni tiklaydi, keyin o‘zgarmas global protokol natija yozuvlarini, bekor qilish markerlarini yoki muddati o‘tgan yozuvlarni muvofiqlashtiradi. Nazorat qilinadigan muvofiqlashtiruvchi, muvofiqlashtiriladigan terminal nomzodi bo'lmasa ham, sinxron ravishda kuzatilgan vakolatli balandlikda terminalni saqlashni qisqartirishni amalga oshiradi. va u kesish xatosida yopiladi. Faqat vakolatli global terminal yozuvi tayyorlangan qulflarni chiqaradi. Aniq yakunlangan protokol natijasi yozuvi takrorlovi va qarama-qarshi takrorlovlar davlat o‘zgarishisiz deterministik tarzda rad etiladi.

Bandlik identifikatori to‘liq yo‘nalishni o‘z ichiga oladi. Protokol ma’lumotlar guruhi boshliqlari `(route, pool_id, epoch, root)` dan foydalanadi, nullifikatorlar `(route, pool_id, nullifier)` dan foydalanadi, va chiqishlar `(route, pool_id, commitment)` dan foydalanadi. Boshqa yo‘nalishda teng shaffof bo‘lmagan qiymatlar mustaqildir; aniq yo‘nalish to‘qnashuvi qayta ishga tushirishda ham qulflanib qoladi.

Operatsion ogohlantirishlar faqat shaffof bo'lmagan paket, marshrut, faza, kriptografik xulosalar qiymati, balandlik va sabab-sinf maydonlaridan foydalanishi kerak. Hech qachon shifrlangan kapsulalarni, hisob yoki aktiv identifikatorlarini, summalarni, eslatmalarni, ko‘rish ma’lumotlarini, dalil guvohlarini yoki parser yuklamalarini loglarda, voqealarda, metrikalar yorliqlarida yoki izlash oralig‘ida joylashtirmang.

## Haqiqiy qiymatdan oldin malaka {#qualification-before-real-value}

Siz joylashtirmoqchi bo‘lgan aniq qurilish va sozlamalar uchun, quyidagilarni qamrab olgan dalillarni arxivlang:

- raqobatbardosh isbot, kapsula, siyosat, kalit aylantirish, qaytarib to‘lash va qayta ijro etish holatlari
- 2, 3, 4, 8 va 16 maʼlumot maydonlari uchun haqiqiy toʻrtta validator jarayoni, jumladan validator va koordinatsiya qiluvchi qayta ishga tushirishlar, autentifikatsiyalangan 5%, 10% va 20% xabar yoʻqotish, bosqich bo'linmalari, tiklash va doimiylik chegarasi bilan xatolar
- kanariya va farqli oqim tahlili bo'ylab Torii, P2P bloklar, Kura, nuqta-vaqtdagi ma'lumotlar ko'rinishlari, so'rovlar, voqealar, jurnal va telemetriya
- haqiqiy tarmoq ishtirokchisi soniga mos ravishda kamida besh qizdirish mashqlari va o‘ttiz o‘lchangan to‘plamlar, p50, p95, p99, ishonch oralig‘lari, resurslar, trafik, isbot va protokol natijalari yozuv o‘lchamlari bilan, va nazorat sifatida shaffof AMX
- qattiq ish joyi testlari, lint va format tekshiruvlari, tasodifiy urug‘lar, namlanish, qayta ishlab chiqiladigan qurilmalar, SBOMs, va imzolangan artefakt kriptografik xeshlar
- ikkala rasmiy qatlam: 3/255 oyoq soni-simmetriya tekshiruvlari va aniq to‘rt validator komiteti-indeksli N=2 validatorga yo‘naltirilgan plus to‘liq cheklangan-xatolik, qog‘oz-asosiy N=3 xatolik, N=4 toza, va N=3 muddati tugash/qayta ijro sozlamalari, har bir komitet uchun mustaqil xatolik byudjetlari bilan
- isbot munosabati, sun’iy-bo‘sh joy tanlagichlari, aktiv va kapsula bog‘lanishlari, qaytarib to‘lash munosabati, kriptografiya va kross-datavoya holat mashinasining mustaqil ko‘rib chiqilishi

Xom va tozalangan dalillarni, tahdid modelini, protokol argumentini, cheklovlarni, manba-kodining o‘zgartirish identifikatorlarini, apparat tavsifini va audit hisobotlarini chop eting o‘zgarmas DOI-asoslangan artefakt. Faqat ombor testlari xususiyatni ishlab chiqarishga mo‘ljallangan CBDC moliyaviy tranzaksiya hisob-kitob tizimiga aylantirmaydi.

Oxirgi toza Iroha chekautdan, chiqish manba inventarini yarating va uni ushbu chekautdan tashqaridagi oldindan mavjud paket ildiziga muhrlang:

```sh
python3 scripts/private_settlement_source_evidence.py \
  --repository-root . \
  --bundle-root /absolute/path/to/release-bundle
```

Ishlab chiqaruvchi sahnalashtirilgan, sahnalashtirilmagan, izsiz yoki birlashtirilmagan fayllarda va yozib olish davomida har qanday manba o‘zgarishida ishlamay qoladi. U xom manba-kod versiyasi obyekti, yagona protokol-standart Git daraxti inventari, aniq ikkilamchi yo‘l ro‘yxatini, deterministik manba muhrini va `Cargo.lock`ni saqlab qoladi; yakuniy reliz texnik manifestida uning JSON natijasidagi har bir artefakt deklaratsiyasini o‘z ichiga oladi. Bu yakuniy DOI-bundle tekshiruvchisini yoki har qanday tashqi reliz eshigini bekor qilmaydi.

Manba muhrini ko'chma va yopiq bo'lib ishlaydi: ishlab chiqaruvchi va yakuniy tekshiruvchi barcha arxivlangan symlink grafini yakuniy hal qiladilar, shuning uchun ildizda ko'rinadigan, lekin boshqa link orqali chiqib ketadigan link, sikl, `.git` o'tish yoki Windows uslubidagi nishon yaratilishidan oldin rad etiladi. Tuzilgan manba va darvoza hisobotlari faqat kriptografik xulosa qiymati va uzunligi chiqarish texnik manifestiga mos keladigan cheklangan barqaror fayllardan tahlil qilinadi, va har bir manba yuklamasi turi aniq bir marta uchrashishi kerak.

Har bir xom xato yugurishi va kechikish namunasi to‘liq chiqarilgan manba-kodining tahririni, bitta tuzilgan pinli apparat tavsifining SHA-256 va uning aniq ishtirokchi-soni konfiguratsiyasining SHA-256 ni bog‘lashi kerak. Arxiv bitta protokol-standart konfiguratsiya texnik manifestini qamrab oladi, N=2,3,4,8,16; har bir yozuv saqlanadigan konfiguratsiya baytlariga murojaat qilishi va har bir ma'lumot maydonida aniq to'rt ta validatorni, 3dan 4 gacha quorumni va majburiy imzolangan RS16 DA/RBC ni tasdiqlashi kerak. Nashrni tekshiruvchi boshqa yig‘ilish, uskunalar profili yoki tarmoq konfiguratsiyasida yaratilgan qisqacha ma’lumotlarni rad etadi. Har bir alohida yo‘qotish, faza kesimi va doimiylik- tushish qatori shuningdek, SHA-256-cheklangan ichida global qayta ishlatilmas aniq JSONL yozuv havolalarini nomlashi kerak tasdiqlangan-kontrol qiluvchi va atomlilik-qayd etish artefaktlari. Reliz tasdiqlovchi ular kriptografik xashlarini yechadi va satrlar ishlash identifikatori, sinov indeksi va parametrlar, kontrol qiluvchi tasdiqlashi yoki tiklash natijasi, uzluksiz tekshirish sanog‘i bilan mos kelishini talab qiladi, va nol qisman ko‘rinish va sarflanish kuzatuvlari. Keyinchalik chiqarilgan p95/p99 taqqoslashlar ham apparati, konfiguratsiyalari yoki o‘lchov talablarining nomzodnikidan farq qiluvchi imzolangan asosni rad etadi. Yakuni tekshiruvchi barcha xabar qilingan foizli ko'rsatkichlarni, MADs va saqlangan xom namunalar asosida deterministik ishonch intervallarini qayta yaratadi, ajratilgan benchmark xulosasiga ishonish o'rniga. Bu shuningdek kankariy texnik manifestini qayta yuklaydi va har bir arxivlangan maxfiylik yuzasini mustaqil ravishda qayta skanerlash qiladi, shuning uchun hisobot fayl kriptografik xulosalarini qayta bog‘lagandan keyin o‘rnatilgan maxfiy hujumni bostira olmaydi. Har bir faqat sirli ishga tushirish uning egasiga qarashli filtrlarsiz loopback pcap, xom tcpdump stderr va nol yo‘qotish statistikasi, bitta protokol-standart port texnik manifesti, siqilgan cheklangan manba arxivi va barcha hamkasblar atomiklik kuzatuvlarini saqlashi kerak. Oxirgi tekshiruvchi nashr etilgan xulosalarga ishonish o‘rniga, arxivlangan baytlardan portga bog‘langan paket bo‘linishini, manba loyihalarini va asosiydan terminalgacha bo‘lgan atomiklik tekshiruvlarini qayta bajaradi.

Arxivda shuningdek, har bir zaruriy maxfiylik yuzasi uchun aniq chap va o‘ng fayl yo‘llari, turlari, bayt uzunliklari va SHA-256 kriptografik xashlarini bog‘laydigan yagona protokol-standart juftlashtirilgan trafik hisoblash va differensial-juft texnik manifestlar bo‘lishi kerak. E'lon qilingan ildizlari aniq juftlangan arxiv inventarizatsiyasini o'z ichiga olishi kerak. Tekshirish vositasi oddiy sirtlar uchun butun fayl o'lchamlari va JSON jamoat shakllarining tengligini talab qiladi. Entropiya tashuvchi xom loopback yozuvi va siqilgan cheklangan manbali arxiv aniq hajmdagi istisnolardir; u o‘rniga paket ulanish turini va har bir paket uzunliklarini, cheklangan manbali shaxsiyatlarni va belgilangan shakldagi qator uzunliklarini solishtiradi. Har bir Torii so‘rov/javob, ommaviy/cheklangan P2P paket, blok, so‘rov, voqea, jurnal va telemetriya trafik hisoblagichi ham mos kelishi kerak. Paket shaklidagi o‘zgarish, bir xil o‘lchamdagi strukturaviy oqim, noto‘g‘ri kelib chiqishi da’vosi, yoki juftlanmagan fayl oqim hisobotini va uning kriptografik xeshlarini qayta yozish orqali yashirilishi mumkin emas.
