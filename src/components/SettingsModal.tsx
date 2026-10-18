import React, { useRef, useState } from 'react';
import { AudioSettings } from '../types';
import { audioEngine } from '../audio/AudioEngine';
import {
  Sliders,
  Volume2,
  Vibrate,
  Sparkles,
  Clock,
  Keyboard,
  X,
  Check,
  RotateCcw,
  GraduationCap,
  Download,
  Terminal,
  ExternalLink,
  FileCode,
} from 'lucide-react';
import { downloadSourceZip } from '../services/ZipExportService';
import { CodeExportModal } from './CodeExportModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onUpdateSettings: (newSettings: AudioSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [testPulseActive, setTestPulseActive] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  const handleDownloadZip = async () => {
    setIsZipping(true);
    setZipSuccess(false);
    try {
      const ok = await downloadSourceZip();
      if (ok) {
        setZipSuccess(true);
        setTimeout(() => setZipSuccess(false), 3000);
      }
    } finally {
      setIsZipping(false);
    }
  };

  if (!isOpen) return null;

  const update = <K extends keyof AudioSettings>(key: K, val: AudioSettings[K]) => {
    const updated = { ...settings, [key]: val };
    onUpdateSettings(updated);
    audioEngine.setSettings(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await audioEngine.decodeAudioFile(file);
      audioEngine.setCustomBuffer(buffer);
      setCustomFileName(file.name);
      update('sound', 'custom');
    } catch {
      alert('Could not decode audio file. Please choose a standard .wav or .mp3 file.');
    }
  };

  const handleTestVibration = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      setTestPulseActive(true);
      navigator.vibrate([35, 50, 18, 50, 18]);
      setTimeout(() => setTestPulseActive(false), 300);
    } else {
      alert('Vibration API is not supported in this browser window or on desktop devices.');
    }
  };

  const handleTestClick = () => {
    const wasPlaying = audioEngine.getIsRunning();
    if (!wasPlaying) {
      audioEngine.start();
      setTimeout(() => audioEngine.stop(), 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-neutral-200 rounded-[28px] p-5 sm:p-7 w-full max-w-xl shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neutral-900">Audio & Hardware Settings</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Sound engine, Bluetooth latency offset, haptic drivers, and visual feedback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Sound Library & Custom Sample */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-neutral-600 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-orange-500" />
              Metronome Sound Library
            </span>
            <button
              onClick={handleTestClick}
              className="text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              Test Sound
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                { id: 'woodblock', label: 'Woodblock', desc: 'Resonant acoustic' },
                { id: 'beep', label: 'Digital Beep', desc: 'High sine pulse' },
                { id: 'rimshot', label: 'Acoustic Rimshot', desc: 'Crisp snare crack' },
                { id: 'cowbell', label: '808 Cowbell', desc: 'Analog 808 bell' },
                { id: 'electronic808', label: '808 Click', desc: 'Transient click' },
                { id: 'custom', label: 'Custom Audio', desc: customFileName || 'Upload .wav / .mp3' },
              ] as const
            ).map((item) => {
              const isSelected = settings.sound === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'custom' && !customFileName) {
                      fileInputRef.current?.click();
                    } else {
                      update('sound', item.id);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200/80 text-neutral-700'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{item.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-400" />}
                  </div>
                  <div className="text-[10px] opacity-70 truncate mt-0.5">{item.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Hidden File Input for Custom Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />
          {customFileName && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900">
              <span className="truncate max-w-[280px]">Loaded: {customFileName}</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-orange-600 text-[11px] font-bold hover:underline"
              >
                Change File
              </button>
            </div>
          )}
        </div>

        {/* 2. Audio Latency Calibration */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-neutral-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-500" />
              Bluetooth & DAC Latency Offset
            </span>
            <span className="font-mono text-xs font-bold text-orange-600">
              {settings.latencyOffsetMs > 0 ? `+${settings.latencyOffsetMs}` : settings.latencyOffsetMs} ms
            </span>
          </div>
          <p className="text-[11px] text-neutral-500">
            Compensate for delay when using wireless Bluetooth headphones, external audio interfaces, or stage monitors.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-[10px] text-neutral-400 font-mono">-150ms</span>
            <input
              type="range"
              min="-150"
              max="150"
              step="5"
              value={settings.latencyOffsetMs}
              onChange={(e) => update('latencyOffsetMs', parseInt(e.target.value, 10))}
              className="flex-1"
            />
            <span className="text-[10px] text-neutral-400 font-mono">+150ms</span>
            <button
              onClick={() => update('latencyOffsetMs', 0)}
              className="p-1 text-neutral-400 hover:text-neutral-700"
              title="Reset to 0ms"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Haptic Feedback (Android Vibrator API) */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-amber-500" />
              <div>
                <div className="text-xs font-bold text-neutral-800">
                  Haptic Pulse Engine (Android Vibrator API)
                </div>
                <div className="text-[11px] text-neutral-500">
                  Tactile pulse feedback on downbeats and accents
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.hapticEnabled}
              onChange={(e) => update('hapticEnabled', e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-orange-500"
            />
          </div>

          {settings.hapticEnabled && (
            <div className="pt-2 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {(['light', 'medium', 'heavy', 'accent-only'] as const).map((intensity) => (
                  <button
                    key={intensity}
                    onClick={() => update('hapticIntensity', intensity)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize transition-all ${
                      settings.hapticIntensity === intensity
                        ? 'bg-neutral-900 text-white'
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {intensity.replace('-', ' ')}
                  </button>
                ))}
              </div>

              <button
                onClick={handleTestVibration}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  testPulseActive
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-300'
                }`}
              >
                Test Haptic Pulse
              </button>
            </div>
          )}
        </div>

        {/* 4. Visual Flash Options */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <div>
                <div className="text-xs font-bold text-neutral-800">Screen-Edge Flash & Visual Strobe</div>
                <div className="text-[11px] text-neutral-500">
                  Visual pulse synced with audio callbacks for noisy environments
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.edgeFlash}
              onChange={(e) => update('edgeFlash', e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-emerald-500"
            />
          </div>

          {settings.edgeFlash && (
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
              <span className="text-[11px] text-neutral-500 font-medium">Flash Style:</span>
              {(['border', 'strobe', 'pulse-dot'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => update('flashStyle', style)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition-all ${
                    settings.flashStyle === style
                      ? 'bg-neutral-900 text-white'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {style.replace('-', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 5. Keyboard Shortcuts */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
            <Keyboard className="w-4 h-4 text-orange-500" />
            Musician Keyboard Shortcuts
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-neutral-600">
            <div><kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-300 font-mono">Space</kbd> Start / Stop</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-300 font-mono">T</kbd> Tap Tempo</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-300 font-mono">↑ / ↓</kbd> +/- 1 BPM</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-300 font-mono">S</kbd> Stage Mode</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-300 font-mono">M</kbd> Mute Audio</div>
            <div><kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-300 font-mono">Esc</kbd> Exit Stage / Modal</div>
          </div>
        </div>

        {/* 6. GitHub Repository & Full Code Export */}
        <div className="p-4 rounded-2xl bg-neutral-900 text-neutral-100 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Terminal className="w-4 h-4 text-orange-400" />
              GitHub Repository & Source Code
            </div>
            <a
              href="https://github.com/Stevenson14/BeatBit-metronome"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold"
            >
              Stevenson14/BeatBit-metronome
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Download the complete source code archive (.zip) with all components, audio engine, presets, and README ready to commit.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors shadow-sm ${
                zipSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {zipSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Downloaded ZIP!
                </>
              ) : isZipping ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Generating ZIP...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download Code (.ZIP)
                </>
              )}
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-orange-400 border border-orange-500/30 font-bold text-xs transition-colors shadow-sm"
            >
              <FileCode className="w-3.5 h-3.5" />
              Browse & Copy Files
            </button>
            <span className="text-[10px] text-neutral-500 font-mono">
              28 files ready
            </span>
          </div>
        </div>

        {/* 7. Academic Project Credit */}
        <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200/80 text-[11px] text-orange-950 flex items-start gap-2.5">
          <GraduationCap className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">BeatBit Mobile Metronome System</div>
            <div>Connor M. Turner • Saint Leo University</div>
            <div className="text-orange-700/80">COM-437-OL01: Mobile Application Development • Dr. Marwan Omar</div>
          </div>
        </div>
      </div>

      <CodeExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
