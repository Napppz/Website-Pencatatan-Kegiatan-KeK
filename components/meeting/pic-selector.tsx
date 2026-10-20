'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  User,
  Users,
  Search,
  Check,
  ChevronDown,
  X,
  UserCheck,
  Building,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PicOptionUser {
  id: string;
  name: string;
  email?: string;
  role?: string;
  biro?: {
    id?: string;
    code?: string;
    shortName?: string;
  } | null;
  team?: {
    id?: string;
    code?: string;
    name?: string;
  } | null;
}

export interface PicSelectorProps {
  availableUsers: PicOptionUser[];
  selectedUserId: string;
  picName: string;
  onSelectUser: (user: PicOptionUser | null) => void;
  onPicNameChange: (name: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const TEAM_TABS = [
  { key: 'ALL', label: 'Semua Tim' },
  { key: 'INV', label: 'Tim Investasi' },
  { key: 'KS', label: 'Tim Kerja Sama' },
  { key: 'KOM', label: 'Tim Komunikasi' },
  { key: 'SI', label: 'Tim Sistem Informasi' },
  { key: 'POKJA', label: 'Pokja' },
];

export function getUserTeamCode(u: PicOptionUser): 'INV' | 'KS' | 'KOM' | 'SI' | 'POKJA' | null {
  const tc = (u.team?.code || '').toUpperCase();
  const tid = u.team?.id || '';
  const tname = (u.team?.name || '').toLowerCase();

  if (tc === 'INV' || tid === 'TIM-001' || tname.includes('investasi')) return 'INV';
  if (tc === 'KS' || tid === 'TIM-003' || tname.includes('kerja sama') || tname.includes('kerjasama')) return 'KS';
  if (tc === 'KOM' || tid === 'TIM-002' || tname.includes('komunikasi')) return 'KOM';
  if (tc === 'SI' || tid === 'TIM-004' || tname.includes('sistem informasi') || tname.includes('si')) return 'SI';
  if (tc === 'POKJA' || tid === 'TIM-005' || tname.includes('pokja')) return 'POKJA';
  return null;
}

export const TEAM_STYLE: Record<string, { bg: string; text: string; border: string; avatarBg: string; label: string }> = {
  INV: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    label: 'Tim Investasi',
  },
  KS: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    avatarBg: 'bg-sky-100 text-sky-800',
    label: 'Tim Kerja Sama',
  },
  KOM: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    avatarBg: 'bg-amber-100 text-amber-800',
    label: 'Tim Komunikasi',
  },
  SI: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    avatarBg: 'bg-purple-100 text-purple-800',
    label: 'Tim Sistem Informasi',
  },
  POKJA: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    avatarBg: 'bg-indigo-100 text-indigo-800',
    label: 'Pokja',
  },
};

export function PicSelector({
  availableUsers = [],
  selectedUserId,
  picName,
  onSelectUser,
  onPicNameChange,
  disabled = false,
  required = true,
  className,
}: PicSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Selected user object
  const selectedUser = useMemo(() => {
    return availableUsers.find((u) => u.id === selectedUserId) || null;
  }, [availableUsers, selectedUserId]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Counts per team
  const teamCounts = useMemo(() => {
    const counts = { ALL: availableUsers.length, INV: 0, KS: 0, KOM: 0 };
    availableUsers.forEach((u) => {
      const code = getUserTeamCode(u);
      if (code === 'INV') counts.INV++;
      else if (code === 'KS') counts.KS++;
      else if (code === 'KOM') counts.KOM++;
    });
    return counts;
  }, [availableUsers]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return availableUsers.filter((u) => {
      // Team filter
      if (teamFilter !== 'ALL') {
        const code = getUserTeamCode(u);
        if (code !== teamFilter) return false;
      }
      // Search query
      if (q) {
        const nameMatch = u.name.toLowerCase().includes(q);
        const teamMatch = u.team?.name?.toLowerCase().includes(q);
        const emailMatch = u.email?.toLowerCase().includes(q);
        return nameMatch || teamMatch || emailMatch;
      }
      return true;
    });
  }, [availableUsers, teamFilter, searchQuery]);

  const handleSelect = (user: PicOptionUser | null) => {
    if (!user) {
      onSelectUser(null);
      onPicNameChange('');
    } else {
      onSelectUser(user);
      onPicNameChange(user.name);
    }
    setIsOpen(false);
  };

  const selectedTeamCode = selectedUser ? getUserTeamCode(selectedUser) : null;
  const selectedStyle = selectedTeamCode ? TEAM_STYLE[selectedTeamCode] : null;

  return (
    <div className={cn('space-y-2', className)} ref={containerRef}>
      {/* Dropdown Trigger Button */}
      <div className="relative">
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer shadow-2xs group select-none',
            isOpen
              ? 'border-[#1E6B7B] ring-2 ring-[#1E6B7B]/20 bg-teal-50/20'
              : 'border-slate-300 bg-white hover:border-[#1E6B7B] hover:bg-slate-50/70',
            disabled && 'opacity-60 cursor-not-allowed bg-slate-100'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {selectedUser ? (
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                  selectedStyle?.avatarBg || 'bg-[#1E6B7B]/10 text-[#1E6B7B]'
                )}
              >
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 group-hover:text-[#1E6B7B] group-hover:bg-[#1E6B7B]/10 flex items-center justify-center transition-colors shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              {selectedUser ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {selectedUser.name}
                  </span>
                  {selectedUser.team?.name && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                        selectedStyle?.bg || 'bg-slate-100',
                        selectedStyle?.text || 'text-slate-700',
                        selectedStyle?.border || 'border-slate-200'
                      )}
                    >
                      Tim {selectedUser.team.name}
                    </span>
                  )}
                </div>
              ) : picName ? (
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {picName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                    Manual
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-normal">
                  Pilih staf PIC kegiatan dari tim kerja...
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            {(selectedUser || picName) && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(null);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Hapus pilihan staf PIC"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform duration-200',
                isOpen && 'transform rotate-180 text-[#1E6B7B]'
              )}
            />
          </div>
        </div>

        {/* Dropdown Menu Popover */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header: Filter Tab Per Tim Kerja */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#1E6B7B]" />
                  <span>Filter Tim Kerja PIC:</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {filteredUsers.length} staf
                </span>
              </div>

              {/* Tim Kerja Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none]">
                {TEAM_TABS.map((tab) => {
                  const isActive = teamFilter === tab.key;
                  const count = (teamCounts as any)[tab.key] ?? 0;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setTeamFilter(tab.key)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border',
                        isActive
                          ? 'bg-[#1E6B7B] text-white border-[#175360] shadow-2xs font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                      )}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama staf atau email..."
                  className="w-full pl-8 pr-7 h-[34px] rounded-lg border border-slate-300 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* List of Staff Items */}
            <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 [scrollbar-width:thin]">
              {/* Option: Clear / Manual */}
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer',
                  !selectedUserId
                    ? 'bg-teal-50/80 text-[#1E6B7B] font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                    —
                  </span>
                  <span>Ketik PIC Manual / Eksternal (tanpa akun)</span>
                </span>
                {!selectedUserId && <Check className="w-3.5 h-3.5 text-[#1E6B7B]" />}
              </button>

              {filteredUsers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Tidak ada staf yang sesuai dengan filter tim atau pencarian
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUserId === u.id;
                  const teamCode = getUserTeamCode(u);
                  const style = teamCode ? TEAM_STYLE[teamCode] : null;

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelect(u)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer border group',
                        isSelected
                          ? 'bg-[#1E6B7B] text-white border-[#1E6B7B] font-bold shadow-2xs'
                          : 'bg-white text-slate-700 border-transparent hover:bg-slate-50 hover:border-slate-200'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                            isSelected
                              ? 'bg-white/20 text-white'
                              : style?.avatarBg || 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            u.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              'text-xs font-semibold truncate',
                              isSelected ? 'text-white' : 'text-slate-800 group-hover:text-slate-900'
                            )}
                          >
                            {u.name}
                          </p>
                          {u.email && (
                            <p
                              className={cn(
                                'text-[10px] truncate',
                                isSelected ? 'text-teal-100' : 'text-slate-400'
                              )}
                            >
                              {u.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {u.team?.name && (
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 border',
                            isSelected
                              ? 'bg-white/20 text-white border-white/20'
                              : style
                              ? cn(style.bg, style.text, style.border)
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          )}
                        >
                          {u.team.name}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Field Teks Keterangan PIC (Otomatis Terisi & Fleksibel Diedit) */}
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-slate-600">
          Nama / Keterangan PIC{' '}
          <span className="text-slate-400 font-normal">
            (Otomatis terisi dari pilihan staf di atas, atau sesuaikan jika perlu)
          </span>
          {required && <span className="text-red-500 ml-0.5">*</span>}:
        </label>
        <input
          type="text"
          required={required}
          value={picName}
          onChange={(e) => onPicNameChange(e.target.value)}
          placeholder="Contoh: Maya Puspita, S.Sos / PIC Tim Investasi..."
          className="w-full px-3.5 h-[38px] rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B] shadow-2xs placeholder-slate-400"
        />
      </div>
    </div>
  );
}

export interface MultiPicSelectorProps {
  availableUsers: PicOptionUser[];
  selectedUserIds: string[];
  picName: string;
  onToggleUser: (user: PicOptionUser) => void;
  onPicNameChange: (name: string) => void;
  onClearAll: () => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function MultiPicSelector({
  availableUsers = [],
  selectedUserIds = [],
  picName,
  onToggleUser,
  onPicNameChange,
  onClearAll,
  disabled = false,
  required = true,
  className,
}: MultiPicSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const selectedUsers = useMemo(() => {
    return availableUsers.filter((u) => selectedUserIds.includes(u.id));
  }, [availableUsers, selectedUserIds]);

  const teamCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: availableUsers.length, INV: 0, KS: 0, KOM: 0, SI: 0, POKJA: 0 };
    availableUsers.forEach((u) => {
      const code = getUserTeamCode(u);
      if (code && counts[code] !== undefined) {
        counts[code]++;
      }
    });
    return counts;
  }, [availableUsers]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return availableUsers.filter((u) => {
      if (teamFilter !== 'ALL') {
        const code = getUserTeamCode(u);
        if (code !== teamFilter) return false;
      }
      if (q) {
        const nameMatch = u.name.toLowerCase().includes(q);
        const teamMatch = u.team?.name?.toLowerCase().includes(q);
        const emailMatch = u.email?.toLowerCase().includes(q);
        return nameMatch || teamMatch || emailMatch;
      }
      return true;
    });
  }, [availableUsers, teamFilter, searchQuery]);

  return (
    <div className={cn('space-y-3', className)} ref={containerRef}>
      {/* Selected PICs Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#1E6B7B]" />
            <span>PIC Pelaksana Terpilih ({selectedUsers.length} orang)</span>
            <span className="text-slate-400 font-normal">(Bisa lebih dari 1 orang)</span>
          </span>
          {selectedUsers.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {selectedUsers.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            {selectedUsers.map((u) => {
              const code = getUserTeamCode(u);
              const style = code ? TEAM_STYLE[code] : null;
              return (
                <span
                  key={u.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs transition-all animate-in fade-in',
                    style ? cn(style.bg, style.text, style.border) : 'bg-white text-slate-800 border-slate-200'
                  )}
                >
                  <span className="truncate max-w-[200px]">{u.name}</span>
                  {u.team?.name && (
                    <span className="text-[10px] opacity-75 font-normal">({u.team.name})</span>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleUser(u)}
                    className="p-0.5 rounded-md hover:bg-black/10 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors ml-0.5"
                    title={`Hapus ${u.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 text-center text-xs text-slate-500">
            Belum ada PIC yang dipilih. Silakan klik tombol di bawah untuk memilih satu atau beberapa staf penanggung jawab.
          </div>
        )}
      </div>

      {/* Button to open dropdown */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer shadow-2xs select-none',
            isOpen
              ? 'border-[#1E6B7B] ring-2 ring-[#1E6B7B]/20 bg-[#F0F8FA]'
              : 'border-slate-300 bg-white hover:border-[#1E6B7B] hover:bg-slate-50/70',
            disabled && 'opacity-60 cursor-not-allowed bg-slate-100'
          )}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#1E6B7B]">
            <Users className="w-4 h-4" />
            <span>+ Pilih / Tambah Staf PIC Kegiatan ({selectedUsers.length} dipilih)</span>
          </div>
          <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama staf, email, atau tim kerja..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/25 focus:border-[#1E6B7B]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Team Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 border-b border-slate-100 scrollbar-none text-[11px]">
              {TEAM_TABS.map((tab) => {
                const isSelected = teamFilter === tab.key;
                const count = teamCounts[tab.key] || 0;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setTeamFilter(tab.key)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1',
                      isSelected
                        ? 'bg-[#1E6B7B] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    <span>{tab.label}</span>
                    <span className={cn('text-[10px] px-1 rounded-full', isSelected ? 'bg-white/20' : 'bg-slate-200')}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Users List with Multi-Checkbox */}
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Tidak ditemukan staf yang cocok.
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isChecked = selectedUserIds.includes(u.id);
                  const code = getUserTeamCode(u);
                  const style = code ? TEAM_STYLE[code] : null;

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => onToggleUser(u)}
                      className={cn(
                        'w-full p-2 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer border',
                        isChecked
                          ? 'bg-[#E8F5F7] border-[#1E6B7B] text-[#1E6B7B] font-bold shadow-2xs'
                          : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={cn(
                            'w-5 h-5 rounded-md flex items-center justify-center border text-white transition-all shrink-0',
                            isChecked ? 'bg-[#1E6B7B] border-[#1E6B7B]' : 'bg-white border-slate-300'
                          )}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs truncate">{u.name}</p>
                          {u.email && <p className="text-[10px] text-slate-400 truncate">{u.email}</p>}
                        </div>
                      </div>

                      {u.team?.name && (
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ml-2 border',
                            style ? cn(style.bg, style.text, style.border) : 'bg-slate-100 text-slate-600 border-slate-200'
                          )}
                        >
                          {u.team.name}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{selectedUsers.length} staf dipilih sebagai PIC</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-lg bg-[#1E6B7B] text-white font-bold hover:bg-[#164E59] cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Field Keterangan / Gabungan Nama PIC */}
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-slate-600">
          Keterangan / Rincian Nama PIC:
          <span className="text-slate-400 font-normal ml-1">
            (Otomatis terisi dari pilihan staf di atas atau bisa disesuaikan)
          </span>
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          type="text"
          required={required}
          value={picName}
          onChange={(e) => onPicNameChange(e.target.value)}
          placeholder="Contoh: Rizki Agustianto, Maya Puspita, S.Sos..."
          className="w-full px-3.5 h-[38px] rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E6B7B]/20 focus:border-[#1E6B7B] shadow-2xs font-medium"
        />
      </div>
    </div>
  );
}
