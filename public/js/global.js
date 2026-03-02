/**
 * ══════════════════════════════════════════════════
 *  FUTURE MIRROR — Global JavaScript
 *  Nav, theme toggle, Lenis, utilities
 * ══════════════════════════════════════════════════
 */

/* ── API Base URL ────────────────────────────────── */
const API_BASE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
  ? (window.location.port === '5500' || window.location.port === '5501'
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`)
  : `${window.location.origin}/api`;

/* ── Theme Management ────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('fm-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('fm-theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ── Mobile Menu ─────────────────────────────────── */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const links = document.querySelector('.navbar__links');
  if (!hamburger || !links) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    links.classList.toggle('open');
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      links.classList.remove('open');
    });
  });
}

/* ── Active Nav Link ─────────────────────────────── */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ── Lenis Smooth Scroll ─────────────────────────── */
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/* ── Intersection Observer for animations ────────── */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

/* ── API Helper ──────────────────────────────────── */
async function apiCall(endpoint, data = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API call failed (${endpoint}):`, err.message);
    return null;
  }
}

async function apiGet(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API GET failed (${endpoint}):`, err.message);
    return null;
  }
}

/* ── LocalStorage Helpers ────────────────────────── */
function saveAssessment(data) {
  localStorage.setItem('fm-assessment', JSON.stringify(data));
}

function getAssessment() {
  const raw = localStorage.getItem('fm-assessment');
  return raw ? JSON.parse(raw) : null;
}

function saveResults(data) {
  localStorage.setItem('fm-results', JSON.stringify(data));
}

function getResults() {
  const raw = localStorage.getItem('fm-results');
  return raw ? JSON.parse(raw) : null;
}

/* ── Loading Overlay ─────────────────────────────── */
function showLoading(message = 'Analyzing your future...') {
  let overlay = document.querySelector('.loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `<div class="spinner"></div><p style="color:var(--text-secondary)">${message}</p>`;
    document.body.appendChild(overlay);
  }
  overlay.querySelector('p').textContent = message;
  requestAnimationFrame(() => overlay.classList.add('active'));
}

function hideLoading() {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) overlay.classList.remove('active');
}

/* ── Score Color Helper ──────────────────────────── */
function getScoreColor(score) {
  if (score >= 70) return 'var(--success)';
  if (score >= 40) return 'var(--warning)';
  return 'var(--danger)';
}

function getScoreClass(score) {
  if (score >= 70) return 'score-optimal';
  if (score >= 40) return 'score-moderate';
  return 'score-risk';
}

function getScoreEmoji(score) {
  if (score >= 80) return '💪';
  if (score >= 60) return '😊';
  if (score >= 40) return '😐';
  if (score >= 20) return '😴';
  return '⚠️';
}

/* ── Number Animation ────────────────────────────── */
function animateNumber(element, target, duration = 1000) {
  const start = parseInt(element.textContent) || 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    element.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ── Navbar HTML Generator ───────────────────────── */
function generateNavbar() {
  return `
  <nav class="navbar">
    <a href="index.html" class="navbar__logo">
      <span>🌌</span> Future Mirror
    </a>
    <div class="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </div>
    <div class="navbar__links">
      <a href="index.html">Home</a>
      <a href="assessment.html">Assessment</a>
      <a href="dashboard.html">Dashboard</a>
      <a href="timeline.html">Timeline</a>
      <a href="alternate.html">Alternate</a>
      <a href="comparison.html">Compare</a>
      <a href="divergence.html">Divergence</a>
      <a href="blueprint.html">Blueprint</a>
      <a href="problems.html">Problems</a>
      <a href="aging.html">Aging</a>
    </div>
    <div class="navbar__actions">
      <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle theme">☀️</button>
    </div>
  </nav>`;
}

/* ── Footer HTML Generator ───────────────────────── */
function generateFooter() {
  return `
  <footer class="footer">
    <p>🌌 Future Mirror — Behavioral Future Simulation Engine | Built with ❤️</p>
  </footer>`;
}

/* ── Init ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  setActiveNavLink();
  initLenis();
  initScrollAnimations();
});
