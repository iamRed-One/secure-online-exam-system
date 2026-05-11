'use client';

import { useEffect, useState } from 'react';
import apiFetch from '../lib/api';

interface ServerClockProps {
  examId: string;
}

export default function ServerClock({ examId }: ServerClockProps) {
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    let tickInterval: ReturnType<typeof setInterval>;
    let syncInterval: ReturnType<typeof setInterval>;

    async function fetchTime() {
      try {
        const data = await apiFetch(`/session/time?examId=${examId}`);
        setSeconds(data.seconds ?? 0);
      } catch {
        // silently retain current countdown on sync error
      }
    }

    fetchTime().then(() => {
      tickInterval = setInterval(() => {
        setSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);

      syncInterval = setInterval(() => {
        fetchTime();
      }, 30000);
    });

    return () => {
      clearInterval(tickInterval);
      clearInterval(syncInterval);
    };
  }, [examId]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <span className={`font-mono text-xl font-bold ${seconds < 300 ? 'text-red-600' : 'text-gray-800'}`}>
      {display}
    </span>
  );
}
