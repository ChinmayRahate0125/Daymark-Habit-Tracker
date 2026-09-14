import React, { useMemo } from 'react';
import useHabitStore, {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateTotalCompletions,
} from '../store/useHabitStore';
import { Lock } from 'lucide-react';

const BADGES = [
  {
    id: 'first_habit',
    emoji: '🌱',
    name: 'First Step',
    desc: 'Added your first habit',
    check: (ctx) => ctx.totalHabits >= 1,
  },
  {
    id: 'streak_3',
    emoji: '🔥',
    name: '3-Day Streak',
    desc: 'Achieved a 3-day streak',
    check: (ctx) => ctx.best >= 3,
  },
  {
    id: 'streak_7',
    emoji: '🏅',
    name: 'One Week',
    desc: 'Achieved a 7-day streak',
    check: (ctx) => ctx.best >= 7,
  },
  {
    id: 'streak_14',
    emoji: '⚡',
    name: 'Two Weeks',
    desc: 'Achieved a 14-day streak',
    check: (ctx) => ctx.best >= 14,
  },
  {
    id: 'streak_30',
    emoji: '💎',
    name: 'One Month',
    desc: 'Achieved a 30-day streak',
    check: (ctx) => ctx.best >= 30,
  },
  {
    id: 'streak_100',
    emoji: '👑',
    name: 'Century',
    desc: 'Achieved a 100-day streak',
    check: (ctx) => ctx.best >= 100,
  },
  {
    id: 'done_10',
    emoji: '✅',
    name: '10 Check-ins',
    desc: 'Completed 10 habit check-ins',
    check: (ctx) => ctx.totalDone >= 10,
  },
  {
    id: 'done_50',
    emoji: '🎯',
    name: '50 Check-ins',
    desc: 'Completed 50 habit check-ins',
    check: (ctx) => ctx.totalDone >= 50,
  },
  {
    id: 'done_100',
    emoji: '💯',
    name: '100 Check-ins',
    desc: 'Completed 100 habit check-ins',
    check: (ctx) => ctx.totalDone >= 100,
  },
  {
    id: 'done_500',
    emoji: '🚀',
    name: '500 Check-ins',
    desc: 'Completed 500 habit check-ins',
    check: (ctx) => ctx.totalDone >= 500,
  },
  {
    id: 'multi_3',
    emoji: '🌐',
    name: 'Diversified',
    desc: 'Tracking 3 or more habits at once',
    check: (ctx) => ctx.activeHabits >= 3,
  },
  {
    id: 'all_categories',
    emoji: '🎨',
    name: 'All Rounder',
    desc: 'Used all 4 habit categories',
    check: (ctx) => ctx.categories >= 4,
  },
];

export default function Badges() {
  const { habits, completions } = useHabitStore();

  const ctx = useMemo(() => ({
    totalHabits:  habits.filter((h) => h.status !== 'deleted').length,
    activeHabits: habits.filter((h) => h.status === 'active').length,
    best: Math.max(
      calculateCurrentStreak(habits, completions),
      calculateLongestStreak(habits, completions)
    ),
    totalDone:  calculateTotalCompletions(completions),
    categories: new Set(habits.map((h) => h.category)).size,
  }), [habits, completions]);

  const badges = useMemo(() =>
    BADGES.map((b) => ({ ...b, unlocked: b.check(ctx) })),
    [ctx]
  );

  const unlocked = badges.filter((b) => b.unlocked);
  const locked   = badges.filter((b) => !b.unlocked);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-zinc-100">
      <div className="max-w-[1240px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Badges</h1>
          <p className="text-xs text-zinc-400 mt-1 font-normal">
            {unlocked.length} of {badges.length} achievements earned
          </p>
        </div>

        {/* Earned Badges */}
        {unlocked.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3.5">
              Earned ({unlocked.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {unlocked.map((b) => (
                <BadgeCard key={b.id} badge={b} />
              ))}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {locked.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3.5">
              Locked ({locked.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {locked.map((b) => (
                <BadgeCard key={b.id} badge={b} locked />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BadgeCard({ badge, locked }) {
  return (
    <div
      className={`rounded-xl p-4 flex flex-col justify-between transition-all duration-200 ease-out border ${
        locked
          ? 'bg-[var(--bg-surface)] border-[var(--border-sm)] opacity-40 grayscale hover:opacity-65'
          : 'bg-[var(--bg-card)] border-[var(--border-md)] card-hover'
      }`}
    >
      <div>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-3 ${
            locked
              ? 'bg-[var(--bg-hover-sm)] border border-[var(--border-sm)]'
              : 'bg-[var(--accent-subtle)] border border-[var(--accent-subtle-border)]'
          }`}
        >
          {badge.emoji}
        </div>
        <div className="text-[13px] font-semibold text-zinc-100 mb-1">
          {badge.name}
        </div>
        <div className="text-xs text-zinc-400 leading-snug">
          {badge.desc}
        </div>
      </div>

      <div className="mt-3.5 pt-2 border-t border-[var(--border-xs)] flex items-center">
        {!locked ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--accent-text)' }}>
            <svg width="8" height="8" viewBox="0 0 9 9" fill="none" aria-hidden>
              <path
                d="M1.5 4.5L3.5 6.5L7.5 2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Earned
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Lock size={10} /> Locked
          </span>
        )}
      </div>
    </div>
  );
}
