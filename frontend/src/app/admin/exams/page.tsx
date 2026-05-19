'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiFetch from '../../lib/api';
import Sidebar from '../../components/Sidebar';
import Link from 'next/link';

type Exam = {
  id: string; title: string; status: string;
  duration_seconds: number; question_count: number;
  start_window: string; end_window: string;
};

export default function AdminExamsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [exams, setExams] = useState<Exam[]>([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
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
      setShowForm(false);
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

  const STATUS_BADGE: Record<string, string> = {
    DRAFT:     'bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full',
    SCHEDULED: 'bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full',
    ONGOING:   'bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full',
    COMPLETED: 'bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-0.5 rounded-full',
  };

  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const tabs = [
    { label: 'Users', href: '/admin/users' },
    { label: 'Exams & Questions', href: '/admin/exams' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="ADMIN" />
      <main className="flex-1 p-8 overflow-auto">
        {/* Tab navigation */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
          {tabs.map(tab => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-white shadow-sm text-slate-800'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
            Exam Management
          </h1>
          <button
            onClick={() => setShowForm(v => !v)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            {showForm ? 'Cancel' : '+ Create Exam'}
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Create exam form (collapsible) */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">New Exam Details</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Title</label>
                <input
                  required
                  placeholder="Exam title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Duration (seconds)</label>
                  <input
                    type="number"
                    value={form.durationSeconds}
                    onChange={e => setForm(f => ({ ...f, durationSeconds: +e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Violation Threshold</label>
                  <input
                    type="number"
                    value={form.violationThreshold}
                    onChange={e => setForm(f => ({ ...f, violationThreshold: +e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Start Window</label>
                  <input
                    type="datetime-local"
                    value={form.startWindow}
                    onChange={e => setForm(f => ({ ...f, startWindow: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">End Window</label>
                  <input
                    type="datetime-local"
                    value={form.endWindow}
                    onChange={e => setForm(f => ({ ...f, endWindow: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Grace Period (seconds)</label>
                  <input
                    type="number"
                    value={form.gracePeriodSeconds}
                    onChange={e => setForm(f => ({ ...f, gracePeriodSeconds: +e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Create Exam →
              </button>
            </form>
          </div>
        )}

        {/* Exams list */}
        <div className="space-y-3">
          {exams.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400 text-sm">
              No exams yet.
            </div>
          )}
          {exams.map(exam => (
            <div key={exam.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 font-['Plus_Jakarta_Sans'] truncate">
                  {exam.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {Math.round(exam.duration_seconds / 60)} min &middot; {exam.question_count} questions
                </p>
              </div>

              <span className={STATUS_BADGE[exam.status] ?? 'bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-0.5 rounded-full'}>
                {exam.status}
              </span>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => router.push(`/admin/exams/${exam.id}/questions`)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Questions
                </button>
                {exam.status === 'DRAFT' && (
                  <button
                    onClick={() => handlePublish(exam.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Publish
                  </button>
                )}
                {exam.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleEnrolAll(exam.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Enrol All
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
