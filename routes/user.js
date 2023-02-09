const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { registerSchema, loginSchema } = require("../utils/Validations");

router.delete("/init", async (req, res) => {
  try {
    const deletion = await User.deleteMany();
    res.json(deletion);
  } catch (error) {
    res.status(400).json("All Documents Been Deleted");
  }
});
const userValidate = (req, res, next) => {
  console.log(req.path);
  req.path === "/register" ? (schema = registerSchema) : (schema = loginSchema);
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400);
    res.json(error.details.map((msg) => msg.message));
  } else {
    next();
  }
};

router.post("/register", userValidate, async (req, res) => {
  try {
    let user = new User(req.body);
    await user.save();
    user = user.toObject();
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

router.post("/login", userValidate, async (req, res) => {
  try {
    const findUser = await User.findOne({ email: req.body.email });
    if (await bcrypt.compare(req.body.password, findUser.password)) {
      res.json("You Are Authorized!");
    } else throw new Error();
  } catch (error) {
    res.status(400).json("User Not Found");
  }
});

module.exports = router;
