<?php
/**
 * Admin - Edit Dokumen
 */
require_once __DIR__ . '/../../config/auth.php';

require_admin();

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    set_flash('danger', 'ID Dokumen tidak valid.');
    redirect(base_url('admin/dokumen/index.php'));
}

$pdo = get_db_connection();
$stmt = $pdo->prepare("SELECT * FROM documents WHERE id = ?");
$stmt->execute([$id]);
$doc = $stmt->fetch();

if (!$doc) {
    set_flash('danger', 'Dokumen tidak ditemukan.');
    redirect(base_url('admin/dokumen/index.php'));
}

$categories = $pdo->query("SELECT * FROM categories ORDER BY nama_kategori ASC")->fetchAll();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_token();

    $nama_dokumen = trim($_POST['nama_dokumen'] ?? '');
    $nomor_dokumen = trim($_POST['nomor_dokumen'] ?? '');
    $kategori_id = filter_input(INPUT_POST, 'kategori_id', FILTER_VALIDATE_INT);
    $tanggal_dokumen = trim($_POST['tanggal_dokumen'] ?? '');
    $deskripsi = trim($_POST['deskripsi'] ?? '');

    if (empty($nama_dokumen)) {
        $errors[] = 'Nama Dokumen wajib diisi.';
    }
    if (!$kategori_id) {
        $errors[] = 'Kategori wajib dipilih.';
    }

    $file_changed = false;
    $new_file_asli = $doc['nama_file_asli'];
    $new_file_server = $doc['nama_file_server'];
    $new_path_file = $doc['path_file'];
    $new_ext = $doc['ekstensi_file'];
    $new_mime = $doc['mime_type'];
    $new_size = $doc['ukuran_file'];

    if (!empty($_FILES['file_dokumen']['name'])) {
        $file = $_FILES['file_dokumen'];
        $allowed_exts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];
        $max_bytes = 10 * 1024 * 1024;

        $original_filename = $file['name'];
        $file_size = $file['size'];
        $tmp_path = $file['tmp_name'];
        $ext = strtolower(pathinfo($original_filename, PATHINFO_EXTENSION));

        if (in_array($ext, ['php', 'phtml', 'php3', 'php4', 'php5', 'phps', 'cgi', 'exe', 'bat', 'sh', 'pl', 'js', 'html', 'htm'])) {
            $errors[] = 'Format file pengganti tidak diperbolehkan!';
        } elseif (!in_array($ext, $allowed_exts)) {
            $errors[] = 'Ekstensi file .' . $ext . ' tidak diperbolehkan.';
        }

        if ($file_size > $max_bytes) {
            $errors[] = 'Ukuran file pengganti melebihi batas 10 MB.';
        }

        if (empty($errors) && file_exists($tmp_path)) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime_type = finfo_file($finfo, $tmp_path);
            finfo_close($finfo);

            $allowed_mimes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'image/jpeg',
                'image/png',
                'application/octet-stream',
                'application/zip'
            ];

            if (!in_array($mime_type, $allowed_mimes)) {
                $errors[] = "Tipe MIME file ($mime_type) tidak valid!";
            } else {
                $file_changed = true;
                $new_file_asli = $original_filename;
                $new_ext = $ext;
                $new_mime = $mime_type;
                $new_size = $file_size;
                $new_file_server = 'dok_' . bin2hex(random_bytes(12)) . '.' . $ext;
                $new_path_file = 'uploads/dokumen/' . $new_file_server;
            }
        }
    }

    if (empty($errors)) {
        try {
            if ($file_changed) {
                $old_physical_path = __DIR__ . '/../../' . ltrim($doc['path_file'], '/');
                if (file_exists($old_physical_path)) {
                    @unlink($old_physical_path);
                }

                $target_path = __DIR__ . '/../../uploads/dokumen/' . $new_file_server;
                if (!move_uploaded_file($file['tmp_name'], $target_path)) {
                    throw new Exception('Gagal menyimpan file baru ke folder uploads.');
                }
            }

            $update_stmt = $pdo->prepare("
                UPDATE documents SET 
                    nama_dokumen = ?,
                    nomor_dokumen = ?,
                    kategori_id = ?,
                    tanggal_dokumen = ?,
                    deskripsi = ?,
                    nama_file_asli = ?,
                    nama_file_server = ?,
                    path_file = ?,
                    ekstensi_file = ?,
                    mime_type = ?,
                    ukuran_file = ?
                WHERE id = ?
            ");

            $update_stmt->execute([
                $nama_dokumen,
                $nomor_dokumen ?: null,
                $kategori_id,
                $tanggal_dokumen ?: null,
                $deskripsi ?: null,
                $new_file_asli,
                $new_file_server,
                $new_path_file,
                $new_ext,
                $new_mime,
                $new_size,
                $id
            ]);

            log_activity("Mengubah data dokumen \"$nama_dokumen\"", $id);

            set_flash('success', 'Dokumen "' . sanitize($nama_dokumen) . '" berhasil diperbarui.');
            redirect(base_url('admin/dokumen/index.php'));
        } catch (Exception $e) {
            $errors[] = 'Terjadi kesalahan: ' . $e->getMessage();
        }
    }
}

// NOW render HTML views after processing and potential redirects
$page_title = "Edit Dokumen";
require_once __DIR__ . '/../includes/header.php';
?>

<div class="page-header">
    <div>
        <h1 class="page-title">Edit Dokumen</h1>
        <p class="page-subtitle">Perbarui informasi metadata dan file dokumen</p>
    </div>
    <div>
        <a href="<?= base_url('admin/dokumen/index.php'); ?>" class="btn btn-outline">
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

<div class="form-card">
    <form method="POST" action="edit.php?id=<?= $id; ?>" enctype="multipart/form-data">
        <?= csrf_field(); ?>

        <div class="form-group">
            <label class="form-label" for="nama_dokumen">Nama Dokumen *</label>
            <input type="text" name="nama_dokumen" id="nama_dokumen" class="form-control" value="<?= sanitize($doc['nama_dokumen']); ?>" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
                <label class="form-label" for="nomor_dokumen">Nomor Dokumen</label>
                <input type="text" name="nomor_dokumen" id="nomor_dokumen" class="form-control" value="<?= sanitize($doc['nomor_dokumen'] ?? ''); ?>">
            </div>

            <div class="form-group">
                <label class="form-label" for="kategori_id">Kategori Dokumen *</label>
                <select name="kategori_id" id="kategori_id" class="form-control" required>
                    <?php foreach ($categories as $cat): ?>
                        <option value="<?= $cat['id']; ?>" <?= $doc['kategori_id'] == $cat['id'] ? 'selected' : ''; ?>>
                            <?= sanitize($cat['nama_kategori']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label" for="tanggal_dokumen">Tanggal Dokumen</label>
            <input type="date" name="tanggal_dokumen" id="tanggal_dokumen" class="form-control" value="<?= sanitize($doc['tanggal_dokumen'] ?? ''); ?>">
        </div>

        <div class="form-group">
            <label class="form-label" for="deskripsi">Deskripsi Dokumen</label>
            <textarea name="deskripsi" id="deskripsi" class="form-control"><?= sanitize($doc['deskripsi'] ?? ''); ?></textarea>
        </div>

        <div class="form-group">
            <label class="form-label">File Dokumen Saat Ini</label>
            <div style="padding: 10px 14px; background: #f1f5f9; border-radius: var(--radius-sm); font-size: 0.9rem; margin-bottom: 12px;">
                📄 <strong><?= sanitize($doc['nama_file_asli']); ?></strong> (<?= format_bytes($doc['ukuran_file']); ?>)
            </div>

            <label class="form-label">Ganti File Dokumen (Kosongkan jika tidak ingin mengubah file)</label>
            <div class="file-upload-box" id="fileUploadBox" onclick="document.getElementById('fileInput').click();">
                <div class="file-upload-icon">🔄</div>
                <div style="font-weight: 700; color: var(--primary-navy);">Klik atau Tarik File Baru untuk Menggantikan File Lama</div>
                <div id="fileNameDisplay" style="margin-top: 10px; font-weight: 600;"></div>
            </div>
            <input type="file" name="file_dokumen" id="fileInput" style="display: none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png">
        </div>

        <div style="margin-top: 2rem; display: flex; gap: 10px;">
            <button type="submit" class="btn btn-gold" style="padding: 0.8rem 2rem;">
                💾 PERBARUI DOKUMEN
            </button>
            <a href="<?= base_url('admin/dokumen/index.php'); ?>" class="btn btn-outline">
                Batal
            </a>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
