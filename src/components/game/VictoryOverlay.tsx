"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Map, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";
import { useGameStore, TOTAL_LEVELS } from "@/lib/game/store";
import { getLevel } from "@/lib/game/levels";
import { sfx } from "@/lib/game/audio";
import { tr } from "@/lib/game/i18n";
import { num, bi, vibrate } from "@/lib/game/utils";

const COLORS = ["#FFD154", "#1EC8CF", "#FF6B81", "#4CAF50", "#6C4AB6"];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 1.6 + Math.random() * 1.4,
        color: COLORS[i % COLORS.length],
        size: 8 + Math.random() * 8,
        round: Math.random() > 0.5,
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 0.5),
            background: p.color,
            borderRadius: p.round ? "50%" : 3,
            animation: `confetti-fall ${p.dur}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Star({ filled, delay }: { filled: boolean; delay: number }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="w-14 h-14 sm:w-16 sm:h-16"
      initial={{ scale: 0, rotate: -40, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ delay, type: "spring", damping: 12, stiffness: 260 }}
      aria-hidden
    >
      <path
        d="M12 2l2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 16.9 6.1 20l1.3-6.5L2.5 8.9l6.6-.8L12 2z"
        fill={filled ? "#FFD154" : "#D8D4E4"}
        stroke="#3B2E5A"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {filled && <path d="M12 5.2l1.8 3.8 4.1.5" stroke="#FFE9AE" strokeWidth="1.6" fill="none" strokeLinecap="round" />}
    </motion.svg>
  );
}

function VictoryCard({
  levelId,
  stars,
  reward,
  onReplay,
  onMap,
  onNext,
}: {
  levelId: number;
  stars: number;
  reward: number;
  onReplay: () => void;
  onMap: () => void;
  onNext: (id: number) => void;
}) {
  const lang = useGameStore((s) => s.lang);
  const [count, setCount] = useState(0);

  const level = getLevel(levelId);
  const isLast = levelId >= TOTAL_LEVELS;
  const nextLevelId = Math.min(TOTAL_LEVELS, levelId + 1);

  useEffect(() => {
    sfx.fanfare();
    sfx.cheer();
    vibrate([40, 60, 40, 60, 120], useGameStore.getState().vibrationOn);
    let v = 0;
    const iv = setInterval(() => {
      v += Math.max(1, Math.round(reward / 12));
      if (v >= reward) {
        v = reward;
        clearInterval(iv);
      }
      setCount(v);
    }, 60);
    return () => clearInterval(iv);
  }, [reward]);

  return (
    <motion.div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-[#33205E]/75 backdrop-blur-[2px] px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Confetti />
      <motion.div
        className="card-chunky relative w-full bg-white px-5 pb-6 pt-8 text-center"
        initial={{ y: 90, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 280, delay: 0.1 }}
        role="dialog"
        aria-label={tr(lang, "victory")}
      >
        {/* ribbon */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-2.5 rounded-2xl bg-[#FF6B81] border-[4px] border-[#3B2E5A] shadow-[0_5px_0_rgba(59,46,90,0.3)]">
          <span className="text-2xl font-black text-white">{tr(lang, "victory")}</span>
        </div>

        <div className="mt-5 text-lg font-extrabold text-[#6C4AB6]">{isLast ? tr(lang, "lastLevelDone") : tr(lang, "brilliant")}</div>

        {/* stars */}
        <div className="flex items-center justify-center gap-2 my-3" dir="ltr">
          <Star filled={stars >= 1} delay={0.35} />
          <Star filled={stars >= 2} delay={0.55} />
          <Star filled={stars >= 3} delay={0.75} />
        </div>

        {/* answer */}
        <div className="rounded-2xl bg-[#FFF3D6] border-[3px] border-[#E8A81C] px-4 py-2.5 text-[#3B2E5A]">
          <span className="font-extrabold text-[#B97E0A]">{tr(lang, "showAnswer")} </span>
          <span className="font-bold leading-7">{bi(level.solution, lang)}</span>
        </div>

        {/* coins */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[#3B2E5A] font-black text-xl">
          <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden>
            <circle cx="12" cy="12" r="10" fill="#FFD154" stroke="#E8A81C" strokeWidth="2" />
            <circle cx="12" cy="12" r="6.5" fill="none" stroke="#E8A81C" strokeWidth="1.5" />
          </svg>
          +{num(count, lang)}
        </div>

        {/* buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onReplay}
            className="btn-chunky flex items-center justify-center gap-2 bg-[#1EC8CF] text-white border-[3px] border-[#3B2E5A] py-3 px-2 text-base"
          >
            <RotateCcw size={18} strokeWidth={3} />
            {tr(lang, "replay")}
          </button>
          <button
            onClick={onMap}
            className="btn-chunky flex items-center justify-center gap-2 bg-[#FAFAFA] text-[#3B2E5A] border-[3px] border-[#3B2E5A] py-3 px-2 text-base"
          >
            <Map size={18} strokeWidth={3} />
            {tr(lang, "map")}
          </button>
        </div>
        {levelId < TOTAL_LEVELS && (
          <button
            onClick={() => onNext(nextLevelId)}
            className="btn-chunky mt-3 w-full flex items-center justify-center gap-2 bg-[#4CAF50] text-white border-[3px] border-[#3B2E5A] py-3.5 text-lg"
          >
            {lang === "fa" ? <ArrowRight size={20} strokeWidth={3} /> : <ArrowLeft size={20} strokeWidth={3} />}
            {tr(lang, "nextLevel")}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function VictoryOverlay() {
  const show = useGameStore((s) => s.showVictory);
  const levelId = useGameStore((s) => s.currentLevel);
  const stars = useGameStore((s) => s.lastStars);
  const reward = useGameStore((s) => s.lastReward);
  const setVictory = useGameStore((s) => s.setVictory);
  const startLevel = useGameStore((s) => s.startLevel);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <AnimatePresence>
      {show && (
        <VictoryCard
          key="victory-card"
          levelId={levelId}
          stars={stars}
          reward={reward}
          onReplay={() => {
            sfx.click();
            setVictory(false);
            startLevel(levelId);
          }}
          onMap={() => {
            sfx.click();
            setVictory(false);
            setScreen("levels");
          }}
          onNext={(id) => {
            sfx.unlock();
            setVictory(false);
            startLevel(id);
          }}
        />
      )}
    </AnimatePresence>
  );
}
