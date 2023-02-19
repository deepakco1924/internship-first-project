const roomServices = require("../services/room-services");

exports.createRoom = async (req, res, next) => {
  const { topic, roomType } = req.body;
  if (!topic || !roomType) {
    return res.status(400).json({ message: "please give all fields" });
  }
  const room = await roomServices.create({
    topic,
    roomType,
    ownerId: req.user._id,
  });
  const roomDataResponse = {
    id: room._id,
    topic: room.topic,
    roomType: room.roomType,
    speakers: room.speakers,
    createdAt: room.createdAt,
  };
  res
    .status(200)
    .json({ message: "room created succesfully", room: roomDataResponse });
};

exports.index = async (req, res, next) => {
  const rooms = await roomServices.getAllRooms(["open"]);

  res.status(200).json(rooms);
};

exports.getRoomById = async (req, res, next) => {
  const room = await roomServices.getRoom(req.params.roomId);
  res.status(200).json(room);
};
