const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
    },
    activated: {
      type: Boolean,
      required: false,
      default: false,
    },
    avatar: {
      type: String,
      required: false,
      default:
        "https://cdn.imgbin.com/5/3/4/imgbin-youtube-game-social-media-youtube-GzNMnq2ZwR3WRLj6y5J6srfsX.jpg",
    },
    name: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema, "users");
