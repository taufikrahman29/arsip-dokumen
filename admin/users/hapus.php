<?php
/**
 * Admin - Hapus Admin Handler
 */
require_once __DIR__ . '/../../config/auth.php';

require_admin();

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT) ?: filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    set_flash('danger', 'ID User tidak valid.');
    redirect(base_url('admin/users/index.php'));
}

if ($id == $_SESSION['user_id']) {
    set_flash('danger', 'Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif login.');
    redirect(base_url('admin/users/index.php'));
}

$pdo = get_db_connection();
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$id]);
$user = $stmt->fetch();

if (!$user) {
    set_flash('danger', 'User tidak ditemukan.');
    redirect(base_url('admin/users/index.php'));
}

try {
    log_activity("Menghapus akun administrator \"" . $user['username'] . "\"");
    $del = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $del->execute([$id]);

    set_flash('success', 'Akun admin "' . sanitize($user['username']) . '" berhasil dihapus.');
} catch (Exception $e) {
    set_flash('danger', 'Gagal menghapus user: ' . $e->getMessage());
}

redirect(base_url('admin/users/index.php'));
