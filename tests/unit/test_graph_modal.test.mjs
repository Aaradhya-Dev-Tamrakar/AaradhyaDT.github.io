import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');

// Read graph-data.js
const graphDataPath = path.join(ROOT, 'assets/js/data/graph-data.js');
const rawCode = fs.readFileSync(graphDataPath, 'utf-8');

// Evaluate GRAPH_DATA
const match = rawCode.match(/const GRAPH_DATA\s*=\s*(\{[\s\S]+\});/);
if (!match) {
  throw new Error('Could not parse GRAPH_DATA from assets/js/data/graph-data.js');
}
const GRAPH_DATA = JSON.parse(match[1]);

test('Graph Data: files collection has valid architecture metadata', () => {
  assert.ok(Array.isArray(GRAPH_DATA.files), 'files must be an array');
  assert.ok(GRAPH_DATA.files.length >= 20, 'must contain at least 20 code files');

  const fileNames = new Set(GRAPH_DATA.files.map((f) => f.name));
  assert.ok(fileNames.has('script.js'), 'must contain script.js');
  assert.ok(fileNames.has('ui.js'), 'must contain ui.js');
  assert.ok(fileNames.has('core.js'), 'must contain core.js');
  assert.ok(fileNames.has('verify.py'), 'must contain verify.py');
  assert.ok(fileNames.has('site_automation.py'), 'must contain site_automation.py');

  GRAPH_DATA.files.forEach((f) => {
    assert.ok(f.id, 'file must have an id');
    assert.ok(f.name, 'file must have a name');
    assert.ok(f.color, 'file must have a color');
    assert.ok(Array.isArray(f.symbols), 'file symbols must be an array');
  });
});

test('Graph Data: color scheme assigns expected category palette', () => {
  const fileMap = new Map(GRAPH_DATA.files.map((f) => [f.name, f]));

  const verifyPy = fileMap.get('verify.py');
  assert.equal(verifyPy.color, '#f472b6', 'verify.py must have pink/magenta tone');

  const siteAuto = fileMap.get('site_automation.py');
  assert.equal(siteAuto.color, '#ff8042', 'site_automation.py must have warm orange tone');

  const coreJs = fileMap.get('core.js');
  assert.equal(coreJs.color, '#56d364', 'core.js must have mint/emerald green tone');

  const uiJs = fileMap.get('ui.js');
  assert.equal(uiJs.color, '#e3b341', 'ui.js must have golden amber tone');

  const bgAnim = fileMap.get('bg-animations.js');
  assert.equal(bgAnim.color, '#38bdf8', 'bg-animations.js must have electric sky cyan tone');
});

test('Graph Data: nodes and edges integrity', () => {
  assert.ok(Array.isArray(GRAPH_DATA.nodes), 'nodes must be an array');
  assert.ok(GRAPH_DATA.nodes.length >= 100, 'must contain at least 100 symbol nodes');
  assert.ok(Array.isArray(GRAPH_DATA.edges), 'edges must be an array');

  const nodeCount = GRAPH_DATA.nodes.length;
  GRAPH_DATA.edges.forEach(([s, t]) => {
    assert.ok(s >= 0 && s < nodeCount, `source index ${s} must be in bounds`);
    assert.ok(t >= 0 && t < nodeCount, `target index ${t} must be in bounds`);
  });
});

test('Graph Data: explorer directory tree has hierarchical structure', () => {
  assert.ok(Array.isArray(GRAPH_DATA.tree), 'tree must be an array');
  const topNames = new Set(GRAPH_DATA.tree.map((item) => item.name));

  assert.ok(topNames.has('assets'), 'tree must contain assets');
  assert.ok(topNames.has('scripts'), 'tree must contain scripts');
  assert.ok(topNames.has('tests'), 'tree must contain tests');

  const assetsDir = GRAPH_DATA.tree.find((item) => item.name === 'assets');
  assert.ok(assetsDir && assetsDir.children, 'assets must have children');

  const jsDir = assetsDir.children.find((item) => item.name === 'js');
  assert.ok(jsDir && jsDir.children, 'assets/js must have children');
});
