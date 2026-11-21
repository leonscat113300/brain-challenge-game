"use client";

import { Gift, Flame } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import { tr } from "@/lib/game/i18n";
import { todayKey, num } from "@/lib/game/utils";
import { GameModal } from "../ui";
import { sfx } from "@/lib/game/audio";

export default function DailyModal() {
  const lang = useGameStore((s) => s.lang);
  const open = useGameStore((s) => s.modal === "daily");
  const setModal = useGameStore((s) => s.setModal);
  const daily = useGameStore((s) => s.daily);
  const claimDaily = useGameStore((s) => s.claimDaily);

  const today = todayKey();
  const canClaim = daily.lastClaim !== today;

  return (
    <GameModal open={open} onClose={() => setModal(null)} title={tr(lang, "daily")} accent="#FF6B81" lang={lang}>
      <div className="space-y-4">
        {/* gift */}
        <div className="grid place-items-center">
          <div
            className="grid h-20 w-20 place-items-center rounded-full border-4 border-[#3B2E5A] bg-[#FF6B81]"
            style={{ animation: "breathe 2.4s ease-in-out infinite" }}
          >
            <Gift size={40} className="text-white" aria-hidden />
          </div>
        </div>

        {/* streak */}
        <div className="flex items-center justify-center gap-1.5 rounded-2xl border-[3px] border-[#3B2E5A] bg-white px-3 py-2 font-extrabold text-[#3B2E5A]">
          <Flame size={18} className="text-[#FF9F1C]" aria-hidden />
          <span>{tr(lang, "streak")}:</span>
          <span className="text-[#FF6B81]">{num(daily.streak, lang)}</span>
          <span>{tr(lang, "days")}</span>
        </div>

        {/* daily reward claim */}
        <button
          disabled={!canClaim}
          onClick={() => {
            sfx.coin();
            sfx.cheer();
            claimDaily();
          }}
          className={`btn-chunky w-full border-[3px] border-[#3B2E5A] py-3 text-white ${canClaim ? "bg-[#4CAF50]" : "bg-[#8B84A3]"}`}
        >
          {canClaim ? tr(lang, "dailyClaim") : tr(lang, "dailyClaimed")}
        </button>
      </div>
    </GameModal>
  );
}
