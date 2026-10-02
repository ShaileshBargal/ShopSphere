import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopsphere';

  try {
    // Attempt standard connection with 3-second timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Could not connect to external MongoDB at ${uri}.`);
    console.log('[MongoDB] Initializing in-memory MongoDB server for immediate zero-config usage...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB] In-Memory MongoDB running successfully at: ${memUri}`);
    } catch (memError) {
      console.error('[MongoDB] Fatal error initializing MongoDB:', memError.message);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
