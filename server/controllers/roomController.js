const Room = require('../Model/Room');
const { seedDefaultRooms } = require('../seeders/roomSeeder');

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isDeleted: { $ne: true } });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const newRoom = new Room({
      ...req.body,
      isDeleted: false,
      available: req.body.available !== undefined ? req.body.available : true,
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
    });
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.restoreDefaults = async (req, res) => {
  try {
    const result = await seedDefaultRooms(true);
    const rooms = await Room.find({ isDeleted: { $ne: true } });
    res.status(200).json({
      message: `Restored ${result.inserted} default luxury rooms successfully.`,
      count: result.inserted,
      rooms,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
