// Dependencies

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { registerSchema, loginSchema } = require("../utils/Validations");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware

const userValidate = (req, res, next) => {
  req.path === "/register" ? (schema = registerSchema) : (schema = loginSchema);
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    res.sendStatus(400);
    res.json(error.details.map((msg) => msg.message));
  } else {
    next();
  }
};

const userAuthenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

router.delete("/init", async (req, res) => {
  try {
    const deletion = await User.deleteMany();
    res.json(`${deletion.deletedCount} Documents been deleted`);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.post("/register", userValidate, async (req, res) => {
  try {
    let user = new User(req.body);
    await user.save();
    user = user.toObject();
    const { password, __v, biz, ...rest } = user;
    res.json(rest);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.post("/login", userValidate, async (req, res) => {
  try {
    let findUser = await User.findOne({ email: req.body.email });
    if (await bcrypt.compare(req.body.password, findUser.password)) {
      const token = jwt.sign(req.body, process.env.ACCESS_TOKEN_SECRET);
      findUser = findUser.toObject();
      const { password, __v, email, name, ...rest } = findUser;
      rest.token = token;
      res.json(rest);
    } else res.status(400).json("Incorrect password");
  } catch (error) {
    res.status(400).json("Incorrect email");
  }
});

router.get("/", userAuthenticate, async (req, res) => {
  try {
    let userDetails = await User.findOne({ email: req.user.email });
    userDetails = userDetails.toObject();
    delete userDetails.password;
    res.json(userDetails);
  } catch (error) {
    res.sendStatus(401);
  }
});

module.exports = router;
