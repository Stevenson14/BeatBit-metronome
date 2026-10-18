import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Download,
  Maximize2,
  Minimize2,
  Smartphone,
  Wifi,
  SignalHigh,
  BatteryMedium,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  FolderArchive,
  FileCode,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { downloadSourceZip } from '../services/ZipExportService';
import { CodeExportModal } from './CodeExportModal';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  onToggleFrame: () => void;
  isPhoneFrame: boolean;
}

export type ChassisColor = 'obsidian' | 'platinum' | 'matte-navy';

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  children,
  onToggleFrame,
  isPhoneFrame,
}) => {
  const phoneRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState('09:41');
  const [chassisColor, setChassisColor] = useState<ChassisColor>('obsidian');
  const [hideToolbar, setHideToolbar] = useState(false);
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

  // Update status bar time to current device time or default
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadScreenshot = async () => {
    if (!phoneRef.current) return;
    try {
      setIsCapturing(true);
      // Brief pause to ensure any pending animations settle
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(phoneRef.current, {
        quality: 0.98,
        pixelRatio: 2.5, // Crisp retina resolution for presentation
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `beatbit-android-mockup-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      setCaptureSuccess(true);
      setTimeout(() => setCaptureSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to take screenshot:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Color styles for the physical phone bezel
  const chassisStyles: Record<ChassisColor, { border: string; bg: string; buttonBg: string; name: string }> = {
    obsidian: {
      border: 'border-[#121316] ring-1 ring-neutral-700/50',
      bg: 'bg-[#121316]',
      buttonBg: 'bg-[#222429]',
      name: 'Obsidian Black',
    },
    platinum: {
      border: 'border-[#2d3139] ring-1 ring-neutral-400/50',
      bg: 'bg-[#2d3139]',
      buttonBg: 'bg-[#3e4450]',
      name: 'Titanium Grey',
    },
    'matte-navy': {
      border: 'border-[#0f172a] ring-1 ring-blue-500/40',
      bg: 'bg-[#0f172a]',
      buttonBg: 'bg-[#1e293b]',
      name: 'Matte Indigo',
    },
  };

  const currentChassis = chassisStyles[chassisColor];

  return (
    <div className="relative flex-1 w-full h-full flex flex-col items-center justify-between overflow-y-auto no-scrollbar py-2 sm:py-4 px-2 bg-gradient-to-b from-[#0f1117] via-[#161922] to-[#0a0c10] text-neutral-100 select-none">
      {/* Top Presentation & Screenshot Helper Bar */}
      {!hideToolbar ? (
        <div className="w-full max-w-xl mx-auto mb-2 sm:mb-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-neutral-900/90 backdrop-blur-md rounded-2xl border border-neutral-800 shadow-xl z-50 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-bold text-neutral-200">
              <Smartphone className="w-4 h-4 text-orange-400" />
              <span>Android 10+ Device Mockup</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
              COM-437
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Chassis Color Picker */}
            <div className="hidden sm:flex items-center gap-1 bg-neutral-800/80 rounded-lg p-0.5 border border-neutral-700/60">
              {(['obsidian', 'platinum', 'matte-navy'] as ChassisColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setChassisColor(c)}
                  className={`w-4 h-4 rounded-full transition-all ${
                    c === 'obsidian' ? 'bg-neutral-900 border border-neutral-600' : ''
                  } ${c === 'platinum' ? 'bg-neutral-400' : ''} ${
                    c === 'matte-navy' ? 'bg-indigo-700' : ''
                  } ${chassisColor === c ? 'ring-2 ring-orange-500 scale-110' : 'opacity-70 hover:opacity-100'}`}
                  title={`Color: ${chassisStyles[c].name}`}
                />
              ))}
            </div>

            {/* 📸 Download High-Res Screenshot Button */}
            <button
              onClick={handleDownloadScreenshot}
              disabled={isCapturing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
                captureSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
              }`}
              title="Download high-resolution PNG screenshot of the phone"
            >
              {captureSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : isCapturing ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Capturing...</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </>
              )}
            </button>

            {/* 📦 Download Complete Code ZIP for GitHub */}
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
                zipSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/60'
              }`}
              title="Download entire project source code for GitHub as a clean .ZIP archive"
            >
              {zipSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="hidden sm:inline">Downloaded!</span>
                  <span className="sm:hidden">Saved</span>
                </>
              ) : isZipping ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="hidden sm:inline">Zipping...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Get Code (.zip)</span>
                  <span className="sm:hidden">.ZIP</span>
                </>
              )}
            </button>

            {/* 💻 Code Browser / Copy files modal */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold bg-neutral-800 hover:bg-neutral-700 text-orange-400 border border-orange-500/30 transition-all shadow-md active:scale-95"
              title="View, copy, and export any file to GitHub"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Browse Files</span>
            </button>

            {/* Hide toolbar button for clean manual crop */}
            <button
              onClick={() => setHideToolbar(true)}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              title="Hide this top bar for clean screenshot taking"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>

            {/* Exit frame toggle */}
            <button
              onClick={onToggleFrame}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              title="Switch to full screen edge-to-edge view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Floating reveal button when toolbar is hidden */
        <button
          onClick={() => setHideToolbar(false)}
          className="fixed top-3 right-3 z-50 flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900/90 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] shadow-lg backdrop-blur-md transition-all opacity-70 hover:opacity-100"
          title="Show mockup toolbar"
        >
          <Eye className="w-3.5 h-3.5 text-orange-400" />
          <span>Show Controls</span>
        </button>
      )}

      {/* Realistic Physical Android Smartphone Hardware Container */}
      <div className="relative my-auto flex items-center justify-center p-1 sm:p-2">
        {/* Physical Hardware Buttons on Chassis */}
        {/* Volume Rocker (Left side) */}
        <div
          className={`absolute left-[-5px] top-[140px] w-[5px] h-[72px] rounded-l-md ${currentChassis.buttonBg} shadow-inner`}
        />
        {/* Power / Lock Button (Right side) */}
        <div
          className={`absolute right-[-5px] top-[110px] w-[5px] h-[48px] rounded-r-md ${currentChassis.buttonBg} shadow-inner`}
        />

        {/* Outer Phone Bezel */}
        <div
          ref={phoneRef}
          id="android-phone-mockup"
          className={`w-[375px] sm:w-[390px] h-[790px] max-h-[calc(100dvh-50px)] sm:max-h-[820px] rounded-[48px] border-[10px] sm:border-[12px] ${currentChassis.border} bg-[#f4f5f8] shadow-[0_25px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col overflow-hidden relative transition-colors duration-200`}
        >
          {/* Top Speaker Slit */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-neutral-800 rounded-full z-40 pointer-events-none" />

          {/* Android Centered Punch-Hole Camera */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-neutral-950 border border-neutral-700/80 shadow-inner z-40 flex items-center justify-center pointer-events-none">
            {/* Camera lens glint reflection */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#0a1224] ring-1 ring-neutral-800 relative">
              <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 rounded-full bg-blue-300 opacity-60" />
            </div>
          </div>

          {/* Authentic Android Status Bar */}
          <div className="w-full h-8 px-5 pt-1.5 flex items-center justify-between text-neutral-800 text-[11px] font-medium tracking-tight bg-white select-none z-30 shrink-0">
            {/* Left: Clock */}
            <div className="flex items-center gap-1 font-bold">
              <span>{currentTime}</span>
            </div>

            {/* Right: Android System Status Icons */}
            <div className="flex items-center gap-1.5 text-neutral-700">
              <span className="text-[9px] font-bold tracking-tight text-neutral-500">5G</span>
              <SignalHigh className="w-3.5 h-3.5 text-neutral-700" />
              <Wifi className="w-3.5 h-3.5 text-neutral-700" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-bold font-mono">98%</span>
                <BatteryMedium className="w-3.5 h-3.5 text-neutral-800" />
              </div>
            </div>
          </div>

          {/* App Body Content */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#f4f5f8] relative">
            {children}
          </div>

          {/* Authentic Android Gesture Navigation Bar at the Bottom */}
          <div className="w-full py-1.5 bg-white flex items-center justify-center shrink-0 z-30 select-none">
            <div className="w-28 h-1 rounded-full bg-neutral-400/80" />
          </div>
        </div>
      </div>

      {/* Bottom Subtitle / Info */}
      <footer className="text-center text-[11px] text-neutral-400 py-1 shrink-0 font-medium">
        <span>BeatBit Mobile Metronome — Saint Leo University COM-437 Project Outline</span>
      </footer>

      {/* Code Export & File Browser Modal */}
      <CodeExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
