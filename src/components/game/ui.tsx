"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import { num, bi, vibrate } from "@/lib/game/utils";
import { sfx } from "@/lib/game/audio";
import { tr } from "@/lib/game/i18n";
import type { Lang } from "@/lib/game/types";

export function CoinChip({ small = false }: { small?: boolean }) {
  const coins = useGameStore((s) => s.coins);
  const lang = useGameStore((s) => s.lang);
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full bg-[#33205E]/80 border-2 border-[#FFD154] text-[#FFD154] font-extrabold ${small ? "px-2.5 py-1 text-sm" : "px-3.5 py-1.5 text-base"}`}
      aria-label={`${coins} coins`}
    >
      <svg viewBox="0 0 24 24" className={small ? "w-4 h-4" : "w-5 h-5"} aria-hidden>
        <circle cx="12" cy="12" r="10" fill="#FFD154" stroke="#E8A81C" strokeWidth="2" />
        <circle cx="12" cy="12" r="6.5" fill="none" stroke="#E8A81C" strokeWidth="1.5" />
        <path d="M12 7v10M9.5 9.5h5M9.5 14.5h5" stroke="#B97E0A" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {num(coins, lang)}
    </div>
  );
}

export function IconBtn({
  children,
  onClick,
  bg = "#FFFFFF",
  fg = "#3B2E5A",
  size = 48,
  label,
  className = "",
  disabled = false,
  badge,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  bg?: string;
  fg?: string;
  size?: number;
  label: string;
  className?: string;
  disabled?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div className="relative inline-flex">
      <button
        aria-label={label}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          sfx.click();
          onClick?.();
        }}
        className={`btn-chunky grid place-items-center ${className}`}
        style={{ width: size, height: size, background: bg, color: fg, border: "3px solid #3B2E5A", borderRadius: size / 2.6 }}
      >
        {children}
      </button>
      {badge}
    </div>
  );
}

/** Full-screen modal shell used by settings/store/daily/profile/achievements/about. */
export function GameModal({
  open,
  onClose,
  title,
  children,
  accent = "#6C4AB6",
  lang,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  accent?: string;
  lang: Lang;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#33205E]/70 backdrop-blur-sm px-3 pb-3 sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="card-chunky w-full max-w-md bg-[#FAFAFA] overflow-hidden flex flex-col max-h-[88dvh]"
            style={{ borderColor: "#3B2E5A" }}
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="relative flex items-center justify-center py-4 px-4" style={{ background: accent }}>
              <h2 className="text-xl font-extrabold text-white" style={{ direction: lang === "fa" ? "rtl" : "ltr" }}>
                {title}
              </h2>
              <button
                aria-label={tr(lang, "close")}
                onClick={() => {
                  sfx.pop();
                  onClose();
                }}
                className="absolute top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white text-[#3B2E5A] border-[3px] border-[#3B2E5A] shadow-[0_3px_0_rgba(59,46,90,0.3)] active:translate-y-[calc(-50%+2px)]"
                style={lang === "fa" ? { left: 12 } : { right: 12 }}
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>
            <div className="overflow-y-auto game-scroll p-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** on/off toggle row used in settings */
export function ToggleRow({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
}) {
  const lang = useGameStore((s) => s.lang);
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white border-[3px] border-[#3B2E5A] px-4 py-3 shadow-[0_4px_0_rgba(59,46,90,0.2)]">
      <div className="flex items-center gap-2.5 text-[#3B2E5A] font-bold">
        <span aria-hidden>{icon}</span>
        <span>{label}</span>
      </div>
      <button
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => {
          sfx.click();
          vibrate(15, useGameStore.getState().vibrationOn);
          onChange(!value);
        }}
        className="relative w-16 h-9 rounded-full border-[3px] border-[#3B2E5A] transition-colors"
        style={{ background: value ? "#4CAF50" : "#C7C3D4" }}
      >
        <span
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-[#3B2E5A] transition-all"
          style={value ? (lang === "fa" ? { left: 4 } : { right: 4 }) : lang === "fa" ? { right: 4 } : { left: 4 }}
        />
      </button>
    </div>
  );
}

/** floating toast text (fa/en aware) */
export function FloatText({ text, color = "#FFD154", onDone }: { text: string; color?: string; onDone?: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(() => onDone?.(), 1100);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full font-extrabold text-lg whitespace-nowrap"
      style={{ background: "#33205E", color, border: "2px solid #FAFAFA", animation: "float-up 1.1s ease-out forwards", top: "18%" }}
      role="status"
    >
      {text}
    </div>
  );
}

export { bi, num, tr };
