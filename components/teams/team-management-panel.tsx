'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  Shield,
  Layers,
  Power,
  RotateCcw,
  Sparkles,
  Search,
} from 'lucide-react';
import { toast, confirmModal } from '@/components/providers/toast-provider';
import {
  createTeamAction,
  updateTeamAction,
  toggleTeamStatusAction,
} from '@/app/actions/team-actions';
import { cn } from '@/lib/utils';

export interface TeamData {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  memberCount?: number;
  meetingCount?: number;
}

interface TeamManagementPanelProps {
  initialTeams: TeamData[];
  currentUserRole?: string;
}

export function TeamManagementPanel({
  initialTeams = [],
  currentUserRole = 'SUPER_ADMIN',
}: TeamManagementPanelProps) {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamData[]>(initialTeams);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamData | null>(null);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN';

  // Filtered teams
  const filteredTeams = teams.filter((t) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (statusFilter === 'ACTIVE') return t.isActive;
    if (statusFilter === 'INACTIVE') return !t.isActive;
    return true;
  });

  const activeCount = teams.filter((t) => t.isActive).length;
  const inactiveCount = teams.filter((t) => !t.isActive).length;

  const handleOpenAdd = () => {
    setFormCode('');
    setFormName('');
    setFormDesc('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (team: TeamData) => {
    setEditingTeam(team);
    setFormCode(team.code);
    setFormName(team.name.replace(/^Tim\s+/, ''));
    setFormDesc(team.description || '');
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTeam(null);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) {
      toast.error('Kode tim dan nama tim wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTeam) {
        const res = await updateTeamAction({
          id: editingTeam.id,
          code: formCode.trim().toUpperCase(),
          name: formName.trim(),
          description: formDesc.trim() || undefined,
        });

        if (res.success && res.data) {
          toast.success(res.message || 'Tim berhasil diperbarui!');
          setTeams((prev) =>
            prev.map((t) =>
              t.id === editingTeam.id
                ? {
                    ...t,
                    code: res.data.code,
                    name: res.data.name,
                    description: res.data.description,
                  }
                : t
            )
          );
          handleCloseModal();
          router.refresh();
        } else {
          toast.error(res.error || 'Gagal memperbarui tim.');
        }
      } else {
        const res = await createTeamAction({
          code: formCode.trim().toUpperCase(),
          name: formName.trim(),
          description: formDesc.trim() || undefined,
        });

        if (res.success && res.data) {
          toast.success(res.message || 'Tim baru berhasil ditambahkan!');
          setTeams((prev) => [
            ...prev,
            {
              id: res.data.id,
              code: res.data.code,
              name: res.data.name,
              description: res.data.description,
              isActive: res.data.isActive,
              memberCount: 0,
              meetingCount: 0,
            },
          ]);
          handleCloseModal();
          router.refresh();
        } else {
          toast.error(res.error || 'Gagal menambahkan tim baru.');
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (team: TeamData) => {
    const nextState = !team.isActive;
    const actionText = nextState ? 'mengaktifkan kembali' : 'menonaktifkan';

    const ok = await confirmModal({
      title: nextState ? 'Aktifkan Tim Kerja?' : 'Nonaktifkan Tim Kerja?',
      message: nextState
        ? `Apakah Anda yakin ingin mengaktifkan kembali tim "${team.name}" (${team.code})? Tim ini akan kembali muncul dalam formulir pencatatan kegiatan.`
        : `Apakah Anda yakin ingin menonaktifkan tim "${team.name}" (${team.code})? Tim nonaktif tidak akan muncul sebagai opsi untuk pencatatan kegiatan baru. Riwayat kegiatan yang sudah ada tetap aman tersimpan.`,
      confirmText: nextState ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan',
      cancelText: 'Batal',
      variant: nextState ? 'primary' : 'danger',
    });

    if (!ok) return;

    setTogglingId(team.id);
    try {
      const res = await toggleTeamStatusAction(team.id, nextState);
      if (res.success) {
        toast.success(res.message || 'Status tim berhasil diperbarui!');
        setTeams((prev) =>
          prev.map((t) => (t.id === team.id ? { ...t, isActive: nextState } : t))
        );
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal mengubah status tim.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#175360] via-[#1E6B7B] to-[#266F80] text-white shadow-sm border border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-teal-200 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Struktur Organisasi Biro 3
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Kelola Tim Kerja &amp; Kelompok Tugas
          </h2>
          <p className="text-xs text-white/80 max-w-xl">
            Super Admin dapat menambahkan tim baru, menyunting rincian tim, dan menonaktifkan tim yang sudah purna-tugas atau selesai fungsinya.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#1E6B7B] hover:bg-slate-50 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#1E6B7B]" />
            <span>Tambah Tim Baru</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Tim
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">{teams.length}</p>
        </div>
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Tim Aktif
          </span>
          <p className="text-2xl font-black text-emerald-800 mt-1">{activeCount}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tim Nonaktif
          </span>
          <p className="text-2xl font-black text-slate-600 mt-1">{inactiveCount}</p>
        </div>
        <div className="p-4 bg-[#F0F8FA] rounded-xl border border-[#BCE3EB] shadow-2xs">
          <span className="text-[11px] font-bold text-[#1E6B7B] uppercase tracking-wider block">
            Status Izin
          </span>
          <p className="text-xs font-bold text-slate-700 mt-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#1E6B7B]" />
            <span>Super Admin Full Access</span>
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau nama tim..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer',
              statusFilter === 'ALL'
                ? 'bg-[#1E6B7B] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Semua ({teams.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer',
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            )}
          >
            Aktif ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('INACTIVE')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer',
              statusFilter === 'INACTIVE'
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Nonaktif ({inactiveCount})
          </button>
        </div>
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeams.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Tidak ada tim kerja yang sesuai kriteria pencarian.
          </div>
        ) : (
          filteredTeams.map((team) => {
            const isToggling = togglingId === team.id;
            return (
              <div
                key={team.id}
                className={cn(
                  'rounded-2xl border p-5 transition-all flex flex-col justify-between gap-4 bg-white shadow-xs',
                  team.isActive
                    ? 'border-slate-200 hover:border-[#1E6B7B]/50'
                    : 'border-slate-200 bg-slate-50/60 opacity-80'
                )}
              >
                {/* Team Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-md font-mono text-xs font-black tracking-wider uppercase border',
                        team.isActive
                          ? 'bg-[#E8F5F7] text-[#1E6B7B] border-[#BCE3EB]'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      )}
                    >
                      {team.code}
                    </span>

                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
                        team.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      )}
                    >
                      {team.isActive ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Nonaktif</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                      {team.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {team.description || 'Tidak ada deskripsi rincian tugas tim.'}
                    </p>
                  </div>
                </div>

                {/* Team Footer Metrics & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span title="Jumlah anggota staf yang tergabung">
                      👥 <strong>{team.memberCount || 0}</strong> Staf
                    </span>
                    <span title="Total kegiatan yang dicatat tim ini">
                      📑 <strong>{team.meetingCount || 0}</strong> Kegiatan
                    </span>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(team)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-[#1E6B7B] hover:bg-slate-100 transition-colors"
                        title="Edit nama atau rincian tim"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handleToggleStatus(team)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1',
                          team.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        )}
                        title={team.isActive ? 'Nonaktifkan tim ini' : 'Aktifkan kembali tim ini'}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : team.isActive ? (
                          <>
                            <Power className="w-3 h-3" />
                            <span>Nonaktifkan</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3 h-3" />
                            <span>Aktifkan</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Tambah / Edit Tim */}
      {(isAddModalOpen || editingTeam) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#175360] via-[#1E6B7B] to-[#266F80] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-teal-200">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {editingTeam ? 'Edit Data Tim Kerja' : 'Tambah Tim Kerja Baru'}
                  </h3>
                  <p className="text-[11px] text-white/70">
                    Biro Fasilitasi Kebijakan Asesmen &amp; Tata Kelola (Biro 3)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Tim (Singkatan Unik) <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: HUKUM, AKSEL, BUPP..."
                  maxLength={10}
                  className="w-full px-3.5 h-[40px] rounded-xl border border-slate-300 bg-white font-mono font-bold text-xs uppercase tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Digunakan untuk format otomatis nomor registrasi kegiatan (misal: <strong>{formCode || 'KODE'}-001</strong>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Tim Kerja <span className="text-red-500">*</span>:
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-slate-400 select-none">
                    Tim
                  </span>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Advokasi Hukum & Regulasi..."
                    className="w-full pl-12 pr-3.5 h-[40px] rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi / Lingkup Tugas Tim:
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Penjelasan fungsi pokok dan kewenangan kelompok kerja ini..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B] leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E6B7B] hover:bg-[#164E59] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingTeam ? 'Simpan Perubahan' : 'Tambahkan Tim Baru'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
