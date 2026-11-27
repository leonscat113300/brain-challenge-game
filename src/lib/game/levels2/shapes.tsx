"use client";
import React from "react";
import { OBJ_SHAPES, type ObjProps } from "./shapes-obj";

/* ------------------------------------------------------------------ */
/* Flat-cute core shapes: animals, nature, people parts, decorations.  */
/* Merged with OBJ_SHAPES into the final SHAPES registry.              */
/* ------------------------------------------------------------------ */

const INK = "#3B2E5A";
const st = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const ln = { stroke: INK, strokeWidth: 2.6, fill: "none", strokeLinecap: "round" as const };

const Eye = ({ x, y, r = 3 }: { x: number; y: number; r?: number }) => (
  <>
    <circle cx={x} cy={y} r={r} fill={INK} />
    <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.38} fill="#fff" />
  </>
);
const Smi = ({ y = 40, w = 5, k = 1 }: { y?: number; w?: number; k?: number }) => (
  <path d={`M${32 - w} ${y} Q32 ${y + 5 * k} ${32 + w} ${y}`} stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
);
const Blush = ({ y = 36 }: { y?: number }) => (
  <>
    <ellipse cx={19} cy={y} rx="3.4" ry="2.2" fill="#FF9FB2" opacity="0.75" />
    <ellipse cx={45} cy={y} rx="3.4" ry="2.2" fill="#FF9FB2" opacity="0.75" />
  </>
);
const O = (Comp: React.FC<ObjProps>, ar = 1) => ({ C: Comp, ar });

/* ---------- animals ---------- */

const Cat = ({ c = "#FFB84D" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M16 20 L11 6 L26 14" fill={c} {...st} />
    <path d="M48 20 L53 6 L38 14" fill={c} {...st} />
    <ellipse cx="32" cy="34" rx="21" ry="19" fill={c} {...st} />
    <Eye x={25} y={31} /><Eye x={39} y={31} />
    <path d="M30 37 L34 37 L32 40 Z" fill="#FF6B81" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    <Smi y={42} w={3} />
    <path d="M14 34 H6 M15 39 H8 M50 34 H58 M49 39 H56" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <Blush />
  </svg>
);

const Dog = ({ c = "#C98A4B" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <ellipse cx="16" cy="26" rx="7" ry="13" fill="#8B5E3C" {...st} transform="rotate(-14 16 26)" />
    <ellipse cx="48" cy="26" rx="7" ry="13" fill="#8B5E3C" {...st} transform="rotate(14 48 26)" />
    <ellipse cx="32" cy="34" rx="20" ry="18" fill={c} {...st} />
    <Eye x={25} y={30} /><Eye x={39} y={30} />
    <ellipse cx="32" cy="40" rx="6.4" ry="5" fill="#FAFAFA" stroke={INK} strokeWidth="2.4" />
    <ellipse cx="32" cy="38" rx="2.8" ry="2.2" fill={INK} />
    <Smi y={44} w={3} />
    <Blush />
  </svg>
);

const Rabbit = ({ c = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <ellipse cx="22" cy="14" rx="6" ry="13" fill={c} {...st} transform="rotate(-8 22 14)" />
    <ellipse cx="42" cy="14" rx="6" ry="13" fill={c} {...st} transform="rotate(8 42 14)" />
    <ellipse cx="22" cy="14" rx="3" ry="9" fill="#FFB6C6" transform="rotate(-8 22 14)" />
    <ellipse cx="42" cy="14" rx="3" ry="9" fill="#FFB6C6" transform="rotate(8 42 14)" />
    <ellipse cx="32" cy="38" rx="19" ry="17" fill={c} {...st} />
    <Eye x={25} y={35} /><Eye x={39} y={35} />
    <path d="M30 41 L34 41 L32 44 Z" fill="#FF6B81" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    <Smi y={45} w={3} />
    <Blush y={40} />
  </svg>
);

const Bear = ({ c = "#B97E4B" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="16" cy="16" r="8" fill="#8B5E3C" {...st} />
    <circle cx="48" cy="16" r="8" fill="#8B5E3C" {...st} />
    <circle cx="32" cy="36" rx="20" ry="18" fill={c} {...st} />
    <Eye x={25} y={33} /><Eye x={39} y={33} />
    <ellipse cx="32" cy="41" rx="7" ry="5.4" fill="#FFF3D6" stroke={INK} strokeWidth="2.4" />
    <ellipse cx="32" cy="39" rx="3" ry="2.4" fill={INK} />
    <Smi y={46} w={3} />
    <Blush y={39} />
  </svg>
);

const Mouse = ({ c = "#C9C9D6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="17" cy="17" r="9" fill="#FFB6C6" {...st} />
    <circle cx="43" cy="15" r="9" fill="#FFB6C6" {...st} />
    <ellipse cx="32" cy="38" rx="19" ry="16" fill={c} {...st} />
    <Eye x={26} y={35} /><Eye x={38} y={35} />
    <path d="M30 41 L34 41 L32 44 Z" fill="#FF6B81" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    <Smi y={45} w={3} />
    <path d="M51 40 Q60 38 58 48" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    <Blush y={40} />
  </svg>
);

const Bird = ({ c = "#1EC8CF", c2 }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M18 12 L28 6 L30 16 Z" fill={c} {...st} strokeWidth="2.6" />
    <ellipse cx="33" cy="32" rx="18" ry="16" fill={c} {...st} />
    <path d="M46 30 L58 34 L46 38 Z" fill="#FF8C42" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
    <Eye x={40} y={28} r={3.2} />
    <path d="M26 34 Q18 30 20 40 Q26 44 30 38" fill={c2 ?? "#0E9AA8"} stroke={INK} strokeWidth="2.6" />
    <path d="M28 48 V56 M36 48 V56" stroke="#FF8C42" strokeWidth="3" strokeLinecap="round" />
    <Blush y={34} />
  </svg>
);

const Duck = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="26" cy="20" r="12" fill={c} {...st} />
    <path d="M14 18 L4 22 L14 26 Z" fill="#FF8C42" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
    <Eye x={27} y={18} />
    <ellipse cx="38" cy="40" rx="18" ry="13" fill={c} {...st} />
    <path d="M52 36 Q60 40 52 46" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    <path d="M30 53 V58 M38 53 V58" stroke="#FF8C42" strokeWidth="3" strokeLinecap="round" />
    <Blush y={24} />
  </svg>
);

const Owl = ({ c = "#8B68C4" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <ellipse cx="32" cy="34" rx="20" ry="21" fill={c} {...st} />
    <path d="M14 18 L22 8 L28 18 Z" fill={c} {...st} strokeWidth="2.6" />
    <path d="M50 18 L42 8 L36 18 Z" fill={c} {...st} strokeWidth="2.6" />
    <circle cx="24" cy="28" r="8.4" fill="#FAFAFA" stroke={INK} strokeWidth="2.4" />
    <circle cx="40" cy="28" r="8.4" fill="#FAFAFA" stroke={INK} strokeWidth="2.4" />
    <circle cx="25" cy="29" r="3.6" fill={INK} /><circle cx="39" cy="29" r="3.6" fill={INK} />
    <path d="M29 36 L35 36 L32 42 Z" fill="#FF8C42" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    <path d="M18 44 H26 M38 44 H46 M22 50 H28 M36 50 H42" stroke={INK} strokeWidth="2" opacity="0.4" />
  </svg>
);

const Chicken = ({ c = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M20 12 Q22 6 28 8 Q30 4 34 8 Q40 6 42 12" fill="#FF6B81" stroke={INK} strokeWidth="2.4" />
    <ellipse cx="32" cy="34" rx="19" ry="18" fill={c} {...st} />
    <path d="M44 30 Q56 28 54 40 Q48 44 44 40" fill="#FF6B81" stroke={INK} strokeWidth="2.6" />
    <Eye x={27} y={30} />
    <path d="M28 38 L34 38 L31 43 Z" fill="#FFD154" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    <path d="M28 52 V58 M36 52 V58" stroke="#FF8C42" strokeWidth="3" strokeLinecap="round" />
    <Blush y={36} />
  </svg>
);

const Chick = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="34" r="19" fill={c} {...st} />
    <path d="M20 14 Q26 8 32 12 Q38 6 44 12" fill="#FF8C42" stroke={INK} strokeWidth="2.4" />
    <Eye x={26} y={30} /><Eye x={38} y={30} />
    <path d="M28 36 L36 36 L32 42 Z" fill="#FF8C42" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    <path d="M14 40 Q8 44 12 50 Q18 48 18 42" fill={c} stroke={INK} strokeWidth="2.6" />
    <path d="M26 53 V58 M38 53 V58" stroke="#FF8C42" strokeWidth="3" strokeLinecap="round" />
    <Blush y={38} />
  </svg>
);

const Cow = ({ c = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M12 14 Q8 8 16 8 Q22 8 20 16" fill="#E4E1EE" {...st} strokeWidth="2.6" />
    <path d="M52 14 Q56 8 48 8 Q42 8 44 16" fill="#E4E1EE" {...st} strokeWidth="2.6" />
    <ellipse cx="32" cy="34" rx="21" ry="19" fill={c} {...st} />
    <path d="M44 20 Q52 24 50 34 Q44 38 42 30 Z" fill="#33205E" opacity="0.85" />
    <path d="M14 42 Q20 40 20 48 Q16 52 12 48 Z" fill="#33205E" opacity="0.6" />
    <ellipse cx="32" cy="44" rx="13" ry="9" fill="#FFB6C6" stroke={INK} strokeWidth="2.6" />
    <Eye x={25} y={31} /><Eye x={39} y={31} />
    <circle cx="27" cy="44" r="2" fill={INK} /><circle cx="37" cy="44" r="2" fill={INK} />
  </svg>
);

const Pig = ({ c = "#FFB6C6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M14 16 Q10 6 20 10" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <path d="M50 16 Q54 6 44 10" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="32" cy="36" rx="20" ry="18" fill={c} {...st} />
    <Eye x={25} y={32} /><Eye x={39} y={32} />
    <ellipse cx="32" cy="42" rx="8" ry="6" fill="#FF8FB0" stroke={INK} strokeWidth="2.4" />
    <circle cx="29" cy="42" r="1.8" fill={INK} /><circle cx="35" cy="42" r="1.8" fill={INK} />
    <Blush y={36} />
  </svg>
);

const Sheep = ({ c = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="18" cy="24" r="7" fill="#FAFAFA" {...st} strokeWidth="2.6" />
    <circle cx="28" cy="19" r="7" fill="#FAFAFA" {...st} strokeWidth="2.6" />
    <circle cx="38" cy="18" r="7" fill="#FAFAFA" {...st} strokeWidth="2.6" />
    <circle cx="47" cy="23" r="7" fill="#FAFAFA" {...st} strokeWidth="2.6" />
    <circle cx="16" cy="33" r="7" fill="#FAFAFA" {...st} strokeWidth="2.6" />
    <circle cx="48" cy="33" r="7" fill="#FAFAFA" {...st} strokeWidth="2.6" />
    <circle cx="22" cy="44" r="7" fill="#FAFAFA" {...st} strokeWidth="2.6" />
    <circle cx="32" cy="47" r="7" fill="#FAFAFA" {...st} strokeWidth="2.6" />
    <circle cx="42" cy="44" r="7" fill="#FAFAFA" {...st} strokeWidth="2.6" />
    <ellipse cx="32" cy="34" rx="12" ry="10" fill="#C9C9D6" {...st} />
    <Eye x={28} y={31} /><Eye x={37} y={31} />
    <path d="M30 39 L34 39 L32 42 Z" fill="#FF6B81" stroke={INK} strokeWidth="1.6" />
    <path d="M28 54 V58 M36 54 V58" stroke={INK} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Frog = ({ c = "#4CAF50" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="20" cy="18" r="8" fill={c} {...st} />
    <circle cx="44" cy="18" r="8" fill={c} {...st} />
    <circle cx="20" cy="18" r="4" fill={INK} /><circle cx="44" cy="18" r="4" fill={INK} />
    <circle cx="21" cy="17" r="1.4" fill="#fff" /><circle cx="45" cy="17" r="1.4" fill="#fff" />
    <ellipse cx="32" cy="40" rx="21" ry="16" fill={c} {...st} />
    <path d="M22 40 Q32 48 42 40" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    <Blush y={38} />
  </svg>
);

const Snail = ({ c = "#FF8C42", c2 = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M10 50 Q8 36 22 36 Q34 36 34 50 Z" fill={c} {...st} strokeWidth="2.6" />
    <circle cx="34" cy="30" r="14" fill={c2} {...st} />
    <path d="M34 30 Q34 20 42 22 M34 30 Q28 22 26 28" fill="none" stroke={INK} strokeWidth="2.4" />
    <path d="M12 50 H52" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <path d="M20 24 Q18 16 22 14 M24 26 Q24 16 28 14" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <circle cx="22" cy="13" r="2.4" fill={INK} /><circle cx="28" cy="13" r="2.4" fill={INK} />
  </svg>
);

const Bee = ({ c = "#FFD154", c2 = "#33205E" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <ellipse cx="32" cy="36" rx="16" ry="14" fill={c} {...st} />
    <path d="M22 26 Q16 12 28 14 Q30 22 24 28 M42 26 Q48 12 36 14 Q34 22 40 28" fill="#BFF0F2" stroke={INK} strokeWidth="2.4" opacity="0.9" />
    <path d="M22 30 Q26 28 30 30 M34 30 Q38 28 42 30" stroke={c2} strokeWidth="5" strokeLinecap="round" />
    <path d="M20 40 Q24 38 28 40 M36 40 Q40 38 44 40" stroke={c2} strokeWidth="5" strokeLinecap="round" />
    <Eye x={28} y={22} r={2.4} /><Eye x={36} y={22} r={2.4} />
    <path d="M30 18 Q29 12 32 10 M36 19 Q38 14 40 12" fill="none" stroke={INK} strokeWidth="2" />
  </svg>
);

const Butterfly = ({ c = "#FF6B81", c2 = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M28 34 Q8 16 14 32 Q10 44 28 38" fill={c} {...st} strokeWidth="2.6" />
    <path d="M36 34 Q56 16 50 32 Q54 44 36 38" fill={c} {...st} strokeWidth="2.6" />
    <path d="M28 40 Q12 48 18 54 Q26 56 30 44" fill={c2} {...st} strokeWidth="2.6" />
    <path d="M36 40 Q52 48 46 54 Q38 56 34 44" fill={c2} {...st} strokeWidth="2.6" />
    <ellipse cx="32" cy="36" rx="4.4" ry="10" fill="#6C4AB6" {...st} strokeWidth="2.4" />
    <path d="M30 26 Q26 18 28 14 M34 26 Q38 18 36 14" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Ant = ({ c = "#8B5E3C" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="16" r="7" fill={c} {...st} strokeWidth="2.6" />
    <ellipse cx="32" cy="32" rx="9" ry="8" fill={c} {...st} strokeWidth="2.6" />
    <ellipse cx="32" cy="48" rx="11" ry="9" fill={c} {...st} strokeWidth="2.6" />
    <path d="M27 12 Q22 6 26 4 M37 12 Q42 6 38 4" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <path d="M23 28 L14 22 M41 28 L50 22 M24 48 L12 44 M40 48 L52 44" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    <Eye x={29} y={15} r={2} /><Eye x={35} y={15} r={2} />
  </svg>
);

const Spider = ({ c = "#33205E" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M20 30 Q10 24 8 16 M20 36 Q8 36 6 42 M22 42 Q12 50 14 56 M44 30 Q54 24 56 16 M44 36 Q56 36 58 42 M42 42 Q52 50 50 56" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="32" cy="34" r="13" fill={c} {...st} />
    <circle cx="32" cy="22" r="7" fill={c} {...st} strokeWidth="2.6" />
    <circle cx="29" cy="20" r="2" fill="#fff" /><circle cx="35" cy="20" r="2" fill="#fff" />
  </svg>
);

const Turtle = ({ c = "#4CAF50", c2 = "#2E7D42" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="52" cy="26" r="8" fill="#7BC96F" {...st} strokeWidth="2.6" />
    <Eye x={54} y={24} r={2.2} />
    <ellipse cx="30" cy="36" rx="20" ry="15" fill={c2} {...st} />
    <path d="M18 28 L26 34 L18 42 M42 28 L34 34 L42 42 M30 24 V44" fill="none" stroke={INK} strokeWidth="2" opacity="0.5" />
    <path d="M14 50 V56 M26 52 V58 M40 52 V58 M48 48 V54" stroke="#7BC96F" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const Elephant = ({ c = "#8B8B9E" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="15" cy="20" r="10" fill={c} {...st} strokeWidth="2.6" />
    <circle cx="49" cy="20" r="10" fill={c} {...st} strokeWidth="2.6" />
    <ellipse cx="32" cy="36" rx="21" ry="19" fill={c} {...st} />
    <path d="M28 48 Q26 58 32 60 Q38 60 38 52" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <Eye x={24} y={32} /><Eye x={40} y={32} />
    <path d="M26 44 L34 44 L30 49 Z" fill="#6C6C80" stroke={INK} strokeWidth="1.8" />
    <Blush y={38} />
  </svg>
);

const Lion = ({ c = "#FFB84D", c2 = "#E8A81C" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="32" r="24" fill={c2} {...st} strokeWidth="2.6" />
    <circle cx="32" cy="34" rx="16" ry="15" fill={c} {...st} />
    <Eye x={26} y={31} /><Eye x={38} y={31} />
    <path d="M30 39 L34 39 L32 42 Z" fill="#8B5E3C" stroke={INK} strokeWidth="1.6" />
    <Smi y={44} w={4} />
    <Blush y={38} />
  </svg>
);

const Monkey = ({ c = "#B97E4B" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="17" cy="17" r="9" fill={c} {...st} strokeWidth="2.6" />
    <circle cx="47" cy="17" r="9" fill={c} {...st} strokeWidth="2.6" />
    <circle cx="17" cy="17" r="4" fill="#FFB6C6" />
    <circle cx="47" cy="17" r="4" fill="#FFB6C6" />
    <ellipse cx="32" cy="36" rx="20" ry="18" fill={c} {...st} />
    <path d="M20 40 Q32 32 44 40 Q44 48 32 48 Q20 48 20 40 Z" fill="#FFF3D6" stroke={INK} strokeWidth="2.4" />
    <Eye x={25} y={31} /><Eye x={39} y={31} />
    <path d="M28 40 L36 40 L32 45 Z" fill={INK} />
    <path d="M27 43 Q32 47 37 43" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const Fish = ({ c = "#1EC8CF", c2 = "#0E9AA8" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M44 32 L58 22 L58 42 Z" fill={c2} {...st} strokeWidth="2.6" />
    <ellipse cx="30" cy="32" rx="20" ry="14" fill={c} {...st} />
    <path d="M28 18 Q32 10 38 16" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    <circle cx="20" cy="28" r="3.2" fill={INK} />
    <circle cx="21" cy="27" r="1.2" fill="#fff" />
    <path d="M12 32 Q16 34 20 32" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    <path d="M34 24 Q38 30 34 38" fill="none" stroke={INK} strokeWidth="2" opacity="0.4" />
    <Blush y={34} />
  </svg>
);

const Penguin = ({ c = "#33205E" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <ellipse cx="32" cy="34" rx="19" ry="22" fill={c} {...st} />
    <ellipse cx="32" cy="40" rx="12" ry="14" fill="#FAFAFA" />
    <Eye x={26} y={24} /><Eye x={38} y={24} />
    <path d="M28 28 L36 28 L32 34 Z" fill="#FF8C42" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    <path d="M24 54 V58 M40 54 V58" stroke="#FF8C42" strokeWidth="3.4" strokeLinecap="round" />
    <path d="M13 30 Q8 36 14 40" fill={c} stroke={INK} strokeWidth="2.6" />
  </svg>
);

const Snake = ({ c = "#4CAF50", c2 = "#2E7D42" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M8 50 Q16 38 26 46 Q36 54 44 42 Q50 34 44 26" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
    <path d="M8 50 Q16 38 26 46 Q36 54 44 42 Q50 34 44 26" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" />
    <circle cx="44" cy="22" r="8" fill={c} {...st} strokeWidth="2.6" />
    <circle cx="42" cy="20" r="1.8" fill={INK} />
    <path d="M50 24 L58 26 L50 28" fill={c2} stroke={INK} strokeWidth="1.6" />
    <path d="M36 26 Q38 30 36 32" fill="none" stroke={INK} strokeWidth="1.6" opacity="0.5" />
  </svg>
);

const Fox = ({ c = "#FF8C42" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M14 18 L10 4 L26 12 Z" fill={c} {...st} strokeWidth="2.6" />
    <path d="M50 18 L54 4 L38 12 Z" fill={c} {...st} strokeWidth="2.6" />
    <ellipse cx="32" cy="34" rx="20" ry="17" fill={c} {...st} />
    <path d="M32 34 Q20 34 20 44 Q26 52 32 48 Q38 52 44 44 Q44 34 32 34 Z" fill="#FAFAFA" />
    <Eye x={25} y={31} /><Eye x={39} y={31} />
    <path d="M29 42 L35 42 L32 47 Z" fill={INK} />
    <Blush y={36} />
  </svg>
);

const Whale = ({ c = "#6C4AB6", c2 = "#8B68C4" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M42 30 Q52 22 56 30 Q58 38 48 36" fill={c2} {...st} strokeWidth="2.6" />
    <ellipse cx="30" cy="34" rx="22" ry="15" fill={c} {...st} />
    <path d="M30 22 Q30 12 36 14" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    <circle cx="16" cy="30" r="3" fill={INK} />
    <circle cx="17" cy="29" r="1.1" fill="#fff" />
    <path d="M10 38 Q16 42 24 40" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M12 50 Q16 48 20 50" stroke="#BFF0F2" strokeWidth="2.6" fill="none" strokeLinecap="round" />
  </svg>
);

/* ---------- people & parts ---------- */

const Kid = ({ c = "#FFB84D", c2 = "#6C4AB6" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="20" r="13" fill={c} {...st} />
    <path d="M19 18 Q20 6 32 6 Q44 6 45 18 Q40 12 32 12 Q24 12 19 18 Z" fill={c2} {...st} strokeWidth="2.6" />
    <Eye x={27} y={19} /><Eye x={37} y={19} />
    <Smi y={25} w={4} k={0.8} />
    <path d="M22 36 Q32 30 42 36 L44 58 H20 Z" fill={c2} {...st} />
    <circle cx="16" cy="42" r="5" fill={c} {...st} strokeWidth="2.4" />
    <circle cx="48" cy="42" r="5" fill={c} {...st} strokeWidth="2.4" />
    <Blush y={23} />
  </svg>
);

const Hand = ({ c = "#FFB84D" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M18 58 V30 M18 30 Q18 24 22 26 V14 Q22 8 26 10 V26 M30 26 V8 Q30 4 34 6 V26 M38 26 V10 Q38 6 42 8 V28 M46 30 Q50 26 50 32 V44 Q50 56 40 58 H24 Q18 58 18 52" fill={c} stroke={INK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M22 26 V14 M26 26 V12 M34 26 V8 M42 28 V12" stroke={INK} strokeWidth="1.4" opacity="0.35" />
  </svg>
);

const pawToes = (n: number) => {
  const pos = n === 3 ? [[23, 20], [32, 15], [41, 20]] : n === 4 ? [[20, 22], [28, 16], [37, 17], [45, 23]] : [[18, 24], [25, 17], [32, 14], [39, 17], [46, 24]];
  return pos.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={n === 5 ? 4.6 : 4} fill="#8B5E3C" stroke={INK} strokeWidth="2" />);
};

const PawBase = ({ toes, c }: { toes: number; c?: string }) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    {pawToes(toes)}
    <ellipse cx="32" cy="40" rx="17" ry="14" fill={c ?? "#8B5E3C"} stroke={INK} strokeWidth="3" />
    <path d="M24 38 Q32 34 40 38" stroke="#FAFAFA" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
  </svg>
);
const Paw3 = ({ c }: ObjProps) => <PawBase toes={3} c={c} />;
const Paw4 = ({ c }: ObjProps) => <PawBase toes={4} c={c} />;
const Paw5 = ({ c }: ObjProps) => <PawBase toes={5} c={c} />;
const Paw = Paw5;

const EyeBall = ({ c = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <ellipse cx="32" cy="32" rx="24" ry="16" fill={c} {...st} />
    <circle cx="32" cy="32" r="9" fill="#1EC8CF" stroke={INK} strokeWidth="2.6" />
    <circle cx="32" cy="32" r="4" fill={INK} />
    <circle cx="34" cy="30" r="1.6" fill="#fff" />
  </svg>
);

const HeartShape = ({ c = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 54 Q8 38 8 24 Q8 10 20 10 Q28 10 32 18 Q36 10 44 10 Q56 10 56 24 Q56 38 32 54 Z" fill={c} {...st} />
    <path d="M18 20 Q16 26 20 30" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const Brain = ({ c = "#FFB6C6", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M28 8 Q16 8 14 20 Q6 24 8 34 Q10 44 20 46 Q22 56 32 56 Q42 56 44 46 Q54 44 56 34 Q58 24 50 20 Q48 8 36 8 Q32 6 28 8 Z" fill={c} {...st} />
    <path d="M32 8 V56 M20 18 Q26 22 24 30 Q22 38 28 42 M44 18 Q38 22 40 30 Q42 38 36 42 M14 30 H22 M42 30 H50" fill="none" stroke={c2} strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

/* ---------- nature ---------- */

const Tree = ({ c = "#4CAF50", c2 = "#8B5E3C" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="28" y="36" width="8" height="24" rx="3" fill={c2} {...st} />
    <circle cx="24" cy="22" r="14" fill={c} {...st} />
    <circle cx="40" cy="22" r="14" fill={c} {...st} />
    <circle cx="32" cy="14" r="13" fill={c} {...st} />
    <path d="M22 20 Q26 14 32 16" stroke="#2E7D42" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </svg>
);

const Bush = ({ c = "#5DBB63" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="20" cy="36" r="13" fill={c} {...st} />
    <circle cx="42" cy="36" r="13" fill={c} {...st} />
    <circle cx="32" cy="26" r="14" fill={c} {...st} />
    <path d="M24 32 Q28 28 34 30" stroke="#2E7D42" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </svg>
);

const Flower = ({ c = "#FF6B81", c2 = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 34 V58" stroke="#4CAF50" strokeWidth="3.4" strokeLinecap="round" />
    <path d="M32 46 Q22 42 20 50 Q28 52 32 46 M32 50 Q42 46 44 54 Q36 56 32 50" fill="#5DBB63" stroke={INK} strokeWidth="2" />
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <ellipse key={a} cx={32 + 10 * Math.cos((a * Math.PI) / 180)} cy={22 + 10 * Math.sin((a * Math.PI) / 180)} rx="7" ry="6" fill={c} stroke={INK} strokeWidth="2.4" />
    ))}
    <circle cx="32" cy="22" r="6.4" fill={c2} stroke={INK} strokeWidth="2.4" />
  </svg>
);

const Tulip = ({ c = "#FF6B81", c2 = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 30 V58" stroke="#4CAF50" strokeWidth="3.4" strokeLinecap="round" />
    <path d="M32 44 Q22 40 20 48 Q28 50 32 44" fill="#5DBB63" stroke={INK} strokeWidth="2" />
    <path d="M20 12 Q20 26 26 30 Q32 34 38 30 Q44 26 44 12 Q40 16 36 12 Q32 16 28 12 Q24 16 20 12 Z" fill={c2 ?? c} {...st} />
  </svg>
);

const Leaf = ({ c = "#5DBB63" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 56 Q8 40 14 20 Q20 6 34 10 Q52 14 50 34 Q48 52 32 56 Z" fill={c} {...st} />
    <path d="M32 52 Q30 36 32 16 M32 34 Q22 30 18 24 M32 40 Q42 36 46 30" fill="none" stroke="#2E7D42" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M30 54 L34 58" stroke="#8B5E3C" strokeWidth="3.4" strokeLinecap="round" />
  </svg>
);

const Mushroom = ({ c = "#FF6B81", c2 = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M10 32 Q10 10 32 10 Q54 10 54 32 Q42 38 32 38 Q22 38 10 32 Z" fill={c} {...st} />
    <rect x="24" y="36" width="16" height="22" rx="6" fill={c2} {...st} />
    <circle cx="22" cy="22" r="4" fill="#FAFAFA" opacity="0.85" />
    <circle cx="38" cy="18" r="3" fill="#FAFAFA" opacity="0.85" />
    <circle cx="44" cy="26" r="3.4" fill="#FAFAFA" opacity="0.85" />
  </svg>
);

const Cactus = ({ c = "#5DBB63" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M24 56 V20 Q24 8 32 8 Q40 8 40 20 V56" fill={c} {...st} />
    <path d="M24 36 H16 Q10 36 10 28 M40 30 H48 Q54 30 54 22" fill="none" stroke={c} strokeWidth="8" strokeLinecap="round" />
    <path d="M24 36 H16 Q10 36 10 28 M40 30 H48 Q54 30 54 22" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M28 18 L28 22 M36 14 L36 18" stroke={INK} strokeWidth="1.6" />
    <rect x="16" y="54" width="32" height="6" rx="3" fill="#FF8C42" stroke={INK} strokeWidth="2.6" />
  </svg>
);

const Sun = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i * 45 * Math.PI) / 180;
      return <path key={i} d={`M${32 + 24 * Math.cos(a)} ${32 + 24 * Math.sin(a)} L${32 + 30 * Math.cos(a)} ${32 + 30 * Math.sin(a)}`} stroke="#E8A81C" strokeWidth="4" strokeLinecap="round" />;
    })}
    <circle cx="32" cy="32" r="17" fill={c} {...st} />
    <Eye x={26} y={29} /><Eye x={38} y={29} />
    <Smi y={36} w={4} k={0.8} />
  </svg>
);

const Moon = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M40 8 Q22 12 22 32 Q22 52 40 56 Q20 56 12 40 Q6 24 16 14 Q26 4 40 8 Z" fill={c} {...st} />
    <circle cx="26" cy="24" r="3" fill="#E8A81C" opacity="0.7" />
    <circle cx="22" cy="38" r="4" fill="#E8A81C" opacity="0.5" />
    <path d="M48 14 L50 20 L56 22 L50 24 L48 30 L46 24 L40 22 L46 20 Z" fill="#FAFAFA" stroke={INK} strokeWidth="1.6" />
  </svg>
);

const Star = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 6 L39 24 L58 26 L44 39 L48 57 L32 47 L16 57 L20 39 L6 26 L25 24 Z" fill={c} {...st} />
    <Eye x={27} y={30} r={2.6} /><Eye x={37} y={30} r={2.6} />
    <Smi y={36} w={3.4} k={0.8} />
  </svg>
);

const Cloud = ({ c = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M14 44 Q4 44 6 34 Q8 26 16 26 Q18 14 30 14 Q42 14 44 26 Q54 26 56 34 Q58 44 48 44 Z" fill={c} {...st} />
    <Eye x={26} y={33} r={2.6} /><Eye x={38} y={33} r={2.6} />
    <Smi y={38} w={3.4} k={0.7} />
  </svg>
);

const Raindrop = ({ c = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 6 Q46 24 46 38 Q46 54 32 54 Q18 54 18 38 Q18 24 32 6 Z" fill={c} {...st} />
    <ellipse cx="26" cy="30" rx="3.4" ry="6" fill="#fff" opacity="0.55" />
    <path d="M24 44 Q32 48 40 44" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <Eye x={27} y={36} r={2.4} /><Eye x={37} y={36} r={2.4} />
  </svg>
);

const Rainbow = ({ c = "#FF6B81" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M6 56 A26 26 0 0 1 58 56" fill="none" stroke={c} strokeWidth="6" />
    <path d="M12 56 A20 20 0 0 1 52 56" fill="none" stroke="#FFD154" strokeWidth="6" />
    <path d="M18 56 A14 14 0 0 1 46 56" fill="none" stroke="#5DBB63" strokeWidth="6" />
    <path d="M24 56 A8 8 0 0 1 40 56" fill="none" stroke="#1EC8CF" strokeWidth="6" />
    <path d="M4 58 H60" stroke={INK} strokeWidth="2.4" strokeLinecap="round" opacity="0.4" />
  </svg>
);

const Mountain = ({ c = "#8B8B9E" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M4 56 L26 14 L38 36 L46 24 L60 56 Z" fill={c} {...st} />
    <path d="M22 20 L26 14 L30 20 L26 26 Z M42 30 L46 24 L50 30 L46 34 Z" fill="#FAFAFA" stroke={INK} strokeWidth="2" />
  </svg>
);

const Hill = ({ c = "#7BC96F" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M2 56 Q20 16 34 30 Q46 40 62 34 V56 Z" fill={c} {...st} />
    <path d="M14 42 Q20 38 26 42 M36 46 Q42 42 48 46" stroke="#4CAF50" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </svg>
);

const Wave = ({ c = "#1EC8CF" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M2 32 Q10 22 18 32 Q26 42 34 32 Q42 22 50 32 Q56 40 62 34 V52 Q54 46 46 52 Q38 58 30 52 Q22 46 14 52 Q6 58 2 52 Z" fill={c} {...st} />
    <path d="M14 26 Q18 20 24 24" stroke="#FAFAFA" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.8" />
  </svg>
);

const Fire = ({ c = "#FF8C42", c2 = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 4 Q44 16 40 28 Q50 24 52 36 Q54 50 40 56 Q48 46 40 40 Q34 52 24 50 Q10 44 14 32 Q18 22 26 20 Q20 12 32 4 Z" fill={c} {...st} />
    <path d="M32 30 Q36 38 32 46 Q28 52 34 56 Q42 52 40 44 Q38 36 32 30 Z" fill={c2} />
    <path d="M22 30 Q20 36 24 40" fill="none" stroke="#FFD154" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

const Lightning = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M34 4 L18 32 H30 L24 58 L46 24 H32 Z" fill={c} {...st} />
  </svg>
);

const Snowflake = ({ c = "#BFF0F2" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    {[0, 60, 120].map((a) => (
      <path key={a} d={`M32 6 V58 M12 17 L52 47 M52 17 L12 47`} stroke={c} strokeWidth="4" strokeLinecap="round" transform={`rotate(${a} 32 32)`} />
    ))}
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <circle key={a} cx={32 + 22 * Math.cos((a * Math.PI) / 180)} cy={32 + 22 * Math.sin((a * Math.PI) / 180)} r="3" fill={c} stroke={INK} strokeWidth="1.6" />
    ))}
    <circle cx="32" cy="32" r="4" fill="#fff" stroke={INK} strokeWidth="1.6" />
  </svg>
);

/* ---------- decorations & utility ---------- */

const Sign = ({ c = "#B97E0A" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="8" y="14" width="48" height="30" rx="5" fill={c} {...st} />
    <path d="M32 44 V58" {...ln} strokeWidth="4" />
    <path d="M16 24 H44 M16 32 H36" stroke="#FAFAFA" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
  </svg>
);

const Sparkle = ({ c = "#FFD154" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 4 L37 26 L58 32 L37 38 L32 60 L27 38 L6 32 L27 26 Z" fill={c} {...st} strokeWidth="2.6" />
    <path d="M46 10 L48 16 L54 18 L48 20 L46 26 L44 20 L38 18 L44 16 Z" fill="#fff" opacity="0.9" />
  </svg>
);

const Blob = ({ c = "#BFF0F2" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M32 8 Q48 8 52 22 Q58 34 50 44 Q44 56 32 56 Q20 56 14 44 Q6 34 12 22 Q16 8 32 8 Z" fill={c} {...st} />
    <Eye x={26} y={30} /><Eye x={38} y={30} />
    <Smi y={38} w={4} />
    <Blush y={35} />
  </svg>
);

const Speech = ({ c = "#FAFAFA" }: ObjProps) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <path d="M10 12 H54 Q58 12 58 16 V38 Q58 42 54 42 H30 L18 54 V42 H10 Q6 42 6 38 V16 Q6 12 10 12 Z" fill={c} {...st} />
    <circle cx="22" cy="27" r="3" fill={INK} />
    <circle cx="32" cy="27" r="3" fill={INK} />
    <circle cx="42" cy="27" r="3" fill={INK} />
  </svg>
);

export const CORE_SHAPES = {
  cat: O(Cat), dog: O(Dog), rabbit: O(Rabbit), bear: O(Bear), mouse: O(Mouse),
  bird: O(Bird), duck: O(Duck), owl: O(Owl), chicken: O(Chicken), chick: O(Chick),
  cow: O(Cow), pig: O(Pig), sheep: O(Sheep), frog: O(Frog), snail: O(Snail),
  bee: O(Bee), butterfly: O(Butterfly), ant: O(Ant), spider: O(Spider), turtle: O(Turtle),
  elephant: O(Elephant), lion: O(Lion), monkey: O(Monkey), fish: O(Fish), penguin: O(Penguin),
  snake: O(Snake), fox: O(Fox), whale: O(Whale),
  kid: O(Kid), hand: O(Hand), paw: O(Paw), paw3: O(Paw3), paw4: O(Paw4), paw5: O(Paw5),
  eyeball: O(EyeBall), heart: O(HeartShape), brain: O(Brain),
  tree: O(Tree), bush: O(Bush), flower: O(Flower), tulip: O(Tulip), leaf: O(Leaf),
  mushroom: O(Mushroom), cactus: O(Cactus), sun: O(Sun), moon: O(Moon), star: O(Star),
  cloud: O(Cloud), raindrop: O(Raindrop), rainbow: O(Rainbow, 1.7), mountain: O(Mountain),
  hill: O(Hill, 1.9), wave: O(Wave, 2.1), fire: O(Fire), lightning: O(Lightning),
  snowflake: O(Snowflake),
  sign: O(Sign, 1.3), sparkle: O(Sparkle), blob: O(Blob), speech: O(Speech, 1.25),
};

export type ShapeName = keyof typeof CORE_SHAPES | keyof typeof OBJ_SHAPES;
export const SHAPE_NAMES = Object.keys({ ...CORE_SHAPES, ...OBJ_SHAPES }) as ShapeName[];

export const SHAPES: Record<ShapeName, { C: React.FC<ObjProps>; ar: number }> = {
  ...CORE_SHAPES,
  ...OBJ_SHAPES,
};

export function Shape({ name, c, c2 }: { name: ShapeName; c?: string; c2?: string }) {
  const entry = SHAPES[name];
  if (!entry) return <div className="h-full w-full rounded-full bg-[#E4E1EE]" />;
  const Cmp = entry.C;
  return <Cmp c={c} c2={c2} />;
}

export function shapeAspect(name: ShapeName): number {
  return SHAPES[name]?.ar ?? 1;
}
