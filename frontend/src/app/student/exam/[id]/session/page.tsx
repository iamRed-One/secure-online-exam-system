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
  const router = useRouter();
  const examId = params.id;

  const [question, setQuestion] = useState<any>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [questionIndex, setQuestionIndex] = useState<number>(1);
  const [bannerMsg, setBannerMsg] = useState<string>('');
  const [bannerVisible, setBannerVisible] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);

  async function fetchQuestion() {
    try {
      const data = await apiFetch(`/session/question?examId=${examId}`);
      setQuestion(data);
      setCurrentAnswer('');
    } catch (err: any) {
      setBannerMsg(err.message || 'Failed to load question.');
      setBannerVisible(true);
    }
  }

  useEffect(() => {
    fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const handleViolation = useCallback((type: string) => {
    const labels: Record<string, string> = {
      TAB_SWITCH: 'Violation: Tab switching detected!',
      FULLSCREEN_EXIT: 'Violation: Fullscreen mode exited!',
      CLIPBOARD: 'Violation: Clipboard operation blocked!',
      RIGHT_CLICK: 'Violation: Right-click is not allowed!',
      DEVTOOLS: 'Violation: Developer tools detected!',
    };
    setBannerMsg(labels[type] ?? `Violation: ${type}`);
    setBannerVisible(true);
    setTimeout(() => setBannerVisible(false), 4000);
  }, []);

  async function handleSaveAndNext() {
    try {
      await apiFetch('/session/answer', {
        method: 'POST',
        body: JSON.stringify({ examId, questionIndex, answer: currentAnswer }),
      });
      setQuestionIndex((prev) => prev + 1);
      await fetchQuestion();
    } catch (err: any) {
      setBannerMsg(err.message || 'Failed to save answer.');
      setBannerVisible(true);
      setTimeout(() => setBannerVisible(false), 4000);
    }
  }

  async function handleSubmit() {
    const confirmed = window.confirm('Are you sure you want to submit the exam? This action cannot be undone.');
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const result = await apiFetch('/session/submit', {
        method: 'POST',
        body: JSON.stringify({ examId }),
      });
      router.push(result?.redirect ?? `/student/exam/${examId}/result`);
    } catch (err: any) {
      setBannerMsg(err.message || 'Failed to submit exam.');
      setBannerVisible(true);
      setTimeout(() => setBannerVisible(false), 4000);
      setSubmitting(false);
    }
  }

  return (
    <ExamLockdown examId={examId} onViolation={handleViolation}>
      <ViolationBanner message={bannerMsg} visible={bannerVisible} />

      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-lg font-bold text-gray-900">Exam in Progress</h1>
          <ServerClock examId={examId} />
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-start justify-center p-6">
          <div className="bg-white rounded-2xl shadow-md max-w-2xl w-full p-8 space-y-6">
            <QuestionRenderer question={question} onAnswer={setCurrentAnswer} />

            <div className="flex gap-3 pt-2">
              {!question?.done && (
                <button
                  onClick={handleSaveAndNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors duration-200"
                >
                  Save &amp; Next
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-xl transition-colors duration-200"
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </ExamLockdown>
  );
}
