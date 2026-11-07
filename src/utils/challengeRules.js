import { format, parseISO, addDays, differenceInCalendarDays } from 'date-fns';

export const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

export const DURATION_OPTIONS = [
  { days: 7,  label: '7 Days',  sub: '1 Week' },
  { days: 14, label: '14 Days', sub: '2 Weeks' },
  { days: 30, label: '30 Days', sub: '1 Month' },
  { days: 60, label: '60 Days', sub: '2 Months' },
  { days: 90, label: '90 Days', sub: 'Quarter' },
];

export const CHALLENGE_SUGGESTIONS = [
  { name: 'No Sugar', duration: 30, description: 'Eliminate refined sugars and sweets to reset your energy and taste buds.' },
  { name: 'No Social Media', duration: 14, description: 'Take back your focus and screen time with a total social media fast.' },
  { name: 'No Alcohol', duration: 30, description: 'Cleanse your body, improve sleep quality, and gain mental clarity.' },
  { name: 'No Junk Food', duration: 30, description: 'Eat strictly home-cooked, whole foods without fast food or deep-fried snacks.' },
  { name: 'Cold Showers', duration: 30, description: 'Build mental toughness and discipline every morning with a cold shower.' },
  { name: 'No Porn', duration: 90, description: 'Reboot dopamine receptors and build absolute self-mastery.' },
];

/**
 * Pure evaluation function for a single challenge against a given calendar date.
 *
 * Rules:
 * 1. Completed challenges remain completed; no changes.
 * 2. If start date is in the future relative to currentDateStr, no days are evaluated yet.
 * 3. Missed day check:
 *    - Today is NEVER evaluated as missed while today is still the current calendar day.
 *    - All days from currentAttemptStartDate up to yesterday (inclusive) MUST exist in successfulDates.
 *    - If any day was missed:
 *      * That attempt is marked failed.
 *      * streakAchieved = count of consecutive successful days prior to the first missed day.
 *      * An attempt record is added to attemptHistory.
 *      * bestStreak is updated: Math.max(bestStreak, streakAchieved).
 *      * currentAttemptStartDate resets to currentDateStr (today).
 *      * successfulDates resets to [].
 *      * currentStreak resets to 0.
 * 4. If no days were missed:
 *    - currentStreak is the count of successful days in this attempt.
 *    - bestStreak = Math.max(bestStreak, currentStreak).
 */
export function evaluateChallenge(challenge, currentDateStr = getTodayStr()) {
  if (!challenge) return challenge;
  if (challenge.status === 'completed') return challenge;

  const attemptStart = challenge.currentAttemptStartDate || challenge.startDate || currentDateStr;

  // If start date is in the future
  if (currentDateStr < attemptStart) {
    return {
      ...challenge,
      currentAttemptStartDate: attemptStart,
      successfulDates: Array.isArray(challenge.successfulDates) ? challenge.successfulDates : [],
      attemptHistory: Array.isArray(challenge.attemptHistory) ? challenge.attemptHistory : [],
      currentStreak: 0,
      bestStreak: challenge.bestStreak || 0,
    };
  }

  let successfulDates = Array.isArray(challenge.successfulDates) ? [...challenge.successfulDates] : [];
  let attemptHistory = Array.isArray(challenge.attemptHistory) ? [...challenge.attemptHistory] : [];
  let currentAttemptStartDate = attemptStart;
  let bestStreak = challenge.bestStreak || 0;
  let currentStreak = challenge.currentStreak || 0;

  // Days elapsed between currentAttemptStartDate and currentDateStr
  const daysElapsed = differenceInCalendarDays(
    parseISO(currentDateStr),
    parseISO(currentAttemptStartDate)
  );

  // Check every past calendar day (index 0 to daysElapsed - 1)
  let missedDay = null;
  let streakPriorToMiss = 0;

  for (let i = 0; i < daysElapsed; i++) {
    const dayStr = format(addDays(parseISO(currentAttemptStartDate), i), 'yyyy-MM-dd');
    if (!successfulDates.includes(dayStr)) {
      missedDay = dayStr;
      streakPriorToMiss = i;
      break;
    }
  }

  if (missedDay) {
    // Attempt failed!
    const failedAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      attemptNumber: attemptHistory.length + 1,
      startDate: currentAttemptStartDate,
      failedDate: missedDay,
      streakAchieved: streakPriorToMiss,
      status: 'failed',
    };

    bestStreak = Math.max(bestStreak, streakPriorToMiss);
    attemptHistory.push(failedAttempt);

    // Start a fresh attempt starting today
    currentAttemptStartDate = currentDateStr;
    successfulDates = [];
    currentStreak = 0;
  } else {
    // No missed days in this attempt so far.
    // currentStreak is the number of confirmed days in successfulDates.
    currentStreak = successfulDates.length;
    bestStreak = Math.max(bestStreak, currentStreak);
  }

  return {
    ...challenge,
    currentAttemptStartDate,
    successfulDates,
    currentStreak,
    bestStreak,
    attemptHistory,
  };
}

/**
 * Evaluates all challenges and returns a new array with updated states.
 */
export function evaluateAllChallenges(challenges = [], currentDateStr = getTodayStr()) {
  if (!Array.isArray(challenges)) return [];
  return challenges.map((c) => evaluateChallenge(c, currentDateStr));
}
