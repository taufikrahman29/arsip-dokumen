import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, FolderOpen, Folder, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { categoriesApi } from '../../api/categories.api';
import type { Category } from '../../types';
import { useToast } from '../../contexts/ToastContext';

export default function CategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      addToast('Terjadi kesalahan saat memuat kategori', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditCat(null); setName(''); setDescription(''); setError(''); setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditCat(cat); setName(cat.name); setDescription(cat.description || ''); setError(''); setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      if (editCat) {
        await categoriesApi.update(editCat.id, { name, description: description || undefined });
        addToast('✓ Kategori berhasil diperbarui', 'success');
      } else {
        await categoriesApi.create({ name, description: description || undefined });
        addToast('✓ Kategori berhasil ditambahkan', 'success');
      }
      setShowForm(false); fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Gagal menyimpan kategori');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteCat) return;
    try {
      await categoriesApi.delete(deleteCat.id);
      addToast('✓ Kategori berhasil dihapus', 'success');
      setDeleteCat(null);
      fetchCategories();
    } catch (err: any) {
      addToast('Gagal menghapus kategori: ' + (err.response?.data?.error?.message || 'Kategori ini mungkin memiliki dokumen terkait'), 'error');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
            Kelola Kategori
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            Atur struktur pengelompokan arsip dokumen instansi.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-600/25 hover-lift text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Grid view */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-surface-800 flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-4">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-surface-900 dark:text-white">Belum Ada Kategori</h3>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 mb-6">
              Buat kategori pertama Anda untuk mengelompokkan dokumen.
            </p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-500 transition-colors shadow-md shadow-primary-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kategori</span>
            </button>
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 hover:border-primary-400 dark:hover:border-primary-600/50 hover:shadow-xl transition-all group hover-lift flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/40 flex items-center justify-center">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 text-surface-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCat(cat)}
                      className="p-1.5 text-surface-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-surface-900 dark:text-white text-base">
                  {cat.name}
                </h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {cat.description || 'Tidak ada deskripsi rinci untuk kategori ini.'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400">
                  <FileText className="w-3.5 h-3.5" />
                  {cat.documentCount ?? 0} Dokumen
                </span>
                <span className="text-[11px] text-surface-400 dark:text-surface-500">
                  ID: {cat.id.substring(0, 8)}...
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs" onClick={() => !submitting && setShowForm(false)} />
          <div className="relative bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">
                {editCat ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h2>
              <button onClick={() => setShowForm(false)} disabled={submitting} className="p-1 text-surface-400 hover:text-surface-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laporan Keuangan, Surat Keputusan..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
                  Deskripsi Kategori
                </label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan ringkas jenis dokumen dalam kategori ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-colors shadow-md shadow-primary-600/20 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editCat ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs" onClick={() => setDeleteCat(null)} />
          <div className="relative bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shadow-2xl max-w-sm w-full animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-800/40">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-surface-900 dark:text-white">
              Hapus Kategori?
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 mb-6">
              Apakah Anda yakin ingin menghapus kategori <span className="font-semibold text-surface-900 dark:text-white">"{deleteCat.name}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteCat(null)}
                className="flex-1 py-2 text-xs font-medium text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 text-xs font-medium bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition-colors shadow-md shadow-rose-600/20"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

