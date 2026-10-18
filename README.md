# BeatBit — Cross-Platform Precision Metronome & Rhythmic Trainer

**Course:** COM-437-OL01: Mobile Application Development  
**Institution:** Saint Leo University  
**Student:** Connor M. Turner  
**Instructor:** Dr. Marwan Omar  
**Repository:** [https://github.com/Stevenson14/BeatBit-metronome](https://github.com/Stevenson14/BeatBit-metronome)

---

## 🎵 Project Overview

**BeatBit** is a high-precision, cross-platform mobile metronome application designed for musicians, educators, conductors, and live performers. Standard mobile audio APIs often suffer from OS thread scheduling jitter and latency, which degrades tempo consistency. BeatBit solves this with a high-accuracy lookahead audio scheduler, intuitive tactile UI, multi-modal feedback (audio, haptics, and visual strobe), and live stage tools.

---

## ✨ Key Features & Functionality

### 1. Core Metronome Engine
* **Tempo Range:** 20 to 400 BPM with sub-millisecond lookahead scheduling.
* **Rotary Dial & Quick Adjustment:** 360° circular rotary dial with drag resistance, one-touch numeric keypad input, and `±1` / `±5` BPM micro-adjustment bumpers.
* **Standard & Complex Time Signatures:** Simple (2/4, 3/4, 4/4), compound (6/8, 9/8, 12/8), and odd/asymmetric meters (5/4, 7/8, 11/16, etc.) with custom beats per measure up to 16.
* **Dynamic Accent Matrix:** Four distinct beat velocity states per step:
  * 🔴 **High Accent** (Primary downbeat)
  * 🟡 **Standard Beat** (Secondary pulse)
  * ⚪ **Sub-beat** (Inner subdivision)
  * ❌ **Muted Beat** (Silent rhythm test)
* **Subdivisions:** Quarter notes, eighth notes, eighth triplets, sixteenth notes, and sextuplets.
* **Tap Tempo Engine:** Rolling 4-tap median filter interval calculation with reset timeout.
* **Sound Library & Synthesizer:**
  * Clean Digital Beep
  * Acoustic Woodblock
  * Snare Rimshot
  * Cowbell
  * Pitch Transposition Slider (220 Hz – 1760 Hz) for instrument tuning isolation.

### 2. Advanced Practice & Skill-Building Tools
* **Incremental Tempo Trainer:** Automatically ramps BPM up (or down) by customizable increments after a specified number of bars to build technique systematically.
* **Mute / Gap Trainer:** Randomly mutes bars or measures to test and reinforce the musician's internal clock.
* **Polyrhythm Engine:** Dual independent polyrhythmic generators with visual polyrhythm wheel (3:2, 4:3, 5:4, 7:4, etc.) with independent volumes and timbres.
* **Count-In / Practice Timer:** 
  * 1 or 2 introductory count-in bars before full tempo starts.
  * Practice timer with automatic stop and session logging.

### 3. Live Performance & Band Synchronization
* **Setlist Builder & Manager:** Create, reorder, and save songs with specific BPM, time signature, beat accents, and duration into multi-setlist collections with zero-latency offline persistence.
* **Live Stage Mode:** High-contrast, full-screen visibility mode with giant BPM readout and high-visibility flasher for dark stages and recitals.
* **Band Sync Mode:** Host/Client synchronization engine over real-time channels enabling a bandleader/master device to broadcast tempo, play/stop state, and beat cues to all connected devices simultaneously.

### 4. Multi-Modal Visual & Haptic Pulse
* **Screen-Edge Flash & Strobe:** Choice of Full Edge Border Flash, Screen Strobe, or Center Pulse Dot synced frame-accurately with audio downbeats.
* **Haptic Feedback:** Vibration API integration with distinct impulse patterns for accents and weak beats.

### 5. Android Presentation & Screenshot Mode
* **Built-in Android 14 Smartphone Frame:** Includes realistic curved bezel, physical power/volume hardware buttons, speaker grille, centered punch-hole camera, live status bar (clock, 5G, Wi-Fi 6, battery), and bottom gesture navigation pill.
* **1-Click High-Res PNG Capture:** Native instant export for project reports, assignment documentation, and presentations.

---

## 🛠️ Architecture & Tech Stack

* **Front-End Framework:** React 19 / TypeScript / Vite
* **Styling & Design System:** Tailwind CSS v4, Lucide React icons, Framer Motion
* **Audio Scheduler:** Web Audio API with Lookahead Audio Scheduling (combining standard `setTimeout` intervals with hardware-level audio clock `AudioContext.currentTime` scheduling for rock-solid, jitter-free timing)
* **Persistence Layer:** Offline LocalStorage / IndexedDB with JSON import/export
* **Export Utilities:** `html-to-image` for high-resolution canvas snapshotting

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18.x or higher
* npm or yarn or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/Stevenson14/BeatBit-metronome.git

# Navigate to the project directory
cd BeatBit-metronome

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

### Building for Production

```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

---

## 📂 Project Structure

```
├── public/                 # Static assets & icons
├── src/
│   ├── audio/
│   │   └── AudioEngine.ts          # Lookahead audio engine & Web Audio synthesizer
│   ├── components/
│   │   ├── AccentMatrix.tsx        # Dynamic 4-state per-beat velocity grid
│   │   ├── AndroidPhoneFrame.tsx   # Realistic Android 14 hardware & screenshot toolbar
│   │   ├── BandSyncModal.tsx       # Live band multi-device synchronization
│   │   ├── EdgeFlash.tsx           # Visual screen-edge strobe & flash engine
│   │   ├── FloatingDock.tsx        # Bottom mobile navigation bar
│   │   ├── MainMetronome.tsx       # Primary metronome dashboard & tempo presets
│   │   ├── Navbar.tsx              # Header with phone frame toggle & settings
│   │   ├── PolyrhythmEngine.tsx    # Dual-voice polyrhythm generator
│   │   ├── PracticeTrainer.tsx     # Speed-up and gap-trainer practice modules
│   │   ├── RotaryDial.tsx          # 360° rotary knob, keypad, and bumper buttons
│   │   ├── SetlistManager.tsx      # Song list builder and multi-setlist organizer
│   │   ├── SettingsModal.tsx       # Audio latency, sounds, haptics & flash settings
│   │   ├── StageMode.tsx           # High-contrast live stage performance screen
│   │   └── TapTempo.tsx            # Multi-tap tempo calculator
│   ├── data/
│   │   └── presetData.ts           # Curated musical presets (classical, jazz, rock, metal)
│   ├── services/
│   │   └── BandSyncService.ts      # Real-time WebSocket / broadcast sync service
│   ├── types.ts                    # Global TypeScript interfaces & definitions
│   ├── App.tsx                     # Main application orchestrator
│   ├── index.css                   # Tailwind styles and custom animations
│   └── main.tsx                    # Application entry point
├── index.html                      # HTML entry template
├── package.json                    # Project metadata & npm dependencies
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
└── README.md                       # Documentation
```

---

## 📄 License & Attribution
Designed and developed by **Connor M. Turner** for **Saint Leo University COM-437: Mobile Application Development**. All rights reserved.
