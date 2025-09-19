const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all load profiles
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT l.*, t.name as transform_name FROM load_profiles l LEFT JOIN transform_profiles t ON l.transform_id = t.id ORDER BY l.created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new load profile (enforce unique name)
router.post('/', async (req, res) => {
  const { name, transform_id } = req.body;
  try {
    // Check for unique name
    const [existing] = await db.query('SELECT id FROM load_profiles WHERE name = ?', [name]);
    if (existing.length) {
      return res.status(400).json({ error: 'Load name must be unique.' });
    }
    // Get transform query
    const [transforms] = await db.query('SELECT query FROM transform_profiles WHERE id = ?', [transform_id]);
    if (!transforms.length) {
      return res.status(400).json({ error: 'Transform not found.' });
    }
    let query = transforms[0].query;
    // Forbid dangerous queries
    const forbidden = /^(\s)*(create|update|delete|drop|insert|alter|truncate)\b/i;
    if (forbidden.test(query)) {
      return res.status(400).json({ error: 'Transform query type not allowed.' });
    }
    // Run transform query and get result
    const [rows, fields] = await db.query(query);
    if (!rows.length) {
      return res.status(400).json({ error: 'Transform query returned no data.' });
    }
        // Build CREATE TABLE statement
        const columns = fields.map(f => `
          \`${f.name}\` VARCHAR(255)`).join(', ');
        const createTableSQL = `CREATE TABLE \`${name}\` (${columns})`;
        // Create table
        await db.query(createTableSQL);
        // Insert data
        const colNames = fields.map(f => `\`${f.name}\``).join(', ');
        const values = rows.map(row => '(' + fields.map(f => db.escape(row[f.name])).join(',') + ')').join(',');
        await db.query(`INSERT INTO \`${name}\` (${colNames}) VALUES ${values}`);
    // Save load profile
    const [result] = await db.query(
      'INSERT INTO load_profiles (name, transform_id) VALUES (?, ?)',
      [name, transform_id]
    );
    res.json({ id: result.insertId, name, transform_id, table_created: true, rows_inserted: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Delete a load profile
// Delete a load profile and its table
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Get load name
    const [loads] = await db.query('SELECT name FROM load_profiles WHERE id = ?', [id]);
    if (!loads.length) {
      return res.status(404).json({ error: 'Load not found' });
    }
    const loadName = loads[0].name;
  // Delete table
  await db.query(`DROP TABLE IF EXISTS \`${loadName}\``);
    // Delete load profile
    const [result] = await db.query('DELETE FROM load_profiles WHERE id = ?', [id]);
    if (result.affectedRows) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Load not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all transforms for selection
router.get('/transforms', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM transform_profiles ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Preview a load: get table schema, row count, and sample data
router.get('/:id/preview', async (req, res) => {
  const { id } = req.params;
  try {
    // Get load info
    const [loads] = await db.query('SELECT name, transform_id FROM load_profiles WHERE id = ?', [id]);
    if (!loads.length) {
      return res.status(404).json({ error: 'Load not found' });
    }
    const loadName = loads[0].name;
    const transformId = loads[0].transform_id;
    
    // Check if table exists
    const [tables] = await db.query('SHOW TABLES LIKE ?', [loadName]);
    if (!tables.length) {
      return res.status(404).json({ error: 'Table for this load does not exist.' });
    }
    
    // Get transform info
    const [transforms] = await db.query('SELECT id, name FROM transform_profiles WHERE id = ?', [transformId]);
    const transform = transforms.length ? transforms[0] : null;
    
    // Get table schema, row count, and sample data
    let columns = [];
    let countRows = [{ count: 0 }];
    let sampleRows = [];
    
    try {
      [columns] = await db.query(`SHOW COLUMNS FROM \`${loadName}\``);
      [countRows] = await db.query(`SELECT COUNT(*) as count FROM \`${loadName}\``);
      
      // Get sample data (first 10 rows)
      [sampleRows] = await db.query(`SELECT * FROM \`${loadName}\` LIMIT 10`);
      
    } catch (tableErr) {
      return res.status(500).json({ error: 'Error fetching table details: ' + tableErr.message });
    }
    
    res.json({
      schema: columns,
      rowCount: countRows[0].count,
      rows: sampleRows,
      transform
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
