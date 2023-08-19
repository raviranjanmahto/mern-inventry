const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name?"],
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address!",
      ],
      maxlength: [40, "Email must be less or equal to 40 character!"],
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      minlength: [6, "Password must be at least 6 character!"],
      maxlength: [40, "Password must be less or equal to 40 character!"],
      select: false,
    },
    photo: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      match: [
        /^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/,
        "Enter a valid phone number!",
      ],
    },
    bio: {
      type: String,
      maxlength: [240, "Bio must be less or equal to 240 character!"],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
