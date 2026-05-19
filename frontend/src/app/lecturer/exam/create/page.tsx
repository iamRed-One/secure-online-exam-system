'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '@/app/lib/api';
import Sidebar from '@/app/components/Sidebar';
import TopBar from '@/app/components/TopBar';

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

  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="TEACHER" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Create Exam" role="TEACHER" />
        <main className="flex-1 p-8 overflow-auto flex items-start justify-center">
          <div className="w-full max-w-xl">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelCls}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Midterm Examination"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Duration (seconds)</label>
                <input
                  type="number"
                  name="durationSeconds"
                  value={form.durationSeconds}
                  onChange={handleChange}
                  min={60}
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Start Window</label>
                <input
                  type="datetime-local"
                  name="startWindow"
                  value={form.startWindow}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>End Window</label>
                <input
                  type="datetime-local"
                  name="endWindow"
                  value={form.endWindow}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Violation Threshold</label>
                  <input
                    type="number"
                    name="violationThreshold"
                    value={form.violationThreshold}
                    onChange={handleChange}
                    min={1}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Grace Period (seconds)</label>
                  <input
                    type="number"
                    name="gracePeriodSeconds"
                    value={form.gracePeriodSeconds}
                    onChange={handleChange}
                    min={0}
                    required
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-colors mt-2"
              >
                {submitting ? 'Creating...' : 'Create Exam →'}
              </button>
            </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
