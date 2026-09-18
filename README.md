# Melodict 🎼

Melodict is an interactive browser-based sheet music studio and virtual instrument web application. Users can author custom musical notation on an interactive staff, edit lyrics in-place, play back compositions with sample-based virtual instruments using Web Audio API and `smplr`, and export scores in multiple formats (MIDI, MusicXML, JSON).

---

## ✨ Features

- **Interactive Sheet Music Notation:**
  - Custom SVG notation engine rendering treble clefs, key signatures, time signatures, barlines, noteheads, stems, eighth/sixteenth flags, accidentals, and ledger lines.
  - Multi-line score systems with add/remove line capabilities and system measure markers (*5*, *9*, *13*).
  - Per-line measure additions and reductions (`+ Measure`, `- Measure`).
  - Key signature engine with standard sharp/flat glyph layouts (C, G, D, A, E, F, B♭, E♭, A♭) and automatic diatonic pitch alteration.
  - Standard first-line-only time signature display ($4/4$, $3/4$, $2/4$, $6/8$, $3/8$).

- **In-Place Editing:**
  - Inline title, composer, and lyric editing with 500ms debouncing and auto-save on blur.
  - Optional note name labels toggle (`🏷️ Labels: ON / OFF`) displayed above noteheads.
  - Generous click targets and selection glow halo with selected note inspector banner.
  - Arrow key shortcuts (`ArrowUp` / `ArrowDown`) for semitone pitch transposition.

- **Audio Engine & Virtual Instruments:**
  - Powered by Web Audio API and `smplr` sample libraries with low-latency synthesizer fallbacks.
  - Virtual instruments: Concert Grand Piano, Rhodes Electric Piano, String Ensemble, Solo Violin, Concert Flute, Classical Guitar, Rosewood Marimba, and Analog Synth Lead.
  - Responsive metronome audio click with downbeat accent.
  - User-gesture audio unlocking to adhere to browser autoplay policies.

- **Interactive Virtual Piano:**
  - 37-key piano roll (C3 to C6) with ivory and ebony keys.
  - Real-time note auditioning, score note insertion, and selected note pitch adjustment.
  - Visual key glow synchronized to score playback.

- **Navigation & Tool Palette:**
  - Dedicated Song Tabs bar with tab switching, inline double-click renaming, new song creation, and tab closing.
  - Tools palette:
    - ✏️ **Note Input Tool:** Click anywhere on the staff grid to place notes.
    - 🖱️ **Selection Tool:** Click notes to select, inspect, and modify.
    - ✋ **Hand Tool (Pan):** Click and drag anywhere to glide horizontally across measures and vertically across staff lines.
    - 🧹 **Eraser Tool:** Click notes to remove them.
  - Transport controls: Play / Pause, Stop / Rewind, Loop Repeat, and Metronome toggle.
  - Undo / Redo history stack.

- **Multiple Export Formats:**
  - **Standard MIDI (`.mid`):** Generated binary MIDI file format 0 with variable-length delta times, tempo (BPM), time signature meta events, and note on/off events.
  - **MusicXML (`.xml`):** Formatted XML compatible with MuseScore, Sibelius, Finale, and Dorico, including lyrics.
  - **Melodict Project (`.json`):** Full serialized score representation for project persistence.

- **Theming & Color Palettes:**
  - Centralized theme library using `styled-components`.
  - Live palette switcher with three built-in themes:
    - 🎨 **Dark Charcoal** (Default)
    - 🎨 **Midnight Blue**
    - 🎨 **Vintage Parchment**

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** `styled-components` with custom centralized theme system
- **Audio Engine:** Web Audio API + `smplr`
- **Icons:** `lucide-react`
- **Testing:** Jest + `ts-jest`

---

## 📁 Project Architecture

```text
src/
├── app/
│   ├── api/
│   │   ├── instruments/      # Mock instruments API
│   │   └── scores/           # Mock scores REST API (GET, POST, PUT, DELETE)
│   ├── layout.tsx            # App shell with Theme & Score providers
│   └── page.tsx              # Single-page MVP application layout
├── audio/
│   ├── AudioEngine.ts        # smplr + Web Audio synthesizer engine
│   ├── audio.constants.ts    # MIDI/pitch mapping, instrument catalog
│   ├── audio.types.ts        # Audio engine interfaces
│   └── midiExport.ts         # Binary MIDI file (.mid) generator
├── components/
│   ├── EditableText/         # In-place debounced editable text
│   ├── ExportModal/          # Score export dialog (JSON, MIDI, MusicXML)
│   ├── Header/               # Top status bar, instrument & theme selectors
│   ├── NotationCanvas/       # Interactive SVG musical staff & notation engine
│   ├── SongTabs/             # Multi-song tab switcher & manager
│   ├── TransportToolbar/     # Playback controls, durations, tools palette
│   └── VirtualPiano/         # 37-key interactive piano roll
├── context/
│   └── ScoreContext.tsx      # Central score state, history, and transport
├── mock/
│   └── scores.data.ts        # Initial scores ("Lavender's Blue", "Ode to Joy")
├── theme/
│   ├── GlobalStyles.ts       # Global CSS reset and scrollbar styling
│   ├── ThemeProvider.tsx     # Theme context & live palette switcher
│   ├── theme.constants.ts    # Dark, Midnight, Parchment color palettes
│   └── theme.types.ts        # Typed theme tokens
└── types/
    └── score.types.ts        # Score, ScoreLine, Measure, Note definitions
```

Each component follows modular organization containing separated files for constants, types, styles, component implementation, and tests:

```text
ComponentName/
├── ComponentName.constants.ts
├── ComponentName.types.ts
├── ComponentName.component.tsx
├── ComponentName.styles.ts
└── ComponentName.test.tsx
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone repository or navigate to workspace directory:

   ```bash
   git clone <repository-url>
   cd Melodict
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

Run the test suite using Jest:

```bash
npm test
```

---

## 📦 Production Build

Create an optimized production build:

```bash
npm run build
npm run start
```
