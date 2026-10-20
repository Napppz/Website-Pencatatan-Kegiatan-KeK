import { prisma } from '../lib/prisma';
import { setTestAuthUser } from '../lib/auth/authorization';
import {
  getUsersAction,
  createUserAction,
  updateUserAction,
  toggleUserStatusAction,
  deleteUserAction,
} from '../app/actions/user-actions';

async function runTests() {
  console.log('=== TEST RBAC & TEAM SCOPING UNTUK ADMIN PER TIM KERJA ===\n');

  // Find Admin for Tim Kerja Sama (KS)
  const ksAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN', team: { code: 'KS' } },
    include: { biro: true, team: true },
  });

  if (!ksAdmin || !ksAdmin.teamId) {
    throw new Error('Admin Tim KS tidak ditemukan di database.');
  }

  console.log(`[SETUP] Login sebagai Admin Tim KS: ${ksAdmin.name} (${ksAdmin.email})`);
  console.log(`        Biro: ${ksAdmin.biro.name}, Tim: ${ksAdmin.team?.name} (${ksAdmin.team?.code})\n`);

  // Set auth session as Admin Tim KS
  setTestAuthUser({
    id: ksAdmin.id,
    name: ksAdmin.name,
    email: ksAdmin.email,
    role: 'ADMIN',
    biroId: ksAdmin.biroId,
    teamId: ksAdmin.teamId,
    teamCode: ksAdmin.team?.code,
    teamName: ksAdmin.team?.name,
  });

  // Test 1: Admin fetches users
  console.log('1. [TEST] getUsersAction() sebagai ADMIN Tim KS...');
  const usersRes = await getUsersAction();
  if (!usersRes.success || !usersRes.data) {
    throw new Error(`getUsersAction gagal: ${usersRes.error}`);
  }
  console.log(`   -> Total pengguna yang terlihat oleh Admin KS: ${usersRes.data.length}`);
  const hasSuperAdmin = usersRes.data.some((u) => u.role === 'SUPER_ADMIN');
  const hasOtherTeam = usersRes.data.some((u) => u.teamId && u.teamId !== ksAdmin.teamId);
  console.log(`   -> Apakah ada akun SUPER_ADMIN terlihat? ${hasSuperAdmin ? 'YA (SALAH!)' : 'TIDAK (AMAN)'}`);
  console.log(`   -> Apakah ada akun tim lain terlihat? ${hasOtherTeam ? 'YA (SALAH!)' : 'TIDAK (AMAN)'}`);
  if (hasSuperAdmin || hasOtherTeam) {
    throw new Error('Leak data: Admin melihat data di luar tim/perannya.');
  }

  // Test 2: Admin tries to create a SUPER_ADMIN (Should fail!)
  console.log('\n2. [TEST] Mencoba membuat SUPER_ADMIN sebagai ADMIN (Harus Ditolak)...');
  const hackRes = await createUserAction({
    name: 'Hacker Admin',
    email: 'hacker@simrapat.local',
    password: 'password123',
    role: 'SUPER_ADMIN',
    biroId: ksAdmin.biroId,
    teamId: ksAdmin.teamId,
    isActive: true,
  });
  console.log(`   -> Hasil pembuatan SUPER_ADMIN: success = ${hackRes.success}`);
  if (hackRes.success) {
    throw new Error('KEBOCORAN KEAMANAN: Admin berhasil membuat akun Super Admin!');
  }
  console.log(`   -> Pesan penolakan: "${hackRes.error}" (BERHASIL DITOLAK)\n`);

  // Test 3: Admin creates a valid new STAFF for their team
  const testEmail = `anggota.baru.${Date.now()}@kek.go.id`;
  console.log(`3. [TEST] Admin menambah anggota tim baru (${testEmail})...`);
  const createRes = await createUserAction({
    name: 'Anggota Baru Tim KS',
    email: testEmail,
    password: 'password123',
    role: 'STAFF',
    biroId: ksAdmin.biroId,
    teamId: ksAdmin.teamId,
    isActive: true,
  });

  if (!createRes.success || !createRes.data) {
    throw new Error(`Gagal menambah anggota tim: ${createRes.error}`);
  }
  const newMemberId = createRes.data.id;
  console.log(`   -> Berhasil membuat anggota tim baru! ID: ${newMemberId}, Tim: ${createRes.data.team?.name}`);

  // Test 4: Admin updates their team member's name
  console.log('\n4. [TEST] Admin memperbarui nama anggota tim...');
  const updateRes = await updateUserAction({
    id: newMemberId,
    name: 'Anggota Baru Tim KS (Updated)',
    email: testEmail,
    password: null,
    role: 'STAFF',
    biroId: ksAdmin.biroId,
    teamId: ksAdmin.teamId,
    isActive: true,
  });
  if (!updateRes.success || !updateRes.data) {
    throw new Error(`Gagal update anggota: ${updateRes.error}`);
  }
  console.log(`   -> Berhasil update nama menjadi: "${updateRes.data.name}"`);

  // Test 5: Admin toggles status
  console.log('\n5. [TEST] Admin menonaktifkan status anggota...');
  const toggleRes = await toggleUserStatusAction(newMemberId);
  if (!toggleRes.success || !toggleRes.data) {
    throw new Error(`Gagal toggle status: ${toggleRes.error}`);
  }
  console.log(`   -> Status aktif sekarang: ${toggleRes.data.isActive}`);

  // Test 6: Admin deletes their test team member
  console.log('\n6. [TEST] Admin menghapus anggota uji coba...');
  const delRes = await deleteUserAction(newMemberId);
  if (!delRes.success) {
    throw new Error(`Gagal menghapus anggota: ${delRes.error}`);
  }
  console.log(`   -> Berhasil dihapus: "${delRes.message}"`);

  // Test 7: Admin tries to delete SUPER_ADMIN (Should fail!)
  console.log('\n7. [TEST] Admin mencoba menghapus SUPER_ADMIN (Harus Ditolak)...');
  const superAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });
  if (superAdmin) {
    const hackDelRes = await deleteUserAction(superAdmin.id);
    console.log(`   -> Hasil penghapusan SUPER_ADMIN: success = ${hackDelRes.success}`);
    if (hackDelRes.success) {
      throw new Error('KEBOCORAN KEAMANAN: Admin berhasil menghapus Super Admin!');
    }
    console.log(`   -> Pesan penolakan: "${hackDelRes.error}" (BERHASIL DITOLAK)`);
  }

  // Cleanup auth override
  setTestAuthUser(null);

  console.log('\n=== SEMUA 7 PENGUJIAN RBAC & TEAM SCOPING BERHASIL DENGAN SEMPURNA! ===');
}

runTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
