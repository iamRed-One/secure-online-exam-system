'use client';

interface ViolationBannerProps {
  message: string;
  visible: boolean;
}

export default function ViolationBanner({ message, visible }: ViolationBannerProps) {
  if (!visible) return null;

  return (
    <div
      style={{ zIndex: 99999 }}
      className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-4 px-4 font-bold text-sm shadow-lg animate-pulse"
    >
      ⚠ {message}
    </div>
  );
}
