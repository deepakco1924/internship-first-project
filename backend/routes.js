const router = require("express").Router();
const AuthController = require("./controllers/auth-controller");
const ActivateController = require("./controllers/activate-controller");
const authMiddleware = require("./middlewares/auth-middleware");
const RoomController = require("./controllers/room-controller");

router.post("/api/send-otp", AuthController.sendOtp);

router.post("/api/verify-otp", AuthController.verifyOtp);

router.post("/api/activate", authMiddleware, ActivateController.activate);

router.get("/api/refresh", AuthController.refresh);

router.post("/api/logout", authMiddleware, AuthController.logout);

router.post("/api/rooms", authMiddleware, RoomController.createRoom);

router.get("/api/rooms", authMiddleware, RoomController.index);
router.get("/api/rooms/:roomId", authMiddleware, RoomController.getRoomById);

module.exports = router;
