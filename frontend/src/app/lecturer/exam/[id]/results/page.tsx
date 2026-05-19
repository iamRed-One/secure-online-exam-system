'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiFetch from '@/app/lib/api';
import ProctorReport from '@/app/components/ProctorReport';
import Sidebar from '@/app/components/Sidebar';
import TopBar from '@/app/components/TopBar';

export default function LecturerResults() {
  const params  = useParams();
  const examId  = params.id as string;

  const [results, setResults]     = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [expanded, setExpanded]   = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch(`/exams/${examId}/results`),
      apiFetch(`/exams/${examId}/questions`),
    ])
      .then(([r, q]) => { setResults(r); setQuestions(q); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="TEACHER" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Results" role="TEACHER" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Loading results…</p>
        </main>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="TEACHER" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Results" role="TEACHER" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-red-500 text-sm">{error}</p>
        </main>
      </div>
    </div>
  );

  // Build a map from question id → question for quick lookup
  const questionMap: Record<string, any> = {};
  questions.forEach(q => { questionMap[q.id] = q; });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="TEACHER" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Results" role="TEACHER" />
        <main className="flex-1 p-8 overflow-auto">

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
                    <th className="px-6 py-3 text-left font-medium tracking-wide">Answers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((result) => {
                    const pct       = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
                    const answers   = result.session_answers || {};
                    const isOpen    = expanded === result.id;
                    const hasManual = questions.some(q => q.type !== 'MCQ');

                    return (
                      <>
                        <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-slate-800 font-medium">
                            {result.student_email}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {result.score} / {result.total}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-slate-600 text-xs font-medium">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {result.flagged ? (
                              <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full">FLAGGED</span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full">OK</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setExpanded(isOpen ? null : result.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              {isOpen ? '▲ Hide' : '▼ View'}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded answer row */}
                        {isOpen && (
                          <tr key={`${result.id}-detail`}>
                            <td colSpan={5} className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                              <div className="space-y-3">

                                {/* Question answers */}
                                {questions.map((q, idx) => {
                                  const studentAnswer = answers[q.id];
                                  const isCorrect = q.type === 'MCQ'
                                    ? studentAnswer?.trim() === q.correctAnswer?.trim()
                                    : null;

                                  return (
                                    <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-4">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                          <p className="text-xs text-slate-400 mb-1">Q{idx + 1} · {q.type} · {q.marks} mark{q.marks !== 1 ? 's' : ''}</p>
                                          <p className="text-sm text-slate-700 font-medium leading-snug">{q.content}</p>
                                        </div>
                                        {q.type === 'MCQ' && isCorrect !== null && (
                                          <span className={`text-sm font-bold flex-shrink-0 ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {isCorrect ? '✓' : '✗'}
                                          </span>
                                        )}
                                      </div>

                                      {q.type === 'MCQ' && (
                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                          <span className="text-slate-500">
                                            Student: <strong className={isCorrect ? 'text-emerald-600' : 'text-red-500'}>
                                              {studentAnswer ?? <em className="font-normal text-slate-400">No answer</em>}
                                            </strong>
                                          </span>
                                          <span className="text-slate-500">
                                            Correct: <strong className="text-emerald-600">{q.correctAnswer}</strong>
                                          </span>
                                        </div>
                                      )}

                                      {(q.type === 'SHORT' || q.type === 'LONG') && (
                                        <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-200">
                                          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide font-medium">Student&apos;s answer</p>
                                          {studentAnswer ? (
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{studentAnswer}</p>
                                          ) : (
                                            <p className="text-sm text-slate-400 italic">No answer provided</p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* Proctor violations */}
                                {result.violations && result.violations.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Violations</p>
                                    <ProctorReport violations={result.violations} />
                                  </div>
                                )}
                              </div>
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
    </div>
  );
}
