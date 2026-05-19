'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiFetch from '@/app/lib/api';
import ProctorReport from '@/app/components/ProctorReport';
import Sidebar from '@/app/components/Sidebar';

interface ExamResult {
  id: string;
  studentEmail: string;
  score: number;
  total: number;
  flagged: boolean;
  violations: any[] | null;
}

export default function LecturerResults() {
  const params = useParams();
  const examId = params.id as string;

  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/exams/${examId}/results`)
      .then((data) => setResults(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="TEACHER" />
        <main className="flex-1 p-8 overflow-auto flex items-center justify-center">
          <p className="text-slate-400 text-sm">Loading results...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="TEACHER" />
        <main className="flex-1 p-8 overflow-auto flex items-center justify-center">
          <p className="text-red-500 text-sm">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-xl font-bold text-slate-800 font-['Plus_Jakarta_Sans'] mb-6">
          Exam Results
        </h1>

        {results.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <p className="text-slate-400 text-sm">No results yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left font-medium tracking-wide">Student</th>
                  <th className="px-6 py-3 text-left font-medium tracking-wide">Score</th>
                  <th className="px-6 py-3 text-left font-medium tracking-wide">%</th>
                  <th className="px-6 py-3 text-left font-medium tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((result) => {
                  const percentage =
                    result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
                  return (
                    <>
                      <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-800 font-medium">
                          {result.studentEmail}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {result.score} / {result.total}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  percentage >= 70 ? 'bg-emerald-500' :
                                  percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-slate-600 text-xs">{percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {result.flagged ? (
                            <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              FLAGGED
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                      {result.flagged && (
                        <tr key={`${result.id}-report`}>
                          <td colSpan={4} className="px-6 py-3 bg-red-50">
                            <ProctorReport violations={result.violations} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
