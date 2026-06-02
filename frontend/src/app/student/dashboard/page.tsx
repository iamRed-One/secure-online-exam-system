'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '@/app/lib/api';
import DashboardLayout from '@/app/layout/DashboardLayout';

type Exam = {
  id: string;
  title: string;
  duration_seconds: number;
  status: string;
  start_window?: string;
  end_window?: string;
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT:     'bg-amber-100 text-amber-700',
  SCHEDULED: 'bg-emerald-100 text-emerald-700',
  ONGOING:   'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
};

export default function StudentDashboard() {
  const router = useRouter();
  const [enrolled, setEnrolled]     = useState<Exam[]>([]);
  const [available, setAvailable]   = useState<Exam[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [enrolling, setEnrolling]   = useState<string | null>(null);

  async function fetchAll() {
    try {
      const [enrolledData, availableData] = await Promise.all([
        apiFetch('/exams'),
        apiFetch('/exams/browse'),
      ]);
      setEnrolled(enrolledData);
      setAvailable(availableData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleEnrolSelf(examId: string) {
    setEnrolling(examId);
    try {
      await apiFetch(`/exams/${examId}/enrol-self`, { method: 'POST' }, { loading: 'Enrolling…', success: 'Enrolled successfully!', error: 'Enrolment failed' });
      fetchAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setEnrolling(null);
    }
  }

  if (loading) return (
    <DashboardLayout role="STUDENT">
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 dark:text-gray-500 text-sm">Loading your exams…</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="STUDENT">
          {/* <header className="mb-8">
            <h1 className="text-2xl font-['Outfit'] font-bold text-slate-900 dark:text-white">My Exams</h1>
          </header> */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* My Exams */}
        <section className="mb-10">
          <h2 className="text-lg font-['Outfit'] font-bold text-slate-800 dark:text-white/90 mb-4">
            My Exams
          </h2>
          {enrolled.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-8 text-center text-slate-400 dark:text-gray-500 text-sm">
              You are not enrolled in any exams yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolled.map(exam => (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-5 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-['Outfit'] font-semibold text-slate-800 dark:text-white/90 leading-snug">
                      {exam.title}
                    </h3>
                    <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[exam.status] || 'bg-slate-100 text-slate-600'}`}>
                      {exam.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <span>⏱</span> {Math.round(exam.duration_seconds / 60)} min
                    </p>
                    {exam.start_window && (
                      <p className="text-xs text-slate-400 dark:text-gray-500 flex items-center gap-1">
                        <span>📅</span> {new Date(exam.start_window).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="mt-auto pt-2 border-t border-slate-100 dark:border-gray-700">
                    {exam.status === 'SCHEDULED' && (
                      <button
                        onClick={() => router.push(`/student/exam/${exam.id}/waiting`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                      >
                        Enter Exam
                      </button>
                    )}
                    {(exam.status === 'COMPLETED' || exam.status === 'ONGOING') && (
                      <button
                        onClick={() => router.push(`/student/exam/${exam.id}/result`)}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                      >
                        View Result
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Available Exams */}
        {available.length > 0 && (
          <section>
            <h2 className="text-lg font-['Outfit'] font-bold text-slate-800 dark:text-white/90 mb-1">
              Available Exams
            </h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">Exams you can enrol in.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {available.map(exam => (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-dashed border-slate-200 dark:border-gray-700 p-5 flex flex-col gap-3"
                >
                  <h3 className="font-['Outfit'] font-semibold text-slate-800 leading-snug">
                    {exam.title}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <span>⏱</span> {Math.round(exam.duration_seconds / 60)} min
                    </p>
                    {exam.start_window && (
                      <p className="text-xs text-slate-400 dark:text-gray-500 flex items-center gap-1">
                        <span>📅</span> {new Date(exam.start_window).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="mt-auto pt-2 border-t border-slate-100 dark:border-gray-700">
                    <button
                      disabled={enrolling === exam.id}
                      onClick={() => handleEnrolSelf(exam.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                    >
                      {enrolling === exam.id ? 'Enrolling…' : 'Enrol'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
    </DashboardLayout>
  );
}
