import React, { useState, useEffect } from 'react';
import { BandSyncState, Subdivision, TimeSignature } from '../types';
import { bandSyncService } from '../services/BandSyncService';
import {
  Radio,
  Users,
  Wifi,
  WifiOff,
  Crown,
  Copy,
  Check,
  X,
  Activity,
} from 'lucide-react';

interface BandSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBpm: number;
  isPlaying: boolean;
  timeSignature: TimeSignature;
  subdivision: Subdivision;
}

export const BandSyncModal: React.FC<BandSyncModalProps> = ({
  isOpen,
  onClose,
  currentBpm,
}) => {
  const [syncState, setSyncState] = useState<BandSyncState>(bandSyncService.getState());
  const [roomInput, setRoomInput] = useState(syncState.roomCode);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = bandSyncService.subscribe(setSyncState);
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(syncState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleConnect = () => {
    bandSyncService.toggleConnection();
  };

  const handleApplyRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomInput.trim()) {
      bandSyncService.setRoomCode(roomInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 rounded-[28px] p-5 sm:p-7 w-full max-w-lg shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
                Band Sync Real-Time Engine
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ~8ms Latency
                </span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Lock tempos across multiple musician devices, tablets, and stage monitors
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

        {/* Connection Status Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
            syncState.connected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-neutral-50 border-neutral-200 text-neutral-600'
          }`}
        >
          <div className="flex items-center gap-3">
            {syncState.connected ? (
              <Wifi className="w-5 h-5 text-emerald-600 animate-pulse" />
            ) : (
              <WifiOff className="w-5 h-5 text-neutral-400" />
            )}
            <div>
              <div className="text-xs font-bold text-neutral-900">
                {syncState.connected ? 'Connected to Band Sync Room' : 'Sync Disconnected'}
              </div>
              <div className="text-[11px] text-neutral-500">
                {syncState.connected
                  ? `${syncState.peers.length + 1} devices locked in sync (${syncState.isHost ? 'Master Conductor' : 'Client Slave'})`
                  : 'Connect to broadcast or receive tempo signals'}
              </div>
            </div>
          </div>

          <button
            id="btn-toggle-band-sync"
            onClick={handleToggleConnect}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
              syncState.connected
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25'
            }`}
          >
            {syncState.connected ? 'Disconnect' : 'Connect Now'}
          </button>
        </div>

        {/* Room Code & Role Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Room Code */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
            <label className="block text-[11px] font-bold text-neutral-600 mb-1.5">
              Sync Room Code
            </label>
            <form onSubmit={handleApplyRoom} className="flex items-center gap-1.5">
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-bold"
              >
                Join
              </button>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 rounded-xl bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                title="Copy Room Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Role Mode Toggle */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
            <label className="block text-[11px] font-bold text-neutral-600 mb-1.5">
              Device Role
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => bandSyncService.setIsHost(true)}
                className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  syncState.isHost
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Master</span>
              </button>
              <button
                onClick={() => bandSyncService.setIsHost(false)}
                className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  !syncState.isHost
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-neutral-400" />
                <span>Member</span>
              </button>
            </div>
          </div>
        </div>

        {/* Connected Band Roster */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-neutral-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-orange-500" />
              Connected Band Ensemble ({syncState.peers.length + 1})
            </span>
            <span className="text-[10px] text-neutral-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-600" />
              Sub-10ms Clock Sync
            </span>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {/* You */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/50 border border-orange-200">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    {syncState.deviceName} (This Device)
                    {syncState.isHost && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                        Host
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-500">{syncState.instrument}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                  0ms (Local)
                </span>
              </div>
            </div>

            {/* Other band peers */}
            {syncState.peers.map((peer) => (
              <div
                key={peer.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <div>
                    <div className="text-xs font-bold text-neutral-800">{peer.name}</div>
                    <div className="text-[10px] text-neutral-500">{peer.instrument}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                    {peer.latencyMs}ms
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">Synced</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info banner */}
        {syncState.isHost ? (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Master Conductor:</span> Changing BPM ({currentBpm}) or starting playback will broadcast instantaneously to all connected band devices.
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-900 leading-relaxed">
            <span className="font-bold">Band Member:</span> Your metronome will follow the conductor&apos;s tempo and playback signals automatically.
          </div>
        )}
      </div>
    </div>
  );
};
