"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, Lightbulb, Settings2, FastForward, Clapperboard, X, Heart } from "lucide-react";
import { useGameStore, HINT_COSTS, SKIP_COST } from "@/lib/game/store";
import { getLevel, getWorld } from "@/lib/game/levels";
import { sfx } from "@/lib/game/audio";
import { tr } from "@/lib/game/i18n";
import { num, bi, clamp, vibrate } from "@/lib/game/utils";
import type { LevelProps } from "@/lib/game/types";
import { LEVEL_COMPONENTS } from "../levels";
import { IconBtn, CoinChip, FloatText } from "../ui";
import DefeatOverlay from "../DefeatOverlay";

type HintTier = 1 | 2 | 3;

const START_LIVES = 3;

export default function Gameplay() {
  const levelId = useGameStore((s) => s.currentLevel);
  const sessionNonce = useGameStore((s) => s.sessionNonce);
  /* keyed by levelId + sessionNonce: every start/replay gets a fully fresh session
     (fresh hints, mistakes, lives and solved state) — fixes "replay after victory" */
  return <GameplaySession key={`${levelId}-${sessionNonce}`} levelId={levelId} />;
}

/** three chunky hearts, one goes gray per mistake */
function LivesHearts({ lives, livesTotal }: { lives: number; livesTotal: number }) {
  const lang = useGameStore((s) => s.lang);
  return (
    <div className="flex items-center gap-1 shrink-0" aria-label={`${tr(lang, "lives")}: ${lives}/${livesTotal}`} role="status">
      {Array.from({ length: livesTotal }, (_, i) => {
        const alive = i < lives;
        return (
          <motion.span
            key={i}
            initial={false}
            animate={alive ? { scale: 1 } : { scale: 0.85, opacity: 0.55 }}
            transition={{ type: "spring", damping: 12 }}
          >
            <Heart
              size={19}
              strokeWidth={2.4}
              className={alive ? "text-[#FF6B81]" : "text-[#C7C3D4]"}
              fill={alive ? "#FF6B81" : "#E4E1EE"}
              stroke="#3B2E5A"
            />
          </motion.span>
        );
      })}
    </div>
  );
}

function GameplaySession({ levelId }: { levelId: number }) {
  const lang = useGameStore((s) => s.lang);
  const setScreen = useGameStore((s) => s.setScreen);
  const setModal = useGameStore((s) => s.setModal);
  const setVictory = useGameStore((s) => s.setVictory);
  const completeLevel = useGameStore((s) => s.completeLevel);
  const skipLevel = useGameStore((s) => s.skipLevel);
  const usedHintStat = useGameStore((s) => s.usedHint);
  const madeMistakeStat = useGameStore((s) => s.madeMistake);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const setAdOpen = useGameStore((s) => s.setAdOpen);

  const [attempt, setAttempt] = useState(0);
  const [progressP, setProgressP] = useState(0);
  const [hints, setHints] = useState<HintTier[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [defeat, setDefeat] = useState(false);
  const [hintPulse, setHintPulse] = useState(0);
  const [hintSheet, setHintSheet] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [floatMsg, setFloatMsg] = useState<{ text: string; color: string; key: number } | null>(null);
  const [solved, setSolved] = useState(false);

  const lastMistakeRef = useRef(0);
  const solvedRef = useRef(false);
  const deadRef = useRef(false);
  const livesRef = useRef(START_LIVES);
  const afterDefeatRef = useRef(false);
  const startTsRef = useRef(Date.now());

  const level = getLevel(levelId);
  const world = getWorld(level.world);
  const Back = lang === "fa" ? ChevronRight : ChevronLeft;
  const Comp = LEVEL_COMPONENTS[levelId];

  const showToast = useCallback((text: string, color = "#FFD154") => {
    setFloatMsg({ text, color, key: Date.now() });
  }, []);

  const onSolved = useCallback(() => {
    if (solvedRef.current || deadRef.current) return;
    solvedRef.current = true;
    setSolved(true);
    setProgressP(1);
    vibrate([30, 40, 30], useGameStore.getState().vibrationOn);
    sfx.chime();
    const stars = clamp(3 - hints.length - mistakes, 1, 3);
    completeLevel(levelId, stars, {
      mistakes,
      hintsUsed: hints.length,
      durationMs: Date.now() - startTsRef.current,
      livesLeft: livesRef.current,
      afterDefeat: afterDefeatRef.current,
    });
    setTimeout(() => setVictory(true), 750);
  }, [hints.length, mistakes, levelId, completeLevel, setVictory]);

  const onMistake = useCallback(
    (msg?: { fa: string; en: string }) => {
      /* no penalty after the level is solved or the player is out of lives,
         and one single wrong answer can never cost more than one life */
      if (solvedRef.current || deadRef.current) return;
      const now = Date.now();
      const fresh = now - lastMistakeRef.current > 1500;
      lastMistakeRef.current = now;
      sfx.fail();
      vibrate(60, useGameStore.getState().vibrationOn);
      const text = msg ? bi(msg, lang) : tr(lang, "wrongTry");
      showToast(text, "#FF9FB2");
      madeMistakeStat();
      if (fresh) {
        setMistakes((m) => Math.min(m + 1, 2));
        /* lose exactly one life per distinct wrong answer */
        const nextLives = Math.max(0, livesRef.current - 1);
        livesRef.current = nextLives;
        setLives(nextLives);
        if (nextLives === 0) {
          deadRef.current = true;
          afterDefeatRef.current = true;
          setTimeout(() => setDefeat(true), 650);
        }
      }
    },
    [lang, showToast, madeMistakeStat]
  );

  const onProgress = useCallback((p: number) => {
    setProgressP((prev) => Math.max(prev, clamp(p, 0, 1)));
  }, []);

  const applyHint = (tier: HintTier) => {
    const cost = HINT_COSTS[tier];
    if (!spendCoins(cost)) {
      showToast(tr(lang, "notEnoughCoins"), "#FF6B81");
      return;
    }
    sfx.sparkle();
    usedHintStat();
    setHints((h) => [...h, tier]);
    if (tier === 2) setHintPulse((v) => v + 1);
    const label = tier === 1 ? tr(lang, "hint1") : tier === 2 ? tr(lang, "hint2") : tr(lang, "hint3");
    showToast(label, "#1EC8CF");
  };

  /* full reset used by the restart button AND the defeat screen's "تلاش دوباره":
     fresh lives, zero mistakes, cleared answers, reset timers */
  const doRestart = () => {
    sfx.whoosh();
    setProgressP(0);
    setHints([]);
    setMistakes(0);
    setLives(START_LIVES);
    setDefeat(false);
    setHintPulse(0);
    setSolved(false);
    deadRef.current = false;
    solvedRef.current = false;
    livesRef.current = START_LIVES;
    startTsRef.current = Date.now();
    setAttempt((a) => a + 1);
  };

  const doBackToMenu = () => {
    sfx.click();
    setDefeat(false);
    setScreen("menu");
  };

  const doSkip = () => {
    if (skipLevel(levelId)) {
      sfx.unlock();
      setShowSkip(false);
      setVictory(true);
    } else {
      showToast(tr(lang, "notEnoughCoins"), "#FF6B81");
      setShowSkip(false);
    }
  };

  const usedTier = (t: HintTier) => hints.includes(t);

  const levelProps: LevelProps = {
    lang,
    solved,
    onSolved,
    onMistake,
    onProgress,
    hintPulse,
  };

  useEffect(() => {
    /* leaving the level (back button) while dead should not leave a stuck state */
    return () => {
      deadRef.current = false;
    };
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col paper-bg">
      {/* top bar */}
      <div className="flex items-center gap-2 px-3 pt-3">
        <IconBtn label={tr(lang, "back")} bg="#FAFAFA" size={42} onClick={() => setScreen("levels")}>
          <Back size={20} strokeWidth={3} />
        </IconBtn>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between px-1 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-black text-white border-2 border-[#3B2E5A] whitespace-nowrap"
                style={{ background: world.color, color: level.world === 1 ? "#3B2E5A" : "#fff" }}
              >
                {tr(lang, "level")} {num(levelId, lang)}
              </span>
              <span className="text-[11px] font-bold text-[#6B6584] truncate">{bi(level.name, lang)}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <LivesHearts lives={lives} livesTotal={START_LIVES} />
              <IconBtn label={tr(lang, "restart")} bg="#FF6B81" size={36} onClick={doRestart}>
                <RotateCcw size={17} strokeWidth={3} />
              </IconBtn>
              <IconBtn label={tr(lang, "settings")} bg="#FAFAFA" size={36} onClick={() => setModal("settings")}>
                <Settings2 size={17} strokeWidth={2.8} />
              </IconBtn>
            </div>
          </div>
          {/* progress bar */}
          <div className="mt-1.5 h-3.5 rounded-full bg-white border-[3px] border-[#3B2E5A] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: world.color }}
              initial={false}
              animate={{ width: `${progressP * 100}%` }}
              transition={{ type: "spring", damping: 20 }}
            />
          </div>
        </div>
      </div>

      {/* question — main text only, no extra descriptions */}
      <div className="px-4 pt-3 pb-2">
        <motion.div
          className="card-chunky bg-white px-4 py-3 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="q-normal font-extrabold text-[#3B2E5A] leading-relaxed">{bi(level.question, lang)}</p>
        </motion.div>
      </div>

      {/* scene */}
      <div className="flex-1 px-3 pb-2 min-h-0">
        <div className="h-full rounded-[1.6rem] border-[4px] border-[#3B2E5A] bg-white overflow-hidden shadow-[0_8px_0_rgba(59,46,90,0.22)]">
          {Comp ? (
            <Comp key={`${levelId}-${attempt}`} {...levelProps} />
          ) : (
            <div className="h-full grid place-items-center font-bold text-[#8B84A3]">?</div>
          )}
        </div>
      </div>

      {/* bottom bar */}
      <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-1">
        <IconBtn
          label={tr(lang, "hint")}
          bg="#FFD154"
          size={54}
          onClick={() => setHintSheet(true)}
          badge={
            <span className="absolute -top-1.5 -right-1.5 px-1 min-w-6 h-6 grid place-items-center rounded-full bg-[#FF6B81] border-2 border-[#3B2E5A] text-white">
              <Lightbulb size={11} aria-hidden />
            </span>
          }
        >
          <Lightbulb size={26} strokeWidth={2.6} />
        </IconBtn>

        <div className="flex items-center gap-2">
          <IconBtn
            label={tr(lang, "watchAd")}
            bg="#1EC8CF"
            size={46}
            onClick={() => {
              sfx.click();
              setAdOpen(true);
            }}
          >
            <Clapperboard size={22} strokeWidth={2.6} />
          </IconBtn>
          <button
            onClick={() => {
              sfx.click();
              setShowSkip(true);
            }}
            className="btn-chunky flex items-center gap-1.5 bg-white border-[3px] border-[#3B2E5A] px-3.5 py-2.5 text-sm text-[#3B2E5A]"
          >
            <FastForward size={16} strokeWidth={2.8} aria-hidden />
            {tr(lang, "skip")}
            <span className="inline-flex items-center gap-0.5 text-[#B97E0A] font-black">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden>
                <circle cx="12" cy="12" r="10" fill="#FFD154" stroke="#E8A81C" strokeWidth="2" />
              </svg>
              {num(SKIP_COST, lang)}
            </span>
          </button>
        </div>
        <CoinChip small />
      </div>

      {/* floating feedback */}
      <AnimatePresence>{floatMsg && <FloatText key={floatMsg.key} text={floatMsg.text} color={floatMsg.color} onDone={() => setFloatMsg(null)} />}</AnimatePresence>

      {/* defeat screen (out of lives) */}
      <AnimatePresence>{defeat && <DefeatOverlay onRetry={doRestart} onMenu={doBackToMenu} />}</AnimatePresence>

      {/* hint sheet */}
      <AnimatePresence>
        {hintSheet && (
          <motion.div
            className="absolute inset-0 z-50 bg-[#33205E]/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHintSheet(false)}
          >
            <motion.div
              className="absolute bottom-0 inset-x-0 rounded-t-[1.8rem] bg-white border-t-[5px] border-[#6C4AB6] px-4 pt-4 pb-6 max-h-[70%] overflow-y-auto game-scroll"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label={tr(lang, "hints")}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-black text-[#3B2E5A] flex items-center gap-2">
                  <Lightbulb size={20} className="text-[#E8A81C]" aria-hidden />
                  {tr(lang, "hints")}
                </h3>
                <button
                  aria-label={tr(lang, "close")}
                  onClick={() => {
                    sfx.pop();
                    setHintSheet(false);
                  }}
                  className="grid place-items-center w-8 h-8 rounded-full bg-[#F3F0FA] border-2 border-[#3B2E5A]"
                >
                  <X size={15} strokeWidth={3} />
                </button>
              </div>

              <div className="space-y-3">
                {([1, 2, 3] as HintTier[]).map((tier) => {
                  const cost = HINT_COSTS[tier];
                  const isUsed = usedTier(tier);
                  /* each tier is fully independent: its text is revealed ONLY after
                     buying that exact tier — buying "اشاره کوچک" never opens the
                     full solution (or any other hint) by itself */
                  const tierText = !isUsed
                    ? "? ? ?"
                    : tier === 1
                      ? bi(level.hints[0], lang)
                      : tier === 2
                        ? bi(level.hints[1], lang)
                        : bi(level.solution, lang);
                  return (
                    <div key={tier} className={`rounded-2xl border-[3px] border-[#3B2E5A] px-4 py-3 ${isUsed ? "bg-[#DFF3E1]" : "bg-[#F3F0FA]"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-black text-[#3B2E5A] text-sm">
                          {tier === 1 ? tr(lang, "hint1") : tier === 2 ? tr(lang, "hint2") : tr(lang, "hint3")}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#FFD154] border-2 border-[#3B2E5A] text-xs font-black text-[#3B2E5A]">
                          {num(cost, lang)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-bold text-[#4A4460] leading-6">{tierText}</p>
                      <button
                        disabled={isUsed}
                        onClick={() => applyHint(tier)}
                        className={`btn-chunky mt-2.5 w-full py-2 text-sm border-[3px] border-[#3B2E5A] ${isUsed ? "bg-[#4CAF50] text-white" : "bg-[#6C4AB6] text-white"}`}
                      >
                        {isUsed ? tr(lang, "done") : tr(lang, "useHint")}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* skip confirm */}
      <AnimatePresence>
        {showSkip && (
          <motion.div
            className="absolute inset-0 z-50 grid place-items-center bg-[#33205E]/60 px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSkip(false)}
          >
            <motion.div
              className="card-chunky w-full bg-white p-5 text-center"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              role="alertdialog"
              aria-label={tr(lang, "skip")}
            >
              <p className="font-extrabold text-[#3B2E5A] leading-7">{tr(lang, "skipConfirm")}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    sfx.click();
                    setShowSkip(false);
                  }}
                  className="btn-chunky py-2.5 bg-[#F3F0FA] text-[#3B2E5A] border-[3px] border-[#3B2E5A]"
                >
                  {tr(lang, "no")}
                </button>
                <button onClick={doSkip} className="btn-chunky py-2.5 bg-[#FF6B81] text-white border-[3px] border-[#3B2E5A]">
                  {tr(lang, "yes")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
