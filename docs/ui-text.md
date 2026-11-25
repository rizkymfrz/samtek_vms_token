# UI Text & Glossary

Dokumen ini adalah sumber kebenaran untuk aturan penulisan teks UI,
terminologi resmi, dan pola copy di seluruh frontend `samtek_vms_new`.
Jika teks di kode berbeda dengan dokumen ini, dokumen ini yang benar,
kecuali bagian bertanda **[Keputusan produk]**.

## 0. Status dan cakupan

- Aturan di §1 sampai §5 berlaku untuk seluruh frontend.
- Terminologi (§3) dan label analytic (§6) sudah diputuskan produk.
  Penerapannya ke kode belum dilakukan. Daftar teks yang harus
  disesuaikan ada di §7.
- Keputusan yang masih menunggu konfirmasi ditandai
  **[Pending]**.
- Cakupan verifikasi terhadap kode:
  - **Dashboard**: diaudit menyeluruh.
  - **Halaman lain** (alerts, playback, floorplan, analytics, cameras,
    navigasi): hanya dicari lewat pencarian teks untuk istilah yang
    diputuskan. Belum diaudit menyeluruh.
- Bagian bertanda **[Belum diaudit]** belum diverifikasi. Jangan
  menganggapnya baku.
- Tidak ada sistem i18n atau berkas copy terpusat. Teks UI ditulis
  langsung di komponen dan config. Satu-satunya peta label yang ada
  adalah `config/analytics-catalog.ts` (id analytic ke label).

## 1. Aturan umum

- Bahasa UI: English.
- Gunakan sentence case: huruf kapital hanya di awal kalimat dan pada
  proper noun atau akronim baku (PPE, ID, GPS).
- Jangan memakai Title Case, termasuk pada nama menu. Contoh:
  `Live view`, `Object search`, `Recent alarms`.
- Tulis singkat dan jelas. Satu konsep memakai satu istilah (§3).
- Akronim baku diperbolehkan (PPE, ID). Jangan menyingkat kata biasa:
  `Average`, bukan `Avg`.
- Gunakan `and`, bukan `&`.
- Singular dan plural harus benar: `1 alarm`, `2 alarms`.
- Jam ditampilkan 24 jam (`HH:mm`, zona `Asia/Jakarta`), sesuai
  `features/dashboard/lib/format.ts`.
- Jangan mengubah makna istilah teknis (id analytic, kind alarm, nilai
  status) hanya demi keseragaman teks. Aturan di dokumen ini hanya
  mengatur teks yang dilihat pengguna.

## 2. Aturan per komponen

| Komponen | Aturan | Contoh |
|---|---|---|
| Menu navigasi dan page title | Sentence case, kata benda singkat, tanpa titik. Page title sama dengan label menu. | `Live view` |
| Section heading | Kata benda, tanpa titik. | `Safety` |
| Card/panel title | Kata benda atau frasa kata benda, tanpa titik. | `Alarms per hour` |
| Panel description | Satu frasa pendek, tanpa titik. Berisi rentang waktu atau pemecahan data. Tidak mengulang judul. | `Last 24 hours, by risk level` |
| KPI label | Kata benda + rentang waktu dalam kurung. | `Alarms (24h)` |
| Chart legend/series | Nama kategori, singular, sama dengan glossary. | `Medium`, `Stranger` |
| Chart axis/tooltip | Waktu `HH:mm`. Tooltip menyertakan hitungan dengan plural benar. | `Camera 1 · 14:00 · 1 alarm` |
| Unit | Satuan singkat tanpa spasi untuk `s`, `m`, `h`, `%`. Unit lain ditulis lengkap, huruf kecil. | `45s`, `1h 2m`, `12 reads` |
| Button/action | Kata kerja + objek, sentence case, tanpa titik. | `Add camera` |
| Form label | Kata benda, tanpa titik dan tanpa titik dua. | `Camera name` |
| Placeholder | Contoh nilai atau petunjuk singkat. Bukan pengganti label. | `e.g. Main entrance` |
| Validation | Kalimat lengkap, menyebut field, diakhiri titik. | `Camera name is required.` |
| Empty state | `No {plural noun}.` diakhiri titik. Jika terikat waktu: `No {plural noun} in the last 24 hours.` | `No alarms.` |
| Error message | Apa yang gagal, dalam bahasa pengguna, diakhiri titik. Tanpa stack trace atau detail internal. | `Failed to connect to the server.` |
| Success notification | Objek + kata kerja lampau + `successfully`, diakhiri titik. | `Camera added successfully.` |
| Tooltip | Frasa pendek, tanpa titik. | `Fullscreen` |
| Confirmation dialog | Judul berupa pertanyaan dengan objek. Tombol memakai kata kerja yang sama dengan aksinya. | `Delete this camera?` / `Delete` |
| Loading state | Skeleton jika bentuk konten diketahui. Teks hanya jika perlu: `Loading {noun}`. | `Loading alarms` |

Pola form, validation, notification, tooltip, confirmation, dan loading
adalah pola awal. Belum diverifikasi menyeluruh terhadap halaman selain
Dashboard **[Belum diaudit]**.

## 3. Glossary

Kolom: **Canonical** = istilah resmi. **Definition** = makna yang
diputuskan produk. **Avoid** = alternatif yang tidak dipakai.
**Catatan kode** = hasil pemeriksaan terhadap implementasi.

### 3.1 Alarm, alert, dan risk level

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Alarm | Kejadian (event) yang dihasilkan analytic atau sistem. | Daftar, hitungan, riwayat, dan statistik event. | Alert untuk event | `Recent alarms`, `Alarms (24h)` |
| Alert | Notifikasi atau penyampaian informasi kepada pengguna. | Toast, bell, dan inbox notifikasi. | Alarm untuk notifikasi | `New alert` |
| Alert (status) | Nilai status teknis deteksi (`alert` pada `DetectionStatus`). | Hanya sebagai label status. Maknanya berbeda dari dua istilah di atas. | Mengubah nama nilai status | `Alert` |
| Risk level | Tingkat risiko alarm: `Medium` atau `High`. | Legend dan judul. | Severity, priority | `Risk levels` |
| High risk | Alarm dengan risk level `High`. | Label KPI. | Severe, critical | `High risk` |

Catatan kode:
- Halaman `/alerts` mengambil data dari `/v1/alarms`. Isinya daftar
  alarm, bukan notifikasi (`features/alerts/lib/alarm-row.ts`). Menurut
  definisi di atas, namanya seharusnya **Alarms**.
- Istilah `alert` dipakai untuk event di banyak teks UI (daftar di §7).
- `alert` juga dipakai sebagai nilai status teknis
  (`features/edge-status`). Ini bukan event dan bukan notifikasi.

**Keputusan (final):** semua display text yang merujuk ke daftar
kejadian alarm memakai `Alarms`: menu, page title, empty state, filter,
riwayat, dan pesan error.

Yang **tidak** berubah:
- Rute `/alerts` dipertahankan.
- Endpoint API `/v1/alarms` dan `/api/alerts` tidak berubah.
- Nama fitur, folder, file, komponen, variabel (`features/alerts`,
  `AlertsTable`, dan sebagainya).
- Technical identifier, enum, nilai status `alert`, dan kontrak Edge.

Perbedaan domain yang harus dijaga:
- **Alarm** adalah *data*: event yang dihasilkan analytic atau sistem.
  Dihitung, difilter, dan disimpan.
- **Alert** adalah *penyampaian*: toast, bell, atau notifikasi yang
  memberi tahu pengguna bahwa suatu alarm terjadi. Satu alarm dapat
  memicu alert.
- Penamaan kode (`alert-*`) tidak menentukan teks UI. Tentukan teks dari
  maknanya.

Contoh:

| Teks lama | Teks baru |
|---|---|
| `Alerts` (menu dan page title) | `Alarms` |
| `Alert History` | `Alarm history` |
| `Alert type` | `Alarm type` |
| `Alerts (24h)` | `Alarms (24h)` |
| `No alerts found` | `No alarms found.` |

### 3.2 Camera dan device

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Camera | Sumber video. | Teks UI yang merujuk ke sumber video. | Cam | `Activity by camera` |
| Device | Perangkat fisik atau endpoint yang dikelola sistem. | Konteks generik atau teknis, bukan pengganti `camera`. | Memakai `device` untuk kamera | `Device` |

Catatan kode:
- Di database, semua record `Device` adalah sumber video: punya
  `sourceMain`, `analyticId`, `isRecordingEnabled`
  (`docs/database-schema.md`: "devices (cameras)"). Saat ini tidak ada
  device non-kamera. Edge server adalah entitas terpisah (`Server`).
- Akibatnya `device` di kode (`deviceNames`, `device_id`, `row.device`)
  dan `camera` di UI merujuk entitas yang sama. Teks UI memakai
  `camera`. Nama field dan variabel tidak perlu berubah.
- Tooltip heatmap dashboard menampilkan `row.device` yang berisi nama
  kamera. Itu tidak masalah selama yang tampil adalah nama.

**[Keputusan produk]** Kapan `Device` dipakai di UI tetap kosong sampai
ada perangkat non-kamera. Sampai saat itu, pakai `Camera`.

### 3.3 People, visitors, face recognition

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| People | Objek manusia secara umum. | Hitungan dan statistik umum. | Persons | `New people`, `of 42 people seen` |
| Visitors | Orang yang berkunjung. | Konteks kunjungan (analytic `face_visitor_attendance`, event `face_visitor_registered`). | Mengganti dengan `people` atau `new persons` | `New visitors (24h)` |
| Recognized people | Orang yang berhasil diidentifikasi melalui face recognition (`face_recognition`). | Daftar hasil pengenalan wajah. | Recognized faces, identified persons | `Recognized people` |
| Unique people | Jumlah orang unik setelah deduplikasi. | Hanya jika data benar-benar sudah dideduplikasi. | `Different people` | `Unique people` |
| Unknown | Hasil pengenalan tanpa nama atau grup (fallback di `live-recognitions.ts`). | Badge grup pada hasil pengenalan. | Unidentified, N/A | `Unknown` |
| Stranger | Alarm akses `face_stranger`. | Hanya untuk alarm akses. Bukan sinonim `Unknown`. | Unknown person | `Stranger` |
| Outside whitelist | Alarm akses `face_not_in_whitelist`. | Alarm akses. | Not whitelisted | `Outside whitelist` |
| Recognitions | Semua hasil recognizer (wajah dan plat), dikelompokkan per analytic. | Hitungan lintas recognizer. Jangan dipersempit menjadi wajah. | Faces | `Recognitions (24h)` |
| Face attributes | Atribut wajah terdeteksi (umur, masker, emosi, dan sebagainya). | Judul panel atribut. | Face details | `Face attributes` |

Catatan kode:
- `Unique people`: panel re-identification menghitung
  `new Set(person_id).size` dari `person_sightings` dalam 24 jam
  (`build-dashboard.ts`). Itu dedup berdasarkan `person_id`, jadi
  definisi **sesuai** untuk panel ini. Belum terbukti bahwa `person_id`
  unik lintas edge server. Jika beberapa edge dipilih sekaligus, angka
  ini mengasumsikan `person_id` konsisten antar edge.
- `New people` / `people seen`: `newPersons.total` adalah jumlah baris
  `person_seen_results`, bukan jumlah orang unik. Teks
  `of {n} people seen` menyiratkan orang unik. **Perbedaan semantik.**
  Jangan mengganti dengan `Unique people` untuk angka ini.
- `Visitors`: nilai KPI adalah jumlah event `face_visitor_registered`.
  Cocok dengan label `New visitors`, selama setiap event adalah satu
  pendaftaran baru.

### 3.4 Person re-identification

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Person re-identification | Analytic `people_reidentification`. | Judul panel. Tulis lengkap. | Re-ID, ReID | `Person re-identification` |
| Sightings | Jumlah kemunculan orang pada kamera. | Statistik re-identification. | Detections | `Sightings` |
| New / Returning | Orang baru dan orang yang sudah pernah terlihat. | Label progress bar. | Repeat | `New`, `Returning` |

### 3.5 Vehicle dan license plate

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| License plate | Plat nomor kendaraan dari analytic `license_plate_recognition`. | Judul panel dan label penuh. | Number plate, LPR di UI | `License plates` |
| Plate read | Satu pembacaan plat oleh kamera. | Deskripsi dan unit. | Scan | `Plate reads, last 24 hours` |
| Vehicle | Kendaraan hasil pembacaan plat, dengan tipe dan warna. | Tipe: `Car`, `Motorbike`, `Unknown`. | Automobile | `Vehicles` |
| Unknown vehicle | Kendaraan tanpa tipe dan warna yang dikenali. | Fallback nama kendaraan. | Unidentified vehicle | `Unknown vehicle` |

### 3.6 Safety dan workplace

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| PPE | Personal protective equipment. Akronim baku. | Judul, label, KPI. | Safety gear | `PPE violations (24h)` |
| PPE violation | Alarm `ppe_missing`: ada item PPE yang tidak terpasang. | Hitungan pelanggaran. | PPE alarm | `Violations` |
| Missing PPE | Rincian item PPE yang tidak terpasang. | Judul panel rincian per item. | Absent PPE | `Missing PPE` |
| Fire and smoke | Alarm `fire_smoke_detected`, dibagi `Fire` dan `Smoke`. | Judul panel. | `Fire & smoke` | `Fire and smoke` |
| Crowd density | Jumlah orang di area saat alarm `crowd_limit_exceeded` dibanding batas. | Judul panel. | Crowding | `Crowd density` |
| Headcount | Jumlah orang yang terhitung di area. | Deskripsi. | Count of people | `Peak headcount at alarm vs limit` |
| Dust level | Tingkat debu saat alarm `dust_detected`. | Judul panel. | Dust concentration | `Dust level` |
| Worker absence | Alarm `worker_absent`: pekerja tidak berada di area. | Judul panel. | Absent worker | `Worker absence` |
| Phone use **[Pending]** | Aktivitas penggunaan ponsel, bukan jumlah panggilan telepon. Display terminology sementara. | Label statistik dan teks UI generik. | Phone calls | `Phone use` |
| Phone calling | Nama analytic `phone_calling` dan alarm-nya. | Label analytic dan alarm tipe ini (sesuai nama teknis). | Mengganti nama analytic | `Phone calling` |
| Asleep on duty | Alarm `sleep_on_duty`. | Label statistik. | Sleeping | `Asleep on duty` |

Catatan kode:
- `Phone use` **[Pending]**: di kode, alarm bernama `phone_call`,
  analytic `phone_calling` berlabel `Phone Calling`, dan judul edge
  `Phone Calling Alarm`. Tidak ada definisi di repo yang menyatakan
  apakah deteksinya hanya mengenali orang yang sedang menelepon atau
  semua penggunaan ponsel. Karena itu:
  - `Phone use` dipertahankan sebagai display terminology sementara.
    Definisinya menunggu konfirmasi tim Edge.
  - Jangan menganggap analytic mencakup seluruh aktivitas penggunaan
    ponsel.
  - Label analytic dan alarm tipe ini memakai `Phone calling`, sama
    dengan nama teknisnya.
  - Technical identifier (`phone_call`, `phone_calling`) tidak berubah.
  - Jika Edge mengonfirmasi cakupannya, selaraskan `Phone use` dan
    `Phone calling` menjadi satu istilah.
- `Fire and smoke`: judul panel di kode masih `Fire & smoke`
  (`fire-status.tsx`). Daftar di §7.

### 3.7 Access control

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Access security | Alarm wajah `face_stranger` dan `face_not_in_whitelist`. | Judul panel. | Access control (untuk panel ini) | `Access security` |
| Face alarm | Alarm yang berasal dari analytic wajah. | Deskripsi panel. | Face event | `Face alarms per hour` |

### 3.8 Recording, playback, server

**[Belum diaudit]** Recording, playback, server, dan konektivitas belum
diaudit. Label menu yang ada: `Playback`, `Servers`, `Cameras`.

## 4. Quality rules

1. Panel title tidak diakhiri titik.
2. Panel description tidak diakhiri titik.
3. Empty state mengikuti pola `No {plural noun}.` dengan titik.
4. Rentang waktu: label KPI memakai `(24h)`. Deskripsi panel memakai
   `Last 24 hours`. Empty state memakai `in the last 24 hours`. Panel
   berbasis waktu wajib menyebut rentangnya.
5. Singular dan plural benar secara tata bahasa, termasuk di tooltip
   dan template string.
6. Legend memakai nama kategori yang sama dengan glossary dan dalam
   bentuk singular (`Stranger`). Hitungan memakai plural.
7. Unit konsisten: durasi `45s`, `1m 5s`, `1h 2m` (lihat
   `duration()`), persentase `12%`.
8. Akronim baku seperti PPE dan ID diperbolehkan.
9. Jangan memakai `Avg`. Tulis `Average`.
10. Jangan mencampur `People`, `Persons`, dan `Visitors` untuk konsep
    yang sama (§3.3).
11. Jangan memakai `&`. Tulis `and`.
12. Nama menu dan page title memakai sentence case (§1).
13. Jangan mengganti istilah hanya demi seragam jika maknanya berbeda
    (contoh: `people seen` yang menghitung baris bukan orang unik).
    Laporkan sebagai perbedaan semantik.

## 5. Copy patterns

| Komponen | Pola | Contoh |
|---|---|---|
| Empty state | `No {plural noun}.` | `No cameras found.` |
| Empty state (waktu) | `No {plural noun} in the last 24 hours.` | `No alarms in the last 24 hours.` |
| Success | `{Object} {past verb} successfully.` | `Camera added successfully.` |
| Error | `Failed to {verb} {object}.` | `Failed to connect to the server.` |
| Validation | `{Field} is required.` | `Camera name is required.` |
| Button | `{Verb} {object}` | `Add camera` |
| Confirmation | `{Verb} this {object}?` | `Delete this camera?` |
| KPI | `{Noun} ({range})` | `Alarms (24h)` |
| Chart description | `{Range}, by {dimension}` | `Last 24 hours, by risk level` |
| Count with unit | `{n} {singular or plural}` | `1 alarm`, `2 alarms` |

Pola adalah titik awal, bukan teks yang di-hardcode untuk semua kondisi.

## 6. Data dari Edge dan label display

Frontend bertanggung jawab atas display label dan formatting UI.
Payload dari Edge adalah data, bukan teks siap tampil.

- Jangan menganggap kapitalisasi payload Edge sebagai standar display.
- Jangan menampilkan string payload mentah ke pengguna jika labelnya
  bisa dipetakan.
- Nilai payload dan technical identifier tidak boleh diubah. Yang dibuat
  adalah label display di frontend.

### 6.1 Aturan label analytic dan alarm (final)

Semua label analytic dan alarm mengikuti sentence case. Akronim baku
(PPE, ID) tetap kapital.

| Teks lama | Teks baru |
|---|---|
| `Dwelling Alarm` | `Dwelling alarm` |
| `Fire Smoke Alarm` | `Fire smoke alarm` |
| `PPE Violation` | `PPE violation` |
| `Crowd Density` | `Crowd density` |
| `Person Re-Identification` | `Person re-identification` |
| `People Counting and Dwelling` | `People counting and dwelling` |
| `Phone Calling` | `Phone calling` |

Catatan: `Fire smoke alarm` adalah bentuk yang diputuskan untuk judul
alarm. Glossary memakai `Fire and smoke` untuk judul panel (§3.6). Dua
bentuk ini ada di konteks berbeda (nama alarm vs judul panel).
**[Pending]** konfirmasi apakah nama alarm juga menjadi
`Fire and smoke alarm`.

### 6.2 Kondisi saat ini (hasil pemeriksaan kode)

| Sumber | Kondisi | Catatan |
|---|---|---|
| Id analytic (`people_counting_dwelling`, `phone_calling`, ...) | Peta label sudah ada di `config/analytics-catalog.ts` (18 entri). | Label Title Case. Harus menjadi sentence case. |
| Judul grup analytic | `features/analytics/lib/analytic-groups.ts` punya judul sendiri (`Fire & Smoke Detection`, `Personnel Protective Equipment (PPE)`, `Cat Detection Alert`). | Judul ini berbeda dari catalog untuk analytic yang sama (`Fire and Smoke Detection`, `PPE Violation`). Ini duplikasi label yang sudah ada. |
| Judul alarm (`alarm.title`) | Dashboard menampilkan string Edge apa adanya pada `Alarms by type`. Contoh: `Dwelling Alarm`, `Fire Smoke Alarm`, `Sleep Alarm`, `PPE Violation`. | Title Case dan akhiran `Alarm` tidak konsisten. Tidak ada peta label. |
| Kind alarm (`ppe_missing`, `phone_call`, ...) | Enum stabil, terdokumentasi di `docs/database-schema.md`. | Namespace berbeda dari id analytic. |
| Recognizer (`face_recognition`, ...) | Dashboard memakai `titleCase()` pada id. | `titleCase()` hanya menaikkan huruf pertama dan mengganti `_` dengan spasi. Namanya menyesatkan. |
| Atribut wajah | Memakai `plainLabel()` (sentence case). | Sesuai aturan. |

### 6.3 Desain canonical label mapping (rekomendasi)

Produk memutuskan memakai **satu** mekanisme canonical display label.
Dokumen ini hanya menetapkan desainnya. Implementasi belum dilakukan.

Prinsip:
1. **Satu sumber.** Perluas peta di `config/analytics-catalog.ts`.
   Jangan membuat registry duplikat. Judul grup di
   `analytic-groups.ts` harus diturunkan dari atau diselaraskan dengan
   peta ini, bukan ditulis ulang.
2. **Tiga namespace terpisah.** Jangan mengasumsikan identifier ketiganya
   identik atau saling bisa dipakai sebagai kunci:

   | Namespace | Contoh | Sumber |
   |---|---|---|
   | Alarm kind | `phone_call`, `cat_detected`, `ppe_missing` | `alarm_events.kind` |
   | Analytic ID | `phone_calling`, `cat_detection`, `ppe_violation` | `devices.analytic_id`, `config/analytics-catalog.ts` |
   | Recognizer ID | `face_recognition`, `face_visitor_attendance` | `recognitions.recognizer` |

   Bukti perbedaan: `phone_call` (kind) vs `phone_calling` (analytic),
   `cat_detected` vs `cat_detection`, `ppe_missing` vs `ppe_violation`.
   Pemetaan antar namespace, jika dibutuhkan, harus eksplisit, bukan
   hasil tebakan dari kesamaan string.
3. **Canonical label adalah sumber utama tampilan.** Judul dari Edge
   (`alarm.title`) hanya fallback.
4. **Fallback aman untuk identifier tidak dikenal.** Urutan: label
   canonical, lalu judul Edge jika ada, lalu bentuk terbaca dari id
   (garis bawah menjadi spasi, sentence case). Identifier yang tidak
   dikenal tidak boleh membuat UI error atau kosong.
5. **Technical identifier tidak berubah.** Kunci peta, nilai di
   database, payload, dan query tetap memakai id asli.
6. **Fallback dilaporkan.** Identifier yang jatuh ke fallback sebaiknya
   terlihat di log pengembangan agar peta bisa dilengkapi.
7. **Bentuk peta (usulan, belum diputuskan).** Satu modul config dengan
   tiga peta terpisah (kind, analytic, recognizer), masing-masing
   `id -> label`, dan satu fungsi pencarian per namespace dengan
   fallback di atas.

Dampak yang perlu dicek saat implementasi:
- Dashboard `Alarms by type` mengelompokkan berdasarkan `alarm.title`.
  Setelah ada peta, pengelompokan sebaiknya memakai kind, agar dua judul
  Edge berbeda untuk kind yang sama tidak terpecah.
- Perubahan label tidak boleh mengubah hasil filter atau query yang
  memakai id.

## 7. Teks yang belum sesuai keputusan

Hanya untuk referensi saat penerapan. Teks di kode belum diubah.

### Dashboard

| Lokasi | Teks saat ini | Teks sesuai aturan |
|---|---|---|
| `widgets.tsx` (`new-persons`) | `New persons` | `New people` |
| `widgets.tsx` (`faces`) | `Recognized faces` | `Recognized people` |
| `widgets.tsx` (`kpi-average`) | `Avg alarms per hour` | `Average alarms per hour` |
| `widgets.tsx` (`reid`) | `Different people` | `Unique people` (definisi sesuai, lihat §3.3) |
| `widgets.tsx` (`behavior`) | `Phone calls` | `Phone use` (konfirmasi edge, lihat §3.6) |
| `fire-status.tsx` | `Fire & smoke` | `Fire and smoke` |
| `fire-status.tsx` | `No fire or smoke alarms in 24 hours.` | `No fire or smoke alarms in the last 24 hours.` |
| `widgets.tsx` (`heatmap`) | `Alarms per hour` tanpa rentang | `Last 24 hours, alarms per hour` |
| `widgets.tsx` (`access`) | `Strangers` dan legend `Stranger` | Satu bentuk per konteks (§4.6) |
| `widgets.tsx` | Beberapa `NoData` tanpa teks | Pola `No {noun}.` atau default |
| `format.ts` | `titleCase()` | Temuan terpisah: nama menyesatkan |

### Menu dan page title (sentence case)

| Lokasi | Teks saat ini | Teks sesuai aturan |
|---|---|---|
| `config/navigation.ts:34` | `Live View` | `Live view` |
| `config/navigation.ts:37` | `Object Search` | `Object search` |
| `app/(app)/live/page.tsx:16` | `Live View` | `Live view` |
| `app/(app)/search/page.tsx:4` | `Object Search` | `Object search` |
| `features/camera-detail/components/live-panel.tsx:21,29` | `Live View`, `Pause Live View` | `Live view`, `Pause live view` |

### Alert menjadi alarm (keputusan final, §3.1)

| Lokasi | Teks saat ini | Teks sesuai definisi |
|---|---|---|
| `config/navigation.ts:36`, `app/(app)/alerts/page.tsx:16` | `Alerts` | `Alarms` |
| `features/alerts/components/alerts-view.tsx:163` | `No alerts found` | `No alarms found.` |
| `features/analytics/components/analytic-alert-history.tsx:44-50` | `Alert History`, `No alerts`, `No alerts from this ... yet.` | `Alarm history`, `No alarms.`, `No alarms from this ... yet.` |
| `features/playback/components/playback-view.tsx:246`, `features/camera-detail/components/playback-panel.tsx:239` | `Alert type` | `Alarm type` |
| `features/floorplan/components/floorplan-panel.tsx:180` | `Alerts (24h)` | `Alarms (24h)` |
| `features/cameras/components/cameras-view.tsx:302` | `Alerts it already raised are kept.` | `Alarms it already raised are kept.` |
| `app/api/alerts/route.ts:33` | `Failed to load alerts` | `Failed to load alarms.` (teks error ke pengguna) |

Tidak berubah: rute `/alerts`, endpoint `/v1/alarms` dan `/api/alerts`,
nama fitur dan komponen, enum, dan nilai status `alert` di
`features/edge-status`.

### Label analytic (sentence case, §6.1)

| Lokasi | Teks saat ini | Teks sesuai aturan |
|---|---|---|
| `config/analytics-catalog.ts` | 18 label Title Case (`People Counting and Dwelling`, `PPE Violation Advance`, `People Re-Identification`, `Phone Calling`, ...) | Sentence case, PPE tetap kapital |
| `config/analytics-catalog.ts:46` dan `analytic-groups.ts:145` | `Cat Detection Alert` | `Cat detection alert` **[Pending]**: kata `Alert` di nama analytic mungkin seharusnya `alarm` |
| `analytic-groups.ts` | Judul grup Title Case, `Fire & Smoke Detection` | Sentence case, `and`. Selaraskan dengan peta canonical (§6.3) |
| Dashboard `Alarms by type` | Judul Edge: `Dwelling Alarm`, `Fire Smoke Alarm`, `Sleep Alarm` | Label dari peta canonical (§6.3) |
| `phone_calling` / `phone_call` | `Phone Calling` | `Phone calling` |

## 8. Validasi dokumen

Hasil pemeriksaan keputusan produk terhadap kode:

| Keputusan | Hasil |
|---|---|
| Alarm = event analytic/sistem | Sesuai. Halaman `/alerts` mengambil `/v1/alarms`. |
| Alert = notifikasi | Perbedaan: `alert` dipakai untuk event di banyak teks UI dan sebagai status teknis. Teks UI diputuskan memakai `Alarms` (final). Rute, API, dan status `alert` tetap. Lihat §3.1 dan §7. |
| Camera = sumber video | Sesuai. |
| Device = perangkat/endpoint | Perbedaan: semua `Device` di database adalah kamera. Lihat §3.2. |
| People, Visitors, Recognized people | Sesuai untuk definisi. Teks di kode masih memakai `persons` dan `faces`. |
| Unique people | Sesuai untuk panel re-identification (dedup `person_id`). Tidak untuk `people seen`. Lihat §3.3. |
| Phone use | **[Pending]** Belum terbukti. Nama teknis memakai `calling`. Label analytic dan alarm memakai `Phone calling`. Perlu konfirmasi Edge. Lihat §3.6. |
| Label analytic sentence case | Sesuai keputusan. Kode masih Title Case dan punya dua sumber label (`analytics-catalog.ts`, `analytic-groups.ts`). Lihat §6.2. |
| Menu sentence case | Sesuai. Teks di kode masih Title Case. Lihat §7. |

Batas validasi:
- Dashboard diaudit menyeluruh. Halaman lain hanya lewat pencarian teks
  untuk istilah yang diputuskan.
- Aturan §1 sampai §6 tidak saling bertentangan. Konflik yang ada
  adalah antara aturan dan kode (§7), bukan antar aturan.
- Dokumen ini belum menyatakan seluruh frontend konsisten.
