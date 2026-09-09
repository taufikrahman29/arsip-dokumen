import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, ShieldCheck, Sun, Moon, Menu, X, Info, CheckCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import { resolveAssetUrl } from '../../utils/formatters';

export default function PublicLayout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [logoError, setLogoError] = useState(false);
  const rawLogo = settings.siteLogo && !settings.siteLogo.includes('/assets/logo.png') ? settings.siteLogo : null;
  const siteLogoUrl = !logoError ? resolveAssetUrl(rawLogo) : null;

  useEffect(() => {
    setLogoError(false);
  }, [settings.siteLogo]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-primary-600 selection:text-white transition-colors duration-300">
      {/* Sticky Top Navbar */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-[#0B1A30] border-b border-blue-950 text-white'
            : 'bg-white/95 backdrop-blur-md border-b border-surface-200 text-surface-900 shadow-sm'
        } ${scrolled ? 'shadow-lg py-3' : 'py-4'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo & Institution Branding */}
            <Link to="/" className="flex items-center gap-3 group">
              {siteLogoUrl ? (
                <img
                  src={siteLogoUrl}
                  alt={settings.institutionName}
                  onError={() => setLogoError(true)}
                  className="w-11 h-11 object-contain rounded-xl shadow-md bg-white/10 p-0.5 border border-white/20"
                />
              ) : (
                <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-slate-900 font-black shadow-md group-hover:scale-105 transition-transform duration-300">
                  <ShieldCheck className="w-6.5 h-6.5 text-[#0B1A30]" />
                </div>
              )}
              <div className="flex flex-col">
                <span className={`text-base font-extrabold tracking-wide uppercase leading-none ${theme === 'dark' ? 'text-white' : 'text-surface-900'}`}>
                  {settings.institutionName || 'LAPAS KELAS IIA BEKASI'}
                </span>
                <span className={`text-[10px] font-medium tracking-wider mt-1 line-clamp-1 max-w-xs ${theme === 'dark' ? 'text-slate-300' : 'text-surface-500'}`}>
                  {settings.siteTagline || 'Kementerian Hukum dan HAM RI'}
                </span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className={`text-xs font-bold transition-all ${
                  location.pathname === '/'
                    ? theme === 'dark' ? 'text-white border-b-2 border-white pb-1' : 'text-primary-600 border-b-2 border-primary-600 pb-1'
                    : theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Beranda
              </Link>
              <Link
                to="/documents"
                className={`text-xs font-bold transition-all ${
                  location.pathname.startsWith('/documents')
                    ? theme === 'dark' ? 'text-white border-b-2 border-white pb-1' : 'text-primary-600 border-b-2 border-primary-600 pb-1'
                    : theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                Arsip Dokumen
              </Link>
              <Link
                to="/documents"
                className={`text-xs font-bold transition-all ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-surface-600 hover:text-surface-900'}`}
              >
                Informasi
              </Link>
              <button
                onClick={() => setShowAboutModal(true)}
                className={`text-xs font-bold transition-all cursor-pointer ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-surface-600 hover:text-surface-900'}`}
              >
                Tentang
              </button>
            </div>

            {/* Right Action Group */}
            <div className="hidden md:flex items-center gap-3">
              {/* Compact Dark/Light Mode Icon Button */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme Mode"
                className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                  theme === 'dark'
                    ? 'border-white/20 text-amber-400 hover:bg-white/10'
                    : 'border-surface-200 text-surface-700 hover:bg-surface-100'
                }`}
                title={theme === 'dark' ? 'Ganti ke Mode Pagi (Light Mode)' : 'Ganti ke Mode Malam (Dark Mode)'}
              >
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-700" />}
              </button>

              {/* Login Button */}
              <Link
                to="/login"
                style={{ backgroundColor: settings.primaryColor || '#0066FF' }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white hover:brightness-110 rounded-xl transition-all shadow-md hover:scale-[1.02]"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Login Admin
              </Link>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400"
                title={theme === 'dark' ? 'Ganti ke Mode Pagi' : 'Ganti ke Mode Malam'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-surface-700" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-200/80 dark:border-surface-800 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl px-4 py-6 mt-3 space-y-3 animate-slide-up shadow-2xl">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl font-semibold text-surface-800 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              Beranda
            </Link>
            <Link
              to="/documents"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl font-semibold text-surface-800 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              Dokumen Library
            </Link>
            <Link
              to="/documents"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl font-semibold text-surface-800 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              Kategori Dokumen
            </Link>
            <button
              onClick={() => { setMobileMenuOpen(false); setShowAboutModal(true); }}
              className="w-full text-left px-4 py-3 rounded-xl font-semibold text-surface-800 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 flex items-center gap-2"
            >
              <Info className="w-4 h-4 text-primary-600" />
              Tentang Sistem
            </button>
            <div className="pt-3 border-t border-surface-200 dark:border-surface-800">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-primary-600 rounded-xl shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                Login Admin
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modern Clean White Footer */}
      <footer className="bg-white text-slate-600 pt-16 pb-12 border-t border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-200/80">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <span className="text-lg font-black text-slate-900 tracking-tight">Sistem Arsip Dokumen Digital</span>
              </div>
              <p className="text-sm text-slate-500 max-w-md leading-relaxed font-medium">
                Platform manajemen kearsipan dokumen digital berskala enterprise untuk penyimpanan, pencarian, dan pengelolaan dokumen resmi yang terstruktur, aman, dan terintegrasi.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Navigasi Utama</h4>
              <ul className="space-y-2.5 text-sm font-semibold">
                <li><Link to="/" className="text-slate-600 hover:text-primary-600 transition-colors">Beranda</Link></li>
                <li><Link to="/documents" className="text-slate-600 hover:text-primary-600 transition-colors">Katalog Dokumen</Link></li>
                <li><button onClick={() => setShowAboutModal(true)} className="text-slate-600 hover:text-primary-600 transition-colors">Tentang Sistem</button></li>
                <li><Link to="/login" className="text-slate-600 hover:text-primary-600 transition-colors">Login Administrator</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Kepatuhan & Keamanan</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Dilengkapi dengan kontrol hak akses bertingkat, enkripsi JWT, serta catatan jejak audit otomatis untuk akuntabilitas data.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold pt-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 w-fit">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Sistem Berjalan Optimal
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <a
              href="https://wa.me/6282214139962"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-600 hover:text-primary-600 hover:underline transition-all cursor-pointer"
              title="Hubungi Kami via WhatsApp (+6282214139962)"
            >
              © {new Date().getFullYear()} Sistem Arsip Dokumen Digital. Hak Cipta Dilindungi.
            </a>
            <p className="flex items-center gap-1 font-bold text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-primary-600" /> Enterprise Edition v2.0
            </p>
          </div>
        </div>
      </footer>

      {/* About System Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAboutModal(false)} />
          <div className="relative bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-2xl max-w-lg w-full p-8 animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-surface-200 dark:border-surface-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-surface-900 dark:text-white">Tentang Sistem Arsip Digital</h3>
                  <p className="text-xs text-surface-500">Modern Digital Archive Management System</p>
                </div>
              </div>
              <button onClick={() => setShowAboutModal(false)} className="text-surface-400 hover:text-surface-900 dark:hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
              <p>
                <strong>Sistem Arsip Dokumen Digital</strong> adalah platform kearsipan berbasis web enterprise yang dirancang khusus untuk mengorganisir, mengamankan, dan mempermudah penemuan dokumen penting secara cepat.
              </p>
              <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-2xl border border-surface-200 dark:border-surface-700/60 space-y-2 text-xs">
                <p className="font-bold text-surface-900 dark:text-white uppercase tracking-wider">Fitur & Keunggulan Sistem:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Full-text Document Search & Categorization</li>
                  <li>Manajemen Dokumen Publik & Terproteksi (Privat)</li>
                  <li>Keamanan Autentikasi JWT & Role Control</li>
                  <li>Audit Log Trail otomatis untuk setiap perubahan</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-surface-200 dark:border-surface-800 flex justify-end">
              <button
                onClick={() => setShowAboutModal(false)}
                className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl text-sm hover:bg-primary-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


