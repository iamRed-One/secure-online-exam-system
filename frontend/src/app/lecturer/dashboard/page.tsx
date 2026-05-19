'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '@/app/lib/api';
import Sidebar from '@/app/components/Sidebar';
import TopBar from '@/app/components/TopBar';

interface Exam {
  id: string;
  title: string;
  durationSeconds: number;
  status: string;
  start_window?: string;
}

const statusStyles: Record<string, string> = {
  DRAFT:     'bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full',
  SCHEDULED: 'bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full',
  ONGOING:   'bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full',
  COMPLETED: 'bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-0.5 rounded-full',
};

export default function LecturerDashboard() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/exams')
      .then((data) => setExams(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="TEACHER" />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar title="My Exams" role="TEACHER" />
          <main className="flex-1 p-8 overflow-auto flex items-center justify-center">
            <p className="text-slate-400 text-sm">Loading exams...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="TEACHER" />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar title="My Exams" role="TEACHER" />
          <main className="flex-1 p-8 overflow-auto flex items-center justify-center">
            <p className="text-red-500 text-sm">{error}</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="TEACHER" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="My Exams" role="TEACHER" />
        <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-end mb-8">
          <button
            onClick={() => router.push('/lecturer/exam/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            + New Exam
          </button>
        </div>

        {exams.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <p className="text-slate-400 text-sm">No exams created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-3"
              >
                <div className="flex-1">
                  <h2 className="font-semibold text-slate-800 font-['Plus_Jakarta_Sans'] leading-snug">
                    {exam.title}
                  </h2>
                  <div className="space-y-1 mt-1">
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <span>⏱</span> {Math.round(exam.durationSeconds / 60)} min
                    </p>
                    {exam.start_window && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <span>📅</span> {new Date(exam.start_window).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <span className={statusStyles[exam.status] ?? 'bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-0.5 rounded-full'}>
                    {exam.status}
                  </span>
                </div>

                <div className="flex gap-2 pt-1 border-t border-slate-50">
                  <button
                    onClick={() => router.push(`/lecturer/exam/${exam.id}/questions`)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                  >
                    Questions
                  </button>
                  <button
                    onClick={() => router.push(`/lecturer/exam/${exam.id}/results`)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                  >
                    Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
