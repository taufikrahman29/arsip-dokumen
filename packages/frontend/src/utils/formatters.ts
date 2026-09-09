export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getFileIcon(fileType: string): string {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
  if (fileType.includes('image')) return '🖼️';
  return '📎';
}

export function getActionColor(action: string): string {
  const colors: Record<string, string> = {
    LOGIN: 'bg-blue-100 text-blue-700',
    LOGOUT: 'bg-gray-100 text-gray-700',
    UPLOAD: 'bg-emerald-100 text-emerald-700',
    UPDATE: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-rose-100 text-rose-700',
    DOWNLOAD: 'bg-indigo-100 text-indigo-700',
  };
  return colors[action] || 'bg-gray-100 text-gray-700';
}

export function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const backendBase = apiUrl.replace(/\/api\/?$/, '');
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function getCategoryBadgeStyle(categoryName?: string): string {
  if (!categoryName) return 'bg-slate-700 text-white';
  const name = categoryName.toLowerCase().trim();

  if (name.includes('keputusan') || name.includes('sk')) return 'bg-blue-600 text-white';
  if (name.includes('edaran') || name.includes('se')) return 'bg-emerald-600 text-white';
  if (name.includes('peraturan') || name.includes('per')) return 'bg-amber-600 text-white';
  if (name.includes('sop')) return 'bg-indigo-600 text-white';
  if (name.includes('laporan') || name.includes('lp')) return 'bg-purple-600 text-white';
  if (name.includes('pengumuman')) return 'bg-rose-600 text-white';
  if (name.includes('informasi')) return 'bg-teal-600 text-white';
  if (name.includes('administrasi') || name.includes('adm')) return 'bg-sky-500 text-white';
  if (name.includes('lain')) return 'bg-slate-700 text-white';

  const palette = [
    'bg-blue-600 text-white',
    'bg-emerald-600 text-white',
    'bg-amber-600 text-white',
    'bg-indigo-600 text-white',
    'bg-purple-600 text-white',
    'bg-rose-600 text-white',
    'bg-teal-600 text-white',
    'bg-sky-600 text-white',
    'bg-pink-600 text-white',
    'bg-cyan-600 text-white',
    'bg-orange-600 text-white',
    'bg-slate-700 text-white',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
}
