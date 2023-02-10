// Dependencies

const express = require("express");
const router = express.Router();
const Business = require("../models/business");
const User = require("../models/user");
const { businessSchema } = require("../utils/Validations");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware

const businessValidate = (req, res, next) => {
  const { error } = businessSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400);
    res.json(error.details.map((msg) => msg.message));
  } else {
    next();
  }
};

const businessAuthenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(404);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user;
    next();
  });
};

// Routes

router.delete("/init", async (req, res) => {
  try {
    const deletion = await Business.deleteMany();
    res.json(`${deletion.deletedCount} Businesses been deleted`);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.post("/", businessAuthenticate, businessValidate, async (req, res) => {
  try {
    const bizCheck = await User.findOne({ email: req.user.email });
    !bizCheck.biz && res.status(400).json("Must be a business");
    const business = new Business(req.body);
    business.user_id = bizCheck.id;
    await business.save();
    res.json(business);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
