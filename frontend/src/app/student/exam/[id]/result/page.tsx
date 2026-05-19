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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 font-['DM_Sans']">Loading result…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">No result found.</p>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.total) * 100);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-lg w-full space-y-8">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-['Plus_Jakarta_Sans'] font-bold text-slate-900">Exam Result</h1>
          <p className="text-sm text-slate-400 mt-1">Your performance summary</p>
        </div>

        {/* Score circles */}
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full border-8 border-blue-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">{result.score}/{result.total}</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Score</p>
          </div>
          <div className="text-center">
            <div className="w-32 h-32 rounded-full border-8 border-blue-400 flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-600">{percentage}%</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Percentage</p>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex justify-center">
          {result.flagged ? (
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-1.5 rounded-full">
              ⚠ Flagged for Review
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full">
              ✓ Result Confirmed
            </span>
          )}
        </div>

        {/* Breakdown table */}
        <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-5 py-3 text-slate-500 font-medium">Score</td>
                <td className="px-5 py-3 text-slate-800 font-semibold text-right">{result.score}/{result.total}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-5 py-3 text-slate-500 font-medium">Status</td>
                <td className="px-5 py-3 text-slate-800 font-semibold text-right">
                  {result.flagged ? 'Flagged' : 'Submitted'}
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-slate-500 font-medium">Percentage</td>
                <td className="px-5 py-3 text-blue-600 font-bold text-right">{percentage}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {result.flagged && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center leading-relaxed">
            Your exam has been flagged for review. Your lecturer will confirm your grade.
          </p>
        )}

        {/* Back button */}
        <button
          onClick={() => router.push('/student/dashboard')}
          className="w-full border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold py-3 rounded-xl transition-all"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
