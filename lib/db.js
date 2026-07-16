const { Pool } = require('pg');

let pool = null;

async function initializeDatabase() {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Eroare: variabila de mediu DATABASE_URL lipsește!");
  }

  pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Necesar pentru conexiunile securizate cloud (Neon/Supabase)
  });

  // Testăm conexiunea rapid
  await pool.query('SELECT NOW()');

  await ensureSchema();
  await seedData();
  
  return pool;
}

// Transformă automat ? în $1, $2 etc., pentru a păstra compatibilitatea cu restul aplicației tale
function convertPlaceholders(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

async function ensureSchema() {
  // Am adaptat tipurile de date pentru PostgreSQL (ex: SERIAL în loc de AUTOINCREMENT)
  const sql = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      token TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL,
      height REAL,
      weight REAL,
      target_weight REAL,
      age INTEGER,
      gender TEXT,
      activity_level REAL,
      objective TEXT,
      meals_per_day INTEGER,
      bmr INTEGER,
      tdee INTEGER,
      target_calories INTEGER,
      protein_goal INTEGER,
      carbs_goal INTEGER,
      fat_goal INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS daily_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      log_date TEXT NOT NULL,
      target_calories INTEGER,
      consumed_calories INTEGER,
      burned_calories INTEGER,
      water_ml INTEGER,
      sleep_hours REAL,
      foods_json TEXT,
      exercises_json TEXT,
      recommendations_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, log_date)
    )`,
    `CREATE TABLE IF NOT EXISTS quiz_questions (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      options_json TEXT NOT NULL,
      correct_index INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      badge_name TEXT,
      badge_requirement INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS quiz_results (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      answers_json TEXT,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS badges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      badge_name TEXT NOT NULL,
      category TEXT NOT NULL,
      unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_name)
    )`,
    `CREATE TABLE IF NOT EXISTS feedback_templates (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT
    )`
  ];

  for (const statement of sql) {
    await dbRun(statement);
  }
}

async function seedData() {
  const questionsCount = await dbGet('SELECT COUNT(*) as count FROM quiz_questions');
  if (questionsCount && Number(questionsCount.count) > 0) {
    return;
  }

  const seedQuestions = [
    {
      category: 'calorii',
      question: 'Ce procent din consumul energetic zilnic este reprezentat de BMR în medie?',
      options: ['10-20%', '30-45%', '60-75%', '90-100%'],
      correctIndex: 2,
      explanation: 'BMR reprezintă aproximativ 60-75% din energia cheltuită zilnic într-un organism mediu.',
      badgeName: 'Calorii & BMR',
      badgeRequirement: 3
    },
    {
      category: 'calorii',
      question: 'Ce reprezintă TDEE?',
      options: ['Energia necesară somnului', 'Consumul total zilnic de energie', 'Numărul de proteine ingerate', 'Metabolismul în repaus'],
      correctIndex: 1,
      explanation: 'TDEE este consumul total zilnic de energie, incluzând BMR, activitate și digestie.',
      badgeName: 'Calorii & BMR',
      badgeRequirement: 3
    },
    {
      category: 'calorii',
      question: 'Ce se întâmplă în cazul unui deficit caloric moderat?',
      options: ['Crește masa musculară rapid', 'Încurajează pierderea de greutate sănătoasă', 'Elimină nevoia de somn', 'Mărește apetitul peste limite'],
      correctIndex: 1,
      explanation: 'Un deficit moderat susține pierderea de greutate fără a compromite sănătatea.',
      badgeName: 'Calorii & BMR',
      badgeRequirement: 3
    },
    {
      category: 'calorii',
      question: 'Care este rolul PAL?',
      options: ['Măsoară nivelul de apă', 'Înmulțește BMR cu activitatea', 'Reduce necesarul de proteine', 'Înlocuiește formula de slăbire'],
      correctIndex: 1,
      explanation: 'PAL este factorul de activitate și transformă BMR-ul în consumul real zilnic.',
      badgeName: 'Calorii & BMR',
      badgeRequirement: 3
    },
    {
      category: 'macronutrienti',
      question: 'Care macronutrient are cel mai mare efect termic?',
      options: ['Carbohidrații', 'Grăsimile', 'Proteinele', 'Vitaminele'],
      correctIndex: 2,
      explanation: 'Proteinele au efectul termic cel mai mare, deoarece digestia lor consumă mai multă energie.',
      badgeName: 'Macronutrienți',
      badgeRequirement: 3
    },
    {
      category: 'macronutrienti',
      question: 'Câte calorii oferă un gram de grăsime?',
      options: ['2 kcal', '4 kcal', '7 kcal', '9 kcal'],
      correctIndex: 3,
      explanation: 'Un gram de grăsime furnizează 9 kcal.',
      badgeName: 'Macronutrienți',
      badgeRequirement: 3
    },
    {
      category: 'macronutrienti',
      question: 'Ce rol au proteinele în organism?',
      options: ['Sunt doar sursă de energie', 'Susțin repararea și construcția țesuturilor', 'Sunt resurse pentru vitamina D', 'Nu au rol important'],
      correctIndex: 1,
      explanation: 'Proteinele susțin repararea mușchilor și producția de hormoni și enzime.',
      badgeName: 'Macronutrienți',
      badgeRequirement: 3
    },
    {
      category: 'macronutrienti',
      question: 'Ce reprezintă carbohidrații pentru organism?',
      options: ['Sursă primară de energie', 'Rezervă de vitamine', 'Singurul nutriment care ajută la somn', 'Surse de fibre doar'],
      correctIndex: 0,
      explanation: 'Carbohidrații sunt principala sursă de energie pentru creier și mușchi.',
      badgeName: 'Macronutrienți',
      badgeRequirement: 3
    },
    {
      category: 'hidratare',
      question: 'De ce este importantă apa?',
      options: ['Pentru digestie și metabolism', 'Pentru a înlocui proteinele', 'Pentru a crește grăsimile', 'Pentru a elimina somnul'],
      correctIndex: 0,
      explanation: 'Apa facilitează digestia, transportul nutrienților și funcționarea metabolică.',
      badgeName: 'Hidratare',
      badgeRequirement: 3
    },
    {
      category: 'hidratare',
      question: 'Ce poate apărea în deshidratare?',
      options: ['Performanță mai bună', 'Pofte și oboseală', 'Mai puțină foame', 'Somn mai profund'],
      correctIndex: 1,
      explanation: 'Deshidratarea reduce performanța și poate duce la oboseală și pofte.',
      badgeName: 'Hidratare',
      badgeRequirement: 3
    },
    {
      category: 'hidratare',
      question: 'Ce recomandare este corectă?',
      options: ['Să bei doar când ți-e sete', 'Să menții hidratarea constantă', 'Să elimini apa din dietă', 'Să bei doar sucuri'],
      correctIndex: 1,
      explanation: 'Hidratarea constantă este mai eficientă decât a aștepta setea.',
      badgeName: 'Hidratare',
      badgeRequirement: 3
    },
    {
      category: 'hidratare',
      question: 'Care este un semn de hidratare bună?',
      options: ['Urină închisă la culoare', 'Oboseală constantă', 'Energie și concentrare mai bune', 'Pofte intense'],
      correctIndex: 2,
      explanation: 'O hidratare bună susține energie, concentrare și funcționare metabolică optimă.',
      badgeName: 'Hidratare',
      badgeRequirement: 3
    },
    {
      category: 'somn',
      question: 'Ce influențează somnul asupra apetitului?',
      options: ['Nu influențează deloc', 'Poate crește poftele și ghrelina', 'Reduce nevoia de proteine', 'Mărește metabolismul bazal imediat'],
      correctIndex: 1,
      explanation: 'Somnul insuficient poate crește ghrelina și poftele alimentare.',
      badgeName: 'Somn & Hormoni',
      badgeRequirement: 3
    },
    {
      category: 'somn',
      question: 'Ce hormon este asociat cu stresul?',
      options: ['Insulina', 'Leptina', 'Cortizolul', 'Glicogenul'],
      correctIndex: 2,
      explanation: 'Cortizolul este hormonul de stres care poate crește în lipsa somnului.',
      badgeName: 'Somn & Hormoni',
      badgeRequirement: 3
    },
    {
      category: 'somn',
      question: 'Câte ore de somn sunt de obicei recomandate?',
      options: ['3-4 ore', '5-6 ore', '7-9 ore', '10-12 ore'],
      correctIndex: 2,
      explanation: 'Majoritatea adulților se simt mai bine cu 7-9 ore de somn.',
      badgeName: 'Somn & Hormoni',
      badgeRequirement: 3
    },
    {
      category: 'somn',
      question: 'Care este beneficiul unui somn bun?',
      options: ['Scade recuperarea musculară', 'Reduce performanța cognitivă', 'Ajută la refacere și reglare hormonală', 'Elimină nevoia de apă'],
      correctIndex: 2,
      explanation: 'Somnul bun ajută la refacere, reglare hormonală și performanță.',
      badgeName: 'Somn & Hormoni',
      badgeRequirement: 3
    }
  ];

  for (const question of seedQuestions) {
    await dbRun(
      'INSERT INTO quiz_questions (category, question, options_json, correct_index, explanation, badge_name, badge_requirement) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [question.category, question.question, JSON.stringify(question.options), question.correctIndex, question.explanation, question.badgeName, question.badgeRequirement]
    );
  }

  const templatesCount = await dbGet('SELECT COUNT(*) as count FROM feedback_templates');
  if (templatesCount && Number(templatesCount.count) > 0) {
    return;
  }

  const templates = [
    { type: 'water_low', title: 'Deshidratare detectată', body: 'Ai băut puțină apă. Încearcă să bei mai mult pentru a susține metabolismul și energia.', category: 'hidratare' },
    { type: 'water_ok', title: 'Hidratare bună', body: 'Ai atins o hidratare bună. Continuați cu ritmul stabil!', category: 'hidratare' },
    { type: 'sleep_low', title: 'Somn insuficient', body: 'Somnul tău este scăzut. Un somn mai bun poate ajuta la pofte și recuperare.', category: 'somn' },
    { type: 'sleep_ok', title: 'Somn bun', body: 'Somnul este în intervalul optim. Corpul tău se poate recupera mai bine.', category: 'somn' },
    { type: 'exercise_ok', title: 'Sport bun', body: 'Ai făcut activitate fizică. Continuă și vei îmbunătăți progresul.', category: 'sport' },
    { type: 'calories_ok', title: 'Bilanț caloric bun', body: 'Ești aproape de ținta ta calorică. Menține ritmul și vei avea rezultate mai bune.', category: 'calorii' }
  ];

  for (const template of templates) {
    await dbRun('INSERT INTO feedback_templates (type, title, body, category) VALUES (?, ?, ?, ?)', [template.type, template.title, template.body, template.category]);
  }
}

async function dbAll(sql, params = []) {
  await initializeDatabase();
  const convertedSql = convertPlaceholders(sql);
  const result = await pool.query(convertedSql, params);
  return result.rows;
}

async function dbGet(sql, params = []) {
  const rows = await dbAll(sql, params);
  return rows[0] || null;
}

async function dbRun(sql, params = []) {
  await initializeDatabase();
  let convertedSql = convertPlaceholders(sql);

  // PostgreSQL are nevoie de clauza RETURNING id pentru a returna id-ul generat automat la insert-uri
  if (convertedSql.trim().toUpperCase().startsWith('INSERT') && !convertedSql.toUpperCase().includes('RETURNING')) {
    convertedSql += ' RETURNING id';
  }

  const result = await pool.query(convertedSql, params);
  const insertId = result.rows[0]?.id || null;

  return { insertId, rowCount: result.rowCount };
}

async function closeDatabase() {
  if (!pool) {
    return;
  }
  await pool.end();
  pool = null;
}

module.exports = {
  initializeDatabase,
  dbAll,
  dbGet,
  dbRun,
  closeDatabase
};