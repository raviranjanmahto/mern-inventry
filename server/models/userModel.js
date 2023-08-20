const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
        "Enter a valid phone number!",
      ],
    },
    bio: {
      type: String,
      maxlength: [240, "Bio must be less or equal to 240 character!"],
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Only run this function when password is actually modified!
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 11
  this.password = await bcrypt.hash(this.password, 11);
  next();
});

userSchema.methods.passwordMatch = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
