import React, { useState } from 'react';
import { AccentLevel, Setlist, SongItem, Subdivision, TimeSignature } from '../types';
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  ArrowUp,
  ArrowDown,
  Music,
  FolderPlus,
  Check,
  Search,
  Filter,
} from 'lucide-react';

interface SetlistManagerProps {
  setlists: Setlist[];
  activeSetlistId: string;
  activeSongId: string | null;
  onSelectSetlist: (id: string) => void;
  onLoadSong: (song: SongItem, autoPlay?: boolean) => void;
  onUpdateSetlists: (setlists: Setlist[]) => void;
}

export const SetlistManager: React.FC<SetlistManagerProps> = ({
  setlists,
  activeSetlistId,
  activeSongId,
  onSelectSetlist,
  onLoadSong,
  onUpdateSetlists,
}) => {
  const currentSetlist = setlists.find((s) => s.id === activeSetlistId) || setlists[0];
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showNewSetlistModal, setShowNewSetlistModal] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'fast' | 'slow'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Song Form State
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newBpm, setNewBpm] = useState<number>(120);
  const [newNumerator, setNewNumerator] = useState<number>(4);
  const [newDenominator, setNewDenominator] = useState<number>(4);
  const [newSubdivision, setNewSubdivision] = useState<Subdivision>('1');
  const [newKey, setNewKey] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newSetlistName, setNewSetlistName] = useState('');

  const handleMoveSong = (index: number, direction: 'up' | 'down') => {
    if (!currentSetlist) return;
    const songs = [...currentSetlist.songs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= songs.length) return;

    const temp = songs[index];
    songs[index] = songs[targetIndex];
    songs[targetIndex] = temp;

    const updated = setlists.map((s) => (s.id === currentSetlist.id ? { ...s, songs } : s));
    onUpdateSetlists(updated);
  };

  const handleDeleteSong = (songId: string) => {
    if (!currentSetlist) return;
    const songs = currentSetlist.songs.filter((s) => s.id !== songId);
    const updated = setlists.map((s) => (s.id === currentSetlist.id ? { ...s, songs } : s));
    onUpdateSetlists(updated);
  };

  const handleCreateSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const defaultAccents: AccentLevel[] = [];
    for (let i = 0; i < newNumerator; i++) {
      defaultAccents.push(i === 0 ? 'accent' : 'normal');
    }

    const newSong: SongItem = {
      id: 'song_' + Date.now(),
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Custom Chart',
      bpm: newBpm,
      timeSignature: { numerator: newNumerator, denominator: newDenominator },
      subdivision: newSubdivision,
      accents: defaultAccents,
      key: newKey.trim() || undefined,
      notes: newNotes.trim() || undefined,
      durationSec: 210,
    };

    const updated = setlists.map((s) =>
      s.id === currentSetlist.id ? { ...s, songs: [...s.songs, newSong] } : s
    );
    onUpdateSetlists(updated);

    // Reset
    setNewTitle('');
    setNewArtist('');
    setNewKey('');
    setNewNotes('');
    setShowAddSongModal(false);
  };

  const handleCreateSetlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetlistName.trim()) return;

    const newSet: Setlist = {
      id: 'setlist_' + Date.now(),
      name: newSetlistName.trim(),
      description: 'Concert setlist',
      songs: [],
    };

    onUpdateSetlists([...setlists, newSet]);
    onSelectSetlist(newSet.id);
    setNewSetlistName('');
    setShowNewSetlistModal(false);
  };

  // Filter songs
  const filteredSongs = (currentSetlist?.songs || []).filter((song) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = song.title.toLowerCase().includes(q);
      const matchArtist = song.artist.toLowerCase().includes(q);
      if (!matchTitle && !matchArtist) return false;
    }
    if (filterMode === 'fast') return song.bpm >= 120;
    if (filterMode === 'slow') return song.bpm < 120;
    return true;
  });

  return (
    <div className="w-full max-w-md mx-auto flex flex-col space-y-3 pb-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Setlist & Repertoire
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Organize live sets, rehearsal drills, and trigger exact tempos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewSetlistModal(true)}
            className="px-3.5 py-2 rounded-full bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold border border-neutral-200/80 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5 text-neutral-500" />
            <span>New Set</span>
          </button>
          <button
            onClick={() => setShowAddSongModal(true)}
            className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm shadow-orange-500/25 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Song</span>
          </button>
        </div>
      </div>

      {/* Setlist Tabs (Horizontal Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {setlists.map((s) => {
          const isActive = s.id === currentSetlist?.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSetlist(s.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white hover:bg-neutral-50 text-neutral-600 border border-neutral-200/80 shadow-2xs'
              }`}
            >
              <span>{s.name}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {s.songs.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Pills & Search Bar (Matching Screen 2 of image.png) */}
      <div className="bg-white rounded-[24px] border border-neutral-200/80 p-3.5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                filterMode === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All ({currentSetlist?.songs.length || 0})
            </button>
            <button
              onClick={() => setFilterMode('fast')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                filterMode === 'fast'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Fast (≥120)
            </button>
            <button
              onClick={() => setFilterMode('slow')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                filterMode === 'slow'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Slow (&lt;120)
            </button>
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search charts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 rounded-full bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Song Cards List (Matching Screen 2 of image.png) */}
      {filteredSongs.length === 0 ? (
        <div className="bg-white rounded-[28px] border border-dashed border-neutral-300 p-10 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Music className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-800">No songs found</h3>
          <p className="text-xs text-neutral-400 mt-1 mb-4">
            Add repertoire songs with custom tempos and time signatures
          </p>
          <button
            onClick={() => setShowAddSongModal(true)}
            className="px-4 py-2 rounded-full bg-orange-500 text-white font-bold text-xs shadow-sm shadow-orange-500/25"
          >
            Add First Song
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSongs.map((song, index) => {
            const isCurrent = song.id === activeSongId;
            // Progress calculation based on BPM (40-240 scale)
            const tempoPercent = Math.min(100, Math.max(10, Math.round(((song.bpm - 40) / 200) * 100)));

            // Color scheme based on tempo category
            const isHighSpeed = song.bpm >= 140;
            const iconBg = isHighSpeed ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-700';

            return (
              <div
                key={song.id}
                className={`bg-white rounded-[24px] p-4 sm:p-5 border transition-all duration-150 ${
                  isCurrent
                    ? 'border-orange-500 shadow-md ring-1 ring-orange-500/20'
                    : 'border-neutral-200/80 hover:border-neutral-300 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Circular icon, Title, Subtitle, Badges */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${iconBg}`}
                    >
                      <Music className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-neutral-900">{song.title}</h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-500 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                        <span>{song.artist}</span>
                        {song.key && (
                          <>
                            <span className="text-neutral-300">•</span>
                            <span className="font-semibold text-neutral-700">{song.key}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Badges & Load Button */}
                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-100 font-mono text-xs font-black text-neutral-800">
                      {song.bpm} BPM
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-neutral-100 font-mono text-xs font-bold text-neutral-600">
                      {song.timeSignature.numerator}/{song.timeSignature.denominator}
                    </span>

                    {/* Load & Play Button */}
                    <button
                      onClick={() => onLoadSong(song, true)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isCurrent
                          ? 'bg-neutral-900 text-white'
                          : 'bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200'
                      }`}
                      title="Load into Metronome"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCurrent ? 'Loaded' : 'Play'}</span>
                    </button>
                  </div>
                </div>

                {/* Progress / Tempo Bar (Matching Screen 2 in image.png) */}
                <div className="mt-3.5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-4">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isHighSpeed
                            ? 'bg-gradient-to-r from-orange-400 to-amber-500'
                            : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                        }`}
                        style={{ width: `${tempoPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 font-semibold w-10 text-right">
                      {tempoPercent}%
                    </span>
                  </div>

                  {/* Reorder and Delete Actions */}
                  <div className="flex items-center gap-1 text-neutral-400">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveSong(index, 'up')}
                      className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30 text-neutral-500 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === currentSetlist.songs.length - 1}
                      onClick={() => handleMoveSong(index, 'down')}
                      className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-30 text-neutral-500 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSong(song.id)}
                      className="p-1 rounded-lg hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Song */}
      {showAddSongModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-neutral-200 p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 mb-4">Add Song to Setlist</h3>
            <form onSubmit={handleCreateSong} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Song Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autumn Leaves"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Artist / Composer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Miles Davis"
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Tempo (BPM)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="400"
                    value={newBpm}
                    onChange={(e) => setNewBpm(parseInt(e.target.value, 10))}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs font-mono font-bold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Key Signature
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. G Minor"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Time Signature
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="16"
                      value={newNumerator}
                      onChange={(e) => setNewNumerator(parseInt(e.target.value, 10))}
                      className="w-16 bg-neutral-50 border border-neutral-300 rounded-xl p-2 text-center text-xs font-mono font-bold"
                    />
                    <span className="text-neutral-400 font-bold">/</span>
                    <select
                      value={newDenominator}
                      onChange={(e) => setNewDenominator(parseInt(e.target.value, 10))}
                      className="w-16 bg-neutral-50 border border-neutral-300 rounded-xl p-2 text-center text-xs font-mono font-bold"
                    >
                      <option value={2}>2</option>
                      <option value={4}>4</option>
                      <option value={8}>8</option>
                      <option value={16}>16</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Subdivision
                  </label>
                  <select
                    value={newSubdivision}
                    onChange={(e) => setNewSubdivision(e.target.value as Subdivision)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2 text-xs"
                  >
                    <option value="1">Quarter Notes (1:1)</option>
                    <option value="2">Eighths (2)</option>
                    <option value="3">Triplets (3)</option>
                    <option value="4">Sixteenths (4)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Performance Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4-bar drum intro, vamp at coda"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddSongModal(false)}
                  className="px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm"
                >
                  Save Song
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Setlist */}
      {showNewSetlistModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-neutral-200 p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 mb-4">Create New Setlist</h3>
            <form onSubmit={handleCreateSetlist} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Setlist Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tour Set 2026"
                  value={newSetlistName}
                  onChange={(e) => setNewSetlistName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSetlistModal(false)}
                  className="px-4 py-2 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-orange-500 text-white text-xs font-bold shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
