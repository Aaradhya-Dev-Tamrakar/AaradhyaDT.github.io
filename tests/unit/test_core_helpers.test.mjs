import test from 'node:test';
import assert from 'node:assert/strict';

function getCurrentPageFile(pathname) {
  const raw = pathname.split('/').pop() || 'index.html';
  if (!raw || raw === '/' || raw === '') return 'index.html';
  return raw.endsWith('.html') ? raw : (raw + '.html');
}

function getLinkTargetPage(href) {
  if (!href) return '';
  const trimmed = href.trim();
  if (trimmed.startsWith('#')) return ''; // In-page anchor fragment, not a separate page
  const pathPart = trimmed.split('#')[0];
  if (!pathPart || pathPart === '/') return 'index.html';
  const file = pathPart.split('/').pop();
  if (!file) return 'index.html';
  return file.endsWith('.html') ? file : (file + '.html');
}

function computeLiveDates(testDate) {
  const now = testDate ? new Date(testDate) : new Date();

  // Fuse AI Fellowship calculation (Anchor: Mon 4 May 2026)
  const fuseStart = new Date('2026-05-04T00:00:00+05:45');
  const msDiff = now - fuseStart;
  const daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor(daysDiff / 7) + 1;
  const fuseWeek = Math.max(1, Math.min(24, weekNum));

  // Semester calculation (Switches from IV/I to IV/II on Sep 1, 2026)
  const isIV2 = now >= new Date('2026-09-01T00:00:00+05:45');
  const semLabel = isIV2 ? 'BEI IV/II' : 'BEI IV/I';

  return {
    fuseWeek,
    isIV2,
    semLabel,
    heroTag: semLabel + ' · KEC, IOE · Tribhuvan University'
  };
}

test('Core: getCurrentPageFile resolves pathnames accurately', () => {
  assert.strictEqual(getCurrentPageFile('/'), 'index.html');
  assert.strictEqual(getCurrentPageFile('/index.html'), 'index.html');
  assert.strictEqual(getCurrentPageFile('/about.html'), 'about.html');
  assert.strictEqual(getCurrentPageFile('/projects'), 'projects.html');
  assert.strictEqual(getCurrentPageFile('https://aaradhyadt.github.io/journey.html'), 'journey.html');
});

test('Core: getLinkTargetPage resolves page destinations and ignores in-page anchors', () => {
  assert.strictEqual(getLinkTargetPage('#work'), '', '#work in-page anchor should not resolve to a page file');
  assert.strictEqual(getLinkTargetPage('#hero'), '', '#hero in-page anchor should not resolve to a page file');
  assert.strictEqual(getLinkTargetPage('/'), 'index.html');
  assert.strictEqual(getLinkTargetPage('/index.html'), 'index.html');
  assert.strictEqual(getLinkTargetPage('/projects.html'), 'projects.html');
  assert.strictEqual(getLinkTargetPage('/projects.html#p-018'), 'projects.html');
  assert.strictEqual(getLinkTargetPage('/experience.html'), 'experience.html');
  assert.strictEqual(getLinkTargetPage('/about.html'), 'about.html');
  assert.strictEqual(getLinkTargetPage('/journey.html'), 'journey.html');
  assert.strictEqual(getLinkTargetPage('/contact.html'), 'contact.html');
});

test('Core: computeLiveDates calculates correct semester before and after cutoff', () => {
  const beforeSep = computeLiveDates('2026-08-15T12:00:00+05:45');
  assert.strictEqual(beforeSep.isIV2, false);
  assert.strictEqual(beforeSep.semLabel, 'BEI IV/I');
  assert.ok(beforeSep.heroTag.includes('BEI IV/I'));

  const afterSep = computeLiveDates('2026-09-05T12:00:00+05:45');
  assert.strictEqual(afterSep.isIV2, true);
  assert.strictEqual(afterSep.semLabel, 'BEI IV/II');
  assert.ok(afterSep.heroTag.includes('BEI IV/II'));
});

test('Core: computeLiveDates clamps fellowship weeks between 1 and 24', () => {
  const early = computeLiveDates('2026-04-01T00:00:00+05:45');
  assert.strictEqual(early.fuseWeek, 1, 'Early dates should clamp to week 1');

  const late = computeLiveDates('2027-01-01T00:00:00+05:45');
  assert.strictEqual(late.fuseWeek, 24, 'Dates past fellowship should clamp to week 24');
});
