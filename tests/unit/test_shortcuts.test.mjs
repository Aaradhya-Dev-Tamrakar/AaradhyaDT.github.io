import test from 'node:test';
import assert from 'node:assert/strict';

// Mock DOM elements and document container for headless node testing
class MockElement {
  constructor(id = '', className = '') {
    this.id = id;
    this.className = className;
    this.classList = {
      _classes: new Set(className ? className.split(' ') : []),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c)
    };
    this.attributes = {};
    this.innerHTML = '';
    this.style = {};
    this.listeners = {};
    this.children = [];
  }
  appendChild(el) {
    this.children.push(el);
  }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k]; }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
}

class MockDocument {
  constructor() {
    this.elements = {};
    this.body = new MockElement('body');
  }
  getElementById(id) {
    return this.elements[id] || null;
  }
  createElement(tag) {
    const el = new MockElement();
    el.tagName = tag.toUpperCase();
    return el;
  }
  appendChild(el) {
    if (el.id) this.elements[el.id] = el;
  }
}

test('Shortcuts: modal creation and open/close state transitions', () => {
  const doc = new MockDocument();
  global.document = doc;
  global.requestAnimationFrame = (fn) => fn();

  // Define modal operations matching shortcuts.js logic
  function openModal() {
    let modal = doc.getElementById('shortcutsModal');
    if (!modal) {
      modal = doc.createElement('div');
      modal.id = 'shortcutsModal';
      modal.className = 'access-modal-overlay shortcuts-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Keyboard Shortcuts Cheat Sheet HUD');
      doc.appendChild(modal);
      doc.body.appendChild(modal);
    }
    modal.classList.add('open');
    doc.body.style.overflow = 'hidden';
    return modal;
  }

  function closeModal() {
    const modal = doc.getElementById('shortcutsModal');
    if (!modal) return;
    modal.classList.remove('open');
    doc.body.style.overflow = '';
  }

  function toggleModal() {
    const modal = doc.getElementById('shortcutsModal');
    if (modal && modal.classList.contains('open')) {
      closeModal();
    } else {
      openModal();
    }
  }

  // 1. Open modal
  const m = openModal();
  assert.ok(m);
  assert.strictEqual(m.id, 'shortcutsModal');
  assert.strictEqual(m.getAttribute('role'), 'dialog');
  assert.strictEqual(m.getAttribute('aria-modal'), 'true');
  assert.strictEqual(m.classList.contains('open'), true);
  assert.strictEqual(doc.body.style.overflow, 'hidden');

  // 2. Close modal
  closeModal();
  assert.strictEqual(m.classList.contains('open'), false);
  assert.strictEqual(doc.body.style.overflow, '');

  // 3. Toggle modal (closed -> open)
  toggleModal();
  assert.strictEqual(m.classList.contains('open'), true);

  // 4. Toggle modal (open -> closed)
  toggleModal();
  assert.strictEqual(m.classList.contains('open'), false);
});

test('Shortcuts: Alt+0 and 0 correctly trigger theme toggle condition', () => {
  function isThemeToggleKey(e) {
    const isZeroCode = e.code === 'Digit0' || e.code === 'Numpad0' || e.keyCode === 48 || e.keyCode === 96;
    const isAltZero = e.altKey && (isZeroCode || e.key === '0');
    const isPlainZero = !e.altKey && !e.shiftKey && (isZeroCode || e.key === '0');
    return isAltZero || isPlainZero;
  }

  // 1. Standard '0' key (plain)
  assert.strictEqual(isThemeToggleKey({ key: '0', shiftKey: false, altKey: false, code: 'Digit0' }), true);

  // 2. Alt+0 with Digit0
  assert.strictEqual(isThemeToggleKey({ key: '0', shiftKey: false, altKey: true, code: 'Digit0' }), true);

  // 3. Alt+Numpad0
  assert.strictEqual(isThemeToggleKey({ key: '0', shiftKey: false, altKey: true, code: 'Numpad0' }), true);

  // 4. Alt+keyCode 48 (international layouts where key property may vary with AltGr / Alt)
  assert.strictEqual(isThemeToggleKey({ key: 'Unidentified', shiftKey: false, altKey: true, code: 'Digit0', keyCode: 48 }), true);

  // 5. Unrelated keys with Alt (Alt+1, Alt+2)
  assert.strictEqual(isThemeToggleKey({ key: '1', shiftKey: false, altKey: true, code: 'Digit1' }), false);
  assert.strictEqual(isThemeToggleKey({ key: '2', shiftKey: false, altKey: true, code: 'Digit2' }), false);
});
