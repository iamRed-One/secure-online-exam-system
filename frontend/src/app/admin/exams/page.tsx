'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import apiFetch from '../../lib/api';
import Link from 'next/link';
import DashboardLayout from '../../layout/DashboardLayout';

type Exam = {
  id: string; title: string; status: string;
  duration_seconds: number; question_count: number;
  start_window: string; end_window: string;
};

type Enrollment = {
  id: string; email: string; session_status?: string;
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
    questionsPerStudent: '' as number | '',
  });

  async function fetchExams() {
    try { setExams(await apiFetch('/admin/exams')); }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong'); }
  }

  useEffect(() => { fetchExams(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...form, questionsPerStudent: form.questionsPerStudent === '' ? null : form.questionsPerStudent };
      await apiFetch('/admin/exams', { method: 'POST', body: JSON.stringify(payload) }, { loading: 'Creating exam…', success: 'Exam created!', error: 'Failed to create exam' });
      setForm({ title: '', durationSeconds: 3600, startWindow: '', endWindow: '', violationThreshold: 3, gracePeriodSeconds: 60, questionsPerStudent: '' });
      setShowForm(false);
      fetchExams();
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong'); }
  }

  async function handlePublish(id: string) {
    try {
      await apiFetch(`/admin/exams/${id}/publish`, { method: 'PATCH' }, { loading: 'Publishing…', success: 'Exam published! All students enrolled.', error: 'Failed to publish' });
      fetchExams();
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong'); }
  }

  async function handleDeleteExam(id: string, title: string) {
    if (!confirm(`Delete exam "${title}"? This will remove all questions and sessions.`)) return;
    try {
      await apiFetch(`/admin/exams/${id}`, { method: 'DELETE' },
        { loading: 'Deleting exam…', success: 'Exam deleted', error: 'Failed to delete exam' });
      fetchExams();
    } catch {}
  }

  const [enrollmentsExamId, setEnrollmentsExamId] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  async function openEnrollments(id: string) {
    setEnrollmentsExamId(id);
    const data = await apiFetch(`/admin/exams/${id}/enrollments`);
    setEnrollments(data);
  }

  async function handleUnenrol(examId: string, studentId: string, email: string) {
    if (!confirm(`Unenrol ${email} from this exam?`)) return;
    try {
      await apiFetch(`/admin/exams/${examId}/enrollments/${studentId}`, { method: 'DELETE' },
        { loading: 'Unenrolling…', success: 'Student unenrolled', error: 'Failed to unenrol' });
      openEnrollments(examId);
    } catch {}
  }

  async function handleEnrolAll(id: string) {
    try {
      await apiFetch(`/admin/exams/${id}/enrol-all`, { method: 'POST' }, { loading: 'Enrolling students…', success: 'All students enrolled!', error: 'Enrolment failed' });
      alert('All students enrolled.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong'); }
  }

  const STATUS_BADGE: Record<string, string> = {
    DRAFT:     'bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full',
    SCHEDULED: 'bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full',
    ONGOING:   'bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full',
    COMPLETED: 'bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-0.5 rounded-full',
  };

  const inputCls = 'w-full border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white/90 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const tabs = [
    { label: 'Users', href: '/admin/users' },
    { label: 'Exams & Questions', href: '/admin/exams' },
  ];

  return (
    <DashboardLayout role="ADMIN">
      {/* Tab navigation */}
        <div className="flex gap-1 bg-slate-100 dark:bg-gray-900 p-1 rounded-xl w-fit mb-6">
          {tabs.map(tab => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-slate-800 dark:text-white/90'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Header */}
        <div className="flex items-center justify-end mb-6">
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-4">New Exam Details</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Title</label>
                <input
                  required
                  placeholder="Exam title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <label className="block text-xs text-slate-500 dark:text-gray-400">Duration (seconds)</label>
                    <span className="text-xs text-brand-500 font-medium">= {form.durationSeconds > 0 ? Math.round(form.durationSeconds / 60) : 0} min</span>
                  </div>
                  <input
                    type="number"
                    value={form.durationSeconds}
                    onChange={e => setForm(f => ({ ...f, durationSeconds: +e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Violation Threshold</label>
                  <input
                    type="number"
                    value={form.violationThreshold}
                    onChange={e => setForm(f => ({ ...f, violationThreshold: +e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Start Window</label>
                  <input
                    type="datetime-local"
                    value={form.startWindow}
                    onChange={e => setForm(f => ({ ...f, startWindow: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">End Window</label>
                  <input
                    type="datetime-local"
                    value={form.endWindow}
                    onChange={e => setForm(f => ({ ...f, endWindow: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Grace Period (seconds)</label>
                  <input
                    type="number"
                    value={form.gracePeriodSeconds}
                    onChange={e => setForm(f => ({ ...f, gracePeriodSeconds: +e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Questions Per Student <span className="text-slate-400">(optional)</span></label>
                <input
                  type="number"
                  min={1}
                  value={form.questionsPerStudent}
                  placeholder="Leave blank to give all questions"
                  onChange={e => setForm(f => ({ ...f, questionsPerStudent: e.target.value === '' ? '' : +e.target.value }))}
                  className={inputCls}
                />
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 p-10 text-center text-slate-400 dark:text-gray-500 text-sm">
              No exams yet.
            </div>
          )}
          {exams.map(exam => (
            <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 p-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-start justify-between sm:hidden">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-white/90 truncate">{exam.title}</p>
                  <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                    {Math.round(exam.duration_seconds / 60)} min &middot; {exam.question_count} questions
                  </p>
                </div>
                <span className={`ml-2 flex-shrink-0 ${STATUS_BADGE[exam.status] ?? 'bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-0.5 rounded-full'}`}>
                  {exam.status}
                </span>
              </div>
              <div className="hidden sm:block flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-white/90 truncate">{exam.title}</p>
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                  {Math.round(exam.duration_seconds / 60)} min &middot; {exam.question_count} questions
                </p>
              </div>
              <span className={`hidden sm:inline ${STATUS_BADGE[exam.status] ?? 'bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-0.5 rounded-full'}`}>
                {exam.status}
              </span>

              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                <button
                  onClick={() => router.push(`/admin/exams/${exam.id}/questions`)}
                  className="border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Questions
                </button>
                <button
                  onClick={() => openEnrollments(exam.id)}
                  className="border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Enrollments
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
                <button
                  onClick={() => handleDeleteExam(exam.id, exam.title)}
                  className="border border-red-200 hover:bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Enrollment manager panel */}
        {enrollmentsExamId && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white/90 font-['Outfit']">Enrolled Students</h2>
                <button onClick={() => setEnrollmentsExamId(null)} className="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 text-xl font-bold">×</button>
              </div>
              {enrollments.length === 0 && <p className="text-slate-400 dark:text-gray-500 text-sm text-center py-4">No students enrolled.</p>}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {enrollments.map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm text-slate-800 dark:text-white/90">{s.email}</p>
                      <p className="text-xs text-slate-400 dark:text-gray-500">{s.session_status || 'Not started'}</p>
                    </div>
                    <button
                      onClick={() => handleUnenrol(enrollmentsExamId, s.id, s.email)}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2.5 py-1 rounded-lg"
                    >
                      Unenrol
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
