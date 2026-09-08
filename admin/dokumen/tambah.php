<?php
/**
 * Admin - Tambah Dokumen Baru
 */
require_once __DIR__ . '/../../config/auth.php';

require_admin();

$pdo = get_db_connection();
$categories = $pdo->query("SELECT * FROM categories ORDER BY nama_kategori ASC")->fetchAll();

$errors = [];
$nama_dokumen = '';
$nomor_dokumen = '';
$kategori_id = '';
$tanggal_dokumen = date('Y-m-d');
$deskripsi = '';

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
    if (empty($_FILES['file_dokumen']['name'])) {
        $errors[] = 'File Dokumen wajib diunggah.';
    } else {
        $file = $_FILES['file_dokumen'];
        $allowed_exts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];
        $max_bytes = 10 * 1024 * 1024;

        $original_filename = $file['name'];
        $file_size = $file['size'];
        $tmp_path = $file['tmp_name'];
        $ext = strtolower(pathinfo($original_filename, PATHINFO_EXTENSION));

        if (in_array($ext, ['php', 'phtml', 'php3', 'php4', 'php5', 'phps', 'cgi', 'exe', 'bat', 'sh', 'pl', 'js', 'html', 'htm'])) {
            $errors[] = 'Format file tidak diperbolehkan demi keamanan sistem!';
        } elseif (!in_array($ext, $allowed_exts)) {
            $errors[] = 'Ekstensi file .' . $ext . ' tidak diperbolehkan. Hanya PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG.';
        }

        if ($file_size > $max_bytes) {
            $errors[] = 'Ukuran file melebihi batas maksimal 10 MB.';
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
            }
        }
    }

    if (empty($errors)) {
        try {
            $upload_dir = __DIR__ . '/../../uploads/dokumen/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }

            $server_filename = 'dok_' . bin2hex(random_bytes(12)) . '.' . $ext;
            $target_filepath = $upload_dir . $server_filename;
            $db_path = 'uploads/dokumen/' . $server_filename;

            if (move_uploaded_file($tmp_path, $target_filepath)) {
                $stmt = $pdo->prepare("
                    INSERT INTO documents (
                        nama_dokumen, nomor_dokumen, kategori_id, tanggal_dokumen, 
                        tanggal_upload, deskripsi, nama_file_asli, nama_file_server, 
                        path_file, ekstensi_file, mime_type, ukuran_file, uploaded_by
                    ) VALUES (
                        ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?
                    )
                ");

                $stmt->execute([
                    $nama_dokumen,
                    $nomor_dokumen ?: null,
                    $kategori_id,
                    $tanggal_dokumen ?: null,
                    $deskripsi ?: null,
                    $original_filename,
                    $server_filename,
                    $db_path,
                    $ext,
                    $mime_type ?? 'application/octet-stream',
                    $file_size,
                    $_SESSION['user_id']
                ]);

                $doc_id = $pdo->lastInsertId();
                log_activity("Menambahkan dokumen baru \"$nama_dokumen\"", $doc_id);

                set_flash('success', 'UPLOAD BERHASIL! Dokumen "' . sanitize($nama_dokumen) . '" berhasil disimpan.');
                redirect(base_url('admin/dokumen/index.php'));
            } else {
                $errors[] = 'Gagal memindahkan file yang diunggah ke folder server.';
            }
        } catch (Exception $e) {
            $errors[] = 'Terjadi kesalahan sistem: ' . $e->getMessage();
        }
    }
}

// NOW render HTML views after processing and potential redirects
$page_title = "Tambah Dokumen";
require_once __DIR__ . '/../includes/header.php';
?>

<div class="page-header">
    <div>
        <h1 class="page-title">Tambah Dokumen Baru</h1>
        <p class="page-subtitle">Unggah berkas dokumen resmi baru ke dalam sistem arsip</p>
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
    <form method="POST" action="tambah.php" enctype="multipart/form-data">
        <?= csrf_field(); ?>

        <div class="form-group">
            <label class="form-label" for="nama_dokumen">Nama Dokumen *</label>
            <input type="text" name="nama_dokumen" id="nama_dokumen" class="form-control" placeholder="Contoh: PERJANJIAN KERJA TAHUN 2025" value="<?= sanitize($nama_dokumen); ?>" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
                <label class="form-label" for="nomor_dokumen">Nomor Dokumen (Opsional)</label>
                <input type="text" name="nomor_dokumen" id="nomor_dokumen" class="form-control" placeholder="Contoh: W11.PAS.PAS.01.01-2025/001" value="<?= sanitize($nomor_dokumen); ?>">
            </div>

            <div class="form-group">
                <label class="form-label" for="kategori_id">Kategori Dokumen *</label>
                <select name="kategori_id" id="kategori_id" class="form-control" required>
                    <option value="">-- Pilih Kategori --</option>
                    <?php foreach ($categories as $cat): ?>
                        <option value="<?= $cat['id']; ?>" <?= $kategori_id == $cat['id'] ? 'selected' : ''; ?>>
                            <?= sanitize($cat['nama_kategori']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label" for="tanggal_dokumen">Tanggal Dokumen</label>
            <input type="date" name="tanggal_dokumen" id="tanggal_dokumen" class="form-control" value="<?= sanitize($tanggal_dokumen); ?>">
        </div>

        <div class="form-group">
            <label class="form-label" for="deskripsi">Deskripsi Ringkas Dokumen</label>
            <textarea name="deskripsi" id="deskripsi" class="form-control" placeholder="Tuliskan catatan atau deskripsi singkat dokumen..."><?= sanitize($deskripsi); ?></textarea>
        </div>

        <div class="form-group">
            <label class="form-label">File Dokumen *</label>
            <div class="file-upload-box" id="fileUploadBox" onclick="document.getElementById('fileInput').click();">
                <div class="file-upload-icon">📁</div>
                <div style="font-weight: 700; color: var(--primary-navy);">Klik atau Tarik File ke Sini untuk Mengunggah</div>
                <div class="form-text" style="margin-top: 6px;">
                    Format yang diperbolehkan: <strong>PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG</strong><br>
                    Ukuran Maksimal: <strong>10 MB</strong>
                </div>
                <div id="fileNameDisplay" style="margin-top: 10px; font-weight: 600;"></div>
            </div>
            <input type="file" name="file_dokumen" id="fileInput" style="display: none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" required>
        </div>

        <div style="margin-top: 2rem; display: flex; gap: 10px;">
            <button type="submit" class="btn btn-gold" style="padding: 0.8rem 2rem;">
                💾 SIMPAN DOKUMEN
            </button>
            <a href="<?= base_url('admin/dokumen/index.php'); ?>" class="btn btn-outline">
                Batal
            </a>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
