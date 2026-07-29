const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    methods: ['GET', 'POST', 'PATCH']
  }
});

app.set('io', io);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174']
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/interview-command-center';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Interview Command Center API is running...');
});

app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/checkpoints', require('./routes/checkpoints'));
app.use('/api/dsa', require('./routes/dsa'));

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

const { startCronJobs, computeDeadlineAlerts } = require('./cron/alerts');
startCronJobs(io);

// Push initial deadline snapshot shortly after boot
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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
