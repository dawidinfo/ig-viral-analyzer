import confetti from 'canvas-confetti';

export function useConfetti() {
  const fireConfetti = () => {
    // Erste Salve - von links
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.6 },
      colors: ['#8B5CF6', '#A855F7', '#D946EF', '#22D3EE', '#10B981'],
    });

    // Zweite Salve - von rechts
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.9, y: 0.6 },
        colors: ['#8B5CF6', '#A855F7', '#D946EF', '#22D3EE', '#10B981'],
      });
    }, 200);

    // Dritte Salve - von der Mitte
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#8B5CF6', '#22D3EE'],
      });
    }, 400);
  };

  const fireSuccessConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Konfetti von beiden Seiten
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#8B5CF6', '#A855F7', '#D946EF', '#FFD700'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#22D3EE', '#10B981', '#FFD700', '#FFA500'],
      });
    }, 250);
  };

  return { fireConfetti, fireSuccessConfetti };
}
