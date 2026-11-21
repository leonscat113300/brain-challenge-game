"use client";

import { ShieldCheck } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import { tr } from "@/lib/game/i18n";
import { GameModal } from "../ui";
import { Brain } from "../Brain";

export default function AboutModal() {
  const lang = useGameStore((s) => s.lang);
  const open = useGameStore((s) => s.modal === "about");
  const setModal = useGameStore((s) => s.setModal);

  return (
    <GameModal open={open} onClose={() => setModal(null)} title={tr(lang, "about")} accent="#33205E" lang={lang}>
      <div className="space-y-4 text-center">
        <Brain mood="wink" className="mx-auto h-16 w-16" />
        <h3 className="text-2xl font-black text-[#FFD154]" style={{ textShadow: "0 2px 0 #33205E" }}>
          {tr(lang, "appName")}
        </h3>
        <p className="text-sm font-bold leading-7 text-[#3B2E5A]">{tr(lang, "aboutText")}</p>

        {/* privacy card */}
        <div className="rounded-2xl border-[3px] border-[#3B2E5A] bg-[#F3F0FA] p-3 text-start">
          <div className="flex items-center gap-1.5 font-black text-[#3B2E5A]">
            <ShieldCheck size={18} className="text-[#4CAF50]" aria-hidden />
            {tr(lang, "privacy")}
          </div>
          <p className="mt-1.5 text-xs font-bold leading-6 text-[#3B2E5A]/75">{tr(lang, "privacyText")}</p>
        </div>
      </div>
    </GameModal>
  );
}
