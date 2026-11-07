import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Target, CheckCircle2, Trophy, X } from 'lucide-react';
import useHabitStore from '../store/useHabitStore';
import ChallengeCard from '../components/ChallengeCard';
import AddChallengeModal from '../components/AddChallengeModal';
import { CHALLENGE_SUGGESTIONS } from '../utils/challengeRules';

export default function Challenges() {
  const { challenges, evaluateChallenges, addChallenge } = useHabitStore();
  const [showModal, setShowModal] = useState(false);
  const [celebration, setCelebration] = useState(null); // { name, duration }

  // Evaluate challenges on mount and when window regains focus
  useEffect(() => {
    evaluateChallenges();

    const handleFocus = () => evaluateChallenges();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [evaluateChallenges]);

  const activeChallenges = useMemo(
    () => (challenges || []).filter((c) => c.status === 'active'),
    [challenges]
  );
  const completedChallenges = useMemo(
    () => (challenges || []).filter((c) => c.status === 'completed'),
    [challenges]
  );

  // Statistics for compact summary row
  const activeCount = activeChallenges.length;
  const completedCount = completedChallenges.length;
  const allTimeBestStreak = (challenges || []).length > 0
    ? Math.max(...(challenges || []).map((c) => c.bestStreak || 0))
    : 0;

  const handleCelebrate = (name, duration) => {
    setCelebration({ name, duration });
  };

  const handleQuickAdd = (suggestion) => {
    const exists = activeChallenges.some(
      (c) => c.name.toLowerCase() === suggestion.name.toLowerCase()
    );
    if (exists) {
      alert(`An active challenge for "${suggestion.name}" already exists.`);
      return;
    }
    addChallenge({
      name: suggestion.name,
      duration: suggestion.duration,
      description: suggestion.description,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-zinc-100">
      <div className="max-w-4xl mx-auto px-8 py-8">

        {/* ── 1. Heading & Add Challenge Button ─────────────────────── */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Challenges</h1>
            <p className="text-xs text-zinc-400 mt-0.5 font-normal">
              Commit to something. Stay consistent.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Add Challenge</span>
          </button>
        </div>

        {/* ── 2. Compact Summary Row ───────────────────────────────── */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono mb-8 pt-0.5">
          <span>
            <strong className="text-zinc-200 font-medium">{activeCount}</strong> active
          </span>
          <span className="text-zinc-600 select-none">·</span>
          <span>
            <strong className="text-zinc-200 font-medium">{completedCount}</strong> completed
          </span>
          <span className="text-zinc-600 select-none">·</span>
          <span>
            Best streak: <strong className="text-zinc-200 font-medium">{allTimeBestStreak}d</strong>
          </span>
        </div>

        {/* ── Celebration Toast ─────────────────────────────────────── */}
        {celebration && (
          <div className="mb-6 p-3.5 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-subtle-border)] flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2 duration-250">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Trophy size={16} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">
                  Commitment Fulfilled: {celebration.name}
                </h4>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  Completed all {celebration.duration} consecutive days. Remarkable discipline.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCelebration(null)}
              className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ── 3. Active Challenges Section ──────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Active Challenges ({activeCount})
            </h2>
          </div>

          {activeChallenges.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-xl p-8 text-center">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-sm)] flex items-center justify-center mx-auto mb-3 text-zinc-400">
                <Target size={18} style={{ color: 'var(--accent-text)' }} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">No Active Challenges</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-5">
                Challenges require uninterrupted daily commitment. One missed day resets your attempt.
              </p>

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg mx-auto mb-5">
                {CHALLENGE_SUGGESTIONS.slice(0, 4).map((sug) => (
                  <button
                    key={sug.name}
                    onClick={() => handleQuickAdd(sug)}
                    className="text-xs px-2.5 py-1 rounded-md border border-[var(--border-md)] bg-[var(--bg-elevated)] hover:border-[var(--accent-subtle-border)] text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <span>{sug.name}</span>
                    <span className="text-zinc-500 font-mono text-[10px]">({sug.duration}d)</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shadow-sm"
              >
                <Plus size={13} />
                <span>Create Custom Challenge</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onCelebrate={handleCelebrate}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── 4. Completed Challenges Section ───────────────────────── */}
        {completedChallenges.length > 0 && (
          <section className="mb-10 pt-6 border-t border-[var(--border-xs)]">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Completed Challenges ({completedCount})</span>
              </h2>
            </div>

            <div className="space-y-4">
              {completedChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── Modal ──────────────────────────────────────────────── */}
      {showModal && <AddChallengeModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
