import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  Terminal,
  FolderArchive,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { SOURCE_FILES } from '../data/sourceBundle';
import { downloadSourceZip } from '../services/ZipExportService';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('README.md');
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedPowerShell, setCopiedPowerShell] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  if (!isOpen) return null;

  const fileList = Object.keys(SOURCE_FILES).sort();
  const currentContent = SOURCE_FILES[selectedFile] || '';

  const handleCopyFile = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    } catch (err) {
      console.error('Failed to copy file:', err);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    setZipSuccess(false);
    try {
      const ok = await downloadSourceZip();
      if (ok) {
        setZipSuccess(true);
        setTimeout(() => setZipSuccess(false), 3500);
      }
    } finally {
      setIsZipping(false);
    }
  };

  const gitScript = `# 1. Clone your GitHub repository
git clone https://github.com/Stevenson14/BeatBit-metronome.git
cd BeatBit-metronome

# 2. Extract beatbit-metronome-source.zip into this folder, then:
git add .
git commit -m "Feat: Complete BeatBit metronome app with audio engine & UI"
git branch -M main
git push -u origin main`;

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(gitScript);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch (err) {
      console.error('Failed to copy script:', err);
    }
  };

  // Download a single selected file directly as text
  const handleDownloadSingleFile = () => {
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.split('/').pop() || 'file.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-inner">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                BeatBit Source Code & GitHub Export
              </h2>
              <p className="text-xs text-neutral-400">
                28 complete files • Real Audio Engine • Setlists • Preset Data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Banner */}
        <div className="p-4 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-orange-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Download All Files in 1 Click (.ZIP)
            </div>
            <p className="text-xs text-neutral-300 mt-0.5">
              Generated directly in your browser memory with full directory structure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all active:scale-95 ${
                zipSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-500 hover:bg-orange-400 text-neutral-950'
              }`}
            >
              {zipSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Downloaded ZIP!</span>
                </>
              ) : isZipping ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Packaging Zip...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download beatbit-source.zip</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Body: Split View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
          {/* File Selector Sidebar */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-950/40 p-3 overflow-y-auto no-scrollbar flex flex-col gap-1 max-h-48 md:max-h-none">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 px-2 py-1 flex items-center justify-between">
              <span>Files ({fileList.length})</span>
              <span className="text-[10px] text-neutral-500">Pick to preview/copy</span>
            </div>
            {fileList.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFile(f)}
                className={`text-left px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                  selectedFile === f
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <span className="truncate">{f}</span>
                <span className="text-[10px] text-neutral-500 ml-1 shrink-0">
                  {Math.round(SOURCE_FILES[f].length / 1024 * 10) / 10}k
                </span>
              </button>
            ))}
          </div>

          {/* Code Preview & Git Commands */}
          <div className="md:col-span-8 flex flex-col min-h-0 bg-neutral-900 overflow-hidden">
            {/* Tab header */}
            <div className="px-4 py-2 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="text-xs font-mono font-bold text-neutral-200 truncate">
                  {selectedFile}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  ({currentContent.split('\n').length} lines)
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleDownloadSingleFile}
                  className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors flex items-center gap-1"
                  title="Download just this file"
                >
                  <Download className="w-3 h-3 text-orange-400" />
                  <span className="hidden sm:inline">Save File</span>
                </button>
                <button
                  onClick={handleCopyFile}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                    copiedFile
                      ? 'bg-emerald-600 text-white'
                      : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30'
                  }`}
                  title="Copy full file text to clipboard"
                >
                  {copiedFile ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedFile ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Code view */}
            <div className="flex-1 p-3 overflow-auto font-mono text-[11px] leading-relaxed text-neutral-300 bg-neutral-950 select-text max-h-56 md:max-h-72">
              <pre className="whitespace-pre">{currentContent}</pre>
            </div>

            {/* Git push helper bar */}
            <div className="p-3 bg-neutral-950/90 border-t border-neutral-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-neutral-200 text-xs">
                  <Terminal className="w-3.5 h-3.5 text-orange-400" />
                  <span>GitHub Push Commands</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/Stevenson14/BeatBit-metronome"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    Stevenson14/BeatBit-metronome
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={handleCopyScript}
                    className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-mono flex items-center gap-1"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              {/* Windows 1-liner & Git commands */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
                    <span className="text-orange-400 font-mono">🪟 Windows PowerShell 1-Liner</span>
                    <button
                      onClick={async () => {
                        const cmd = 'Invoke-WebRequest -Uri "https://ais-pre-r32dpc6a7qdxxozygfaakc-861072845867.us-east1.run.app/beatbit-metronome-source.zip" -OutFile "beatbit-metronome-source.zip"; Expand-Archive -Path "beatbit-metronome-source.zip" -DestinationPath "BeatBit" -Force; cd BeatBit';
                        await navigator.clipboard.writeText(cmd);
                        setCopiedPowerShell(true);
                        setTimeout(() => setCopiedPowerShell(false), 2000);
                      }}
                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-orange-300 text-[10px] font-mono flex items-center gap-1"
                    >
                      {copiedPowerShell ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPowerShell ? 'Copied' : 'Copy PowerShell'}</span>
                    </button>
                  </div>
                  <div className="p-1.5 rounded-lg bg-neutral-950 font-mono text-[9px] text-neutral-400 select-all overflow-x-auto">
                    Invoke-WebRequest -Uri "https://ais-pre-r32dpc6a7qdxxozygfaakc-861072845867.us-east1.run.app/beatbit-metronome-source.zip" -OutFile "beatbit-metronome-source.zip"; Expand-Archive -Path "beatbit-metronome-source.zip" -DestinationPath "BeatBit" -Force; cd BeatBit
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300">
                    <span className="text-orange-400 font-mono">🐙 Git Push to Repository</span>
                    <button
                      onClick={handleCopyScript}
                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-orange-300 text-[10px] font-mono flex items-center gap-1"
                    >
                      {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedScript ? 'Copied' : 'Copy Git'}</span>
                    </button>
                  </div>
                  <div className="p-1.5 rounded-lg bg-neutral-950 font-mono text-[9px] text-neutral-400 select-all overflow-x-auto">
                    git init && git remote add origin https://github.com/Stevenson14/BeatBit-metronome.git && git add . && git commit -m "BeatBit source code" && git branch -M main && git push -u origin main
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
