const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const User = require('./Model/User');
const Room = require('./Model/Room');
const Reservation = require('./Model/Reservation');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { seedDefaultRooms } = require('./seeders/roomSeeder');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin account already exists. Skipping seed.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('AdminPassword123!', salt);

    const admin = new User({
      firstName: 'Admin',
      lastName: 'Manager',
      email: 'admin@capipisabay.com',
      phone: { countryCode: '+63', number: '9170000000' },
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();
    console.log('Default admin account created successfully.');
  } catch (err) {
    console.error('Admin seeding error:', err.message);
  }
};

const seedRooms = async () => {
  try {
    await seedDefaultRooms(false);
  } catch (err) {
    console.error('Room seeding error:', err.message);
  }
};

const migrateRoomQuantity = async () => {
  try {
    const result = await Room.updateMany(
      { availableQuantity: { $exists: false } },
      { $set: { availableQuantity: 5 } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Migrated ${result.modifiedCount} rooms with availableQuantity=5.`);
    }
  } catch (err) {
    console.error('Room quantity migration error:', err.message);
  }
};

const migrateReservationPayments = async () => {
  try {
    const arrivalResult = await Reservation.updateMany(
      { $or: [{ paymentMethod: { $in: ['arrival', ''] } }, { paymentMethod: null }, { paymentMethod: { $exists: false } }] },
      { $set: { paymentMethod: 'cash' } }
    );
    const gcashResult = await Reservation.updateMany(
      { paymentMethod: 'gcash' },
      { $set: { paymentMethod: 'ewallet' } }
    );
    const total = arrivalResult.modifiedCount + gcashResult.modifiedCount;
    if (total > 0) {
      console.log(`Migrated ${total} reservations with legacy payment methods.`);
    }
  } catch (err) {
    console.error('Reservation payment migration error:', err.message);
  }
};

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected Successfully');
    await seedAdmin();
    await seedRooms();
    await migrateRoomQuantity();
    await migrateReservationPayments();
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
