# FoodMatch mobile build and release guide

FoodMatch is a Capacitor app: the native iOS and Android shells wrap the same
web bundle in `frontend/dist`. Building a mobile app is always two steps:

1. Build the web bundle: `npm run build` (outputs `frontend/dist`).
2. Copy it into the native project and build natively: `npx cap sync ios|android`
   then the platform build.

App identity: appId/bundle `es.foodmatch.app`, name `FoodMatch`.
Live data: the app reads Supabase using the anon key in `frontend/.env`
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Those ship in the bundle by
design; security is enforced by RLS. The service role key is never bundled.

All commands below run from `frontend/`.

## Prerequisites

### iOS (macOS only)
- Xcode (tested with 26.2) and an iOS Simulator.
- No CocoaPods needed: Capacitor 8 uses Swift Package Manager for iOS.

### Android
- A JDK. IMPORTANT: the Android build needs JDK 21. Capacitor 8 compiles its
  library at Java 21, so JDK 17 fails with `invalid source release: 21`.
  This machine uses the Homebrew `openjdk@21`. Set it before any Gradle command:
  ```
  export JAVA_HOME=/opt/homebrew/opt/openjdk@21
  ```
  To avoid setting it every time, add this line to `~/.gradle/gradle.properties`
  (machine-local, do not commit a hardcoded path into the repo):
  ```
  org.gradle.java.home=/opt/homebrew/opt/openjdk@21
  ```
- Android SDK command-line tools. This machine has them at
  `/opt/homebrew/share/android-commandlinetools`. Export:
  ```
  export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
  export ANDROID_SDK_ROOT="$ANDROID_HOME"
  export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
  ```
- Required SDK packages (install once):
  ```
  sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0" \
             "emulator" "system-images;android-36;google_apis;arm64-v8a"
  ```
  (Use the `arm64-v8a` image on Apple Silicon.)

## Run on a simulator / emulator (debug)

### iOS Simulator
```
npm run build
npx cap sync ios
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
  -sdk iphonesimulator -destination 'name=iPhone 17' -derivedDataPath build/ios build
xcrun simctl boot "iPhone 17" 2>/dev/null; open -a Simulator
APP=build/ios/Build/Products/Debug-iphonesimulator/App.app
xcrun simctl install booted "$APP"
xcrun simctl launch booted es.foodmatch.app
```
Or just `npm run ios:open` to build, sync, and open the project in Xcode, then
press Run.

### Android emulator
```
# one-time: create a virtual device
avdmanager create avd -n foodmatch -k "system-images;android-36;google_apis;arm64-v8a" -d pixel_7
# boot it (leave running)
emulator -avd foodmatch -no-snapshot-save -gpu auto &
# build + install + launch
npm run android:apk        # cd android && ./gradlew assembleDebug  (JDK 21 must be set)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p es.foodmatch.app -c android.intent.category.LAUNCHER 1
```
Or `npm run android:open` to open the project in Android Studio (Android Studio
is not currently installed on this machine).

## Release builds

Bump the version before each release:
- Android: `versionCode` (integer, must increase) and `versionName` in
  `android/app/build.gradle` (currently versionCode 4, versionName "1.0").
- iOS: Version (CFBundleShortVersionString) and Build (CFBundleVersion) in Xcode
  target settings.

### Android release (Play Store or direct APK)

Signing is already wired in `android/app/build.gradle`: it reads
`android/keystore.properties` when present (that file and `*.jks`/`*.keystore`
are gitignored). Without it, release builds come out unsigned.

1. Generate an upload/signing key once (choose your own passwords; keep them safe):
   ```
   keytool -genkeypair -v -keystore foodmatch-release.jks \
     -alias foodmatch -keyalg RSA -keysize 2048 -validity 10000
   ```
   Store the `.jks` somewhere safe OUTSIDE the repo (or in `android/`, it is
   gitignored).
2. Create `android/keystore.properties` from `keystore.properties.example`:
   ```
   storeFile=/absolute/path/to/foodmatch-release.jks
   storePassword=...
   keyAlias=foodmatch
   keyPassword=...
   ```
3. Build:
   ```
   npm run build && npx cap sync android
   cd android
   ./gradlew bundleRelease   # AAB for Play Store: app/build/outputs/bundle/release/app-release.aab
   ./gradlew assembleRelease # signed APK for direct install: app/build/outputs/apk/release/app-release.apk
   ```
4. Play Store: create the app in the Google Play Console (one-time, your
   account), upload the `.aab` to an Internal testing track, add testers by
   email, and share the opt-in link. Recommended: enable Play App Signing (you
   upload with the key above as the upload key; Google manages the app signing
   key).

### iOS release (TestFlight or App Store)

iOS signing is tied to your Apple Developer account ($99/yr) and is configured in
Xcode, not in the repo.

1. `npm run build && npx cap sync ios`, then `npx cap open ios` (opens Xcode).
2. In Xcode, select the `App` target, Signing and Capabilities, choose your Team
   and let Xcode manage signing.
3. Set the destination to "Any iOS Device", then Product, Archive.
4. In the Organizer, Distribute App, choose App Store Connect, upload.
5. The build appears in App Store Connect, TestFlight tab. Add testers and they
   install via the TestFlight app. Promote to App Store review when ready.

## What requires your accounts (I cannot do these for you)
- Apple Developer Program membership and iOS signing (Team ID, certificates,
  provisioning) in Xcode / App Store Connect.
- Generating the Android keystore and its passwords (signing credentials).
- Google Play Console account and store listing.
- Accepting store agreements and submitting for review.

Everything else (web build, `cap sync`, debug builds on simulator/emulator,
unsigned release builds) is reproducible from the commands above.
