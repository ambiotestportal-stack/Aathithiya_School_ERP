import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';

// Security Headers
app.use(helmet());

// GZIP Compression for payloads
app.use(compression());

app.use(cors({ origin: true, credentials: true })); // Enable credentials for cookies
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));



app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import academicRoutes from './routes/academicRoutes';
import studentRoutes from './routes/studentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import staffRoutes from './routes/staffRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import examRoutes from './routes/examRoutes';
import financeRoutes from './routes/financeRoutes';
import transportRoutes from './routes/transportRoutes';
import libraryRoutes from './routes/libraryRoutes';
import hostelRoutes from './routes/hostelRoutes';
import noticeRoutes from './routes/noticeRoutes';
import homeworkRoutes from './routes/homeworkRoutes';
import leaveRoutes from './routes/leaveRoutes';
import timetableRoutes from './routes/timetableRoutes';
import batchRoutes from './routes/batchRoutes';
import settingsRoutes from './routes/settingsRoutes';
import studyMaterialRoutes from './routes/studyMaterialRoutes';
import recoveryRoutes from './routes/recoveryRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/recovery', recoveryRoutes);

import roleRoutes from './routes/roleRoutes';
app.use('/api/roles', roleRoutes);

import calendarRoutes from './routes/calendarRoutes';
app.use('/api/calendar', calendarRoutes);

import { errorHandler } from './middlewares/error.middleware';

app.use(errorHandler);

export default app;
