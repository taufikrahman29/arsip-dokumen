<?php
/**
 * Admin - Edit Admin User
 */
require_once __DIR__ . '/../../config/auth.php';

require_admin();

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    set_flash('danger', 'ID User tidak valid.');
    redirect(base_url('admin/users/index.php'));
}

$pdo = get_db_connection();
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$id]);
$user = $stmt->fetch();

if (!$user) {
    set_flash('danger', 'User tidak ditemukan.');
    redirect(base_url('admin/users/index.php'));
}

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_token();

    $nama = trim($_POST['nama'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'admin';
    $status = $_POST['status'] ?? 'aktif';

    if (empty($nama)) $errors[] = 'Nama lengkap wajib diisi.';
    if (empty($username)) $errors[] = 'Username wajib diisi.';

    if (empty($errors)) {
        $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? AND id != ?");
        $stmt_check->execute([$username, $id]);
        if ($stmt_check->fetchColumn() > 0) {
            $errors[] = 'Username sudah digunakan oleh akun lain.';
        }
    }

    if (empty($errors)) {
        if (!empty($password)) {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $update = $pdo->prepare("UPDATE users SET nama = ?, username = ?, password = ?, role = ?, status = ? WHERE id = ?");
            $update->execute([$nama, $username, $hashed_password, $role, $status, $id]);
        } else {
            $update = $pdo->prepare("UPDATE users SET nama = ?, username = ?, role = ?, status = ? WHERE id = ?");
            $update->execute([$nama, $username, $role, $status, $id]);
        }

        log_activity("Mengubah akun administrator \"$username\"");
        set_flash('success', 'Akun admin "' . sanitize($username) . '" berhasil diperbarui.');
        redirect(base_url('admin/users/index.php'));
    }
}

// NOW render HTML view
$page_title = "Edit Admin";
require_once __DIR__ . '/../includes/header.php';
?>

<div class="page-header">
    <div>
        <h1 class="page-title">Edit Admin</h1>
        <p class="page-subtitle">Ubah informasi akun administrator</p>
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
    <form method="POST" action="edit.php?id=<?= $id; ?>">
        <?= csrf_field(); ?>

        <div class="form-group">
            <label class="form-label" for="nama">Nama Lengkap *</label>
            <input type="text" name="nama" id="nama" class="form-control" value="<?= sanitize($user['nama']); ?>" required>
        </div>

        <div class="form-group">
            <label class="form-label" for="username">Username *</label>
            <input type="text" name="username" id="username" class="form-control" value="<?= sanitize($user['username']); ?>" required>
        </div>

        <div class="form-group">
            <label class="form-label" for="password">Password (Kosongkan jika tidak diubah)</label>
            <input type="password" name="password" id="password" class="form-control" placeholder="Ketik password baru jika ingin mengubah">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
                <label class="form-label" for="role">Role / Peran</label>
                <select name="role" id="role" class="form-control">
                    <option value="admin" <?= $user['role'] === 'admin' ? 'selected' : ''; ?>>Admin (Pengelola)</option>
                    <option value="super_admin" <?= $user['role'] === 'super_admin' ? 'selected' : ''; ?>>Super Admin</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label" for="status">Status Akun</label>
                <select name="status" id="status" class="form-control">
                    <option value="aktif" <?= $user['status'] === 'aktif' ? 'selected' : ''; ?>>Aktif</option>
                    <option value="nonaktif" <?= $user['status'] === 'nonaktif' ? 'selected' : ''; ?>>Nonaktif</option>
                </select>
            </div>
        </div>

        <div style="margin-top: 1.5rem; display: flex; gap: 10px;">
            <button type="submit" class="btn btn-gold">
                💾 PERBARUI ADMIN
            </button>
            <a href="<?= base_url('admin/users/index.php'); ?>" class="btn btn-outline">
                Batal
            </a>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
