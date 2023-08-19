const User = require("../models/userModel");
const AppError = require("../utils/appError");
const handleAsync = require("../utils/handleAsync");

exports.signUp = handleAsync(async (req, res, next) => {
  const { name, email, password, photo, phone } = req.body;
  if (!name || !email || !password)
    return next(new AppError("All fields are required!", 401));

  const existUser = await User.findOne({ email });
  if (existUser)
    return next(new AppError("User already exist, Please login!", 401));

  const user = await User.create({ name, email, password, photo, phone });

  res.status(201).json({
    status: "success",
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

  res.status(200).json({
    status: "success",
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
