'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiFetch from '@/app/lib/api';
import ProctorReport from '@/app/components/ProctorReport';
import DashboardLayout from '@/app/layout/DashboardLayout';

export default function LecturerResults() {
  const params  = useParams();
  const examId  = params.id as string;

  const [results, setResults]           = useState<any[]>([]);
  const [questions, setQuestions]       = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [expanded, setExpanded]         = useState<string | null>(null);
  // manualInputs[sessionId][questionId] = score string being edited
  const [manualInputs, setManualInputs] = useState<Record<string, Record<string, string>>>({});
  const [savingKey, setSavingKey]       = useState<string | null>(null); // `${sessionId}-${questionId}`

  async function fetchAll() {
    try {
      const [r, q] = await Promise.all([
        apiFetch(`/exams/${examId}/results`),
        apiFetch(`/exams/${examId}/questions`),
      ]);
      setResults(r);
      setQuestions(q);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, [examId]);

  async function handleSaveManualScore(sessionId: string, questionId: string, score: string) {
    const key = `${sessionId}-${questionId}`;
    setSavingKey(key);
    try {
      await apiFetch(`/exams/${examId}/results/${sessionId}/manual-score`, {
        method: 'PATCH',
        body: JSON.stringify({ questionId, score: Number(score) }),
      }, { loading: 'Saving score…', success: 'Score saved!', error: 'Failed to save score' });
      await fetchAll();
    } catch {
      // toast already shown by apiFetch
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) return (
    <DashboardLayout role="TEACHER">
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400 text-sm">Loading results…</p>
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout role="TEACHER">
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    </DashboardLayout>
  );

  // Build a map from question id → question for quick lookup
  const questionMap: Record<string, any> = {};
  questions.forEach(q => { questionMap[q.id] = q; });

  return (
    <DashboardLayout role="TEACHER">

          {results.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-12 text-center">
              <p className="text-slate-400 dark:text-gray-500 text-sm">No results yet.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-gray-900 text-slate-500 dark:text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium tracking-wide">Student</th>
                    <th className="px-6 py-3 text-left font-medium tracking-wide">Score</th>
                    <th className="px-6 py-3 text-left font-medium tracking-wide">%</th>
                    <th className="px-6 py-3 text-left font-medium tracking-wide">Status</th>
                    <th className="px-6 py-3 text-left font-medium tracking-wide">Answers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                  {results.map((result) => {
                    const pct       = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
                    const answers   = result.session_answers || {};
                    const isOpen    = expanded === result.id;
                    const hasManual = questions.some(q => q.type !== 'MCQ');

                    return (
                      <>
                        <tr key={result.id} className="hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 text-slate-800 dark:text-white/90 font-medium">
                            {result.student_email}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-gray-400">
                            {result.score} / {result.total}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-slate-600 dark:text-gray-400 text-xs font-medium">{pct}%</span>
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
                            <td colSpan={5} className="px-6 py-4 bg-slate-50 dark:bg-gray-900 border-b border-slate-100 dark:border-gray-700">
                              <div className="space-y-3">

                                {/* Question answers */}
                                {questions.map((q, idx) => {
                                  const studentAnswer = answers[q.id];
                                  const isCorrect = q.type === 'MCQ'
                                    ? studentAnswer?.trim() === q.correctAnswer?.trim()
                                    : null;

                                  return (
                                    <div key={q.id} className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-4">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                          <p className="text-xs text-slate-400 dark:text-gray-500 mb-1">Q{idx + 1} · {q.type} · {q.marks} mark{q.marks !== 1 ? 's' : ''}</p>
                                          <p className="text-sm text-slate-700 dark:text-gray-300 font-medium leading-snug">{q.content}</p>
                                        </div>
                                        {q.type === 'MCQ' && isCorrect !== null && (
                                          <span className={`text-sm font-bold flex-shrink-0 ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {isCorrect ? '✓' : '✗'}
                                          </span>
                                        )}
                                      </div>

                                      {q.type === 'MCQ' && (
                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                          <span className="text-slate-500 dark:text-gray-400">
                                            Student: <strong className={isCorrect ? 'text-emerald-600' : 'text-red-500'}>
                                              {studentAnswer ?? <em className="font-normal text-slate-400">No answer</em>}
                                            </strong>
                                          </span>
                                          <span className="text-slate-500">
                                            Correct: <strong className="text-emerald-600">{q.correctAnswer}</strong>
                                          </span>
                                        </div>
                                      )}

                                      {q.type === 'SHORT' && (
                                        <div className="mt-3 bg-slate-50 dark:bg-gray-900 rounded-lg p-3 border border-slate-200 dark:border-gray-700">
                                          <p className="text-xs text-slate-400 dark:text-gray-500 mb-1 uppercase tracking-wide font-medium">Student&apos;s answer</p>
                                          {studentAnswer ? (
                                            <p className="text-sm text-slate-700 dark:text-gray-300 whitespace-pre-wrap">{studentAnswer}</p>
                                          ) : (
                                            <p className="text-sm text-slate-400 dark:text-gray-500 italic">No answer provided</p>
                                          )}
                                        </div>
                                      )}

                                      {q.type === 'LONG' && (() => {
                                        const sessionId = result.session_id;
                                        const savedScore = result.manual_scores?.[q.id];
                                        const inputVal = manualInputs[sessionId]?.[q.id] ?? (savedScore !== undefined ? String(savedScore) : '');
                                        const saveKey = `${sessionId}-${q.id}`;
                                        return (
                                          <div className="mt-3 space-y-2">
                                            <div className="bg-slate-50 dark:bg-gray-900 rounded-lg p-3 border border-slate-200 dark:border-gray-700">
                                              <p className="text-xs text-slate-400 dark:text-gray-500 mb-1 uppercase tracking-wide font-medium">Student&apos;s answer</p>
                                              {studentAnswer ? (
                                                <p className="text-sm text-slate-700 dark:text-gray-300 whitespace-pre-wrap">{studentAnswer}</p>
                                              ) : (
                                                <p className="text-sm text-slate-400 dark:text-gray-500 italic">No answer provided</p>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs text-slate-500 dark:text-gray-400 flex-shrink-0">Award marks:</span>
                                              <input
                                                type="number"
                                                min={0}
                                                max={q.marks}
                                                value={inputVal}
                                                placeholder={`0–${q.marks}`}
                                                onChange={e => setManualInputs(prev => ({
                                                  ...prev,
                                                  [sessionId]: { ...prev[sessionId], [q.id]: e.target.value },
                                                }))}
                                                className="w-20 border border-slate-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm text-slate-800 dark:text-white/90 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              />
                                              <span className="text-xs text-slate-400 dark:text-gray-500">/ {q.marks}</span>
                                              <button
                                                disabled={savingKey === saveKey || inputVal === ''}
                                                onClick={() => handleSaveManualScore(sessionId, q.id, inputVal)}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                                              >
                                                {savingKey === saveKey ? 'Saving…' : 'Save'}
                                              </button>
                                              {savedScore !== undefined && (
                                                <span className="text-xs text-emerald-600 font-medium">✓ {savedScore}/{q.marks} saved</span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  );
                                })}

                                {/* Proctor violations */}
                                {result.violations && result.violations.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-2">Violations</p>
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
    </DashboardLayout>
  );
}
