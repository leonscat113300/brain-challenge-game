"use client";

import { Clapperboard, Lightbulb } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import { tr } from "@/lib/game/i18n";
import { num } from "@/lib/game/utils";
import { GameModal, CoinChip } from "../ui";

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

  return (
    <GameModal open={open} onClose={() => setModal(null)} title={tr(lang, "storeTitle")} accent="#E8A81C" lang={lang}>
      <div className="space-y-4">
        {/* balance */}
        <div className="flex justify-center">
          <CoinChip />
        </div>

        {/* disabled: watch-video button does nothing in this build */}
        <button
          disabled
          aria-disabled
          className="btn-chunky flex w-full cursor-not-allowed items-center justify-center gap-2 border-[3px] border-[#3B2E5A] bg-[#4CAF50]/50 px-4 py-3 text-white/85"
        >
          <Clapperboard size={20} strokeWidth={2.6} aria-hidden />
          <span>{tr(lang, "watchForCoins")}</span>
          <span className="rounded-full border-2 border-[#3B2E5A] bg-[#FFD154]/60 px-2 py-0.5 text-sm font-black text-[#3B2E5A]" dir="ltr">
            +{num(25, lang)}
          </span>
        </button>

        {/* coin packs: fully disabled — pressing them does nothing */}
        <div>
          <div className="grid grid-cols-3 gap-2">
            {PACKS.map((p) => (
              <button
                key={p.n}
                disabled
                aria-disabled
                className="btn-chunky relative cursor-not-allowed overflow-hidden rounded-2xl border-[3px] border-[#3B2E5A] bg-white/60 px-2 py-3 text-center"
                aria-label={`${p.n} ${tr(lang, "coins")} ${p.price}`}
              >
                <CoinIcon className="mx-auto h-8 w-8 opacity-70" />
                <div className="mt-1 text-base font-black text-[#3B2E5A]/70">{num(p.n, lang)}</div>
                <div className="mx-auto mt-1 w-fit rounded-full border-2 border-[#3B2E5A] bg-[#FFD154]/60 px-2 text-[11px] font-black text-[#3B2E5A]/70" dir="ltr">
                  {p.price}
                </div>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-center text-[11px] font-bold text-[#8B84A3]">{tr(lang, "demoBuy")}</p>
        </div>

        {/* hint pricing info (static, non-interactive) */}
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
