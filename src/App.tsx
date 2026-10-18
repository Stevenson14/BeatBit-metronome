import React, { useState, useEffect, useCallback } from 'react';
import {
  AccentLevel,
  AudioSettings,
  BandSyncState,
  BeatEvent,
  PolyrhythmConfig,
  PracticeTrainerConfig,
  Setlist,
  SongItem,
  Subdivision,
  TimeSignature,
} from './types';
import { audioEngine } from './audio/AudioEngine';
import { bandSyncService } from './services/BandSyncService';
import { INITIAL_SETLISTS } from './data/presetData';
import { Navbar } from './components/Navbar';
import { FloatingDock, ActiveTab } from './components/FloatingDock';
import { MainMetronome } from './components/MainMetronome';
import { SetlistManager } from './components/SetlistManager';
import { PracticeTrainer } from './components/PracticeTrainer';
import { PolyrhythmEngine } from './components/PolyrhythmEngine';
import { StageMode } from './components/StageMode';
import { BandSyncModal } from './components/BandSyncModal';
import { SettingsModal } from './components/SettingsModal';
import { EdgeFlash } from './components/EdgeFlash';
import { AndroidPhoneFrame } from './components/AndroidPhoneFrame';

export default function App() {
  // Metronome State
  const [bpm, setBpm] = useState<number>(120);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>({ numerator: 4, denominator: 4 });
  const [subdivision, setSubdivision] = useState<Subdivision>('1');
  const [accents, setAccents] = useState<AccentLevel[]>(['accent', 'normal', 'normal', 'normal']);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [currentBar, setCurrentBar] = useState<number>(1);
  const [beatFlash, setBeatFlash] = useState<boolean>(false);
  const [currentAccent, setCurrentAccent] = useState<AccentLevel>('normal');
  const [isSilentBar, setIsSilentBar] = useState<boolean>(false);

  // Active View Tab (Defaults to realistic Android Phone Mockup Frame for screenshot presentation)
  const [activeTab, setActiveTab] = useState<ActiveTab>('metronome');
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  // Setlists
  const [setlists, setSetlists] = useState<Setlist[]>(() => {
    const saved = localStorage.getItem('beatbit_setlists');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_SETLISTS;
  });
  const [activeSetlistId, setActiveSetlistId] = useState<string>(setlists[0]?.id || 'setlist_main');
  const [activeSongId, setActiveSongId] = useState<string | null>(null);

  // Practice Trainer State
  const [trainerConfig, setTrainerConfig] = useState<PracticeTrainerConfig>({
    enabled: false,
    mode: 'tempo',
    startBpm: 100,
    targetBpm: 160,
    bpmStep: 4,
    barsPerStep: 4,
    loopOnComplete: false,
    muteRatioOn: 3,
    muteRatioOff: 1,
    randomMute: false,
    randomMutePercent: 30,
  });

  // Polyrhythm State
  const [polyrhythmConfig, setPolyrhythmConfig] = useState<PolyrhythmConfig>({
    enabled: false,
    tempo: 120,
    trackA: {
      beats: 3,
      sound: 'woodblock',
      pitch: 4,
      volume: 0.85,
      mute: false,
    },
    trackB: {
      beats: 2,
      sound: 'cowbell',
      pitch: -3,
      volume: 0.8,
      mute: false,
    },
  });

  // Hardware & Audio Settings
  const [settings, setSettings] = useState<AudioSettings>({
    sound: 'woodblock',
    pitch: 0,
    volume: 0.85,
    latencyOffsetMs: 0,
    edgeFlash: true,
    flashStyle: 'border',
    hapticEnabled: true,
    hapticIntensity: 'medium',
    highContrast: false,
  });

  // Modals & Stage Mode
  const [isStageMode, setIsStageMode] = useState<boolean>(false);
  const [isBandSyncOpen, setIsBandSyncOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Band Sync State
  const [bandSyncState, setBandSyncState] = useState<BandSyncState>(bandSyncService.getState());

  // Save setlists to localStorage
  useEffect(() => {
    localStorage.setItem('beatbit_setlists', JSON.stringify(setlists));
  }, [setlists]);

  // Sync state with AudioEngine
  useEffect(() => {
    audioEngine.setBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    audioEngine.setTimeSignature(timeSignature);
  }, [timeSignature]);

  useEffect(() => {
    audioEngine.setSubdivision(subdivision);
  }, [subdivision]);

  useEffect(() => {
    audioEngine.setAccents(accents);
  }, [accents]);

  useEffect(() => {
    audioEngine.setTrainerConfig(trainerConfig.enabled ? trainerConfig : null);
  }, [trainerConfig]);

  useEffect(() => {
    audioEngine.setPolyrhythmConfig(polyrhythmConfig.enabled ? polyrhythmConfig : null);
  }, [polyrhythmConfig]);

  useEffect(() => {
    audioEngine.setSettings(settings);
  }, [settings]);

  // Register AudioEngine Callbacks
  useEffect(() => {
    audioEngine.onBeatCallback = (event: BeatEvent) => {
      setCurrentBeat(event.beatNumber);
      setCurrentBar(event.barNumber);
      setCurrentAccent(event.accent);
      setIsSilentBar(event.isSilentBar);

      // Trigger flash
      setBeatFlash(true);
      setTimeout(() => setBeatFlash(false), 90);
    };

    audioEngine.onTrainerBpmChange = (newBpm: number) => {
      setBpm(newBpm);
      if (bandSyncState.connected && bandSyncState.isHost) {
        bandSyncService.broadcastTempo(newBpm);
      }
    };

    const unsubSync = bandSyncService.subscribe(setBandSyncState);

    // BandSync remote slave callbacks
    bandSyncService.setCallbacks({
      onRemotePlay: (remoteBpm) => {
        setBpm(remoteBpm);
        audioEngine.setBpm(remoteBpm);
        audioEngine.start();
        setIsPlaying(true);
      },
      onRemoteStop: () => {
        audioEngine.stop();
        setIsPlaying(false);
      },
      onRemoteTempo: (remoteBpm) => {
        setBpm(remoteBpm);
        audioEngine.setBpm(remoteBpm);
      },
    });

    return () => {
      unsubSync();
    };
  }, [bandSyncState]);

  // Play / Pause Master Toggle
  const handleTogglePlay = useCallback(() => {
    const nextPlaying = !isPlaying;
    if (nextPlaying) {
      audioEngine.start();
      setIsPlaying(true);
      if (bandSyncState.connected && bandSyncState.isHost) {
        bandSyncService.broadcastPlay(bpm, timeSignature, subdivision);
      }
    } else {
      audioEngine.stop();
      setIsPlaying(false);
      setBeatFlash(false);
      if (bandSyncState.connected && bandSyncState.isHost) {
        bandSyncService.broadcastStop();
      }
    }
  }, [isPlaying, bpm, timeSignature, subdivision, bandSyncState]);

  const handleBpmChange = useCallback(
    (newBpm: number) => {
      setBpm(newBpm);
      audioEngine.setBpm(newBpm);
      if (bandSyncState.connected && bandSyncState.isHost) {
        bandSyncService.broadcastTempo(newBpm);
      }
    },
    [bandSyncState]
  );

  const handleResetCounters = () => {
    setCurrentBeat(1);
    setCurrentBar(1);
  };

  // Setlist Song Loading
  const currentSetlist = setlists.find((s) => s.id === activeSetlistId) || setlists[0];
  const activeSong = currentSetlist?.songs.find((s) => s.id === activeSongId) || null;

  // Next song in current setlist for Stage Mode cueing
  const activeSongIndex = activeSong ? currentSetlist.songs.findIndex((s) => s.id === activeSong.id) : -1;
  const nextSong =
    currentSetlist && activeSongIndex >= 0 && activeSongIndex < currentSetlist.songs.length - 1
      ? currentSetlist.songs[activeSongIndex + 1]
      : null;

  const handleLoadSong = useCallback(
    (song: SongItem, autoPlay: boolean = true) => {
      setActiveSongId(song.id);
      setBpm(song.bpm);
      setTimeSignature(song.timeSignature);
      setSubdivision(song.subdivision);
      setAccents(song.accents);

      audioEngine.setBpm(song.bpm);
      audioEngine.setTimeSignature(song.timeSignature);
      audioEngine.setSubdivision(song.subdivision);
      audioEngine.setAccents(song.accents);

      if (autoPlay) {
        audioEngine.stop();
        audioEngine.start();
        setIsPlaying(true);
        if (bandSyncState.connected && bandSyncState.isHost) {
          bandSyncService.broadcastPlay(song.bpm, song.timeSignature, song.subdivision);
        }
      }
    },
    [bandSyncState]
  );

  const handleAdvanceToNextSong = () => {
    if (nextSong) {
      handleLoadSong(nextSong, isPlaying);
    }
  };

  // Keyboard Shortcuts (Space, T, Arrows, S, M, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        handleBpmChange(Math.min(400, bpm + 1));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleBpmChange(Math.max(20, bpm - 1));
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        setIsStageMode((prev) => !prev);
      } else if (e.code === 'Escape') {
        setIsStageMode(false);
        setIsBandSyncOpen(false);
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleBpmChange, bpm]);

  // Main screen views
  const renderScreenContent = () => {
    switch (activeTab) {
      case 'metronome':
        return (
          <MainMetronome
            bpm={bpm}
            timeSignature={timeSignature}
            subdivision={subdivision}
            accents={accents}
            currentBeat={currentBeat}
            currentBar={currentBar}
            isPlaying={isPlaying}
            beatFlash={beatFlash}
            isSilentBar={isSilentBar}
            activeSong={activeSong}
            onTogglePlay={handleTogglePlay}
            onChangeBpm={handleBpmChange}
            onChangeTimeSignature={(ts) => {
              setTimeSignature(ts);
              const newAccents: AccentLevel[] = [];
              for (let i = 0; i < ts.numerator; i++) {
                newAccents.push(i === 0 ? 'accent' : 'normal');
              }
              setAccents(newAccents);
            }}
            onChangeSubdivision={setSubdivision}
            onChangeAccents={setAccents}
            onResetCounters={handleResetCounters}
            onNavigateToSetlists={() => setActiveTab('setlists')}
            onOpenStageMode={() => setIsStageMode(true)}
          />
        );

      case 'setlists':
        return (
          <div className="w-full h-full overflow-y-auto no-scrollbar py-2">
            <SetlistManager
              setlists={setlists}
              activeSetlistId={activeSetlistId}
              activeSongId={activeSongId}
              onSelectSetlist={setActiveSetlistId}
              onLoadSong={handleLoadSong}
              onUpdateSetlists={setSetlists}
            />
          </div>
        );

      case 'trainer':
        return (
          <div className="w-full h-full overflow-y-auto no-scrollbar py-2">
            <PracticeTrainer
              config={trainerConfig}
              currentBpm={bpm}
              currentBar={currentBar}
              isPlaying={isPlaying}
              onUpdateConfig={setTrainerConfig}
              onStartTrainer={() => {
                if (!isPlaying) handleTogglePlay();
              }}
            />
          </div>
        );

      case 'polyrhythm':
        return (
          <div className="w-full h-full overflow-y-auto no-scrollbar py-2">
            <PolyrhythmEngine
              config={polyrhythmConfig}
              onChangeConfig={(cfg) => {
                setPolyrhythmConfig(cfg);
                audioEngine.setPolyrhythmConfig(cfg.enabled ? cfg : null);
              }}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
            />
          </div>
        );
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#f4f5f8] text-neutral-800 flex flex-col justify-between overflow-hidden selection:bg-orange-500 selection:text-white font-sans antialiased">
      {/* Visual Screen Edge Flash */}
      {settings.edgeFlash && (
        <EdgeFlash
          active={beatFlash}
          accent={currentAccent}
          flashStyle={settings.flashStyle}
          isSilent={isSilentBar}
        />
      )}

      {/* When Phone Mockup Frame mode is enabled (optimized for screenshots & presentations) */}
      {isPhoneFrame ? (
        <AndroidPhoneFrame
          isPhoneFrame={isPhoneFrame}
          onToggleFrame={() => setIsPhoneFrame(false)}
        >
          {/* Top Lean Android App Bar */}
          <Navbar
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onOpenStageMode={() => setIsStageMode(true)}
            onOpenBandSync={() => setIsBandSyncOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            bandSyncState={bandSyncState}
            isPlaying={isPlaying}
            isPhoneFrame={isPhoneFrame}
            onTogglePhoneFrame={() => setIsPhoneFrame(false)}
            activeSong={activeSong}
          />

          {/* In-Frame View Area (100% fits on single screen) */}
          <div className="flex-1 overflow-hidden px-3 py-1 flex flex-col justify-between items-center">
            {renderScreenContent()}
          </div>

          {/* In-Frame Bottom Navigation Bar */}
          <FloatingDock
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            isPlaying={isPlaying}
          />
        </AndroidPhoneFrame>
      ) : (
        /* Real Mobile View: Fits 100% within one mobile screen edge-to-edge */
        <div className="flex-1 flex flex-col justify-between h-full max-h-[100dvh] overflow-hidden max-w-md w-full mx-auto">
          {/* Top Lean Android App Bar */}
          <Navbar
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onOpenStageMode={() => setIsStageMode(true)}
            onOpenBandSync={() => setIsBandSyncOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            bandSyncState={bandSyncState}
            isPlaying={isPlaying}
            isPhoneFrame={isPhoneFrame}
            onTogglePhoneFrame={() => setIsPhoneFrame(true)}
            activeSong={activeSong}
          />

          {/* Main Content Area (Unified Single Screen, zero vertical scroll on Metronome) */}
          <main className="flex-1 overflow-hidden px-3 py-1.5 flex flex-col justify-between items-center w-full">
            {renderScreenContent()}
          </main>

          {/* Android Bottom Navigation Dock */}
          <FloatingDock
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            isPlaying={isPlaying}
          />
        </div>
      )}

      {/* Full-Screen Stage Mode Overlay */}
      {isStageMode && (
        <StageMode
          bpm={bpm}
          timeSignature={timeSignature}
          accents={accents}
          currentBeat={currentBeat}
          currentBar={currentBar}
          isPlaying={isPlaying}
          activeSong={activeSong}
          nextSong={nextSong}
          onTogglePlay={handleTogglePlay}
          onChangeBpm={handleBpmChange}
          onNextSong={handleAdvanceToNextSong}
          onExitStageMode={() => setIsStageMode(false)}
          onTapTempo={() => {
            const btn = document.getElementById('btn-tap-tempo');
            btn?.click();
          }}
        />
      )}

      {/* Band Sync Real-Time Modal */}
      <BandSyncModal
        isOpen={isBandSyncOpen}
        onClose={() => setIsBandSyncOpen(false)}
        currentBpm={bpm}
        isPlaying={isPlaying}
        timeSignature={timeSignature}
        subdivision={subdivision}
      />

      {/* Settings & Hardware Config Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
    </div>
  );
}
