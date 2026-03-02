/**
 * ══════════════════════════════════════════════════
 *  FUTURE MIRROR — Home Page JavaScript
 * ══════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Three.js scene
  const threeScene = initThreeScene('three-container');

  // Animate stat numbers
  document.querySelectorAll('.stat-item__number').forEach(el => {
    const text = el.textContent;
    const num = parseInt(text);
    if (!isNaN(num) && num < 9999) {
      el.textContent = '0';
      setTimeout(() => animateNumber(el, num, 1500), 500);
    }
  });
});
