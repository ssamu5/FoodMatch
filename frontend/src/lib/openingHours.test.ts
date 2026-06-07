import { describe, expect, it } from 'vitest'
import { openingFromHoursKind } from './openingHours'

describe('openingFromHoursKind', () => {
  it('builds standard hours: weekday lunch into late evening, short Sunday', () => {
    const o = openingFromHoursKind('standard')
    expect(o.weeklySchedule).toHaveLength(7)
    expect(o.weeklySchedule.find((s) => s.dayOfWeek === 1)).toMatchObject({ open: '13:00', close: '23:30' })
    expect(o.weeklySchedule.find((s) => s.dayOfWeek === 5)).toMatchObject({ open: '13:00', close: '00:00' })
    expect(o.weeklySchedule.find((s) => s.dayOfWeek === 0)).toMatchObject({ open: '13:00', close: '17:00' })
  })

  it('builds late hours: closes after midnight Thu through Sat', () => {
    const o = openingFromHoursKind('late')
    expect(o.weeklySchedule.find((s) => s.dayOfWeek === 1)).toMatchObject({ open: '13:00', close: '01:30' })
    expect(o.weeklySchedule.find((s) => s.dayOfWeek === 4)).toMatchObject({ close: '02:00' })
    expect(o.weeklySchedule.find((s) => s.dayOfWeek === 5)).toMatchObject({ close: '02:30' })
    expect(o.weeklySchedule.find((s) => s.dayOfWeek === 6)).toMatchObject({ close: '02:30' })
  })

  it('builds brunch hours: morning open, evening close', () => {
    const o = openingFromHoursKind('brunch')
    expect(o.weeklySchedule.find((s) => s.dayOfWeek === 1)).toMatchObject({ open: '08:30', close: '18:00' })
    expect(o.weeklySchedule.find((s) => s.dayOfWeek === 6)).toMatchObject({ open: '09:00', close: '19:00' })
    expect(o.weeklySchedule.find((s) => s.dayOfWeek === 0)).toMatchObject({ open: '09:00', close: '18:00' })
  })

  it('falls back to standard hours for an unknown or empty kind', () => {
    expect(openingFromHoursKind('weird')).toEqual(openingFromHoursKind('standard'))
    expect(openingFromHoursKind('')).toEqual(openingFromHoursKind('standard'))
  })
})
