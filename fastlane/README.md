fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Mac

### mac verify_api_key

```sh
[bundle exec] fastlane mac verify_api_key
```

Verify API key configuration

### mac setup

```sh
[bundle exec] fastlane mac setup
```

Full initial setup - verifies configuration

### mac sync_certificates

```sh
[bundle exec] fastlane mac sync_certificates
```

Sync certificates and provisioning profiles using match

### mac build

```sh
[bundle exec] fastlane mac build
```

Build the Tauri application for macOS

### mac build_release

```sh
[bundle exec] fastlane mac build_release
```

Build release version

### mac test

```sh
[bundle exec] fastlane mac test
```

Run all tests

### mac lint

```sh
[bundle exec] fastlane mac lint
```

Run linting and type checking

### mac sign_app

```sh
[bundle exec] fastlane mac sign_app
```

Sign the macOS app for distribution

### mac notarize_app

```sh
[bundle exec] fastlane mac notarize_app
```

Notarize the macOS app for Gatekeeper

### mac beta

```sh
[bundle exec] fastlane mac beta
```

Submit to TestFlight for beta testing

### mac release

```sh
[bundle exec] fastlane mac release
```

Submit to App Store for review

### mac distribute_dmg

```sh
[bundle exec] fastlane mac distribute_dmg
```

Build and notarize DMG for direct distribution

### mac bump_version

```sh
[bundle exec] fastlane mac bump_version
```

Bump version number

### mac clean

```sh
[bundle exec] fastlane mac clean
```

Clean build artifacts

### mac prepare_metadata

```sh
[bundle exec] fastlane mac prepare_metadata
```

Prepare metadata for App Store submission

### mac ci

```sh
[bundle exec] fastlane mac ci
```

CI lane - runs tests and lint

### mac nightly

```sh
[bundle exec] fastlane mac nightly
```

Nightly build lane

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
