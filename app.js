//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { urlencoded } = require("body-parser");
const encrypt = require("mongoose-encryption");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/secretApp");

const userSchema = new mongoose.Schema({
  userName: String,
  password: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

const User = mongoose.model("User", userSchema);

app.get("/", function (request, response) {
  response.render("home.ejs");
});

app.get("/login", function (request, response) {
  response.render("login.ejs");
});

app.get("/register", function (request, response) {
  response.render("register.ejs");
});

app.listen(port, function (response) {
  console.log("Server started at port " + port);
});

app.post("/register", function (req, res) {
  let user = req.body.username;
  let pass = req.body.password;

  let newUser = new User({
    userName: user,
    password: pass,
  });

  newUser.save(function (err) {
    if (!err) {
      res.render("secrets");
    } else console.log(err);
  });
});

app.post("/login", function (req, res) {
  let user = req.body.username;
  let pass = req.body.password;

  User.findOne({ userName: user }, function (err, userFound) {
    if (err) {
      console.log(err);
    } else {
      if (userFound) {
        if (userFound.password === pass) {
          res.render("secrets.ejs");
          console.log("User logged in");
        }
      }
      if (!userFound) {
        console.log("User not found");
      }
    }
  });
});
