export type SoundPreset = 'woodblock' | 'beep' | 'rimshot' | 'cowbell' | 'electronic808' | 'custom';

export type AccentLevel = 'accent' | 'normal' | 'sub' | 'mute';

export type Subdivision = '1' | '2' | '3' | '4' | '5' | '6';

export interface TimeSignature {
  numerator: number; // e.g., 4, 3, 5, 6, 7, 11, 12
  denominator: number; // e.g., 4, 8, 16
}

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  timeSignature: TimeSignature;
  subdivision: Subdivision;
  accents: AccentLevel[];
  durationSec?: number;
  key?: string;
  notes?: string;
}

export interface Setlist {
  id: string;
  name: string;
  description?: string;
  songs: SongItem[];
}

export interface PracticeTrainerConfig {
  enabled: boolean;
  mode: 'tempo' | 'mute';
  // Tempo speed trainer
  startBpm: number;
  targetBpm: number;
  bpmStep: number;
  barsPerStep: number;
  loopOnComplete: boolean;
  // Mute / Inner Clock trainer
  muteRatioOn: number; // e.g. 3 bars audible
  muteRatioOff: number; // e.g. 1 bar silent
  randomMute: boolean;
  randomMutePercent: number; // e.g. 30%
}

export interface PolyrhythmConfig {
  enabled: boolean;
  tempo: number; // base BPM
  trackA: {
    beats: number; // e.g. 3
    sound: SoundPreset;
    pitch: number;
    volume: number;
    mute: boolean;
  };
  trackB: {
    beats: number; // e.g. 2, 4, 5
    sound: SoundPreset;
    pitch: number;
    volume: number;
    mute: boolean;
  };
}

export interface AudioSettings {
  sound: SoundPreset;
  pitch: number; // semitone adjustment (-12 to +12)
  volume: number; // 0 to 1
  latencyOffsetMs: number; // -150ms to +150ms
  edgeFlash: boolean;
  flashStyle: 'border' | 'strobe' | 'pulse-dot';
  hapticEnabled: boolean;
  hapticIntensity: 'light' | 'medium' | 'heavy' | 'accent-only';
  highContrast: boolean;
}

export interface BandSyncPeer {
  id: string;
  name: string;
  role: 'host' | 'member';
  instrument: string;
  latencyMs: number;
  status: 'synced' | 'connecting';
}

export interface BandSyncState {
  isHost: boolean;
  connected: boolean;
  roomCode: string;
  deviceName: string;
  instrument: string;
  peers: BandSyncPeer[];
}

export interface BeatEvent {
  beatNumber: number; // 1-indexed (1 to numerator)
  subdivisionIndex: number; // 0 to subdivision-1
  isSubdivision: boolean;
  accent: AccentLevel;
  time: number;
  barNumber: number;
  isSilentBar: boolean;
}
