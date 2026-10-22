require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

// ── Connect to MongoDB ───────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use('/api/projects',   require('./routes/projectRoutes'));
app.use('/api/scenes',     require('./routes/sceneRoutes'));
app.use('/api/equipment',  require('./routes/equipmentRoutes'));
app.use('/api/locations',  require('./routes/locationRoutes'));
app.use('/api/algorithms', require('./routes/algorithmRoutes'));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CinePlan API is running.' });
});

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CinePlan backend running on http://localhost:${PORT}`);
});
