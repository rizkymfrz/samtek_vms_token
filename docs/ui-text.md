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
  - **Edge status** (`features/edge-status`): diaudit teksnya
    (§3.28).
  - **Recognitions** (`features/recognitions`): diaudit teksnya
    (§3.29).
  - **Talk** (`features/talk`): diaudit teksnya (§3.27).
  - **Header dan sidebar** (`components/layout`, `components/ui/sidebar.tsx`):
    diaudit teksnya (§3.26).
  - **Settings** (`/settings`): diperiksa (§3.25). Halaman kosong.
  - **Login** (`/login`, `features/auth`, menu pengguna): diaudit
    teksnya (§3.24).
  - **Manage faces** (`/analytics/[slug]/faces`, `features/faces`):
    diaudit teksnya (§3.23).
  - **Camera web page** (`/cameras/[id]/web`, `features/camera-web`):
    diaudit (§3.22). Hampir tanpa teks UI.
  - **Camera detail** (`/cameras/[id]`, `features/camera-detail`):
    diaudit teksnya (§3.21).
  - **Users** (`/users`, `features/users`): diaudit teksnya (§3.20).
  - **Analytics** (`/analytics`, `features/analytics`): diaudit
    teksnya (§3.19). Halaman kelola wajah (`faces`) belum diaudit.
  - **Edge servers** (`/servers`, `features/servers`): diaudit
    teksnya (§3.18).
  - **Cameras** (`/cameras`, `features/cameras`): diaudit teksnya
    (§3.17).
  - **Map** (`/map`, `features/map`): diaudit teksnya (§3.16).
  - **Floor plans** (`/floorplan`, `features/floorplan`): diaudit
    teksnya (§3.15).
  - **Tickets** (`/tickets`, halaman publik `/t`, `features/tickets`):
    diaudit teksnya (§3.14).
  - **Object search** (`/search`, `features/object-search`): diaudit
    teksnya (§3.13).
  - **Alarms** (halaman `/alerts`, `features/alerts`, plus popover
    notifikasi di header): diaudit teksnya (§3.12).
  - **Playback** (`features/playback`, plus `PlaybackTimeline` dan
    `use-playback-session` dari `features/camera-detail`): diaudit
    teksnya (§3.11). Halaman camera-detail yang memakai komponen yang
    sama belum diaudit.
  - **Komponen shared** yang dipakai Live view dan PTZ (`Pick`,
    side panel, toolbar, empty state, dialog hapus, toast): diaudit
    untuk teks dan aksesibilitas (§2.1 dan §2.2). Isi `components/ui/*`
    (primitif) tidak diaudit baris per baris.
  - **Semua halaman, header, sidebar, dan fitur pendukung** (talk,
    edge-status, recognitions) sudah diaudit teksnya. Daftar per bagian
    ada di §3.9 sampai §3.29. Pengecualian: `/showcase` (halaman demo
    developer) dan teks dalam `components/ui/*` yang bukan bawaan kita.
  - Verifikasi hanya lewat kode, lint, `tsc`, dan unit test. Belum ada
    pemeriksaan tampilan di browser dan belum ada uji pembaca layar.
- Bagian bertanda **[Belum diaudit]** belum diverifikasi. Jangan
  menganggapnya baku.
- Tidak ada sistem i18n atau berkas copy terpusat. Teks UI ditulis
  langsung di komponen dan config. Peta label kanonik: id analytic
  di `config/analytics-catalog.ts`, kind alarm dan id recognizer di
  `config/display-labels.ts` (§6.3).

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
| Unit | Satuan singkat tanpa spasi untuk `s`, `m`, `h`, `%`, `x`. Unit lain ditulis lengkap, huruf kecil. Pengali kecepatan memakai `x`. | `45s`, `1h 2m`, `12 reads`, `0.25x` |
| Button/action | Kata kerja + objek, sentence case, tanpa titik. | `Add camera` |
| Form label | Kata benda, tanpa titik dan tanpa titik dua. | `Camera name` |
| Placeholder | Contoh nilai atau petunjuk singkat. Bukan pengganti label. | `e.g. Main entrance` |
| Validation | Kalimat lengkap, menyebut field, diakhiri titik. | `Camera name is required.` |
| Empty state (teks biasa, `NoData`) | `No {plural noun}.` diakhiri titik. Jika terikat waktu: `No {plural noun} in the last 24 hours.` Keterangan tempat boleh ditambahkan: `No presets saved on this camera.` | `No alarms.` |
| Empty state (komponen `EmptyState`) | Judul: `No {plural noun}` **tanpa titik** (judul, sama dengan judul error state seperti `Search failed`). Deskripsi: langkah berikutnya sebagai satu kalimat bertitik. | `No layouts` / `Create a layout to start watching cameras.` |
| Error message (inline) | Apa yang gagal, dalam bahasa pengguna, diakhiri titik. Tanpa stack trace atau detail internal. | `Failed to connect to the server.` |
| Toast (error) | Judul: `Failed to {verb} {object}` tanpa titik, karena berfungsi sebagai judul. Deskripsi: kalimat lengkap bertitik, berisi penyebab jika diketahui. Fallback deskripsi: `The command could not be completed.` | judul `Failed to update the layout` |
| Toast (peringatan sebagian) | Judul: kalimat singkat tanpa titik yang menyebut apa yang tidak lengkap. | `Some edge servers did not respond` |
| Success notification | Objek + kata kerja lampau + `successfully`, diakhiri titik. | `Camera added successfully.` |
| Tooltip dan aria-label | Frasa pendek, tanpa titik. Keduanya menyebut tindakan dan objeknya dengan kata kerja yang sama. `aria-label` boleh lebih spesifik (menambah nama item), tetapi tidak boleh lebih samar dari tooltip. | `Close PTZ controls`, `Go to preset` / `Go to Gate` |
| Confirmation dialog | Judul berupa pertanyaan dengan objek. Tombol memakai kata kerja yang sama dengan aksinya. | `Delete this camera?` / `Delete` |
| Loading state | Skeleton jika bentuk konten diketahui. Teks hanya jika perlu: `Loading {noun}`. Untuk proses yang sedang berjalan, akhiri dengan satu karakter elipsis `…` (bukan tiga titik) tanpa titik tambahan. | `Loading alarms`, `Connecting…` |

Pola form, validation, notification, tooltip, confirmation, dan loading
sudah dicocokkan dengan semua halaman yang diaudit (§3.9 sampai
§3.29). Pengecualian yang disetujui dicatat di bagian halaman masing-
masing.

Metadata dan halaman error:
- Judul tab memakai `{judul halaman} · SAMTEK` (template di
  `app/layout.tsx`), deskripsi situs `Video management system`.
- Halaman error global (`app/(app)/error.tsx`): `This page couldn't
  load` dan `The SAMTEK server or an edge server may be unreachable.
  Try again in a moment.` Tombol `Try again`. Apostrof memakai tanda
  lurus (`'`), bukan tanda lengkung.

Format tanggal dan waktu (zona `Asia/Jakarta`, 24 jam, nama bulan
tetap `Jan` sampai `Dec`). Satu sumber: `lib/format-date.ts`.

| Bentuk | Format | Contoh | Dipakai untuk |
|---|---|---|---|
| Tanggal | `dd MMM yyyy` | `03 Sep 2026` | Kolom tanggal, pemilih tanggal |
| Waktu | `HH:mm:ss` | `14:05:09` | Jam peristiwa |
| Tanggal dan waktu | `dd MMM yyyy HH:mm:ss` | `03 Sep 2026 14:05:09` | Detail dialog dan field |
| Tanggal dan waktu ringkas | `dd MMM HH:mm` | `03 Sep 14:05` | Kolom tabel |
| Hari dan bulan | `dd MMM` | `03 Sep` | Daftar yang sudah memuat konteks tahun |

Pengecualian yang disetujui:
- Sumbu grafik dan label jam Dashboard memakai `HH:mm`.
- Jam dan tanggal di header memakai `HH:mm:ss` dan `Mon, 3 Nov 2026`
  (gaya header).
- Timeline playback memakai `HH:mm:ss` atau `HH:mm` menurut zoom.
- Jangan memakai `Intl` atau `toLocale*String` langsung untuk teks
  tampil. Pakai helper bersama agar nama bulan tidak berubah antar
  versi ICU (`Sept` vs `Sep`).

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
  (contoh: `Detections`, `Fullscreen`, `Audio`, `PTZ controls`), atau
  label berubah menurut state tanpa `aria-pressed` (contoh tombol biasa:
  `Mute audio` / `Unmute audio`). Jangan memakai keduanya. Semua
  `ToolbarToggle` memakai label tetap dengan `aria-pressed`.
- Tombol yang tidak bisa ditekan dan butuh alasan (contoh: `Talk is in
  use on another camera`): alasan ada di accessible description
  (`aria-description`) dan boleh juga di `title`, tetapi tidak hanya di
  `title`.
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
`No {noun} found`, `No {noun}`, `Try a different search.`

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

Pembagian pemakaian (final):
- **Alarm**: halaman daftar (`/alerts`), kolom, filter, hitungan, empty
  state, dialog detail, riwayat, dan statistik.
- **Alert**: popover notifikasi di header (bell), toast alarm baru, dan
  `Mark all as read`. Satu alarm memicu satu alert.

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
| Phone calling | Orang yang sedang menelepon: pergelangan tangan dekat kepala (jarak < 0,75 lebar bahu) bertahan 1 detik, dan mayoritas dari 10 penilaian terakhir positif. Alarm `phone_call`, analytic `phone_calling`. | Statistik, label analytic, dan alarm tipe ini. | `Phone use`, `Phone calls` | `Phone calling` |
| Asleep on duty | Alarm `sleep_on_duty`. | Label statistik. | Sleeping | `Asleep on duty` |

Catatan kode:
- `Phone calling` (final, dikonfirmasi tim Edge): analytic ini
  mendeteksi orang yang sedang menelepon, bukan keberadaan ponsel.
  Cara kerja: model pose, pelacakan ByteTrack, tangan dekat kepala
  selama 1 detik, alarm maksimal sekali per 5 detik per orang. Tidak ada
  deteksi objek ponsel.
  - `Phone use` dan `Phone calls` **tidak dipakai**. `Phone use` terlalu
    luas, `Phone calls` terdengar seperti jumlah panggilan.
  - Batasan: tangan diam di dekat telinga (menggaruk kepala,
    membetulkan topi) dapat memicu alarm. Ponsel yang dipakai jauh dari
    kepala (membaca) tidak terdeteksi. Analytic belum diuji dengan orang
    yang benar-benar menelepon. Jangan menulis teks UI yang menjanjikan
    deteksi penggunaan ponsel secara umum.
  - Technical identifier (`phone_call`, `phone_calling`) tidak berubah.
- `Fire and smoke`: judul panel sudah diterapkan di `fire-status.tsx`.

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
- Menu dan page title `Servers` menjadi `Edge servers` (final). Teks
  di panel daftar, dialog tambah/ubah, dialog hapus, empty state, dan
  toast hapus/restart pada halaman itu sudah disesuaikan. Sisa teks di
  halaman Edge servers (tab scan, detail, metrik) belum diaudit.

Konektivitas: kondisi terhubung memakai `Online` dan `Offline` untuk
edge server dan perangkat bodyworn (§3.16, §3.26), serta state kamera
(§3.10). Dua istilah itu tidak dipakai untuk kamera.

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
- Audio kamera (final): istilahnya `Audio`. Toggle di toolbar tile
  berlabel `Audio` (dengan `aria-pressed`), tombol di player berlabel
  `Mute audio` / `Unmute audio`. Hindari `Speaker`. `Talk` adalah
  mikrofon ke kamera dan berbeda dari audio.
- Talk (final): `Start talk`, `Hold to speak`, `Stop talk`.
- Pengaturan kualitas stream (final): `Stream quality` di toolbar dan
  per kamera.
- Aksi buat layout (final): `Create layout` di panel dan empty state.
- Hapus layout memakai dialog konfirmasi: judul `Delete {name}?`,
  tombol `Delete layout`.

### 3.10 Status kamera dan stream

Ada dua lapis status yang berbeda dan tidak boleh dicampur.

**Lapis 1: state kamera** (`DeviceState` di `lib/device-state.ts`, satu
sumber untuk Live, Playback, Cameras, Floorplan, Map, Analytics, dan
Camera detail):

| State | Cara penentuan (`deviceStateOf`, urutan prioritas) | Label | Overlay |
|---|---|---|---|
| `disabled` | Kamera dinonaktifkan (`isEnabled` false). | `Disabled` | `Camera is disabled` |
| `server-disabled` | Edge server tidak aktif (`isActive` false). | `Edge server disabled` | `Edge server is disabled` |
| `server-offline` | Edge server aktif tetapi tidak terjangkau (heartbeat server, atau daftar MQTT online di client). | `Server offline` | `Edge server is offline` |
| `stream-offline` | Edge melaporkan `status: error` dengan `reason` `stream_offline`, atau `error` tanpa `reason` (Edge lama). | `Stream unavailable` | `Stream unavailable` |
| `device-error` | Edge melaporkan `status: error` dengan `reason` selain stream. | `Camera error` | `Camera error` |
| `live` | Selain di atas. | `Live` | Video |

Label berasal dari satu tempat: `DEVICE_STATE_LABEL`. Daftar state di
`cameras/lib/camera-state.ts`, `camera-marker`, dan filter status
kamera memakainya. Union state dideklarasikan sekali
(`DeviceState`); `StreamState` pada live, cameras, dan camera-detail
adalah alias.

**Lapis 2: status player WebRTC** (`PlayerStatus`, hanya saat kamera
`live`):

| Status | Cara penentuan | Definisi | Teks |
|---|---|---|---|
| `connecting` | Awal sesi atau URL berubah. | Stream sedang menghubungkan. | `Connecting…` |
| `reconnecting` | Koneksi terputus atau perlu dicoba ulang. | Stream mencoba terhubung kembali. | `Reconnecting…` |
| `unavailable` | Relay tidak punya alamat WebRTC (`webrtcUrl` dan `webrtcUrlLocal` kosong) atau elemen video belum ada. | Alamat stream belum tersedia. Bukan berarti kamera mati. | `Stream unavailable` |
| `playing` | Frame pertama diterima. | Berjalan normal. | Tanpa teks |

`Stream unavailable` kini mencakup dua penyebab berbeda (device
`error` dengan alasan stream, dan alamat relay kosong). Keduanya
diputuskan memakai label yang sama dalam konteks stream.

Status device dari Edge (`devices[].status` pada `edge.state`,
dikonfirmasi tim Edge) dan field `reason` (hanya muncul bersama
`degraded` atau `error`, himpunan tertutup):

| Status | Arti | `reason` | Penanganan di frontend |
|---|---|---|---|
| `running` | Berjalan normal. | tidak ada | `live` |
| `starting` | Menyambung stream atau memuat model (sementara). | tidak ada | `live`. Jangan tampil sebagai kegagalan. |
| `stopped` | `enabled: false` atau dihentikan. | tidak ada | `live`. Status `disabled` berasal dari data kamera. |
| `degraded` | Sebagian stream (main atau sub) putus. | `stream_degraded` | Tetap `live` (video diputar). Tile Live menampilkan badge `Stream unavailable`. |
| `error` | Semua stream putus lebih dari 1 detik. | `stream_offline` | `stream-offline` |
| `error` | Analytic atau parameter ditolak. | `analytic_invalid` | `device-error` |
| `error` | Sumber `bodyworn://` tanpa `SAMTEK_BODYWORN_SERVER_URL`. | `bodyworn_unconfigured` | `device-error` |
| `error` | Grup inference tidak bisa dibuat (model hilang, perangkat gagal). | `inference_unavailable` | `device-error` |
| `error` | Worker kamera gagal, macet, atau tidak menjawab. | `worker_failed`, `worker_stalled`, `worker_hung` | `device-error` |

Aturan:
- Frontend mencocokkan `reason` (himpunan tertutup), tidak pernah teks
  `detail` yang bebas.
- `error` tanpa `reason` (Edge versi lama) tetap `stream-offline`, sama
  seperti perilaku sebelum `reason` ada.
- `reason` yang tidak dikenal pada `error` diperlakukan sebagai
  `device-error`.
- Jangan memakai satu label `Offline` untuk dua kondisi berbeda.
- Label `aria-label` kartu dan tile memakai label dari tabel di atas.
- `Live` adalah label state, bukan perintah.

Belum diterapkan:
- `degraded` (`stream_degraded`) hanya tampil sebagai badge pada tile
  Live (label `Stream unavailable`, final). Halaman lain (Playback,
  Cameras, Floorplan, Map, Camera detail) belum menampilkannya.
- Pohon perangkat pada peta (`map-panel.tsx`) belum membedakan
  `server-disabled` dan `device-error`. State di sana masih dihitung
  dari daftar server online dan boolean gangguan.
- `device-error` belum menampilkan `detail` dari Edge.

### 3.11 Playback dan recording

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Playback | Menonton rekaman kamera lewat sesi playback di Edge server. | Menu, page title, judul. | Replay, history | `Playback` |
| Recording | Rekaman video yang disimpan Edge server, diaktifkan per kamera (`isRecordingEnabled`). | Teks tentang data rekaman. Indikator pada tile live memakai `REC` (§3.9). | Footage, video archive | `No recording at this time.` |
| Recording range | Rentang waktu yang tercakup rekaman (`RecordingRange`: `from`, `to`). | Isi timeline. Istilah teknis, jarang tampil. | Segment | |
| Clip | Rentang rekaman yang menyambung. Pada Playback, rentang digabung dari semua kamera terpilih (`mergeRanges`). | Tombol lompat antar rentang. | Chapter | `Previous clip`, `Next clip` |
| Timeline | Garis waktu satu hari dengan rentang rekaman, posisi, dan penanda alarm. | Accessible name dan deskripsi. | Scrubber, seekbar | `Seek recording timeline` |
| Alarm marker | Penanda alarm pada timeline. Isinya judul alarm dan dapat difilter per tipe. | Filter di bawah timeline. | Alert marker, event marker | `Alarm type`, `All alarms` |
| Playback speed | Pengali kecepatan putar: 0.25, 0.5, 1, 2, 4, 8 (`SPEEDS`). | Ditulis dengan `x`. | Rate, tanpa unit | `1x`, `0.25x` |
| Slower / Faster | Menurunkan dan menaikkan satu langkah pada daftar kecepatan. Bukan lompat waktu. | Tombol kontrol. | Rewind, Fast forward | `Slower`, `Faster` |

Catatan kode:
- Tombol kecepatan (final): `Slower` / `Faster`. Tombol ini hanya
  mengubah kecepatan (`stepSpeed`), bukan memutar mundur, jadi
  `Rewind` / `Fast forward` tidak akurat. Ikon tidak berubah.
- `End of recording` (final, dikonfirmasi tim Edge): state `ended`
  berarti rekaman device itu habis. Bukan akhir klip dan bukan akhir
  hari. Celah antar segmen sampai 300 detik dilompati otomatis. Edge
  memandang rekaman sebagai satu timeline kontinu tanpa batas hari.
  Sesi masih dapat di-seek ulang. Sesi klip alarm (`event_id`) juga
  berstatus `ended` di akhir jendela klip, tetapi pemutar klip alarm
  memutar ulang otomatis dan tidak menampilkan teks akhir. Jika kelak
  ditampilkan, gunakan `End of clip`, dan bedakan dari `End of
  recording` lewat sumber sesi (`device_id` atau `event_id`).
- Judul alarm pada penanda timeline memakai label kanonik kind alarm
  (§6.3), dengan judul Edge sebagai cadangan.
- Pesan error sesi playback berasal dari dua sumber: teks kode
  (`The playback session ended`, fallback `Failed to play the
  recording.`) dan pesan Edge yang diteruskan apa adanya.

### 3.12 Halaman Alarms dan notifikasi

Menu dan page title: `Alarms` (rute tetap `/alerts`).

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Alarm | Satu baris event dari `/v1/alarms`. | Daftar, kolom, filter, hitungan. | Alert di halaman daftar | `Alarms`, `0 alarms`, `No alarms found` |
| Alert (notifikasi) | Popover bell dan toast yang memberi tahu alarm baru. | Hanya di notifikasi. | Alarm untuk popover | `Alerts` (judul popover), `No alerts.` |
| Snapshot | Gambar tangkapan saat alarm (`imageUrl`). | Kolom tabel dan tab gambar. | Screenshot, photo | `Snapshot` |
| Alarm clip | Klip video pendek di sekitar alarm, diputar dari sesi klip (`event_id`). Bukan rekaman berkelanjutan. | Tab dan pemutar pada dialog detail. | `Clip` saja (tertukar dengan clip di Playback) | `Alarm clip` |
| Confidence | Skor keyakinan deteksi (`score`), tampil sebagai persen. | Section dialog detail. | Score, accuracy | `Confidence` |
| Track ID | Id pelacakan objek. `0` berarti tidak ada. | Field dialog detail. | Tracker, Object ID | `Track ID`, `None` |
| Perimeter | Area atau garis yang dilanggar (`name (shape)`). `None` bila tidak ada. | Field dialog detail. | Zone | `Perimeter` |
| Object | Jenis objek yang terdeteksi. | Kolom dan field. | Class, label | `Object` |
| Event ID | Id event dari Edge (`edgeId:event_id`). | Field dengan tombol salin. | Alarm ID | `Event ID`, `Copy event ID` |

Catatan:
- Pemutar alarm clip memakai tombol kecepatan yang sama dengan
  Playback (`stepSpeed`), jadi tombolnya `Slower` / `Faster` dan
  kecepatan ditulis `1x` (§3.11).
- `Back 10 seconds` dan `Forward 10 seconds` melompat waktu dan
  tidak diubah.
- Pesan error pemutar klip: `Failed to control the alarm clip.`,
  `Failed to play the alarm clip.`, `The alarm clip session ended.`
- Rincian tambahan pada dialog (`Details`) diberi label dari kunci
  Edge lewat `titleCase()` (huruf pertama kapital, garis bawah
  menjadi spasi). Kuncinya bebas dari Edge, jadi tidak ada peta label.
- Judul alarm di filter `Type`, kolom, dan dialog memakai label
  kanonik kind alarm (§6.3), dengan judul Edge sebagai cadangan.
- Waktu relatif (notifikasi): `now`, `{n}m ago`, `{n}h ago`,
  `{n}d ago`.

### 3.13 Object search

Menu dan page title: `Object search` (sentence case).

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Object search | Pencarian objek lewat teks bebas (`GET /v1/search`, model teks-gambar SigLIP 2). | Menu, judul. | Text search, visual search | `Object search` |
| Search index | Penyimpanan embedding objek per kamera. Hanya kamera yang indeksnya aktif yang dicari. | Konteks pengaturan kamera dan empty state. | Database | `Search index` |
| Object | Jenis objek hasil (`label` dari Edge, misalnya `person`). | Field pada kartu dan dialog. Sama dengan `Object` di halaman Alarms. | Label | `Object` |
| Match | Kecocokan teks query dan objek, dikalibrasi ke 0..100% (`confidence`). Hanya untuk `person`. | Progress dan persen pada kartu dan dialog. | Confidence (di Object search) | `Match` |
| Similarity | Kemiripan mentah teks dan gambar (kosinus). Ada untuk semua objek. Nilainya kecil secara alami: sekitar 0.15 sudah baik. | Ditampilkan sebagai angka, bukan persen. | `sim`, persen | `Similarity 0.152` |
| Track key | ULID yang dibuat Edge saat track pertama terlihat. Unik global. | Salin dan kelompokkan hasil. | Track ID (konsep berbeda) | `Track key` |
| Text model | Model yang mengubah teks query menjadi embedding. | Pesan tidak tersedia. | Language model | `The text model is missing` |

Catatan:
- `Match` ditampilkan bila `confidence` ada (hanya `person`). Bila
  tidak ada, tampilkan `Similarity` apa adanya. Jangan menampilkan
  similarity sebagai persen, karena `15%` menyesatkan.
- `Confidence` pada Alarms adalah skor detektor (seberapa yakin
  detektor bahwa kotak itu objeknya). Itu bukan kecocokan dengan teks,
  jadi jangan memakai nama `Match` di sana, dan jangan memakai
  `Confidence` di Object search. Skor detektor (`object.confidence`)
  tidak ditampilkan di Object search.
- `Track key` dan `Track ID` (Alarms) bukan konsep yang sama.
  `track_id` berasal dari ByteTrack, integer, dan mulai dari 1 lagi
  setiap tracker dibuat ulang. `track_key` unik global. Keduanya tidak
  bisa dipetakan lewat API saat ini. Jangan membandingkan atau
  menampilkan keduanya seolah satu id.
- Tab `Recording` pada dialog memutar rekaman kamera (sesi playback
  `device_id`) mulai sebelum waktu hasil, sama dengan Playback. Tombol
  `Slower` / `Faster` hanya mengubah kecepatan. `End of recording.`
  berarti rekaman kamera itu habis (§3.11).
- Pesan validasi mengikuti pola `{Field} is required.` dan kalimat
  bertitik: `Search text is required.`, `Search text contains control
  characters.`, `Start time must be before end time.`
- Pesan `Search is not available on this edge server` menggantikan
  `edge` saja (§3.8).
- Satu orang yang muncul lagi di kamera mendapat `Track key` baru.
  Tidak ada identitas lintas track. Itu batas fitur, bukan galat.

### 3.14 Tickets

Menu dan page title: `Tickets`. Halaman publik `/t` (link yang dikirim
lewat WhatsApp) berjudul `Ticket`.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Ticket | Catatan tindak lanjut atas alarm dari satu kamera dan analytic, dengan assignee, status, bukti foto, dan riwayat. Dibuat otomatis oleh ticket rule. | Seluruh halaman Tickets. | Case, incident | `Tickets`, `Ticket ID` |
| Ticket rule | Pengaturan per Edge server dan event kind: apakah alarm jenis itu membuat tiket. Perubahan berlaku untuk alarm yang diterima sesudahnya. | Dialog `Ticket rules`. | Policy | `Ticket rules` |
| Event kind | Jenis alarm (`kind` dari Edge) pada daftar rule. | Daftar rule. Memakai label kanonik kind alarm (§6.3). | Alarm type di dialog ini | `Create tickets for {kind}` |
| Assignee | Orang yang ditugaskan menangani tiket. `Unassigned` bila kosong. | Kolom, filter, field. | Owner, officer | `Assignee`, `Assigned to me` |
| Supervisor | Penerima eskalasi bila tidak ada yang acknowledge sampai batas waktu. | Riwayat dan peringatan eskalasi. | Manager | `Escalated to a supervisor` |
| Acknowledge | Aksi assignee menyatakan tiket diterima. Batasnya `Acknowledge before`. | Tombol dan status `Acknowledged`. | Accept, confirm | `Acknowledge` |
| Start | Aksi mulai menangani tiket. Status `In progress`, riwayat `Work started`. | Tombol. | Begin | `Start` |
| Request resolution | Aksi assignee meminta penyelesaian, dengan catatan dan hasil (`Resolved` atau `False alarm`). Status menjadi `Awaiting approval`. Wajib ada minimal satu foto bukti. | Tombol dan judul form. | Close (sebagai nama aksi) | `Request resolution` |
| Approve / Reject | Aksi supervisor menyetujui atau menolak resolusi. | Tombol dan judul form (`Approve resolution`, `Reject resolution`). | Accept, decline | `Approve`, `Reject` |
| Awaiting approval | Status sesudah resolusi diminta (`resolve_requested`), sebelum supervisor menjawab. | Badge status. Satu keadaan, berbeda dari aksi `Request resolution`. | Pending | `Awaiting approval` |
| Resolved | Hasil tiket yang diselesaikan. | Status dan hasil. | Closed | `Resolved` |
| False alarm | Hasil tiket yang ternyata bukan kejadian nyata. | Status dan hasil. Sama dengan istilah di Dashboard. | Not an issue | `False alarm` |
| Evidence | Foto bukti yang diunggah pada tiket. | Section dan tombol `Add photo`. | Attachment | `Add photo` |

Catatan:
- Status tiket (final): `Open`, `Acknowledged`, `In progress`,
  `Awaiting approval`, `Resolved`, `False alarm`. Status adalah
  keadaan, aksi adalah tindakan. Jangan menyatukan `Awaiting approval`
  dan `Request resolution`.
- Tombol `Acknowledge` dan `Start` dibiarkan tanpa objek. Konteks
  dialog tiket sudah jelas.
- Server pada halaman ini adalah Edge server: `Edge server`,
  `All edge servers`, `Edge server {id}` (§3.8).
- Hitungan kejadian memakai `×` (`Reassigned 2×`). Pengali kecepatan
  memakai `x` (`1x`). Dua tanda ini berbeda fungsi dan tidak
  dicampur.
- `Acknowledge before` adalah batas waktu acknowledge
  (`ackDeadlineAt`). Bila lewat tanpa acknowledge, tiket naik ke
  supervisor.
- Peringatan eskalasi: `Nobody acknowledged this ticket. A supervisor
  needs to step in.` Kata `officer` tidak dipakai.
- Pesan error service (`Ticket not found`, `Rule not found`, dan
  sejenisnya) belum terbukti tampil ke pengguna. Tidak diubah.
- Event kind pada ticket rule memakai label kanonik kind alarm (§6.3).
  `rule.analyticId` masih tampil mentah.

### 3.15 Floor plans

Menu dan page title: `Floor plans` (jamak, dua kata). Rute tetap
`/floorplan`. Nama teknis `Floorplan` (kode, tabel, izin) tidak
berubah.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Floor plan | Gambar denah gedung atau lantai milik satu edge server group. Bersarang sampai 10 tingkat (misalnya `Main Building` berisi `Floor 1` dan `Floor 2`). | Semua teks UI. Selalu dua kata. | Floorplan, map (Map adalah halaman lain) | `Add floor plan` |
| Parent plan | Floor plan induk dalam grup yang sama. Boleh kosong (`No parent (top level)`). | Field form. | Parent floor | `Parent plan` |
| Edge server group | Pengelompokan edge server secara hierarkis (induk dan anak, dengan posisi geografis). Pemilik floor plan, tidak dapat diubah setelah dibuat. | Konteks floor plan dan pengaturan server. Di dialog boleh disingkat `Group` bila konteks jelas. | Folder, site | `Create an edge server group first.` |
| Placement | Penempatan satu kamera pada floor plan: posisi (x, y), arah, dan sudut pandang. | Daftar kamera pada plan, aria. | Pin, marker (marker adalah tampilannya) | `{n}/{total} on this plan` |
| Direction | Arah hadap kamera pada plan, dalam derajat (`rotation_degrees`). | Kontrol pada kamera terpilih. | Rotation, angle | `Direction` |
| Field of view | Sudut pandang kamera pada plan, dalam derajat (`field_of_view_degrees`, bawaan 90). | Kontrol pada kamera terpilih. | FOV, view angle | `Field of view`, `90°` |

Catatan:
- Kamera pada plan harus berada di edge server milik grup plan atau
  subgrupnya.
- Aksi buat memakai `Add floor plan` di semua tempat (toolbar, panel,
  empty state, dialog).
- Jumlah alarm pada marker memakai singular dan plural yang benar:
  `1 alarm`, `3 alarms`.
- Placeholder nama memakai `e.g.` (`e.g. Floor 1`).
- Tombol `Add floor plan` dinonaktifkan bila belum ada edge server
  group, dengan penjelasan di empty state.
- Teks ruangan dan nama plan pada data contoh (`Lobby`, `Reception`)
  adalah data, bukan teks UI.

### 3.16 Map

Menu dan page title: `Map`.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Map | Halaman peta geografis berisi grup, edge server, dan kamera yang punya koordinat. Bukan `Floor plans` (denah gedung). | Menu dan judul. | Maps, GIS | `Map` |
| Location | Posisi geografis (`latitude`, `longitude`) pada grup, edge server, atau kamera. Dapat berasal dari edge server (`From edge server`) atau ditempatkan manual. | Panel dan daftar `Locations`. | Position (untuk lokasi tetap) | `Locations` |
| Marker | Titik item pada peta. | Aria dan tooltip memakai nama item. | Pin | `{name}` |
| Add to the map | Aksi menempatkan item yang belum punya lokasi: pilih item, klik peta. | Tombol ikon pada daftar. | Place | `Add {name} to the map`, `Cancel adding {name}` |
| Remove from the map | Aksi menghapus lokasi item. | Tombol ikon pada daftar. | Unplace | `Remove {name} from the map` |
| Movement trail | Jejak posisi perangkat bodyworn pada hari terpilih. | Toast dan lapisan peta. | Route, history | `Failed to load the movement trail` |
| Bodyworn | Perangkat yang dipakai petugas, dengan nama, nomor polisi, jaringan, baterai, dan posisi dari Edge. | Detail pada peta. | Body cam | `Bodyworn` |
| Police number | Nomor polisi petugas (`police_number`). | Field detail bodyworn. | `Police No.` | `Police number` |

Catatan:
- Koordinat ditampilkan dengan 6 desimal di seluruh peta.
- Pesan validasi: `Latitude and longitude must be set together.`,
  `Edge server is required for a device.`
- Status `Online` / `Offline` pada detail bodyworn berasal dari field
  `bodyworn.online` dari Edge. Artinya belum terdokumentasi di repo
  (apakah terhubung ke server bodyworn atau ke Edge server).
  **[Pending]** konfirmasi tim Edge. Teks tidak diubah.
- Nilai `Network` ditampilkan huruf besar dari nilai mentah Edge dan
  tidak lewat peta label.
- Pohon `Locations` memakai state kamera dari satu sumber
  (`DEVICE_STATE_LABEL`), tetapi belum membedakan `Edge server
  disabled` dan `Camera error` (§3.10).

### 3.17 Cameras

Menu dan page title: `Cameras`.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Camera | Catatan kamera di Central: nama, edge server, satu analytic, sumber stream, enabled, dan recording. | Seluruh halaman Cameras. | Device (di teks UI, §3.2) | `Add camera` |
| Stream source | Alamat sumber video: `rtsp://host/path` atau `bodyworn://<device>?channel=<0-63>&stream=main\|sub&plate=<plate>`. | Field `Main stream`, `Sub stream`, `Third stream`. | URL | `Main stream` |
| Enabled | Kamera dinyalakan. Bila mati, stream dan analytic berhenti. | Kolom dan toggle. Lawannya status `Disabled`. | Active | `Enabled` |
| Recording | Edge server merekam kamera ini. | Kolom, filter, toggle. | Footage, archive | `Recording on` |
| Configuration | Hasil pengiriman konfigurasi kamera ke Edge: `Applied`, `Rejected` (dengan pesan Edge), `Pending`. | Kolom tabel. | Config, apply status | `Configuration` |
| Scan | Pencarian kamera ONVIF oleh Edge server pada jaringannya sendiri berdasarkan IP range dan port. | Dialog scan. | Discover | `Scan cameras` |
| IP range | Rentang alamat dalam bentuk CIDR (`192.168.1.0/24`). | Field scan. | Subnet | `IP range` |
| Login | Pasangan username dan password yang dicoba pada kamera hasil scan (maksimal 8). Hasil scan menunjukkan login yang cocok. | Kolom hasil dan pesan validasi. | Credential (di teks UI) | `Login` |
| Channel | Kanal kamera ONVIF hasil scan. | Daftar hasil. | Stream | `Channel 1` |

Catatan:
- Kolom `Streams` menampilkan semua sumber yang diisi, dipisah
  `+`: `Main`, `Main + Sub`, `Main + Sub + Third`.
- Validasi form memakai `{Field} is required.`: `Name is required.`,
  `Edge server is required.`, `Main stream is required.`
- Pesan scan yang gagal memakai `Failed to {verb} the scan.`
- Tombol toolbar `Scan cameras`. Judul dialog tetap `Scan for
  cameras`.
- Judul `EmptyState`: `No cameras` (data kosong) dan `No cameras
  found` (filter) (aturan 21).
- Deskripsi toggle Recording: `Record this camera on the edge
  server.`
- Penghapusan memakai dialog konfirmasi yang menyebut dampak: kamera
  keluar dari semua layout dan berhenti streaming, sedangkan alarm
  lama tetap tersimpan.

### 3.18 Edge servers

Menu dan page title: `Edge servers`.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Edge | Perangkat lunak SAMTEK Edge (nama produk, selalu kapital E). | Aksi dan pesan tentang prosesnya. | edge (kata benda huruf kecil) | `Restart Edge` |
| Edge server | Server yang menjalankan SAMTEK Edge (§3.8). | Semua teks tentang mesinnya. | Server saja | `Edit edge server` |
| Restart Edge | Menghentikan proses Edge lalu dijalankan lagi oleh service manager. Kamera berhenti streaming dan analyzing sampai Edge kembali. Lewat MQTT (`edge.restart`). | Tombol dan dialog. Tidak mematikan mesinnya. | Restart server | `Restart Edge` |
| Reboot edge server | Menghidupkan ulang mesin. Kamera berhenti sekitar satu menit. Hanya tersedia pada mode contoh (`!isLive`). | Tombol dan dialog. | Restart server | `Reboot edge server` |
| Active | Edge server aktif di sistem. Server tidak aktif diabaikan dan tampil sebagai `Edge server disabled` (§3.10). | Toggle form edge server. | Enabled (istilah kamera) | `Active` |
| Edge server ID | Id edge server. | Deskripsi dialog ubah. | Edge ID | `Edge server ID {id}` |
| Group | Edge server group (§3.15). `Code` adalah kode unik grup. | Dialog edge server dan grup. | | `Add group` |
| Host address, Local host address | Alamat Central ke Edge server, dan alamat di jaringan lokal. | Field form. | IP | `Host address` |
| WebRTC URL | Alamat relay WebRTC (publik atau jaringan lokal) untuk stream kamera. | Field form. | Stream URL | `WebRTC URL (local network)` |
| Registered / Discovered | Edge server yang sudah terdaftar dan perangkat hasil pencarian jaringan. Hanya pada mode contoh. | Tab dan judul section. | | `Registered 3` |
| Log stream | Aliran log Edge server secara langsung. Hanya pada mode contoh. | Dialog log. | | `Log stream` |
| Retention | Lama data disimpan (hari). | Kartu storage. | Expiry | `Retention` |
| Metric level | Level metrik: `Normal`, `Warning`, `Critical`. | Badge metrik. Bukan risk level alarm (`Medium`/`High`). | | `Critical` |

Catatan:
- Pada mode live, tombol yang tampil: `Edit edge server`,
  `Restart Edge` (bila MQTT dikonfigurasi), dan `Delete edge server`.
  Scan, Log stream, dan Reboot hanya pada mode contoh.
- Judul kartu metrik memakai sentence case: `CPU temperature`,
  `Memory usage`, `CPU usage`, `Storage usage`. `CPU`, `GB`, `MQTT`,
  `MAC`, dan `WebRTC` adalah akronim baku.
- Pesan gagal terhubung ke broker memakai pola `Failed to reach the
  MQTT broker`. Peringatan sebagian memakai `Some data did not load`.
- Placeholder memakai `e.g.`: `e.g. Jakarta branch`.
- Tombol scan: `Scan network` / `Scanning…`.
- Hapus edge server dicegah bila masih memiliki kamera.

### 3.19 Analytics

Menu dan page title: `Analytics`. Judul halaman detail mengikuti judul
analytic.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Analytic | Jenis analisis video yang dijalankan Edge pada kamera (`analytic_id`). Satu kamera memakai satu analytic. | Teks UI untuk jenis analisis. `Analytics` adalah nama halaman. | Module, plugin | `No analytic` |
| Analytic group | Pengelompokan satu atau beberapa analytic pada satu halaman (slug). Judulnya diturunkan dari label analytic bila hanya berisi satu analytic. | Kartu dan halaman detail. | Category | `People counting and dwelling` |
| Dwelling | Lama objek berada di area (stay time). | Nama analytic dan statistik. | Loitering (itu istilah alarm lain) | `Stay time` |
| Line count | Jumlah objek yang melintasi garis hitung. | Statistik. | Crossing count | `Line count` |
| Objects in area | Jumlah objek yang berada di area pada satu waktu. | Pilihan metric. | Occupancy | `Objects in area` |
| Interval | Pengelompokan waktu statistik: `Hourly`, `Daily`, `Weekly`, `Monthly`. | Pilihan interval. | Period, granularity | `Interval` |
| Metric | Besaran yang digambar: `Line count`, `Objects in area`, `Stay time (min)`. | Pilihan metric. | Measure | `Metric` |

Aturan:
- Label dan judul analytic memakai sentence case; akronim baku tetap
  kapital (PPE). Ejaan baku: `Personal protective equipment (PPE)`.
- Label analytic hanya punya satu sumber: `config/analytics-catalog.ts`.
  Judul grup analytic diturunkan dari katalog bila grupnya berisi satu
  analytic. Grup berisi lebih dari satu analytic (PPE, License plate
  recognition) menuliskan judulnya sendiri.
- Deskripsi analytic: satu kalimat bertitik, tanpa `footage`
  (`from camera video`).
- Deskripsi `Phone calling` mengikuti definisi Edge (§3.6): `Detects
  people on a phone call, with a hand held near the head.` Batasan
  (garuk kepala dapat memicu alarm, ponsel jauh dari kepala tidak
  terdeteksi, belum diuji dengan orang menelepon sungguhan) dicatat di
  docs dan tidak dimasukkan ke UI.
- Judul riwayat: `Alarm history`, `Plate history`, `Recognition
  history`.
- Tombol kembali pada statistik: `Back to {judul analytic}`.
- Label pilihan `Stay time (min)` memakai `min` karena label pilihan
  singkat. Pengecualian yang disetujui dari pola unit (§2).
- Deskripsi empty state boleh memakai `yet`, judulnya tidak.

### 3.20 Users

Menu dan page title: `Users`.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| User | Akun yang dapat masuk ke SAMTEK. | Seluruh halaman Users. | Teammate, member | `Add user` |
| Role | Kumpulan permission dengan nama (`/v1/roles`). | Teks umum, dialog role. | Group | `Add role` |
| Platform role | Role satu per user yang berlaku di seluruh platform (`platformRoleId`). Diubah saat edit. | Kolom tabel, filter, dialog ubah. | Role (di konteks yang membingungkan) | `Platform role` |
| Edge server role | Role user pada satu edge server (`UserServerRole`, satu per pasangan user dan edge server). Dipilih saat user dibuat, bersama edge servernya. | Dialog tambah user. | Server role | `Edge server role` |
| Permission | Izin bernama, diberikan lewat role. Kodenya (misalnya `floorplans.read`) tampil apa adanya. | Daftar permission pada dialog role. | Right, access | `Permissions` |
| Active / Inactive | Status akun. Akun tidak aktif tidak dapat masuk. | Toggle, tabel, filter. Berbeda dari `Disabled` pada kamera dan edge server. | Disabled (untuk user) | `Inactive` |
| WhatsApp | Nomor WhatsApp user, dipakai untuk notifikasi tiket. Opsional. | Kolom dan field. | Phone | `WhatsApp (optional)` |

Catatan:
- Dialog tambah user memilih `Edge server` dan `Edge server role`.
  Dialog ubah user memilih `Platform role`. Dua role berbeda.
- Kode permission mentah tampil apa adanya sampai ada label
  (keputusan: dicatat, tidak diubah).
- Pesan validasi: `Edge server is required.`, `Edge server role is
  required.`
- Deskripsi dialog tambah: `Create a user account.`
- Placeholder memakai `e.g.` (`e.g. +628123456789`, `e.g. operator`).
- Tombol tambah role di dalam dialog user: `Add role`.

### 3.21 Camera detail

Page title: nama kamera (fallback `Camera`). Tab: `Configuration`,
`Playback`.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Perimeter | Garis atau area yang digambar pada frame kamera untuk analytic. Dua jenis: line crossing dan area. | Panel perimeter, daftar, dan field Alarms. | Zone (kecuali penjelasan) | `Perimeter drawing area` |
| Line | Alat menggambar garis hitung. Hasilnya line crossing, dengan dua arah. | Tombol alat. | | `Line` |
| Polygon | Alat menggambar area. Hasilnya area. | Tombol alat. | | `Polygon` |
| Direction A / Direction B | Dua arah lintas pada line crossing. Namanya dapat diubah, nilai bawaan `Direction A` dan `Direction B`. | Field nama perimeter. | In/Out | `Direction A name` |
| Analytic parameter | Pengaturan per analytic (sensitivity, jam hitung, grup whitelist, dan sebagainya). Spesifikasinya dari katalog Edge; bila Edge offline, parameter belum dimuat. | Section parameter pada form. Label diturunkan dari kunci Edge. | Setting | `Sensitivity` |
| Search index | Pengaturan indeks untuk Object search (§3.13): label yang diindeks dan interval. Perubahannya me-restart analisis. | Toggle `Object search`. | Embedding index | `Index status` |
| Index status | Status indeks: `Off`, `Starting`, `Active`, `Unavailable`. | Badge. `Off` berarti indeks mati, berbeda dari `Disabled` pada kamera. | | `Active` |
| Labels to index | Jenis objek yang diindeks (`person`, dan sebagainya). | Field. | | `Labels to index` |
| Indexing | Proses membuat embedding teks-gambar untuk objek. Interval dalam detik. | Teks UI. Istilah teknis `embedding` tidak ditampilkan. | Embedding | `Seconds between indexing` |

Catatan:
- Panel Live pada tab Configuration memakai sentence case: `Live
  view`, `Pause live view`, `Restart camera`, `Pause analytics`.
- Tiga tombol yang dulu ada di panel itu (`Pause live view`, `Restart
  camera`, `Pause analytics`) tidak punya handler sama sekali, jadi
  dihapus. Bila fungsinya dibuat nanti, tambahkan lagi dengan teks
  sentence case.
- Kontrol pemutar pada tab Playback sama dengan halaman Playback
  (§3.11): `Slower`, `Faster`, `Stream quality`, `End of recording.`,
  kecepatan `1x`.
- Label parameter analytic dibuat dari kunci Edge dan menunggu
  canonical label mapping (§6.3). `Max stay in seconds (0 = off)`
  adalah satu-satunya label yang ditulis tangan.
- Empty state perimeter: judul `No perimeters`, deskripsi `Pick Line
  or Polygon, then draw on the frame.`

### 3.22 Camera web page

Halaman ini menampilkan halaman web milik kamera (lewat proxy server)
di dalam iframe. Hampir tidak ada teks UI.

| Teks | Sumber | Aturan |
|---|---|---|
| `Camera web page` | page title | Sentence case, tanpa titik. |
| `{nama kamera} web page` | judul iframe (accessible name) | Menyebut kamera dan isi. |
| `Open camera web page` | tombol di Live view | Sudah sesuai (§3.9). |

Catatan:
- Respons error proxy berupa JSON, bukan teks UI: `Invalid camera`
  (400), `This camera has no web page` (404). Respons API tidak diatur
  aturan teks UI dan dibiarkan tanpa titik.
- `Camera did not respond` adalah error internal (timeout ke kamera)
  dan tidak ditampilkan. Bila suatu saat ditampilkan, ikuti pola
  `Failed to {verb} {object}.`
- Kamera tanpa halaman web (sumber stream bukan alamat yang punya
  halaman web) menampilkan empty state: judul `No web page`,
  deskripsi `{nama kamera} has no web page to open.` Kamera yang
  memiliki halaman web tetapi tidak merespons masih menampilkan
  respons mentah di dalam iframe, karena kegagalan di dalam iframe
  tidak dapat dideteksi dari halaman induk. **[Pending]**
- Teks pada halaman web milik kamera (merek, firmware) adalah isi
  pihak ketiga dan di luar aturan ini.

### 3.23 Manage faces

Page title: `Manage faces · {judul analytic}`. Halaman hanya ada untuk
analytic `face-recognition`.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Face gallery | Kumpulan orang terdaftar beserta foto wajahnya di Edge server, dipakai pengenalan wajah. | Dialog hapus dan deskripsi. | Database | `removed from the face gallery` |
| Person | Satu orang di galeri, dengan nama, grup, dan satu atau beberapa foto wajah (`person_id`). | Kolom, hitungan, tombol tambah. | Face, record | `Add person`, `0 people` |
| Person group | Pengelompokan orang di galeri (`person_group`: teks bebas, misalnya `staff`, `vip`, `visitor`). Berbeda dari edge server group (§3.15). | Judul section, kolom, tombol hapus. Di field form cukup `Group`. | Group (tanpa konteks) | `Person groups` |
| No group | Orang tanpa grup (`nogroup`). Nilai teknisnya tetap `nogroup`, yang ditampilkan `No group`. | Tampilan nilai grup. | nogroup mentah | `No group` |
| Register | Mendaftarkan orang dari satu foto yang berisi tepat satu wajah. | Deskripsi dialog. | Enroll | `Register the first person.` |

Catatan:
- `Group` pada halaman Edge servers dan Floor plans adalah edge
  server group. Pada halaman ini `Group` adalah person group. Judul
  section, kolom, dan tombol hapus memakai `Person group`.
- Pesan validasi: `Edge server is required.`, `Photo is required.`,
  `The photo must be a JPEG.`, `The photo must be 10 MB or smaller.`
- Judul `EmptyState`: `No people` (data kosong) dan `No people found`
  (filter).
- Opsi grup pada form (`CreatableCombobox`) masih menampilkan nilai
  teknis `nogroup` apa adanya. Belum ada label untuk opsi.
- Pesan gagal: `Failed to delete the people`, `Failed to delete some
  photos.`, `Failed to load the capture`.

### 3.24 Login dan sesi

Page title: `Sign in`.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Sign in | Masuk ke SAMTEK dengan username atau email dan password. | Tombol, judul halaman, pesan. | Login (kata kerja), Log in | `Sign in` |
| Sign out | Keluar dan mengakhiri sesi (`/api/auth/logout`). | Item menu pengguna. | Logout, Log out | `Sign out` |
| Username or email | Pengenal akun. Satu field menerima keduanya. | Label field dan validasi. | Identifier | `Username or email` |
| Remember me | Menyimpan sesi lebih lama (`remember`). | Checkbox. | Stay signed in | `Remember me` |

Catatan:
- Satu istilah untuk masuk dan keluar: `Sign in` dan `Sign out`.
  Jangan memakai `Login` / `Logout` sebagai kata kerja.
- Deskripsi halaman: `Sign in to monitor cameras, alarms and edge
  servers across your sites.`
- Pesan validasi: `Username or email is required.`, `Password is
  required.`, `Username or email must be at most 255 characters.`,
  `Password must be at most 1024 characters.`
- Pesan gagal masuk: fallback `Failed to sign in`. Bila Central
  merespons dengan status di bawah 500, pesan Central ditampilkan apa
  adanya (teks dan bahasanya di luar kendali frontend). Bila Central
  gagal (500 ke atas), API membalas `Sign-in is unavailable`.
- Respons API lain (`Enter your username and password` 400, `Failed
  to load user` 502) bukan teks UI langsung.
- Dialog lupa password: judul `Forgot your password?`, tautan
  `Forgot password?`, isi `Passwords are managed by your
  administrator. Contact them to have your password reset.`
- Pada mode contoh (`!isLiveSource`), login selalu berhasil tanpa
  memeriksa kredensial.

### 3.25 Settings

Menu pengguna dan page title: `Settings`.

Halaman `/settings` belum punya isi, tidak ada fitur `settings`.
Halaman menampilkan empty state sementara: judul `Settings are not
available`, deskripsi `There is nothing to configure here yet.`

Catatan:
- Item menu `Settings` (menu pengguna, `SETTINGS_ITEM`) tetap ada dan
  mengarah ke empty state itu (keputusan: menu tidak disembunyikan).
- Saat halaman diisi, teksnya diaudit pada saat itu dan mengikuti
  aturan §1 sampai §5. Bagian pengaturan yang menyangkut istilah di
  glossary (misalnya `Edge server`, `Alarm`) memakai istilah resmi.

### 3.26 Header dan sidebar

Tampil di semua halaman aplikasi.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Sidebar group | Pengelompokan menu: `Monitoring`, `Locations`, `Devices`, `Reports`, `Administration`. | Label grup. `Devices` memuat `Cameras` dan `Edge servers`, sesuai definisi device (§3.2). | | `Devices` |
| Global search | Pencarian cepat halaman, kamera, floor plan, dan edge server (`Ctrl K`). | Tombol, dialog, placeholder. | Command palette | `Search` |
| Status bar | Ringkasan jumlah kamera dan edge server yang online di header. | Tooltip `{label}: {n} of {total} online`. | | `Edge servers: 2 of 3 online` |
| Notification | Popover berisi alert (§3.1) terbaru. | Judul `Alerts`, aksi `Mark all as read`, tautan `View all alarms`. | | `Alerts` |
| Theme | Pilihan tampilan antarmuka: `Default` (tema teal) dan `Desktop` (tampilan seperti aplikasi desktop). Disimpan di browser. | Menu tema. | Skin | `Theme` |

Catatan:
- Notifikasi: judul popover tetap `Alerts` (notifikasi), tetapi
  tautan ke halaman daftar memakai `View all alarms` karena tujuannya
  halaman Alarms (§3.1).
- Status bar dan pencarian memakai `Edge servers`, bukan `Servers`.
- Placeholder pencarian: `Search pages, cameras, floor plans, edge
  servers…`.
- Teks bawaan komponen sidebar (`Toggle sidebar`, judul tersembunyi
  `Sidebar`) ditulis sentence case. `Displays the mobile sidebar.`
  adalah deskripsi tersembunyi untuk pembaca layar dan tidak diubah.
- Kontrol jendela (`Minimize`, `Fullscreen`, `Close`) hanya untuk
  aplikasi desktop. `Close` tanpa objek karena konteksnya jelas.
- Jam memakai format 24 jam `en-GB`; tanggal `Mon, 3 Nov 2026`;
  sebelum termuat `--:--:--`.
- Merek ditulis `SAMTEK` pada teks dan `Samtek` pada alt logo
  (perbedaan tidak dipermasalahkan; alt bukan teks tampil).

### 3.27 Talk

Talk adalah komunikasi satu arah dari browser ke kamera lewat
mikrofon pengguna (suara dikirim ke perangkat kamera lewat Edge
server). Tombolnya ada pada tile kamera (§3.9).

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Talk | Sesi bicara dari pengguna ke kamera. Satu sesi aktif pada satu waktu di seluruh aplikasi. | Tombol dan pesan. | Intercom, speak | `Start talk` |
| Hold to speak | Menahan tombol untuk membuka mikrofon selama bicara (push-to-talk). | Toggle yang tampil saat sesi aktif. | Mute | `Hold to speak` |
| User | Pengguna yang mengambil alih sesi talk. | Pesan pengambilalihan. | Operator | `Another user took over this camera.` |
| Microphone | Mikrofon browser pengguna. Perlu HTTPS atau localhost. | Pesan kesalahan mikrofon. | Mic | `Microphone access was denied.` |

Judul toast:
- `Talk ended`: sesi berakhir tidak normal (diambil alih, tanpa audio
  60 detik, kamera dihapus, Edge server offline, koneksi ke MQTT broker
  terputus, mikrofon terputus).
- `Failed to start talk`: sesi tidak jadi mulai (kamera tidak
  terjangkau, ditolak Edge server, tidak menjawab dalam 30 detik,
  mikrofon tidak dapat dibuka atau ditolak).

Pesan (teks lengkap):
- `Another user took over this camera.`
- `Talk ended after 60 seconds without audio.`
- `The camera could not be reached.`
- `The camera was removed or can no longer talk.`
- `The edge server went offline.`
- `The connection to the MQTT broker was lost. Start talk again.`
- `The camera did not answer within 30 seconds.`
- `The edge server refused to start talk.`
- `This camera cannot talk now. It is not running on this edge server, or it does not support talk.`
- `The edge server rejected the talk request.`
- `The microphone was disconnected.`, `Microphone access was denied.`,
  `Failed to open the microphone.`, `The microphone needs HTTPS or
  localhost.`

Catatan:
- Teks pesan memakai `camera` dan `edge server`, bukan `device` atau
  `edge` (§3.2, §3.8).
- Istilah `broker` ditulis `MQTT broker` agar sama dengan halaman Edge
  servers.
- Pesan `The edge sent an unreadable answer` pada talk menjadi `The
  edge server sent an unreadable answer.` Pesan serupa di edge-status
  (PTZ, playback, rekaman) belum diubah dan menunggu audit edge-status.
- Alasan tombol nonaktif: `Talk needs a signed-in user`, `Talk is in
  use on another camera` (§2.1).

### 3.28 Edge status

Lapisan yang menggambar kotak deteksi di atas video dan mengurus pesan
dan perintah ke Edge server. Bukan halaman.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Detection | Kotak objek terdeteksi pada video, dengan label, persen keyakinan, dan keterangan tambahan. | Toggle toolbar `Detections`. | Box (di teks UI) | `Detections` |
| Detection status | Status objek: `OK`, `Warning`, `Alert`, `Measuring`. `Alert` adalah nilai teknis status (§3.1), bukan notifikasi. | Ikon status pada kotak. | | `Warning` |
| Measuring | Status `unknown` dari Edge, antara lain status PPE `unknown`. Artinya belum terdokumentasi di repo: **[Pending]** konfirmasi tim Edge. | Ikon status. | | `Measuring` |
| Missing item | Item PPE yang tidak terdeteksi pada seseorang. | Tag di atas kotak. Tampil `No {item}`. | | `No helmet` |
| Perimeters | Garis dan area perimeter pada video (§3.21). | Toggle toolbar. | Zones | `Perimeters` |

Pesan error ke Edge server (muncul sebagai deskripsi toast di PTZ,
Playback, rekaman, scan, dan Talk):
- `The edge server sent an unreadable answer.`
- `The edge server refused the request.` (balasan error tanpa pesan)
- `The edge server did not answer.`
- `Not connected to the MQTT broker.`

Catatan:
- Label objek dan item PPE tampil mentah dari Edge dan diberi huruf
  besar lewat CSS. Mereka menunggu canonical label mapping (§6.3).
- Pesan error memakai `edge server`, bukan `edge` (§3.8). Bentuk sama
  dengan pesan Talk (§3.27).
- `Not connected to the MQTT broker.` adalah keadaan, bukan kegagalan
  aksi. Pesan kegagalan terhubung di halaman Edge servers memakai
  `Failed to reach the MQTT broker`.

### 3.29 Recognitions

Dialog detail hasil pengenalan wajah dan plat. Dipakai oleh riwayat
pengenalan dan riwayat plat pada halaman detail Analytics (§3.19) dan
oleh `/api/recognitions`.

| Canonical | Definition | Context & preferred wording | Avoid | Example |
|---|---|---|---|---|
| Live capture | Foto wajah yang tertangkap kamera saat dikenali. | Tab dialog. | Live Capture | `Live capture` |
| Reference image | Foto orang terdaftar di face gallery (§3.23) yang dicocokkan. Nonaktif bila tidak ada. | Tab dialog. | Reference Image | `Reference image` |
| Confidence | Keyakinan detektor bahwa kotak itu wajah atau plat. Sama artinya dengan `Confidence` pada Alarms (§3.12). | Field dialog. | Detection (sebagai nama skor) | `Confidence` |
| Match | Kecocokan wajah terhadap foto referensi, dihitung dari kemiripan (0 pada ambang 0.35, 100% pada 0.7). | Progress pada dialog wajah. | Similarity (angka mentah) | `Match` |
| Person group | Grup orang pada face gallery (§3.23). | Field dialog wajah. | Group (tanpa konteks) | `Person group` |
| Unreadable plate | Plat yang tidak terbaca. Judul dialog memakai `Unreadable plate`; daftar plat memakai `Unreadable`. | Judul dialog dan daftar. | | `Unreadable plate` |

Catatan:
- Skor detektor memakai satu nama di seluruh aplikasi: `Confidence`.
  `Match` selalu kecocokan (wajah atau teks), bukan skor detektor.
- Nilai kosong ditulis `—`. Nama atau grup yang kosong ditulis
  `Unknown`.
- Alt gambar: `Detected face of {name}`, `Registered photo of {name}`,
  `Detected vehicle {plate}`.
- Deskripsi dialog: `Recognized by {camera}.`, `Read by {camera}.`

## 4. Quality rules

1. Panel title tidak diakhiri titik.
2. Panel description tidak diakhiri titik.
3. Empty state teks biasa mengikuti pola `No {plural noun}.` dengan
   titik. Judul `EmptyState` tanpa titik (§2).
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
21. Empty state dibedakan: data memang kosong, `No {plural noun}`;
    hasil pencarian atau filter kosong, `No {plural noun} found`
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
25. Pesan status di dalam area video (tile Live dan Playback) adalah
    kalimat bertitik: `No recording at this time.`, `End of recording.`.
    Label state pendek (`Live`, `Disabled`) tidak bertitik.
26. Kecepatan putar memakai pengali dengan `x` (`1x`), bukan angka
    telanjang. Berlaku juga pada pemutar alarm clip.
27. Waktu relatif ditulis `now`, `{n}m ago`, `{n}h ago`, `{n}d ago`.
    Satuan `m`, `h`, `d` diperbolehkan di sini dan tidak melanggar
    larangan singkatan (§1).
28. Pesan error pemutar klip mengikuti pola `Failed to {verb} {object}.`
    (inline, bertitik).
29. Hitungan kejadian memakai `×` setelah angka (`2×`). Pengali
    kecepatan memakai `x` (`1x`).

## 5. Copy patterns

| Komponen | Pola | Contoh |
|---|---|---|
| Empty state (judul `EmptyState`) | `No {plural noun}` | `No cameras found` |
| Empty state (teks biasa) | `No {plural noun}.` | `No alarms.` |
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

Catatan: nama alarm kebakaran memakai `Fire and smoke alarm` (final),
sejalan dengan judul panel `Fire and smoke` (§3.6). Contoh `Fire smoke
alarm` di tabel di atas adalah teks Edge lama, bukan bentuk target.
`Cat Detection Alert` menjadi `Cat detection alarm` (final, sudah
diterapkan pada `analytics-catalog.ts` dan `analytic-groups.ts`).
Label analytic lain di kedua berkas itu masih Title Case.

### 6.2 Kondisi saat ini (hasil pemeriksaan kode)

| Sumber | Kondisi | Catatan |
|---|---|---|
| Id analytic (`people_counting_dwelling`, `phone_calling`, ...) | Peta label sudah ada di `config/analytics-catalog.ts` (18 entri). | Label Title Case. Harus menjadi sentence case. |
| Judul grup analytic | `features/analytics/lib/analytic-groups.ts`. Dulu menulis judul sendiri, berbeda dari katalog. | Sekarang diturunkan dari katalog untuk grup satu analytic (§3.19). |
| Judul alarm (`alarm.title`) | (Kondisi sebelum §6.3 diterapkan.) Dashboard menampilkan string Edge apa adanya pada `Alarms by type`. Contoh: `Dwelling Alarm`, `Fire Smoke Alarm`, `Sleep Alarm`, `PPE Violation`. | Title Case dan akhiran `Alarm` tidak konsisten. Tidak ada peta label. |
| Kind alarm (`ppe_missing`, `phone_call`, ...) | Enum stabil, terdokumentasi di `docs/database-schema.md`. | Namespace berbeda dari id analytic. |
| Recognizer (`face_recognition`, ...) | Dashboard memakai `titleCase()` pada id. | `titleCase()` hanya menaikkan huruf pertama dan mengganti `_` dengan spasi. Namanya menyesatkan. |
| Atribut wajah | Memakai `plainLabel()` (sentence case). | Sesuai aturan. |

### 6.3 Canonical label mapping (diterapkan)

Produk memutuskan memakai **satu** mekanisme canonical display label.
Diterapkan sebagai berikut:
- Id analytic: `config/analytics-catalog.ts` (`analyticLabel`).
- Kind alarm dan id recognizer: `config/display-labels.ts`
  (`alarmKindLabel`, `recognizerLabel`).

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
7. **Bentuk peta (final).** Tiga peta terpisah (kind, analytic,
   recognizer), masing-masing `id -> label`, dengan satu fungsi
   pencarian per namespace dan fallback di atas.

Label kind alarm (kanonik): `area_dwell` `Dwelling alarm`,
`ppe_missing` `PPE violation`, `fire_smoke_detected` `Fire and smoke
alarm`, `crowd_limit_exceeded` `Crowd monitoring alarm`,
`worker_absent` `Worker absent alarm`, `cat_detected` `Cat detection
alarm`, `phone_call` `Phone calling alarm`, `sleep_on_duty` `Sleep
alarm`, `motion_detected` `Motion alarm`, `dust_detected` `Dust
detected`, `face_not_in_whitelist` `Outside whitelist`, `face_stranger`
`Stranger`. Label ini diturunkan dari judul Edge yang dikenal (versi
contoh) dan keputusan di glossary. Kind baru dari Edge jatuh ke judul
Edge sampai ditambahkan ke peta.

Hasil penerapan:
- Dashboard `Alarms by type` dikelompokkan berdasarkan kind, bukan
  judul Edge. Mode live yang sebelumnya menampilkan id (`Ppe missing`)
  sekarang memakai label kanonik.
- Tabel, filter `Type`, dialog, penanda timeline Playback, dan toast
  Alarms memakai label kanonik lewat satu titik (`toRow`).
- Event kind pada ticket rule dan statistik recognizer di Dashboard
  memakai peta yang sama.
- Perubahan label tidak mengubah filter atau query: kunci tetap id.
- Butir 6 (laporan fallback ke log pengembangan) belum diterapkan.

## 7. Penyesuaian teks

### 7.0 Status penerapan

Tabel di bawah mencatat teks lama dan teks target. Status per kelompok:

| Kelompok | Status |
|---|---|
| Dashboard | Diterapkan, termasuk `Alarms by type` (label kanonik, §6.3). |
| Status kamera dan stream (§3.10) | Diterapkan: `server-disabled`, `device-error`, label tunggal, `reason` dari Edge. Pengecualian: peta (pohon perangkat), `degraded`. |
| Menu dan page title | `Live view`, `Edge servers`, `Alarms`, `Object search`, dan `Floor plans` diterapkan. `Tickets`, `Map`, `Cameras`, `Edge servers`, `Analytics`, `Users`, `Camera detail`, `Camera web page`, `Manage faces`, `Login`, `Settings`, `Header dan sidebar`, `Talk`, `Edge status`, dan `Recognitions` tidak berubah. `Alerts` menjadi `Alarms` belum diterapkan di navigasi dan halamannya. |
| Alert menjadi alarm | Diterapkan: halaman Alarms, navigasi, Playback, riwayat analytic, floorplan, cameras, dan pesan API. Popover notifikasi tetap `Alerts`. |
| Live view dan PTZ | Diterapkan, termasuk toggle, Talk, Audio, `Stream quality`, `Create layout`, dan konfirmasi hapus layout. |
| Komponen shared | Diterapkan untuk `ToolbarToggle` (label tetap), `camera-web-toggle`, `DeviceTree`, `StreamOffline`, dan label state. Pola `Failed to ...` baru pada halaman yang diaudit. |
| Playback | Diterapkan, termasuk `Slower` / `Faster`. |
| Label analytic Title Case | Diterapkan: seluruh label katalog dan judul grup (sentence case, judul grup diturunkan dari katalog). |

Catatan: baris yang memuat `No ... yet` atau titik pada judul
`EmptyState` di tabel lama mengikuti aturan terbaru (§2): judul tanpa
titik.


Hanya untuk referensi saat penerapan. Teks di kode belum diubah.

### Dashboard

| Lokasi | Teks saat ini | Teks sesuai aturan |
|---|---|---|
| `widgets.tsx` (`new-persons`) | `New persons` | `New people` |
| `widgets.tsx` (`faces`) | `Recognized faces` | `Recognized people` |
| `widgets.tsx` (`kpi-average`) | `Avg alarms per hour` | `Average alarms per hour` |
| `widgets.tsx` (`reid`) | `Different people` | `Unique people` (definisi sesuai, lihat §3.3) |
| `widgets.tsx` (`behavior`) | `Phone calls` | `Phone calling` (final, diterapkan, lihat §3.6) |
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

### Alert menjadi alarm (keputusan final, §3.1, diterapkan)

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
| `features/live/components/camera-tile.tsx:28-31` | label `Offline` untuk `server-offline` dan `stream-offline` | `Server offline` dan `Stream unavailable` (diterapkan, §3.10) |
| `components/shared/edge-offline.tsx` | `Edge server is offline` | Sudah sesuai (§3.8) |
| `components/shared/stream-offline.tsx`, `webrtc-player.tsx:22` | `Camera stream is offline`, `Stream address is not available` | `Stream unavailable` sebagai judul, teks lama sebagai deskripsi (§3.10) |
| `features/live/components/webrtc-player.tsx:175` | `Mute` / `Unmute` | `Mute audio` / `Unmute audio` (final, diterapkan) |
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
| `talk-control.tsx` | `Hold to speak`, `Stop talk`, `Talk`: tiga label untuk satu fitur | `Start talk`, `Hold to speak`, `Stop talk` (final, diterapkan) |
| `camera-preview.tsx`, `ptz-panel.tsx` | `aria-label` spesifik, tooltip `Close` | Samakan (rekomendasi di §7 Live view dan PTZ) |
| `Pick` | `label` hanya menjadi accessible name. Teks tidak tampil, nilai terpilih saja yang tampil. Dua pick terkait memakai nama berbeda: `Stream` (toolbar) dan `Stream quality` (per kamera) | `Stream quality` untuk keduanya (final, diterapkan) |
| `PanelSearch` | `aria-label` diturunkan dari placeholder dengan regex `/\.+$/` | Saat placeholder memakai `…`, regex harus ikut diubah, atau `aria-label` diberi prop sendiri |
| Seluruh app | `aria-description` / `aria-describedby` tidak dipakai di luar `components/ui` | Mulai dari alasan kontrol nonaktif (aturan 24) |
| Tooltip | Semua tooltip aplikasi adalah atribut `title`. `components/ui/tooltip` hanya dipakai sidebar | Jangan menaruh informasi penting hanya di `title` |

### Playback (§3.11)

| Lokasi | Teks saat ini | Teks sesuai aturan |
|---|---|---|
| `features/playback/components/playback-view.tsx:246`, `features/camera-detail/components/playback-panel.tsx:239` | `Alert type` | `Alarm type` |
| `features/alerts/hooks/use-alert-markers.ts:30` | `All alerts` | `All alarms` |
| `features/playback/components/playback-view.tsx:211` | `No cameras in playback` | `No cameras in playback.` |
| `features/playback/components/playback-tile.tsx:57-58` | `No recording at this time`, `Select a time on the timeline to play.` | `No recording at this time.`, kalimat kedua sudah sesuai |
| `features/playback/components/playback-tile.tsx:62` | `End of recording` | `End of recording.` |
| `features/camera-detail/hooks/use-playback-session.ts:38` | `Playback failed` | `Failed to play the recording.` |
| `features/camera-detail/hooks/use-playback-session.ts:102` | `The playback session ended` | `The playback session ended.` |
| `features/playback/components/playback-controls.tsx:68` | `{speed}` | `{speed}x` |
| `features/playback/components/playback-view.tsx:153,163` | `Grid`, `Stream` (accessible name) | `Stream quality` (final, diterapkan) |
| `features/playback/components/playback-controls.tsx` | `Rewind`, `Fast forward` | `Slower`, `Faster` (final, diterapkan) |

### Halaman Alarms (§3.12, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `features/alerts/components/alerts-view.tsx` | `Loading...`, `0 alerts` | `Loading…`, `0 alarms` |
| `features/alerts/components/alerts-view.tsx` | `No alerts found` / `No alerts match the filters.` | `No alarms found` / `No alarms match the filters.` |
| `features/alerts/components/filter-panel.tsx` | `Search alerts...` | `Search alarms…` |
| `features/alerts/components/alerts-table.tsx` | kolom `Alert` | `Alarm` |
| `features/alerts/components/alert-detail-dialog.tsx` | tab `Clip` | `Alarm clip` |
| `features/alerts/components/alert-clip-player.tsx` | `Seek clip`, `Loading clip…`, `Rewind`, `Fast forward`, kecepatan `1` | `Seek alarm clip`, `Loading alarm clip…`, `Slower`, `Faster`, `1x` |
| `features/alerts/hooks/use-clip-session.ts` | `Control failed`, `Clip failed`, `The clip session ended` | `Failed to control the alarm clip.`, `Failed to play the alarm clip.`, `The alarm clip session ended.` |
| `config/navigation.ts`, `app/(app)/alerts/page.tsx` | `Alerts` | `Alarms` |

Tidak berubah: judul popover `Alerts`, `No alerts.`, `Mark all as read`,
`Notifications`.

### Object search (§3.13, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `config/navigation.ts`, `app/(app)/search/page.tsx` | `Object Search` | `Object search` |
| `object-search-view.tsx` | `Search failed` / `The search request failed. Try again.` | `Failed to search objects` / `The search could not be completed. Try again.` |
| `object-search-view.tsx` | `Search is not available on this edge` / `...or the edge does not run on Linux.` | `...on this edge server` / `...or the edge server does not run on Linux.` |
| `validate-search.ts` | `Invalid time`, `Enter a search text`, `Search text has control characters`, `Start must be before end` | `Time is invalid.`, `Search text is required.`, `Search text contains control characters.`, `Start time must be before end time.` |
| `validate-search.ts` | `Search text is at most N characters`, `Label is at most N characters`, `Limit must be 1 to 1000` | Kalimat bertitik: `Search text must be at most N characters.` dan sejenisnya |
| `fetch-search.ts` | `Invalid search` (fallback pesan) | `The search is invalid.` |
| `search-dialog.tsx` | field `Label`, section `Confidence`, aria `Match confidence` | `Object`, `Match`, `Match` |
| `search-dialog.tsx` | `End of recording`, `Rewind`, `Fast forward`, kecepatan `1` | `End of recording.`, `Slower`, `Faster`, `1x` |
| `search-score.tsx` | `sim 0.152`, aria `Match confidence` | `Similarity 0.152`, `Match` |
| `lib/filters.ts` | `RANGES`, `LIMIT_ITEMS`, dan tipe `Filters` tanpa UI | Dihapus. Query selalu memakai nilai bawaan (semua kamera, semua waktu, batas 100). |

### Tickets (§3.14, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `ticket-filter-panel.tsx` | `All servers`, field dan pick `Server` | `All edge servers`, `Edge server` |
| `ticket-rules-dialog.tsx` | pick `Server`, `This server has not sent any alarms yet...` | `Edge server`, `This edge server has not sent any alarms yet...` |
| `ticket-detail-summary.tsx` | field `Server` | `Edge server` |
| `ticket-detail-dialog.tsx`, `ticket-table.tsx` | fallback `Server {id}` | `Edge server {id}` |
| `tickets-view.tsx` | `Could not load tickets` / `Tickets could not be loaded.` | `Failed to load tickets` / `Failed to load tickets.` |
| `ticket-detail-dialog.tsx` | `The ticket could not be loaded.` | `Failed to load the ticket.` |
| `ticket-link-view.tsx` | `The ticket could not be loaded` | `Failed to load the ticket` |
| `ticket-rules-dialog.tsx` | `Rules could not be loaded. You may not have access to them.` | `Failed to load the rules. You may not have access to them.` |

Tidak berubah (keputusan): `Awaiting approval`, `Request resolution`,
`Acknowledge`, `Start`, `{n}×`.

### Floor plans (§3.15, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `config/navigation.ts`, `app/(app)/floorplan/page.tsx` | `Floorplan` | `Floor plans` |
| `components/layout/header-search.tsx` | grup pencarian `Floorplans` | `Floor plans` |
| `floorplan-panel.tsx` | `New floor plan` | `Add floor plan` |
| `camera-marker.tsx` | aria `{n} alerts` | `{n} alarm` / `{n} alarms` |
| `floorplan-view.tsx` | `Could not save the placements`, `Could not delete the floor plan`, `Could not upload the image` | `Failed to save the placements`, `Failed to delete the floor plan`, `Failed to upload the image` |
| `floorplan-view.tsx` | `No groups yet`, `No floor plans yet` | `No groups`, `No floor plans` |
| `floorplan-view.tsx` | `Create an edge server group first, a floor plan belongs to one.` | `Create an edge server group first. A floor plan belongs to one.` |
| `floorplan-form-dialog.tsx` | placeholder `Floor 1` | `e.g. Floor 1` |

### Map (§3.16, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `map-view.tsx` | `Could not save the location`, `Could not load the movement trail` | `Failed to save the location`, `Failed to load the movement trail` |
| `bodyworn-details.tsx` | `Police No.` | `Police number` |
| `map-panel.tsx` | `Place {name} on the map`, `Cancel placing {name}`, `Click the map to place it` | `Add {name} to the map`, `Cancel adding {name}`, `Click the map to add it` |
| `map-panel.tsx` | badge `From server` | `From edge server` |
| `map-panel.tsx` | koordinat 5 desimal | 6 desimal |
| `schemas/map.ts` | `Latitude and longitude go together`, `A device needs its edge server` | `Latitude and longitude must be set together.`, `Edge server is required for a device.` |

### Cameras (§3.17, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `cameras-view.tsx` | `Could not update the camera`, `Could not delete the camera` | `Failed to update the camera`, `Failed to delete the camera` |
| `cameras-view.tsx` | `No cameras yet` | `No cameras` |
| `cameras-view.tsx` | tombol `Scan` | `Scan cameras` |
| `camera-filter-panel.tsx` | `Search cameras...`, `All servers` | `Search cameras…`, `All edge servers` |
| `camera-table.tsx` | kolom `Config` | `Configuration` |
| `camera-table.tsx` | `Main + Sub` / `Main` | semua sumber yang terisi (`Main + Sub + Third`) |
| `camera-table.tsx` | tooltip `Delete` | `Delete {name}` |
| `camera-dialog.tsx` | `Record this camera's footage on the edge server.` | `Record this camera on the edge server.` |
| `edit-camera.ts`, `scan-dialog.tsx` | `Choose an edge server.`, `The main stream is required.` | `Edge server is required.`, `Main stream is required.` |
| `use-device-scan.ts` | `The scan did not start.`, `Could not stop the scan.` | `Failed to start the scan.`, `Failed to stop the scan.` |

### Edge servers (§3.18, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `server-detail.tsx` | tombol `Log Stream`, `Edit Server`, `Restart Server`, `Delete Server` | `Log stream`, `Edit edge server`, `Reboot edge server`, `Delete edge server` |
| `server-detail.tsx` | `CPU Temperature`, `Memory Usage`, `CPU Usage` | `CPU temperature`, `Memory usage`, `CPU usage` |
| `storage-card.tsx` | `Storage Usage` | `Storage usage` |
| `server-detail.tsx` | `Restart the edge of {name}?` / `The edge process stops...` | `Restart Edge on {name}?` / `The Edge process stops...` |
| `server-detail.tsx` | `Restart {name}?` / `Restart` | `Reboot {name}?` / `Reboot`, deskripsi memakai `edge server` |
| `servers-view.tsx` | `Could not reach the MQTT broker` / `Server status and metrics are unavailable.` | `Failed to reach the MQTT broker` / `Edge server status and metrics are unavailable.` |
| `servers-view.tsx` | `Failed to restart the edge server` | `Failed to restart Edge` |
| `servers-view.tsx` | `Some data could not be loaded` | `Some data did not load` |
| `get-servers.ts` | `Could not be loaded` | `Failed to load` |
| `server-list-panel.tsx` | `Nothing registered yet`, `Scan`, `Scanning` | `No registered devices`, `Scan network`, `Scanning…` |
| `server-form-dialog.tsx` | `Edge ID {id}` | `Edge server ID {id}` |
| `server-form-dialog.tsx`, `group-form-dialog.tsx` | placeholder tanpa `e.g.` (`Main building`, `Cabang Jakarta`, dan seterusnya) | diawali `e.g.` |

### Analytics (§3.19, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `config/analytics-catalog.ts` | 18 label Title Case | Sentence case (`People counting and dwelling`, `PPE violation`, `Fire and smoke detection`, `Phone calling`, `People re-identification`, dan seterusnya) |
| `analytic-groups.ts` | judul grup ditulis ulang (`Fire & Smoke Detection`, `Personnel Protective Equipment (PPE)`) | diturunkan dari katalog; PPE dan License plate recognition menulis judul sendiri (`Personal protective equipment (PPE)`, `License plate recognition`) |
| `analytic-groups.ts` | `...from camera footage.` | `...from camera video.` |
| `analytic-groups.ts` | `Detects people using a phone in restricted areas.` | `Detects people on a phone call, with a hand held near the head.` |
| `analytic-plate-history.tsx`, `analytic-recognition-history.tsx` | `Plate History`, `Recognition History` | `Plate history`, `Recognition history` |
| `counting-stats-view.tsx` | `Could not load statistics` (toast dan pesan) | `Failed to load statistics` / `Failed to load statistics.` |
| `counting-stats-view.tsx` | tombol `Back` | `Back to {judul analytic}` |
| `app/(app)/analytics/[slug]/faces/page.tsx` | `Manage Faces · {judul}` | `Manage faces · {judul}` |

### Users (§3.20, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `users-view.tsx` | `Could not delete the user`, `Some data could not be loaded` | `Failed to delete the user`, `Some data did not load` |
| `users-view.tsx` | `No users yet` | `No users` |
| `user-filter-panel.tsx` | `Search users...`, `All roles`, section `Roles`, item `Disabled` | `Search users…`, `All platform roles`, `Platform roles`, `Inactive` |
| `user-table.tsx` | kolom `Role`, `Unknown role`, `Disabled`, tooltip `Delete` | `Platform role`, `Unknown platform role`, `Inactive`, `Delete {username}` |
| `user-dialog.tsx` | `Server`, `Select a server`, `Role` (tambah), `New role`, `Create an account for a teammate.` | `Edge server`, `Select an edge server`, `Edge server role`, `Add role`, `Create a user account.` |
| `user-dialog.tsx`, `role-form-dialog.tsx` | placeholder `+628123456789`, `operator` | `e.g. +628123456789`, `e.g. operator` |
| `edit-user.ts` | `Select a server.`, `Select a role for this server.` | `Edge server is required.`, `Edge server role is required.` |
| `get-users.ts` | sumber `Servers` | `Edge servers` |

### Camera detail (§3.21, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `live-panel.tsx` | `Live View`, `Pause Live View`, `Restart Camera`, `Pause Analytics` | `Live view`, `Pause live view`, `Restart camera`, `Pause analytics` |
| `camera-detail-view.tsx` | `Could not save the changes` | `Failed to save the changes` |
| `perimeter-list.tsx` | `No perimeters yet`, tooltip `Delete` | `No perimeters`, `Delete {name}` |
| `playback-panel.tsx` | `End of recording`, `Rewind`, `Fast forward`, `Stream`, kecepatan `1` | `End of recording.`, `Slower`, `Faster`, `Stream quality`, `1x` |
| `search-index-fields.tsx` | `Add label...`, `Seconds between embeddings` | `Add label…`, `Seconds between indexing` |

### Manage faces (§3.23, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `faces-view.tsx` | `Add face`, `No faces yet`, `Register the first face.` | `Add person`, `No people`, `Register the first person.` |
| `faces-view.tsx` | `Could not delete`, `Delete group "{x}"` | `Failed to delete the people`, `Delete person group "{x}"` |
| `use-face-actions.ts` | `Some photos could not be deleted.` | `Failed to delete some photos.` |
| `capture-face-dialog.tsx` | `Could not load the capture` | `Failed to load the capture` |
| `face-dialog.tsx` | `Add face` (judul dan tombol), `No groups yet.`, placeholder `nogroup` | `Add person`, `No person groups.`, `No group` |
| `face-group-panel.tsx` | `Search people...`, `Groups`, `All groups`, `Delete group`, nilai `nogroup` | `Search people…`, `Person groups`, `All person groups`, `Delete person group`, `No group` |
| `person-table.tsx` | kolom `Group`, nilai `nogroup`, tooltip `Delete` | `Person group`, `No group`, `Delete {name}` |
| `edit-face.ts` | `Choose an edge server.`, `Choose a JPEG photo.` | `Edge server is required.`, `Photo is required.` |

### Login (§3.24, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `app/login/page.tsx` | `...monitor cameras, alerts and devices across your sites.` | `...monitor cameras, alarms and edge servers across your sites.` |
| `schemas/login.ts` | `Enter your username or email.`, `Enter your password.` | `Username or email is required.`, `Password is required.` |
| `schemas/login.ts` | `Use at most 255 characters.`, `Use at most 1024 characters.` | `Username or email must be at most 255 characters.`, `Password must be at most 1024 characters.` |
| `use-sign-in.ts` | `Sign-in failed` | `Failed to sign in` |
| `user-menu.tsx` | `Logout` | `Sign out` |

### Header dan sidebar (§3.26, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `header-status.tsx` | `Servers` | `Edge servers` |
| `header-search.tsx` | grup `Servers`, `...or server.`, placeholder `...servers...` | `Edge servers`, `...or edge server.`, `...edge servers…` |
| `header-notifications.tsx` | `View all alerts` | `View all alarms` |
| `components/ui/sidebar.tsx` | `Toggle Sidebar` | `Toggle sidebar` |

### Talk (§3.27, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `talk-session.ts` | `Another operator took over this device.` | `Another user took over this camera.` |
| `talk-session.ts` | `The device could not be reached.`, `The device was removed or can no longer talk.`, `The device did not answer within 30 seconds.` | `The camera ...` |
| `talk-session.ts` | `The connection to the broker was lost.` | `The connection to the MQTT broker was lost.` |
| `talk-store.ts` | `The device cannot talk now: it is not running on this edge, or does not support talk.` | `This camera cannot talk now. It is not running on this edge server, or it does not support talk.` |
| `talk-store.ts` | `The edge rejected the talk request.`, `The edge sent an unreadable answer`, `Could not start talk.`, `Could not open the microphone.` | `The edge server rejected the talk request.`, `The edge server sent an unreadable answer.`, `Failed to start talk.`, `Failed to open the microphone.` |
| `talk-control.tsx` | judul toast `Talk` | `Talk ended` atau `Failed to start talk` |

### Edge status (§3.28, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `ptz-commands.ts`, `playback-commands.ts`, `recording-query.ts` | `The edge sent an unreadable answer` | `The edge server sent an unreadable answer.` |
| `edge-status-store.ts` | `The edge refused`, `The edge did not answer` | `The edge server refused the request.`, `The edge server did not answer.` |
| `edge-status-store.ts` | `Not connected to the MQTT broker` | `Not connected to the MQTT broker.` |
| `tests/edge-status/playback-boxes.test.mjs` | mengimpor `reasonLabel` yang sudah dihapus (`bd31cd5`) | impor dan asersi dihapus |

### Recognitions (§3.29, diterapkan)

| Lokasi | Teks lama | Teks baru |
|---|---|---|
| `recognition-dialog.tsx` | tab `Live Capture`, `Reference Image` | `Live capture`, `Reference image` |
| `recognition-dialog.tsx`, `plate-dialog.tsx` | field `Detection` | `Confidence` |
| `recognition-dialog.tsx` | field `Group` | `Person group` |

### Format tanggal dan waktu (§2, diterapkan)

| Lokasi | Format lama | Format baru |
|---|---|---|
| `recognitions/lib/format-recognition.ts` | `Intl` lokal | helper bersama |
| `alerts/lib/format-alert.ts` | `Intl` lokal | helper bersama |
| `object-search/lib/format-score.ts` | `date-fns`, zona peramban | helper bersama (Jakarta) |
| `tickets/lib/ticket-status.ts` | `03 Sep, 14:05` (tanpa tahun, dengan koma) | detail `03 Sep 2026 14:05:09`, tabel `03 Sep 14:05` |
| `users/components/user-table.tsx` | `3 Sep 2026` | `03 Sep 2026` |
| `date-picker.tsx`, `date-range-dialog.tsx` | `d MMM yyyy` | `dd MMM yyyy` |

### Label analytic (sentence case, §6.1)

| Lokasi | Teks saat ini | Teks sesuai aturan |
|---|---|---|
| `config/analytics-catalog.ts` | 18 label Title Case (`People Counting and Dwelling`, `PPE Violation Advance`, `People Re-Identification`, `Phone Calling`, ...) | Sentence case, PPE tetap kapital |
| `config/analytics-catalog.ts:46` dan `analytic-groups.ts:145` | `Cat Detection Alert` | `Cat detection alarm` (final, diterapkan) |
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
| Phone calling | Dikonfirmasi tim Edge: mendeteksi orang menelepon (pose + tangan dekat kepala). Belum diuji dengan orang sungguhan. Lihat §3.6. |
| Status kamera dan stream (§3.10) | Server nonaktif dibedakan dari server tidak terjangkau (`server-disabled`). Status `error` dibedakan lewat `reason` dari Edge (`stream-offline` vs `device-error`). Pengujian: `deviceStateOf` dan `isServerDown` punya unit test. Pemetaan `reason` ke state belum diuji terhadap pesan Edge sungguhan, dan skema `reason` di Edge belum divalidasi (kabar dari tim Edge: `validate_contract.py` belum dijalankan). |
| Pesan error Live view dan PTZ | Konteks diverifikasi: `Could not update the layout` dipakai untuk create, delete, dan ubah slot. Pesan PTZ berasal dari `act()` dan `hold()`. |
| Istilah PTZ, stream, preset | Definisi ditelusuri ke kode (`sourceMain/Sub/Third`, `axes`, `PtzPreset`). Istilah audio, diagonal, `REC`, dan `Edge server` sudah final. |
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
