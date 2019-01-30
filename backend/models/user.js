const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  content: { type: String, required: false },
  password: { type: String, required: true },
  permission: { type: String, required: true },
  storeId: { type: String, required: true },
  status: { type: Boolean, required: false }
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', userSchema);
