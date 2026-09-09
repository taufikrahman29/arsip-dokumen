import prisma from '../config/database.js';
import { AppError } from '../utils/response.js';
import { storageService } from './storage.service.js';

export async function getSettings() {
  let settings = await prisma.appSetting.findFirst();

  if (!settings) {
    // Auto-create default settings if none exist
    settings = await prisma.appSetting.create({
      data: {
        siteTitle: 'Arsip Digital',
        siteTagline: 'Sistem Informasi Pengarsipan Dokumen Digital',
        institutionName: 'Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia',
        siteLogo: '/assets/logo.png',
        heroEmblem: '/assets/emblem.png',
        heroBg: '/assets/hero-bg.jpg',
        primaryColor: '#2563EB',
        heroOverlayOpacity: 75,
        heroOverlayColor: '#0F172A',
      },
    });
  }

  return settings;
}

export async function updateSettings(
  data: {
    siteTitle?: string;
    siteTagline?: string;
    institutionName?: string;
    primaryColor?: string;
    heroOverlayOpacity?: number;
    heroOverlayColor?: string;
  },
  files?: {
    siteLogo?: Express.Multer.File;
    heroEmblem?: Express.Multer.File;
    heroBg?: Express.Multer.File;
  }
) {
  let settings = await prisma.appSetting.findFirst();
  if (!settings) {
    settings = await getSettings();
  }

  const updateData: any = { ...data };

  // Process image uploads
  if (files?.siteLogo) {
    const result = storageService.processUploadedFile(files.siteLogo);
    updateData.siteLogo = result.fileUrl;
  }
  if (files?.heroEmblem) {
    const result = storageService.processUploadedFile(files.heroEmblem);
    updateData.heroEmblem = result.fileUrl;
  }
  if (files?.heroBg) {
    const result = storageService.processUploadedFile(files.heroBg);
    updateData.heroBg = result.fileUrl;
  }

  return prisma.appSetting.update({
    where: { id: settings.id },
    data: updateData,
  });
}
