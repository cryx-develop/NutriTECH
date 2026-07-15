// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');
const path = require('path');

const app = express();
const router = express.Router();

// Body Parsers pentru formulare și JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ROOT = path.resolve(__dirname, "../.."); // project location path (e.g ../projects/NutriTECH)

// Servirea fișierelor statice (CSS, JS, Imagini)
app.use(express.static(path.join(__dirname, 'public')));

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Rute pagini HTML

// 1. Pagina principală
app.get('/', (req, res) => {
  console.log("####### index.html");
  res.sendFile(path.join(ROOT, 'index.html'));
});

// Rute Piloni Educaționali
app.get('/views/piloni/echilibru-caloric', (req, res) => {
  res.sendFile(path.join(ROOT, 'views/piloni/echilibru-caloric.html'));
});

app.get('/views/piloni/macronutrienti', (req, res) => {
  res.sendFile(path.join(ROOT, 'views/piloni/macronutrienti.html'));
});

app.get('/views/piloni/somn-cortizol', (req, res) => {
  res.sendFile(path.join(ROOT, 'views/piloni/somn-cortizol.html'));
});

app.get('/views/piloni/hidratare', (req, res) => {
  res.sendFile(path.join(ROOT, 'views/piloni/hidratare.html'));
});

// 2. Pagina Dashboard de Tracking (Fără autentificare obligatorie)
app.get('/views/dashboard', (req, res) => {
  res.sendFile(path.join(ROOT, 'views/dashboard.html'));
});

// 3. Pagina NutriTECH Academy
app.get('/views/academy', (req, res) => {
  res.sendFile(path.join(ROOT, 'views/academy.html'));
});

// 4. Pagina Quizzes
app.get('/views/quiz', (req, res) => {
  res.sendFile(path.join(ROOT, 'views/quiz.html'));
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Rute pentru API - Rutele tale (Atenție: le punem sub un prefix /api/ pentru consistență)
router.get('/utilizatori', (req, res) => {
  res.json([{ id: 1, nume: "Alex" }, { id: 2, nume: "Maria" }]);
});


// Îi spunem lui Express să folosească routerul pe ruta de bază
app.use('/api/', router);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fallback rute inexistente
app.use((req, res) => {
  res.status(404).sendFile(path.join(ROOT, 'views/404.html'));
  // res.status(404).sendFile(path.join(__dirname, 'views/404.html'));
});


// FOARTE IMPORTANT: Exportăm handlerul serverless în loc de app.listen()
module.exports.handler = serverless(app);