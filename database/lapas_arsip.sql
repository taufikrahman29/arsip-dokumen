-- Database Creation for Arsip Dokumen
CREATE DATABASE IF NOT EXISTS `lapas_arsip` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lapas_arsip`;

-- Table structure for `users`
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `settings`;

-- Table structure for `settings`
CREATE TABLE `settings` (
    `setting_key` VARCHAR(50) PRIMARY KEY,
    `setting_value` TEXT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('app_name', 'LAPAS KELAS IIA BEKASI'),
('app_subname', 'Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia'),
('hero_title', 'Lembaga Pemasyarakatan Kelas IIA Bekasi'),
('hero_subtitle', 'Pemasyarakatan Pasti Bermanfaat Untuk Masyarakat'),
('hero_tagline_title', 'elBeka Semakin INSANI!'),
('hero_tagline_sub', 'AGUNGKAN MENJADI BANGSA YANG NYATA'),
('site_logo', ''),
('hero_bg', ''),
('hero_logo', ''),
('profil_lapas', 'Lapas Kelas IIA Bekasi berada di bawah naungan Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia.'),
('tugas_fungsi', 'Melaksanakan pembinaan, pelayanan, perawatan, kepribadian, serta pengamanan warga binaan pemasyarakatan.'),
('visi_misi', 'Terwujudnya pemasyarakatan yang profesional, akuntabel, sinergi, transparan, dan berintegritas tinggi.');

CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `nama` VARCHAR(150) NOT NULL,
    `role` ENUM('admin','super_admin') NOT NULL DEFAULT 'admin',
    `status` ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nama_kategori` VARCHAR(100) NOT NULL UNIQUE,
    `deskripsi` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `documents` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nama_dokumen` VARCHAR(255) NOT NULL,
    `nomor_dokumen` VARCHAR(100) DEFAULT NULL,
    `kategori_id` INT DEFAULT NULL,
    `tanggal_dokumen` DATE DEFAULT NULL,
    `tanggal_upload` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `deskripsi` TEXT DEFAULT NULL,
    `nama_file_asli` VARCHAR(255) NOT NULL,
    `nama_file_server` VARCHAR(255) NOT NULL,
    `path_file` VARCHAR(500) NOT NULL,
    `ekstensi_file` VARCHAR(20) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `ukuran_file` BIGINT NOT NULL,
    `download_count` INT NOT NULL DEFAULT 0,
    `uploaded_by` INT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`kategori_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `activity_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT DEFAULT NULL,
    `document_id` INT DEFAULT NULL,
    `aktivitas` VARCHAR(255) NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Seed Data
INSERT INTO `categories` (`id`, `nama_kategori`, `deskripsi`) VALUES
(1, 'Surat', 'Surat resmi, kedinasan, dan administrasi umum'),
(2, 'Laporan', 'Dokumen laporan kinerja, bulanan, dan tahunan'),
(3, 'Keputusan', 'Surat keputusan Ka.Lapas dan ketetapan dinas'),
(4, 'Peraturan', 'Peraturan perundang-undangan dan petunjuk teknis'),
(5, 'SOP', 'Standar Operasional Prosedur pelayanan dan pengamanan'),
(6, 'Administrasi', 'Dokumen tata usaha, kepegawaian, dan keuangan'),
(7, 'Lainnya', 'Dokumen pendukung dan berkas umum lainnya');

-- Password default: Bekasilapas321
INSERT INTO `users` (`id`, `username`, `password`, `nama`, `role`, `status`) VALUES
(1, 'admin', '$2y$10$ElAYkAyA75dMJIC01FfkH.XUTseXWmggw4NrxMOAcoVZA8g2qL/su', 'Administrator Lapas', 'super_admin', 'aktif'),
(2, 'petugas', '$2y$10$ElAYkAyA75dMJIC01FfkH.XUTseXWmggw4NrxMOAcoVZA8g2qL/su', 'Petugas Pengelola Arsip', 'admin', 'aktif');

INSERT INTO `documents` (`id`, `nama_dokumen`, `nomor_dokumen`, `kategori_id`, `tanggal_dokumen`, `tanggal_upload`, `deskripsi`, `nama_file_asli`, `nama_file_server`, `path_file`, `ekstensi_file`, `mime_type`, `ukuran_file`, `download_count`, `uploaded_by`) VALUES
(1, 'PERJANJIAN KERJA TAHUN 2025 LAPAS BEKASI SEMESTER I', 'W11.PAS.PAS.01.01-2025/001', 6, '2025-01-10', '2025-12-20 09:12:00', 'Dokumen Perjanjian Kinerja Lapas Kelas IIA Bekasi Tahun 2025 Semester I', 'PERJANJIAN_KERJA_TAHUN_2025_LAPAS_BEKASI_SEMESTER_I.pdf', 'dok_sample_01.pdf', 'uploads/dokumen/dok_sample_01.pdf', 'pdf', 'application/pdf', 1245000, 14, 1),
(2, 'LKIP LAPAS KELAS IIA BEKASI TAHUN 2025 SEMESTER II', 'W11.PAS.PAS.02.04-2025/089', 2, '2025-12-15', '2025-12-24 09:12:00', 'Laporan Kinerja Instansi Pemerintah Lapas Kelas IIA Bekasi Tahun 2025 Semester II', 'LKIP_LAPAS_KELAS_IIA_BEKASI_TAHUN_2025_SEMESTER_II.pdf', 'dok_sample_02.pdf', 'uploads/dokumen/dok_sample_02.pdf', 'pdf', 'application/pdf', 2850000, 22, 1),
(3, 'LKIP LAPAS KELAS IIA BEKASI TAHUN 2025 SEMESTER I', 'W11.PAS.PAS.02.04-2025/042', 2, '2025-06-30', '2025-12-24 09:12:00', 'Laporan Kinerja Instansi Pemerintah Lapas Kelas IIA Bekasi Tahun 2025 Semester I', 'LKIP_LAPAS_KELAS_IIA_BEKASI_TAHUN_2025_SEMESTER_I.pdf', 'dok_sample_03.pdf', 'uploads/dokumen/dok_sample_03.pdf', 'pdf', 'application/pdf', 2410000, 18, 1),
(4, 'PERJANJIAN KINERJA TAHUN 2025 LAPAS KELAS IIA BEKASI SEMESTER 2', 'W11.PAS.PAS.01.01-2025/088', 6, '2025-07-01', '2025-12-23 20:10:00', 'Dokumen Perjanjian Kinerja Lapas Kelas IIA Bekasi Tahun 2025 Semester II', 'PERJANJIAN_KINERJA_TAHUN_2025_LAPAS_KELAS_IIA_BEKASI_SEMESTER_2.pdf', 'dok_sample_04.pdf', 'uploads/dokumen/dok_sample_04.pdf', 'pdf', 'application/pdf', 1580000, 9, 1),
(5, 'RENSTRA LAPAS BEKASI TAHUN 2025', 'W11.PAS.PAS.03.01-2025/005', 4, '2025-01-05', '2025-12-23 20:05:00', 'Rencana Strategis Lapas Bekasi Periode Tahun 2025-2029', 'RENSTRA_LAPAS_BEKASI_TAHUN_2025.pdf', 'dok_sample_05.pdf', 'uploads/dokumen/dok_sample_05.pdf', 'pdf', 'application/pdf', 3120000, 35, 1);
