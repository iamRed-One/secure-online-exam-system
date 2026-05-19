'use client';

import { useEffect, useRef } from 'react';
import apiFetch from '../lib/api';

interface ExamLockdownProps {
  examId: string;
  onViolation: (type: string) => void;
  onFlagged: () => void;
  children: React.ReactNode;
}

export default function ExamLockdown({ examId, onViolation, onFlagged, children }: ExamLockdownProps) {
  const devtoolsFlagged = useRef(false);

  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});

    async function reportViolation(type: string) {
      onViolation(type);
      try {
        const res = await apiFetch('/proctor/event', {
          method: 'POST',
          body: JSON.stringify({ examId, type }),
        });
        if (res.flagged) onFlagged();
      } catch {
        // best-effort
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) reportViolation('TAB_SWITCH');
    }

    function handleFullscreenChange() {
      if (!document.fullscreenElement) reportViolation('FULLSCREEN_EXIT');
    }

    function handleClipboard(e: ClipboardEvent) {
      e.preventDefault();
      reportViolation('CLIPBOARD');
    }

    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
      reportViolation('RIGHT_CLICK');
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy',        handleClipboard);
    document.addEventListener('paste',       handleClipboard);
    document.addEventListener('cut',         handleClipboard);
    document.addEventListener('contextmenu', handleContextMenu);

    const devtoolsInterval = setInterval(() => {
      const widthDiff  = window.outerWidth  - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if ((widthDiff > 160 || heightDiff > 160) && !devtoolsFlagged.current) {
        devtoolsFlagged.current = true;
        reportViolation('DEVTOOLS');
      } else if (widthDiff <= 160 && heightDiff <= 160) {
        devtoolsFlagged.current = false;
      }
    }, 2000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy',        handleClipboard);
      document.removeEventListener('paste',       handleClipboard);
      document.removeEventListener('cut',         handleClipboard);
      document.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(devtoolsInterval);
    };
  }, [examId, onViolation, onFlagged]);

  return <>{children}</>;
}
