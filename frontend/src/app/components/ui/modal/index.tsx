"use client";
import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, children, className,
  showCloseButton = true, isFullscreen = false,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-[99999]">
      {!isFullscreen && (
        <div className="fixed inset-0 bg-gray-400/50 backdrop-blur-sm" onClick={onClose} />
      )}
      <div
        className={`relative w-full rounded-3xl bg-white dark:bg-gray-900 ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-[999] flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M6.04 16.54a.75.75 0 000 1.06.75.75 0 001.06 0L12 13.06l4.54 4.54a.75.75 0 001.06 0 .75.75 0 000-1.06L13.06 12l4.54-4.54a.75.75 0 000-1.06.75.75 0 00-1.06 0L12 10.94 7.1 6a.75.75 0 00-1.06 0 .75.75 0 000 1.06L10.94 12l-4.9 4.54z" fill="currentColor"/></svg>
          </button>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};
