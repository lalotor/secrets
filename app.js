require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;


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
  bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
    const foundUser = await findUserByEmail(req.body.username);
    if (foundUser) {
      console.log("User '" + req.body.username + "' already exists");
      return;
    }
    const user = new User({
      email: req.body.username,
      password: hash
    });
  
    const newUser = await user.save();
    if (newUser === user) {
      res.render("secrets");
    } else {
      console.log("Unexpected error");
    }
  });
});

app.post("/login", async (req, res) => {
  const foundUser = await findUserByEmail(req.body.username);
  if (foundUser) {
    bcrypt.compare(req.body.password, foundUser.password, async(err, result) => {
      if (result) {
        res.render("secrets");
      } else {
        console.log("User '" + req.body.username + "' password does not match");
      }
    });
  } else {
    console.log("User '" + req.body.username + "' not found");
  }
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("Server is running")
  });
})