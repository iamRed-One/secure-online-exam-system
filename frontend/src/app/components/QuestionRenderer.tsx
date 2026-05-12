'use client';

interface QuestionRendererProps {
  question: any;
  onAnswer: (answer: string) => void;
}

const LABELS = ['A', 'B', 'C', 'D'];

export default function QuestionRenderer({ question, onAnswer }: QuestionRendererProps) {
  if (!question) {
    return <p className="text-gray-500 animate-pulse">Loading question...</p>;
  }

  if (question.done) {
    return (
      <p className="text-green-700 font-semibold text-lg">
        All questions answered. You can now submit your exam.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-400 uppercase tracking-wide">
        Question {question.index} of {question.total} &mdash; {question.marks} mark{question.marks !== 1 ? 's' : ''}
      </p>

      <p className="text-lg font-medium text-gray-800 leading-relaxed select-none">
        {question.content}
      </p>

      {question.type === 'MCQ' && Array.isArray(question.options) && (
        <div className="space-y-3">
          {question.options.map((optionText: string, i: number) => (
            <label
              key={i}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <input
                type="radio"
                name="mcq_answer"
                value={LABELS[i]}
                onChange={() => onAnswer(LABELS[i])}
                className="mt-0.5 accent-blue-600"
              />
              <span className="text-sm text-gray-700">
                <span className="font-semibold text-blue-700 mr-2">{LABELS[i]}.</span>
                {optionText}
              </span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'SHORT' && (
        <input
          type="text"
          placeholder="Type your answer here..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={e => onAnswer(e.target.value)}
        />
      )}

      {question.type === 'LONG' && (
        <textarea
          rows={6}
          placeholder="Type your answer here..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          onChange={e => onAnswer(e.target.value)}
        />
      )}
    </div>
  );
}
