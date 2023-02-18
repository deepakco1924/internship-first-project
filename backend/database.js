const mongoose = require("mongoose");
function dbConnect() {
  const DB_URL = process.env.DB_URL;
  console.log(DB_URL);
  mongoose
    .connect(
      "mongodb+srv://ccetpal:dkroy8790@cluster0.hukw1lm.mongodb.net/test?retryWrites=true&w=majority"
    )
    .then(() => {
      console.log("db connected");
    })
    .catch((err) => {
      console.log("db not connected");
      console.log(err);
    });
}
module.exports = dbConnect;
