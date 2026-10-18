import React from 'react';
import { AccentLevel, SongItem, TimeSignature } from '../types';
import { Play, Square, X, ChevronRight, Fingerprint, Plus, Minus } from 'lucide-react';
import { getTempoMarking } from '../data/presetData';

interface StageModeProps {
  bpm: number;
  timeSignature: TimeSignature;
  accents: AccentLevel[];
  currentBeat: number;
  currentBar: number;
  isPlaying: boolean;
  activeSong: SongItem | null;
  nextSong: SongItem | null;
  onTogglePlay: () => void;
  onChangeBpm: (bpm: number) => void;
  onNextSong: () => void;
  onExitStageMode: () => void;
  onTapTempo: () => void;
}

export const StageMode: React.FC<StageModeProps> = ({
  bpm,
  timeSignature,
  accents,
  currentBeat,
  currentBar,
  isPlaying,
  activeSong,
  nextSong,
  onTogglePlay,
  onChangeBpm,
  onNextSong,
  onExitStageMode,
  onTapTempo,
}) => {
  const currentAccent = accents[currentBeat - 1] || 'normal';

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-white flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden">
      {/* Top Bar: Song Cue & Exit */}
      <div className="flex items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500 text-white">
              STAGE PERFORMANCE
            </span>
            <span className="text-xs text-neutral-400 font-mono font-bold">
              BAR {currentBar > 0 ? currentBar : 1}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 truncate max-w-md">
            {activeSong ? activeSong.title : 'BeatBit Live Metronome'}
          </h1>
          {activeSong?.artist && (
            <p className="text-xs text-neutral-400 font-medium">{activeSong.artist}</p>
          )}
        </div>

        {/* Right: Next Song Cue & Exit */}
        <div className="flex items-center gap-3">
          {nextSong && (
            <button
              onClick={onNextSong}
              className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-200 transition-colors"
            >
              <div className="text-left leading-tight">
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 block">
                  Next Up
                </span>
                <span className="text-neutral-200 font-bold">
                  {nextSong.title} ({nextSong.bpm} BPM)
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-orange-400" />
            </button>
          )}

          <button
            onClick={onExitStageMode}
            className="p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Exit Stage Mode (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Center: Enormous BPM & High-Contrast Visual Beat Meter */}
      <div className="flex flex-col items-center justify-center my-auto py-6">
        {/* Giant Tempo */}
        <div className="flex items-baseline justify-center gap-4">
          <span
            className={`text-8xl sm:text-9xl md:text-[12rem] font-black font-sans tracking-tight leading-none transition-colors duration-75 ${
              isPlaying
                ? currentAccent === 'accent'
                  ? 'text-orange-400 drop-shadow-[0_0_45px_rgba(249,115,22,0.6)]'
                  : 'text-emerald-400 drop-shadow-[0_0_35px_rgba(16,185,129,0.5)]'
                : 'text-white'
            }`}
          >
            {bpm}
          </span>
          <div className="flex flex-col items-start">
            <span className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-neutral-500">
              BPM
            </span>
            <span className="text-sm sm:text-base font-bold text-orange-400 tracking-wide">
              {getTempoMarking(bpm)}
            </span>
            <span className="text-xs font-mono text-neutral-400 mt-1 font-bold">
              {timeSignature.numerator}/{timeSignature.denominator}
            </span>
          </div>
        </div>

        {/* Giant Visual Beat Pulse Blocks */}
        <div className="w-full max-w-4xl flex items-center gap-3 sm:gap-4 mt-8 px-2">
          {Array.from({ length: timeSignature.numerator }).map((_, idx) => {
            const beatNum = idx + 1;
            const isCurrent = isPlaying && currentBeat === beatNum;
            const accent = accents[idx] || 'normal';

            return (
              <div
                key={idx}
                className={`flex-1 h-16 sm:h-24 rounded-2xl border-2 flex items-center justify-center font-mono font-black text-2xl sm:text-4xl transition-all duration-75 select-none ${
                  isCurrent
                    ? accent === 'accent'
                      ? 'bg-orange-500 text-white border-orange-400 scale-105 shadow-[0_0_40px_rgba(249,115,22,0.7)]'
                      : 'bg-emerald-500 text-white border-emerald-400 scale-105 shadow-[0_0_30px_rgba(16,185,129,0.6)]'
                    : accent === 'accent'
                    ? 'bg-neutral-900 text-orange-400/90 border-orange-500/40'
                    : 'bg-neutral-900 text-neutral-600 border-neutral-800'
                }`}
              >
                {beatNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Massive Foot/Hand Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-800">
        {/* Quick Bumper Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChangeBpm(Math.max(20, bpm - 5))}
            className="px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-base font-bold text-neutral-300 active:scale-95"
          >
            -5
          </button>
          <button
            onClick={() => onChangeBpm(Math.max(20, bpm - 1))}
            className="p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 active:scale-95"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            onClick={() => onChangeBpm(Math.min(400, bpm + 1))}
            className="p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => onChangeBpm(Math.min(400, bpm + 5))}
            className="px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-base font-bold text-neutral-300 active:scale-95"
          >
            +5
          </button>
        </div>

        {/* Center: Massive Play/Pause Foot-Pedal Target */}
        <button
          onClick={onTogglePlay}
          className={`flex items-center justify-center gap-3 px-10 sm:px-16 py-5 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-wider transition-all duration-75 shadow-2xl active:scale-95 ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_40px_rgba(225,29,72,0.5)]'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-[0_0_40px_rgba(249,115,22,0.4)]'
          }`}
          style={{ minWidth: '240px', minHeight: '68px' }}
        >
          {isPlaying ? (
            <>
              <Square className="w-7 h-7 fill-current" />
              <span>STOP</span>
            </>
          ) : (
            <>
              <Play className="w-7 h-7 fill-current" />
              <span>START</span>
            </>
          )}
        </button>

        {/* Right: Tap Tempo & Next */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTapTempo}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold uppercase active:scale-95 transition-transform"
          >
            <Fingerprint className="w-5 h-5 text-orange-400" />
            <span>Tap Tempo</span>
          </button>

          {nextSong && (
            <button
              onClick={onNextSong}
              className="sm:hidden flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-orange-500 text-white text-xs font-bold uppercase"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
