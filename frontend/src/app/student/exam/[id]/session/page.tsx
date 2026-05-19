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

export default function SessionPage({ params }: SessionPageProps) {
  const router  = useRouter();
  const examId  = params.id;

  const [question, setQuestion]       = useState<any>(null);
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
    } catch (err: any) {
      showBanner(err.message || 'Failed to load question.');
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
    } catch (err: any) {
      showBanner(err.message || 'Failed to save answer.');
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
    } catch (err: any) {
      showBanner(err.message || 'Failed to submit.');
      setSubmitting(false);
    }
  }

  const isFirst = questionIndex <= 1;
  const isLast  = questionIndex >= total;

  return (
    <ExamLockdown examId={examId} onViolation={handleViolation} onFlagged={handleFlagged}>
      <ViolationBanner message={bannerMsg} visible={bannerVisible} onClose={() => setBanner(false)} />

      {/* Flagged overlay — shown when session is terminated */}
      {flagged && (
        <div style={{ zIndex: 999999 }} className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-10 max-w-md text-center space-y-4 shadow-2xl">
            <div className="text-5xl">🚨</div>
            <h2 className="text-2xl font-['Plus_Jakarta_Sans'] font-bold text-red-700">Session Flagged</h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              Too many suspicious activities were detected during your exam.
              Your session has been flagged and submitted for review.
            </p>
            <p className="text-sm text-slate-400">Redirecting to results in 5 seconds…</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-semibold text-slate-800 text-sm hidden sm:block">Secure Exam Portal</span>
          </div>

          {/* Timer — centered */}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-mono font-bold text-red-500 tracking-widest">
              <ServerClock examId={examId} />
            </span>
          </div>

          {/* Question counter */}
          <div className="text-sm text-slate-500">
            {total > 0 && `Question ${questionIndex} of ${total}`}
          </div>
        </header>

        {/* Question area */}
        <main className="flex-1 flex items-start justify-center p-6 pt-8">
          <div className="max-w-2xl w-full space-y-4">
            {/* Question card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-6">
              <QuestionRenderer question={question} onAnswer={setAnswer} />

              {/* Navigation row */}
              {!question?.done && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={handlePrev}
                    disabled={isFirst || saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 transition"
                  >
                    ← Back
                  </button>

                  {/* Progress dots centered */}
                  {total > 0 && (
                    <div className="flex gap-1.5">
                      {Array.from({ length: total }).map((_, i) => (
                        <button
                          key={i}
                          onClick={async () => { await saveCurrentAnswer(); setIndex(i + 1); fetchQuestion(i + 1); }}
                          className={`w-2 h-2 rounded-full transition ${
                            i + 1 === questionIndex ? 'bg-blue-600 scale-125' : 'bg-slate-200 hover:bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleNext}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {saving ? 'Saving…' : 'Next →'}
                  </button>
                </div>
              )}
            </div>

            {/* Submit button — below the card */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-['Plus_Jakarta_Sans'] font-semibold py-3 rounded-xl transition-colors shadow-sm"
            >
              {submitting ? 'Submitting…' : 'Submit Exam'}
            </button>
          </div>
        </main>
      </div>
    </ExamLockdown>
  );
}
