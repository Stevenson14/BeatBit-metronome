import React, { useState } from 'react';
import { AccentLevel, SongItem, Subdivision, TimeSignature } from '../types';
import { RotaryDial } from './RotaryDial';
import { TapTempo } from './TapTempo';
import {
  Play,
  Square,
  RotateCcw,
  VolumeX,
  Music,
  Maximize2,
  ChevronRight,
  Sliders,
  Check,
} from 'lucide-react';
import { getTempoMarking } from '../data/presetData';

interface MainMetronomeProps {
  bpm: number;
  timeSignature: TimeSignature;
  subdivision: Subdivision;
  accents: AccentLevel[];
  currentBeat: number;
  currentBar: number;
  isPlaying: boolean;
  beatFlash: boolean;
  isSilentBar: boolean;
  activeSong: SongItem | null;
  onTogglePlay: () => void;
  onChangeBpm: (bpm: number) => void;
  onChangeTimeSignature: (ts: TimeSignature) => void;
  onChangeSubdivision: (sub: Subdivision) => void;
  onChangeAccents: (accents: AccentLevel[]) => void;
  onResetCounters: () => void;
  onNavigateToSetlists: () => void;
  onOpenStageMode: () => void;
}

const COMMON_METERS: Array<{ label: string; num: number; den: number }> = [
  { label: '4/4', num: 4, den: 4 },
  { label: '3/4', num: 3, den: 4 },
  { label: '2/4', num: 2, den: 4 },
  { label: '6/8', num: 6, den: 8 },
  { label: '5/4', num: 5, den: 4 },
  { label: '7/8', num: 7, den: 8 },
];

const SUBDIVISIONS: Array<{ id: Subdivision; label: string; symbol: string }> = [
  { id: '1', label: 'Quarter', symbol: '♩' },
  { id: '2', label: 'Eighths', symbol: '♫' },
  { id: '3', label: 'Triplets', symbol: '3' },
  { id: '4', label: 'Sixteenths', symbol: '♬' },
];

const ACCENT_CYCLE: Record<AccentLevel, AccentLevel> = {
  accent: 'normal',
  normal: 'sub',
  sub: 'mute',
  mute: 'accent',
};

export const MainMetronome: React.FC<MainMetronomeProps> = ({
  bpm,
  timeSignature,
  subdivision,
  accents,
  currentBeat,
  currentBar,
  isPlaying,
  beatFlash,
  isSilentBar,
  activeSong,
  onTogglePlay,
  onChangeBpm,
  onChangeTimeSignature,
  onChangeSubdivision,
  onChangeAccents,
  onResetCounters,
  onNavigateToSetlists,
  onOpenStageMode,
}) => {
  const [showMeterModal, setShowMeterModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [customNum, setCustomNum] = useState(timeSignature.numerator);
  const [customDen, setCustomDen] = useState(timeSignature.denominator);

  const numBeats = timeSignature.numerator;
  const currentAccents = [...accents];
  while (currentAccents.length < numBeats) {
    currentAccents.push(currentAccents.length === 0 ? 'accent' : 'normal');
  }

  const handleCycleBeat = (index: number) => {
    const updated = [...currentAccents];
    const current = updated[index] || 'normal';
    updated[index] = ACCENT_CYCLE[current];
    onChangeAccents(updated.slice(0, numBeats));
  };

  const handleCycleSubdivision = () => {
    const order: Subdivision[] = ['1', '2', '3', '4'];
    const idx = order.indexOf(subdivision);
    const next = order[(idx + 1) % order.length];
    onChangeSubdivision(next);
  };

  const handleApplyCustomMeter = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeTimeSignature({ numerator: customNum, denominator: customDen });
    setShowMeterModal(false);
  };

  const currentAccent = currentAccents[currentBeat - 1] || 'normal';
  const activeSubdivisionObj = SUBDIVISIONS.find((s) => s.id === subdivision) || SUBDIVISIONS[0];

  return (
    <div className="w-full max-w-sm sm:max-w-md flex flex-col justify-between items-center h-full space-y-2.5 select-none">
      {/* 1. Top Quick Meter & Song Status Bar (Compact Pill Row) */}
      <div className="w-full flex items-center justify-between gap-1.5 px-0.5">
        <div className="flex items-center gap-1.5">
          {/* Meter Selector Pill */}
          <button
            onClick={() => setShowMeterModal(true)}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200/90 shadow-2xs text-xs font-black font-mono text-neutral-800 flex items-center gap-1 transition-all"
            title="Change Time Signature"
          >
            <span>{timeSignature.numerator}/{timeSignature.denominator}</span>
            <span className="text-[10px] text-neutral-400">▾</span>
          </button>

          {/* Subdivision Pill */}
          <button
            onClick={handleCycleSubdivision}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200/90 shadow-2xs text-xs font-bold text-neutral-700 flex items-center gap-1.5 transition-all"
            title="Tap to change subdivision"
          >
            <span className="text-sm font-serif text-orange-500">{activeSubdivisionObj.symbol}</span>
            <span className="text-[11px] uppercase tracking-wider">{activeSubdivisionObj.label}</span>
          </button>
        </div>

        {/* Right: Measure / Bar Counter Pill */}
        <div className="flex items-center gap-1 bg-white border border-neutral-200/90 rounded-full px-2.5 py-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            BAR
          </span>
          <span className="text-xs font-black font-mono text-neutral-800">
            {currentBar > 0 ? currentBar : 1}
          </span>
          <button
            onClick={onResetCounters}
            className="p-0.5 ml-0.5 text-neutral-400 hover:text-neutral-700 transition-colors"
            title="Reset bar counter"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Loaded Song Chip (if active) */}
      {activeSong && (
        <div
          onClick={onNavigateToSetlists}
          className="w-full flex items-center justify-between px-3 py-1 rounded-xl bg-orange-50 border border-orange-200/80 cursor-pointer hover:bg-orange-100/70 transition-colors"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Music className="w-3 h-3 text-orange-500 shrink-0" />
            <span className="text-[11px] font-bold text-orange-950 truncate">
              {activeSong.title}
            </span>
            <span className="text-[10px] text-orange-600 truncate">— {activeSong.artist}</span>
          </div>
          <ChevronRight className="w-3 h-3 text-orange-400 shrink-0" />
        </div>
      )}

      {/* Silent Measure Alert (for practice trainer) */}
      {isSilentBar && isPlaying && (
        <div className="w-full bg-amber-50 border border-amber-300 rounded-xl py-1 text-center animate-pulse">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center justify-center gap-1">
            <VolumeX className="w-3 h-3 text-amber-600" />
            Mute Bar Active
          </span>
        </div>
      )}

      {/* 2. Compact Interactive Beat Accent Matrix (Single Horizontal Row) */}
      <div className="w-full bg-white rounded-2xl border border-neutral-200/80 p-2 shadow-2xs">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${numBeats}, minmax(0, 1fr))` }}>
          {Array.from({ length: numBeats }).map((_, idx) => {
            const beatNum = idx + 1;
            const level = currentAccents[idx] || 'normal';
            const isCurrent = isPlaying && currentBeat === beatNum;

            let badgeColor = 'bg-neutral-100 text-neutral-600';
            let label = 'MID';
            let ringStyle = '';

            if (level === 'accent') {
              badgeColor = 'bg-orange-500 text-white';
              label = 'MAX';
            } else if (level === 'sub') {
              badgeColor = 'bg-neutral-200 text-neutral-500';
              label = 'SUB';
            } else if (level === 'mute') {
              badgeColor = 'bg-rose-100 text-rose-600 border border-rose-200';
              label = 'MUT';
            }

            if (isCurrent) {
              ringStyle =
                level === 'accent'
                  ? 'ring-2 ring-orange-500 scale-105 shadow-sm'
                  : 'ring-2 ring-emerald-500 scale-105 shadow-sm';
            }

            return (
              <button
                key={idx}
                onClick={() => handleCycleBeat(idx)}
                className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-75 select-none ${badgeColor} ${ringStyle}`}
                title={`Beat ${beatNum}: ${level} (Tap to cycle)`}
              >
                <span className="text-xs font-black font-mono leading-none">{beatNum}</span>
                <span className="text-[8px] font-bold tracking-tighter uppercase mt-0.5 leading-none opacity-85">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Hero Centerpiece: Rotary Dial & Bumpers */}
      <div className="w-full flex flex-col items-center justify-center my-auto py-1">
        <RotaryDial
          bpm={bpm}
          onChange={onChangeBpm}
          isPlaying={isPlaying}
          beatFlash={beatFlash}
          accentState={currentAccent}
          size={190}
        />
      </div>

      {/* 4. Tactile Bottom Action Bar (Tap Tempo, Master Play, Stage Mode) */}
      <div className="w-full flex items-center justify-between gap-3 pt-1 px-1">
        {/* Left: Tap Tempo */}
        <TapTempo onBpmCalculated={onChangeBpm} compact={true} />

        {/* Center: Master Play/Stop Button (Hero Circular Pulse Button) */}
        <button
          id="btn-metronome-play"
          onClick={onTogglePlay}
          className={`relative flex items-center justify-center w-20 h-20 rounded-full font-black text-white transition-all duration-100 active:scale-95 shadow-lg ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
              : 'bg-gradient-to-tr from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/35'
          }`}
          style={{ minWidth: '76px', minHeight: '76px' }}
          title={isPlaying ? 'Stop (Space)' : 'Start (Space)'}
        >
          {/* Pulsing ring when playing */}
          {isPlaying && (
            <span className="absolute inset-0 rounded-full border-2 border-rose-400 animate-ping opacity-60 pointer-events-none" />
          )}

          {isPlaying ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current ml-1" />
          )}
        </button>

        {/* Right: Stage Mode Full-Screen Shortcut */}
        <button
          onClick={onOpenStageMode}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200/90 shadow-2xs text-neutral-800 transition-all active:scale-95"
          title="Open High-Contrast Stage Mode (S)"
        >
          <Maximize2 className="w-5 h-5 text-orange-500" />
          <span className="text-[10px] font-black tracking-tight mt-0.5 leading-none">STAGE</span>
        </button>
      </div>

      {/* Modal / Sheet for Time Signature Selection */}
      {showMeterModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-neutral-200 p-5 w-full max-w-xs shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-neutral-900">Time Signature</h3>
              <button
                onClick={() => setShowMeterModal(false)}
                className="text-xs font-bold text-neutral-400 hover:text-neutral-700"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {COMMON_METERS.map((m) => {
                const isSelected =
                  timeSignature.numerator === m.num && timeSignature.denominator === m.den;
                return (
                  <button
                    key={m.label}
                    onClick={() => {
                      onChangeTimeSignature({ numerator: m.num, denominator: m.den });
                      setShowMeterModal(false);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold font-mono transition-all ${
                      isSelected
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Meter inputs */}
            <form onSubmit={handleApplyCustomMeter} className="pt-2 border-t border-neutral-100">
              <span className="text-[11px] font-bold text-neutral-500 block mb-1.5">Custom Meter</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={customNum}
                  onChange={(e) => setCustomNum(parseInt(e.target.value, 10))}
                  className="w-14 bg-neutral-50 border border-neutral-300 rounded-xl p-2 text-center text-xs font-bold font-mono"
                />
                <span className="text-neutral-400 font-bold">/</span>
                <select
                  value={customDen}
                  onChange={(e) => setCustomDen(parseInt(e.target.value, 10))}
                  className="w-14 bg-neutral-50 border border-neutral-300 rounded-xl p-2 text-center text-xs font-bold font-mono"
                >
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                  <option value={8}>8</option>
                  <option value={16}>16</option>
                </select>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-sm"
                >
                  Set
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
