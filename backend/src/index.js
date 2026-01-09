import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import morgan from 'morgan';
import profileRoutes from './routes/profileRoutes.js';
import cors from 'cors'


const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE','PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
app.use('/ping' ,(req,res) =>{
    res.send('/pong')
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
};

start();