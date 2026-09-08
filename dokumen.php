<?php
$page_title = "Dokumen Resmi";
require_once __DIR__ . '/includes/header.php';

$pdo = get_db_connection();

// Fetch categories for filter dropdown
$categories = $pdo->query("SELECT * FROM categories ORDER BY nama_kategori ASC")->fetchAll();

// Search & Filter Parameters
$search = trim($_GET['q'] ?? '');
$cat_id = filter_input(INPUT_GET, 'kategori', FILTER_VALIDATE_INT);
$sort = $_GET['sort'] ?? 'terbaru';
$page = max(1, filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT) ?: 1);
$limit = 10;
$offset = ($page - 1) * $limit;

// Build SQL Query
$where_clauses = [];
$params = [];

if ($search !== '') {
    $where_clauses[] = "(d.nama_dokumen LIKE ? OR d.nomor_dokumen LIKE ? OR d.deskripsi LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if ($cat_id) {
    $where_clauses[] = "d.kategori_id = ?";
    $params[] = $cat_id;
}

$where_sql = !empty($where_clauses) ? "WHERE " . implode(" AND ", $where_clauses) : "";

// Sorting SQL
switch ($sort) {
    case 'terlama':
        $order_sql = "ORDER BY d.created_at ASC";
        break;
    case 'az':
        $order_sql = "ORDER BY d.nama_dokumen ASC";
        break;
    case 'za':
        $order_sql = "ORDER BY d.nama_dokumen DESC";
        break;
    case 'terbaru':
    default:
        $order_sql = "ORDER BY d.created_at DESC";
        break;
}

// Count total matching records
$count_stmt = $pdo->prepare("SELECT COUNT(*) FROM documents d $where_sql");
$count_stmt->execute($params);
$total_rows = $count_stmt->fetchColumn();
$total_pages = ceil($total_rows / $limit);

// Fetch Paginated Documents
$sql = "
    SELECT d.*, c.nama_kategori 
    FROM documents d 
    LEFT JOIN categories c ON d.kategori_id = c.id 
    $where_sql 
    $order_sql 
    LIMIT $limit OFFSET $offset
";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$documents = $stmt->fetchAll();
?>

<main class="main-container">
    <div class="page-header">
        <div>
            <h1 class="page-title">Dokumen Resmi</h1>
            <p class="page-subtitle">Arsip pengelolaan dan penyimpanan dokumen publik Lapas Kelas IIA Bekasi</p>
        </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="toolbar-card">
        <form method="GET" action="dokumen.php" class="search-form">
            <input type="text" name="q" class="input-search" placeholder="Cari nama atau nomor dokumen..." value="<?= sanitize($search); ?>">
            <button type="submit" class="btn btn-primary">🔍 Cari</button>
            <?php if ($search || $cat_id || $sort !== 'terbaru'): ?>
                <a href="dokumen.php" class="btn btn-outline">Reset Filter</a>
            <?php endif; ?>
        </form>

        <div class="filter-group">
            <!-- Filter Kategori -->
            <form method="GET" action="dokumen.php" style="display: inline-flex; gap: 8px;">
                <?php if ($search): ?><input type="hidden" name="q" value="<?= sanitize($search); ?>"><?php endif; ?>
                <?php if ($sort): ?><input type="hidden" name="sort" value="<?= sanitize($sort); ?>"><?php endif; ?>
                
                <select name="kategori" class="select-filter" onchange="this.form.submit()">
                    <option value="">-- Semua Kategori --</option>
                    <?php foreach ($categories as $cat): ?>
                        <option value="<?= $cat['id']; ?>" <?= $cat_id == $cat['id'] ? 'selected' : ''; ?>>
                            <?= sanitize($cat['nama_kategori']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </form>

            <!-- Sorting -->
            <form method="GET" action="dokumen.php" style="display: inline-flex; gap: 8px;">
                <?php if ($search): ?><input type="hidden" name="q" value="<?= sanitize($search); ?>"><?php endif; ?>
                <?php if ($cat_id): ?><input type="hidden" name="kategori" value="<?= $cat_id; ?>"><?php endif; ?>

                <select name="sort" class="select-filter" onchange="this.form.submit()">
                    <option value="terbaru" <?= $sort === 'terbaru' ? 'selected' : ''; ?>>Urutkan: Terbaru</option>
                    <option value="terlama" <?= $sort === 'terlama' ? 'selected' : ''; ?>>Urutkan: Terlama</option>
                    <option value="az" <?= $sort === 'az' ? 'selected' : ''; ?>>Nama (A-Z)</option>
                    <option value="za" <?= $sort === 'za' ? 'selected' : ''; ?>>Nama (Z-A)</option>
                </select>
            </form>
        </div>
    </div>

    <!-- Document Data Table -->
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th style="width: 50px;">No</th>
                    <th>Nama Dokumen</th>
                    <th>Kategori</th>
                    <th>Tanggal Upload</th>
                    <th>File</th>
                    <th style="width: 170px; text-align: center;">Aksi</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($documents)): ?>
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2.5rem; color: #64748b;">
                            Tidak ada dokumen yang ditemukan.
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($documents as $index => $doc): ?>
                        <tr>
                            <td><?= $offset + $index + 1; ?></td>
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

    <!-- Pagination -->
    <?php if ($total_pages > 1): ?>
        <div class="pagination-wrapper">
            <div style="font-size: 0.9rem; color: #64748b;">
                Menampilkan <?= count($documents); ?> dari total <?= $total_rows; ?> dokumen
            </div>
            <ul class="pagination">
                <?php if ($page > 1): ?>
                    <li>
                        <a href="?<?= http_build_query(array_merge($_GET, ['page' => $page - 1])); ?>">« Prev</a>
                    </li>
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
                    <li>
                        <a href="?<?= http_build_query(array_merge($_GET, ['page' => $page + 1])); ?>">Next »</a>
                    </li>
                <?php endif; ?>
            </ul>
        </div>
    <?php endif; ?>
</main>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
