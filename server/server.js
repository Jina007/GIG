const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// Ensure DB is initialized
require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static uploads / documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'SIH26089: Cooperative Gig Services Platform API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'Sahakari Gig — Labour Cooperative Network',
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/workers', require('./routes/workers.routes'));
app.use('/api/services', require('./routes/services.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api/reviews', require('./routes/reviews.routes'));
app.use('/api/cooperatives', require('./routes/cooperatives.routes'));
app.use('/api/federation', require('./routes/federation.routes'));
app.use('/api/complaints', require('./routes/complaints.routes'));
app.use('/api/welfare', require('./routes/welfare.routes'));
app.use('/api/forecast', require('./routes/forecast.routes'));
app.use('/api/announcements', require('./routes/announcements.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/geo', require('./routes/geo.routes'));

// Static client dist assets
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Fallback for SPA routing or 404
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: `API Endpoint ${req.originalUrl} not found.` });
  }
  const indexHtml = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(404).json({ error: `Endpoint ${req.originalUrl} not found.` });
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Sahakari Gig API Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`💼 SIH26089: Cooperative Gig Services Platform`);
  console.log(`=======================================================`);
});
