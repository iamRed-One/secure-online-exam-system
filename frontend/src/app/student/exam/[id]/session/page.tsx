'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '../../../../lib/api';
import ExamLockdown from '../../../../components/ExamLockdown';
import ViolationBanner from '../../../../components/ViolationBanner';
import ServerClock from '../../../../components/ServerClock';
import QuestionRenderer from '../../../../components/QuestionRenderer';

interface SessionPageProps {
  params: { id: string };
}

interface SessionQuestion {
  done?: boolean;
  index?: number;
  total?: number;
  marks?: number;
  type?: string;
  content?: string;
  options?: string[];
  savedAnswer?: string;
}

export default function SessionPage({ params }: SessionPageProps) {
  const router  = useRouter();
  const examId  = params.id;

  const [question, setQuestion]       = useState<SessionQuestion | null>(null);
  const [currentAnswer, setAnswer]    = useState('');
  const [questionIndex, setIndex]     = useState(1);
  const [total, setTotal]             = useState(0);
  const [bannerMsg, setBannerMsg]     = useState('');
  const [bannerVisible, setBanner]    = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [saving, setSaving]           = useState(false);
  const [flagged, setFlagged]         = useState(false);

  async function fetchQuestion(index: number) {
    try {
      const data = await apiFetch(`/session/question?examId=${examId}&index=${index}`);
      setQuestion(data);
      setAnswer(data.savedAnswer || '');
      if (data.total) setTotal(data.total);
    } catch (err) {
      showBanner((err instanceof Error && err.message) || 'Failed to load question.');
    }
  }

  useEffect(() => { fetchQuestion(1); }, [examId]);

  function showBanner(msg: string) {
    setBannerMsg(msg);
    setBanner(true);
    setTimeout(() => setBanner(false), 4000);
  }

  const handleFlagged = useCallback(() => {
    setFlagged(true);
    // Give student 5 seconds to read the message then redirect to result
    setTimeout(() => router.push(`/student/exam/${examId}/result`), 5000);
  }, [examId, router]);

  const handleViolation = useCallback((type: string) => {
    const labels: Record<string, string> = {
      TAB_SWITCH:      '⚠ Violation: Tab switching detected!',
      FULLSCREEN_EXIT: '⚠ Violation: Fullscreen exited!',
      CLIPBOARD:       '⚠ Violation: Copy/paste blocked!',
      RIGHT_CLICK:     '⚠ Violation: Right-click not allowed!',
      DEVTOOLS:        '⚠ Violation: Developer tools detected!',
    };
    showBanner(labels[type] ?? `⚠ Violation: ${type}`);
  }, []);

  async function saveCurrentAnswer() {
    if (!currentAnswer) return;
    setSaving(true);
    try {
      await apiFetch('/session/answer', {
        method: 'POST',
        body: JSON.stringify({ examId, questionIndex, answer: currentAnswer }),
      });
    } catch (err) {
      showBanner((err instanceof Error && err.message) || 'Failed to save answer.');
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    await saveCurrentAnswer();
    const next = questionIndex + 1;
    setIndex(next);
    fetchQuestion(next);
  }

  async function handlePrev() {
    await saveCurrentAnswer();
    const prev = questionIndex - 1;
    setIndex(prev);
    fetchQuestion(prev);
  }

  async function handleSubmit() {
    if (!window.confirm('Submit your exam? This cannot be undone.')) return;
    await saveCurrentAnswer();
    setSubmitting(true);
    try {
      await apiFetch('/session/submit', {
        method: 'POST',
        body: JSON.stringify({ examId }),
      }, { loading: 'Submitting exam…', success: 'Exam submitted!', error: 'Submission failed' });
      router.push(`/student/exam/${examId}/result`);
    } catch (err) {
      showBanner((err instanceof Error && err.message) || 'Failed to submit.');
      setSubmitting(false);
    }
  }

  const isFirst = questionIndex <= 1;

  return (
    <ExamLockdown examId={examId} onViolation={handleViolation} onFlagged={handleFlagged}>
      <ViolationBanner message={bannerMsg} visible={bannerVisible} onClose={() => setBanner(false)} />

      {/* Flagged overlay — shown when session is terminated */}
      {flagged && (
        <div style={{ zIndex: 999999 }} className="fixed inset-0 bg-black/80 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-10 w-full max-w-md text-center space-y-3 shadow-2xl">
            <div className="text-4xl sm:text-5xl">🚨</div>
            <h2 className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-400">Session Flagged</h2>
            <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed">
              Too many suspicious activities were detected during your exam.
              Your session has been flagged and submitted for review.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-gray-500">Redirecting to results in 5 seconds…</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col">
        {/* Header bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">S</div>
            <span className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm hidden sm:block">Secure Exam Portal</span>
          </div>

          {/* Timer — centered */}
          <span className="text-xl sm:text-2xl font-mono font-bold text-red-500 tracking-widest">
            <ServerClock examId={examId} />
          </span>

          {/* Question counter */}
          <div className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 flex-shrink-0">
            {total > 0 && <span><span className="hidden sm:inline">Question </span>{questionIndex}<span className="text-slate-300 dark:text-gray-600">/</span>{total}</span>}
          </div>
        </header>

        {/* Question area */}
        <main className="flex-1 flex items-start justify-center p-3 sm:p-6 sm:pt-8">
          <div className="max-w-2xl w-full space-y-3 sm:space-y-4">
            {/* Question card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-8 shadow-sm border border-slate-100 dark:border-gray-700 space-y-5">
              <QuestionRenderer question={question} currentAnswer={currentAnswer} onAnswer={setAnswer} />

              {/* Navigation row */}
              {!question?.done && (
                <div className="pt-4 border-t border-slate-100 dark:border-gray-700 space-y-3">

                  {/* Progress indicator */}
                  {total > 0 && (
                    <div className="flex items-center justify-center gap-1.5 overflow-hidden">
                      {total <= 20 ? (
                        /* Dot style for small exams */
                        Array.from({ length: total }).map((_, i) => (
                          <button
                            key={i}
                            onClick={async () => { await saveCurrentAnswer(); setIndex(i + 1); fetchQuestion(i + 1); }}
                            className={`rounded-full transition-all flex-shrink-0 ${
                              i + 1 === questionIndex
                                ? 'w-2.5 h-2.5 bg-blue-600'
                                : 'w-2 h-2 bg-slate-200 dark:bg-gray-600 hover:bg-slate-300'
                            }`}
                          />
                        ))
                      ) : (
                        /* Windowed dots for large exams — shows 7 dots around current */
                        <>
                          {questionIndex > 4 && <span className="text-xs text-slate-400 dark:text-gray-500 flex-shrink-0">1</span>}
                          {questionIndex > 4 && <span className="text-xs text-slate-300 dark:text-gray-600 flex-shrink-0">…</span>}
                          {Array.from({ length: total }, (_, i) => i + 1)
                            .filter(n => Math.abs(n - questionIndex) <= 3)
                            .map(n => (
                              <button
                                key={n}
                                onClick={async () => { await saveCurrentAnswer(); setIndex(n); fetchQuestion(n); }}
                                className={`rounded-full transition-all flex-shrink-0 ${
                                  n === questionIndex
                                    ? 'w-2.5 h-2.5 bg-blue-600'
                                    : 'w-2 h-2 bg-slate-200 dark:bg-gray-600 hover:bg-slate-300'
                                }`}
                              />
                            ))}
                          {questionIndex < total - 3 && <span className="text-xs text-slate-300 dark:text-gray-600 flex-shrink-0">…</span>}
                          {questionIndex < total - 3 && <span className="text-xs text-slate-400 dark:text-gray-500 flex-shrink-0">{total}</span>}
                        </>
                      )}
                    </div>
                  )}

                  {/* Back / Next buttons */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={handlePrev}
                      disabled={isFirst || saving}
                      className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-gray-700 disabled:opacity-40 transition"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      {saving ? 'Saving…' : 'Next →'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm text-sm sm:text-base"
            >
              {submitting ? 'Submitting…' : 'Submit Exam'}
            </button>
          </div>
        </main>
      </div>
    </ExamLockdown>
  );
}
