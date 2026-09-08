<?php
/**
 * Administrator Login Handler
 */
require_once __DIR__ . '/../config/auth.php';

// If already logged in, redirect to dashboard BEFORE HTML output
if (is_logged_in()) {
    redirect(base_url('admin/dashboard.php'));
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_token();

    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $error = 'Username dan password wajib diisi!';
    } else {
        $pdo = get_db_connection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            if ($user['status'] !== 'aktif') {
                $error = 'Akun Anda sedang dinonaktifkan. Hubungi Super Administrator.';
            } else {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['user_nama'] = $user['nama'];
                $_SESSION['user_role'] = $user['role'];

                log_activity("Login administrator berhasil", null, $user['id']);
                set_flash('success', 'Selamat datang kembali, ' . sanitize($user['nama']) . '!');
                redirect(base_url('admin/dashboard.php'));
            }
        } else {
            $error = 'Username atau password yang Anda masukkan salah!';
            log_activity("Gagal login (Username: " . sanitize($username) . ")", null, null);
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Administrator — Lapas Kelas IIA Bekasi</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230F2C59'><path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8s0 0 0 0z'/></svg>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= base_url('assets/css/style.css'); ?>">
    <style>
        body {
            background: linear-gradient(135deg, #0a192f 0%, #0f2c59 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 1.5rem;
        }
        .login-card {
            background: #ffffff;
            width: 100%;
            max-width: 420px;
            border-radius: 14px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
            padding: 2.5rem 2rem;
        }
        .login-brand {
            text-align: center;
            margin-bottom: 2rem;
        }
        .login-brand-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 12px;
            background: rgba(15, 44, 89, 0.08);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
        }
        .login-brand-title {
            font-size: 1.35rem;
            font-weight: 800;
            color: #0f2c59;
            margin-bottom: 4px;
        }
        .login-brand-sub {
            font-size: 0.82rem;
            color: #64748b;
        }
        .demo-credential-box {
            background-color: #f1f5f9;
            border-left: 4px solid #d97706;
            padding: 10px 14px;
            font-size: 0.82rem;
            color: #334155;
            border-radius: 4px;
            margin-bottom: 1.5rem;
        }
    </style>
</head>
<body>

<div class="login-card">
    <div class="login-brand">
        <div class="login-brand-icon">🏛️</div>
        <h1 class="login-brand-title">ADMINISTRATOR</h1>
        <p class="login-brand-sub">Sistem Arsip Dokumen Lapas Kelas IIA Bekasi</p>
    </div>

    <?php render_flash(); ?>

    <?php if ($error): ?>
        <div class="alert alert-danger">
            <span class="alert-icon">⚠️</span> <?= sanitize($error); ?>
        </div>
    <?php endif; ?>

    <div class="demo-credential-box">
        🔑 <strong>Akun Default Administrator:</strong><br>
        Username: <code>admin</code> | Password: <code>Bekasilapas321</code>
    </div>

    <form method="POST" action="login.php">
        <?= csrf_field(); ?>

        <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input type="text" name="username" id="username" class="form-control" placeholder="Masukkan username admin" required autofocus autocomplete="username">
        </div>

        <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input type="password" name="password" id="password" class="form-control" placeholder="Masukkan password" required autocomplete="current-password">
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; font-size: 1rem; margin-top: 1rem;">
            🔓 LOGIN ADMINISTRATOR
        </button>
    </form>

    <div style="text-align: center; margin-top: 2rem;">
        <a href="<?= base_url('index.php'); ?>" style="font-size: 0.85rem; color: #64748b; font-weight: 600;">
            ← Kembali ke Halaman Utama
        </a>
    </div>
</div>

</body>
</html>
