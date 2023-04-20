require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ 
  extended: true 
}));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

function findUserByEmail(email) {
  return User.findOne({ email: email });
}

app.get("/", async (req, res) => {
  res.render("home");
});

app.get("/login", async (req, res) => {
  res.render("login");
});

app.get("/register", async (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const foundUser = await findUserByEmail(req.body.username);
  if (foundUser) {
    console.log("User '" + req.body.username + "' already exists");
    return;
  }
  const user = new User({
    email: req.body.username,
    password: md5(req.body.password)
  });

  const newUser = await user.save();
  if (newUser === user) {
    res.render("secrets");
  } else {
    console.log("Unexpected error");
  }
});

app.post("/login", async (req, res) => {
  const foundUser = await findUserByEmail(req.body.username);
  if (foundUser && foundUser.password === md5(req.body.password)) {
    res.render("secrets");
  } else {
    console.log("User '" + req.body.username + "' not found or invalid password");
  }
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("Server is running")
  });
})