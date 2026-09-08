<?php
$page_title = "Detail Dokumen";
require_once __DIR__ . '/includes/header.php';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    set_flash('danger', 'ID Dokumen tidak valid.');
    redirect(base_url('dokumen.php'));
}

$pdo = get_db_connection();
$stmt = $pdo->prepare("
    SELECT d.*, c.nama_kategori, u.nama AS nama_uploader 
    FROM documents d 
    LEFT JOIN categories c ON d.kategori_id = c.id 
    LEFT JOIN users u ON d.uploaded_by = u.id 
    WHERE d.id = ?
");
$stmt->execute([$id]);
$doc = $stmt->fetch();

if (!$doc) {
    set_flash('danger', 'Dokumen tidak ditemukan.');
    redirect(base_url('dokumen.php'));
}
?>

<main class="main-container">
    <div style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
        <a href="<?= base_url('dokumen.php'); ?>" class="btn btn-outline">
            ← Kembali ke Daftar Dokumen
        </a>
        <a href="<?= base_url('download.php?id=' . $doc['id']); ?>" class="btn btn-gold">
            ⬇️ Download Dokumen (<?= sanitize(format_bytes($doc['ukuran_file'])); ?>)
        </a>
    </div>

    <div class="detail-card">
        <div style="margin-bottom: 1.5rem;">
            <span class="badge badge-category" style="margin-bottom: 8px;">
                <?= sanitize($doc['nama_kategori'] ?? 'Lainnya'); ?>
            </span>
            <h1 style="font-size: 1.6rem; color: var(--primary-navy); margin-top: 4px;">
                <?= sanitize($doc['nama_dokumen']); ?>
            </h1>
            <?php if ($doc['nomor_dokumen']): ?>
                <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 4px;">
                    Nomor Dokumen: <strong><?= sanitize($doc['nomor_dokumen']); ?></strong>
                </p>
            <?php endif; ?>
        </div>

        <div class="detail-grid">
            <div>
                <div class="detail-item-title">Kategori</div>
                <div class="detail-item-value"><?= sanitize($doc['nama_kategori'] ?? 'Lainnya'); ?></div>
            </div>
            <div>
                <div class="detail-item-title">Nomor Dokumen</div>
                <div class="detail-item-value"><?= sanitize($doc['nomor_dokumen'] ?: '-'); ?></div>
            </div>
            <div>
                <div class="detail-item-title">Tanggal Dokumen</div>
                <div class="detail-item-value"><?= format_date_id($doc['tanggal_dokumen']); ?></div>
            </div>
            <div>
                <div class="detail-item-title">Tanggal Upload</div>
                <div class="detail-item-value"><?= format_date_id($doc['tanggal_upload'], true); ?></div>
            </div>
            <div>
                <div class="detail-item-title">Ukuran File</div>
                <div class="detail-item-value"><?= format_bytes($doc['ukuran_file']); ?></div>
            </div>
            <div>
                <div class="detail-item-title">Total Download</div>
                <div class="detail-item-value"><?= number_format($doc['download_count']); ?>x</div>
            </div>
            <div>
                <div class="detail-item-title">Uploader</div>
                <div class="detail-item-value"><?= sanitize($doc['nama_uploader'] ?? 'Sistem'); ?></div>
            </div>
        </div>

        <?php if ($doc['deskripsi']): ?>
            <div style="margin-bottom: 1.8rem;">
                <div class="detail-item-title">Deskripsi Dokumen</div>
                <p style="color: var(--text-main); font-size: 0.95rem; line-height: 1.6; margin-top: 4px;">
                    <?= nl2br(sanitize($doc['deskripsi'])); ?>
                </p>
            </div>
        <?php endif; ?>

        <!-- Embedded PDF Viewer -->
        <?php if (strtolower($doc['ekstensi_file']) === 'pdf'): ?>
            <div style="margin-top: 2rem;">
                <h3 style="font-size: 1.1rem; color: var(--primary-navy); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                    📄 Pratinjau Dokumen PDF
                </h3>
                <div class="pdf-viewer-wrapper">
                    <iframe 
                        src="<?= base_url('preview.php?id=' . $doc['id']); ?>" 
                        class="pdf-viewer-frame" 
                        title="PDF Viewer - <?= sanitize($doc['nama_dokumen']); ?>">
                    </iframe>
                </div>
            </div>
        <?php else: ?>
            <div class="alert alert-info" style="margin-top: 1.5rem;">
                ℹ️ Format file <strong><?= strtoupper(sanitize($doc['ekstensi_file'])); ?></strong> tidak dapat dipratinjau secara langsung di browser. Silakan klik tombol <strong>Download Dokumen</strong> untuk mengunduh file ini.
            </div>
        <?php endif; ?>
    </div>
</main>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
