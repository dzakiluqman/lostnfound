# Lost & Found Campus (`lostnfound`)

Monorepo aplikasi pencarian dan pelaporan barang hilang di lingkungan kampus dengan fitur real-time chat, upload foto, dan autentikasi.

---

## 🛠️ Tech Stack

- **Frontend**: [Expo](https://expo.dev/) (React Native) + [Expo Router](https://docs.expo.dev/router/introduction/)
- **Backend**: [Express.js](https://expressjs.com/) (Node.js) with Helmet, CORS, Morgan
- **Database & Storage**: [Supabase](https://supabase.com/) (PostgreSQL, Supabase Auth, Storage `item-images`, & Realtime)
- **Monorepo Management**: npm workspaces & `concurrently`

---

## 📁 Struktur Direktori Monorepo

```text
D:\GitHub\lostnfound
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── supabase.js         # Supabase Client & Admin Client
│   │   │   ├── controllers/
│   │   │   │   ├── auth.js             # Register, Login, Me
│   │   │   │   ├── items.js            # CRUD items, filter, update status
│   │   │   │   └── chat.js             # Room management & messages
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.js             # Supabase JWT token verification
│   │   │   │   └── errorHandler.js     # Global error & 404 handler
│   │   │   ├── routes/
│   │   │   │   ├── index.js            # API root & Health Check
│   │   │   │   ├── auth.js             # /api/auth
│   │   │   │   ├── items.js            # /api/items
│   │   │   │   └── chat.js             # /api/chat
│   │   │   └── app.js                  # Inisialisasi Express server
│   │   ├── .env.example
│   │   └── package.json
│   └── frontend/
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── _layout.jsx
│       │   │   ├── login.jsx           # Form login
│       │   │   └── register.jsx        # Form registrasi
│       │   ├── (tabs)/
│       │   │   ├── _layout.jsx         # Bottom Tabs layout
│       │   │   ├── index.jsx           # Feed: Barang Hilang vs Ditemukan
│       │   │   ├── add-item.jsx        # Form Lapor Barang + Upload Foto
│       │   │   ├── chats.jsx           # Daftar Ruang Percakapan
│       │   │   └── profile.jsx         # Profil, My Posts, & Logout
│       │   ├── item/
│       │   │   └── [id].jsx            # Detail Barang & Hubungi Pelapor
│       │   ├── chat/
│       │   │   └── [roomId].jsx        # Chat Room Real-time (Supabase Channel)
│       │   ├── _layout.jsx             # Root layout with AuthProvider
│       │   └── index.jsx               # Redirect to (tabs)
│       ├── assets/                     # App icons & splash
│       ├── components/
│       │   └── ItemCard.jsx            # Kartu barang hilang & ditemukan
│       ├── services/
│       │   ├── supabase.js             # Supabase client + Storage upload helper
│       │   ├── api.js                  # Backend API client with offline fallback
│       │   └── authContext.js          # Auth state & session provider
│       ├── .env.example
│       ├── app.json
│       ├── babel.config.js
│       ├── eas.json
│       └── package.json
├── supabase_schema.sql                 # Skrip SQL lengkap untuk Supabase
├── .env.example                        # Template env global
├── .gitignore
├── package.json
└── README.md
```

---

## 🗄️ Setup Database & Storage Supabase

### 1. Eksekusi Skema Database
Buka **SQL Editor** pada project Supabase Anda, salin dan jalankan seluruh isi file:
👉 [supabase_schema.sql](file:///d:/GitHub/lostnfound/supabase_schema.sql)

Skrip ini otomatis membuat:
- Tabel `public.profiles` beserta auto-trigger dari `auth.users`.
- Tabel `public.items` (laporan barang hilang/ditemukan).
- Tabel `public.chat_rooms` & `public.chat_messages`.
- Row Level Security (RLS) policies.
- Mengaktifkan **Supabase Realtime** pada tabel `chat_messages`.

### 2. Buat Bucket Storage Supabase
1. Masuk ke Dashboard Supabase -> Menu **Storage**.
2. Klik **New Bucket**.
3. Beri nama: `item-images`.
4. Centang opsi **Public bucket** (agar foto barang dapat diakses langsung oleh aplikasi).
5. Klik **Save**.

---

## 🚀 Panduan Memulai (Getting Started)

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Variabel Lingkungan (`.env`)

#### Backend (`apps/backend/.env`):
```env
PORT=5000
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
```

#### Frontend (`apps/frontend/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ey...
EXPO_PUBLIC_BACKEND_URL=http://localhost:5000/api
```
*(Catatan: Jika menguji via Android Emulator, ganti `localhost:5000` dengan `10.0.2.2:5000`, atau IP lokal komputer jika menggunakan perangkat fisik).*

---

## ▶️ Menjalankan Aplikasi

### Menjalankan Backend & Frontend Sekaligus (Rekomendasi)
```bash
npm run dev
```

### Menjalankan Masing-Masing Layanan

#### Backend Saja:
```bash
npm run dev:backend
```
Server berjalan di `http://localhost:5000`.

#### Frontend Saja:
```bash
npm run dev:frontend
```
- Tekan `w` di terminal untuk membuka di Browser Web.
- Tekan `a` untuk membuka di Emulator Android.
- Buka aplikasi **Expo Go** di HP fisik lalu scan QR Code.

---

## 📡 API Endpoints (Backend)

### Autentikasi (`/api/auth`)
| Method | Endpoint | Deskripsi | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Mendaftar akun baru & membuat profil | Publik |
| `POST` | `/api/auth/login` | Login & mendapatkan JWT token | Publik |
| `GET` | `/api/auth/me` | Mengambil data profil yang sedang login | Wajib |

### Barang (`/api/items`)
| Method | Endpoint | Deskripsi | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/items` | Daftar barang (filter: `type`, `category`, `search`, `status`) | Publik |
| `GET` | `/api/items/:id` | Detail barang beserta info pelapor | Publik |
| `POST` | `/api/items` | Membuat laporan barang hilang/temuan | Wajib |
| `PATCH` | `/api/items/:id/status` | Mengubah status barang ('active' / 'resolved') | Wajib (Pemilik) |
| `DELETE` | `/api/items/:id` | Menghapus laporan barang milik sendiri | Wajib (Pemilik) |

### Percakapan / Chat (`/api/chat`)
| Method | Endpoint | Deskripsi | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/chat/room` | Cari atau buat ruang chat terkait suatu barang | Wajib |
| `GET` | `/api/chat/rooms` | Daftar seluruh ruang chat aktif user | Wajib |
| `GET` | `/api/chat/rooms/:roomId/messages` | Histori pesan dalam suatu ruang chat | Wajib |
| `POST` | `/api/chat/rooms/:roomId/messages` | Mengirim pesan baru ke ruang chat | Wajib |

---

## 💬 Fitur Real-time Chat
Pada layar `apps/frontend/app/chat/[roomId].jsx`, pesan baru disinkronkan secara instan menggunakan WebSocket channel dari Supabase:
```javascript
supabase
  .channel(`chat_room:${roomId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `room_id=eq.${roomId}`,
  }, (payload) => {
    // Pesan baru langsung muncul secara instan
  })
  .subscribe();
```
