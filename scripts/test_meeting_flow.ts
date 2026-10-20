import { prisma } from '../lib/prisma';
import { updateMeetingStatusAction, approveMeetingAction } from '../app/actions/meeting-actions';
import { setTestAuthUser } from '../lib/auth/authorization';

async function main() {
  console.log('=== TEST ALUR MULAI RAPAT & SETUJUI HASIL RAPAT ===\n');

  // Find a test meeting or create one
  let meeting = await prisma.meeting.findFirst({
    include: { primaryBiro: true },
  });

  if (!meeting) {
    console.log('Tidak ada rapat untuk pengujian.');
    return;
  }

  console.log(`Menguji pada Rapat: [${meeting.meetingNumber}] ${meeting.title}`);

  // Set test user as ADMIN
  setTestAuthUser({
    id: 'test-admin-id',
    name: 'Admin Tim Kerja',
    email: 'admin.tim@kek.go.id',
    role: 'ADMIN',
    biroId: meeting.primaryBiroId,
    biroCode: meeting.primaryBiro.code,
  });

  // 1. Reset to Belum Dimulai
  console.log('\n1. Reset status ke "Belum Dimulai"...');
  let res1 = await updateMeetingStatusAction(meeting.id, 'Belum Dimulai');
  console.log(`   -> Hasil reset: success = ${res1.success}, progressStatus = ${res1.data?.progressStatus}, status = ${res1.data?.status}`);

  // 2. Klik "Mulai Rapat" (otomatis ubah status ke Dalam Proses)
  console.log('\n2. Simulasi Klik "Mulai Rapat" (harus otomatis jadi "Dalam Proses")...');
  let res2 = await updateMeetingStatusAction(meeting.id, 'Dalam Proses');
  console.log(`   -> Hasil mulai rapat: success = ${res2.success}, progressStatus = ${res2.data?.progressStatus}, status = ${res2.data?.status}`);
  if (res2.data?.progressStatus !== 'Dalam Proses') {
    throw new Error('Gagal: Status bukan Dalam Proses!');
  }

  // 3. Set test user as PIMPINAN and test approval
  console.log('\n3. Simulasi Pimpinan / Admin Tim Klik "Setujui Hasil Rapat"...');
  setTestAuthUser({
    id: 'test-pimpinan-id',
    name: 'Bapak Pimpinan Sidang',
    email: 'pimpinan@kek.go.id',
    role: 'PIMPINAN',
    biroId: meeting.primaryBiroId,
    biroCode: meeting.primaryBiro.code,
  });

  let res3 = await approveMeetingAction(meeting.id);
  console.log(`   -> Hasil persetujuan pimpinan: success = ${res3.success}, progressStatus = ${res3.data?.progressStatus}, status = ${res3.data?.status}`);
  if (res3.data?.progressStatus !== 'Selesai' || res3.data?.status !== 'APPROVED') {
    throw new Error('Gagal: Status setelah disetujui bukan Selesai / APPROVED!');
  }

  // 4. Test staff rejection for approval
  console.log('\n4. Uji Penolakan Otorisasi: Staf biasa mencoba menyetujui hasil rapat (Harus Ditolak)...');
  setTestAuthUser({
    id: 'test-staff-id',
    name: 'Staf Biasa',
    email: 'staf@kek.go.id',
    role: 'STAFF',
    biroId: meeting.primaryBiroId,
    biroCode: meeting.primaryBiro.code,
  });

  let res4 = await approveMeetingAction(meeting.id);
  console.log(`   -> Hasil percobaan staf menyetujui: success = ${res4.success}, error = "${res4.error}"`);
  if (res4.success) {
    throw new Error('KEBOCORAN: Staf biasa tidak boleh menyetujui hasil rapat!');
  }

  setTestAuthUser(null);
  console.log('\n=== SEMUA PENGUJIAN BERHASIL 100%! ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
