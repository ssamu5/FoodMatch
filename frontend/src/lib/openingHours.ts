import type { OpeningInfo } from '../types/restaurant'

// Canonical opening-hours builders for FoodMatch.
//
// These MUST stay in sync with the inline builders emitted into the seed file by
// scripts/genSeed.mjs (standardOpening / brunchHours). The seed carries full
// `opening` objects; DB rows carry only the coarse `hours_kind` column, so the
// mapper reconstructs the same schedules here. If you change a schedule, change
// it in genSeed.mjs too (and regenerate the seed) so seed and live data match.
//
// dayOfWeek: 0 = Sunday ... 6 = Saturday. Times are "HH:MM" 24h; a close that is
// less than or equal to the open time wraps past midnight (see isOpenAt).

export type HoursKind = 'standard' | 'late' | 'brunch'

function standardOpening(lateNight = false): OpeningInfo {
  return {
    weeklySchedule: [
      { dayOfWeek: 1, open: '13:00', close: lateNight ? '01:30' : '23:30' },
      { dayOfWeek: 2, open: '13:00', close: lateNight ? '01:30' : '23:30' },
      { dayOfWeek: 3, open: '13:00', close: lateNight ? '01:30' : '23:30' },
      { dayOfWeek: 4, open: '13:00', close: lateNight ? '02:00' : '23:30' },
      { dayOfWeek: 5, open: '13:00', close: lateNight ? '02:30' : '00:00' },
      { dayOfWeek: 6, open: '13:00', close: lateNight ? '02:30' : '00:00' },
      { dayOfWeek: 0, open: '13:00', close: '17:00' },
    ],
  }
}

function brunchHours(): OpeningInfo {
  return {
    weeklySchedule: [
      { dayOfWeek: 1, open: '08:30', close: '18:00' },
      { dayOfWeek: 2, open: '08:30', close: '18:00' },
      { dayOfWeek: 3, open: '08:30', close: '18:00' },
      { dayOfWeek: 4, open: '08:30', close: '18:00' },
      { dayOfWeek: 5, open: '08:30', close: '19:00' },
      { dayOfWeek: 6, open: '09:00', close: '19:00' },
      { dayOfWeek: 0, open: '09:00', close: '18:00' },
    ],
  }
}

// Reconstruct a weekly schedule from the coarse hours_kind stored on DB rows.
// Unknown or empty kinds fall back to standard (also the DB column default).
export function openingFromHoursKind(kind: string): OpeningInfo {
  switch (kind) {
    case 'brunch':
      return brunchHours()
    case 'late':
      return standardOpening(true)
    case 'standard':
    default:
      return standardOpening()
  }
}
