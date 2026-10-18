import React from 'react';
import { AccentLevel, TimeSignature } from '../types';
import { Volume2, VolumeX, Sparkles, SlidersHorizontal } from 'lucide-react';

interface AccentMatrixProps {
  timeSignature: TimeSignature;
  accents: AccentLevel[];
  currentBeat: number;
  isPlaying: boolean;
  onAccentChange: (accents: AccentLevel[]) => void;
}

const ACCENT_CYCLE: Record<AccentLevel, AccentLevel> = {
  accent: 'normal',
  normal: 'sub',
  sub: 'mute',
  mute: 'accent',
};

export const AccentMatrix: React.FC<AccentMatrixProps> = ({
  timeSignature,
  accents,
  currentBeat,
  isPlaying,
  onAccentChange,
}) => {
  const numBeats = timeSignature.numerator;

  const currentAccents = [...accents];
  while (currentAccents.length < numBeats) {
    currentAccents.push(currentAccents.length === 0 ? 'accent' : 'normal');
  }

  const handleCycleBeat = (index: number) => {
    const updated = [...currentAccents];
    const current = updated[index] || 'normal';
    updated[index] = ACCENT_CYCLE[current];
    onAccentChange(updated.slice(0, numBeats));
  };

  const setAllAccents = (level: AccentLevel) => {
    const updated = Array(numBeats).fill(level);
    onAccentChange(updated);
  };

  const setFirstBeatAccent = () => {
    const updated = Array(numBeats).fill('normal');
    updated[0] = 'accent';
    onAccentChange(updated);
  };

  const setClaveOrOdd = () => {
    const updated = Array(numBeats).fill('normal');
    for (let i = 0; i < numBeats; i += 2) {
      updated[i] = 'accent';
    }
    onAccentChange(updated);
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-[24px] border border-neutral-200/80 p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Accent Architecture
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Tap any beat block to cycle dynamics
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-semibold text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Accent
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-neutral-700" /> Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-neutral-300" /> Sub
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Mute
          </span>
        </div>
      </div>

      {/* Grid of Beat Blocks */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
        {Array.from({ length: numBeats }).map((_, idx) => {
          const beatNum = idx + 1;
          const level = currentAccents[idx] || 'normal';
          const isCurrent = isPlaying && currentBeat === beatNum;

          // Color & style schemes for each accent level
          let blockStyle = 'bg-neutral-50 text-neutral-700 border-neutral-200';
          let badgeText = 'MID';
          let badgeColor = 'bg-neutral-200 text-neutral-600';

          if (level === 'accent') {
            blockStyle = 'bg-orange-50/80 text-orange-900 border-orange-200/90 shadow-sm';
            badgeText = 'STRONG';
            badgeColor = 'bg-orange-500 text-white';
          } else if (level === 'normal') {
            blockStyle = 'bg-neutral-100/70 text-neutral-800 border-neutral-200';
            badgeText = 'PULSE';
            badgeColor = 'bg-neutral-700 text-white';
          } else if (level === 'sub') {
            blockStyle = 'bg-neutral-50/60 text-neutral-500 border-neutral-200/70';
            badgeText = 'SOFT';
            badgeColor = 'bg-neutral-200 text-neutral-600';
          } else if (level === 'mute') {
            blockStyle = 'bg-rose-50/60 text-rose-400 border-rose-200/80';
            badgeText = 'MUTE';
            badgeColor = 'bg-rose-500 text-white';
          }

          if (isCurrent) {
            blockStyle +=
              level === 'accent'
                ? ' ring-2 ring-orange-500 shadow-[0_0_16px_rgba(249,115,22,0.3)] scale-[1.03]'
                : ' ring-2 ring-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)] scale-[1.03]';
          }

          return (
            <button
              key={idx}
              onClick={() => handleCycleBeat(idx)}
              className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl border transition-all duration-75 select-none active:scale-95 min-h-[76px] ${blockStyle}`}
              title={`Beat ${beatNum}: ${level} dynamic. Tap to cycle.`}
            >
              {/* Beat Number */}
              <span className="font-mono text-base font-extrabold leading-none">
                {beatNum}
              </span>

              {/* Dynamic Waveform Visual Indicator */}
              <div className="flex items-end gap-0.5 h-3 my-1">
                {level === 'accent' && (
                  <>
                    <span className="w-1 h-3 rounded-full bg-orange-500" />
                    <span className="w-1 h-3.5 rounded-full bg-orange-500" />
                    <span className="w-1 h-2 rounded-full bg-orange-500" />
                  </>
                )}
                {level === 'normal' && (
                  <>
                    <span className="w-1 h-2 rounded-full bg-neutral-600" />
                    <span className="w-1 h-2.5 rounded-full bg-neutral-600" />
                  </>
                )}
                {level === 'sub' && (
                  <span className="w-1 h-1.5 rounded-full bg-neutral-400" />
                )}
                {level === 'mute' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                )}
              </div>

              {/* Dynamic Badge */}
              <span
                className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${badgeColor}`}
              >
                {badgeText}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Pattern Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-100">
        <span className="text-[11px] font-semibold text-neutral-400">Presets:</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={setFirstBeatAccent}
            className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold transition-colors"
          >
            Downbeat Only
          </button>
          <button
            onClick={setClaveOrOdd}
            className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold transition-colors"
          >
            Alternate (2/4)
          </button>
          <button
            onClick={() => setAllAccents('normal')}
            className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold transition-colors"
          >
            Even Pulse
          </button>
        </div>
      </div>
    </div>
  );
};
