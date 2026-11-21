export type Lang = "fa" | "en";

export interface BiText {
  fa: string;
  en: string;
}

export type Difficulty = "easy" | "medium" | "special";

export interface LevelMeta {
  id: number;
  world: number;
  name: BiText;
  question: BiText;
  hints: [BiText, BiText, BiText];
  solution: BiText;
  difficulty: Difficulty;
  mechanic: string;
}

export interface WorldMeta {
  id: number;
  name: BiText;
  desc: BiText;
  color: string;
  soft: string;
}

/** Props every level component receives from the Gameplay screen. */
export interface LevelProps {
  lang: Lang;
  /** true after the level is solved; freeze interactions */
  solved: boolean;
  /** call once when the puzzle is solved */
  onSolved: () => void;
  /** call on a clearly wrong attempt (parent rate-limits star penalty) */
  onMistake: (msg?: BiText) => void;
  /** report sub-goal progress 0..1 */
  onProgress: (p: number) => void;
  /** increments each time the "show me" hint is used; level should pulse its key object */
  hintPulse: number;
}
