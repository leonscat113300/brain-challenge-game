"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Lock, Star } from "lucide-react";
import { useGameStore, BRANDED_TOTAL } from "@/lib/game/store";
import { WORLDS, LEVELS } from "@/lib/game/levels";
import { tr } from "@/lib/game/i18n";
import { num, bi, vibrate } from "@/lib/game/utils";
import { sfx } from "@/lib/game/audio";
import { IconBtn, CoinChip } from "../ui";

/* 12 categories of 50 levels each: 1-50, 51-100, ... 551-600 */
const PACK_SIZE = 50;
const PACK_COUNT = BRANDED_TOTAL / PACK_SIZE; // 12

/** ids that actually have gameplay content in this build */
const IMPLEMENTED = new Set(LEVELS.map((l) => l.id));

function LevelButton({
  id,
  stars,
  unlocked,
  current,
  color,
  onClick,
}: {
  id: number;
  stars: number;
  unlocked: boolean;
  current: boolean;
  color: string;
  onClick: () => void;
}) {
  const lang = useGameStore((s) => s.lang);
  return (
    <button
      disabled={!unlocked}
      onClick={onClick}
      aria-label={`${tr(lang, "level")} ${id}`}
      className={`btn-chunky relative aspect-square w-full grid place-items-center border-[3px] border-[#3B2E5A] ${
        unlocked ? "bg-white" : "bg-[#E4E1EE] cursor-not-allowed"
      } ${current ? "ring-4 ring-[#FFD154]" : ""}`}
      style={{ borderRadius: "30%" }}
    >
      {unlocked ? (
        <>
          <span className="text-2xl font-black" style={{ color: current ? color : "#3B2E5A" }}>
            {num(id, lang)}
          </span>
          {stars > 0 && (
            <div className="absolute -bottom-2 flex gap-0.5" dir="ltr">
              {[1, 2, 3].map((i) => (
                <Star
                  key={i}
                  size={13}
                  className={i <= stars ? "text-[#FFD154]" : "text-[#C7C3D4]"}
                  fill={i <= stars ? "#FFD154" : "#C7C3D4"}
                  stroke="#3B2E5A"
                  strokeWidth={1.5}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <Lock size={20} className="text-[#8B84A3]" aria-hidden />
      )}
    </button>
  );
}

export default function LevelSelect() {
  const lang = useGameStore((s) => s.lang);
  const unlocked = useGameStore((s) => s.unlocked);
  const progress = useGameStore((s) => s.progress);
  const setScreen = useGameStore((s) => s.setScreen);
  const startLevel = useGameStore((s) => s.startLevel);
  const Back = lang === "fa" ? ChevronRight : ChevronLeft;

  const openLevel = (id: number) => {
    if (id > unlocked || !IMPLEMENTED.has(id)) return;
    sfx.pop();
    vibrate(20, useGameStore.getState().vibrationOn);
    startLevel(id);
  };

  const packs = Array.from({ length: PACK_COUNT }, (_, i) => {
    const from = i * PACK_SIZE + 1;
    const to = (i + 1) * PACK_SIZE;
    const ids = Array.from({ length: PACK_SIZE }, (_, k) => from + k);
    const done = ids.filter((id) => (progress[id] ?? 0) > 0).length;
    return { index: i + 1, from, to, ids, world: WORLDS[i % WORLDS.length], done };
  });

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F3F0FA]">
      {/* header */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 bg-[#6C4AB6] rounded-b-3xl shadow-[0_4px_0_rgba(51,32,94,0.4)]">
        <IconBtn label={tr(lang, "back")} bg="#FAFAFA" size={44} onClick={() => setScreen("menu")}>
          <Back size={22} strokeWidth={3} />
        </IconBtn>
        <h1 className="text-xl font-black text-[#FFD154]">{tr(lang, "levelSelect")}</h1>
        <CoinChip small />
      </div>

      <div className="flex-1 overflow-y-auto game-scroll px-4 pt-4 pb-8 space-y-5">
        {packs.map((pack) => (
          <section key={pack.index} aria-label={`${tr(lang, "pack")} ${pack.index}`}>
            {/* pack banner */}
            <div
              className="flex items-center justify-between rounded-2xl border-[3px] border-[#3B2E5A] px-4 py-2.5 shadow-[0_4px_0_rgba(59,46,90,0.25)]"
              style={{ background: pack.world.color }}
            >
              <div className="leading-tight min-w-0">
                <div className="font-black text-[#3B2E5A] text-base truncate">{bi(pack.world.name, lang)}</div>
                <div className="text-[11px] font-bold text-[#3B2E5A]/70 whitespace-nowrap">
                  {tr(lang, "pack")} {num(pack.index, lang)} • {tr(lang, "levels")} {num(pack.from, lang)} {tr(lang, "to")} {num(pack.to, lang)}
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-white/80 border-2 border-[#3B2E5A] text-xs font-black text-[#3B2E5A] shrink-0 ms-2">
                {num(pack.done, lang)}/{num(pack.to - pack.from + 1, lang)}
              </div>
            </div>
            {/* levels grid */}
            <div className="mt-3 grid grid-cols-4 gap-3 pb-3">
              {pack.ids.map((id) => {
                const exists = IMPLEMENTED.has(id);
                const isOpen = id <= unlocked && exists;
                return (
                  <LevelButton
                    key={id}
                    id={id}
                    stars={progress[id] ?? 0}
                    unlocked={isOpen}
                    current={isOpen && id === unlocked && !progress[id]}
                    color={pack.world.color === "#FFD154" ? "#E8A81C" : pack.world.color}
                    onClick={() => openLevel(id)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
