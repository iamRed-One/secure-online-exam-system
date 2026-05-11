const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./modules/auth/auth.router');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRouter);

module.exports = app;
