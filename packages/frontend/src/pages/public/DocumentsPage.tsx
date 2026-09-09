import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Download, Eye, X, ChevronLeft, ChevronRight, FileText, Grid, List, RefreshCw, AlertCircle, User } from 'lucide-react';
import { documentsApi } from '../../api/documents.api';
import { categoriesApi } from '../../api/categories.api';
import type { Document, Category, PaginationMeta } from '../../types';
import { formatDate, formatFileSize, getCategoryBadgeStyle } from '../../utils/formatters';

export default function DocumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters from URL
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const year = searchParams.get('year') || '';
  const fileTypeFilter = searchParams.get('fileType') || '';
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data.data || []));
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [search, categoryId, year, fileTypeFilter, sortBy, page]);

  async function fetchDocuments() {
    setLoading(true);
    setError(false);
    try {
      const params: Record<string, any> = { page, limit: 12, sortBy, sortOrder: 'desc' };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (year) params.year = parseInt(year);

      const res = await documentsApi.getPublic(params);
      let docs = res.data.data || [];

      // Filter by file type in frontend if selected
      if (fileTypeFilter) {
        docs = docs.filter((d: Document) => d.fileType.toLowerCase().includes(fileTypeFilter.toLowerCase()));
      }

      setDocuments(docs);
      setMeta(res.data.meta || null);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  }

  function clearAllFilters() {
    setSearchParams(new URLSearchParams());
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

  const getSquareBadge = (doc: Document) => {
    const name = doc.category?.name || doc.title || 'Dokumen';
    const nameLower = name.toLowerCase();
    let text = 'DOC';

    if (nameLower.includes('keputusan') || nameLower.includes('sk')) text = 'SK';
    else if (nameLower.includes('edaran') || nameLower.includes('se')) text = 'SE';
    else if (nameLower.includes('peraturan') || nameLower.includes('per')) text = 'PER';
    else if (nameLower.includes('sop')) text = 'SOP';
    else if (nameLower.includes('laporan') || nameLower.includes('lp')) text = 'LP';
    else if (nameLower.includes('pengumuman')) text = 'PG';
    else if (nameLower.includes('informasi')) text = 'INF';
    else if (nameLower.includes('administrasi') || nameLower.includes('adm')) text = 'ADM';
    else if (nameLower.includes('lain')) text = 'OTH';
    else text = name.substring(0, 3).toUpperCase();

    const badgeStyle = getCategoryBadgeStyle(name);

    return (
      <div className={`w-11 h-11 rounded-2xl ${badgeStyle} font-black text-xs flex items-center justify-center shrink-0 shadow-sm uppercase tracking-wider`}>
        {text}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-slate-50 min-h-screen">
      {/* Sleek Hero Banner Card */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0B1A30] border border-blue-950 text-white p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-primary-300 border border-white/10 inline-block">
              Portal Pengarsipan Resmi
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Arsip Dokumen Publik
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Cari, temukan, dan unduh dokumen resmi Lapas Kelas IIA Bekasi sesuai kategori, tahun terbit, dan kata kunci.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-5 py-3.5 rounded-2xl text-center shadow-lg">
              <span className="text-2xl font-black text-white block">{meta?.total || documents.length || 0}</span>
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">Total Dokumen</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-5 py-3.5 rounded-2xl text-center shadow-lg">
              <span className="text-2xl font-black text-amber-400 block">{categories.length || 8}</span>
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">Kategori</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clean White Search & Filter Box */}
      <div className="bg-white text-slate-900 rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        {/* Large Search Input */}
        <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200/80 p-1.5 focus-within:ring-2 focus-within:ring-primary-500/40 focus-within:border-primary-500 transition-all">
          <Search className="ml-4 w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari kata kunci, judul dokumen, atau nomor SK..."
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateFilter('search', (e.target as HTMLInputElement).value);
              }
            }}
            className="w-full px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent text-sm font-semibold"
          />
          {search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="p-2 text-slate-400 hover:text-slate-600 mr-1"
              title="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              const input = (e.currentTarget.previousElementSibling?.previousElementSibling as HTMLInputElement) || (e.currentTarget.previousElementSibling as HTMLInputElement);
              if (input) updateFilter('search', input.value);
            }}
            className="px-6 py-3 bg-[#0066FF] hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-all shrink-0 shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
          >
            <Search className="w-4 h-4" />
            <span>Cari Dokumen</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => updateFilter('categoryId', e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer"
          >
            <option value="">📁 Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.documentCount})
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={year}
            onChange={(e) => updateFilter('year', e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer"
          >
            <option value="">📅 Semua Tahun</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* File Type Filter */}
          <select
            value={fileTypeFilter}
            onChange={(e) => updateFilter('fileType', e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer"
          >
            <option value="">📑 Semua Format File</option>
            <option value="pdf">PDF Document</option>
            <option value="word">Word (DOCX)</option>
            <option value="sheet">Excel (XLSX)</option>
            <option value="image">Gambar (JPG/PNG)</option>
          </select>

          {/* View Toggle Bar */}
          <div className="flex items-center justify-between bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 px-3">Tampilan:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#0066FF] text-white shadow-xs scale-105'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#0066FF] text-white shadow-xs scale-105'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Bar */}
        {(search || categoryId || year || fileTypeFilter) && (
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Aktif:
            </span>
            {search && (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl font-bold flex items-center gap-1.5 border border-blue-200">
                "{search}" <button onClick={() => updateFilter('search', '')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {categoryId && (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl font-bold flex items-center gap-1.5 border border-blue-200">
                Kategori: {categories.find((c) => c.id === categoryId)?.name} <button onClick={() => updateFilter('categoryId', '')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {year && (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl font-bold flex items-center gap-1.5 border border-blue-200">
                Tahun: {year} <button onClick={() => updateFilter('year', '')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {fileTypeFilter && (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl font-bold flex items-center gap-1.5 border border-blue-200">
                Format: {fileTypeFilter.toUpperCase()} <button onClick={() => updateFilter('fileType', '')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearAllFilters} className="text-red-500 font-bold hover:underline ml-auto flex items-center gap-1 text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Grid & Category Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Documents List / Grid */}
        <div className="lg:col-span-9 space-y-6">
          {error ? (
            /* Error State Box */
            <div className="bg-white text-slate-900 rounded-3xl border border-red-200 p-16 text-center shadow-sm">
              <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-3" />
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">Gagal Memuat Dokumen</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">Terjadi gangguan jaringan atau server. Silakan muat ulang.</p>
              <button
                onClick={fetchDocuments}
                className="px-6 py-3 bg-[#0066FF] text-white font-bold rounded-xl text-sm hover:bg-blue-600 transition-colors inline-flex items-center gap-2 shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Coba Lagi
              </button>
            </div>
          ) : loading ? (
            /* Skeleton Loading */
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`skeleton ${viewMode === 'grid' ? 'h-64' : 'h-24'} rounded-3xl`} />
              ))}
            </div>
          ) : documents.length === 0 ? (
            /* Stylish Empty State Box */
            <div className="bg-white text-slate-900 rounded-3xl border border-slate-200/80 p-16 text-center shadow-sm space-y-4">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-blue-100">
                <FileText className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">Tidak Ada Dokumen Ditemukan</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  {search ? `Tidak ada hasil untuk pencarian "${search}". Coba gunakan kata kunci lain.` : 'Belum ada dokumen publik yang diunggah untuk kategori atau filter ini.'}
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-[#0066FF] text-white font-bold rounded-xl text-xs hover:bg-blue-600 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" /> Reset Filter & Tampilkan Semua
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => {
                const badgeStyle = getCategoryBadgeStyle(doc.category?.name || doc.title);
                return (
                  <div
                    key={doc.id}
                    className="group bg-white text-slate-900 rounded-3xl border border-slate-200/80 hover:border-[#0066FF] p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover-lift flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        {getSquareBadge(doc)}
                        <span className={`text-[11px] px-3 py-1 rounded-lg font-extrabold shadow-xs ${badgeStyle}`}>
                          {doc.category?.name || 'Dokumen'}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base mb-2 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                        {doc.title}
                      </h3>

                      {doc.documentNumber && (
                        <p className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg w-fit mb-3 border border-slate-200">
                          No: {doc.documentNumber}
                        </p>
                      )}

                      <p className="text-xs text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                        {doc.description || 'Dokumen publik resmi Lapas Kelas IIA Bekasi.'}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100 mb-4 font-medium">
                        <span>📅 {formatDate(doc.createdAt)}</span>
                        <span className="font-bold text-slate-700">💾 {formatFileSize(doc.fileSize)}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="flex-1 text-center text-xs font-bold py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <a
                          href={`/api/documents/${doc.id}/download`}
                          className="flex-1 text-center text-xs font-bold py-2.5 bg-[#0066FF] text-white hover:bg-blue-600 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View Layout */
            <div className="bg-white text-slate-900 rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm divide-y divide-slate-100">
              {documents.map((doc) => {
                const badgeStyle = getCategoryBadgeStyle(doc.category?.name || doc.title);
                return (
                  <div key={doc.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      {getSquareBadge(doc)}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-base truncate">{doc.title}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ${badgeStyle}`}>
                            {doc.category?.name || 'Dokumen'}
                          </span>
                        </div>
                        <p className="text-xs font-mono font-semibold text-slate-500">
                          No. {doc.documentNumber || 'W.11.PAS.PAS.1-1234.01.2025'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                          <span>📅 {formatDate(doc.createdAt)}</span>
                          <span className="text-red-500 font-bold">📄 PDF</span>
                          <span>💾 {formatFileSize(doc.fileSize)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        className="px-4 py-2.5 text-xs font-bold bg-[#0066FF] text-white hover:bg-blue-600 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar Widget: Category Navigation Box */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white text-slate-900 rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Kategori Dokumen</span>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                {categories.length}
              </span>
            </h3>

            <div className="space-y-1.5">
              <button
                onClick={() => updateFilter('categoryId', '')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  !categoryId
                    ? 'bg-[#0066FF] text-white shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${!categoryId ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    ALL
                  </div>
                  <span>Semua Kategori</span>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${!categoryId ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {meta?.total || documents.length || 0}
                </span>
              </button>

              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                const badgeStyle = getCategoryBadgeStyle(cat.name);
                return (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('categoryId', cat.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0066FF] text-white shadow-sm scale-[1.02]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${badgeStyle}`} />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {cat.documentCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            disabled={page <= 1}
            onClick={() => updateFilter('page', String(page - 1))}
            className="p-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-300 hover:bg-surface-100 disabled:opacity-40 shadow-xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold px-4 text-surface-600 dark:text-surface-400">
            Halaman {page} dari {meta.totalPages}
          </span>
          <button
            disabled={page >= meta.totalPages}
            onClick={() => updateFilter('page', String(page + 1))}
            className="p-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-300 hover:bg-surface-100 disabled:opacity-40 shadow-xs"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Document Detail & Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewDoc(null)} />
          <div className="relative bg-white dark:bg-surface-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-slide-up border border-surface-200 dark:border-surface-800">
            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/50">
              <div>
                <h3 className="font-bold text-surface-900 dark:text-white text-lg">{previewDoc.title}</h3>
                <p className="text-xs text-surface-500 mt-1 flex items-center gap-2">
                  {previewDoc.documentNumber && <span>No: {previewDoc.documentNumber}</span>}
                  <span>•</span>
                  <span>Ukuran: {formatFileSize(previewDoc.fileSize)}</span>
                </p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-2 text-surface-400 hover:text-surface-900 dark:hover:text-white rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Document Details Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/60 text-xs">
                <div>
                  <span className="text-surface-400 font-medium block mb-0.5">Kategori</span>
                  <span className="font-bold text-surface-900 dark:text-white">{previewDoc.category?.name || '-'}</span>
                </div>
                <div>
                  <span className="text-surface-400 font-medium block mb-0.5">Tahun Terbit</span>
                  <span className="font-bold text-surface-900 dark:text-white">{previewDoc.year}</span>
                </div>
                <div>
                  <span className="text-surface-400 font-medium block mb-0.5">Tanggal Upload</span>
                  <span className="font-bold text-surface-900 dark:text-white">{formatDate(previewDoc.createdAt)}</span>
                </div>
                <div>
                  <span className="text-surface-400 font-medium block mb-0.5">Uploaded By</span>
                  <span className="font-bold text-surface-900 dark:text-white flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-primary-500" /> Admin System
                  </span>
                </div>
              </div>

              {/* Description */}
              {previewDoc.description && (
                <div className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed bg-surface-50 dark:bg-surface-800/30 p-4 rounded-2xl border border-surface-200/60 dark:border-surface-800">
                  <strong className="text-surface-900 dark:text-white block mb-1">Deskripsi Dokumen:</strong>
                  {previewDoc.description}
                </div>
              )}

              {/* Preview Frame */}
              <div className="border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-950 p-2">
                {previewDoc.fileType.includes('pdf') ? (
                  <iframe
                    src={previewDoc.fileUrl}
                    className="w-full h-[55vh] rounded-xl"
                    title={previewDoc.title}
                  />
                ) : previewDoc.fileType.includes('image') ? (
                  <img
                    src={previewDoc.fileUrl}
                    alt={previewDoc.title}
                    className="max-w-full h-auto mx-auto rounded-xl max-h-[55vh]"
                  />
                ) : (
                  <div className="text-center py-16 text-surface-500">
                    <FileText className="w-14 h-14 mx-auto mb-3 text-surface-400" />
                    <p className="font-bold text-surface-800 dark:text-surface-200 text-sm">Preview tidak tersedia untuk format file ini.</p>
                    <p className="text-xs mt-1">Silakan unduh dokumen untuk melihat isi berkas.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/50 flex justify-end gap-3">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2.5 text-xs font-bold text-surface-700 dark:text-surface-300 bg-surface-200/60 dark:bg-surface-800 hover:bg-surface-300 rounded-xl transition-colors"
              >
                Tutup
              </button>
              <a
                href={`/api/documents/${previewDoc.id}/download`}
                className="px-6 py-2.5 text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-primary-600/20"
              >
                <Download className="w-4 h-4" /> Download Dokumen
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


