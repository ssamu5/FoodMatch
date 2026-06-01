import type { Cuisine, Area, Vibe } from './restaurant'

// Lightweight local "account" for the pilot. Not real auth; stored on-device
// so the app feels like a product and we can personalise greetings/saves.
export interface Account {
  displayName: string
  email: string | null
  createdAt: string
}

export interface TasteProfile {
  favoriteCuisines: Cuisine[]
  budgetComfort: 1 | 2 | 3 | 4 | null  // typical comfortable spend level
  preferredAreas: Area[]
  dietary: ('vegetarian' | 'vegan' | 'gluten-free')[]
  vibePreferences: Vibe[]
  email: string | null  // optional capture for weekly Valencia picks
  updatedAt: string
}

export interface UserLead {
  email: string
  source: 'profile_email' | 'home_email' | 'other'
  createdAt: string
}

export interface RestaurantLead {
  restaurantName: string
  ownerName: string
  email: string
  phone: string
  instagramOrWebsite?: string
  area: string
  city: string
  message?: string
  createdAt: string
  // Extra fields captured by the guided onboarding assistant (all optional
  // so the classic form still produces a valid lead).
  cuisine?: string
  priceBand?: string
  menuLink?: string
  hasPhotos?: boolean
  source?: 'form' | 'assistant'
}

export type AnalyticsEventType =
  | 'landing_viewed'
  | 'prompt_submitted'
  | 'result_viewed'
  | 'restaurant_opened'
  | 'restaurant_saved'
  | 'restaurant_unsaved'
  | 'outbound_map_clicked'
  | 'outbound_call_clicked'
  | 'outbound_instagram_clicked'
  | 'outbound_website_clicked'
  | 'no_results'
  | 'user_lead_submitted'
  | 'restaurant_lead_submitted'
  | 'filter_applied'
  | 'feedback_submitted'
  | 'theme_changed'
  | 'whatsapp_lead_clicked'
  | 'share_clicked'
  | 'partner_interest_started'
  | 'account_created'
  | 'account_signed_out'
  | 'listing_claim_clicked'
  | 'onboarding_started'
  | 'onboarding_step'
  | 'onboarding_completed'

export interface AnalyticsEvent {
  type: AnalyticsEventType
  deviceId: string
  createdAt: string
  payload?: Record<string, unknown>
}
