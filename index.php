<?php
$page_title = "Beranda";
require_once __DIR__ . '/includes/header.php';

// Fetch stats and latest documents for landing page
$pdo = get_db_connection();

$total_docs = $pdo->query("SELECT COUNT(*) FROM documents")->fetchColumn();
$total_cats = $pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();

// Fetch latest 5 documents
$stmt = $pdo->prepare("
    SELECT d.*, c.nama_kategori 
    FROM documents d 
    LEFT JOIN categories c ON d.kategori_id = c.id 
    ORDER BY d.created_at DESC 
    LIMIT 5
");
$stmt->execute();
$latest_documents = $stmt->fetchAll();
?>

<?php
$hero_bg = get_setting('hero_bg');
$hero_logo = get_setting('hero_logo');
$hero_tagline_title = get_setting('hero_tagline_title', 'elBeka Semakin INSANI!');
$hero_tagline_sub = get_setting('hero_tagline_sub', 'AGUNGKAN MENJADI BANGSA YANG NYATA');
$hero_title = get_setting('hero_title', 'Lembaga Pemasyarakatan Kelas IIA Bekasi');
$hero_subtitle = get_setting('hero_subtitle', 'Pemasyarakatan Pasti Bermanfaat Untuk Masyarakat');

$profil_lapas = get_setting('profil_lapas', 'Lapas Kelas IIA Bekasi berada di bawah naungan Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia.');
$tugas_fungsi = get_setting('tugas_fungsi', 'Melaksanakan pembinaan, pelayanan, perawatan, kepribadian, serta pengamanan warga binaan pemasyarakatan.');
$visi_misi = get_setting('visi_misi', 'Terwujudnya pemasyarakatan yang profesional, akuntabel, sinergi, transparan, dan berintegritas tinggi.');

$hero_style = $hero_bg ? "background: linear-gradient(135deg, rgba(10, 25, 47, 0.92) 0%, rgba(15, 44, 89, 0.96) 100%), url('" . base_url($hero_bg) . "') center/cover no-repeat;" : "";
?>

<!-- Hero Section -->
<section class="hero-section" style="<?= $hero_style; ?>">
    <div class="hero-content">
        <?php if ($hero_logo): ?>
            <div style="margin-bottom: 1.5rem;">
                <img src="<?= base_url($hero_logo); ?>" alt="Emblem Logo" style="max-height: 80px; max-width: 100%; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
            </div>
        <?php else: ?>
            <div class="hero-emblem">
                <span class="hero-tagline-title"><?= sanitize($hero_tagline_title); ?></span>
                <span class="hero-tagline-sub"><?= sanitize($hero_tagline_sub); ?></span>
            </div>
        <?php endif; ?>
        
        <h1 class="hero-title"><?= sanitize($hero_title); ?></h1>
        <p class="hero-subtitle"><?= sanitize($hero_subtitle); ?></p>
        <a href="<?= base_url('dokumen.php'); ?>" class="btn-hero">
            🔍 LIHAT DOKUMEN
        </a>
    </div>
</section>

<!-- Info Cards Section -->
<section class="info-section">
    <div class="info-cards-grid">
        <!-- Profil Lapas -->
        <div class="info-card">
            <div class="info-card-icon">🏛️</div>
            <h3 class="info-card-title">Profil Lapas</h3>
            <p class="info-card-desc">
                <?= nl2br(sanitize($profil_lapas)); ?>
            </p>
        </div>

        <!-- Tugas & Fungsi -->
        <div class="info-card">
            <div class="info-card-icon">⚖️</div>
            <h3 class="info-card-title">Tugas & Fungsi</h3>
            <p class="info-card-desc">
                <?= nl2br(sanitize($tugas_fungsi)); ?>
            </p>
        </div>

        <!-- Visi & Misi -->
        <div class="info-card">
            <div class="info-card-icon">🎯</div>
            <h3 class="info-card-title">Visi & Misi</h3>
            <p class="info-card-desc">
                <?= nl2br(sanitize($visi_misi)); ?>
            </p>
        </div>
    </div>
</section>

<!-- Latest Documents Showcase -->
<main class="main-container" style="padding-top: 0;">
    <div class="page-header">
        <div>
            <h2 class="page-title">Dokumen Terbaru</h2>
            <p class="page-subtitle">Arsip dokumen resmi dan laporan publik terupdate</p>
        </div>
        <a href="<?= base_url('dokumen.php'); ?>" class="btn btn-outline">
            Lihat Semua Dokumen →
        </a>
    </div>

    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th style="width: 60px;">No</th>
                    <th>Nama Dokumen</th>
                    <th>Kategori</th>
                    <th>Tanggal Upload</th>
                    <th>File</th>
                    <th style="width: 170px; text-align: center;">Aksi</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($latest_documents)): ?>
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">
                            Belum ada dokumen yang diunggah.
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($latest_documents as $index => $doc): ?>
                        <tr>
                            <td><?= $index + 1; ?></td>
                            <td>
                                <strong><?= sanitize($doc['nama_dokumen']); ?></strong>
                                <?php if ($doc['nomor_dokumen']): ?>
                                    <br><small style="color: #64748b;">No: <?= sanitize($doc['nomor_dokumen']); ?></small>
                                <?php endif; ?>
                            </td>
                            <td>
                                <span class="badge badge-category">
                                    <?= sanitize($doc['nama_kategori'] ?? 'Lainnya'); ?>
                                </span>
                            </td>
                            <td><?= format_date_id($doc['tanggal_upload'], true); ?></td>
                            <td>
                                <span class="badge badge-<?= strtolower(sanitize($doc['ekstensi_file'])); ?>">
                                    <?= strtoupper(sanitize($doc['ekstensi_file'])); ?>
                                </span>
                            </td>
                            <td style="text-align: center;">
                                <div style="display: inline-flex; gap: 6px;">
                                    <a href="<?= base_url('detail_dokumen.php?id=' . $doc['id']); ?>" class="btn btn-primary btn-sm">
                                        Lihat
                                    </a>
                                    <a href="<?= base_url('download.php?id=' . $doc['id']); ?>" class="btn btn-gold btn-sm">
                                        Download
                                    </a>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</main>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
