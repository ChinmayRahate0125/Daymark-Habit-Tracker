import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import useHabitStore from '../store/useHabitStore';
import { getTodayStr, DURATION_OPTIONS, CHALLENGE_SUGGESTIONS } from '../utils/challengeRules';

export default function AddChallengeModal({ onClose }) {
  const { challenges, addChallenge } = useHabitStore();
  const today = getTodayStr();

  const [name, setName] = useState('');
  const [duration, setDuration] = useState(30);
  const [startDate, setStartDate] = useState(today);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter a challenge name.');
      return;
    }

    // Check for duplicate active challenge with the same name (case-insensitive)
    const isDuplicate = (challenges || []).some(
      (c) => c.status === 'active' && c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setError('An active challenge with this name already exists.');
      return;
    }

    if (![7, 14, 30, 60, 90].includes(Number(duration))) {
      setError('Please select a valid duration.');
      return;
    }

    if (!startDate) {
      setError('Please select a start date.');
      return;
    }

    addChallenge({
      name: trimmedName,
      duration: Number(duration),
      startDate,
      description: description.trim(),
    });

    onClose();
  };

  const handleSelectSuggestion = (suggestion) => {
    setName(suggestion.name);
    setDuration(suggestion.duration);
    setDescription(suggestion.description);
    setError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-elevated)] border border-[var(--border-lg)] rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/80 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold text-base tracking-tight">New Challenge</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Commit to a daily streak of discipline.</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white rounded-md p-1 hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </div>

        {/* Suggestions */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-2">
            <Sparkles size={12} className="text-[var(--accent-text)]" />
            <span>Popular Commitments</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CHALLENGE_SUGGESTIONS.map((sug) => (
              <button
                key={sug.name}
                type="button"
                onClick={() => handleSelectSuggestion(sug)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-all text-left ${
                  name === sug.name
                    ? 'border-[var(--accent-subtle-border)] bg-[var(--accent-subtle)] text-[var(--accent-text)] font-medium'
                    : 'border-[var(--border-md)] bg-[var(--bg-canvas)] text-zinc-400 hover:text-zinc-200 hover:border-[var(--border-xl)]'
                }`}
              >
                {sug.name} · {sug.duration}d
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Challenge Name */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
              Challenge Name <span className="text-rose-400">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. No Sugar, No Social Media"
              className="w-full bg-[var(--bg-canvas)] border border-[var(--border-lg)] rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-glow)] transition-all"
            />
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs text-zinc-400 mb-2 font-medium">
              Duration <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {DURATION_OPTIONS.map(({ days, sub }) => {
                const isSelected = Number(duration) === days;
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDuration(days)}
                    className={`py-2 px-1 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)] text-[var(--accent-text)] font-semibold shadow-sm'
                        : 'border-[var(--border-md)] bg-[var(--bg-canvas)] text-zinc-400 hover:border-[var(--border-xl)] hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs">{days}d</div>
                    <div className="text-[10px] opacity-70 tracking-tight">{sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
              Start Date <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-lg)] rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-glow)] transition-all scheme-dark"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Default is today. Must stay consecutive from day 1.</p>
          </div>

          {/* Description / Reason */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
              Personal Reason / Intention <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why are you taking on this challenge? e.g. To regain mental focus and sleep better."
              className="w-full bg-[var(--bg-canvas)] border border-[var(--border-lg)] rounded-lg px-3.5 py-2 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-glow)] transition-all resize-none"
            />
          </div>

          {error && <p className="text-rose-400 text-xs font-medium">{error}</p>}

          {/* Action buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-[var(--border-lg)] text-sm text-zinc-400 hover:text-zinc-200 hover:bg-[var(--bg-hover-sm)] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg btn-primary text-white text-sm font-medium shadow-sm"
            >
              Start Challenge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
