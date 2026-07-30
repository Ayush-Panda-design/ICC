const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const isProd = process.env.NODE_ENV === 'production';
const clientDist = path.join(__dirname, '../client/dist');
const serveClient = fs.existsSync(path.join(clientDist, 'index.html'));

const LOCAL_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

const corsOrigin = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : isProd
    ? true // same-origin + Reflect request Origin when present
    : LOCAL_ORIGINS;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PATCH']
  }
});

app.set('io', io);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // SPA + Vite assets; tighten later if needed
  contentSecurityPolicy: false
}));
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

const { authMiddleware } = require('./middleware/auth');
app.use(authMiddleware);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/interview-command-center';

let mongoReady = false;
mongoose.connect(MONGO_URI)
  .then(() => {
    mongoReady = true;
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    mongoReady = false;
    console.error('MongoDB connection error:', err);
  });

mongoose.connection.on('connected', () => { mongoReady = true; });
mongoose.connection.on('disconnected', () => { mongoReady = false; });

app.get('/health', (req, res) => res.json({
  ok: true,
  serveClient,
  mongo: mongoReady ? 'connected' : 'disconnected'
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/checkpoints', require('./routes/checkpoints'));
app.use('/api/dsa', require('./routes/dsa'));
app.use('/api/coach', require('./routes/coach'));

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

const { startCronJobs, computeDeadlineAlerts } = require('./cron/alerts');
startCronJobs(io);

setTimeout(async () => {
  try {
    const snapshot = await computeDeadlineAlerts();
    io.emit('alert:daily', {
      redCount: snapshot.red.length,
      yellowCount: snapshot.yellow.length,
      red: snapshot.red.slice(0, 10),
      yellow: snapshot.yellow.slice(0, 10),
      generatedAt: snapshot.generatedAt
    });
  } catch (_) { /* ignore */ }
}, 3000);

// Production / unified deploy: serve Vite build from same origin
if (serveClient) {
  app.use(express.static(clientDist, { index: false, maxAge: isProd ? '1d' : 0 }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  app.get('/', (req, res) => {
    res.send('Interview Command Center API is running… (client build not found — run npm run build)');
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}${serveClient ? ' (serving client/dist)' : ' (API only)'}`);
});
