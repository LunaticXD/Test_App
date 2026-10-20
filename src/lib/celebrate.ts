import confetti from 'canvas-confetti';
import { getThemeColors } from './theme';

/**
 * Confetti burst in the active theme's colours.
 *
 * Sound is intentionally NOT played here: callers use soundFX.playSuccess() on the shared audio
 * engine, so there is a single chime that respects mute. (This function used to spin up a brand
 * new AudioContext on every call, which leaks contexts and ignored the mute button.)
 */
export function triggerTaskCompletionEffect() {
  const { accent, secondary, tertiary } = getThemeColors();
  confetti({
    particleCount: 45,
    spread: 60,
    origin: { y: 0.8 },
    colors: [accent, secondary, tertiary, '#ffffff'],
    disableForReducedMotion: true,
  });
}
