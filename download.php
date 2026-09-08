<?php
/**
 * Secure File Download Handler
 */
require_once __DIR__ . '/config/auth.php';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    set_flash('danger', 'ID Dokumen tidak valid.');
    redirect(base_url('dokumen.php'));
}

$pdo = get_db_connection();
$stmt = $pdo->prepare("SELECT * FROM documents WHERE id = ?");
$stmt->execute([$id]);
$doc = $stmt->fetch();

if (!$doc) {
    set_flash('danger', 'Dokumen tidak ditemukan.');
    redirect(base_url('dokumen.php'));
}

$filepath = __DIR__ . '/' . ltrim($doc['path_file'], '/');

if (!file_exists($filepath)) {
    set_flash('danger', 'File fisik tidak ditemukan pada server.');
    redirect(base_url('detail_dokumen.php?id=' . $id));
}

// 1. Increment download counter
$update_stmt = $pdo->prepare("UPDATE documents SET download_count = download_count + 1 WHERE id = ?");
$update_stmt->execute([$id]);

// 2. Log activity
$user_id = is_logged_in() ? $_SESSION['user_id'] : null;
$user_label = is_logged_in() ? 'Admin (' . $_SESSION['user_nama'] . ')' : 'Pengunjung Public';
log_activity("$user_label mengunduh dokumen \"" . $doc['nama_dokumen'] . "\"", $id, $user_id);

// 3. Clear output buffers
if (ob_get_level()) {
    ob_end_clean();
}

// 4. Set headers for secure file download
$mime = $doc['mime_type'] ?: 'application/octet-stream';
$filename = basename($doc['nama_file_asli']);

header('Content-Description: File Transfer');
header('Content-Type: ' . $mime);
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');
header('Content-Length: ' . filesize($filepath));

readfile($filepath);
exit;
