<?php
/**
 * Database Configuration (Pure PDO)
 * Sistem Informasi Arsip Dokumen Lapas Kelas IIA Bekasi
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'lapas_arsip');
define('DB_USER', 'root');
define('DB_PASS', '');

/**
 * Get PDO Database Connection
 * Supports failover between DB_HOST, 127.0.0.1, and localhost
 *
 * @return PDO
 */
function get_db_connection() {
    static $pdo = null;
    if ($pdo === null) {
        $hosts = array_unique([DB_HOST, '127.0.0.1', 'localhost']);
        $last_exception = null;
        
        foreach ($hosts as $host) {
            try {
                $dsn = "mysql:host=" . $host . ";dbname=" . DB_NAME . ";charset=utf8mb4";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];
                $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
                break;
            } catch (PDOException $e) {
                $last_exception = $e;
            }
        }

        if ($pdo === null && $last_exception !== null) {
            error_log("Database Connection Failure: " . $last_exception->getMessage());
            die("Koneksi database gagal. Pastikan MySQL pada XAMPP/Laragon sudah diaktifkan.");
        }
    }
    return $pdo;
}
