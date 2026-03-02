require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ─────────────────────────────────── */
app.use(cors());
app.use(express.json());

/* ── Serve frontend from /public ───────────────── */
app.use(express.static(path.join(__dirname, '..', 'public')));

/* ── API routes ────────────────────────────────── */
app.use('/api', apiRoutes);

/* ── Fallback to index.html ────────────────────── */
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

/* ── Start ─────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`🌌 Future Mirror server running → http://localhost:${PORT}`);
});
