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
deploy/build-package.sh --version 1.0.0     # dist-package/samtek-vms-1.0.0-linux-x86_64.tar.gz (membangun di salinan, bukan di .next)
# di server: ekstrak, lalu
sudo deploy/install.sh --public-url https://vms.example.com --api-url http://127.0.0.1:3000
sudo deploy/verify.sh
```

`install.sh` membaca `samtek-api` dan `samtek-mosquitto` yang ada di mesin yang sama untuk `CENTRAL_API_URL` dan alamat MQTT browser (`/mqtt` di nginx diteruskan ke WebSocket broker di loopback). Nilai `NEXT_PUBLIC_*` dibangun sebagai placeholder dan ditulis saat instalasi dari `/etc/samtek/vms/public.env`, jadi satu paket melayani semua instalasi; ubah berkas itu lalu `deploy/install.sh --reapply`. Nilai itu terkirim ke setiap browser: pakai akun MQTT yang hanya boleh membaca. `SAMTEK_STANDALONE=1` di `next.config.ts` hanya dipakai skrip build; `npm run build` dan `next start` tidak berubah.

| Skrip | Fungsi |
| --- | --- |
| `build-package.sh` | Membangun dan mengemas (binary Node + standalone + skrip), `--worktree` untuk working tree dengan perubahan yang belum di-commit |
| `install.sh` | User `samtek-vms`, env (0640), nilai browser, situs nginx (ditulis sekali; `--rewrite-nginx` untuk mengubah), unit |
| `upgrade.sh` | Dari paket baru: ganti rilis, `verify.sh`, rollback bila gagal |
| `uninstall.sh` | Bawaan hanya unit, situs nginx dan rilis; `--purge-config` dan `--purge-data` meminta frasa |
| `verify.sh` | Baca-saja: Node hanya di loopback, tanpa placeholder tersisa, `/login`, nginx, `/mqtt` (handshake 101) |

`SAMTEK_ROOT=<folder>` menaruh semua path di bawah folder itu dan melewati user, systemd dan reload nginx, untuk mencoba skrip tanpa root.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
