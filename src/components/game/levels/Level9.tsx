"use client";

import React, { useState } from "react";
import type { BiText, Lang, LevelProps } from "@/lib/game/types";
import { Scene, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 9 — Three Differences: two stacked bedroom pictures; tap the  */
/* picture frame, the pillows and the lamp (on either picture).        */
/* ------------------------------------------------------------------ */

type DiffId = "pic" | "pil" | "lamp";

interface Spot {
  id: DiffId;
  top: string;
  left: string;
  label: BiText;
}

const SPOTS: Spot[] = [
  { id: "pic", top: "18%", left: "68%", label: { fa: "قاب عکس", en: "picture frame" } },
  { id: "pil", top: "48%", left: "21%", label: { fa: "بالش‌ها", en: "pillows" } },
  { id: "lamp", top: "51%", left: "78%", label: { fa: "چراغ مطالعه", en: "lamp" } },
];

/* One reusable bedroom drawing; the three diffs depend on the variant. */
function Bedroom({ variant }: { variant: "A" | "B" }) {
  const lampShade = variant === "A" ? "#FF6B81" : "#1EC8CF";
  return (
    <div className="absolute inset-0" aria-hidden>
      {/* wall + wooden floor */}
      <div className="absolute inset-x-0 top-0 h-[64%] bg-[#FDE9EC]" />
      <div
        className="absolute inset-x-0 bottom-0 h-[36%] border-t-4 border-[#3B2E5A]"
        style={{ background: "#E3B778", backgroundImage: "repeating-linear-gradient(90deg, rgba(185,126,50,0.45) 0 3px, transparent 3px 36px)" }}
      />

      {/* window with sky */}
      <div className="absolute left-[6%] top-[10%] w-[26%] h-[30%] rounded-xl border-4 border-[#3B2E5A] bg-[#BEE9F5] overflow-hidden">
        <div className="absolute right-[8%] top-[10%] w-[34%] aspect-square rounded-full bg-[#FFD154] border-[3px] border-[#E8A81C]" />
        <div className="absolute left-[8%] bottom-[16%] w-[36%] h-[18%] rounded-full bg-[#FAFAFA]" />
        <div className="absolute inset-x-0 top-1/2 h-[3px] bg-[#3B2E5A]" />
        <div className="absolute inset-y-0 left-1/2 w-[3px] bg-[#3B2E5A]" />
      </div>

      {/* picture frame — difference 1 (mountains vs flower) */}
      <div className="absolute left-[58%] top-[8%] w-[20%] h-[20%] rounded-md border-4 border-[#8B5E3C] bg-[#FAFAFA] overflow-hidden shadow-[0_3px_0_rgba(59,46,90,0.2)]">
        {variant === "A" ? (
          <svg viewBox="0 0 60 44" className="w-full h-full">
            <circle cx="44" cy="12" r="7" fill="#FFD154" />
            <path d="M2 40 L20 16 L32 32 L40 24 L58 40 Z" fill="#4CAF50" />
            <path d="M2 40 L20 16 L32 32" fill="none" stroke="#3B2E5A" strokeWidth="2.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 60 44" className="w-full h-full">
            <path d="M30 40 V22" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" />
            <path d="M30 30 q-8 -2 -10 -8 q8 -2 10 4" fill="#4CAF50" />
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="30" cy="14" rx="5" ry="8" fill="#FF6B81" transform={`rotate(${a} 30 14)`} />
            ))}
            <circle cx="30" cy="14" r="4.5" fill="#FFD154" stroke="#E8A81C" strokeWidth="1.5" />
          </svg>
        )}
      </div>

      {/* bed with turquoise blanket */}
      <div className="absolute left-[3%] top-[40%] w-[64%] h-[42%]">
        {/* headboard */}
        <div className="absolute left-0 top-[-6%] w-[9%] h-[106%] rounded-t-2xl bg-[#8B5E3C] border-4 border-[#3B2E5A]" />
        {/* mattress */}
        <div className="absolute left-[8%] top-[12%] right-0 h-[52%] rounded-md bg-[#FAFAFA] border-4 border-[#3B2E5A]" />
        {/* blanket */}
        <div className="absolute left-[8%] right-0 bottom-0 h-[48%] rounded-b-md bg-[#1EC8CF] border-4 border-[#3B2E5A] overflow-hidden">
          <div className="absolute inset-x-0 top-[30%] h-[3px] bg-[#12A3A9]" />
          <div className="absolute inset-x-0 top-[62%] h-[3px] bg-[#12A3A9]" />
          <div className="absolute right-[8%] top-[8%] w-[26%] h-[26%] rounded-bl-xl bg-[#FAFAFA] opacity-90" />
        </div>
        {/* pillows — difference 2 (two vs one) */}
        {variant === "A" && <div className="absolute left-[12%] top-[3%] w-[15%] h-[26%] rounded-lg bg-[#FAFAFA] border-[3px] border-[#3B2E5A] -rotate-3" />}
        <div className="absolute left-[29%] top-[3%] w-[15%] h-[26%] rounded-lg bg-[#FAFAFA] border-[3px] border-[#3B2E5A] rotate-2" />
        {/* leg */}
        <div className="absolute right-[2%] bottom-[-8%] w-[7%] h-[10%] rounded-b bg-[#6E4526] border-[3px] border-[#3B2E5A]" />
      </div>

      {/* nightstand */}
      <div className="absolute left-[68%] top-[62%] w-[20%] h-[19%]">
        <div className="absolute inset-x-0 top-0 h-[72%] rounded-md bg-[#8B5E3C] border-4 border-[#3B2E5A]" />
        <div className="absolute left-[20%] top-[30%] right-[20%] h-[3px] rounded bg-[#3B2E5A]" />
        <div className="absolute left-[15%] bottom-0 w-[10%] h-[28%] border-x-[3px] bg-[#6E4526] border-[#3B2E5A]" />
        <div className="absolute right-[15%] bottom-0 w-[10%] h-[28%] border-x-[3px] bg-[#6E4526] border-[#3B2E5A]" />
      </div>

      {/* table lamp — difference 3 (pink vs turquoise shade) */}
      <div className="absolute left-[68%] top-[48%] w-[20%] h-[14%] flex flex-col items-center">
        <svg viewBox="0 0 60 26" className="w-[62%] h-auto">
          <path d="M20 2 L40 2 L56 24 L4 24 Z" fill={lampShade} stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <div className="w-[7%] h-[30%] rounded bg-[#3B2E5A]" />
        <div className="w-[34%] h-[12%] rounded-full bg-[#3B2E5A]" />
      </div>

      {/* small rug */}
      <div className="absolute left-[14%] top-[84%] w-[30%] h-[12%] rounded-[50%] bg-[#FF6B81] border-4 border-[#3B2E5A] overflow-hidden">
        <div className="absolute inset-[14%] rounded-[50%] border-[3px] border-dashed border-[#FFD154]" />
      </div>

      {/* stack of books */}
      <div className="absolute left-[47%] top-[78%] w-[12%] h-[14%]">
        <div className="absolute bottom-0 inset-x-0 h-[34%] rounded-sm bg-[#4CAF50] border-[3px] border-[#3B2E5A] -rotate-2" />
        <div className="absolute bottom-[30%] inset-x-[6%] h-[32%] rounded-sm bg-[#FF9F1C] border-[3px] border-[#3B2E5A] rotate-1" />
        <div className="absolute bottom-[58%] inset-x-[14%] h-[30%] rounded-sm bg-[#6C4AB6] border-[3px] border-[#3B2E5A] -rotate-3" />
      </div>
    </div>
  );
}

function DiffPanel({
  variant,
  foundIds,
  orderOf,
  hint,
  onHit,
  onMiss,
  lang,
}: {
  variant: "A" | "B";
  foundIds: DiffId[];
  orderOf: (id: DiffId) => number;
  hint: boolean;
  onHit: (id: DiffId) => void;
  onMiss: () => void;
  lang: Lang;
}) {
  return (
    <div
      className="relative h-[44%] max-w-[94%] aspect-[4/3] rounded-2xl overflow-hidden border-4 border-[#3B2E5A] shadow-[0_6px_0_rgba(59,46,90,0.22)] cursor-pointer"
      onClick={onMiss}
      role="group"
      aria-label={variant === "A" ? (lang === "fa" ? "تصویر بالا" : "top picture") : lang === "fa" ? "تصویر پایین" : "bottom picture"}
    >
      <Bedroom variant={variant} />

      {/* invisible hit areas (44px) */}
      {SPOTS.map((s) => (
        <button
          key={s.id}
          type="button"
          aria-label={s.label[lang]}
          className="absolute w-11 h-11 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ top: s.top, left: s.left, background: "transparent" }}
          onClick={(e) => {
            e.stopPropagation();
            onHit(s.id);
          }}
        />
      ))}

      {/* hint rings on unfound spots */}
      {hint &&
        SPOTS.filter((s) => !foundIds.includes(s.id)).map((s) => (
          <div
            key={`hint-${s.id}`}
            className="pointer-events-none absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse-ring"
            style={{ top: s.top, left: s.left, border: "4px dashed #FFD154" }}
          />
        ))}

      {/* green numbered markers on found spots */}
      {SPOTS.filter((s) => foundIds.includes(s.id)).map((s) => (
        <div
          key={`mark-${s.id}`}
          className="pointer-events-none absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full font-extrabold text-lg text-[#3B2E5A]"
          style={{ top: s.top, left: s.left, background: "#FAFAFA", border: "4px solid #4CAF50", animation: "pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
        >
          {orderOf(s.id)}
        </div>
      ))}
    </div>
  );
}

export default function Level9({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [found, setFound] = useState<DiffId[]>([]);

  const handleHit = (id: DiffId) => {
    if (solved || found.length >= 3 || found.includes(id)) return;
    const next = [...found, id];
    setFound(next);
    sfx.pop();
    onProgress(next.length / 3);
    if (next.length === 3) {
      window.setTimeout(() => sfx.chime(), 200);
      window.setTimeout(onSolved, 600);
    }
  };

  const handleMiss = () => {
    if (solved || found.length >= 3) return;
    sfx.boing();
    onMistake({ fa: "این‌جا تفاوتی نیست!", en: "No difference here!" });
  };

  const orderOf = (id: DiffId) => found.indexOf(id) + 1;
  const frozen = solved || found.length >= 3;

  return (
    <Scene bg="linear-gradient(180deg,#EFE9F8 0%,#E2D8F4 100%)">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2.5%] px-[3%]">
        <DiffPanel
          variant="A"
          foundIds={found}
          orderOf={orderOf}
          hint={hintPulse > 0 && !frozen}
          onHit={handleHit}
          onMiss={handleMiss}
          lang={lang}
        />

        {/* divider bar */}
        <div className="h-[10px] w-[36%] rounded-full bg-[#6C4AB6] border-[3px] border-[#3B2E5A] flex items-center justify-center gap-1.5" aria-hidden>
          <div className="w-1.5 h-1.5 rounded-full bg-[#FAFAFA]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FAFAFA]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FAFAFA]" />
        </div>

        <DiffPanel
          variant="B"
          foundIds={found}
          orderOf={orderOf}
          hint={hintPulse > 0 && !frozen}
          onHit={handleHit}
          onMiss={handleMiss}
          lang={lang}
        />
      </div>
    </Scene>
  );
}
