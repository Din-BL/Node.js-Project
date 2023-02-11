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
  if (!token) return res.sendStatus(401);
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
    !bizCheck.biz && res.status(400).json("Must have a business");
    const business = new Business(req.body);
    business.user_id = bizCheck.id;
    await business.save();
    res.json(business);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.get("/:id", businessAuthenticate, async (req, res) => {
  try {
    const findBusiness = await Business.findById(req.params.id);
    res.status(200).json(findBusiness);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.put("/:id", businessAuthenticate, async (req, res) => {
  try {
    const updateBusiness = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(updateBusiness);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.delete("/:id", businessAuthenticate, async (req, res) => {
  try {
    const deleteBusiness = await Business.findByIdAndDelete(req.params.id);
    !deleteBusiness && res.status(400).json("Business doest exist");
    res.status(200).json("Business been deleted");
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.get("", businessAuthenticate, async (req, res) => {
  try {
    const userInfo = await User.findOne({ email: req.user.email });
    const findBusinesses = await Business.find({ user_id: userInfo.id });
    res.status(200).json(findBusinesses);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
