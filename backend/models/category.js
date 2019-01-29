const mongoose = require('mongoose');
const categorySchema = mongoose.Schema({
  categoryName: { type: String, required: true },
  categoryDetails: { type: String, required: true },
  imagePath: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
module.exports = mongoose.model('Category', categorySchema);



