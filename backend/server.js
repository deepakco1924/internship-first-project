require("dotenv").config();
const ACTIONS = require("./actions");
const express = require("express");
const dbConnect = require("./database.js");
const app = express();
const router = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5500;
const http = require("http");

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
dbConnect();
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(router);
app.get("/", (req, res, next) => {
  res.send("hello from backend");
});

//sockets login idhar likhenge

const socketToUserMapping = {};

io.on("connection", (socket) => {
  console.log("new connection ", socket.id);
  socket.on(ACTIONS.JOIN, (data) => {
    const { roomId, user } = data;
    ``;
    socketToUserMapping[socket.id] = user;
    //return map
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientSocketId) => {
      io.to(clientSocketId).emit(ACTIONS.ADD_PEER, {
        peerId: clientSocketId,
        createOffer: false,
        user: user,
      });
      socket.emit(ACTIONS.ADD_PEER, {
        peerId: clientSocketId,
        createOffer: true,
        user: socketToUserMapping[clientSocketId],
      });
    });

    socket.join(roomId);
    console.log(clients);
  });
  //handle ice
  socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
    io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
      peerId: socket.id,
      icecandidate,
    });
  });

  //handle relay sdp

  socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
    io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
      peerId: socket.id,
      sessionDescription,
    });
  });

  //
  const leaveRoom = ({ roomId }) => {
    const { rooms } = socket;
    Array.from(rooms).forEach((roomId) => {
      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      clients.forEach((clientId) => {
        io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
          peerId: socket.id,
          userId: socketToUserMapping[socket.id]?.id,
        });
        socket.emit(ACTIONS.REMOVE_PEER, {
          peerId: clientId,
          userId: socketToUserMapping[clientId]?.id,
        });
      });
      socket.leave(roomId);
    });
    delete socketToUserMapping[socket.id];
  };
  socket.on(ACTIONS.LEAVE, leaveRoom);
  socket.on("disconnecting", leaveRoom);
});

server.listen(PORT, () => {
  console.log("listingin on pORT", PORT);
});
