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
      });
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
      <ViolationBanner message={bannerMsg} visible={bannerVisible} />

      {/* Flagged overlay — shown when session is terminated */}
      {flagged && (
        <div style={{ zIndex: 999999 }} className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-10 max-w-md text-center space-y-4 shadow-2xl">
            <div className="text-5xl">🚨</div>
            <h2 className="text-2xl font-bold text-red-700">Session Flagged</h2>
            <p className="text-gray-700">
              Too many suspicious activities were detected during your exam.
              Your session has been flagged and submitted for review.
            </p>
            <p className="text-sm text-gray-400">Redirecting to results in 5 seconds…</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header */}
        <header className={`bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm ${bannerVisible ? 'mt-12' : ''}`}>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Exam in Progress</h1>
            {total > 0 && (
              <p className="text-xs text-gray-400">Question {questionIndex} of {total}</p>
            )}
          </div>
          <ServerClock examId={examId} />
        </header>

        {/* Question area */}
        <main className="flex-1 flex items-start justify-center p-6">
          <div className="bg-white rounded-2xl shadow-md max-w-2xl w-full p-8 space-y-6">
            <QuestionRenderer question={question} onAnswer={setAnswer} />

            {/* Navigation buttons */}
            {!question?.done && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePrev}
                  disabled={isFirst || saving}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  ← Previous
                </button>

                {!isLast ? (
                  <button
                    onClick={handleNext}
                    disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition"
                  >
                    {saving ? 'Saving…' : 'Save & Next →'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition"
                  >
                    {saving ? 'Saving…' : 'Save →'}
                  </button>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition"
            >
              {submitting ? 'Submitting…' : 'Submit Exam'}
            </button>

            {/* Progress dots */}
            {total > 0 && (
              <div className="flex justify-center gap-1.5 pt-2">
                {Array.from({ length: total }).map((_, i) => (
                  <button
                    key={i}
                    onClick={async () => { await saveCurrentAnswer(); setIndex(i + 1); fetchQuestion(i + 1); }}
                    className={`w-2.5 h-2.5 rounded-full transition ${
                      i + 1 === questionIndex ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ExamLockdown>
  );
}
