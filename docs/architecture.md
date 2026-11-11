# Frontend Architecture Rules

Dokumen ini menetapkan aturan arsitektur dan implementasi frontend untuk
aplikasi Next.js `samtek_vms_new`.

Tujuannya adalah menjaga struktur kode tetap konsisten, mudah dipahami,
mudah diuji, dan dapat dikembangkan tanpa menambahkan kompleksitas yang
tidak diperlukan.

## 1. Architecture

Frontend MUST use **Feature-Based Architecture with lightweight Layered
Architecture**.

Prinsip utama:

- Kode dikelompokkan berdasarkan fitur, bukan hanya berdasarkan jenis
  file.
- Setiap feature bertanggung jawab atas UI dan logic miliknya.
- `app/` hanya menangani routing dan komposisi halaman.
- Infrastruktur komunikasi API dipisahkan dari UI dan business logic.
- Server Components menjadi pilihan default.
- Client Components hanya digunakan ketika interaktivitas browser
  memang diperlukan.
- Hindari abstraction, dependency, dan layer tambahan yang belum
  memiliki kebutuhan nyata.

Jangan menerapkan Clean Architecture secara berlebihan pada frontend.

## 2. Directory Structure

Struktur utama yang harus digunakan:

```text
apps/web/
└── src/
    ├── app/
    ├── features/
    ├── components/
    │   ├── ui/
    │   ├── shared/
    │   └── layout/
    ├── hooks/
    ├── lib/
    ├── providers/
    ├── config/
    ├── types/
    └── ...
```

Contoh pengembangan struktur:

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── posts/
│   │   └── settings/
│   ├── api/
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── globals.css
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── types/
│   ├── posts/
│   ├── users/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── shared/
│   └── layout/
│
├── hooks/
├── lib/
│   ├── axios/
│   ├── query/
│   ├── auth/
│   └── utils/
│
├── providers/
├── config/
└── types/
```

Direktori tambahan boleh dibuat jika ada kebutuhan yang jelas. Jangan
membuat direktori kosong hanya untuk mengikuti contoh.

## 3. Directory Responsibilities

### 3.1 `app/`

Tanggung jawab:

- Next.js App Router.
- Route segments dan route groups.
- Page dan layout composition.
- Loading, error, not-found, dan route-level UI.
- Route handlers apabila memang diperlukan.

Rules:

- File `page.tsx` dan `layout.tsx` harus berfokus pada komposisi
  halaman.
- Jangan menempatkan business logic fitur di dalam `app/`.
- Jangan menempatkan reusable feature components di dalam `app/`.
- Ambil UI dan logic fitur dari direktori `features/`.
- Jangan membuat route handler sebagai pengganti API backend tanpa
  alasan arsitektural yang jelas.
- Pengecualian yang diterima: route handler di `app/api/auth/`,
  `app/api/alerts/`, `app/api/cameras/`, `app/api/edge-servers/`,
  `app/api/servers/`, `app/api/live/`, `app/api/layouts/`, dan
  `app/api/users/` dipakai sebagai lapisan tipis (BFF) di depan API
  central dan Edge.
  Alasannya: token disimpan di cookie `httpOnly` sehingga tidak dapat
  dibaca JavaScript browser, dan API central tidak mengaktifkan CORS.
  Handler hanya memvalidasi input, meneruskan permintaan, dan memetakan
  error; aturan bisnis tetap berada di API backend.

### 3.2 `features/`

Tanggung jawab:

- Implementasi setiap domain atau fitur aplikasi.
- Feature-specific components.
- Feature-specific hooks.
- Feature-specific services atau use-case logic.
- Feature-specific schemas dan types.

Rules:

- Setiap fitur harus memiliki batas tanggung jawab yang jelas.
- Tempatkan file sedekat mungkin dengan fitur yang menggunakannya.
- Jangan memindahkan kode ke direktori global jika hanya digunakan
  oleh satu fitur.
- Hindari ketergantungan langsung pada implementasi internal fitur
  lain.
- Jika beberapa fitur membutuhkan kode yang sama, evaluasi apakah kode
  tersebut benar-benar reusable sebelum memindahkannya ke
  `components/shared/`, `hooks/`, atau `lib/`.
- Jangan membuat subdirektori yang tidak diperlukan.

### 3.3 `components/ui/`

Tanggung jawab:

- Komponen UI dasar yang reusable dan tidak terikat pada domain
  bisnis.
- Contoh: Button, Input, Dialog, Select, Checkbox, dan Dropdown.

Rules:

- Komponen harus bersifat generic dan reusable.
- Jangan memasukkan business logic fitur ke dalam komponen UI.
- Jangan mengakses API atau feature services dari komponen UI.
- Gunakan props untuk menerima data dan callback.
- Pertahankan API komponen sesederhana mungkin.

### 3.4 `components/shared/`

Tanggung jawab:

- Komponen lintas fitur yang memiliki tujuan UI atau interaksi
  bersama.
- Contoh: EmptyState, ConfirmDialog, SearchInput, dan Pagination.

Rules:

- Komponen harus digunakan oleh lebih dari satu fitur atau memang
  merupakan shared application component.
- Jangan menempatkan komponen khusus satu fitur di sini.
- Jangan membuat shared component hanya untuk menghindari file lokal
  yang kecil.
- Hindari komponen dengan terlalu banyak props dan kondisi yang
  membuat tanggung jawabnya tidak jelas.

### 3.5 `components/layout/`

Tanggung jawab:

- Komponen kerangka tampilan aplikasi.
- Contoh: Sidebar, Header, Navigation, dan DashboardShell.

Rules:

- Komponen layout tidak boleh memiliki business logic domain fitur.
- Layout-specific state diperbolehkan selama hanya mengatur tampilan
  dan navigasi.
- Layout route-specific yang hanya digunakan satu route group boleh
  tetap berada dekat route group tersebut.

### 3.6 `hooks/`

Tanggung jawab:

- Custom hooks yang digunakan lintas fitur.
- Contoh: useDebounce, useMediaQuery, dan useLocalStorage.

Rules:

- Hook khusus satu fitur harus berada di dalam direktori fitur
  tersebut.
- Jangan menjadikan `hooks/` sebagai tempat semua custom hooks.
- Hook harus memiliki satu tanggung jawab yang jelas.
- Jangan menggunakan hook untuk membungkus logic sederhana tanpa
  manfaat nyata.

### 3.7 `lib/`

Tanggung jawab:

- Infrastruktur frontend dan utilities tingkat aplikasi.
- Contoh: Axios configuration, TanStack Query configuration,
  authentication utilities, dan helper functions.

Rules:

- Pisahkan kode berdasarkan tanggung jawab.
- Jangan menempatkan business logic spesifik fitur di sini.
- Jangan menjadikan `lib/` sebagai direktori penampung kode yang tidak
  diketahui tempatnya.
- Utility harus sebisa mungkin pure, predictable, dan mudah diuji.

### 3.8 `providers/`

Tanggung jawab:

- React context providers pada tingkat aplikasi.
- Contoh: QueryClientProvider, ThemeProvider, dan AuthProvider.

Rules:

- Provider global didaftarkan melalui root layout atau provider
  composition.
- Jangan membuat provider untuk state lokal yang cukup dikelola oleh
  component state.
- Hindari menumpuk provider yang tidak diperlukan.
- Provider harus memiliki tanggung jawab yang jelas.

### 3.9 `config/`

Tanggung jawab:

- Konfigurasi aplikasi yang digunakan lintas fitur.
- Contoh: navigation configuration, application constants, dan
  environment configuration.

Rules:

- Jangan menyimpan secret atau private credentials di frontend.
- Validasi environment variables yang diperlukan.
- Pisahkan konfigurasi dari business logic.
- Jangan menyimpan nilai yang sebenarnya dapat diturunkan dari data
  lain.

### 3.10 `types/`

Tanggung jawab:

- TypeScript types tingkat aplikasi yang benar-benar bersifat global.

Rules:

- Types khusus fitur harus berada di dalam direktori fitur.
- Jangan menduplikasi DTO yang sudah tersedia di `@repo/dto`.
- Hindari penggunaan `any`; gunakan `unknown` jika tipe belum
  diketahui.
- Jangan membuat type global hanya untuk menghindari import dari
  package atau fitur terkait.

## 4. Dependency Rules

Arah dependency harus dijaga agar batas antarbagian tetap jelas.

Rules:

1.  `app/` boleh mengimpor dari `features/`, `components/`,
    `providers/`, `config/`, dan `lib/`.
2.  `features/` boleh mengimpor dari `components/ui/`,
    `components/shared/`, `hooks/`, `lib/`, `config/`, dan shared
    packages.
3.  `components/ui/` tidak boleh mengimpor dari `features/`.
4.  `components/shared/` tidak boleh bergantung pada implementasi
    internal suatu fitur.
5.  `hooks/` global tidak boleh bergantung pada fitur tertentu.
6.  `lib/` tidak boleh mengimpor komponen UI atau business logic fitur.
7.  Hindari circular dependencies.
8.  Jangan mengakses file internal fitur lain jika ada public interface
    yang disediakan.

Jika suatu fitur membutuhkan kemampuan dari fitur lain, gunakan public
interface yang jelas atau pindahkan abstraksi yang benar-benar shared ke
lokasi yang sesuai.

## 5. Next.js Rendering Rules

- Gunakan React Server Components sebagai default.
- Tambahkan `'use client'` hanya ketika membutuhkan state, event
  handlers, React client hooks, atau browser APIs.
- Letakkan batas Client Component sedekat mungkin dengan bagian UI
  yang membutuhkan interaktivitas.
- Jangan menjadikan seluruh page sebagai Client Component hanya karena
  satu komponen membutuhkan interaktivitas.
- Hindari penggunaan `useEffect` untuk data fetching yang dapat
  ditangani melalui Server Components atau TanStack Query.
- Jangan mengakses `window`, `document`, `localStorage`, atau browser
  APIs pada Server Component.
- Jangan menggunakan `use client` pada file yang tidak membutuhkannya.
- Tentukan strategi rendering dan caching secara sadar. Jangan
  mengandalkan asumsi default Next.js tanpa memahami dampaknya.

## 6. Data Fetching and API Rules

- Jangan membuat ulang API client, endpoint definitions, atau DTO yang
  sudah tersedia di shared packages.
- Axios configuration dan transport-level concerns harus berada di
  infrastructure layer.
- Komponen UI tidak boleh memanggil Axios secara langsung.
- Pisahkan query dan mutation berdasarkan kebutuhan fitur.
- Gunakan TanStack Query untuk server state pada Client Components.
- Hindari menyimpan server state yang sama di Zustand atau React
  Context.
- Untuk Server Components, gunakan mekanisme server-side data access
  yang sesuai dengan SDK dan konfigurasi autentikasi.
- Jangan mengekspos secret, private API key, atau server-only
  configuration ke browser.
- Tangani loading, empty, success, dan error states secara konsisten.
- Hindari request duplikat yang tidak diperlukan.

## 7. State Management Rules

Gunakan jenis state sesuai tanggung jawabnya:

State Pilihan

---

Server state TanStack Query
Form state React Hook Form
Form validation Zod
Local UI state React `useState`
Shared client state kompleks Zustand, jika diperlukan
URL state Next.js routing dan search params

Rules:

- Jangan menggunakan Zustand untuk menggantikan TanStack Query.
- Jangan menyimpan state lokal sederhana ke global store.
- Jangan menduplikasi state yang sudah tersedia dari URL atau server.
- Gunakan URL untuk state yang perlu dibagikan, di-bookmark, atau
  dipertahankan melalui navigasi jika sesuai.

## 8. Component Rules

- Setiap komponen harus memiliki tanggung jawab yang jelas.
- Pisahkan komponen jika pemisahan meningkatkan readability atau
  reusability.
- Jangan memecah komponen secara berlebihan menjadi banyak file kecil
  tanpa manfaat.
- Hindari conditional rendering yang terlalu kompleks dalam satu
  komponen.
- Gunakan props dengan tipe yang eksplisit.
- Hindari prop drilling yang tidak perlu, tetapi jangan langsung
  menggunakan global state sebagai solusi.
- Jangan menempatkan business logic kompleks di dalam JSX.
- Jangan membuat komponen reusable sebelum ada kebutuhan penggunaan
  ulang yang nyata.

### 8.1 Button Variants

Pilih variant `Button` berdasarkan fungsinya, bukan selera tampilan.

- `default`: aksi utama satu konteks (tambah, simpan, kirim). Maksimal
  satu per area. Aksi "buat baru" di sidebar berupa tombol berlabel
  `w-full` di bawah daftar yang diisinya.
- `secondary`: perintah biasa yang bukan aksi utama (Edit, Restart,
  Scan, Register, Fullscreen, Cancel).
- `destructive`: aksi menghapus atau tidak bisa dibatalkan. Selalu
  berlabel, jangan icon-only, dan jangan ditaruh menempel pada tombol
  tambah.
- `outline`: kontrol netral yang menyatu dengan input, seperti
  pagination dan pemicu pencarian. Bukan untuk perintah.
- `ghost`: hanya untuk aksi icon-only di dalam baris yang padat, atau
  aksi berprioritas rendah di baris judul (Clear, Mark all as read).
- `link`: navigasi inline ke detail (Open).
- Baris judul section hanya memuat aksi kecil yang berlaku untuk
  section itu. Jangan taruh aksi "buat baru" di sana.
- Jangan memakai `outline` atau `ghost` sebagai pengganti `secondary`
  hanya agar tombol terlihat lebih ringan.

### 8.2 Overlay Forms

Form tambah/edit dan panel detail di halaman fitur memakai `Dialog`,
bukan `Sheet`. Beri nama file dan komponen `*-dialog` (contoh:
`camera-dialog.tsx`). `Sheet` hanya dipakai untuk panel navigasi
(sidebar mobile).

Susun dialog dalam tiga bagian yang dipisah `Separator`: `DialogHeader`
(title), `DialogBody` (isi), dan `DialogFooter` (tombol aksi, otomatis
`flex-1`). Jika field banyak, bagi `DialogBody` menjadi beberapa
`DialogSection` yang dipisah `DialogDivider`: berdampingan di layar
`md` ke atas, bertumpuk di layar kecil. Lebarkan dialog dengan
`md:max-w-2xl`.

## 9. Naming and File Organization

Gunakan konvensi berikut:

- Direktori: `kebab-case`.
- File component: `kebab-case.tsx`.
- File hooks: `use-<name>.ts`.
- File utilities: `<name>.ts`.
- React component dan type/interface: `PascalCase`.
- Variable dan function: `camelCase`.
- Constant: `UPPER_SNAKE_CASE` jika memang merupakan constant
  konvensional.
- Boolean: gunakan prefix yang jelas seperti `is`, `has`, atau
  `should`.

Rules:

- Nama file harus menggambarkan tanggung jawabnya.
- Hindari nama generik seperti `common.ts`, `helper.ts`, atau
  `manager.ts` tanpa konteks yang jelas.
- Jangan membuat banyak variasi nama untuk konsep yang sama.
- Ikuti konvensi yang sudah digunakan di repository apabila tidak
  bertentangan dengan aturan ini.

## 10. Error Handling and Validation

- Validasi input pada boundary yang tepat.
- Gunakan Zod untuk validasi runtime ketika dibutuhkan.
- Jangan menganggap TypeScript types sebagai runtime validation.
- Tangani error API pada lapisan yang sesuai.
- Tampilkan pesan error yang aman dan dapat dipahami pengguna.
- Jangan menampilkan stack trace, internal server details, atau secret
  kepada pengguna.
- Hindari silent error handling.

## 11. Performance Rules

- Utamakan Server Components untuk mengurangi JavaScript yang dikirim
  ke browser.
- Hindari Client Components yang tidak diperlukan.
- Hindari render ulang yang tidak perlu, tetapi jangan menambahkan
  memoization secara membabi buta.
- Gunakan dynamic import untuk bagian berat jika benar-benar memberi
  manfaat.
- Optimalkan image menggunakan kemampuan image optimization Next.js.
- Hindari waterfall API requests yang tidak diperlukan.
- Gunakan pagination atau infinite query untuk dataset besar.
- Atur cache dan invalidation TanStack Query secara konsisten.
- Jangan melakukan optimasi sebelum memahami bottleneck yang
  sebenarnya.

## 12. Agent Workflow Rules

Sebelum mengubah kode:

1.  Periksa struktur repository dan konfigurasi yang sudah ada.
2.  Baca `package.json`, konfigurasi Next.js, TypeScript, lint, dan
    format.
3.  Identifikasi pola yang sudah digunakan agar perubahan konsisten.
4.  Laporkan jika struktur atau implementasi yang ada bertentangan
    dengan dokumen ini.

Saat mengimplementasikan:

- Lakukan perubahan sekecil mungkin sesuai kebutuhan.
- Jangan melakukan refactor di luar scope tugas.
- Jangan menambahkan dependency tanpa alasan yang jelas.
- Jangan membuat abstraction atau direktori tambahan tanpa kebutuhan
  nyata.
- Jangan menduplikasi implementasi yang sudah tersedia.
- Jangan mengubah kontrak API tanpa persetujuan atau kebutuhan tugas
  yang jelas.
- Jangan menghapus kode yang belum dipahami.
- Jangan mengklaim implementasi selesai tanpa menjalankan pemeriksaan
  yang relevan.

Setelah mengimplementasikan:

- Jalankan formatter dan linter yang tersedia.
- Jalankan TypeScript type-check.
- Jalankan test yang relevan.
- Jalankan build aplikasi jika diminta atau jika aman dan sesuai
  scope.
- Laporkan pemeriksaan yang benar-benar dijalankan beserta hasilnya.
- Laporkan pemeriksaan yang belum dijalankan.
- Jangan mengklaim test, lint, type-check, atau build berhasil jika
  belum dijalankan.

## 13. Scope and Safety Rules

- Jangan menjalankan deployment, restart service, atau mengubah
  environment production kecuali diminta secara eksplisit.
- Jangan menjalankan distribusi atau release build kecuali diminta
  secara eksplisit.
- Jangan melakukan commit atau push kecuali diminta secara eksplisit.
- Jangan mengubah file di luar scope tugas tanpa alasan yang
  dijelaskan.
- Jangan mengubah konfigurasi atau dependency hanya untuk merapikan
  kode jika tidak diperlukan.
- Jika menemukan masalah di luar scope, laporkan sebagai temuan
  terpisah dan jangan langsung memperbaikinya.

## 14. Final Implementation Report

Setiap tugas implementasi harus diakhiri dengan laporan singkat yang
mencakup:

1.  Ringkasan perubahan.
2.  File atau direktori yang diubah.
3.  Keputusan arsitektur penting, jika ada.
4.  Test dan pemeriksaan yang dijalankan beserta hasilnya.
5.  Pemeriksaan yang belum dijalankan.
6.  Temuan atau risiko yang masih tersisa.

Jangan menyatakan seluruh arsitektur sudah konsisten hanya berdasarkan
pemeriksaan sebagian. Jelaskan batas pemeriksaan yang benar-benar
dilakukan.
