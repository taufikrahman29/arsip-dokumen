<?php
$page_title = "Log Aktivitas";
require_once __DIR__ . '/../includes/header.php';

$pdo = get_db_connection();

$search = trim($_GET['q'] ?? '');
$page = max(1, filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT) ?: 1);
$limit = 15;
$offset = ($page - 1) * $limit;

$where_sql = "";
$params = [];

if ($search !== '') {
    $where_sql = "WHERE (l.aktivitas LIKE ? OR u.nama LIKE ? OR l.ip_address LIKE ?)";
    $params = ["%$search%", "%$search%", "%$search%"];
}

// Count total logs
$count_stmt = $pdo->prepare("SELECT COUNT(*) FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id $where_sql");
$count_stmt->execute($params);
$total_rows = $count_stmt->fetchColumn();
$total_pages = ceil($total_rows / $limit);

// Fetch logs
$sql = "
    SELECT l.*, u.nama AS nama_user, u.username 
    FROM activity_logs l 
    LEFT JOIN users u ON l.user_id = u.id 
    $where_sql 
    ORDER BY l.created_at DESC 
    LIMIT $limit OFFSET $offset
";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$logs = $stmt->fetchAll();
?>

<div class="page-header">
    <div>
        <h1 class="page-title">Log Aktivitas Sistem</h1>
        <p class="page-subtitle">Catatan rekam jejak aktivitas pengoperasian, audit trail, dan aksi admin</p>
    </div>
</div>

<!-- Search Bar -->
<div class="toolbar-card">
    <form method="GET" action="index.php" class="search-form">
        <input type="text" name="q" class="input-search" placeholder="Cari aktivitas, nama admin, atau IP Address..." value="<?= sanitize($search); ?>">
        <button type="submit" class="btn btn-primary">🔍 Cari Log</button>
        <?php if ($search): ?>
            <a href="index.php" class="btn btn-outline">Reset</a>
        <?php endif; ?>
    </form>
</div>

<!-- Table -->
<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <th style="width: 50px;">No</th>
                <th>Pengguna / Admin</th>
                <th>Deskripsi Aktivitas</th>
                <th>IP Address</th>
                <th>Tanggal & Waktu</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($logs)): ?>
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2.5rem; color: #64748b;">
                        Belum ada catatan log aktivitas yang terekam.
                    </td>
                </tr>
            <?php else: ?>
                <?php foreach ($logs as $idx => $log): ?>
                    <tr>
                        <td><?= $offset + $idx + 1; ?></td>
                        <td>
                            <?php if ($log['nama_user']): ?>
                                <strong><?= sanitize($log['nama_user']); ?></strong>
                                <br><small style="color: #64748b;">@<?= sanitize($log['username']); ?></small>
                            <?php else: ?>
                                <span style="color: #64748b; font-style: italic;">Pengunjung / Sistem</span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <div style="font-weight: 600; color: var(--primary-navy);">
                                <?= sanitize($log['aktivitas']); ?>
                            </div>
                            <?php if ($log['user_agent']): ?>
                                <small style="color: #94a3b8; font-size: 0.75rem; display: block; max-width: 450px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    UA: <?= sanitize($log['user_agent']); ?>
                                </small>
                            <?php endif; ?>
                        </td>
                        <td><code><?= sanitize($log['ip_address'] ?: '127.0.0.1'); ?></code></td>
                        <td><?= format_date_id($log['created_at'], true); ?></td>
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
            Menampilkan <?= count($logs); ?> dari total <?= $total_rows; ?> catatan log
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
