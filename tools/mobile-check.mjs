// Phone-sized checks for every page in headless Edge/Chrome with touch emulation (320 → 768px):
// no horizontal scroll, tap targets at least 44×44px, form inputs at least 16px (no iOS zoom),
// no text under 12px, no JS errors; then the mobile menu's focus trap and Escape. Fails on any
// problem and saves a screenshot per page/width. No dependencies (Node 22+).
//
//   python -m http.server 4410              (in one terminal)
//   node tools/mobile-check.mjs [outDir]    (in another; BROWSER=path\to\chrome.exe, WIDTHS=320,390)
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import nodePath from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4410';
const OUT = process.argv[2] ?? nodePath.join(tmpdir(), 'maileny-mobile');
const BROWSER =
  process.env.BROWSER ??
  (process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : 'google-chrome');
const PAGES = (process.env.PAGES ?? '/,/404.html').split(',').filter(Boolean);
const WIDTHS = (process.env.WIDTHS ?? '320,360,390,430,768').split(',').map(Number);
const HEIGHTS = { 320: 640, 360: 800, 390: 844, 430: 932, 768: 1024 };
const PORT = 9334;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

await mkdir(OUT, { recursive: true });
const profile = await mkdtemp(nodePath.join(tmpdir(), 'maileny-browser-'));
const browser = spawn(BROWSER, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--hide-scrollbars',
  'about:blank',
]);

let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  target = await fetch(`http://127.0.0.1:${PORT}/json/list`)
    .then((r) => r.json())
    .then((list) => list.find((t) => t.type === 'page'))
    .catch(() => undefined);
}
if (!target) throw new Error(`Could not start ${BROWSER}`);

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
let nextId = 0;
const pending = new Map();
const listeners = new Set();
ws.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else listeners.forEach((fn) => fn(msg));
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, (msg) => (msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

const errors = [];
const fromSite = (details) =>
  [details.url, ...(details.stackTrace?.callFrames ?? []).map((f) => f.url)].some((url) => url?.startsWith(BASE));
listeners.add((msg) => {
  if (msg.method === 'Runtime.exceptionThrown' && fromSite(msg.params.exceptionDetails))
    errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
});
await send('Runtime.enable');
await send('Page.enable');

const navigate = async (url) => {
  const loaded = new Promise((resolve) => {
    const fn = (msg) => msg.method === 'Page.loadEventFired' && (listeners.delete(fn), resolve());
    listeners.add(fn);
  });
  await send('Page.navigate', { url });
  await Promise.race([loaded, sleep(15000)]);
  await sleep(2000);
};

// Scrolls through the page (pinned sections, lazy images and reveals all run), then measures.
// Links inside running text are exempt from the 44px rule (WCAG 2.5.8 inline exception) and
// listed separately.
const MEASURE = `(async () => {
  const doc = document.documentElement;
  for (let y = 0, i = 0; y < doc.scrollHeight && i < 120; y += innerHeight * 0.8, i++) {
    scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 50));
  }
  scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 400));
  const width = doc.clientWidth;
  const name = (el) => (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/)[0] : el.tagName.toLowerCase());
  const shown = (el) => {
    if (el.closest('[inert], [hidden], [aria-hidden="true"]')) return false;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0 && r.width > 0 && r.height > 0;
  };
  const overflow = [];
  if (doc.scrollWidth > width)
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.right > width + 1 && getComputedStyle(el).position !== 'fixed') overflow.push(name(el));
      if (overflow.length > 6) break;
    }
  const small = new Set();
  const inline = new Set();
  for (const el of document.querySelectorAll('a[href], button, summary, label.form__chip, input:not([type=hidden], [type=radio], [type=checkbox]), select, textarea')) {
    if (!shown(el) || el.closest('.form__hidden')) continue;
    const r = el.getBoundingClientRect();
    if (r.width >= 44 && r.height >= 44) continue;
    const block = el.closest('p, li, dd');
    const inText = getComputedStyle(el).display === 'inline' && block && block.textContent.trim().length > el.textContent.trim().length + 5;
    (inText ? inline : small).add(name(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  }
  const tinyText = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const el = walker.currentNode.parentElement;
    if (!walker.currentNode.textContent.trim() || !shown(el) || el.closest('.sr-only, [data-loader], .cursor')) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 12) tinyText.add(name(el) + ' ' + size.toFixed(1) + 'px');
  }
  const zoomInputs = [...document.querySelectorAll('input:not([type=hidden], [type=radio], [type=checkbox]), select, textarea')]
    .filter((el) => !el.closest('.form__hidden') && parseFloat(getComputedStyle(el).fontSize) < 16)
    .map((el) => el.name || name(el));
  return { scrollWidth: doc.scrollWidth, clientWidth: width, overflow, small: [...small], inline: [...inline], tinyText: [...tinyText], zoomInputs };
})()`;

const results = [];
for (const width of WIDTHS) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: HEIGHTS[width] ?? 900, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  for (const page of PAGES) {
    const before = errors.length;
    await navigate(BASE + page);
    const m = await Promise.race([evaluate(MEASURE), sleep(60000).then(() => null)]);
    const pageErrors = errors.slice(before);
    const problems = m
      ? [
          ...(m.scrollWidth > m.clientWidth ? [`overflow ${m.scrollWidth}/${m.clientWidth}: ${m.overflow.join(', ')}`] : []),
          ...(m.small.length ? [`tap targets < 44px: ${m.small.join(', ')}`] : []),
          ...(m.tinyText.length ? [`text < 12px: ${m.tinyText.join(', ')}`] : []),
          ...(m.zoomInputs.length ? [`inputs < 16px: ${m.zoomInputs.join(', ')}`] : []),
          ...(pageErrors.length ? [`errors: ${pageErrors.join(' | ')}`] : []),
        ]
      : ['timed out measuring'];
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
    const file = `${page === '/' ? 'index' : page.slice(1).replace('.html', '')}-${width}.jpg`;
    await writeFile(nodePath.join(OUT, file), Buffer.from(shot.data, 'base64'));
    results.push(problems.length === 0);
    console.log(`${problems.length ? 'FAIL' : 'PASS'}  ${String(width).padStart(4)}px  ${page.padEnd(16)}${problems.map((p) => `\n      ${p}`).join('')}`);
    if (m?.inline.length) console.log(`      (inline text links, exempt: ${m.inline.join(', ')})`);
  }
}

// Mobile menu: opening moves focus in, Tab and Shift+Tab stay inside the header + menu, Escape
// closes it and returns focus to the toggle. PAGES='' skips the page checks (menu only).
const key = async (keyName, shift = false) => {
  const params = { key: keyName, code: keyName, windowsVirtualKeyCode: keyName === 'Tab' ? 9 : 27, modifiers: shift ? 8 : 0 };
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...params });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
  await sleep(60);
};
const focusIn = () =>
  evaluate(`(() => {
    const a = document.activeElement;
    if (a.closest('[data-menu]')) return 'menu';
    if (a.matches('[data-nav-toggle]')) return 'toggle';
    return a.closest('[data-header]') ? 'header' : 'page:' + (a.className || a.tagName);
  })()`);
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await navigate(`${BASE}/`);
await evaluate(`document.querySelector('[data-nav-toggle]').click()`);
await sleep(900);
const menuProblems = [];
const opened = await focusIn();
if (opened !== 'menu') menuProblems.push(`focus after opening is on ${opened}`);
const trail = [];
for (let i = 0; i < 12; i++) {
  await key('Tab');
  trail.push(await focusIn());
}
for (let i = 0; i < 12; i++) {
  await key('Tab', true);
  trail.push(await focusIn());
}
const escaped = trail.filter((where) => where.startsWith('page:'));
if (escaped.length) menuProblems.push(`Tab left the open menu: ${[...new Set(escaped)].join(', ')}`);
if (!trail.includes('toggle')) menuProblems.push('the close button is not reachable with Tab');
// inert also hides the page from screen readers, which aria-modal alone doesn't guarantee.
const pageInert = await evaluate(`document.querySelector('main').closest('[inert]') !== null`);
if (!pageInert) menuProblems.push('the page behind the open menu is not inert (screen readers can reach it)');
await key('Escape');
await sleep(300);
const closed = await evaluate(`[!document.documentElement.classList.contains('menu-open'), document.activeElement.matches('[data-nav-toggle]')]`);
if (!closed[0]) menuProblems.push('Escape did not close the menu');
if (!closed[1]) menuProblems.push('focus did not return to the toggle');
results.push(menuProblems.length === 0);
console.log(`${menuProblems.length ? 'FAIL' : 'PASS'}  mobile menu${menuProblems.map((p) => `\n      ${p}`).join('')}`);

ws.close();
browser.kill();
await sleep(1500);
await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
const failed = results.filter((ok) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} passed. Screenshots: ${OUT}`);
process.exitCode = failed ? 1 : 0;
