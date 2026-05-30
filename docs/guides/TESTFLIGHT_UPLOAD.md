# FoodMatch -> TestFlight (Xcode upload)

Goal: get the FoodMatch iOS app onto TestFlight so you and Samuel can
install it on real iPhones for testing. You drive Xcode; no secrets are
shared with anyone.

Prerequisites: active Apple Developer Program membership (you have this),
Xcode 26 on this Mac (installed), your Apple ID.

Bundle id: `es.foodmatch.app`  ·  App name: FoodMatch  ·  Version 1.0 (1)

Already prepared in the project:
- App icon is 1024x1024, opaque (no alpha), valid Contents.json, and it
  compiles into the build.
- `ITSAppUsesNonExemptEncryption = false` is set, so there is no export
  compliance prompt on every upload.
- Signing is Automatic; you only pick your Team once.
- Latest web build is synced into the iOS project.

---

## One-time setup

### 1. Add your Apple ID to Xcode
Xcode > Settings > Accounts > "+" > Apple ID > sign in. Confirm your team
appears.

### 2. Create the app record in App Store Connect
https://appstoreconnect.apple.com > My Apps > "+" > New App.
- Platform: iOS
- Name: FoodMatch (must be unique on the App Store; if taken, use
  "FoodMatch Valencia")
- Primary language: Spanish (Spain) or English
- Bundle ID: select `es.foodmatch.app`
  - If missing: https://developer.apple.com/account > Identifiers > "+" >
    App IDs > App, Bundle ID (explicit) `es.foodmatch.app`, register,
    then refresh App Store Connect.
- SKU: `foodmatch-ios` (any unique string)

Screenshots / pricing / full listing are NOT needed for TestFlight.

---

## Each upload

### 3. Open the project
From `frontend/`: `npm run ios:open` (builds, syncs, opens Xcode).

### 4. Select your Team
App target > Signing & Capabilities:
- "Automatically manage signing": checked
- Team: choose your team
Wait for Xcode to create the cert + profile (warnings clear).

### 5. Archive
- Device selector (top bar): "Any iOS Device (arm64)".
  You cannot Archive while a Simulator is selected.
- Product > Archive. The Organizer opens when done.

### 6. Upload
Organizer > select archive > Distribute App > App Store Connect >
Upload > keep defaults > Upload. Wait for "Upload Successful".

### 7. TestFlight testers
App Store Connect > your app > TestFlight.
- Build shows "Processing" ~5 to 15 min.
- Internal testing (no Apple review): add yourself + Samuel under Users
  and Access, create an Internal group, add the build and testers.
- Testers install the TestFlight app and tap to install FoodMatch.
- External testing needs a short Apple review; only for people not on
  your account.

---

## Next uploads: bump the build number
App Store Connect rejects a reused build number. Before each new upload,
bump `CURRENT_PROJECT_VERSION` (1 -> 2 -> ...) in Build Settings >
Versioning. Keep `MARKETING_VERSION` (1.0) unless shipping a new
user-facing version. Then redo from step 3.

---

## Troubleshooting
- Signing errors: redo step 1, then step 4.
- Archive greyed out: device must be "Any iOS Device", not a Simulator.
- "Missing app icon": already fixed; if it recurs, confirm
  `AppIcon-512@2x.png` is 1024x1024 with no alpha.
- Bundle id not selectable: register the App ID at developer.apple.com
  first (step 2).
