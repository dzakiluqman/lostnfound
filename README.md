# Lost & Found Campus (`lostnfound`)

Monorepo aplikasi pencarian dan pelaporan barang hilang di lingkungan kampus.

---

## 🛠️ Tech Stack

- **Frontend**: [Expo](https://expo.dev/) (React Native) with [Expo Router](https://docs.expo.dev/router/introduction/)
- **Backend**: [Express.js](https://expressjs.com/) (Node.js) with Helmet, CORS, Morgan
- **Database & Realtime**: [Supabase](https://supabase.com/) (PostgreSQL & Realtime Client)
- **Monorepo Management**: npm workspaces & `concurrently`

---

## 📁 Struktur Direktori

```text
D:\GitHub\lostnfound
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── supabase.js       # Inisialisasi Supabase Client
│   │   │   ├── controllers/
│   │   │   │   └── itemController.js # Logika CRUD barang hilang & ditemukan
│   │   │   ├── middlewares/
│   │   │   │   └── errorHandler.js   # Middleware penanganan error & 404
│   │   │   ├── routes/
│   │   │   │   ├── index.js          # Router utama API & Health check
│   │   │   │   └── itemRoutes.js     # Endpoint /api/items
│   │   │   └── app.js                # Inisialisasi Express server
│   │   ├── .env.example              # Template env backend
│   │   └── package.json
│   └── frontend/
│       ├── app/
│       │   ├── _layout.jsx           # Root layout Expo Router
│       │   └── index.jsx             # Halaman utama daftar barang
│       ├── assets/                   # Icon, Splash, dan asset gambar
│       ├── components/
│       │   └── ItemCard.jsx          # Komponen kartu barang hilang/ditemukan
│       ├── services/
│       │   └── supabase.js           # Client Supabase dengan AsyncStorage
│       ├── .env.example              # Template env frontend
│       ├── app.json                  # Konfigurasi Expo & Expo Router
│       ├── eas.json                  # Konfigurasi EAS Build
│       └── package.json
├── .env.example                      # Template env global monorepo
├── .gitignore                        # Konfigurasi git ignore
├── package.json                      # Root workspace konfigurasi
└── README.md
```

---

## 🚀 Memulai (Getting Started)

### 1. Prasyarat
- **Node.js** >= 18 (direkomendasikan LTS)
- **npm** >= 9
- Akun dan project aktif di [Supabase](https://supabase.com/)

### 2. Instalasi Dependensi
Jalankan perintah berikut pada direktori root project untuk menginstal seluruh dependensi backend dan frontend:

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Salin file `.env.example` ke `.env` pada masing-masing workspace:

#### Backend (`apps/backend/.env`):
```bash
cp apps/backend/.env.example apps/backend/.env
```
Isi dengan kredensial Supabase Anda:
```env
PORT=5000
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
```

#### Frontend (`apps/frontend/.env`):
```bash
cp apps/frontend/.env.example apps/frontend/.env
```
Isi dengan kredensial publik Supabase:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ey...
```

---

## 🗄️ Setup Database Supabase

Jalankan query SQL berikut pada **SQL Editor** di Dashboard Supabase untuk membuat tabel `items`:

```sql
-- Buat enum tipe barang & status
CREATE TYPE item_type AS ENUM ('lost', 'found');
CREATE TYPE item_status AS ENUM ('open', 'claimed', 'resolved');

-- Buat tabel items
CREATE TABLE IF NOT EXISTS public.items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  type item_type NOT NULL DEFAULT 'lost',
  location VARCHAR(255) NOT NULL,
  image_url TEXT,
  contact_info VARCHAR(255),
  status item_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang dapat membaca item
CREATE POLICY "Public items are viewable by everyone" 
ON public.items FOR SELECT USING (true);

-- Policy: User dapat membuat item baru
CREATE POLICY "Anyone can insert items" 
ON public.items FOR INSERT WITH CHECK (true);
```

---

## ▶️ Menjalankan Aplikasi

### Menjalankan Backend & Frontend Bersamaan (Rekomendasi)
Dari root direktori `lostnfound`:
```bash
npm run dev
```

### Menjalankan Masing-Masing Layanan

#### Backend Saja:
```bash
npm run dev:backend
# atau:
# cd apps/backend && npm run dev
```
Server backend akan berjalan di: `http://localhost:5000`

#### Frontend Saja:
```bash
npm run dev:frontend
# atau:
# cd apps/frontend && npm run start
```
- Tekan `w` di terminal untuk membuka versi Web di browser.
- Tekan `a` untuk membuka di emulator Android.
- Pindai QR Code menggunakan aplikasi **Expo Go** pada perangkat fisik.

---

## 📡 API Endpoints (Backend)

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/` | Informasi dasar API |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/items` | Ambil semua item (Filter: `?type=lost`, `?status=open`, `?search=...`) |
| `GET` | `/api/items/:id` | Ambil detail item berdasarkan ID |
| `POST` | `/api/items` | Daftarkan barang hilang / ditemukan baru |

---

## 📱 EAS Build (Mobile Deployment)
File konfigurasi `eas.json` telah disediakan pada `apps/frontend/eas.json`. Untuk build mobile:
```bash
cd apps/frontend
npx eas-cli build --profile preview --platform android
```
