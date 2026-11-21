/**
 * Brain Challenge — app icon generator.
 * Builds every icon from the game's own mascot (Brain.tsx wink mood) so the
 * reference artwork stays identical — no random redesign.
 * Outputs Android density buckets + PWA/maskable + favicon + apple touch icon.
 *
 * Run: bun scripts/gen-icons.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PUB = path.resolve(process.cwd(), "public");

/* ---------------------------------------------------------------- */
/* exact mascot paths copied from src/components/game/Brain.tsx     */
/* ---------------------------------------------------------------- */
const BRAIN_WINK = `
  <line x1="88" y1="158" x2="84" y2="180" stroke="#3B2E5A" strokeWidth="7" strokeLinecap="round" />
  <line x1="112" y1="158" x2="116" y2="180" stroke="#3B2E5A" strokeWidth="7" strokeLinecap="round" />
  <ellipse cx="80" cy="183" rx="11" ry="6" fill="#FF9F1C" stroke="#3B2E5A" strokeWidth="4" />
  <ellipse cx="121" cy="183" rx="11" ry="6" fill="#FF9F1C" stroke="#3B2E5A" strokeWidth="4" />
  <path d="M60 118 Q40 112 36 96" stroke="#3B2E5A" strokeWidth="7" fill="none" strokeLinecap="round" />
  <circle cx="34" cy="92" r="9" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" />
  <path d="M140 118 Q160 112 164 96" stroke="#3B2E5A" strokeWidth="7" fill="none" strokeLinecap="round" />
  <circle cx="166" cy="92" r="9" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" />
  <path d="M100 22 C60 22 34 48 34 84 C34 112 52 134 74 142 C86 147 114 147 126 142 C148 134 166 112 166 84 C166 48 140 22 100 22 Z" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="6" />
  <path d="M100 24 C96 40 88 46 78 50" stroke="#E46E86" strokeWidth="7" fill="none" strokeLinecap="round" />
  <path d="M102 26 C106 44 116 50 126 54" stroke="#E46E86" strokeWidth="7" fill="none" strokeLinecap="round" />
  <path d="M44 70 C56 66 62 74 64 82" stroke="#E46E86" strokeWidth="7" fill="none" strokeLinecap="round" />
  <path d="M156 70 C144 66 138 74 136 82" stroke="#E46E86" strokeWidth="7" fill="none" strokeLinecap="round" />
  <path d="M60 108 C68 102 74 106 76 112" stroke="#E46E86" strokeWidth="7" fill="none" strokeLinecap="round" />
  <path d="M140 108 C132 102 126 106 124 112" stroke="#E46E86" strokeWidth="7" fill="none" strokeLinecap="round" />
  <path d="M70 88 Q80 78 90 88" stroke="#3B2E5A" strokeWidth="6" fill="none" strokeLinecap="round" />
  <circle cx="120" cy="88" r="10" fill="#3B2E5A" />
  <circle cx="123" cy="85" r="3" fill="white" />
  <path d="M86 112 Q100 124 114 112" stroke="#3B2E5A" strokeWidth="6" fill="none" strokeLinecap="round" />
  <ellipse cx="64" cy="104" rx="7" ry="4" fill="#FF6B81" opacity="0.5" />
  <ellipse cx="136" cy="104" rx="7" ry="4" fill="#FF6B81" opacity="0.5" />
`;

function sparkle(cx, cy, r, color = "#FFD154", opacity = 0.95) {
  return `<path d="M${cx} ${cy - r} L${cx + r * 0.28} ${cy - r * 0.28} L${cx + r} ${cy} L${cx + r * 0.28} ${cy + r * 0.28} L${cx} ${cy + r} L${cx - r * 0.28} ${cy + r * 0.28} L${cx - r} ${cy} L${cx - r * 0.28} ${cy - r * 0.28} Z" fill="${color}" opacity="${opacity}" stroke="#3B2E5A" stroke-width="${Math.max(2, r * 0.14)}" stroke-linejoin="round"/>`;
}

/** background shared by all variants (doodles mirror the in-game .doodle-bg) */
function bgDefs() {
  return `
  <defs>
    <linearGradient id="bcbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6C4AB6"/>
      <stop offset="1" stop-color="#33205E"/>
    </linearGradient>
  </defs>`;
}

function bgBody() {
  return `
  <circle cx="104" cy="150" r="64" fill="#FFD154" opacity="0.13"/>
  <circle cx="416" cy="104" r="72" fill="#1EC8CF" opacity="0.15"/>
  <circle cx="384" cy="388" r="66" fill="#FF6B81" opacity="0.13"/>
  <circle cx="118" cy="396" r="52" fill="#FAFAFA" opacity="0.09"/>`;
}

/** full "any" icon: rounded square, mascot big + shadow + sparkles */
function iconAny(size) {
  const s = 512;
  const k = 1.92;
  const tx = (s - 200 * k) / 2;
  const ty = 44;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${s} ${s}">
  ${bgDefs()}
  <rect width="${s}" height="${s}" rx="108" fill="url(#bcbg)"/>
  ${bgBody()}
  <ellipse cx="256" cy="${ty + 189 * k + 8}" rx="150" ry="24" fill="#1B1230" opacity="0.30"/>
  <g transform="translate(${tx} ${ty}) scale(${k})">${BRAIN_WINK}</g>
  ${sparkle(408, 176, 20)}
  ${sparkle(116, 236, 14, "#FAFAFA", 0.9)}
  ${sparkle(370, 300, 12, "#1EC8CF", 0.9)}
</svg>`;
}

/** maskable: full-bleed square, mascot inside the 66% safe zone */
function iconMaskable(size) {
  const s = 512;
  const k = 1.3;
  const tx = (s - 200 * k) / 2;
  const ty = (s - 167 * k) / 2 - 22 * k;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${s} ${s}">
  ${bgDefs()}
  <rect width="${s}" height="${s}" fill="url(#bcbg)"/>
  ${bgBody()}
  <ellipse cx="256" cy="${ty + 189 * k + 8}" rx="118" ry="18" fill="#1B1230" opacity="0.30"/>
  <g transform="translate(${tx} ${ty}) scale(${k})">${BRAIN_WINK}</g>
  ${sparkle(400, 190, 17)}
  ${sparkle(128, 250, 12, "#FAFAFA", 0.9)}
</svg>`;
}

/** circular launcher icon (ic_launcher_round) */
function iconRound(size) {
  const s = 512;
  const k = 1.78;
  const tx = (s - 200 * k) / 2;
  const ty = 58;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${s} ${s}">
  ${bgDefs()}
  <circle cx="256" cy="256" r="256" fill="url(#bcbg)"/>
  ${bgBody()}
  <ellipse cx="256" cy="${ty + 189 * k + 8}" rx="144" ry="22" fill="#1B1230" opacity="0.30"/>
  <g transform="translate(${tx} ${ty}) scale(${k})">${BRAIN_WINK}</g>
  ${sparkle(402, 182, 19)}
  ${sparkle(122, 240, 13, "#FAFAFA", 0.9)}
</svg>`;
}

async function render(svg, out, size) {
  const png = await sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png().toBuffer();
  await writeFile(out, png);
  console.log("wrote", path.relative(process.cwd(), out), `${size}x${size}`);
}

async function main() {
  const androidDir = path.join(PUB, "icons", "android");
  await mkdir(androidDir, { recursive: true });

  const any512 = iconAny(512);
  const maskable512 = iconMaskable(512);
  const round512 = iconRound(512);

  /* master SVG keeps the crisp vector source (used as logo.svg) */
  await writeFile(path.join(PUB, "logo.svg"), any512, "utf8");
  console.log("wrote public/logo.svg (vector master)");

  /* web / PWA */
  await render(any512, path.join(PUB, "icon-512.png"), 512);
  await render(any512, path.join(PUB, "icon-192.png"), 192);
  await render(maskable512, path.join(PUB, "icon-maskable-512.png"), 512);
  await render(maskable512, path.join(PUB, "icon-maskable-192.png"), 192);
  await render(maskable512, path.join(PUB, "apple-touch-icon.png"), 180);
  await render(any512, path.join(PUB, "favicon.png"), 48);

  /* android density buckets (ic_launcher + ic_launcher_round) */
  const buckets = [
    ["mdpi", 48],
    ["hdpi", 72],
    ["xhdpi", 96],
    ["xxhdpi", 144],
    ["xxxhdpi", 192],
  ];
  for (const [bucket, size] of buckets) {
    await render(any512, path.join(androidDir, `ic_launcher-${bucket}.png`), size);
    await render(round512, path.join(androidDir, `ic_launcher_round-${bucket}.png`), size);
  }

  /* play-store hi-res (kept in repo for the store listing) */
  await render(any512, path.join(androidDir, "playstore-512.png"), 512);

  console.log("done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
