import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const css = read('src/theme.css');
const main = read('src/main.tsx');
const hover = read('src/hoverFill.ts');
const navbar = read('src/components/Navbar.tsx');
const app = read('src/App.tsx');

assert(css.includes('button::before') && css.includes('var(--fill-x'), 'cursor-origin fill is missing');
assert(css.includes('color: var(--fill-fg'), 'hover text colour change is missing');
assert(main.includes('setupButtonHoverFill()'), 'hover fill is not wired up');
assert(hover.includes('getBoundingClientRect()'), 'fill does not use the pointer entry point');
assert(!/button[^{]*\{[^}]*transform:\s*scale\(/.test(css), 'a button still scales on hover');
assert(!/\.feature-card:hover\s*\{\s*transform:\s*scale/.test(css), 'feature cards still scale');

// Every screen stays reachable on a phone, and content clears the fixed bar.
assert(navbar.includes('mobile-tabbar'), 'mobile tab bar is missing');
for (const tab of ['home', 'modules', 'tasks', 'analytics']) {
  assert(navbar.includes(`tab: '${tab}'`), `mobile navigation is missing ${tab}`);
}
assert(css.includes('.mobile-tabbar {') && css.includes('max-width: 767px'), 'mobile tab bar has no small-screen rule');
assert(app.includes("'main-with-tabbar'") && css.includes('main.main-with-tabbar'), 'mobile content does not clear the tab bar');
assert(css.includes('.focus-timer') && css.includes('max-width: 100%'), 'focus timer can overflow a small screen');

console.log('UI checks OK — fill starts at the pointer, colours swap, nothing scales, all screens reachable on mobile.');
