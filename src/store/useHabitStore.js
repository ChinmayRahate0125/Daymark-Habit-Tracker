import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, parseISO, startOfDay, isAfter } from 'date-fns';
import { evaluateAllChallenges } from '../utils/challengeRules';

const todayStr = () => format(new Date(), 'yyyy-MM-dd');

// ─── Historical Query Helpers ──────────────────────────────────────────────────

/**
 * Returns the habits that were ACTIVE on a given date string.
 *
 * Rules:
 *  - habit.createdAt must be <= queryDate (new habits don't pollute past)
 *  - If archived/deleted, habit.archivedAt must be AFTER queryDate
 *    (archiving today removes from today onward, NOT retroactively from yesterday)
 */
export function getHabitsActiveOnDate(habits, dateStr) {
  const queryDay = startOfDay(parseISO(dateStr));
  return habits.filter((h) => {
    // Must have been created on or before this date
    const createdDay = startOfDay(parseISO(h.createdAt));
    if (isAfter(createdDay, queryDay)) return false;

    if (h.status === 'active') return true;

    // Archived or deleted: only count if it was archived AFTER the query date
    // i.e., archivedAt is strictly after the query day
    if (!h.archivedAt) return false;
    const archivedDay = startOfDay(parseISO(h.archivedAt));
    return isAfter(archivedDay, queryDay);
  });
}

/** A day qualifies for streak if at least ONE active habit was completed */
export function dayQualifiesForStreak(habits, completions, dateStr) {
  const active = getHabitsActiveOnDate(habits, dateStr);
  if (active.length === 0) return false;
  return active.some((h) => completions[h.id]?.[dateStr] === true);
}

/** Consistency % for a single day — never returns 100% when 0 active habits */
export function getDayConsistency(habits, completions, dateStr) {
  const active = getHabitsActiveOnDate(habits, dateStr);
  if (active.length === 0) return 0;
  const done = active.filter((h) => completions[h.id]?.[dateStr] === true).length;
  return Math.round((done / active.length) * 100);
}

// ─── Aggregate Statistics ─────────────────────────────────────────────────────

/** Current streak: consecutive qualifying days backward from today */
export function calculateCurrentStreak(habits, completions) {
  if (habits.length === 0) return 0;
  let streak = 0;
  let cursor = startOfDay(new Date());
  for (let i = 0; i < 730; i++) {
    const ds = format(cursor, 'yyyy-MM-dd');
    if (dayQualifiesForStreak(habits, completions, ds)) {
      streak++;
    } else {
      break;
    }
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}

/** Longest streak: full scan from first habit creation date */
export function calculateLongestStreak(habits, completions) {
  if (habits.length === 0) return 0;
  const allDates = habits.map((h) => parseISO(h.createdAt));
  const earliest = startOfDay(new Date(Math.min(...allDates.map((d) => d.getTime()))));
  const todayDay = startOfDay(new Date());

  let longest = 0;
  let current = 0;
  let cursor = new Date(earliest.getTime());

  while (cursor <= todayDay) {
    const ds = format(cursor, 'yyyy-MM-dd');
    if (dayQualifiesForStreak(habits, completions, ds)) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
    cursor = new Date(cursor.getTime() + 86_400_000);
  }
  return longest;
}

/** Overall consistency % across all time */
export function calculateOverallConsistency(habits, completions) {
  if (habits.length === 0) return 0;
  const allDates = habits.map((h) => parseISO(h.createdAt));
  const earliest = startOfDay(new Date(Math.min(...allDates.map((d) => d.getTime()))));
  const todayDay = startOfDay(new Date());

  let totalSlots = 0;
  let totalDone = 0;
  let cursor = new Date(earliest.getTime());

  while (cursor <= todayDay) {
    const ds = format(cursor, 'yyyy-MM-dd');
    const active = getHabitsActiveOnDate(habits, ds);
    if (active.length > 0) {
      totalSlots += active.length;
      totalDone += active.filter((h) => completions[h.id]?.[ds] === true).length;
    }
    cursor = new Date(cursor.getTime() + 86_400_000);
  }
  if (totalSlots === 0) return 0;
  return Math.round((totalDone / totalSlots) * 100);
}

/** Count total completions across all habits */
export function calculateTotalCompletions(completions) {
  let total = 0;
  for (const byDate of Object.values(completions)) {
    for (const val of Object.values(byDate)) {
      if (val === true) total++;
    }
  }
  return total;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const useHabitStore = create(
  persist(
    (set, get) => ({
      habits: [],        // { id, name, category, status, createdAt, archivedAt }
      completions: {},   // { habitId: { 'yyyy-MM-dd': true } }
      challenges: [],    // [ { id, name, description, duration, startDate, currentAttemptStartDate, successfulDates, currentStreak, bestStreak, status, createdAt, completedAt, attemptHistory } ]
      lists: [],         // [ { id, categoryId, title, metadata, notes, link, createdAt, completed, completedAt } ]
      settings: {
        accent: 'purple',
        theme: 'dark',
      },

      // ── Habit CRUD ──────────────────────────────────────────────────────────

      addHabit: (name, category) => {
        const id = `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        set((s) => ({
          habits: [...s.habits, { id, name, category, status: 'active', createdAt: todayStr(), archivedAt: null }],
          completions: { ...s.completions, [id]: {} },
        }));
      },

      updateHabit: (id, updates) => {
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
      },

      archiveHabit: (id) => {
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, status: 'archived', archivedAt: todayStr() } : h
          ),
        }));
      },

      restoreHabit: (id) => {
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, status: 'active', archivedAt: null } : h
          ),
        }));
      },

      /**
       * Soft-delete: preserves completions and keeps habit in historical
       * calculations via archivedAt timestamp (same logic as archive).
       */
      deleteHabit: (id) => {
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id
              ? { ...h, status: 'deleted', archivedAt: h.archivedAt || todayStr() }
              : h
          ),
        }));
      },

      // ── Completions ─────────────────────────────────────────────────────────

      toggleCompletion: (habitId, dateStr) => {
        set((s) => {
          const prev = s.completions[habitId] || {};
          const isNowDone = prev[dateStr] !== true;   // toggle
          const next = { ...prev };
          if (isNowDone) {
            next[dateStr] = true;
          } else {
            delete next[dateStr];                     // keep storage lean
          }
          return { completions: { ...s.completions, [habitId]: next } };
        });
      },

      // ── Challenges ──────────────────────────────────────────────────────────

      addChallenge: ({ name, description = '', duration = 30, startDate }) => {
        const today = todayStr();
        const start = startDate || today;
        const id = `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const newChallenge = {
          id,
          name: name.trim(),
          description: description?.trim() || '',
          duration: Number(duration),
          startDate: start,
          currentAttemptStartDate: start,
          successfulDates: [],
          currentStreak: 0,
          bestStreak: 0,
          status: 'active',
          createdAt: today,
          completedAt: null,
          attemptHistory: [],
        };

        set((s) => ({
          challenges: [...(s.challenges || []), newChallenge],
        }));
      },

      checkInChallenge: (id) => {
        const today = todayStr();
        set((s) => {
          // Always evaluate missed days before applying check-in
          const currentChallenges = evaluateAllChallenges(s.challenges || [], today);
          const nextChallenges = currentChallenges.map((c) => {
            if (c.id !== id) return c;
            if (c.status === 'completed') return c;

            // Cannot check in before start date
            if (today < c.startDate) return c;

            // Strict rule: cannot check in more than once on the same day
            if (c.successfulDates?.includes(today)) return c;

            const nextSuccessful = [...(c.successfulDates || []), today];
            const nextStreak = nextSuccessful.length;
            const nextBest = Math.max(c.bestStreak || 0, nextStreak);
            const isCompleted = nextStreak >= c.duration;

            let attemptHistory = c.attemptHistory ? [...c.attemptHistory] : [];
            if (isCompleted) {
              const completedAttempt = {
                id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                attemptNumber: attemptHistory.length + 1,
                startDate: c.currentAttemptStartDate,
                completedDate: today,
                streakAchieved: nextStreak,
                status: 'completed',
              };
              attemptHistory.push(completedAttempt);
            }

            return {
              ...c,
              successfulDates: nextSuccessful,
              currentStreak: nextStreak,
              bestStreak: nextBest,
              status: isCompleted ? 'completed' : 'active',
              completedAt: isCompleted ? today : null,
              attemptHistory,
            };
          });

          return { challenges: nextChallenges };
        });
      },

      deleteChallenge: (id) => {
        set((s) => ({
          challenges: (s.challenges || []).filter((c) => c.id !== id),
        }));
      },

      evaluateChallenges: () => {
        const today = todayStr();
        set((s) => ({
          challenges: evaluateAllChallenges(s.challenges || [], today),
        }));
      },

      // ── My Lists ────────────────────────────────────────────────────────────

      addListItem: ({ categoryId, title, metadata = {}, notes = '', link = '' }) => {
        const today = todayStr();
        const id = `item_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const newItem = {
          id,
          categoryId,
          title: title.trim(),
          metadata: metadata || {},
          notes: notes?.trim() || '',
          link: link?.trim() || '',
          createdAt: today,
          completed: false,
          completedAt: null,
        };

        set((s) => ({
          lists: [...(s.lists || []), newItem],
        }));
      },

      updateListItem: (id, updates) => {
        set((s) => ({
          lists: (s.lists || []).map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      deleteListItem: (id) => {
        set((s) => ({
          lists: (s.lists || []).filter((item) => item.id !== id),
        }));
      },

      toggleListItem: (id) => {
        const today = todayStr();
        set((s) => ({
          lists: (s.lists || []).map((item) => {
            if (item.id !== id) return item;
            const nextCompleted = !item.completed;
            return {
              ...item,
              completed: nextCompleted,
              completedAt: nextCompleted ? today : null,
            };
          }),
        }));
      },

      // ── Settings ────────────────────────────────────────────────────────────

      updateSettings: (updates) => {
        set((s) => ({ settings: { ...s.settings, ...updates } }));
      },

      // ── Data I/O ─────────────────────────────────────────────────────────────

      exportData: () => {
        const { habits, completions, challenges, lists } = get();
        return JSON.stringify(
          {
            habits,
            completions,
            challenges: challenges || [],
            lists: lists || [],
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );
      },

      importData: (jsonStr) => {
        try {
          const data = JSON.parse(jsonStr);
          if (!Array.isArray(data.habits) || typeof data.completions !== 'object') return false;
          set({
            habits: data.habits,
            completions: data.completions,
            challenges: Array.isArray(data.challenges) ? data.challenges : (get().challenges || []),
            lists: Array.isArray(data.lists) ? data.lists : (get().lists || []),
          });
          return true;
        } catch {
          return false;
        }
      },

      resetData: () => {
        set({ habits: [], completions: {}, challenges: [], lists: [] });
      },
    }),
    {
      name: 'daymark-v2',
      version: 1,
    }
  )
);

export default useHabitStore;
