import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useSettings } from '../../contexts/SettingsContext';
import { resolveAssetUrl } from '../../utils/formatters';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      addToast('Selamat datang kembali! Login berhasil.', 'success');
      navigate('/admin');
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Login gagal. Periksa kembali email dan password Anda.';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const [logoError, setLogoError] = useState(false);
  const rawLogo = settings.siteLogo && !settings.siteLogo.includes('/assets/logo.png') ? settings.siteLogo : null;
  const siteLogoUrl = !logoError ? resolveAssetUrl(rawLogo) : null;
  const bgUrl = resolveAssetUrl(settings.heroBg) || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4 lg:p-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-900/50 via-surface-950 to-surface-950" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-600/20 blur-[120px] pointer-events-none" />

      {/* Top Left Return link */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-surface-300 hover:text-white text-xs font-semibold backdrop-blur-md transition-all z-20"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Portal
      </Link>

      <div className="relative z-10 w-full max-w-5xl bg-surface-900/90 backdrop-blur-2xl border border-surface-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-8">
        {/* Left Branding & Illustration Section */}
        <div
          className="lg:col-span-6 p-8 lg:p-12 bg-cover bg-center relative flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-surface-800"
          style={{ backgroundImage: `linear-gradient(to bottom right, rgba(11, 26, 48, 0.92), rgba(15, 23, 42, 0.95)), url('${bgUrl}')` }}
        >
          <div>
            <div className="flex items-center gap-3 mb-8">
              {siteLogoUrl ? (
                <img
                  src={siteLogoUrl}
                  alt={settings.institutionName}
                  onError={() => setLogoError(true)}
                  className="w-12 h-12 object-contain rounded-2xl bg-white/10 p-1 border border-white/20 shadow-md"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-primary-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/30 border border-amber-400/30">
                  <ShieldCheck className="w-7 h-7 text-amber-300" />
                </div>
              )}
              <div>
                <span className="text-xl font-extrabold text-white tracking-wide block uppercase leading-none">
                  {settings.institutionName || 'LAPAS KELAS IIA BEKASI'}
                </span>
                <span className="text-[11px] font-semibold text-primary-400 tracking-wider mt-1 block">
                  {settings.siteTitle || 'Sistem Arsip Dokumen Publik'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs font-bold uppercase tracking-wider">
                Portal Administrator
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                {settings.siteTitle || 'Sistem Arsip Dokumen Digital'}
              </h2>
              <p className="text-surface-300 text-sm leading-relaxed">
                {settings.siteTagline || 'Portal resmi pengelolaan dan publikasi dokumen Lapas Kelas IIA Bekasi untuk transparansi dan pelayanan informasi.'}
              </p>
            </div>
          </div>

          {/* Visual Taglines */}
          <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 tracking-widest uppercase">
              <span>Transparansi</span>
              <span>•</span>
              <span>Akuntabilitas</span>
              <span>•</span>
              <span>Pelayanan</span>
            </div>
            {[
              'Autentikasi Terenkripsi & Sesi Akses Aman',
              'Manajemen Publikasi Dokumen Terpusat',
              'Audit Trail Real-time & Logging Aktivitas',
            ].map((text) => (
              <div key={text} className="flex items-center gap-2.5 text-xs font-semibold text-surface-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Form Card Section */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-surface-900 text-surface-900 dark:text-white">
          <div className="mb-8">
            <h3 className="text-2xl font-extrabold text-surface-900 dark:text-white tracking-tight mb-1">Login Admin</h3>
            <p className="text-surface-500 dark:text-surface-400 text-xs">Masuk untuk mengelola data sistem arsip.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-700 dark:text-red-300 text-xs font-semibold animate-slide-up">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Email / Username Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-2">Username / Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Masukkan username atau email..."
                className="w-full px-4 py-3.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-sm font-medium transition-all"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan password..."
                  className="w-full px-4 py-3.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-sm font-medium pr-12 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-surface-600 dark:text-surface-300 font-semibold">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-md border-surface-300 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                />
                <span>Ingat saya</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-600/25 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Login</span>
              )}
            </button>

            <div className="pt-4 text-center border-t border-surface-100 dark:border-surface-800">
              <Link
                to="/"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke halaman publik</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


