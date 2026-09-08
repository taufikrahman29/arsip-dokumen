<?php
$current_page = basename($_SERVER['PHP_SELF']);
?>
<?php
$site_logo = get_setting('site_logo');
$app_name = get_setting('app_name', 'LAPAS KELAS IIA BEKASI');
$app_subname = get_setting('app_subname', 'Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia');
?>
<header class="site-header">
    <div class="header-container">
        <a href="<?= base_url('index.php'); ?>" class="brand-wrapper">
            <?php if ($site_logo): ?>
                <img src="<?= base_url($site_logo); ?>" alt="Logo <?= sanitize($app_name); ?>" class="brand-logo-img" style="object-fit: contain;">
            <?php else: ?>
                <svg class="brand-logo-img" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V7l-9-5z" fill="#ffffff" fill-opacity="0.2"/>
                    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V7l-9-5z" stroke="#ffffff"/>
                    <path d="M12 8v8M8 12h8" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
            <?php endif; ?>
            <div>
                <div class="brand-text-main"><?= sanitize($app_name); ?></div>
                <div class="brand-text-sub"><?= sanitize($app_subname); ?></div>
            </div>
        </a>

        <button class="mobile-menu-toggle" id="navToggle" aria-label="Toggle Navigation">
            ☰
        </button>

        <ul class="nav-menu" id="navMenu">
            <li>
                <a href="<?= base_url('index.php'); ?>" class="nav-link <?= ($current_page === 'index.php' || $current_page === '') ? 'active' : ''; ?>">
                    Beranda
                </a>
            </li>
            <li>
                <a href="<?= base_url('dokumen.php'); ?>" class="nav-link <?= ($current_page === 'dokumen.php' || $current_page === 'detail_dokumen.php') ? 'active' : ''; ?>">
                    Dokumen
                </a>
            </li>
            <?php if (is_logged_in()): ?>
                <li>
                    <a href="<?= base_url('admin/dashboard.php'); ?>" class="nav-link btn-nav-login">
                        ⚡ Dashboard Admin
                    </a>
                </li>
            <?php else: ?>
                <li>
                    <a href="<?= base_url('admin/login.php'); ?>" class="nav-link btn-nav-login">
                        🔒 Login Admin
                    </a>
                </li>
            <?php endif; ?>
        </ul>
    </div>
</header>
