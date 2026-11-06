# VENTZER Web

Frontend Vite + React untuk platform event VENTZER. Backend ada di repo terpisah: [ventzer-api](https://github.com/stevanusbilly/ventzer-api).

Frontend tidak terhubung ke database. Semua data lewat HTTP ke API (`VITE_API_URL`).

## Menjalankan

```bash
cp .env.example .env
npm install
npm run dev
```

Default local: frontend `http://localhost:3001`, API `http://localhost:3000/api`.

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Vite development |
| `npm run build` | Build production ke `dist/` |
| `npm start` | Serve `dist/` (Hostinger / production) |
| `npm run preview` | Preview hasil build |

## Environment

| Variabel | Contoh local | Production |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000/api` | URL API termasuk `/api` |
| `VITE_FRONTEND_URL` | `http://localhost:3001` | `https://ventzer.com` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID Google tipe Web | Sama dengan `GOOGLE_CLIENT_ID` di API |
| `VITE_WHATSAPP_NUMBER` | `62xxxxxxxxxxx` | Nomor WhatsApp bisnis; tombol kanan bawah hanya muncul jika terisi |
| `VITE_WHATSAPP_TEXT` | teks sapaan opsional | Pesan awal saat tombol WhatsApp diklik |

File `.env` tidak boleh masuk Git.

## Hostinger

- Root aplikasi: root repo ini
- Node.js 24
- Build: `npm run build`
- Start: `npm start`
- Set `VITE_API_URL` sebelum build, karena Vite menanam nilainya ke bundle
