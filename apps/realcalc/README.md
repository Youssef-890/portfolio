# Real Calculator PRO

A premium-feel desktop calculator built with **Java Swing** — themes, settings,
history, sound, and full keyboard support. **Zero external dependencies.**

![structure](#) <!-- placeholder -->

---

## Features

### Calculator core
- `+`  `−`  `×`  `÷`  `%`  `.`  `+/-`
- Real calculator behavior:
  - **`=` repeats the last operation** with the last operand
  - **`AC`** clears everything, **`DEL`** removes one digit
- Arbitrary-precision arithmetic via `BigDecimal` (no floating-point surprises)
- Division-by-zero → `"Cannot divide by zero"` shown in the display

### Display
- Two-line, right-aligned (top: previous expression, bottom: current value)
- Digital-style font when one is installed (`Digital-7`, `DS-Digital`, …),
  with a clean monospace fallback
- Soft glow on the **Neon** theme

### Themes
| Theme | Vibe                                                 |
|-------|------------------------------------------------------|
| Dark  | Default — deep charcoal + amber operators            |
| Light | Crisp white + iOS-style accents                      |
| Neon  | Black background, cyan glow, magenta operator keys   |

Each theme controls every color: background, panels, button roles, display
text, sidebar, borders.

### Settings
A modal **Settings** window with:
- Theme picker (Dark / Light / Neon)
- Toggle button **sound**
- Toggle **history**
- **Font size** (Small / Medium / Large)
- **Reset to defaults**

Settings are persisted as JSON at:

```
~/.realcalc-pro/settings.json
```

(on Windows: `%USERPROFILE%\.realcalc-pro\settings.json`)

### History
- Side panel toggled by the **History** button
- Newest entries first, scrollable
- **Click any entry to load its result** back into the calculator
- Per-session **Clear** button

### UI
- Custom-painted **rounded buttons** with hover, press, and a tactile press animation
- The `=` key is **highlighted** with an accent ring
- Card-style window with subtle borders that retint per theme
- Modern spacing, responsive grid

### Keyboard support
| Key                       | Action |
|--------------------------|--------|
| `0`–`9`                  | digit  |
| `.` or `,`               | decimal |
| `+` `-` `*` `/`          | operators |
| `%`                      | percent |
| `Enter` or `=`           | equals |
| `Backspace` or `Delete`  | DEL |
| `Esc`                    | AC |

---

## Project structure

```
src/main/java/com/realcalc/
├── Main.java                       (entry point)
├── engine/
│   └── CalculatorEngine.java       (BigDecimal arithmetic, AC/DEL/=, repeat=)
├── settings/
│   ├── Settings.java               (POJO of preferences)
│   └── SettingsManager.java        (load/save as JSON)
├── theme/
│   ├── Theme.java                  (color palette)
│   └── ThemeManager.java           (Dark / Light / Neon registry)
├── sound/
│   └── SoundManager.java           (synthesized button click)
└── ui/
    ├── CalculatorUI.java           (main window, key bindings)
    ├── DisplayPanel.java           (two-line right-aligned display)
    ├── KeypadPanel.java            (button grid)
    ├── HistoryPanel.java           (scrollable history)
    ├── SettingsDialog.java         (modal settings window)
    └── components/
        ├── RoundedButton.java
        └── RoundedPanel.java
```

---

## Requirements

- **Java 11+** (any JDK with Swing — Temurin, Liberica, Oracle, …)
- That's it. No Maven, Gradle, or third-party libraries needed.

---

## Build & run

### Option A — convenience script

**Windows (PowerShell or cmd):**

```bat
build.bat run
```

**macOS / Linux:**

```bash
chmod +x build.sh
./build.sh run
```

The script compiles into `out/`, packages `out/real-calculator-pro.jar`, and
launches it.

### Option B — plain `javac` + `java`

```bash
mkdir -p out
javac -d out -encoding UTF-8 $(find src/main/java -name "*.java")
java -cp out com.realcalc.Main
```

On Windows (cmd):

```bat
mkdir out
dir /s /b src\main\java\*.java > out\sources.txt
javac -d out -encoding UTF-8 @out\sources.txt
java -cp out com.realcalc.Main
```

### Option C — Maven (optional)

```bash
mvn package
java -jar target/real-calculator-pro.jar
```

---

## Troubleshooting

- **No sound?** Some headless environments don't expose an audio device.
  The app silently disables sound rather than crashing.
- **Display font looks plain?** Install a digital-style font like
  [Digital-7](https://www.dafont.com/digital-7.font) and restart.
- **Settings not persisting?** Check write permissions on your home directory;
  the file lives at `~/.realcalc-pro/settings.json`.
