import { useState, useEffect } from 'react';
import { Save, Upload, Palette, Building2, CheckCircle2 } from 'lucide-react';
import { settingsApi } from '../../api/settings.api';
import type { AppSettings } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useSettings } from '../../contexts/SettingsContext';
import { resolveAssetUrl } from '../../utils/formatters';

export default function SettingsPage() {
  const { addToast } = useToast();
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    siteTitle: '', siteTagline: '', institutionName: '',
    primaryColor: '#2563EB', heroOverlayOpacity: 75, heroOverlayColor: '#0F172A',
  });
  const [files, setFiles] = useState<{ siteLogo?: File; heroEmblem?: File; heroBg?: File }>({});

  useEffect(() => {
    settingsApi.get().then((res) => {
      const data = res.data.data;
      if (data) {
        setSettings(data);
        setForm({
          siteTitle: data.siteTitle || '',
          siteTagline: data.siteTagline || '',
          institutionName: data.institutionName || '',
          primaryColor: data.primaryColor || '#0066FF',
          heroOverlayOpacity: data.heroOverlayOpacity ?? 75,
          heroOverlayColor: data.heroOverlayColor || '#0B1A30',
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMessage('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (files.siteLogo) fd.append('siteLogo', files.siteLogo);
      if (files.heroEmblem) fd.append('heroEmblem', files.heroEmblem);
      if (files.heroBg) fd.append('heroBg', files.heroBg);

      const res = await settingsApi.update(fd);
      const updated = res.data.data!;
      setSettings(updated);
      setForm({
        siteTitle: updated.siteTitle || '',
        siteTagline: updated.siteTagline || '',
        institutionName: updated.institutionName || '',
        primaryColor: updated.primaryColor || '#0066FF',
        heroOverlayOpacity: updated.heroOverlayOpacity ?? 75,
        heroOverlayColor: updated.heroOverlayColor || '#0B1A30',
      });
      setFiles({});
      await refreshSettings();
      addToast('✓ Pengaturan & Branding Visual berhasil diperbarui secara menyeluruh!', 'success');
      setMessage('Pengaturan berhasil disimpan!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Gagal menyimpan pengaturan';
      addToast('✕ ' + errMsg, 'error');
      setMessage(errMsg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
          Pengaturan Sistem
        </h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
          Kustomisasi konfigurasi instansi, branding visual, dan tema portal.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-2 ${
            message.includes('berhasil')
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
          }`}>
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Informasi Instansi */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-6 space-y-5 shadow-xs transition-colors">
          <div className="flex items-center gap-3 pb-3 border-b border-surface-100 dark:border-surface-800">
            <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/40">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">Informasi Instansi</h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">Identitas resmi lembaga / instansi pemilik sistem</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">Judul Aplikasi</label>
              <input type="text" value={form.siteTitle} onChange={(e) => setForm({ ...form, siteTitle: e.target.value })} className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">Nama Instansi</label>
              <input type="text" value={form.institutionName} onChange={(e) => setForm({ ...form, institutionName: e.target.value })} className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">Tagline Portal</label>
            <input type="text" value={form.siteTagline} onChange={(e) => setForm({ ...form, siteTagline: e.target.value })} className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
        </div>

        {/* Visual Branding */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-6 space-y-5 shadow-xs transition-colors">
          <div className="flex items-center gap-3 pb-3 border-b border-surface-100 dark:border-surface-800">
            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/40">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">Branding Visual</h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">Unggah logo resmi, lambang hero, dan latar belakang (Bisa diganti kapan saja)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: 'siteLogo' as const, label: 'Logo Utama', current: settings?.siteLogo },
              { key: 'heroEmblem' as const, label: 'Emblem Hero', current: settings?.heroEmblem },
              { key: 'heroBg' as const, label: 'Background Hero', current: settings?.heroBg },
            ].map((item) => {
              const selectedFile = files[item.key];
              const previewSrc = selectedFile ? URL.createObjectURL(selectedFile) : resolveAssetUrl(item.current);

              return (
                <div key={item.key} className="space-y-2.5 flex flex-col justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">{item.label}</label>

                  {/* Image Preview Box */}
                  <div className="w-full h-28 rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 p-2 flex items-center justify-center relative overflow-hidden shadow-xs group">
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={item.label}
                        className="max-h-full max-w-full object-contain rounded-lg transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-xs text-surface-400 font-medium">Belum Ada Gambar</span>
                    )}

                    {selectedFile && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md shadow-xs">
                        Gambar Baru
                      </span>
                    )}
                  </div>

                  {/* Action Upload / Change Label */}
                  <div className="flex items-center gap-2">
                    <label className="flex-1 py-2 px-3 border border-dashed border-primary-300 dark:border-primary-700/60 rounded-xl cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors text-center bg-surface-50 dark:bg-surface-800/40">
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400 block truncate">
                        {selectedFile ? '📷 Ganti File' : (previewSrc ? '🔄 Ubah Gambar' : '➕ Pilih Gambar')}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setFiles((prev) => ({ ...prev, [item.key]: e.target.files![0] }));
                          }
                        }}
                      />
                    </label>

                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setFiles((prev) => {
                            const next = { ...prev };
                            delete next[item.key];
                            return next;
                          });
                        }}
                        className="px-3 py-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
                        title="Batal pilih file baru"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-6 space-y-6 shadow-xs transition-colors">
          <div className="flex items-center gap-3 pb-3 border-b border-surface-100 dark:border-surface-800">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">Tampilan & Aksentuasi</h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">Atur palet warna utama dan transparansi overlay</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            {/* Warna Utama */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-2">Warna Utama</label>
              <div className="flex items-center gap-2 bg-surface-50 dark:bg-surface-800/80 p-1.5 rounded-2xl border border-surface-200 dark:border-surface-700">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-inner border border-black/10 dark:border-white/10 cursor-pointer group">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer opacity-0 z-10"
                  />
                  <div className="w-full h-full rounded-xl transition-transform group-hover:scale-110" style={{ backgroundColor: form.primaryColor }} />
                </div>
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-full px-3 py-2 bg-transparent text-surface-900 dark:text-white text-xs font-mono font-bold uppercase focus:outline-none"
                  placeholder="#2563EB"
                />
              </div>
            </div>

            {/* Warna Overlay Hero */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-2">Warna Overlay Hero</label>
              <div className="flex items-center gap-2 bg-surface-50 dark:bg-surface-800/80 p-1.5 rounded-2xl border border-surface-200 dark:border-surface-700">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-inner border border-black/10 dark:border-white/10 cursor-pointer group">
                  <input
                    type="color"
                    value={form.heroOverlayColor}
                    onChange={(e) => setForm({ ...form, heroOverlayColor: e.target.value })}
                    className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer opacity-0 z-10"
                  />
                  <div className="w-full h-full rounded-xl transition-transform group-hover:scale-110" style={{ backgroundColor: form.heroOverlayColor }} />
                </div>
                <input
                  type="text"
                  value={form.heroOverlayColor}
                  onChange={(e) => setForm({ ...form, heroOverlayColor: e.target.value })}
                  className="w-full px-3 py-2 bg-transparent text-surface-900 dark:text-white text-xs font-mono font-bold uppercase focus:outline-none"
                  placeholder="#092158"
                />
              </div>
            </div>

            {/* Transparansi Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">Transparansi ({form.heroOverlayOpacity}%)</label>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.heroOverlayOpacity}
                  onChange={(e) => setForm({ ...form, heroOverlayOpacity: parseInt(e.target.value) || 0 })}
                  className="w-full h-2.5 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-2">Pratinjau Langsung (Live Preview)</label>
            <div
              className="relative rounded-2xl overflow-hidden p-6 text-white transition-colors duration-300 shadow-md border border-surface-200 dark:border-surface-700"
              style={{ backgroundColor: form.heroOverlayColor }}
            >
              {/* Background preview image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${resolveAssetUrl(settings?.heroBg) || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80'}')`,
                }}
              />

              {/* Dynamic Overlay */}
              <div
                className="absolute inset-0 transition-all duration-300 pointer-events-none"
                style={{
                  backgroundColor: form.heroOverlayColor,
                  opacity: form.heroOverlayOpacity / 100,
                }}
              />

              {/* Content */}
              <div className="relative z-10 space-y-3 max-w-lg mx-auto text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-white inline-block">
                  Transparansi: {form.heroOverlayOpacity}% | Overlay: {form.heroOverlayColor}
                </span>
                <h3 className="text-lg font-black tracking-tight leading-snug">
                  {form.siteTitle || 'Sistem Arsip Dokumen Publik'}
                </h3>
                <p className="text-xs text-white/80 line-clamp-2">
                  {form.siteTagline || 'Portal resmi pengelolaan dan publikasi dokumen Lapas Kelas IIA Bekasi'}
                </p>
                <div className="pt-1 flex items-center justify-center gap-2">
                  <input
                    type="text"
                    disabled
                    placeholder="Cari dokumen..."
                    className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs w-48 opacity-90 cursor-not-allowed"
                  />
                  <button
                    type="button"
                    style={{ backgroundColor: form.primaryColor }}
                    className="px-4 py-1.5 text-white font-bold rounded-lg text-xs transition-colors shadow-sm cursor-default"
                  >
                    Cari
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{ backgroundColor: form.primaryColor }}
          className="w-full py-3 hover:brightness-110 text-white font-semibold rounded-xl transition-all shadow-lg text-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Pengaturan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

