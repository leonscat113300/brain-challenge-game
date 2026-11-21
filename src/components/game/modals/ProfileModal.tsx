"use client";

import { useState } from "react";
import { CheckCircle2, Star, Sparkles, Lightbulb, Coins, Flame, Pencil, Check, X } from "lucide-react";
import { useGameStore, TOTAL_LEVELS } from "@/lib/game/store";
import { tr } from "@/lib/game/i18n";
import { num } from "@/lib/game/utils";
import { sfx } from "@/lib/game/audio";
import { GameModal } from "../ui";
import { Brain } from "../Brain";

export default function ProfileModal() {
  const lang = useGameStore((s) => s.lang);
  const open = useGameStore((s) => s.modal === "profile");
  const setModal = useGameStore((s) => s.setModal);
  const coins = useGameStore((s) => s.coins);
  const progress = useGameStore((s) => s.progress);
  const stats = useGameStore((s) => s.stats);
  const daily = useGameStore((s) => s.daily);
  const playerName = useGameStore((s) => s.playerName);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(false);

  const solvedCount = Object.keys(progress).length;
  const allStars = Object.values(progress).reduce((a, b) => a + b, 0);
  const perfect = Object.values(progress).filter((v) => v === 3).length;

  const items = [
    { key: "solved", icon: <CheckCircle2 size={18} color="#3B2E5A" aria-hidden />, label: tr(lang, "solvedCount"), value: num(solvedCount, lang), bg: "#4CAF50" },
    { key: "stars", icon: <Star size={18} color="#3B2E5A" fill="#FFD154" aria-hidden />, label: tr(lang, "allStars"), value: num(allStars, lang), bg: "#FFD154" },
    { key: "perfect", icon: <Sparkles size={18} color="#3B2E5A" aria-hidden />, label: tr(lang, "perfectCount"), value: num(perfect, lang), bg: "#FF6B81" },
    { key: "hints", icon: <Lightbulb size={18} color="#3B2E5A" aria-hidden />, label: tr(lang, "hintsUsed"), value: num(stats.hintsUsed, lang), bg: "#E8A81C" },
    { key: "coins", icon: <Coins size={18} color="#3B2E5A" aria-hidden />, label: tr(lang, "coins"), value: num(coins, lang), bg: "#1EC8CF" },
    { key: "streak", icon: <Flame size={18} color="#3B2E5A" aria-hidden />, label: tr(lang, "streak"), value: `${num(daily.streak, lang)} ${tr(lang, "days")}`, bg: "#FF9F1C" },
  ];

  return (
    <GameModal open={open} onClose={() => setModal(null)} title={tr(lang, "profile")} accent="#1EC8CF" lang={lang}>
      <div className="space-y-4">
        {/* header: player name (editable without touching progress) */}
        <div className="flex flex-col items-center gap-2">
          <Brain mood="happy" className="h-20 w-20" />
          {!editing ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-[#3B2E5A]">{playerName || tr(lang, "guestPlayer")}</span>
              <button
                onClick={() => {
                  sfx.click();
                  setDraft(playerName);
                  setError(false);
                  setEditing(true);
                }}
                aria-label={tr(lang, "editName")}
                className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#3B2E5A] bg-[#FFD154] text-[#3B2E5A]"
              >
                <Pencil size={14} strokeWidth={2.8} />
              </button>
            </div>
          ) : (
            <div className="w-full space-y-2">
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={draft}
                  maxLength={24}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    if (e.target.value.trim()) setError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const t = draft.trim();
                      if (!t) {
                        setError(true);
                        sfx.fail();
                        return;
                      }
                      sfx.unlock();
                      setPlayerName(t);
                      setEditing(false);
                    }
                  }}
                  aria-label={tr(lang, "editName")}
                  className="w-full min-w-0 rounded-2xl border-[3px] border-[#3B2E5A] bg-[#F3F0FA] px-3 py-2 text-center text-base font-extrabold text-[#3B2E5A] outline-none"
                  dir={lang === "fa" ? "rtl" : "ltr"}
                />
                <button
                  onClick={() => {
                    const t = draft.trim();
                    if (!t) {
                      setError(true);
                      sfx.fail();
                      return;
                    }
                    sfx.unlock();
                    setPlayerName(t);
                    setEditing(false);
                  }}
                  aria-label={tr(lang, "save")}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[#3B2E5A] bg-[#4CAF50] text-white"
                >
                  <Check size={16} strokeWidth={3} />
                </button>
                <button
                  onClick={() => {
                    sfx.pop();
                    setEditing(false);
                  }}
                  aria-label={tr(lang, "cancel")}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[#3B2E5A] bg-[#F3F0FA] text-[#3B2E5A]"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
              {error && (
                <p className="text-center text-xs font-black text-[#FF6B81]" role="alert">
                  {tr(lang, "playerNameError")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* progress bar */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-black text-[#3B2E5A]">
            <span>{tr(lang, "progress")}</span>
            <span dir="ltr">
              {num(solvedCount, lang)} / {num(TOTAL_LEVELS, lang)}
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-full border-[3px] border-[#3B2E5A] bg-white">
            <div className="h-full rounded-full bg-[#6C4AB6] transition-all" style={{ width: `${(solvedCount / TOTAL_LEVELS) * 100}%` }} />
          </div>
        </div>

        {/* stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {items.map((it) => (
            <div key={it.key} className="flex items-center gap-2.5 rounded-2xl border-[3px] border-[#3B2E5A] bg-white p-3 shadow-[0_4px_0_rgba(59,46,90,0.2)]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[#3B2E5A]" style={{ background: it.bg }} aria-hidden>
                {it.icon}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-bold text-[#8B84A3]">{it.label}</span>
                <span className="block text-base font-black text-[#3B2E5A]">{it.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </GameModal>
  );
}
