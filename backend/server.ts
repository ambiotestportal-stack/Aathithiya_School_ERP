import app from './src/app';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import User, { UserRole } from './src/models/User';
import { validateEnv, env } from './src/config/env';

validateEnv();

const PORT = env.PORT;
const MONGO_URI = env.MONGO_URI;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('⚡ Live Real-Time WebSocket Connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected WebSocket client:', socket.id);
  });
});

const seedAdmin = async () => {
  try {
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      console.log('No Super Admin found. Creating default admin user...');
      admin = new User({
        username: 'admin',
        password: 'admin123',
        role: UserRole.SUPER_ADMIN,
        name: 'Super Admin'
      });
      await admin.save();
      console.log('Default Admin created! Username: admin | Password: admin123');
    } else {
      admin.password = 'admin123';
      admin.role = UserRole.SUPER_ADMIN;
      await admin.save();
      console.log('Default Admin user verified/updated to password: admin123');
    }
  } catch (error: any) {
    console.error('Error seeding admin user:', error);
  }
};

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedAdmin();

    server.listen(PORT, () => {
      console.log(`Server is running with Socket.io on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });
