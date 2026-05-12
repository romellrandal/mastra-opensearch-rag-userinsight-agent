export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const seconds = (s: number) => Math.round(s * FPS);

export const COLORS = {
  jade: "#4ade80",
  jadeDark: "#166534",
  ruby: "#f87171",
  yasmin: "#fbbf24",
  ben: "#60a5fa",
  bg1: "#1a1a2e",
  bg2: "#16213e",
  bg3: "#0f3460",
  road: "#2d2d2d",
  roadLine: "#f0c040",
  white: "#e2e8f0",
  gold: "#fbbf24",
  cream: "#f0fdf4",
};

export type CharacterKey = "jade" | "ruby" | "yasmin" | "ben";

export interface StoryScene {
  id: string;
  durationSeconds: number;
  character: CharacterKey;
  emoji: string;
  text: string;
  speech?: string;
  speechColor?: string;
  otherCars?: Array<{ emoji: string; color: string; label: string }>;
}

export const CHARACTER_COLORS: Record<CharacterKey, string> = {
  jade: COLORS.jade,
  ruby: COLORS.ruby,
  yasmin: COLORS.yasmin,
  ben: COLORS.ben,
};

export const CHARACTER_NAMES: Record<CharacterKey, string> = {
  jade: "Jade",
  ruby: "Ruby",
  yasmin: "Yasmin",
  ben: "Ben",
};

export const SCENES: StoryScene[] = [
  {
    id: "excited",
    durationSeconds: 8,
    character: "jade",
    emoji: "🟢🚗",
    text: "It was Jade the Green Car's first ever race.\nShe was very excited and couldn't stop grinning.",
    speech: '"I hope I get a medal!" she cried.',
    speechColor: COLORS.jade,
  },
  {
    id: "ruby-tire",
    durationSeconds: 9,
    character: "ruby",
    emoji: "🔴🚗",
    text: "Around the first bend, she saw Ruby the Red Car\nwith a flat tire. So Jade stopped to replace it.",
    otherCars: [{ emoji: "🟢🚗", color: COLORS.jade, label: "Jade" }],
    speechColor: COLORS.ruby,
  },
  {
    id: "yasmin-water",
    durationSeconds: 9,
    character: "yasmin",
    emoji: "🟡🚗",
    text: 'Around the next bend, Yasmin the Yellow Car\ncalled for help.',
    speech: '"Need water!" she panted.',
    speechColor: COLORS.yasmin,
    otherCars: [{ emoji: "🟢🚗", color: COLORS.jade, label: "Jade" }],
  },
  {
    id: "ben-gas",
    durationSeconds: 9,
    character: "ben",
    emoji: "🔵🚗",
    text: "Around the next bend, she saw Ben the Blue Car.",
    speech: '"I\'ve run out of gas!" Ben stuttered.\nJade lent him some and zoomed on.',
    speechColor: COLORS.ben,
    otherCars: [{ emoji: "🟢🚗", color: COLORS.jade, label: "Jade" }],
  },
  {
    id: "last-place",
    durationSeconds: 9,
    character: "jade",
    emoji: "🟢🚗",
    text: "But after helping all the other cars,\nJade finished the race in last place.",
    speech: '"I\'m never gonna get a medal now," she said,\ndipping her headlights.',
    speechColor: COLORS.jade,
  },
  {
    id: "cheers",
    durationSeconds: 11,
    character: "jade",
    emoji: "🟢🚗",
    text: "The other cars gathered around.",
    speech:
      '"Jade was last because she stopped to help us," said Ruby.\n"She\'s the real winner," said Yasmin.\n"Three cheers for the kindest car in the race!"',
    speechColor: COLORS.jade,
    otherCars: [
      { emoji: "🔴🚗", color: COLORS.ruby, label: "Ruby" },
      { emoji: "🟡🚗", color: COLORS.yasmin, label: "Yasmin" },
      { emoji: "🔵🚗", color: COLORS.ben, label: "Ben" },
    ],
  },
];

// Cumulative frame offsets for each scene (after title)
export const TITLE_DURATION = seconds(5);
export const ENDING_DURATION = seconds(7);

export const TOTAL_DURATION =
  TITLE_DURATION +
  SCENES.reduce((acc, s) => acc + seconds(s.durationSeconds), 0) +
  ENDING_DURATION;
