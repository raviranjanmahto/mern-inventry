const User = require("../models/userModel");
const AppError = require("../utils/appError");
const handleAsync = require("../utils/handleAsync");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

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
  const { name, photo, phone, bio } = req.body;

  // If field then put that field in req.user else ignore
  if (name) req.user.name = name;
  if (photo) req.user.photo = photo;
  if (phone) req.user.phone = phone;
  if (bio) req.user.bio = bio;

  await req.user.save();

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

exports.updatePassword = handleAsync(async (req, res, next) => {
  const { password, newPassword } = req.body;
  if (!password || !newPassword)
    return next(new AppError("All fields are required!", 401));

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.passwordMatch(password)))
    return next(new AppError("Invalid current password!", 401));

  user.password = newPassword;
  await user.save();
  user.password = undefined;

  res
    .status(200)
    .json({ status: "success", message: "Password change successfully!" });
});

exports.forgotPassword = handleAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Email address is required!", 401));

  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError("There is no user with email address.", 404));

  const resetToken =
    crypto.randomBytes(32).toString("hex") + "raviranjanMahto" + user._id;

  const hashToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashToken;
  user.passwordResetExpires = Date.now() + 5 * 60 * 1000;

  await user.save();

  const resetURL = `${process.env.BASE_URL}/api/v1/users/reset/${resetToken}`;

  try {
    await sendEmail({
      from: '"Inventry Password Reset"<EMAIL>',
      email: user.email,
      name: user.name,
      subject: "Your password reset token (valid for 5 mins).",
      resetURL,
    });
    res
      .status(200)
      .json({ status: "success", message: "Token has been sent to an email!" });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save();
    return next(
      new AppError("There was an error sending email. Try again later!", 400)
    );
  }
});

exports.resetPassword = handleAsync(async (req, res, next) => {
  const { newPassword, confirmNewPassword } = req.body;
  if (!newPassword || newPassword !== confirmNewPassword)
    return next(new AppError("Password not matched!", 400));

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("Token is invalid or has expired!", 404));

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res
    .status(200)
    .json({ status: "success", message: "Password change successfully!" });
});
