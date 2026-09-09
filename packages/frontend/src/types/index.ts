// =============================================
// API Response Types
// =============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// =============================================
// Entity Types
// =============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  documentNumber: string | null;
  description: string | null;
  categoryId: string | null;
  year: number;
  documentDate: string | null;
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  visibility: 'PUBLIC' | 'PRIVATE';
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category: { id: string; name: string } | null;
  uploader: { id: string; name: string } | null;
}

export interface ActivityLog {
  id: string;
  userId: string | null;
  userName: string | null;
  action: 'LOGIN' | 'LOGOUT' | 'UPLOAD' | 'UPDATE' | 'DELETE' | 'DOWNLOAD';
  documentId: string | null;
  description: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
  document: { id: string; title: string } | null;
}

export interface AppSettings {
  id: string;
  siteTitle: string;
  siteTagline: string;
  institutionName: string;
  siteLogo: string | null;
  heroEmblem: string | null;
  heroBg: string | null;
  primaryColor: string;
  heroOverlayOpacity: number;
  heroOverlayColor: string;
  updatedAt: string;
}

export interface DocumentStats {
  totalDocuments: number;
  totalPublic: number;
  totalPrivate: number;
  totalCategories: number;
}

// =============================================
// Auth Types
// =============================================

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
