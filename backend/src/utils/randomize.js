const crypto = require('crypto');

function shuffleQuestions(questionIds, studentId, examId) {
  const seed = crypto.createHash('sha256').update(studentId + examId).digest('hex');
  const arr = [...questionIds];
  let s = parseInt(seed.slice(0, 8), 16);
  for (let i = arr.length - 1; i > 0; i--) {
    s = Math.imul(s, 1664525) + 1013904223 | 0;
    const j = Math.abs(s) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Deterministically pick n questions from the pool using a different seed suffix
// so subset selection and shuffle order are independent.
function selectSubset(questionIds, n, studentId, examId) {
  if (!n || n >= questionIds.length) return questionIds;
  const seed = crypto.createHash('sha256').update(studentId + examId + 'subset').digest('hex');
  const arr = [...questionIds];
  let s = parseInt(seed.slice(0, 8), 16);
  for (let i = 0; i < n; i++) {
    s = Math.imul(s, 1664525) + 1013904223 | 0;
    const j = i + (Math.abs(s) % (arr.length - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

module.exports = { shuffleQuestions, selectSubset };
