const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.CORS_ORIGINS || `${process.env.CLIENT_URL},http://localhost:3000,https://haryana-police-inventory-sys.vercel.app,https://client-three-tau-58.vercel.app`)
      .split(',').map(s => s.trim());
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use('/api/', limiter);

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/districts', require('./routes/districts'));
app.use('/api/police-stations', require('./routes/policeStations'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/items', require('./routes/items'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/demands', require('./routes/demands'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/seed', require('./routes/seed'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/password-reset', require('./routes/passwordReset'));
app.use('/api/signup-requests', require('./routes/signup'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
