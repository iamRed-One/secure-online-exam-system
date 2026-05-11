'use client';

import { useEffect, useRef } from 'react';
import apiFetch from '../lib/api';

interface ExamLockdownProps {
  examId: string;
  onViolation: (type: string) => void;
  children: React.ReactNode;
}

export default function ExamLockdown({ examId, onViolation, children }: ExamLockdownProps) {
  const devtoolsFlagged = useRef(false);

  useEffect(() => {
    // 1. Request fullscreen
    document.documentElement.requestFullscreen?.().catch(() => {
      // ignore if user denies
    });

    async function reportViolation(type: string) {
      onViolation(type);
      try {
        await apiFetch('/proctor/event', {
          method: 'POST',
          body: JSON.stringify({ examId, type }),
        });
      } catch {
        // best-effort — don't crash on network error
      }
    }

    // 2. Tab switch
    function handleVisibilityChange() {
      if (document.hidden) {
        reportViolation('TAB_SWITCH');
      }
    }

    // 3. Fullscreen exit
    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        reportViolation('FULLSCREEN_EXIT');
      }
    }

    // 4. Clipboard events
    function handleClipboard(e: ClipboardEvent) {
      e.preventDefault();
      reportViolation('CLIPBOARD');
    }

    // 5. Context menu
    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
      reportViolation('RIGHT_CLICK');
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleClipboard);
    document.addEventListener('paste', handleClipboard);
    document.addEventListener('cut', handleClipboard);
    document.addEventListener('contextmenu', handleContextMenu);

    // 6. DevTools detection
    const devtoolsInterval = setInterval(() => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if ((widthDiff > 160 || heightDiff > 160) && !devtoolsFlagged.current) {
        devtoolsFlagged.current = true;
        reportViolation('DEVTOOLS');
      } else if (widthDiff <= 160 && heightDiff <= 160) {
        devtoolsFlagged.current = false;
      }
    }, 2000);

    // 7. Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleClipboard);
      document.removeEventListener('paste', handleClipboard);
      document.removeEventListener('cut', handleClipboard);
      document.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(devtoolsInterval);
    };
  }, [examId, onViolation]);

  return <>{children}</>;
}
