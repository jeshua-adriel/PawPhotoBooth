export const FILTERS = {
  none:  { label: 'None',           emoji: '✨', css: 'none' },
  warm:  { label: 'Warm',           emoji: '🌇', css: 'sepia(0.25) saturate(1.35) brightness(1.05) hue-rotate(-8deg)' },
  cool:  { label: 'Cool',           emoji: '❄️', css: 'saturate(1.15) brightness(1.03) hue-rotate(12deg) contrast(1.05)' },
  bw:    { label: 'Black & White',  emoji: '⚫', css: 'grayscale(1) contrast(1.1)' },
  sepia: { label: 'Sepia',          emoji: '📜', css: 'sepia(0.65) contrast(1.05)' },
  vivid: { label: 'Vivid',          emoji: '🌈', css: 'saturate(1.6) contrast(1.15) brightness(1.03)' },
}

export const FILTER_ORDER = ['none', 'warm', 'cool', 'bw', 'sepia', 'vivid']

export const FRAME_DECOR = {
  paws:     { label: 'Paw Party',     emoji: '🐾', glyphs: ['🐾', '🐾', '🐾', '🐾'] },
  hearts:   { label: 'Heart Bubbles', emoji: '💕', glyphs: ['💕', '🌸', '💕', '🌸'] },
  whiskers: { label: 'Cat Whiskers',  emoji: '🐱', glyphs: ['🐱', '🐾', '🐾', '🐱'] },
  none:     { label: 'No Frame',      emoji: '✨', glyphs: null },
}

export const FRAME_DECOR_ORDER = ['paws', 'hearts', 'whiskers', 'none']

export const DEFAULT_SETTINGS = {
  filter: 'none',
  cardStyle: 'single',      // 'single' | 'strip' (3 quick couple shots)
  arrangement: 'side',      // 'side' (side-by-side) | 'stacked' (one above the other)
  frameDecor: 'paws',
}
