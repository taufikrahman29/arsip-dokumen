<?php
/**
 * Admin Layout Header Template (Pure View Partials)
 */
require_once __DIR__ . '/../../config/auth.php';

$user_data = get_current_user_data();
$page_title = $page_title ?? 'Dashboard Admin';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= sanitize($page_title); ?> — Administrator Lapas Bekasi</title>
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230F2C59'><path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8s0 0 0 0z'/></svg>">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Main CSS -->
    <link rel="stylesheet" href="<?= base_url('assets/css/style.css'); ?>">
</head>
<body>
<div class="admin-wrapper">
    <?php require_once __DIR__ . '/sidebar.php'; ?>

    <div class="admin-main">
        <!-- Topbar -->
        <header class="admin-topbar">
            <div style="display: flex; align-items: center; gap: 15px;">
                <button class="mobile-menu-toggle" id="sidebarToggle" style="color: var(--primary-navy);">
                    ☰
                </button>
                <div class="admin-title">
                    ADMINISTRATOR — SISTEM ARSIP DOKUMEN
                </div>
            </div>

            <div class="admin-user-profile">
                <div class="user-avatar">
                    <?= strtoupper(substr($user_data['nama'] ?? 'A', 0, 1)); ?>
                </div>
                <div>
                    <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary-navy); line-height: 1.2;">
                        <?= sanitize($user_data['nama'] ?? 'Admin'); ?>
                    </div>
                    <small style="color: var(--text-muted); text-transform: uppercase; font-weight: 600; font-size: 0.72rem;">
                        <?= sanitize($user_data['role'] ?? 'admin'); ?>
                    </small>
                </div>
                <a href="<?= base_url('admin/logout.php'); ?>" class="btn btn-outline btn-sm" style="margin-left: 10px; padding: 4px 10px;">
                    🚪 Logout
                </a>
            </div>
        </header>

        <main class="main-container" style="padding-top: 1.5rem;">
            <?php render_flash(); ?>
