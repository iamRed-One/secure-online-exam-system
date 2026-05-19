'use client';

import { useEffect, useState } from 'react';
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
  const router  = useRouter();
  const examId  = params.id;

  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [checking, setChecking]           = useState(true);
  const [starting, setStarting]           = useState(false);
  const [error, setError]                 = useState('');

  useEffect(() => {
    apiFetch(`/session/status?examId=${examId}`)
      .then(data => setSessionStatus(data.status))
      .catch(() => setSessionStatus(null))
      .finally(() => setChecking(false));
  }, [examId]);

  async function handleBeginExam() {
    setStarting(true);
    setError('');
    try {
      await apiFetch('/session/begin', {
        method: 'POST',
        body: JSON.stringify({ examId }),
      }, { loading: 'Starting exam…', success: 'Exam started!', error: 'Failed to begin exam' });
      router.push(`/student/exam/${examId}/session`);
    } catch (err: any) {
      setError(err.message || 'Failed to begin exam.');
      setStarting(false);
    }
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
      <p className="text-slate-400 font-['DM_Sans']">Checking exam status…</p>
    </div>
  );

  // Already completed or flagged
  if (sessionStatus === 'SUBMITTED' || sessionStatus === 'FLAGGED') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 max-w-md w-full p-10 text-center space-y-5">
          <div className="text-5xl">{sessionStatus === 'FLAGGED' ? '🚨' : '✅'}</div>
          <h1 className="text-2xl font-['Plus_Jakarta_Sans'] font-bold text-slate-900 dark:text-white">
            {sessionStatus === 'FLAGGED' ? 'Exam Flagged' : 'Exam Already Completed'}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
            {sessionStatus === 'FLAGGED'
              ? 'Your previous session was flagged for suspicious activity. You cannot retake this exam.'
              : 'You have already submitted this exam. Each exam can only be taken once.'}
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => router.push(`/student/exam/${examId}/result`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              View My Result
            </button>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="w-full border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-medium py-3 rounded-xl transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active session exists — resume
  if (sessionStatus === 'ACTIVE') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 max-w-md w-full p-10 text-center space-y-5">
          <div className="text-5xl">⏱</div>
          <h1 className="text-2xl font-['Plus_Jakarta_Sans'] font-bold text-slate-900 dark:text-white">Exam In Progress</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
            You have an active session for this exam. Resume where you left off.
          </p>
          <button
            onClick={() => router.push(`/student/exam/${examId}/session`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Resume Exam
          </button>
        </div>
      </div>
    );
  }

  // No session yet — show rules and begin button
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 max-w-lg w-full p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-['Plus_Jakarta_Sans'] font-bold text-slate-900 dark:text-white">Before You Begin</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Read all rules carefully before starting.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-amber-800 text-xs uppercase tracking-widest">Exam Rules</h2>
          <ul className="space-y-2.5">
            {EXAM_RULES.map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-amber-900 text-sm leading-relaxed">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleBeginExam}
          disabled={starting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {starting ? 'Starting…' : 'Begin Exam'}
        </button>
      </div>
    </div>
  );
}
