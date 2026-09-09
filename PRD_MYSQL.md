# Product Requirement Document (PRD)
## Sistem Informasi Pengarsipan Dokumen Digital (MySQL Architecture)

| Parameter | Keterangan |
| :--- | :--- |
| **Nama Proyek** | Sistem Informasi Arsip Dokumen Digital |
| **Versi Dokumen** | 2.0.0 (MySQL Migration & Architecture) |
| **Tanggal** | 9 September 2026 |
| **Target Database** | MySQL 8.0+ / MariaDB 10.5+ |
| **Target Stack** | React (Vite) + TypeScript + Node.js (Express/NestJS) / Laravel + MySQL |

---

## 1. Ringkasan Eksekutif (Executive Summary)

### 1.1 Latar Belakang
Sistem Informasi Arsip Dokumen Digital dirancang untuk memodernisasi pengelolaan, pencarian, dan penyimpanan dokumen publik maupun internal instansi. Sistem ini sebelumnya mengandalkan Supabase (PostgreSQL/Baas). Dokumen PRD ini mendokumentasikan spesifikasi kebutuhan produk, arsitektur backend, serta skema basis data yang disesuaikan penuh untuk **MySQL Database Engine**.

### 1.2 Tujuan Utama
1. **Transparansi & Kemudahan Akses**: Memudahkan masyarakat/pengguna publik untuk mencari dan mengunduh dokumen resmi secara efisien.
2. **Keamanan & Pengendalian Hak Akses**: Membatasi dokumen sensitif (Private) hanya untuk Administrator terautentikasi.
3. **Audit Trail**: Mencatat setiap aktivitas krusial (Upload, Update, Delete, Download, Login) dalam log aktivitas.
4. **Kemandirian Infrastruktur**: Mengalihkan ketergantungan dari Supabase ke backend berbasis **MySQL** independen yang dapat di-host di VPS/Server lokal/Cloud mana pun.

---

## 2. Pengguna Target & Peran (User Roles)

| Peran (Role) | Hak Akses & Deskripsi |
| :--- | :--- |
| **Public / Guest** | - Melihat halaman utama/landing page.<br>- Mencari dan memfilter dokumen publik (Visibility: `PUBLIC`).<br>- Menprinjau (Preview) dan mengunduh dokumen publik.<br>- Membaca statistik publik dan informasi sistem. |
| **Administrator** | - Mengelola Autentikasi (Login/Logout via JWT/Session).<br>- Mengunggah, mengedit, dan menghapus dokumen (Public & Private).<br>- Mengelola kategori dokumen.<br>- Mengonfigurasi tampilan & profil instansi (Logo, Emblem, Title, Tagline, Warna, Transparansi Hero).<br>- Memantau Audit Activity Logs.<br>- Mengonfigurasi integrasi Google Apps Script (GAS) / Google Drive backup. |

---

## 3. Arsitektur Sistem & Stack Teknologi

```
+-----------------------------------------------------------------------+
|                           FRONTEND CLIENT                             |
|       React 18 + TypeScript + Vite + TailwindCSS + Lucide Icons       |
+-----------------------------------------------------------------------+
                                   |
                                   | REST API (JSON) + Multipart Form
                                   v
+-----------------------------------------------------------------------+
|                             BACKEND API                               |
|        Node.js (Express / NestJS) ATAU PHP 8.x (Laravel / Lumen)      |
|    - Authentication Middleware (JWT / Passport)                       |
|    - ORM / Query Builder (Prisma / TypeORM / Eloquent / Knex)         |
|    - File Storage Manager (Local Storage / AWS S3 / MinIO)            |
|    - Realtime Server (Socket.io / Server-Sent Events)                 |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                            DATABASE SERVER                            |
|                       MySQL 8.0+ (InnoDB Engine)                      |
|    - Relational Storage, Indexes, Foreign Keys, FULLTEXT Search       |
+-----------------------------------------------------------------------+
```

---

## 4. Skema Basis Data MySQL (MySQL DDL Schema)

Berikut adalah struktur DDL (*Data Definition Language*) resmi yang dioptimalkan untuk MySQL 8.0+ dengan engine **InnoDB** dan karakter **utf8mb4**.

```sql
-- ========================================================
-- SISTEM ARSIP DOKUMEN DIGITAL - MYSQL DATABASE SCHEMA
-- ========================================================

CREATE DATABASE IF NOT EXISTS `arsip_digital` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `arsip_digital`;

-- --------------------------------------------------------
-- 1. TABEL: users / profiles
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN') NOT NULL DEFAULT 'ADMIN',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. TABEL: categories
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. TABEL: documents
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `documents` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `document_number` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `category_id` CHAR(36) NULL,
  `year` INT NOT NULL,
  `document_date` DATE NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_url` TEXT NOT NULL,
  `file_type` VARCHAR(50) NOT NULL,
  `file_size` BIGINT NOT NULL,
  `visibility` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
  `uploaded_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_documents_visibility` (`visibility`),
  KEY `idx_documents_category` (`category_id`),
  KEY `idx_documents_year` (`year`),
  KEY `idx_documents_uploaded_by` (`uploaded_by`),
  FULLTEXT KEY `ft_documents_search` (`title`, `description`, `document_number`),
  CONSTRAINT `fk_documents_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_documents_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. TABEL: activity_logs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NULL,
  `user_name` VARCHAR(255) NULL,
  `action` ENUM('LOGIN', 'LOGOUT', 'UPLOAD', 'UPDATE', 'DELETE', 'DOWNLOAD') NOT NULL,
  `document_id` CHAR(36) NULL,
  `description` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_logs_user` (`user_id`),
  KEY `idx_logs_action` (`action`),
  KEY `idx_logs_document` (`document_id`),
  CONSTRAINT `fk_logs_document` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. TABEL: app_settings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `app_settings` (
  `id` CHAR(36) NOT NULL,
  `site_title` VARCHAR(255) NOT NULL DEFAULT '',
  `site_tagline` TEXT NOT NULL DEFAULT '',
  `institution_name` VARCHAR(255) NOT NULL DEFAULT 'Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia',
  `site_logo` TEXT NULL,
  `hero_emblem` TEXT NULL,
  `hero_bg` TEXT NULL,
  `primary_color` VARCHAR(20) NOT NULL DEFAULT '#2563EB',
  `hero_overlay_opacity` INT NOT NULL DEFAULT 75,
  `hero_overlay_color` VARCHAR(20) NOT NULL DEFAULT '#0F172A',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- SEED DATA AWAL
-- --------------------------------------------------------

-- Seed App Settings Default
INSERT INTO `app_settings` (`id`, `site_title`, `site_tagline`, `institution_name`, `site_logo`, `hero_emblem`, `hero_bg`, `primary_color`, `hero_overlay_opacity`, `hero_overlay_color`)
VALUES (
  UUID(),
  '',
  '',
  'Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia',
  '/assets/emblem.png',
  '/assets/logo.png',
  '/assets/hero-bg.jpg',
  '#2563EB',
  75,
  '#0F172A'
);

-- Seed Categories Default
INSERT INTO `categories` (`id`, `name`, `description`) VALUES
  (UUID(), 'Surat', 'Dokumen pengarsipan surat masuk & surat keluar resmi'),
  (UUID(), 'Proposal', 'Dokumen pengajuan proposal kegiatan, program, dan anggaran'),
  (UUID(), 'Laporan', 'Laporan pertanggungjawaban, evaluasi, dan rekapitulasi kerja'),
  (UUID(), 'SK', 'Surat Keputusan pimpinan, direksi, atau instansi'),
  (UUID(), 'Undangan', 'Dokumen surat undangan rapat, seminar, dan acara resmi'),
  (UUID(), 'Administrasi', 'Dokumen kelengkapan administrasi operasional'),
  (UUID(), 'Keuangan', 'Dokumen anggaran, kwitansi, nota, dan laporan keuangan'),
  (UUID(), 'Kegiatan', 'Dokumen pelaksanaan kegiatan dan acara pendukung'),
  (UUID(), 'Dokumentasi', 'Foto, liputan, dan bukti dokumentasi resmi'),
  (UUID(), 'Lainnya', 'Dokumen pendukung dan berkas umum lainnya');
```

---

## 5. Spesifikasi Fitur Lengkap (Functional Requirements)

### 5.1 Portal Publik (Public Access)
- **FR-PUB-01 (Landing Page Hero)**: Menampilkan banner visual hero dengan emblem, judul instansi, bilah pencarian cepat, serta statistik total dokumen & kategori.
- **FR-PUB-02 (Pencarian Dokumen)**: Pengguna dapat mencari dokumen berdasarkan kata kunci (judul, nomor surat, deskripsi) menggunakan fitur `FULLTEXT` MySQL.
- **FR-PUB-03 (Filter Dokumen)**: Pengguna dapat memfilter arsip publik berdasarkan **Kategori** dan **Tahun**.
- **FR-PUB-04 (Preview & Download)**: Pengguna dapat melakukan pratinjau dokumen PDF/gambar secara langsung melalui modal interaktif tanpa perlu keluar dari halaman.
- **FR-PUB-05 (Isolasi Dokumen Private)**: Dokumen berlabel `visibility = 'PRIVATE'` sama sekali tidak akan muncul di API response publik.

### 5.2 Manajemen Autentikasi Admin
- **FR-AUTH-01 (Login Admin)**: Autentikasi admin berbasis kombinasi Email & Password dengan enkripsi **bcrypt / argon2**.
- **FR-AUTH-02 (JWT Session)**: Penerbitan JSON Web Token (JWT) yang berlaku untuk siklus sesi admin, dilengkapi penanganan `401 Unauthorized`.
- **FR-AUTH-03 (Profile Admin)**: Menampilkan profil admin aktif dan opsi Logout.

### 5.3 Manajemen Dokumen (Admin CRUD)
- **FR-DOC-01 (Upload Dokumen)**: Admin dapat mengunggah file dokumen (PDF, DOCX, XLSX, PNG, JPG) dengan batas ukuran maksimum (misal: 10MB/50MB).
- **FR-DOC-02 (Metadata Dokumen)**: Menyimpan atribut nomor dokumen, judul, kategori, tahun, tanggal dokumen, deskripsi, dan visibilitas (`PUBLIC` / `PRIVATE`).
- **FR-DOC-03 (Edit & Update)**: Admin dapat mengubah metadata atau mengganti file dokumen yang tersimpan.
- **FR-DOC-04 (Hapus Dokumen)**: Admin dapat menghapus dokumen dari database MySQL dan menghapus berkas fisik dari storage.

### 5.4 Manajemen Kategori
- **FR-CAT-01 (CRUD Kategori)**: Admin dapat menambah, merubah, dan menghapus kategori dokumen.
- **FR-CAT-02 (Jumlah Dokumen Per Kategori)**: Sistem menghitung secara otomatis total dokumen yang terasosiasi di setiap kategori.

### 5.5 Audit Trail (Log Aktivitas)
- **FR-LOG-01 (Pencatatan Otomatis)**: Setiap aksi `LOGIN`, `LOGOUT`, `UPLOAD`, `UPDATE`, `DELETE`, dan `DOWNLOAD` dicatat otomatis ke tabel `activity_logs`.
- **FR-LOG-02 (Tampilan Log)**: Dashboard admin menyediakan riwayat log aktivitas lengkap dengan timestamp, nama user, dan jenis aksi.

### 5.6 Pengaturan Sistem & Kustomisasi Tampilan
- **FR-SET-01 (Pengaturan Instansi)**: Admin dapat mengubah `site_title`, `site_tagline`, dan `institution_name`.
- **FR-SET-02 (Branding Visual)**: Admin dapat mengunggah Logo Instansi (`site_logo`), Emblem Hero (`hero_emblem`), dan Background Hero (`hero_bg`).
- **FR-SET-03 (Overlay & Tema)**: Admin dapat menentukan warna utama (`primary_color`), transparansi overlay hero (`hero_overlay_opacity`), serta warna overlay (`hero_overlay_color`).
- **FR-SET-04 (Integrasi Google Drive / GAS)**: Admin dapat menyimpan dan mengonfigurasi URL Web App Google Apps Script (GAS) untuk pencadangan otomatis.

---

## 6. Spesifikasi REST API Endpoints (MySQL Backend)

### 6.1 Authentication API (`/api/auth`)
- `POST /api/auth/login`: Autentikasi email & password, mengembalikan JWT Token & profil.
- `GET /api/auth/me`: Mengambil data profil admin dari token JWT.
- `POST /api/auth/logout`: Menghancurkan sesi/token.

### 6.2 Documents API (`/api/documents`)
- `GET /api/documents`: Mengambil daftar dokumen publik (dengan query search, category_id, year, page, limit).
- `GET /api/documents/admin`: Mengambil seluruh dokumen (Public & Private) untuk Admin.
- `GET /api/documents/:id`: Detail 1 dokumen.
- `POST /api/documents`: Upload file + simpan metadata dokumen baru (Admin Only).
- `PUT /api/documents/:id`: Update metadata/file dokumen (Admin Only).
- `DELETE /api/documents/:id`: Hapus dokumen & file fisik (Admin Only).
- `GET /api/documents/:id/download`: Trigger download & catat log aktivitas.

### 6.3 Categories API (`/api/categories`)
- `GET /api/categories`: Mengambil daftar kategori + count dokumen.
- `POST /api/categories`: Menambah kategori baru (Admin Only).
- `PUT /api/categories/:id`: Mengubah kategori (Admin Only).
- `DELETE /api/categories/:id`: Menghapus kategori (Admin Only).

### 6.4 Settings API (`/api/settings`)
- `GET /api/settings`: Mengambil konfigurasi sistem & profil instansi aktif.
- `PUT /api/settings`: Mengubah pengaturan & mengunggah gambar logo/emblem/bg (Admin Only).

### 6.5 Activity Logs API (`/api/logs`)
- `GET /api/logs`: Mengambil daftar log aktivitas sistem (Admin Only).

---

## 7. Panduan Migrasi dari Supabase ke MySQL

| Komponen | Supabase (Lama) | MySQL (Baru) |
| :--- | :--- | :--- |
| **Database Engine** | PostgreSQL | MySQL 8.0+ (InnoDB) |
| **Primary Key Format** | UUID (`uuid_generate_v4()`) | `CHAR(36)` dengan nilai `UUID()` |
| **Pencarian Teks** | PostgreSQL `to_tsvector` / `gin` | MySQL `FULLTEXT` Index (`MATCH...AGAINST`) |
| **Keamanan Data** | Row Level Security (RLS) Policy | Middleware Authorization pada Backend (Express / Laravel) |
| **File Storage** | Supabase Storage Bucket | Disk Storage Server (`/uploads`) / AWS S3 / MinIO |
| **Autentikasi** | Supabase Auth (`auth.users`) | Tabel `users` + JWT Token / Express-Session |
| **Realtime Update** | Supabase Realtime Replication | WebSocket / Socket.io / Server-Sent Events (SSE) |

---

## 8. Persyaratan Non-Fungsional (Non-Functional Requirements)

1. **Performa**:
   - Respon API rata-rata < 200ms untuk pencarian data.
   - Pemanfaatan MySQL Indexing (`idx_documents_visibility`, `idx_documents_year`, `ft_documents_search`) untuk kecepatan query tinggi.
2. **Keamanan**:
   - Password di-hash menggunakan **bcrypt** dengan salt round 10-12.
   - Proteksi **CORS**, **Helmet Header**, dan **Rate Limiting** untuk mencegah serangan Brute Force & DDoS.
   - Validasi input sanitasi untuk mencegah SQL Injection & Cross-Site Scripting (XSS).
3. **Penyimpanan (File Storage)**:
   - Direktori upload dilindungi dari eksekusi skrip berbahaya (`.php`, `.sh`, `.exe`).
   - Penamaan file otomatis dikodekan menggunakan TIMESTAMP/UUID unik untuk mencegah konflik nama file.
