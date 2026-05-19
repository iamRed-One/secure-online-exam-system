'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '@/app/lib/api';
import Navbar from '@/app/components/Navbar';

type Exam = {
  id: string;
  title: string;
  duration_seconds: number;
  status: string;
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT:     'bg-yellow-100 text-yellow-800',
  SCHEDULED: 'bg-green-100 text-green-800',
  ONGOING:   'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-gray-100 text-gray-600',
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleEnrolSelf(examId: string) {
    setEnrolling(examId);
    try {
      await apiFetch(`/exams/${examId}/enrol-self`, { method: 'POST' });
      fetchAll();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEnrolling(null);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Student Dashboard" role="Student" />
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* My enrolled exams */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800">My Exams</h2>
          {enrolled.length === 0 && (
            <div className="bg-white border rounded-xl p-6 text-center text-gray-400">
              You are not enrolled in any exams yet.
            </div>
          )}
          {enrolled.map(exam => (
            <div key={exam.id} className="bg-white border rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{exam.title}</p>
                <p className="text-sm text-gray-400">
                  Duration: {Math.round(exam.duration_seconds / 60)} min
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[exam.status] || 'bg-gray-100 text-gray-600'}`}>
                  {exam.status}
                </span>
              </div>
              <div className="ml-4 flex-shrink-0">
                {exam.status === 'SCHEDULED' && (
                  <button
                    onClick={() => router.push(`/student/exam/${exam.id}/waiting`)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Enter Exam
                  </button>
                )}
                {(exam.status === 'COMPLETED' || exam.status === 'ONGOING') && (
                  <button
                    onClick={() => router.push(`/student/exam/${exam.id}/result`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    View Result
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Available exams to join */}
        {available.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800">Available Exams</h2>
            <p className="text-sm text-gray-500">Exams you can enrol in.</p>
            {available.map(exam => (
              <div key={exam.id} className="bg-white border border-dashed border-gray-300 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{exam.title}</p>
                  <p className="text-sm text-gray-400">
                    Duration: {Math.round(exam.duration_seconds / 60)} min
                  </p>
                </div>
                <button
                  disabled={enrolling === exam.id}
                  onClick={() => handleEnrolSelf(exam.id)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {enrolling === exam.id ? 'Enrolling…' : 'Enrol'}
                </button>
              </div>
            ))}
          </section>
        )}

      </div>
    </div>
  );
}
