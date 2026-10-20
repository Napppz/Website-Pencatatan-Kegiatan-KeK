import { getMeetingsFromDb, getOfficialBiros } from '@/lib/db-service';
import { getCurrentUser } from '@/lib/auth/authorization';
import { SemuaRapatClient } from './semua-rapat-client';
import { Suspense } from 'react';
import { BIRO_LIST } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SemuaRapatPage() {
  const currentUser = await getCurrentUser();
  const isPrivileged =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'PIMPINAN';

  // Strict Bureau Scoping: Non-admin users only see meetings for their own bureau
  const userBiroCode = !isPrivileged && currentUser?.biroCode ? currentUser.biroCode : undefined;

  // Strict Team Scoping: Staff only sees meetings for their own assigned work team
  const isStaff = currentUser?.role === 'STAFF';
  const userTeamCode = isStaff && currentUser?.teamCode ? currentUser.teamCode : undefined;
  const userTeamName = isStaff && currentUser?.teamName ? currentUser.teamName : undefined;
  const userTeamId = isStaff && currentUser?.teamId ? currentUser.teamId : undefined;

  const [meetings, dbBiros] = await Promise.all([
    getMeetingsFromDb({
      biroCode: userBiroCode,
      teamCode: userTeamCode,
      teamId: userTeamId,
    }),
    getOfficialBiros(),
  ]);

  const availableBiros = dbBiros && dbBiros.length > 0 ? dbBiros : BIRO_LIST;

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat data kegiatan...</div>}>
      <SemuaRapatClient
        initialMeetings={meetings}
        availableBiros={availableBiros}
        lockedBiroCode={userBiroCode}
        currentUserBiroName={currentUser?.biroName}
        currentUserRole={currentUser?.role}
        lockedTeamCode={userTeamCode}
        lockedTeamName={userTeamName}
      />
    </Suspense>
  );
}
