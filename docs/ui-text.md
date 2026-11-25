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
  - **Live view dan PTZ** (`features/live`, `features/ptz`): diaudit
    teks dan state-nya (§3.9 dan §3.10).
  - **Komponen shared** yang dipakai Live view dan PTZ (`Pick`,
    side panel, toolbar, empty state, dialog hapus, toast): diaudit
    untuk teks dan aksesibilitas (§2.1 dan §2.2). Isi `components/ui/*`
    (primitif) tidak diaudit baris per baris.
  - **Halaman lain** (alerts, playback, floorplan, map, analytics,
    cameras, navigasi): hanya dicari lewat pencarian teks untuk istilah
    yang diputuskan. Belum diaudit menyeluruh.
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
| Empty state | `No {plural noun}.` diakhiri titik. Jika terikat waktu: `No {plural noun} in the last 24 hours.` Keterangan tempat boleh ditambahkan: `No presets saved on this camera.` Pada `EmptyState`, judul memakai pola ini (dengan titik) dan deskripsi berisi langkah berikutnya sebagai satu kalimat bertitik. | `No layouts.` / `Create a layout to start watching cameras.` |
| Error message (inline) | Apa yang gagal, dalam bahasa pengguna, diakhiri titik. Tanpa stack trace atau detail internal. | `Failed to connect to the server.` |
| Toast (error) | Judul: `Failed to {verb} {object}` tanpa titik, karena berfungsi sebagai judul. Deskripsi: kalimat lengkap bertitik, berisi penyebab jika diketahui. Fallback deskripsi: `The command could not be completed.` | judul `Failed to update the layout` |
| Toast (peringatan sebagian) | Judul: kalimat singkat tanpa titik yang menyebut apa yang tidak lengkap. | `Some edge servers did not respond` |
| Success notification | Objek + kata kerja lampau + `successfully`, diakhiri titik. | `Camera added successfully.` |
| Tooltip dan aria-label | Frasa pendek, tanpa titik. Keduanya menyebut tindakan dan objeknya dengan kata kerja yang sama. `aria-label` boleh lebih spesifik (menambah nama item), tetapi tidak boleh lebih samar dari tooltip. | `Close PTZ controls`, `Go to preset` / `Go to Gate` |
| Confirmation dialog | Judul berupa pertanyaan dengan objek. Tombol memakai kata kerja yang sama dengan aksinya. | `Delete this camera?` / `Delete` |
| Loading state | Skeleton jika bentuk konten diketahui. Teks hanya jika perlu: `Loading {noun}`. Untuk proses yang sedang berjalan, akhiri dengan satu karakter elipsis `…` (bukan tiga titik) tanpa titik tambahan. | `Loading alarms`, `Connecting…` |

Pola form, validation, notification, tooltip, confirmation, dan loading
adalah pola awal. Belum diverifikasi menyeluruh terhadap halaman selain
Dashboard **[Belum diaudit]**.

### 2.1 Jenis teks

Satu aksi dapat punya beberapa teks. Aturannya tidak sama untuk semuanya.

| Jenis | Siapa yang melihat | Aturan |
|---|---|---|
| Visible text | Semua pengguna | Mengikuti §1 sampai §2. |
| Tooltip (atribut `title`) | Pengguna mouse. Tidak tampil di layar sentuh dan tidak andal untuk keyboard. | Mengulang nama tindakan. Jangan menjadi satu-satunya tempat informasi penting, termasuk alasan tombol nonaktif. |
| Accessible name (`aria-label`, label field) | Pembaca layar | Menyebut tindakan dan objek. Sama dengan visible text atau tooltip, atau lebih spesifik. Tidak boleh bertentangan. |
| Accessible description (`aria-description`, `aria-describedby`) | Pembaca layar | Untuk penjelasan tambahan, misalnya alasan tombol nonaktif. Saat ini tidak dipakai di mana pun di luar `components/ui`. |
| Technical identifier (`id`, `kind`, `value`, kunci state) | Kode | Tidak pernah diubah demi teks UI. |

Aturan tambahan:
- Kontrol ikon saja: `aria-label` dan `title` memakai teks yang sama
  (komponen shared sudah melakukannya dari satu prop `label`).
- Tombol toggle: pilih **satu** cara. Label tetap dengan `aria-pressed`
  (contoh: `Detections`), atau label berubah menurut state tanpa
  `aria-pressed` (contoh: `Show PTZ controls` / `Hide PTZ controls`).
  Jangan memakai keduanya.
- Tombol yang tidak bisa ditekan dan butuh alasan (contoh: `Talk is in
  use on another camera`): alasan harus ada di accessible description,
  bukan hanya di `title`.
- Aksi sekali tekan (membuka halaman, menjalankan perintah) bukan
  toggle. Jangan beri `aria-pressed`.

### 2.2 Komponen shared yang membawa teks

| Komponen | Prop teks | Jenis teks | Dipakai oleh |
|---|---|---|---|
| `Pick` (`components/shared/pick.tsx`) | `label`, `items[].label` | `label` = accessible name saja (tidak tampil). `items[].label` = visible text. | 27 file: 25 di 11 fitur (live, playback, alerts, cameras, camera-detail, users, tickets, floorplan, servers, analytics, faces) dan 2 komponen shared (`time-picker`, `side-panel`). |
| `PanelPicker` + `PanelActions` | `title`, `createLabel`, `deleteLabel` | `title` = accessible name Pick dan section. `deleteLabel` = visible text + `aria-label` + `title`. | `PanelPicker`: live, floorplan. `PanelActions`: servers (dan lewat `PanelPicker`). |
| `PanelIconAction`, `PlacementAction` | `label`, `addLabel`, `removeLabel` | `aria-label` + `title` (satu sumber). | live, floorplan, map |
| `PanelSearch` | `placeholder` | Placeholder (visible). `aria-label` diturunkan dengan `placeholder.replace(/\.+$/, "")`. | users, cameras, alerts, faces, `DeviceTree` (live, floorplan, map, analytics) |
| `PanelSection` | `title` | `aria-label` section. Judul tidak tampil. | live, ptz, floorplan, servers |
| `PanelEmpty`, `EmptyState` | `title`, `description` | Visible text | 17 file (§7 Komponen shared) |
| `PanelReset` | teks tetap `Reset` | Visible text | tickets, users, cameras, alerts, faces |
| `PanelSelected`, `PanelDetail` | `Status` + `DEVICE_STATE_LABEL` | Visible text | map, floorplan |
| `ToolbarToggle` | `label` | `aria-label` + `title`, plus `aria-pressed` | live, ptz, talk, edge-status |
| `DeleteConfirmDialog` | `title`, `description`, `confirmLabel`, teks tetap `Cancel` | Visible text | users, cameras |
| `useFailureToast` | `title`, pesan | Judul toast + deskripsi (pesan digabung dengan ` · `). Toast tidak hilang otomatis (`timeout: 0`) dan ditutup saat komponen unmount. | 15 file di 13 fitur (live, users, tickets, map, floorplan, analytics, camera-detail, servers, cameras, playback, faces, alerts, object-search) |
| Tooltip primitif (`components/ui/tooltip`) | | Hanya dipakai `components/ui/sidebar.tsx` dan halaman showcase. Semua tooltip lain memakai atribut `title`. | sidebar |

Catatan: `DeviceTree` (shared) membuat teks sendiri: `Search {noun}...`,
`No {noun} match`, `No {noun}`, `Try a different search.`

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

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Edge server | Server yang menjalankan SAMTEK Edge. Data tersimpan sebagai `edgeServers`/`servers` di Central. | Semua teks yang merujuk ke server tersebut. | `Server` saja, `edge` saja sebagai kata benda (`the edge`) | `Edge server is offline` |

Keputusan: gunakan `Edge server` untuk server yang menjalankan SAMTEK
Edge. `Server` saja hanya boleh bila konteks sudah jelas dari judul
halaman dan tidak ada server lain yang mungkin dirujuk.

Catatan kode (tidak diubah):
- Teks yang memakai `server` saja: menu `Servers`, `Add server`,
  `Edit server`, `No servers yet`, `Could not delete the server`,
  label state `Server offline` (`lib/device-state.ts`).
- Teks yang memakai `edge` saja: `Could not restart the edge`,
  `Search is not available on this edge`, `The edge rejected the talk
  request.`, `The edge sent an unreadable answer`, `The edge refused`.
- Teks yang sudah sesuai: `Edge server is offline`, `Some edge servers
  did not respond`, `The edge server went offline.`
- **[Pending]** apakah menu `Servers` menjadi `Edge servers`. Halaman
  itu mengelola server Edge, tetapi daftar servernya disimpan di
  Central, jadi perlu konfirmasi bahwa tidak ada jenis server lain.

**[Belum diaudit]** Recording, playback, dan konektivitas. Label menu
yang ada: `Playback`, `Cameras`.

### 3.9 Live view dan PTZ

Teks menu dan page title: `Live view` (sentence case, §1). Section PTZ:
`Speed scale`, bukan `Speed Scale`.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Layout | Susunan kamera yang disimpan pengguna (`/v1/layouts`), berisi nama, deskripsi opsional, flag default, dan daftar kamera per slot. Nama bawaan dibuat otomatis: `Layout {n}`. | Teks yang merujuk ke susunan kamera pada Live view. | View, scene | `New layout`, `Delete layout` |
| Slot | Satu sel dalam grid layout. | Hanya untuk sel yang belum berisi kamera. | Cell, box | `Empty slot` |
| Stream | Aliran video langsung dari kamera lewat relay WebRTC. | Konteks Live view. Bedakan dari stream playback. | Feed, channel | `Stream` |
| Main stream | Sumber utama kamera (`sourceMain`). Selalu tersedia. | Pilihan kualitas. Label pendek: `Main`. | High quality, HD | `Main stream` |
| Sub stream | Sumber kedua kamera (`sourceSub`). Hanya ada jika diset. | Pilihan kualitas bawaan di Live view. Label pendek: `Sub`. | Low quality | `Sub stream` |
| Third stream | Sumber ketiga kamera (`sourceThird`). Hanya ada jika diset. | Pilihan kualitas. Label pendek: `Third`. | Extra stream | `Third stream` |
| PTZ | Pan, tilt, zoom. Akronim baku, selalu uppercase. | Tulis `PTZ` di semua teks, termasuk `PTZ controls`. | Ptz, Pan-tilt-zoom (kecuali penjelasan) | `PTZ controls` |
| Pan | Gerak kamera ke kiri atau kanan. | Kontrol arah. | Rotate, turn | `Pan left`, `Pan right` |
| Tilt | Gerak kamera ke atas atau bawah. | Kontrol arah. | Angle | `Tilt up`, `Tilt down` |
| Zoom | Perbesaran lensa. | Kontrol lensa. | Scale | `Zoom in`, `Zoom out` |
| Focus | Fokus lensa. | Kontrol lensa. | Sharpness | `Increase focus`, `Decrease focus` |
| Preset | Posisi PTZ bernama yang disimpan pada kamera (token + nama). Bawaan jika tanpa nama: `Preset {token}`. | Daftar posisi tersimpan. | Position, bookmark | `Add preset`, `Go to preset` |
| Home position | Posisi awal PTZ (perintah `home`). | Tombol kembali ke posisi awal. | Reset | `Go to home position` |
| Speed scale | Pengali kecepatan gerak PTZ, 0.1 sampai 1.0 (nilai slider dikalikan ke sumbu pan, tilt, zoom). | Label slider. | Speed Scale | `Speed scale` |

Catatan kode:
- Terminologi stream: id teknis `main`, `sub`, `third` tidak diubah. Di
  pilihan toolbar Live view tertulis `Sub stream` dan `Main stream`;
  di pilihan per kamera tertulis `Main`, `Sub`, `Third`. Bentuk pendek
  dan panjang boleh dipakai selama konteksnya jelas, tetapi `Third
  stream` belum muncul di toolbar global karena hanya ada dua opsi.
- Gerak diagonal pada pad PTZ (final): `Move up left`, `Move up right`,
  `Move down left`, `Move down right`. Label saat ini (`Pan up left`
  dan sejenisnya) mengirim pan dan tilt sekaligus
  (`axes: { pan: -1, tilt: 1 }`), jadi nama `Pan` tidak akurat.
- `REC` (final) tetap dipakai sebagai indikator recording pada tile
  (`isRecordingEnabled`). Ini pengecualian dari larangan singkatan di
  §1 dan masuk daftar akronim baku.
- Fokus (final): `Decrease focus` / `Increase focus`.
- `Speaker` (`SpeakerToggle`, `Mute speaker`) dan `Mute` pada player
  WebRTC (`aria-label` `Mute` / `Unmute`) mengatur audio yang sama
  secara konsep, tetapi bernama berbeda. **[Pending]** satu istilah
  untuk audio kamera (kandidat: `audio`). `Talk` adalah mikrofon ke
  kamera dan berbeda dari keduanya.

### 3.10 Status kamera dan stream

Ada dua lapis status yang berbeda dan tidak boleh dicampur.

**Lapis 1: state tile** (`StreamState` di `features/live/types.ts`):

| State | Cara penentuan di kode | Definisi | Overlay saat ini | Label di `aria-label` saat ini |
|---|---|---|---|---|
| `live` | Kamera aktif, server online, device tidak error. | Stream sedang dipantau. | Video | `Live` |
| `disabled` | Server: `!device.isEnabled` (`get-live.ts`). | Kamera dinonaktifkan. | `Camera is disabled` | `Disabled` |
| `server-offline` | Server: `isServerOnline` gagal. Client: `server.isActive && edge ada di daftar MQTT online`; tanpa MQTT, memakai nilai server. | Edge server tidak dapat dihubungi. | `Edge server is offline` | `Offline` |
| `stream-offline` | Client: device ada di daftar *faulty*, yaitu device dengan `status === "error"` pada pesan status Edge. | Stream kamera tidak tersedia. | `Camera stream is offline` | `Offline` |

Temuan: dua state berbeda memakai label yang sama, `Offline`, pada
`aria-label` tile (`${tile.name}, ${label}`). Overlay visual sudah
berbeda, tetapi pengguna pembaca layar tidak bisa membedakannya.

**Lapis 2: status player WebRTC** (`PlayerStatus`, hanya saat tile
`live`):

| Status | Cara penentuan | Definisi | Teks saat ini |
|---|---|---|---|
| `connecting` | Awal sesi atau URL berubah. | Stream sedang menghubungkan. | `Connecting…` |
| `reconnecting` | Koneksi terputus atau perlu dicoba ulang. | Stream mencoba terhubung kembali. | `Reconnecting…` |
| `unavailable` | Relay tidak punya alamat WebRTC (`webrtcUrl` dan `webrtcUrlLocal` kosong) atau elemen video belum ada. | Alamat stream belum tersedia. Bukan berarti kamera mati. | `Stream address is not available` |
| `playing` | Frame pertama diterima. | Berjalan normal. | Tanpa teks |

Pemetaan istilah yang diputuskan produk:

| Kondisi | Istilah | Status verifikasi |
|---|---|---|
| Edge server tidak dapat dihubungi | `Server offline` | Sesuai dengan `server-offline`. **[Pending validation]** state ini juga muncul bila `server.isActive` bernilai false (server dinonaktifkan), bukan hanya tidak terjangkau. |
| Stream kamera tidak tersedia | `Stream unavailable` | Sesuai dengan `stream-offline`. **[Pending validation]** hanya nilai `status === "error"` yang dikenali sebagai faulty. Nilai status device lain dari Edge tidak terdokumentasi di repo. |
| Kamera dinonaktifkan | `Disabled` | Sesuai dengan `disabled`. |
| Stream sedang menghubungkan | `Connecting` | Sesuai dengan status player `connecting`. |
| Stream mencoba terhubung kembali | `Reconnecting` | Sesuai dengan status player `reconnecting`. |
| Player `unavailable` (alamat relay kosong) | `Stream unavailable` | Diputuskan produk untuk konteks stream. Catatan: label ini sekarang mencakup dua penyebab berbeda (device `error` dan alamat relay kosong). Teks penjelas saat ini `Stream address is not available` dapat dipertahankan sebagai deskripsi. |

Sumber label yang sudah ada:
- `lib/device-state.ts` memuat `DEVICE_STATE_LABEL`:
  `Live`, `Disabled`, `Server offline`, `Stream offline`. Dipakai
  `PanelSelected` pada map dan floorplan.
- `features/live/components/camera-tile.tsx` punya peta sendiri
  (`Offline` untuk dua state) yang tidak memakai `DEVICE_STATE_LABEL`.
- Union empat state yang sama dideklarasikan tiga kali:
  `StreamState` (`features/live/types.ts`), `DeviceState`
  (`lib/device-state.ts`), dan `floorplan/types.ts`.
- Rekomendasi: label state hanya berasal dari `DEVICE_STATE_LABEL`,
  dengan `Stream offline` diganti `Stream unavailable` sesuai keputusan.
  Ini bagian dari canonical label mapping (§6.3). Belum diimplementasikan.

Aturan:
- Jangan memakai satu label `Offline` untuk `server-offline` dan
  `stream-offline`.
- Label `aria-label` tile memakai istilah dari tabel di atas.
- `Live` adalah label state, bukan perintah. Tidak diubah.
- Satu istilah dipakai di seluruh halaman yang memakai state ini.
  Peta dan floorplan memakai union state yang sama
  (`floorplan/types.ts`, `map-panel.tsx`) dan belum diaudit. Jangan
  menyatakan keduanya sudah sesuai.

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
14. Judul toast tidak diakhiri titik. Deskripsi toast adalah kalimat
    bertitik.
15. Pesan error memakai pola `Failed to {verb} {object}`. Jangan
    memakai `Could not {verb}` atau `{Object} failed`. Sebelum mengubah
    pesan, periksa operasi sebenarnya yang dijalankan kode.
16. Pasangan kontrol bersifat simetris: `Zoom in` / `Zoom out`,
    `Increase focus` / `Decrease focus`, `Pan left` / `Pan right`,
    `Tilt up` / `Tilt down`.
17. Tooltip dan `aria-label` menyebut tindakan dan objek. Jangan
    memakai `Close` saja jika `aria-label` menyebut objeknya.
18. Satu label tidak boleh dipakai untuk dua kondisi dengan arti
    berbeda (contoh: `Offline` untuk server dan stream).
19. Akronim baku (PPE, ID, PTZ) ditulis uppercase di semua posisi.
20. Placeholder berupa contoh diawali `e.g.`.
21. Empty state dibedakan: data memang kosong, `No {plural noun}.`;
    hasil pencarian atau filter kosong, `No {plural noun} found.`
    dengan deskripsi `Try a different search.` atau
    `No {plural noun} match the filters.`. Jangan memakai `yet`.
22. Teks proses berjalan memakai satu karakter elipsis `…`
    (`Loading layout…`, `Search users…`). Jangan memakai `...`.
23. Aksi destruktif memakai dialog konfirmasi
    (`DeleteConfirmDialog`): judul `Delete {name}?`, tombol
    `Delete {object}`, `Cancel` untuk batal, deskripsi menjelaskan
    akibat dalam kalimat bertitik.
24. Alasan sebuah kontrol nonaktif harus tersedia sebagai accessible
    description, bukan hanya `title` (§2.1).

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
| Toast error (judul) | `Failed to {verb} {object}` | `Failed to update the layout` |
| Toast error (fallback deskripsi) | `The command could not be completed.` | |
| Kontrol berpasangan | `{Verb} {object}` / lawannya | `Increase focus` / `Decrease focus` |
| Placeholder | `e.g. {example}` | `e.g. Gate` |
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
| `features/ptz/components/ptz-panel.tsx:132` | `Speed Scale` | `Speed scale` (juga di §7 Live view dan PTZ) |

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

### Live view dan PTZ (§3.9, §3.10)

| Lokasi | Teks saat ini | Teks sesuai aturan |
|---|---|---|
| `features/ptz/components/ptz-panel.tsx:132` | `Speed Scale` | `Speed scale` |
| `features/live/components/live-view.tsx:124` | `No layouts yet` | `No layouts.` |
| `features/live/components/live-view.tsx:125` | `Create a layout to start watching cameras.` | Sudah sesuai |
| `features/live/components/live-view.tsx:132` (tombol) | `Create layout` | Sudah sesuai |
| `features/live/components/live-view.tsx:99` | `Could not update the layout` | `Failed to update the layout` (konteks: create, delete, dan ubah slot, jadi `update` bersifat umum) |
| `features/ptz/hooks/use-ptz.ts:105` | `Could not go home` | `Failed to move the camera to its home position` |
| `features/ptz/hooks/use-ptz.ts:110` | `Could not go to the preset` | `Failed to move the camera to the preset` (usulan) |
| `features/ptz/hooks/use-ptz.ts:117` | `Could not save the preset` | `Failed to save the preset` |
| `features/ptz/hooks/use-ptz.ts:125` | `Could not delete the preset` | `Failed to delete the preset` |
| `features/ptz/hooks/use-ptz.ts:27` | `The command failed` (fallback) | `The command could not be completed.` |
| `features/ptz/hooks/use-ptz.ts:61` | `PTZ command failed` (gerak dan fokus) | `Failed to send the PTZ command` (usulan) |
| `features/ptz/hooks/use-ptz.ts:85` | `PTZ stop failed` | `Failed to stop the PTZ movement` (usulan) |
| `features/ptz/components/ptz-panel.tsx` (fokus) | `Focus decrease` / `Focus increase` | `Decrease focus` / `Increase focus` (final) |
| `features/ptz/lib/pad.tsx` (diagonal) | `Pan up left`, `Pan up right`, `Pan down left`, `Pan down right` | `Move up left`, `Move up right`, `Move down left`, `Move down right` (final) |
| `features/ptz/components/ptz-panel.tsx:214-215` | `aria-label` `Close PTZ controls`, tooltip `Close` | Tooltip `Close PTZ controls` |
| `features/live/components/camera-preview.tsx:46-47` | `aria-label` `Close {camera}`, tooltip `Close` | Tooltip `Close {camera}` |
| `features/ptz/components/ptz-preset-dialog.tsx:57` | placeholder `Gate` | `e.g. Gate` |
| `features/live/components/camera-tile.tsx:28-31` | label `Offline` untuk `server-offline` dan `stream-offline` | `Server offline` dan `Stream unavailable` (setelah validasi §3.10) |
| `components/shared/edge-offline.tsx` | `Edge server is offline` | Sudah sesuai (§3.8) |
| `components/shared/stream-offline.tsx`, `webrtc-player.tsx:22` | `Camera stream is offline`, `Stream address is not available` | `Stream unavailable` sebagai judul, teks lama sebagai deskripsi (§3.10) |
| `features/live/components/webrtc-player.tsx:175` | `Mute` / `Unmute` | **[Pending]** istilah audio (§3.9) |
| `features/live/components/camera-tile.tsx` | badge `REC` | Dipertahankan (final, §3.9) |
| `features/live/components/live-view.tsx:73` | `Some edge servers did not respond` | Sudah sesuai (peringatan sebagian) |

Catatan: jangan mengubah pesan error sebelum operasi sebenarnya
dikonfirmasi. Hasil pemeriksaan: toast di `use-ptz.ts` berasal dari
`act(title, command)` dan `hold()`. Deskripsi toast berisi pesan dari
Edge jika error adalah `Error`, sehingga hanya judul dan fallback yang
dikendalikan frontend.

### Komponen shared (§2.1, §2.2)

Hasil audit teks:

| Lokasi | Temuan | Rekomendasi |
|---|---|---|
| `device-panel.tsx` (`createLabel`) | `New layout` di panel, `Create layout` di empty state, untuk aksi yang sama | Satu istilah, kandidat `Create layout` |
| `floorplan-panel.tsx` (`createLabel`) | `New floor plan` | Selaraskan dengan pola `{Verb} {object}` |
| `server-list-panel.tsx` (`createLabel`) | `Add server` | `Add edge server` sesuai §3.8 |
| `PanelSearch` pemakai | `Search users...`, `Search cameras...`, `Search people...`, `Search alerts...`, `Search {noun}...` (DeviceTree) | Elipsis `…` (aturan 22). `Search alerts…` ikut menjadi `Search alarms…` (§3.1) |
| `multi-select.tsx`, `search-index-fields.tsx` | placeholder `Add...` dan `Add label...` | `Add…`, `Add label…` |
| `alerts-view.tsx:114` | `Loading...` | `Loading…` |
| Empty state di 17 file | `No users yet`, `No floor plans yet`, `No perimeters yet`, `No servers yet`, `No faces yet`, `No groups yet`, `No layouts yet`, `No alerts found`, `No cameras`, `No tickets`, `No ${noun} match` | Aturan 21. Variasi dengan dan tanpa `yet`, dengan dan tanpa `found`, belum seragam |
| `DeleteConfirmDialog` pemakai | Judul `Delete {name}?` sudah sesuai. Deskripsi cameras: `Alerts it already raised are kept.` | `Alarms` (§3.1) |
| `useFailureToast` pemakai | Pola dominan `Could not {verb} {object}` di users, tickets, map, analytics, camera-detail, servers, live, cameras, faces. `Could not delete` (faces) tanpa objek | Aturan 15 (`Failed to ...`). Ini perubahan lintas 13 fitur dan butuh keputusan cakupan sebelum diterapkan |
| Pesan `Error` yang dilempar kode | `The edge sent an unreadable answer`, `The edge refused`, `The edge rejected the talk request.`, `The device cannot talk now: ...` | `Edge server` (§3.8). `device` untuk kamera diganti `camera` (§3.2). Tampil sebagai deskripsi toast |
| `lib/device-state.ts` | `Stream offline` | `Stream unavailable` (§3.10) |
| `camera-tile.tsx` | `Offline` untuk dua state | Pakai `DEVICE_STATE_LABEL` (§3.10) |
| `PanelPicker` Live | Tombol `Delete layout` langsung menghapus tanpa konfirmasi | Aturan 23. Ini temuan perilaku, bukan hanya teks |

Hasil audit aksesibilitas:

| Lokasi | Temuan | Rekomendasi |
|---|---|---|
| `ToolbarToggle` + `fullscreen-toggle`, `speaker-toggle`, `ptz-toggle` | Label berubah menurut state dan `aria-pressed` juga di-set. State diumumkan dua kali dan dapat membingungkan | Pilih satu cara (§2.1). Contoh: label tetap `Fullscreen` dengan `aria-pressed`, atau label berubah tanpa `aria-pressed` |
| `camera-web-toggle.tsx` | `pressed={false}` konstan pada aksi sekali tekan (`Open camera web page`) | Bukan toggle. Hilangkan `aria-pressed` |
| `talk-control.tsx` | `aria-label="Talk"` tetap, tetapi `title` berubah: `Talk needs a signed-in user`, `Talk is in use on another camera` | Alasan nonaktif ke accessible description |
| `talk-control.tsx` | `Hold to speak`, `Stop talk`, `Talk`: tiga label untuk satu fitur | Tinjau urutan kata kerja (`Start talk` / `Stop talk`) **[Pending]** |
| `camera-preview.tsx`, `ptz-panel.tsx` | `aria-label` spesifik, tooltip `Close` | Samakan (rekomendasi di §7 Live view dan PTZ) |
| `Pick` | `label` hanya menjadi accessible name. Teks tidak tampil, nilai terpilih saja yang tampil. Dua pick terkait memakai nama berbeda: `Stream` (toolbar) dan `Stream quality` (per kamera) | Satu nama per pengaturan. Putuskan `Stream quality` untuk keduanya **[Pending]** |
| `PanelSearch` | `aria-label` diturunkan dari placeholder dengan regex `/\.+$/` | Saat placeholder memakai `…`, regex harus ikut diubah, atau `aria-label` diberi prop sendiri |
| Seluruh app | `aria-description` / `aria-describedby` tidak dipakai di luar `components/ui` | Mulai dari alasan kontrol nonaktif (aturan 24) |
| Tooltip | Semua tooltip aplikasi adalah atribut `title`. `components/ui/tooltip` hanya dipakai sidebar | Jangan menaruh informasi penting hanya di `title` |

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
| Status kamera dan stream (§3.10) | Perbedaan semantik terbukti: `server-offline` dan `stream-offline` berbeda sumber (heartbeat server vs status device `error`), tetapi berbagi label `Offline`. Pemetaan final **[Pending validation]** untuk server `isActive` false dan nilai status device selain `error`. |
| Pesan error Live view dan PTZ | Konteks diverifikasi: `Could not update the layout` dipakai untuk create, delete, dan ubah slot. Pesan PTZ berasal dari `act()` dan `hold()`. |
| Istilah PTZ, stream, preset | Definisi ditelusuri ke kode (`sourceMain/Sub/Third`, `axes`, `PtzPreset`). Istilah audio, diagonal, `REC`, dan `Server` vs `Edge server` **[Pending]**. |
| Komponen shared (§2.2) | Penggunaan dihitung dari pencarian impor di `app`, `features`, `components`, `lib`, `hooks`. Teks tiap komponen ditelusuri. Primitif `components/ui/*` tidak diaudit baris per baris. |
| Aksesibilitas | Diperiksa lewat kode, tidak diuji dengan pembaca layar atau alat audit otomatis. Temuan di §7 bersifat kode, bukan hasil uji. |
| Label analytic sentence case | Sesuai keputusan. Kode masih Title Case dan punya dua sumber label (`analytics-catalog.ts`, `analytic-groups.ts`). Lihat §6.2. |
| Menu sentence case | Sesuai. Teks di kode masih Title Case. Lihat §7. |

Batas validasi:
- Dashboard diaudit menyeluruh. Halaman lain hanya lewat pencarian teks
  untuk istilah yang diputuskan.
- Aturan §1 sampai §6 tidak saling bertentangan. Konflik yang ada
  adalah antara aturan dan kode (§7), bukan antar aturan.
- Dokumen ini belum menyatakan seluruh frontend konsisten.
