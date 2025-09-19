// All route definitions must come after router initialization
const express = require('express');
const router = express.Router();
const db = require('../db');





// Run a transform query and return first 10 results
router.post('/run', async (req, res) => {
	let { query } = req.body;
	if (!query) return res.status(400).json({ error: 'No query provided' });
	try {
		// Forbid dangerous queries
		const forbidden = /^(\s)*(create|update|delete|drop|insert|alter|truncate)\b/i;
		if (forbidden.test(query)) {
			return res.status(400).json({ error: 'Query type not allowed.' });
		}
		// Try to limit results to 10 if not already present
		if (!/limit\s+\d+/i.test(query)) {
			query = query.replace(/;*\s*$/, '') + ' LIMIT 10';
		}
		const [rows] = await db.query(query);
		res.json({ success: true, rows });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});


// Get all transform profiles
router.get('/', async (req, res) => {
	try {
		const [rows] = await db.query('SELECT * FROM transform_profiles ORDER BY created_at DESC');
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Add a new transform profile
router.post('/', async (req, res) => {
	const { name, query, dependencies } = req.body;
	try {
		const depStr = Array.isArray(dependencies) ? dependencies.join(',') : '';
		const [result] = await db.query(
			'INSERT INTO transform_profiles (name, query, dependencies) VALUES (?, ?, ?)',
			[name, query, depStr]
		);
		res.json({ id: result.insertId, name, query, dependencies });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get all table names for dependencies
router.get('/tables', async (req, res) => {
	try {
		const [rows] = await db.query("SHOW TABLES");
		// MySQL returns table names as { 'Tables_in_datax': 'tableName' }
		const tables = rows.map(row => Object.values(row)[0]);
		res.json(tables);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});


// Validate SQL query (run but do not commit changes)
router.post('/validate', async (req, res) => {
	const { query } = req.body;
	if (!query) return res.status(400).json({ error: 'No query provided' });
	try {
		// Forbid dangerous queries
		const forbidden = /^(\s)*(create|update|delete|drop|insert|alter|truncate)\b/i;
		if (forbidden.test(query)) {
			return res.status(400).json({ error: 'Query type not allowed.' });
		}
		const [result] = await db.query(query);
		res.json({ success: true, result });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Delete a transform profile
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const [result] = await db.query('DELETE FROM transform_profiles WHERE id = ?', [id]);
		if (result.affectedRows) {
			res.json({ success: true });
		} else {
			res.status(404).json({ error: 'Transform not found' });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Edit (update) a transform profile
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { name, query, dependencies } = req.body;
	try {
		const depStr = Array.isArray(dependencies) ? dependencies.join(',') : dependencies || '';
		const [result] = await db.query(
			'UPDATE transform_profiles SET name = ?, query = ?, dependencies = ? WHERE id = ?',
			[name, query, depStr, id]
		);
		if (result.affectedRows) {
			res.json({ success: true });
		} else {
			res.status(404).json({ error: 'Transform not found' });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});


module.exports = router;

