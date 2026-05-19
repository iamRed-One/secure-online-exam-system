'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiFetch from '@/app/lib/api';
import Sidebar from '@/app/components/Sidebar';

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

  const [questions, setQuestions]   = useState<Question[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [publishMsg, setPublishMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emptyForm: QuestionForm = {
    content: '', type: 'MCQ', correctAnswer: 'A', marks: 1,
    options: ['', '', '', ''],
  };
  const [form, setForm] = useState<QuestionForm>(emptyForm);

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

  useEffect(() => { fetchQuestions(); }, [examId]);

  async function handleDelete(qid: string) {
    try {
      await apiFetch(`/exams/${examId}/questions/${qid}`, { method: 'DELETE' });
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
      await apiFetch(`/exams/${examId}/questions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
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
      await apiFetch(`/exams/${examId}/publish`, { method: 'PATCH' });
      setPublishMsg('Exam published! Students can now see and enter it.');
    } catch (err: any) { setError(err.message); }
  }

  function setOption(i: number, val: string) {
    const opts = [...form.options];
    opts[i] = val;
    setForm(f => ({ ...f, options: opts }));
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500';

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-auto flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading questions...</p>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="TEACHER" />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
            Manage Questions
          </h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Questions list */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Questions ({questions.length})
            </h2>

            {questions.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
                No questions yet.
              </div>
            )}

            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-3">
                      <span className="text-slate-400 mr-1">{idx + 1}.</span>
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
                        {q.options.map((opt, i) => (
                          <p key={i} className="text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">{LABELS[i]}.</span> {opt}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(q.id)}
                    className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add question form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-base font-bold text-slate-800 font-['Plus_Jakarta_Sans'] mb-4">
              Add New Question
            </h2>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                  Question Text
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Enter the question..."
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

              {/* MCQ Options */}
              {form.type === 'MCQ' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
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
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
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
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
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
                {submitting ? 'Adding...' : 'Add Question'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
