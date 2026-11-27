This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Memasang di server

Skrip di [`deploy/`](deploy) memasang VMS tanpa Node, npm maupun PM2 di server (rancangannya di `samtek_edge/docs/deployment.md`): satu binary Node dan folder standalone Next.js di `/opt/samtek/vms/releases/<versi>`, unit systemd di `127.0.0.1:3100`, dan situs nginx di depannya.

```bash
npm install
deploy/deploy.sh package --version 1.0.0     # dist-package/samtek-vms-1.0.0-linux-x86_64.tar.gz (membangun di salinan, bukan di .next)
# di server: ekstrak, lalu
sudo deploy/deploy.sh install --public-url https://vms.example.com --api-url http://127.0.0.1:3000
sudo deploy/deploy.sh verify
```

`deploy.sh install` membaca `samtek-api` dan `samtek-mosquitto` yang ada di mesin yang sama untuk `CENTRAL_API_URL` dan alamat MQTT browser (`/mqtt` di nginx diteruskan ke WebSocket broker di loopback). Nilai `NEXT_PUBLIC_*` dibangun sebagai placeholder dan ditulis saat instalasi dari `/etc/samtek/vms/public.env`, jadi satu paket melayani semua instalasi; ubah berkas itu lalu `deploy/deploy.sh install --reapply`. Nilai itu terkirim ke setiap browser: pakai akun MQTT yang hanya boleh membaca. `SAMTEK_STANDALONE=1` di `next.config.ts` hanya dipakai skrip build; `npm run build` dan `next start` tidak berubah.

| Perintah `deploy/deploy.sh` | Fungsi                                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `package`                   | Membangun dan mengemas (binary Node + standalone + skrip), `--worktree` untuk working tree dengan perubahan yang belum di-commit             |
| `desktop`                   | Membangun aplikasi desktop Electron (klien PC operator, bukan komponen server): AppImage dan deb, `--public-env` untuk nilai `NEXT_PUBLIC_*` |
| `install`                   | User `samtek-vms`, env (0640), nilai browser, situs nginx (ditulis sekali; `--rewrite-nginx` untuk mengubah), unit                           |
| `upgrade`                   | Dari paket baru: ganti rilis, `verify`, rollback bila gagal                                                                                  |
| `uninstall`                 | Bawaan hanya unit, situs nginx dan rilis; `--purge-config` dan `--purge-data` meminta frasa                                                  |
| `verify`                    | Baca-saja: Node hanya di loopback, tanpa placeholder tersisa, `/login`, nginx, `/mqtt` (handshake 101)                                       |

Semuanya satu berkas, `deploy/deploy.sh <perintah>`; `deploy.sh` tanpa argumen menampilkan semua opsi. Nilai `NEXT_PUBLIC_*` ditulis ke aplikasi oleh fungsi `public_env` di dalamnya (skrip Node tertanam, dijalankan dengan Node milik paket).

`SAMTEK_ROOT=<folder>` menaruh semua path di bawah folder itu dan melewati user, systemd dan reload nginx, untuk mencoba skrip tanpa root.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Desktop (Electron)

`electron/` membungkus VMS jadi aplikasi desktop tanpa jendela bawaan (frameless). `components/layout/window-controls.tsx` hanya tampil di Electron (lewat `window.samtekDesktop` dari `electron/preload.cjs`) dan di web tidak dirender; header menjadi area seret jendela (`app-drag`).

```bash
npm run desktop:dev                                                  # next dev + Electron di http://localhost:3000
deploy/deploy.sh desktop --public-env public.env                     # dist-package/samtek-vms-desktop-<versi>-linux-x64.{AppImage,deb}
deploy/deploy.sh desktop --version 1.0.0 -- --win                    # argumen setelah -- diteruskan ke electron-builder
```

Ini klien untuk PC operator, bukan komponen server: tidak ikut berkas `.run` dan tidak dipasang `deploy.sh install`. Seperti `deploy.sh package`, ia membangun di salinan (HEAD, atau `--worktree`), lalu `deploy/electron-builder.json` mengemas folder standalone ke `resources/app-server`. Aplikasi terpaket menjalankan server itu di `127.0.0.1` pada port bebas (`COOKIE_SECURE=false`, karena HTTP). Alamat API central diisi lewat `/settings` atau env `CENTRAL_API_URL`. Nilai `NEXT_PUBLIC_*` ditanam saat build dari `--public-env` (tanpa itu MQTT dan login scan kamera mati). Ikon aplikasi `electron/icon.png` dibuat dari `app/icon.svg` (ikon web): ulangi `node scripts/dev.mjs icon` bila ikon web berubah. Satu build untuk satu OS; electron-builder mengunduh alatnya, jadi mesin build butuh internet.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
