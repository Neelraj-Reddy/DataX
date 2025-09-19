const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/lineage/:tableName
// Returns upstream lineage for a table: nodes and edges
router.get('/:tableName', async (req, res) => {
	const { tableName } = req.params;
	const parentLevel = parseInt(req.query.parent_level || '1');
	try {
		// Helper: get dependencies for a table via its load's transform
		async function getDependencies(table, level, visited) {
			if (level === 0 || visited.has(table)) return [];
			visited.add(table);
			const [loads] = await db.query('SELECT * FROM load_profiles WHERE name = ?', [table]);
			let deps = [];
			if (loads.length > 0) {
				const transformId = loads[0].transform_id;
				const [transforms] = await db.query('SELECT dependencies FROM transform_profiles WHERE id = ?', [transformId]);
				if (transforms.length > 0 && transforms[0].dependencies) {
					deps = transforms[0].dependencies.split(',').map(d => d.trim()).filter(Boolean);
				}
			}
			let allDeps = [];
			for (const dep of deps) {
				allDeps.push({ from: dep, to: table });
				if (level > 1) {
					const subDeps = await getDependencies(dep, level - 1, visited);
					allDeps = allDeps.concat(subDeps);
				}
			}
			return allDeps;
		}

		// DFS up to parentLevel
		let nodes = [{ id: tableName, label: tableName }];
		let edges = await getDependencies(tableName, parentLevel, new Set());
		edges.forEach(e => {
			nodes.push({ id: e.from, label: e.from });
		});

		// Remove duplicate nodes
		const nodeMap = {};
		nodes.forEach(n => { nodeMap[n.id] = n; });
		nodes = Object.values(nodeMap);

		res.json({ nodes, edges });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch lineage', details: err.message });
	}
});

module.exports = router;
