'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiFetch from '@/app/lib/api';

interface Result {
  score: number;
  total: number;
  flagged: boolean;
}

export default function StudentResult() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/session/result?examId=${params.id}`)
      .then((data) => setResult(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <p className="text-slate-400 font-['DM_Sans']">Loading result…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <p className="text-slate-500">No result found.</p>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.total) * 100);
  const circumference = 314;
  const scoreDash = (result.score / result.total) * circumference;
  const percentageDash = (percentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header card */}
        <div className="bg-blue-600 text-white rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-['Outfit']">Score</h1>
            <p className="text-blue-200 text-sm mt-1">
              {result.score} / {result.total} — {result.flagged ? 'Under review' : 'Confirmed result.'}
            </p>
          </div>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 self-start sm:self-auto flex-shrink-0"
          >
            ← Dashboard
          </button>
        </div>

        {/* Main content card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">

            {/* LEFT COLUMN — SVG rings */}
            <div className="flex gap-4 sm:gap-6 items-center justify-center sm:justify-start">

              {/* Ring 1 — Score */}
              <div className="flex flex-col items-center">
                <svg viewBox="0 0 120 120" className="w-24 h-24 sm:w-32 sm:h-32">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="10"
                    strokeDasharray={`${scoreDash} ${circumference}`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                  <text x="60" y="55" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">
                    {result.score}/{result.total}
                  </text>
                  <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="11">
                    Score
                  </text>
                </svg>
              </div>

              {/* Ring 2 — Percentage */}
              <div className="flex flex-col items-center">
                <svg viewBox="0 0 120 120" className="w-24 h-24 sm:w-32 sm:h-32">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="10"
                    strokeDasharray={`${percentageDash} ${circumference}`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                  <text x="60" y="55" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">
                    {percentage}%
                  </text>
                  <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="11">
                    Percentage
                  </text>
                </svg>
              </div>
            </div>

            {/* RIGHT COLUMN — Status + Breakdown */}
            <div className="flex-1">

              {/* Status card */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">Status</p>
                {result.flagged ? (
                  <span className="inline-flex items-center bg-amber-100 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full">
                    Flagged
                  </span>
                ) : (
                  <span className="inline-flex items-center bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full">
                    Result Confirmed
                  </span>
                )}
              </div>

              {/* Breakdown card */}
              <div className="bg-slate-50 dark:bg-gray-900 rounded-xl p-4 mt-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3">Breakdown</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-gray-400">Score</span>
                    <span className="text-slate-800 dark:text-white/90 font-medium">{result.score} / {result.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-gray-400">Percentage</span>
                    <span className="text-slate-800 dark:text-white/90 font-medium">{percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-gray-400">Total</span>
                    <span className="text-slate-800 dark:text-white/90 font-medium">{result.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-gray-400">Status</span>
                    <span className="text-slate-800 dark:text-white/90 font-medium">
                      {result.flagged ? 'Flagged' : 'Submitted'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={() => router.push('/student/dashboard')}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition"
          >
            ← Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
