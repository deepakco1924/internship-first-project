const Room = require("../models/room-model");
exports.create = async (data) => {
  const { topic, roomType, ownerId } = data;
  const room = await Room.create({
    topic,
    roomType,
    ownerId,
    speakers: [ownerId],
  });
  return room;
};
exports.getRoom = async (roomId) => {
  return await Room.findOne({ _id: roomId })
    .populate("speakers")
    .populate("ownerId")
    .exec();
};
exports.getAllRooms = async (types) => {
  console.log(types);
  const rooms = await Room.find({ roomType: { $in: types } })
    .populate("speakers")
    .populate("ownerId")
    .exec();
  return rooms;
};
