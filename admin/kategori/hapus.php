<?php
/**
 * Admin - Hapus Kategori Handler
 */
require_once __DIR__ . '/../../config/auth.php';

require_admin();

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT) ?: filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    set_flash('danger', 'ID Kategori tidak valid.');
    redirect(base_url('admin/kategori/index.php'));
}

$pdo = get_db_connection();
$stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
$stmt->execute([$id]);
$cat = $stmt->fetch();

if (!$cat) {
    set_flash('danger', 'Kategori tidak ditemukan.');
    redirect(base_url('admin/kategori/index.php'));
}

try {
    log_activity("Menghapus kategori dokumen \"" . $cat['nama_kategori'] . "\"");
    $del = $pdo->prepare("DELETE FROM categories WHERE id = ?");
    $del->execute([$id]);

    set_flash('success', 'Kategori "' . sanitize($cat['nama_kategori']) . '" berhasil dihapus.');
} catch (Exception $e) {
    set_flash('danger', 'Gagal menghapus kategori: ' . $e->getMessage());
}

redirect(base_url('admin/kategori/index.php'));
