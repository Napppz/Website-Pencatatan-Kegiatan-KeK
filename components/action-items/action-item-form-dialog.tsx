'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, AlertCircle, Save, ExternalLink, Layers, Calendar, Lock, CheckCircle2 } from 'lucide-react';
import {
  actionItemSchema,
  ActionItemInput,
} from '@/lib/validations/action-item';
import {
  createActionItemAction,
  updateActionItemAction,
  getActionItemFormOptionsAction,
} from '@/app/actions/action-item-actions';
import { ActionItem, ActionItemPriority, ActionItemStatus } from '@/lib/types';
import {
  GoogleDriveIcon,
  extractDriveLink,
  cleanTextWithoutLink,
  normalizeUrl,
} from './google-drive-link-badge';
import {
  SearchableMeetingSelect,
  MeetingOption,
} from './searchable-meeting-select';
import { PicCombobox } from './pic-combobox';

interface ActionItemFormDialogProps {
  isOpen: boolean;
  meetingId?: string;
  currentMeeting?: any;
  lockMeeting?: boolean;
  actionItem?: ActionItem | null;
  availableMeetings?: Array<MeetingOption>;
  availableBiros?: { id: string; code: string; shortName: string; name: string }[];
  availableUsers?: { id: string; name: string; email?: string; biroId?: string; teamId?: string | null }[];
  lockedBiroCode?: string;
  lockedTeamCode?: string;
  onClose: () => void;
  onSuccess?: (item: any) => void;
}

export function ActionItemFormDialog({
  isOpen,
  meetingId,
  currentMeeting,
  lockMeeting,
  actionItem,
  availableMeetings = [],
  availableBiros = [],
  availableUsers = [],
  lockedBiroCode,
  lockedTeamCode,
  onClose,
  onSuccess,
}: ActionItemFormDialogProps) {
  const { data: session } = useSession();
  const effectiveLockedBiroCode =
    lockedBiroCode ||
    (session?.user?.role === 'STAFF' ? session.user.biroCode : undefined);
  const effectiveLockedTeamCode =
    lockedTeamCode ||
    (session?.user?.role === 'STAFF' ? session.user.teamCode : undefined);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(actionItem);

  // Normalize currentMeeting into MeetingOption format
  const normalizedCurrentMeeting: MeetingOption | null = React.useMemo(() => {
    if (!currentMeeting?.id) return null;
    return {
      id: currentMeeting.id,
      meetingNumber: currentMeeting.meetingNumber || currentMeeting.id,
      title: currentMeeting.title || '',
      date: currentMeeting.date,
      primaryBiro: currentMeeting.primaryBiro,
      primaryTeamId: currentMeeting.primaryTeamId || currentMeeting.primaryTeam?.id,
      chairpersonId: currentMeeting.chairpersonId || currentMeeting.chairperson?.id,
      picName: currentMeeting.picName,
    } as any;
  }, [
    currentMeeting?.id,
    currentMeeting?.meetingNumber,
    currentMeeting?.title,
    currentMeeting?.date,
    currentMeeting?.primaryTeamId,
    currentMeeting?.primaryTeam?.id,
    currentMeeting?.chairpersonId,
    currentMeeting?.chairperson?.id,
    currentMeeting?.picName,
  ]);

  // Is meeting selection locked? (e.g. from a meeting page/dialog, editing item, or explicitly locked)
  const isMeetingLocked = Boolean(
    lockMeeting ||
    meetingId ||
    actionItem?.meetingId ||
    normalizedCurrentMeeting
  );

  // Resilient biros, users, teams & meetings state with auto-fetch
  const [birosList, setBirosList] = useState(availableBiros);
  const [usersList, setUsersList] = useState(availableUsers);
  const [teamsList, setTeamsList] = useState<Array<{ id: string; biroId: string; code: string; name: string; description?: string | null }>>([]);
  const [meetingsList, setMeetingsList] = useState<Array<MeetingOption>>(availableMeetings);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(
    actionItem?.meetingId || meetingId || normalizedCurrentMeeting?.id || availableMeetings[0]?.id || ''
  );
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Ensure that if currentMeeting has chairperson, that user is included in users list
  const effectiveUsers = React.useMemo(() => {
    let list = [...usersList];
    const chair = currentMeeting?.chairperson;
    if (chair?.id && !list.some((u) => u.id === chair.id)) {
      list.unshift({
        id: chair.id,
        name: chair.name,
        email: chair.email,
        biroId: chair.biroId,
        teamId: chair.teamId,
      });
    }
    return list;
  }, [usersList, currentMeeting?.chairperson]);

  const isMatchTeamOption = (m: any, code: string) => {
    const c = code.toUpperCase();
    if (c === 'ALL' || c === 'IKK' || c === 'BIRO-IKK') return true;
    const mNum = m.meetingNumber?.toUpperCase() || '';
    if (mNum.startsWith(`${c}-`)) return true;
    const primaryTeamCode = m.primaryTeam?.code?.toUpperCase() || m.primaryTeamCode?.toUpperCase();
    if (primaryTeamCode === c) return true;
    const primaryTeamId = m.primaryTeamId?.toUpperCase() || m.primaryTeam?.id?.toUpperCase();
    if (c === 'INV' && (primaryTeamId === 'TIM-001' || m.title?.toLowerCase().includes('investasi'))) return true;
    if (c === 'KS' && (primaryTeamId === 'TIM-003' || m.title?.toLowerCase().includes('kerja sama'))) return true;
    if (c === 'KOM' && (primaryTeamId === 'TIM-002' || m.title?.toLowerCase().includes('komunikasi'))) return true;
    return false;
  };

  // Guaranteed unified meetings list including normalizedCurrentMeeting & scoped by team for staff
  const effectiveMeetings = React.useMemo(() => {
    let combined = meetingsList;
    if (normalizedCurrentMeeting && !meetingsList.some((m) => m.id === normalizedCurrentMeeting.id)) {
      combined = [normalizedCurrentMeeting, ...meetingsList];
    }
    if (!effectiveLockedTeamCode) return combined;
    return combined.filter((m: any) => {
      if (actionItem?.meetingId && m.id === actionItem.meetingId) return true;
      if (meetingId && m.id === meetingId) return true;
      return isMatchTeamOption(m, effectiveLockedTeamCode);
    });
  }, [normalizedCurrentMeeting, meetingsList, effectiveLockedTeamCode, actionItem?.meetingId, meetingId]);

  const findMeetingById = React.useCallback(
    (mId: string) => {
      if (!mId) return null;
      const mUpper = mId.toUpperCase();
      const inList = effectiveMeetings.find(
        (m) => m.id === mId || (m.meetingNumber && m.meetingNumber.toUpperCase() === mUpper)
      );
      if (inList) return inList;
      if (
        normalizedCurrentMeeting &&
        (normalizedCurrentMeeting.id === mId ||
          normalizedCurrentMeeting.meetingNumber?.toUpperCase() === mUpper)
      ) {
        return normalizedCurrentMeeting;
      }
      return null;
    },
    [effectiveMeetings, normalizedCurrentMeeting]
  );

  // Sync state if props change
  useEffect(() => {
    if (availableBiros.length > 0) {
      setBirosList(availableBiros);
    }
  }, [availableBiros.length]);

  useEffect(() => {
    if (availableUsers.length > 0) {
      setUsersList(availableUsers);
    }
  }, [availableUsers.length]);

  useEffect(() => {
    if (availableMeetings.length > 0) {
      setMeetingsList(availableMeetings);
    }
  }, [availableMeetings.length]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [picBiroId, setPicBiroId] = useState('');
  const [picTeamId, setPicTeamId] = useState('TIM-001');
  const [picUserId, setPicUserId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<ActionItemPriority>('MEDIUM');
  const [status, setStatus] = useState<ActionItemStatus>('PENDING');

  // Tiga Tim Kerja Resmi Tindak Lanjut Sekretariat KEK
  const displayTeams = React.useMemo(() => [
    { id: 'TIM-001', code: 'INV', name: 'Tim Investasi', biroId: 'BIRO-IKK' },
    { id: 'TIM-003', code: 'KS', name: 'Tim Kerja Sama', biroId: 'BIRO-IKK' },
    { id: 'TIM-002', code: 'KOM', name: 'Tim Komunikasi', biroId: 'BIRO-IKK' },
  ], []);

  // Synchronize title, PIC, and team automatically from a meeting
  const applyMeetingDefaults = React.useCallback(
    (m: any, usersToSearch: any[] = effectiveUsers) => {
      if (!m) return;

      // 1. Sync title automatically to meeting title
      if (m.title) {
        setTitle(m.title);
      }

      // 2. Sync team
      const num = m.meetingNumber?.toUpperCase() || '';
      let targetTeamId = m.primaryTeamId || m.primaryTeam?.id || '';
      if (!targetTeamId) {
        if (num.startsWith('INV-')) targetTeamId = 'TIM-001';
        else if (num.startsWith('KS-')) targetTeamId = 'TIM-003';
        else if (num.startsWith('KOM-')) targetTeamId = 'TIM-002';
      }
      if (effectiveLockedTeamCode) {
        const teamForCode = displayTeams.find(
          (t) => t.code.toUpperCase() === effectiveLockedTeamCode.toUpperCase()
        );
        if (teamForCode) targetTeamId = teamForCode.id;
      }
      if (targetTeamId) {
        setPicTeamId(targetTeamId);
        const matchedT = displayTeams.find((t) => t.id === targetTeamId);
        if (matchedT?.biroId) {
          setPicBiroId(matchedT.biroId);
        }
      }

      // 3. Sync PIC (User) automatically to chairperson / PIC from meeting registration
      const directChairId = m.chairpersonId || m.chairperson?.id;
      if (directChairId) {
        setPicUserId(directChairId);
      } else if (m.picName && usersToSearch.length > 0) {
        const cleanPicName = m.picName.trim().toLowerCase();
        const matchedUser =
          usersToSearch.find((u) => u.name.trim().toLowerCase() === cleanPicName) ||
          usersToSearch.find((u) => {
            const uName = u.name.trim().toLowerCase();
            return uName.includes(cleanPicName) || cleanPicName.includes(uName);
          });
        if (matchedUser) {
          setPicUserId(matchedUser.id);
        }
      }
    },
    [effectiveLockedTeamCode, displayTeams, effectiveUsers]
  );

  // Auto-fetch biros, users, teams & meetings when dialog opens if lists are empty
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingOptions(true);
    getActionItemFormOptionsAction()
      .then((res: any) => {
        if (!isMounted || !res?.success) return;
        if (res.biros && res.biros.length > 0) {
          setBirosList(res.biros);
        }
        if (res.users && res.users.length > 0) {
          setUsersList(res.users);
        }
        if (res.teams && res.teams.length > 0) {
          setTeamsList(res.teams);
        }
        if (res.meetings && res.meetings.length > 0) {
          setMeetingsList(res.meetings);
        }

        if (!actionItem) {
          const currentTargetId =
            selectedMeetingId || meetingId || normalizedCurrentMeeting?.id || res.meetings?.[0]?.id;
          const m =
            (res.meetings || []).find((x: any) => x.id === currentTargetId) ||
            normalizedCurrentMeeting;
          if (m) {
            applyMeetingDefaults(m, res.users || []);
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingOptions(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Form fields reset & initialization (only runs when dialog opens or editing item changes)
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    setFieldErrors({});

    if (actionItem) {
      const due = new Date(actionItem.dueDate);
      const yyyy = due.getFullYear();
      const mm = String(due.getMonth() + 1).padStart(2, '0');
      const dd = String(due.getDate()).padStart(2, '0');

      setSelectedMeetingId(actionItem.meetingId || meetingId || normalizedCurrentMeeting?.id || '');
      setTitle(actionItem.title || '');
      const foundDrive = extractDriveLink(actionItem.description);
      if (foundDrive) {
        setDriveLink(foundDrive);
        setDescription(cleanTextWithoutLink(actionItem.description));
      } else {
        setDriveLink('');
        setDescription(actionItem.description || '');
      }
      setPicBiroId(actionItem.picBiroId || 'BIRO-IKK');
      setPicTeamId(actionItem.picTeamId || 'TIM-001');
      setPicUserId(actionItem.picUserId || '');
      setDueDate(`${yyyy}-${mm}-${dd}`);
      setPriority(actionItem.priority || 'MEDIUM');
      setStatus(actionItem.status || 'PENDING');
    } else {
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const yyyy = nextWeek.getFullYear();
      const mm = String(nextWeek.getMonth() + 1).padStart(2, '0');
      const dd = String(nextWeek.getDate()).padStart(2, '0');

      let initialMeetingId = meetingId || normalizedCurrentMeeting?.id || '';
      if (!initialMeetingId) {
        initialMeetingId = effectiveMeetings[0]?.id || availableMeetings[0]?.id || '';
      }
      setSelectedMeetingId(initialMeetingId);
      setDescription('');
      setDriveLink('');
      setDueDate(`${yyyy}-${mm}-${dd}`);
      setPriority('MEDIUM');
      setStatus('PENDING');

      // Find initial meeting and automatically set Title, PIC, and Team
      const currMeeting =
        findMeetingById(initialMeetingId) ||
        normalizedCurrentMeeting ||
        effectiveMeetings[0] ||
        availableMeetings[0];

      if (currMeeting) {
        applyMeetingDefaults(currMeeting, effectiveUsers);
      } else {
        setTitle('');
        setPicUserId('');
      }
    }
  }, [isOpen, actionItem?.id, meetingId]);

  // Ensure selected meeting is always from the scoped list when form opens
  useEffect(() => {
    if (!isOpen || isMeetingLocked || isEditing) return;
    if (effectiveMeetings.length > 0) {
      if (!selectedMeetingId || !effectiveMeetings.some((m) => m.id === selectedMeetingId)) {
        const firstM = effectiveMeetings[0];
        setSelectedMeetingId(firstM.id);
        applyMeetingDefaults(firstM, effectiveUsers);
      }
    }
  }, [isOpen, isMeetingLocked, isEditing, effectiveMeetings, selectedMeetingId, applyMeetingDefaults, effectiveUsers]);

  const currentMeetingObj = React.useMemo(() => {
    const targetMId = selectedMeetingId || meetingId || normalizedCurrentMeeting?.id;
    return findMeetingById(targetMId || '') || normalizedCurrentMeeting;
  }, [findMeetingById, selectedMeetingId, meetingId, normalizedCurrentMeeting]);

  const activeTitle = title || currentMeetingObj?.title || normalizedCurrentMeeting?.title || '';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    let finalDescription = description.trim();
    if (driveLink.trim()) {
      const formattedLink = normalizeUrl(driveLink);
      finalDescription = finalDescription
        ? `${finalDescription}\n\n📎 Tautan Google Drive: ${formattedLink}`
        : `📎 Tautan Google Drive: ${formattedLink}`;
    }

    const finalMeetingId = selectedMeetingId || meetingId;
    if (!finalMeetingId) {
      setFieldErrors((prev) => ({
        ...prev,
        meetingId: 'Silakan pilih rapat yang terkoneksi dengan tindak lanjut ini.',
      }));
      setErrorMessage('Rapat terkait wajib dipilih.');
      return;
    }

    const finalPicTeamId = picTeamId && picTeamId.trim() !== '' ? picTeamId.trim() : '';
    if (!finalPicTeamId) {
      setFieldErrors((prev) => ({
        ...prev,
        picTeamId: 'Tim penanggung jawab wajib dipilih.',
      }));
      setErrorMessage('Tim penanggung jawab wajib dipilih.');
      return;
    }

    const selectedTeamObj = displayTeams.find((t) => t.id === finalPicTeamId);
    const finalPicBiroId =
      selectedTeamObj?.biroId ||
      picBiroId ||
      (effectiveLockedBiroCode
        ? birosList.find((b) => b.code.toUpperCase() === effectiveLockedBiroCode.toUpperCase())?.id
        : '') ||
      'BIRO-IKK';

    const currentM = findMeetingById(finalMeetingId);
    const finalTitle = (
      title.trim() ||
      currentM?.title?.trim() ||
      normalizedCurrentMeeting?.title?.trim() ||
      'Tindak Lanjut Rapat'
    ).slice(0, 255);

    // Zod client validation
    const rawData = {
      meetingId: finalMeetingId,
      title: finalTitle,
      description: finalDescription || null,
      picBiroId: finalPicBiroId,
      picTeamId: finalPicTeamId,
      picUserId: picUserId && picUserId.trim() !== '' ? picUserId : null,
      dueDate,
      priority,
      status,
    };

    const parsed = actionItemSchema.safeParse(rawData);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const fieldName = String(issue.path[0]);
        errs[fieldName] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: ActionItemInput = parsed.data;

      let res;
      if (isEditing && actionItem) {
        res = await updateActionItemAction({
          ...payload,
          id: actionItem.id,
        });
      } else {
        res = await createActionItemAction(payload);
      }

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess(res.data);
      } else {
        setErrorMessage(res.error || 'Gagal menyimpan tindak lanjut.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F8FAFC] border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold text-[#31889C] uppercase tracking-wider">
              {isEditing ? 'Perbarui Matriks' : 'Matriks Tindak Lanjut'}
            </span>
            <h2 className="text-[18px] font-bold text-slate-900">
              {isEditing ? 'Ubah Butir Tindak Lanjut' : 'Tambah Tindak Lanjut Rapat'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4 text-[13px]">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2 text-[12px]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Rapat Terkait / Agenda Sumber */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-slate-800 flex items-center gap-1.5 text-[13px]">
                  <Layers className="w-4 h-4 text-[#31889C]" />
                  <span>{isMeetingLocked ? 'Rapat Terkait' : 'Rapat Terkait / Agenda Sumber'}</span>
                  <span className="text-red-500">*</span>
                </label>
                {(() => {
                  const targetMId = selectedMeetingId || meetingId || normalizedCurrentMeeting?.id;
                  const currM = effectiveMeetings.find(
                    (m) =>
                      m.id === targetMId ||
                      (m.meetingNumber && m.meetingNumber.toUpperCase() === targetMId?.toUpperCase())
                  ) || normalizedCurrentMeeting;
                  return currM ? (
                    <span className="text-[11px] font-semibold text-[#215865] bg-[#E8F5F7] px-2 py-0.5 rounded-full border border-[#BCE3EB]">
                      {currM.meetingNumber}
                    </span>
                  ) : null;
                })()}
              </div>

              <SearchableMeetingSelect
                meetings={effectiveMeetings}
                selectedMeetingId={selectedMeetingId || meetingId || normalizedCurrentMeeting?.id || ''}
                onSelectMeeting={(mId) => {
                  if (isMeetingLocked) return;
                  setSelectedMeetingId(mId);
                  if (fieldErrors.meetingId) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.meetingId;
                      return next;
                    });
                  }
                  if (!isEditing) {
                    const selM = findMeetingById(mId);
                    if (selM) {
                      applyMeetingDefaults(selM, effectiveUsers);
                    }
                  }
                }}
                userBiroCode={effectiveLockedBiroCode}
                userTeamCode={effectiveLockedTeamCode || undefined}
                isLocked={isMeetingLocked}
                disabled={isMeetingLocked}
                isLoading={isLoadingOptions}
                error={fieldErrors.meetingId}
              />
              {isMeetingLocked ? (
                <p className="mt-1.5 text-[11px] text-[#215865] flex items-center gap-1.5 font-medium bg-[#E8F5F7]/80 px-2.5 py-1.5 rounded-lg border border-[#BCE3EB]/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#31889C] shrink-0" />
                  <span>Tindak lanjut ini otomatis terhubung langsung ke rapat ini (tidak perlu memilih rapat lain).</span>
                </p>
              ) : effectiveLockedTeamCode ? (
                <p className="mt-1.5 text-[11px] text-[#215865] flex items-center gap-1.5 font-medium bg-[#E8F5F7]/80 px-2.5 py-1.5 rounded-lg border border-[#BCE3EB]/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#31889C] shrink-0" />
                  <span>Daftar rapat disesuaikan khusus untuk agenda penugasan {displayTeams.find((t) => t.code === effectiveLockedTeamCode)?.name || `Tim ${effectiveLockedTeamCode}`}.</span>
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Hubungkan tindak lanjut ini dengan agenda sidang dewan yang relevan. Gunakan pencarian instan atau filter biro untuk menemukan rapat dengan cepat.
                </p>
              )}
            </div>

            {/* Judul Tindak Lanjut (Otomatis Sesuai Agenda Rapat) */}
            <div className="p-3.5 bg-gradient-to-r from-slate-50 to-[#F0F8FA] border border-[#BCE3EB]/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#215865] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Judul Tindak Lanjut</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#1E6B7B] bg-white px-2 py-0.5 rounded-full border border-[#BCE3EB] shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-[#31889C]" />
                  <span>Otomatis Sesuai Agenda Rapat</span>
                </span>
              </div>
              <p className="text-[13.5px] font-bold text-slate-800 leading-snug break-words">
                {activeTitle || '(Mengikuti judul agenda rapat yang dipilih)'}
              </p>
              {fieldErrors.title && (
                <p className="mt-1 text-[11px] text-red-600 font-semibold">{fieldErrors.title}</p>
              )}
            </div>

            {/* Deskripsi (Optional) */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Deskripsi / Catatan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Rincian ruang lingkup arahan, output dokumen yang diharapkan, atau koordinasi lintas instansi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#31889C]/30 focus:border-[#31889C] text-slate-800 text-[13px]"
              />
            </div>

            {/* Tautan Google Drive / Dokumen Rujukan (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
                  <GoogleDriveIcon className="w-3.5 h-3.5" />
                  <span>Tautan Google Drive / Dokumen Rujukan <span className="text-slate-400 font-normal">(Opsional)</span></span>
                </label>
                <span className="text-[10.5px] text-slate-400">
                  Folder Drive, Kerangka Acuan, atau Dokumen Terkait
                </span>
              </div>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/... atau https://docs.google.com/..."
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#31889C]/30 focus:border-[#31889C] text-slate-800 text-[13px] font-mono"
                />
                <div className="absolute left-3 top-2.5 pointer-events-none">
                  <GoogleDriveIcon className="w-4 h-4" />
                </div>
              </div>
              {driveLink.trim() && (
                <div className="mt-2 flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#E8F5F7] border border-[#BCE3EB]">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <GoogleDriveIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11.5px] text-[#215865] truncate font-mono">
                      {normalizeUrl(driveLink)}
                    </span>
                  </div>
                  <a
                    href={normalizeUrl(driveLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#31889C] hover:bg-[#266F80] text-white text-[11px] font-bold shrink-0 transition-colors shadow-2xs cursor-pointer"
                    title="Klik untuk langsung membuka dan menguji tautan di Google Drive"
                  >
                    <span>Uji / Buka Langsung</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              <p className="mt-1 text-[11px] text-slate-400">
                Tautkan Google Drive bahan rujukan agar tim pelaksana dapat langsung mengakses dokumen pendukung tugas ini.
              </p>
            </div>

            {/* Tim Kerja Penanggung Jawab & PIC Pelaksana Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tim Penanggung Jawab (Required, Per Tim Kerja IKK) */}
              <div>
                {(() => {
                  const currentTeam = displayTeams.find((t) => t.id === picTeamId);
                  return (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-800 text-[13px] flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-[#31889C]" />
                          <span>Tim Penanggung Jawab</span>
                          <span className="text-red-500">*</span>
                        </label>
                        {currentTeam && (
                          <span className="text-[10px] font-bold text-[#215865] bg-[#E8F5F7] px-2 py-0.5 rounded border border-[#BCE3EB]">
                            {currentTeam.code}
                          </span>
                        )}
                      </div>
                      <select
                        value={picTeamId}
                        disabled={Boolean(effectiveLockedTeamCode)}
                        onChange={(e) => {
                          const newTeamId = e.target.value;
                          setPicTeamId(newTeamId);
                          const matched = displayTeams.find((t) => t.id === newTeamId);
                          if (matched?.biroId) {
                            setPicBiroId(matched.biroId);
                          }
                          if (fieldErrors.picTeamId) {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.picTeamId;
                              return next;
                            });
                          }
                        }}
                        className={`w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#31889C]/30 focus:border-[#31889C] font-medium text-slate-800 text-[13px] shadow-2xs ${
                          effectiveLockedTeamCode ? 'bg-slate-100 cursor-not-allowed opacity-90' : 'bg-white cursor-pointer'
                        }`}
                      >
                        <option value="">
                          {isLoadingOptions ? '-- Memuat Tim Kerja... --' : '-- Pilih Tim Kerja --'}
                        </option>
                        {displayTeams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.picTeamId && (
                        <p className="mt-1 text-[11px] text-red-600 font-semibold">{fieldErrors.picTeamId}</p>
                      )}
                      {effectiveLockedTeamCode ? (
                        <p className="mt-1 text-[11px] text-[#215865] font-semibold">
                          🔒 Tim kerja terkunci sesuai penugasan tim peran Anda ({effectiveLockedTeamCode}).
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-slate-400">
                          Penanggung jawab operasional tindak lanjut per tim kerja Sekretariat KEK.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Pejabat / PIC Pelaksana (Opsional) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between text-[13px]">
                  <span>Pejabat / PIC Pelaksana <span className="text-slate-400 font-normal">(Opsional)</span></span>
                  {picUserId && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] text-[#1E6B7B] font-bold bg-[#E8F5F7] px-2 py-0.5 rounded-full border border-[#BCE3EB]">
                      <CheckCircle2 className="w-3 h-3 text-[#31889C]" />
                      <span>Otomatis Sesuai Rapat</span>
                    </span>
                  )}
                </label>
                <PicCombobox
                  value={picUserId}
                  onChange={(val) => setPicUserId(val)}
                  users={effectiveUsers}
                  biros={birosList}
                  selectedBiroId={
                    picBiroId ||
                    displayTeams.find((t) => t.id === picTeamId)?.biroId ||
                    (effectiveLockedBiroCode
                      ? birosList.find((b) => b.code.toUpperCase() === effectiveLockedBiroCode.toUpperCase())?.id
                      : '') ||
                    'BIRO-IKK'
                  }
                  disabled={isLoadingOptions}
                  placeholder="Pilih Pejabat / PIC Pelaksana..."
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Otomatis terpilih sesuai pimpinan/PIC saat pendaftaran rapat. Dapat disesuaikan bila diperlukan.
                </p>
              </div>
            </div>

            {/* Deadline, Prioritas, Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Deadline (Required) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tenggat Waktu / Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#31889C]/30 focus:border-[#31889C] bg-white text-slate-800 text-[13px]"
                />
                {fieldErrors.dueDate && (
                  <p className="mt-1 text-[11px] text-red-600 font-semibold">{fieldErrors.dueDate}</p>
                )}
              </div>

              {/* Prioritas */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tingkat Prioritas
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ActionItemPriority)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#31889C]/30 focus:border-[#31889C] bg-white font-medium text-slate-800 text-[13px] cursor-pointer"
                >
                  <option value="LOW">Rendah (LOW)</option>
                  <option value="MEDIUM">Sedang (MEDIUM)</option>
                  <option value="HIGH">Tinggi (HIGH)</option>
                  <option value="URGENT">Sangat Mendesak (URGENT)</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Status Pengerjaan
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ActionItemStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#31889C]/30 focus:border-[#31889C] bg-white font-medium text-slate-800 text-[13px] cursor-pointer"
                >
                  <option value="PENDING">Belum Dimulai</option>
                  <option value="IN_PROGRESS">Dalam Proses</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="OVERDUE">Terlambat</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#31889C] hover:bg-[#266F80] text-white font-semibold text-[13px] shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Tindak Lanjut'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
