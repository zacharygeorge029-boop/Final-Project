const Room = require('../Model/Room');

const DEFAULT_ROOMS = [
  {
    roomNumber: '201',
    type: 'Deluxe Ocean View Suite',
    title: 'Deluxe Ocean View Suite',
    category: 'Suite',
    pricePerNight: 8500,
    description: 'A spacious ocean-facing suite with floor-to-ceiling windows, a private balcony, and panoramic views of Capipisa Bay.',
    capacity: 2,
    amenities: ['Ocean View', 'King Bed', 'WiFi', 'Mini Bar', 'Air Conditioning', 'Flat-screen TV', 'Balcony'],
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTkv9liNysUaIUcXrZViJvpFBlkA9TlCsH7IPmW6Lhd6lxs3knZgq2gKQ&s=10',
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTkv9liNysUaIUcXrZViJvpFBlkA9TlCsH7IPmW6Lhd6lxs3knZgq2gKQ&s=10',
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/290376069.jpg?k=d286ec60cc4e64cd594d45a2c45e8cd8244903f6b2b6828d36be049d592e795c&o=',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT34cwECAtkWsSA-tcgL8JlP2ZufSEui-RjFefaX4Uxda2dgx34kNc-HQw&s=10',
    ],
    featured: true,
    badge: 'Best Value',
    sqft: 55,
    viewType: 'Ocean View',
    bedConfig: '1 King Bed',
    policies: ['Free cancellation up to 48 hours before check-in', 'Check-in: 2:00 PM', 'Check-out: 12:00 PM'],
    isAvailable: true,
    available: true,
    isDeleted: false,
  },
  {
    roomNumber: '202',
    type: 'Premier Beachfront Villa',
    title: 'Premier Beachfront Villa',
    category: 'Villa',
    pricePerNight: 18500,
    description: 'Steps from the pristine shoreline with direct beach access, a private deck, and the soothing sound of the waves.',
    capacity: 3,
    amenities: ['Beach Access', 'Private Deck', 'Queen Bed', 'WiFi', 'Mini Bar', 'Outdoor Shower', 'Air Conditioning'],
    image: 'https://pix10.agoda.net/hotelImages/736975/3381239/e48e996f8d672edbc5cb5b69c8f57401.jpg?ce=3&s=414x232',
    images: [
      'https://pix10.agoda.net/hotelImages/736975/3381239/e48e996f8d672edbc5cb5b69c8f57401.jpg?ce=3&s=414x232',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7dpPVPO13d57uAK6RpFWTTOjiIBxpJ0OtUsFbUtUp3Sepg0kUk3X771V3&s=10',
      'https://image-tc.galaxy.tf/wijpeg-c7kde2n8v1we83al1lzwuysbn/whatsapp-image-2026-09-23-at-2-34-27-pm_standard.jpg?crop=200%2C0%2C1200%2C900',
    ],
    featured: true,
    badge: 'Beachfront Top Choice',
    sqft: 110,
    viewType: 'Beachfront',
    bedConfig: '1 Queen Bed',
    policies: ['Free cancellation up to 48 hours before check-in', 'Check-in: 2:00 PM', 'Check-out: 12:00 PM'],
    isAvailable: true,
    available: true,
    isDeleted: false,
  },
  {
    roomNumber: '203',
    type: 'Presidential Bay Suite',
    title: 'Presidential Bay Suite',
    category: 'Suite',
    pricePerNight: 32000,
    description: 'Our flagship suite with a private infinity pool, butler service, and uninterrupted 180-degree views of the bay.',
    capacity: 4,
    amenities: ['Infinity Pool', 'Butler Service', 'Ocean View', 'King Bed', 'WiFi', 'Jacuzzi', 'Mini Bar'],
    image: 'https://cdn.webhotelier.net/photos/w=1920/bluebayr-luxpp/L569294.jpg',
    images: [
      'https://cdn.webhotelier.net/photos/w=1920/bluebayr-luxpp/L569294.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT34cwECAtkWsSA-tcgL8JlP2ZufSEui-RjFefaX4Uxda2dgx34kNc-HQw&s=10',
      'https://image-tc.galaxy.tf/wijpeg-c7kde2n8v1we83al1lzwuysbn/whatsapp-image-2026-09-23-at-2-34-27-pm_standard.jpg?crop=200%2C0%2C1200%2C900',
    ],
    featured: true,
    badge: 'Best Ocean View',
    sqft: 240,
    viewType: 'Unobstructed Ocean',
    bedConfig: '1 King Bed + 2 Queen Beds',
    policies: ['Non-refundable rate', 'Check-in: 3:00 PM', 'Check-out: 11:00 AM', 'Butler service included'],
    isAvailable: true,
    available: true,
    isDeleted: false,
  },
  {
    roomNumber: '204',
    type: 'Executive Garden Villa',
    title: 'Executive Garden Villa',
    category: 'Villa',
    pricePerNight: 12000,
    description: 'A tranquil villa surrounded by lush tropical gardens, featuring a private patio and outdoor rain shower.',
    capacity: 2,
    amenities: ['Garden View', 'Private Patio', 'King Bed', 'WiFi', 'Mini Bar', 'Outdoor Shower', 'Air Conditioning'],
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7dpPVPO13d57uAK6RpFWTTOjiIBxpJ0OtUsFbUtUp3Sepg0kUk3X771V3&s=10',
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7dpPVPO13d57uAK6RpFWTTOjiIBxpJ0OtUsFbUtUp3Sepg0kUk3X771V3&s=10',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPKm2expD_YRNsvxrWeHbXsYnkX7LNLMJG56WOoPWkzM-K16NpnIDjvGE&s=10',
      'https://pix10.agoda.net/hotelImages/736975/3381239/e48e996f8d672edbc5cb5b69c8f57401.jpg?ce=3&s=414x232',
    ],
    featured: false,
    badge: 'Limited Availability',
    sqft: 80,
    viewType: 'Garden View',
    bedConfig: '1 King Bed',
    policies: ['Free cancellation up to 48 hours before check-in', 'Check-in: 2:00 PM', 'Check-out: 12:00 PM'],
    isAvailable: true,
    available: true,
    isDeleted: false,
  },
];

const seedDefaultRooms = async (force = false) => {
  try {
    const existingCount = await Room.countDocuments({ isDeleted: { $ne: true } });

    if (!force && existingCount > 0) {
      console.log(`Rooms already exist (${existingCount}). Skipping default room seed.`);
      return { inserted: 0, skipped: true };
    }

    if (force) {
      await Room.deleteMany({});
    }

    const inserted = await Room.insertMany(DEFAULT_ROOMS);
    console.log(`Seeded ${inserted.length} default luxury rooms successfully.`);
    return { inserted: inserted.length, skipped: false };
  } catch (err) {
    console.error('Default room seeding error:', err.message);
    throw err;
  }
};

module.exports = { DEFAULT_ROOMS, seedDefaultRooms };
