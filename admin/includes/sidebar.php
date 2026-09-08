<?php
$script_path = $_SERVER['SCRIPT_NAME'] ?? '';
?>
<aside class="admin-sidebar" id="adminSidebar">
    <div class="sidebar-header">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V7l-9-5z" fill="#ffffff" fill-opacity="0.2"/>
            <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V7l-9-5z" stroke="#ffffff"/>
            <path d="M12 8v8M8 12h8" stroke="#fbbf24" stroke-width="2.5"/>
        </svg>
        <div>
            <div style="font-weight: 800; font-size: 0.95rem; color: #ffffff; letter-spacing: 0.5px;">
                LAPAS BEKASI
            </div>
            <div style="font-size: 0.72rem; color: #94a3b8;">
                Sistem Informasi Arsip
            </div>
        </div>
    </div>

    <ul class="sidebar-menu">
        <li class="sidebar-item">
            <a href="<?= base_url('admin/dashboard.php'); ?>" class="sidebar-link <?= (strpos($script_path, 'dashboard.php') !== false) ? 'active' : ''; ?>">
                <span class="sidebar-icon">📊</span>
                <span>Dashboard</span>
            </a>
        </li>

        <li class="sidebar-item">
            <a href="<?= base_url('admin/dokumen/index.php'); ?>" class="sidebar-link <?= (strpos($script_path, '/dokumen/') !== false) ? 'active' : ''; ?>">
                <span class="sidebar-icon">📁</span>
                <span>Arsip Dokumen</span>
            </a>
        </li>

        <li class="sidebar-item">
            <a href="<?= base_url('admin/kategori/index.php'); ?>" class="sidebar-link <?= (strpos($script_path, '/kategori/') !== false) ? 'active' : ''; ?>">
                <span class="sidebar-icon">🏷️</span>
                <span>Kategori</span>
            </a>
        </li>

        <li class="sidebar-item">
            <a href="<?= base_url('admin/users/index.php'); ?>" class="sidebar-link <?= (strpos($script_path, '/users/') !== false) ? 'active' : ''; ?>">
                <span class="sidebar-icon">👥</span>
                <span>Kelola Admin</span>
            </a>
        </li>

        <li class="sidebar-item">
            <a href="<?= base_url('admin/logs/index.php'); ?>" class="sidebar-link <?= (strpos($script_path, '/logs/') !== false) ? 'active' : ''; ?>">
                <span class="sidebar-icon">📋</span>
                <span>Log Aktivitas</span>
            </a>
        </li>

        <li class="sidebar-item">
            <a href="<?= base_url('admin/settings/index.php'); ?>" class="sidebar-link <?= (strpos($script_path, '/settings/') !== false) ? 'active' : ''; ?>">
                <span class="sidebar-icon">⚙️</span>
                <span>Pengaturan Logo & Web</span>
            </a>
        </li>

        <li style="margin: 1.5rem 0.5rem 0.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 1rem;"></li>

        <li class="sidebar-item">
            <a href="<?= base_url('index.php'); ?>" target="_blank" class="sidebar-link">
                <span class="sidebar-icon">🌐</span>
                <span>Lihat Website Publik</span>
            </a>
        </li>

        <li class="sidebar-item">
            <a href="<?= base_url('admin/logout.php'); ?>" class="sidebar-link" style="color: #f87171;">
                <span class="sidebar-icon">🚪</span>
                <span>Logout Session</span>
            </a>
        </li>
    </ul>
</aside>
