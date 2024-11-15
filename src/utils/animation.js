// Restarts a css animation
export const restartCssAnimation = (elem) => {
  if (!elem) return;

  elem.style.animationName = 'none';

  requestAnimationFrame(() => {
    setTimeout(() => {
      elem.style.animationName = '';
    }, 0);
  });
};
