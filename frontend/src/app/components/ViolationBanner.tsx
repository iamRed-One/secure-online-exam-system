'use client';

interface ViolationBannerProps {
  message: string;
  visible: boolean;
  onClose?: () => void;
}

export default function ViolationBanner({ message, visible, onClose }: ViolationBannerProps) {
  if (!visible) return null;

  return (
    <div
      style={{ zIndex: 99999 }}
      className="fixed top-0 left-0 right-0 bg-red-600 text-white py-3 px-4 font-bold text-sm shadow-lg flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-2">
        <span className="text-base">⚠</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-500 transition-colors text-white font-bold text-base leading-none"
        >
          ✕
        </button>
      )}
    </div>
  );
}
