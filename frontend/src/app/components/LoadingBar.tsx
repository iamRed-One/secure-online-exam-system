'use client';
import { useEffect, useState } from 'react';
import { subscribeToLoading } from '../lib/api';

export default function LoadingBar() {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible]   = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    const unsub = subscribeToLoading((isLoading) => {
      if (isLoading) {
        clearTimeout(hideTimer);
        setLoading(true);
        setVisible(true);
      } else {
        setLoading(false);
        // keep bar visible briefly so it can animate to 100% before fading
        hideTimer = setTimeout(() => setVisible(false), 600);
      }
    });

    return () => {
      unsub();
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100000] h-0.5 overflow-hidden"
      aria-hidden
    >
      <div
        className={`h-full bg-blue-500 transition-all duration-300 ${
          loading
            ? 'animate-loading-bar'
            : 'w-full opacity-0 transition-opacity duration-500'
        }`}
        style={loading ? undefined : { width: '100%' }}
      />
    </div>
  );
}
