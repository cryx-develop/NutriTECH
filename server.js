// const express = require('express');
// const path = require('path');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Body Parsers pentru formulare și JSON
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Servirea fișierelor statice (CSS, JS, Imagini)
// app.use(express.static(path.join(__dirname, 'public')));

// // --- RUTE PAGINI HTML (Toate sunt publice acum) ---

// // 1. Pagina principală
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/index.html'));
// });

// // Rute Piloni Educaționali
// app.get('/pilon/echilibru-caloric', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/piloni/echilibru-caloric.html'));
// });

// app.get('/pilon/macronutrienti', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/piloni/macronutrienti.html'));
// });

// app.get('/pilon/somn-cortizol', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/piloni/somn-cortizol.html'));
// });

// app.get('/pilon/hidratare', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/piloni/hidratare.html'));
// });

// // 2. Pagina Dashboard de Tracking (Fără autentificare obligatorie)
// app.get('/dashboard', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/dashboard.html'));
// });

// // 3. Pagina NutriTECH Academy
// app.get('/academy', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/academy.html'));
// });

// // 4. Pagina Quizzes
// app.get('/quiz', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/quiz.html'));
// });

// // Fallback rute inexistente
// app.use((req, res) => {
//   res.status(404).sendFile(path.join(__dirname, 'views/404.html'));
// });

// // Lansare server
// app.listen(PORT, () => {
//   console.log(`=============================================================`);
//   console.log(`  NutriTECH - Aplicația rulează cu succes local!`);
//   console.log(`  Deschide în browser: http://localhost:${PORT}`);
//   console.log(`=============================================================`);
// });
