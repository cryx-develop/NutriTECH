const express = require('express');
const path = require('path');
const apiRouter = require('./routes/api');
const { initializeDatabase } = require('./lib/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/views/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/views/academy', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'academy.html'));
});

app.get('/views/quiz', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'quiz.html'));
});

app.get('/views/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

app.get('/views/piloni/:page', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'piloni', `${req.params.page}.html`));
});

app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`NutriTECH server started on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
