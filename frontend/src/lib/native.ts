// Capacitor-aware bridge. Calls native APIs on iOS, falls back to web APIs
// (or no-ops) on browser builds. The rest of the React code does not have
// to know which platform it's running on.

import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import { Share } from '@capacitor/share'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { App as CapApp } from '@capacitor/app'

export const isNative = Capacitor.isNativePlatform()
export const platform = Capacitor.getPlatform() // 'web' | 'ios' | 'android'

// --- Status bar + splash screen, called once at app start ---

export async function initNativeShell(): Promise<void> {
  if (!isNative) return
  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#1a1a1a' })
  } catch {
    /* status bar plugin may be unavailable in some contexts */
  }
  try {
    await SplashScreen.hide({ fadeOutDuration: 250 })
  } catch {
    /* splash plugin may be unavailable */
  }
}

// --- Geolocation ---

export interface NativePosition {
  lat: number
  lng: number
  accuracyMeters: number
}

export async function getCurrentPosition(): Promise<NativePosition | null> {
  if (isNative) {
    try {
      const perm = await Geolocation.checkPermissions()
      if (perm.location !== 'granted') {
        const req = await Geolocation.requestPermissions()
        if (req.location !== 'granted') return null
      }
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 8000,
      })
      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracyMeters: pos.coords.accuracy,
      }
    } catch {
      return null
    }
  }

  // Web fallback
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
        }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000 },
    )
  })
}

// --- Native share sheet ---

export async function shareNative(opts: { title: string; text?: string; url: string }): Promise<void> {
  if (isNative) {
    try {
      await Share.share({ title: opts.title, text: opts.text, url: opts.url, dialogTitle: opts.title })
      return
    } catch {
      /* user dismissed */
    }
    return
  }
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share(opts)
      return
    } catch {
      /* dismissed */
    }
  }
  if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
    try {
      await navigator.clipboard.writeText(opts.url)
    } catch {
      /* clipboard blocked */
    }
  }
}

// --- Haptics (no-op on web) ---

export async function hapticTap(): Promise<void> {
  if (!isNative) return
  try {
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    /* haptics unavailable */
  }
}

export async function hapticSuccess(): Promise<void> {
  if (!isNative) return
  try {
    await Haptics.impact({ style: ImpactStyle.Medium })
  } catch {
    /* unavailable */
  }
}

// --- App lifecycle hooks (re-export for components if needed) ---

export const NativeApp = CapApp
