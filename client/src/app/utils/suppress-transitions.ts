// Helper to suppress transitions during a theme switch or other global style swap.
// Usage: call `suppressTransitionsOnce()` immediately before toggling theme classes on <html>.
// It will add the `suppress-transitions` class (styles already added in `styles.css`),
// force a reflow, then remove the class on the next animation frame so transitions resume.

export function suppressTransitionsOnce(): void {
  if (typeof document === 'undefined') return; // SSR guard
  const root = document.documentElement;
  try {
    root.classList.add('suppress-transitions');
    // Force reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    void root.offsetHeight;
    // Remove on next frame so the theme swap happens with transitions suppressed
    requestAnimationFrame(() => {
      // One more frame to ensure any layout updates have been applied
      requestAnimationFrame(() => root.classList.remove('suppress-transitions'));
    });
  } catch (e) {
    // ignore errors silently
    root.classList.remove('suppress-transitions');
  }
}

// Example usage (in a component):
// import { suppressTransitionsOnce } from './utils/suppress-transitions';
// function toggleTheme() {
//   suppressTransitionsOnce();
//   document.documentElement.classList.toggle('dark-mode');
// }
