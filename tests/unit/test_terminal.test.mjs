import test from 'node:test';
import assert from 'node:assert/strict';

function parseTerminalCommand(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return { cmd: '', args: [] };
  const parts = trimmed.split(/\s+/);
  const rawCmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Command aliases
  const aliases = {
    'ls': 'projects',
    'whoami': 'about',
    'cat': 'help',
    'ping': 'stats',
    'cls': 'clear'
  };

  const cmd = aliases[rawCmd] || rawCmd;
  return { cmd, rawCmd, args };
}

function resolveNavigationTarget(arg) {
  const map = {
    'home': 'index.html',
    'projects': 'projects.html',
    'project': 'projects.html',
    'experience': 'experience.html',
    'achievements': 'achievements.html',
    'achievement': 'achievements.html',
    'about': 'about.html',
    'journey': 'journey.html',
    'contact': 'contact.html',
    'terms': 'terms.html',
    'privacy': 'privacy.html'
  };
  return map[(arg || '').trim().toLowerCase()] || null;
}

test('Terminal: parseTerminalCommand handles commands, whitespace, and arguments', () => {
  const parsed = parseTerminalCommand('   filter   aiml   ');
  assert.strictEqual(parsed.cmd, 'filter');
  assert.deepStrictEqual(parsed.args, ['aiml']);
});

test('Terminal: aliases map correctly to canonical commands', () => {
  assert.strictEqual(parseTerminalCommand('ls').cmd, 'projects');
  assert.strictEqual(parseTerminalCommand('whoami').cmd, 'about');
  assert.strictEqual(parseTerminalCommand('cls').cmd, 'clear');
  assert.strictEqual(parseTerminalCommand('ping').cmd, 'stats');
});

test('Terminal: resolveNavigationTarget resolves valid and invalid page targets', () => {
  assert.strictEqual(resolveNavigationTarget('projects'), 'projects.html');
  assert.strictEqual(resolveNavigationTarget('about'), 'about.html');
  assert.strictEqual(resolveNavigationTarget('home'), 'index.html');
  assert.strictEqual(resolveNavigationTarget('nonexistent'), null);
});
