const Joi = require("joi");

module.exports.registerSchema = Joi.object({
  name: Joi.string().trim().required().min(3).max(25),
  email: Joi.string().trim().email().required().lowercase(),
  password: Joi.string().required().min(8),
  biz: Joi.boolean().default(false),
});

module.exports.loginSchema = Joi.object({
  email: Joi.string().trim().email().required().lowercase(),
  password: Joi.string().required().min(8),
});

module.exports.businessSchema = Joi.object({
  name: Joi.string().trim().required().min(3).max(25),
  description: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  image: Joi.string().trim().uri().required(),
});
