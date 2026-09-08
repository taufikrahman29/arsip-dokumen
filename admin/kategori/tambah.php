<?php
/**
 * Admin - Tambah Kategori
 */
require_once __DIR__ . '/../../config/auth.php';

require_admin();

$pdo = get_db_connection();
$errors = [];
$nama_kategori = '';
$deskripsi = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_token();

    $nama_kategori = trim($_POST['nama_kategori'] ?? '');
    $deskripsi = trim($_POST['deskripsi'] ?? '');

    if (empty($nama_kategori)) {
        $errors[] = 'Nama kategori wajib diisi.';
    } else {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE nama_kategori = ?");
        $stmt->execute([$nama_kategori]);
        if ($stmt->fetchColumn() > 0) {
            $errors[] = 'Kategori dengan nama tersebut sudah ada.';
        }
    }

    if (empty($errors)) {
        $stmt = $pdo->prepare("INSERT INTO categories (nama_kategori, deskripsi) VALUES (?, ?)");
        $stmt->execute([$nama_kategori, $deskripsi ?: null]);

        log_activity("Menambahkan kategori dokumen \"$nama_kategori\"");
        set_flash('success', 'Kategori "' . sanitize($nama_kategori) . '" berhasil ditambahkan.');
        redirect(base_url('admin/kategori/index.php'));
    }
}

// NOW render HTML views
$page_title = "Tambah Kategori";
require_once __DIR__ . '/../includes/header.php';
?>

<div class="page-header">
    <div>
        <h1 class="page-title">Tambah Kategori Dokumen</h1>
        <p class="page-subtitle">Buat kelompok kategori baru untuk klasifikasi dokumen</p>
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
    <form method="POST" action="tambah.php">
        <?= csrf_field(); ?>

        <div class="form-group">
            <label class="form-label" for="nama_kategori">Nama Kategori *</label>
            <input type="text" name="nama_kategori" id="nama_kategori" class="form-control" placeholder="Contoh: Nota Dinas" value="<?= sanitize($nama_kategori); ?>" required autofocus>
        </div>

        <div class="form-group">
            <label class="form-label" for="deskripsi">Deskripsi Kategori</label>
            <textarea name="deskripsi" id="deskripsi" class="form-control" placeholder="Keterangan singkat kategori..."><?= sanitize($deskripsi); ?></textarea>
        </div>

        <div style="margin-top: 1.5rem; display: flex; gap: 10px;">
            <button type="submit" class="btn btn-gold">
                💾 SIMPAN KATEGORI
            </button>
            <a href="<?= base_url('admin/kategori/index.php'); ?>" class="btn btn-outline">
                Batal
            </a>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
