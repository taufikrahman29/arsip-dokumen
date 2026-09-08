<?php
/**
 * Delete Document Handler
 */
require_once __DIR__ . '/../../config/auth.php';

require_admin();

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT) ?: filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    set_flash('danger', 'ID Dokumen tidak valid.');
    redirect(base_url('admin/dokumen/index.php'));
}

$pdo = get_db_connection();
$stmt = $pdo->prepare("SELECT * FROM documents WHERE id = ?");
$stmt->execute([$id]);
$doc = $stmt->fetch();

if (!$doc) {
    set_flash('danger', 'Dokumen tidak ditemukan atau sudah dihapus.');
    redirect(base_url('admin/dokumen/index.php'));
}

try {
    $filepath = __DIR__ . '/../../' . ltrim($doc['path_file'], '/');
    if (file_exists($filepath)) {
        @unlink($filepath);
    }

    log_activity("Menghapus dokumen \"" . $doc['nama_dokumen'] . "\"", $id);

    $delete_stmt = $pdo->prepare("DELETE FROM documents WHERE id = ?");
    $delete_stmt->execute([$id]);

    set_flash('success', 'Dokumen "' . sanitize($doc['nama_dokumen']) . '" dan file terkait berhasil dihapus.');
} catch (Exception $e) {
    set_flash('danger', 'Gagal menghapus dokumen: ' . $e->getMessage());
}

redirect(base_url('admin/dokumen/index.php'));
