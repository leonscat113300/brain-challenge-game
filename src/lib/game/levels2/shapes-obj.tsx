"use client";
import React from "react";

/* ------------------------------------------------------------------ */
/* Flat-cute object shapes (household, tools, food, transport, nature) */
/* Each shape draws inside a 64x64 viewBox. c = main color, c2 = accent */
/* ------------------------------------------------------------------ */

export interface ObjProps {
  c?: string;
  c2?: string;
}

const INK = "#3B2E5A";
const st = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const ln = { stroke: INK, strokeWidth: 2.6, fill: "none", strokeLinecap: "round" as const };

const O = (Comp: React.FC<ObjProps>, ar = 1) => ({ C: Comp, ar });

/* ---------- household ---------- */

const House = ({ c = "#FF6B81", c2 = "#E85A70" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="12" y="30" width="40" height="28" rx="3" fill={c2} {...st} />
    <path d="M8 32 L32 12 L56 32 Z" fill={c} {...st} />
    <rect x="26" y="40" width="12" height="18" rx="2" fill="#FFF3D6" {...st} />
    <circle cx="35" cy="49" r="1.6" fill={INK} />
  </svg>
);

const Door = ({ c = "#8B5E3C" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="16" y="8" width="32" height="52" rx="4" fill={c} {...st} />
    <circle cx="41" cy="36" r="3" fill="#FFD154" stroke={INK} strokeWidth="2" />
    <rect x="24" y="16" width="16" height="14" rx="2" fill="none" stroke={INK} strokeWidth="2" opacity="0.5" />
  </svg>
);

const Window = ({ c = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="10" y="10" width="44" height="40" rx="4" fill={c} {...st} />
    <path d="M32 10 V50 M10 30 H54" stroke={INK} strokeWidth="3" />
    <path d="M16 18 L26 18 M16 25 L22 25" stroke="#fff" strokeWidth="2.6" opacity="0.8" strokeLinecap="round" />
  </svg>
);

const Key = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="20" cy="20" r="11" fill="none" stroke={c} strokeWidth="6" />
    <circle cx="20" cy="20" r="11" fill="none" stroke={INK} strokeWidth="1.6" opacity="0.35" />
    <path d="M27 27 L50 50 M44 44 L50 38 M38 50 L44 44" stroke={c} strokeWidth="6" strokeLinecap="round" />
    <path d="M27 27 L50 50" stroke={INK} strokeWidth="1" opacity="0.3" />
  </svg>
);

const Lock = ({ c = "#6C4AB6", c2 = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M22 28 V20 a10 10 0 0 1 20 0 V28" fill="none" stroke={INK} strokeWidth="4" />
    <rect x="16" y="28" width="32" height="26" rx="5" fill={c} {...st} />
    <circle cx="32" cy="39" r="4" fill={c2} stroke={INK} strokeWidth="2" />
    <path d="M32 42 V47" stroke={INK} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Clock = ({ c = "#FAFAFA", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="34" r="22" fill={c} {...st} />
    <circle cx="32" cy="34" r="16" fill="none" stroke={INK} strokeWidth="1.6" opacity="0.35" />
    <path d="M32 34 V23 M32 34 L40 39" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="34" r="2.2" fill={c2} stroke={INK} strokeWidth="1.4" />
    <path d="M24 10 L28 6 M40 10 L36 6" {...ln} />
  </svg>
);

const Lamp = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M20 30 L26 10 H38 L44 30 Z" fill={c} {...st} />
    <path d="M32 30 V52" {...ln} strokeWidth="3" />
    <path d="M22 56 Q32 48 42 56" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M26 24 H38" stroke={INK} strokeWidth="2" opacity="0.4" />
  </svg>
);

const Chair = ({ c = "#FF8C42" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M20 10 V34" {...ln} strokeWidth="4" />
    <rect x="20" y="32" width="26" height="6" rx="2" fill={c} {...st} />
    <path d="M23 38 V56 M43 38 V56 M20 44 H46" {...ln} strokeWidth="3.4" />
    <path d="M20 10 Q28 14 26 24" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
  </svg>
);

const Table = ({ c = "#8B5E3C" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="8" y="26" width="48" height="7" rx="3" fill={c} {...st} />
    <path d="M14 33 V56 M50 33 V56" {...ln} strokeWidth="3.6" />
  </svg>
);

const Bed = ({ c = "#1EC8CF", c2 = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M8 46 V24 Q8 20 12 20 H16" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    <path d="M56 46 V32 H8" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    <rect x="8" y="36" width="48" height="10" rx="3" fill={c} {...st} />
    <rect x="12" y="28" width="14" height="7" rx="3" fill={c2} stroke={INK} strokeWidth="2.6" />
  </svg>
);

const Sofa = ({ c = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M10 26 Q10 20 16 20 H48 Q54 20 54 26 V34 H10 Z" fill={c} {...st} />
    <rect x="8" y="34" width="48" height="14" rx="5" fill={c} {...st} />
    <path d="M14 48 V54 M50 48 V54" {...ln} strokeWidth="3.4" />
    <path d="M24 26 H40" stroke={INK} strokeWidth="2" opacity="0.4" />
  </svg>
);

const Tv = ({ c = "#33205E", c2 = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="8" y="12" width="48" height="32" rx="5" fill={c} {...st} />
    <rect x="13" y="17" width="38" height="22" rx="3" fill={c2} opacity="0.9" />
    <path d="M26 52 H38 M32 44 V52" {...ln} strokeWidth="3.4" />
  </svg>
);

const Phone = ({ c = "#4CAF50" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="20" y="8" width="24" height="48" rx="6" fill={c} {...st} />
    <rect x="24" y="14" width="16" height="30" rx="2" fill="#FAFAFA" stroke={INK} strokeWidth="2" />
    <circle cx="32" cy="50" r="3" fill={INK} />
  </svg>
);

const Fan = ({ c = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="26" r="19" fill="#FAFAFA" {...st} />
    <circle cx="32" cy="26" r="5" fill={c} stroke={INK} strokeWidth="2.6" />
    <path d="M32 26 Q40 16 46 24 Q42 32 32 26 Q24 36 16 28 Q20 20 32 26 Q42 22 40 32 Q34 36 32 26" fill={c} opacity="0.85" stroke={INK} strokeWidth="2" />
    <path d="M32 45 V56 M24 56 H40" {...ln} strokeWidth="3.4" />
  </svg>
);

const Pot = ({ c = "#8B8B9E", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M14 28 H50 L46 50 Q46 54 42 54 H22 Q18 54 18 50 Z" fill={c} {...st} />
    <path d="M14 28 Q10 20 16 14 M50 28 Q54 20 48 14" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <path d="M20 34 Q26 30 32 34 Q38 38 44 34" fill="none" stroke={c2} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Cup = ({ c = "#FAFAFA", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M18 22 H44 V44 Q44 52 36 52 H26 Q18 52 18 44 Z" fill={c} {...st} />
    <path d="M44 28 Q54 30 52 38 Q50 44 44 42" fill="none" stroke={INK} strokeWidth="3.4" />
    <path d="M24 16 Q27 10 24 6 M32 16 Q35 10 32 6" fill="none" stroke={c2} strokeWidth="2.6" strokeLinecap="round" opacity="0.9" />
  </svg>
);

const Mug = ({ c = "#6C4AB6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="16" y="20" width="28" height="34" rx="5" fill={c} {...st} />
    <path d="M44 28 Q56 30 54 40 Q52 48 44 46" fill="none" stroke={INK} strokeWidth="3.6" />
    <path d="M22 30 H38" stroke={INK} strokeWidth="2.4" opacity="0.35" strokeLinecap="round" />
  </svg>
);

const Bottle = ({ c = "#1EC8CF", c2 = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M27 6 H37 V16 Q44 22 44 32 V52 Q44 58 38 58 H26 Q20 58 20 52 V32 Q20 22 27 16 Z" fill={c} {...st} />
    <rect x="24" y="34" width="16" height="16" rx="3" fill={c2} stroke={INK} strokeWidth="2.4" />
  </svg>
);

const Jug = ({ c = "#FF8C42" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M22 14 H42 V20 Q50 26 50 40 Q50 54 38 56 H26 Q14 54 14 40 Q14 26 22 20 Z" fill={c} {...st} />
    <path d="M42 22 Q52 24 50 34" fill="none" stroke={INK} strokeWidth="3.4" />
    <path d="M22 14 Q20 8 26 6 H40 Q44 8 42 14" fill={c} stroke={INK} strokeWidth="3" />
    <path d="M20 40 Q32 34 44 40" stroke={INK} strokeWidth="2.4" opacity="0.35" fill="none" strokeLinecap="round" />
  </svg>
);

const Glass = ({ c = "#DCF7F8" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M18 10 H46 L42 52 Q42 58 36 58 H28 Q22 58 22 52 Z" fill={c} {...st} />
    <path d="M22 34 H42 L41 44 H23 Z" fill="#6C4AB6" opacity="0.35" />
  </svg>
);

const Plate = ({ c = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <ellipse cx="32" cy="36" rx="26" ry="17" fill={c} {...st} />
    <ellipse cx="32" cy="36" rx="15" ry="9" fill="none" stroke={INK} strokeWidth="2" opacity="0.3" />
  </svg>
);

const Bowl = ({ c = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M12 28 H52 Q50 52 32 52 Q14 52 12 28 Z" fill={c} {...st} />
    <ellipse cx="32" cy="28" rx="20" ry="5" fill="#6C4AB6" opacity="0.3" stroke={INK} strokeWidth="2.4" />
  </svg>
);

const Spoon = ({ c = "#C9C9D6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <ellipse cx="32" cy="16" rx="9" ry="13" fill={c} {...st} />
    <path d="M32 29 V58" stroke={c} strokeWidth="5" strokeLinecap="round" />
    <path d="M32 29 V58" stroke={INK} strokeWidth="1.4" opacity="0.4" />
  </svg>
);

const Fork = ({ c = "#C9C9D6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M24 8 V22 M32 6 V22 M40 8 V22 Q40 30 32 30 Q24 30 24 22" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M32 30 V58" stroke={c} strokeWidth="5" strokeLinecap="round" />
    <path d="M32 30 V58" stroke={INK} strokeWidth="1.4" opacity="0.4" />
  </svg>
);

const Knife = ({ c = "#C9C9D6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 6 Q42 18 38 32 H28 Q26 16 32 6 Z" fill={c} {...st} />
    <path d="M33 32 V58" stroke="#8B5E3C" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const Scissors = ({ c = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="18" cy="48" r="8" fill="none" stroke={c} strokeWidth="4.6" />
    <circle cx="42" cy="48" r="8" fill="none" stroke={c} strokeWidth="4.6" />
    <path d="M22 41 L42 14 M42 41 L22 14" stroke={INK} strokeWidth="4.4" strokeLinecap="round" />
    <circle cx="32" cy="28" r="3" fill="#FFD154" stroke={INK} strokeWidth="2" />
  </svg>
);

const Book = ({ c = "#4CAF50", c2 = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 16 Q22 8 10 12 V50 Q22 46 32 54 Q42 46 54 50 V12 Q42 8 32 16 Z" fill={c} {...st} />
    <path d="M32 16 V54" stroke={INK} strokeWidth="3" />
    <path d="M16 22 H26 M16 30 H26 M38 22 H48 M38 30 H48" stroke={INK} strokeWidth="2" opacity="0.35" strokeLinecap="round" />
    <rect x="0" y="0" width="0" height="0" fill="none" />
  </svg>
);

const Pencil = ({ c = "#FFD154", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="26" y="8" width="12" height="40" rx="2" fill={c} {...st} />
    <path d="M26 48 L32 60 L38 48 Z" fill={c2} {...st} />
    <path d="M26 8 Q32 2 38 8" fill={c2} stroke={INK} strokeWidth="3" />
    <path d="M32 8 V48" stroke={INK} strokeWidth="1.6" opacity="0.3" />
  </svg>
);

const Paper = ({ c = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M16 8 H40 L48 16 V56 H16 Z" fill={c} {...st} />
    <path d="M40 8 L48 16 H40 Z" fill="#E4E1EE" stroke={INK} strokeWidth="2.6" />
    <path d="M22 26 H42 M22 34 H42 M22 42 H36" stroke={INK} strokeWidth="2.2" opacity="0.4" strokeLinecap="round" />
  </svg>
);

const Mirror = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <ellipse cx="32" cy="28" rx="17" ry="22" fill="#DCF7F8" {...st} />
    <ellipse cx="32" cy="28" rx="12" ry="17" fill="#BFF0F2" opacity="0.8" />
    <path d="M24 16 Q20 24 22 34" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M26 50 H38 M32 50 V56" {...ln} strokeWidth="3.4" />
  </svg>
);

const Bulb = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="26" r="16" fill={c} {...st} />
    <path d="M26 42 H38 V48 H26 Z" fill="#C9C9D6" stroke={INK} strokeWidth="2.6" />
    <path d="M27 48 H37 V52 Q32 56 27 52 Z" fill="#C9C9D6" stroke={INK} strokeWidth="2.6" />
    <path d="M28 26 Q32 20 36 26" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M32 8 V4 M18 12 L15 9 M46 12 L49 9" {...ln} />
  </svg>
);

const Battery = ({ c = "#4CAF50", c2 = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="16" y="18" width="32" height="30" rx="5" fill={c} {...st} />
    <rect x="26" y="12" width="12" height="6" rx="2" fill={INK} />
    <path d="M28 26 L22 34 H30 L26 42" fill="none" stroke={c2} strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M34 26 H40 M34 34 H40 M34 42 H40" stroke={c2} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Magnet = ({ c = "#FF6B81", c2 = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M18 54 V26 Q18 10 32 10 Q46 10 46 26 V54 H36 V26 Q36 20 32 20 Q28 20 28 26 V54 Z" fill={c} {...st} />
    <rect x="18" y="48" width="10" height="8" fill={c2} stroke={INK} strokeWidth="2.6" />
    <rect x="36" y="48" width="10" height="8" fill={c2} stroke={INK} strokeWidth="2.6" />
  </svg>
);

const Rope = ({ c = "#B97E0A" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M8 40 Q20 20 32 32 Q46 44 56 22" fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" />
    <path d="M8 40 Q20 20 32 32 Q46 44 56 22" fill="none" stroke={INK} strokeWidth="1.4" strokeDasharray="3 5" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const Ladder = ({ c = "#8B5E3C" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M22 6 V58 M42 6 V58" stroke={c} strokeWidth="5" strokeLinecap="round" />
    <path d="M22 16 H42 M22 28 H42 M22 40 H42 M22 52 H42" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
    <path d="M22 16 H42 M22 28 H42 M22 40 H42 M22 52 H42" stroke={c} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Stairs = ({ c = "#FF8C42" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M6 56 H16 V46 H26 V36 H36 V26 H46 V16 H58" fill={c} {...st} />
  </svg>
);

const Box = ({ c = "#B97E0A", c2 = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="10" y="24" width="44" height="32" rx="4" fill={c} {...st} />
    <rect x="8" y="16" width="48" height="10" rx="3" fill={c2} {...st} />
    <path d="M32 26 V56" stroke={INK} strokeWidth="2.4" opacity="0.4" />
  </svg>
);

const Gift = ({ c = "#FF6B81", c2 = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="10" y="26" width="44" height="30" rx="4" fill={c} {...st} />
    <rect x="26" y="26" width="12" height="30" fill={c2} stroke={INK} strokeWidth="2.6" />
    <path d="M32 26 Q22 26 22 18 Q22 12 28 12 Q32 12 32 26 Q32 12 36 12 Q42 12 42 18 Q42 26 32 26 Z" fill={c2} {...st} strokeWidth="2.6" />
  </svg>
);

const Bag = ({ c = "#FF8C42" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M14 26 H50 L46 54 Q46 58 42 58 H22 Q18 58 18 54 Z" fill={c} {...st} />
    <path d="M24 26 Q24 12 32 12 Q40 12 40 26" fill="none" stroke={INK} strokeWidth="3.4" />
    <circle cx="26" cy="34" r="2" fill={INK} opacity="0.4" />
  </svg>
);

const Coin = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="32" r="22" fill={c} {...st} />
    <circle cx="32" cy="32" r="14" fill="none" stroke="#E8A81C" strokeWidth="3" />
    <path d="M32 24 V40 M27 28 Q32 24 37 28 M27 36 Q32 40 37 36" fill="none" stroke="#E8A81C" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

const Button = ({ c = "#4CAF50" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="32" r="21" fill={c} {...st} />
    <circle cx="26" cy="28" r="3" fill={INK} />
    <circle cx="38" cy="28" r="3" fill={INK} />
    <circle cx="26" cy="38" r="3" fill={INK} />
    <circle cx="38" cy="38" r="3" fill={INK} />
  </svg>
);

const Sock = ({ c = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M24 8 H40 V34 Q40 44 48 48 Q54 52 50 57 Q44 60 36 54 Q24 46 24 32 Z" fill={c} {...st} />
    <path d="M24 14 H40" stroke={INK} strokeWidth="2.6" opacity="0.5" />
    <path d="M24 20 H40" stroke="#FAFAFA" strokeWidth="3" opacity="0.7" />
  </svg>
);

const Hat = ({ c = "#6C4AB6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M20 34 Q20 12 32 12 Q44 12 44 34" fill={c} {...st} />
    <ellipse cx="32" cy="38" rx="24" ry="7" fill={c} {...st} />
    <path d="M22 30 H42" stroke="#FFD154" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const Shoe = ({ c = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M10 44 Q10 32 22 30 L36 26 Q44 24 48 32 L54 40 Q56 44 52 46 H12 Q10 46 10 44 Z" fill={c} {...st} />
    <path d="M10 46 H54 V52 H10 Z" fill="#FAFAFA" {...st} />
    <path d="M28 32 L34 28" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

const Umbrella = ({ c = "#FF6B81", c2 = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M8 30 Q32 4 56 30 Q44 26 32 30 Q20 26 8 30 Z" fill={c} {...st} />
    <path d="M32 8 V50 Q32 58 24 56" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M20 30 Q26 26 32 30 M32 30 Q38 26 44 30" stroke={c2} strokeWidth="2.4" fill="none" opacity="0.8" />
  </svg>
);

const Drum = ({ c = "#FF6B81", c2 = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <ellipse cx="32" cy="20" rx="22" ry="9" fill={c2} {...st} />
    <path d="M10 20 V42 Q10 50 32 50 Q54 50 54 42 V20" fill={c} {...st} />
    <path d="M18 26 V46 M46 26 V46 M32 29 V49" stroke={INK} strokeWidth="2.4" opacity="0.5" />
  </svg>
);

const Bell = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 10 Q18 14 18 34 L16 44 H48 L46 34 Q46 14 32 10 Z" fill={c} {...st} />
    <circle cx="32" cy="8" r="4" fill={INK} />
    <path d="M24 50 Q32 56 40 50" fill={c} stroke={INK} strokeWidth="3" />
    <path d="M26 20 Q24 28 24 34" stroke="#fff" strokeWidth="2.6" fill="none" opacity="0.7" strokeLinecap="round" />
  </svg>
);

const Candle = ({ c = "#FAFAFA", c2 = "#FF8C42" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="24" y="26" width="16" height="32" rx="3" fill={c} {...st} />
    <path d="M32 24 Q28 16 32 8 Q36 16 32 24 Z" fill={c2} stroke={INK} strokeWidth="2.6" />
    <path d="M28 34 H36" stroke={c2} strokeWidth="3" strokeLinecap="round" />
    <path d="M32 26 V22" stroke={INK} strokeWidth="2" />
  </svg>
);

const Match = ({ c = "#8B5E3C", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="29" y="20" width="6" height="38" rx="3" fill={c} {...st} strokeWidth="2.6" />
    <ellipse cx="32" cy="16" rx="7" ry="8" fill={c2} stroke={INK} strokeWidth="2.6" />
    <path d="M32 8 Q30 4 32 2 Q34 4 32 8" fill="#FFD154" stroke={INK} strokeWidth="2" />
  </svg>
);

const Flag = ({ c = "#4CAF50" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M18 8 V58" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    <path d="M18 12 Q32 6 46 12 Q40 20 46 28 Q32 34 18 28 Z" fill={c} {...st} />
    <path d="M14 58 H22" {...ln} strokeWidth="3.4" />
  </svg>
);

const Map = ({ c = "#FFF3D6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M10 16 L24 10 L40 16 L54 10 V48 L40 54 L24 48 L10 54 Z" fill={c} {...st} />
    <path d="M24 10 V48 M40 16 V54" stroke={INK} strokeWidth="2" opacity="0.4" />
    <path d="M14 26 Q22 20 30 26 Q38 32 50 24" fill="none" stroke="#1EC8CF" strokeWidth="2.6" strokeDasharray="4 4" strokeLinecap="round" />
    <circle cx="44" cy="40" r="4" fill="#FF6B81" stroke={INK} strokeWidth="2" />
  </svg>
);

const Magnifier = ({ c = "#C9C9D6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="28" cy="26" r="16" fill="#DCF7F8" {...st} />
    <circle cx="28" cy="26" r="16" fill="none" stroke={c} strokeWidth="5" opacity="0.9" />
    <path d="M39 38 L52 52" stroke={INK} strokeWidth="6" strokeLinecap="round" />
    <path d="M20 20 Q24 16 30 18" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
  </svg>
);

const Scale = ({ c = "#C9C9D6", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 12 V50 M22 56 H42 M32 12 Q20 12 12 22 M32 12 Q44 12 52 22" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M4 34 Q12 22 20 34 Q16 40 12 40 Q8 40 4 34 Z" fill={c2} {...st} strokeWidth="2.6" />
    <path d="M44 34 Q52 22 60 34 Q56 40 52 40 Q48 40 44 34 Z" fill={c2} {...st} strokeWidth="2.6" />
  </svg>
);

const Hourglass = ({ c = "#8B5E3C", c2 = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="12" y="6" width="40" height="6" rx="3" fill={c} {...st} strokeWidth="2.6" />
    <rect x="12" y="52" width="40" height="6" rx="3" fill={c} {...st} strokeWidth="2.6" />
    <path d="M16 12 Q32 26 16 52 M48 12 Q32 26 48 52" fill="none" stroke={INK} strokeWidth="3" />
    <path d="M26 44 Q32 40 38 44 L40 52 H24 Z" fill={c2} stroke={INK} strokeWidth="2" />
    <path d="M28 20 H36 L33 26 H31 Z" fill={c2} stroke={INK} strokeWidth="1.6" />
  </svg>
);

const Trophy = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M20 12 H44 V26 Q44 38 32 40 Q20 38 20 26 Z" fill={c} {...st} />
    <path d="M20 16 Q10 16 12 26 Q13 32 22 32 M44 16 Q54 16 52 26 Q51 32 42 32" fill="none" stroke={INK} strokeWidth="3" />
    <path d="M32 40 V48 M24 54 H40 L38 48 H26 Z" fill="#B97E0A" {...st} strokeWidth="2.6" />
    <path d="M26 20 Q30 26 32 28" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.8" />
  </svg>
);

const Crown = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M12 44 L10 20 L22 30 L32 12 L42 30 L54 20 L52 44 Z" fill={c} {...st} />
    <circle cx="32" cy="34" r="3.4" fill="#FF6B81" stroke={INK} strokeWidth="2" />
    <path d="M12 48 H52" stroke={INK} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const Medal = ({ c = "#1EC8CF", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M22 6 L32 24 L42 6" fill="none" stroke={c2} strokeWidth="6" strokeLinecap="round" />
    <circle cx="32" cy="38" r="17" fill={c} {...st} />
    <path d="M32 28 L35 34 L42 35 L37 40 L38 47 L32 44 L26 47 L27 40 L22 35 L29 34 Z" fill="#FFD154" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const Puzzle = ({ c = "#6C4AB6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M12 12 H28 Q26 4 34 4 Q42 4 40 12 H52 V26 Q60 24 60 32 Q60 40 52 38 V52 H38 Q40 60 32 60 Q24 60 26 52 H12 V38 Q4 40 4 32 Q4 24 12 26 Z" fill={c} {...st} strokeWidth="2.6" />
    <circle cx="32" cy="32" r="5" fill="#FFD154" stroke={INK} strokeWidth="2" />
  </svg>
);

const Dice = ({ c = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="12" y="12" width="40" height="40" rx="8" fill={c} {...st} />
    <circle cx="23" cy="23" r="4" fill={INK} />
    <circle cx="41" cy="23" r="4" fill={INK} />
    <circle cx="32" cy="32" r="4" fill={INK} />
    <circle cx="23" cy="41" r="4" fill={INK} />
    <circle cx="41" cy="41" r="4" fill={INK} />
  </svg>
);

const Balloon = ({ c = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <ellipse cx="32" cy="24" rx="17" ry="20" fill={c} {...st} />
    <path d="M28 44 H36 L33 49 H31 Z" fill={c} stroke={INK} strokeWidth="2.6" />
    <path d="M32 49 Q28 56 32 62 Q36 56 32 49" fill="none" stroke={INK} strokeWidth="2.4" />
    <ellipse cx="25" cy="18" rx="4" ry="6" fill="#fff" opacity="0.6" />
  </svg>
);

const Kite = ({ c = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 6 L54 26 L32 40 L10 26 Z" fill={c} {...st} />
    <path d="M32 6 V40 M10 26 L54 26" stroke={INK} strokeWidth="2" opacity="0.5" />
    <path d="M32 40 Q26 50 34 56 Q42 60 36 62" fill="none" stroke={INK} strokeWidth="2.4" strokeDasharray="4 3" />
    <path d="M24 18 Q28 14 34 18" stroke="#FFD154" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Ball = ({ c = "#FF8C42" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="32" r="22" fill={c} {...st} />
    <path d="M14 22 Q32 34 50 22 M14 42 Q32 30 50 42" fill="none" stroke="#FAFAFA" strokeWidth="3" />
    <path d="M32 10 V54" stroke="#FAFAFA" strokeWidth="3" />
  </svg>
);

const Cube = ({ c = "#6C4AB6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 8 L54 18 V44 L32 56 L10 44 V18 Z" fill={c} {...st} />
    <path d="M10 18 L32 28 L54 18 M32 28 V56" fill="none" stroke={INK} strokeWidth="2.6" opacity="0.6" />
  </svg>
);

const Diamond = ({ c = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M18 14 H46 L56 28 L32 54 L8 28 Z" fill={c} {...st} />
    <path d="M18 14 L26 28 L32 14 L38 28 L46 14 M8 28 H56 M26 28 L32 54 L38 28" fill="none" stroke={INK} strokeWidth="2" opacity="0.55" />
  </svg>
);

const Ring = ({ c = "#FFD154", c2 = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="38" r="16" fill="none" stroke={c} strokeWidth="6" />
    <circle cx="32" cy="38" r="16" fill="none" stroke={INK} strokeWidth="1.4" opacity="0.4" />
    <path d="M32 8 L38 16 L32 24 L26 16 Z" fill={c2} {...st} strokeWidth="2.4" />
  </svg>
);

const Letter = ({ c = "#FAFAFA", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="8" y="16" width="48" height="34" rx="4" fill={c} {...st} />
    <path d="M8 20 L32 38 L56 20" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    <path d="M40 8 H52 V16" fill="none" stroke={c2} strokeWidth="3" strokeLinecap="round" />
    <path d="M44 4 L48 12" stroke={c2} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Log = ({ c = "#8B5E3C" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="8" y="24" width="48" height="18" rx="9" fill={c} {...st} />
    <ellipse cx="54" cy="33" rx="5" ry="9" fill="#B97E0A" stroke={INK} strokeWidth="2.6" />
    <ellipse cx="54" cy="33" rx="2" ry="4" fill="#6E4526" />
    <path d="M14 29 H34 M14 37 H30" stroke="#6E4526" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
  </svg>
);

const Broom = ({ c = "#8B5E3C", c2 = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M26 6 L34 6 L36 34 L28 34 Z" fill={c} {...st} strokeWidth="2.6" />
    <path d="M28 34 H36 L42 56 Q32 62 22 56 Z" fill={c2} {...st} strokeWidth="2.6" />
    <path d="M26 44 L34 44 M24 50 L36 50" stroke={INK} strokeWidth="2" opacity="0.5" />
  </svg>
);

const Bucket = ({ c = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M16 24 H48 L44 54 Q44 58 40 58 H24 Q20 58 20 54 Z" fill={c} {...st} />
    <path d="M16 24 Q32 12 48 24" fill="none" stroke={INK} strokeWidth="3.4" />
    <ellipse cx="32" cy="24" rx="16" ry="5" fill="#6C4AB6" opacity="0.25" stroke={INK} strokeWidth="2.4" />
  </svg>
);

const Mic = ({ c = "#6C4AB6", c2 = "#C9C9D6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="24" y="8" width="16" height="26" rx="8" fill={c} {...st} />
    <path d="M18 26 Q18 42 32 42 Q46 42 46 26" fill="none" stroke={INK} strokeWidth="3.4" />
    <path d="M32 42 V52 M24 56 H40" {...ln} strokeWidth="3.4" />
    <path d="M28 16 H36 M28 22 H36" stroke={c2} strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

/* ---------- food ---------- */

const Apple = ({ c = "#FF6B81", c2 = "#4CAF50" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 18 Q28 10 22 10" stroke="#8B5E3C" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M32 14 Q40 4 48 10 Q42 18 32 16 Z" fill={c2} {...st} strokeWidth="2.6" />
    <path d="M32 16 Q22 10 14 20 Q6 30 12 44 Q18 58 32 56 Q46 58 52 44 Q58 30 50 20 Q42 10 32 16 Z" fill={c} {...st} />
    <path d="M20 26 Q18 34 22 42" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const Banana = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M10 18 Q14 52 44 54 Q56 54 56 44 Q54 48 44 46 Q22 42 16 16 Z" fill={c} {...st} />
    <path d="M8 14 Q12 12 12 18 L16 18 Q16 12 10 12 Z" fill="#8B5E3C" stroke={INK} strokeWidth="2.6" />
  </svg>
);

const Cherry = ({ c = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M24 44 Q20 26 34 10 M40 42 Q38 24 34 10" fill="none" stroke="#4CAF50" strokeWidth="3.4" strokeLinecap="round" />
    <circle cx="22" cy="48" r="11" fill={c} {...st} />
    <circle cx="42" cy="46" r="11" fill={c} {...st} />
    <circle cx="18" cy="44" r="2.6" fill="#fff" opacity="0.7" />
    <circle cx="38" cy="42" r="2.6" fill="#fff" opacity="0.7" />
  </svg>
);

const Grape = ({ c = "#6C4AB6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 8 Q34 4 40 6" stroke="#4CAF50" strokeWidth="3.4" fill="none" strokeLinecap="round" />
    <circle cx="24" cy="22" r="8" fill={c} {...st} strokeWidth="2.4" />
    <circle cx="40" cy="22" r="8" fill={c} {...st} strokeWidth="2.4" />
    <circle cx="20" cy="34" r="8" fill={c} {...st} strokeWidth="2.4" />
    <circle cx="32" cy="34" r="8" fill={c} {...st} strokeWidth="2.4" />
    <circle cx="44" cy="34" r="8" fill={c} {...st} strokeWidth="2.4" />
    <circle cx="26" cy="46" r="8" fill={c} {...st} strokeWidth="2.4" />
    <circle cx="38" cy="46" r="8" fill={c} {...st} strokeWidth="2.4" />
    <circle cx="32" cy="56" r="7" fill={c} {...st} strokeWidth="2.4" />
  </svg>
);

const Watermelon = ({ c = "#4CAF50", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M6 34 Q32 58 58 34 L58 30 Q32 52 6 30 Z" fill={c} {...st} />
    <path d="M10 32 Q32 52 54 32 Q32 44 10 32 Z" fill={c2} />
    <circle cx="24" cy="36" r="1.8" fill={INK} />
    <circle cx="34" cy="38" r="1.8" fill={INK} />
    <circle cx="42" cy="35" r="1.8" fill={INK} />
  </svg>
);

const Strawberry = ({ c = "#FF6B81", c2 = "#4CAF50" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 58 Q12 44 12 28 Q12 16 32 16 Q52 16 52 28 Q52 44 32 58 Z" fill={c} {...st} />
    <path d="M24 14 L32 18 L40 14 L36 22 L32 20 L28 22 Z" fill={c2} {...st} strokeWidth="2.4" />
    <path d="M24 30 L25 31 M32 26 L33 27 M40 30 L41 31 M28 40 L29 41 M36 40 L37 41" stroke={INK} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Orange = ({ c = "#FF8C42" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="36" r="21" fill={c} {...st} />
    <path d="M32 14 Q32 8 38 8" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M22 26 Q20 34 24 42" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const Carrot = ({ c = "#FF8C42", c2 = "#4CAF50" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M26 18 L38 18 L34 58 Q32 62 30 58 Z" fill={c} {...st} />
    <path d="M30 30 H33 M30 40 H33" stroke={INK} strokeWidth="2" opacity="0.5" />
    <path d="M32 16 Q26 4 18 8 Q26 10 28 16 M32 16 Q34 2 44 6 Q38 10 36 16 M32 16 Q32 4 32 2" fill="none" stroke={c2} strokeWidth="3.4" strokeLinecap="round" />
  </svg>
);

const Egg = ({ c = "#FFF3D6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 6 Q18 20 18 38 Q18 56 32 56 Q46 56 46 38 Q46 20 32 6 Z" fill={c} {...st} />
    <path d="M24 26 Q22 34 24 42" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
  </svg>
);

const Bread = ({ c = "#E8A81C" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M12 28 Q12 12 32 12 Q52 12 52 28 V50 Q52 54 48 54 H16 Q12 54 12 50 Z" fill={c} {...st} />
    <path d="M20 30 Q22 26 26 28 M34 30 Q36 26 40 28" stroke="#B97E0A" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M12 34 Q32 40 52 34" stroke={INK} strokeWidth="2" opacity="0.3" fill="none" />
  </svg>
);

const Cheese = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M6 44 L32 16 L58 44 Z" fill={c} {...st} />
    <path d="M6 44 H58 V52 H6 Z" fill="#E8A81C" {...st} />
    <circle cx="26" cy="40" r="3.4" fill="#E8A81C" stroke={INK} strokeWidth="1.6" />
    <circle cx="42" cy="38" r="2.6" fill="#E8A81C" stroke={INK} strokeWidth="1.6" />
  </svg>
);

const Cake = ({ c = "#FFF3D6", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="10" y="34" width="44" height="22" rx="4" fill={c} {...st} />
    <path d="M10 38 Q16 30 22 38 Q28 30 32 38 Q36 30 42 38 Q48 30 54 38" fill="none" stroke={c2} strokeWidth="3.4" strokeLinecap="round" />
    <rect x="28" y="20" width="8" height="14" rx="2" fill="#1EC8CF" stroke={INK} strokeWidth="2.4" />
    <path d="M32 18 Q29 12 32 8 Q35 12 32 18 Z" fill="#FFD154" stroke={INK} strokeWidth="2" />
    <circle cx="20" cy="46" r="2.4" fill={c2} />
    <circle cx="44" cy="46" r="2.4" fill="#1EC8CF" />
  </svg>
);

const Candy = ({ c = "#FF6B81", c2 = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="32" r="13" fill={c} {...st} />
    <path d="M20 26 L8 18 L12 32 L8 46 L20 38 Z" fill={c2} {...st} strokeWidth="2.6" />
    <path d="M44 26 L56 18 L52 32 L56 46 L44 38 Z" fill={c2} {...st} strokeWidth="2.6" />
    <path d="M26 28 Q32 24 38 28" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const IceCream = ({ c = "#FFF3D6", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M20 28 L32 58 L44 28 Z" fill="#E8A81C" {...st} />
    <circle cx="24" cy="22" r="10" fill={c2} {...st} strokeWidth="2.6" />
    <circle cx="38" cy="18" r="10" fill="#1EC8CF" {...st} strokeWidth="2.6" />
    <circle cx="32" cy="26" r="9" fill={c} stroke={INK} strokeWidth="2.6" />
    <circle cx="20" cy="12" r="3" fill="#FFD154" stroke={INK} strokeWidth="1.6" />
  </svg>
);

const Cookie = ({ c = "#E8A81C" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="32" r="22" fill={c} {...st} />
    <circle cx="24" cy="26" r="3.4" fill="#8B5E3C" />
    <circle cx="40" cy="24" r="3" fill="#8B5E3C" />
    <circle cx="32" cy="38" r="3.4" fill="#8B5E3C" />
    <circle cx="42" cy="40" r="2.6" fill="#8B5E3C" />
    <circle cx="20" cy="40" r="2.4" fill="#8B5E3C" />
  </svg>
);

/* ---------- transport ---------- */

const Car = ({ c = "#FF6B81", c2 = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M10 40 Q10 30 20 28 L24 18 Q26 14 32 14 L42 14 Q48 14 50 20 L52 28 Q58 30 58 38 V44 H10 Z" fill={c} {...st} />
    <path d="M28 20 L26 28 H36 V18 Z M38 18 V28 H46 L44 21 Q43 19 40 18 Z" fill={c2} stroke={INK} strokeWidth="2.4" />
    <circle cx="20" cy="46" r="6" fill="#33205E" stroke={INK} strokeWidth="2.6" />
    <circle cx="46" cy="46" r="6" fill="#33205E" stroke={INK} strokeWidth="2.6" />
  </svg>
);

const Bus = ({ c = "#FFD154", c2 = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="6" y="14" width="52" height="34" rx="6" fill={c} {...st} />
    <rect x="12" y="20" width="12" height="10" rx="2" fill={c2} stroke={INK} strokeWidth="2.4" />
    <rect x="28" y="20" width="12" height="10" rx="2" fill={c2} stroke={INK} strokeWidth="2.4" />
    <rect x="44" y="20" width="10" height="10" rx="2" fill={c2} stroke={INK} strokeWidth="2.4" />
    <circle cx="18" cy="52" r="5.4" fill="#33205E" stroke={INK} strokeWidth="2.4" />
    <circle cx="46" cy="52" r="5.4" fill="#33205E" stroke={INK} strokeWidth="2.4" />
  </svg>
);

const Train = ({ c = "#4CAF50", c2 = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="8" y="10" width="48" height="34" rx="6" fill={c} {...st} />
    <rect x="14" y="16" width="36" height="14" rx="3" fill={c2} stroke={INK} strokeWidth="2.6" />
    <circle cx="20" cy="50" r="5" fill="#33205E" stroke={INK} strokeWidth="2.4" />
    <circle cx="34" cy="50" r="5" fill="#33205E" stroke={INK} strokeWidth="2.4" />
    <circle cx="48" cy="50" r="5" fill="#33205E" stroke={INK} strokeWidth="2.4" />
    <path d="M6 42 H58" stroke={INK} strokeWidth="2.4" opacity="0.4" />
  </svg>
);

const Boat = ({ c = "#FF6B81", c2 = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 8 V36 M32 12 Q48 16 48 34 H32" fill="none" stroke={INK} strokeWidth="3" />
    <path d="M32 12 Q16 16 16 34 H32" fill={c2} stroke={INK} strokeWidth="2.6" />
    <path d="M10 38 H54 L46 50 H18 Z" fill={c} {...st} />
    <path d="M4 56 Q32 64 60 56" fill="none" stroke="#1EC8CF" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const Plane = ({ c = "#1EC8CF", c2 = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M8 34 Q22 26 36 26 L54 26 Q60 28 54 34 L36 38 Q22 40 8 36 Z" fill={c} {...st} />
    <path d="M24 26 L30 12 H36 L34 26 M24 38 L30 50 H36 L34 38" fill={c2} stroke={INK} strokeWidth="2.6" />
    <path d="M48 24 L56 14 L58 16 L52 26" fill={c2} stroke={INK} strokeWidth="2.6" />
    <circle cx="44" cy="30" r="2.6" fill="#fff" opacity="0.9" />
  </svg>
);

const Rocket = ({ c = "#FAFAFA", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 4 Q42 14 42 34 H22 Q22 14 32 4 Z" fill={c} {...st} />
    <circle cx="32" cy="22" r="6" fill="#1EC8CF" stroke={INK} strokeWidth="2.6" />
    <path d="M22 30 L12 44 L22 42 Z M42 30 L52 44 L42 42 Z" fill={c2} {...st} strokeWidth="2.6" />
    <path d="M26 42 Q32 56 38 42 Q32 50 26 42" fill="#FFD154" stroke={INK} strokeWidth="2.4" />
  </svg>
);

const Bike = ({ c = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="16" cy="44" r="10" fill="none" stroke={INK} strokeWidth="3.4" />
    <circle cx="48" cy="44" r="10" fill="none" stroke={INK} strokeWidth="3.4" />
    <path d="M16 44 L28 24 L44 24 L48 44 M28 24 L38 44 L16 44" fill="none" stroke={c} strokeWidth="3.4" />
    <path d="M28 24 L24 18 H20 M44 24 L50 16 H56" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* ---------- scenery ---------- */

const Bridge = ({ c = "#8B5E3C" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M4 30 H60" stroke={c} strokeWidth="6" strokeLinecap="round" />
    <path d="M4 38 H60" stroke={c} strokeWidth="4" strokeLinecap="round" />
    <path d="M12 30 V56 M32 34 V56 M52 30 V56" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M8 24 V30 M20 24 V30 M32 22 V30 M44 24 V30 M56 24 V30" stroke={INK} strokeWidth="2.6" />
  </svg>
);

const Castle = ({ c = "#C9C9D6", c2 = "#6C4AB6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="8" y="24" width="48" height="34" rx="3" fill={c} {...st} />
    <path d="M8 24 V16 H14 V24 M22 24 V16 H28 V24 M36 24 V16 H42 V24 M50 24 V16 H56 V24" fill={c} {...st} strokeWidth="2.6" />
    <rect x="26" y="40" width="12" height="18" rx="6" fill={c2} stroke={INK} strokeWidth="2.6" />
    <path d="M16 32 H22 M42 32 H48" stroke={INK} strokeWidth="2.6" />
  </svg>
);

const Tent = ({ c = "#FF8C42" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 8 L56 54 H8 Z" fill={c} {...st} />
    <path d="M32 8 L42 54 H32 Z" fill="#fff" opacity="0.25" />
    <path d="M32 54 V40 Q36 34 40 40" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Fence = ({ c = "#B97E0A" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M10 14 V52 M26 14 V52 M42 14 V52 M58 14 V52" stroke={c} strokeWidth="5" strokeLinecap="round" />
    <path d="M4 24 H60 M4 40 H60" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M4 24 H60 M4 40 H60" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const Ground = ({ c = "#7BC96F" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="0" y="20" width="64" height="44" fill={c} />
    <path d="M0 20 Q16 14 32 20 Q48 26 64 20 V64 H0 Z" fill={c} stroke={INK} strokeWidth="3" />
    <path d="M12 34 L14 30 L16 34 M28 42 L30 38 L32 42 M44 34 L46 30 L48 34" stroke="#4CAF50" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </svg>
);

const Water = ({ c = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M0 26 Q10 20 20 26 Q32 32 42 26 Q52 20 64 26 V56 Q52 50 42 56 Q32 62 20 56 Q10 50 0 56 Z" fill={c} stroke={INK} strokeWidth="3" />
    <path d="M12 38 Q20 34 28 38 M36 44 Q44 40 52 44" stroke="#FAFAFA" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const Cave = ({ c = "#8B8B9E" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M4 58 Q4 18 32 10 Q60 18 60 58 Z" fill={c} {...st} />
    <path d="M22 58 Q22 36 32 34 Q42 36 42 58 Z" fill="#33205E" stroke={INK} strokeWidth="3" />
  </svg>
);

export const OBJ_SHAPES: Record<string, { C: React.FC<ObjProps>; ar: number }> = {
  house: O(House), door: O(Door, 0.72), window: O(Window, 1.15), key: O(Key), lock: O(Lock),
  clock: O(Clock), lamp: O(Lamp), chair: O(Chair), table: O(Table, 1.4), bed: O(Bed, 1.5),
  sofa: O(Sofa, 1.6), tv: O(Tv, 1.3), phone: O(Phone, 0.56), fan: O(Fan), pot: O(Pot),
  cup: O(Cup), mug: O(Mug), bottle: O(Bottle, 0.6), jug: O(Jug, 0.85), glass: O(Glass, 0.62),
  plate: O(Plate, 1.5), bowl: O(Bowl, 1.35), spoon: O(Spoon, 0.34), fork: O(Fork, 0.34),
  knife: O(Knife, 0.3), scissors: O(Scissors), book: O(Book, 1.15), pencil: O(Pencil, 0.34),
  paper: O(Paper, 0.82), mirror: O(Mirror, 0.82), bulb: O(Bulb, 0.85), battery: O(Battery, 0.95),
  magnet: O(Magnet), rope: O(Rope, 2.1), ladder: O(Ladder, 0.5), stairs: O(Stairs, 1.1),
  box: O(Box), gift: O(Gift), bag: O(Bag), coin: O(Coin), button: O(Button), sock: O(Sock, 0.72),
  hat: O(Hat, 1.3), shoe: O(Shoe, 1.35), umbrella: O(Umbrella), drum: O(Drum), bell: O(Bell),
  candle: O(Candle, 0.6), match: O(Match, 0.45), flag: O(Flag, 1.0), map: O(Map, 1.25),
  magnifier: O(Magnifier), scale: O(Scale), hourglass: O(Hourglass, 0.72), trophy: O(Trophy),
  crown: O(Crown, 1.25), medal: O(Medal), puzzle: O(Puzzle), dice: O(Dice), balloon: O(Balloon),
  kite: O(Kite), ball: O(Ball), cube: O(Cube), diamond: O(Diamond), ring: O(Ring),
  letter: O(Letter, 1.3), log: O(Log, 1.5), broom: O(Broom, 0.6), bucket: O(Bucket, 0.85), mic: O(Mic, 0.62),
  apple: O(Apple), banana: O(Banana, 1.4), cherry: O(Cherry), grape: O(Grape),
  watermelon: O(Watermelon, 1.5), strawberry: O(Strawberry), orange: O(Orange),
  carrot: O(Carrot, 0.5), egg: O(Egg, 0.8), bread: O(Bread, 1.3), cheese: O(Cheese, 1.35),
  cake: O(Cake), candy: O(Candy), iceCream: O(IceCream, 0.72), cookie: O(Cookie),
  car: O(Car, 1.5), bus: O(Bus, 1.45), train: O(Train, 1.5), boat: O(Boat, 1.4),
  plane: O(Plane, 1.6), rocket: O(Rocket, 0.7), bike: O(Bike, 1.3),
  bridge: O(Bridge, 1.7), castle: O(Castle), tent: O(Tent), fence: O(Fence, 2.4),
  ground: O(Ground, 5.2), water: O(Water, 2.6), cave: O(Cave),
};
