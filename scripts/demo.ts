/**
 * Demo Mode Launcher for Screenshots
 *
 * This script launches the app in demo mode with pre-populated user data,
 * ready for manual screenshot capture.
 *
 * Usage:
 *   npm run demo
 *
 * The demo mode will:
 *   - Create a "Demo User" with pre-populated stats and progress
 *   - Auto-login to that user
 *   - Skip the onboarding tutorial
 *
 * To take screenshots manually:
 *   1. Run `npm run demo`
 *   2. Navigate to each screen using the sidebar
 *   3. Use Cmd+Shift+4+Space to capture the window on macOS
 *   4. Save screenshots to: fastlane/metadata/en-US/screenshots/
 *
 * Note: Demo mode uses the VITE_DEMO_MODE environment variable passed directly
 * to the process. No .env.local file is created, so there's nothing to clean up
 * if the process is killed.
 */

import { execSync } from "child_process";

async function launchDemoMode(): Promise<void> {
  console.log("=== Exceptional Typing Demo Mode ===\n");

  console.log("Launching app in demo mode...");
  console.log("   - Demo User will be auto-created and logged in");
  console.log("   - Onboarding tutorial will be skipped");
  console.log("   - Pre-populated stats and progress will be loaded\n");

  console.log("📸 To take screenshots:");
  console.log("   1. Navigate to each screen using the sidebar");
  console.log("   2. Use Cmd+Shift+4+Space to capture the window");
  console.log("   3. Save to: fastlane/metadata/en-US/screenshots/\n");

  console.log("Press Ctrl+C to stop the app.\n");

  // Launch tauri dev with VITE_DEMO_MODE set as a process env var.
  // Vite exposes this as import.meta.env.VITE_DEMO_MODE in the app.
  // No files are written to disk, so there's nothing to clean up.
  try {
    execSync("npm run tauri dev", {
      cwd: process.cwd(),
      stdio: "inherit",
      env: { ...process.env, VITE_DEMO_MODE: "true" },
    });
  } catch {
    // App was closed (either manually or via Ctrl+C)
  }

  console.log("\n✅ Demo mode session ended.");
}

// Run
launchDemoMode().catch((error) => {
  console.error("Demo mode failed:", error);
  process.exit(1);
});
