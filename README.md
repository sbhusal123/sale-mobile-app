# Sales Agent Mobile App

A premium, localized sales management application built with React Native.

## 🚀 Key Features
- **Premium UI**: Modern Indigo/Emerald design with dark/light mode support.
- **Multilingual**: High-quality English and Nepali translations.
- **Push Notifications**: Integrated Firebase Cloud Messaging (FCM).
- **Fast Experience**: Optimized navigation with Instant-on splash skip for authenticated users.

---

## 🛠 Prerequisites
- Node.js >= 22
- pnpm
- Android Studio / Xcode (for native builds)

---

## 🏃‍♂️ Running the App

### 1. Start Metro Bundler
```bash
pnpm start
```

### 2. Run on Android
```bash
pnpm android
```

### 3. Run on iOS
```bash
pnpm ios
```

---

## 📦 Build & Release (Android)

All commands should be run from the root directory unless specified.

### Build Debug APK
```bash
cd android && ./gradlew assembleDebug
```
*Output: `android/app/build/outputs/apk/debug/app-debug.apk`*

### Build Release APK
```bash
cd android && ./gradlew assembleRelease
```
*Output: `android/app/build/outputs/apk/release/app-release.apk`*

### Build Release Bundle (AAB)
```bash
cd android && ./gradlew bundleRelease
```
*Output: `android/app/build/outputs/bundle/release/app-release.aab`*

---

## 🧹 Maintenance Commands

### Clean Android Build
```bash
cd android && ./gradlew clean
```

### Clear Metro Cache
```bash
pnpm start --reset-cache
```

---

## 🌍 Localization
The app uses `i18next`. Localization files are located in `src/i18n/locales/`.
- English: `en.json`
- Nepali: `ne.json`

---

## 🔔 Firebase Configuration
Ensure `android/app/google-services.json` is present for push notifications to work.
