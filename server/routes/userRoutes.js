const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/signup", userController.signUp);
router.post("/login", userController.login);

router.post("/logout", userController.logout);
router.get("/profile", authMiddleware.protect, userController.getProfile);

router.patch("/update", authMiddleware.protect, userController.updateProfile);

module.exports = router;
