'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  FileText,
  UserCheck,
  CheckCircle2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Shield,
  Layers,
  CheckSquare,
  FileDown,
  UserPlus,
  Check,
  Clock3,
  X,
  Mail,
  Loader2,
  AlertCircle,
  Sparkles,
  Info,
  Link2,
  Eye,
  ExternalLink,
  Edit3,
  History,
  HelpCircle,
  Paperclip,
  UploadCloud,
  Video,
  Presentation,
  Inbox,
  Tag,
  Play,
  FileCheck,
} from 'lucide-react';

import { MeetingStatusBadge, MeetingProgressBadge } from '@/components/meeting/meeting-status-badge';
import { MeetingStatusGuideDialog } from '@/components/meeting/meeting-status-guide-dialog';
import {
  getMeetingStatusDetail,
  MEETING_STATUS_DETAILS,
  normalizeProgressStatus,
  mapProgressToStatus,
  mapStatusToProgress,
} from '@/lib/meeting-status';
import { cn } from '@/lib/utils';
import { MeetingMinutesSection } from '@/components/meeting/meeting-minutes/meeting-minutes-section';
import { MeetingFilePreviewPanel } from '@/components/meeting/file-preview';
import { ActionItemList } from '@/components/action-items/action-item-list';
import { PreviousMeetingModal } from '@/components/meeting/previous-meeting-modal';
import { LinkMeetingDialog } from '@/components/meeting/link-meeting-dialog';
import { AgendaSeriesModal } from '@/components/meeting/agenda-series-modal';
import { MinutesHistorySection } from '@/components/meeting/meeting-history/minutes-history-section';
import { GoogleCalendarModal } from '@/components/meeting/google-calendar-modal';
import { UpdateMeetingOutputDialog } from '@/components/meeting/update-meeting-output-dialog';
import {
  MeetingCategorySelector,
  CategorySelectionData,
} from '@/components/meeting/meeting-category-selector';
import { extractVirtualMeetingDetails } from '@/lib/calendar';
import { extractPlainText } from '@/lib/pdf/pdf-utils';
import {
  MeetingStatus,
  getMeetingCategoryInfo,
  MeetingDocumentCategory,
  MeetingDocumentSubCategory,
} from '@/lib/types';
import { AttendanceStatus } from '@prisma/client';
import {
  updateMeetingStatusAction,
  approveMeetingAction,
  deleteMeetingAction,
  updateParticipantAttendanceAction,
  addParticipantToMeetingAction,
  removeParticipantFromMeetingAction,
  updateMeetingNumberAction,
  updateMeetingCategoryAction,
} from '@/app/actions/meeting-actions';
import {
  uploadInvitationFileAction,
  updateMeetingInvitationDocAction,
} from '@/app/actions/meeting-upload-actions';
import { useSession } from 'next-auth/react';
import { toast, confirmModal } from '@/components/providers/toast-provider';

interface MeetingDetailViewProps {
  meeting: any;
  availableBiros?: any[];
  availableUsers?: any[];
  initialTab?: string;
}

type TabType = 'overview' | 'participants' | 'minutes' | 'actionItems';
type MinutesSubTab = 'document' | 'materials' | 'history';
const VALID_TABS: TabType[] = ['overview', 'participants', 'minutes', 'actionItems'];

const MEETING_WORKFLOW: {
  key: MeetingStatus;
  step: number;
  label: string;
  sublabel: string;
  description: string;
}[] = [
    {
      key: 'DRAFT',
      step: 1,
      label: 'Draf',
      sublabel: 'Penyusunan',
      description: 'Penyusunan naskah risalah awal oleh notulis rapat',
    },
    {
      key: 'REVIEW',
      step: 2,
      label: 'Review',
      sublabel: 'Penelaahan',
      description: 'Pemeriksaan substansi oleh biro terkait / tim perumus',
    },
    {
      key: 'APPROVED',
      step: 3,
      label: 'Disetujui',
      sublabel: 'Validasi',
      description: 'Substansi risalah telah divalidasi pimpinan sidang',
    },
    {
      key: 'FINAL',
      step: 4,
      label: 'Final',
      sublabel: 'Diterbitkan',
      description: 'Naskah resmi berkekuatan tetap, siap didistribusikan & ditindaklanjuti',
    },
  ];

const ATTENDANCE_OPTIONS: {
  value: AttendanceStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
  badgeClass: string;
  desc: string;
}[] = [
    {
      value: 'PRESENT',
      label: 'Hadir',
      icon: Check,
      activeClass: 'bg-[#7CC563] text-white shadow-xs border-[#7CC563]',
      badgeClass: 'bg-[#ECF8E9] text-[#4D8F3D] border-[#D2EFCA]',
      desc: 'Peserta hadir mengikuti sidang rapat',
    },
    {
      value: 'EXCUSED',
      label: 'Izin',
      icon: Clock3,
      activeClass: 'bg-[#FFD300] text-slate-900 shadow-xs border-[#FFD300]',
      badgeClass: 'bg-[#FFF8CC] text-[#8A7200] border-[#FFEE99]',
      desc: 'Peserta berhalangan hadir dengan konfirmasi izin resmi',
    },
    {
      value: 'ABSENT',
      label: 'Tidak Hadir',
      icon: X,
      activeClass: 'bg-rose-600 text-white shadow-xs border-rose-600',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-300',
      desc: 'Peserta tidak hadir tanpa konfirmasi',
    },
    {
      value: 'INVITED',
      label: 'Diundang',
      icon: Mail,
      activeClass: 'bg-slate-700 text-white shadow-xs border-slate-700',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      desc: 'Undangan terkirim, menunggu konfirmasi kehadiran',
    },
  ];

export function MeetingDetailView({
  meeting,
  availableBiros = [],
  availableUsers = [],
  initialTab,
}: MeetingDetailViewProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'STAFF';
  const canEditMeeting = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'STAFF';
  const canDeleteMeeting = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'STAFF';
  const canManageParticipants =
    userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'STAFF' || userRole === 'PIMPINAN';
  const canEditMinutes = canManageParticipants;
  const canCreateActionItem =
    userRole === 'SUPER_ADMIN' ||
    userRole === 'ADMIN' ||
    userRole === 'STAFF';

  // Biro ownership check for status updates & staff permissions
  const isPrivileged = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'PIMPINAN' || userRole === 'STAFF';
  const isMeetingBiro =
    isPrivileged ||
    (session?.user?.biroId && session.user.biroId === meeting.primaryBiroId) ||
    (session?.user?.biroCode &&
      meeting.primaryBiro?.code &&
      session.user.biroCode.toUpperCase() === meeting.primaryBiro.code.toUpperCase());

  const canChangeStatus = isPrivileged;
  const canApprove = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'PIMPINAN';

  const initialResolvedTab: TabType = initialTab === 'history'
    ? 'minutes'
    : (initialTab && VALID_TABS.includes(initialTab as TabType))
      ? (initialTab as TabType)
      : (meeting.minutes ? 'minutes' : 'overview');

  const initialMinutesSubTab: MinutesSubTab =
    initialTab === 'history'
      ? 'history'
      : initialTab === 'materials'
        ? 'materials'
        : 'document';

  const [activeTab, setActiveTab] = useState<TabType>(initialResolvedTab);
  const [minutesSubTab, setMinutesSubTab] = useState<MinutesSubTab>(initialMinutesSubTab);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    }
  };

  const handleMinutesSubTabChange = (sub: MinutesSubTab) => {
    setMinutesSubTab(sub);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (sub === 'document') {
        url.searchParams.set('tab', 'minutes');
      } else {
        url.searchParams.set('tab', sub);
      }
      window.history.replaceState(null, '', url.toString());
    }
  };
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isStatusGuideOpen, setIsStatusGuideOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [status, setStatus] = useState<MeetingStatus>(meeting.status);
  const [progressStatus, setProgressStatus] = useState<string>(
    (meeting as any).progressStatus || mapStatusToProgress(meeting.status)
  );
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);
  const statusPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusPopoverRef.current && !statusPopoverRef.current.contains(event.target as Node)) {
        setIsStatusPopoverOpen(false);
      }
    }
    if (isStatusPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusPopoverOpen]);

  // Meeting Data & Output Modal state
  const [meetingData, setMeetingData] = useState<any>(meeting);
  const [isOutputDialogOpen, setIsOutputDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    setMeetingData(meeting);
  }, [meeting]);

  // Custom Meeting Number state
  const [currentMeetingNumber, setCurrentMeetingNumber] = useState<string>(meeting.meetingNumber);
  const [isEditingMeetingNumber, setIsEditingMeetingNumber] = useState(false);
  const [editNumberValue, setEditNumberValue] = useState<string>(meeting.meetingNumber);
  const [isSavingNumber, setIsSavingNumber] = useState(false);

  // Meeting Category state
  const [categoryData, setCategoryData] = useState<CategorySelectionData>({
    category: (meeting.documentCategory as MeetingDocumentCategory) || 'UNDANGAN_INTERNAL',
    subCategory: (meeting.documentSubCategory as MeetingDocumentSubCategory) || null,
    sourceOrigin: meeting.sourceOrigin || '',
    postponeReason: meeting.postponeReason || '',
  });
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [editCategoryForm, setEditCategoryForm] = useState<CategorySelectionData>({
    category: (meeting.documentCategory as MeetingDocumentCategory) || 'UNDANGAN_INTERNAL',
    subCategory: (meeting.documentSubCategory as MeetingDocumentSubCategory) || null,
    sourceOrigin: meeting.sourceOrigin || '',
    postponeReason: meeting.postponeReason || '',
  });
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Rapat Lanjutan / Rujukan states
  const [previousMeeting, setPreviousMeeting] = useState<any>(meeting.previousMeeting || null);
  const [showPreviousMeetingModal, setShowPreviousMeetingModal] = useState<boolean>(false);
  const [showLinkMeetingModal, setShowLinkMeetingModal] = useState<boolean>(false);
  const [showSeriesModal, setShowSeriesModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Participant attendance states
  const [participants, setParticipants] = useState<any[]>(meeting.participants || []);
  const [updatingParticipantId, setUpdatingParticipantId] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [participantMode, setParticipantMode] = useState<'registered' | 'unregistered'>('registered');
  const [selectedAddUserId, setSelectedAddUserId] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [customBiroId, setCustomBiroId] = useState<string>(meeting.primaryBiroId || '');
  const [newParticipantStatus, setNewParticipantStatus] = useState<AttendanceStatus>('PRESENT');
  const [isAddingParticipant, setIsAddingParticipant] = useState<boolean>(false);

  // Invitation Document states
  const [invitationDoc, setInvitationDoc] = useState<{
    url: string;
    name: string;
    size?: number | null;
  } | null>(
    meeting.invitationDocUrl
      ? {
        url: meeting.invitationDocUrl,
        name: meeting.invitationDocName || 'Dokumen Undangan Resmi',
        size: meeting.invitationDocSize || null,
      }
      : null
  );
  const [isUploadingInvitation, setIsUploadingInvitation] = useState(false);
  const invitationFileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleUploadInvitation = async (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Ukuran berkas melebihi batas 100MB.');
      return;
    }
    setIsUploadingInvitation(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await uploadInvitationFileAction(formData);
      if (!uploadRes.success || !uploadRes.data) {
        throw new Error(uploadRes.error || 'Gagal mengunggah berkas undangan.');
      }
      const updateRes = await updateMeetingInvitationDocAction(meeting.id, {
        url: uploadRes.data.url,
        name: uploadRes.data.name,
        size: uploadRes.data.size,
      });
      if (!updateRes.success) {
        throw new Error(updateRes.error || 'Gagal menyimpan tautan berkas ke rapat.');
      }
      setInvitationDoc({
        url: uploadRes.data.url,
        name: uploadRes.data.name,
        size: uploadRes.data.size,
      });
      toast.success('Dokumen undangan resmi berhasil diperbarui!');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan saat mengunggah dokumen.');
    } finally {
      setIsUploadingInvitation(false);
    }
  };

  const handleRemoveInvitation = async () => {
    const confirmed = await confirmModal({
      title: 'Hapus Dokumen Undangan?',
      message: 'Apakah Anda yakin ingin melepas lampiran surat undangan resmi dari rapat ini?',
      confirmText: 'Ya, Lepas Lampiran',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      const res = await updateMeetingInvitationDocAction(meeting.id, null);
      if (res.success) {
        setInvitationDoc(null);
        toast.success('Dokumen undangan berhasil dilepas.');
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal melepas dokumen.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Gagal melepas dokumen.');
    }
  };

  const showToast = (message: string) => {
    toast.success(message);
  };

  // Check if calendar modal should auto-open (e.g. from /buat-rapat?calendar=true)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('calendar') === 'true') {
        setShowCalendarModal(true);
        urlParams.delete('calendar');
        const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, []);

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const res = await fetch(`/api/meetings/${meeting.id}/pdf`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || 'Gagal mengunduh dokumen PDF.');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Risalah-Rapat-${meeting.meetingNumber || 'KEK'}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success(`Risalah rapat ${meeting.meetingNumber} berhasil diunduh (PDF).`);
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan saat mengekspor PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDocx = async (type?: 'notula' | 'nota-dinas') => {
    try {
      setIsExportingDocx(true);
      const isNota =
        type === 'nota-dinas' ||
        (!type && (meeting.minutes?.conclusion as any)?.docType === 'NOTA_DINAS');
      const targetType = isNota ? 'nota-dinas' : 'notula';
      const res = await fetch(`/api/meetings/${meeting.id}/docx?type=${targetType}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || 'Gagal mengunduh dokumen Word (.docx).');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanNum = (meeting.meetingNumber || 'KEK').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = isNota
        ? `Nota-Dinas-${cleanNum}.docx`
        : `Risalah-Rapat-${cleanNum}.docx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success(
        isNota
          ? `Nota Dinas rapat ${meeting.meetingNumber} berhasil diunduh (Word .docx).`
          : `Risalah rapat ${meeting.meetingNumber} berhasil diunduh (Word .docx).`
      );
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan saat mengekspor Word.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const formattedDate = new Date(meeting.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSaveMeetingNumber = async () => {
    const trimmed = editNumberValue.trim();
    if (!trimmed) {
      toast.warning('Nomor surat / undangan tidak boleh kosong.');
      return;
    }
    setIsSavingNumber(true);
    try {
      const res = await updateMeetingNumberAction(meeting.id, trimmed);
      if (res.success) {
        setCurrentMeetingNumber(trimmed);
        setIsEditingMeetingNumber(false);
        toast.success(`Nomor surat rapat berhasil diubah menjadi "${trimmed}".`);
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal mengubah nomor surat');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSavingNumber(false);
    }
  };

  const handleSaveCategory = async () => {
    const isPostponed =
      editCategoryForm.category === 'SURAT_DITUNDA' || editCategoryForm.category === 'TUNDA_RAPAT';
    if (isPostponed && !editCategoryForm.postponeReason?.trim()) {
      toast.warning('Mohon isi alasan penundaan rapat');
      return;
    }

    try {
      setIsSavingCategory(true);
      const res = await updateMeetingCategoryAction(meeting.id, editCategoryForm);
      if (res.success) {
        setCategoryData({ ...editCategoryForm });
        setIsEditCategoryModalOpen(false);
        toast.success('Kategori naskah berhasil diperbarui!');
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal memperbarui kategori');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleStatusChange = async (newStatus: MeetingStatus) => {
    if (status === newStatus || isUpdatingStatus) return;

    const targetDetail = getMeetingStatusDetail(newStatus);

    if (newStatus === 'FINAL') {
      const confirmed = await confirmModal({
        title: `Finalisasi & Sahkan Risalah ${currentMeetingNumber}?`,
        message:
          'Mengubah status menjadi "Final (Tahap 4)" menandakan naskah risalah resmi telah disahkan, berkekuatan hukum tetap, dan seluruh butir tindak lanjut wajib dieksekusi oleh biro terkait. Lanjutkan pengesahan final?',
        confirmText: 'Ya, Finalkan & Sahkan Risalah',
        variant: 'primary',
      });
      if (!confirmed) return;
    } else if (newStatus === 'APPROVED') {
      const confirmed = await confirmModal({
        title: `Validasi & Setujui Risalah ${currentMeetingNumber}?`,
        message:
          'Mengubah status menjadi "Disetujui (Tahap 3)" menandakan bahwa materi dan substansi risalah telah divalidasi oleh Pimpinan Sidang. Anda masih dapat memajukannya ke "Final" saat naskah siap diedarkan secara resmi. Lanjutkan persetujuan?',
        confirmText: 'Ya, Setujui Risalah',
        variant: 'primary',
      });
      if (!confirmed) return;
    } else if (newStatus === 'REVIEW') {
      const confirmed = await confirmModal({
        title: `Kirim Risalah ke Tahap Review?`,
        message:
          'Mengubah status menjadi "Review (Tahap 2)" menandakan draf risalah siap diedarkan ke tim perumus atau peserta rapat untuk penelaahan dan koreksi materi. Lanjutkan?',
        confirmText: 'Ya, Kirim ke Review',
        variant: 'primary',
      });
      if (!confirmed) return;
    }

    try {
      setIsUpdatingStatus(true);
      const res = await updateMeetingStatusAction(meeting.id, newStatus);
      if (res.success) {
        setStatus(newStatus);
        toast.success(`Status rapat berhasil diperbarui ke tahap ${targetDetail.fullTitle}.`);
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal mengubah status');
      }
    } catch (err: any) {
      toast.error(`Terjadi kesalahan: ${err?.message || 'Gagal'}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const currentProgress = normalizeProgressStatus(
    progressStatus || (status === 'DRAFT' ? 'Belum Dimulai' : status === 'REVIEW' ? 'Dalam Proses' : 'Selesai')
  );
  const isBelumDimulai = currentProgress === 'Belum Dimulai' || status === 'DRAFT';

  const handleUpdateProgressStatus = async (newProg: 'Belum Dimulai' | 'Dalam Proses' | 'Selesai') => {
    if (normalizeProgressStatus(progressStatus) === newProg || isUpdatingStatus) {
      setIsStatusPopoverOpen(false);
      return;
    }

    if (newProg === 'Selesai') {
      const confirmed = await confirmModal({
        title: `Tandai Rapat Selesai?`,
        message: `Mengubah status menjadi "Selesai" menandakan pelaksanaan rapat dan perumusan risalah telah rampung dan disahkan. Lanjutkan?`,
        confirmText: 'Ya, Tandai Selesai',
        variant: 'primary',
      });
      if (!confirmed) return;
    }

    try {
      setIsUpdatingStatus(true);
      const res = await updateMeetingStatusAction(meeting.id, newProg);
      if (res.success) {
        setProgressStatus(newProg);
        const mappedStatus = mapProgressToStatus(newProg);
        setStatus(mappedStatus);
        (meeting as any).progressStatus = newProg;
        (meeting as any).status = mappedStatus;
        toast.success(`Status rapat berhasil diperbarui ke "${newProg}".`);
        setIsStatusPopoverOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal memperbarui status rapat.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStartMeeting = async () => {
    const confirmed = await confirmModal({
      title: `Mulai Pelaksanaan Rapat?`,
      message: `Apakah Anda ingin memulai pelaksanaan rapat "${meeting.title}" sekarang? Status rapat akan langsung diubah menjadi "Dalam Proses".`,
      confirmText: 'Ya, Mulai Rapat',
      variant: 'primary',
    });
    if (!confirmed) return;

    try {
      setIsUpdatingStatus(true);
      const res = await updateMeetingStatusAction(meeting.id, 'Dalam Proses');
      if (res.success) {
        setStatus('REVIEW');
        setProgressStatus('Dalam Proses');
        (meeting as any).progressStatus = 'Dalam Proses';
        toast.success(`Rapat "${meeting.title}" resmi dimulai. Status kini "Dalam Proses".`);
        setActiveTab('minutes');
        setMinutesSubTab('document');
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('tab', 'minutes');
          window.history.replaceState(null, '', url.toString());
        }
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal memulai rapat');
      }
    } catch (err: any) {
      toast.error(`Terjadi kesalahan: ${err?.message || 'Gagal memulai rapat'}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleApproveMeeting = async () => {
    const confirmed = await confirmModal({
      title: `Setujui & Selesaikan Rapat?`,
      message: `Apakah Anda ingin menyetujui hasil dan risalah rapat "${meeting.title}"? Setelah disetujui, status rapat akan resmi diubah menjadi "SELESAI".`,
      confirmText: 'Ya, Setujui & Selesaikan',
      variant: 'primary',
    });
    if (!confirmed) return;

    try {
      setIsUpdatingStatus(true);
      const res = await approveMeetingAction(meeting.id);
      if (res.success) {
        setStatus('APPROVED');
        setProgressStatus('Selesai');
        (meeting as any).status = 'APPROVED';
        (meeting as any).progressStatus = 'Selesai';
        toast.success(`Hasil rapat "${meeting.title}" resmi disetujui. Status rapat kini "Selesai".`);
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal menyetujui hasil rapat');
      }
    } catch (err: any) {
      toast.error(`Terjadi kesalahan: ${err?.message || 'Gagal menyetujui hasil rapat'}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirmModal({
      title: `Hapus Rapat ${meeting.meetingNumber}?`,
      message: `Apakah Anda yakin ingin menghapus permanen rapat "${meeting.title}" beserta seluruh notulen dan butir tindak lanjutnya dari database?`,
      confirmText: 'Ya, Hapus Rapat',
      variant: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      const res = await deleteMeetingAction(meeting.id);
      if (res.success) {
        toast.flash('success', `Rapat ${meeting.meetingNumber} berhasil dihapus dari database.`, 'Berhasil Dihapus');
        window.location.href = '/semua-rapat';
      } else {
        toast.error(res.error || 'Gagal menghapus rapat');
        setIsDeleting(false);
      }
    } catch (err: any) {
      toast.error(`Terjadi kesalahan: ${err?.message || 'Gagal menghapus rapat'}`);
      setIsDeleting(false);
    }
  };

  // Participant handlers
  const handleUpdateAttendance = async (
    participantId: string,
    newStatus: AttendanceStatus,
    userName: string
  ) => {
    const prevParticipants = [...participants];
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, attendanceStatus: newStatus } : p))
    );
    setUpdatingParticipantId(participantId);

    try {
      const res = await updateParticipantAttendanceAction(participantId, newStatus);
      if (res.success) {
        const label = ATTENDANCE_OPTIONS.find((o) => o.value === newStatus)?.label || newStatus;
        toast.success(`Presensi "${userName}" diubah menjadi "${label}".`);
        router.refresh();
      } else {
        setParticipants(prevParticipants);
        toast.error(res.error || 'Gagal mengubah status kehadiran.');
      }
    } catch (err: any) {
      setParticipants(prevParticipants);
      toast.error(err?.message || 'Terjadi kesalahan sistem saat memperbarui presensi.');
    } finally {
      setUpdatingParticipantId(null);
    }
  };

  const handleMarkAllPresent = async () => {
    const notPresent = participants.filter((p) => p.attendanceStatus !== 'PRESENT');
    if (notPresent.length === 0) {
      toast.info('Semua peserta sidang sudah berstatus "Hadir".');
      return;
    }

    const confirmed = await confirmModal({
      title: 'Tandai Semua Hadir?',
      message: `Tandai ${notPresent.length} peserta yang belum hadir sebagai "Hadir"?`,
      confirmText: 'Ya, Tandai Hadir',
      variant: 'primary',
    });

    if (!confirmed) {
      return;
    }

    setIsBulkUpdating(true);
    try {
      for (const p of notPresent) {
        await updateParticipantAttendanceAction(p.id, 'PRESENT');
      }
      setParticipants((prev) =>
        prev.map((p) => ({ ...p, attendanceStatus: 'PRESENT' as AttendanceStatus }))
      );
      toast.success(`Berhasil menandai ${notPresent.length} peserta sebagai "Hadir".`);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan saat memperbarui presensi massal.');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string, userName: string) => {
    const confirmed = await confirmModal({
      title: 'Hapus Peserta Sidang?',
      message: `Hapus "${userName}" dari daftar peserta sidang ini?`,
      confirmText: 'Hapus Peserta',
      variant: 'danger',
    });

    if (!confirmed) {
      return;
    }

    const prev = [...participants];
    setParticipants((p) => p.filter((x) => x.id !== participantId));
    setUpdatingParticipantId(participantId);

    try {
      const res = await removeParticipantFromMeetingAction(participantId);
      if (res.success) {
        toast.success(`Peserta "${userName}" berhasil dihapus dari daftar sidang.`);
        router.refresh();
      } else {
        setParticipants(prev);
        toast.error(res.error || 'Gagal menghapus peserta.');
      }
    } catch (err: any) {
      setParticipants(prev);
      toast.error(err?.message || 'Terjadi kesalahan saat menghapus peserta.');
    } finally {
      setUpdatingParticipantId(null);
    }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (participantMode === 'registered' && !selectedAddUserId) {
      toast.warning('Silakan pilih peserta yang ingin ditambahkan.');
      return;
    }
    if (participantMode === 'unregistered' && !customName.trim()) {
      toast.warning('Silakan masukkan nama lengkap pejabat / peserta.');
      return;
    }

    setIsAddingParticipant(true);
    try {
      const payload =
        participantMode === 'registered'
          ? {
            userId: selectedAddUserId,
            attendanceStatus: newParticipantStatus,
          }
          : {
            customName: customName.trim(),
            customEmail: customEmail.trim() || undefined,
            biroId: customBiroId || meeting.primaryBiroId,
            attendanceStatus: newParticipantStatus,
          };

      const res = await addParticipantToMeetingAction(meeting.id, payload);
      if (res.success && res.data) {
        setParticipants((prev) => {
          const exists = prev.some((p) => p.userId === res.data.userId);
          if (exists) {
            return prev.map((p) => (p.userId === res.data.userId ? res.data : p));
          }
          return [...prev, res.data];
        });
        toast.success(`Peserta "${res.data.user?.name}" berhasil ditambahkan ke rapat.`);
        setShowAddModal(false);
        setSelectedAddUserId('');
        setCustomName('');
        setCustomEmail('');
        router.refresh();
      } else {
        toast.error(res.error || 'Gagal menambahkan peserta.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan saat menambahkan peserta.');
    } finally {
      setIsAddingParticipant(false);
    }
  };

  // Participant counts
  const totalCount = participants.length;
  const presentCount = participants.filter((p) => p.attendanceStatus === 'PRESENT').length;
  const excusedCount = participants.filter((p) => p.attendanceStatus === 'EXCUSED').length;
  const absentCount = participants.filter((p) => p.attendanceStatus === 'ABSENT').length;
  const invitedCount = participants.filter((p) => p.attendanceStatus === 'INVITED').length;

  // Action items & attachments counts for Overview KPI
  const actionItemList = meeting.actionItems || [];
  const completedActionCount = actionItemList.filter((a: any) => a.status === 'COMPLETED').length;
  const totalActionCount = actionItemList.length;
  const totalAttachmentsCount = Array.isArray(meeting.attachments) ? meeting.attachments.length : 0;

  // Extracted plain text for Overview agenda & decisions
  const agendaPlainText = extractPlainText(meeting.minutes?.agenda);
  const agendaItems = agendaPlainText
    ? agendaPlainText
      .split('\n')
      .map((s: string) => s.trim().replace(/^[-*•\d.]+\s*/, ''))
      .filter((s: string) => s.length > 0)
    : [];

  const decisionsPlainText = extractPlainText(meeting.minutes?.decisions);
  const decisionItems = decisionsPlainText
    ? decisionsPlainText
      .split('\n')
      .map((s: string) => s.trim().replace(/^[-*•\d.]+\s*/, ''))
      .filter((s: string) => s.length > 0)
    : [];

  // Unadded users for modal
  const unaddedUsers = availableUsers.filter(
    (u: any) => !participants.some((p: any) => p.userId === u.id)
  );

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/semua-rapat"
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#31889C] text-[13px] font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Rapat</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tombol Mulai Rapat (Otomatis ubah status ke Dalam Proses) */}
          {currentProgress === 'Belum Dimulai' && (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={handleStartMeeting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#31889C] hover:bg-[#266F80] text-white text-[12px] font-bold transition-all shadow-xs cursor-pointer group disabled:opacity-50"
              title="Mulai Rapat (Ubah status otomatis ke Dalam Proses)"
            >
              {isUpdatingStatus ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current text-white group-hover:scale-110 transition-transform" />
              )}
              <span>Mulai Rapat</span>
            </button>
          )}

          {/* Tombol Setujui Hasil Rapat (Admin & Pimpinan: Otomatis ubah status ke Selesai) */}
          {currentProgress === 'Dalam Proses' && canApprove && (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={handleApproveMeeting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold transition-all shadow-xs cursor-pointer group disabled:opacity-50"
              title="Admin & Pimpinan: Setujui hasil rapat dan tandai Selesai"
            >
              {isUpdatingStatus ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-100 group-hover:scale-110 transition-transform" />
              )}
              <span>Setujui Hasil Rapat</span>
            </button>
          )}

          {/* Status Selesai / Disetujui Badge */}
          {currentProgress === 'Selesai' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-bold shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hasil Rapat Disetujui (Selesai)</span>
            </div>
          )}

          {/* Google Calendar Button */}
          <button
            type="button"
            onClick={() => setShowCalendarModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold transition-all shadow-xs cursor-pointer group"
            title="Tambah ke Google Calendar & Undang Seluruh Peserta"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
            <span>Google Kalender</span>
          </button>

          {/* Delete button (SUPER_ADMIN, ADMIN) */}
          {canDeleteMeeting && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[12px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
              title="Hapus Rapat dari Database"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Menghapus...' : 'Hapus Rapat'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {isEditingMeetingNumber ? (
              <div className="flex items-center gap-1.5 bg-[#F0F9FA] p-1 rounded-xl border border-[#BCE3EB]">
                <input
                  type="text"
                  value={editNumberValue}
                  onChange={(e) => setEditNumberValue(e.target.value)}
                  placeholder="Nomor Surat Undangan"
                  className="px-2.5 py-1 text-[13px] font-bold text-[#215865] bg-white border border-[#31889C] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#31889C]"
                />
                <button
                  type="button"
                  disabled={isSavingNumber}
                  onClick={handleSaveMeetingNumber}
                  className="p-1.5 rounded-lg bg-[#31889C] text-white hover:bg-[#266F80] transition-colors cursor-pointer disabled:opacity-50"
                  title="Simpan nomor surat"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={isSavingNumber}
                  onClick={() => {
                    setIsEditingMeetingNumber(false);
                    setEditNumberValue(currentMeetingNumber);
                  }}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Batal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-bold text-[18px] text-[#215865] bg-[#F0F9FA] px-3 py-1 rounded-lg border border-[#BCE3EB]">
                  {currentMeetingNumber}
                </span>
                {canEditMeeting && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditNumberValue(currentMeetingNumber);
                      setIsEditingMeetingNumber(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#31889C] hover:bg-[#F0F9FA] transition-colors cursor-pointer"
                    title="Ubah Nomor Surat / Undangan Resmi"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Status Rapat (Progress Badge) & Quick Status Changer */}
            <div className="relative flex items-center gap-1.5" ref={statusPopoverRef}>
              <button
                type="button"
                onClick={() => canChangeStatus && setIsStatusPopoverOpen((prev) => !prev)}
                disabled={!canChangeStatus || isUpdatingStatus}
                className={cn(
                  "rounded-full text-left transition-all",
                  canChangeStatus
                    ? "cursor-pointer hover:ring-2 hover:ring-[#31889C]/30 hover:opacity-95"
                    : "cursor-default"
                )}
                title={canChangeStatus ? "Klik untuk ubah status rapat" : undefined}
              >
                <MeetingProgressBadge progressStatus={progressStatus} status={status} size="lg" showSubtitle />
              </button>

              {canChangeStatus && (
                <button
                  type="button"
                  onClick={() => setIsStatusPopoverOpen((prev) => !prev)}
                  disabled={isUpdatingStatus}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50",
                    isStatusPopoverOpen
                      ? "text-[#31889C] bg-[#F0F9FA]"
                      : "text-slate-400 hover:text-[#31889C] hover:bg-[#F0F9FA]"
                  )}
                  title="Ubah Status Rapat"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#31889C]" />
                  ) : (
                    <Edit3 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {/* Status Popover Dropdown Menu */}
              {isStatusPopoverOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 w-80 sm:w-84 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 space-y-2 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                    <div>
                      <p className="text-[12.5px] font-bold text-slate-800">Ubah Status Rapat</p>
                      <p className="text-[10.5px] text-slate-500">Pilih tahapan progres rapat saat ini</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsStatusPopoverOpen(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      {
                        key: 'Belum Dimulai' as const,
                        label: 'Belum Dimulai',
                        sublabel: 'Persiapan / Terjadwal',
                        desc: 'Rapat terjadwal & persiapan administrasi berjalan.',
                        color: 'bg-sky-50/70 hover:bg-sky-100 text-sky-900 border-sky-200',
                        activeColor: 'bg-sky-100 text-sky-950 border-sky-400 ring-2 ring-sky-300/40 shadow-2xs font-bold',
                        dot: 'bg-sky-500',
                      },
                      {
                        key: 'Dalam Proses' as const,
                        label: 'Dalam Proses',
                        sublabel: 'Sedang Berlangsung / Draft Risalah',
                        desc: 'Rapat sedang berjalan atau draf risalah sedang disusun.',
                        color: 'bg-amber-50/70 hover:bg-amber-100 text-amber-900 border-amber-200',
                        activeColor: 'bg-amber-100 text-amber-950 border-amber-400 ring-2 ring-amber-300/40 shadow-2xs font-bold',
                        dot: 'bg-amber-500 animate-pulse',
                      },
                      {
                        key: 'Selesai' as const,
                        label: 'Selesai',
                        sublabel: 'Risalah Disahkan / Final',
                        desc: 'Risalah rapat final & tindak lanjut siap dimonitor.',
                        color: 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border-emerald-200',
                        activeColor: 'bg-emerald-100 text-emerald-950 border-emerald-400 ring-2 ring-emerald-300/40 shadow-2xs font-bold',
                        dot: 'bg-emerald-500',
                      },
                    ].map((item) => {
                      const isCurrent = normalizeProgressStatus(progressStatus) === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          disabled={isUpdatingStatus}
                          onClick={() => handleUpdateProgressStatus(item.key)}
                          className={cn(
                            "w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer disabled:opacity-50",
                            isCurrent ? item.activeColor : item.color
                          )}
                        >
                          <span className={cn("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0", item.dot)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[12px] font-bold">{item.label}</span>
                              {isCurrent && (
                                <span className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-white/90 border border-current shadow-2xs">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <p className="text-[10.5px] font-medium opacity-85">{item.sublabel}</p>
                            <p className="text-[10px] opacity-70 mt-0.5 leading-snug">{item.desc}</p>
                          </div>
                          {isCurrent && (
                            <Check className="w-4 h-4 shrink-0 text-current mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsStatusPopoverOpen(false);
                        setIsStatusGuideOpen(true);
                      }}
                      className="text-[11px] text-[#31889C] hover:text-[#215865] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Pelajari Alur Status Risalah</span>
                    </button>
                    {isUpdatingStatus && (
                      <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Menyimpan...
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Kategori Rapat */}
            {(() => {
              const catInfo = getMeetingCategoryInfo(categoryData.category, categoryData.subCategory);
              return (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold border shadow-2xs ${catInfo.badgeClass}`}
                    title={catInfo.description}
                  >
                    <span>{catInfo.badgeIcon}</span>
                    <span>{catInfo.label}</span>
                  </span>
                  {categoryData.sourceOrigin && (
                    <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200" title="Nomor Disposisi / Asal Naskah Masuk">
                      Ref: {categoryData.sourceOrigin}
                    </span>
                  )}
                  {canEditMeeting && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditCategoryForm({ ...categoryData });
                        setIsEditCategoryModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#31889C] hover:bg-[#F0F9FA] transition-colors cursor-pointer"
                      title="Ubah Kategori Rapat"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>



        {/* Banner Khusus: Surat Ditunda / Tunda Rapat */}
        {(categoryData.category === 'SURAT_DITUNDA' || categoryData.category === 'TUNDA_RAPAT') && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-xl p-4 text-amber-950 shadow-xs flex items-start gap-3.5">
            <div className="p-2 bg-amber-500 text-white rounded-lg font-bold shrink-0 text-base shadow-xs">
              ⏳
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200/80 text-amber-900 uppercase tracking-wide">
                  Tunda Rapat
                </span>
                {canEditMeeting && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditCategoryForm({ ...categoryData });
                      setIsEditCategoryModalOpen(true);
                    }}
                    className="text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                  >
                    Ubah Status Penundaan
                  </button>
                )}
              </div>
              <p className="font-extrabold text-[15px] text-amber-950 mt-1">
                Jadwal Rapat Ditunda / Dijadwalkan Ulang
              </p>
              <div className="mt-1.5 text-xs text-amber-900 bg-white/80 rounded-lg p-2.5 border border-amber-200">
                <span className="font-bold text-amber-950">Alasan Penundaan:</span>{' '}
                <span className="italic">{categoryData.postponeReason || 'Alasan penundaan belum dicantumkan.'}</span>
              </div>
              <p className="text-[11.5px] text-amber-800 mt-2">
                📌 Catatan: Seluruh agenda tindak lanjut &amp; risalah ditangguhkan hingga tanggal penjadwalan ulang disahkan oleh pimpinan.
              </p>
            </div>
          </div>
        )}

        <div>
          <span className="text-[12px] font-bold text-[#31889C] uppercase tracking-wider block">
            Agenda Pembahasan Rapat
          </span>
          <h1 className="text-[24px] font-bold text-slate-900 mt-1 leading-snug">
            {meeting.title}
          </h1>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-[13px]">
          {/* Tim Kerja Pelaksana */}
          <div className="flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-[#31889C] shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Tim Kerja Pelaksana</p>
              <p className="font-bold text-slate-800">
                {meeting.primaryTeam?.name ? `Tim ${meeting.primaryTeam.name}` : (meeting.primaryTeam?.code || 'Tim Investasi')}
              </p>
            </div>
          </div>

          {/* Tanggal & Waktu */}
          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-[#31889C] shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Jadwal &amp; Waktu</p>
              <p className="font-bold text-slate-800">{formattedDate}</p>
              <p className="text-[12px] text-slate-600">
                {meeting.startTime} - {meeting.endTime} WIB
              </p>
            </div>
          </div>

          {/* Lokasi */}
          {(() => {
            const virtual = extractVirtualMeetingDetails(meeting.location);
            return (
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#31889C] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase">Lokasi / Media</p>
                  <p className="font-bold text-slate-800 leading-snug">
                    {virtual.cleanPhysicalLocation || meeting.location}
                  </p>
                  {virtual.zoomUrl && (
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <a
                        href={virtual.zoomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#0B5CFF] hover:bg-blue-100 text-[11px] font-bold border border-blue-200 transition-colors shadow-2xs"
                        title="Buka Ruang Rapat Zoom di tab baru"
                      >
                        <Video className="w-3 h-3 text-[#0B5CFF]" />
                        <span>Buka Zoom</span>
                        <ExternalLink className="w-2.5 h-2.5 text-blue-400" />
                      </a>
                      {virtual.meetingId && (
                        <span className="text-[10.5px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          ID: {virtual.meetingId}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* PIC */}
          <div className="flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-[#31889C] shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase">PIC</p>
              <p className="font-bold text-slate-800">
                {meeting.picName ||
                  (meeting.chairperson ? meeting.chairperson.name : null) ||
                  (meeting.minutes?.conclusion as any)?.chairpersonName ||
                  (meeting.minutes?.decisions as any)?.chairpersonName ||
                  (meeting.minutes?.discussion as any)?.chairpersonName ||
                  (meeting.minutes?.agenda as any)?.chairpersonName ||
                  'Belum Ditugaskan'}
              </p>
            </div>
          </div>



          {/* Peserta Total */}
          <div className="flex items-start gap-2.5">
            <Users className="w-4 h-4 text-[#31889C] shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Total Tamu Undangan</p>
              <p className="font-bold text-slate-800">
                {totalCount} Pejabat / Perwakilan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rapat Lanjutan / Rujukan Section */}
      {previousMeeting ? (
        <div className="bg-[#F0F9FA] rounded-2xl border border-[#BCE3EB] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#31889C] text-white shadow-xs shrink-0 mt-0.5">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#215865] bg-[#E8F5F7] px-2 py-0.5 rounded-md border border-[#BCE3EB]">
                  Rapat Lanjutan
                </span>
                <span className="text-[12px] font-bold text-slate-700">
                  Merujuk ke Rapat Sebelumnya:
                </span>
                <span className="font-bold text-[12px] text-[#215865] bg-white px-2 py-0.5 rounded-md border border-[#BCE3EB] shadow-2xs">
                  {previousMeeting.meetingNumber}
                </span>
              </div>
              <h4 className="font-bold text-[15px] text-slate-900 mt-1">
                {previousMeeting.title}
              </h4>
              <div className="flex items-center gap-4 text-[12px] text-slate-600 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#31889C]" />
                  {new Date(previousMeeting.date).toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#31889C]" />
                  {previousMeeting.primaryBiro?.code || 'Biro KEK'}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#31889C]" />
                  {previousMeeting.minutes ? 'Notula Tersedia' : 'Belum Ada Notula'}
                </span>
                {previousMeeting.actionItems && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#7CC563]" />
                    {previousMeeting.actionItems.filter((a: any) => a.status === 'COMPLETED').length}/
                    {previousMeeting.actionItems.length} Tindak Lanjut Selesai
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center flex-wrap">
            <button
              type="button"
              onClick={() => setShowSeriesModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#BCE3EB] hover:bg-[#E8F5F7] text-[#215865] font-semibold text-[12px] transition-colors cursor-pointer shadow-2xs"
              title="Lihat seluruh sesi rapat terkait dalam agenda ini"
            >
              <Layers className="w-4 h-4 text-[#31889C]" />
              <span>Rangkaian Rapat Terkait</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreviousMeetingModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#31889C] hover:bg-[#266F80] text-white font-semibold text-[12px] transition-all shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Lihat Hasil Rapat {previousMeeting.meetingNumber}</span>
            </button>

            {canEditMeeting && (
              <button
                type="button"
                onClick={() => setShowLinkMeetingModal(true)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-[#BCE3EB] hover:bg-[#E8F5F7] text-[#215865] font-semibold text-[12px] transition-colors cursor-pointer"
                title="Ubah Rujukan Rapat Sebelumnya"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Ubah</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#F0F9FA] rounded-xl border border-dashed border-[#BCE3EB] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
          <div className="flex items-center gap-2.5 text-slate-700">
            <Link2 className="w-4 h-4 text-[#31889C] shrink-0" />
            <span>
              Pantau seluruh rangkaian sesi atau hubungkan sebagai tindak lanjut rapat terdahulu.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowSeriesModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#BCE3EB] hover:bg-[#E8F5F7] text-[#215865] font-semibold text-[12px] transition-all shadow-2xs cursor-pointer"
              title="Periksa apakah ada rapat lain dengan topik agenda serupa"
            >
              <Layers className="w-3.5 h-3.5 text-[#31889C]" />
              <span>Cek Rangkaian Rapat Terkait</span>
            </button>
            {canEditMeeting && (
              <button
                type="button"
                onClick={() => setShowLinkMeetingModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#31889C] hover:bg-[#266F80] text-white font-semibold text-[12px] transition-all shadow-2xs cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>+ Tautkan Rapat Sebelumnya</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs Navigation (4 Tab Utama Terstruktur) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('overview')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-[13px] border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'overview'
            ? 'border-[#31889C] text-[#31889C] bg-[#F0F9FA] rounded-t-lg'
            : 'border-transparent text-slate-600 hover:text-[#31889C] hover:bg-[#F0F9FA]/50'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>Informasi Rapat</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('participants')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-[13px] border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'participants'
            ? 'border-[#31889C] text-[#31889C] bg-[#F0F9FA] rounded-t-lg'
            : 'border-transparent text-slate-600 hover:text-[#31889C] hover:bg-[#F0F9FA]/50'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>Tamu Undangan ({totalCount})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('minutes')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-[13px] border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'minutes'
            ? 'border-[#31889C] text-[#31889C] bg-[#F0F9FA] rounded-t-lg'
            : 'border-transparent text-slate-600 hover:text-[#31889C] hover:bg-[#F0F9FA]/50'
            }`}
        >
          <FileText className="w-4 h-4" />
          <span>Notulen &amp; Risalah</span>
          {meeting.minutes ? (
            <span className="w-2 h-2 rounded-full bg-[#7CC563]" title="Naskah rapat telah terisi" />
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-semibold">Kosong</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('actionItems')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-[13px] border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'actionItems'
            ? 'border-[#31889C] text-[#31889C] bg-[#F0F9FA] rounded-t-lg'
            : 'border-transparent text-slate-600 hover:text-[#31889C] hover:bg-[#F0F9FA]/50'
            }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tindak Lanjut ({meeting.actionItems ? meeting.actionItems.length : 0})</span>
        </button>
      </div>

      {/* Tab 1: Informasi Rapat / Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Executive KPI Bar (4 Ringkasan Metrik Cepat Rapat) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Presensi Kehadiran */}
            <div
              onClick={() => handleTabChange('participants')}
              role="button"
              tabIndex={0}
              className="group bg-white hover:bg-emerald-50/40 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-700">
                  Presensi Sidang
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-800">
                  {presentCount} <span className="text-xs font-semibold text-slate-400">/ {totalCount} Hadir</span>
                </div>
                <div className="flex items-center justify-between text-[11.5px] text-slate-500 mt-1">
                  <span>{totalCount > 0 ? `${Math.round((presentCount / totalCount) * 100)}% kehadiran` : '0 peserta'}</span>
                  <span className="font-semibold text-emerald-700 group-hover:underline flex items-center gap-0.5">
                    Kelola <ChevronRight className="w-3 h-3 inline" />
                  </span>
                </div>
              </div>
            </div>

            {/* KPI 2: Naskah Notula & Risalah */}
            <div
              onClick={() => {
                handleTabChange('minutes');
                handleMinutesSubTabChange('document');
              }}
              role="button"
              tabIndex={0}
              className="group bg-white hover:bg-[#F0F9FA] p-4 rounded-xl border border-slate-200 hover:border-[#BCE3EB] transition-all cursor-pointer shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-[#215865]">
                  Naskah Risalah
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#E8F5F7] text-[#1E6B7B] flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-extrabold text-slate-900 group-hover:text-[#1E6B7B]">
                  {meeting.minutes ? 'Tersedia' : 'Belum Ada'}
                </div>
                <div className="flex items-center justify-between text-[11.5px] text-slate-500 mt-1">
                  <span>
                    {status === 'FINAL'
                      ? 'Naskah Disahkan'
                      : status === 'APPROVED'
                        ? 'Telah Divalidasi'
                        : status === 'REVIEW'
                          ? 'Tahap Telaah'
                          : 'Draf Penyusunan'}
                  </span>
                  <span className="font-semibold text-[#1E6B7B] group-hover:underline flex items-center gap-0.5">
                    Buka <ChevronRight className="w-3 h-3 inline" />
                  </span>
                </div>
              </div>
            </div>

            {/* KPI 3: Berkas & Paparan */}
            <div
              onClick={() => {
                handleTabChange('minutes');
                handleMinutesSubTabChange('materials');
              }}
              role="button"
              tabIndex={0}
              className="group bg-white hover:bg-sky-50/50 p-4 rounded-xl border border-slate-200 hover:border-sky-300 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-sky-700">
                  Berkas Paparan
                </span>
                <div className="w-7 h-7 rounded-lg bg-sky-100/70 text-sky-700 flex items-center justify-center">
                  <Presentation className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-extrabold text-slate-900 group-hover:text-sky-800">
                  {totalAttachmentsCount} <span className="text-xs font-semibold text-slate-400">Berkas</span>
                </div>
                <div className="flex items-center justify-between text-[11.5px] text-slate-500 mt-1">
                  <span>{invitationDoc ? '+ Undangan Resmi' : 'Slide & Lampiran'}</span>
                  <span className="font-semibold text-sky-700 group-hover:underline flex items-center gap-0.5">
                    Lihat <ChevronRight className="w-3 h-3 inline" />
                  </span>
                </div>
              </div>
            </div>

            {/* KPI 4: Tindak Lanjut */}
            <div
              onClick={() => handleTabChange('actionItems')}
              role="button"
              tabIndex={0}
              className="group bg-white hover:bg-amber-50/40 p-4 rounded-xl border border-slate-200 hover:border-amber-300 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-700">
                  Tindak Lanjut
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-extrabold text-slate-900 group-hover:text-amber-800">
                  {completedActionCount} <span className="text-xs font-semibold text-slate-400">/ {totalActionCount} Selesai</span>
                </div>
                <div className="flex items-center justify-between text-[11.5px] text-slate-500 mt-1">
                  <span>
                    {totalActionCount > 0
                      ? `${Math.round((completedActionCount / totalActionCount) * 100)}% tuntas`
                      : 'Belum ada PIC'}
                  </span>
                  <span className="font-semibold text-amber-700 group-hover:underline flex items-center gap-0.5">
                    Matriks <ChevronRight className="w-3 h-3 inline" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Output & Hasil Kegiatan Biro 3 (Catatan Mentor) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 border-l-4 border-l-emerald-600">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">Hasil Kegiatan &amp; Output Kerja Biro 3</h3>
                  <p className="text-[12px] text-slate-500">
                    Dokumentasi Google Drive, Catatan Ringkas Capaian, Rencana Aksi, Nd Konsum &amp; Rilis Berita
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {meetingData.actionPlan && (
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold border",
                    meetingData.actionPlan.toLowerCase().includes('non')
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-teal-50 text-teal-800 border-teal-200"
                  )}>
                    Rencana Aksi: {meetingData.actionPlan}
                  </span>
                )}
                {canEditMeeting && (
                  <button
                    type="button"
                    onClick={() => setIsOutputDialogOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E6B7B] hover:bg-[#164E59] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit / Isi Hasil Kegiatan</span>
                  </button>
                )}
              </div>
            </div>

            {/* Grid Tautan Google Drive & Rilis Berita */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {/* Google Drive Link */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Berkas Google Drive
                </span>
                {meetingData.driveLink ? (
                  <a
                    href={meetingData.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span className="truncate">Buka Folder / Dokumen</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Belum ada tautan Google Drive</span>
                )}
              </div>

              {/* Rilis Berita */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Publikasi &amp; Rilis Berita
                </span>
                {meetingData.releaseUrl ? (
                  <a
                    href={meetingData.releaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                    title={meetingData.releaseTitle || "Buka Siaran Pers"}
                  >
                    <span className="truncate">{meetingData.releaseTitle || 'Buka Rilis Berita'}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Belum ada rilis berita</span>
                )}
              </div>

              {/* Nd Konsumsi */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Nota Dinas Konsumsi
                </span>
                {meetingData.ndConsumptionNumber ? (
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {meetingData.ndConsumptionNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                      {meetingData.ndConsumptionStatus || 'Diproses'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Tidak ada pengajuan Nd Konsum</span>
                )}
              </div>
            </div>

            {/* Catatan Hasil Kegiatan */}
            {meetingData.notes && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 space-y-1 mt-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-800">
                    Catatan Hasil Kegiatan / Ringkasan Capaian:
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-medium">
                  {meetingData.notes}
                </p>
              </div>
            )}
          </div>

          {/* Agenda Pembahasan & Ringkasan Sidang */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">Agenda &amp; Pokok Pembahasan Sidang</h3>
                <p className="text-[12.5px] text-slate-500 mt-0.5">
                  Fokus materi dan substansi pokok yang dikoordinasikan oleh{' '}
                  <strong className="text-slate-700">{meeting.primaryBiro?.name}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleTabChange('minutes');
                  handleMinutesSubTabChange('document');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#BCE3EB] bg-[#F0F9FA] hover:bg-[#E0F2F5] text-[#1E6B7B] text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{meeting.minutes ? 'Buka Naskah Lengkap' : '+ Susun Naskah Notula'}</span>
              </button>
            </div>

            {agendaItems.length > 0 ? (
              <div className="space-y-2.5">
                {agendaItems.map((item: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-slate-300 transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#1E6B7B]/10 text-[#1E6B7B] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-[13px] text-slate-800 leading-relaxed font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-[13px] text-slate-600 flex items-start gap-3">
                <Info className="w-4 h-4 text-[#31889C] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800">
                    Agenda Utama: {meeting.title}
                  </p>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    Rincian butir agenda pembahasan belum dimasukkan ke draf naskah risalah.
                    Penyusun risalah atau biro dapat menambahkan rincian agenda melalui tab <strong>Notulen Rapat</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Poin Kesepakatan / Keputusan Utama (jika ada) */}
            {decisionItems.length > 0 && (
              <div className="pt-2">
                <h4 className="text-[13px] font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ringkasan Kesepakatan &amp; Keputusan Rapat:</span>
                </h4>
                <div className="space-y-2">
                  {decisionItems.slice(0, 4).map((dec: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-[12.5px] text-slate-700 bg-emerald-50/40 border border-emerald-200/60 p-2.5 rounded-lg"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{dec}</span>
                    </div>
                  ))}
                  {decisionItems.length > 4 && (
                    <button
                      type="button"
                      onClick={() => {
                        handleTabChange('minutes');
                        handleMinutesSubTabChange('document');
                      }}
                      className="text-xs font-semibold text-[#1E6B7B] hover:underline pt-1 block cursor-pointer"
                    >
                      + Lihat {decisionItems.length - 4} keputusan lainnya di naskah notula →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dokumen Surat Undangan Resmi (Slim & Modern Strip) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#1E6B7B]/10 text-[#1E6B7B] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Surat Undangan Resmi Sidang
                    </h4>
                    {invitationDoc ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓ Berkas Terlampir
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        Belum Diunggah
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500 truncate mt-0.5">
                    {invitationDoc ? (
                      <>
                        <span className="font-medium text-slate-800">{invitationDoc.name}</span>
                        {invitationDoc.size ? ` • ${formatFileSize(invitationDoc.size)}` : ''}
                      </>
                    ) : (
                      'Lampiran fisik/digital surat edaran undangan resmi pelaksanaan sidang'
                    )}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                <input
                  ref={invitationFileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadInvitation(f);
                  }}
                />

                {isUploadingInvitation ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1E6B7B]" />
                    <span>Mengunggah...</span>
                  </div>
                ) : invitationDoc ? (
                  <>
                    <a
                      href={invitationDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E6B7B] hover:bg-[#175360] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Buka Pratinjau</span>
                    </a>
                    <a
                      href={invitationDoc.url}
                      download={invitationDoc.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      <FileDown className="w-3.5 h-3.5 text-[#1E6B7B]" />
                      <span>Unduh</span>
                    </a>
                    {canEditMeeting && (
                      <>
                        <button
                          type="button"
                          onClick={() => invitationFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                          title="Ganti berkas undangan"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ganti</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveInvitation}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs transition-colors cursor-pointer"
                          title="Lepas lampiran undangan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  canEditMeeting && (
                    <button
                      type="button"
                      onClick={() => invitationFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E6B7B] hover:bg-[#175360] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>+ Unggah Surat Undangan</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Bottom link to Berkas & Paparan */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
              <span>Materi paparan, presentasi, dan berkas lampiran pendukung lainnya:</span>
              <button
                type="button"
                onClick={() => {
                  handleTabChange('minutes');
                  handleMinutesSubTabChange('materials');
                }}
                className="text-[#1E6B7B] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Tab Berkas &amp; Paparan ({totalAttachmentsCount})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Peserta & Presensi Kehadiran */}
      {activeTab === 'participants' && (
        <div className="space-y-4">
          {/* Card Header & Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#31889C]" />
                  <span>Daftar Presensi Tamu Undangan</span>
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  {canManageParticipants
                    ? 'Kelola presensi peserta rapat secara langsung. Perubahan status kehadiran langsung disimpan dan otomatis tercantum pada PDF Risalah Rapat.'
                    : 'Daftar absensi kehadiran peserta resmi untuk agenda sidang ini.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowCalendarModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[12px] font-bold transition-all cursor-pointer shadow-2xs"
                  title="Buka atau bagikan undangan Google Kalender ke seluruh peserta"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Undangan Kalender</span>
                </button>

                {canManageParticipants && (
                  <>
                    <button
                      type="button"
                      disabled={isBulkUpdating || totalCount === 0}
                      onClick={handleMarkAllPresent}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D2EFCA] bg-[#ECF8E9] text-[#4D8F3D] hover:bg-[#daf2d1] text-[12px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                      title="Tandai semua peserta sebagai Hadir"
                    >
                      {isBulkUpdating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#7CC563]" />
                      )}
                      <span>Tandai Semua Hadir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#31889C] hover:bg-[#266F80] text-white text-[12px] font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Tambah Peserta</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Summary Statistics Counter Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Total Peserta
                </span>
                <span className="text-[20px] font-extrabold text-slate-800 mt-0.5 block">
                  {totalCount}
                </span>
              </div>

              <div className="p-3 bg-[#ECF8E9] border border-[#D2EFCA] rounded-xl text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4D8F3D] block">
                  Hadir
                </span>
                <span className="text-[20px] font-extrabold text-[#2E6B20] mt-0.5 block">
                  {presentCount}
                </span>
              </div>

              <div className="p-3 bg-[#FFF8CC] border border-[#FFEE99] rounded-xl text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A7200] block">
                  Izin
                </span>
                <span className="text-[20px] font-extrabold text-[#6B5800] mt-0.5 block">
                  {excusedCount}
                </span>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
                  Tidak Hadir
                </span>
                <span className="text-[20px] font-extrabold text-rose-800 mt-0.5 block">
                  {absentCount}
                </span>
              </div>

              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-center col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 block">
                  Diundang
                </span>
                <span className="text-[20px] font-extrabold text-sky-800 mt-0.5 block">
                  {invitedCount}
                </span>
              </div>
            </div>



            {/* Participant List */}
            {participants.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-[13px] shadow-xs">
                {participants.map((p: any, idx: number) => {
                  const isUpdating = updatingParticipantId === p.id;
                  const currentOpt = ATTENDANCE_OPTIONS.find((o) => o.value === p.attendanceStatus) || ATTENDANCE_OPTIONS[3];

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white hover:bg-[#F0F9FA] transition-colors"
                    >
                      {/* Left: User Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[11px] font-bold text-slate-400 w-5 text-right shrink-0">
                          {idx + 1}.
                        </span>
                        <div className="w-9 h-9 rounded-full bg-[#F0F9FA] text-[#31889C] font-bold flex items-center justify-center text-[11px] border border-[#BCE3EB] shrink-0">
                          {p.user?.name
                            ? p.user.name
                              .split(' ')
                              .map((n: string) => n[0])
                              .slice(0, 2)
                              .join('')
                            : 'P'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {p.user?.name || 'Peserta Rapat'}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                            <span className="truncate">{p.user?.email}</span>
                            <span>•</span>
                            <span className="font-medium text-[#215865] bg-[#F0F9FA] px-1.5 py-0.2 rounded border border-[#BCE3EB]">
                              {p.user?.biro?.code || p.user?.biro?.shortName || 'Biro KEK'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Interactive Attendance Selector or Read-Only Badge */}
                      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                        {canManageParticipants ? (
                          <div className="flex items-center gap-1.5">
                            {/* Segmented Control Buttons */}
                            <div className="flex items-center bg-slate-100/80 p-1 rounded-lg border border-slate-200 gap-0.5">
                              {ATTENDANCE_OPTIONS.map((opt) => {
                                const isActive = p.attendanceStatus === opt.value;
                                const Icon = opt.icon;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleUpdateAttendance(p.id, opt.value, p.user?.name || 'Peserta')
                                    }
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${isActive
                                      ? opt.activeClass
                                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                                      } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                                    title={opt.desc}
                                  >
                                    <Icon className="w-3 h-3" />
                                    <span>{opt.label}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Delete Participant Button */}
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleRemoveParticipant(p.id, p.user?.name || 'Peserta')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                              title="Hapus peserta dari rapat ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          /* Viewer / Staff read-only badge */
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${currentOpt.badgeClass}`}
                          >
                            <currentOpt.icon className="w-3 h-3" />
                            <span>{currentOpt.label}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Users className="w-8 h-8 text-[#31889C] mx-auto mb-2 opacity-60" />
                <p className="text-[13px] font-semibold text-slate-700">
                  Belum ada peserta yang terdaftar pada rapat ini.
                </p>
                <p className="text-[12px] text-slate-500 mt-1">
                  {canManageParticipants ? (
                    <>Klik tombol <strong>+ Tambah Peserta</strong> di atas untuk mendaftarkan peserta sidang.</>
                  ) : (
                    'Daftar absensi peserta belum dimasukkan oleh Notulis atau Administrator.'
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Notulen & Hasil Rapat */}
      {activeTab === 'minutes' && (
        <div className="space-y-4">
          {/* Sub Navigation Bar: Naskah, Berkas & Paparan, Riwayat Perubahan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-lg text-[13px] font-semibold">
              <button
                type="button"
                onClick={() => handleMinutesSubTabChange('document')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${minutesSubTab === 'document'
                  ? 'bg-white text-[#31889C] font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
              >
                <FileText className="w-4 h-4" />
                <span>Naskah Risalah &amp; Notulen</span>
              </button>

              <button
                type="button"
                onClick={() => handleMinutesSubTabChange('materials')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${minutesSubTab === 'materials'
                  ? 'bg-white text-[#31889C] font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
              >
                <Presentation className="w-4 h-4" />
                <span>Berkas &amp; Paparan</span>
                {Array.isArray(meeting.attachments) && meeting.attachments.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${minutesSubTab === 'materials' ? 'bg-[#F0F9FA] text-[#215865] border border-[#BCE3EB]' : 'bg-slate-200 text-slate-700'
                    }`}>
                    {meeting.attachments.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleMinutesSubTabChange('history')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${minutesSubTab === 'history'
                  ? 'bg-white text-[#31889C] font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
              >
                <History className="w-4 h-4" />
                <span>Riwayat Perubahan</span>
              </button>
            </div>

            <div className="text-[12px] text-slate-500 px-2 hidden md:block">
              {minutesSubTab === 'document' && 'Format resmi Notula & Nota Dinas Sekretariat KEK'}
              {minutesSubTab === 'materials' && 'Preview bahan paparan, slide presentasi, dan dokumen tindak lanjut'}
              {minutesSubTab === 'history' && 'Audit trail riwayat revisi dan versi naskah risalah'}
            </div>
          </div>

          {/* Sub Tab Views */}
          {minutesSubTab === 'document' && (
            <MeetingMinutesSection
              meetingId={meeting.id}
              meeting={meeting}
              initialMinutes={meeting.minutes}
              defaultMode="preview"
              onViewHistoryClick={() => handleMinutesSubTabChange('history')}
              onApproveClick={handleApproveMeeting}
              isApproved={currentProgress === 'Selesai'}
              canApprove={canApprove}
              isApproving={isUpdatingStatus}
            />
          )}

          {minutesSubTab === 'materials' && (
            <MeetingFilePreviewPanel
              meetingId={meeting.id}
              meetingTitle={meeting.title}
              initialAttachments={meeting.attachments || []}
            />
          )}

          {minutesSubTab === 'history' && (
            <MinutesHistorySection meetingId={meeting.id} />
          )}
        </div>
      )}

      {/* Tab 4: Tindak Lanjut */}
      {activeTab === 'actionItems' && (
        <div className="space-y-4">
          <ActionItemList
            meetingId={meeting.id}
            currentMeeting={meeting}
            initialItems={meeting.actionItems || []}
            availableBiros={availableBiros}
            availableUsers={availableUsers}
          />
        </div>
      )}

      {/* Modal: Tambah Peserta Sidang */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#31889C]" />
                  <span>Tambah Peserta Sidang</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {meeting.meetingNumber} — {meeting.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-[12px] font-bold">
              <button
                type="button"
                onClick={() => setParticipantMode('registered')}
                className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${participantMode === 'registered'
                  ? 'bg-white text-[#31889C] shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Pegawai Terdaftar
              </button>
              <button
                type="button"
                onClick={() => setParticipantMode('unregistered')}
                className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${participantMode === 'unregistered'
                  ? 'bg-white text-[#31889C] shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Pejabat Baru / Eksternal
              </button>
            </div>

            <form onSubmit={handleAddParticipant} className="p-6 space-y-4 text-[13px]">
              {participantMode === 'registered' ? (
                /* Mode 1: Select Registered User */
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block text-[12px]">
                    Pilih Pegawai dari Database <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedAddUserId}
                    onChange={(e) => setSelectedAddUserId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#31889C] focus:ring-1 focus:ring-[#31889C] bg-white text-slate-800 text-[13px] outline-none"
                  >
                    <option value="">-- Pilih Pegawai dari Daftar Database --</option>
                    {unaddedUsers.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.biro?.code || 'KEK'}) — {u.email}
                      </option>
                    ))}
                  </select>
                  {unaddedUsers.length === 0 && (
                    <p className="text-[11px] text-[#31889C] italic">
                      Semua pengguna terdaftar sudah masuk dalam daftar peserta.
                    </p>
                  )}
                </div>
              ) : (
                /* Mode 2: Unregistered Official / External Guest */
                <div className="space-y-3">
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11.5px] text-blue-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Gunakan opsi ini untuk pejabat kementerian/lembaga lain, kepala daerah, narasumber, atau tamu eksternal yang belum memiliki akun login di sistem Log Book Notula Rapat KEK.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block text-[12px]">
                      Nama Lengkap, Gelar &amp; Jabatan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Dr. Ir. Budi Santoso, M.Sc. (Deputi Kemenko)"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#31889C] focus:ring-1 focus:ring-[#31889C] bg-white text-slate-800 text-[13px] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 block text-[12px]">
                        Biro Pengampu / Afiliasi
                      </label>
                      <select
                        value={customBiroId}
                        onChange={(e) => setCustomBiroId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#31889C] focus:ring-1 focus:ring-[#31889C] bg-white text-slate-800 text-[12px] outline-none"
                      >
                        {availableBiros.map((b: any) => (
                          <option key={b.id} value={b.id}>
                            {b.code} — {b.shortName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 block text-[12px]">
                        Email Resmi <span className="text-slate-400 font-normal">(Opsional)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="pejabat@instansi.go.id"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#31889C] focus:ring-1 focus:ring-[#31889C] bg-white text-slate-800 text-[12px] outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-[10.5px] text-slate-400">
                    * Jika email dikosongkan, sistem otomatis membuatkan identitas peserta resmi untuk arsip risalah sidang.
                  </p>
                </div>
              )}

              {/* Status Kehadiran Awal */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-800 block text-[12px]">
                  Status Presensi Awal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ATTENDANCE_OPTIONS.map((opt) => {
                    const isSelected = newParticipantStatus === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setNewParticipantStatus(opt.value)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${isSelected
                          ? 'bg-[#F0F9FA] border-[#31889C] text-[#31889C] font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-[#31889C] shrink-0" />
                        <div>
                          <p className="text-[12px]">{opt.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-[12px] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    isAddingParticipant ||
                    (participantMode === 'registered' && !selectedAddUserId) ||
                    (participantMode === 'unregistered' && !customName.trim())
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#31889C] hover:bg-[#266F80] text-white font-semibold text-[12px] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isAddingParticipant ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>{isAddingParticipant ? 'Menambahkan...' : 'Tambahkan Peserta'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tinjau Rapat Sebelumnya (Risalah & Butir Tindak Lanjut Rapat 1) */}
      {previousMeeting && (
        <PreviousMeetingModal
          isOpen={showPreviousMeetingModal}
          onClose={() => setShowPreviousMeetingModal(false)}
          previousMeeting={previousMeeting}
          onOpenLinkDialog={() => {
            setShowPreviousMeetingModal(false);
            setShowLinkMeetingModal(true);
          }}
        />
      )}

      {/* Modal: Tautkan / Ubah Rujukan Rapat Sebelumnya */}
      <LinkMeetingDialog
        isOpen={showLinkMeetingModal}
        onClose={() => setShowLinkMeetingModal(false)}
        currentMeetingId={meeting.id}
        currentMeetingNumber={meeting.meetingNumber}
        currentLinkedMeetingId={previousMeeting?.id || null}
        onLinkedSuccess={(updated) => {
          setPreviousMeeting(updated.previousMeeting || null);
          setShowLinkMeetingModal(false);
          router.refresh();
        }}
      />

      {/* Modal: Linimasa Rangkaian Rapat Terkait */}
      <AgendaSeriesModal
        isOpen={showSeriesModal}
        onClose={() => setShowSeriesModal(false)}
        meetingId={meeting.id}
        onSelectMeeting={(selectedId) => {
          setShowSeriesModal(false);
          if (selectedId !== meeting.id) {
            router.push(`/semua-rapat/${selectedId}`);
          }
        }}
      />

      <MeetingStatusGuideDialog
        isOpen={isStatusGuideOpen}
        onClose={() => setIsStatusGuideOpen(false)}
      />

      <GoogleCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        event={{
          id: meeting.id,
          meetingNumber: currentMeetingNumber,
          title: meeting.title,
          date: meeting.date,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          location: meeting.location,
          biroName: meeting.primaryBiro?.name,
          chairpersonName: meeting.chairperson?.name,
          secretaryName: meeting.secretary?.name,
          attendees: participants.map((p: any) => ({
            name: p.user?.name || 'Peserta',
            email: p.user?.email || '',
          })),
        }}
      />

      {/* Modal: Ubah Kategori Naskah / Status Penundaan */}
      {isEditCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E8F5F7] text-[#31889C] flex items-center justify-center font-bold text-base">
                  🏷️
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-[15px]">Ubah Kategori Naskah / Status Penundaan</h3>
                  <p className="text-xs text-slate-500">Sesuaikan klasifikasi undangan, naskah masuk, atau status penundaan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <MeetingCategorySelector
              value={editCategoryForm}
              onChange={setEditCategoryForm}
            />

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditCategoryModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSavingCategory}
                onClick={handleSaveCategory}
                className="px-5 py-2 text-xs font-bold text-white bg-[#31889C] hover:bg-[#215865] rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSavingCategory ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Update / Isi Hasil Kegiatan Pasca Pelaksanaan */}
      <UpdateMeetingOutputDialog
        isOpen={isOutputDialogOpen}
        onClose={() => setIsOutputDialogOpen(false)}
        meeting={meetingData}
        onSuccess={(updated) => {
          setMeetingData(updated);
          if (updated.progressStatus) {
            setProgressStatus(updated.progressStatus);
          }
        }}
      />
    </div>
  );
}
