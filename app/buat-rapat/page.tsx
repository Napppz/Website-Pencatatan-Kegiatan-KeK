'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar,
  Building2,
  ArrowLeft,
  Users,
  CheckCircle,
  Loader2,
  AlertCircle,
  Check,
  X,
  UserCheck,
  FileText,
  UploadCloud,
  Sparkles,
  Search,
  Paperclip,
  Trash2,
  FileCheck,
  RefreshCw,
  FolderOpen,
  MapPin,
  Clock,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  getActiveUsersAction,
  createMeetingAction,
  getMeetingOptionsAction,
  previewNextMeetingNumberAction,
} from '@/app/actions/meeting-actions';
import {
  uploadInvitationFileAction,
  uploadGenericMeetingFileAction,
} from '@/app/actions/meeting-upload-actions';
import { toast } from '@/components/providers/toast-provider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PicSelector } from '@/components/meeting/pic-selector';
import { AttendeesSelector } from '@/components/meeting/attendees-selector';

interface AvailableUser {
  id: string;
  name: string;
  email: string;
  role: string;
  biro?: {
    id: string;
    code: string;
    shortName: string;
  } | null;
  team?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

interface UploadedFileState {
  url: string;
  name: string;
  size: number;
}

const JENIS_RAPAT_OPTIONS = [
  'Media Gathering',
  'Kunker',
  'Penandatanganan Mou',
  'Groundbreaking',
  'Rapat Kerja',
  'Seminar/Forum',
  'Rapat/Audiensi',
  'Pelantikan',
  'Seremoni',
  'Other',
];

const LOKASI_OPTIONS = [
  'Graha Satwika',
  'Loka Jagatsaksana',
  'Lokasandhi',
  'Antawacana',
  'Administrator',
  'Other',
];

export const TIM_OPTIONS = [
  {
    id: 'TIM-001',
    code: 'INV',
    name: 'Tim Investasi',
    shortName: 'Investasi',
    description: 'Fasilitasi, promosi, dan percepatan realisasi investasi strategis KEK',
  },
  {
    id: 'TIM-003',
    code: 'KS',
    name: 'Tim Kerja Sama',
    shortName: 'Kerja Sama',
    description: 'Penguatan kemitraan strategis, koordinasi lintas K/L, dan kerja sama badan usaha',
  },
  {
    id: 'TIM-002',
    code: 'KOM',
    name: 'Tim Komunikasi',
    shortName: 'Komunikasi',
    description: 'Komunikasi publik, hubungan media, dokumentasi, dan diseminasi kebijakan KEK',
  },
  {
    id: 'TIM-004',
    code: 'SI',
    name: 'Tim Sistem Informasi',
    shortName: 'Sistem Informasi',
    description: 'Pengembangan sistem informasi, tata kelola data digital, dan integrasi TI KEK',
  },
  {
    id: 'TIM-005',
    code: 'POKJA',
    name: 'Pokja (Kelompok Kerja)',
    shortName: 'Pokja',
    description: 'Kelompok kerja lintas sektor, task force akselerasi, dan koordinasi terfokus',
  },
];

function formatFileSize(bytes: number) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function BuatRapatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'STAFF';
  const isPrivileged = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'STAFF';
  const isStaff = userRole === 'STAFF';

  // Deteksi tim kerja resmi staf jika login sebagai STAFF
  const staffMatchedTeam = useMemo(() => {
    if (session?.user?.role !== 'STAFF') return null;
    const staffCode = session.user.teamCode?.toUpperCase();
    const staffId = session.user.teamId;
    return (
      TIM_OPTIONS.find(
        (t) =>
          (staffId && t.id === staffId) ||
          (staffCode && t.code.toUpperCase() === staffCode)
      ) || null
    );
  }, [session]);

  // Today string for date input
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  // 1. Judul Rapat
  const [title, setTitle] = useState('');

  // 2. Tanggal Rapat
  const [date, setDate] = useState(todayStr);

  // 3. Kategori Rapat (Undangan Internal, Daftar Naskah Masuk, Tunda Rapat)
  const [kategoriRapat, setKategoriRapat] = useState<string>('UNDANGAN_INTERNAL');
  const [sourceOrigin, setSourceOrigin] = useState<string>('');
  const [postponeReason, setPostponeReason] = useState<string>('');
  const [categoryDoc, setCategoryDoc] = useState<UploadedFileState | null>(null);
  const [isUploadingCategoryDoc, setIsUploadingCategoryDoc] = useState(false);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);

  // 4. Surat Undangan (Upload File)
  const [invitationDoc, setInvitationDoc] = useState<UploadedFileState | null>(null);
  const [isUploadingInvitationDoc, setIsUploadingInvitationDoc] = useState(false);
  const invitationFileInputRef = useRef<HTMLInputElement>(null);

  // 5. Dokumen Terkait / Paparan Rapat (Upload File)
  const [materialDoc, setMaterialDoc] = useState<UploadedFileState | null>(null);
  const [isUploadingMaterialDoc, setIsUploadingMaterialDoc] = useState(false);
  const materialFileInputRef = useRef<HTMLInputElement>(null);

  // 6. Jenis Rapat (Dropdown + Other)
  const [jenisRapat, setJenisRapat] = useState<string>('Rapat Kerja');
  const [customJenisRapat, setCustomJenisRapat] = useState<string>('');

  // 7. PIC Rapat (Dropdown staf + nama PIC)
  const [picUserId, setPicUserId] = useState<string>('');
  const [picName, setPicName] = useState<string>('');

  // 8. Undangan Rapat (Peserta Rapat yang Diundang)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [attendees, setAttendees] = useState<string>('');

  // 9. Lokasi Kegiatan (Dropdown + Other)
  const [lokasiOption, setLokasiOption] = useState<string>('Graha Satwika');
  const [customLocation, setCustomLocation] = useState<string>('');

  // 10. Kode Nomor Registrasi Per Tim (Tim Investasi, Tim Kerja Sama, Tim Komunikasi)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('TIM-001');
  const [registrationNumber, setRegistrationNumber] = useState<string>('');
  const [isManualNumber, setIsManualNumber] = useState<boolean>(false);
  const [isLoadingNumber, setIsLoadingNumber] = useState<boolean>(false);

  // Otomatis sinkronisasi tim kerja dengan tim staf begitu sesi tersedia
  useEffect(() => {
    if (staffMatchedTeam && selectedTeamId !== staffMatchedTeam.id) {
      setSelectedTeamId(staffMatchedTeam.id);
      setIsManualNumber(false);
    }
  }, [staffMatchedTeam, selectedTeamId]);

  const currentTeam = useMemo(
    () => TIM_OPTIONS.find((t) => t.id === selectedTeamId) || TIM_OPTIONS[0],
    [selectedTeamId]
  );

  // Status Pekerjaan: Otomatis 'Belum Dimulai' saat pembuatan kegiatan baru
  const [statusRapat, setStatusRapat] = useState<string>('Belum Dimulai');

  // Optional: Tautkan rapat sebelumnya
  const [previousMeetingId, setPreviousMeetingId] = useState<string>('');

  // Hasil Kegiatan, Link Google Drive, Catatan, Nd Konsum, Rilis, Rencana Aksi (Catatan Mentor)
  const [driveLink, setDriveLink] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [actionPlan, setActionPlan] = useState<string>('Rutin');
  const [ndConsumptionNumber, setNdConsumptionNumber] = useState<string>('');
  const [ndConsumptionStatus, setNdConsumptionStatus] = useState<string>('Diproses');
  const [releaseUrl, setReleaseUrl] = useState<string>('');
  const [releaseTitle, setReleaseTitle] = useState<string>('');

  // Auxiliary data
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [availableMeetings, setAvailableMeetings] = useState<any[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    getActiveUsersAction()
      .then((res) => {
        if (res.success && res.data) {
          setAvailableUsers(res.data);
        }
      })
      .catch((err) => console.warn('Could not load users:', err));

    getMeetingOptionsAction()
      .then((res) => {
        if (res.success && res.data) {
          setAvailableMeetings(res.data);
        }
      })
      .catch((err) => console.warn('Could not load meetings:', err));
  }, []);

  // Update registration number preview when selected team changes (unless manually edited)
  useEffect(() => {
    if (!isManualNumber) {
      setIsLoadingNumber(true);
      previewNextMeetingNumberAction('IKK', selectedTeamId)
        .then((res) => {
          if (res.success && res.data) {
            setRegistrationNumber(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingNumber(false));
    }
  }, [selectedTeamId, isManualNumber]);

  // Handle URL query parameters
  useEffect(() => {
    const prevId = searchParams.get('previousMeetingId');
    const paramTitle = searchParams.get('title');
    const paramTim = searchParams.get('tim');

    if (prevId) setPreviousMeetingId(prevId);
    if (paramTitle) setTitle(paramTitle);
    if (paramTim && session?.user?.role !== 'STAFF') {
      const match = TIM_OPTIONS.find(
        (t) => t.code.toUpperCase() === paramTim.toUpperCase() || t.id === paramTim
      );
      if (match) setSelectedTeamId(match.id);
    }
  }, [searchParams, session]);

  // Handle PIC selection from users list
  const handleSelectPicUser = (userId: string) => {
    setPicUserId(userId);
    const found = availableUsers.find((u) => u.id === userId);
    if (found) {
      setPicName(found.name);
    }
  };

  // Reset registration number to auto
  const handleResetToAutoNumber = () => {
    setIsManualNumber(false);
    setIsLoadingNumber(true);
    const targetTeamId = isStaff && staffMatchedTeam ? staffMatchedTeam.id : selectedTeamId;
    previewNextMeetingNumberAction('IKK', targetTeamId)
      .then((res) => {
        if (res.success && res.data) {
          setRegistrationNumber(res.data);
          toast.success(`Nomor registrasi diperbarui: ${res.data}`);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingNumber(false));
  };

  // Generic file upload helper
  const handleUploadFile = async (
    file: File,
    type: 'kategori' | 'undangan' | 'paparan'
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    if (type === 'kategori') setIsUploadingCategoryDoc(true);
    if (type === 'undangan') setIsUploadingInvitationDoc(true);
    if (type === 'paparan') setIsUploadingMaterialDoc(true);

    try {
      if (type === 'undangan') {
        const res = await uploadInvitationFileAction(formData);
        if (res.success && res.data) {
          setInvitationDoc({
            url: res.data.url,
            name: res.data.name,
            size: res.data.size,
          });
          toast.success(`Surat undangan "${res.data.name}" berhasil diunggah!`);
        } else {
          toast.error(res.error || 'Gagal mengunggah surat undangan');
        }
      } else {
        const res = await uploadGenericMeetingFileAction(formData);
        if (res.success && res.data) {
          const fileData = {
            url: res.data.url,
            name: res.data.name,
            size: res.data.size,
          };
          if (type === 'kategori') {
            setCategoryDoc(fileData);
            toast.success(`Berkas kategori "${res.data.name}" berhasil diunggah!`);
          } else {
            setMaterialDoc(fileData);
            toast.success(`Dokumen paparan "${res.data.name}" berhasil diunggah!`);
          }
        } else {
          toast.error(res.error || 'Gagal mengunggah berkas');
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan saat mengunggah berkas');
    } finally {
      if (type === 'kategori') setIsUploadingCategoryDoc(false);
      if (type === 'undangan') setIsUploadingInvitationDoc(false);
      if (type === 'paparan') setIsUploadingMaterialDoc(false);
    }
  };


  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setErrorMessage(null);

    try {
      if (!title.trim()) {
        toast.error('Judul rapat wajib diisi.');
        setIsSubmitted(false);
        return;
      }

      if (date && date < todayStr) {
        toast.error('Tanggal pelaksanaan rapat tidak boleh sebelum hari ini.');
        setIsSubmitted(false);
        return;
      }

      if (kategoriRapat === 'SURAT_DITUNDA' && !postponeReason.trim()) {
        toast.error('Mohon cantumkan alasan penundaan untuk kategori Tunda Rapat.');
        setIsSubmitted(false);
        return;
      }

      // Determine final jenis rapat
      const finalJenisRapat =
        jenisRapat === 'Other' ? (customJenisRapat.trim() || 'Lainnya') : jenisRapat;

      // Determine final location
      const finalLocation =
        lokasiOption === 'Other'
          ? (customLocation.trim() || 'Lokasi Eksternal Lainnya')
          : lokasiOption;

      // Submit
      const res = await createMeetingAction({
        title: title.trim(),
        biroCode: 'IKK',
        primaryTeamId: selectedTeamId,
        date,
        startTime: '09:00',
        endTime: '12:00',
        location: finalLocation,
        meetingKind: finalJenisRapat,
        picName: picName.trim() || undefined,
        chairpersonId: picUserId || undefined,
        progressStatus: statusRapat,
        meetingNumber: registrationNumber.trim() || undefined,
        documentCategory: kategoriRapat,
        documentSubCategory:
          kategoriRapat === 'DISPOSISI_SEKJEN'
            ? 'DISPOSISI_SEKJEN'
            : kategoriRapat === 'DISPOSISI_BIRO'
            ? 'DISPOSISI_BIRO'
            : undefined,
        sourceOrigin: sourceOrigin.trim() || undefined,
        postponeReason: postponeReason.trim() || undefined,
        invitationDocUrl: invitationDoc?.url || undefined,
        invitationDocName: invitationDoc?.name || undefined,
        invitationDocSize: invitationDoc?.size || undefined,
        categoryDocUrl: categoryDoc?.url || undefined,
        categoryDocName: categoryDoc?.name || undefined,
        categoryDocSize: categoryDoc?.size || undefined,
        materialDocUrl: materialDoc?.url || undefined,
        materialDocName: materialDoc?.name || undefined,
        materialDocSize: materialDoc?.size || undefined,
        attendees: attendees.trim() || undefined,
        participantUserIds: selectedUserIds,
        previousMeetingId: previousMeetingId || undefined,
        driveLink: driveLink.trim() || undefined,
        notes: notes.trim() || undefined,
        actionPlan: actionPlan || 'Rutin',
        ndConsumptionNumber: ndConsumptionNumber.trim() || undefined,
        ndConsumptionStatus: ndConsumptionNumber.trim() ? ndConsumptionStatus : undefined,
        releaseUrl: releaseUrl.trim() || undefined,
        releaseTitle: releaseTitle.trim() || undefined,
      });

      if (res.success && res.data) {
        toast.success(
          `Kegiatan "${title}" (${res.data.meetingNumber}) berhasil disimpan!`
        );
        router.refresh();
        router.push(`/semua-rapat/${res.data.id}`);
      } else {
        setErrorMessage(res.error || 'Gagal menyimpan rapat');
        toast.error(res.error || 'Gagal menyimpan rapat');
        setIsSubmitted(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem saat membuat rapat');
      setIsSubmitted(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/semua-rapat"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-[#1E6B7B] text-sm font-semibold transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Semua Rapat</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="teal" dot>
            Formulir Standar Rapat KEK
          </Badge>
        </div>
      </div>

      {/* Hero Title & Description */}
      <div className="bg-gradient-to-br from-[#175360] via-[#1E6B7B] to-[#266F80] rounded-2xl p-6 sm:p-7 text-white shadow-md border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              Formulir Standar Rapat • Status Terintegrasi Tindak Lanjut
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Formulir Penjadwalan &amp; Log Rapat KEK
            </h1>
            <p className="text-white/80 text-sm mt-1.5 leading-relaxed">
              Lengkapi data rapat koordinasi dengan nomor registrasi tim, kategori naskah, lampiran berkas, dan pemetaan peserta. Status rapat otomatis diset Sedang Berlangsung dan dipantau terpusat di Tindak Lanjut.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3.5 text-red-700 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gagal Menyimpan Rapat</p>
              <p className="mt-0.5 text-red-600">{errorMessage}</p>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* BAGIAN I: REGISTRASI TIM, AGENDA & WAKTU PELAKSANAAN (Poin 1, 2, 3)       */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden border-t-4 border-t-[#1E6B7B]">
          <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F0F8FA] border border-[#BCE3EB] flex items-center justify-center text-[#1E6B7B]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Bagian I: Registrasi Tim, Agenda &amp; Waktu Pelaksanaan
                </h2>
                <p className="text-xs text-slate-500">
                  Nomor registrasi tim kerja, judul agenda rapat koordinasi, dan tanggal pelaksanaan kegiatan
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              Poin 1, 2, 3
            </span>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            {/* 1. Kode Nomor Registrasi Per Tim Dibuat Beda */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F0F8FA] via-white to-slate-50 border border-[#BCE3EB] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#1E6B7B] text-white text-xs flex items-center justify-center font-bold shadow-2xs">1</span>
                  <span>Kode Nomor Registrasi Per Tim Dibuat Beda</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetToAutoNumber}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#BCE3EB] text-[#1E6B7B] hover:bg-[#F0F8FA] text-xs font-semibold shadow-2xs cursor-pointer transition-all"
                    title="Hitung ulang nomor urut otomatis sesuai tim"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isLoadingNumber && "animate-spin")} />
                    <span>Reset ke Otomatis</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* 3 Teams Selection List (Locked for STAFF, Selectable for Admins) */}
                <div className="md:col-span-7 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Pilih Tim Kerja:
                  </label>
                  {isStaff && staffMatchedTeam ? (
                    <div className="bg-[#E8F5F7] px-4 py-2.5 rounded-lg border border-[#BCE3EB] shadow-2xs flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full flex items-center justify-center border border-[#1E6B7B] bg-[#1E6B7B]">
                          <span className="w-1 h-1 rounded-full bg-white" />
                        </span>
                        <span className="text-sm font-bold text-[#1E6B7B]">
                          {staffMatchedTeam.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded font-bold bg-[#1E6B7B] text-white">
                        {staffMatchedTeam.code}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      {TIM_OPTIONS.map((tim) => {
                        const isSelected = selectedTeamId === tim.id;
                        return (
                          <button
                            key={tim.id}
                            type="button"
                            onClick={() => {
                              setSelectedTeamId(tim.id);
                              setIsManualNumber(false);
                            }}
                            className={cn(
                              'w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all text-left flex items-center justify-between cursor-pointer',
                              isSelected
                                ? 'bg-[#E8F5F7] text-[#1E6B7B] shadow-2xs font-bold'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={cn(
                                  'w-3 h-3 rounded-full flex items-center justify-center border',
                                  isSelected ? 'border-[#1E6B7B] bg-[#1E6B7B]' : 'border-slate-300 bg-white'
                                )}
                              >
                                {isSelected && <span className="w-1 h-1 rounded-full bg-white" />}
                              </span>
                              <span>{tim.name}</span>
                            </div>
                            <span
                              className={cn(
                                'text-xs font-mono px-2 py-0.5 rounded font-bold',
                                isSelected ? 'bg-[#1E6B7B] text-white' : 'bg-slate-100 text-slate-500'
                              )}
                            >
                              {tim.code}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500">
                    {isStaff && staffMatchedTeam
                      ? `Nomor registrasi rapat otomatis disesuaikan dengan tim kerja Anda (${staffMatchedTeam.name}).`
                      : 'Pilih salah satu dari 3 tim untuk penomoran registrasi & pengarsipan rapat.'}
                  </p>
                </div>

                {/* Final Registration Code Input (Auto + Editable) */}
                <div className="md:col-span-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Nomor Registrasi Rapat:
                    </label>
                    {isManualNumber && (
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                        Manual
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={registrationNumber}
                      onChange={(e) => {
                        setRegistrationNumber(e.target.value);
                        setIsManualNumber(true);
                      }}
                      placeholder={`Contoh: ${currentTeam.code}-001`}
                      className="w-full px-3.5 h-[44px] rounded-xl border border-slate-300 bg-white text-slate-900 font-mono font-bold text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B] shadow-2xs"
                    />
                    {isLoadingNumber && (
                      <Loader2 className="w-4 h-4 text-[#1E6B7B] animate-spin absolute right-3 top-3.5" />
                    )}
                  </div>
                  <div className="p-3 bg-white/80 rounded-xl border border-[#BCE3EB] text-[11px] text-slate-600 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span>Tim Aktif:</span>
                      <span className="text-[#1E6B7B] font-bold">
                        {currentTeam.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 font-mono">
                      <span>Format Otomatis:</span>
                      <span className="font-semibold text-slate-700">
                        {currentTeam.code}-001
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[11.5px] text-slate-500">
                💡 Kode nomor registrasi dibuat berbeda per tim (misal: <span className="font-mono font-semibold text-[#1E6B7B]">INV-001</span>, <span className="font-mono font-semibold text-[#1E6B7B]">KS-001</span>, atau <span className="font-mono font-semibold text-[#1E6B7B]">KOM-001</span>). Anda dapat mengedit teks ini langsung bila memiliki penomoran resmi khusus.
              </p>
            </div>

            {/* 2. Judul Rapat */}
            <div>
              <label className="font-bold text-slate-800 mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E6B7B] text-white text-xs flex items-center justify-center font-bold shadow-2xs">2</span>
                  <span>Judul Rapat</span>
                  <span className="text-red-500">*</span>
                </span>
                <span className="text-xs text-slate-400 font-normal">Wajib diisi</span>
              </label>
              <textarea
                required
                rows={3}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Rapat Koordinasi Fasilitasi Investasi Kawasan Ekonomi Khusus dan Percepatan Infrastruktur..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B] shadow-2xs transition-all leading-relaxed"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                Tuliskan topik atau agenda rapat secara jelas sebagaimana tertera pada naskah undangan.
              </p>
            </div>

            {/* 3. Tanggal Rapat */}
            <div>
              <label className="font-bold text-slate-800 mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E6B7B] text-white text-xs flex items-center justify-center font-bold shadow-2xs">3</span>
                  <span>Tanggal Rapat</span>
                  <span className="text-red-500">*</span>
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-semibold">
                  Min. Hari Ini
                </span>
              </label>
              <div className="relative max-w-md">
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={date}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && val < todayStr) {
                      toast.error('Tanggal pelaksanaan rapat tidak boleh mundur (sebelum hari ini).');
                      setDate(todayStr);
                    } else {
                      setDate(val);
                    }
                  }}
                  className="w-full px-4 h-[44px] rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B] shadow-2xs"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Tanggal pelaksanaan pertemuan koordinasi (tidak dapat memilih tanggal sebelum hari ini).
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* BAGIAN II: KATEGORI & BERKAS DOKUMEN PENDUKUNG (Poin 4, 5, 6)             */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden border-t-4 border-t-[#F99D1C]">
          <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0DC] border border-[#FEDEBE] flex items-center justify-center text-[#C2410C]">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Bagian II: Kategori Naskah &amp; Berkas Lampiran
                </h2>
                <p className="text-xs text-slate-500">
                  Kategori dasar naskah, unggahan surat undangan resmi, dan berkas materi paparan
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              Poin 4, 5, 6
            </span>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            {/* 4. Kategori Rapat (Dropdown Field yang Di-klik) */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3.5">
              <div className="flex items-center justify-between">
                <label htmlFor="kategori-rapat-select" className="font-bold text-slate-800 flex items-center gap-2 text-sm cursor-pointer">
                  <span className="w-6 h-6 rounded-full bg-[#1E6B7B] text-white text-xs flex items-center justify-center font-bold shadow-2xs">4</span>
                  <span>Kategori Rapat</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400">Pilih salah satu dasar naskah</span>
              </div>

              {/* Field Dropdown Kategori Rapat */}
              <div className="relative">
                <select
                  id="kategori-rapat-select"
                  value={kategoriRapat}
                  onChange={(e) => setKategoriRapat(e.target.value)}
                  className="w-full px-4 pr-10 h-[46px] rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/25 focus:border-[#1E6B7B] shadow-2xs cursor-pointer appearance-none transition-all hover:border-slate-400"
                >
                  <option value="UNDANGAN_INTERNAL">Undangan Internal</option>
                  <option value="NASKAH_MASUK">Daftar Naskah Masuk</option>
                  <option value="DISPOSISI_SEKJEN">Disposisi Sekjen</option>
                  <option value="DISPOSISI_BIRO">Disposisi Biro</option>
                  <option value="SURAT_DITUNDA">Tunda Rapat</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Conditional Input per kategori */}
              {kategoriRapat === 'NASKAH_MASUK' && (
                <div className="mt-3 animate-in fade-in space-y-1.5 pt-2 border-t border-slate-200/80">
                  <label className="block text-xs font-semibold text-slate-700">
                    Asal Naskah Masuk / Instansi Pengirim (Opsional):
                  </label>
                  <input
                    type="text"
                    value={sourceOrigin}
                    onChange={(e) => setSourceOrigin(e.target.value)}
                    placeholder="Contoh: Kementerian Koordinator Bidang Perekonomian / BUPP KEK Batam..."
                    className="w-full px-3.5 h-[40px] rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B]"
                  />
                </div>
              )}

              {kategoriRapat === 'DISPOSISI_SEKJEN' && (
                <div className="mt-3 animate-in fade-in space-y-1.5 pt-2 border-t border-indigo-200/80">
                  <label className="block text-xs font-semibold text-indigo-900">
                    Nomor Agenda / Catatan Disposisi Sekjen (Opsional):
                  </label>
                  <input
                    type="text"
                    value={sourceOrigin}
                    onChange={(e) => setSourceOrigin(e.target.value)}
                    placeholder="Contoh: No. Agenda 184 / Disposisi Sekjen via SRIKANDI..."
                    className="w-full px-3.5 h-[40px] rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              )}

              {kategoriRapat === 'DISPOSISI_BIRO' && (
                <div className="mt-3 animate-in fade-in space-y-1.5 pt-2 border-t border-purple-200/80">
                  <label className="block text-xs font-semibold text-purple-900">
                    Nomor / Catatan Disposisi Biro (Opsional):
                  </label>
                  <input
                    type="text"
                    value={sourceOrigin}
                    onChange={(e) => setSourceOrigin(e.target.value)}
                    placeholder="Contoh: Disposisi Kepala Biro IKK No. ND-082 / Nota Dinas Internal..."
                    className="w-full px-3.5 h-[40px] rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>
              )}

              {(kategoriRapat === 'SURAT_DITUNDA' || kategoriRapat === 'TUNDA_RAPAT') && (
                <div className="mt-3 animate-in fade-in space-y-1.5 pt-2 border-t border-rose-200/80">
                  <label className="block text-xs font-semibold text-rose-700">
                    Alasan / Keterangan Penundaan Rapat: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={postponeReason}
                    onChange={(e) => setPostponeReason(e.target.value)}
                    placeholder="Contoh: Ditunda atas arahan pimpinan menyusul agenda Sidang Kabinet..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              )}
            </div>

            {/* Grid 2 Kolom untuk Poin 5 (Surat Undangan) dan Poin 6 (Dokumen Terkait / Paparan) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 5. Surat Undangan (Bisa Upload File) */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 rounded-full bg-[#1E6B7B] text-white text-xs flex items-center justify-center font-bold shadow-2xs">5</span>
                    <span>Surat Undangan</span>
                  </label>
                  <span className="text-[11px] text-slate-400">(Bisa Upload File)</span>
                </div>
                <p className="text-xs text-slate-500">
                  Lampiran naskah resmi surat undangan rapat (dapat dikosongkan).
                </p>

                {!invitationDoc ? (
                  <div
                    onClick={() => !isUploadingInvitationDoc && invitationFileInputRef.current?.click()}
                    className="border border-dashed border-slate-300 hover:border-[#1E6B7B] bg-white hover:bg-slate-50/50 rounded-xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5"
                  >
                    <input
                      ref={invitationFileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadFile(file, 'undangan');
                      }}
                    />
                    {isUploadingInvitationDoc ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#1E6B7B]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengunggah berkas surat undangan...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-[#1E6B7B]" />
                        <span className="text-xs font-semibold text-slate-700">
                          Klik untuk upload Surat Undangan
                        </span>
                        <span className="text-[11px] text-slate-400">PDF, Word (.docx), Gambar</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-teal-200 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{invitationDoc.name}</p>
                        <p className="text-[10px] text-slate-400">{formatFileSize(invitationDoc.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={invitationDoc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                      >
                        Lihat
                      </a>
                      <button
                        type="button"
                        onClick={() => setInvitationDoc(null)}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50"
                        title="Hapus berkas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Dokumen Terkait / Paparan Rapat (Bisa Upload File) */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 rounded-full bg-[#1E6B7B] text-white text-xs flex items-center justify-center font-bold shadow-2xs">6</span>
                    <span>Dokumen Terkait / Paparan Rapat</span>
                  </label>
                  <span className="text-[11px] text-slate-400">(Bisa Upload File)</span>
                </div>
                <p className="text-xs text-slate-500">
                  Materi presentasi, paparan rapat, atau data lampiran teknis (dapat dikosongkan).
                </p>

                {!materialDoc ? (
                  <div
                    onClick={() => !isUploadingMaterialDoc && materialFileInputRef.current?.click()}
                    className="border border-dashed border-slate-300 hover:border-[#1E6B7B] bg-white hover:bg-slate-50/50 rounded-xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5"
                  >
                    <input
                      ref={materialFileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.pptx,.ppt,.docx,.xlsx,.txt,.png,.jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadFile(file, 'paparan');
                      }}
                    />
                    {isUploadingMaterialDoc ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#1E6B7B]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengunggah dokumen paparan...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-[#1E6B7B]" />
                        <span className="text-xs font-semibold text-slate-700">
                          Klik untuk upload Paparan / Bahan Rapat
                        </span>
                        <span className="text-[11px] text-slate-400">PDF, PPTX, Word, Excel, Gambar</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-teal-200 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{materialDoc.name}</p>
                        <p className="text-[10px] text-slate-400">{formatFileSize(materialDoc.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={materialDoc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                      >
                        Lihat
                      </a>
                      <button
                        type="button"
                        onClick={() => setMaterialDoc(null)}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50"
                        title="Hapus berkas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* BAGIAN III: PARAMETER PELAKSANAAN & PESERTA (Poin 7, 8, 9, 10)            */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden border-t-4 border-t-[#31889C]">
          <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F0F9FA] border border-[#BCE3EB] flex items-center justify-center text-[#1E6B7B]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Bagian III: Klasifikasi Rapat, PIC, Undangan &amp; Ruangan
                </h2>
                <p className="text-xs text-slate-500">
                  Jenis bentuk rapat, PIC teknis, daftar peserta yang diundang, dan lokasi ruangan
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
              Poin 7, 8, 9, 10
            </span>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            {/* 7. Jenis Rapat (Dropdown + Other) */}
            <div>
              <label className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-[#1E6B7B] text-white text-xs flex items-center justify-center font-bold shadow-2xs">7</span>
                <span>Jenis Rapat</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                value={jenisRapat}
                onChange={(e) => setJenisRapat(e.target.value)}
                className="w-full px-4 h-[44px] rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B] shadow-2xs cursor-pointer"
              >
                {JENIS_RAPAT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'Other' ? 'Other (Kategori Lainnya...)' : opt}
                  </option>
                ))}
              </select>

              {jenisRapat === 'Other' && (
                <div className="mt-2.5 animate-in fade-in">
                  <input
                    type="text"
                    required
                    value={customJenisRapat}
                    onChange={(e) => setCustomJenisRapat(e.target.value)}
                    placeholder="Ketikkan jenis rapat lainnya di sini..."
                    className="w-full px-4 h-[40px] rounded-xl border border-[#1E6B7B] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20"
                  />
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1.5">
                Pilih bentuk atau format penyelenggaraan kegiatan.
              </p>
            </div>

            {/* 8. PIC Rapat */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-[#1E6B7B] text-white text-xs flex items-center justify-center font-bold shadow-2xs">8</span>
                <span>PIC Rapat</span>
                <span className="text-red-500">*</span>
              </label>
              <PicSelector
                availableUsers={availableUsers}
                selectedUserId={picUserId}
                picName={picName}
                onSelectUser={(u) => {
                  setPicUserId(u ? u.id : '');
                  setPicName(u ? u.name : '');
                }}
                onPicNameChange={(name) => setPicName(name)}
                required
              />
              <p className="text-xs text-slate-400">
                Staf atau pejabat penanggung jawab teknis rapat. Pilih melalui dropdown berfilter tim kerja di atas.
              </p>
            </div>

            {/* 9. Undangan Rapat (Peserta Rapat yang Diundang) */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#1E6B7B] text-white text-xs flex items-center justify-center font-bold shadow-2xs">9</span>
                  <span>Undangan Rapat (Peserta Rapat yang Diundang)</span>
                </label>
                <Badge variant="teal" dot className="text-xs">
                  {selectedUserIds.length} Staf Internal Dipilih
                </Badge>
              </div>

              {/* Sub A: Dropdown Multi-Select Staf Internal */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  A. Staf &amp; Pejabat Internal KEK yang Diundang:
                </label>
                <AttendeesSelector
                  availableUsers={availableUsers}
                  selectedUserIds={selectedUserIds}
                  onToggleUser={(id) => {
                    setSelectedUserIds((prev) =>
                      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
                    );
                  }}
                  onSelectUsers={(ids) => setSelectedUserIds(ids)}
                  onClearAll={() => setSelectedUserIds([])}
                />
              </div>

              {/* Sub B: Peserta Eksternal / Instansi Terkait */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  B. Peserta Rapat Eksternal &amp; Lembaga Terkait yang Diundang:
                </label>
                <textarea
                  rows={2}
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  placeholder="Contoh: Kementerian Koordinator Bidang Perekonomian, Direksi PT KEK Kendal, Pemprov Jawa Tengah, Dinas Penanaman Modal..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B] shadow-2xs leading-relaxed"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Tuliskan nama instansi, kementerian, atau tamu eksternal yang diundang.
                </p>
              </div>
            </div>

            {/* 10. Lokasi Kegiatan (Dropdown + Other) */}
            <div className="pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-[#1E6B7B] text-white text-xs flex items-center justify-center font-bold shadow-2xs">10</span>
                <span>Lokasi Kegiatan</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select
                    value={lokasiOption}
                    onChange={(e) => setLokasiOption(e.target.value)}
                    className="w-full px-4 h-[44px] rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B] shadow-2xs cursor-pointer"
                  >
                    {LOKASI_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc === 'Other'
                          ? 'Other (Berada di tempat lain)'
                          : loc === 'Administrator'
                          ? 'Administrator'
                          : `Ruang ${loc}`}
                      </option>
                    ))}
                  </select>
                </div>

                {lokasiOption === 'Other' ? (
                  <div>
                    <input
                      type="text"
                      required
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="Masukkan nama ruangan / lokasi di luar gedung..."
                      className="w-full px-4 h-[44px] rounded-xl border border-[#1E6B7B] bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 shadow-2xs"
                    />
                  </div>
                ) : (
                  <div className="px-4 h-[44px] rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#1E6B7B]" />
                    <span>Ruang / Lokasi KEK: <strong>{lokasiOption === 'Administrator' ? 'Administrator' : `Ruang ${lokasiOption}`}</strong></span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Pilih salah satu dari 5 ruangan/lokasi resmi (Graha Satwika, Loka Jagatsaksana, Lokasandhi, Antawacana, Administrator) atau pilih Other untuk lokasi luar.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BAGIAN IV: HASIL KEGIATAN, OUTPUT & RENCANA AKSI (Catatan Mentor)          */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden border-t-4 border-t-emerald-600">
          <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Bagian IV: Hasil Kegiatan, Output Kerja &amp; Tindak Lanjut
                </h2>
                <p className="text-xs text-slate-500">
                  Tautan Google Drive, Catatan ringkas hasil kegiatan, Rencana aksi, Nota Dinas Konsumsi, dan Rilis Berita
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
              Output &amp; Arsip
            </span>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            {/* 11. Rencana Aksi & Link Google Drive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold shadow-2xs">11</span>
                  <span>Rencana Aksi</span>
                </label>
                <select
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  className="w-full px-4 h-[44px] rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                >
                  <option value="Rutin">Rutin (Tugas &amp; Agenda Rutin Berkala)</option>
                  <option value="Non-Rutin">Non-Rutin (Penugasan Khusus / Prioritas)</option>
                  <option value="Insidental">Insidental (Mendadak / Darurat)</option>
                </select>
                <p className="text-xs text-slate-400 mt-1.5">
                  Klasifikasi rencana aksi apakah kegiatan ini bersifat rutin, non-rutin, atau insidental.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold shadow-2xs">12</span>
                  <span>Link Hasil Kegiatan (Google Drive)</span>
                </label>
                <input
                  type="url"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full px-4 h-[44px] rounded-xl border border-slate-300 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Tautan Google Drive berisi dokumentasi foto, materi presentasi, atau berkas hasil pekerjaan.
                </p>
              </div>
            </div>

            {/* 13. Catatan Hasil Kegiatan */}
            <div>
              <label className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold shadow-2xs">13</span>
                <span>Catatan Hasil Kegiatan / Ringkasan Pekerjaan</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan catatan hasil penting, poin kesepakatan, kendala lapangan, atau capaian pekerjaan..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs leading-relaxed"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                Kolom catatan hasil untuk evaluasi langsung oleh Pimpinan dan rekan tim kerja.
              </p>
            </div>

            {/* 14. Pembuatan Nd Konsum & 15. Rilis Berita */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
              {/* Nd Konsum */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold shadow-2xs">14</span>
                  <span>Pembuatan Nd Konsumsi (Opsional)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={ndConsumptionNumber}
                    onChange={(e) => setNdConsumptionNumber(e.target.value)}
                    placeholder="Nomor Nd Konsum (mis. 042/ND/IKK)"
                    className="w-full px-3 h-[38px] rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                  <select
                    value={ndConsumptionStatus}
                    onChange={(e) => setNdConsumptionStatus(e.target.value)}
                    className="w-full px-3 h-[38px] rounded-lg border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 cursor-pointer"
                  >
                    <option value="Diproses">Status: Diproses</option>
                    <option value="Disetujui">Status: Disetujui</option>
                    <option value="Selesai">Status: Selesai</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-400">
                  Isi jika kegiatan memerlukan pengajuan Nota Dinas Konsumsi untuk jamuan rapat.
                </p>
              </div>

              {/* Rilis Berita */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-2xs">15</span>
                  <span>Upload / Tautan Rilis Berita (Opsional)</span>
                </label>
                <input
                  type="text"
                  value={releaseTitle}
                  onChange={(e) => setReleaseTitle(e.target.value)}
                  placeholder="Judul Rilis Berita / Siaran Pers..."
                  className="w-full px-3 h-[38px] rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <input
                  type="url"
                  value={releaseUrl}
                  onChange={(e) => setReleaseUrl(e.target.value)}
                  placeholder="https://kek.go.id/berita/... atau link portal berita"
                  className="w-full px-3 h-[38px] rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <p className="text-[11px] text-slate-400">
                  Tautan berita publikasi atau siaran pers terkait kegiatan yang telah dirilis ke publik.
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* ========================================================================= */}
        {/* SUBMIT BUTTON BAR                                                         */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-20 backdrop-blur-md bg-white/95">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-slate-800">
                Formulir Rapat Siap Disimpan
              </p>
              <p className="text-[11px] text-slate-500">
                Nomor: <span className="font-mono font-semibold text-[#1E6B7B]">{registrationNumber || 'Otomatis'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Link
              href="/semua-rapat"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitted}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#175360] to-[#1E6B7B] hover:from-[#13424d] hover:to-[#175360] text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitted ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Kegiatan...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan Catatan Kegiatan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
