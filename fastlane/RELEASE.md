# Release & Deployment Guide

This guide covers how to deploy Exceptional Typing to TestFlight and the App Store.

## Prerequisites

### 1. Ruby Environment

The project uses Ruby 2.7.6 via rbenv. Ensure it's set up:

```bash
# Check Ruby version (should be 2.7.6 in fastlane directory)
cd fastlane
ruby --version

# If not 2.7.6, install it
rbenv install 2.7.6
rbenv local 2.7.6
```

### 2. App Store Connect API Key

You need an App Store Connect API key for authentication:

1. Go to [App Store Connect](https://appstoreconnect.apple.com) → Users and Access → Integrations → App Store Connect API
2. Generate a new key with "Admin" or "App Manager" access
3. Download the `.p8` file (you can only download it once!)
4. Copy it to the fastlane directory and to `~/.appstoreconnect/private_keys/`

```bash
# Copy API key to required locations
cp AuthKey_XXXXXX.p8 ~/.appstoreconnect/private_keys/
```

### 3. Environment Configuration

Copy and configure the environment file:

```bash
cd fastlane
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Required for deployment
APPLE_ID="your-apple-id@example.com"
APPLE_TEAM_ID="XXXXXXXXXX"
APPLE_TEAM_NAME="Your Name"

APP_STORE_CONNECT_API_KEY_KEY_ID="XXXXXXXXXX"
APP_STORE_CONNECT_API_KEY_ISSUER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
APP_STORE_CONNECT_API_KEY_KEY_FILEPATH="/absolute/path/to/AuthKey_XXXXXX.p8"
```

### 4. Code Signing Certificates

Ensure you have these certificates in your Keychain:

- **Apple Distribution** - For App Store builds
- **3rd Party Mac Developer Installer** - For creating signed PKG installers

You can check in Keychain Access → My Certificates.

## Deployment Commands

### Deploy to TestFlight (Beta)

```bash
cd fastlane
eval "$(rbenv init -)"
rbenv local 2.7.6
bundle exec fastlane mac beta skip_certificates:true skip_tests:true
```

This will:
1. Build the Tauri app in release mode
2. Sign with Apple Distribution certificate
3. Create a signed PKG installer
4. Upload to TestFlight

### Deploy to App Store (Production)

```bash
cd fastlane
eval "$(rbenv init -)"
rbenv local 2.7.6
bundle exec fastlane mac release skip_certificates:true
```

Add `submit:true` to also submit for App Review:

```bash
bundle exec fastlane mac release skip_certificates:true submit:true
```

### Build Only (No Upload)

```bash
bundle exec fastlane mac build_release
```

Output locations:
- App: `src-tauri/target/release/bundle/macos/Exceptional Typing.app`
- DMG: `src-tauri/target/release/bundle/dmg/Exceptional Typing_*.dmg`
- PKG: `src-tauri/target/release/bundle/macos/Exceptional Typing.pkg`

## Version Management

### Bump Version

```bash
# Patch: 0.1.1 → 0.1.2
bundle exec fastlane mac bump_version type:patch

# Minor: 0.1.1 → 0.2.0
bundle exec fastlane mac bump_version type:minor

# Major: 0.1.1 → 1.0.0
bundle exec fastlane mac bump_version type:major
```

This updates version in:
- `src-tauri/tauri.conf.json`
- `package.json`
- `src-tauri/Cargo.toml`

And creates a git commit.

## Troubleshooting

### "Failed to open TCP connection to api.appstoreconnect.apple.com"

Network/DNS issue. Check your internet connection:

```bash
ping api.appstoreconnect.apple.com
```

If using VPN, try disconnecting it.

### "Access forbidden" or 2FA prompts

The script is trying to use username/password auth instead of API key. Ensure:
1. `.env` file has correct API key configuration
2. The `.p8` file exists at the specified path
3. Run with `source .env` before fastlane commands if needed

### Bundle ID mismatch

The app's bundle ID must match App Store Connect. Current ID: `com.exceptionaltyping.app`

Check in:
- `src-tauri/tauri.conf.json` → `identifier`
- `fastlane/Fastfile` → `BUNDLE_ID`

### DMG bundling fails

This sometimes happens due to disk mounting issues. The PKG is still created and can be uploaded:

```bash
# Upload existing PKG manually
xcrun altool --upload-package "src-tauri/target/release/bundle/macos/Exceptional Typing.pkg" \
  --type macos \
  --apple-id 6758142774 \
  --bundle-id "com.exceptionaltyping.app" \
  --bundle-version "0.1.1" \
  --bundle-short-version-string "0.1.1" \
  --apiKey "$APP_STORE_CONNECT_API_KEY_KEY_ID" \
  --apiIssuer "$APP_STORE_CONNECT_API_KEY_ISSUER_ID"
```

### Ruby version errors

The vendor bundle was created with Ruby 2.7. If you see bundler errors:

```bash
# Ensure correct Ruby version
eval "$(rbenv init -)"
rbenv local 2.7.6

# Verify
ruby --version  # Should show 2.7.6
```

## App Store Information

| Field | Value |
|-------|-------|
| App Name | Exceptional Typing |
| Bundle ID | `com.exceptionaltyping.app` |
| Apple ID | 6758142774 |
| SKU | exceptional-typing |
| Team ID | RMDB25Z5H9 |

## Post-Deployment

After uploading to TestFlight:

1. Wait for Apple's processing (usually 5-30 minutes)
2. Check [App Store Connect](https://appstoreconnect.apple.com) → TestFlight
3. The build will appear under "macOS Builds"
4. Add testers or submit for external testing

## CI/CD (GitHub Actions)

For automated deployments via GitHub Actions, see the workflows in `.github/workflows/` and configure the required secrets listed in CLAUDE.md.
