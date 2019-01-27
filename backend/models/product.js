const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
  sku: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  imagePath: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
module.exports = mongoose.model('Product', productSchema);


