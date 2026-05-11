'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiFetch from '@/app/lib/api';

interface Question {
  id: string;
  content: string;
  type: string;
  correctAnswer: string;
  marks: number;
}

interface QuestionForm {
  content: string;
  type: 'MCQ' | 'SHORT' | 'LONG';
  correctAnswer: string;
  marks: number;
}

export default function QuestionsPage() {
  const params = useParams();
  const examId = params.id as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishMsg, setPublishMsg] = useState('');
  const [publishError, setPublishError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<QuestionForm>({
    content: '',
    type: 'MCQ',
    correctAnswer: '',
    marks: 1,
  });

  async function fetchQuestions() {
    try {
      const data = await apiFetch(`/exams/${examId}/questions`);
      setQuestions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, [examId]);

  async function handleDelete(qid: string) {
    try {
      await apiFetch(`/exams/${examId}/questions/${qid}`, { method: 'DELETE' });
      fetchQuestions();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch(`/exams/${examId}/questions`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ content: '', type: 'MCQ', correctAnswer: '', marks: 1 });
      fetchQuestions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePublish() {
    setPublishMsg('');
    setPublishError('');
    try {
      await apiFetch(`/exams/${examId}/publish`, { method: 'PATCH' });
      setPublishMsg('Exam published successfully!');
    } catch (err: any) {
      setPublishError(err.message || 'Failed to publish exam.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Questions</h1>
          <button
            onClick={handlePublish}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Publish Exam
          </button>
        </div>

        {publishMsg && (
          <div className="mb-4 bg-green-50 border border-green-300 rounded-lg p-4">
            <p className="text-green-700">{publishMsg}</p>
          </div>
        )}
        {publishError && (
          <div className="mb-4 bg-red-50 border border-red-300 rounded-lg p-4">
            <p className="text-red-700">{publishError}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-300 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Existing Questions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Questions ({questions.length})
          </h2>
          {questions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No questions added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white rounded-lg shadow p-4 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">
                      {idx + 1}. {q.content}
                    </p>
                    <div className="mt-1 flex gap-4 text-sm text-gray-500">
                      <span>Type: {q.type}</span>
                      <span>Marks: {q.marks}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="ml-4 text-red-600 hover:text-red-800 font-medium text-sm flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Question Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Question</h2>
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                required
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    type: e.target.value as 'MCQ' | 'SHORT' | 'LONG',
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="MCQ">MCQ</option>
                <option value="SHORT">SHORT</option>
                <option value="LONG">LONG</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correct Answer
              </label>
              <input
                type="text"
                value={form.correctAnswer}
                onChange={(e) => setForm((prev) => ({ ...prev, correctAnswer: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
              <input
                type="number"
                value={form.marks}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, marks: Number(e.target.value) }))
                }
                min={1}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {submitting ? 'Adding...' : 'Add Question'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
