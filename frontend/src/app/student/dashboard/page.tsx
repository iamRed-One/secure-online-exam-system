'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '@/app/lib/api';

interface Exam {
  id: string;
  title: string;
  durationSeconds: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'CLOSED';
}

const statusStyles: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  ACTIVE: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
};

export default function StudentDashboard() {
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Exams</h1>

        {exams.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No exams enrolled.</p>
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

                <div className="ml-6 flex-shrink-0">
                  {exam.status === 'PUBLISHED' && (
                    <button
                      onClick={() => router.push(`/student/exam/${exam.id}/waiting`)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Enter Exam
                    </button>
                  )}
                  {(exam.status === 'CLOSED' || (exam.status as string) === 'SUBMITTED') && (
                    <button
                      onClick={() => router.push(`/student/exam/${exam.id}/result`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      View Result
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
