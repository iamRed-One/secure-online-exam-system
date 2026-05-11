'use client';

interface QuestionRendererProps {
  question: any;
  onAnswer: (answer: string) => void;
}

export default function QuestionRenderer({ question, onAnswer }: QuestionRendererProps) {
  if (!question) {
    return (
      <div className="text-gray-500 text-center py-8">Loading question...</div>
    );
  }

  if (question.done) {
    return (
      <div className="text-green-700 text-center py-8 font-semibold text-lg">
        All questions answered. You can now submit.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 font-medium">
        Question {question.index} of {question.total} &mdash; {question.marks} mark{question.marks !== 1 ? 's' : ''}
      </div>

      <p className="text-gray-900 text-base leading-relaxed">{question.content}</p>

      {question.type === 'MCQ' && (
        <div className="space-y-2">
          {(['A', 'B', 'C', 'D'] as const).map((option) => (
            <label key={option} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="mcq-answer"
                value={option}
                onChange={(e) => onAnswer(e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-800">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'SHORT' && (
        <input
          type="text"
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Your answer..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {question.type === 'LONG' && (
        <textarea
          rows={6}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Your answer..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      )}
    </div>
  );
}
