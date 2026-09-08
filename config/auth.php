<?php
/**
 * Global Helpers, Security & Authentication Functions
 * Sistem Informasi Arsip Dokumen Lapas Kelas IIA Bekasi
 */

require_once __DIR__ . '/session.php';
require_once __DIR__ . '/database.php';

// Base URL generator
function base_url($path = '') {
    $scheme = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $script_name = $_SERVER['SCRIPT_NAME'] ?? '';
    $dir = dirname($script_name);
    
    // Normalize root path if called from subfolders
    if (strpos($script_name, '/admin/') !== false) {
        $dir = preg_replace('#/admin(/.*)?$#', '', $dir);
    }
    
    $base = rtrim($scheme . '://' . $host . $dir, '/');
    return $base . ($path ? '/' . ltrim($path, '/') : '');
}

// XSS Protection Sanitizer
function sanitize($str) {
    return htmlspecialchars(trim((string)$str), ENT_QUOTES, 'UTF-8');
}

// Format byte sizes
function format_bytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max((float)$bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    return round($bytes, $precision) . ' ' . $units[$pow];
}

// Format Indonesian Date
function format_date_id($date_str, $include_time = false) {
    if (!$date_str || $date_str === '0000-00-00' || $date_str === '0000-00-00 00:00:00') {
        return '-';
    }
    $timestamp = strtotime($date_str);
    if (!$timestamp) return '-';

    $months = [
        1 => 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    
    $day = date('d', $timestamp);
    $month = $months[(int)date('m', $timestamp)];
    $year = date('Y', $timestamp);

    $formatted = "$day $month $year";
    if ($include_time) {
        $formatted .= ' ' . date('H:i', $timestamp);
    }
    return $formatted;
}

// Redirect Helper (Always exits cleanly after sending header)
function redirect($url) {
    if (!headers_sent()) {
        header("Location: " . $url);
        exit;
    }
    echo '<script>window.location.href="' . htmlspecialchars($url, ENT_QUOTES, 'UTF-8') . '";</script>';
    echo '<noscript><meta http-equiv="refresh" content="0;url=' . htmlspecialchars($url, ENT_QUOTES, 'UTF-8') . '"></noscript>';
    exit;
}

// Flash Message Setter
function set_flash($type, $message) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['flash_message'] = [
        'type' => $type,
        'message' => $message
    ];
}

// Render Flash Message (Only called inside HTML views)
function render_flash() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (isset($_SESSION['flash_message'])) {
        $flash = $_SESSION['flash_message'];
        unset($_SESSION['flash_message']);
        $icon = $flash['type'] === 'success' ? '✓' : '⚠️';
        echo '<div class="alert alert-' . sanitize($flash['type']) . '">';
        echo '<span class="alert-icon">' . $icon . '</span> ';
        echo sanitize($flash['message']);
        echo '</div>';
    }
}

// Authentication Helpers
function is_logged_in() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function require_admin() {
    if (!is_logged_in()) {
        set_flash('danger', 'Silakan login terlebih dahulu untuk mengakses halaman admin.');
        redirect(base_url('admin/login.php'));
    }
}

function get_current_user_data() {
    if (!is_logged_in()) return null;
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'] ?? '',
        'nama' => $_SESSION['user_nama'] ?? '',
        'role' => $_SESSION['user_role'] ?? 'admin'
    ];
}

function get_client_ip() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    }
    return trim($ip);
}

// Log System Activity
function log_activity($aktivitas, $document_id = null, $user_id = null) {
    try {
        $pdo = get_db_connection();
        if ($user_id === null && is_logged_in()) {
            $user_id = $_SESSION['user_id'];
        }
        
        $ip = get_client_ip();
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

        $stmt = $pdo->prepare("
            INSERT INTO activity_logs (user_id, document_id, aktivitas, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$user_id, $document_id, $aktivitas, $ip, $ua]);
    } catch (Exception $e) {
        error_log("Failed to log activity: " . $e->getMessage());
    }
}

// CSRF Protection Token Generator & Verifier
function generate_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_field() {
    $token = generate_csrf_token();
    return '<input type="hidden" name="csrf_token" value="' . sanitize($token) . '">';
}

function verify_csrf_token() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $token = $_POST['csrf_token'] ?? '';
        if (empty($token) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
            set_flash('danger', 'Sesi keamanan kadaluarsa (CSRF Mismatch). Silakan coba lagi.');
            redirect($_SERVER['REQUEST_URI'] ?? base_url());
        }
    }
}

// Fetch all application settings from database
function get_all_settings() {
    static $settings = null;
    if ($settings === null) {
        try {
            $pdo = get_db_connection();
            $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
            $settings = [];
            while ($row = $stmt->fetch()) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }
        } catch (Exception $e) {
            $settings = [];
        }
    }
    return $settings;
}

// Get single setting by key
function get_setting($key, $default = '') {
    $all = get_all_settings();
    return isset($all[$key]) && $all[$key] !== '' ? $all[$key] : $default;
}
