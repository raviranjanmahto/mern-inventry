const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(bodyParser);

// DATABASE CONNECTION
mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => console.log("Database connected successfully!🥰🥰🥰"))
  .catch(err => console.log("ERROR🎇🎇🎇", err.message));

// SERVER LISTEN
const port = process.env.PORT || 7002;
app.listen(port, () => console.log(`Server is listening on port ${port}...`));
