'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '@/app/lib/api';
import Navbar from '@/app/components/Navbar';

interface Exam {
  id: string;
  title: string;
  durationSeconds: number;
  status: string;
}

const statusStyles: Record<string, string> = {
  DRAFT:     'bg-yellow-100 text-yellow-800',
  SCHEDULED: 'bg-green-100 text-green-800',
  ONGOING:   'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading exams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Teacher Dashboard" role="Teacher" />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
          <button
            onClick={() => router.push('/lecturer/exam/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + New Exam
          </button>
        </div>

        {exams.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No exams created yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-lg shadow p-6 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800">{exam.title}</h2>
                  <p className="text-gray-500 mt-1">
                    Duration: {Math.round(exam.durationSeconds / 60)} minutes
                  </p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      statusStyles[exam.status] ?? 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {exam.status}
                  </span>
                </div>

                <div className="ml-6 flex gap-3 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/lecturer/exam/${exam.id}/questions`)}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Questions
                  </button>
                  <button
                    onClick={() => router.push(`/lecturer/exam/${exam.id}/results`)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
