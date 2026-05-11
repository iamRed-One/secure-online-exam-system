'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiFetch from '@/app/lib/api';
import ProctorReport from '@/app/components/ProctorReport';

interface ExamResult {
  id: string;
  studentEmail: string;
  score: number;
  total: number;
  flagged: boolean;
  violations: any[] | null;
}

export default function LecturerResults() {
  const params = useParams();
  const examId = params.id as string;

  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/exams/${examId}/results`)
      .then((data) => setResults(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading results...</p>
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Exam Results</h1>

        {results.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No results yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const percentage =
                result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
              return (
                <div key={result.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 font-semibold">{result.studentEmail}</p>
                      <p className="text-gray-600 mt-1">
                        Score: {result.score} / {result.total} ({percentage}%)
                      </p>
                    </div>
                    {result.flagged && (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        Flagged
                      </span>
                    )}
                  </div>
                  <ProctorReport violations={result.violations} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
