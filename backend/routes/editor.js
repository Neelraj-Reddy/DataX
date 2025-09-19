const express = require('express');
const router = express.Router();
const db = require('../db');

// Utility: get all real tables in DB
async function getDbTables() {
  const [rows] = await db.query('SHOW TABLES');
  return rows.map(row => Object.values(row)[0]);
}

// Parse SQL and return used tables (excluding CTE/temp)
router.post('/dependencies', async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'No SQL provided' });
  try {
    // Get all real tables
    const dbTables = await getDbTables();
    // Find table names in SQL (simple regex for FROM, JOIN, etc.)
    const regex = /(?:from|join|update|into|table)\s+([`"\[]?\w+[`"\]]?)/gi;
    let matches = [];
    let match;
    while ((match = regex.exec(sql)) !== null) {
      let table = match[1].replace(/[`"\[\]]/g, '');
      matches.push(table);
    }
    // Remove duplicates and filter only real tables
    const usedTables = [...new Set(matches)].filter(t => dbTables.includes(t));
    res.json({ tables: usedTables });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run SQL and return result
router.post('/run', async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'No SQL provided' });
  try {
    // Forbid dangerous queries
    const forbidden = /^(\s)*(create|update|delete|drop|insert|alter|truncate)\b/i;
    if (forbidden.test(sql)) {
      return res.status(400).json({ error: 'Query type not allowed.' });
    }
    const [rows, fields] = await db.query(sql);
    res.json({ rows, fields });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all tables and their schemas
router.get('/tables', async (req, res) => {
  try {
    const [tables] = await db.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    let result = [];
    for (const table of tableNames) {
      const [columns] = await db.query(`SHOW COLUMNS FROM \
${'`'}${table}${'`'}`);
      result.push({ name: table, columns });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
