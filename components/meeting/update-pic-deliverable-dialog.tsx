'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  FileCheck,
  Link2,
  ExternalLink,
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
  Paperclip,
  Trash2,
} from 'lucide-react';
import { toast } from '@/components/providers/toast-provider';
import { submitPicProgressAction } from '@/app/actions/pic-deliverable-actions';
import {
  parsePicDeliverableDescription,
  PicDeliverableParsedData,
} from '@/lib/pic-deliverables';
import { cn } from '@/lib/utils';

interface UpdatePicDeliverableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deliverable: {
    id: string;
    meetingId: string;
    title: string;
    description?: string | null;
    status: string;
    dueDate?: string | Date | null;
    picUser?: {
      id: string;
      name: string;
      email?: string | null;
      role?: string | null;
      biro?: { shortName?: string | null; name?: string | null } | null;
      team?: { code?: string | null; name?: string | null } | null;
    } | null;
    logs?: Array<{
      id: string;
      progress?: number | null;
      notes: string;
      newStatus: string;
      createdAt: string | Date;
      user?: { name: string } | null;
    }> | null;
  } | null;
  meetingTitle?: string;
  onSuccess?: () => void;
}

export function UpdatePicDeliverableDialog({
  isOpen,
  onClose,
  deliverable,
  meetingTitle,
  onSuccess,
}: UpdatePicDeliverableDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed: PicDeliverableParsedData = parsePicDeliverableDescription(
    deliverable?.description
  );

  const [status, setStatus] = useState<string>(deliverable?.status || 'IN_PROGRESS');
  const [progress, setProgress] = useState<number>(
    deliverable?.logs?.[0]?.progress ?? (deliverable?.status === 'COMPLETED' ? 100 : 50)
  );
  const [notes, setNotes] = useState<string>(parsed.notes || '');
  const [linkUrl, setLinkUrl] = useState<string>(parsed.linkUrl || '');
  const [linkTitle, setLinkTitle] = useState<string>(parsed.linkTitle || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string>(parsed.fileUrl || '');
  const [existingFileName, setExistingFileName] = useState<string>(parsed.fileName || '');
  const [syncToMeeting, setSyncToMeeting] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (deliverable) {
      const p = parsePicDeliverableDescription(deliverable.description);
      setStatus(deliverable.status || 'IN_PROGRESS');
      const latestProg = deliverable.logs?.[0]?.progress;
      setProgress(
        typeof latestProg === 'number'
          ? latestProg
          : deliverable.status === 'COMPLETED'
          ? 100
          : deliverable.status === 'PENDING'
          ? 0
          : 50
      );
      setNotes(p.notes || '');
      setLinkUrl(p.linkUrl || '');
      setLinkTitle(p.linkTitle || '');
      setExistingFileUrl(p.fileUrl || '');
      setExistingFileName(p.fileName || '');
      setSelectedFile(null);
    }
  }, [deliverable]);

  if (!isOpen || !deliverable) return null;

  const handleStatusSelect = (newStatus: string) => {
    setStatus(newStatus);
    if (newStatus === 'COMPLETED') {
      setProgress(100);
    } else if (newStatus === 'PENDING') {
      setProgress(0);
    } else if (progress === 0 || progress === 100) {
      setProgress(50);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 100 * 1024 * 1024) {
        toast.error('Ukuran berkas melebihi 100MB.');
        return;
      }
      setSelectedFile(f);
    }
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() && !linkUrl.trim() && !selectedFile && !existingFileUrl) {
      toast.error('Mohon isi minimal salah satu: Catatan progres, tautan URL, atau unggah berkas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('actionItemId', deliverable.id);
      formData.append('meetingId', deliverable.meetingId);
      formData.append('status', status);
      formData.append('progress', String(progress));
      formData.append('notes', notes.trim());
      formData.append('linkUrl', linkUrl.trim());
      formData.append('linkTitle', linkTitle.trim() || 'Tautan Luaran PIC');
      formData.append('syncToMeeting', syncToMeeting ? 'true' : 'false');
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await submitPicProgressAction(formData);

      if (res.success) {
        toast.success('Progres & luaran PIC berhasil disimpan dan diperbarui!');
        onSuccess?.();
        router.refresh();
        onClose();
      } else {
        toast.error(res.error || 'Gagal menyimpan progres PIC.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Terjadi kesalahan sistem saat memperbarui progres.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#175360] via-[#1E6B7B] to-[#2B7F91] px-6 py-4 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-teal-200 border border-white/20 shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white/20 text-teal-100">
                  {deliverable.picUser?.name || 'PIC Terkait'}
                </span>
                <span className="text-xs text-teal-100/80">
                  Pelaporan Progres &amp; Output
                </span>
              </div>
              <h2 className="text-[17px] font-bold text-white mt-0.5 line-clamp-1">
                {deliverable.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status & Progress Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Status Perkembangan Tugas
              </label>
              <span className="text-xs font-bold text-[#1E6B7B] bg-[#F0F9FA] px-2.5 py-0.5 rounded-full border border-[#BCE3EB]">
                {progress}% Selesai
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleStatusSelect('PENDING')}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer",
                  status === 'PENDING'
                    ? "bg-slate-700 text-white border-slate-700 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                )}
              >
                Belum Dimulai
              </button>
              <button
                type="button"
                onClick={() => handleStatusSelect('IN_PROGRESS')}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer",
                  status === 'IN_PROGRESS'
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                )}
              >
                Sedang Dikerjakan
              </button>
              <button
                type="button"
                onClick={() => handleStatusSelect('COMPLETED')}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer",
                  status === 'COMPLETED'
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                )}
              >
                Selesai
              </button>
            </div>

            {/* Slider Percentage */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>0% (Awal)</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100% (Tuntas)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setProgress(val);
                  if (val === 100) setStatus('COMPLETED');
                  else if (val === 0) setStatus('PENDING');
                  else setStatus('IN_PROGRESS');
                }}
                className="w-full accent-[#1E6B7B] cursor-pointer"
              />
            </div>
          </div>

          {/* Catatan Progres */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Catatan Perkembangan Terkini</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Bisa dibaca langsung oleh Pimpinan
              </span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Rilis pers sudah dibuat dan dikirim ke humas kementerian. Menunggu tayang pada portal resmi sore ini..."
              className="w-full text-xs sm:text-[13px] rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B] transition-all resize-none"
            />
          </div>

          {/* Tautan URL yang Bisa Diklik Pimpinan */}
          <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200/70 space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#1E6B7B]" />
              <label className="text-xs font-bold text-[#175360]">
                Tautan Online / Link Hasil (Bisa Diklik Pimpinan)
              </label>
            </div>
            <p className="text-[11.5px] text-slate-500">
              Masukkan URL hasil kerja, misalnya tautan siaran pers yang sudah terbit, folder Google Drive, dokumen kerja bersama, atau berita online:
            </p>

            <div className="space-y-2">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://ekon.go.id/publikasi/detail/... atau https://drive.google.com/..."
                className="w-full text-xs font-mono rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B]"
              />

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Label Tautan (Contoh: Siaran Pers Kementerian Koordinator)"
                  className="flex-1 text-xs rounded-lg border border-slate-300 bg-white p-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B]"
                />
                {linkUrl && (
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
                    title="Uji coba buka tautan"
                  >
                    <span>Coba Klik</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {linkUrl && (
              <label className="flex items-center gap-2 pt-1 text-[11.5px] text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncToMeeting}
                  onChange={(e) => setSyncToMeeting(e.target.checked)}
                  className="rounded text-[#1E6B7B] focus:ring-[#1E6B7B] cursor-pointer"
                />
                <span>
                  Sinkronkan juga tautan ini ke panel <strong>Hasil Kegiatan &amp; Output Rapat</strong> utama
                </span>
              </label>
            )}
          </div>

          {/* Unggah Berkas Fisik (Opsional) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                <span>Unggah Berkas Fisik / Foto Dokumentasi (Opsional)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                PDF, Word, Excel, Gambar (Max 100MB)
              </span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.png,.jpg,.jpeg,.webp"
              className="hidden"
            />

            {/* Existing File Info */}
            {existingFileUrl && !selectedFile && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate font-medium text-slate-800">
                    {existingFileName || 'Berkas Terlampir'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={existingFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#1E6B7B] hover:underline"
                  >
                    Lihat Berkas
                  </a>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-1 rounded bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Ganti
                  </button>
                </div>
              </div>
            )}

            {/* Selected New File */}
            {selectedFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/60 border border-teal-200 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <UploadCloud className="w-4 h-4 text-[#1E6B7B] shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-teal-950 truncate">{selectedFile.name}</p>
                    <p className="text-[10.5px] text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveSelectedFile}
                  className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Batalkan berkas baru"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : !existingFileUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#1E6B7B] bg-slate-50/50 hover:bg-teal-50/30 flex flex-col items-center justify-center gap-1.5 transition-all text-slate-600 cursor-pointer"
              >
                <UploadCloud className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-700">
                  Klik untuk memilih berkas dari komputer
                </span>
                <span className="text-[11px] text-slate-400">
                  Format didukung: PDF, Dokumen Word, Presentasi, atau Foto Kegiatan
                </span>
              </button>
            ) : null}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#175360] to-[#1E6B7B] hover:from-[#13424d] hover:to-[#175360] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Progres...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan &amp; Publikasikan Progres</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
