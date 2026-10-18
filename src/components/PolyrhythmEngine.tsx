import React, { useState, useEffect } from 'react';
import { PolyrhythmConfig, SoundPreset } from '../types';
import { Play, Square, Layers, Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';

interface PolyrhythmEngineProps {
  config: PolyrhythmConfig;
  onChangeConfig: (config: PolyrhythmConfig) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const POLY_PRESETS = [
  { name: '3 : 2', a: 3, b: 2, mnemonic: 'Not dif-fi-cult' },
  { name: '4 : 3', a: 4, b: 3, mnemonic: 'Pass the god-damned but-ter' },
  { name: '5 : 4', a: 5, b: 4, mnemonic: 'I will eat the ap-ple' },
  { name: '5 : 3', a: 5, b: 3, mnemonic: 'Eat your damn spinach' },
  { name: '7 : 4', a: 7, b: 4, mnemonic: 'Listen to the sound of mu-sic now' },
];

export const PolyrhythmEngine: React.FC<PolyrhythmEngineProps> = ({
  config,
  onChangeConfig,
  isPlaying,
  onTogglePlay,
}) => {
  const [activeBeatA, setActiveBeatA] = useState<number>(-1);
  const [activeBeatB, setActiveBeatB] = useState<number>(-1);
  const [coincidenceFlash, setCoincidenceFlash] = useState<boolean>(false);

  useEffect(() => {
    audioEngine.onPolyrhythmBeat = (track, beatIndex) => {
      if (track === 'A') {
        setActiveBeatA(beatIndex);
        if (beatIndex === 0 && activeBeatB === 0) {
          setCoincidenceFlash(true);
          setTimeout(() => setCoincidenceFlash(false), 120);
        }
      } else {
        setActiveBeatB(beatIndex);
        if (beatIndex === 0 && activeBeatA === 0) {
          setCoincidenceFlash(true);
          setTimeout(() => setCoincidenceFlash(false), 120);
        }
      }
    };
    return () => {
      audioEngine.onPolyrhythmBeat = undefined;
    };
  }, [activeBeatA, activeBeatB]);

  const updateTrackA = (partial: Partial<PolyrhythmConfig['trackA']>) => {
    onChangeConfig({
      ...config,
      trackA: { ...config.trackA, ...partial },
    });
  };

  const updateTrackB = (partial: Partial<PolyrhythmConfig['trackB']>) => {
    onChangeConfig({
      ...config,
      trackB: { ...config.trackB, ...partial },
    });
  };

  const setPreset = (a: number, b: number) => {
    onChangeConfig({
      ...config,
      trackA: { ...config.trackA, beats: a },
      trackB: { ...config.trackB, beats: b },
    });
  };

  const matchedPreset = POLY_PRESETS.find(
    (p) => p.a === config.trackA.beats && p.b === config.trackB.beats
  );

  return (
    <div className="w-full max-w-md mx-auto flex flex-col space-y-3 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Dual Polyrhythm Engine
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Synchronized cross-rhythms intersecting simultaneously across one measure
          </p>
        </div>

        <button
          id="btn-poly-play"
          onClick={onTogglePlay}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all ${
            isPlaying
              ? 'bg-rose-500 text-white shadow-rose-500/25'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25'
          }`}
        >
          {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
          <span>{isPlaying ? 'Stop Engine' : 'Start Polyrhythm'}</span>
        </button>
      </div>

      {/* Preset Buttons Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-400 font-bold mr-1">Presets:</span>
        {POLY_PRESETS.map((p) => {
          const isSelected = config.trackA.beats === p.a && config.trackB.beats === p.b;
          return (
            <button
              key={p.name}
              onClick={() => setPreset(p.a, p.b)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white hover:bg-neutral-50 text-neutral-600 border border-neutral-200/80 shadow-2xs'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Dual Concentric Circular Visualizer */}
      <div className="bg-white rounded-[28px] border border-neutral-200/80 p-6 shadow-sm flex flex-col items-center">
        <div className="relative w-64 h-64 my-4 flex items-center justify-center">
          {/* Center Coincidence Hub */}
          <div
            className={`absolute w-20 h-20 rounded-full flex flex-col items-center justify-center border transition-all duration-75 z-20 ${
              coincidenceFlash
                ? 'bg-orange-500 text-white border-orange-400 scale-110 shadow-[0_0_25px_rgba(249,115,22,0.4)]'
                : 'bg-neutral-900 text-white border-neutral-800 shadow-md'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
              Ratio
            </span>
            <span className="text-xl font-black font-mono text-white">
              {config.trackA.beats}:{config.trackB.beats}
            </span>
          </div>

          {/* Track A Outer Orbit Ring (Orange) */}
          <div className="absolute inset-0 rounded-full border border-orange-200 bg-orange-50/20">
            {Array.from({ length: config.trackA.beats }).map((_, idx) => {
              const angle = (idx / config.trackA.beats) * 360 - 90;
              const rad = (angle * Math.PI) / 180;
              const r = 110;
              const x = Math.cos(rad) * r;
              const y = Math.sin(rad) * r;
              const isCurrent = isPlaying && activeBeatA === idx;

              return (
                <div
                  key={`a-${idx}`}
                  className={`absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-75 ${
                    isCurrent
                      ? 'bg-orange-500 text-white scale-125 shadow-md shadow-orange-500/40 ring-2 ring-white'
                      : 'bg-white text-orange-600 border border-orange-300 shadow-2xs'
                  }`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>

          {/* Track B Inner Orbit Ring (Emerald / Amber) */}
          <div className="absolute inset-8 rounded-full border border-emerald-200 bg-emerald-50/20">
            {Array.from({ length: config.trackB.beats }).map((_, idx) => {
              const angle = (idx / config.trackB.beats) * 360 - 90;
              const rad = (angle * Math.PI) / 180;
              const r = 70;
              const x = Math.cos(rad) * r;
              const y = Math.sin(rad) * r;
              const isCurrent = isPlaying && activeBeatB === idx;

              return (
                <div
                  key={`b-${idx}`}
                  className={`absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-75 ${
                    isCurrent
                      ? 'bg-emerald-500 text-white scale-125 shadow-md shadow-emerald-500/40 ring-2 ring-white'
                      : 'bg-white text-emerald-700 border border-emerald-300 shadow-2xs'
                  }`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mnemonic Banner */}
        {matchedPreset && (
          <div className="mt-2 px-4 py-2 rounded-full bg-neutral-100 border border-neutral-200/60 text-center">
            <span className="text-[11px] text-neutral-500 mr-2 font-medium">Mnemonic:</span>
            <span className="text-xs font-bold text-neutral-800 italic">
              &ldquo;{matchedPreset.mnemonic}&rdquo;
            </span>
          </div>
        )}
      </div>

      {/* Track Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Track A */}
        <div className="bg-white rounded-[24px] border border-neutral-200/80 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Track A (Outer)
              </span>
            </div>
            <button
              onClick={() => updateTrackA({ mute: !config.trackA.mute })}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                config.trackA.mute
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-600'
              }`}
            >
              {config.trackA.mute ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-600 font-bold mb-1">
              <span>Beats</span>
              <span className="font-mono text-orange-600">{config.trackA.beats}</span>
            </div>
            <input
              type="range"
              min="2"
              max="9"
              value={config.trackA.beats}
              onChange={(e) => updateTrackA({ beats: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutral-500 font-bold mb-1">Sound</label>
            <select
              value={config.trackA.sound}
              onChange={(e) => updateTrackA({ sound: e.target.value as SoundPreset })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs text-neutral-800"
            >
              <option value="woodblock">Woodblock (High Pitch)</option>
              <option value="beep">Digital Beep</option>
              <option value="rimshot">Acoustic Rimshot</option>
              <option value="cowbell">808 Cowbell</option>
              <option value="electronic808">Electronic Click</option>
            </select>
          </div>
        </div>

        {/* Track B */}
        <div className="bg-white rounded-[24px] border border-neutral-200/80 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Track B (Inner)
              </span>
            </div>
            <button
              onClick={() => updateTrackB({ mute: !config.trackB.mute })}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                config.trackB.mute
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-600'
              }`}
            >
              {config.trackB.mute ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-600 font-bold mb-1">
              <span>Beats</span>
              <span className="font-mono text-emerald-700">{config.trackB.beats}</span>
            </div>
            <input
              type="range"
              min="2"
              max="9"
              value={config.trackB.beats}
              onChange={(e) => updateTrackB({ beats: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutral-500 font-bold mb-1">Sound</label>
            <select
              value={config.trackB.sound}
              onChange={(e) => updateTrackB({ sound: e.target.value as SoundPreset })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-xs text-neutral-800"
            >
              <option value="cowbell">808 Cowbell</option>
              <option value="woodblock">Woodblock</option>
              <option value="beep">Digital Beep</option>
              <option value="rimshot">Acoustic Rimshot</option>
              <option value="electronic808">Electronic Click</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
