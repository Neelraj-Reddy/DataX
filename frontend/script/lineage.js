// Helper: API base URL
const API_BASE = '/api';

const tableSelect = document.getElementById('table-select');
const parentLevelInput = document.getElementById('parent-level');
const updateLineageBtn = document.getElementById('update-lineage-btn');
const statusDiv = document.getElementById('status-message');
const networkDiv = document.getElementById('network');
let network = null;

function showStatus(msg, type = 'info', timeout = 3000) {
	statusDiv.innerHTML = `<div class="alert alert-${type} text-center mb-2 py-2">${msg}</div>`;
	if (timeout) setTimeout(() => { statusDiv.innerHTML = ''; }, timeout);
}

// Fetch all tables for dropdown
async function fetchTables() {
	try {
		const res = await fetch(API_BASE + '/editor/tables');
		const tables = await res.json();
		if (res.ok) {
			tableSelect.innerHTML = tables.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
			if (tables.length) {
				showLineage(tables[0].name);
			}
		} else {
			showStatus('Error loading tables', 'danger');
		}
	} catch {
		showStatus('Error loading tables', 'danger');
	}
}


function getParentLevel() {
	let val = parseInt(parentLevelInput.value);
	return isNaN(val) || val < 1 ? 1 : val;
}

tableSelect.onchange = () => {
	showLineage(tableSelect.value, getParentLevel());
};

updateLineageBtn.onclick = () => {
	showLineage(tableSelect.value, getParentLevel());
};

// Fetch lineage and render graph
async function showLineage(tableName, parentLevel) {
	showStatus('Loading lineage...', 'info', 0);
	try {
		const res = await fetch(API_BASE + `/lineage/${encodeURIComponent(tableName)}?parent_level=${parentLevel}`);
		const data = await res.json();
		if (res.ok) {
			renderGraph(data.nodes, data.edges);
			showStatus('Lineage loaded', 'success');
		} else {
			showStatus('Error loading lineage', 'danger');
		}
	} catch {
		showStatus('Error loading lineage', 'danger');
	}
}

function renderGraph(nodes, edges) {
	// All nodes are tables
	const visNodes = nodes.map(n => ({
		id: n.id,
		label: n.label,
		shape: 'box',
		color: {
			background: '#3b82f6',
			border: '#1d4ed8',
			highlight: {
				background: '#60a5fa',
				border: '#2563eb'
			}
		},
		font: { color: '#ffffff', size: 14, face: 'Arial' },
		borderWidth: 2,
		borderWidthSelected: 3
	}));
	
	const visEdges = edges.map(e => ({ 
		from: e.from, 
		to: e.to, 
		arrows: 'to',
		color: {
			color: '#64748b',
			highlight: '#3b82f6'
		},
		width: 2,
		smooth: {
			type: 'cubicBezier',
			forceDirection: 'vertical',
			roundness: 0.4
		}
	}));
	
	const data = { nodes: visNodes, edges: visEdges };
	
	const options = {
		layout: { 
			hierarchical: { 
				direction: 'UD', 
				sortMethod: 'directed',
				nodeSpacing: 100,
				levelSeparation: 150
			} 
		},
		nodes: { 
			borderWidth: 2,
			shadow: {
				enabled: true,
				color: 'rgba(0,0,0,0.3)',
				size: 10,
				x: 5,
				y: 5
			}
		},
		edges: { 
			arrows: { 
				to: { 
					enabled: true, 
					scaleFactor: 1.2 
				} 
			},
			shadow: {
				enabled: true,
				color: 'rgba(0,0,0,0.2)',
				size: 5,
				x: 3,
				y: 3
			}
		},
		physics: {
			enabled: false
		},
		interaction: {
			dragNodes: true,
			dragView: true,
			zoomView: true,
			selectConnectedEdges: true
		}
	};
	
	if (network) network.destroy();
	network = new vis.Network(networkDiv, data, options);
	
	// Add event listeners for network interactions
	network.on("click", function (params) {
		if (params.nodes.length > 0) {
			const nodeId = params.nodes[0];
			const node = visNodes.find(n => n.id === nodeId);
			if (node) {
				showStatus(`Selected table: ${node.label}`, 'info', 2000);
			}
		}
	});
	
	// Fit the network to screen after a short delay
	setTimeout(() => {
		network.fit({
			animation: {
				duration: 1000,
				easingFunction: 'easeInOutQuad'
			}
		});
	}, 100);
}

// Network control functions
function fitToScreen() {
	if (network) {
		network.fit({
			animation: {
				duration: 1000,
				easingFunction: 'easeInOutQuad'
			}
		});
	}
}

function centerNetwork() {
	if (network) {
		const nodeIds = network.getNodeIds();
		if (nodeIds.length > 0) {
			network.focus(nodeIds[0], {
				scale: 1.0,
				animation: {
					duration: 1000,
					easingFunction: 'easeInOutQuad'
				}
			});
		}
	}
}

function zoomIn() {
	if (network) {
		const scale = network.getScale();
		network.moveTo({
			scale: scale * 1.5,
			animation: {
				duration: 300,
				easingFunction: 'easeInOutQuad'
			}
		});
	}
}

function zoomOut() {
	if (network) {
		const scale = network.getScale();
		network.moveTo({
			scale: scale * 0.75,
			animation: {
				duration: 300,
				easingFunction: 'easeInOutQuad'
			}
		});
	}
}

fetchTables();
