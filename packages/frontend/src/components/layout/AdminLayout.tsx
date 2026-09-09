import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  ScrollText,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Upload,
  HardDrive,
  Users,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useSettings } from '../../contexts/SettingsContext';
import { resolveAssetUrl } from '../../utils/formatters';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/documents', label: 'Arsip Dokumen', icon: FileText },
  { path: '/admin/documents?upload=true', label: 'Upload Dokumen', icon: Upload },
  { path: '/admin/categories', label: 'Kategori', icon: FolderOpen },
  { path: '#google-drive', label: 'Google Drive', icon: HardDrive, badge: 'Cloud' },
  { path: '/admin/settings', label: 'Admin/User', icon: Users },
  { path: '/admin/logs', label: 'Log Aktivitas', icon: ScrollText },
  { path: '/admin/settings', label: 'Pengaturan', icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const [logoError, setLogoError] = useState(false);
  const rawLogo = settings.siteLogo && !settings.siteLogo.includes('/assets/logo.png') ? settings.siteLogo : null;
  const siteLogoUrl = !logoError ? resolveAssetUrl(rawLogo) : null;

  useEffect(() => {
    setLogoError(false);
  }, [settings.siteLogo]);

  const handleLogout = async () => {
    await logout();
    addToast('Anda telah keluar dari sesi admin.', 'info');
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname + location.search === path || (path.startsWith('/admin/') && !path.includes('?') && location.pathname.startsWith(path));
  };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 font-sans selection:bg-primary-600 selection:text-white transition-colors duration-300">
      {/* Sidebar — Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-surface-900 text-white border-r border-surface-800 relative z-20 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Logo Header */}
        <div className="p-5 border-b border-surface-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3 min-w-0">
            {siteLogoUrl ? (
              <img
                src={siteLogoUrl}
                alt={settings.institutionName}
                onError={() => setLogoError(true)}
                className="w-11 h-11 object-contain rounded-2xl flex-shrink-0 bg-white/10 p-0.5 border border-white/20"
              />
            ) : (
              <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-primary-700 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md border border-amber-400/30">
                <ShieldCheck className="w-6.5 h-6.5 text-amber-300" />
              </div>
            )}
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-extrabold tracking-wide text-white uppercase truncate">
                  {settings.institutionName || 'LAPAS KELAS IIA BEKASI'}
                </p>
                <span className="text-[10px] font-semibold text-primary-400 block truncate mt-0.5">
                  {settings.siteTitle || 'Sistem Arsip Dokumen Publik'}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Sidebar Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        {/* Admin User Badge */}
        {!sidebarCollapsed && (
          <div className="p-4 mx-4 my-3 bg-surface-800/60 rounded-2xl border border-surface-700/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] font-semibold text-emerald-400">Super Admin</p>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {!sidebarCollapsed && (
            <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider px-3 mb-2">Main Navigation</p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={sidebarCollapsed ? item.label : undefined}
                className={`
                  flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 group relative
                  ${
                    active
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-surface-500 dark:text-surface-400 group-hover:text-primary-600 dark:group-hover:text-white'}`} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                {!sidebarCollapsed && active && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Sidebar Footer */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-800">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-100 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-surface-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-surface-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-surface-400 hover:text-red-500 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-2xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-surface-900 p-6 shadow-2xl animate-slide-in-right border-r border-surface-200 dark:border-surface-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-surface-200 dark:border-surface-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold">
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  <span className="text-base font-extrabold text-surface-900 dark:text-white">Admin Dashboard</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-surface-400 p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all
                        ${active ? 'bg-primary-600 text-white' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900/50"
            >
              <LogOut className="w-4 h-4" /> Keluar Sesi Admin
            </button>
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="sticky top-0 z-30 h-20 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200/80 dark:border-surface-800 flex items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-surface-600 dark:text-surface-300 p-2"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Header Global Search */}
            <div className="hidden sm:flex items-center relative w-64 lg:w-80">
              <Search className="absolute left-3.5 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Pencarian cepat admin..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/admin/documents?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-surface-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Compact Dark/Light Mode Icon Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark Mode"
              className="p-2.5 rounded-xl border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Ganti ke Mode Pagi (Light Mode)' : 'Ganti ke Mode Malam (Dark Mode)'}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-surface-700 dark:text-surface-300" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
                className="p-2.5 rounded-xl border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors relative"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-2xl p-4 animate-slide-up z-50 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800 mb-3">
                    <span className="font-bold text-surface-900 dark:text-white">Notifikasi Sistem</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded">Live</span>
                  </div>
                  <div className="space-y-2 text-surface-600 dark:text-surface-300">
                    <p className="p-2.5 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                      ⚡ Sistem kearsipan beroperasi secara normal.
                    </p>
                    <p className="p-2.5 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                      🔒 Enkripsi JWT dan role control aktif.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-surface-200 dark:bg-surface-800 mx-1 hidden sm:block" />

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors border border-transparent hover:border-surface-200 dark:hover:border-surface-700"
              >
                <div className="w-8 h-8 rounded-xl bg-primary-600 text-white font-bold flex items-center justify-center text-xs">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <span className="text-xs font-bold text-surface-900 dark:text-white hidden sm:block">{user?.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-2xl p-2 animate-slide-up z-50 text-xs">
                  <div className="px-3 py-2.5 border-b border-surface-100 dark:border-surface-800 mb-1">
                    <p className="font-bold text-surface-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-surface-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/admin/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 font-semibold"
                  >
                    <User className="w-4 h-4 text-primary-500" /> Pengaturan Akun
                  </Link>
                  <Link
                    to="/"
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 font-semibold"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-500" /> Buka Portal Publik
                  </Link>
                  <div className="my-1 border-t border-surface-100 dark:border-surface-800" />
                  <button
                    onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold"
                  >
                    <LogOut className="w-4 h-4" /> Keluar Sesi
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-6 lg:p-10 overflow-auto bg-surface-50 dark:bg-surface-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


