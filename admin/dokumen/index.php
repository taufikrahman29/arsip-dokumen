<?php
$page_title = "Arsip Dokumen";
require_once __DIR__ . '/../includes/header.php';

$pdo = get_db_connection();

// Fetch categories
$categories = $pdo->query("SELECT * FROM categories ORDER BY nama_kategori ASC")->fetchAll();

// Parameters
$search = trim($_GET['q'] ?? '');
$cat_id = filter_input(INPUT_GET, 'kategori', FILTER_VALIDATE_INT);
$page = max(1, filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT) ?: 1);
$limit = 10;
$offset = ($page - 1) * $limit;

// Where Clauses
$where_clauses = [];
$params = [];

if ($search !== '') {
    $where_clauses[] = "(d.nama_dokumen LIKE ? OR d.nomor_dokumen LIKE ? OR d.nama_file_asli LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if ($cat_id) {
    $where_clauses[] = "d.kategori_id = ?";
    $params[] = $cat_id;
}

$where_sql = !empty($where_clauses) ? "WHERE " . implode(" AND ", $where_clauses) : "";

// Count Total
$count_stmt = $pdo->prepare("SELECT COUNT(*) FROM documents d $where_sql");
$count_stmt->execute($params);
$total_rows = $count_stmt->fetchColumn();
$total_pages = ceil($total_rows / $limit);

// Fetch Data
$sql = "
    SELECT d.*, c.nama_kategori, u.nama AS nama_uploader 
    FROM documents d 
    LEFT JOIN categories c ON d.kategori_id = c.id 
    LEFT JOIN users u ON d.uploaded_by = u.id 
    $where_sql 
    ORDER BY d.created_at DESC 
    LIMIT $limit OFFSET $offset
";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$documents = $stmt->fetchAll();
?>

<div class="page-header">
    <div>
        <h1 class="page-title">Kelola Arsip Dokumen</h1>
        <p class="page-subtitle">Penyimpanan, pengeditan, dan pengelolaan berkas resmi Lapas Bekasi</p>
    </div>
    <div>
        <a href="<?= base_url('admin/dokumen/tambah.php'); ?>" class="btn btn-gold">
            ➕ Tambah Dokumen
        </a>
    </div>
</div>

<!-- Toolbar Form -->
<div class="toolbar-card">
    <form method="GET" action="index.php" class="search-form">
        <input type="text" name="q" class="input-search" placeholder="Cari nama, nomor dokumen, atau nama file..." value="<?= sanitize($search); ?>">
        <button type="submit" class="btn btn-primary">🔍 Cari</button>
        <?php if ($search || $cat_id): ?>
            <a href="index.php" class="btn btn-outline">Reset</a>
        <?php endif; ?>
    </form>

    <div class="filter-group">
        <form method="GET" action="index.php">
            <?php if ($search): ?><input type="hidden" name="q" value="<?= sanitize($search); ?>"><?php endif; ?>
            <select name="kategori" class="select-filter" onchange="this.form.submit()">
                <option value="">-- Semua Kategori --</option>
                <?php foreach ($categories as $cat): ?>
                    <option value="<?= $cat['id']; ?>" <?= $cat_id == $cat['id'] ? 'selected' : ''; ?>>
                        <?= sanitize($cat['nama_kategori']); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </form>
    </div>
</div>

<!-- Table -->
<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <th style="width: 40px;">No</th>
                <th>Nama Dokumen</th>
                <th>Kategori</th>
                <th>Upload</th>
                <th>Ukuran</th>
                <th>Download</th>
                <th style="width: 200px; text-align: center;">Aksi</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($documents)): ?>
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2.5rem; color: #64748b;">
                        Belum ada arsip dokumen yang tersedia.
                    </td>
                </tr>
            <?php else: ?>
                <?php foreach ($documents as $idx => $doc): ?>
                    <tr>
                        <td><?= $offset + $idx + 1; ?></td>
                        <td>
                            <strong><?= sanitize($doc['nama_dokumen']); ?></strong>
                            <?php if ($doc['nomor_dokumen']): ?>
                                <br><small style="color: #64748b;">No: <?= sanitize($doc['nomor_dokumen']); ?></small>
                            <?php endif; ?>
                            <br><small style="color: #0284c7;">📁 <?= sanitize($doc['nama_file_asli']); ?></small>
                        </td>
                        <td>
                            <span class="badge badge-category">
                                <?= sanitize($doc['nama_kategori'] ?? 'Lainnya'); ?>
                            </span>
                        </td>
                        <td><?= format_date_id($doc['tanggal_upload']); ?></td>
                        <td><?= format_bytes($doc['ukuran_file']); ?></td>
                        <td>
                            <span style="font-weight: 700; color: var(--primary-navy);">
                                <?= number_format($doc['download_count']); ?>x
                            </span>
                        </td>
                        <td style="text-align: center;">
                            <div style="display: inline-flex; gap: 4px;">
                                <a href="<?= base_url('detail_dokumen.php?id=' . $doc['id']); ?>" target="_blank" class="btn btn-primary btn-sm" title="Lihat Detail">
                                    👁️ Lihat
                                </a>
                                <a href="<?= base_url('admin/dokumen/edit.php?id=' . $doc['id']); ?>" class="btn btn-outline btn-sm" title="Edit Metadata">
                                    ✏️ Edit
                                </a>
                                <a href="<?= base_url('download.php?id=' . $doc['id']); ?>" class="btn btn-gold btn-sm" title="Download">
                                    ⬇️
                                </a>
                                <a href="<?= base_url('admin/dokumen/hapus.php?id=' . $doc['id']); ?>" class="btn btn-danger btn-sm btn-confirm-delete" data-confirm="Apakah Anda yakin ingin menghapus dokumen '<?= sanitize($doc['nama_dokumen']); ?>' ini?" title="Hapus Dokumen">
                                    🗑️
                                </a>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>

<!-- Pagination -->
<?php if ($total_pages > 1): ?>
    <div class="pagination-wrapper">
        <div style="font-size: 0.9rem; color: #64748b;">
            Menampilkan <?= count($documents); ?> dari total <?= $total_rows; ?> dokumen
        </div>
        <ul class="pagination">
            <?php if ($page > 1): ?>
                <li><a href="?<?= http_build_query(array_merge($_GET, ['page' => $page - 1])); ?>">« Prev</a></li>
            <?php endif; ?>

            <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                <li class="<?= $i === $page ? 'active' : ''; ?>">
                    <?php if ($i === $page): ?>
                        <span><?= $i; ?></span>
                    <?php else: ?>
                        <a href="?<?= http_build_query(array_merge($_GET, ['page' => $i])); ?>"><?= $i; ?></a>
                    <?php endif; ?>
                </li>
            <?php endfor; ?>

            <?php if ($page < $total_pages): ?>
                <li><a href="?<?= http_build_query(array_merge($_GET, ['page' => $page + 1])); ?>">Next »</a></li>
            <?php endif; ?>
        </ul>
    </div>
<?php endif; ?>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
