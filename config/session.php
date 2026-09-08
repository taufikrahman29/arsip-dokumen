<?php
/**
 * Session Configuration
 * Sistem Informasi Arsip Dokumen Lapas Kelas IIA Bekasi
 */

if (session_status() === PHP_SESSION_NONE) {
    // Configure secure session cookie attributes if not already sent
    if (!headers_sent()) {
        ini_set('session.cookie_httponly', 1);
        ini_set('session.use_only_cookies', 1);
    }
    session_start();
}
