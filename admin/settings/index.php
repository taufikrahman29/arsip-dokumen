<?php
/**
 * Admin - Pengaturan Website & Logo
 */
require_once __DIR__ . '/../../config/auth.php';

require_admin();

$pdo = get_db_connection();
$errors = [];

function save_setting_key($key, $value) {
    $pdo = get_db_connection();
    $stmt = $pdo->prepare("
        INSERT INTO settings (setting_key, setting_value) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ");
    $stmt->execute([$key, $value]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_token();

    $text_keys = [
        'app_name', 'app_subname', 'hero_title', 'hero_subtitle', 
        'hero_tagline_title', 'hero_tagline_sub', 'profil_lapas', 
        'tugas_fungsi', 'visi_misi'
    ];

    foreach ($text_keys as $key) {
        if (isset($_POST[$key])) {
            save_setting_key($key, trim($_POST[$key]));
        }
    }

    $upload_dir = __DIR__ . '/../../uploads/settings/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $image_fields = [
        'site_logo_file' => 'site_logo',
        'hero_bg_file'   => 'hero_bg',
        'hero_logo_file' => 'hero_logo'
    ];

    $allowed_exts = ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'];

    foreach ($image_fields as $field_name => $setting_key) {
        if (!empty($_FILES[$field_name]['name'])) {
            $file = $_FILES[$field_name];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

            if (!in_array($ext, $allowed_exts)) {
                $errors[] = "Ekstensi file untuk " . str_replace('_', ' ', $setting_key) . " tidak diperbolehkan (hanya JPG, PNG, SVG, WEBP).";
            } elseif ($file['size'] > 5 * 1024 * 1024) {
                $errors[] = "Ukuran file " . str_replace('_', ' ', $setting_key) . " melebihi batas 5 MB.";
            } else {
                $new_filename = $setting_key . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
                $target_path = $upload_dir . $new_filename;
                $db_relative_path = 'uploads/settings/' . $new_filename;

                if (move_uploaded_file($file['tmp_name'], $target_path)) {
                    $old_file = get_setting($setting_key);
                    if ($old_file) {
                        $old_path = __DIR__ . '/../../' . ltrim($old_file, '/');
                        if (file_exists($old_path)) {
                            @unlink($old_path);
                        }
                    }
                    save_setting_key($setting_key, $db_relative_path);
                } else {
                    $errors[] = "Gagal mengunggah gambar " . $setting_key;
                }
            }
        }
    }

    if (empty($errors)) {
        log_activity("Perbarui Pengaturan Website & Upload Logo/Foto");
        set_flash('success', 'Pengaturan website, logo, dan foto berhasil diperbarui.');
        redirect(base_url('admin/settings/index.php'));
    }
}

// NOW render HTML views after all processing and potential redirects
$page_title = "Pengaturan Logo & Instansi";
require_once __DIR__ . '/../includes/header.php';

$settings = get_all_settings();
?>

<div class="page-header">
    <div>
        <h1 class="page-title">Pengaturan Logo, Hero & Instansi</h1>
        <p class="page-subtitle">Kelola foto logo, background hero, teks tagline, dan profil lembaga</p>
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

<form method="POST" action="index.php" enctype="multipart/form-data">
    <?= csrf_field(); ?>

    <!-- CARD 1: LOGO & FOTO HERO -->
    <div class="form-card" style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.15rem; color: var(--primary-navy); margin-bottom: 1.2rem; display: flex; align-items: center; gap: 8px;">
            🖼️ Upload Logo & Gambar Header/Hero
        </h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
            <!-- Logo Instansi Header -->
            <div style="background: #f8fafc; padding: 1.2rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <label class="form-label">Logo Instansi (Navbar Header)</label>
                <?php $site_logo = get_setting('site_logo'); ?>
                <?php if ($site_logo): ?>
                    <div style="margin-bottom: 10px; background: #0f2c59; padding: 10px; border-radius: 6px; display: inline-block;">
                        <img src="<?= base_url($site_logo); ?>" alt="Logo Instansi" style="max-height: 50px; max-width: 100%;">
                    </div>
                <?php else: ?>
                    <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 8px;">Standard Default SVG Logo Digunakan</p>
                <?php endif; ?>
                <input type="file" name="site_logo_file" class="form-control" accept="image/*">
                <small class="form-text">Format: PNG, SVG, JPG. Maks 5MB.</small>
            </div>

            <!-- Logo / Emblem Hero Banner -->
            <div style="background: #f8fafc; padding: 1.2rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <label class="form-label">Logo / Emblem Hero (Banner)</label>
                <?php $hero_logo = get_setting('hero_logo'); ?>
                <?php if ($hero_logo): ?>
                    <div style="margin-bottom: 10px; background: #0f2c59; padding: 10px; border-radius: 6px; display: inline-block;">
                        <img src="<?= base_url($hero_logo); ?>" alt="Emblem Hero" style="max-height: 50px; max-width: 100%;">
                    </div>
                <?php else: ?>
                    <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 8px;">Badge Teks "elBeka Semakin INSANI!" Digunakan</p>
                <?php endif; ?>
                <input type="file" name="hero_logo_file" class="form-control" accept="image/*">
                <small class="form-text">Gantikan badge teks dengan gambar logo custom.</small>
            </div>

            <!-- Background Foto Hero Banner -->
            <div style="background: #f8fafc; padding: 1.2rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <label class="form-label">Foto Background Hero (Gedung Lapas)</label>
                <?php $hero_bg = get_setting('hero_bg'); ?>
                <?php if ($hero_bg): ?>
                    <div style="margin-bottom: 10px;">
                        <img src="<?= base_url($hero_bg); ?>" alt="Foto Background Gedung" style="max-height: 60px; border-radius: 4px; object-fit: cover; width: 100%;">
                    </div>
                <?php else: ?>
                    <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 8px;">Foto Default Gedung Digunakan</p>
                <?php endif; ?>
                <input type="file" name="hero_bg_file" class="form-control" accept="image/*">
                <small class="form-text">Upload foto gedung/lingkungan Lapas Bekasi.</small>
            </div>
        </div>
    </div>

    <!-- CARD 2: TEKS HERO & TAGLINE -->
    <div class="form-card" style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.15rem; color: var(--primary-navy); margin-bottom: 1.2rem; display: flex; align-items: center; gap: 8px;">
            ✨ Tagline & Judul Hero Banner
        </h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
                <label class="form-label" for="hero_tagline_title">Tagline Utama (Badge / Emblem)</label>
                <input type="text" name="hero_tagline_title" id="hero_tagline_title" class="form-control" value="<?= sanitize(get_setting('hero_tagline_title', 'elBeka Semakin INSANI!')); ?>">
            </div>

            <div class="form-group">
                <label class="form-label" for="hero_tagline_sub">Sub Tagline (Gold Text)</label>
                <input type="text" name="hero_tagline_sub" id="hero_tagline_sub" class="form-control" value="<?= sanitize(get_setting('hero_tagline_sub', 'AGUNGKAN MENJADI BANGSA YANG NYATA')); ?>">
            </div>
        </div>

        <div class="form-group">
            <label class="form-label" for="hero_title">Judul Besar Hero</label>
            <input type="text" name="hero_title" id="hero_title" class="form-control" value="<?= sanitize(get_setting('hero_title', 'Lembaga Pemasyarakatan Kelas IIA Bekasi')); ?>">
        </div>

        <div class="form-group">
            <label class="form-label" for="hero_subtitle">Subjudul Hero</label>
            <input type="text" name="hero_subtitle" id="hero_subtitle" class="form-control" value="<?= sanitize(get_setting('hero_subtitle', 'Pemasyarakatan Pasti Bermanfaat Untuk Masyarakat')); ?>">
        </div>
    </div>

    <!-- CARD 3: IDENTITAS INSTANSI & PROFIL -->
    <div class="form-card" style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.15rem; color: var(--primary-navy); margin-bottom: 1.2rem; display: flex; align-items: center; gap: 8px;">
            🏛️ Identitas & Informasi Instansi
        </h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
                <label class="form-label" for="app_name">Nama Instansi Header</label>
                <input type="text" name="app_name" id="app_name" class="form-control" value="<?= sanitize(get_setting('app_name', 'LAPAS KELAS IIA BEKASI')); ?>">
            </div>

            <div class="form-group">
                <label class="form-label" for="app_subname">Kementerian / Sub Instansi</label>
                <input type="text" name="app_subname" id="app_subname" class="form-control" value="<?= sanitize(get_setting('app_subname', 'Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia')); ?>">
            </div>
        </div>

        <div class="form-group">
            <label class="form-label" for="profil_lapas">Informasi Profil Lapas</label>
            <textarea name="profil_lapas" id="profil_lapas" class="form-control"><?= sanitize(get_setting('profil_lapas')); ?></textarea>
        </div>

        <div class="form-group">
            <label class="form-label" for="tugas_fungsi">Informasi Tugas & Fungsi</label>
            <textarea name="tugas_fungsi" id="tugas_fungsi" class="form-control"><?= sanitize(get_setting('tugas_fungsi')); ?></textarea>
        </div>

        <div class="form-group">
            <label class="form-label" for="visi_misi">Informasi Visi & Misi</label>
            <textarea name="visi_misi" id="visi_misi" class="form-control"><?= sanitize(get_setting('visi_misi')); ?></textarea>
        </div>
    </div>

    <div style="margin-top: 1rem; margin-bottom: 3rem;">
        <button type="submit" class="btn btn-gold" style="padding: 0.9rem 2.5rem; font-size: 1rem;">
            💾 SIMPAN PENGATURAN & FOTO
        </button>
    </div>
</form>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
