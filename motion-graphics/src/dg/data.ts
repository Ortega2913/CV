// David & Goliath motion graphics — timing, scene, and caption data.

export const FPS = 30;
export const WIDTH = 1280;
export const HEIGHT = 720;
export const VIDEO_DURATION_SECS = 45;

export interface SceneDef {
  id: number;
  start: number; // seconds
  end: number; // seconds
  title: string[]; // on-screen text lines
}

export const SCENES: SceneDef[] = [
  { id: 1, start: 0, end: 8, title: ['The Giant Challenge'] },
  { id: 2, start: 8, end: 18, title: ['David stepped forward'] },
  { id: 3, start: 18, end: 28, title: ['Faith over Fear'] },
  { id: 4, start: 28, end: 38, title: ['The Stone of Faith'] },
  { id: 5, start: 38, end: 45, title: ['1 Samuel 17', 'Faith Can Move Giants'] },
];

export interface CaptionDef {
  start: number;
  end: number;
  text: string;
}

// Voiceover lines, broken into readable on-screen chunks synced to each scene.
export const CAPTIONS: CaptionDef[] = [
  // Scene 1
  { start: 0.4, end: 3.6, text: 'In the valley of Elah,' },
  { start: 3.6, end: 7.8, text: 'a giant named Goliath defied the entire army of Israel.' },
  // Scene 2
  { start: 8.3, end: 11.6, text: 'But one shepherd boy, David, refused to fear.' },
  { start: 11.8, end: 17.7, text: '"Who is this Philistine that he should defy the armies of the living God?"' },
  // Scene 3
  { start: 18.3, end: 22.8, text: 'Armed with only a sling and five smooth stones,' },
  { start: 23.0, end: 27.7, text: 'and faith in the God of Israel, David ran toward the giant.' },
  // Scene 4
  { start: 28.4, end: 32.8, text: '"You come with sword and spear,' },
  { start: 33.0, end: 37.7, text: 'but I come in the name of the Lord of Hosts!"' },
  // Scene 5
  { start: 38.4, end: 44.6, text: 'That day, everyone knew the battle belongs to the Lord.' },
];

export const HIGHLIGHT_WORDS = new Set([
  'Goliath', 'David', 'God', 'Lord', 'Israel', 'Philistine', 'faith',
  'Faith', 'Elah', 'Hosts', 'living', 'giant', 'sling', 'stones',
  'battle', 'sword', 'spear',
]);
