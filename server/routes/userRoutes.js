const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/signup", userController.signUp);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

router.post("/forgot", userController.forgotPassword);
router.patch("/reset/:token", userController.resetPassword);

router.get("/profile", authMiddleware.protect, userController.getProfile);
router.patch("/update", authMiddleware.protect, userController.updateProfile);
router.patch(
  "/password",
  authMiddleware.protect,
  userController.updatePassword
);

module.exports = router;
