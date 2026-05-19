'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiFetch from '../../../../lib/api';
import Navbar from '../../../../components/Navbar';

const LABELS = ['A', 'B', 'C', 'D'];

export default function AdminQuestionsPage() {
  const { id: examId } = useParams() as { id: string };
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const emptyForm = { content: '', type: 'MCQ', correctAnswer: 'A', marks: 1, options: ['','','',''] };
  const [form, setForm] = useState(emptyForm);

  async function fetchQuestions() {
    try { setQuestions(await apiFetch(`/exams/${examId}/questions`)); }
    catch (e: any) { setError(e.message); }
  }

  useEffect(() => { fetchQuestions(); }, [examId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (form.type === 'MCQ' && form.options.some(o => !o.trim()))
      return setError('All 4 options must be filled.');
    setSubmitting(true); setError('');
    try {
      const payload: any = { ...form };
      if (form.type !== 'MCQ') delete payload.options;
      await apiFetch(`/exams/${examId}/questions`, { method: 'POST', body: JSON.stringify(payload) });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Admin — Questions" role="Admin" />
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <button onClick={() => router.push('/admin/exams')}
          className="text-blue-600 text-sm hover:underline">← Back to Exams</button>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Question list */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">Questions ({questions.length})</h2>
          {questions.length === 0 && <p className="text-gray-400 text-sm">No questions yet.</p>}
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white border rounded-xl p-4 flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-medium text-gray-800">{i + 1}. {q.content}</p>
                <p className="text-xs text-gray-400">{q.type} · {q.marks} mark{q.marks !== 1 ? 's' : ''} · Answer: <strong>{q.correctAnswer}</strong></p>
                {q.options && (
                  <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                    {q.options.map((o: string, j: number) => (
                      <p key={j}><span className="font-semibold">{LABELS[j]}.</span> {o}</p>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => handleDelete(q.id)}
                className="ml-4 text-red-500 hover:text-red-700 text-sm">Delete</button>
            </div>
          ))}
        </div>

        {/* Add question form */}
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Add Question</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <textarea required rows={3} placeholder="Question text" value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm text-black" />

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500">Type</label>
                <select value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value, correctAnswer: 'A' }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black">
                  <option value="MCQ">MCQ</option>
                  <option value="SHORT">Short Answer</option>
                  <option value="LONG">Long Answer</option>
                </select>
              </div>
              <div className="w-24">
                <label className="text-xs text-gray-500">Marks</label>
                <input type="number" min={1} value={form.marks}
                  onChange={e => setForm(f => ({ ...f, marks: +e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black" />
              </div>
            </div>

            {form.type === 'MCQ' && (
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Options</label>
                {LABELS.map((lbl, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 text-sm font-bold text-blue-600">{lbl}.</span>
                    <input required placeholder={`Option ${lbl}`} value={form.options[i]}
                      onChange={e => setOption(i, e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm text-black" />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500">Correct Answer {form.type === 'MCQ' ? '(A/B/C/D)' : ''}</label>
              {form.type === 'MCQ' ? (
                <select value={form.correctAnswer}
                  onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black">
                  {LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              ) : (
                <input type="text" required value={form.correctAnswer}
                  onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black" />
              )}
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Question'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
