"use client";
import React from "react";
import type { LevelMeta, LevelProps } from "../types";
import { makeGenericLevel } from "./engine";
import type { GLevel } from "./types";
import { PART_103_112 } from "./parts/data-103-112";
import { PART_113_142 } from "./parts/data-113-142";
import { PART_143_172 } from "./parts/data-143-172";
import { PART_173_202 } from "./parts/data-173-202";
import { PART_203_232 } from "./parts/data-203-232";
import { PART_233_262 } from "./parts/data-233-262";
import { PART_263_292 } from "./parts/data-263-292";
import { PART_293_322 } from "./parts/data-293-322";
import { PART_323_352 } from "./parts/data-323-352";
import { PART_353_382 } from "./parts/data-353-382";
import { PART_383_412 } from "./parts/data-383-412";
import { PART_413_442 } from "./parts/data-413-442";
import { PART_443_472 } from "./parts/data-443-472";
import { PART_473_502 } from "./parts/data-473-502";
import { PART_503_532 } from "./parts/data-503-532";
import { PART_533_562 } from "./parts/data-533-562";
import { PART_563_600 } from "./parts/data-563-600";

/* All 498 data-driven levels (103-600). Levels 401-412 and 451-462 are
   brand-new designs (newContent: true) because they are absent from the DOCX. */
export const GENERIC_LEVELS: GLevel[] = [
  ...PART_103_112,
  ...PART_113_142,
  ...PART_143_172,
  ...PART_173_202,
  ...PART_203_232,
  ...PART_233_262,
  ...PART_263_292,
  ...PART_293_322,
  ...PART_323_352,
  ...PART_353_382,
  ...PART_383_412,
  ...PART_413_442,
  ...PART_443_472,
  ...PART_473_502,
  ...PART_503_532,
  ...PART_533_562,
  ...PART_563_600,
].sort((a, b) => a.id - b.id);

if (process.env.NODE_ENV !== "production" && GENERIC_LEVELS.length !== 498) {
  console.warn(`[levels2] expected 498 generic levels, got ${GENERIC_LEVELS.length}`);
}

/** LevelMeta view of every generic level (drives question card, hints, victory). */
export const GENERIC_METAS: LevelMeta[] = GENERIC_LEVELS.map((g) => ({
  id: g.id,
  world: g.world,
  name: g.name,
  question: g.question,
  hints: g.hints,
  solution: g.solution,
  difficulty: g.difficulty,
  mechanic: g.mechanic,
}));

/** id -> interactive component for every generic level. */
export const GENERIC_COMPONENTS: Record<number, React.ComponentType<LevelProps>> = Object.fromEntries(
  GENERIC_LEVELS.map((g) => [g.id, makeGenericLevel(g)])
);
