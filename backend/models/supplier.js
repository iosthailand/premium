const mongoose = require('mongoose');
const supplierSchema = mongoose.Schema({
  supplierName: { type: String, required: true },
  supplierDetails: { type: String, required: true },
  imagePath: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
module.exports = mongoose.model('Supplier', supplierSchema);
