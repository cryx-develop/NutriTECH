// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const path = require('path');
const apiRouter = require('../../routes/api');
const { initializeDatabase } = require('../../lib/db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ROOT = path.resolve(__dirname, '../..');
app.use(express.static(path.join(ROOT, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT, 'public', 'index.html'));
});

app.get('/views/dashboard', (req, res) => {
  res.sendFile(path.join(ROOT, 'views', 'dashboard.html'));
});

app.get('/views/academy', (req, res) => {
  res.sendFile(path.join(ROOT, 'views', 'academy.html'));
});

app.get('/views/quiz', (req, res) => {
  res.sendFile(path.join(ROOT, 'views', 'quiz.html'));
});

app.get('/views/profile', (req, res) => {
  res.sendFile(path.join(ROOT, 'views', 'profile.html'));
});

app.get('/views/piloni/:page', (req, res) => {
  res.sendFile(path.join(ROOT, 'views', 'piloni', `${req.params.page}.html`));
});

app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).sendFile(path.join(ROOT, 'views', '404.html'));
});

module.exports.handler = async (event, context) => {
  await initializeDatabase();
  return serverless(app)(event, context);
};