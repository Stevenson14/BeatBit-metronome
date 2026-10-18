import {
  AccentLevel,
  AudioSettings,
  BeatEvent,
  PolyrhythmConfig,
  PracticeTrainerConfig,
  SoundPreset,
  Subdivision,
  TimeSignature,
} from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private timerId: number | null = null;

  // Timing state
  private bpm: number = 120;
  private timeSignature: TimeSignature = { numerator: 4, denominator: 4 };
  private subdivision: Subdivision = '1';
  private accents: AccentLevel[] = ['accent', 'normal', 'normal', 'normal'];

  private lookahead: number = 25.0; // milliseconds
  private scheduleAheadTime: number = 0.12; // seconds
  private nextNoteTime: number = 0.0;

  private currentBeatInBar: number = 0; // 0 to numerator - 1
  private currentSubdivision: number = 0; // 0 to subdivisionCount - 1
  private currentBar: number = 0;
  private trainerBarCounter: number = 0;

  // Practice tools
  private trainerConfig: PracticeTrainerConfig | null = null;
  private polyrhythmConfig: PolyrhythmConfig | null = null;

  // Polyrhythm dual timing
  private polyNextTimeA: number = 0.0;
  private polyNextTimeB: number = 0.0;
  private polyBeatA: number = 0;
  private polyBeatB: number = 0;

  // Audio settings
  private settings: AudioSettings = {
    sound: 'woodblock',
    pitch: 0,
    volume: 0.85,
    latencyOffsetMs: 0,
    edgeFlash: true,
    flashStyle: 'border',
    hapticEnabled: true,
    hapticIntensity: 'medium',
    highContrast: false,
  };

  // Custom audio sample buffer
  private customBuffer: AudioBuffer | null = null;

  // Visual event queue for frame-accurate UI & haptic sync
  private beatEventQueue: BeatEvent[] = [];
  private animFrameId: number | null = null;

  // Callbacks
  public onBeatCallback?: (event: BeatEvent) => void;
  public onBarCallback?: (barNumber: number, isSilent: boolean) => void;
  public onTrainerBpmChange?: (newBpm: number) => void;
  public onPolyrhythmBeat?: (track: 'A' | 'B', beatIndex: number, totalBeats: number) => void;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSettings(settings: AudioSettings) {
    this.settings = { ...settings };
  }

  public setCustomBuffer(buffer: AudioBuffer | null) {
    this.customBuffer = buffer;
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(20, Math.min(400, Math.round(newBpm)));
  }

  public getBpm(): number {
    return this.bpm;
  }

  public setTimeSignature(ts: TimeSignature) {
    this.timeSignature = { ...ts };
    // Resize accents array if needed
    if (this.accents.length !== ts.numerator) {
      const newAccents: AccentLevel[] = [];
      for (let i = 0; i < ts.numerator; i++) {
        if (i === 0) newAccents.push('accent');
        else if (i < this.accents.length) newAccents.push(this.accents[i]);
        else newAccents.push('normal');
      }
      this.accents = newAccents;
    }
  }

  public setSubdivision(sub: Subdivision) {
    this.subdivision = sub;
  }

  public setAccents(accents: AccentLevel[]) {
    this.accents = [...accents];
  }

  public setTrainerConfig(config: PracticeTrainerConfig | null) {
    this.trainerConfig = config ? { ...config } : null;
    this.trainerBarCounter = 0;
  }

  public setPolyrhythmConfig(config: PolyrhythmConfig | null) {
    this.polyrhythmConfig = config ? { ...config } : null;
    this.polyBeatA = 0;
    this.polyBeatB = 0;
  }

  public start() {
    if (this.isRunning) return;
    const ctx = this.initContext();

    this.isRunning = true;
    this.currentBeatInBar = 0;
    this.currentSubdivision = 0;
    this.currentBar = 0;
    this.trainerBarCounter = 0;

    // Reset polyrhythm
    this.polyBeatA = 0;
    this.polyBeatB = 0;

    // Start with a small lead-in to ensure smooth initialization
    this.nextNoteTime = ctx.currentTime + 0.05 + (this.settings.latencyOffsetMs / 1000);
    this.polyNextTimeA = this.nextNoteTime;
    this.polyNextTimeB = this.nextNoteTime;

    this.timerId = window.setInterval(() => this.scheduler(), this.lookahead);
    this.startVisualLoop();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.beatEventQueue = [];
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  // Scheduling loop (Chris Wilson lookahead algorithm)
  private scheduler() {
    if (!this.ctx || !this.isRunning) return;

    if (this.polyrhythmConfig && this.polyrhythmConfig.enabled) {
      this.schedulePolyrhythm();
      return;
    }

    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStandardNote(this.nextNoteTime);
      this.advanceNote();
    }
  }

  private isBarSilent(barNum: number): boolean {
    if (!this.trainerConfig || !this.trainerConfig.enabled || this.trainerConfig.mode !== 'mute') {
      return false;
    }

    if (this.trainerConfig.randomMute) {
      // Deterministic per bar or seeded probability
      const hash = Math.sin(barNum * 997) * 10000;
      const prob = hash - Math.floor(hash);
      return prob < (this.trainerConfig.randomMutePercent / 100);
    } else {
      const cycleLength = this.trainerConfig.muteRatioOn + this.trainerConfig.muteRatioOff;
      const positionInCycle = (barNum - 1) % cycleLength;
      return positionInCycle >= this.trainerConfig.muteRatioOn;
    }
  }

  private scheduleStandardNote(time: number) {
    const isSub = this.currentSubdivision > 0;
    const isDownbeat = this.currentBeatInBar === 0 && !isSub;
    const isSilent = this.isBarSilent(this.currentBar + 1);

    const accentLevel = isSub ? 'sub' : this.accents[this.currentBeatInBar] || 'normal';

    // Queue visual / haptic event
    const beatEvent: BeatEvent = {
      beatNumber: this.currentBeatInBar + 1,
      subdivisionIndex: this.currentSubdivision,
      isSubdivision: isSub,
      accent: accentLevel,
      time,
      barNumber: this.currentBar + 1,
      isSilentBar: isSilent,
    };
    this.beatEventQueue.push(beatEvent);

    // If beat is muted or the current bar is in trainer silence mode, don't synthesize audio
    if (accentLevel === 'mute' || isSilent) {
      return;
    }

    // Synthesize note
    this.playTone(time, accentLevel, isDownbeat);
  }

  private advanceNote() {
    const subCount = parseInt(this.subdivision, 10);
    // 60 / bpm gives duration of a quarter note. Adjust for denominator (e.g. 8th notes in 6/8)
    const quarterNoteDuration = 60.0 / this.bpm;
    const beatDuration = quarterNoteDuration * (4.0 / this.timeSignature.denominator);
    const subdivisionDuration = beatDuration / subCount;

    this.nextNoteTime += subdivisionDuration;

    this.currentSubdivision++;
    if (this.currentSubdivision >= subCount) {
      this.currentSubdivision = 0;
      this.currentBeatInBar++;

      if (this.currentBeatInBar >= this.timeSignature.numerator) {
        this.currentBeatInBar = 0;
        this.currentBar++;
        this.trainerBarCounter++;

        // Handle Practice Trainer Tempo Ladder
        this.handleTrainerStep();
      }
    }
  }

  private handleTrainerStep() {
    if (!this.trainerConfig || !this.trainerConfig.enabled) return;

    if (this.trainerConfig.mode === 'tempo') {
      if (this.trainerBarCounter >= this.trainerConfig.barsPerStep) {
        this.trainerBarCounter = 0;
        const target = this.trainerConfig.targetBpm;
        const step = this.trainerConfig.bpmStep;

        if (step > 0 && this.bpm < target) {
          const next = Math.min(target, this.bpm + step);
          this.bpm = next;
          if (this.onTrainerBpmChange) this.onTrainerBpmChange(next);
        } else if (step < 0 && this.bpm > target) {
          const next = Math.max(target, this.bpm + step);
          this.bpm = next;
          if (this.onTrainerBpmChange) this.onTrainerBpmChange(next);
        } else if (this.trainerConfig.loopOnComplete) {
          this.bpm = this.trainerConfig.startBpm;
          if (this.onTrainerBpmChange) this.onTrainerBpmChange(this.bpm);
        }
      }
    }
  }

  // Polyrhythm Scheduling: dual independent tracks over measure duration
  private schedulePolyrhythm() {
    if (!this.ctx || !this.polyrhythmConfig) return;
    const config = this.polyrhythmConfig;
    const tempo = config.tempo || this.bpm;

    // A measure duration based on 4/4 at the polyrhythm tempo
    const measureDuration = (60.0 / tempo) * 4.0;
    const intervalA = measureDuration / config.trackA.beats;
    const intervalB = measureDuration / config.trackB.beats;

    while (this.polyNextTimeA < this.ctx.currentTime + this.scheduleAheadTime) {
      const beatIdx = this.polyBeatA;
      if (!config.trackA.mute) {
        this.playPolyrhythmTone(this.polyNextTimeA, config.trackA.sound, config.trackA.pitch, config.trackA.volume, beatIdx === 0);
      }

      // Visual event
      const eventTime = this.polyNextTimeA;
      this.beatEventQueue.push({
        beatNumber: beatIdx + 1,
        subdivisionIndex: 0,
        isSubdivision: false,
        accent: beatIdx === 0 ? 'accent' : 'normal',
        time: eventTime,
        barNumber: 1,
        isSilentBar: false,
      });

      if (this.onPolyrhythmBeat) {
        setTimeout(() => {
          this.onPolyrhythmBeat?.('A', beatIdx, config.trackA.beats);
        }, Math.max(0, (eventTime - (this.ctx?.currentTime || 0)) * 1000));
      }

      this.polyNextTimeA += intervalA;
      this.polyBeatA = (this.polyBeatA + 1) % config.trackA.beats;
    }

    while (this.polyNextTimeB < this.ctx.currentTime + this.scheduleAheadTime) {
      const beatIdx = this.polyBeatB;
      if (!config.trackB.mute) {
        this.playPolyrhythmTone(this.polyNextTimeB, config.trackB.sound, config.trackB.pitch, config.trackB.volume, beatIdx === 0);
      }

      if (this.onPolyrhythmBeat) {
        const eventTime = this.polyNextTimeB;
        setTimeout(() => {
          this.onPolyrhythmBeat?.('B', beatIdx, config.trackB.beats);
        }, Math.max(0, (eventTime - (this.ctx?.currentTime || 0)) * 1000));
      }

      this.polyNextTimeB += intervalB;
      this.polyBeatB = (this.polyBeatB + 1) % config.trackB.beats;
    }
  }

  // Web Audio Synthesis Algorithms
  private playTone(time: number, accent: AccentLevel, isDownbeat: boolean) {
    if (!this.ctx) return;

    // Pitch multiplier from settings semitones
    const pitchRatio = Math.pow(2, this.settings.pitch / 12);
    const masterVol = this.settings.volume;

    let gainLevel = masterVol;
    if (accent === 'accent') gainLevel *= 1.35;
    else if (accent === 'normal') gainLevel *= 0.95;
    else if (accent === 'sub') gainLevel *= 0.55;

    // If user has a custom loaded audio buffer
    if (this.settings.sound === 'custom' && this.customBuffer) {
      const source = this.ctx.createBufferSource();
      source.buffer = this.customBuffer;
      source.playbackRate.setValueAtTime(pitchRatio * (accent === 'accent' ? 1.2 : accent === 'sub' ? 0.85 : 1.0), time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(Math.min(1.0, gainLevel), time);
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start(time);
      return;
    }

    switch (this.settings.sound) {
      case 'woodblock':
        this.synthWoodblock(time, accent, pitchRatio, gainLevel);
        break;
      case 'beep':
        this.synthBeep(time, accent, pitchRatio, gainLevel);
        break;
      case 'rimshot':
        this.synthRimshot(time, accent, pitchRatio, gainLevel);
        break;
      case 'cowbell':
        this.synthCowbell(time, accent, pitchRatio, gainLevel);
        break;
      case 'electronic808':
        this.synth808(time, accent, pitchRatio, gainLevel);
        break;
      default:
        this.synthWoodblock(time, accent, pitchRatio, gainLevel);
        break;
    }
  }

  // 1. Natural resonant Woodblock synthesis
  private synthWoodblock(time: number, accent: AccentLevel, pitchRatio: number, gainLevel: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    let baseFreq = 840;
    if (accent === 'accent') baseFreq = 1200;
    else if (accent === 'sub') baseFreq = 620;
    baseFreq *= pitchRatio;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, time + 0.008);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq, time);
    filter.Q.setValueAtTime(12, time);

    gain.gain.setValueAtTime(gainLevel * 0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  // 2. Crisp Digital Beep
  private synthBeep(time: number, accent: AccentLevel, pitchRatio: number, gainLevel: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    let freq = 1100;
    if (accent === 'accent') freq = 1760; // High A
    else if (accent === 'sub') freq = 780;
    freq *= pitchRatio;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(gainLevel * 0.75, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.055);
  }

  // 3. Acoustic Rimshot
  private synthRimshot(time: number, accent: AccentLevel, pitchRatio: number, gainLevel: number) {
    if (!this.ctx) return;

    // Body sine
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    let bodyFreq = accent === 'accent' ? 380 : 300;
    bodyFreq *= pitchRatio;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(bodyFreq * 1.8, time);
    osc.frequency.exponentialRampToValueAtTime(bodyFreq, time + 0.015);

    oscGain.gain.setValueAtTime(gainLevel * 0.7, time);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.06);

    // Crack high-pass noise burst
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1400 * pitchRatio, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(gainLevel * 0.55, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.04);
  }

  // 4. Authentic 808 Cowbell
  private synthCowbell(time: number, accent: AccentLevel, pitchRatio: number, gainLevel: number) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    const mult = accent === 'accent' ? 1.25 : accent === 'sub' ? 0.85 : 1.0;
    osc1.type = 'square';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(587 * mult * pitchRatio, time);
    osc2.frequency.setValueAtTime(845 * mult * pitchRatio, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800 * mult * pitchRatio, time);
    filter.Q.setValueAtTime(4, time);

    gain.gain.setValueAtTime(gainLevel * 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.1);
    osc2.stop(time + 0.1);
  }

  // 5. Electronic 808 Click
  private synth808(time: number, accent: AccentLevel, pitchRatio: number, gainLevel: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const mult = accent === 'accent' ? 1.4 : accent === 'sub' ? 0.7 : 1.0;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800 * mult * pitchRatio, time);
    osc.frequency.exponentialRampToValueAtTime(140 * mult * pitchRatio, time + 0.012);

    gain.gain.setValueAtTime(gainLevel * 0.85, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.045);
  }

  // Polyrhythm tone synthesizer
  private playPolyrhythmTone(time: number, sound: SoundPreset, pitch: number, vol: number, isAccent: boolean) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const pitchRatio = Math.pow(2, pitch / 12);

    let freq = isAccent ? 1200 : 700;
    if (sound === 'cowbell') freq = isAccent ? 845 : 587;
    else if (sound === 'electronic808') freq = isAccent ? 1400 : 900;
    freq *= pitchRatio;

    osc.type = sound === 'cowbell' ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    const level = vol * (isAccent ? 0.8 : 0.55);
    gain.gain.setValueAtTime(level, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.06);
  }

  // Frame-accurate visual animation loop synced to audio context time
  private startVisualLoop() {
    const loop = () => {
      if (!this.isRunning) return;
      if (this.ctx) {
        const currentTime = this.ctx.currentTime;
        while (this.beatEventQueue.length > 0 && this.beatEventQueue[0].time <= currentTime + 0.012) {
          const event = this.beatEventQueue.shift();
          if (event) {
            // Trigger visual beat
            if (this.onBeatCallback) {
              this.onBeatCallback(event);
            }
            // Trigger Haptics if enabled
            this.triggerHaptic(event);
          }
        }
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private triggerHaptic(event: BeatEvent) {
    if (!this.settings.hapticEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    if (event.isSilentBar || event.accent === 'mute') return;

    if (this.settings.hapticIntensity === 'accent-only' && event.accent !== 'accent') {
      return;
    }

    let duration = 20;
    if (event.accent === 'accent') {
      duration = this.settings.hapticIntensity === 'heavy' ? 45 : this.settings.hapticIntensity === 'light' ? 22 : 32;
    } else if (event.accent === 'normal') {
      duration = this.settings.hapticIntensity === 'heavy' ? 26 : this.settings.hapticIntensity === 'light' ? 12 : 18;
    } else if (event.accent === 'sub') {
      duration = this.settings.hapticIntensity === 'heavy' ? 12 : 8;
    }

    try {
      navigator.vibrate(duration);
    } catch {
      // Vibration API not permitted or available
    }
  }

  public async decodeAudioFile(file: File): Promise<AudioBuffer> {
    const ctx = this.initContext();
    const arrayBuffer = await file.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  }
}

// Global audio engine singleton
export const audioEngine = new AudioEngine();
