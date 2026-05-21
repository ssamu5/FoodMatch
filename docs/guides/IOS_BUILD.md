# FoodMatch iOS build

**Stack:** Capacitor 8 wrapping the existing React + Vite frontend. One codebase, web + iOS.

## What I scaffolded

- `frontend/capacitor.config.ts` (app id `es.foodmatch.app`, dark theme tokens)
- `frontend/ios/App/` (Xcode project, ready to open)
- `frontend/src/lib/native.ts` (single bridge to native plugins)
- Native plugins installed: Geolocation, Share, Status Bar, Splash Screen, Haptics, App
- Custom dark splash screen and `fm` app icon
- Info.plist with required usage strings and export-compliance flag
- React app wired to use native Share + Haptics on iOS, browser fallback on web

The web app at https://foodmatch-app.vercel.app and the iOS app share the same source. Web Samuel can test today; iOS goes to TestFlight via the steps below.

## Open the project in Xcode

```bash
cd frontend
open ios/App/App.xcodeproj
```

(Capacitor 8 uses Swift Package Manager. No `.xcworkspace`. If you see one, ignore it.)

## First-time signing setup (one-time, 5 minutes)

1. Xcode opens. Top left → click the **App** target.
2. **Signing & Capabilities** tab.
3. Tick **Automatically manage signing**.
4. **Team**: pick your Apple Developer team.
5. **Bundle Identifier**: confirm it reads `es.foodmatch.app`. If this conflicts with another app on your account, change to `es.foodmatch.ios` or similar. (Update `capacitor.config.ts` to match if you change it.)
6. Xcode will provision the app automatically. Wait ~30 seconds for the green checkmark.

## Run on simulator (sanity check)

1. Top center of Xcode: pick a simulator (iPhone 15 Pro is a good default).
2. Press the **Play** button (top-left).
3. First build takes 2-3 minutes (Swift Package Manager fetches Capacitor). Subsequent builds are ~10 seconds.
4. The app launches, shows the dark splash, then loads the React UI.

## Run on a real iPhone (Samuel's testing path before TestFlight)

1. Plug your iPhone into the Mac with a USB cable.
2. On the iPhone: Settings → General → VPN & Device Management → trust your developer certificate (only needed once).
3. In Xcode, top center: pick your physical iPhone instead of a simulator.
4. Press Play. Wait for build, then it installs and launches on the phone.

Now you can hand the phone to Samuel and let him test natively.

## Ship to TestFlight (Samuel tests remotely)

1. In Xcode, top center, change the target from a simulator to **Any iOS Device (arm64)**.
2. Menu: **Product → Archive**.
3. Build takes ~3 to 5 minutes. The Organizer window opens with your archive.
4. Click **Distribute App**.
5. Pick **App Store Connect** → **Upload**.
6. Accept the defaults (App Store distribution, include bitcode if asked, automatic signing).
7. Wait for upload (~5 minutes depending on internet).
8. App Store Connect → My Apps → FoodMatch → TestFlight tab. Apple processes the build (10 to 30 minutes), then you can add testers.
9. Add Samuel by email under **Internal Testing**. He gets an email with a TestFlight link.

## Update workflow once it's live on TestFlight

Whenever you change React code:

```bash
cd frontend
npm run build           # rebuild dist/
npx cap sync ios        # copy dist into the iOS project
```

Then in Xcode: **Product → Archive** → upload again. Each upload needs an incremented build number (Xcode increments automatically if you have it set to that, otherwise update in **General → Identity → Build**).

## Versioning

- **Version (Marketing)**: visible to users. Update for real releases. Start at `1.0.0`.
- **Build**: increments for every upload to TestFlight. Apple requires uniqueness per version.

Both are in **Project → General → Identity** in Xcode. Capacitor sets defaults of `1.0` and `1`.

## App Store submission (later, after TestFlight validation)

Before submitting for App Store review (not TestFlight), you need:

- **App icon** (already in `Assets.xcassets/AppIcon.appiconset`, 1024×1024). Replace `fm` placeholder with a final brand icon when ready.
- **Screenshots** for 6.7" (iPhone 15 Pro Max) and 5.5" (older but still required). 3 to 10 screenshots each. Easiest: use the simulator at those device sizes and capture from a real flow.
- **App description** in App Store Connect (4000 char max). Pitch the discovery + local Valencia angle.
- **Keywords** (100 char total). Examples: `valencia,restaurants,paella,sushi,burgers,tapas,foodie,discovery`.
- **Privacy nutrition label**: declare what data the app collects. Currently: device ID + restaurant interactions, stored locally. When backend lands, declare analytics.
- **Privacy policy URL**. Need to publish one at `foodmatch.es/privacidad`. Standard EU GDPR template works.
- **Age rating**: 12+ likely (alcohol references in restaurant descriptions).
- **Category**: Food & Drink (primary), Lifestyle (secondary).

Apple review takes 24 to 72 hours typically.

## Pre-submission checklist to clear review

To avoid 4.2 "Minimum Functionality" rejection (the WebView-wrapper trap):

- [x] Native geolocation permission flow (added)
- [x] Native share sheet (added)
- [x] Native haptic feedback on key actions (added)
- [x] Dark splash + status bar styling (added)
- [x] Real iOS appearance, not just a website
- [ ] At least one feature that genuinely benefits from native (after-launch: native push for weekly Valencia picks would close this gap definitively)
- [ ] App icon is final brand artwork
- [ ] Privacy policy live at a public URL
- [ ] Real restaurants in the index (placeholders won't fly past review)

## If something breaks

- `npx cap doctor` to verify environment
- `npx cap sync ios` to force a copy of web assets after `npm run build`
- Xcode → Product → Clean Build Folder if you get weird linker errors
- Update Capacitor with `npm i @capacitor/core@latest @capacitor/cli@latest @capacitor/ios@latest && npx cap sync ios`

## Where the native code lives

You should rarely need to edit Swift directly. Most things are configured via:

- `capacitor.config.ts` (app id, theme color, plugin options)
- `Info.plist` (permissions, capabilities)
- `src/lib/native.ts` (TypeScript bridge to plugins)

Only edit Swift if you add a custom native plugin or use a non-Capacitor SDK.
