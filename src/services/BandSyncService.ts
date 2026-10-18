import { BandSyncPeer, BandSyncState, Subdivision, TimeSignature } from '../types';

export type SyncMessage =
  | {
      type: 'JOIN_ROOM';
      peer: BandSyncPeer;
    }
  | {
      type: 'LEAVE_ROOM';
      peerId: string;
    }
  | {
      type: 'STATE_UPDATE';
      hostId: string;
      bpm: number;
      isPlaying: boolean;
      timeSignature: TimeSignature;
      subdivision: Subdivision;
      serverTimestamp: number;
    }
  | {
      type: 'TEMPO_CHANGE';
      bpm: number;
    }
  | {
      type: 'START_PLAY';
      timestamp: number;
      bpm: number;
    }
  | {
      type: 'STOP_PLAY';
    }
  | {
      type: 'PING';
      fromId: string;
      time: number;
    }
  | {
      type: 'PONG';
      toId: string;
      originalTime: number;
    };

export class BandSyncService {
  private channel: BroadcastChannel | null = null;
  private myPeerId: string = 'peer_' + Math.random().toString(36).substring(2, 9);
  private state: BandSyncState = {
    isHost: true,
    connected: false,
    roomCode: 'BAND-437',
    deviceName: 'Connor (Stage Master)',
    instrument: 'Conductor / Drums',
    peers: [],
  };

  private listeners: Array<(state: BandSyncState) => void> = [];
  private onRemotePlayCallback?: (bpm: number, timeSig: TimeSignature, sub: Subdivision) => void;
  private onRemoteStopCallback?: () => void;
  private onRemoteTempoCallback?: (bpm: number) => void;

  constructor() {
    this.initDemoPeers();
    this.setupChannel();
  }

  private initDemoPeers() {
    this.state.peers = [
      {
        id: 'peer_gtr1',
        name: 'Alex M. (Lead Guitar)',
        role: 'member',
        instrument: 'Electric Guitar',
        latencyMs: 7,
        status: 'synced',
      },
      {
        id: 'peer_bass',
        name: 'Jordan K. (Bass)',
        role: 'member',
        instrument: 'Bass Guitar',
        latencyMs: 9,
        status: 'synced',
      },
      {
        id: 'peer_keys',
        name: 'Elena R. (Synthesizer)',
        role: 'member',
        instrument: 'Keyboards / Synth',
        latencyMs: 11,
        status: 'synced',
      },
      {
        id: 'peer_brass',
        name: 'Marcus T. (Horns)',
        role: 'member',
        instrument: 'Trumpet',
        latencyMs: 8,
        status: 'synced',
      },
    ];
  }

  private setupChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(`beatbit_sync_${this.state.roomCode}`);
        this.channel.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };
      } catch {
        // BroadcastChannel fallback
      }
    }
  }

  public setCallbacks(callbacks: {
    onRemotePlay?: (bpm: number, timeSig: TimeSignature, sub: Subdivision) => void;
    onRemoteStop?: () => void;
    onRemoteTempo?: (bpm: number) => void;
  }) {
    this.onRemotePlayCallback = callbacks.onRemotePlay;
    this.onRemoteStopCallback = callbacks.onRemoteStop;
    this.onRemoteTempoCallback = callbacks.onRemoteTempo;
  }

  public setRoomCode(code: string) {
    this.state.roomCode = code.toUpperCase().trim();
    if (this.channel) {
      this.channel.close();
    }
    this.setupChannel();
    this.notify();
  }

  public setIsHost(isHost: boolean) {
    this.state.isHost = isHost;
    this.notify();
  }

  public setDeviceDetails(name: string, instrument: string) {
    this.state.deviceName = name;
    this.state.instrument = instrument;
    this.notify();
  }

  public toggleConnection(connect?: boolean) {
    this.state.connected = connect !== undefined ? connect : !this.state.connected;
    if (this.state.connected) {
      this.broadcast({
        type: 'JOIN_ROOM',
        peer: {
          id: this.myPeerId,
          name: this.state.deviceName,
          role: this.state.isHost ? 'host' : 'member',
          instrument: this.state.instrument,
          latencyMs: 8,
          status: 'synced',
        },
      });
    } else {
      this.broadcast({
        type: 'LEAVE_ROOM',
        peerId: this.myPeerId,
      });
    }
    this.notify();
  }

  public broadcastPlay(bpm: number, timeSig: TimeSignature, sub: Subdivision) {
    if (!this.state.connected || !this.state.isHost) return;
    this.broadcast({
      type: 'START_PLAY',
      timestamp: Date.now(),
      bpm,
    });
    this.broadcast({
      type: 'STATE_UPDATE',
      hostId: this.myPeerId,
      bpm,
      isPlaying: true,
      timeSignature: timeSig,
      subdivision: sub,
      serverTimestamp: Date.now(),
    });
  }

  public broadcastStop() {
    if (!this.state.connected || !this.state.isHost) return;
    this.broadcast({
      type: 'STOP_PLAY',
    });
  }

  public broadcastTempo(bpm: number) {
    if (!this.state.connected || !this.state.isHost) return;
    this.broadcast({
      type: 'TEMPO_CHANGE',
      bpm,
    });
  }

  private broadcast(msg: SyncMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch {
        // ignore
      }
    }
  }

  private handleIncomingMessage(msg: SyncMessage) {
    if (!this.state.connected) return;

    if (msg.type === 'START_PLAY') {
      if (!this.state.isHost && this.onRemotePlayCallback) {
        this.onRemotePlayCallback(msg.bpm, { numerator: 4, denominator: 4 }, '1');
      }
    } else if (msg.type === 'STOP_PLAY') {
      if (!this.state.isHost && this.onRemoteStopCallback) {
        this.onRemoteStopCallback();
      }
    } else if (msg.type === 'TEMPO_CHANGE') {
      if (!this.state.isHost && this.onRemoteTempoCallback) {
        this.onRemoteTempoCallback(msg.bpm);
      }
    } else if (msg.type === 'JOIN_ROOM') {
      if (msg.peer.id !== this.myPeerId && !this.state.peers.some((p) => p.id === msg.peer.id)) {
        this.state.peers.push(msg.peer);
        this.notify();
      }
    } else if (msg.type === 'LEAVE_ROOM') {
      this.state.peers = this.state.peers.filter((p) => p.id !== msg.peerId);
      this.notify();
    }
  }

  public subscribe(listener: (state: BandSyncState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  public getState(): BandSyncState {
    return { ...this.state };
  }
}

export const bandSyncService = new BandSyncService();
