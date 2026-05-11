'use client';

interface ViolationBannerProps {
  message: string;
  visible: boolean;
}

export default function ViolationBanner({ message, visible }: ViolationBannerProps) {
  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-3 px-4 animate-pulse font-semibold text-sm">
      {message}
    </div>
  );
}
