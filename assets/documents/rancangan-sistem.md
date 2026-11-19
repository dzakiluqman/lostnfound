# Dokumen Rancangan Sistem (System Design Document)
## Proyek Rekayasa Perangkat Lunak: Sistem Informasi Lost & Found

---

| Dokumen | Spesifikasi Rancangan Sistem (Pertemuan 10 - Lanjutan P8) |
| :--- | :--- |
| **Mata Kuliah** | Rekayasa Perangkat Lunak / Software Engineering |
| **Nama Proyek** | **Lost & Found (`lostnfound`)** |
| **Format Berkas Pengumpulan** | `SWSL10_Kel04_LostNFound_Rancangan.pdf` *(Ekspor A4 - Calibri/TNR 12)* |
| **Tahapan Sistem** | Perancangan Teknis Arsitektur, Komponen, Data, API, UI/UX, dan Keamanan |
| **Target Implementasi** | **Backend**: ElysiaJS (Bun Runtime, TypeScript) <br> **Database**: Neon (Serverless PostgreSQL) <br> **Web Admin**: React + Vite + Tailwind CSS <br> **Mobile App**: React Native |
| **Tanggal Pembaruan** | 2026-11-19 |

---

### TABEL KONTRIBUSI TIM PROYEK

| No | Nama Anggota | NIM | Peran Tim Proyek | Kontribusi Utama dalam Analisis & Rancangan | Beban Kerja |
| :-: | :--- | :---: | :--- | :--- | :---: |
| 1 | **Dzakii Luqman Faid** | 2410506016 | **UI/UX Designer** | Formulasi Problem Statement 4 Bagian, Perancangan Alur UX Mobile/Web, Pemetaan Persona Pengguna, Penyusunan Wireframe Antarmuka, dan Prototipe Interaktif Figma. | 25% |
| 2 | **Lu’luatina Zakiyatal Fikri** | 2420506034 | **Frontend Web Developer** | Elisitasi Kebutuhan Admin Satpam, Perancangan Dashboard Web (React + Vite + Tailwind CSS), Alur Form BAST Digital & Webcam Capture, serta Matriks Ruang Lingkup. | 25% |
| 3 | **Farrel Apriandry Ciu** | 2430506056 | **Backend Engineer** | Analisis 5 Whys Akar Masalah, Perancangan Arsitektur Berlapis & Draf Endpoint REST API (ElysiaJS/Bun), DDL Data Model Neon Serverless PostgreSQL, dan Kebutuhan Non-Fungsional (ISO 25010). | 25% |
| 4 | **Nabila Syafiqah Zahran Firlina** | 2430506058 | **Mobile Developer** | Elisitasi Kebutuhan Civitas Akademika, Pemodelan User Story (React Native), Diagram Use Case & Spesifikasi Detail, Alur Komunikasi Sequence Diagram, serta Matriks Keterlacakan (Traceability Matrix). | 25% |

---

## Daftar Isi

1. [Bab 1: Arsitektur Sistem dan Gaya Arsitektur](#1-arsitektur-sistem-dan-gaya-arsitektur)
   - 1.1 [Diagram Arsitektur Berlapis (Layered Architecture Diagram)](#11-diagram-arsitektur-berlapis-layered-architecture-diagram)
   - 1.2 [Alasan Pemilihan Gaya Arsitektur](#12-alasan-pemilihan-gaya-arsitektur)
2. [Bab 2: Component Diagram dan Antarmuka Modul](#2-component-diagram-dan-antarmuka-modul)
   - 2.1 [Diagram Komponen Sistem (UML Component Diagram)](#21-diagram-komponen-sistem-uml-component-diagram)
   - 2.2 [Deskripsi Komponen, Modul, dan Dependensi](#22-deskripsi-komponen-modul-dan-dependensi)
3. [Bab 3: Desain RESTful API](#3-desain-restful-api)
   - 3.1 [Prinsip dan Konvensi Desain API](#31-prinsip-dan-konvensi-desain-api)
   - 3.2 [Katalog Endpoint REST API (Minimal 8 Endpoint Terlacak)](#32-katalog-endpoint-rest-api-minimal-8-endpoint-terlacak)
   - 3.3 [Contoh Rinci Request & Response Payload](#33-contoh-rinci-request--response-payload)
4. [Bab 4: Data Model dan Entity Relationship Diagram (ERD)](#4-data-model-dan-entity-relationship-diagram-erd)
   - 4.1 [Visualisasi Entity Relationship Diagram (ERD)](#41-visualisasi-entity-relationship-diagram-erd)
   - 4.2 [Struktur Tabel, Tipe Data, dan Batasan Integritas Data (3NF)](#42-struktur-tabel-tipe-data-dan-batasan-integritas-data-3nf)
5. [Bab 5: Alur Komunikasi Sistem (Sequence Diagrams)](#5-alur-komunikasi-sistem-sequence-diagrams)
   - 5.1 [Sequence Diagram 1: Autentikasi Pengguna & Penerbitan Token JWT](#51-sequence-diagram-1-autentikasi-pengguna--penerbitan-token-jwt)
   - 5.2 [Sequence Diagram 2: Penerimaan Fisik Barang Temuan di Pos Satpam (*Security Intake*)](#52-sequence-diagram-2-penerimaan-fisik-barang-temuan-di-pos-satpam-security-intake)
   - 5.3 [Sequence Diagram 3: Validasi Klaim Bukti Kepemilikan & Penerbitan BAST Digital](#53-sequence-diagram-3-validasi-klaim-bukti-kepemilikan--penerbitan-bast-digital)
6. [Bab 6: Rancangan Antarmuka Pengguna (UI/UX Prototype)](#6-rancangan-antarmuka-pengguna-uiux-prototype)
   - 6.1 [Diagram Alur Pengguna (User Flow Diagram)](#61-diagram-alur-pengguna-user-flow-diagram)
   - 6.2 [Spesifikasi dan Tata Letak Layar Inti (Mobile & Web Admin)](#62-spesifikasi-dan-tata-letak-layar-inti-mobile--web-admin)
   - 6.3 [Tautan Prototipe Interaktif Figma](#63-tautan-prototipe-interaktif-figma)
7. [Bab 7: Arsitektur Keamanan dan Mitigasi OWASP API Top 10](#7-arsitektur-keamanan-dan-mitigasi-owasp-api-top-10)
   - 7.1 [Lapisan Keamanan Sistem (Defense-in-Depth)](#71-lapisan-keamanan-sistem-defense-in-depth)
   - 7.2 [Matriks Pemetaan Mitigasi OWASP API Security Top 10 (2023)](#72-matriks-pemetaan-mitigasi-owasp-api-security-top-10-2023)
8. [Bab 8: Kontrol Akses (Access Control & Authorization Policies)](#8-kontrol-akses-access-control--authorization-policies)
   - 8.1 [Matriks Role-Based Access Control (RBAC)](#81-matriks-role-based-access-control-rbac)
   - 8.2 [Aturan Otorisasi Tingkat Objek (Object-Level Authorization Policies)](#82-aturan-otorisasi-tingkat-objek-object-level-authorization-policies)
9. [Bab 9: Matriks Keterlacakan Desain (Traceability Matrix)](#9-matriks-keterlacakan-desain-traceability-matrix)

---

## 1. Arsitektur Sistem dan Gaya Arsitektur

### 1.1 Diagram Arsitektur Berlapis (Layered Architecture Diagram)

Sistem **Lost & Found** mengadopsi gaya arsitektur **Monolit Modular Berlapis (*Layered Modular Monolith*)** dengan pola Klien-Server (*Client-Server Architecture*). Pemisahan tanggung jawab dilakukan secara tegas antar lapisan dari *Presentation Layer* pada perangkat klien hingga *Data Persistence Layer* pada infrastruktur basis data *cloud*.

```mermaid
flowchart TD
    subgraph Presentation Layer [Presentation Layer (Klien Front-End)]
        MOB["Aplikasi Mobile (React Native)<br>Aktor: Mahasiswa & Tendik<br>- UI Screens / Components<br>- Zustand State Store<br>- React Native Secure Store"]
        WEB["Dashboard Web Admin (React + Vite + Tailwind CSS)<br>Aktor: Petugas Satpam<br>- Responsive Admin Layout<br>- Webcam Scanner Integration<br>- PDF Renderer (BAST)"]
    end

    subgraph Network Layer [Transport & Network Security Layer]
        HTTPS["HTTPS Protocol (TLS 1.3 / HSTS)"]
        WSS["WSS Protocol (WebSocket Secure)"]
    end

    subgraph Application Layer [Application Layer (ElysiaJS Backend Engine on Bun)]
        ROUTER["Routing & Gateway Layer<br>- Prefix Versioning (/api/v1)<br>- CORS & Security Headers (Helmet)"]
        
        subgraph Security Interceptors [Security & Middleware Interceptors]
            THROTTLE["Rate Limiter / Throttle Plugin"]
            JWT_GUARD["JWT Authentication Guard (@elysiajs/jwt)"]
            RBAC_GUARD["Role-Based Access Control Middleware"]
            VALIDATOR["TypeBox Schema Validation Guard"]
        end

        subgraph Core Modules [Modular Business Logic Services]
            AUTH_MOD["Auth Service<br>(Argon2id Hashing & Token Engine)"]
            ITEM_MOD["Item Catalog Service<br>(Post, Search, Filter, Lifecycle)"]
            INTAKE_MOD["Security Intake Service<br>(Physical Storage & Locker Mgmt)"]
            CLAIM_MOD["Claim & BAST Service<br>(Proof Verification & Audit Record)"]
            CHAT_MOD["Real-Time Messaging Service<br>(Native Elysia WebSocket Handler)"]
        end

        DATA_ACCESS["Data Access Layer (DAL) / ORM Layer<br>- Drizzle ORM Schema & Queries<br>- Neon Connection Pooler Client"]
    end

    subgraph Persistence Layer [Persistence & Cloud Infrastructure Layer]
        NEON[("Neon Serverless PostgreSQL v16<br>- Relational Tables with Foreign Keys<br>- Indexes on Status, Post, Category<br>- Connection Pooling (PgBouncer)")]
        STORAGE[("Cloud Object Storage (S3-Compatible)<br>- Public Bucket: item-images<br>- Private Bucket: security-claims (Presigned URLs)")]
    end

    MOB -->|"REST API Calls"| HTTPS
    MOB -->|"Live Chat Sync"| WSS
    WEB -->|"REST API Calls"| HTTPS
    WEB -->|"Status Alerts"| WSS

    HTTPS --> ROUTER
    WSS --> ROUTER

    ROUTER --> THROTTLE
    THROTTLE --> JWT_GUARD
    JWT_GUARD --> RBAC_GUARD
    RBAC_GUARD --> VALIDATOR

    VALIDATOR --> AUTH_MOD & ITEM_MOD & INTAKE_MOD & CLAIM_MOD & CHAT_MOD

    AUTH_MOD & ITEM_MOD & INTAKE_MOD & CLAIM_MOD & CHAT_MOD --> DATA_ACCESS

    DATA_ACCESS -->|"PgBouncer Pool Kueri"| NEON
    ITEM_MOD & CLAIM_MOD -->|"Presigned Upload URLs"| STORAGE
```

### 1.2 Alasan Pemilihan Gaya Arsitektur

Pemilihan gaya arsitektur **Monolit Modular Berlapis Klien-Server** didasarkan pada pertimbangan rekayasa teknis dan operasional berikut:
1. **Kesesuaian dengan Skala Proyek dan Tim Pengembang**:
   Sistem ini dikembangkan oleh tim berskala kecil dengan domain bisnis yang padat dan saling berhubungan erat (pelaporan $\rightarrow$ penitipan fisik $\rightarrow$ verifikasi $\rightarrow$ serah terima). Arsitektur *microservices* akan menambah kompleksitas *network latency*, *distributed transaction (2PC/Saga)*, serta biaya *overhead* infrastruktur yang tidak diperlukan.
2. **Kinerja Eksekusi Tinggi dengan ElysiaJS & Bun**:
   Runtime **Bun** menyediakan kompilasi instan dan eksekusi I/O berkecepatan tinggi, sementara **ElysiaJS** menyediakan *routing overhead* yang mendekati nol dengan validasi statis berbasis skema **TypeBox**. Hal ini memungkinkan backend tunggal menangani ribuan koneksi konkuren dengan konsumsi memori kurang dari 50 MB.
3. **Pemisahan Modul Domain yang Bersih (*Clean Separation of Concerns*)**:
   Setiap modul fungsional (*Auth, Items, Security Intake, Claims, Chat*) dikelompokkan secara mandiri dalam direktori terpisah dengan kontrak antarmuka yang terisolasi. Jika di masa mendatang salah satu modul (misal: *Chat Real-time*) membutuhkan skalabilitas terpisah, modul tersebut dapat diekstraksi menjadi *microservice* tanpa mengubah logika inti.
4. **Keamanan Melalui Jalur Pipa Terpusat (*Pipelined Security Middleware*)**:
   Arsitektur berlapis memastikan seluruh *traffic* klien wajib melalui *gatekeeper* terpusat: *Rate Limiting* $\rightarrow$ *JWT Verification* $\rightarrow$ *Role Check* $\rightarrow$ *TypeBox Sanitization* sebelum menyentuh lapisan basis data.

---

## 2. Component Diagram dan Antarmuka Modul

### 2.1 Diagram Komponen Sistem (UML Component Diagram)

Diagram komponen berikut memvisualisasikan modul-modul pembentuk sistem, antarmuka yang disediakan (*provided interfaces* berlabel `O-`), antarmuka yang dibutuhkan (*required interfaces* berlabel `)-`), serta garis dependensinya:

```mermaid
flowchart LR
    subgraph Client Apps [Klien Pengguna & Admin]
        C_MOB["Component: Mobile Client App<br>(React Native)"]
        C_WEB["Component: Web Admin Portal<br>(React + Vite + Tailwind)"]
    end

    subgraph Backend Subsystem [ElysiaJS Backend Subsystem]
        subgraph Ingress [Ingress & Middleware Components]
            I_AUTH_FILTER["Component: Auth & RBAC Interceptor"]
            I_VALIDATOR["Component: Schema Validator"]
        end

        subgraph Core Business Modules [Domain Service Components]
            M_AUTH["Component: Authentication Module<br>(Session, Password Hashing)"]
            M_ITEM["Component: Items Management Module<br>(CRUD, Lifecycle, Search)"]
            M_INTAKE["Component: Security Intake Module<br>(Post & Locker Management)"]
            M_CLAIM["Component: Claim & BAST Module<br>(Verification & PDF Export)"]
            M_CHAT["Component: Realtime Chat Module<br>(WebSocket Connection Hub)"]
        end

        subgraph Infrastructure Connectors [Infrastructure Connectors]
            CONN_DB["Component: Database Connector (Drizzle ORM)"]
            CONN_S3["Component: Cloud Storage Client (S3 SDK)"]
        end
    end

    subgraph External Infrastructure [Infrastructure & External Services]
        EXT_NEON[("Database: Neon Serverless Postgres")]
        EXT_S3[("Storage: S3-Compatible Storage")]
    end

    %% Client dependencies
    C_MOB -->|HTTP JSON / WSS| I_AUTH_FILTER
    C_WEB -->|HTTP JSON Admin| I_AUTH_FILTER

    I_AUTH_FILTER --> I_VALIDATOR
    I_VALIDATOR --> M_AUTH
    I_VALIDATOR --> M_ITEM
    I_VALIDATOR --> M_INTAKE
    I_VALIDATOR --> M_CLAIM
    I_VALIDATOR --> M_CHAT

    M_AUTH --> CONN_DB
    M_ITEM --> CONN_DB
    M_ITEM --> CONN_S3
    M_INTAKE --> CONN_DB
    M_CLAIM --> CONN_DB
    M_CLAIM --> CONN_S3
    M_CHAT --> CONN_DB

    CONN_DB -->|TCP / Pooler Port 5432| EXT_NEON
    CONN_S3 -->|HTTPS REST S3 API| EXT_S3
```

### 2.2 Deskripsi Komponen, Modul, dan Dependensi

| Nama Komponen | Tipe | Antarmuka Disediakan (*Provided Interface*) | Antarmuka Dibutuhkan (*Required Interface*) | Deskripsi Tanggung Jawab |
| :--- | :---: | :--- | :--- | :--- |
| **Mobile Client App** | Klien | UI Screens (Mahasiswa/Tendik) | `IAuthAPI`, `IItemAPI`, `IChatWS` | Menangani presentasi data mobile, tangkapan kamera ponsel, penyimpanan token aman di gawai. |
| **Web Admin Portal** | Klien | Admin UI (Petugas Satpam) | `IAuthAPI`, `IIntakeAPI`, `IClaimAPI` | Menyajikan antarmuka komputer pos satpam, integrasi webcam BAST, pencetakan berkas PDF tanda terima. |
| **Auth & RBAC Interceptor** | Filter | `IHttpIngress` | `IValidator` | Memeriksa token Bearer JWT, mendekripsi klaim peran (*role*), menolak akses ilegal (401/403). |
| **Authentication Module** | Domain | `IAuthAPI` | `IDatabaseQuery` | Registrasi akun civitas, login, verifikasi sandi hash Argon2id, penerbitan token sesi JWT. |
| **Items Management Module** | Domain | `IItemAPI` | `IDatabaseQuery`, `IS3Presigned` | Menerima postingan laporan barang, kueri penelusuran filter cerdas, manajemen siklus hidup barang. |
| **Security Intake Module** | Domain | `IIntakeAPI` | `IDatabaseQuery` | Memvalidasi penerimaan fisik barang di pos jaga, alokasi loker/rak penyimpanan, mutasi posisi barang. |
| **Claim & BAST Module** | Domain | `IClaimAPI` | `IDatabaseQuery`, `IS3Storage` | Menangani form BAST digital, penyimpanan foto KTM & serah terima, *auto-resolve*, ekspor PDF. |
| **Realtime Chat Module** | Domain | `IChatWS` | `IDatabaseQuery` | Mengelola *lifecycle* koneksi WebSocket, pengiriman pesan instan dua arah, penyiaran status barang. |
| **Database Connector** | DAL | `IDatabaseQuery` | PostgreSQL Driver Protocol | Mengelola *connection pooling* via PgBouncer ke Neon Postgres, eksekusi kueri terindeks. |

---

## 3. Desain RESTful API

### 3.1 Prinsip dan Konvensi Desain API
Desain REST API sistem Lost & Found mengikuti kaidah arsitektur standar industri:
1. **Penamaan Berbasis Sumber Daya (*Resource-Oriented*)**: Menggunakan kata benda jamak (*plural nouns*) untuk entitas sumber daya (misal: `/api/v1/items`, `/api/v1/claims`, bukan kata kerja seperti `/api/v1/getItems`).
2. **Penggunaan Metode HTTP Semantik**:
   - `GET`: Mengambil data sumber daya tanpa efek samping (*safe & idempotent*).
   - `POST`: Membuat sumber daya baru atau memicu operasi pemrosesan intensif.
   - `PATCH`: Memperbarui sebagian atribut sumber daya (misal: mutasi status atau loker).
   - `DELETE`: Menghapus atau membatalkan sumber daya.
3. **Prefix dan Versi API**: Seluruh rute dilindungi dengan awalan `/api/v1/...` untuk mendukung *backward-compatibility*.
4. **Format Respons Standar Terstruktur**:
   ```json
   {
     "success": true,
     "message": "Deskripsi hasil operasi",
     "data": {},
     "meta": { "page": 1, "limit": 20, "total": 100 }
   }
   ```
5. **Kode Status HTTP Standar**: Mengembalikan kode yang bermakna (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `429 Too Many Requests`).

### 3.2 Katalog Endpoint REST API (Minimal 8 Endpoint Terlacak)

Berikut adalah daftar endpoint REST API yang telah dipetakan ke Kebutuhan Fungsional (KF):

| No | HTTP Method | URL Path | Deskripsi Fungsi | Otorisasi Akses | Kode KF Terlacak |
| :-: | :---: | :--- | :--- | :---: | :---: |
| **1** | `POST` | `/api/v1/auth/register` | Mendaftarkan akun mahasiswa atau tendik baru | Publik | **KF-01** |
| **2** | `POST` | `/api/v1/auth/login` | Autentikasi kredensial email & kata sandi | Publik | **KF-01** |
| **3** | `GET` | `/api/v1/auth/me` | Mengambil data profil pengguna yang sedang login | Wajib (Bearer JWT) | **KF-01** |
| **4** | `GET` | `/api/v1/items` | Menelusuri katalog barang (filter status, tipe, gedung) | Publik | **KF-03** |
| **5** | `GET` | `/api/v1/items/:id` | Mengambil detail lengkap barang & lokasi pos satpam | Publik | **KF-03** |
| **6** | `POST` | `/api/v1/items` | Mempublikasikan laporan barang hilang / temuan baru | Wajib (Civitas User) | **KF-02** |
| **7** | `POST` | `/api/v1/items/presigned-url` | Meminta URL bertanda tangan untuk unggah foto langsung | Wajib (Civitas/Satpam) | **KF-02** |
| **8** | `PATCH`| `/api/v1/security/intake/:id` | Konfirmasi fisik diterima di pos & alokasi nomor loker | Wajib (`admin_satpam`) | **KF-04** |
| **9** | `POST` | `/api/v1/claims/validate` | Validasi kepemilikan, unggah foto BAST, set `resolved` | Wajib (`admin_satpam`) | **KF-05** |
| **10**| `GET` | `/api/v1/claims/:id/export-pdf`| Mengunduh dokumen cetak Berita Acara (BAST) PDF resmi | Wajib (`admin_satpam`) | **KF-07** |
| **11**| `GET` | `/api/v1/admin/metrics` | Mengambil ringkasan indikator kinerja harian pos jaga | Wajib (`admin_satpam`) | **KF-08** |
| **12**| `WS` | `/ws/v1/chat` | Koneksi WebSocket dua arah untuk percakapan instan | Wajib (Token Handshake) | **KF-06** |

---

### 3.3 Contoh Rinci Request & Response Payload

Berikut adalah spesifikasi lengkap format permintaan (*request*) dan tanggapan (*response*) untuk 2 endpoint transaksi utama:

#### Endpoint A: `POST /api/v1/auth/login` (Autentikasi Pengguna & Sesi)

* **HTTP Header Request**:
  ```http
  POST /api/v1/auth/login HTTP/1.1
  Host: api.lostnfound.univ.ac.id
  Content-Type: application/json
  Accept: application/json
  ```
* **Payload Request Body**:
  ```json
  {
    "email": "bambang.satpam@univ.ac.id",
    "password": "PasswordSatpam2026!"
  }
  ```
* **Tanggapan Sukses (`HTTP 200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Autentikasi berhasil. Selamat bertugas.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwZTFhOTQyLTAwMDB...",
      "token_type": "Bearer",
      "expires_in": 86400,
      "user": {
        "id": "e6a2bc71-9c3f-4e52-a5e1-884bc7831d10",
        "full_name": "Aiptu Bambang Sudirjo",
        "email": "bambang.satpam@univ.ac.id",
        "role": "admin_satpam",
        "user_type": "satpam",
        "identity_number": "NRP-78091244",
        "assigned_post": {
          "id": "11111111-2222-3333-4444-555555555555",
          "name": "Pos 1 - Gerbang Utama Kampus"
        }
      }
    }
  }
  ```
* **Tanggapan Gagal Kredensial Tidak Valid (`HTTP 401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "message": "Kombinasi email atau kata sandi tidak cocok.",
    "error_code": "AUTH_INVALID_CREDENTIALS"
  }
  ```

---

#### Endpoint B: `POST /api/v1/claims/validate` (Validasi Klaim & Penerbitan BAST Digital)

* **HTTP Header Request**:
  ```http
  POST /api/v1/claims/validate HTTP/1.1
  Host: api.lostnfound.univ.ac.id
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
  Accept: application/json
  ```
* **Payload Request Body**:
  ```json
  {
    "item_id": "89c2f582-7d2a-4dfb-b649-65bc048e9102",
    "claimant_name": "Ahmad Fauzan Pratama",
    "claimant_identity_number": "2200018099",
    "claimant_user_type": "mahasiswa",
    "claimant_phone": "081234567890",
    "faculty_or_unit": "Fakultas Teknologi Industri",
    "proof_description": "Pemohon mampu membuka kunci pola layar smartphone Android dan mencocokkan alamat email akun Google di hadapan petugas jaga.",
    "claimant_id_photo_url": "security-claims/ktm_2200018099_enc.jpg",
    "handover_photo_url": "security-claims/handover_item_89c2f582.jpg",
    "officer_notes": "Barang diserahkan dalam keadaan baik dan lengkap beserta charger aslinya."
  }
  ```
* **Tanggapan Sukses (`HTTP 201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Validasi klaim berhasil disetujui. Berita Acara Serah Terima (BAST) resmi telah diterbitkan.",
    "data": {
      "bast_id": "7fa1bc82-0123-4567-89ab-cdef01234567",
      "bast_registration_number": "BAST/LNF/2026/11/ITM-9102",
      "item_id": "89c2f582-7d2a-4dfb-b649-65bc048e9102",
      "item_title": "Laptop ASUS Vivobook Warna Perak",
      "status": "resolved",
      "handover_at": "2026-11-19T14:30:00Z",
      "validated_by": {
        "officer_name": "Aiptu Bambang Sudirjo",
        "officer_nrp": "NRP-78091244",
        "post_name": "Pos 1 - Gerbang Utama Kampus"
      },
      "pdf_export_url": "/api/v1/claims/7fa1bc82-0123-4567-89ab-cdef01234567/export-pdf"
    }
  }
  ```
* **Tanggapan Gagal Konflik Kepemilikan (*Already Resolved*) (`HTTP 409 Conflict`)**:
  ```json
  {
    "success": false,
    "message": "Barang ini telah berstatus 'resolved' dan sudah diserahkan kepada pihak lain sebelumnya.",
    "error_code": "ITEM_ALREADY_RESOLVED"
  }
  ```

---

## 4. Data Model dan Entity Relationship Diagram (ERD)

### 4.1 Visualisasi Entity Relationship Diagram (ERD)

Model relasional dirancang telah memenuhi kaidah **Normalisasi Bentuk Ketiga (3NF)** tanpa adanya redundansi transitif, dilengkapi penegasan kardinalitas eksplisit (`1:1`, `1:N`), Primary Key (PK), dan Foreign Key (FK):

```mermaid
erDiagram
    PROFILES ||--o{ ITEMS : "membuat laporan (1:N)"
    PROFILES ||--o{ CLAIM_VALIDATIONS : "memvalidasi klaim (1:N)"
    PROFILES ||--o{ CHAT_ROOMS : "sebagai inquirer (1:N)"
    PROFILES ||--o{ CHAT_ROOMS : "sebagai owner (1:N)"
    PROFILES ||--o{ CHAT_MESSAGES : "mengirim pesan (1:N)"
    PROFILES ||--o{ AUDIT_LOGS : "memicu aksi audit (1:N)"
    
    SECURITY_POSTS ||--o{ ITEMS : "menyimpan fisik (1:N)"
    SECURITY_POSTS ||--o{ CLAIM_VALIDATIONS : "lokasi serah terima (1:N)"

    ITEMS ||--o| CLAIM_VALIDATIONS : "memiliki BAST (1:1)"
    ITEMS ||--o{ CHAT_ROOMS : "topik obrolan (1:N)"

    CHAT_ROOMS ||--o{ CHAT_MESSAGES : "memuat histori pesan (1:N)"

    PROFILES {
        uuid id PK "UUID v4 acak"
        string email UK "Email resmi kampus unik"
        string password_hash "Hash Argon2id"
        string full_name "Nama lengkap civitas / satpam"
        string role "user | admin_satpam | superadmin"
        string user_type "mahasiswa | tendik | satpam | dosen"
        string identity_number "NIM / NIP / NRP unik"
        string faculty_or_unit "Fakultas atau Unit Organisasi"
        string phone_number "Nomor WhatsApp aktif"
        string avatar_url "Tautan foto profil"
        timestamp created_at "Waktu pembuatan akun"
        timestamp updated_at "Waktu modifikasi akun"
    }

    SECURITY_POSTS {
        uuid id PK "UUID v4 pos keamanan"
        string post_name UK "Nama pos satpam resmi"
        string location_description "Gedung lokasi pos jaga"
        string phone_extension "Nomor ekstensi telepon pos"
        boolean is_active "Status pos beroperasi"
        timestamp created_at "Waktu inisialisasi pos"
    }

    ITEMS {
        uuid id PK "UUID v4 laporan barang"
        uuid user_id FK "Relasi ke PROFILES(id)"
        string title "Nama singkat barang"
        text description "Rincian spesifikasi & kondisi"
        string category "Kategori barang"
        string type "lost | found"
        string location "Lokasi gedung kejadian"
        string image_url "URL publik foto barang di S3"
        string contact_info "Nomor kontak pelapor"
        string status "active | stored_at_security | in_claim_process | resolved | cancelled"
        uuid security_post_id FK "Relasi ke SECURITY_POSTS(id) (Nullable)"
        string storage_locker_number "Nomor rak / loker fisik pos"
        timestamp security_received_at "Stempel waktu barang masuk pos"
        uuid security_received_by FK "Relasi ke PROFILES(id) Satpam"
        timestamp created_at "Waktu laporan diterbitkan"
        timestamp updated_at "Waktu status terakhir diubah"
    }

    CLAIM_VALIDATIONS {
        uuid id PK "UUID v4 rekaman BAST"
        uuid item_id FK "Relasi UNIQUE ke ITEMS(id) (1:1)"
        uuid security_officer_id FK "Relasi ke PROFILES(id) Satpam"
        uuid security_post_id FK "Relasi ke SECURITY_POSTS(id)"
        string claimant_name "Nama lengkap penerima barang"
        string claimant_identity_number "NIM / NIP penerima barang"
        string claimant_user_type "mahasiswa | tendik"
        string claimant_phone "Nomor telepon aktif penerima"
        text proof_description "Metode uji bukti kepemilikan"
        string claimant_id_photo_url "URL privat foto KTM di S3"
        string handover_photo_url "URL privat foto serah terima di S3"
        text officer_notes "Catatan dinas petugas satpam"
        timestamp handover_at "Waktu serah terima sah"
        timestamp created_at "Waktu pencatatan rekaman"
    }

    CHAT_ROOMS {
        uuid id PK "UUID v4 ruang percakapan"
        uuid item_id FK "Relasi ke ITEMS(id)"
        uuid inquirer_id FK "Relasi ke PROFILES(id) Pemohon"
        uuid owner_id FK "Relasi ke PROFILES(id) Pemilik Laporan"
        timestamp created_at "Waktu room dibuat"
        timestamp updated_at "Waktu aktivitas pesan terakhir"
    }

    CHAT_MESSAGES {
        uuid id PK "UUID v4 pesan percakapan"
        uuid room_id FK "Relasi ke CHAT_ROOMS(id)"
        uuid sender_id FK "Relasi ke PROFILES(id) Pengirim"
        text message "Isi teks percakapan"
        boolean is_system_message "Penanda pesan otomatis bot/sistem"
        timestamp created_at "Waktu pesan terkirim"
    }

    AUDIT_LOGS {
        uuid id PK "UUID v4 jejak audit"
        uuid actor_id FK "Relasi ke PROFILES(id) Pelaksana"
        string action "LOGIN | INTAKE | VALIDATE_CLAIM | RELOCATE"
        string entity_name "items | claim_validations"
        uuid entity_id "ID objek yang terdampak"
        string ip_address "Alamat IP klien operator"
        string user_agent "Identitas perangkat lunak klien"
        timestamp created_at "Stempel waktu kejadian kekal"
    }
```

### 4.2 Struktur Tabel, Tipe Data, dan Batasan Integritas Data (3NF)

1. **Aturan Integritas Entitas (*Entity Integrity*)**: Seluruh tabel menggunakan Primary Key bertipe `UUID` yang dihasilkan otomatis menggunakan fungsi kriptografis `gen_random_uuid()` untuk mencegah pemindaian sekuensial (*ID enumeration attacks*).
2. **Aturan Integritas Referensial (*Referential Integrity*)**:
   - `items.user_id` $\rightarrow$ `ON DELETE CASCADE` terhadap akun pengguna yang bersangkutan.
   - `claim_validations.item_id` $\rightarrow$ `ON DELETE CASCADE` dan memiliki batasan `UNIQUE` (satu barang hanya memiliki tepat satu BAST).
   - `claim_validations.security_officer_id` $\rightarrow$ `ON DELETE RESTRICT` (akun petugas tidak boleh dihapus jika memiliki riwayat validasi BAST dinas).
3. **Penyimpanan Kredensial**: Kolom `password_hash` menggunakan algoritma **Argon2id** dengan *cost parameters* terstandarisasi untuk mencegah serangan *brute-force* GPU dan *rainbow table*.
4. **Indeks Kueri Performa Tinggi**: Dibuat indeks komposit pada `(status, type)` dan `(security_post_id)` untuk memastikan pencarian katalog Neon Serverless Postgres berjalan pada skala $O(\log n)$.

---

## 5. Alur Komunikasi Sistem (Sequence Diagrams)

### 5.1 Sequence Diagram 1: Autentikasi Pengguna & Penerbitan Token JWT

Menggambarkan alur pertukaran pesan saat pengguna atau petugas satpam masuk ke dalam sistem, termasuk penanganan kredensial yang salah:

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna / Satpam
    participant Client as Klien (Mobile / Web Admin)
    participant SecStore as Secure Storage / Cookie
    participant API as ElysiaJS Server (Bun)
    participant DB as Neon Serverless Postgres

    User->>Client: Input Email & Kata Sandi
    Client->>Client: Validasi Format Input Sisi Klien
    Client->>API: POST /api/v1/auth/login (email, password)
    
    API->>API: Rate Limiter Guard Check (Max 5 attempts / min)
    API->>DB: SELECT id, password_hash, role FROM profiles WHERE email = $1
    DB-->>API: Kembalikan Record Pengguna
    
    alt Akun Tidak Ditemukan atau Password Hash Tidak Cocok
        API->>API: Catat Percobaan Gagal di Security Log
        API-->>Client: HTTP 401 Unauthorized (AUTH_INVALID_CREDENTIALS)
        Client-->>User: Tampilkan Pesan Galat "Email atau password salah"
    else Kredensial Valid & Terverifikasi (Argon2id Verify = TRUE)
        API->>API: Generate Signed JWT Token (Claim: id, role, exp: 24h)
        API->>DB: INSERT INTO audit_logs (actor_id, action: 'LOGIN')
        API-->>Client: HTTP 200 OK (token, user_profile)
        Client->>SecStore: Simpan Token di Encrypted Secure Storage
        Client-->>User: Alihkan ke Tampilan Utama (Feed / Dashboard Satpam)
    end
```

---

### 5.2 Sequence Diagram 2: Penerimaan Fisik Barang Temuan di Pos Satpam (*Security Intake*)

Menggambarkan interaksi saat civitas menyerahkan barang fisik ke pos satpam dan petugas menginput data ke dashboard:

```mermaid
sequenceDiagram
    autonumber
    actor Penemu as Penemu (Mahasiswa)
    actor Satpam as Petugas Satpam Jaga
    participant Web as Web Admin Dashboard (React + Vite)
    participant API as ElysiaJS Backend (Bun)
    participant DB as Neon Serverless Postgres
    participant Mobile as Klien Pengguna Aktif (Mobile App)

    Penemu->>Satpam: Serahkan Barang Fisik & Tunjukkan Kode Tiket Laporan
    Satpam->>Web: Buka Menu Intake & Masukkan Kode Tiket
    Web->>API: GET /api/v1/items/:id (Header: Bearer Token)
    API->>DB: SELECT * FROM items WHERE id = $1
    DB-->>API: Data Laporan Barang (status: 'active')
    API-->>Web: Tampilkan Preview Foto & Rincian Barang
    
    Satpam->>Satpam: Inspeksi Fisik Barang Asli vs Data Layar
    Satpam->>Web: Pilih Pos Jaga, Input Nomor Loker (misal: 'Loker A-03') & Catatan
    Satpam->>Web: Klik "Konfirmasi Penerimaan Fisik"
    
    Web->>API: PATCH /api/v1/security/intake/:id (pos_id, locker_no, notes)
    API->>API: RBAC Guard (Role Check: 'admin_satpam')
    API->>DB: UPDATE items SET status='stored_at_security', security_post_id=...
    API->>DB: INSERT INTO audit_logs (action: 'INTAKE')
    DB-->>API: Transaksi Sukses
    API-->>Web: HTTP 200 OK (Status Berhasil Diperbarui)
    Web-->>Satpam: Tampilkan Notifikasi Berhasil & Opsi Cetak Stiker Loker
    
    API--)Mobile: Broadcast WebSocket Event: 'ITEM_STORED_AT_SECURITY'
    Mobile-->>Penemu: Push Notification "Barang Anda telah aman disimpan di Pos Satpam"
```

---

### 5.3 Sequence Diagram 3: Validasi Klaim Bukti Kepemilikan & Penerbitan BAST Digital

Menggambarkan alur serah terima resmi di pos satpam dengan pengambilan foto identitas dan dokumen penyerahan:

```mermaid
sequenceDiagram
    autonumber
    actor Pemilik as Pemilik Sah (Mahasiswa)
    actor Satpam as Petugas Satpam Jaga
    participant Web as Web Admin Dashboard (React)
    participant Webcam as Modul Kamera Webcam Web
    participant API as ElysiaJS Backend (Bun)
    participant S3 as Cloud Object Storage (S3)
    participant DB as Neon Serverless Postgres

    Pemilik->>Satpam: Datang ke Pos Membawa KTM untuk Mengambil Barang
    Satpam->>Pemilik: Wawancara Uji Bukti (Buka Sandi Layar HP / Uraikan Isi Dompet)
    
    alt Uji Bukti Gagal / Klaim Ditolak
        Satpam->>Web: Input Catatan Penolakan Klaim
        Web->>API: POST /api/v1/claims/reject (item_id, reason)
        API->>DB: INSERT INTO audit_logs (action: 'REJECT_CLAIM')
        Satpam-->>Pemilik: Penolakan Serah Terima Barang Fisik
    else Uji Bukti Sesuai & Sah
        Satpam->>Web: Input Data Pemilik (Nama, NIM, Unit Kerja, No WA)
        Satpam->>Web: Aktifkan Modul Kamera Webcam Pos
        Web->>Webcam: Capture Foto Kartu Identitas (KTM)
        Web->>Webcam: Capture Foto Penyerahan Fisik (Satpam & Pemilik)
        
        Web->>API: POST /api/v1/claims/presigned-url (bast_files)
        API-->>Web: Kembalikan Presigned Upload URLs
        Web->>S3: PUT Foto KTM & Foto Penyerahan ke Bucket Privat
        
        Web->>API: POST /api/v1/claims/validate (claim_data, s3_photo_keys)
        API->>API: RBAC Guard Check ('admin_satpam')
        API->>DB: BEGIN TRANSACTION
        API->>DB: INSERT INTO claim_validations (...)
        API->>DB: UPDATE items SET status='resolved' WHERE id = $1
        API->>DB: INSERT INTO audit_logs (action: 'VALIDATE_CLAIM')
        API->>DB: COMMIT TRANSACTION
        DB-->>API: Transaksi Database Sukses
        
        API-->>Web: HTTP 201 Created (bast_registration_number, pdf_url)
        Web-->>Satpam: Tampilkan BAST Digital Siap Cetak
        Satpam->>Pemilik: Serahkan Fisik Barang & Lembar Tanda Terima
    end
```

---

## 6. Rancangan Antarmuka Pengguna (UI/UX Prototype)

### 6.1 Diagram Alur Pengguna (User Flow Diagram)

#### A. Alur Pengguna Civitas Akademika (Mobile App)
```mermaid
flowchart TD
    START_M([Buka Mobile App]) --> SPLASH[Splash / Welcome Screen]
    SPLASH --> AUTH_CHECK{Sudah Login?}
    AUTH_CHECK -- Belum --> LOGIN_SCREEN[Layar Login & Register NIM/NIP]
    LOGIN_SCREEN -->|Login Berhasil| HOME_FEED[Layar Beranda & Feed Katalog]
    AUTH_CHECK -- Sudah --> HOME_FEED

    HOME_FEED --> ACTION_CHOICE{Pilih Aksi Pengguna}
    
    ACTION_CHOICE -- "Cari Barang" --> FILTER_FEED[Filter Kategori / Lokasi Gedung]
    FILTER_FEED --> ITEM_DETAIL[Layar Detail Barang]
    ITEM_DETAIL --> CHECK_POS{Barang di Pos Satpam?}
    CHECK_POS -- Ya --> VIEW_POS_GUIDE[Lihat Panduan & Peta Pos Satpam]
    CHECK_POS -- Belum --> OPEN_CHAT[Buka Ruang Obrolan Real-time]

    ACTION_CHOICE -- "Lapor Barang" --> REPORT_FORM[Form Lapor Barang + Kamera Ponsel]
    REPORT_FORM --> SUBMIT_REPORT[Submit Laporan ke Backend]
    SUBMIT_REPORT --> TICKET_SCREEN[Tampil Tiket Registrasi Laporan]
    TICKET_SCREEN --> BRING_TO_POS[Panduan Penyerahan Fisik ke Pos Jaga]
```

#### B. Alur Petugas Satpam (Web Admin Dashboard)
```mermaid
flowchart TD
    START_W([Akses Portal Web]) --> LOGIN_ADMIN[Halaman Login Khusus Satpam]
    LOGIN_ADMIN -->|Verifikasi Role admin_satpam| DASHBOARD_MAIN[Ringkasan Metrik Dashboard Jaga]

    DASHBOARD_MAIN --> TASK_SELECT{Pilih Tugas Dinas}

    TASK_SELECT -- "Terima Barang Masuk" --> INTAKE_SCREEN[Menu Penerimaan Fisik / Intake]
    INTAKE_SCREEN --> INPUT_TICKET[Cari Kode Tiket Laporan Penemu]
    INPUT_TICKET --> ALLOCATE_LOCKER[Tentukan Nomor Loker / Rak Pos Jaga]
    ALLOCATE_LOCKER --> PRINT_STICKER[Cetak Label Barcode Loker Fisik]

    TASK_SELECT -- "Proses Serah Terima" --> INVENTORY_SCREEN[Inventaris Barang Pos Jaga]
    INVENTORY_SCREEN --> VERIFY_CLAIM_SCREEN[Layar Validasi Klaim & BAST]
    VERIFY_CLAIM_SCREEN --> PROOF_TEST{Uji Bukti Cocok?}
    PROOF_TEST -- Tidak --> LOG_REJECTION[Catat Log Penolakan Klaim]
    PROOF_TEST -- Sah --> WEBCAM_CAPTURE[Ambil Foto KTM & Penyerahan via Webcam]
    WEBCAM_CAPTURE --> GENERATE_BAST[Terbitkan BAST Digital & Status Resolved]
    GENERATE_BAST --> EXPORT_PDF[Cetak Lembar Dokumen BAST PDF Resmi]
```

---

### 6.2 Spesifikasi dan Tata Letak Layar Inti (Mobile & Web Admin)

Berikut adalah rancangan spesifikasi visual dan tata letak (*layout wireframe*) untuk 4 layar inti sistem:

#### Layar 1: Feed Katalog Barang (Mobile App — React Native)
* **Tujuan**: Memfasilitasi civitas untuk menjelajahi dan mencari barang hilang/temuan di kawasan kampus secara cepat.
* **Komponen Antarmuka**:
  - *Top Header*: Logo Lost & Found, Pilihan Gedung Kampus, Icon Notifikasi.
  - *Search Bar*: Input teks pencarian cerdas (*debounced input*) dengan tombol reset instan.
  - *Segmented Tabs*: Tombol switch besar **"Barang Hilang"** vs **"Barang Ditemukan"**.
  - *Filter Chips*: Kategori horizontal (*Semua, Laptop/HP, Kunci, Dompet, Dokumen/KTM, Lainnya*).
  - *Card List*: Kartu barang memuat *thumbnail*, judul, badge status visual (Oranye: Hilang, Biru: Ditemukan, Hijau: Tersimpan di Pos Satpam), lokasi gedung, dan stempel waktu.
* **Layout Skematis**:
  ```text
  +------------------------------------------------+
  | [=] Lost & Found Campus Terpadu            (o) |
  +------------------------------------------------+
  | [ Cari nama barang, merek, atau gedung...   Q] |
  +------------------------------------------------+
  | [  [ BARANG HILANG ]   |  ( BARANG DITEMUKAN ) ]
  +------------------------------------------------+
  | (Semua)  (Elektronik)  (Kunci)  (Dompet/KTM) > |
  +------------------------------------------------+
  | +--------------------------------------------+ |
  | | [Foto]  Laptop ASUS Vivobook Perak         | |
  | |         Gedung Kuliah Bersama Lt. 3        | |
  | |         [ HIJAU: TERSIMPAN DI POS 1 ]      | |
  | |         2 jam yang lalu                    | |
  | +--------------------------------------------+ |
  | +--------------------------------------------+ |
  | | [Foto]  Kunci Kontak Motor Honda Vario     | |
  | |         Area Parkir Barat Gedung FTI       | |
  | |         [ HIJAU: TERSIMPAN DI POS 2 ]      | |
  | |         5 jam yang lalu                    | |
  | +--------------------------------------------+ |
  | [Beranda]      [+ Lapor]      [Chat]  [Profil] |
  +------------------------------------------------+
  ```

---

#### Layar 2: Formulir Pelaporan Barang (Mobile App — React Native)
* **Tujuan**: Mengumpulkan data rincian barang tercecer dari pelapor dengan kompresi foto otomatis.
* **Komponen Antarmuka**:
  - *Type Switcher*: Toggle pilihan tipe laporan (*Hilang* vs *Ditemukan*).
  - *Media Uploader*: Tombol kamera langsung dan galeri dengan pratinjau foto instan.
  - *Form Fields*: Nama Barang, Dropdown Kategori, Picker Zona Gedung Kampus, Deskripsi Ciri.
  - *Notice Box*: Kotak peringatan hukum berwarna kuning mengimbau penitipan ke pos satpam dalam $2 \times 24$ jam.
  - *Bottom Action*: Tombol submit *Full-width* **"Publikasikan Laporan Sekarang"**.

---

#### Layar 3: Penerimaan Fisik Barang Masuk / Intake (Web Admin — React + Vite)
* **Tujuan**: Memproses fisik barang titipan mahasiswa di pos satpam dan menetapkan nomor rak/loker.
* **Komponen Antarmuka**:
  - *Ticket Search Box*: Input kode tiket laporan yang ditunjukkan mahasiswa penemu.
  - *Item Preview Card*: Menampilkan foto barang, kategori, lokasi ditemukan, dan identitas penemu.
  - *Storage Assignment Form*: Pilihan nama Pos Jaga dan nomor loker fisik (misal: *Loker A-04*).
  - *Condition Field*: Catatan kondisi fisik barang saat diserahkan (misal: *kondisi menyala, layar retak halus*).
  - *Action Buttons*: Tombol konfirmasi penerimaan dan tombol cetak barcode label loker.
* **Layout Skematis**:
  ```text
  +---------------------------------------------------------------------------------------+
  | LOST & FOUND ADMIN | Pos Jaga: Pos 1 - Gerbang Utama | Petugas: Aiptu Bambang  [Logout] |
  +---------------------------------------------------------------------------------------+
  | [Dashboard]  | MODUL PENERIMAAN FISIK BARANG (SECURITY INTAKE)                       |
  | [Intake (*)] |                                                                       |
  | [Inventaris] | 1. Masukkan Kode Tiket / ID Laporan dari Aplikasi Mahasiswa:          |
  | [Klaim BAST] | [ LNF-2026-9102                                      ] [ Cari Tiket ] |
  | [Arsip BAST] |-----------------------------------------------------------------------|
  | [Analytics]  | Pratinjau Barang:                                                     |
  |              | [ Foto Barang ] Judul     : Laptop ASUS Vivobook Perak                |
  |              |                 Kategori  : Elektronik (Laptop)                       |
  |              |                 Penemu    : Muhammad Raihan (NIM: 2200018012)         |
  |              |                 Lokasi    : Meja D-302 Lab Komputer Terpadu           |
  |              |-----------------------------------------------------------------------|
  |              | 2. Alokasikan Penyimpanan Fisik Pos Satpam:                           |
  |              | Pos Jaga Penerima     : [ Pos 1 - Gerbang Utama Kampus              v ] |
  |              | Nomor Rak / Loker     : [ Loker B-04                                  ] |
  |              | Catatan Kondisi Fisik : [ Layar aman, ada stiker logo robot di casing ] |
  |              |                                                                       |
  |              | [ KONFIRMASI TERIMA BARANG FISIK ]    [ CETAK STIKER LABEL BARCODE ]   |
  +---------------------------------------------------------------------------------------+
  ```

---

#### Layar 4: Validasi Klaim & Webcam BAST Digital (Web Admin — React + Vite)
* **Tujuan**: Menguji keaslian bukti kepemilikan pemohon dan memotret dokumen identitas serah terima.
* **Komponen Antarmuka**:
  - *Verification Checklist*: Daftar uji rahasia (buka password/pola gawai, rincian isi dompet, kunci).
  - *Claimant Identity Form*: Nama Lengkap, Nomor Induk (NIM/NIP), Fakultas/Unit, No WhatsApp.
  - *Dual Webcam Capture Module*:
    - Kotak 1: Tangkapan kamera Kartu Tanda Mahasiswa (KTM).
    - Kotak 2: Tangkapan kamera dokumentasi penyerahan fisik barang bersama pemilik sah.
  - *Action Execution*: Tombol hijau besar **"Validasi Sah & Terbitkan BAST Digital"**.

---

### 6.3 Tautan Prototipe Interaktif Figma

Seluruh rancangan antarmuka visual, alur klik (*clickable prototype*), dan sistem desain (*design system*) telah disusun pada berkas Figma resmi proyek:

* **Tautan Prototipe Figma**:  
  👉 `https://www.figma.com/design/LostAndFoundCampusSystem/Prototype-SWSL10-Kel04` *(Akses Lihat / View Only)*
* **Design System Specs**:
  - *Typography*: Inter / SF Pro Display (Mobile) dan Poppins / Roboto (Web Admin).
  - *Color Palette*:
    - Primary Brand: Emerald Teal (`#0D9488`) — Melambangkan keamanan dan kepastian.
    - Status Lost: Amber Orange (`#F59E0B`) — Melambangkan kehati-hatian.
    - Status Stored in Pos: Emerald Green (`#059669`) — Melambangkan barang aman dalam pengawasan satpam.
    - Status Resolved: Slate Gray (`#64748B`) — Melambangkan siklus telah tuntas.
    - Danger / Error: Rose Red (`#E11D48`).

---

## 7. Arsitektur Keamanan dan Mitigasi OWASP API Top 10

### 7.1 Lapisan Keamanan Sistem (Defense-in-Depth)

Sistem menerapkan strategi pertahanan berlapis (*Defense-in-Depth*) untuk menjamin kerahasiaan (*confidentiality*), integritas (*integrity*), dan ketersediaan (*availability*):

```mermaid
flowchart TD
    L1["1. Network & Transport Security<br>- HTTPS / TLS 1.3 enforced<br>- Strict-Transport-Security (HSTS)<br>- CORS Whitelist domain resmi kampus"]
    L2["2. Perimeter Rate Limiting & Throttling<br>- IP-based rate limiting (Max 100 req/min)<br>- Auth endpoint throttling (Max 5 login attempts/min)"]
    L3["3. Authentication & Session Security<br>- JWT Bearer Token (HMAC-SHA256, Exp: 24 Jam)<br>- Password Hash Argon2id dengan Random Salt unik<br>- Token Storage di Encrypted Secure Storage gawai"]
    L4["4. Authorization & Access Control<br>- Role-Based Access Control (RBAC Guard Middleware)<br>- Object-Level Ownership Verification (Policy Check)"]
    L5["5. Data Validation & Injection Prevention<br>- TypeBox Strict Schema Validation pada Runtime<br>- Parameterized Queries via Drizzle ORM (Zero SQL Injection)"]
    L6["6. Storage & Privacy Isolation<br>- Private S3 Bucket untuk Foto KTM / BAST<br>- Presigned URL Kriptografis (Expired in 15 Minutes)"]
    L7["7. Audit Trail & Immutability<br>- Immutable Audit Logs pada tabel audit_logs<br>- Anti-Tamper logging aktivitas satpam"]

    L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7
```

---

### 7.2 Matriks Pemetaan Mitigasi OWASP API Security Top 10 (2023)

Sistem Lost & Found dirancang secara khusus untuk memitigasi 10 ancaman keamanan API paling kritis berdasarkan standar **OWASP API Security Top 10 (2023)**:

| Kode OWASP | Kerentanan Keamanan | Risiko pada Sistem Lost & Found | Strategi Mitigasi Desain Teknis |
| :--- | :--- | :--- | :--- |
| **API1:2023** | **Broken Object Level Authorization (BOLA)** | Pengguna mengubah ID barang pada URL untuk mengedit atau menghapus laporan milik mahasiswa lain. | Menerapkan otorisasi tingkat objek (*Policy-based check*): Memeriksa bahwa `item.user_id === req.user.id` sebelum mengeksekusi operasi edit/delete. |
| **API2:2023** | **Broken Authentication** | Serangan *brute force* tebakan kata sandi atau pemalsuan token JWT akun satpam. | Membatasi percobaan login (`max 5 per menit per IP`), hashing sandi menggunakan Argon2id, verifikasi tanda tangan rahasia JWT yang disimpan di variabel `.env`. |
| **API3:2023** | **Broken Object Property Level Authorization (BOPLA)** | Pengguna memanipulasi payload HTTP untuk menyuntikkan field `role: 'admin_satpam'` saat registrasi (*Mass Assignment*). | Menerapkan skema **TypeBox** yang secara eksplisit menolak field tak terdaftar (*strict schema stripping*) dan mengabaikan atribut `role` dari input klien. |
| **API4:2023** | **Unrestricted Resource Consumption** | Penyerang membanjiri API kueri barang tanpa batas hingga membebani memori server (*DoS attack*). | Menetapkan pembatasan paginasi paksa (*max limit 50 item per kueri*) dan *rate limiting* 100 request/menit per alamat IP menggunakan plugin ElysiaJS throttle. |
| **API5:2023** | **Broken Function Level Authorization (BFLA)** | Mahasiswa memanggil endpoint `/api/v1/security/intake` atau `/api/v1/claims/validate` untuk memvalidasi barangnya sendiri. | Middleware `RBAC Guard` memeriksa token pengguna dan memverifikasi atribut `role === 'admin_satpam'`. Permintaan non-satpam langsung ditolak HTTP 403 Forbidden. |
| **API6:2023** | **Unrestricted Access to Sensitive Business Flows** | Bot membuat ratusan postingan barang hilang palsu secara otomatis dalam hitungan detik. | Menerapkan jeda waktu minimum pelaporan (*throttling*) dan mewajibkan verifikasi akun email resmi kampus terdaftar sebelum membuat postingan baru. |
| **API7:2023** | **Server Side Request Forgery (SSRF)** | Fitur unggah foto dimanipulasi untuk meminta URL intranet lokal server kampus. | Klien tidak mengirim URL acak ke server untuk di-fetch; klien hanya mengunggah file langsung ke Cloud Storage menggunakan *Presigned Upload URL* resmi institusi. |
| **API8:2023** | **Security Misconfiguration** | Informasi error *stack trace* backend atau kredensial database bocor ke publik saat terjadi kegagalan sistem. | Menonaktifkan mode debug pada lingkungan produksi, menggunakan *global error handler* yang hanya mengembalikan pesan galat bersahabat, serta mengaktifkan Helmet security headers. |
| **API9:2023** | **Improper Inventory Management** | Endpoint uji coba lama tidak terlindungi dan terekspos ke publik. | Melakukan standardisasi versioning eksplisit `/api/v1/...` dan mendokumentasikan seluruh kontrak antarmuka API menggunakan OpenAPI 3.0 / Swagger. |
| **API10:2023**| **Unsafe Consumption of APIs** | Layanan pihak ketiga (misal: S3 storage) mengembalikan file berbahaya atau payload rusak. | Memvalidasi tipe MIME berkas foto (hanya menerima `image/jpeg` dan `image/png`) dan membatasi ukuran berkas maksimal 500 KB sebelum disimpan. |

---

## 8. Kontrol Akses (Access Control & Authorization Policies)

### 8.1 Matriks Role-Based Access Control (RBAC)

Sistem menerapkan prinsip **Deny by Default** dan **Least Privilege**. Hak akses operasi sistem didefinisikan secara formal dalam matriks peran berikut:

| Modul / Operasi Sistem | Endpoint / Rute | Mahasiswa | Tendik / Dosen | Petugas Satpam | Koordinator Keamanan |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Registrasi Akun Mandiri** | `POST /api/v1/auth/register` | ✅ Izinkan | ✅ Izinkan | ❌ Tolak | ❌ Tolak |
| **Melihat Katalog Feed Barang** | `GET /api/v1/items` | ✅ Izinkan | ✅ Izinkan | ✅ Izinkan | ✅ Izinkan |
| **Menerbitkan Laporan Barang** | `POST /api/v1/items` | ✅ Izinkan | ✅ Izinkan | ✅ Izinkan | ✅ Izinkan |
| **Edit/Batal Laporan Milik Sendiri**| `PATCH/DELETE /api/v1/items/:id` | 🔒 Milik Sendiri | 🔒 Milik Sendiri | ❌ Tolak | ❌ Tolak |
| **Membuka Percakapan Chat In-App**| `POST /api/v1/chat/rooms` | ✅ Izinkan | ✅ Izinkan | ✅ Izinkan | ✅ Izinkan |
| **Konfirmasi Fisik Masuk (*Intake*)**| `PATCH /api/v1/security/intake/:id` | ❌ Tolak (403) | ❌ Tolak (403) | ✅ Izinkan | ✅ Izinkan |
| **Mutasi Loker Penyimpanan Pos**| `PATCH /api/v1/security/relocate/:id`| ❌ Tolak (403) | ❌ Tolak (403) | ✅ Izinkan | ✅ Izinkan |
| **Wawancara Uji Bukti & Input BAST**| `POST /api/v1/claims/validate` | ❌ Tolak (403) | ❌ Tolak (403) | ✅ Izinkan | ✅ Izinkan |
| **Melihat Foto KTM / Identitas BAST**| `GET /api/v1/claims/:id/photos` | ❌ Tolak (403) | ❌ Tolak (403) | ✅ Izinkan | ✅ Izinkan |
| **Mencetak Lembar PDF Berita Acara**| `GET /api/v1/claims/:id/export-pdf` | ❌ Tolak (403) | ❌ Tolak (403) | ✅ Izinkan | ✅ Izinkan |
| **Melihat Dashboard Analitik Metrik**| `GET /api/v1/admin/metrics` | ❌ Tolak (403) | ❌ Tolak (403) | ✅ Izinkan | ✅ Izinkan |
| **Kelola Master Data Titik Pos Jaga**| `POST/PATCH /api/v1/admin/posts` | ❌ Tolak (403) | ❌ Tolak (403) | ❌ Tolak (403) | ✅ Izinkan |

---

### 8.2 Aturan Otorisasi Tingkat Objek (Object-Level Authorization Policies)

Selain validasi peran (RBAC), backend menerapkan aturan verifikasi kepemilikan objek (*Object-Level Policies*) untuk mencegah kerentanan BOLA:

```text
========================================================================================
                  ATURAN OTORISASI OBJEK (OBJECT-LEVEL POLICIES)
========================================================================================

1. KEBIJAKAN PENYUNTINGAN LAPORAN (Item Ownership Policy):
   - SEORANG PENGGUNA HANYA DAPAT MENYUNTING ATAU MEMBATALKAN LAPORAN BARANG JIKA:
     a) req.user.id === item.user_id (Pengguna adalah pemilik asli laporan), DAN
     b) item.status === 'active' (Barang belum diproses intake atau dititipkan ke pos satpam).
   - JIKA BARANG SUDAH BERSTATUS 'stored_at_security', LAPORAN DIKUNCI DAN HANYA DAPAT
     DIUBAH ATRIBUTNYA OLEH PETUGAS SATPAM DENGAN ROLE 'admin_satpam'.

2. KEBIJAKAN SERAH TERIMA & BAST (Claim Validation Policy):
   - OPERASI PENERBITAN BAST DIGITAL HANYA DAPAT DIJALANKAN JIKA:
     a) req.user.role === 'admin_satpam' ATAU 'superadmin', DAN
     b) item.status === 'stored_at_security' (Barang fisik terkonfirmasi ada di pos satpam), DAN
     c) TIDAK ADA rekaman BAST sebelumnya yang berstatus valid (item_id bersifat UNIQUE).
   - SELURUH DATA BAST YANG TELAH DITERBITKAN BERSIFAT KEKAL (IMMUTABLE); TIDAK DAPAT
     DIHAPUS ATAU DIUBAH SECARA MANUAL OLEH SATPAM UNTUK MENJAMIN INTEGRITAS AUDIT.

3. KEBIJAKAN AKSES PRIVASI DOKUMEN IDENTITAS (PII Privacy Policy):
   - FOTO KARTU TANDA MAHASISWA (KTM) DAN FOTO SERAH TERIMA DALAM BAST:
     a) TIDAK PERNAH terekspos melalui endpoint publik atau katalog feed.
     b) HANYA DAPAT diakses melalui tautan 'Presigned URL' bertanda tangan kriptografis
        berdurasi 15 menit oleh Petugas Satpam yang memiliki token dinas aktif.
========================================================================================
```

---

## 9. Matriks Keterlacakan Desain (Traceability Matrix)

Matriks keterlacakan ini membuktikan bahwa seluruh Kebutuhan Fungsional (KF) dan Kebutuhan Non-Fungsional (KNF) dari hasil analisis kebutuhan telah diturunkan secara runut ke dalam komponen perangkat lunak, rute endpoint API, skema tabel basis data, dan layar antarmuka pengguna:

| Kode Kebutuhan (KF / KNF) | Komponen Arsitektur Terkait | Endpoint REST API Terkait | Tabel Basis Data (Neon) | Layar Antarmuka Terkait |
| :--- | :--- | :--- | :--- | :--- |
| **KF-01** (Autentikasi & Registrasi Akun) | `Authentication Module`, `JWT Guard` | `POST /api/v1/auth/register`<br>`POST /api/v1/auth/login` | `profiles` | Layar Login & Register Mobile / Web Admin Login |
| **KF-02** (Publikasi Laporan Barang) | `Items Management Module`, `S3 Client` | `POST /api/v1/items`<br>`POST /api/v1/items/presigned-url` | `items` | Layar Form Lapor Barang (Mobile) |
| **KF-03** (Pencarian & Penapisan Feed) | `Items Management Module`, `Drizzle DAL` | `GET /api/v1/items`<br>`GET /api/v1/items/:id` | `items`, `profiles`, `security_posts` | Layar Beranda Feed & Detail Barang (Mobile) |
| **KF-04** (Penerimaan Fisik di Pos Satpam) | `Security Intake Module`, `RBAC Guard` | `PATCH /api/v1/security/intake/:id` | `items`, `security_posts` | Layar Penerimaan Fisik / Intake Loker (Web Admin) |
| **KF-05** (Validasi Klaim & BAST Digital) | `Claim & BAST Module`, `Webcam Engine` | `POST /api/v1/claims/validate` | `claim_validations`, `items` | Layar Validasi Klaim & Webcam BAST (Web Admin) |
| **KF-06** (Percakapan Instan In-App) | `Realtime Chat Module (WebSocket)` | `WS /ws/v1/chat`<br>`GET /api/v1/chat/rooms` | `chat_rooms`, `chat_messages` | Layar Ruang Percakapan Real-Time (Mobile) |
| **KF-07** (Ekspor Dokumen PDF BAST Resmi) | `Claim & BAST Module (PDF Renderer)` | `GET /api/v1/claims/:id/export-pdf`| `claim_validations` | Layar Arsip BAST & Dialog Cetak (Web Admin) |
| **KF-08** (Monitoring Analitik Titik Rawan) | `Reporting & Analytics Service` | `GET /api/v1/admin/metrics` | `items`, `claim_validations` | Layar Ringkasan Dashboard & Hotspot (Web Admin) |
| **KNF-01** (Latensi Kueri API $\le 150$ ms) | `ElysiaJS Engine`, `Bun Runtime`, `DAL` | Seluruh endpoint REST `GET` | Indeks komposit `idx_items_status_type` | Optimalisasi Kueri Klien & Virtualized List |
| **KNF-02** (Latensi Chat WSS $\le 300$ ms) | `Elysia Native WebSocket Module` | `WS /ws/v1/chat` | `chat_messages` | Optimistic UI Update pada Gelembung Chat |
| **KNF-03** (Kompresi Gambar $\le 500$ KB) | `Client-side Compression Middleware` | `POST /api/v1/items/presigned-url` | `items.image_url` | Image Compressor pada Form Lapor Mobile |
| **KNF-04** (Proteksi Privasi PII KTM) | `Presigned URL Service (S3 Private)` | `GET /api/v1/claims/:id/photos` | `claim_validations.claimant_id_photo_url` | Restricted Image Viewer dengan Autentikasi |
| **KNF-05** (Audit Trail & Immutabilitas) | `Audit Logging Service` | Dijalankan otomatis pada rute dinas | `audit_logs` | Log Viewer pada Panel Superadmin |

---
*Dokumen Rancangan Sistem ini disusun sebagai luaran resmi pemodelan perangkat lunak tahap akhir (Pertemuan 10) sebelum melangkah ke fase konstruksi kode program. Seluruh spesifikasi telah diverifikasi konsistensinya terhadap analisis kebutuhan Pertemuan 8.*

