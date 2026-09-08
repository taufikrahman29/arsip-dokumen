<?php
/**
 * Admin - Edit Kategori
 */
require_once __DIR__ . '/../../config/auth.php';

require_admin();

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    set_flash('danger', 'ID Kategori tidak valid.');
    redirect(base_url('admin/kategori/index.php'));
}

$pdo = get_db_connection();
$stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
$stmt->execute([$id]);
$cat = $stmt->fetch();

if (!$cat) {
    set_flash('danger', 'Kategori tidak ditemukan.');
    redirect(base_url('admin/kategori/index.php'));
}

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_token();

    $nama_kategori = trim($_POST['nama_kategori'] ?? '');
    $deskripsi = trim($_POST['deskripsi'] ?? '');

    if (empty($nama_kategori)) {
        $errors[] = 'Nama kategori wajib diisi.';
    } else {
        $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE nama_kategori = ? AND id != ?");
        $stmt_check->execute([$nama_kategori, $id]);
        if ($stmt_check->fetchColumn() > 0) {
            $errors[] = 'Kategori dengan nama tersebut sudah ada.';
        }
    }

    if (empty($errors)) {
        $update = $pdo->prepare("UPDATE categories SET nama_kategori = ?, deskripsi = ? WHERE id = ?");
        $update->execute([$nama_kategori, $deskripsi ?: null, $id]);

        log_activity("Mengubah kategori dokumen \"$nama_kategori\"");
        set_flash('success', 'Kategori "' . sanitize($nama_kategori) . '" berhasil diperbarui.');
        redirect(base_url('admin/kategori/index.php'));
    }
}

// NOW render HTML view
$page_title = "Edit Kategori";
require_once __DIR__ . '/../includes/header.php';
?>

<div class="page-header">
    <div>
        <h1 class="page-title">Edit Kategori Dokumen</h1>
        <p class="page-subtitle">Ubah informasi nama dan deskripsi kategori</p>
    </div>
    <div>
        <a href="<?= base_url('admin/kategori/index.php'); ?>" class="btn btn-outline">
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
            <label class="form-label" for="nama_kategori">Nama Kategori *</label>
            <input type="text" name="nama_kategori" id="nama_kategori" class="form-control" value="<?= sanitize($cat['nama_kategori']); ?>" required>
        </div>

        <div class="form-group">
            <label class="form-label" for="deskripsi">Deskripsi Kategori</label>
            <textarea name="deskripsi" id="deskripsi" class="form-control"><?= sanitize($cat['deskripsi'] ?? ''); ?></textarea>
        </div>

        <div style="margin-top: 1.5rem; display: flex; gap: 10px;">
            <button type="submit" class="btn btn-gold">
                💾 PERBARUI KATEGORI
            </button>
            <a href="<?= base_url('admin/kategori/index.php'); ?>" class="btn btn-outline">
                Batal
            </a>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
