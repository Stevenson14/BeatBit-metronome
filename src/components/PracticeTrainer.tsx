import React, { useState } from 'react';
import { PracticeTrainerConfig } from '../types';
import { Zap, VolumeX, ArrowUpRight, Repeat, CheckCircle2, Sliders, TrendingUp } from 'lucide-react';

interface PracticeTrainerProps {
  config: PracticeTrainerConfig;
  currentBpm: number;
  currentBar: number;
  isPlaying: boolean;
  onUpdateConfig: (config: PracticeTrainerConfig) => void;
  onStartTrainer: () => void;
}

export const PracticeTrainer: React.FC<PracticeTrainerProps> = ({
  config,
  currentBpm,
  currentBar,
  isPlaying,
  onUpdateConfig,
  onStartTrainer,
}) => {
  const [activeTab, setActiveTab] = useState<'tempo' | 'mute'>(config.mode);

  const handleToggleEnable = () => {
    onUpdateConfig({
      ...config,
      mode: activeTab,
      enabled: !config.enabled,
    });
  };

  const updateParam = <K extends keyof PracticeTrainerConfig>(key: K, value: PracticeTrainerConfig[K]) => {
    onUpdateConfig({
      ...config,
      [key]: value,
    });
  };

  // Calculate ladder progression percentage
  const totalBpmRange = Math.max(1, config.targetBpm - config.startBpm);
  const currentBpmProgress = Math.max(0, currentBpm - config.startBpm);
  const ladderPercent = Math.min(100, Math.round((currentBpmProgress / totalBpmRange) * 100));

  return (
    <div className="w-full max-w-md mx-auto flex flex-col space-y-3 pb-6">
      {/* Header & Master Toggle (Matching Screen 3 of image.png) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Practice Drills & Trainers
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Auto-ramp tempo for speed building or mute bars to master internal timing
          </p>
        </div>

        {/* Master Enable Button */}
        <button
          id="btn-toggle-trainer"
          onClick={handleToggleEnable}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm ${
            config.enabled
              ? 'bg-orange-500 text-white shadow-orange-500/25'
              : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/80'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{config.enabled ? 'Trainer Active' : 'Enable Trainer'}</span>
        </button>
      </div>

      {/* Segmented Pill Tabs (Matching Screen 3 of image.png) */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-neutral-100 border border-neutral-200/60 max-w-md">
        <button
          id="tab-tempo-trainer"
          onClick={() => {
            setActiveTab('tempo');
            updateParam('mode', 'tempo');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'tempo'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Tempo Ladder</span>
        </button>
        <button
          id="tab-mute-trainer"
          onClick={() => {
            setActiveTab('mute');
            updateParam('mode', 'mute');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'mute'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <VolumeX className="w-3.5 h-3.5" />
          <span>Inner Clock (Mute)</span>
        </button>
      </div>

      {/* Mode 1: Incremental Tempo Speed Trainer */}
      {activeTab === 'tempo' && (
        <div className="space-y-4">
          {/* Progress Milestone Card (Matching Screen 3 in image.png) */}
          <div className="bg-white rounded-[28px] border border-neutral-200/80 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Speed Ladder Progression
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                +{config.bpmStep} BPM / {config.barsPerStep} bars
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span className="text-3xl sm:text-4xl font-black font-sans text-neutral-900">
                  {currentBpm}{' '}
                  <span className="text-sm font-normal text-neutral-400">BPM</span>
                </span>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Target: <span className="font-bold text-neutral-800">{config.targetBpm} BPM</span> (Starting at {config.startBpm} BPM)
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono text-orange-500">
                  {ladderPercent}%
                </span>
                <span className="block text-[10px] text-neutral-400 font-semibold uppercase">
                  Progress
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2.5 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-300"
                style={{ width: `${Math.max(5, ladderPercent)}%` }}
              />
            </div>
          </div>

          {/* Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Start BPM */}
            <div className="bg-white rounded-[24px] border border-neutral-200/80 p-4 shadow-sm">
              <div className="flex justify-between text-xs font-bold text-neutral-700 mb-2">
                <span>Start Tempo</span>
                <span className="font-mono text-orange-600">{config.startBpm} BPM</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                value={config.startBpm}
                onChange={(e) => updateParam('startBpm', parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>

            {/* Target BPM */}
            <div className="bg-white rounded-[24px] border border-neutral-200/80 p-4 shadow-sm">
              <div className="flex justify-between text-xs font-bold text-neutral-700 mb-2">
                <span>Target Tempo</span>
                <span className="font-mono text-orange-600">{config.targetBpm} BPM</span>
              </div>
              <input
                type="range"
                min="30"
                max="400"
                value={config.targetBpm}
                onChange={(e) => updateParam('targetBpm', parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>

            {/* BPM Step */}
            <div className="bg-white rounded-[24px] border border-neutral-200/80 p-4 shadow-sm">
              <div className="flex justify-between text-xs font-bold text-neutral-700 mb-2">
                <span>Step Increment</span>
                <span className="font-mono text-orange-600">+{config.bpmStep} BPM</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={config.bpmStep}
                onChange={(e) => updateParam('bpmStep', parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>

            {/* Bars per step */}
            <div className="bg-white rounded-[24px] border border-neutral-200/80 p-4 shadow-sm">
              <div className="flex justify-between text-xs font-bold text-neutral-700 mb-2">
                <span>Step Interval</span>
                <span className="font-mono text-orange-600">{config.barsPerStep} bars</span>
              </div>
              <input
                type="range"
                min="1"
                max="16"
                value={config.barsPerStep}
                onChange={(e) => updateParam('barsPerStep', parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>
          </div>

          {/* Loop Option */}
          <div className="bg-white rounded-[24px] border border-neutral-200/80 p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Repeat className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-800 block">
                  Continuous Loop Ladder
                </span>
                <span className="text-[11px] text-neutral-400">
                  Reset back to start BPM upon reaching target
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.loopOnComplete}
              onChange={(e) => updateParam('loopOnComplete', e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-orange-500"
            />
          </div>
        </div>
      )}

      {/* Mode 2: Inner Clock Mute Trainer */}
      {activeTab === 'mute' && (
        <div className="space-y-4">
          <div className="bg-white rounded-[28px] border border-neutral-200/80 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <VolumeX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Internal Clock Mastery</h3>
                <p className="text-xs text-neutral-500">
                  Mutes audio during designated bars to train independent rhythmic accuracy
                </p>
              </div>
            </div>
          </div>

          {/* Pattern vs Random Switch */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateParam('randomMute', false)}
              className={`p-4 rounded-[24px] border text-left transition-all ${
                !config.randomMute
                  ? 'bg-neutral-900 text-white border-neutral-800 shadow-sm'
                  : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200/80'
              }`}
            >
              <div className="text-xs font-bold">Predictable Pattern</div>
              <div className="text-[11px] opacity-70 mt-0.5">e.g. 3 bars on, 1 bar muted</div>
            </button>
            <button
              onClick={() => updateParam('randomMute', true)}
              className={`p-4 rounded-[24px] border text-left transition-all ${
                config.randomMute
                  ? 'bg-neutral-900 text-white border-neutral-800 shadow-sm'
                  : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200/80'
              }`}
            >
              <div className="text-xs font-bold">Random Bar Dropouts</div>
              <div className="text-[11px] opacity-70 mt-0.5">Spontaneous silence challenge</div>
            </button>
          </div>

          {!config.randomMute ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-white rounded-[24px] border border-neutral-200/80 p-4 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-neutral-700 mb-2">
                  <span>Audible Bars (Sound On)</span>
                  <span className="font-mono text-orange-600">{config.muteRatioOn} bars</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={config.muteRatioOn}
                  onChange={(e) => updateParam('muteRatioOn', parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>

              <div className="bg-white rounded-[24px] border border-neutral-200/80 p-4 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-neutral-700 mb-2">
                  <span>Silent Bars (In Your Head)</span>
                  <span className="font-mono text-orange-600">{config.muteRatioOff} bars</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={config.muteRatioOff}
                  onChange={(e) => updateParam('muteRatioOff', parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] border border-neutral-200/80 p-4 shadow-sm">
              <div className="flex justify-between text-xs font-bold text-neutral-700 mb-2">
                <span>Silence Probability per Bar</span>
                <span className="font-mono text-orange-600">{config.randomMutePercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="5"
                value={config.randomMutePercent}
                onChange={(e) => updateParam('randomMutePercent', parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
