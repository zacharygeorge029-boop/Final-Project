const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./Model/User');
const Room = require('./Model/Room');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);

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
    const seedData = [
      {
        roomNumber: '101',
        type: 'Deluxe Ocean Room',
        pricePerNight: 4500,
        description: 'Spacious ocean-facing room with a private balcony and panoramic sea views.',
        capacity: 2,
        amenities: ['Ocean View', 'King Bed', 'WiFi', 'Mini Bar', 'Air Conditioning', 'Flat-screen TV'],
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTkv9liNysUaIUcXrZViJvpFBlkA9TlCsH7IPmW6Lhd6lxs3knZgq2gKQ&s=10',
        images: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTkv9liNysUaIUcXrZViJvpFBlkA9TlCsH7IPmW6Lhd6lxs3knZgq2gKQ&s=10',
          'https://cf.bstatic.com/xdata/images/hotel/max1024x768/290376069.jpg?k=d286ec60cc4e64cd594d45a2c45e8cd8244903f6b2b6828d36be049d592e795c&o=',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT34cwECAtkWsSA-tcgL8JlP2ZufSEui-RjFefaX4Uxda2dgx34kNc-HQw&s=10',
        ],
        featured: false,
        badge: 'Best Value',
        sqft: 38,
        viewType: 'Ocean View',
        bedConfig: '1 King Bed',
        policies: ['Free cancellation up to 48 hours before check-in', 'Check-in: 2:00 PM', 'Check-out: 12:00 PM'],
      },
      {
        roomNumber: '102',
        type: 'Executive Suite',
        pricePerNight: 8500,
        description: 'Elegant suite with a separate living area and premium amenities for discerning guests.',
        capacity: 2,
        amenities: ['Living Area', 'King Bed', 'WiFi', 'Mini Bar', 'Bathtub', 'Ocean View'],
        image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/290376069.jpg?k=d286ec60cc4e64cd594d45a2c45e8cd8244903f6b2b6828d36be049d592e795c&o=',
        images: [
          'https://cf.bstatic.com/xdata/images/hotel/max1024x768/290376069.jpg?k=d286ec60cc4e64cd594d45a2c45e8cd8244903f6b2b6828d36be049d592e795c&o=',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTkv9liNysUaIUcXrZViJvpFBlkA9TlCsH7IPmW6Lhd6lxs3knZgq2gKQ&s=10',
          'https://pix10.agoda.net/hotelImages/736975/3381239/e48e996f8d672edbc5cb5b69c8f57401.jpg?ce=3&s=414x232',
        ],
        featured: true,
        badge: 'Most Booked',
        sqft: 65,
        viewType: 'Panoramic Ocean',
        bedConfig: '1 King Bed + Sofa Bed',
        policies: ['Free cancellation up to 72 hours before check-in', 'Check-in: 2:00 PM', 'Check-out: 12:00 PM'],
      },
      {
        roomNumber: '103',
        type: 'Presidential Villa',
        pricePerNight: 25000,
        description: 'Our flagship villa with private pool, butler service, and uninterrupted ocean vistas.',
        capacity: 4,
        amenities: ['Private Pool', 'Butler Service', 'Ocean View', 'King Bed', 'WiFi', 'Jacuzzi'],
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT34cwECAtkWsSA-tcgL8JlP2ZufSEui-RjFefaX4Uxda2dgx34kNc-HQw&s=10',
        images: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT34cwECAtkWsSA-tcgL8JlP2ZufSEui-RjFefaX4Uxda2dgx34kNc-HQw&s=10',
          'https://cdn.webhotelier.net/photos/w=1920/bluebayr-luxpp/L569294.jpg',
          'https://image-tc.galaxy.tf/wijpeg-c7kde2n8v1we83al1lzwuysbn/whatsapp-image-2026-09-23-at-2-34-27-pm_standard.jpg?crop=200%2C0%2C1200%2C900',
        ],
        featured: true,
        badge: 'Best Ocean View',
        sqft: 180,
        viewType: 'Unobstructed Ocean',
        bedConfig: '1 King Bed',
        policies: ['Non-refundable rate', 'Check-in: 3:00 PM', 'Check-out: 11:00 AM', 'Butler service included'],
      },
      {
        roomNumber: '104',
        type: 'Beachfront Villa',
        pricePerNight: 15000,
        description: 'Steps away from the pristine shoreline with direct beach access and a private deck.',
        capacity: 3,
        amenities: ['Beach Access', 'Private Deck', 'Queen Bed', 'WiFi', 'Mini Bar', 'Outdoor Shower'],
        image: 'https://pix10.agoda.net/hotelImages/736975/3381239/e48e996f8d672edbc5cb5b69c8f57401.jpg?ce=3&s=414x232',
        images: [
          'https://pix10.agoda.net/hotelImages/736975/3381239/e48e996f8d672edbc5cb5b69c8f57401.jpg?ce=3&s=414x232',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7dpPVPO13d57uAK6RpFWTTOjiIBxpJ0OtUsFbUtUp3Sepg0kUk3X771V3&s=10',
          'https://image-tc.galaxy.tf/wijpeg-c7kde2n8v1we83al1lzwuysbn/whatsapp-image-2026-09-23-at-2-34-27-pm_standard.jpg?crop=200%2C0%2C1200%2C900',
        ],
        featured: true,
        badge: 'Ocean View Top Choice',
        sqft: 110,
        viewType: 'Beachfront',
        bedConfig: '1 Queen Bed',
        policies: ['Free cancellation up to 48 hours before check-in', 'Check-in: 2:00 PM', 'Check-out: 12:00 PM'],
      },
      {
        roomNumber: '105',
        type: 'Garden Suite',
        pricePerNight: 6200,
        description: 'Tranquil suite surrounded by lush tropical gardens and a private patio.',
        capacity: 2,
        amenities: ['Garden View', 'Patio', 'King Bed', 'WiFi', 'Mini Bar', 'Air Conditioning'],
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7dpPVPO13d57uAK6RpFWTTOjiIBxpJ0OtUsFbUtUp3Sepg0kUk3X771V3&s=10',
        images: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7dpPVPO13d57uAK6RpFWTTOjiIBxpJ0OtUsFbUtUp3Sepg0kUk3X771V3&s=10',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPKm2expD_YRNsvxrWeHbXsYnkX7LNLMJG56WOoPWkzM-K16NpnIDjvGE&s=10',
          'https://pix10.agoda.net/hotelImages/736975/3381239/e48e996f8d672edbc5cb5b69c8f57401.jpg?ce=3&s=414x232',
        ],
        featured: false,
        badge: 'Limited Availability',
        sqft: 48,
        viewType: 'Garden View',
        bedConfig: '1 King Bed',
        policies: ['Free cancellation up to 48 hours before check-in', 'Check-in: 2:00 PM', 'Check-out: 12:00 PM'],
      },
      {
        roomNumber: '106',
        type: 'Ocean View Suite',
        pricePerNight: 7800,
        description: 'Floor-to-ceiling windows frame breathtaking views of the Capipisa Bay horizon.',
        capacity: 2,
        amenities: ['Ocean View', 'King Bed', 'WiFi', 'Mini Bar', 'Bathtub', 'Balcony'],
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPKm2expD_YRNsvxrWeHbXsYnkX7LNLMJG56WOoPWkzM-K16NpnIDjvGE&s=10',
        images: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPKm2expD_YRNsvxrWeHbXsYnkX7LNLMJG56WOoPWkzM-K16NpnIDjvGE&s=10',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTkv9liNysUaIUcXrZViJvpFBlkA9TlCsH7IPmW6Lhd6lxs3knZgq2gKQ&s=10',
          'https://cf.bstatic.com/xdata/images/hotel/max1024x768/290376069.jpg?k=d286ec60cc4e64cd594d45a2c45e8cd8244903f6b2b6828d36be049d592e795c&o=',
        ],
        featured: false,
        badge: 'Most Popular',
        sqft: 55,
        viewType: 'Ocean View',
        bedConfig: '1 King Bed',
        policies: ['Free cancellation up to 48 hours before check-in', 'Check-in: 2:00 PM', 'Check-out: 12:00 PM'],
      },
      {
        roomNumber: '107',
        type: 'Family Room',
        pricePerNight: 9500,
        description: 'Generously sized room with two queen beds, perfect for families and groups.',
        capacity: 4,
        amenities: ['Two Queen Beds', 'WiFi', 'Mini Bar', 'Air Conditioning', 'Bathtub', 'Balcony'],
        image: 'https://q-xx.bstatic.com/xdata/images/hotel/max500/653993707.jpg?k=e3ef1f6571152be52079bc54fddd87d261d4bfd3af2644fbf6bf1db52c40d8b9&o=',
        images: [
          'https://q-xx.bstatic.com/xdata/images/hotel/max500/653993707.jpg?k=e3ef1f6571152be52079bc54fddd87d261d4bfd3af2644fbf6bf1db52c40d8b9&o=',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7dpPVPO13d57uAK6RpFWTTOjiIBxpJ0OtUsFbUtUp3Sepg0kUk3X771V3&s=10',
          'https://image-tc.galaxy.tf/wijpeg-1v4uhw6nek1jstwdwasn5ov19/cocoa-pod-suite-bedroom_standard.jpg?crop=106%2C0%2C1688%2C1266',
        ],
        featured: false,
        badge: null,
        sqft: 72,
        viewType: 'Partial Ocean',
        bedConfig: '2 Queen Beds',
        policies: ['Free cancellation up to 48 hours before check-in', 'Check-in: 2:00 PM', 'Check-out: 12:00 PM'],
      },
      {
        roomNumber: '108',
        type: 'Luxury Penthouse',
        pricePerNight: 32000,
        description: 'The pinnacle of luxury — a rooftop penthouse with a private infinity pool and 360° views.',
        capacity: 6,
        amenities: ['Infinity Pool', 'Rooftop Terrace', 'King Bed', 'WiFi', 'Butler Service', 'Jacuzzi'],
        image: 'https://cdn.webhotelier.net/photos/w=1920/bluebayr-luxpp/L569294.jpg',
        images: [
          'https://cdn.webhotelier.net/photos/w=1920/bluebayr-luxpp/L569294.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT34cwECAtkWsSA-tcgL8JlP2ZufSEui-RjFefaX4Uxda2dgx34kNc-HQw&s=10',
          'https://image-tc.galaxy.tf/wijpeg-c7kde2n8v1we83al1lzwuysbn/whatsapp-image-2026-09-23-at-2-34-27-pm_standard.jpg?crop=200%2C0%2C1200%2C900',
        ],
        featured: false,
        badge: 'Limited Availability',
        sqft: 240,
        viewType: '360° Panoramic',
        bedConfig: '1 King Bed + 2 Queen Beds',
        policies: ['Non-refundable rate', 'Check-in: 3:00 PM', 'Check-out: 11:00 AM', 'Butler service included'],
      },
      {
        roomNumber: '109',
        type: 'Pool Villa',
        pricePerNight: 18500,
        description: 'A secluded villa with your own private plunge pool and tropical garden.',
        capacity: 3,
        amenities: ['Private Pool', 'Garden', 'King Bed', 'WiFi', 'Mini Bar', 'Outdoor Shower'],
        image: 'https://image-tc.galaxy.tf/wijpeg-c7kde2n8v1we83al1lzwuysbn/whatsapp-image-2026-09-23-at-2-34-27-pm_standard.jpg?crop=200%2C0%2C1200%2C900',
        images: [
          'https://image-tc.galaxy.tf/wijpeg-c7kde2n8v1we83al1lzwuysbn/whatsapp-image-2026-09-23-at-2-34-27-pm_standard.jpg?crop=200%2C0%2C1200%2C900',
          'https://pix10.agoda.net/hotelImages/736975/3381239/e48e996f8d672edbc5cb5b69c8f57401.jpg?ce=3&s=414x232',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPKm2expD_YRNsvxrWeHbXsYnkX7LNLMJG56WOoPWkzM-K16NpnIDjvGE&s=10',
        ],
        featured: false,
        badge: null,
        sqft: 130,
        viewType: 'Pool & Garden',
        bedConfig: '1 King Bed',
        policies: ['Free cancellation up to 72 hours before check-in', 'Check-in: 2:00 PM', 'Check-out: 12:00 PM'],
      },
      {
        roomNumber: '110',
        type: 'Cocoa Pod Suite',
        pricePerNight: 11000,
        description: 'A uniquely designed pod-style suite blending nature and modern luxury.',
        capacity: 2,
        amenities: ['Unique Design', 'King Bed', 'WiFi', 'Mini Bar', 'Balcony', 'Air Conditioning'],
        image: 'https://image-tc.galaxy.tf/wijpeg-1v4uhw6nek1jstwdwasn5ov19/cocoa-pod-suite-bedroom_standard.jpg?crop=106%2C0%2C1688%2C1266',
        images: [
          'https://image-tc.galaxy.tf/wijpeg-1v4uhw6nek1jstwdwasn5ov19/cocoa-pod-suite-bedroom_standard.jpg?crop=106%2C0%2C1688%2C1266',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7dpPVPO13d57uAK6RpFWTTOjiIBxpJ0OtUsFbUtUp3Sepg0kUk3X771V3&s=10',
          'https://cf.bstatic.com/xdata/images/hotel/max1024x768/290376069.jpg?k=d286ec60cc4e64cd594d45a2c45e8cd8244903f6b2b6828d36be049d592e795c&o=',
        ],
        featured: false,
        badge: 'Most Popular',
        sqft: 52,
        viewType: 'Garden & Partial Ocean',
        bedConfig: '1 King Bed',
        policies: ['Free cancellation up to 48 hours before check-in', 'Check-in: 2:00 PM', 'Check-out: 12:00 PM'],
      },
    ];

    await Room.deleteMany({});
    await Room.insertMany(seedData);
    console.log(`Seeded ${seedData.length} luxury rooms successfully.`);
  } catch (err) {
    console.error('Room seeding error:', err.message);
  }
};

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected Successfully');
    await seedAdmin();
    await seedRooms();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));