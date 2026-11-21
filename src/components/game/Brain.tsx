import React from "react";

type Mood = "happy" | "wink" | "wow" | "sad";

/** Cute cartoon brain mascot, hand-drawn SVG. */
export function Brain({ mood = "happy", className = "", style }: { mood?: Mood; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} role="img" aria-label="Brain mascot">
      {/* legs */}
      <line x1="88" y1="158" x2="84" y2="180" stroke="#3B2E5A" strokeWidth="7" strokeLinecap="round" />
      <line x1="112" y1="158" x2="116" y2="180" stroke="#3B2E5A" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="80" cy="183" rx="11" ry="6" fill="#FF9F1C" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="121" cy="183" rx="11" ry="6" fill="#FF9F1C" stroke="#3B2E5A" strokeWidth="4" />
      {/* arms */}
      <path d="M60 118 Q40 112 36 96" stroke="#3B2E5A" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="34" cy="92" r="9" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M140 118 Q160 112 164 96" stroke="#3B2E5A" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="166" cy="92" r="9" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" />
      {/* brain body */}
      <path
        d="M100 22 C60 22 34 48 34 84 C34 112 52 134 74 142 C86 147 114 147 126 142 C148 134 166 112 166 84 C166 48 140 22 100 22 Z"
        fill="#FF9FB2"
        stroke="#3B2E5A"
        strokeWidth="6"
      />
      {/* brain folds */}
      <path d="M100 24 C96 40 88 46 78 50" stroke="#E46E86" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M102 26 C106 44 116 50 126 54" stroke="#E46E86" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M44 70 C56 66 62 74 64 82" stroke="#E46E86" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M156 70 C144 66 138 74 136 82" stroke="#E46E86" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M60 108 C68 102 74 106 76 112" stroke="#E46E86" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M140 108 C132 102 126 106 124 112" stroke="#E46E86" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* face */}
      {mood === "sad" ? (
        <>
          <circle cx="80" cy="88" r="10" fill="#3B2E5A" />
          <circle cx="120" cy="88" r="10" fill="#3B2E5A" />
          <path d="M84 118 Q100 106 116 118" stroke="#3B2E5A" strokeWidth="6" fill="none" strokeLinecap="round" />
        </>
      ) : mood === "wow" ? (
        <>
          <circle cx="80" cy="88" r="11" fill="white" stroke="#3B2E5A" strokeWidth="4" />
          <circle cx="82" cy="90" r="5" fill="#3B2E5A" />
          <circle cx="120" cy="88" r="11" fill="white" stroke="#3B2E5A" strokeWidth="4" />
          <circle cx="118" cy="90" r="5" fill="#3B2E5A" />
          <ellipse cx="100" cy="116" rx="9" ry="11" fill="#3B2E5A" />
        </>
      ) : mood === "wink" ? (
        <>
          <path d="M70 88 Q80 78 90 88" stroke="#3B2E5A" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="120" cy="88" r="10" fill="#3B2E5A" />
          <circle cx="123" cy="85" r="3" fill="white" />
          <path d="M86 112 Q100 124 114 112" stroke="#3B2E5A" strokeWidth="6" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="80" cy="88" r="11" fill="white" stroke="#3B2E5A" strokeWidth="4" />
          <circle cx="83" cy="90" r="5.5" fill="#3B2E5A" />
          <circle cx="85" cy="87" r="2" fill="white" />
          <circle cx="120" cy="88" r="11" fill="white" stroke="#3B2E5A" strokeWidth="4" />
          <circle cx="117" cy="90" r="5.5" fill="#3B2E5A" />
          <circle cx="115" cy="87" r="2" fill="white" />
          <path d="M84 110 Q100 126 116 110" stroke="#3B2E5A" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M92 120 Q100 127 108 120" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
        </>
      )}
      {/* blush */}
      <ellipse cx="64" cy="104" rx="7" ry="4" fill="#FF6B81" opacity="0.5" />
      <ellipse cx="136" cy="104" rx="7" ry="4" fill="#FF6B81" opacity="0.5" />
    </svg>
  );
}
