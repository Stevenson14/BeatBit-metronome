import React, { useState, useRef, useCallback } from 'react';
import { getTempoMarking } from '../data/presetData';
import { Minus, Plus } from 'lucide-react';
import { AccentLevel } from '../types';

interface RotaryDialProps {
  bpm: number;
  onChange: (bpm: number) => void;
  isPlaying: boolean;
  beatFlash: boolean;
  accentState?: AccentLevel;
  size?: number;
}

const MIN_BPM = 20;
const MAX_BPM = 400;
const START_ANGLE = 45; // degrees from top
const END_ANGLE = 315; // 270 degree arc sweep
const TOTAL_ARC = END_ANGLE - START_ANGLE; // 270 deg

export const RotaryDial: React.FC<RotaryDialProps> = ({
  bpm,
  onChange,
  isPlaying,
  beatFlash,
  accentState = 'normal',
  size = 195,
}) => {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastAngleRef = useRef<number | null>(null);

  // Map BPM (20-400) to angle in degrees (START_ANGLE to END_ANGLE)
  const bpmToAngle = useCallback((b: number) => {
    const fraction = (b - MIN_BPM) / (MAX_BPM - MIN_BPM);
    return START_ANGLE + fraction * TOTAL_ARC;
  }, []);

  // Map angle (degrees from top clockwise) to BPM
  const angleToBpm = useCallback((deg: number) => {
    let normalized = deg;
    if (normalized < 0) normalized += 360;

    // Constrain inside active sweep
    let fraction = 0;
    if (normalized < START_ANGLE) {
      fraction = 0;
    } else if (normalized > END_ANGLE) {
      fraction = 1;
    } else {
      fraction = (normalized - START_ANGLE) / TOTAL_ARC;
    }

    const calculated = Math.round(MIN_BPM + fraction * (MAX_BPM - MIN_BPM));
    return Math.max(MIN_BPM, Math.min(MAX_BPM, calculated));
  }, []);

  const calculateAngleFromPointer = (clientX: number, clientY: number) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    let deg = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    return deg;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const angle = calculateAngleFromPointer(e.clientX, e.clientY);
    lastAngleRef.current = angle;
    onChange(angleToBpm(angle));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const angle = calculateAngleFromPointer(e.clientX, e.clientY);
    onChange(angleToBpm(angle));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    const next = Math.max(MIN_BPM, Math.min(MAX_BPM, bpm + delta));
    onChange(next);
  };

  const currentAngle = bpmToAngle(bpm);

  // SVG Arc Math
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const backgroundArc = describeArc(center, center, radius, START_ANGLE, END_ANGLE);
  const activeArc = describeArc(center, center, radius, START_ANGLE, currentAngle);

  // Indicator knob coordinates
  const knobPos = polarToCartesian(center, center, radius, currentAngle);
  const tempoMarking = getTempoMarking(bpm);

  return (
    <div className="flex flex-col items-center select-none w-full">
      {/* Rotary Dial Container */}
      <div
        ref={dialRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className={`relative rounded-full cursor-grab active:cursor-grabbing p-2 transition-transform duration-100 ${
          isDragging ? 'scale-[1.01]' : 'hover:scale-[1.005]'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Soft Background Disc with Clean Modern Elevation */}
        <div
          className={`relative rounded-full bg-white border border-neutral-200/90 shadow-[0_8px_28px_rgba(0,0,0,0.06)] flex items-center justify-center transition-all duration-75 ${
            beatFlash && isPlaying
              ? accentState === 'accent'
                ? 'ring-4 ring-orange-500/30 shadow-[0_12px_32px_rgba(249,115,22,0.25)]'
                : 'ring-4 ring-emerald-500/20 shadow-[0_12px_32px_rgba(16,185,129,0.18)]'
              : ''
          }`}
          style={{ width: size + 16, height: size + 16 }}
        >
          {/* SVG Arc Track */}
          <svg width={size} height={size} className="absolute inset-2 pointer-events-none">
            <defs>
              <linearGradient id="coralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <filter id="knobGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f97316" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Background Arc Track */}
            <path
              d={backgroundArc}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Active Arc Progress */}
            <path
              d={activeArc}
              fill="none"
              stroke="url(#coralGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Rotary Thumb / Knob */}
            <circle
              cx={knobPos.x}
              cy={knobPos.y}
              r={9}
              fill="#ffffff"
              stroke="#ea580c"
              strokeWidth={3}
              filter="url(#knobGlow)"
              className="transition-transform duration-75"
            />
          </svg>

          {/* Center Display: BPM Typography & Italian Tempo Tag */}
          <div className="relative flex flex-col items-center justify-center text-center pointer-events-none z-10 px-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              TEMPO
            </span>

            <div className="flex items-baseline justify-center gap-1 my-0.5">
              <span
                className={`text-5xl font-black font-sans tracking-tight leading-none transition-colors duration-75 ${
                  beatFlash && isPlaying
                    ? accentState === 'accent'
                      ? 'text-orange-600 scale-105'
                      : 'text-emerald-600'
                    : 'text-neutral-900'
                }`}
              >
                {bpm}
              </span>
              <span className="text-xs font-bold text-neutral-400 uppercase">
                BPM
              </span>
            </div>

            {/* Italian Tempo Marking Badge */}
            <div className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-bold tracking-wide border border-neutral-200/80 max-w-[130px] truncate">
              {tempoMarking}
            </div>
          </div>
        </div>
      </div>

      {/* Tactile Micro-Adjustment Bumpers */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        <button
          onClick={() => onChange(Math.max(MIN_BPM, bpm - 5))}
          className="px-2.5 py-1 rounded-full bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200 text-[11px] font-bold text-neutral-700 shadow-2xs transition-all active:scale-95"
          title="Decrease 5 BPM"
        >
          -5
        </button>
        <button
          onClick={() => onChange(Math.max(MIN_BPM, bpm - 1))}
          className="w-7 h-7 rounded-full bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 shadow-2xs transition-all active:scale-95"
          title="Decrease 1 BPM"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChange(Math.min(MAX_BPM, bpm + 1))}
          className="w-7 h-7 rounded-full bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 shadow-2xs transition-all active:scale-95"
          title="Increase 1 BPM"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChange(Math.min(MAX_BPM, bpm + 5))}
          className="px-2.5 py-1 rounded-full bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200 text-[11px] font-bold text-neutral-700 shadow-2xs transition-all active:scale-95"
          title="Increase 5 BPM"
        >
          +5
        </button>
      </div>
    </div>
  );
};
