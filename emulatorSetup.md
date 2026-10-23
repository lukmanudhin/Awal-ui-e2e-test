# Emulator Setup and Mobile Test Run (Awal tablet app)

How to start the Android tablet emulator, watch it with scrcpy, start Appium and run the mobile test
(`tests/UI/production/appium.spec.ts`) after the PC has been shut down. Each command is explained.

Windows paths used below (installed once, outside the repo):

| Item | Location |
|------|----------|
| Android SDK | `C:\Android\sdk` |
| Emulator (AVD) | `awal_tab` (10.1" WXGA tablet, 1280x800, landscape) |
| App under test | `app/app-release.apk` (package `com.awalPlastics`, activity `.MainActivity`) |
| Appium | project dev dependency, run with `npx appium` (port 4723) |

## Start order

Use one terminal per step marked **leave open**.

### Step 1 - Start the emulator (Terminal 1, leave open)

```
C:\Android\sdk\emulator\emulator.exe -avd awal_tab -no-snapshot -no-boot-anim -no-window -no-audio -gpu swiftshader_indirect -feature -Vulkan -memory 2048 -cores 2 -dns-server 8.8.8.8,8.8.4.4
```

| Part | What it does |
|------|--------------|
| `emulator.exe -avd awal_tab` | Starts the tablet virtual device named `awal_tab` |
| `-no-snapshot` | Cold boot, ignores a saved snapshot (avoids a corrupted saved state) |
| `-no-boot-anim` | Skips the boot animation so it boots faster |
| `-no-window` | Runs headless, with no emulator window (view it with scrcpy in Step 3). Remove this flag to get a normal emulator window |
| `-no-audio` | Disables audio, saves resources |
| `-gpu swiftshader_indirect` | Software graphics. The default GPU mode hung and crashed on this PC |
| `-feature -Vulkan` | Turns Vulkan off, avoids graphics crashes |
| `-memory 2048` | Gives the emulator 2 GB RAM |
| `-cores 2` | Gives the emulator 2 CPU cores (use 4 if the PC is not loaded) |
| `-dns-server 8.8.8.8,8.8.4.4` | Sets the DNS servers. Without it the app shows "not connected to internet" |

### Step 2 - Wait until it has booted (Terminal 2)

```
C:\Android\sdk\platform-tools\adb.exe devices
C:\Android\sdk\platform-tools\adb.exe shell getprop sys.boot_completed
```

| Command | What it does |
|---------|--------------|
| `adb devices` | Lists connected devices. Wait for `emulator-5554   device` (not `offline`) |
| `adb shell getprop sys.boot_completed` | Prints `1` when Android has finished booting |

Booting takes 1-3 minutes. Continue when the first shows `device` and the second prints `1`.

### Step 3 - See and use the screen with scrcpy (Terminal 2, optional, leave open)

PowerShell:

```
$env:ADB = "C:\Android\sdk\platform-tools\adb.exe"
scrcpy -s emulator-5554 --window-title "Awal tablet" --max-size 1024 --no-audio
```

Git Bash:

```
ADB="C:/Android/sdk/platform-tools/adb.exe" scrcpy -s emulator-5554 --window-title "Awal tablet" --max-size 1024 --no-audio
```

| Part | What it does |
|------|--------------|
| `$env:ADB = ...` / `ADB=...` | Makes scrcpy use the SDK's adb. scrcpy ships its own adb; two different adb versions fight over port 5037 and Appium then fails with "Could not find a connected Android device" |
| `scrcpy` | Mirrors the emulator screen in a window and lets you click and type in it |
| `-s emulator-5554` | Selects the emulator device |
| `--window-title "Awal tablet"` | Names the window |
| `--max-size 1024` | Lowers the mirrored resolution, uses less CPU and memory |
| `--no-audio` | Does not forward audio |

Useful extras: `--stay-awake` (screen does not sleep), `--no-control` (view-only, no accidental clicks during a test).
If `scrcpy` is not recognised, use the full path under
`%LOCALAPPDATA%\Microsoft\WinGet\Packages\Genymobile.scrcpy_Microsoft.Winget.Source_8wekyb3d8bbw\scrcpy-win64-v4.1\scrcpy.exe`.

### Step 4 - Start Appium (Terminal 3, leave open)

```
cd C:\Users\CIPL1908\OneDrive\Desktop\Git-Project\Awal-ui-e2e-test
npx appium --address 127.0.0.1 --port 4723 --allow-cors
```

| Part | What it does |
|------|--------------|
| `cd ...Awal-ui-e2e-test` | Appium and its UiAutomator2 driver are installed in the project |
| `npx appium` | Starts the Appium server that the test talks to |
| `--address 127.0.0.1 --port 4723` | Listens locally on the port the test expects (`APPIUM_HOST` / `APPIUM_PORT` in `utils/ENV.ts`) |
| `--allow-cors` | Lets Appium Inspector connect from the browser/desktop app |

Wait for `Appium REST http interface listener started` (about 20-40 seconds).
If it says it cannot find the SDK, run `set ANDROID_HOME=C:\Android\sdk` first (PowerShell: `$env:ANDROID_HOME="C:\Android\sdk"`).

### Step 5 - Run the test (Terminal 4)

```
cd C:\Users\CIPL1908\OneDrive\Desktop\Git-Project\Awal-ui-e2e-test
npx playwright test tests/UI/production/appium.spec.ts
```

| Part | What it does |
|------|--------------|
| `npx playwright test <file>` | Runs only this spec. It first runs the web + API flow, then opens the Awal app on the emulator, logs in and runs the Design Studio task steps |

It takes about 6-10 minutes. Add `--retries=0` to avoid a retry creating a second set of test data after a failure.

## Shutting down

| Command | What it does |
|---------|--------------|
| `Ctrl+C` in the Appium terminal | Stops Appium |
| Close the scrcpy window | Stops mirroring (the emulator keeps running) |
| `C:\Android\sdk\platform-tools\adb.exe emu kill` | Shuts the emulator down cleanly |

## Using the emulator manually

- With a window: run the Step 1 command without `-no-window` and `-no-boot-anim`.
- Open the app by hand: `adb shell am start -n com.awalPlastics/.MainActivity`
- App missing from the emulator: `adb install -r app\app-release.apk`
- Only one Appium session can control the device at a time, so do not use Appium Inspector while the test runs.

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `Could not find a connected Android device in 20000ms` | The emulator is not fully booted, or scrcpy's own adb is running. Wait for Step 2, close scrcpy, run `adb kill-server`, then `adb devices` and restart scrcpy with `ADB` set (Step 3) |
| Appium's adb calls fail with exit code `3221225794` | A stale Appium process. Kill every `node` process whose command line contains `appium`, then start Appium again (Step 4) |
| `ECONNREFUSED` on port 4723 | Appium is not running. Start it (Step 4) |
| App shows "not connected to internet" | The emulator was started without `-dns-server 8.8.8.8,8.8.4.4` (Step 1) |
| `socket hang up`, UiAutomator2 crash, System UI not responding | The PC is low on memory or CPU. Close VS Code, Edge and Chrome; stop scrcpy; restart the emulator |
| `PJO ... cannot be assigned: the employee still has an unfinished PJO` | A previous failed run left an unfinished task for Sanjay Preeth. Finish it in the app (Production > Task Management > Sanjay Preeth > Face Recognition > Current Task > Start Task / End Task), then rerun |
| `Cannot verify the signature ... Could not find 'apksigner.jar'` | Build-tools are missing: `C:\Android\sdk\cmdline-tools\latest\bin\sdkmanager "build-tools;34.0.0"`, then restart Appium |

## Notes for test code

- Never use the Back key or `driver.hideKeyboard()` to close the keyboard in the app: Back exits the app when no keyboard is open. Tap a neutral label instead (`hideKeyboard(neutralElement)` in `pages/mobile/mobileBasePage.ts`).
- Mobile code lives in `utils/mobileSession.ts` (Appium session), `pages/mobile/*` (page objects) and the `mobileLoginPage` / `mobileTaskManagementPage` fixtures in `fixtures/baseFixtures.ts`.
