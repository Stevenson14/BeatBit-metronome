import React, { useState, useRef } from 'react';
import { Fingerprint } from 'lucide-react';

interface TapTempoProps {
  onBpmCalculated: (bpm: number) => void;
  compact?: boolean;
}

export const TapTempo: React.FC<TapTempoProps> = ({ onBpmCalculated, compact = false }) => {
  const tapTimesRef = useRef<number[]>([]);
  const [tapCount, setTapCount] = useState<number>(0);
  const [lastBpm, setLastBpm] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const resetTimerRef = useRef<number | null>(null);

  const handleTap = () => {
    const now = performance.now();
    const taps = tapTimesRef.current;

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 120);

    // If gap between taps > 2500ms, reset
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) {
      tapTimesRef.current = [now];
      setTapCount(1);
      setLastBpm(null);
      return;
    }

    taps.push(now);
    if (taps.length > 5) {
      taps.shift();
    }

    const currentCount = taps.length;
    setTapCount(currentCount);

    if (currentCount >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);

      if (calculatedBpm >= 20 && calculatedBpm <= 400) {
        setLastBpm(calculatedBpm);
        onBpmCalculated(calculatedBpm);
      }
    }

    if (resetTimerRef.current !== null) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(() => {
      tapTimesRef.current = [];
      setTapCount(0);
    }, 2500);
  };

  if (compact) {
    return (
      <button
        id="btn-tap-tempo"
        onClick={handleTap}
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border transition-all duration-100 select-none active:scale-95 ${
          isFlashing
            ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/30 scale-95'
            : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200/90 shadow-2xs'
        }`}
        title="Tap Tempo (T)"
      >
        <Fingerprint className={`w-5 h-5 ${isFlashing ? 'text-white' : 'text-orange-500'}`} />
        <span className="text-[10px] font-black tracking-tight mt-0.5 leading-none">
          {lastBpm ? `${lastBpm}` : 'TAP'}
        </span>
      </button>
    );
  }

  return (
    <div className="w-full">
      <button
        id="btn-tap-tempo"
        onClick={handleTap}
        className={`w-full group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl border transition-all duration-100 select-none active:scale-[0.98] ${
          isFlashing
            ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/30 scale-[0.99]'
            : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200/80 shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isFlashing
                ? 'bg-white/20 text-white'
                : 'bg-orange-50 text-orange-600 group-hover:bg-orange-100'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
          </div>

          <div className="flex flex-col text-left leading-tight">
            <span className="text-xs font-bold tracking-tight">Tap Tempo</span>
            <span
              className={`text-[10px] font-medium transition-colors ${
                isFlashing ? 'text-white/80' : 'text-neutral-500'
              }`}
            >
              {tapCount === 0
                ? 'Tap along to pulse'
                : tapCount < 4
                ? `Tapping... (${tapCount}/4)`
                : 'Locked to rhythm!'}
            </span>
          </div>
        </div>

        {lastBpm !== null ? (
          <span
            className={`text-xs font-black font-mono px-2 py-0.5 rounded-full border transition-colors ${
              isFlashing
                ? 'bg-white text-orange-600 border-white'
                : 'bg-orange-50 text-orange-700 border-orange-200'
            }`}
          >
            {lastBpm} BPM
          </span>
        ) : (
          <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
            Tap
          </span>
        )}
      </button>
    </div>
  );
};
