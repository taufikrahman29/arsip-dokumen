<?php
$page_title = "Kategori Dokumen";
require_once __DIR__ . '/../includes/header.php';

$pdo = get_db_connection();

// Fetch categories with total count of documents in each
$categories = $pdo->query("
    SELECT c.*, COUNT(d.id) AS total_dokumen 
    FROM categories c 
    LEFT JOIN documents d ON c.id = d.kategori_id 
    GROUP BY c.id 
    ORDER BY c.nama_kategori ASC
")->fetchAll();
?>

<div class="page-header">
    <div>
        <h1 class="page-title">Kelola Kategori Dokumen</h1>
        <p class="page-subtitle">Kelola pengelompokan jenis dokumen dan arsip</p>
    </div>
    <div>
        <a href="<?= base_url('admin/kategori/tambah.php'); ?>" class="btn btn-gold">
            ➕ Tambah Kategori
        </a>
    </div>
</div>

<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <th style="width: 50px;">No</th>
                <th>Nama Kategori</th>
                <th>Deskripsi</th>
                <th>Total Dokumen</th>
                <th style="width: 160px; text-align: center;">Aksi</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($categories)): ?>
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: #64748b;">
                        Belum ada kategori yang dibuat.
                    </td>
                </tr>
            <?php else: ?>
                <?php foreach ($categories as $idx => $cat): ?>
                    <tr>
                        <td><?= $idx + 1; ?></td>
                        <td>
                            <strong><?= sanitize($cat['nama_kategori']); ?></strong>
                        </td>
                        <td><?= sanitize($cat['deskripsi'] ?: '-'); ?></td>
                        <td>
                            <span class="badge badge-category">
                                <?= number_format($cat['total_dokumen']); ?> Dokumen
                            </span>
                        </td>
                        <td style="text-align: center;">
                            <div style="display: inline-flex; gap: 6px;">
                                <a href="<?= base_url('admin/kategori/edit.php?id=' . $cat['id']); ?>" class="btn btn-outline btn-sm">
                                    ✏️ Edit
                                </a>
                                <a href="<?= base_url('admin/kategori/hapus.php?id=' . $cat['id']); ?>" class="btn btn-danger btn-sm btn-confirm-delete" data-confirm="Apakah Anda yakin ingin menghapus kategori '<?= sanitize($cat['nama_kategori']); ?>'?">
                                    🗑️ Hapus
                                </a>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
