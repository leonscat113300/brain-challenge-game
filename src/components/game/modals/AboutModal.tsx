"use client";

import { ShieldCheck, Mail, Send } from "lucide-react";
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

        {/* contact card — professional email row */}
        <div className="rounded-2xl border-[3px] border-[#3B2E5A] bg-[#F3F0FA] p-3">
          <div className="mb-2 flex items-center gap-1.5 font-black text-[#3B2E5A]">
            <Send size={16} className="text-[#6C4AB6]" aria-hidden />
            {tr(lang, "contactUs")}
          </div>
          <a
            href="mailto:leonscatnft@gmail.com"
            className="group flex w-full items-center gap-3 rounded-xl border-[3px] border-[#3B2E5A] bg-white px-3 py-2.5 text-start shadow-[0_3px_0_rgba(59,46,90,0.25)] transition-transform active:scale-[0.98]"
            aria-label={`${tr(lang, "emailUs")}: leonscatnft@gmail.com`}
          >
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-[3px] border-[#3B2E5A] shadow-inner"
              style={{ background: "linear-gradient(145deg,#FFD154 0%,#E8A81C 100%)" }}
              aria-hidden
            >
              <Mail size={20} strokeWidth={2.7} className="text-[#3B2E5A] transition-transform group-hover:scale-110" />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[11px] font-black uppercase tracking-wider text-[#8B84A3]">{tr(lang, "emailUs")}</span>
              <span dir="ltr" className="block truncate text-sm font-extrabold text-[#33205E] underline decoration-[#E8A81C] decoration-2 underline-offset-2">
                leonscatnft@gmail.com
              </span>
            </span>
            <Send size={15} className="shrink-0 text-[#6C4AB6] transition-transform group-hover:-translate-x-0.5 rtl:rotate-180" aria-hidden />
          </a>
        </div>

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
