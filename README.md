<<<<<<< HEAD
# SISTEM ARSIP DOKUMEN LAPAS KELAS IIA BEKASI

Aplikasi berbasis web **Sistem Informasi Pengelolaan dan Penyimpanan Dokumen Resmi** untuk Lembaga Pemasyarakatan (Lapas) Kelas IIA Bekasi. Dibangun menggunakan **PHP Native (PDO)**, **MySQL**, **HTML5**, **CSS3**, dan **Vanilla JavaScript**.

---

## 📌 Fitur Utama

### 🌐 Halaman Publik (Public Portal)
- **Beranda / Landing Page**: Banner hero formal instansi (Dark Navy & Gold), visi-misi, tugas & fungsi lembaga, profil singkat, dan pratinjau dokumen terbaru.
- **Pencarian & Filter Dokumen**: Pencarian berdasarkan nama dokumen, nomor dokumen, filter kategori, pengurutan (Terbaru, Terlama, A-Z, Z-A), dan pagination.
- **Detail Dokumen & PDF Viewer**: Penampilan metadata lengkap dokumen, jumlah total unduhan, tombol unduh, dan **Embedded PDF Viewer (`<iframe>`)** untuk membaca dokumen secara langsung tanpa meninggalkan halaman.
- **Unduh Aman (Secure Download)**: Penanganan unduhan file dengan pelacakan counter unduhan dan pencatatan log otomatis.

### 🔐 Halaman Administrator (Admin Panel)
- **Autentikasi Aman**: Login admin dengan enkripsi password `password_hash()` + `password_verify()`, perlindungan CSRF Token, dan Session Guard.
- **Dashboard Statistik**: Menampilkan ringkasan total dokumen, dokumen diunggah bulan ini, total kategori, total admin, dokumen terbaru, dan log aktivitas real-time.
- **Manajemen Dokumen (CRUD)**:
  - **Tambah Dokumen**: Form upload file (PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG) hingga 10MB dengan validasi MIME `finfo_file()` dan penamaan acak unik `dok_[hash].ext`.
  - **Edit Dokumen**: Pembaruan metadata dan opsi penggantian file fisik (menghapus file lama dari server).
  - **Hapus Dokumen**: Konfirmasi hapus, penghapusan file fisik dari folder `uploads/dokumen/`, penghapusan record DB, dan pencatatan audit log.
- **Manajemen Kategori (CRUD)**: Kelola daftar kategori dokumen.
- **Manajemen Admin Users (CRUD)**: Kelola pengguna administrator, penambahan admin baru, manajemen role (`admin` / `super_admin`), dan reset password.
- **Log Aktivitas (Audit Trail)**: Catatan aktivitas admin (login, logout, upload, edit, hapus, download) dilengkapi IP Address, User Agent, dan timestamp.

---

## 🛠️ Persyaratan Sistem (Prerequisites)

- **XAMPP / Laragon / Web Server Apache**
- **PHP 8.0** atau yang lebih baru (dengan ekstensi `pdo_mysql` dan `fileinfo` aktif)
- **MySQL / MariaDB**

---

## 🚀 Panduan Instalasi & Penggunaan

### 1. Ekstrak / Placement Project
Tempatkan folder `arsip-dokumen` ke dalam direktori web server Anda:
- **XAMPP**: `C:\xampp\htdocs\arsip-dokumen\`
- **Laragon**: `C:\laragon\www\arsip-dokumen\`

### 2. Import Database MySQL
1. Buka **phpMyAdmin** (`http://localhost/phpmyadmin/`) atau MySQL CLI.
2. Buat database baru bernama `lapas_arsip` (atau jalankan skrip import otomatis).
3. Import file database yang tersedia di:
   ```text
   database/lapas_arsip.sql
   ```
4. Verifikasi bahwa 4 tabel (`users`, `categories`, `documents`, `activity_logs`) telah berhasil dibuat beserta dummy datanya.

### 3. Konfigurasi Database (Jika Diperlukan)
File konfigurasi database terletak pada `config/database.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'lapas_arsip');
define('DB_USER', 'root');
define('DB_PASS', '');
```
*(Sesuaikan `DB_USER` dan `DB_PASS` apabila MySQL Anda memiliki password).*

### 4. Menjalankan Aplikasi
Buka browser Anda dan akses:
- **Halaman Publik**: `http://localhost/arsip-dokumen/index.php`
- **Halaman Login Admin**: `http://localhost/arsip-dokumen/admin/login.php`

---

## 🔑 Kredensial Default Login Administrator

| Username | Password | Role | Status |
| :--- | :--- | :--- | :--- |
| **`admin`** | **`Bekasilapas321`** | Super Admin | Aktif |
| **`petugas`** | **`Bekasilapas321`** | Admin | Aktif |

---

## 📁 Struktur Folder Project

```text
arsip-dokumen/
│
├── index.php                 # Halaman utama landing page publik
├── dokumen.php               # Halaman katalog dokumenpublik
├── detail_dokumen.php        # Detail dokumen & PDF viewer
├── preview.php               # Streamer viewer PDF inline
├── download.php              # Script unduh aman & counter logger
│
├── config/
│   └── database.php          # Konfigurasi PDO & helper global
│
├── includes/
│   ├── header.php            # Layout header publik
│   ├── footer.php            # Layout footer publik
│   ├── navbar.php            # Layout navigasi publik
│   └── auth.php              # Security, session, CSRF & logging helper
│
├── assets/
│   ├── css/
│   │   └── style.css         # Styling UI instansi formal navy/gold
│   └── js/
│       └── script.js         # Vanilla JS interaction script
│
├── uploads/
│   └── dokumen/              # Direktori penyimpanan fisik file dokumen
│
├── admin/
│   ├── login.php             # Form login administrator
│   ├── logout.php            # Handler logout session
│   ├── dashboard.php         # Overview statistik & recent activity
│   │
│   ├── includes/             # Admin layout partials (header, sidebar, footer)
│   │
│   ├── dokumen/              # CRUD Dokumen (index, tambah, edit, hapus)
│   ├── kategori/             # CRUD Kategori (index, tambah, edit, hapus)
│   ├── users/                # CRUD User Admin (index, tambah, edit, hapus)
│   └── logs/                 # Halaman Audit Log Aktivitas
│
└── database/
    └── lapas_arsip.sql       # Skrip SQL database DDL & sample DML
```

---

## 🛡️ Aspek Keamanan (Security Features)

1. **Prepared Statements**: 100% kueri basis data menggunakan PDO Parameter Binding untuk mencegah SQL Injection.
2. **Password Hashing**: Menggunakan `password_hash()` standar `PASSWORD_DEFAULT`.
3. **Validasi Strict File Upload**:
   - Pembatasan ekstensi file terlarang (`.php`, `.phtml`, `.exe`, dll).
   - Validasi MIME type fisik menggunakan `finfo_file()`.
   - Nama file diubah secara acak menggunakan `bin2hex(random_bytes(16))` untuk mencegah *direct guessing attack*.
4. **XSS Protection**: Seluruh output variabel dibungkus fungsi `htmlspecialchars()`.
5. **CSRF Protection**: Token anti-CSRF dipasang pada setiap submit form POST sensitif.
6. **Direct Access Protection**: Download file dikirim via `readfile()` dengan HTTP Header aman, tanpa mengekspos lokasi folder fisik file secara publik.

---
© 2026 **Lapas Kelas IIA Bekasi** — Sistem Informasi Arsip Dokumen.
=======
# arsip-dokumen
Aplikasi Arsip Dokumen PHP
>>>>>>> 6d4a0d3bf2dc9c37d59490a536d6d17517a26831
