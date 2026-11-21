"use client";

import { Gift, Flame, Star } from "lucide-react";
import { useGameStore, TOTAL_LEVELS } from "@/lib/game/store";
import { getLevel } from "@/lib/game/levels";
import { tr } from "@/lib/game/i18n";
import { todayKey, dailySeed, num } from "@/lib/game/utils";
import { GameModal } from "../ui";
import { sfx } from "@/lib/game/audio";

export default function DailyModal() {
  const lang = useGameStore((s) => s.lang);
  const open = useGameStore((s) => s.modal === "daily");
  const setModal = useGameStore((s) => s.setModal);
  const daily = useGameStore((s) => s.daily);
  const progress = useGameStore((s) => s.progress);
  const claimDaily = useGameStore((s) => s.claimDaily);
  const startLevel = useGameStore((s) => s.startLevel);

  const today = todayKey();
  const missionId = dailySeed(TOTAL_LEVELS) + 1;
  const meta = getLevel(missionId);
  const earned = progress[missionId] ?? 0;
  const canClaim = daily.lastClaim !== today;
  const missionDone = daily.lastDailyDone === today;

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

        {/* daily mission */}
        <div className="rounded-2xl border-[3px] border-[#3B2E5A] bg-[#F3F0FA] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="font-black text-[#3B2E5A]">{tr(lang, "dailyPlay")}</div>
            <div className="flex gap-0.5" aria-label={`${earned} / 3 ${tr(lang, "stars")}`}>
              {[1, 2, 3].map((i) => (
                <Star
                  key={i}
                  size={16}
                  aria-hidden
                  className={i <= earned ? "text-[#E8A81C]" : "text-[#C7C3D4]"}
                  fill={i <= earned ? "#FFD154" : "none"}
                />
              ))}
            </div>
          </div>
          <div className="mt-1 text-sm font-bold text-[#3B2E5A]/80">
            {tr(lang, "level")} {num(missionId, lang)} — {meta.name[lang]}
          </div>
          <button
            disabled={missionDone}
            onClick={() => {
              sfx.whoosh();
              startLevel(missionId);
              setModal(null);
            }}
            className={`btn-chunky mt-2.5 w-full border-[3px] border-[#3B2E5A] py-2.5 text-sm text-white ${
              missionDone ? "bg-[#8B84A3]" : "bg-[#6C4AB6]"
            }`}
          >
            {missionDone ? tr(lang, "dailyDone") : tr(lang, "dailyPlay")}
          </button>
        </div>
      </div>
    </GameModal>
  );
}
