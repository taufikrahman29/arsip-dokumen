<?php
/**
 * Administrator Logout Handler
 */
require_once __DIR__ . '/../config/auth.php';

if (is_logged_in()) {
    log_activity("Logout administrator berhasil", null, $_SESSION['user_id']);
}

$_SESSION = array();

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

session_destroy();

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

set_flash('success', 'Anda telah berhasil logout.');
redirect(base_url('admin/login.php'));
