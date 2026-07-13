// netlify/functions/api.js
const express = require('express');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

// Middleware-uri normale (opțional)
app.use(express.json());

// Rutele tale (Atenție: le punem sub un prefix /api/ pentru consistență)
router.get('/hello', (req, res) => {
  res.json({ mesaj: "Salutare din Express pe Netlify!, Cristiang" });
});

router.get('/utilizatori', (req, res) => {
  res.json([{ id: 1, nume: "Alex" }, { id: 2, nume: "Maria" }]);
});

// Îi spunem lui Express să folosească routerul pe ruta de bază
app.use('/api/', router);

// FOARTE IMPORTANT: Exportăm handlerul serverless în loc de app.listen()
module.exports.handler = serverless(app);