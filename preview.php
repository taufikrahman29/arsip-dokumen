<?php
/**
 * PDF Preview Streamer
 */
require_once __DIR__ . '/config/auth.php';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    http_response_code(400);
    die("ID Dokumen tidak valid.");
}

$pdo = get_db_connection();
$stmt = $pdo->prepare("SELECT * FROM documents WHERE id = ?");
$stmt->execute([$id]);
$doc = $stmt->fetch();

if (!$doc) {
    http_response_code(404);
    die("Dokumen tidak ditemukan.");
}

$filepath = __DIR__ . '/' . ltrim($doc['path_file'], '/');

if (!file_exists($filepath)) {
    http_response_code(404);
    die("File fisik tidak ditemukan pada server.");
}

if (strtolower($doc['ekstensi_file']) !== 'pdf') {
    http_response_code(403);
    die("Pratinjau hanya tersedia untuk dokumen berformat PDF.");
}

if (ob_get_level()) {
    ob_end_clean();
}

header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="' . basename($doc['nama_file_asli']) . '"');
header('Content-Length: ' . filesize($filepath));
header('Cache-Control: private, max-age=86400, must-revalidate');

readfile($filepath);
exit;
