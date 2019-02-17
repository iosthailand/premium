const mongoose = require('mongoose');
const productStockSchema = mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  dateTime: { type: Date, required: true },
  code: { type: String, required: true },
  stockIn: { type: Number, required: false },
  stockOut: { type: Number, required: false },
  currentStock: { type: Number, required: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true }
});
module.exports = mongoose.model('Stock', productStockSchema);

