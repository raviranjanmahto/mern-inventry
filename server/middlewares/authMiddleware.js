const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const handleAsync = require("../utils/handleAsync");

exports.protect = handleAsync(async (req, res, next) => {
  let token;
  token = req.cookies.token;
  if (!token)
    return next(new AppError("Unauthorize, Please log in to get access!", 401));

  const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(
        "The user belonging to this token does no longer exist!",
        401
      )
    );
  req.user = currentUser;
  next();
});
