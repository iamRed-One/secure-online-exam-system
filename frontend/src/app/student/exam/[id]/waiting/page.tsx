'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '../../../../lib/api';

interface WaitingPageProps {
  params: { id: string };
}

const EXAM_RULES = [
  'Do not switch tabs or leave the exam window at any time.',
  'You must remain in fullscreen mode for the entire duration of the exam.',
  'Copy, paste, and cut operations are disabled.',
  'The exam timer is server-side and cannot be paused or manipulated.',
  'Right-clicking is disabled during the exam.',
  'Opening browser DevTools will be flagged as a violation.',
  'Any violation may result in automatic submission or disqualification.',
];

export default function WaitingPage({ params }: WaitingPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBeginExam() {
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/session/begin', {
        method: 'POST',
        body: JSON.stringify({ examId: params.id }),
      });
      router.push(`/student/exam/${params.id}/session`);
    } catch (err: any) {
      setError(err.message || 'Failed to begin exam. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Exam Waiting Room</h1>
          <p className="text-gray-500 text-sm">Please read all rules carefully before beginning.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-amber-800 text-sm uppercase tracking-wide">Exam Rules</h2>
          <ul className="space-y-2">
            {EXAM_RULES.map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-amber-900 text-sm">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleBeginExam}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
        >
          {loading ? 'Starting exam...' : 'Begin Exam'}
        </button>
      </div>
    </div>
  );
}
