import mongoose from 'mongoose';
import { createStudent } from './src/controllers/studentController';
import User from './src/models/User';
mongoose.connect('mongodb://localhost:27017/school-erp').then(async () => {
  const req = { body: { name: 'api_test', rollNumber: 'api123', admissionNumber: 'api123', enrolledClass: '6a9692745506b346c0b12efd', dob: '2026-03-05', gender: 'Female', password: '05032026' } };
  const res = { status: (c) => ({ json: (d) => console.log(c, d) }), json: (d) => console.log(200, d) };
  await createStudent(req as any, res as any);
  const savedUser = await User.findOne({ username: 'api123' });
  const bcrypt = require('bcryptjs');
  console.log('Match 05032026:', await bcrypt.compare('05032026', savedUser.password));
  await User.deleteOne({ username: 'api123' });
  const StudentProfile = require('./src/models/StudentProfile').default;
  await StudentProfile.deleteOne({ rollNumber: 'api123' });
  process.exit(0);
}).catch(console.error);