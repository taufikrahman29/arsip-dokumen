import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ArrowRight, FileText, FileCheck, Scale, ClipboardList, BarChart3, Megaphone, Globe, Folder, FileCode } from 'lucide-react';
import { documentsApi } from '../../api/documents.api';
import type { Document } from '../../types';
import { formatDate, formatFileSize, resolveAssetUrl, getCategoryBadgeStyle } from '../../utils/formatters';

import { useSettings } from '../../contexts/SettingsContext';

export default function HomePage() {
  const { settings } = useSettings();
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const docsRes = await documentsApi.getPublic({ limit: 4, sortBy: 'created_at', sortOrder: 'desc' });
        setRecentDocs(docsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const quickCategories = [
    { name: 'Surat Keputusan', icon: FileText },
    { name: 'Surat Edaran', icon: FileCheck },
    { name: 'Peraturan', icon: Scale },
    { name: 'SOP', icon: ClipboardList },
    { name: 'Laporan', icon: BarChart3 },
    { name: 'Pengumuman', icon: Megaphone },
    { name: 'Informasi Publik', icon: Globe },
    { name: 'Lainnya', icon: Folder },
  ];

  const getBadgeStyle = (categoryName?: string) => {
    return getCategoryBadgeStyle(categoryName);
  };

  const bgUrl = resolveAssetUrl(settings.heroBg) || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80';
  const emblemUrl = resolveAssetUrl(settings.heroEmblem);

  const overlayColor = settings.heroOverlayColor || '#0B1A30';
  const overlayOpacity = (settings.heroOverlayOpacity ?? 75) / 100;
  const primaryColor = settings.primaryColor || '#0066FF';

  return (
    <div className="bg-slate-50 min-h-screen overflow-hidden">
      {/* Hero Section with Dynamic Background & Overlay */}
      <section
        className="relative py-20 lg:py-28 text-white overflow-hidden transition-colors duration-500"
        style={{ backgroundColor: overlayColor }}
      >
        {/* Background Building Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url('${bgUrl}')` }}
        />

        {/* Dynamic Overlay Color & Transparency Layer */}
        <div
          className="absolute inset-0 transition-all duration-300 pointer-events-none"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center space-y-6">
            {/* Custom Hero Emblem if uploaded */}
            {emblemUrl && (
              <div className="inline-block p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-1 max-w-md mx-auto shadow-lg">
                <img src={emblemUrl} alt="Hero Emblem" className="h-16 object-contain rounded-xl mx-auto" />
              </div>
            )}

            {/* Title - Pure white both lines */}
            <div className="space-y-1.5 text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {settings.siteTitle || 'Sistem Arsip Dokumen Publik'}
              </h1>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {settings.institutionName || 'Lapas Kelas IIA Bekasi'}
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-2xl mx-auto text-center">
              {settings.siteTagline || 'Portal resmi pengelolaan dan publikasi dokumen Lapas Kelas IIA Bekasi untuk transparansi dan pelayanan informasi.'}
            </p>

            {/* Big Search Bar */}
            <div className="pt-2 max-w-2xl w-full mx-auto">
              <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-2xl border border-white/20">
                <input
                  type="text"
                  placeholder="Cari dokumen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/documents?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="w-full px-5 py-3 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none bg-transparent"
                />
                <Link
                  to={searchQuery.trim() ? `/documents?search=${encodeURIComponent(searchQuery)}` : '/documents'}
                  style={{ backgroundColor: primaryColor }}
                  className="px-6 py-3 hover:brightness-110 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center shadow-md shrink-0 cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Quick Icon Bar */}
      <section className="relative z-10 -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-4 sm:p-6">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4 text-center">
            {quickCategories.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={`/documents?search=${encodeURIComponent(item.name)}`}
                  className="flex flex-col items-center gap-2.5 p-3 rounded-2xl hover:bg-slate-100/80 transition-all duration-200 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0066FF] shadow-xs group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-800 leading-tight group-hover:text-[#0066FF]">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dokumen Terbaru Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Dokumen Terbaru
            </h2>
            <Link
              to="/documents"
              className="text-xs font-bold text-[#0066FF] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-64 rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentDocs.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl transition-all duration-200 hover-lift flex flex-col justify-between"
                >
                  <div>
                    {/* Badge */}
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-extrabold mb-3 ${getBadgeStyle(doc.category?.name || doc.title)}`}>
                      {doc.category?.name || 'Dokumen'}
                    </span>

                    {/* Title */}
                    <h3 className="font-extrabold text-slate-900 text-sm mb-2 line-clamp-2 leading-snug">
                      {doc.title}
                    </h3>

                    {/* Document Number */}
                    <p className="text-[11px] font-mono font-medium text-slate-500 mb-3 truncate">
                      No. {doc.documentNumber || 'W.11.PAS.PAS.1-1234.01.2025'}
                    </p>

                    {/* Meta info */}
                    <div className="space-y-1.5 text-xs text-slate-500 mb-6">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-slate-600">
                        <span className="flex items-center gap-1 text-red-500 font-bold">
                          <FileCode className="w-3.5 h-3.5" /> PDF
                        </span>
                        <span>💾 {formatFileSize(doc.fileSize)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Button Lihat Detail */}
                  <Link
                    to={`/documents?search=${encodeURIComponent(doc.title)}`}
                    className="w-full text-center py-2.5 px-4 bg-white text-[#0066FF] border border-[#0066FF]/40 hover:bg-blue-50 rounded-xl text-xs font-bold transition-colors block"
                  >
                    Lihat Detail
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}



