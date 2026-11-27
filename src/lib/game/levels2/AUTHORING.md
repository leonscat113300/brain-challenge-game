# AUTHORING GUIDE — Levels 103-600 (data-driven)

You are authoring ONE data file for a batch of puzzle levels of the Persian brain-teaser game
«مغزتو به چالش بکش!» (Brain Challenge). The generic engine renders every level from data.

## 0. Files to read first (in this order)

1. `src/lib/game/levels2/AUTHORING.md` (this file)
2. `src/lib/game/levels2/types.ts` — exact TypeScript shapes
3. `src/lib/game/levels2/shapes.tsx` — bottom of file: `CORE_SHAPES` registry (all shape keys)
4. `src/lib/game/levels2/shapes-obj.tsx` — bottom of file: `OBJ_SHAPES` registry (all shape keys)
5. `src/lib/game/levels2/parts/data-103-112.ts` — GOLD SAMPLE. Mimic its structure and quality.
6. `/home/z/docx-levels.json` — source puzzle text (fields: `id`, `q` (Persian question), `sol` (Persian correct solution), `mech` (Persian mechanism label)). Find your rows with Grep, e.g. pattern `"id": 1[1-4][0-9]`.

## 1. Output file

- Path: `src/lib/game/levels2/parts/data-AAA-BBB.ts` (AAA-BBB = your id range, e.g. `data-113-142.ts`)
- Content: `import type { GLevel } from "../types";` then
  `export const PART_AAA_BBB: GLevel[] = [ ...one object per level... ];`
- Include EVERY id in your range exactly once, in ascending order. No gaps, no duplicates.

## 2. Per-level required fields (GLevel)

```ts
{
  id: number,                 // level id
  world: number,              // ((Math.ceil(id/50) - 1) % 12) + 1
  name: { fa, en },           // short 2-4 word title
  question: { fa, en },       // fa = EXACTLY the DOCX `q` text; en = your translation
  hints: [ {fa,en}, {fa,en}, {fa,en} ],
    // hints[0] = subtle nudge (no giveaway)
    // hints[1] = direct pointer to the key object/action
    // hints[2] = exact action — copy the DOCX `sol` text for fa, translate for en
  solution: { fa, en },       // fa = EXACTLY the DOCX `sol` text; en = translation
  difficulty: "easy" | "medium" | "special",
    // easy: id 103-150, medium: 151-350, special: 351-600
  mechanic: string,           // keep the DOCX `mech` label verbatim (e.g. "Drag", "مشاهده")
  mech: Mech,                 // engine mechanism, see mapping table below
  scene: SceneEl[],           // 3-7 elements; first = background, last = foreground
  correct: string[],          // see per-mech semantics below
  options?: Option[],         // for "which one?" questions rendered as text chips
  targets?: DropTarget[],     // for drag levels
  to?: number, step?: number, // for rotate levels
  steps?: ComboStep[],        // for combo levels
  newContent?: true,          // ONLY for ids absent from the DOCX (401-412, 451-462)
}
```

### Mech mapping (DOCX `mech` → `mech`)

| DOCX label | mech |
|---|---|
| Drag, جابه‌جایی, جابجایی, جست‌وجو و Drag, تطبیق (pair matching) | `drag` |
| مشاهده, منطق, استنتاج, مقایسه, تشخیص الگو, تشخیص تصویر, الگویابی, ترکیب رنگ | `tap` (use `options` when the question is "which one?"; otherwise scene-tap + `decoy` elements) |
| لمس, صدا, تکنیک, مهارت, ترفند, حواس‌پرتی | `tap` (scene interaction; add `moveTo` for fun reactions) |
| دو انگشت / همزمان / Multi-touch | `multitouch` |
| ترکیب اشیا, چندمرحله‌ای, چند مرحله‌ای | `combo` (2-3 steps) or `drag` if truly one drop |
| چرخاندن, تنظیم, چرخش, تنظیم‌پذیری | `rotate` (set `to` and optionally `step`) |
| Hidden Object, جست‌وجو (find hidden thing) | `hidden` |
| ترتیب, مرتب‌سازی, توالی, بازآرایی, ترتیب‌پذیری | `sequence` |
| رسم مسیر, ماز, اتصال, وصل کردن نقاط | `path` |
| حل مسئله, ریاضی, محاسبه, شمارش, معادله, ضرب, جدول, عددی, جای خالی عددی | `count` |

### `correct` semantics

- `tap`: ids of all elements/options that must be tapped (usually 1).
- `sequence`/`path`: ids in the EXACT order to tap.
- `drag`: ids of every draggable item that must be placed.
- `rotate`: `[elementId]` and set `to` (target angle). `step` defaults 45.
- `hidden`: ids of hidden elements (set `hidden: true` on those elements).
- `count`: `[ "answer" ]` as a string number.
- `multitouch`: exactly 2 element ids (press both at once).
- `combo`: not used for completion (steps drive it) but list all item/element ids used.

### SceneEl coordinates

- `x`,`y` = percent of scene box (0-100). Keep contents inside x:8-92, y:14-88.
- `sz` = width percent (default 24). Use 30-40 for main characters, 12-20 for props.
- Later elements render on top. Put backgrounds (ground/water/hill) FIRST.
- `label` shows a small caption chip under the element — use it to disambiguate.
- `bob: true` adds idle floating — give it to 1-2 living things per scene.
- `moveTo: [x,y]` slides the element there on solve — great for reveal reactions.
- `decoy: true` marks tappable-but-wrong targets (only for tap/hidden mechs).
- `hidden: true` renders the element camouflaged (hidden mech).
- Colors: use the game palette: purple #6C4AB6, dark #33205E, yellow #FFD154, turquoise #1EC8CF,
  pink #FF6B81, green #4CAF50, white #FAFAFA, ink #3B2E5A, orange #FF8C42, wood #8B5E3C.

### Available shape keys

Read the two registry blocks at the bottom of `shapes.tsx` and `shapes-obj.tsx`.
Highlights: cat dog rabbit bear mouse bird duck owl chicken chick cow pig sheep frog snail bee
butterfly ant spider turtle elephant lion monkey fish penguin snake fox whale kid hand paw paw3
paw4 paw5 eyeball heart brain tree bush flower tulip leaf mushroom cactus sun moon star cloud
raindrop rainbow mountain hill wave fire lightning snowflake house door window key lock clock lamp
chair table bed sofa tv phone fan pot cup mug bottle jug glass plate bowl spoon fork knife scissors
book pencil paper mirror bulb battery magnet rope ladder stairs box gift bag coin button sock hat
shoe umbrella drum bell candle match flag map magnifier scale hourglass trophy crown medal puzzle
dice balloon kite ball cube diamond ring letter log broom bucket mic apple banana cherry grape
watermelon strawberry orange carrot egg bread cheese cake candy iceCream cookie car bus train boat
plane rocket bike bridge castle tent fence ground water cave sign sparkle blob speech

If a needed noun has no shape, use the closest shape + a `label` caption (e.g. key with label
«کلید طلایی»), or `sign`/`blob`.

## 3. Quality rules

- Persian (`fa`) text: natural, friendly, EXACT question/solution text from the DOCX.
- English (`en`): correct, concise translations (6-14 words for questions).
- NO emoji anywhere. No trailing whitespace. Standard double quotes.
- Scene must visually match the question story (图文一致): if the question mentions a cat, a fish
  and a pond — the scene shows a cat, a fish and a pond.
- Difficulty must actually rise with the level id: later batches use more combo/sequence/count/
  multi-target mechanisms, more decoys, subtler scenes.
- Every interactive id referenced anywhere (`correct`, `targets[].accept`, `steps[].correct`)
  MUST exist in `scene` or `options`.
- For `drag` levels: mark items `drag: true`, add matching `targets`. Wrong-but-plausible extra
  targets are welcome (accept other items) so misses are penalized.
- For `count` levels: build the scene so the answer is countable/derivable (objects, digits, equations on `sign` labels).
- For `rotate` levels: the rotating element must visually show orientation (clock hands via label,
  arrow via `lightning` shape, sock direction, picture tilt, etc.). Use labels to explain.
- Keep each level object between ~14 and ~30 lines.

## 4. Self-check before finishing

Re-read your file: valid TS, all ids present once, every referenced id defined. Your file will be
validated automatically; rejected batches are returned for fixes.

## 5. Levels 401-412 and 451-462 (only if they are in your range)

These ids are NOT in the DOCX. Design fresh puzzles in the same style and set `newContent: true`.
Keep difficulty consistent with neighbors (401-412: medium→special transition; 451-462: special).
Vary mechanisms across the 12.
