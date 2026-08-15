const adjectives = [
  'sunny', 'golden', 'gentle', 'bright', 'happy',
  'lucky', 'sweet', 'warm', 'fresh', 'calm',
  'merry', 'cozy', 'sparkling', 'velvet', 'crystal',
  'amber', 'coral', 'ivory', 'silver', 'ruby',
  'fuzzy', 'breezy', 'cloudy', 'dizzy', 'fancy',
  'jolly', 'mellow', 'noble', 'peachy', 'rosy',
  'tidy', 'vivid', 'zesty', 'cosmic', 'dandy',
  'frosty', 'glossy', 'hearty', 'lively', 'misty',
  'plush', 'sassy', 'snappy', 'spicy', 'toasty',
  'ultra', 'witty', 'zippy', 'balmy', 'bubbly',
];

const nouns = [
  'dance', 'garden', 'river', 'forest', 'meadow',
  'breeze', 'sunset', 'harbor', 'castle', 'bridge',
  'fountain', 'lantern', 'bonfire', 'fireworks', 'carousel',
  'balloon', 'candle', 'confetti', 'ribbon', 'sparkler',
  'cupcake', 'muffin', 'waffle', 'cookie', 'pumpkin',
  'sunflower', 'rainbow', 'butterfly', 'dolphin', 'penguin',
  'panda', 'koala', 'unicorn', 'phoenix', 'dragon',
  'tiger', 'eagle', 'falcon', 'panther', 'crystal',
  'diamond', 'emerald', 'sapphire', 'topaz', 'kitchen',
  'patio', 'terrace', 'veranda', 'porch', 'attic',
  'cellar', 'closet', 'gallery', 'studio',
];

export function generateRoomCode(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${num}`;
}
