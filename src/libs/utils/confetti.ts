import confetti from 'canvas-confetti';

/**
 * Fire a celebratory confetti burst from both sides of the screen,
 * then run a continuous shower for ~3 seconds.
 */
export function fireConfetti(): void {
  const duration = 3000;
  const end = Date.now() + duration;

  // Initial bursts from left and right
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.1, y: 0.6 },
  });
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.9, y: 0.6 },
  });

  // Continuous shower
  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    requestAnimationFrame(frame);
  };

  frame();
}
