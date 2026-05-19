'use client';

interface QuestionRendererProps {
  question: any;
  currentAnswer: string;
  onAnswer: (answer: string) => void;
}

const LABELS = ['A', 'B', 'C', 'D'];

export default function QuestionRenderer({ question, currentAnswer, onAnswer }: QuestionRendererProps) {
  if (!question) {
    return <p className="text-slate-400 animate-pulse text-sm">Loading question...</p>;
  }

  if (question.done) {
    return (
      <p className="text-emerald-700 font-semibold text-lg">
        All questions answered. You can now submit your exam.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* Question label row */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Question {question.index} of {question.total}
        </span>
        <span className="ml-auto px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
          {question.marks} mark{question.marks !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Question text */}
      <p className="text-base font-medium text-slate-800 leading-relaxed select-none">
        {question.content}
      </p>

      {/* MCQ — 2x2 grid */}
      {question.type === 'MCQ' && Array.isArray(question.options) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((optionText: string, i: number) => {
            const selected = currentAnswer === LABELS[i];
            return (
              <label
                key={i}
                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all group ${
                  selected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected ? 'bg-blue-600' : 'bg-slate-100 group-hover:bg-blue-100'
                }`}>
                  <span className={`font-bold text-sm transition-colors ${
                    selected ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'
                  }`}>{LABELS[i]}</span>
                </div>
                <input
                  type="radio"
                  name={`mcq_answer_${question.index}`}
                  value={LABELS[i]}
                  checked={selected}
                  onChange={() => onAnswer(LABELS[i])}
                  className="hidden"
                />
                <span className="text-sm text-slate-700">{optionText}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* SHORT answer — controlled input, no key so it doesn't flash on navigate */}
      {question.type === 'SHORT' && (
        <input
          type="text"
          placeholder="Type your answer here..."
          value={currentAnswer}
          onChange={e => onAnswer(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        />
      )}

      {/* LONG answer — controlled textarea */}
      {question.type === 'LONG' && (
        <textarea
          rows={6}
          placeholder="Type your detailed answer here..."
          value={currentAnswer}
          onChange={e => onAnswer(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none transition"
        />
      )}
    </div>
  );
}
