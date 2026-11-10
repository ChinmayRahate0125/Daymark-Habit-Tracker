import React, { useState } from 'react';
import {
  Check,
  Trophy,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import useHabitStore from '../store/useHabitStore';
import { getTodayStr } from '../utils/challengeRules';

export default function ChallengeCard({ challenge, onCelebrate }) {
  const { checkInChallenge, deleteChallenge } = useHabitStore();
  const [showHistory, setShowHistory] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const today = getTodayStr();
  const isCompleted = challenge.status === 'completed';
  const isStarted = today >= (challenge.currentAttemptStartDate || challenge.startDate);
  const isTodayConfirmed = (challenge.successfulDates || []).includes(today);

  const duration = challenge.duration || 30;
  const currentStreak = challenge.currentStreak || 0;
  const bestStreak = challenge.bestStreak || 0;
  const progressPercent = Math.min(100, Math.round((currentStreak / duration) * 100));

  const attemptHistory = challenge.attemptHistory || [];
  const attemptCount = attemptHistory.length + (isCompleted ? 0 : 1);

  const handleCheckIn = () => {
    if (isCompleted || isTodayConfirmed || !isStarted) return;

    setIsAnimating(true);
    checkInChallenge(challenge.id);

    if (currentStreak + 1 >= duration) {
      if (onCelebrate) {
        onCelebrate(challenge.name, duration);
      }
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 350);
  };

  const handleDelete = () => {
    if (window.confirm(`Permanently remove the challenge "${challenge.name}"?`)) {
      deleteChallenge(challenge.id);
    }
  };

  // Determine grid column structure so circles space evenly across card width without clustering
  const getGridColsClass = (dur) => {
    if (dur <= 7) return 'grid-cols-7 gap-y-2.5 gap-x-1.5';
    if (dur <= 14) return 'grid-cols-7 sm:grid-cols-14 gap-y-2.5 gap-x-1.5';
    if (dur <= 30) return 'grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-y-2.5 gap-x-1';
    if (dur <= 60) return 'grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-y-2 gap-x-1';
    return 'grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-y-2 gap-x-1';
  };

  // Build the day items array (1 to duration)
  const days = Array.from({ length: duration }, (_, idx) => {
    const dayNum = idx + 1;
    let state = 'upcoming'; // 'completed' | 'today' | 'upcoming'

    if (isCompleted || dayNum <= currentStreak) {
      state = 'completed';
    } else if (dayNum === currentStreak + 1 && isStarted && !isTodayConfirmed) {
      state = 'today';
    }

    return { dayNum, state };
  });

  return (
    <div
      className={`bg-[var(--bg-card)] border rounded-xl p-5 transition-all duration-200 card-hover shadow-xs ${
        isCompleted
          ? 'border-[var(--accent-subtle-border)] bg-[var(--bg-elevated)]'
          : 'border-[var(--border-md)]'
      }`}
    >
      {/* ── 1. Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Challenge name as primary element */}
          <h3 className="text-base font-semibold text-white tracking-tight truncate">
            {challenge.name}
          </h3>

          {/* Duration as small secondary label */}
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-zinc-400 border border-[var(--border-xs)]">
            {duration} days
          </span>

          {/* Status displayed subtly */}
          {isCompleted ? (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-subtle)] border border-[var(--accent-subtle-border)] text-[var(--accent-text)] flex items-center gap-1">
              <Check size={10} strokeWidth={3} /> Completed
            </span>
          ) : (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Active
            </span>
          )}

          {/* Attempt counter (if restarted) */}
          {attemptCount > 1 && !isCompleted && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
              Attempt #{attemptCount}
            </span>
          )}
        </div>

        {/* Delete action discreetly positioned on right */}
        <button
          onClick={handleDelete}
          title="Delete challenge"
          className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-[var(--bg-hover-sm)] transition-colors opacity-40 hover:opacity-100 flex-shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Description if present */}
      {challenge.description && (
        <p className="text-xs text-zinc-400 mb-3 line-clamp-1 italic">
          "{challenge.description}"
        </p>
      )}

      {/* ── 2. Progress ───────────────────────────────────────── */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1.5">
          {/* Prominent consecutive progress */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {currentStreak}
            </span>
            <span className="text-xs font-mono text-zinc-400">/ {duration} days</span>
            <span className="text-xs font-mono text-zinc-500 ml-1">
              ({progressPercent}%)
            </span>
          </div>

          {/* Best attempt secondary */}
          <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
            <Trophy size={11} className="text-amber-400" />
            <span>Best:</span>
            <strong className="text-zinc-200 font-medium">
              {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
            </strong>
          </div>
        </div>

        {/* Thin progress bar using selected Daymark accent */}
        <div className="w-full h-1 bg-[var(--bg-canvas)] rounded-full overflow-hidden border border-[var(--border-xs)]">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: 'var(--accent-primary)',
            }}
          />
        </div>
      </div>

      {/* ── 3. Commitment Calendar ────────────────────────────── */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
          <span className="font-semibold text-zinc-300">Your Commitment Journey</span>
          <span className="text-[11px] text-zinc-500">
            {isCompleted
              ? 'All days completed'
              : isTodayConfirmed
              ? 'Today confirmed'
              : !isStarted
              ? `Starts ${challenge.startDate}`
              : `Day ${currentStreak + 1} pending`}
          </span>
        </div>

        {/* Circular Commitment Grid */}
        <div className={`grid ${getGridColsClass(duration)} w-full`}>
          {days.map(({ dayNum, state }) => {
            if (state === 'completed') {
              return (
                <div key={dayNum} className="flex items-center justify-center">
                  <div
                    title={`Day ${dayNum}: Completed`}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-[var(--accent-primary)] text-white shadow-xs select-none transition-all duration-150 hover:scale-110 hover:brightness-110 ${
                      isAnimating && dayNum === currentStreak ? 'complete-pop' : ''
                    }`}
                  >
                    <Check size={12} strokeWidth={2.8} className="text-white" />
                  </div>
                </div>
              );
            }

            if (state === 'today') {
              return (
                <div key={dayNum} className="flex items-center justify-center">
                  <div
                    title={`Day ${dayNum}: Today (Pending confirmation)`}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-mono border-2 border-[var(--accent-primary)] bg-[var(--accent-subtle)] text-[var(--accent-text)] font-semibold select-none transition-all duration-150 shadow-xs shadow-[var(--accent-glow)] hover:scale-110 hover:border-[var(--accent-hover)]"
                  >
                    {dayNum}
                  </div>
                </div>
              );
            }

            if (state === 'missed') {
              return (
                <div key={dayNum} className="flex items-center justify-center">
                  <div
                    title={`Day ${dayNum}: Missed`}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-mono border border-rose-500/35 bg-rose-500/10 text-rose-400 select-none transition-all duration-150 hover:scale-105"
                  >
                    {dayNum}
                  </div>
                </div>
              );
            }

            // upcoming / muted
            return (
              <div key={dayNum} className="flex items-center justify-center">
                <div
                  title={`Day ${dayNum}: Upcoming`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-mono border border-[var(--border-xs)] bg-[var(--bg-canvas)] text-zinc-500 dark:text-zinc-400 opacity-60 select-none transition-all duration-150 hover:opacity-100 hover:scale-105"
                >
                  {dayNum}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Footer ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-xs)] flex-wrap">
        {/* Left: Start Date & Attempt History */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-500 font-mono">
            Started {challenge.currentAttemptStartDate || challenge.startDate}
          </span>
          {attemptHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors py-0.5 font-mono"
            >
              <span>{attemptHistory.length} previous {attemptHistory.length === 1 ? 'attempt' : 'attempts'}</span>
              {showHistory ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          )}
        </div>

        {/* Right: Confirmation Status & Integrated Daily Action */}
        <div>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-text)] font-mono">
              <Check size={12} strokeWidth={2.5} />
              <span>Completed on {challenge.completedAt}</span>
            </span>
          ) : !isStarted ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <Clock size={12} />
              <span>Starts {challenge.startDate}</span>
            </span>
          ) : isTodayConfirmed ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--accent-subtle)] border border-[var(--accent-subtle-border)] text-[var(--accent-text)] text-xs font-medium">
              <Check size={12} strokeWidth={2.5} />
              <span>Completed for Today</span>
            </div>
          ) : (
            <button
              onClick={handleCheckIn}
              className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-xs transition-all active:scale-[0.97]"
            >
              <Check size={13} strokeWidth={2.5} />
              <span>Mark Today Successful</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Expandable Attempt History ──────────────────────────── */}
      {showHistory && attemptHistory.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-[var(--border-xs)] space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Past Attempts
          </p>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {attemptHistory.map((att, idx) => (
              <div
                key={att.id || idx}
                className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-xs)]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-400">#{att.attemptNumber || idx + 1}</span>
                  <span className="text-zinc-300">
                    {att.status === 'completed' ? (
                      <span className="text-emerald-400 font-medium">Completed</span>
                    ) : (
                      <span className="text-zinc-400">Failed on {att.failedDate}</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-zinc-500">Streak:</span>
                  <span className="text-white font-medium">
                    {att.streakAchieved} {att.streakAchieved === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
