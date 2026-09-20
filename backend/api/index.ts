import app from '../src/app';
import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const MONGO_URI = process.env.MONGO_URI || '';

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(MONGO_URI, { tlsAllowInvalidCertificates: true });
    isConnected = true;
    console.log('Serverless MongoDB connected');
  } catch (error) {
    console.error('Serverless MongoDB connection error:', error);
  }
};

export default async function handler(req: any, res: any) {
  await connectDB();
  return app(req, res);
}
