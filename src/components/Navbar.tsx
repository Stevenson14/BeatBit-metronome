import React from 'react';
import {
  Activity,
  Radio,
  Sliders,
  Smartphone,
  Monitor,
  Music,
} from 'lucide-react';
import { BandSyncState, SongItem } from '../types';
import { ActiveTab } from './FloatingDock';

interface NavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenStageMode: () => void;
  onOpenBandSync: () => void;
  onOpenSettings: () => void;
  bandSyncState: BandSyncState;
  isPlaying: boolean;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  activeSong?: SongItem | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  onOpenStageMode,
  onOpenBandSync,
  onOpenSettings,
  bandSyncState,
  isPlaying,
  isPhoneFrame,
  onTogglePhoneFrame,
  activeSong,
}) => {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-neutral-200/80 shrink-0 z-20">
      <div className="max-w-md mx-auto px-3 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-xs shrink-0">
            <Activity className={`w-4 h-4 ${isPlaying ? 'scale-110 animate-pulse' : ''}`} />
            {isPlaying && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white ring-1 ring-emerald-400" />
            )}
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black tracking-tight text-neutral-900 font-sans">
              Beat<span className="text-orange-500">Bit</span>
            </span>
            <span className="text-[9px] font-black uppercase text-orange-600 bg-orange-50 border border-orange-200 px-1.5 rounded">
              PRO
            </span>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5">
          {/* Phone Frame Mockup View Toggle */}
          <button
            onClick={onTogglePhoneFrame}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold border transition-all ${
              isPhoneFrame
                ? 'bg-neutral-900 text-white border-neutral-800'
                : 'bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200 hover:bg-neutral-50'
            }`}
            title="Toggle Realistic Android Phone Mockup"
          >
            {isPhoneFrame ? <Monitor className="w-3 h-3 text-orange-400" /> : <Smartphone className="w-3 h-3 text-neutral-500" />}
            <span className="hidden xs:inline">{isPhoneFrame ? 'Full' : 'Phone'}</span>
          </button>

          {/* Band Sync Button */}
          <button
            onClick={onOpenBandSync}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border transition-all ${
              bandSyncState.connected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
            }`}
            title="Band Sync Mode"
          >
            <Radio className={`w-3 h-3 ${bandSyncState.connected ? 'text-emerald-600 animate-pulse' : 'text-neutral-400'}`} />
            <span>{bandSyncState.connected ? `${bandSyncState.peers.length + 1}` : 'Sync'}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 border border-neutral-200 flex items-center justify-center transition-colors shadow-2xs"
            title="Audio & Hardware Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
