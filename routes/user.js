// Dependencies

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const config = require("config");
const User = require("../models/user");
// const { registerSchema, loginSchema } = require("../utils/Validations");
const { userValidate, userAuthenticate } = require("../utils/middleware");
const jwt = require("jsonwebtoken");

// Routes

router.delete("/init", async (req, res) => {
  try {
    const deletion = await User.deleteMany();
    res.status(200).send(`${deletion.deletedCount} Users been deleted`);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.post("/register", userValidate, async (req, res) => {
  console.log("test");
  try {
    let user = await User.create(req.body);
    res.json(_.pick(user, ["_id", "name", "email"]));
  } catch (error) {
    res.status(400).json("Email already exists");
  }
});

router.post("/login", userValidate, async (req, res) => {
  try {
    let findUser = await User.findOne({ email: req.body.email });
    if (await bcrypt.compare(req.body.password, findUser.password)) {
      const token = jwt.sign(req.body, config.get("ACCESS_TOKEN_SECRET") /*time-stamp*/);
      findUser = findUser.toObject();
      findUser.token = token;
      res.json(_.pick(findUser, ["_id", "biz", "token"]));
    } else res.status(400).json("Incorrect password");
  } catch (error) {
    res.status(400).json("Incorrect email");
  }
});

router.get("/", userAuthenticate, async (req, res) => {
  try {
    let userDetails = await User.findOne({ email: req.user.email });
    res.json(_.pick(userDetails, ["_id", "name", "email", "biz"]));
  } catch (error) {
    res.sendStatus(401);
  }
});

module.exports = router;
