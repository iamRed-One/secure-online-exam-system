'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiFetch from '@/app/lib/api';
import DashboardLayout from '@/app/layout/DashboardLayout';

interface Question {
  id: string;
  content: string;
  type: string;
  correctAnswer: string;
  marks: number;
  options?: string[];
}

interface QuestionForm {
  content: string;
  type: 'MCQ' | 'SHORT' | 'LONG';
  correctAnswer: string;
  marks: number;
  options: string[];
}

const LABELS = ['A', 'B', 'C', 'D'];

const typeBadge: Record<string, string> = {
  MCQ:   'bg-blue-100 text-blue-700',
  SHORT: 'bg-violet-100 text-violet-700',
  LONG:  'bg-orange-100 text-orange-700',
};

export default function QuestionsPage() {
  const params  = useParams();
  const examId  = params.id as string;

  const [questions, setQuestions]         = useState<Question[]>([]);
  const [questionsPerStudent, setQps]     = useState<number | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [publishMsg, setPublishMsg]       = useState('');
  const [submitting, setSubmitting]       = useState(false);

  const emptyForm: QuestionForm = {
    content: '', type: 'MCQ', correctAnswer: 'A', marks: 1,
    options: ['', '', '', ''],
  };
  const [form, setForm]           = useState<QuestionForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function fetchQuestions() {
    try {
      const [data, exam] = await Promise.all([
        apiFetch(`/exams/${examId}/questions`),
        apiFetch(`/exams/${examId}`),
      ]);
      setQuestions(data);
      setQps(exam.questions_per_student ?? null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchQuestions(); }, [examId]);

  function handleEditClick(q: Question) {
    setEditingId(q.id);
    setForm({
      content:       q.content,
      type:          q.type as 'MCQ' | 'SHORT' | 'LONG',
      correctAnswer: q.correctAnswer,
      marks:         q.marks,
      options:       q.options ?? ['', '', '', ''],
    });
    // Scroll to form
    document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleDelete(qid: string) {
    if (!confirm('Delete this question?')) return;
    try {
      await apiFetch(`/exams/${examId}/questions/${qid}`, { method: 'DELETE' },
        { loading: 'Deleting…', success: 'Question deleted', error: 'Failed to delete' });
      fetchQuestions();
    } catch (err: any) { setError(err.message); }
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (form.type === 'MCQ' && form.options.some(o => !o.trim())) {
      return setError('All 4 MCQ options must be filled in.');
    }
    setSubmitting(true);
    setError('');
    try {
      const payload: any = { ...form };
      if (form.type !== 'MCQ') delete payload.options;

      if (editingId) {
        await apiFetch(`/exams/${examId}/questions/${editingId}`, {
          method: 'PUT', body: JSON.stringify(payload),
        }, { loading: 'Saving changes…', success: 'Question updated!', error: 'Failed to update' });
        setEditingId(null);
      } else {
        await apiFetch(`/exams/${examId}/questions`, {
          method: 'POST', body: JSON.stringify(payload),
        }, { loading: 'Adding question…', success: 'Question added!', error: 'Failed to add question' });
      }
      setForm(emptyForm);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePublish() {
    setPublishMsg('');
    try {
      await apiFetch(`/exams/${examId}/publish`, { method: 'PATCH' }, { loading: 'Publishing exam…', success: 'Exam published!', error: 'Failed to publish' });
      setPublishMsg('Exam published! Students can now see and enter it.');
    } catch (err: any) { setError(err.message); }
  }

  function setOption(i: number, val: string) {
    const opts = [...form.options];
    opts[i] = val;
    setForm(f => ({ ...f, options: opts }));
  }

  const inputCls = 'w-full border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white/90 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500';

  if (loading) return (
    <DashboardLayout role="TEACHER">
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400 text-sm">Loading questions...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="TEACHER">
      {/* Header */}
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={handlePublish}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Publish Exam
          </button>
        </div>

        {publishMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
            {publishMsg}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {questionsPerStudent !== null && questions.length < questionsPerStudent && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
            ⚠ This exam requires <strong>{questionsPerStudent}</strong> questions per student but only has <strong>{questions.length}</strong>. Add <strong>{questionsPerStudent - questions.length}</strong> more before publishing.
          </div>
        )}

        <div className="space-y-6">
          {/* Questions table - full width */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Questions ({questions.length}{questionsPerStudent !== null ? ` / ${questionsPerStudent} required` : ''})
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-gray-900 border-b border-slate-100 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide w-8">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">Question</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide w-16">Marks</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide w-16">Type</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                  {questions.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-slate-400 dark:text-gray-500 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-slate-800 dark:text-white/90 text-sm leading-snug line-clamp-2">{q.content}</p>
                        {q.options && (
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {q.options.map((opt: string, i: number) => (
                              <span key={i} className="text-xs text-slate-400 dark:text-gray-500">
                                <span className="font-semibold">{['A','B','C','D'][i]}.</span> {opt}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-slate-700 dark:text-gray-300 font-semibold text-sm">{q.marks}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          q.type === 'MCQ' ? 'bg-blue-100 text-blue-700' :
                          q.type === 'SHORT' ? 'bg-violet-100 text-violet-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>{q.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(q)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {questions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-400 dark:text-gray-500 text-sm">
                        No questions yet. Add your first question below.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add / Edit form - centered */}
          <div className="max-w-2xl">
          <div id="question-form" className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-6 ${editingId ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-100 dark:border-gray-700'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-white/90 font-['Plus_Jakarta_Sans']">
                {editingId ? '✏️ Edit Question' : 'Add New Question'}
              </h2>
              {editingId && (
                <button type="button" onClick={handleCancelEdit}
                  className="text-xs text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300 border border-slate-200 dark:border-gray-700 px-3 py-1 rounded-lg">
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Question Text
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Enter the question..."
                  className="w-full border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white/90 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Type pill buttons */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
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
                          : 'border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* MCQ Options */}
              {form.type === 'MCQ' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide">
                    Options
                  </label>
                  {LABELS.map((label, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 text-sm font-bold text-blue-600 flex-shrink-0">{label}.</span>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${label}`}
                        value={form.options[i]}
                        onChange={e => setOption(i, e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Correct Answer {form.type === 'MCQ' ? '(A, B, C or D)' : ''}
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
                <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Marks
                </label>
                <input
                  type="number"
                  min={1}
                  required
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
        </div>
    </DashboardLayout>
  );
}
