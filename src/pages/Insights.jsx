import React, { useMemo } from 'react';
import {
  format, startOfDay, parseISO, eachDayOfInterval,
  subDays, getDay, getMonth,
} from 'date-fns';
import useHabitStore, {
  getHabitsActiveOnDate,
  getDayConsistency,
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateTotalCompletions,
} from '../store/useHabitStore';
import { categoryIcon, categoryColor } from '../utils/categories';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Insights() {
  const { habits, completions } = useHabitStore();

  const currentStreak  = calculateCurrentStreak(habits, completions);
  const longestStreak  = calculateLongestStreak(habits, completions);
  const totalCompleted = calculateTotalCompletions(completions);

  // ── Yearly heatmap ───────────────────────────────────────────────────────────
  const heatDays = useMemo(() => {
    const today = startOfDay(new Date());
    const heatStart = subDays(today, 364);
    return eachDayOfInterval({ start: heatStart, end: today });
  }, []);

  const heatData = useMemo(() => {
    return heatDays.map((date) => {
      const ds     = format(date, 'yyyy-MM-dd');
      const active = getHabitsActiveOnDate(habits, ds);
      if (active.length === 0) return { ds, pct: 0, done: 0, total: 0 };
      const done = active.filter((h) => completions[h.id]?.[ds] === true).length;
      return { ds, pct: Math.round((done / active.length) * 100), done, total: active.length };
    });
  }, [heatDays, habits, completions]);

  // Group into week columns (Sun-first for heatmap visual)
  const heatWeeks = useMemo(() => {
    const weeks = [];
    const startDow = getDay(heatDays[0]); // 0=Sun
    let week = Array(startDow).fill(null);
    for (const d of heatData) {
      week.push(d);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
    return weeks;
  }, [heatDays, heatData]);

  // Month labels for heatmap
  const monthLabels = useMemo(() => {
    const labels = [];
    let last = -1;
    heatWeeks.forEach((wk, wi) => {
      const first = wk.find(Boolean);
      if (first) {
        const m = getMonth(parseISO(first.ds));
        if (m !== last) {
          labels.push({ wi, label: MONTH_ABBR[m] });
          last = m;
        }
      }
    });
    return labels;
  }, [heatWeeks]);

  // ── 30-day bar chart ─────────────────────────────────────────────────────────
  const last30 = useMemo(() => {
    const today = startOfDay(new Date());
    return eachDayOfInterval({ start: subDays(today, 29), end: today }).map((date) => {
      const ds  = format(date, 'yyyy-MM-dd');
      const pct = getDayConsistency(habits, completions, ds);
      return { ds, pct, label: format(date, 'MMM d') };
    });
  }, [habits, completions]);

  // ── Habit leaderboard ────────────────────────────────────────────────────────
  const habitStats = useMemo(() => {
    return habits
      .filter((h) => h.status !== 'deleted' || Object.values(completions[h.id] || {}).some(Boolean))
      .map((h) => ({
        ...h,
        done: Object.values(completions[h.id] || {}).filter((v) => v === true).length,
      }))
      .sort((a, b) => b.done - a.done);
  }, [habits, completions]);

  // ── Category breakdown ───────────────────────────────────────────────────────
  const catStats = useMemo(() => {
    const acc = {};
    for (const h of habits) {
      const done = Object.values(completions[h.id] || {}).filter((v) => v === true).length;
      acc[h.category] = (acc[h.category] || 0) + done;
    }
    const total = Object.values(acc).reduce((s, n) => s + n, 0) || 1;
    return Object.entries(acc)
      .map(([cat, count]) => ({ cat, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [habits, completions]);

  // Heatmap colour — uses CSS variables so it dynamically adapts to any accent and theme
  function heatColor(pct) {
    if (pct === 0)  return 'var(--bg-surface)';
    if (pct < 34)   return 'var(--accent-heat-1)';
    if (pct < 67)   return 'var(--accent-heat-2)';
    if (pct < 100)  return 'var(--accent-heat-3)';
    return 'var(--accent-heat-4)';
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-zinc-100">
      <div className="max-w-[1240px] mx-auto px-8 py-8">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Insights</h1>
          <p className="text-xs text-zinc-400 mt-1 font-normal">
            Your habit consistency and completion metrics over time
          </p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-3 gap-3.5 mb-7">
          {[
            { label: 'Current Streak',    value: `${currentStreak}d` },
            { label: 'Longest Streak',    value: `${longestStreak}d` },
            { label: 'Total Completions', value: totalCompleted },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-xl px-5 py-4"
            >
              <div className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider mb-1.5">
                {label}
              </div>
              <div className="text-2xl font-semibold text-zinc-100 tracking-tight tabular-nums">
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Heatmap Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Activity History — Past 365 Days
            </h2>
            {/* Heatmap Legend */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span>Less</span>
              {[
                'var(--bg-surface)',
                'var(--accent-heat-1)', 'var(--accent-heat-2)', 'var(--accent-heat-3)', 'var(--accent-heat-4)',
              ].map((c, i) => (
                <div key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: c }} />
              ))}
              <span>More</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div style={{ minWidth: `${heatWeeks.length * 15}px` }}>
              {/* Month Labels */}
              <div className="flex mb-2 relative" style={{ height: 14 }}>
                {monthLabels.map(({ wi, label }) => (
                  <span
                    key={wi + label}
                    className="absolute text-[10px] text-zinc-400 font-medium"
                    style={{ left: `${wi * 15}px` }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Day Grid: 7 rows × N weeks */}
              <div className="flex gap-[3px]">
                {heatWeeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((d, di) =>
                      d ? (
                        <div
                          key={di}
                          className="w-[12px] h-[12px] rounded-[2px] cursor-default transition-transform hover:scale-125"
                          style={{ backgroundColor: heatColor(d.pct) }}
                          title={`${d.ds}: ${d.pct}% consistency (${d.done}/${d.total} habits)`}
                        />
                      ) : (
                        <div key={di} className="w-[12px] h-[12px]" />
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 30-Day Consistency Chart */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
            Daily Consistency — Last 30 Days
          </h2>

          {habits.length === 0 ? (
            <p className="text-zinc-500 text-xs py-4">No active habit data yet.</p>
          ) : (
            <>
              <div className="flex items-end gap-[4px] h-28 pt-2">
                {last30.map(({ ds, pct, label }) => (
                  <div key={ds} className="group flex-1 flex flex-col items-center justify-end h-full relative">
                    <div
                      className="w-full rounded-t-sm transition-all duration-200 group-hover:brightness-125"
                      style={{
                        height: `${Math.max(pct > 0 ? 6 : 0, pct)}%`,
                        backgroundColor: pct > 0 ? 'var(--accent-primary)' : 'var(--bg-surface)',
                        opacity: pct > 0 ? 1 : 0.6,
                      }}
                    />
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-[var(--bg-tooltip)] border border-[var(--border-xl)] rounded-md px-2 py-1 text-[10px] text-zinc-200 shadow-md whitespace-nowrap">
                        {label}: {pct}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[11px] text-zinc-400">
                <span>{last30[0]?.label}</span>
                <span>Today</span>
              </div>
            </>
          )}
        </div>

        {/* Category Breakdown & Habit Leaderboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* By Category */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              By Category
            </h2>
            {catStats.length === 0 ? (
              <p className="text-zinc-500 text-xs py-2">No category completions yet.</p>
            ) : (
              <div className="space-y-4">
                {catStats.map(({ cat, count, pct }) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs flex items-center gap-1.5 font-medium ${categoryColor(cat)}`}>
                        <span>{categoryIcon(cat)}</span>
                        <span className="text-zinc-300">{cat}</span>
                      </span>
                      <span className="text-xs text-zinc-400 tabular-nums">
                        {count} <span className="text-zinc-600 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-canvas)] rounded-full overflow-hidden border border-[var(--border-xs)]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: 'var(--accent-primary)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Habit Leaderboard */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Habit Leaderboard
            </h2>
            {habitStats.length === 0 ? (
              <p className="text-zinc-500 text-xs py-2">No habits recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {habitStats.slice(0, 8).map((h, i) => (
                  <div key={h.id} className="flex items-center gap-3 py-1">
                    <span className="text-xs text-zinc-400 font-mono w-4 text-right tabular-nums">
                      {i + 1}
                    </span>
                    <span className={`text-sm leading-none flex-shrink-0 ${categoryColor(h.category)}`}>
                      {categoryIcon(h.category)}
                    </span>
                    <span className="text-[13px] text-zinc-200 font-medium flex-1 truncate">
                      {h.name}
                    </span>
                    {h.status !== 'active' && (
                      <span className="text-[10px] text-zinc-400 border border-[var(--border-md)] rounded px-1.5 py-0.5">
                        {h.status}
                      </span>
                    )}
                    <span className="text-xs tabular-nums text-zinc-400 font-medium">
                      {h.done} <span className="text-zinc-600 font-normal">done</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
