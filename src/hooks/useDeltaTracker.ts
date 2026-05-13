import { useEffect, useRef, useState } from "react";

/**
 * Tracks per-key numeric deltas across updates within a session.
 * Baselines are persisted in sessionStorage so values survive route changes / reloads.
 *
 * Returns:
 *   getDelta(key, current) -> number (current - baseline) or 0 if baseline equals current.
 *   getRecent(key) -> { value: number; ts: number } | undefined  (most recent change)
 */
export interface DeltaInfo {
  total: number;
  recent?: { value: number; ts: number };
}

const RECENT_TTL = 2500; // ms a "+N" / "-N" flash stays visible

export function useDeltaTracker(prefix: string, items: Array<{ key: string | number; value: number }>) {
  const baselinesRef = useRef<Map<string, number>>(new Map());
  const lastValuesRef = useRef<Map<string, number>>(new Map());
  const recentRef = useRef<Map<string, { value: number; ts: number }>>(new Map());
  const [, setTick] = useState(0);

  // hydrate baselines once per prefix
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`delta_base_${prefix}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        const m = new Map<string, number>();
        Object.entries(parsed).forEach(([k, v]) => m.set(k, v));
        baselinesRef.current = m;
      }
    } catch {
      /* ignore */
    }
  }, [prefix]);

  // process incoming items
  useEffect(() => {
    if (!items?.length) return;
    let changed = false;
    const now = Date.now();
    for (const it of items) {
      const k = String(it.key);
      const v = Number(it.value) || 0;
      if (!baselinesRef.current.has(k)) {
        baselinesRef.current.set(k, v);
        changed = true;
      }
      const prev = lastValuesRef.current.get(k);
      if (prev !== undefined && prev !== v) {
        recentRef.current.set(k, { value: v - prev, ts: now });
        changed = true;
      }
      lastValuesRef.current.set(k, v);
    }
    if (changed) {
      try {
        const obj: Record<string, number> = {};
        baselinesRef.current.forEach((v, k) => { obj[k] = v; });
        sessionStorage.setItem(`delta_base_${prefix}`, JSON.stringify(obj));
      } catch { /* ignore */ }
      setTick((t) => t + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // periodic tick to expire recent flashes
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      let any = false;
      recentRef.current.forEach((r, k) => {
        if (now - r.ts > RECENT_TTL) {
          recentRef.current.delete(k);
          any = true;
        }
      });
      if (any) setTick((t) => t + 1);
    }, 700);
    return () => clearInterval(id);
  }, []);

  const getDelta = (key: string | number, current: number): DeltaInfo => {
    const k = String(key);
    const base = baselinesRef.current.get(k);
    const total = base != null ? current - base : 0;
    return { total, recent: recentRef.current.get(k) };
  };

  const resetBaseline = (key?: string | number) => {
    if (key == null) {
      baselinesRef.current = new Map(lastValuesRef.current);
    } else {
      const k = String(key);
      const cur = lastValuesRef.current.get(k);
      if (cur != null) baselinesRef.current.set(k, cur);
    }
    try {
      const obj: Record<string, number> = {};
      baselinesRef.current.forEach((v, k) => { obj[k] = v; });
      sessionStorage.setItem(`delta_base_${prefix}`, JSON.stringify(obj));
    } catch { /* ignore */ }
    setTick((t) => t + 1);
  };

  return { getDelta, resetBaseline };
}
