# TOURIVA — ANDROID RELEASE READINESS & SIGNING VERIFICATION REPORT

**Audit Date:** October 26, 2026, 17:46 UTC  
**Auditor / Agent:** Antigravity Autonomous Security Engineering Agent  
**Overall Status:** **NOT READY — MANUAL ACTION REQUIRED**  
**Android Release APK Signing:** **BLOCKED** (Pending upload keystore)  
**Android AAB Signing:** **BLOCKED** (Pending upload keystore)  
**Git Secret-Exposure Check:** **PASS** (Zero credentials tracked in Git)  
**Google Play Publication:** **NOT PERFORMED** (Requires owner authorization and signed AAB)  
**Package / Application ID:** `com.touriva.app`  
**Version Code:** `11`  
**Version Name:** `11.0`  
**Target SDK:** `35` (Android 15)  
**Min SDK:** `22` (Android 5.1)  

---

## 1. ANDROID ARTIFACT INVENTORY & COMPILATION RESULTS

All build variants compile cleanly using Gradle 8.13 and Android SDK Build Tools 35.0.0:

| Artifact Variant | Output Path | File Size | Gradle Task | Build Result | Signing Status | Play Store Ready? |
|---|---|:---:|---|:---:|:---:|:---:|
| **Debug APK** | `frontEnd/touriva/android/app/build/outputs/apk/debug/app-debug.apk` | 13 MB | `./gradlew assembleDebug` | **SUCCESS** | Signed (Android Debug Key) | No (Debug build) |
| **Release APK** | `frontEnd/touriva/android/app/build/outputs/apk/release/app-release-unsigned.apk` | 11 MB | `./gradlew assembleRelease` | **SUCCESS** | **UNSIGNED** | No (Awaiting signature) |
| **Release App Bundle (AAB)** | `frontEnd/touriva/android/app/build/outputs/bundle/release/app-release.aab` | 9.4 MB | `./gradlew bundleRelease` | **SUCCESS** | **UNSIGNED** | **Awaiting Upload Key** |

---

## 2. SIGNATURE & BUNDLE VALIDITY AUDIT

### 2.1 APK Signature Verification (`apksigner`)
Executing Android SDK `apksigner`:
```bash
/home/next/Android/Sdk/build-tools/35.0.0/apksigner verify --verbose \
  frontEnd/touriva/android/app/build/outputs/apk/release/app-release-unsigned.apk
```
**Verification Output:**
```
DOES NOT VERIFY
ERROR: Missing META-INF/MANIFEST.MF
```
*Assessment:* As required by Google Play, the release APK and AAB are cleanly generated without mock or unauthorized signatures. They require signing with the official Touriva upload key before release.

### 2.2 App Bundle (AAB) Structural Validity
The generated 9.4 MB `.aab` file contains:
- `base/manifest/AndroidManifest.xml` (Valid protocol buffer format)
- `base/dex/classes.dex` (Compiled application bytecode)
- `base/res/` (Optimized native resources)
- `base/assets/public/` (Production web bundle compiled with Vite)
- Zero committed `.keystore` or `.jks` files inside bundle assets.

---

## 3. SECURITY & NETWORK CONFIGURATION AUDIT

1. **Cleartext Traffic Enforcement:**
   - In `frontEnd/touriva/android/app/src/main/res/xml/network_security_config.xml`:
     ```xml
     <base-config cleartextTrafficPermitted="false">
         <trust-anchors>
             <certificates src="system" />
         </trust-anchors>
     </base-config>
     ```
   - Cleartext HTTP traffic is completely rejected across all external domains.
   - User certificates are isolated in `<debug-overrides>` and strictly ignored by Android in release mode.
2. **Manifest Hardening:**
   - In `AndroidManifest.xml`, `android:usesCleartextTraffic` is absent.
   - Permissions are restricted strictly to: `INTERNET`, `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, and `gps`.
3. **HTTPS API Endpoints:**
   - All network traffic targets `https://touriva-api.onrender.com` over TLS 1.3.

---

## 4. KEYSTORE CONFIGURATION & GIT SAFEGUARDS

### 4.1 Keystore Inspection Findings
- An existing keystore `/home/next/next projects/keys/djawal.jks` was identified on the machine (alias `key0`), belonging to the predecessor project `com.nextchallenge.djawal`.
- Because `com.touriva.app` has a distinct application ID, the operator must confirm whether `djawal.jks` is the designated Google Play upload key for Touriva, or whether a new `touriva-release-key.jks` should be generated.
- In accordance with safety requirements, passwords were not guessed and keystores were not replaced.

### 4.2 Dynamic Gradle Keystore Discovery
In `frontEnd/touriva/android/app/build.gradle`:
```groovy
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    buildTypes {
        release {
            if (keystorePropertiesFile.exists()) {
                signingConfig signingConfigs.release
            }
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```
- If `keystore.properties` is absent, Gradle generates unsigned artifacts without failing.
- If `keystore.properties` is present, Gradle automatically signs `app-release.aab` and `app-release.apk`.

### 4.3 Git Exclusion Verification
Both root `.gitignore` and `frontEnd/touriva/android/.gitignore` strictly ignore:
```gitignore
*.jks
*.keystore
*.pepk
keystore.properties
```
Verified with `git check-ignore`. No private credentials or keystores can be committed to Git.

### 4.4 Template Provided
A clean template with placeholders only is provided at [`frontEnd/touriva/android/keystore.properties.example`](file:///home/next/next%20projects/touriva/frontEnd/touriva/android/keystore.properties.example).

---

## 5. ACTIONABLE STEPS TO FINALIZE SIGNING

To transition the Android status to **`ANDROID RELEASE SIGNING VERIFIED`**:

1. **Option A: If using a new Upload Keystore for Touriva:**
   ```bash
   keytool -genkey -v -keystore ~/touriva-release-key.jks \
     -alias touriva -keyalg RSA -keysize 2048 -validity 10000
   ```
   Then create `frontEnd/touriva/android/keystore.properties`:
   ```properties
   storeFile=/home/next/touriva-release-key.jks
   storePassword=YourSecurePassword
   keyAlias=touriva
   keyPassword=YourSecurePassword
   ```

2. **Option B: If using existing `djawal.jks` with alias `key0`:**
   Create `frontEnd/touriva/android/keystore.properties`:
   ```properties
   storeFile=/home/next/next projects/keys/djawal.jks
   storePassword=YourDjawalPassword
   keyAlias=key0
   keyPassword=YourDjawalPassword
   ```

3. **Compile Signed Release Artifacts:**
   ```bash
   cd frontEnd/touriva/android && ./gradlew bundleRelease assembleRelease
   ```

4. **Verify Signature:**
   ```bash
   /home/next/Android/Sdk/build-tools/35.0.0/apksigner verify --verbose \
     app/build/outputs/apk/release/app-release.apk
   ```

5. **Publish to Google Play:**
   Upload `app/build/outputs/bundle/release/app-release.aab` to [Google Play Console](https://play.google.com/console).
