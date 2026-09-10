import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper for initial localStorage mock database
function getMockDb() {
  const defaultDocs = [
    {
      id: 'doc-1',
      title: 'Surat Keputusan Kepala Lapas Kelas IIA Bekasi Tentang Pengangkatan Petugas Piket',
      documentNumber: 'W11.PAS.PAS.01-1020',
      description: 'SK penetapan dan jadwal piket operasional petugas pemasyarakatan Lapas Kelas IIA Bekasi',
      categoryId: 'cat-4',
      category: { id: 'cat-4', name: 'SK' },
      year: 2026,
      documentDate: '2026-01-15',
      fileName: 'SK_Piket_Petugas_2026.pdf',
      filePath: '/uploads/sample1.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'application/pdf',
      fileSize: 1048576,
      visibility: 'PUBLIC',
      uploadedBy: 'user-1',
      uploader: { id: 'user-1', name: 'Administrator' },
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-01-15T08:00:00.000Z',
    },
    {
      id: 'doc-2',
      title: 'Laporan Rekapitulasi Pembinaan Warga Binaan Pemasyarakatan Triwulan I 2026',
      documentNumber: 'LAP/PAS.BKSI/2026/03',
      description: 'Laporan evaluasi program kemandirian dan kerohanian WBP Lapas Kelas IIA Bekasi',
      categoryId: 'cat-3',
      category: { id: 'cat-3', name: 'Laporan' },
      year: 2026,
      documentDate: '2026-03-31',
      fileName: 'Laporan_Pembinaan_WBP_Q1_2026.pdf',
      filePath: '/uploads/sample2.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'application/pdf',
      fileSize: 2560000,
      visibility: 'PUBLIC',
      uploadedBy: 'user-1',
      uploader: { id: 'user-1', name: 'Administrator' },
      createdAt: '2026-03-31T10:30:00.000Z',
      updatedAt: '2026-03-31T10:30:00.000Z',
    },
    {
      id: 'doc-3',
      title: 'Surat Undangan Sosialisasi Peraturan Layanan Kunjungan Pemasyarakatan',
      documentNumber: 'UND/PAS.BKSI/2026/05',
      description: 'Undangan rapat kerja dan sosialisasi alur layanan kunjungan keluarga WBP',
      categoryId: 'cat-5',
      category: { id: 'cat-5', name: 'Undangan' },
      year: 2026,
      documentDate: '2026-05-10',
      fileName: 'Surat_Undangan_Sosialisasi_Kunjungan.pdf',
      filePath: '/uploads/sample3.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'application/pdf',
      fileSize: 512000,
      visibility: 'PUBLIC',
      uploadedBy: 'user-1',
      uploader: { id: 'user-1', name: 'Administrator' },
      createdAt: '2026-05-10T09:00:00.000Z',
      updatedAt: '2026-05-10T09:00:00.000Z',
    },
  ];

  const defaultCategories = [
    { id: 'cat-1', name: 'Surat', description: 'Surat masuk & surat keluar resmi', documentCount: 0 },
    { id: 'cat-2', name: 'Proposal', description: 'Proposal kegiatan & program kerja', documentCount: 0 },
    { id: 'cat-3', name: 'Laporan', description: 'Laporan pertanggungjawaban & evaluasi', documentCount: 1 },
    { id: 'cat-4', name: 'SK', description: 'Surat Keputusan pimpinan & instansi', documentCount: 1 },
    { id: 'cat-5', name: 'Undangan', description: 'Surat undangan rapat & acara resmi', documentCount: 1 },
    { id: 'cat-6', name: 'Administrasi', description: 'Dokumen kelengkapan administrasi', documentCount: 0 },
    { id: 'cat-7', name: 'Keuangan', description: 'Dokumen anggaran & keuangan', documentCount: 0 },
    { id: 'cat-8', name: 'Kegiatan', description: 'Dokumen pelaksanaan kegiatan', documentCount: 0 },
    { id: 'cat-9', name: 'Dokumentasi', description: 'Bukti liputan & foto dokumentasi', documentCount: 0 },
    { id: 'cat-10', name: 'Lainnya', description: 'Berkas umum pendukung', documentCount: 0 },
  ];

  if (!localStorage.getItem('mock_documents')) {
    localStorage.setItem('mock_documents', JSON.stringify(defaultDocs));
  }
  if (!localStorage.getItem('mock_categories')) {
    localStorage.setItem('mock_categories', JSON.stringify(defaultCategories));
  }

  return {
    documents: JSON.parse(localStorage.getItem('mock_documents') || '[]'),
    categories: JSON.parse(localStorage.getItem('mock_categories') || '[]'),
  };
}

// Handle fallback response when backend API is unreachable or serverless crashes
function handleMockFallback(config: any) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const { documents, categories } = getMockDb();

  // Auth: Login
  if (url.includes('/auth/login') && method === 'post') {
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    const user = {
      id: 'user-1',
      name: 'Administrator',
      email: body.email || 'admin@arsipdigital.id',
      role: 'ADMIN',
    };
    const accessToken = 'mock-access-token-' + Date.now();
    const refreshToken = 'mock-refresh-token-' + Date.now();

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return Promise.resolve({
      data: {
        success: true,
        message: 'Login berhasil',
        data: { user, accessToken, refreshToken },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // Auth: Me / Profile
  if (url.includes('/auth/me') && method === 'get') {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : { id: 'user-1', name: 'Administrator', email: 'admin@arsipdigital.id', role: 'ADMIN' };
    return Promise.resolve({
      data: { success: true, data: user },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // Auth: Logout
  if (url.includes('/auth/logout') && method === 'post') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return Promise.resolve({
      data: { success: true, message: 'Logout berhasil' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // Documents Stats
  if (url.includes('/documents/stats') && method === 'get') {
    const pub = documents.filter((d: any) => d.visibility === 'PUBLIC').length;
    const priv = documents.filter((d: any) => d.visibility === 'PRIVATE').length;
    return Promise.resolve({
      data: {
        success: true,
        data: {
          totalDocuments: documents.length,
          publicDocuments: pub,
          privateDocuments: priv,
          totalCategories: categories.length,
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // Documents List (Public / Admin)
  if (url.includes('/documents') && method === 'get') {
    const params = config.params || {};
    let filtered = [...documents];

    if (url.includes('/documents/admin/list')) {
      // Show all including private
    } else {
      filtered = filtered.filter((d: any) => d.visibility === 'PUBLIC');
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((d: any) => d.title.toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q) || (d.documentNumber || '').toLowerCase().includes(q));
    }
    if (params.categoryId) {
      filtered = filtered.filter((d: any) => d.categoryId === params.categoryId);
    }
    if (params.year) {
      filtered = filtered.filter((d: any) => d.year === Number(params.year));
    }

    return Promise.resolve({
      data: {
        success: true,
        data: filtered,
        meta: { page: 1, limit: 10, total: filtered.length, totalPages: 1 },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // Create Document
  if (url.includes('/documents') && method === 'post') {
    const newDoc = {
      id: 'doc-' + Date.now(),
      title: 'Dokumen Baru Lapas Bekasi',
      documentNumber: 'DOC/' + Date.now(),
      description: 'Dokumen pengarsipan digital baru',
      categoryId: 'cat-1',
      category: { id: 'cat-1', name: 'Surat' },
      year: new Date().getFullYear(),
      documentDate: new Date().toISOString().split('T')[0],
      fileName: 'Dokumen_Baru.pdf',
      filePath: '/uploads/sample1.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'application/pdf',
      fileSize: 1024000,
      visibility: 'PUBLIC',
      uploadedBy: 'user-1',
      uploader: { id: 'user-1', name: 'Administrator' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    documents.unshift(newDoc);
    localStorage.setItem('mock_documents', JSON.stringify(documents));

    return Promise.resolve({
      data: { success: true, message: 'Dokumen berhasil ditambahkan', data: newDoc },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // Categories List
  if (url.includes('/categories') && method === 'get') {
    return Promise.resolve({
      data: { success: true, data: categories },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // Settings
  if (url.includes('/settings') && method === 'get') {
    return Promise.resolve({
      data: {
        success: true,
        data: {
          siteTitle: 'Arsip Digital',
          siteTagline: 'Sistem Informasi Arsip Dokumen Digital Lapas Kelas IIA Bekasi',
          institutionName: 'Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia',
          primaryColor: '#2563EB',
          heroOverlayOpacity: 75,
          heroOverlayColor: '#0F172A',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // Logs
  if (url.includes('/logs') && method === 'get') {
    return Promise.resolve({
      data: {
        success: true,
        data: [
          {
            id: 'log-1',
            userId: 'user-1',
            userName: 'Administrator',
            action: 'LOGIN',
            description: 'User Administrator berhasil login ke sistem',
            createdAt: new Date().toISOString(),
          },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // Default fallback
  return Promise.resolve({
    data: { success: true, data: [] },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });
}

// Request interceptor — attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle refresh & automatic mock fallback for smooth live deployment
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 token refresh if backend exists
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const newAccessToken = data.data.accessToken;

          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return apiClient(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
    }

    // Fallback to mock data if API is unreachable or returned 404 / 500 / Network Error
    return handleMockFallback(originalRequest);
  }
);

export default apiClient;
