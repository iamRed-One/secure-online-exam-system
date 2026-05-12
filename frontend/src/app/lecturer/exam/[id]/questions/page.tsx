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
  options?: string[];
}

interface QuestionForm {
  content: string;
  type: 'MCQ' | 'SHORT' | 'LONG';
  correctAnswer: string;
  marks: number;
  options: string[]; // 4 strings for MCQ
}

const LABELS = ['A', 'B', 'C', 'D'];

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading questions...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Manage Questions</h1>
          <button onClick={handlePublish}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Publish Exam
          </button>
        </div>

        {publishMsg && <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm">{publishMsg}</div>}
        {error      && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        {/* Questions list */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">Questions ({questions.length})</h2>
          {questions.length === 0 && (
            <div className="bg-white rounded-lg border p-6 text-center text-gray-400">No questions yet.</div>
          )}
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-lg border p-4 flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-gray-800 font-medium">{idx + 1}. {q.content}</p>
                <p className="text-xs text-gray-400">{q.type} · {q.marks} mark{q.marks !== 1 ? 's' : ''} · Answer: <span className="font-semibold">{q.correctAnswer}</span></p>
                {q.options && (
                  <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                    {q.options.map((opt, i) => (
                      <p key={i}><span className="font-semibold">{LABELS[i]}.</span> {opt}</p>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => handleDelete(q.id)}
                className="ml-4 text-red-500 hover:text-red-700 text-sm flex-shrink-0">Delete</button>
            </div>
          ))}
        </div>

        {/* Add question form */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Add Question</h2>
          <form onSubmit={handleAddQuestion} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question text</label>
              <textarea required rows={3}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as any, correctAnswer: 'A' }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="MCQ">MCQ</option>
                  <option value="SHORT">Short Answer</option>
                  <option value="LONG">Long Answer</option>
                </select>
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                <input type="number" min={1} required value={form.marks}
                  onChange={e => setForm(f => ({ ...f, marks: +e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            {/* MCQ options */}
            {form.type === 'MCQ' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Options</label>
                {LABELS.map((label, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 text-sm font-bold text-blue-600">{label}.</span>
                    <input type="text" required placeholder={`Option ${label}`}
                      value={form.options[i]}
                      onChange={e => setOption(i, e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm text-black focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correct Answer {form.type === 'MCQ' ? '(A, B, C or D)' : ''}
              </label>
              {form.type === 'MCQ' ? (
                <select value={form.correctAnswer}
                  onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  {LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              ) : (
                <input type="text" required value={form.correctAnswer}
                  onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              )}
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium">
              {submitting ? 'Adding...' : 'Add Question'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
