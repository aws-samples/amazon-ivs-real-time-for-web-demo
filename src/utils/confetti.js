import confetti from 'canvas-confetti';
import AWS_COLORS from '../constants/colors';

export function spawnConfetti(position) {
  let x = 0;
  let colors = [
    AWS_COLORS.rose[500],
    AWS_COLORS.rose[600],
    AWS_COLORS.orange[500],
    AWS_COLORS.yellow[500],
  ];
  let spread = 45;
  if (position === 'right') {
    x = 1;
    colors = [
      AWS_COLORS.indigo[500],
      AWS_COLORS.indigo[600],
      AWS_COLORS.violet[600],
      AWS_COLORS.blue[500],
    ];
    spread = -45;
  }

  confetti({
    colors,
    particleCount: 20,
    startVelocity: 40,
    spread,
    angle: 90,
    ticks: 50,
    shapes: ['star', 'circle'],
    origin: {
      x,
      // since they fall down, start a bit higher than random
      y: Math.random() * (0.7 - 0.5) + 0.5,
    },
  });
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function spawnFirework() {
  const colors = [
    AWS_COLORS.rose[500],
    AWS_COLORS.rose[600],
    AWS_COLORS.orange[500],
    AWS_COLORS.yellow[500],
    AWS_COLORS.indigo[500],
    AWS_COLORS.indigo[600],
    AWS_COLORS.violet[600],
    AWS_COLORS.blue[500],
  ];
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 50,
    colors,
  };

  const particleCount = 50;
  // since particles fall down, start a bit higher than random
  confetti({
    ...defaults,
    particleCount,
    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
  });
  confetti({
    ...defaults,
    particleCount,
    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
  });
}
