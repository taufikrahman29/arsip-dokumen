<?php
$page_title = "Dashboard Utama";
require_once __DIR__ . '/includes/header.php';

$pdo = get_db_connection();

// 1. Total Dokumen
$total_docs = $pdo->query("SELECT COUNT(*) FROM documents")->fetchColumn();

// 2. Dokumen Bulan Ini
$docs_this_month = $pdo->query("
    SELECT COUNT(*) 
    FROM documents 
    WHERE MONTH(tanggal_upload) = MONTH(CURRENT_DATE()) 
      AND YEAR(tanggal_upload) = YEAR(CURRENT_DATE())
")->fetchColumn();

// 3. Total Kategori
$total_categories = $pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();

// 4. Total Admin
$total_admins = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();

// Fetch latest 10 documents
$stmt = $pdo->prepare("
    SELECT d.*, c.nama_kategori, u.nama AS nama_uploader 
    FROM documents d 
    LEFT JOIN categories c ON d.kategori_id = c.id 
    LEFT JOIN users u ON d.uploaded_by = u.id 
    ORDER BY d.created_at DESC 
    LIMIT 10
");
$stmt->execute();
$recent_docs = $stmt->fetchAll();

// Fetch recent activity logs
$log_stmt = $pdo->query("
    SELECT l.*, u.nama AS nama_user 
    FROM activity_logs l 
    LEFT JOIN users u ON l.user_id = u.id 
    ORDER BY l.created_at DESC 
    LIMIT 5
");
$recent_logs = $log_stmt->fetchAll();
?>

<div class="page-header" style="border: none; padding-bottom: 0;">
    <div>
        <h1 class="page-title">Dashboard Overview</h1>
        <p class="page-subtitle">Selamat datang di Panel Administrasi Sistem Informasi Arsip Dokumen</p>
    </div>
    <div>
        <a href="<?= base_url('admin/dokumen/tambah.php'); ?>" class="btn btn-gold">
            ➕ Upload Dokumen Baru
        </a>
    </div>
</div>

<!-- Statistics Cards -->
<div class="stats-grid">
    <!-- Total Dokumen -->
    <div class="stat-card">
        <div>
            <div class="stat-value"><?= number_format($total_docs); ?></div>
            <div class="stat-label">Total Dokumen</div>
        </div>
        <div class="stat-icon-wrapper" style="background: #e0f2fe; color: #0284c7;">
            📁
        </div>
    </div>

    <!-- Dokumen Bulan Ini -->
    <div class="stat-card">
        <div>
            <div class="stat-value"><?= number_format($docs_this_month); ?></div>
            <div class="stat-label">Dokumen Bulan Ini</div>
        </div>
        <div class="stat-icon-wrapper" style="background: #dcfce7; color: #16a34a;">
            📅
        </div>
    </div>

    <!-- Total Kategori -->
    <div class="stat-card">
        <div>
            <div class="stat-value"><?= number_format($total_categories); ?></div>
            <div class="stat-label">Total Kategori</div>
        </div>
        <div class="stat-icon-wrapper" style="background: #fef3c7; color: #d97706;">
            🏷️
        </div>
    </div>

    <!-- Total Admin -->
    <div class="stat-card">
        <div>
            <div class="stat-value"><?= number_format($total_admins); ?></div>
            <div class="stat-label">Total Admin</div>
        </div>
        <div class="stat-icon-wrapper" style="background: #f3e8ff; color: #9333ea;">
            👥
        </div>
    </div>
</div>

<div style="display: grid; grid-template-columns: 2.2fr 1fr; gap: 24px;">
    <!-- Recent Documents Table -->
    <div>
        <div class="page-header" style="border: none; padding-bottom: 0; margin-bottom: 1rem;">
            <h3 style="font-size: 1.15rem; color: var(--primary-navy);">Dokumen Terbaru</h3>
            <a href="<?= base_url('admin/dokumen/index.php'); ?>" class="btn btn-outline btn-sm">Kelola Semua →</a>
        </div>

        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 50px;">No</th>
                        <th>Dokumen</th>
                        <th>Kategori</th>
                        <th>Upload</th>
                        <th style="width: 140px; text-align: center;">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($recent_docs)): ?>
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 2rem; color: #64748b;">
                                Belum ada dokumen yang diunggah.
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($recent_docs as $idx => $doc): ?>
                            <tr>
                                <td><?= $idx + 1; ?></td>
                                <td>
                                    <strong><?= sanitize($doc['nama_dokumen']); ?></strong>
                                    <br><small style="color: #64748b;"><?= sanitize($doc['nama_file_asli']); ?></small>
                                </td>
                                <td>
                                    <span class="badge badge-category"><?= sanitize($doc['nama_kategori'] ?? 'Lainnya'); ?></span>
                                </td>
                                <td><?= format_date_id($doc['tanggal_upload']); ?></td>
                                <td style="text-align: center;">
                                    <div style="display: inline-flex; gap: 4px;">
                                        <a href="<?= base_url('detail_dokumen.php?id=' . $doc['id']); ?>" target="_blank" class="btn btn-primary btn-sm" title="Lihat">
                                            👁️
                                        </a>
                                        <a href="<?= base_url('admin/dokumen/edit.php?id=' . $doc['id']); ?>" class="btn btn-outline btn-sm" title="Edit">
                                            ✏️
                                        </a>
                                        <a href="<?= base_url('download.php?id=' . $doc['id']); ?>" class="btn btn-gold btn-sm" title="Download">
                                            ⬇️
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Recent Activity Log Widget -->
    <div>
        <div class="page-header" style="border: none; padding-bottom: 0; margin-bottom: 1rem;">
            <h3 style="font-size: 1.15rem; color: var(--primary-navy);">Aktivitas Terakhir</h3>
            <a href="<?= base_url('admin/logs/index.php'); ?>" class="btn btn-outline btn-sm">Semua Logs →</a>
        </div>

        <div style="background: var(--bg-surface); border-radius: var(--radius-md); padding: 1.25rem; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
            <?php if (empty($recent_logs)): ?>
                <p style="color: #64748b; font-size: 0.9rem;">Belum ada log aktivitas.</p>
            <?php else: ?>
                <ul style="list-style: none;">
                    <?php foreach ($recent_logs as $log): ?>
                        <li style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 0.88rem;">
                            <div style="font-weight: 700; color: var(--primary-navy);">
                                <?= sanitize($log['nama_user'] ?? 'Pengunjung'); ?>
                            </div>
                            <div style="color: var(--text-main); margin: 2px 0;">
                                <?= sanitize($log['aktivitas']); ?>
                            </div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between;">
                                <span>IP: <?= sanitize($log['ip_address']); ?></span>
                                <span><?= format_date_id($log['created_at'], true); ?></span>
                            </div>
                        </li>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
