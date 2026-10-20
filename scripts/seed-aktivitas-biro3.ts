import { PrismaClient, UserRole, MeetingStatus, AttendanceStatus, ActionItemStatus, ActionItemPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const OFFICIAL_BIROS = [
  {
    code: 'IKK',
    name: 'Biro Investasi, Kerja Sama, dan Komunikasi (Biro 3)',
    shortName: 'Biro 3 (IKK)',
    description: 'Pusat pemantauan aktivitas, koordinasi investasi, kemitraan strategis kerja sama, komunikasi publik, dan sistem informasi Sekretariat Dewan Nasional KEK.',
  },
  {
    code: 'BPPK',
    name: 'Biro Perencanaan dan Pembentukan Kawasan Ekonomi Khusus',
    shortName: 'Biro Perencanaan & Pembentukan',
    description: 'Perencanaan tata ruang, studi kelayakan penetapan kawasan, evaluasi usulan pembentukan, dan pengawasan pembangunan KEK.',
  },
  {
    code: 'PKKEK',
    name: 'Biro Pengendalian Kawasan Ekonomi Khusus',
    shortName: 'Biro Pengendalian',
    description: 'Pemantauan berkala operasional, kesiapan infrastruktur logistik, pemenuhan standar tata kelola, dan pengendalian kawasan.',
  },
  {
    code: 'HSDMO',
    name: 'Biro Hukum, Sumber Daya Manusia, dan Organisasi',
    shortName: 'Biro Hukum, SDM & Organisasi',
    description: 'Harmonisasi regulasi fasilitas kepabeanan/pajak, advokasi hukum, penataan organisasi, dan SDM.',
  },
  {
    code: 'UK',
    name: 'Biro Umum dan Keuangan',
    shortName: 'Biro Umum & Keuangan',
    description: 'Tata kelola administrasi persuratan, perbendaharaan APBN, pengadaan barang/jasa, dukungan persidangan, dan rumah tangga.',
  },
];

// 5 Tim Resmi Biro 3 Sesuai Catatan Mentor (Poin 6, 19)
const BIRO_3_TEAMS = [
  {
    code: 'INV',
    name: 'Tim Investasi',
    description: 'Fasilitasi, promosi, dan pemantauan realisasi investasi penanaman modal dalam dan luar negeri di Kawasan Ekonomi Khusus.',
  },
  {
    code: 'KS',
    name: 'Tim Kerja Sama',
    description: 'Penyusunan nota kesepahaman (MoU), perjanjian kerja sama bilateral/multilateral, dan koordinasi kemitraan lintas sektor.',
  },
  {
    code: 'KOM',
    name: 'Tim Komunikasi',
    description: 'Pengelolaan siaran pers, publikasi media massa, dokumentasi kegiatan, dan strategi kehumasan Dewan Nasional KEK.',
  },
  {
    code: 'SI',
    name: 'Tim Sistem Informasi',
    description: 'Pengembangan teknologi informasi, otomatisasi sistem pencatatan logbook, dan pengelolaan portal digital Biro 3.',
  },
  {
    code: 'POKJA',
    name: 'Pokja (Kelompok Kerja)',
    description: 'Gugus tugas ad-hoc untuk penyelesaian isu-isu strategis, debottlenecking, dan penugasan lintas kewenangan KEK.',
  },
];

async function main() {
  console.log('=== MEMULAI SEEDING AKTIVITAS BIRO 3 (DATABASE NEON BARU) ===');

  // 1. Seed Biro
  const biroMap = new Map<string, string>();
  for (const b of OFFICIAL_BIROS) {
    const biro = await prisma.biro.upsert({
      where: { code: b.code },
      update: { name: b.name, shortName: b.shortName, description: b.description, isActive: true },
      create: { code: b.code, name: b.name, shortName: b.shortName, description: b.description, isActive: true },
    });
    biroMap.set(b.code, biro.id);
    console.log(`[BIRO] ${biro.code} - ${biro.shortName}`);
  }

  const biro3Id = biroMap.get('IKK')!;

  // 2. Seed 5 Tim Resmi Biro 3
  console.log('\n--- Menyemai 5 Tim Biro 3 ---');
  const teamMap = new Map<string, string>(); // code -> id
  for (const t of BIRO_3_TEAMS) {
    const team = await prisma.biroTeam.upsert({
      where: { biroId_code: { biroId: biro3Id, code: t.code } },
      update: { name: t.name, description: t.description, isActive: true },
      create: {
        biroId: biro3Id,
        code: t.code,
        name: t.name,
        description: t.description,
        isActive: true,
      },
    });
    teamMap.set(t.code, team.id);
    console.log(`[TIM BIRO 3] ${team.code} - ${team.name} (ID: ${team.id})`);
  }

  // 3. Seed Pengguna (Users) & UserTeam fleksibel (Poin 8, 16)
  console.log('\n--- Menyemai Pengguna & Hak Akses Multi-Tim ---');
  const defaultPasswordHash = await bcrypt.hash('AktivitasBiro3!2026', 10);

  const usersData = [
    {
      name: 'Super Admin Biro 3',
      email: 'superadmin@kek.go.id',
      role: UserRole.SUPER_ADMIN,
      primaryTeamCode: 'SI',
    },
    {
      name: 'Dr. Hendra Suprayitno, M.Si (Pimpinan Biro 3)',
      email: 'pimpinan.biro3@kek.go.id',
      role: UserRole.PIMPINAN,
      primaryTeamCode: 'INV',
    },
    {
      name: 'Rizki Agustianto (Staff Kerja Sama)',
      email: 'staf.kerjasama@kek.go.id',
      role: UserRole.STAFF,
      primaryTeamCode: 'KS',
    },
    {
      name: 'Maya Puspita, S.Sos (Staff Investasi)',
      email: 'staf.investasi@kek.go.id',
      role: UserRole.STAFF,
      primaryTeamCode: 'INV',
    },
    {
      name: 'Budi Santoso, S.I.Kom (Staff Komunikasi)',
      email: 'staf.komunikasi@kek.go.id',
      role: UserRole.STAFF,
      primaryTeamCode: 'KOM',
    },
    {
      name: 'Ahmad Fauzi, S.Kom (Staff Sistem Informasi)',
      email: 'staf.si@kek.go.id',
      role: UserRole.STAFF,
      primaryTeamCode: 'SI',
    },
    {
      name: 'Siti Rahmawati, M.Sc (Staff Pokja)',
      email: 'staf.pokja@kek.go.id',
      role: UserRole.STAFF,
      primaryTeamCode: 'POKJA',
    },
  ];

  const userMap = new Map<string, string>();
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email.toLowerCase().trim() },
      update: {
        name: u.name,
        role: u.role,
        biroId: biro3Id,
        teamId: teamMap.get(u.primaryTeamCode),
        password: defaultPasswordHash,
        isActive: true,
      },
      create: {
        name: u.name,
        email: u.email.toLowerCase().trim(),
        role: u.role,
        biroId: biro3Id,
        teamId: teamMap.get(u.primaryTeamCode),
        password: defaultPasswordHash,
        isActive: true,
      },
    });
    userMap.set(u.email, user.id);

    // Seed UserTeam agar user bisa terhubung ke semua tim Biro 3 secara fleksibel (Poin 8)
    for (const [teamCode, teamId] of teamMap.entries()) {
      await prisma.userTeam.upsert({
        where: { userId_teamId: { userId: user.id, teamId: teamId } },
        update: { role: u.primaryTeamCode === teamCode ? 'PJ_UTAMA' : 'ANGGOTA' },
        create: {
          userId: user.id,
          teamId: teamId,
          role: u.primaryTeamCode === teamCode ? 'PJ_UTAMA' : 'ANGGOTA',
        },
      });
    }
    console.log(`[USER] ${user.name} (${user.email}) -> Role: ${user.role}, Tim Utama: ${u.primaryTeamCode}`);
  }

  // 4. Seed Aktivitas / Kegiatan Biro 3
  console.log('\n--- Menyemai Aktivitas & Kegiatan Biro 3 ---');
  const activitiesData = [
    // --- TIM KERJA SAMA (KS) - Poin 18: Banyak kegiatan agar lengkap ---
    {
      meetingNumber: 'KS-001',
      title: 'Penyusunan Draf MoU Kemitraan Strategis KEK Mandalika dengan Investor Pariwisata Qatar',
      teamCode: 'KS',
      date: new Date('2026-10-22T09:00:00.000Z'),
      startTime: '09:00',
      endTime: '11:30',
      location: 'Ruang Rapat Graha Satwika Lt. 3 & Hybrid',
      status: MeetingStatus.APPROVED,
      progressStatus: 'Dalam Proses',
      actionPlan: 'Rutin',
      meetingKind: 'Rapat Kerja',
      documentCategory: 'UNDANGAN_INTERNAL',
      picName: 'Rizki Agustianto',
      driveLink: 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ_KEK_KS01',
      notes: 'Telah disepakati 5 poin klausul kerja sama penanaman modal dan perlindungan hukum investor. Draf final diteruskan ke Bagian Hukum.',
      ndConsumptionNumber: 'ND.102/IKK.KS/X/2026',
      ndConsumptionStatus: 'Disetujui',
      releaseUrl: 'https://kek.go.id/berita/akselerasi-mou-mandalika-qatar-2026',
      releaseTitle: 'Akselerasi Kemitraan KEK Mandalika dengan Investor Timur Tengah',
    },
    {
      meetingNumber: 'KS-002',
      title: 'Harmonisasi Perjanjian Kerja Sama (PKS) Penyediaan Infrastruktur Logistik Pelabuhan KEK Sei Mangkei',
      teamCode: 'KS',
      date: new Date('2026-10-18T13:30:00.000Z'),
      startTime: '13:30',
      endTime: '16:00',
      location: 'Executive Lounge Lantai 2 Posko Monitoring KEK',
      status: MeetingStatus.FINAL,
      progressStatus: 'Selesai',
      actionPlan: 'Rutin',
      meetingKind: 'Penandatanganan Mou',
      documentCategory: 'DISPOSISI_SEKJEN',
      picName: 'Rizki Agustianto',
      driveLink: 'https://drive.google.com/drive/folders/1pKsSeiMangkeiLogistik_PKS_2026',
      notes: 'Perjanjian kerja sama telah ditandatangani oleh kedua pihak. Salinan dokumen disimpan di arsip digital.',
      ndConsumptionNumber: 'ND.098/IKK.KS/X/2026',
      ndConsumptionStatus: 'Selesai Dibayarkan',
      releaseUrl: 'https://kek.go.id/berita/penandatanganan-pks-pelabuhan-sei-mangkei',
      releaseTitle: 'Biro 3 Fasilitasi PKS Logistik Pelabuhan Sei Mangkei',
    },
    {
      meetingNumber: 'KS-003',
      title: 'Kunjungan Kerja Lapangan & Audiensi Kemitraan Usaha Mikro KEK Sanur Bali',
      teamCode: 'KS',
      date: new Date('2026-10-14T08:30:00.000Z'),
      startTime: '08:30',
      endTime: '15:00',
      location: 'Hotel Grand Inna Bali Beach, Kawasan Sanur',
      status: MeetingStatus.FINAL,
      progressStatus: 'Selesai',
      actionPlan: 'Non-Rutin',
      meetingKind: 'Kunker',
      documentCategory: 'DISPOSISI_SEKJEN',
      picName: 'Rizki Agustianto',
      driveLink: 'https://drive.google.com/drive/folders/1kunkerSanurBali2026_Dokumentasi',
      notes: 'Audiensi bersama 40 pelaku UMKM lokal selesai. Hasil evaluasi diserahkan ke Pimpinan untuk tindak lanjut pembinaan.',
      ndConsumptionNumber: 'ND.089/IKK.KS/X/2026',
      ndConsumptionStatus: 'Disetujui',
      releaseUrl: 'https://kek.go.id/berita/kunker-biro-3-kemitraan-sanur-bali',
      releaseTitle: 'Pemberdayaan Kemitraan UMKM Lokal di KEK Sanur',
    },
    {
      meetingNumber: 'KS-004',
      title: 'Koordinasi Lintas Sektor Fasilitasi Kerja Sama Ekspor Hasil Industri KEK Kendal ke Pasar ASEAN',
      teamCode: 'KS',
      date: new Date('2026-10-25T10:00:00.000Z'),
      startTime: '10:00',
      endTime: '12:00',
      location: 'Ruang Lokasandhi Lt. 2 Kemenko Perekonomian',
      status: MeetingStatus.DRAFT,
      progressStatus: 'Belum Dimulai',
      actionPlan: 'Rutin',
      meetingKind: 'Rapat/Audiensi',
      documentCategory: 'UNDANGAN_INTERNAL',
      picName: 'Rizki Agustianto',
      driveLink: 'https://drive.google.com/drive/folders/1agendaEksporKendalASEAN2026',
      notes: 'Persiapan materi presentasi dan konfirmasi kehadiran perwakilan Kementerian Perdagangan serta Pengelola KEK Kendal.',
      ndConsumptionNumber: 'ND.105/IKK.KS/X/2026',
      ndConsumptionStatus: 'Dalam Proses Pengajuan',
      releaseUrl: '',
      releaseTitle: '',
    },

    // --- TIM INVESTASI (INV) ---
    {
      meetingNumber: 'INV-001',
      title: 'Fasilitasi Debottlenecking Realisasi Investasi Pabrik Baterai EV di KEK Morowali',
      teamCode: 'INV',
      date: new Date('2026-10-21T09:00:00.000Z'),
      startTime: '09:00',
      endTime: '12:00',
      location: 'Ruang Rapat Graha Satwika Lt. 3',
      status: MeetingStatus.APPROVED,
      progressStatus: 'Dalam Proses',
      actionPlan: 'Rutin',
      meetingKind: 'Rapat Kerja',
      documentCategory: 'UNDANGAN_INTERNAL',
      picName: 'Maya Puspita, S.Sos',
      driveLink: 'https://drive.google.com/drive/folders/1invEVBatteryMorowali2026',
      notes: 'Identifikasi 3 kendala perizinan lahan dan ketersediaan suplai daya listrik green energy. Telah diterbitkan rekomendasi percepatan.',
      ndConsumptionNumber: 'ND.095/IKK.INV/X/2026',
      ndConsumptionStatus: 'Disetujui',
      releaseUrl: 'https://kek.go.id/berita/akselerasi-investasi-baterai-ev-morowali',
      releaseTitle: 'Biro 3 Kawal Percepatan Investasi Pabrik Baterai EV di KEK Morowali',
    },
    {
      meetingNumber: 'INV-002',
      title: 'Evaluasi Capaian Investasi Triwulan III dan Pemutakhiran Database Minat Investor KEK',
      teamCode: 'INV',
      date: new Date('2026-10-12T13:30:00.000Z'),
      startTime: '13:30',
      endTime: '16:00',
      location: 'Ruang Rapat Biro IKK',
      status: MeetingStatus.FINAL,
      progressStatus: 'Selesai',
      actionPlan: 'Rutin',
      meetingKind: 'Rapat Kerja',
      documentCategory: 'UNDANGAN_INTERNAL',
      picName: 'Maya Puspita, S.Sos',
      driveLink: 'https://drive.google.com/drive/folders/1laporanInvestasiTW3_2026',
      notes: 'Realisasi investasi telah mencapai 87.4% dari target tahunan. Laporan diserahkan kepada Sekretaris Menko.',
      ndConsumptionNumber: 'ND.087/IKK.INV/X/2026',
      ndConsumptionStatus: 'Selesai Dibayarkan',
      releaseUrl: 'https://kek.go.id/berita/kinerja-investasi-triwulan-3-kek',
      releaseTitle: 'Realisasi Investasi KEK Capai 87% Menjelang Akhir Tahun',
    },

    // --- TIM KOMUNIKASI (KOM) ---
    {
      meetingNumber: 'KOM-001',
      title: 'Penyelenggaraan Media Gathering Nasional dan Diseminasi Capaian 10 Tahun KEK',
      teamCode: 'KOM',
      date: new Date('2026-10-15T09:00:00.000Z'),
      startTime: '09:00',
      endTime: '14:00',
      location: 'Ballroom Hotel Borobudur Jakarta & Media Center KEK',
      status: MeetingStatus.FINAL,
      progressStatus: 'Selesai',
      actionPlan: 'Non-Rutin',
      meetingKind: 'Media Gathering',
      documentCategory: 'UNDANGAN_INTERNAL',
      picName: 'Budi Santoso, S.I.Kom',
      driveLink: 'https://drive.google.com/drive/folders/1mediaGatheringKEK2026_PressRelease',
      notes: 'Dihadiri 45 jurnalis media nasional. 28 artikel rilis berita terbit di media massa nasional hari yang sama.',
      ndConsumptionNumber: 'ND.101/IKK.KOM/X/2026',
      ndConsumptionStatus: 'Selesai Dibayarkan',
      releaseUrl: 'https://kek.go.id/siaran-pers/media-gathering-nasional-10-tahun-kek',
      releaseTitle: 'Siaran Pers: Capaian Strategis dan Kontribusi KEK terhadap Pertumbuhan Ekonomi',
    },

    // --- TIM SISTEM INFORMASI (SI) - Poin 6 ---
    {
      meetingNumber: 'SI-001',
      title: 'Pengembangan Portal Monitoring Aktivitas Biro 3 dan Integrasi Database KEK',
      teamCode: 'SI',
      date: new Date('2026-10-23T09:30:00.000Z'),
      startTime: '09:30',
      endTime: '12:00',
      location: 'Ruang Lab Komputer & Server Lt. 4',
      status: MeetingStatus.APPROVED,
      progressStatus: 'Dalam Proses',
      actionPlan: 'Rutin',
      meetingKind: 'Rapat Kerja',
      documentCategory: 'UNDANGAN_INTERNAL',
      picName: 'Ahmad Fauzi, S.Kom',
      driveLink: 'https://drive.google.com/drive/folders/1portalAktivitasBiro3_DevSpecs',
      notes: 'Implementasi antarmuka monitoring aktivitas biro, relasi 5 tim terintegrasi, dan sinkronisasi database Neon cloud.',
      ndConsumptionNumber: 'ND.110/IKK.SI/X/2026',
      ndConsumptionStatus: 'Disetujui',
      releaseUrl: '',
      releaseTitle: '',
    },

    // --- POKJA (Gugus Tugas Isu Khusus) - Poin 19 ---
    {
      meetingNumber: 'POKJA-001',
      title: 'Koordinasi Debottlenecking Percepatan Penyelesaian Tata Ruang dan Pelayanan Terpadu Satu Pintu KEK',
      teamCode: 'POKJA',
      date: new Date('2026-10-19T13:00:00.000Z'),
      startTime: '13:00',
      endTime: '15:30',
      location: 'Ruang Rapat Pokja Khusus KEK Lt. 3',
      status: MeetingStatus.APPROVED,
      progressStatus: 'Dalam Proses',
      actionPlan: 'Non-Rutin',
      meetingKind: 'Rapat Kerja',
      documentCategory: 'DISPOSISI_SEKJEN',
      picName: 'Siti Rahmawati, M.Sc',
      driveLink: 'https://drive.google.com/drive/folders/1pokjaTataRuangPTSP_2026',
      notes: 'Telah dipetakan 4 titik hambat perizinan PTSP daerah. Rekomendasi regulasi dikirim ke Kementerian Dalam Negeri.',
      ndConsumptionNumber: 'ND.093/IKK.POKJA/X/2026',
      ndConsumptionStatus: 'Disetujui',
      releaseUrl: 'https://kek.go.id/berita/pokja-akselerasi-ptsp-kek',
      releaseTitle: 'Pokja Percepatan Biro 3 Kawal Pelayanan Satu Pintu KEK',
    },
  ];

  for (const act of activitiesData) {
    const teamId = teamMap.get(act.teamCode);
    const picUser = usersData.find((u) => u.name === act.picName);
    const picUserId = picUser ? userMap.get(picUser.email) : null;

    const created = await prisma.meeting.upsert({
      where: { meetingNumber: act.meetingNumber },
      update: {
        title: act.title,
        primaryBiroId: biro3Id,
        primaryTeamId: teamId,
        date: act.date,
        startTime: act.startTime,
        endTime: act.endTime,
        location: act.location,
        status: act.status,
        progressStatus: act.progressStatus,
        actionPlan: act.actionPlan,
        meetingKind: act.meetingKind,
        documentCategory: act.documentCategory,
        picName: act.picName,
        chairpersonId: picUserId,
        driveLink: act.driveLink,
        notes: act.notes,
        ndConsumptionNumber: act.ndConsumptionNumber,
        ndConsumptionStatus: act.ndConsumptionStatus,
        releaseUrl: act.releaseUrl,
        releaseTitle: act.releaseTitle,
      },
      create: {
        meetingNumber: act.meetingNumber,
        title: act.title,
        primaryBiroId: biro3Id,
        primaryTeamId: teamId,
        date: act.date,
        startTime: act.startTime,
        endTime: act.endTime,
        location: act.location,
        status: act.status,
        progressStatus: act.progressStatus,
        actionPlan: act.actionPlan,
        meetingKind: act.meetingKind,
        documentCategory: act.documentCategory,
        picName: act.picName,
        chairpersonId: picUserId,
        driveLink: act.driveLink,
        notes: act.notes,
        ndConsumptionNumber: act.ndConsumptionNumber,
        ndConsumptionStatus: act.ndConsumptionStatus,
        releaseUrl: act.releaseUrl,
        releaseTitle: act.releaseTitle,
      },
    });

    // Buat Butir Status Pekerjaan (Action Item)
    await prisma.actionItem.create({
      data: {
        meetingId: created.id,
        title: `Tindak Lanjut & Eksekusi: ${act.title.substring(0, 60)}...`,
        description: act.notes,
        picBiroId: biro3Id,
        picTeamId: teamId,
        picUserId: picUserId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: act.progressStatus === 'Selesai' ? ActionItemStatus.COMPLETED : ActionItemStatus.IN_PROGRESS,
        priority: ActionItemPriority.HIGH,
      },
    });

    console.log(`[KEGIATAN] ${created.meetingNumber} [${act.teamCode}] - ${created.title.substring(0, 50)}...`);
  }

  console.log('\n=== SEEDING DATABASE SELESAI DENGAN SUKSES! ===');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
