import React, { useState, useRef, useEffect } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, isToday, parseISO, startOfDay,
  isSameMonth,
} from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Archive, Trash2 } from 'lucide-react';
import useHabitStore, {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateOverallConsistency,
  calculateTotalCompletions,
} from '../store/useHabitStore';
import AddHabitModal from '../components/AddHabitModal';
import { categoryIcon, categoryColor } from '../utils/categories';
import { BrandMark } from '../components/BrandLogo';

// Monday-first day index (0=Mon … 6=Sun)
function mondayIndex(date) {
  const d = getDay(date);
  return d === 0 ? 6 : d - 1;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TODAY = startOfDay(new Date());

export default function Dashboard() {
  const { habits, completions, toggleCompletion, archiveHabit, deleteHabit } = useHabitStore();
  const [viewMonth, setViewMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  // Track which cell just popped for the completion animation
  const [popKey, setPopKey] = useState(null);
  const menuRef = useRef(null);

  // Close context menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const activeHabits = habits.filter((h) => h.status === 'active');

  // Stats
  const currentStreak = calculateCurrentStreak(habits, completions);
  const longestStreak = calculateLongestStreak(habits, completions);
  const consistency   = calculateOverallConsistency(habits, completions);
  const totalDone     = calculateTotalCompletions(completions);

  // Calendar grid
  const monthStart = startOfMonth(viewMonth);
  const monthEnd   = endOfMonth(viewMonth);
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const padStart   = mondayIndex(monthStart);
  const cells      = [...Array(padStart).fill(null), ...days];
  const trailPad   = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < trailPad; i++) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const isDone = (habitId, date) =>
    date && completions[habitId]?.[format(date, 'yyyy-MM-dd')] === true;

  const handleToggle = (habitId, date) => {
    if (!date) return;
    const cellDay = startOfDay(date);
    if (cellDay > TODAY) return;
    const key = `${habitId}-${format(date, 'yyyy-MM-dd')}`;
    toggleCompletion(habitId, format(date, 'yyyy-MM-dd'));
    // Trigger pop only when marking complete
    if (!isDone(habitId, date)) {
      setPopKey(key);
      setTimeout(() => setPopKey(null), 260);
    }
  };

  const canGoForward = !isSameMonth(viewMonth, new Date());
  const openAdd    = () => { setEditHabit(null); setShowModal(true); };
  const openEdit   = (h) => { setEditHabit(h); setShowModal(true); setMenuOpen(null); };
  const closeModal = () => { setShowModal(false); setEditHabit(null); };

  const handleArchive = (id) => { archiveHabit(id); setMenuOpen(null); };
  const handleDelete  = (id) => {
    if (window.confirm('Delete habit? All historical data is preserved.')) {
      deleteHabit(id);
      setMenuOpen(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-zinc-100">
      <div className="max-w-[1240px] mx-auto px-8 py-10">

        {/* ── Page Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-9">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-white leading-none">
              Dashboard
            </h1>
            <p className="text-[13px] text-zinc-500 mt-2 font-normal">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 btn-primary text-white text-[13px] font-medium px-4 py-2 rounded-lg shadow-sm"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add Habit</span>
          </button>
        </div>

        {/* ── Metric Cards ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Current Streak',  value: currentStreak, unit: currentStreak === 1 ? 'day'  : 'days'        },
            { label: 'Longest Streak',  value: longestStreak, unit: longestStreak  === 1 ? 'day'  : 'days'        },
            { label: 'Consistency',     value: `${consistency}%`, unit: 'all time'                                },
            { label: 'Total Completed', value: totalDone,     unit: totalDone      === 1 ? 'check-in' : 'check-ins' },
          ].map(({ label, value, unit }) => (
            <div
              key={label}
              className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-xl px-5 py-5"
            >
              <div className="text-[10.5px] text-zinc-500 font-medium uppercase tracking-widest mb-2">
                {label}
              </div>
              <div className="text-[26px] font-semibold text-zinc-100 tracking-[-0.03em] leading-none tabular-nums">
                {value}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1.5 font-normal">
                {unit}
              </div>
            </div>
          ))}
        </div>

        {/* ── Monthly Habit Calendar ────────────────────────────────────────────── */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-2xl overflow-hidden">

          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-sm)]">
            {/* Month title — left-aligned, acts as the section heading */}
            <span className="text-[15px] font-semibold text-zinc-100 tracking-[-0.01em] leading-none">
              {format(viewMonth, 'MMMM yyyy')}
            </span>

            {/* Navigation arrows — right */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setViewMonth((m) => subMonths(m, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)] transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              <button
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                disabled={!canGoForward}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                  canGoForward
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[var(--bg-hover)] active:bg-[var(--bg-active)]'
                    : 'text-zinc-700 cursor-not-allowed'
                }`}
                aria-label="Next month"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* ── Empty State ── */}
          {activeHabits.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="mb-5 opacity-30">
                <BrandMark size="xl" />
              </div>
              <p className="text-[14px] font-medium text-zinc-300 mb-1.5 tracking-tight">
                No habits yet
              </p>
              <p className="text-[12.5px] text-zinc-500 mb-6 max-w-[220px] leading-relaxed">
                Add your first habit to start building a daily streak.
              </p>
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-75"
                style={{ color: 'var(--accent-text)' }}
              >
                <Plus size={14} strokeWidth={2.5} />
                Add your first habit
              </button>
            </div>
          )}


          {/* ── Calendar Grid ── */}
          {activeHabits.length > 0 && (
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse"
                style={{ tableLayout: 'fixed' }}
              >
                <colgroup>
                  {/* Habit name column */}
                  <col style={{ width: '236px', minWidth: '200px' }} />
                  {/* Day columns per week */}
                  {weeks.map((_, wi) => (
                    <React.Fragment key={wi}>
                      {[0,1,2,3,4,5,6].map((d) => (
                        <col key={d} style={{ width: '34px' }} />
                      ))}
                      {/* Subtle inter-week gap — no visible line */}
                      {wi < weeks.length - 1 && <col style={{ width: '10px' }} />}
                    </React.Fragment>
                  ))}
                </colgroup>

                <thead>
                  <tr>
                    <th className="px-5 pt-5 pb-3.5 text-left" />
                    {weeks.map((week, wi) => (
                      <React.Fragment key={wi}>
                        {week.map((cell, di) => {
                          const isT = cell && isToday(cell);
                          return (
                            <th
                              key={di}
                              className="pt-5 pb-3.5 text-center font-normal"
                            >
                              {cell ? (
                                <div className="flex flex-col items-center justify-center gap-2 select-none">
                                  <span
                                    className={`text-[12px] tabular-nums leading-none ${
                                      isT
                                        ? 'font-semibold'
                                        : 'text-zinc-200 font-medium'
                                    }`}
                                    style={isT ? { color: 'var(--accent-text)' } : {}}
                                  >
                                    {format(cell, 'd')}
                                  </span>
                                  <span
                                    className={`text-[9px] uppercase tracking-wider leading-none ${
                                      isT ? 'font-medium' : 'text-zinc-500'
                                    }`}
                                    style={isT ? { color: 'var(--accent-text)', opacity: 0.85 } : {}}
                                  >
                                    {DAY_LABELS[di][0]}
                                  </span>
                                </div>
                              ) : (
                                <span className="block h-[29px]" />
                              )}
                            </th>
                          );
                        })}
                        {wi < weeks.length - 1 && <th />}
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {activeHabits.map((habit) => {
                    const createdDay = startOfDay(parseISO(habit.createdAt));
                    return (
                      <tr
                        key={habit.id}
                        className="group border-t border-[var(--border-xs)] hover:bg-[var(--bg-hover-row)] transition-colors duration-100"
                      >
                        {/* ── Habit name + menu ── */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`text-[15px] leading-none flex-shrink-0 ${categoryColor(habit.category)}`}>
                              {categoryIcon(habit.category)}
                            </span>
                            <span
                              className="text-[13px] text-zinc-200 font-medium truncate flex-1 leading-tight"
                              title={habit.name}
                            >
                              {habit.name}
                            </span>
                            {/* Context menu — appears on row hover */}
                            <div
                              className="relative flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                              ref={menuOpen === habit.id ? menuRef : null}
                            >
                              <button
                                id={`menu-btn-${habit.id}`}
                                onClick={() => setMenuOpen(menuOpen === habit.id ? null : habit.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-[var(--bg-active)] transition-colors"
                                aria-label="Habit options"
                              >
                                <MoreHorizontal size={13} />
                              </button>
                              {menuOpen === habit.id && (
                                <div className="absolute right-0 top-full mt-1.5 bg-[var(--bg-overlay)] border border-[var(--border-lg)] rounded-xl py-1 w-36 shadow-2xl shadow-black/40 z-50">
                                  <button
                                    onClick={() => openEdit(habit)}
                                    className="flex items-center gap-2.5 w-full px-3 py-1.5 text-[12px] text-zinc-300 hover:text-white hover:bg-[var(--bg-hover)] transition-colors"
                                  >
                                    <Pencil size={12} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleArchive(habit.id)}
                                    className="flex items-center gap-2.5 w-full px-3 py-1.5 text-[12px] text-zinc-300 hover:text-white hover:bg-[var(--bg-hover)] transition-colors"
                                  >
                                    <Archive size={12} /> Archive
                                  </button>
                                  <div className="my-1 mx-2 border-t border-[var(--border-sm)]" />
                                  <button
                                    onClick={() => handleDelete(habit.id)}
                                    className="flex items-center gap-2.5 w-full px-3 py-1.5 text-[12px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/[0.07] transition-colors"
                                  >
                                    <Trash2 size={12} /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* ── Completion cells ── */}
                        {weeks.map((week, wi) => (
                          <React.Fragment key={wi}>
                            {week.map((cell, di) => {
                              const cellDay   = cell ? startOfDay(cell) : null;
                              const isFuture  = cellDay && cellDay > TODAY;
                              const isBefore  = cellDay && cellDay < createdDay;
                              const done      = isDone(habit.id, cell);
                              const todayCell = cell && isToday(cell);
                              const clickable = cell && !isFuture && !isBefore;
                              const cellKey   = cell ? `${habit.id}-${format(cell, 'yyyy-MM-dd')}` : null;

                              return (
                                <td key={di} className="py-3 text-center">
                                  {cell && !isBefore ? (
                                    <button
                                      onClick={() => clickable && handleToggle(habit.id, cell)}
                                      disabled={isFuture}
                                      title={cell ? format(cell, 'MMM d, yyyy') : ''}
                                      aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                                      className={`mx-auto w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 ${
                                        done
                                          ? `circle-done ${popKey === cellKey ? 'complete-pop' : ''}`
                                          : todayCell
                                          ? 'circle-today'
                                          : isFuture
                                          ? 'border border-[var(--border-xs)] opacity-25 cursor-default'
                                          : 'circle-empty'
                                      }`}
                                    >
                                      {done && (
                                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
                                          <path
                                            d="M1.5 4.5L3.5 6.5L7.5 2.5"
                                            stroke="white"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      )}
                                    </button>
                                  ) : (
                                    <span className="block w-[22px] h-[22px] mx-auto" />
                                  )}
                                </td>
                              );
                            })}
                            {wi < weeks.length - 1 && <td />}
                          </React.Fragment>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Legend ── */}
          {activeHabits.length > 0 && (
            <div className="flex items-center gap-5 px-6 py-3.5 border-t border-[var(--border-xs)]">
              <LegendItem dotClass="circle-empty" label="Incomplete" />
              <LegendItem dotClass="circle-today" label="Today" />
              <LegendItem dotClass="circle-done" label="Done" showCheck />
            </div>
          )}
        </div>
      </div>

      {showModal && <AddHabitModal onClose={closeModal} editHabit={editHabit} />}
    </div>
  );
}

function LegendItem({ dotClass, label, showCheck }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-[13px] h-[13px] rounded-full flex items-center justify-center ${dotClass}`}>
        {showCheck && (
          <svg width="7" height="7" viewBox="0 0 9 9" fill="none" aria-hidden>
            <path
              d="M1.5 4.5L3.5 6.5L7.5 2.5"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="text-[11px] text-zinc-500">{label}</span>
    </div>
  );
}
