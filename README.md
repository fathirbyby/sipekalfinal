# SIPEKAL - Sistem Informasi Pemeliharaan Alat Kesehatan & Lingkungan

Sistem manajemen tiket pemeliharaan berbasis web untuk fasilitas kesehatan.

## Tech Stack
- **Frontend:** Vite + React + TypeScript + Tailwind CSS v4
- **Backend:** Netlify Serverless Functions
- **Database:** Neon PostgreSQL
- **Auth:** JWT + bcryptjs

## Roles
- **Admin** - Kelola tiket, disposisi teknisi
- **Teknisi** - Terima dan selesaikan tugas
- **User** - Buat laporan kerusakan

## Setup
```bash
npm install
npm run dev
```

## Environment Variables
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
```
