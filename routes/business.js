// Dependencies

const express = require("express");
const router = express.Router();
const Business = require("../models/business");
const User = require("../models/user");
const { userValidate, userAuthenticate } = require("../utils/middleware");

// Routes

router.delete("/init", async (req, res) => {
  try {
    const deletion = await Business.deleteMany();
    res.status(200).send(`${deletion.deletedCount} Businesses been deleted`);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.post("/", userAuthenticate, userValidate, async (req, res) => {
  try {
    const bizCheck = await User.findOne({ email: req.user.email });
    !bizCheck.biz && res.status(400).send("Must have a business");
    const business = new Business(req.body);

    business.user_id = bizCheck.id;
    await business.save();
    res.json(business);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/:id", userAuthenticate, async (req, res) => {
  try {
    const findBusiness = await Business.findById(req.params.id);
    res.status(200).json(findBusiness);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.put("/:id", userAuthenticate, async (req, res) => {
  try {
    const updateBusiness = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(updateBusiness);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete("/:id", userAuthenticate, async (req, res) => {
  try {
    const deleteBusiness = await Business.findByIdAndDelete(req.params.id);
    !deleteBusiness && res.status(400).send("Business doest exist");
    res.status(200).send("Business been deleted");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("", userAuthenticate, async (req, res) => {
  try {
    const userInfo = await User.findOne({ email: req.user.email });
    const findBusinesses = await Business.find({ user_id: userInfo.id });
    res.status(200).json(findBusinesses);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
