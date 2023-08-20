const User = require("../models/userModel");
const AppError = require("../utils/appError");
const handleAsync = require("../utils/handleAsync");
const jwt = require("jsonwebtoken");

const generateToken = id => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.TOKEN_EXPIREIN,
  });
};

const cookieOption = {
  expires: new Date(
    Date.now() + process.env.COOKIE_EXPIREIN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
};
if (process.env.NODE_ENV === "production") cookieOption.secure = true;

exports.signUp = handleAsync(async (req, res, next) => {
  const { name, email, password, photo, phone } = req.body;
  if (!name || !email || !password)
    return next(new AppError("All fields are required!", 401));

  const existUser = await User.findOne({ email });
  if (existUser)
    return next(new AppError("User already exist, Please login!", 401));

  const user = await User.create({ name, email, password, photo, phone });

  const token = generateToken(user._id);
  await res.cookie("token", token, cookieOption);

  res.status(201).json({
    status: "success",
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      photo: user.photo,
      phone: user.phone,
      bio: user.bio,
    },
  });
});

exports.login = handleAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("All fields are required!", 401));

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.passwordMatch(password)))
    return next(new AppError("Invalid email or password!"));

  const token = generateToken(user._id);
  await res.cookie("token", token, cookieOption);

  res.status(200).json({
    status: "success",
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      photo: user.photo,
      phone: user.phone,
      bio: user.bio,
    },
  });
});

exports.logout = handleAsync(async (req, res) => {
  await res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ status: "success" });
});

exports.getProfile = handleAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      photo: req.user.photo,
      phone: req.user.phone,
      bio: req.user.bio,
    },
  });
});

exports.updateProfile = handleAsync(async (req, res, next) => {
  // 1) Taking limited fields
  const { name, password, photo, phone, bio } = req.body;

  // If field then put that field in req.user else ignore
  if (name) req.user.name = name;
  if (password) req.user.password = password;
  if (photo) req.user.photo = photo;
  if (phone) req.user.phone = phone;
  if (bio) req.user.bio = bio;

  await req.user.save();
  req.user.password = undefined;

  res.status(200).json({
    status: "success",
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      photo: req.user.photo,
      phone: req.user.phone,
      bio: req.user.bio,
    },
  });
});
