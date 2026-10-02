require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing mock data...');
    await User.deleteMany({});
    await Event.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});

    console.log('[Seed] Creating default Admin and Demo User...');
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@12345';
    const userPassword = 'User@12345';

    const admin = await User.create({
      name: 'EventHub Super Admin',
      email: 'admin@eventhub.com',
      password: adminPassword,
      phone: '+91 98765 43210',
      role: 'admin',
      isActive: true
    });

    const demoUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      phone: '+91 91234 56789',
      role: 'user',
      isActive: true
    });

    console.log(`[Seed] Admin created: admin@eventhub.com (Password: ${adminPassword})`);
    console.log(`[Seed] Demo User created: john@example.com (Password: ${userPassword})`);

    console.log('[Seed] Creating sample events across multiple categories...');
    const now = new Date();

    const sampleEvents = [
      {
        title: 'Sunburn Electronic Music Festival 2026',
        description: 'Experience an electrifying weekend of top international DJs, state-of-the-art stage visuals, acoustic soundscapes, and unforgettable vibes on the beach.',
        category: 'Concert',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        venue: 'Vagator Beach Arena',
        address: 'Vagator Coastal Highway, North Goa',
        city: 'Goa',
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
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
        date: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
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
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
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
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
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
        date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
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
        date: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        startTime: '10:00',
        endTime: '17:30',
        ticketPrice: 899,
        totalSeats: 200,
        availableSeats: 195,
        status: 'active',
        createdBy: admin._id
      },
      {
        title: 'Soulful Strings: Sufi & Classical Symphony',
        description: 'An acoustic evening celebrating timeless Sufi qawwalis, Hindustani classical ragas, and contemporary fusion instruments under the starlit sky.',
        category: 'Music',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
        venue: 'Heritage Fort Amphitheater',
        address: 'Amer Palace Foothills',
        city: 'Jaipur',
        date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        startTime: '19:00',
        endTime: '22:30',
        ticketPrice: 1200,
        totalSeats: 250,
        availableSeats: 245,
        status: 'active',
        createdBy: admin._id
      }
    ];

    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`[Seed] Successfully inserted ${createdEvents.length} events!`);

    // Create a confirmed sample booking for demo user
    const sampleBooking = await Booking.create({
      bookingId: 'EH-SAMPLE-001',
      user: demoUser._id,
      event: createdEvents[0]._id,
      tickets: 2,
      ticketPrice: createdEvents[0].ticketPrice,
      totalAmount: createdEvents[0].ticketPrice * 2,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      razorpayOrderId: 'order_seed_sample_001',
      razorpayPaymentId: 'pay_seed_sample_001'
    });

    await Payment.create({
      booking: sampleBooking._id,
      user: demoUser._id,
      event: createdEvents[0]._id,
      amount: sampleBooking.totalAmount,
      currency: 'INR',
      razorpayOrderId: 'order_seed_sample_001',
      razorpayPaymentId: 'pay_seed_sample_001',
      razorpaySignature: 'sample_verified_sig',
      status: 'Paid'
    });

    console.log('[Seed] Created initial confirmed booking and payment record.');
    console.log('[Seed] Database successfully seeded with production-ready sample records!');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  } finally {
    await closeDB();
    console.log('[Seed] Database connection closed.');
    process.exit(0);
  }
};

seedData();
