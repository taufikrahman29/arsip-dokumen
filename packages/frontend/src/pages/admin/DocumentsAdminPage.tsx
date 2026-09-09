import { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Trash2, Pencil, Upload, X, Download,
  ChevronLeft, ChevronRight, FileText, CheckSquare, Square,
  Filter, Eye, AlertCircle, FileUp, CheckCircle2
} from 'lucide-react';
import { documentsApi } from '../../api/documents.api';
import { categoriesApi } from '../../api/categories.api';
import type { Document, Category, PaginationMeta } from '../../types';
import { formatDate, formatFileSize, getFileIcon } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';

export default function DocumentsAdminPage() {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<Document | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Drag & Drop Upload Modal state
  const [formData, setFormData] = useState({
    title: '',
    documentNumber: '',
    description: '',
    categoryId: '',
    year: new Date().getFullYear(),
    documentDate: '',
    visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState('');

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data.data || []));
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [page, search, categoryFilter]);

  async function fetchDocuments() {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 10 };
      if (search) params.search = search;
      if (categoryFilter) params.categoryId = categoryFilter;
      const res = await documentsApi.getAdmin(params);
      setDocuments(res.data.data || []);
      setMeta(res.data.meta || null);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      addToast('Terjadi kesalahan saat memuat dokumen', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditDoc(null);
    setFormData({
      title: '',
      documentNumber: '',
      description: '',
      categoryId: '',
      year: new Date().getFullYear(),
      documentDate: new Date().toISOString().split('T')[0],
      visibility: 'PUBLIC',
    });
    setFile(null);
    setUploadProgress(0);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(doc: Document) {
    setEditDoc(doc);
    setFormData({
      title: doc.title,
      documentNumber: doc.documentNumber || '',
      description: doc.description || '',
      categoryId: doc.categoryId || '',
      year: doc.year,
      documentDate: doc.documentDate ? doc.documentDate.split('T')[0] : '',
      visibility: doc.visibility,
    });
    setFile(null);
    setUploadProgress(0);
    setFormError('');
    setShowForm(true);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      if (!formData.title) {
        // Auto-fill title from filename without extension
        const nameWithoutExt = droppedFile.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!formData.title) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setUploadProgress(10);

    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      if (formData.documentNumber) fd.append('documentNumber', formData.documentNumber);
      if (formData.description) fd.append('description', formData.description);
      if (formData.categoryId) fd.append('categoryId', formData.categoryId);
      fd.append('year', String(formData.year));
      if (formData.documentDate) fd.append('documentDate', formData.documentDate);
      fd.append('visibility', formData.visibility);
      if (file) fd.append('file', file);

      // Simulate smooth upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 20;
        });
      }, 100);

      if (editDoc) {
        await documentsApi.update(editDoc.id, fd);
        clearInterval(progressInterval);
        setUploadProgress(100);
        addToast('✓ Dokumen berhasil diperbarui', 'success');
      } else {
        if (!file) {
          clearInterval(progressInterval);
          setFormError('File dokumen wajib diunggah');
          setSubmitting(false);
          setUploadProgress(0);
          return;
        }
        await documentsApi.create(fd);
        clearInterval(progressInterval);
        setUploadProgress(100);
        addToast('✓ Dokumen berhasil diupload', 'success');
      }

      setTimeout(() => {
        setShowForm(false);
        fetchDocuments();
      }, 400);

    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Gagal menyimpan dokumen');
      addToast('✕ Upload gagal: ' + (err.response?.data?.error?.message || 'Terjadi kesalahan'), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteConfirmDoc) return;
    try {
      await documentsApi.delete(deleteConfirmDoc.id);
      addToast('✓ Dokumen berhasil dihapus', 'success');
      setDeleteConfirmDoc(null);
      fetchDocuments();
    } catch (error: any) {
      addToast('Gagal menghapus dokumen: ' + (error.response?.data?.error?.message || 'Unknown error'), 'error');
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => documentsApi.delete(id)));
      addToast(`✓ ${selectedIds.length} Dokumen berhasil dihapus`, 'success');
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      fetchDocuments();
    } catch (error: any) {
      addToast('Gagal menghapus beberapa dokumen', 'error');
    }
  }

  const isAllSelected = documents.length > 0 && selectedIds.length === documents.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(documents.map(d => d.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
              Manajemen Dokumen
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50">
              Enterprise
            </span>
          </div>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            Kelola, upload, dan atur visibilitas seluruh arsip dokumen instansi.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-600/25 hover-lift text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Dokumen</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500" />
          <input
            type="text"
            placeholder="Cari nama dokumen, nomor arsip..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-white placeholder:text-surface-400 dark:placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-sm transition-all shadow-xs"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial min-w-[180px]">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none cursor-pointer shadow-xs"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selected Items Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900/50 rounded-2xl animate-fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-600 text-white font-bold text-xs">
              {selectedIds.length}
            </span>
            <span className="text-sm font-medium text-primary-900 dark:text-primary-200">
              Dokumen dipilih
            </span>
          </div>
          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl text-xs transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Masal ({selectedIds.length})</span>
          </button>
        </div>
      )}

      {/* Main Document Table */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/70 dark:bg-surface-800/40">
                <th className="w-12 px-4 py-3.5 text-center">
                  <button onClick={toggleSelectAll} className="text-surface-400 dark:text-surface-500 hover:text-primary-600 dark:hover:text-primary-400">
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Nama Dokumen</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden md:table-cell">Kategori</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden lg:table-cell">Format</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden lg:table-cell">Ukuran</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden xl:table-cell">Uploaded By</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-800/60">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-6 py-4">
                      <div className="skeleton h-6 w-full rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 px-4">
                    <div className="max-w-md mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-surface-800 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 shadow-inner">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-semibold text-surface-900 dark:text-white">Belum Ada Dokumen</h3>
                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 mb-6">
                        {search || categoryFilter 
                          ? 'Tidak ada dokumen yang sesuai dengan pencarian atau filter Anda.' 
                          : 'Dokumen yang Anda tambahkan akan muncul di sini.'}
                      </p>
                      <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-500 shadow-md shadow-primary-600/20"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Upload Dokumen</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const isSelected = selectedIds.includes(doc.id);
                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-surface-50/80 dark:hover:bg-surface-800/40 transition-colors ${
                        isSelected ? 'bg-primary-50/50 dark:bg-primary-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        <button onClick={() => toggleSelectOne(doc.id)} className="text-surface-400 dark:text-surface-500">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-xl shrink-0 border border-surface-200 dark:border-surface-700">
                            {getFileIcon(doc.fileType)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-surface-900 dark:text-white truncate max-w-xs md:max-w-md">
                              {doc.title}
                            </p>
                            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 flex items-center gap-2">
                              {doc.documentNumber && <span>No. {doc.documentNumber}</span>}
                              {doc.documentNumber && <span>•</span>}
                              <span>{doc.year}</span>
                              <span>•</span>
                              <span>{formatDate(doc.createdAt)}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        {doc.category ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700">
                            {doc.category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-surface-400 dark:text-surface-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-xs font-mono font-medium text-surface-600 dark:text-surface-400 uppercase">
                          {doc.fileType.split('/')[1] || doc.fileType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-surface-500 dark:text-surface-400 font-mono">
                          {formatFileSize(doc.fileSize)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden xl:table-cell">
                        <span className="text-xs text-surface-600 dark:text-surface-300">
                          {doc.uploadedBy || 'System Admin'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          doc.visibility === 'PUBLIC'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            doc.visibility === 'PUBLIC' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`} />
                          {doc.visibility}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                            title="Preview Dokumen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(doc)}
                            className="p-1.5 text-surface-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                            title="Edit Dokumen"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <a
                            href={`/api/documents/${doc.id}/download`}
                            className="p-1.5 text-surface-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setDeleteConfirmDoc(doc)}
                            className="p-1.5 text-surface-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && meta.totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50">
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Menampilkan <span className="font-semibold text-surface-900 dark:text-white">{documents.length}</span> dari <span className="font-semibold text-surface-900 dark:text-white">{meta.total}</span> dokumen (Halaman {meta.page} dari {meta.totalPages})
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload / Edit Premium Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity" onClick={() => !submitting && setShowForm(false)} />
          <div className="relative bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-2xl max-w-2xl w-full overflow-hidden animate-slide-up transition-colors my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/40">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-surface-900 dark:text-white">
                    {editDoc ? 'Edit Metadata Dokumen' : 'Upload Dokumen Digital'}
                  </h2>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {editDoc ? 'Perbarui informasi dan visibilitas berkas' : 'Unggah dokumen baru ke dalam perpustakaan digital'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="p-2 rounded-xl text-surface-400 hover:text-surface-600 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-start gap-3 text-rose-800 dark:text-rose-300 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <div className="flex-1">{formError}</div>
                </div>
              )}

              {/* Drag & Drop Area */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-2">
                  Berkas Dokumen {editDoc ? '(Opsional: Ganti file)' : '*'}
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 scale-[1.01]'
                      : file
                      ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/10'
                      : 'border-surface-300 dark:border-surface-700 bg-surface-50/40 dark:bg-surface-800/20 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-surface-50 dark:hover:bg-surface-800/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileSelect}
                  />

                  {file ? (
                    <div className="flex items-center justify-between gap-4 p-2">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0">
                          {getFileIcon(file.type || file.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-surface-500 dark:text-surface-400">
                            {formatFileSize(file.size)} • {file.type || 'Format terdeteksi'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto shadow-inner">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">
                          Drag & Drop dokumen di sini
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                          atau <span className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Pilih File</span> dari perangkat komputer Anda
                        </p>
                      </div>
                      <p className="text-[11px] text-surface-400 dark:text-surface-500">
                        Format didukung: PDF, DOCX, XLSX, PPTX, ZIP, PNG, JPG (Maks. 50MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Input Grid */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
                    Judul Dokumen *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Laporan Keuangan Tahunan 2026"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
                      Nomor Dokumen / Arsip
                    </label>
                    <input
                      type="text"
                      placeholder="SK-2026/049/ADM"
                      value={formData.documentNumber}
                      onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
                      Tahun *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                      className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
                      Kategori Dokumen
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
                      Visibilitas Akses
                    </label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'PUBLIC' | 'PRIVATE' })}
                      className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer"
                    >
                      <option value="PUBLIC">Publik (Dapat diakses siapapun)</option>
                      <option value="PRIVATE">Private (Khusus Admin)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-1.5">
                    Deskripsi Ringkas
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tuliskan gambaran ringkas mengenai dokumen ini..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                  />
                </div>
              </div>

              {/* Upload Progress Bar */}
              {submitting && (
                <div className="space-y-2 pt-2 animate-fade-in">
                  <div className="flex justify-between text-xs font-medium text-surface-600 dark:text-surface-300">
                    <span>Mengunggah dokumen ke peladen...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-cyan-500 transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-colors shadow-md shadow-primary-600/20 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editDoc ? 'Simpan Perubahan' : 'Upload Sekarang'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs" onClick={() => setDeleteConfirmDoc(null)} />
          <div className="relative bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shadow-2xl max-w-sm w-full animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-800/40">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-surface-900 dark:text-white">
              Hapus Dokumen?
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 mb-6">
              Anda yakin ingin menghapus <span className="font-semibold text-surface-900 dark:text-white">"{deleteConfirmDoc.title}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmDoc(null)}
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

      {/* Bulk Delete Confirm Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs" onClick={() => setShowBulkDeleteConfirm(false)} />
          <div className="relative bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shadow-2xl max-w-sm w-full animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-800/40">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-surface-900 dark:text-white">
              Hapus {selectedIds.length} Dokumen Masal?
            </h3>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 mb-6">
              Seluruh {selectedIds.length} dokumen terpilih akan dihapus permanen dari peladen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 py-2 text-xs font-medium text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 py-2 text-xs font-medium bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition-colors shadow-md shadow-rose-600/20"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs" onClick={() => setPreviewDoc(null)} />
          <div className="relative bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-2xl max-w-xl w-full p-6 overflow-hidden animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-surface-800 text-2xl flex items-center justify-center">
                  {getFileIcon(previewDoc.fileType)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-surface-900 dark:text-white leading-snug">
                    {previewDoc.title}
                  </h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                    {previewDoc.category?.name || 'Umum'} • {formatFileSize(previewDoc.fileSize)}
                  </p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1 text-surface-400 hover:text-surface-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/60 space-y-3 mb-6">
              <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed">
                {previewDoc.description || 'Tidak ada deskripsi rinci untuk dokumen ini.'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-surface-200 dark:border-surface-700/60 text-surface-500 dark:text-surface-400">
                <div>No. Dokumen: <span className="font-semibold text-surface-900 dark:text-white">{previewDoc.documentNumber || '-'}</span></div>
                <div>Tahun: <span className="font-semibold text-surface-900 dark:text-white">{previewDoc.year}</span></div>
                <div>Visibilitas: <span className="font-semibold text-surface-900 dark:text-white">{previewDoc.visibility}</span></div>
                <div>Diunggah: <span className="font-semibold text-surface-900 dark:text-white">{formatDate(previewDoc.createdAt)}</span></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPreviewDoc(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                Tutup
              </button>
              <a
                href={`/api/documents/${previewDoc.id}/download`}
                className="flex-1 py-2.5 text-xs font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-colors shadow-md shadow-primary-600/20 text-center flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Dokumen</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

