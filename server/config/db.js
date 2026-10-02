const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventhub';
  const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
  
  try {
    // Attempt connecting to the configured URI (Atlas or local) with 5s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected successfully to: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to primary URI (${maskedUri}): ${err.message}`);
    
    if (err.message.includes('whitelist') || err.message.includes('Could not connect to any servers')) {
      console.warn('💡 [MongoDB Atlas Tip] If you are connecting to Atlas, ensure your IP address or 0.0.0.0/0 is added in MongoDB Atlas -> Network Access.');
    }
    
    // Fallback to in-memory MongoDB for uninterrupted local execution if primary fails
    try {
      console.log('[MongoDB] Starting isolated in-memory MongoDB server for development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      
      await mongoose.connect(inMemoryUri);
      console.log(`[MongoDB] In-memory MongoDB connected successfully at ${inMemoryUri}`);
    } catch (fallbackErr) {
      console.error('[MongoDB] Fatal: Failed to initialize database connection:', fallbackErr.message);
      process.exit(1);
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected.');
  });
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
