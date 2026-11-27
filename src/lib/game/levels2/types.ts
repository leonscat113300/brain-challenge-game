import type { LevelMeta } from "../types";
import type { ShapeName } from "./shapes";

/* ------------------------------------------------------------------ */
/* Data-driven level system for levels 103-600.                        */
/* Every level = one GLevel object; the generic engine renders it.     */
/* ------------------------------------------------------------------ */

export type Mech =
  | "tap" // tap the correct element(s) — order irrelevant
  | "sequence" // tap elements in the exact given order
  | "drag" // drag items onto drop targets
  | "rotate" // rotate an element to the target angle
  | "hidden" // find camouflaged elements
  | "count" // type the numeric answer on a keypad
  | "path" // connect nodes in order (draws a line)
  | "multitouch" // press two elements at the same time
  | "combo"; // ordered mini-steps (drag/tap/rotate/sequence/hidden)

export interface SceneEl {
  id: string;
  s: ShapeName;
  /** center position in % of scene (0..100) */
  x: number;
  y: number;
  /** width in % of scene width (height follows the shape aspect) */
  sz?: number;
  c?: string;
  c2?: string;
  /** rotation in degrees */
  r?: number;
  /** small caption rendered under the element */
  label?: string | { fa: string; en: string };
  /** draggable item (drag mech / combo drag steps) */
  drag?: boolean;
  /** camouflaged element (hidden mech / combo hidden steps) */
  hidden?: boolean;
  /** tap penalty target: tapping it counts as a mistake */
  decoy?: boolean;
  /** slide to this position when the level is solved (celebration) */
  moveTo?: [number, number];
  /** gentle idle floating animation */
  bob?: boolean;
}

export interface DropTarget {
  id: string;
  x: number;
  y: number;
  /** item ids allowed to land here */
  accept: string[];
  sz?: number;
  c?: string;
  /** rotation applied to a placed item */
  r?: number;
  label?: string | { fa: string; en: string };
}

export interface Option {
  id: string;
  fa: string;
  en: string;
}

export interface ComboStep {
  mech: Exclude<Mech, "combo" | "multitouch" | "count">;
  /** short instruction shown while this step is active */
  prompt: { fa: string; en: string };
  correct: string[];
  options?: Option[];
  /** rotate target angle */
  to?: number;
}

export interface GLevel extends LevelMeta {
  mech: Mech;
  scene: SceneEl[];
  targets?: DropTarget[];
  /** text chips for observe/riddle "tap" levels */
  options?: Option[];
  /**
   * mech dependent:
   *  tap/hidden      -> ids that must all be tapped
   *  sequence/path   -> ids in the exact required order
   *  drag            -> item ids that must be placed
   *  rotate          -> [elementId]  (target angle in `to`)
   *  count           -> [answer as string]
   *  multitouch      -> exactly two ids pressed together
   */
  correct: string[];
  /** rotate step in degrees (default 45) */
  step?: number;
  /** rotate target angle */
  to?: number;
  /** combo steps */
  steps?: ComboStep[];
  /** true for levels designed fresh (not present in the DOCX) */
  newContent?: boolean;
}
