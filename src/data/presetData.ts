import { Setlist, SongItem } from '../types';

export const INITIAL_SONGS: SongItem[] = [
  {
    id: 'song_1',
    title: 'Take Five',
    artist: 'Dave Brubeck Quartet',
    bpm: 174,
    timeSignature: { numerator: 5, denominator: 4 },
    subdivision: '1',
    accents: ['accent', 'normal', 'normal', 'accent', 'normal'], // 3 + 2
    durationSec: 324,
    key: 'Eb Minor',
    notes: 'Classic 5/4 swing feel. Count 1-2-3, 1-2. Alto sax lead.',
  },
  {
    id: 'song_2',
    title: 'Whiplash',
    artist: 'Hank Levy',
    bpm: 215,
    timeSignature: { numerator: 7, denominator: 8 },
    subdivision: '1',
    accents: ['accent', 'normal', 'accent', 'normal', 'accent', 'normal', 'normal'], // 2 + 2 + 3
    durationSec: 135,
    key: 'Bb',
    notes: 'Up-tempo 7/8 odd meter. Watch the ride cymbal accent displacement.',
  },
  {
    id: 'song_3',
    title: 'Superstition',
    artist: 'Stevie Wonder',
    bpm: 100,
    timeSignature: { numerator: 4, denominator: 4 },
    subdivision: '4', // 16th notes for clavinet funk!
    accents: ['accent', 'normal', 'accent', 'normal'],
    durationSec: 245,
    key: 'Eb Minor',
    notes: 'Tight 16th-note clavinet groove. Steady pocket on 2 and 4.',
  },
  {
    id: 'song_4',
    title: 'Spain',
    artist: 'Chick Corea',
    bpm: 132,
    timeSignature: { numerator: 4, denominator: 4 },
    subdivision: '2',
    accents: ['accent', 'normal', 'normal', 'normal'],
    durationSec: 390,
    key: 'B Minor',
    notes: 'Flamenco-jazz fusion. Fast unison line after the Aranjuez intro.',
  },
  {
    id: 'song_5',
    title: 'The Great Gig in the Sky',
    artist: 'Pink Floyd',
    bpm: 64,
    timeSignature: { numerator: 6, denominator: 8 },
    subdivision: '1',
    accents: ['accent', 'normal', 'normal', 'normal', 'normal', 'normal'],
    durationSec: 284,
    key: 'F Major',
    notes: 'Slow, majestic 6/8 ballad. Flow with the dotted quarter pulse.',
  },
  {
    id: 'song_6',
    title: 'Bulgarian Folk Dance (Kopanitsa)',
    artist: 'Traditional Balkan',
    bpm: 310,
    timeSignature: { numerator: 11, denominator: 16 },
    subdivision: '1',
    accents: ['accent', 'normal', 'accent', 'normal', 'accent', 'normal', 'normal', 'accent', 'normal', 'accent', 'normal'], // 2+2+3+2+2
    durationSec: 180,
    key: 'Modal',
    notes: 'Complex 11/16 meter divided into 2+2+3+2+2. Accents must be crisp.',
  },
  {
    id: 'song_7',
    title: 'Master of Puppets',
    artist: 'Metallica',
    bpm: 212,
    timeSignature: { numerator: 4, denominator: 4 },
    subdivision: '1',
    accents: ['accent', 'normal', 'normal', 'normal'],
    durationSec: 515,
    key: 'E Minor',
    notes: 'Relentless downpicking thrash metal standard at 212 BPM.',
  },
];

export const INITIAL_SETLISTS: Setlist[] = [
  {
    id: 'setlist_main',
    name: 'Festival Main Stage Set',
    description: 'High-energy live performance program with dynamic meter shifts.',
    songs: [
      INITIAL_SONGS[2], // Superstition
      INITIAL_SONGS[3], // Spain
      INITIAL_SONGS[0], // Take Five
      INITIAL_SONGS[1], // Whiplash
    ],
  },
  {
    id: 'setlist_odd_meters',
    name: 'Odd Meter Mastery',
    description: 'Special practice list for odd time signatures: 5/4, 7/8, and 11/16.',
    songs: [
      INITIAL_SONGS[0], // Take Five (5/4)
      INITIAL_SONGS[1], // Whiplash (7/8)
      INITIAL_SONGS[5], // Bulgarian Dance (11/16)
    ],
  },
  {
    id: 'setlist_warmup',
    name: 'Daily Technique & Pocket',
    description: 'Precision timing, syncopation drills, and groove calibration.',
    songs: [
      INITIAL_SONGS[4], // Pink Floyd (6/8)
      INITIAL_SONGS[2], // Superstition (16th groove)
      INITIAL_SONGS[6], // Master of Puppets (Speed endurance)
    ],
  },
];

export const TEMPO_MARKINGS = [
  { name: 'Larghissimo', min: 20, max: 24 },
  { name: 'Grave', min: 25, max: 44 },
  { name: 'Largo', min: 45, max: 59 },
  { name: 'Larghetto', min: 60, max: 65 },
  { name: 'Adagio', min: 66, max: 75 },
  { name: 'Andante', min: 76, max: 107 },
  { name: 'Moderato', min: 108, max: 119 },
  { name: 'Allegro', min: 120, max: 155 },
  { name: 'Vivace', min: 156, max: 175 },
  { name: 'Presto', min: 176, max: 200 },
  { name: 'Prestissimo', min: 201, max: 400 },
];

export function getTempoMarking(bpm: number): string {
  const match = TEMPO_MARKINGS.find((t) => bpm >= t.min && bpm <= t.max);
  return match ? match.name : 'Allegro';
}
