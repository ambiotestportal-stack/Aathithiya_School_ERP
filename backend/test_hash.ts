import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User';

mongoose.connect('mongodb://localhost:27017/school-erp').then(async () => {
  const newUser = new User({
    name: 'test_student',
    username: '12345',
    password: 'password123',
    email: 'test@example.com',
    role: 'STUDENT'
  });
  await newUser.save();
  const savedUser = await User.findOne({ username: '12345' });
  console.log('DB Password:', savedUser?.password);
  if (savedUser) {
    const match = await bcrypt.compare('password123', savedUser.password);
    console.log('Match:', match);
    await User.deleteOne({ username: '12345' });
  }
  process.exit(0);
}).catch(console.error);