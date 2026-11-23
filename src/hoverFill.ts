// The fill starts at the point where the pointer entered the button.
// Colours invert so every button changes both its background and its text.
const PAPER = '#ebeae4';
const INK = '#090909';

function channels(colour: string): number[] {
  return (colour.match(/[\d.]+/g) ?? []).map(Number);
}

function isDark(colour: string): boolean {
  const [r = 0, g = 0, b = 0] = channels(colour);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

export function setupButtonHoverFill(): void {
  document.addEventListener('pointerover', event => {
    const element = event.target as Element | null;
    const button = element?.closest('button, [role="button"]') as HTMLElement | null;
    if (!button || (button instanceof HTMLButtonElement && button.disabled)) return;
    // Moving across a button's icon or label is not a new entry.
    if (event.relatedTarget instanceof Node && button.contains(event.relatedTarget)) return;

    const bounds = button.getBoundingClientRect();
    const background = getComputedStyle(button).backgroundColor;
    const transparent = background === 'transparent' || (channels(background)[3] ?? 1) === 0;
    const dark = !transparent && isDark(background);

    button.style.setProperty('--fill-x', `${event.clientX - bounds.left}px`);
    button.style.setProperty('--fill-y', `${event.clientY - bounds.top}px`);
    button.style.setProperty('--fill-bg', dark ? PAPER : INK);
    button.style.setProperty('--fill-fg', dark ? INK : PAPER);
  });
}
