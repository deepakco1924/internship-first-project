require("dotenv").config();

const express = require("express");
const dbConnect = require("./database.js");
const app = express();
const router = require("./routes");

const PORT = process.env.PORT || 5500;

dbConnect();

app.use(express.json());
app.use(router);
app.get("/", (req, res, next) => {
  res.send("heelow from backend");
});
app.listen(PORT, () => {
  console.log("listingin on pORT", PORT);
});
