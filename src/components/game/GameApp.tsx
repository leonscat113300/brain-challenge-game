"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/lib/game/store";
import { initAudio, startMusic, sfx } from "@/lib/game/audio";
import { tr } from "@/lib/game/i18n";
import { Brain } from "./Brain";
import MainMenu from "./screens/MainMenu";
import LevelSelect from "./screens/LevelSelect";
import Gameplay from "./screens/Gameplay";
import VictoryOverlay from "./VictoryOverlay";
import NameGate from "./NameGate";
import AdOverlay from "./AdOverlay";
import SettingsModal from "./modals/SettingsModal";
import StoreModal from "./modals/StoreModal";
import DailyModal from "./modals/DailyModal";
import ProfileModal from "./modals/ProfileModal";
import AchievementsModal from "./modals/AchievementsModal";
import AboutModal from "./modals/AboutModal";
import NewBadgeToast from "./NewBadgeToast";

/* hydration gate without setState-in-effect */
const emptySubscribe = () => () => {};
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false);

export default function GameApp() {
  const [started, setStarted] = useState(false);
  const mounted = useMounted();
  const lang = useGameStore((s) => s.lang);
  const screen = useGameStore((s) => s.screen);
  const playerName = useGameStore((s) => s.playerName);

  /* first gesture: unlock WebAudio */
  useEffect(() => {
    const h = () => initAudio();
    window.addEventListener("pointerdown", h, { once: true });
    return () => window.removeEventListener("pointerdown", h);
  }, []);

  /* background music follows screen */
  useEffect(() => {
    if (!started) return;
    startMusic(screen === "game" ? "game" : "menu");
  }, [screen, started]);

  /* html lang/dir for a11y */
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  const font = lang === "fa" ? "Vazirmatn, Tahoma, 'Segoe UI', sans-serif" : "Fredoka, 'Segoe UI', sans-serif";

  if (!mounted) {
    return (
      <div className="min-h-dvh grid place-items-center bg-[#6C4AB6]">
        <div className="text-white/90 font-bold animate-pulse text-lg">...</div>
      </div>
    );
  }

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="min-h-dvh w-full grid place-items-center bg-gradient-to-b from-[#33205E] to-[#6C4AB6] sm:py-4"
      style={{ fontFamily: font }}
    >
      <div
        className="relative w-full max-w-[430px] h-dvh sm:h-[min(92dvh,900px)] overflow-hidden bg-[#FAFAFA] sm:rounded-[2.2rem] sm:border-[10px] sm:border-[#33205E] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        style={{ touchAction: "manipulation" }}
      >
        {!started ? (
          <button
            onClick={() => {
              initAudio();
              sfx.chime();
              setStarted(true);
            }}
            className="doodle-bg absolute inset-0 flex flex-col items-center justify-center gap-6 w-full text-white"
            aria-label={tr(lang, "tapToStart")}
          >
            <Brain mood="wink" className="w-44 h-44" style={{ animation: "bob 2.2s ease-in-out infinite" }} />
            <div className="text-3xl font-black text-[#FFD154] drop-shadow-[0_3px_0_rgba(51,32,94,0.6)]">{tr(lang, "appName")}</div>
            <div className="px-6 py-3 rounded-full bg-[#FFD154] text-[#33205E] font-extrabold text-lg btn-chunky" style={{ animation: "breathe 1.6s ease-in-out infinite" }}>
              {tr(lang, "tapToStart")}
            </div>
          </button>
        ) : (
          <>
            <AnimatePresence mode="wait">
              {screen === "menu" && (
                <motion.div key="menu" className="absolute inset-0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
                  <MainMenu />
                </motion.div>
              )}
              {screen === "levels" && (
                <motion.div key="levels" className="absolute inset-0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
                  <LevelSelect />
                </motion.div>
              )}
              {screen === "game" && (
                <motion.div key="game" className="absolute inset-0" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}>
                  <Gameplay />
                </motion.div>
              )}
            </AnimatePresence>

            <VictoryOverlay />
            <AdOverlay />
            {playerName === "" && <NameGate />}
            <SettingsModal />
            <StoreModal />
            <DailyModal />
            <ProfileModal />
            <AchievementsModal />
            <AboutModal />
            <NewBadgeToast />
          </>
        )}
      </div>
    </div>
  );
}
