const Joi = require("joi");

module.exports.registerSchema = Joi.object({
  name: Joi.string().trim().required().min(3).max(25),
  email: Joi.string().trim().email().required().lowercase(),
  password: Joi.string().required().min(8),
});

module.exports.loginSchema = Joi.object({
  email: Joi.string().trim().email().required().lowercase(),
  password: Joi.string().required().min(8),
});
