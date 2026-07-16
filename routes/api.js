const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { dbAll, dbGet, dbRun } = require('../lib/db');

const router = express.Router();

function toJson(value) {
  return value ? JSON.parse(value) : [];
}

async function ensureUser(req, res, next) {
  const token = req.headers['x-auth-token'] || req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'Autentificare necesară' });
  }

  const user = await dbGet('SELECT * FROM users WHERE token = ?', [token]);
  if (!user) {
    return res.status(401).json({ error: 'Token invalid' });
  }

  req.user = user;
  next();
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Date incomplete' });
  }

  const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return res.status(409).json({ error: 'Email deja folosit' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const token = crypto.randomBytes(16).toString('hex');

  const result = await dbRun('INSERT INTO users (name, email, password_hash, token) VALUES (?, ?, ?, ?)', [name, email, passwordHash, token]);

  res.json({ token, user: { id: result.insertId, name, email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Date incomplete' });
  }

  const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return res.status(401).json({ error: 'Date incorecte' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Date incorecte' });
  }

  const token = crypto.randomBytes(16).toString('hex');
  await dbRun('UPDATE users SET token = ? WHERE id = ?', [token, user.id]);

  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.get('/me', ensureUser, async (req, res) => {
  const profile = await dbGet('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
  const badges = await dbAll('SELECT * FROM badges WHERE user_id = ?', [req.user.id]);
  const quizResults = await dbAll('SELECT * FROM quiz_results WHERE user_id = ? ORDER BY completed_at DESC', [req.user.id]);

  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email }, profile, badges, quizResults });
});

router.post('/profile', ensureUser, async (req, res) => {
  const { height, weight, target_weight, age, gender, activity_level, objective, meals_per_day, bmr, tdee, target_calories, protein_goal, carbs_goal, fat_goal } = req.body;

  const existing = await dbGet('SELECT id FROM profiles WHERE user_id = ?', [req.user.id]);
  const values = [req.user.id, height, weight, target_weight, age, gender, activity_level, objective, meals_per_day, bmr, tdee, target_calories, protein_goal, carbs_goal, fat_goal, new Date().toISOString()];

  if (existing) {
    await dbRun(`UPDATE profiles SET height = ?, weight = ?, target_weight = ?, age = ?, gender = ?, activity_level = ?, objective = ?, meals_per_day = ?, bmr = ?, tdee = ?, target_calories = ?, protein_goal = ?, carbs_goal = ?, fat_goal = ?, updated_at = ? WHERE user_id = ?`, [...values.slice(1, 15), values[15], req.user.id]);
  } else {
    await dbRun(`INSERT INTO profiles (user_id, height, weight, target_weight, age, gender, activity_level, objective, meals_per_day, bmr, tdee, target_calories, protein_goal, carbs_goal, fat_goal, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [...values, new Date().toISOString()]);
  }

  const profile = await dbGet('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
  res.json(profile);
});

router.post('/daily-log', ensureUser, async (req, res) => {
  const { logDate, targetCalories, consumedCalories, burnedCalories, waterMl, sleepHours, foods, exercises, recommendations } = req.body;
  const foodsJson = JSON.stringify(foods || []);
  const exercisesJson = JSON.stringify(exercises || []);
  const recommendationsJson = JSON.stringify(recommendations || []);

  const existing = await dbGet('SELECT id FROM daily_logs WHERE user_id = ? AND log_date = ?', [req.user.id, logDate]);
  if (existing) {
    await dbRun(`UPDATE daily_logs SET target_calories = ?, consumed_calories = ?, burned_calories = ?, water_ml = ?, sleep_hours = ?, foods_json = ?, exercises_json = ?, recommendations_json = ?, updated_at = ? WHERE user_id = ? AND log_date = ?`, [targetCalories, consumedCalories, burnedCalories, waterMl, sleepHours, foodsJson, exercisesJson, recommendationsJson, new Date().toISOString(), req.user.id, logDate]);
  } else {
    await dbRun(`INSERT INTO daily_logs (user_id, log_date, target_calories, consumed_calories, burned_calories, water_ml, sleep_hours, foods_json, exercises_json, recommendations_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [req.user.id, logDate, targetCalories, consumedCalories, burnedCalories, waterMl, sleepHours, foodsJson, exercisesJson, recommendationsJson]);
  }

  const row = await dbGet('SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ?', [req.user.id, logDate]);
  res.json(row);
});

router.get('/daily-log/:date', ensureUser, async (req, res) => {
  const row = await dbGet('SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ?', [req.user.id, req.params.date]);
  res.json(row || { target_calories: 0, consumed_calories: 0, burned_calories: 0, water_ml: 0, sleep_hours: 0, foods_json: '[]', exercises_json: '[]', recommendations_json: '[]' });
});

router.get('/daily-log-history', ensureUser, async (req, res) => {
  const rows = await dbAll('SELECT * FROM daily_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 14', [req.user.id]);
  res.json(rows.map(row => ({ ...row, foods: toJson(row.foods_json), exercises: toJson(row.exercises_json), recommendations: toJson(row.recommendations_json) })));
});

router.get('/quiz-questions/:category', async (req, res) => {
  const rows = await dbAll('SELECT * FROM quiz_questions WHERE category = ? ORDER BY id', [req.params.category]);
  res.json(rows.map(row => ({ id: row.id, question: row.question, options: JSON.parse(row.options_json), correctIndex: row.correct_index, explanation: row.explanation, badgeName: row.badge_name, badgeRequirement: row.badge_requirement })));
});

router.post('/quiz-result', ensureUser, async (req, res) => {
  const { category, score, totalQuestions, passed, answers } = req.body;
  await dbRun('INSERT INTO quiz_results (user_id, category, score, total_questions, passed, answers_json) VALUES (?, ?, ?, ?, ?, ?)', [req.user.id, category, score, totalQuestions, passed ? 1 : 0, JSON.stringify(answers || [])]);

  if (passed) {
    const existingBadge = await dbGet('SELECT id FROM badges WHERE user_id = ? AND badge_name = ?', [req.user.id, category]);
    if (!existingBadge) {
      await dbRun('INSERT INTO badges (user_id, badge_name, category) VALUES (?, ?, ?)', [req.user.id, category, category]);
    }
  }

  res.json({ ok: true });
});

router.get('/badges', ensureUser, async (req, res) => {
  const badges = await dbAll('SELECT * FROM badges WHERE user_id = ? ORDER BY unlocked_at DESC', [req.user.id]);
  res.json(badges);
});

router.get('/feedback/:type', async (req, res) => {
  const row = await dbGet('SELECT * FROM feedback_templates WHERE type = ?', [req.params.type]);
  res.json(row || {});
});

module.exports = router;
