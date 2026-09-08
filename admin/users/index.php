<?php
$page_title = "Kelola Admin";
require_once __DIR__ . '/../includes/header.php';

$pdo = get_db_connection();
$users = $pdo->query("SELECT * FROM users ORDER BY created_at DESC")->fetchAll();
?>

<div class="page-header">
    <div>
        <h1 class="page-title">Kelola Pengguna Administrator</h1>
        <p class="page-subtitle">Daftar pengguna dan hak akses pengelolaan sistem arsip</p>
    </div>
    <div>
        <a href="<?= base_url('admin/users/tambah.php'); ?>" class="btn btn-gold">
            ➕ Tambah Admin
        </a>
    </div>
</div>

<div class="table-responsive">
    <table class="table">
        <thead>
            <tr>
                <th style="width: 50px;">No</th>
                <th>Nama Lengkap</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Tanggal Dibuat</th>
                <th style="width: 160px; text-align: center;">Aksi</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($users as $idx => $user): ?>
                <tr>
                    <td><?= $idx + 1; ?></td>
                    <td>
                        <strong><?= sanitize($user['nama']); ?></strong>
                    </td>
                    <td><code><?= sanitize($user['username']); ?></code></td>
                    <td>
                        <span class="badge badge-category" style="<?= $user['role'] === 'super_admin' ? 'background:#fef3c7; color:#92400e;' : ''; ?>">
                            <?= strtoupper(sanitize($user['role'])); ?>
                        </span>
                    </td>
                    <td>
                        <span class="badge <?= $user['status'] === 'aktif' ? 'badge-active' : 'badge-inactive'; ?>">
                            <?= strtoupper(sanitize($user['status'])); ?>
                        </span>
                    </td>
                    <td><?= format_date_id($user['created_at']); ?></td>
                    <td style="text-align: center;">
                        <div style="display: inline-flex; gap: 6px;">
                            <a href="<?= base_url('admin/users/edit.php?id=' . $user['id']); ?>" class="btn btn-outline btn-sm">
                                ✏️ Edit
                            </a>
                            <?php if ($user['id'] != $_SESSION['user_id']): ?>
                                <a href="<?= base_url('admin/users/hapus.php?id=' . $user['id']); ?>" class="btn btn-danger btn-sm btn-confirm-delete" data-confirm="Apakah Anda yakin ingin menghapus akun admin '<?= sanitize($user['username']); ?>'?">
                                    🗑️
                                </a>
                            <?php endif; ?>
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
