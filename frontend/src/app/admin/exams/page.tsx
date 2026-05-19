'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '../../lib/api';
import Navbar from '../../components/Navbar';

type Exam = {
  id: string; title: string; status: string;
  duration_seconds: number; question_count: number;
  start_window: string; end_window: string;
};

export default function AdminExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', durationSeconds: 3600,
    startWindow: '', endWindow: '',
    violationThreshold: 3, gracePeriodSeconds: 60,
  });

  async function fetchExams() {
    try { setExams(await apiFetch('/admin/exams')); }
    catch (e: any) { setError(e.message); }
  }

  useEffect(() => { fetchExams(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiFetch('/admin/exams', { method: 'POST', body: JSON.stringify(form) });
      setForm({ title: '', durationSeconds: 3600, startWindow: '', endWindow: '', violationThreshold: 3, gracePeriodSeconds: 60 });
      fetchExams();
    } catch (e: any) { setError(e.message); }
  }

  async function handlePublish(id: string) {
    try {
      await apiFetch(`/admin/exams/${id}/publish`, { method: 'PATCH' });
      fetchExams();
    } catch (e: any) { setError(e.message); }
  }

  async function handleEnrolAll(id: string) {
    try {
      await apiFetch(`/admin/exams/${id}/enrol-all`, { method: 'POST' });
      alert('All students enrolled.');
    } catch (e: any) { setError(e.message); }
  }

  const STATUS_COLOUR: Record<string, string> = {
    DRAFT:     'bg-yellow-100 text-yellow-800',
    SCHEDULED: 'bg-green-100 text-green-800',
    ONGOING:   'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Admin — Exams" role="Admin" />
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Nav links */}
        <div className="flex gap-3 text-sm">
          <button onClick={() => router.push('/admin/users')}
            className="text-blue-600 hover:underline">← Users</button>
        </div>

        {/* Create exam */}
        <section className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Create New Exam</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input required placeholder="Exam title" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm text-black" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Duration (seconds)</label>
                <input type="number" value={form.durationSeconds}
                  onChange={e => setForm(f => ({ ...f, durationSeconds: +e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Violation threshold</label>
                <input type="number" value={form.violationThreshold}
                  onChange={e => setForm(f => ({ ...f, violationThreshold: +e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Start window</label>
                <input type="datetime-local" value={form.startWindow}
                  onChange={e => setForm(f => ({ ...f, startWindow: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black" />
              </div>
              <div>
                <label className="text-xs text-gray-500">End window</label>
                <input type="datetime-local" value={form.endWindow}
                  onChange={e => setForm(f => ({ ...f, endWindow: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black" />
              </div>
            </div>
            <button type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Create Exam
            </button>
          </form>
        </section>

        {/* Exams list */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">All Exams</h2>
          {exams.length === 0 && <p className="text-gray-400 text-sm">No exams yet.</p>}
          {exams.map(exam => (
            <div key={exam.id} className="bg-white border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{exam.title}</p>
                <p className="text-xs text-gray-400">
                  {Math.round(exam.duration_seconds / 60)} min · {exam.question_count} questions
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLOUR[exam.status]}`}>
                {exam.status}
              </span>
              <div className="flex gap-2">
                <button onClick={() => router.push(`/admin/exams/${exam.id}/questions`)}
                  className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50">
                  Questions
                </button>
                {exam.status === 'DRAFT' && (
                  <button onClick={() => handlePublish(exam.id)}
                    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                    Publish
                  </button>
                )}
                {exam.status === 'SCHEDULED' && (
                  <button onClick={() => handleEnrolAll(exam.id)}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                    Enrol All
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
