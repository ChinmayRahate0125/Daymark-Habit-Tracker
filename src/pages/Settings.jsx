import React, { useRef, useState } from 'react';
import { RotateCcw, Trash2, Download, Upload, AlertTriangle, Moon, Sun, Check } from 'lucide-react';
import useHabitStore from '../store/useHabitStore';
import { categoryIcon, categoryColor } from '../utils/categories';

export default function Settings() {
  const {
    habits, settings, updateSettings,
    restoreHabit, deleteHabit,
    exportData, importData, resetData,
  } = useHabitStore();

  const [importStatus, setImportStatus] = useState(null); // 'ok' | 'fail'
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef(null);

  const archived = habits.filter((h) => h.status === 'archived');

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url,
      download: `daymark-${new Date().toISOString().slice(0, 10)}.json`,
    });
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const ok = importData(ev.target.result);
      setImportStatus(ok ? 'ok' : 'fail');
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const ACCENT_OPTIONS = [
    { value: 'purple',  bg: '#7c3aed', label: 'Violet'  },
    { value: 'blue',    bg: '#2563eb', label: 'Blue'    },
    { value: 'emerald', bg: '#059669', label: 'Emerald' },
    { value: 'rose',    bg: '#e11d48', label: 'Rose'    },
    { value: 'amber',   bg: '#d97706', label: 'Amber'   },
  ];

  // Night = dark (default), Day = light
  const isLight = settings.theme === 'light';

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-zinc-100">
      <div className="max-w-3xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Settings</h1>
          <p className="text-xs text-zinc-400 mt-1 font-normal">
            Preferences, archived habits, and data backup
          </p>
        </div>

        {/* ── Appearance ── */}
        <section className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-2xl p-6 mb-5 shadow-sm card-hover">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            Appearance
          </h2>
          <p className="text-xs text-zinc-400 mb-4">
            Choose your preferred colour scheme.
          </p>
          <div className="flex items-center gap-2">
            {/* Night */}
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ease-out active:scale-[0.96] ${
                !isLight
                  ? 'btn-primary border-transparent shadow-sm scale-[1.02]'
                  : 'border-[var(--border-lg)] text-zinc-400 hover:text-zinc-200 hover:bg-[var(--bg-hover-sm)]'
              }`}
            >
              <Moon size={13} className={`transition-transform duration-200 ${!isLight ? 'scale-110' : ''}`} />
              Night
            </button>
            {/* Day */}
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ease-out active:scale-[0.96] ${
                isLight
                  ? 'btn-primary border-transparent shadow-sm scale-[1.02]'
                  : 'border-[var(--border-lg)] text-zinc-400 hover:text-zinc-200 hover:bg-[var(--bg-hover-sm)]'
              }`}
            >
              <Sun size={13} className={`transition-transform duration-200 ${isLight ? 'scale-110' : ''}`} />
              Day
            </button>
          </div>
        </section>

        {/* ── Accent Color ── */}
        <section className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-2xl p-6 mb-5 shadow-sm card-hover">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            Accent Color
          </h2>
          <p className="text-xs text-zinc-400 mb-4">
            Select the accent hue for indicators, buttons, and highlights.
          </p>
          <div className="flex items-center gap-3">
            {ACCENT_OPTIONS.map(({ value, bg, label }) => {
              const isSelected = (settings.accent || 'purple') === value;
              return (
                <button
                  key={value}
                  onClick={() => updateSettings({ accent: value })}
                  title={label}
                  aria-label={`Select ${label} accent`}
                  aria-pressed={isSelected}
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-200 ease-out ${
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-card)] ring-[var(--accent-primary)] scale-110 shadow-md opacity-100'
                      : 'opacity-60 hover:opacity-100 hover:scale-105 active:scale-95'
                  }`}
                  style={{ backgroundColor: bg }}
                >
                  <Check
                    size={13}
                    className={`text-white drop-shadow-sm transition-all duration-200 ease-out ${
                      isSelected
                        ? 'opacity-100 scale-100 rotate-0'
                        : 'opacity-0 scale-50 -rotate-45 pointer-events-none'
                    }`}
                    strokeWidth={3}
                  />
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Archived Habits ── */}
        <section className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-2xl p-6 mb-5 shadow-sm card-hover">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            Archived Habits
          </h2>
          <p className="text-xs text-zinc-400 mb-4">
            Archived habits are hidden from the active schedule while keeping their past history intact.
          </p>

          {archived.length === 0 ? (
            <p className="text-xs text-zinc-400 italic py-1">No archived habits.</p>
          ) : (
            <div className="space-y-2">
              {archived.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 py-2.5 px-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-sm)]"
                >
                  <span className={`text-sm flex-shrink-0 ${categoryColor(h.category)}`}>
                    {categoryIcon(h.category)}
                  </span>
                  <span className="text-[13px] text-zinc-200 font-medium flex-1 truncate">
                    {h.name}
                  </span>
                  {h.archivedAt && (
                    <span className="text-[11px] text-zinc-400 flex-shrink-0 font-mono">
                      {h.archivedAt}
                    </span>
                  )}
                  <button
                    onClick={() => restoreHabit(h.id)}
                    title="Restore habit"
                    className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-85 flex-shrink-0"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    <RotateCcw size={12} />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Permanently delete "${h.name}"? Historical data is preserved.`)) {
                        deleteHabit(h.id);
                      }
                    }}
                    title="Delete permanently"
                    className="text-zinc-400 hover:text-rose-400 transition-colors flex-shrink-0 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Data Management ── */}
        <section className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-2xl p-6 mb-5 shadow-sm card-hover">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            Data &amp; Backup
          </h2>
          <p className="text-xs text-zinc-400 mb-4">
            Export your entire habit record as JSON or restore from an existing backup file.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--border-lg)] text-xs font-medium text-zinc-300 hover:text-white hover:bg-[var(--bg-hover-sm)] active:scale-[0.97] transition-all duration-150 ease-out"
            >
              <Download size={13} />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--border-lg)] text-xs font-medium text-zinc-300 hover:text-white hover:bg-[var(--bg-hover-sm)] active:scale-[0.97] transition-all duration-150 ease-out"
            >
              <Upload size={13} />
              <span>Import JSON</span>
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
          {importStatus === 'ok' && (
            <p className="text-emerald-400 text-xs mt-3 flex items-center gap-1.5 font-medium">
              ✓ Data imported successfully.
            </p>
          )}
          {importStatus === 'fail' && (
            <p className="text-rose-400 text-xs mt-3 flex items-center gap-1.5 font-medium">
              ✕ Invalid JSON file. Import failed.
            </p>
          )}
        </section>

        {/* ── Danger Zone ── */}
        <section className="bg-[var(--bg-card)] border border-rose-500/20 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-2">
            <AlertTriangle size={13} />
            <span>Danger Zone</span>
          </h2>
          <p className="text-xs text-zinc-400 mb-4">
            Irreversible actions that clear all habits, check-ins, and streak records.
          </p>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-3.5 py-2 rounded-lg border border-rose-500/30 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              Reset All Data
            </button>
          ) : (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-zinc-300">
                Are you sure? This will <strong className="text-white">permanently delete</strong> all habits and records.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { resetData(); setConfirmReset(false); }}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all shadow-sm"
                >
                  Yes, delete everything
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3.5 py-2 rounded-lg border border-[var(--border-lg)] text-zinc-400 hover:text-white text-xs font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
