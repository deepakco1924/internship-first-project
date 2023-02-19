require("dotenv").config();

const express = require("express");
const dbConnect = require("./database.js");
const app = express();
const router = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5500;

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
app.listen(PORT, () => {
  console.log("listingin on pORT", PORT);
});
