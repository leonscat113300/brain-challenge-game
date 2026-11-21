# مغزتو به چالش بکش! — Brain Challenge! 🧠

A 2D cartoon brain-puzzle game (Persian + English) with **102 levels**, built with Next.js 16 + TypeScript + Tailwind + framer-motion.

> فکر کن، امتحان کن، ذهنت را به کار بینداز! — Think, Try, Challenge your mind!

## Features

- 102 hand-crafted puzzle levels across multiple worlds (drag, tap, shake, out-of-the-box thinking)
- Star ratings, coins, hearts/lives, hints, skip, video-reward system
- Daily missions, shop, profile, achievements (24 badges)
- WebAudio music + SFX (fully synthesized — no audio files), vibration feedback
- Persian (fa, RTL) + English (en) with instant switching
- Saves progress locally (zustand + localStorage)
- PWA-ready manifest and icons

## Run (web)

```bash
bun install
bun run dev        # http://localhost:3000
```

## Android APK

The full game ships as an offline Android app: the static export of the web app is embedded in the APK assets and served to a WebView through `shouldInterceptRequest()` over a synthetic `https://appassets.local/` origin (so localStorage / WebAudio work normally, 100% offline).

Prebuilt, signed APK: [`download/مغزتو به چالش بکش - Brain Challenge v1.0.apk`](download/) — Android 7.0+ (API 24), portrait, fullscreen immersive.

Build it yourself (needs JDK 21, Android build-tools 34, platform android-34, r8):

```bash
# 1. produce the static export
cp -r src public ... /path/to/build-copy   # see repo layout
NEXT_OUTPUT=export ./node_modules/.bin/next build   # output -> out/

# 2. put out/* into android assets and run the pipeline
cp -r out/* android-assets/
bash android/build-apk.sh
```

`android/` contains the complete wrapper: `AndroidManifest.xml`, `MainActivity.java`, launcher icons, and the aapt2 → javac → d8 → zipalign → apksigner pipeline.

## Repo layout

```
src/app                 Next.js App Router (single route)
src/components/game     Game UI (screens, levels 1-102, modals, overlays)
src/lib/game            Game engine (store, levels, audio, i18n, utils)
public                  Icons, manifest, fonts
android                 Android WebView wrapper + build script
download                Signed APK
```

## License

All rights belong to the game owner (leon).
