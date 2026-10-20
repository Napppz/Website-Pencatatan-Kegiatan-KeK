import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDemoUsers() {
  console.log('=== SEEDING DEMO USERS BIRO 3 (DATABASE NEON) ===');

  const biro3 = await prisma.biro.findUnique({ where: { code: 'IKK' } });
  if (!biro3) {
    console.error('Biro 3 (IKK) tidak ditemukan!');
    process.exit(1);
  }

  const teams = await prisma.biroTeam.findMany({
    where: { biroId: biro3.id, isActive: true },
  });

  const teamMap = new Map<string, string>();
  teams.forEach((t) => teamMap.set(t.code.toUpperCase(), t.id));

  const passwordHash = await bcrypt.hash('AktivitasBiro3!2026', 10);

  const demoUsersList = [
    // 1. Super Admin
    {
      name: 'Super Admin Biro 3',
      email: 'superadmin@kek.go.id',
      role: UserRole.SUPER_ADMIN,
      teamCode: 'SI',
    },
    {
      name: 'Super Admin (Demo)',
      email: 'superadmin@simrapat.local',
      role: UserRole.SUPER_ADMIN,
      teamCode: 'SI',
    },

    // 2. Pimpinan
    {
      name: 'Dr. Hendra Suprayitno, M.Si (Pimpinan Biro 3)',
      email: 'pimpinan.biro3@kek.go.id',
      role: UserRole.PIMPINAN,
      teamCode: 'INV',
    },
    {
      name: 'Pimpinan Biro 3',
      email: 'pimpinan@kek.go.id',
      role: UserRole.PIMPINAN,
      teamCode: 'INV',
    },
    {
      name: 'Pimpinan (Demo)',
      email: 'pimpinan@simrapat.local',
      role: UserRole.PIMPINAN,
      teamCode: 'INV',
    },

    // 3. Admin Tim / Admin IKK
    {
      name: 'Admin Biro 3 (IKK)',
      email: 'admin@kek.go.id',
      role: UserRole.ADMIN,
      teamCode: 'SI',
    },
    {
      name: 'Admin IKK (Demo)',
      email: 'admin@simrapat.local',
      role: UserRole.ADMIN,
      teamCode: 'SI',
    },

    // 4. Staff Tim Kerja Sama (KS)
    {
      name: 'Rizki Agustianto (Staff Kerja Sama)',
      email: 'staf.kerjasama@kek.go.id',
      role: UserRole.STAFF,
      teamCode: 'KS',
    },
    {
      name: 'Staff Kerja Sama',
      email: 'staff.ks@kek.go.id',
      role: UserRole.STAFF,
      teamCode: 'KS',
    },

    // 5. Staff Tim Investasi (INV)
    {
      name: 'Maya Puspita, S.Sos (Staff Investasi)',
      email: 'staf.investasi@kek.go.id',
      role: UserRole.STAFF,
      teamCode: 'INV',
    },
    {
      name: 'Staff Investasi',
      email: 'staff.inv@kek.go.id',
      role: UserRole.STAFF,
      teamCode: 'INV',
    },

    // 6. Staff Tim Komunikasi (KOM)
    {
      name: 'Budi Santoso, S.I.Kom (Staff Komunikasi)',
      email: 'staf.komunikasi@kek.go.id',
      role: UserRole.STAFF,
      teamCode: 'KOM',
    },
    {
      name: 'Staff Komunikasi',
      email: 'staff.kom@kek.go.id',
      role: UserRole.STAFF,
      teamCode: 'KOM',
    },

    // 7. Staff Tim Sistem Informasi (SI)
    {
      name: 'Ahmad Fauzi, S.Kom (Staff Sistem Informasi)',
      email: 'staf.si@kek.go.id',
      role: UserRole.STAFF,
      teamCode: 'SI',
    },
    {
      name: 'Staff Sistem Informasi',
      email: 'staff.si@kek.go.id',
      role: UserRole.STAFF,
      teamCode: 'SI',
    },

    // 8. Staff Pokja (POKJA)
    {
      name: 'Siti Rahmawati, M.Sc (Staff Pokja)',
      email: 'staf.pokja@kek.go.id',
      role: UserRole.STAFF,
      teamCode: 'POKJA',
    },
    {
      name: 'Staff Pokja',
      email: 'staff.pokja@kek.go.id',
      role: UserRole.STAFF,
      teamCode: 'POKJA',
    },

    // 9. Staff Umum
    {
      name: 'Staff Biro 3',
      email: 'staff@kek.go.id',
      role: UserRole.STAFF,
      teamCode: 'KS',
    },
    {
      name: 'Staff IKK (Demo)',
      email: 'staff@simrapat.local',
      role: UserRole.STAFF,
      teamCode: 'KS',
    },
  ];

  for (const u of demoUsersList) {
    const teamId = teamMap.get(u.teamCode) || null;
    const user = await prisma.user.upsert({
      where: { email: u.email.toLowerCase().trim() },
      update: {
        name: u.name,
        role: u.role,
        biroId: biro3.id,
        teamId: teamId,
        password: passwordHash,
        isActive: true,
      },
      create: {
        name: u.name,
        email: u.email.toLowerCase().trim(),
        role: u.role,
        biroId: biro3.id,
        teamId: teamId,
        password: passwordHash,
        isActive: true,
      },
    });

    // Hubungkan ke seluruh tim Biro 3 via UserTeam (join table fleksibel)
    for (const [code, tId] of teamMap.entries()) {
      await prisma.userTeam.upsert({
        where: { userId_teamId: { userId: user.id, teamId: tId } },
        update: { role: u.teamCode === code ? 'PJ_UTAMA' : 'ANGGOTA' },
        create: {
          userId: user.id,
          teamId: tId,
          role: u.teamCode === code ? 'PJ_UTAMA' : 'ANGGOTA',
        },
      });
    }

    console.log(`[USER DEMO] ${user.email} -> Role: ${user.role}, Tim: ${u.teamCode}`);
  }

  console.log('=== SEMUA AKUN DEMO BERHASIL DI-SEED KE DATABASE NEON ===');
  await prisma.$disconnect();
}

seedDemoUsers().catch((e) => {
  console.error(e);
  process.exit(1);
});
