'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '@/app/lib/api';

interface FormData {
  title: string;
  durationSeconds: number;
  startWindow: string;
  endWindow: string;
  violationThreshold: number;
  gracePeriodSeconds: number;
}

export default function CreateExam() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    title: '',
    durationSeconds: 3600,
    startWindow: '',
    endWindow: '',
    violationThreshold: 3,
    gracePeriodSeconds: 60,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const exam = await apiFetch('/exams', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      router.push(`/lecturer/exam/${exam.id}/questions`);
    } catch (err: any) {
      setError(err.message || 'Failed to create exam.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Exam</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (seconds)
            </label>
            <input
              type="number"
              name="durationSeconds"
              value={form.durationSeconds}
              onChange={handleChange}
              min={60}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Window</label>
            <input
              type="datetime-local"
              name="startWindow"
              value={form.startWindow}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Window</label>
            <input
              type="datetime-local"
              name="endWindow"
              value={form.endWindow}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Violation Threshold
            </label>
            <input
              type="number"
              name="violationThreshold"
              value={form.violationThreshold}
              onChange={handleChange}
              min={1}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grace Period (seconds)
            </label>
            <input
              type="number"
              name="gracePeriodSeconds"
              value={form.gracePeriodSeconds}
              onChange={handleChange}
              min={0}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Exam'}
          </button>
        </form>
      </div>
    </div>
  );
}
