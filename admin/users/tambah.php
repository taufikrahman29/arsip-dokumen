<?php
/**
 * Admin - Tambah Admin Baru
 */
require_once __DIR__ . '/../../config/auth.php';

require_admin();

$pdo = get_db_connection();
$errors = [];
$nama = '';
$username = '';
$role = 'admin';
$status = 'aktif';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_token();

    $nama = trim($_POST['nama'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'admin';
    $status = $_POST['status'] ?? 'aktif';

    if (empty($nama)) $errors[] = 'Nama lengkap wajib diisi.';
    if (empty($username)) $errors[] = 'Username wajib diisi.';
    if (empty($password)) $errors[] = 'Password wajib diisi.';

    if (empty($errors)) {
        $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
        $stmt_check->execute([$username]);
        if ($stmt_check->fetchColumn() > 0) {
            $errors[] = 'Username sudah digunakan oleh akun lain.';
        }
    }

    if (empty($errors)) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (nama, username, password, role, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$nama, $username, $hashed_password, $role, $status]);

        log_activity("Menambahkan akun administrator baru \"$username\"");
        set_flash('success', 'Akun admin "' . sanitize($username) . '" berhasil dibuat.');
        redirect(base_url('admin/users/index.php'));
    }
}

// NOW render HTML view
$page_title = "Tambah Admin";
require_once __DIR__ . '/../includes/header.php';
?>

<div class="page-header">
    <div>
        <h1 class="page-title">Tambah Admin Baru</h1>
        <p class="page-subtitle">Buat akun pengguna baru untuk mengelola sistem arsip</p>
    </div>
    <div>
        <a href="<?= base_url('admin/users/index.php'); ?>" class="btn btn-outline">
            ← Kembali
        </a>
    </div>
</div>

<?php if (!empty($errors)): ?>
    <div class="alert alert-danger">
        <ul style="margin-left: 1.2rem;">
            <?php foreach ($errors as $err): ?>
                <li><?= sanitize($err); ?></li>
            <?php endforeach; ?>
        </ul>
    </div>
<?php endif; ?>

<div class="form-card" style="max-width: 600px;">
    <form method="POST" action="tambah.php">
        <?= csrf_field(); ?>

        <div class="form-group">
            <label class="form-label" for="nama">Nama Lengkap *</label>
            <input type="text" name="nama" id="nama" class="form-control" placeholder="Contoh: Ahmad Subagyo" value="<?= sanitize($nama); ?>" required autofocus>
        </div>

        <div class="form-group">
            <label class="form-label" for="username">Username *</label>
            <input type="text" name="username" id="username" class="form-control" placeholder="Contoh: ahmad_admin" value="<?= sanitize($username); ?>" required>
        </div>

        <div class="form-group">
            <label class="form-label" for="password">Password *</label>
            <input type="password" name="password" id="password" class="form-control" placeholder="Masukkan password" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
                <label class="form-label" for="role">Role / Peran</label>
                <select name="role" id="role" class="form-control">
                    <option value="admin" <?= $role === 'admin' ? 'selected' : ''; ?>>Admin (Pengelola)</option>
                    <option value="super_admin" <?= $role === 'super_admin' ? 'selected' : ''; ?>>Super Admin</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label" for="status">Status Akun</label>
                <select name="status" id="status" class="form-control">
                    <option value="aktif" <?= $status === 'aktif' ? 'selected' : ''; ?>>Aktif</option>
                    <option value="nonaktif" <?= $status === 'nonaktif' ? 'selected' : ''; ?>>Nonaktif</option>
                </select>
            </div>
        </div>

        <div style="margin-top: 1.5rem; display: flex; gap: 10px;">
            <button type="submit" class="btn btn-gold">
                💾 SIMPAN ADMIN
            </button>
            <a href="<?= base_url('admin/users/index.php'); ?>" class="btn btn-outline">
                Batal
            </a>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
