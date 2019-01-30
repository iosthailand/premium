const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  productDetails: { type: String, required: true },
  productCategory: { type: String, required: true },
  productSupplier: { type: String, required: true },
  imagePath: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
module.exports = mongoose.model('Product', productSchema);



