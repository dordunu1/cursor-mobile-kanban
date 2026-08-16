# Orbit Board — Expo mobile app

Native companion to the web Kanban. Same board model, stored with AsyncStorage.

| Platform | Look | How to run |
|---|---|---|
| **iOS** | Liquid Glass (BlurView + soft fills) | `npx expo start` → scan with Expo Go |
| **Android** | Material You–inspired surfaces | GitHub Actions APK, or Expo Go |

The web app at the repo root is unchanged.

## Run on your phone (Expo Go)

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with:

- **iOS:** Camera / Expo Go
- **Android:** Expo Go

## Build Android APK (GitHub Releases)

1. Push a tag:

```bash
git tag mobile-v1.0.0
git push origin mobile-v1.0.0
```

2. Open the repo **Actions** tab → workflow **Build Android APK**.
3. When it finishes, open **Releases** and download `orbit-board.apk`.
4. On your phone, allow install from unknown apps for the browser/Files app, then install the APK.

You can also run the workflow manually via **Actions → Build Android APK → Run workflow**. The APK is uploaded as a workflow artifact even without a tag.

## Local Android APK (optional)

Requires Android SDK / JDK 17:

```bash
cd mobile
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

APK path: `android/app/build/outputs/apk/release/`

## Features ported

- Planning / In Progress / Completed lanes
- Quick add, filters, daily goals
- Task detail (priority, due, tags, checklist, comments)
- WIP limit, archive completed, duplicate, export JSON
- Light / dark theme

## Notes

- iOS App Store distribution needs a Mac + Apple Developer account (use Expo Go for now).
- The CI APK uses Expo’s default Android signing for release when available, and falls back to a debug APK. Fine for personal sideloading; replace with your own keystore before Play Store.
