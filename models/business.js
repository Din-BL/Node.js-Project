const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9]+$/,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
  number: {
    type: String,
    minlength: 3,
    maxlength: 200,
    unique: true,
  },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

businessSchema.pre("save", async function (next) {
  const user = this;
  let random = Math.floor(Math.random() * 1000000);
  let unique = await user.constructor.findOne({ number: random });
  while (unique !== null) {
    random = Math.floor(Math.random() * 1000000);
    unique = await user.constructor.findOne({ number: random });
  }
  user.number = random;
  next();
});

module.exports = mongoose.model("Business", businessSchema);
