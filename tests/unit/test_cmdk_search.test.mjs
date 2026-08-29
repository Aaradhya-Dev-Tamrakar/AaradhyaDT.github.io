import test from 'node:test';
import assert from 'node:assert/strict';

// Static entries simulation
const CMDK_ENTRIES = [
  { type: 'page', title: 'Projects', href: 'projects.html', meta: 'Showcase', text: 'projects showcase portfolio' },
  { type: 'page', title: 'Experience', href: 'experience.html', meta: 'Career', text: 'experience career ieee' },
  { type: 'page', title: 'About', href: 'about.html', meta: 'Bio & Skills', text: 'about bio skills' },
  { type: 'action', title: 'Toggle Theme', href: 'action:theme', meta: 'Preferences', text: 'toggle theme dark light' },
  { type: 'action', title: 'Guided Tour', href: 'action:tour', meta: 'Interactive', text: 'guided tour walkthrough spotlight' }
];

const SEARCH_STATIC_INDEX = {
  achievement: [
    { type: 'achievement', title: 'Fuse AI Fellow', meta: 'Fusemachines · 2026', href: 'achievements.html#achv-0', text: 'fuse ai fellow fusemachines 2026 ml dl' },
    { type: 'achievement', title: 'IEEE Vice Chair', meta: 'IEEE KEC · 2025', href: 'achievements.html#achv-1', text: 'ieee vice chair kec student branch' }
  ],
  project: [
    { type: 'project', title: 'SPARK Wearable', meta: 'Edge AI · Active', href: 'projects.html#p-015', text: 'spark wearable esp32-s3 tflite fall detection edge ai' },
    { type: 'project', title: 'BiasAperture', meta: 'Computer Vision · 2026', href: 'projects.html#p-001', text: 'biasaperture fairness computer vision demographic' }
  ]
};

function buildSearchIndex() {
  const index = CMDK_ENTRIES.map(p => ({
    type: p.type || 'page',
    title: p.title,
    meta: p.meta || '',
    href: p.href,
    text: (p.text || (p.title + ' ' + (p.meta || ''))).toLowerCase()
  }));

  const byHref = new Map();
  SEARCH_STATIC_INDEX.achievement.forEach(item => byHref.set(item.href, item));
  SEARCH_STATIC_INDEX.project.forEach(item => byHref.set(item.href, item));

  return index.concat(Array.from(byHref.values()));
}

function executeQuery(index, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return index.slice(0, 50);
  const tokens = q.split(/\s+/).filter(Boolean);

  return index
    .filter(item => tokens.every(tok => item.text.includes(tok) || item.title.toLowerCase().includes(tok)))
    .sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      if (aTitle === q && bTitle !== q) return -1;
      if (bTitle === q && aTitle !== q) return 1;
      if (aTitle.startsWith(q) && !bTitle.startsWith(q)) return -1;
      if (bTitle.startsWith(q) && !aTitle.startsWith(q)) return 1;
      return 0;
    })
    .slice(0, 50);
}

test('CmdK Search: builds combined search index from pages and static data', () => {
  const index = buildSearchIndex();
  assert.ok(index.length >= 9, 'Index should combine pages, achievements, and projects');
  assert.ok(index.some(i => i.type === 'page'));
  assert.ok(index.some(i => i.type === 'achievement'));
  assert.ok(index.some(i => i.type === 'project'));
});

test('CmdK Search: exact title matching ranks top', () => {
  const index = buildSearchIndex();
  const results = executeQuery(index, 'projects');
  assert.ok(results.length > 0);
  assert.strictEqual(results[0].title, 'Projects', 'Exact match should rank first');
});

test('CmdK Search: multi-token queries filter correctly', () => {
  const index = buildSearchIndex();
  const results = executeQuery(index, 'spark esp32');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].title, 'SPARK Wearable');
});

test('CmdK Search: empty query returns default slice', () => {
  const index = buildSearchIndex();
  const results = executeQuery(index, '');
  assert.strictEqual(results.length, index.length);
});
