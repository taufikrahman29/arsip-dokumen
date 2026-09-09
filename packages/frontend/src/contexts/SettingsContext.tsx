import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { settingsApi } from '../api/settings.api';
import type { AppSettings } from '../types';

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  id: 'default',
  siteTitle: 'Sistem Arsip Dokumen Publik',
  siteTagline: 'Portal resmi pengelolaan dan publikasi dokumen Lapas Kelas IIA Bekasi untuk transparansi dan pelayanan informasi.',
  institutionName: 'LAPAS KELAS IIA BEKASI',
  siteLogo: null,
  heroEmblem: null,
  heroBg: null,
  primaryColor: '#0066FF',
  heroOverlayOpacity: 85,
  heroOverlayColor: '#0B1A30',
  updatedAt: new Date().toISOString(),
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await settingsApi.get();
      if (res.data?.data) {
        setSettings(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load global app settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
