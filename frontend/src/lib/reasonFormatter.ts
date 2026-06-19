// Converts a structured ReasonToken or WarningToken into a localized string
// using the existing i18n translate function.
// Import this anywhere you need to display match reasons in the UI.

import { translate } from './i18n'
import type { Lang } from '../locales/types'
import type { ReasonToken, WarningToken } from '../types/search'

// ---------- Label helpers ----------
// These look up localized labels for cuisine, area, vibe, bestFor, and dietary
// values. Falls back to the raw value when no mapping exists (no crash).

export function cuisineLabel(value: string, lang: Lang): string {
  return translate(lang, `labels.cuisine.${value}`) !== `labels.cuisine.${value}`
    ? translate(lang, `labels.cuisine.${value}`)
    : value
}

export function areaLabel(value: string, lang: Lang): string {
  return translate(lang, `labels.area.${value}`) !== `labels.area.${value}`
    ? translate(lang, `labels.area.${value}`)
    : value
}

export function vibeLabel(value: string, lang: Lang): string {
  return translate(lang, `labels.vibe.${value}`) !== `labels.vibe.${value}`
    ? translate(lang, `labels.vibe.${value}`)
    : value
}

export function bestForLabel(value: string, lang: Lang): string {
  return translate(lang, `labels.bestFor.${value}`) !== `labels.bestFor.${value}`
    ? translate(lang, `labels.bestFor.${value}`)
    : value
}

export function dietaryLabel(value: string, lang: Lang): string {
  return translate(lang, `labels.dietary.${value}`) !== `labels.dietary.${value}`
    ? translate(lang, `labels.dietary.${value}`)
    : value
}

// ---------- Reason formatter ----------

export function formatReason(token: ReasonToken, lang: Lang): string {
  switch (token.key) {
    case 'cuisineMatch':
      return translate(lang, 'reasons.cuisineMatch', {
        cuisine: cuisineLabel(token.vars.cuisine, lang),
      })
    case 'alsoServes':
      return translate(lang, 'reasons.alsoServes', {
        cuisine: cuisineLabel(token.vars.cuisine, lang),
      })
    case 'servesOne':
      return translate(lang, 'reasons.servesOne', { dish: token.vars.dish })
    case 'servesMany':
      return translate(lang, 'reasons.servesMany', {
        dish1: token.vars.dish1,
        dish2: token.vars.dish2,
      })
    case 'vibe': {
      // The vibe field may contain comma-separated values (up to 2 vibes joined).
      const localized = token.vars.vibe
        .split(', ')
        .map((v) => vibeLabel(v.trim(), lang))
        .join(', ')
      return translate(lang, 'reasons.vibe', { vibe: localized })
    }
    case 'rated':
      return translate(lang, 'reasons.rated', { rating: token.vars.rating })
    case 'areaIn':
      return translate(lang, 'reasons.areaIn', {
        area: areaLabel(token.vars.area, lang),
      })
    case 'centralLocation':
      return translate(lang, 'reasons.centralLocation')
    case 'budgetFits':
      return translate(lang, 'reasons.budgetFits', { spend: token.vars.spend })
    case 'priceLevelMatches':
      return translate(lang, 'reasons.priceLevelMatches')
    case 'dietary':
      return translate(lang, 'reasons.dietary', { flags: token.vars.flags })
  }
}

export function formatWarning(token: WarningToken, lang: Lang): string {
  switch (token.key) {
    case 'closedNow':
      return translate(lang, 'reasons.closedNow')
    case 'slightlyOver':
      return translate(lang, 'reasons.slightlyOver', { budget: token.vars.budget })
    case 'over':
      return translate(lang, 'reasons.over', { budget: token.vars.budget })
    case 'mayNotCover':
      return translate(lang, 'reasons.mayNotCover', { flags: token.vars.flags })
  }
}
