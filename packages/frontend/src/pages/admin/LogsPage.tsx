import { useState, useEffect } from 'react';
import { ScrollText, ChevronLeft, ChevronRight, Activity, Filter, Clock, Download, Trash2, Edit, FileUp, LogIn } from 'lucide-react';
import { logsApi } from '../../api/logs.api';
import type { ActivityLog, PaginationMeta } from '../../types';
import { formatDateTime } from '../../utils/formatters';

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');

  useEffect(() => { fetchLogs(); }, [page, action]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 15 };
      if (action) params.action = action;
      const res = await logsApi.getAll(params);
      setLogs(res.data.data || []);
      setMeta(res.data.meta || null);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }

  const getActionBadge = (actionName: string) => {
    switch (actionName) {
      case 'UPLOAD':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
          icon: FileUp,
        };
      case 'LOGIN':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50',
          icon: LogIn,
        };
      case 'UPDATE':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
          icon: Edit,
        };
      case 'DELETE':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
          icon: Trash2,
        };
      case 'DOWNLOAD':
        return {
          bg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50',
          icon: Download,
        };
      default:
        return {
          bg: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-700',
          icon: Activity,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <span>Activity Log Timeline</span>
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            Jejak audit dan rekaman seluruh aktivitas operasional pengguna dalam sistem.
          </p>
        </div>

        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500 pointer-events-none" />
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 appearance-none cursor-pointer shadow-xs"
          >
            <option value="">Semua Aktivitas</option>
            {['LOGIN', 'LOGOUT', 'UPLOAD', 'UPDATE', 'DELETE', 'DOWNLOAD'].map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Logs Table / Timeline Card */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/70 dark:bg-surface-800/40">
                <th className="px-6 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Jenis Aksi</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Keterangan Aktivitas</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider hidden md:table-cell">Pengguna</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider text-right">Waktu Eksekusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-800/60">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-6 py-4">
                      <div className="skeleton h-6 w-full rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 px-4">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 mb-3">
                        <ScrollText className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-semibold text-surface-900 dark:text-white">Belum Ada Log Aktivitas</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                        Riwayat aktivitas sistem akan terekam secara otomatis di sini.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const IconComp = badge.icon;
                  const userName = log.userName || log.user?.name || 'Administrator';
                  return (
                    <tr key={log.id} className="hover:bg-surface-50/80 dark:hover:bg-surface-800/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${badge.bg}`}>
                          <IconComp className="w-3.5 h-3.5" />
                          <span>{log.action}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-surface-900 dark:text-surface-100 leading-snug">
                          {log.description}
                        </p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center border border-primary-200 dark:border-primary-800">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
                            {userName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDateTime(log.createdAt)}</span>
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
              Menampilkan log <span className="font-semibold text-surface-900 dark:text-white">{logs.length}</span> dari <span className="font-semibold text-surface-900 dark:text-white">{meta.total}</span> riwayat (Halaman {meta.page} dari {meta.totalPages})
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
    </div>
  );
}

