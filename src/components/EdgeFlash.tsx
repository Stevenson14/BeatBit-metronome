import React from 'react';
import { AccentLevel } from '../types';

interface EdgeFlashProps {
  active: boolean;
  accent: AccentLevel;
  flashStyle: 'border' | 'strobe' | 'pulse-dot';
  isSilent: boolean;
}

export const EdgeFlash: React.FC<EdgeFlashProps> = ({ active, accent, flashStyle, isSilent }) => {
  if (!active || isSilent || accent === 'mute') return null;

  if (flashStyle === 'pulse-dot') {
    return (
      <div
        className={`fixed top-4 right-4 w-6 h-6 rounded-full pointer-events-none transition-all duration-75 z-50 ${
          accent === 'accent'
            ? 'bg-orange-500 scale-125 shadow-[0_0_20px_rgba(249,115,22,0.6)]'
            : accent === 'normal'
            ? 'bg-emerald-500 scale-100 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
            : 'bg-amber-400 scale-75 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
        }`}
      />
    );
  }

  if (flashStyle === 'strobe') {
    return (
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-75 z-40 ${
          accent === 'accent'
            ? 'bg-orange-500/15'
            : accent === 'normal'
            ? 'bg-emerald-500/10'
            : 'bg-amber-400/10'
        }`}
      />
    );
  }

  // Default: Responsive screen-edge border flash
  return (
    <div
      className={`fixed inset-0 pointer-events-none border-4 transition-all duration-75 z-40 ${
        accent === 'accent'
          ? 'border-orange-500 shadow-[inset_0_0_35px_rgba(249,115,22,0.4)]'
          : accent === 'normal'
          ? 'border-emerald-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.3)]'
          : 'border-amber-400/80 shadow-[inset_0_0_12px_rgba(251,191,36,0.2)]'
      }`}
    />
  );
};
