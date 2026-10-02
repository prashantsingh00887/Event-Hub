require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Import models for auto-seeding if empty
const User = require('./models/User');
const Event = require('./models/Event');

const app = express();

// Initialize DB Connection
connectDB().then(async () => {
  // Auto-seed default admin and initial sample events if collection is empty
  try {
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      console.log('[Auto-Seed] Initializing default EventHub data...');
      let admin = await User.findOne({ email: 'admin@eventhub.com' });
      if (!admin) {
        admin = await User.create({
          name: 'EventHub Super Admin',
          email: 'admin@eventhub.com',
          password: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@12345',
          phone: '+91 98765 43210',
          role: 'admin',
          isActive: true
        });
        console.log('[Auto-Seed] Admin account created: admin@eventhub.com');
      }

      const sampleEvents = [
        {
          title: 'Sunburn Electronic Music Festival 2026',
          description: 'Experience an electrifying weekend of top international DJs, state-of-the-art stage visuals, acoustic soundscapes, and unforgettable vibes on the beach.',
          category: 'Concert',
          image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
          venue: 'Vagator Beach Arena',
          address: 'Vagator Coastal Highway, North Goa',
          city: 'Goa',
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          startTime: '16:00',
          endTime: '23:30',
          ticketPrice: 2499,
          totalSeats: 500,
          availableSeats: 485,
          status: 'active',
          createdBy: admin._id
        },
        {
          title: 'Global AI & Cloud Tech Leadership Summit 2026',
          description: 'Join 1,000+ top engineering leaders, AI researchers, and startup founders discussing Large Language Models, autonomous agentic systems, and cloud infrastructure.',
          category: 'Conference',
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
          venue: 'International Exhibition Centre',
          address: '10th Mile, Tumkur Road, Whitefield Hub',
          city: 'Bengaluru',
          date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
          startTime: '09:00',
          endTime: '18:00',
          ticketPrice: 3999,
          totalSeats: 300,
          availableSeats: 290,
          status: 'active',
          createdBy: admin._id
        },
        {
          title: 'Full-Stack Web & System Design Workshop',
          description: 'Intensive 2-day hands-on bootcamp exploring scalable microservices, low-latency APIs, distributed caches, and React architecture patterns with live coding sessions.',
          category: 'Workshop',
          image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
          venue: 'TechForward Co-working Space',
          address: 'Cyber City Sector 24',
          city: 'Gurugram',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          startTime: '10:00',
          endTime: '17:00',
          ticketPrice: 1499,
          totalSeats: 60,
          availableSeats: 55,
          status: 'active',
          createdBy: admin._id
        },
        {
          title: 'Laughter Unlimited: All-Star Standup Comedy Night',
          description: 'Get ready for an evening of non-stop laughs with India top touring comedians presenting brand new hilarious sets, crowd work, and comedic storytelling.',
          category: 'Comedy',
          image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
          venue: 'The Comedy Club Studio',
          address: 'Bandra West, Linking Road',
          city: 'Mumbai',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          startTime: '19:30',
          endTime: '22:00',
          ticketPrice: 799,
          totalSeats: 150,
          availableSeats: 140,
          status: 'active',
          createdBy: admin._id
        },
        {
          title: 'IPL Champions Grand Screen & Fan Festival',
          description: 'Watch the high-stakes T20 showdown on a gigantic 4K LED stadium screen with live stadium-grade audio, cheering fans, food trucks, and cricket fan merchandise.',
          category: 'Sports',
          image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
          venue: 'National Sports Arena Lawn',
          address: 'Worli Seaface Road',
          city: 'Mumbai',
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          startTime: '18:30',
          endTime: '23:00',
          ticketPrice: 499,
          totalSeats: 400,
          availableSeats: 390,
          status: 'active',
          createdBy: admin._id
        },
        {
          title: 'NextGen Robotics & Autonomous Systems Expo',
          description: 'Discover the future of robotics, automated drones, humanoid assistants, and industrial automation with live interactive displays and speaker panels.',
          category: 'Education',
          image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
          venue: 'Hitec City Convention Center',
          address: 'Madhapur, Hitec City',
          city: 'Hyderabad',
          date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          startTime: '10:00',
          endTime: '17:30',
          ticketPrice: 899,
          totalSeats: 200,
          availableSeats: 195,
          status: 'active',
          createdBy: admin._id
        }
      ];

      await Event.insertMany(sampleEvents);
      console.log(`[Auto-Seed] Successfully populated ${sampleEvents.length} initial events.`);
    }
  } catch (seedErr) {
    console.warn('[Auto-Seed] Seed note:', seedErr.message);
  }
});

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow local development clients
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'EventHub API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static client assets in production if built together
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 EventHub API Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
