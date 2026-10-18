import React from 'react';
import { Activity, ListMusic, Zap, Layers } from 'lucide-react';

export type ActiveTab = 'metronome' | 'setlists' | 'trainer' | 'polyrhythm';

interface FloatingDockProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  isPlaying: boolean;
  onTogglePlay?: () => void;
  onOpenStageMode?: () => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  activeTab,
  onChangeTab,
  isPlaying,
}) => {
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ElementType }> = [
    { id: 'metronome', label: 'Metronome', icon: Activity },
    { id: 'setlists', label: 'Setlists', icon: ListMusic },
    { id: 'trainer', label: 'Trainer', icon: Zap },
    { id: 'polyrhythm', label: 'Polyrhythm', icon: Layers },
  ];

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md border-t border-neutral-200/80 shrink-0 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto px-4 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-100 select-none relative ${
                isActive
                  ? 'text-orange-600 font-black'
                  : 'text-neutral-400 hover:text-neutral-700 font-medium'
              }`}
              title={item.label}
              aria-label={item.label}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-100 ${
                  isActive ? 'bg-orange-50 text-orange-600 scale-105' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.id === 'metronome' && isPlaying && !isActive && (
                  <span className="absolute top-1 right-1/3 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                )}
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
