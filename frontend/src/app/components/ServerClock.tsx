'use client';

import { useEffect, useRef, useState } from 'react';
import apiFetch from '../lib/api';

interface ServerClockProps {
  examId: string;
}

export default function ServerClock({ examId }: ServerClockProps) {
  const [seconds, setSeconds] = useState<number | null>(null);
  // Absolute deadline in ms — recomputed on each sync
  const deadlineRef = useRef<number | null>(null);

  useEffect(() => {
    let tickInterval: ReturnType<typeof setInterval>;
    let syncInterval: ReturnType<typeof setInterval>;

    async function syncTime() {
      try {
        const t0 = Date.now();
        const data = await apiFetch(`/session/time?examId=${examId}`);
        const t1 = Date.now();
        // Compensate for half the round-trip so the deadline is accurate
        const latencyMs = (t1 - t0) / 2;
        const remaining = (data.remainingSeconds ?? 0) * 1000;
        deadlineRef.current = t1 + remaining - latencyMs;
      } catch {
        // Keep existing deadline on network error — tick continues unaffected
      }
    }

    function tick() {
      if (deadlineRef.current === null) return;
      const remaining = Math.max(0, Math.floor((deadlineRef.current - Date.now()) / 1000));
      setSeconds(remaining);
    }

    syncTime().then(() => {
      // First tick immediately so the display isn't blank
      tick();
      tickInterval = setInterval(tick, 500); // 500ms so it never visually skips a second
      syncInterval = setInterval(syncTime, 30_000);
    });

    return () => {
      clearInterval(tickInterval);
      clearInterval(syncInterval);
    };
  }, [examId]);

  if (seconds === null) return <span className="font-mono font-bold text-red-500">--:--</span>;

  const minutes = Math.floor(seconds / 60);
  const secs    = seconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const urgent  = seconds < 300; // last 5 minutes

  return (
    <span className={`font-mono font-bold ${urgent ? 'text-red-600 animate-pulse' : 'text-red-500'}`}>
      {display}
    </span>
  );
}
