import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // =============================================
  // 1. Seed App Settings
  // =============================================
  const existingSettings = await prisma.appSetting.findFirst();
  if (!existingSettings) {
    await prisma.appSetting.create({
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
    console.log('✅ App settings seeded');
  } else {
    console.log('⏭️  App settings already exist, skipping');
  }

  // =============================================
  // 2. Seed Categories
  // =============================================
  const categoryData = [
    { name: 'Surat', description: 'Dokumen pengarsipan surat masuk & surat keluar resmi' },
    { name: 'Proposal', description: 'Dokumen pengajuan proposal kegiatan, program, dan anggaran' },
    { name: 'Laporan', description: 'Laporan pertanggungjawaban, evaluasi, dan rekapitulasi kerja' },
    { name: 'SK', description: 'Surat Keputusan pimpinan, direksi, atau instansi' },
    { name: 'Undangan', description: 'Dokumen surat undangan rapat, seminar, dan acara resmi' },
    { name: 'Administrasi', description: 'Dokumen kelengkapan administrasi operasional' },
    { name: 'Keuangan', description: 'Dokumen anggaran, kwitansi, nota, dan laporan keuangan' },
    { name: 'Kegiatan', description: 'Dokumen pelaksanaan kegiatan dan acara pendukung' },
    { name: 'Dokumentasi', description: 'Foto, liputan, dan bukti dokumentasi resmi' },
    { name: 'Lainnya', description: 'Dokumen pendukung dan berkas umum lainnya' },
  ];

  for (const cat of categoryData) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories seeded (10 default)');

  // =============================================
  // 3. Seed Admin User
  // =============================================
  const adminEmail = 'admin@arsipdigital.id';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await prisma.user.create({
      data: {
        name: 'Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user seeded (admin@arsipdigital.id / admin123)');
  } else {
    console.log('⏭️  Admin user already exists, skipping');
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
