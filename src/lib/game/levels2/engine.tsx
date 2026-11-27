"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, RotateCw, Delete, Check } from "lucide-react";
import type { LevelProps } from "../types";
import { sfx } from "@/components/game/levels/shared";
import { bi, num } from "../utils";
import { Shape, shapeAspect } from "./shapes";
import type { ComboStep, DropTarget, GLevel, Option, SceneEl } from "./types";

/* ------------------------------------------------------------------ */
/* Generic data-driven level renderer for levels 103-600.              */
/* Supports: tap / sequence / drag / rotate / hidden / count / path /  */
/* multitouch / combo.                                                 */
/* ------------------------------------------------------------------ */

const PCT = (v: number) => `${v}%`;

function labelOf(l: SceneEl["label"] | DropTarget["label"], lang: "fa" | "en"): string | null {
  if (!l) return null;
  return typeof l === "string" ? l : l[lang];
}

interface Pos {
  x: number;
  y: number;
}

function stepInteracts(s: ComboStep, id: string): boolean {
  if (s.mech === "drag") return false; // items are draggable via their own flag
  if (s.mech === "rotate") return id === s.correct[0];
  return s.correct.includes(id);
}

export default function GenericLevel({ data, lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps & { data: GLevel }) {
  const scene = data.scene;
  const targets = data.targets ?? [];
  const dragItems = useMemo(() => scene.filter((e) => e.drag), [scene]);
  const hiddenItems = useMemo(() => scene.filter((e) => e.hidden), [scene]);

  const [pos, setPos] = useState<Record<string, Pos>>(() => {
    const m: Record<string, Pos> = {};
    scene.forEach((e) => {
      m[e.id] = { x: e.x, y: e.y };
    });
    return m;
  });
  const [found, setFound] = useState<string[]>([]);
  const [seqIdx, setSeqIdx] = useState(0);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [rot, setRot] = useState<number>(() => scene.find((e) => e.id === data.correct[0])?.r ?? 0);
  const [answer, setAnswer] = useState("");
  const [pressed, setPressed] = useState<string[]>([]);
  const [lastDown, setLastDown] = useState<Record<string, number>>({});
  const [stepIdx, setStepIdx] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [pulseId, setPulseId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---------------- derived ---------------- */

  const step: ComboStep | null = data.mech === "combo" ? data.steps?.[stepIdx] ?? null : null;
  const activeCorrect = step ? step.correct : data.correct;
  const rotTo = ((step ? step.to ?? 0 : data.to ?? 0) % 360 + 360) % 360;
  const normalized = ((rot % 360) + 360) % 360;
  const optionsToShow: Option[] | undefined =
    data.mech === "tap" ? data.options : data.mech === "combo" && step?.mech === "tap" ? step.options : undefined;

  const finish = useCallback(() => {
    if (solved) return;
    sfx.sparkle();
    onSolved();
  }, [solved, onSolved]);

  const fail = useCallback(
    (id: string | null) => {
      if (solved) return;
      sfx.fail();
      onMistake();
      if (id) {
        setWrongId(id);
        setTimeout(() => setWrongId((w) => (w === id ? null : w)), 520);
      }
    },
    [solved, onMistake]
  );

  /* ---------------- progress ---------------- */
  useEffect(() => {
    let p = 0;
    if (data.mech === "tap" || data.mech === "hidden") p = data.correct.length ? found.length / data.correct.length : 0;
    else if (data.mech === "sequence" || data.mech === "path") p = data.correct.length ? seqIdx / data.correct.length : 0;
    else if (data.mech === "drag") p = dragItems.length ? Object.keys(placed).length / dragItems.length : 0;
    else if (data.mech === "combo") p = data.steps ? stepIdx / data.steps.length : 0;
    onProgress(p);
  }, [found, seqIdx, placed, stepIdx, data, dragItems, onProgress]);

  /* ---------------- hint pulse ---------------- */
  useEffect(() => {
    if (hintPulse <= 0) return;
    let id: string | null = null;
    if (data.mech === "tap") id = data.correct.find((c) => !found.includes(c)) ?? null;
    else if (data.mech === "hidden") id = hiddenItems.find((h) => !found.includes(h.id))?.id ?? null;
    else if (data.mech === "sequence" || data.mech === "path") id = data.correct[seqIdx] ?? null;
    else if (data.mech === "drag") id = dragItems.find((d) => !placed[d.id])?.id ?? null;
    else if (data.mech === "rotate") id = data.correct[0] ?? null;
    else if (data.mech === "multitouch") id = data.correct[0] ?? null;
    else if (data.mech === "count") id = "__pad";
    else if (data.mech === "combo" && step) {
      if (step.mech === "drag") id = dragItems.find((d) => !placed[d.id])?.id ?? null;
      else if (step.mech === "sequence") id = step.correct[seqIdx] ?? null;
      else if (step.mech === "hidden") id = hiddenItems.find((h) => !found.includes(h.id))?.id ?? null;
      else id = step.correct.find((c) => !found.includes(c)) ?? null;
    }
    setPulseId(id);
    const t = setTimeout(() => setPulseId(null), 5000);
    return () => clearTimeout(t);
  }, [hintPulse]);

  /* ---------------- tap / hidden ---------------- */

  const tapCorrect = (id: string) => {
    if (!activeCorrect.includes(id)) {
      fail(id);
      return;
    }
    if (found.includes(id)) return;
    const next = [...found, id];
    setFound(next);
    sfx.pop();
    /* combo steps advance via the watcher effect below */
    if (activeCorrect.every((c) => next.includes(c)) && data.mech !== "combo") finish();
  };

  /* ---------------- sequence / path ---------------- */

  const seqTap = (id: string) => {
    if (solved) return;
    if (id !== activeCorrect[seqIdx]) {
      fail(id);
      return;
    }
    sfx.pop();
    const nextIdx = seqIdx + 1;
    setSeqIdx(nextIdx);
    if (data.mech === "sequence" || data.mech === "path") {
      if (nextIdx >= activeCorrect.length) finish();
    }
  };

  /* ---------------- drag ---------------- */

  const pctFromEvent = (e: React.PointerEvent): Pos => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return { x: 50, y: 50 };
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };

  const itemDown = (e: React.PointerEvent, el: SceneEl) => {
    if (solved || placed[el.id]) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const p = pctFromEvent(e);
    dragRef.current = { id: el.id, dx: pos[el.id].x - p.x, dy: pos[el.id].y - p.y };
  };

  const itemMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const p = pctFromEvent(e);
    setPos((prev) => ({ ...prev, [d.id]: { x: p.x + d.dx, y: p.y + d.dy } }));
  };

  const itemUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d || solved) return;
    const p = pctFromEvent(e);
    const cx = p.x + d.dx;
    const cy = p.y + d.dy;
    const tol = 18;
    const hit = targets.find((t) => Math.abs(cx - t.x) <= (t.sz ?? 30) / 2 + tol / 2 && Math.abs(cy - t.y) <= (t.sz ?? 30) / 2 + tol / 2);
    const el0 = scene.find((s) => s.id === d.id);
    if (hit && hit.accept.includes(d.id)) {
      setPos((prev) => ({ ...prev, [d.id]: { x: hit.x, y: hit.y } }));
      const nextPlaced = { ...placed, [d.id]: hit.id };
      setPlaced(nextPlaced);
      sfx.pop();
      const required = step ? step.correct : data.correct;
      /* combo steps advance via the watcher effect below */
      if (required.every((c) => nextPlaced[c]) && data.mech !== "combo") finish();
    } else if (hit) {
      fail(d.id);
      setPos((prev) => ({ ...prev, [d.id]: { x: el0?.x ?? 50, y: el0?.y ?? 50 } }));
    }
  };

  /* ---------------- rotate ---------------- */

  const rotChange = (delta: number) => {
    if (solved) return;
    const deg = data.step ?? 45;
    const next = rot + delta * deg;
    setRot(next);
    sfx.click();
    if (((next % 360) + 360) % 360 === rotTo) {
      if (data.mech === "combo") comboAdvance();
      else finish();
    }
  };

  /* ---------------- count ---------------- */

  const submitCount = () => {
    if (solved) return;
    if (answer === data.correct[0]) {
      sfx.pop();
      finish();
    } else {
      fail("__pad");
    }
  };

  /* ---------------- multitouch ---------------- */

  const pressDown = (id: string) => {
    if (solved || !data.correct.includes(id)) return;
    const now = Date.now();
    const other = data.correct.find((c) => c !== id && lastDown[c] && now - lastDown[c] < 900);
    setLastDown((m) => ({ ...m, [id]: now }));
    setPressed((p) => (p.includes(id) ? p : [...p, id]));
    if (other || data.correct.every((c) => c === id || pressed.includes(c))) {
      sfx.pop();
      finish();
    }
  };

  const pressUp = (id: string) => setPressed((p) => p.filter((x) => x !== id));

  /* ---------------- combo ---------------- */

  const comboAdvance = useCallback(() => {
    sfx.unlock();
    const next = stepIdx + 1;
    setStepIdx(next);
    setFound([]);
    setSeqIdx(0);
    if (next >= (data.steps?.length ?? 0)) finish();
  }, [stepIdx, data.steps, finish]);

  useEffect(() => {
    if (data.mech !== "combo" || !step) return;
    if (step.mech === "drag" && step.correct.every((c) => placed[c])) comboAdvance();
    if ((step.mech === "tap" || step.mech === "hidden") && step.correct.length && step.correct.every((c) => found.includes(c))) comboAdvance();
    if (step.mech === "sequence" && seqIdx > 0 && seqIdx >= step.correct.length) comboAdvance();
  }, [placed, found, seqIdx, stepIdx]);

  /* ---------------- element rendering ---------------- */

  const renderEl = (el: SceneEl, i: number) => {
    const sz = el.sz ?? 24;
    const ar = shapeAspect(el.s);
    const p = pos[el.id] ?? { x: el.x, y: el.y };
    const isDragging = dragRef.current?.id === el.id;
    const isWrong = wrongId === el.id;
    const isPulsing = pulseId === el.id;
    const isFound = found.includes(el.id);
    const placedTargetId = placed[el.id];
    const target = placedTargetId ? targets.find((t) => t.id === placedTargetId) : null;

    const draggable = (data.mech === "drag" && el.drag) || (data.mech === "combo" && step?.mech === "drag" && el.drag && !placed[el.id]);
    const sceneClickable =
      !solved &&
      !draggable &&
      ((data.mech === "tap" && !data.options && (data.correct.includes(el.id) || el.decoy)) ||
        (data.mech === "hidden" && (el.hidden || el.decoy)) ||
        (data.mech === "sequence" && data.correct.includes(el.id)) ||
        (data.mech === "path" && data.correct.includes(el.id)) ||
        (data.mech === "multitouch" && data.correct.includes(el.id)) ||
        (data.mech === "combo" && step ? stepInteracts(step, el.id) && !(step.mech === "hidden" && !el.hidden && !el.decoy) : false));
    const cursor = draggable || sceneClickable || (data.mech === "tap" && data.options) ? "pointer" : undefined;

    const label = labelOf(el.label, lang);
    const isRotating =
      (data.mech === "rotate" && el.id === data.correct[0]) || (data.mech === "combo" && step?.mech === "rotate" && el.id === step.correct[0]);
    const finalR = target && target.r !== undefined ? target.r : isRotating ? rot : el.r ?? 0;

    const handleTap = () => {
      if (solved) return;
      if (data.mech === "tap" || data.mech === "hidden" || (data.mech === "combo" && (step?.mech === "tap" || step?.mech === "hidden"))) tapCorrect(el.id);
      else if (data.mech === "sequence" || data.mech === "path" || (data.mech === "combo" && step?.mech === "sequence")) seqTap(el.id);
      else if (data.mech === "multitouch") pressDown(el.id);
    };

    return (
      <motion.div
        key={el.id}
        className="absolute"
        style={{
          left: PCT(p.x),
          top: PCT(p.y),
          width: PCT(sz),
          transform: `translate(-50%, -50%) rotate(${finalR}deg)`,
          zIndex: isDragging ? 40 : 10 + i,
        }}
        initial={false}
        animate={{
          left: el.moveTo && solved ? PCT(el.moveTo[0]) : PCT(p.x),
          top: el.moveTo && solved ? PCT(el.moveTo[1]) : PCT(p.y),
        }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
      >
        <motion.div
          className="relative"
          style={{ width: "100%", aspectRatio: String(ar), touchAction: draggable ? "none" : undefined, cursor }}
          animate={el.bob && !isDragging ? { y: [0, -4, 0] } : isWrong ? { x: [0, -7, 7, -5, 5, 0] } : isDragging ? { scale: 1.1 } : { scale: 1, x: 0, y: 0 }}
          transition={el.bob && !isDragging ? { repeat: Infinity, duration: 2.6, ease: "easeInOut" } : { duration: 0.35 }}
          onPointerDown={
            draggable
              ? (e) => itemDown(e, el)
              : data.mech === "multitouch" && sceneClickable
                ? () => pressDown(el.id)
                : undefined
          }
          onPointerMove={draggable ? itemMove : undefined}
          onPointerUp={draggable ? itemUp : data.mech === "multitouch" && sceneClickable ? () => pressUp(el.id) : undefined}
          onPointerCancel={draggable ? itemUp : data.mech === "multitouch" && sceneClickable ? () => pressUp(el.id) : undefined}
          onPointerLeave={data.mech === "multitouch" && sceneClickable ? () => pressUp(el.id) : undefined}
          onClick={sceneClickable ? handleTap : undefined}
          role={sceneClickable || draggable ? "button" : undefined}
          aria-label={label ?? el.s}
        >
          {isPulsing && <div className="pointer-events-none absolute -inset-2 z-10 animate-pulse-ring" style={{ border: "4px dashed #FFD154", borderRadius: "28%" }} />}
          {pressed.includes(el.id) && <div className="pointer-events-none absolute -inset-1 z-10 rounded-[30%]" style={{ border: "4px solid #1EC8CF" }} />}
          <div className="h-full w-full" style={{ filter: el.hidden && (data.mech === "hidden" || step?.mech === "hidden") && !isFound ? "grayscale(0.55) contrast(0.78) opacity(0.45)" : undefined }}>
            <Shape name={el.s} c={el.c} c2={el.c2} />
          </div>
          {isFound && el.hidden && <div className="pointer-events-none absolute -inset-1 rounded-[30%] bg-[#4CAF50]/20" />}
        </motion.div>
        {label && (
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#3B2E5A] bg-white/90 px-2 py-0.5 text-[10px] font-black text-[#3B2E5A]" style={{ top: "100%", marginTop: 4 }}>
            {label}
          </div>
        )}
      </motion.div>
    );
  };

  const renderTargets = () =>
    targets.map((t, i) => {
      const occupied = Object.values(placed).includes(t.id);
      const acceptedNow = step ? step.correct.some((c) => t.accept.includes(c)) : data.correct.some((c) => t.accept.includes(c));
      if (!acceptedNow && !occupied) return null;
      const label = labelOf(t.label, lang);
      return (
        <div
          key={t.id + "-" + i}
          className="pointer-events-none absolute rounded-[24%]"
          style={{
            left: PCT(t.x),
            top: PCT(t.y),
            width: PCT(t.sz ?? 30),
            aspectRatio: "1",
            transform: "translate(-50%, -50%)",
            zIndex: 5,
            border: `3px dashed ${occupied ? "#4CAF50" : t.c ?? "#FFD154"}`,
            background: occupied ? "rgba(76,175,80,0.12)" : "rgba(255,209,84,0.10)",
          }}
        >
          {label && <div className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap pt-1 text-[10px] font-black text-[#6B6584]">{label}</div>}
        </div>
      );
    });

  const renderSeqLines = () => {
    if (data.mech !== "path" && data.mech !== "sequence") return null;
    if (seqIdx < 1) return null;
    const pts = data.correct
      .slice(0, seqIdx)
      .map((id) => {
        const el = scene.find((s) => s.id === id);
        return el ? `${el.x},${el.y}` : "";
      })
      .filter(Boolean);
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 z-[45] h-full w-full">
        <polyline points={pts.join(" ")} fill="none" stroke="#6C4AB6" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 2.4" />
      </svg>
    );
  };

  const renderOptions = (opts: Option[]) => (
    <div className="absolute inset-x-0 bottom-2 z-50 flex flex-wrap items-center justify-center gap-2 px-3">
      {opts.map((o) => {
        const isFound = found.includes(o.id);
        const isWrong = wrongId === o.id;
        return (
          <motion.button
            key={o.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              if (solved) return;
              sfx.click();
              tapCorrect(o.id);
            }}
            className={`btn-chunky border-[3px] border-[#3B2E5A] px-3 py-2 text-sm font-black ${isFound ? "bg-[#4CAF50] text-white" : "bg-white text-[#3B2E5A]"}`}
            aria-label={o[lang]}
          >
            <motion.span animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.4 }} className="inline-block">
              {o[lang]}
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );

  const renderKeypad = () => (
    <div className="absolute inset-x-0 bottom-2 z-50 px-3">
      <div className={`mx-auto ${pulseId === "__pad" ? "animate-pulse-ring rounded-2xl" : ""}`} style={pulseId === "__pad" ? { border: "4px dashed #FFD154", borderRadius: 16 } : undefined}>
        <div className="mx-auto mb-1.5 flex h-10 w-32 items-center justify-center rounded-xl border-[3px] border-[#3B2E5A] bg-white text-xl font-black text-[#3B2E5A]" aria-live="polite">
          {answer ? num(Number(answer), lang) : "?"}
        </div>
        <div className="mx-auto grid max-w-[240px] grid-cols-3 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <button
              key={d}
              onClick={() => {
                sfx.click();
                setAnswer((a) => (a.length < 3 ? a + d : a));
              }}
              className="btn-chunky rounded-xl border-[3px] border-[#3B2E5A] bg-white py-1.5 text-lg font-black text-[#3B2E5A]"
              aria-label={String(d)}
            >
              {num(d, lang)}
            </button>
          ))}
          <button
            onClick={() => {
              sfx.click();
              setAnswer((a) => a.slice(0, -1));
            }}
            className="btn-chunky grid place-items-center rounded-xl border-[3px] border-[#3B2E5A] bg-[#FF6B81] py-1.5 text-white"
            aria-label="delete"
          >
            <Delete size={16} strokeWidth={3} />
          </button>
          <button
            onClick={() => {
              sfx.click();
              setAnswer((a) => (a.length < 3 ? a + "0" : a));
            }}
            className="btn-chunky rounded-xl border-[3px] border-[#3B2E5A] bg-white py-1.5 text-lg font-black text-[#3B2E5A]"
            aria-label="0"
          >
            {num(0, lang)}
          </button>
          <button
            onClick={() => {
              submitCount();
            }}
            className="btn-chunky grid place-items-center rounded-xl border-[3px] border-[#3B2E5A] bg-[#4CAF50] py-1.5 text-white"
            aria-label="submit"
          >
            <Check size={18} strokeWidth={3.4} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderRotate = () => (
    <div className="absolute inset-x-0 bottom-2 z-50 flex items-center justify-center gap-3">
      <button onClick={() => rotChange(-1)} className="btn-chunky grid h-11 w-11 place-items-center rounded-full border-[3px] border-[#3B2E5A] bg-[#FFD154] text-[#3B2E5A]" aria-label="rotate left">
        <RotateCcw size={20} strokeWidth={3} />
      </button>
      <span className="rounded-full border-2 border-[#3B2E5A] bg-white px-3 py-1 text-sm font-black text-[#3B2E5A]" aria-live="polite">
        {num(normalized, lang)}°
      </span>
      <button onClick={() => rotChange(1)} className="btn-chunky grid h-11 w-11 place-items-center rounded-full border-[3px] border-[#3B2E5A] bg-[#FFD154] text-[#3B2E5A]" aria-label="rotate right">
        <RotateCw size={20} strokeWidth={3} />
      </button>
    </div>
  );

  const renderComboBar = () => {
    if (data.mech !== "combo" || !data.steps || !step) return null;
    return (
      <div className="pointer-events-none absolute inset-x-0 top-1.5 z-50 flex flex-col items-center gap-1 px-3">
        <div className="max-w-full truncate rounded-full border-2 border-[#3B2E5A] bg-white/95 px-3 py-1 text-xs font-black text-[#3B2E5A] shadow-sm">
          {bi(step.prompt, lang)}
        </div>
        <div className="flex gap-1">
          {data.steps.map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full border border-[#3B2E5A] ${i < stepIdx ? "bg-[#4CAF50]" : i === stepIdx ? "bg-[#FFD154]" : "bg-white"}`} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none overflow-hidden"
      style={{
        background: "radial-gradient(120% 100% at 50% 0%, #FDFBF7 0%, #F6F3FC 70%, #EFEAF9 100%)",
        pointerEvents: solved ? "none" : undefined,
      }}
      dir="ltr"
    >
      {renderTargets()}
      {scene.map((el, i) => renderEl(el, i))}
      {renderSeqLines()}
      {renderComboBar()}
      {optionsToShow && renderOptions(optionsToShow)}
      {data.mech === "count" && renderKeypad()}
      {data.mech === "rotate" && renderRotate()}

      {solved && (
        <div className="pointer-events-none absolute inset-0 z-[60] grid place-items-center">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }} transition={{ duration: 0.5 }}>
            <div className="relative h-20 w-20">
              <div className="absolute inset-0" style={{ transform: "rotate(18deg)" }}>
                <Shape name="sparkle" c="#FFD154" />
              </div>
              <div className="absolute inset-0" style={{ transform: "rotate(-14deg) scale(0.7)" }}>
                <Shape name="sparkle" c="#FF6B81" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* factory: turn data into a LevelProps component */
export function makeGenericLevel(data: GLevel): React.ComponentType<LevelProps> {
  const C: React.FC<LevelProps> = (props) => <GenericLevel {...props} data={data} />;
  C.displayName = `GenericLevel${data.id}`;
  return C;
}
