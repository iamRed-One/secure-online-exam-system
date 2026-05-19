'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiFetch from '@/app/lib/api';

interface Result {
  score: number;
  total: number;
  flagged: boolean;
}

export default function StudentResult() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/session/result?examId=${params.id}`)
      .then((data) => setResult(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading result...</p>
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

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">No result found.</p>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.total) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Exam Result</h1>

        <div className="bg-white rounded-lg shadow p-8 text-center mb-6">
          <p className="text-6xl font-bold text-gray-900 mb-2">
            {result.score} / {result.total}
          </p>
          <p className="text-2xl text-gray-600">{percentage}%</p>
        </div>

        {result.flagged ? (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">
              Your exam has been flagged for review. Your lecturer will confirm your grade.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-300 rounded-lg p-4">
            <p className="text-green-800 font-medium">Result confirmed.</p>
          </div>
        )}

        <button
          onClick={() => router.push('/student/dashboard')}
          className="mt-6 w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-3 rounded-xl transition"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
