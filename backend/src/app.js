const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./modules/auth/auth.router');
const examRouter = require('./modules/exam/exam.router');
const questionBankRouter = require('./modules/questionBank/questionBank.router');
const sessionRouter = require('./modules/session/session.router');
const proctoringRouter = require('./modules/proctoring/proctoring.router');
const { studentResultRouter, lecturerResultRouter } = require('./modules/results/results.router');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRouter);
app.use('/exams', examRouter);
app.use('/exams/:id/questions', questionBankRouter);
app.use('/session', sessionRouter);
app.use('/proctor', proctoringRouter);
app.use('/session', studentResultRouter);
app.use('/exams/:id/results', lecturerResultRouter);

module.exports = app;
