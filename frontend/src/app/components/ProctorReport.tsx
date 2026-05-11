'use client';

interface Violation {
  timestamp: string;
  eventType: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface ProctorReportProps {
  violations: Violation[] | any[] | null;
}

const severityStyles: Record<string, string> = {
  HIGH: 'text-red-600',
  MEDIUM: 'text-yellow-600',
  LOW: 'text-gray-500',
};

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  } catch {
    return ts;
  }
}

export default function ProctorReport({ violations }: ProctorReportProps) {
  if (!violations || violations.length === 0) {
    return (
      <div className="mt-2 px-4 py-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
        No violations recorded.
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      {violations.map((v: any, idx: number) => {
        const severity: string = v.severity ?? 'LOW';
        const colorClass = severityStyles[severity] ?? 'text-gray-500';
        return (
          <div key={idx} className={`text-sm font-mono ${colorClass}`}>
            [{formatTimestamp(v.timestamp)}] {v.eventType} &mdash; {severity}
          </div>
        );
      })}
    </div>
  );
}
