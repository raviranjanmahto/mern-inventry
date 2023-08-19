const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const globalErrorMiddleware = require("./middlewares/errorMiddleware");
const AppError = require("./utils/appError");

const app = express();

app.use(express.json());

// ROUTES MIDDLEWARE
app.use("/api/v1/users", userRoutes);

// NOT FOUND ROUTE MIDDLEWARE
app.all("*", (req, res, next) =>
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
);

// GLOBAL ERROR MIDDLEWARE
app.use(globalErrorMiddleware);

// DATABASE CONNECTION
mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => console.log("Database connected successfully!🥰🥰🥰"))
  .catch(err => console.log("ERROR🎇🎇🎇", err.message));

// SERVER LISTEN
const port = process.env.PORT || 7002;
app.listen(port, () => console.log(`Server is listening on port ${port}...`));
