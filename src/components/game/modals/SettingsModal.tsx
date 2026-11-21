"use client";

import { useState } from "react";
import { Music, Volume2, Vibrate, Languages, Trash2, Info } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import { tr } from "@/lib/game/i18n";
import type { Lang } from "@/lib/game/types";
import { GameModal, ToggleRow } from "../ui";
import { sfx } from "@/lib/game/audio";

const LANGS: Array<{ id: Lang; label: string }> = [
  { id: "fa", label: "فارسی" },
  { id: "en", label: "English" },
];

/** Inner body: unmounts when the modal closes, so confirm state resets naturally. */
function SettingsBody() {
  const lang = useGameStore((s) => s.lang);
  const setModal = useGameStore((s) => s.setModal);
  const musicOn = useGameStore((s) => s.musicOn);
  const soundOn = useGameStore((s) => s.soundOn);
  const vibrationOn = useGameStore((s) => s.vibrationOn);
  const toggleMusic = useGameStore((s) => s.toggleMusic);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const toggleVibration = useGameStore((s) => s.toggleVibration);
  const setLang = useGameStore((s) => s.setLang);
  const resetAll = useGameStore((s) => s.resetAll);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-4">
      {/* toggles */}
      <div className="space-y-3">
        <ToggleRow label={tr(lang, "music")} value={musicOn} onChange={toggleMusic} icon={<Music size={20} aria-hidden />} />
        <ToggleRow label={tr(lang, "sounds")} value={soundOn} onChange={toggleSound} icon={<Volume2 size={20} aria-hidden />} />
        <ToggleRow label={tr(lang, "vibration")} value={vibrationOn} onChange={toggleVibration} icon={<Vibrate size={20} aria-hidden />} />
      </div>

      {/* language */}
      <section>
        <div className="mb-2 flex items-center gap-1.5 font-black text-[#3B2E5A]">
          <Languages size={16} aria-hidden />
          {tr(lang, "language")}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {LANGS.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                sfx.whoosh();
                setLang(l.id);
              }}
              className={`btn-chunky border-[3px] border-[#3B2E5A] py-2.5 text-sm ${
                lang === l.id ? "bg-[#6C4AB6] text-white" : "bg-[#F3F0FA] text-[#3B2E5A]"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      {/* about / clear data */}
      {!confirming ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sfx.click();
              setModal("about");
            }}
            className="btn-chunky flex items-center justify-center gap-1.5 border-[3px] border-[#3B2E5A] bg-[#1EC8CF] py-2.5 text-sm text-white"
          >
            <Info size={16} aria-hidden />
            {tr(lang, "about")}
          </button>
          <button
            onClick={() => {
              sfx.click();
              setConfirming(true);
            }}
            className="btn-chunky flex items-center justify-center gap-1.5 border-[3px] border-[#3B2E5A] bg-[#FF6B81] py-2.5 text-sm text-white"
          >
            <Trash2 size={16} aria-hidden />
            {tr(lang, "clearData")}
          </button>
        </div>
      ) : (
        <div
          className="rounded-2xl border-[3px] border-[#3B2E5A] p-3 text-center"
          style={{ background: "rgba(255,107,129,0.15)" }}
          role="alertdialog"
          aria-label={tr(lang, "clearDataWarn")}
        >
          <p className="text-sm font-extrabold leading-6 text-[#3B2E5A]">{tr(lang, "clearDataWarn")}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sfx.click();
                setConfirming(false);
              }}
              className="btn-chunky border-[3px] border-[#3B2E5A] bg-[#F3F0FA] py-2.5 text-sm text-[#3B2E5A]"
            >
              {tr(lang, "no")}
            </button>
            <button
              onClick={() => {
                sfx.fail();
                resetAll();
                setModal(null);
              }}
              className="btn-chunky border-[3px] border-[#3B2E5A] bg-[#FF6B81] py-2.5 text-sm text-white"
            >
              {tr(lang, "yes")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsModal() {
  const lang = useGameStore((s) => s.lang);
  const open = useGameStore((s) => s.modal === "settings");
  const setModal = useGameStore((s) => s.setModal);

  return (
    <GameModal open={open} onClose={() => setModal(null)} title={tr(lang, "settings")} accent="#6C4AB6" lang={lang}>
      <SettingsBody />
    </GameModal>
  );
}
