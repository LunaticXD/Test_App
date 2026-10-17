import confetti from 'canvas-confetti';

export function triggerTaskCompletionEffect() {
  // Confetti burst
  confetti({
    particleCount: 45,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'],
    disableForReducedMotion: true,
  });

  // Pleasant micro-audio feedback using Web Audio API
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Chord progression chime: 523Hz (C5) -> 659Hz (E5) -> 784Hz (G5)
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (err) {
    // Audio context may be blocked by autoplay policies
  }
}
