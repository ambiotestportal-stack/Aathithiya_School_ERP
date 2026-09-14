import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Database connected successfully to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
