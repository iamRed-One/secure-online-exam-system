'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiFetch from '../../../../lib/api';
import Sidebar from '../../../../components/Sidebar';

const LABELS = ['A', 'B', 'C', 'D'];

const typeBadge: Record<string, string> = {
  MCQ:   'bg-blue-100 text-blue-700',
  SHORT: 'bg-violet-100 text-violet-700',
  LONG:  'bg-orange-100 text-orange-700',
};

export default function AdminQuestionsPage() {
  const { id: examId } = useParams() as { id: string };
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const emptyForm = { content: '', type: 'MCQ', correctAnswer: 'A', marks: 1, options: ['','','',''] };
  const [form, setForm]           = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function fetchQuestions() {
    try { setQuestions(await apiFetch(`/exams/${examId}/questions`)); }
    catch (e: any) { setError(e.message); }
  }

  useEffect(() => { fetchQuestions(); }, [examId]);

  function handleEditClick(q: any) {
    setEditingId(q.id);
    setForm({ content: q.content, type: q.type, correctAnswer: q.correctAnswer, marks: q.marks, options: q.options ?? ['','','',''] });
    document.getElementById('admin-question-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleCancelEdit() { setEditingId(null); setForm(emptyForm); }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (form.type === 'MCQ' && form.options.some((o: string) => !o.trim()))
      return setError('All 4 options must be filled.');
    setSubmitting(true); setError('');
    try {
      const payload: any = { ...form };
      if (form.type !== 'MCQ') delete payload.options;
      if (editingId) {
        await apiFetch(`/exams/${examId}/questions/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) },
          { loading: 'Saving…', success: 'Question updated!', error: 'Failed to update' });
        setEditingId(null);
      } else {
        await apiFetch(`/exams/${examId}/questions`, { method: 'POST', body: JSON.stringify(payload) },
          { loading: 'Adding…', success: 'Question added!', error: 'Failed to add' });
      }
      setForm(emptyForm);
      fetchQuestions();
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(qid: string) {
    try {
      await apiFetch(`/exams/${examId}/questions/${qid}`, { method: 'DELETE' });
      fetchQuestions();
    } catch (e: any) { setError(e.message); }
  }

  function setOption(i: number, val: string) {
    const opts = [...form.options]; opts[i] = val;
    setForm(f => ({ ...f, options: opts }));
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="ADMIN" />
      <main className="flex-1 p-8 overflow-auto">
        {/* Back link */}
        <button
          onClick={() => router.push('/admin/exams')}
          className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-flex items-center gap-1 transition-colors"
        >
          &larr; Back to Exams
        </button>

        <h1 className="text-xl font-bold text-slate-800 font-['Plus_Jakarta_Sans'] mb-6">
          Manage Questions
        </h1>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question list */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Questions ({questions.length})
            </h2>

            {questions.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
                No questions yet.
              </div>
            )}

            {questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-3">
                      <span className="text-slate-400 mr-1">{i + 1}.</span>
                      {q.content}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge[q.type] ?? 'bg-slate-100 text-slate-600'}`}>
                        {q.type}
                      </span>
                      <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {q.marks} mark{q.marks !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {q.options && (
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5">
                        {q.options.map((o: string, j: number) => (
                          <p key={j} className="text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">{LABELS[j]}.</span> {o}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => handleEditClick(q)}
                      className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(q.id)}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-2.5 py-1 rounded-lg transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add / Edit question form */}
          <div id="admin-question-form" className={`bg-white rounded-2xl shadow-sm border p-6 ${editingId ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
                {editingId ? '✏️ Edit Question' : 'Add New Question'}
              </h2>
              {editingId && (
                <button type="button" onClick={handleCancelEdit}
                  className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1 rounded-lg">
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                  Question Text
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter the question..."
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Type pill buttons */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                  Type
                </label>
                <div className="flex gap-2">
                  {(['MCQ', 'SHORT', 'LONG'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t, correctAnswer: t === 'MCQ' ? 'A' : '' }))}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                        form.type === t
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {form.type === 'MCQ' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Options
                  </label>
                  {LABELS.map((lbl, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 text-sm font-bold text-blue-600 flex-shrink-0">{lbl}.</span>
                      <input
                        required
                        placeholder={`Option ${lbl}`}
                        value={form.options[i]}
                        onChange={e => setOption(i, e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                  Correct Answer {form.type === 'MCQ' ? '(A/B/C/D)' : ''}
                </label>
                {form.type === 'MCQ' ? (
                  <select
                    value={form.correctAnswer}
                    onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))}
                    className={inputCls}
                  >
                    {LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={form.correctAnswer}
                    onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))}
                    className={inputCls}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                  Marks
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.marks}
                  onChange={e => setForm(f => ({ ...f, marks: +e.target.value }))}
                  className={inputCls}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {submitting ? 'Saving…' : editingId ? 'Save Changes' : 'Add Question'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
