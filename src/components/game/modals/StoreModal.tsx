"use client";

import { useEffect, useRef, useState } from "react";
import { Clapperboard, Lightbulb } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import { tr } from "@/lib/game/i18n";
import { num } from "@/lib/game/utils";
import { GameModal, CoinChip } from "../ui";
import { sfx } from "@/lib/game/audio";

const PACKS = [
  { n: 100, price: "$0.99" },
  { n: 550, price: "$3.99" },
  { n: 1200, price: "$7.99" },
];

function CoinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#FFD154" stroke="#E8A81C" strokeWidth="2" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="#E8A81C" strokeWidth="1.5" />
      <path d="M12 7v10M9.5 9.5h5M9.5 14.5h5" stroke="#B97E0A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function StoreModal() {
  const lang = useGameStore((s) => s.lang);
  const open = useGameStore((s) => s.modal === "store");
  const setModal = useGameStore((s) => s.setModal);
  const setAdOpen = useGameStore((s) => s.setAdOpen);
  const addCoins = useGameStore((s) => s.addCoins);
  const [flash, setFlash] = useState<number | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    []
  );

  const buyPack = (n: number) => {
    addCoins(n);
    sfx.coin();
    setFlash(n);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 1200);
  };

  return (
    <GameModal open={open} onClose={() => setModal(null)} title={tr(lang, "storeTitle")} accent="#E8A81C" lang={lang}>
      <div className="space-y-4">
        {/* balance */}
        <div className="flex justify-center">
          <CoinChip />
        </div>

        {/* free coins: fake rewarded ad */}
        <button
          onClick={() => {
            sfx.click();
            setAdOpen(true);
            setModal(null);
          }}
          className="btn-chunky flex w-full items-center justify-center gap-2 border-[3px] border-[#3B2E5A] bg-[#4CAF50] px-4 py-3 text-white"
        >
          <Clapperboard size={20} strokeWidth={2.6} aria-hidden />
          <span>{tr(lang, "watchForCoins")}</span>
          <span className="rounded-full border-2 border-[#3B2E5A] bg-[#FFD154] px-2 py-0.5 text-sm font-black text-[#3B2E5A]" dir="ltr">
            +{num(25, lang)}
          </span>
        </button>

        {/* coin packs (clearly demo) */}
        <div>
          <div className="grid grid-cols-3 gap-2">
            {PACKS.map((p) => (
              <button
                key={p.n}
                onClick={() => buyPack(p.n)}
                className="btn-chunky relative overflow-hidden rounded-2xl border-[3px] border-[#3B2E5A] bg-white px-2 py-3 text-center"
                aria-label={`${p.n} ${tr(lang, "coins")} ${p.price}`}
              >
                <CoinIcon className="mx-auto h-8 w-8" />
                <div className="mt-1 text-base font-black text-[#3B2E5A]">{num(p.n, lang)}</div>
                <div className="mx-auto mt-1 w-fit rounded-full border-2 border-[#3B2E5A] bg-[#FFD154] px-2 text-[11px] font-black text-[#3B2E5A]" dir="ltr">
                  {p.price}
                </div>
                {flash === p.n && (
                  <div
                    className="absolute inset-0 grid place-items-center rounded-xl bg-[#4CAF50]/95 px-1 text-center text-xs font-black leading-4 text-white"
                    style={{ animation: "pop-in 0.25s both" }}
                    role="status"
                  >
                    {tr(lang, "coinsAdded")}
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-center text-[11px] font-bold text-[#8B84A3]">{tr(lang, "demoBuy")}</p>
        </div>

        {/* hint pricing info */}
        <div className="rounded-2xl border-[3px] border-[#3B2E5A] bg-[#F3F0FA] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-black text-[#3B2E5A]">
              <Lightbulb size={16} className="text-[#E8A81C]" aria-hidden />
              {tr(lang, "hints")}
            </div>
            <div className="rounded-full border-2 border-[#3B2E5A] bg-white px-2 py-0.5 text-xs font-black text-[#3B2E5A]" dir="ltr">
              {num(25, lang)} / {num(50, lang)} / {num(100, lang)}
            </div>
          </div>
          <p className="mt-1.5 text-xs font-bold leading-5 text-[#3B2E5A]/75">
            {lang === "fa" ? "راهنماها هنگام استفاده از سکه خریداری می‌شوند" : "Hints are bought with coins at the moment of use"}
          </p>
        </div>
      </div>
    </GameModal>
  );
}
