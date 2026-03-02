document.addEventListener('DOMContentLoaded', () => {
  // Animate impact numbers
  document.querySelectorAll('.impact-stat__number').forEach(el => {
    const target = parseInt(el.dataset.target);
    if (!isNaN(target)) { el.textContent = '0'; setTimeout(() => animateNumber(el, target, 1500), 500); }
  });
});
