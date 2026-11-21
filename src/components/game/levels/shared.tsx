"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/game/audio";

/* ------------------------------------------------------------------ */
/* Drag helper: pointer based, works for touch + mouse.               */
/* ------------------------------------------------------------------ */
export interface DragState {
  x: number;
  y: number;
  dragging: boolean;
  everMoved: boolean;
}

const IDLE: DragState = { x: 0, y: 0, dragging: false, everMoved: false };

export function useDragMove(onEnd?: (d: DragState, api: { reset: () => void; setPos: (x: number, y: number) => void }) => void) {
  const [state, setState] = useState<DragState>(IDLE);
  const posRef = useRef<DragState>(IDLE);
  const start = useRef({ px: 0, py: 0, bx: 0, by: 0 });
  const cbRef = useRef(onEnd);
  useEffect(() => {
    cbRef.current = onEnd;
  });

  const commit = useCallback(() => setState({ ...posRef.current }), []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      start.current = { px: e.clientX, py: e.clientY, bx: posRef.current.x, by: posRef.current.y };
      posRef.current = { ...posRef.current, dragging: true };
      commit();
    },
    [commit]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!posRef.current.dragging) return;
      posRef.current = {
        ...posRef.current,
        x: start.current.bx + (e.clientX - start.current.px),
        y: start.current.by + (e.clientY - start.current.py),
        everMoved: true,
      };
      commit();
    },
    [commit]
  );

  const reset = useCallback(() => {
    posRef.current = { ...IDLE };
    commit();
  }, [commit]);

  const setPos = useCallback(
    (x: number, y: number) => {
      posRef.current = { ...posRef.current, x, y, everMoved: true };
      commit();
    },
    [commit]
  );

  const onPointerUp = useCallback(() => {
    if (!posRef.current.dragging) return;
    posRef.current = { ...posRef.current, dragging: false };
    commit();
    cbRef.current?.({ ...posRef.current }, { reset, setPos });
  }, [commit, reset, setPos]);

  const bind = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    style: { touchAction: "none" as const },
  };

  return { ...state, bind, reset, setPos };
}

/** true if the center of dragged element ended inside target rect (with padding) */
export function overElement(
  dragRef: React.RefObject<HTMLElement | null>,
  targetRef: React.RefObject<HTMLElement | null>,
  pad = 10
): boolean {
  const a = dragRef.current?.getBoundingClientRect();
  const b = targetRef.current?.getBoundingClientRect();
  if (!a || !b) return false;
  const cx = a.left + a.width / 2;
  const cy = a.top + a.height / 2;
  return cx >= b.left - pad && cx <= b.right + pad && cy >= b.top - pad && cy <= b.bottom + pad;
}

/* ------------------------------------------------------------------ */
/* Shake helper: real devicemotion + desktop fallback button.         */
/* ------------------------------------------------------------------ */
export function useShake(onShake: () => void, enabled: boolean) {
  const [energy, setEnergy] = useState(0);
  const [motionReady, setMotionReady] = useState(false);
  const cbRef = useRef(onShake);
  useEffect(() => {
    cbRef.current = onShake;
  });
  const last = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2);
      if (mag > 18) {
        const now = Date.now();
        if (now - last.current > 250) {
          last.current = now;
          setEnergy((v) => v + 1);
          cbRef.current();
        }
      }
    };
    window.addEventListener("devicemotion", handler);
    return () => window.removeEventListener("devicemotion", handler);
  }, [enabled]);

  /** desktop fallback: button taps count as shakes */
  const nudge = useCallback(() => {
    setEnergy((v) => v + 1);
    cbRef.current();
  }, []);

  /** iOS 13+ permission request, call from a user gesture */
  const requestPermission = useCallback(async () => {
    const DM =
      typeof window !== "undefined"
        ? (window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> } | undefined)
        : undefined;
    try {
      if (DM && typeof DM.requestPermission === "function") {
        const res = await DM.requestPermission();
        setMotionReady(res === "granted");
        return res === "granted";
      }
      setMotionReady(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { energy, nudge, motionReady, requestPermission };
}

/* ------------------------------------------------------------------ */
/* Visual helpers                                                     */
/* ------------------------------------------------------------------ */

/** Wrapper that pulses (hint highlight) when active. */
export function Pulse({
  active,
  children,
  color = "#FFD154",
  className = "",
}: {
  active: boolean;
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {active && (
        <div
          className="pointer-events-none absolute -inset-2 animate-pulse-ring"
          style={{ border: `4px dashed ${color}`, borderRadius: "inherit" }}
        />
      )}
    </div>
  );
}

/** Scene container: rounded play field all levels render inside. */
export function Scene({ children, className = "", bg }: { children: React.ReactNode; className?: string; bg?: string }) {
  return <div className={`relative h-full w-full overflow-hidden select-none ${className}`} style={{ background: bg }}>{children}</div>;
}

export { sfx };
